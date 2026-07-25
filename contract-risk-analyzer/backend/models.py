import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class GUID(TypeDecorator):
    """
    Platform-independent GUID type.
    Uses PostgreSQL's native UUID type, otherwise uses CHAR(36) for SQLite/MySQL.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            else:
                return str(uuid.UUID(str(value)))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if isinstance(value, uuid.UUID):
                return value
            else:
                return uuid.UUID(str(value))

class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contracts = relationship("Contract", back_populates="user", cascade="all, delete-orphan")

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"))
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

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    contract_id = Column(GUID, ForeignKey("contracts.id", ondelete="CASCADE"))
    clause_type = Column(String, nullable=False)
    original_text = Column(String, nullable=False)
    plain_english = Column(String)
    risk_score = Column(Numeric)
    risk_category = Column(String)
    page_number = Column(Integer)

    contract = relationship("Contract", back_populates="clauses")
