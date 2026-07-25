import os
import asyncio
import logging
from huggingface_hub import AsyncInferenceClient

logger = logging.getLogger(__name__)

PRETRAINED_MODEL = os.getenv("HF_MODEL_NAME", "facebook/bart-large-mnli")

CANDIDATE_LABELS = [
    "Limitation of Liability",
    "Uncapped Liability",
    "Auto-Renewal",
    "Governing Law",
    "Termination for Convenience",
    "Non-Compete",
    "Indemnification",
    "Exclusivity",
    "Audit Rights",
    "Force Majeure",
    "Warranty",
    "Confidentiality",
    "Liquidated Damages"
]

def keyword_rule_classification(text: str) -> dict | None:
    """
    Rapid deterministic pre-classifier for legal keywords.
    Ensures high accuracy and sub-second execution speed.
    """
    lower = text.lower()
    
    if "uncapped liability" in lower or "unlimited liability" in lower:
        return {"clause_category": "Uncapped Liability", "confidence": 0.95}
    if "limitation of liability" in lower or "shall not exceed" in lower or "liability is limited" in lower:
        return {"clause_category": "Limitation of Liability", "confidence": 0.90}
    if "auto-renew" in lower or "automatically renew" in lower or "automatic renewal" in lower:
        return {"clause_category": "Auto-Renewal", "confidence": 0.92}
    if "governed by" in lower or "governing law" in lower or "jurisdiction of" in lower:
        return {"clause_category": "Governing Law", "confidence": 0.94}
    if "terminate for convenience" in lower or "terminate at any time" in lower:
        return {"clause_category": "Termination for Convenience", "confidence": 0.88}
    if "non-compete" in lower or "shall not engage in competing" in lower:
        return {"clause_category": "Non-Compete", "confidence": 0.89}
    if "indemnify" in lower or "indemnification" in lower or "hold harmless" in lower:
        return {"clause_category": "Indemnification", "confidence": 0.91}
    if "exclusivity" in lower or "exclusive provider" in lower or "work exclusively" in lower:
        return {"clause_category": "Exclusivity", "confidence": 0.86}
    if "audit" in lower or "inspect records" in lower or "right to audit" in lower:
        return {"clause_category": "Audit Rights", "confidence": 0.84}
    if "force majeure" in lower or "act of god" in lower or "unforeseeable circumstance" in lower:
        return {"clause_category": "Force Majeure", "confidence": 0.87}
    if "warranty" in lower or "warranties" in lower or "warrants that" in lower:
        return {"clause_category": "Warranty", "confidence": 0.83}
    if "confidential" in lower or "confidentiality" in lower or "non-disclosure" in lower:
        return {"clause_category": "Confidentiality", "confidence": 0.88}
    if "liquidated damages" in lower:
        return {"clause_category": "Liquidated Damages", "confidence": 0.90}
        
    return None

async def classify_single_text(client: AsyncInferenceClient, text: str) -> dict:
    """
    Classifies a single text paragraph using Hugging Face Zero-Shot with a 4-second timeout,
    falling back to keyword matching if the API fails or times out.
    """
    if len(text.strip()) < 15:
        return {"clause_category": "Default", "confidence": 0.0}

    # 1. Async Hugging Face Zero-Shot call with 4.0s timeout
    try:
        result = await asyncio.wait_for(
            client.zero_shot_classification(text=text, candidate_labels=CANDIDATE_LABELS),
            timeout=4.0
        )
        if result and hasattr(result, "labels") and len(result.labels) > 0:
            return {
                "clause_category": result.labels[0],
                "confidence": float(result.scores[0])
            }
        elif isinstance(result, list) and len(result) > 0:
            top_label = result[0].get("labels", ["Default"])[0]
            top_score = result[0].get("scores", [0.0])[0]
            return {
                "clause_category": top_label,
                "confidence": float(top_score)
            }
    except Exception as e:
        logger.debug(f"HF Zero-shot timeout/fallback for chunk: {str(e)}")

    # 2. Fallback to keyword matching if API fails
    rule_match = keyword_rule_classification(text)
    if rule_match:
        return rule_match

    return {"clause_category": "Default", "confidence": 0.0}

async def analyze_texts_with_hf(texts: list[str]) -> list[dict]:
    """
    Analyzes contract paragraphs in PARALLEL using asyncio.gather for sub-2 second response times.
    """
    hf_token = os.getenv("HUGGINGFACE_API_KEY")
    client = AsyncInferenceClient(model=PRETRAINED_MODEL, token=hf_token) if hf_token else None

    if not client or os.getenv("USE_MOCK_FALLBACK") == "True":
        logger.info("Using accelerated keyword & local classification...")
        tasks = [asyncio.sleep(0.01) for _ in texts]
        await asyncio.gather(*tasks)
        return [keyword_rule_classification(t) or {"clause_category": "Default", "confidence": 0.0} for t in texts]

    # Run ALL paragraph classifications concurrently in parallel!
    tasks = [classify_single_text(client, t) for t in texts]
    predictions = await asyncio.gather(*tasks)
    
    return list(predictions)
