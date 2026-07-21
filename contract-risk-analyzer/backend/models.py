import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    google_id = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contracts = relationship("Contract", back_populates="user", cascade="all, delete-orphan")

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    filename = Column(String, nullable=False)
    storage_key = Column(String, nullable=False)
    status = Column(String, default="pending")
    overall_risk_score = Column(Numeric)
    contract_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="contracts")
    clauses = relationship("Clause", back_populates="contract", cascade="all, delete-orphan")

class Clause(Base):
    __tablename__ = "clauses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id", ondelete="CASCADE"))
    clause_type = Column(String, nullable=False)
    original_text = Column(String, nullable=False)
    plain_english = Column(String)
    risk_score = Column(Numeric)
    risk_category = Column(String)
    page_number = Column(Integer)

    contract = relationship("Contract", back_populates="clauses")
