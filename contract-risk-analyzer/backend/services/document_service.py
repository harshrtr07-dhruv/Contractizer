import logging
import urllib.request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import models
from services.pdf_service import extract_pdf_data
from services.model_service import analyze_texts_with_hf
from services.risk_scoring import get_clause_explanation
from services.cloudinary_service import generate_presigned_url

logger = logging.getLogger(__name__)

def detect_contract_type(text: str, filename: str = "") -> str:
    """
    Detects contract classification (e.g., NDA, SaaS, MSA, Employment).
    """
    combined = (filename + " " + text).lower()
    if any(k in combined for k in ["nda", "non-disclosure", "confidentiality agreement"]):
        return "Mutual Non-Disclosure Agreement (NDA)"
    if any(k in combined for k in ["saas", "software as a service"]):
        return "SaaS Agreement"
    if any(k in combined for k in ["msa", "master services agreement", "service agreement"]):
        return "Master Services Agreement"
    if any(k in combined for k in ["employment", "offer letter"]):
        return "Employment Agreement"
    return "General Commercial Agreement"

def split_into_paragraphs(text: str) -> list[dict]:
    """
    Splits PDF text into readable paragraphs while preserving page numbers.
    """
    raw_chunks = text.split('\n\n')
    clean_chunks = []
    current_page = 1
    
    for chunk in raw_chunks:
        lines = chunk.split('\n')
        remaining_lines = []
        for line in lines:
            if line.startswith("--- Page ") and "---" in line[9:]:
                try:
                    current_page = int(line.split("--- Page ")[1].split(" ---")[0])
                except Exception:
                    pass
            else:
                remaining_lines.append(line)
                
        cleaned = ' '.join(remaining_lines).strip()
        if len(cleaned) > 25:
            clean_chunks.append({
                "text": cleaned,
                "page_number": current_page
            })
            
    return clean_chunks

async def process_contract_background(contract_id: str, db_session_factory, raw_pdf_bytes: bytes = None):
    """
    Background worker pipeline:
    1. Sets status to 'processing'
    2. Extract PDF text per page
    3. Detect contract_type (NDA, SaaS, etc.)
    4. Run Zero-Shot & Rule-based Risk Classification
    5. Calculate weighted document overall_risk_score (1.0 - 10.0)
    6. Save clauses & update status to 'done'
    """
    async with db_session_factory() as db:
        try:
            # 1. Fetch Contract
            result = await db.execute(select(models.Contract).where(models.Contract.id == contract_id))
            contract = result.scalars().first()
            if not contract:
                logger.error(f"Background task: Contract {contract_id} not found.")
                return

            contract.status = "processing"
            await db.commit()

            pdf_bytes = raw_pdf_bytes

            # 2. Fetch PDF bytes if needed
            if not pdf_bytes:
                try:
                    download_url = generate_presigned_url(contract.storage_key)
                    req = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=8) as response:
                        pdf_bytes = response.read()
                except Exception as cloud_err:
                    logger.warning(f"Cloudinary download error: {str(cloud_err)}")

            if not pdf_bytes:
                logger.error(f"Could not retrieve PDF bytes for contract {contract_id}")
                contract.status = "failed"
                await db.commit()
                return

            # 3. Extract text & detect contract type
            pdf_info = extract_pdf_data(pdf_bytes)
            chunks = split_into_paragraphs(pdf_info["full_text"])

            if not chunks:
                contract.status = "failed"
                await db.commit()
                return

            contract.contract_type = detect_contract_type(pdf_info["full_text"], contract.filename)

            chunks_to_analyze = chunks[:15]
            texts_only = [c["text"] for c in chunks_to_analyze]

            # 4. AI & Context Classification
            predictions = await analyze_texts_with_hf(texts_only)

            # 5. Process & Score Clauses
            all_paragraph_scores = [1.0] * len(chunks_to_analyze)
            risky_clause_count = 0

            for i, pred in enumerate(predictions):
                category = pred.get("clause_category", "Default")
                confidence = pred.get("confidence", 0.0)

                if confidence < 0.35 or category == "Default":
                    continue

                risk_info = get_clause_explanation(category, confidence, chunks_to_analyze[i]["text"])
                all_paragraph_scores[i] = risk_info["risk_score"]

                # Store clause if score is medium/high OR for NDA standard clauses
                if risk_info["risk_score"] >= 3.0:
                    clause_record = models.Clause(
                        contract_id=contract.id,
                        clause_type=category,
                        original_text=chunks_to_analyze[i]["text"],
                        plain_english=risk_info["plain_english"],
                        risk_score=risk_info["risk_score"],
                        risk_category=risk_info["risk_category"],
                        page_number=chunks_to_analyze[i]["page_number"]
                    )
                    db.add(clause_record)
                    risky_clause_count += 1

            # 6. Document Overall Risk Calculation (Weighted document average + max risk)
            avg_score = sum(all_paragraph_scores) / len(all_paragraph_scores) if all_paragraph_scores else 1.0
            max_score = max(all_paragraph_scores) if all_paragraph_scores else 1.0

            # 60% average document risk + 40% peak clause severity
            overall_score = round(0.6 * avg_score + 0.4 * max_score, 1)
            overall_score = max(1.0, min(10.0, overall_score))

            contract.overall_risk_score = overall_score
            contract.status = "done"
            await db.commit()
            logger.info(f"Analysis complete for contract {contract_id}. Type: {contract.contract_type}, Score: {overall_score}, Clauses: {risky_clause_count}")

        except Exception as e:
            logger.error(f"Background analysis failed for contract {contract_id}: {str(e)}")
            try:
                contract.status = "failed"
                await db.commit()
            except Exception:
                pass
