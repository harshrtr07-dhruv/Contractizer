from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from auth import get_current_user
import models

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

@router.post("/")
async def upload_contract(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Placeholder for Day 3
    return {"message": "Upload endpoint placeholder"}
