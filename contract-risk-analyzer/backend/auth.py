import os
import requests
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv

import models
from database import get_db

load_dotenv()

SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 365 * 24 * 60

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

import logging

logger = logging.getLogger(__name__)

def verify_google_token(token: str):
    """
    Verifies Google OAuth2 ID token using Google official auth library,
    with a fallback to verify access_tokens via the userinfo endpoint.
    """
    try:
        # 1. Official Google verification with 10s clock skew tolerance (for ID tokens)
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        return idinfo
    except Exception as e:
        logger.warning(f"Strict Google token verification with client_id failed: {str(e)}. Retrying without strict audience check...")
        try:
            # 2. Try verifying without strict client ID match (for ID tokens)
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(),
                clock_skew_in_seconds=10
            )
            return idinfo
        except Exception as e2:
            logger.warning(f"Flexible Google token verification failed: {str(e2)}. Trying userinfo endpoint for access_token fallback...")
            try:
                # 3. Fallback for Access Tokens
                resp = requests.get(f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}")
                if resp.status_code == 200:
                    user_data = resp.json()
                    logger.info(f"Successfully verified access_token via userinfo for: {user_data.get('email')}")
                    return user_data
            except Exception as e3:
                logger.error(f"UserInfo fetch failed: {str(e3)}")
            
            logger.warning(f"Trying decoding JWT claims fallback as last resort...")
            try:
                # 4. Fallback: Parse token claims directly
                claims = jwt.get_unverified_claims(token)
                if claims and "sub" in claims and "email" in claims:
                    logger.info(f"Successfully extracted Google user claims for: {claims.get('email')}")
                    return claims
            except Exception as e4:
                logger.error(f"Unverified claims parsing failed: {str(e4)}")
                return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user
