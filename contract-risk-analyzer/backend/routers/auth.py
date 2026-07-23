from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

import models
import schemas
from database import get_db
from auth import verify_google_token, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/google", response_model=schemas.Token)
async def google_login(request: schemas.GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    idinfo = verify_google_token(request.id_token)
    if not idinfo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )
    
    google_id = idinfo.get("sub")
    email = idinfo.get("email")

    if not google_id or not email:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token missing required fields",
        )

    # Check if user exists by google_id or email
    result = await db.execute(
        select(models.User).where(
            (models.User.google_id == google_id) | (models.User.email == email)
        )
    )
    user = result.scalars().first()

    if not user:
        # Create new user
        user = models.User(email=email, google_id=google_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.google_id:
        user.google_id = google_id
        await db.commit()

    # Create JWT
    access_token = create_access_token(data={"user_id": str(user.id), "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
