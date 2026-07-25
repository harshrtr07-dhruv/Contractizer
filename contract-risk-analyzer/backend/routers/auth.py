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
    onboarded = bool(user.name and user.age)
    access_token = create_access_token(
        data={"user_id": str(user.id), "email": user.email, "name": user.name, "age": user.age, "onboarded": onboarded}
    )
    return {"access_token": access_token, "token_type": "bearer"}

from auth import get_current_user

@router.put("/onboard", response_model=schemas.Token)
async def onboard_user(
    request: schemas.OnboardRequest,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_user.name = request.name
    current_user.age = request.age
    await db.commit()
    await db.refresh(current_user)

    access_token = create_access_token(
        data={"user_id": str(current_user.id), "email": current_user.email, "name": current_user.name, "age": current_user.age, "onboarded": True}
    )
    return {"access_token": access_token, "token_type": "bearer"}
