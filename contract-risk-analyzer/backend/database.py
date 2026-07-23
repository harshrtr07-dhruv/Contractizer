import os
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import text, create_engine
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Test primary PostgreSQL connection on module load
use_sqlite = False
if not DATABASE_URL:
    use_sqlite = True
else:
    try:
        # Convert asyncpg driver string to sync psycopg/pg8000 for immediate 2-second connection test
        sync_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+pg8000://")
        test_engine = create_engine(sync_url, connect_args={"timeout": 2})
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to primary PostgreSQL database.")
    except Exception as e:
        logger.warning(f"PostgreSQL connection test failed ({str(e)}). Defaulting to local SQLite (contract_risk.db)...")
        use_sqlite = True

if use_sqlite:
    DATABASE_URL = "sqlite+aiosqlite:///./contract_risk.db"

engine = create_async_engine(
    DATABASE_URL, 
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    """Initializes tables for local database if needed."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database tables verified/created using engine: {DATABASE_URL[:30]}...")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {str(e)}")
