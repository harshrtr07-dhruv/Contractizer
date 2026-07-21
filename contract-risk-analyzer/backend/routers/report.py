from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from auth import get_current_user
import models

router = APIRouter(
    prefix="/report",
    tags=["report"],
)

@router.get("/{contract_id}")
async def get_report(
    contract_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Placeholder for Day 3
    return {"message": f"Report endpoint placeholder for {contract_id}"}
