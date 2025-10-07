from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create engine with improved configuration
engine = create_engine(
    settings.database_url_complete,
    echo=settings.db_echo,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_pre_ping=True,  # Enables pessimistic disconnect handling
    pool_recycle=3600,   # Recycle connections after 1 hour
)

logger.info(f"Rialto Core Database URL: {settings.database_url_complete}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}", exc_info=True)
        db.rollback()
        # Re-raise the original exception to preserve the error context
        raise
    finally:
        db.close()


def get_db_connection():
    """Get database connection for testing or direct access"""
    return engine.connect()


def create_tables():
    """Create all tables - useful for testing"""
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """Drop all tables - useful for testing"""
    Base.metadata.drop_all(bind=engine) 