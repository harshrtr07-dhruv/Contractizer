from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class GoogleLoginRequest(BaseModel):
    id_token: str

class OnboardRequest(BaseModel):
    name: str
    age: int

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class ClauseResponse(BaseModel):
    id: UUID
    clause_type: str
    original_text: str
    plain_english: Optional[str]
    risk_score: Optional[float]
    risk_category: Optional[str]
    page_number: Optional[int]

    class Config:
        from_attributes = True

class ContractResponse(BaseModel):
    id: UUID
    filename: str
    status: str
    overall_risk_score: Optional[float]
    contract_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ContractDetailResponse(ContractResponse):
    clauses: List[ClauseResponse] = []
