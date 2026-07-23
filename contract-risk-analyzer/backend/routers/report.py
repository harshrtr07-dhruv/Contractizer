from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from auth import get_current_user
import models
from services.cloudinary_service import generate_presigned_url

router = APIRouter(
    prefix="/report",
    tags=["report"],
)

@router.get("/")
async def list_user_contracts(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all contracts uploaded by the current user.
    """
    result = await db.execute(
        select(models.Contract)
        .where(models.Contract.user_id == current_user.id)
        .order_by(models.Contract.created_at.desc())
    )
    contracts = result.scalars().all()
    
    return [
        {
            "id": str(c.id),
            "filename": c.filename,
            "status": c.status,
            "overall_risk_score": float(c.overall_risk_score) if c.overall_risk_score else None,
            "contract_type": c.contract_type,
            "created_at": c.created_at
        }
        for c in contracts
    ]

@router.get("/{contract_id}")
async def get_contract_report(
    contract_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full contract status, overall risk score, and analyzed clauses list.
    """
    # 1. Fetch Contract
    result = await db.execute(
        select(models.Contract).where(
            models.Contract.id == contract_id,
            models.Contract.user_id == current_user.id
        )
    )
    contract = result.scalars().first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found or unauthorized.")
        
    if contract.status in ["pending", "processing"]:
        return {
            "status": contract.status,
            "contract_id": str(contract.id),
            "filename": contract.filename,
            "message": "Analysis is still in progress."
        }
        
    if contract.status == "failed":
        return {
            "status": "failed",
            "contract_id": str(contract.id),
            "filename": contract.filename,
            "message": "Contract analysis failed due to unreadable PDF format or server timeout."
        }

    # 2. Fetch Clauses
    clause_result = await db.execute(
        select(models.Clause).where(models.Clause.contract_id == contract.id)
    )
    clauses = clause_result.scalars().all()
    
    clauses_data = [
        {
            "id": str(cl.id),
            "clause_type": cl.clause_type,
            "original_text": cl.original_text,
            "plain_english": cl.plain_english,
            "risk_score": float(cl.risk_score) if cl.risk_score else 0.0,
            "risk_category": cl.risk_category,
            "page_number": cl.page_number
        }
        for cl in clauses
    ]
    
    # Sort clauses by risk score descending
    clauses_data.sort(key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "status": "done",
        "contract_id": str(contract.id),
        "filename": contract.filename,
        "overall_risk_score": float(contract.overall_risk_score) if contract.overall_risk_score else 1.0,
        "contract_type": contract.contract_type,
        "total_clauses": len(clauses_data),
        "clauses": clauses_data
    }

@router.get("/{contract_id}/download")
async def download_contract_pdf(
    contract_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a secure presigned Cloudinary download link for the contract PDF.
    """
    result = await db.execute(
        select(models.Contract).where(
            models.Contract.id == contract_id,
            models.Contract.user_id == current_user.id
        )
    )
    contract = result.scalars().first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
        
    download_url = generate_presigned_url(contract.storage_key, expiry_seconds=900)
    
    return {
        "download_url": download_url,
        "filename": contract.filename,
        "expires_in_seconds": 900
    }
