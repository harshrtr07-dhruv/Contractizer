import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, AsyncSessionLocal
from auth import get_current_user
import models
from services.cloudinary_service import upload_pdf
from services.document_service import process_contract_background

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

@router.post("/", status_code=202)
async def upload_contract(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads a PDF contract to Cloudinary, creates a pending contract record in PostgreSQL,
    and launches background AI clause risk extraction.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the maximum limit of 20MB.")
        
    if len(pdf_bytes) < 100:
        raise HTTPException(status_code=400, detail="Empty or corrupted PDF file.")

    file_uuid = str(uuid.uuid4())
    user_id_str = str(current_user.id)
    
    try:
        # 1. Upload file to Cloudinary authenticated storage
        cloud_res = upload_pdf(pdf_bytes, user_id_str, file_uuid)
        storage_key = cloud_res["public_id"]
        
        # 2. Create contract database record
        new_contract = models.Contract(
            id=file_uuid,
            user_id=current_user.id,
            filename=file.filename,
            storage_key=storage_key,
            status="pending",
            contract_type="General Commercial Agreement"
        )
        db.add(new_contract)
        await db.commit()
        await db.refresh(new_contract)

        # 3. Schedule background analysis task with in-memory PDF bytes
        background_tasks.add_task(process_contract_background, str(new_contract.id), AsyncSessionLocal, pdf_bytes)

        return {
            "status": "pending",
            "message": "Contract uploaded successfully. Analysis in progress.",
            "contract_id": str(new_contract.id),
            "filename": new_contract.filename
        }

    except Exception as e:
        logger_msg = str(e)
        raise HTTPException(status_code=500, detail=f"Upload failed: {logger_msg}")
