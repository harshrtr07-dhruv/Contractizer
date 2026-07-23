from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from auth import get_current_user
import models
from services.pdf_service import extract_pdf_data
from services.document_service import split_into_paragraphs
from services.model_service import analyze_texts_with_hf
from services.risk_scoring import get_clause_explanation

router = APIRouter(
    prefix="/analyze",
    tags=["analyze"],
)

@router.post("/")
async def analyze_contract(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads a PDF contract, extracts text, sends it to the Hugging Face AI model,
    and returns a risk analysis report.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # 1. Read PDF file
        pdf_bytes = await file.read()
        
        # 2. Extract Text
        pdf_info = extract_pdf_data(pdf_bytes)
        paragraphs_data = split_into_paragraphs(pdf_info["full_text"])
        paragraphs = [p["text"] for p in paragraphs_data]
        
        if not paragraphs:
            raise HTTPException(status_code=400, detail="Could not extract any readable text from the PDF.")
            
        # For performance/rate limiting on the free HF tier, we'll analyze the first 15 paragraphs.
        # In a production app, you would queue this in the background (Day 4/5 logic).
        chunks_to_analyze = paragraphs[:15]
        
        # 3. Get AI Predictions
        predictions = await analyze_texts_with_hf(chunks_to_analyze)
        
        # Check if the model is loading
        if predictions and "error" in predictions[0]:
            raise HTTPException(status_code=503, detail=predictions[0]["error"])
            
        # 4. Map to Risk Scores
        analyzed_clauses = []
        for i, pred in enumerate(predictions):
            category = pred.get("clause_category", "Default")
            confidence = pred.get("confidence", 0.0)
            
            # Skip very low confidence or unrelated text (you can tune this threshold)
            if confidence < 0.4:
                continue
                
            risk_info = get_clause_explanation(category, confidence)
            
            analyzed_clauses.append({
                "clause_text": chunks_to_analyze[i],
                "clause_category": category,
                "confidence": round(confidence, 2),
                "risk_score": risk_info["risk_score"],
                "risk_category": risk_info["risk_category"],
                "explanation": risk_info["plain_english"]
            })
            
        # Sort by highest risk score first
        analyzed_clauses.sort(key=lambda x: x["risk_score"], reverse=True)
        
        return {
            "status": "success",
            "filename": file.filename,
            "total_clauses_analyzed": len(chunks_to_analyze),
            "risky_clauses_found": len(analyzed_clauses),
            "results": analyzed_clauses
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
