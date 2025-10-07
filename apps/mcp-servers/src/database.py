"""
Database utilities for MCP servers to retrieve third-party tokens directly from the database.
"""
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import asyncio
from uuid import UUID
from pathlib import Path

# Ensure environment is loaded before database initialization
try:
    from dotenv import load_dotenv
    current_file = Path(__file__).resolve()
    
    # Try .env first (local development)
    env_file = current_file.parent.parent / ".env"
    if env_file.exists():
        load_dotenv(dotenv_path=env_file)
except ImportError:
    pass  # python-dotenv not available, rely on system environment variables

import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime, UUID as SQLAlchemyUUID
from sqlalchemy.dialects.postgresql import JSONB, ENUM
import enum

logger = logging.getLogger(__name__)

# Define enums
class ServiceTypeEnum(enum.Enum):
    OUTLOOK = "OUTLOOK"
    SALESFORCE = "SALESFORCE"
    DROPBOX = "DROPBOX"
    EMONEY = "EMONEY"
    QUICKBOOKS = "QUICKBOOKS"

# SQLAlchemy models - minimal version for token retrieval
Base = declarative_base()

class UserTokenModel(Base):
    __tablename__ = "user_tokens"
    
    id = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True)
    user_id = Column(SQLAlchemyUUID(as_uuid=True), nullable=False)
    service_type = Column(ENUM(ServiceTypeEnum), nullable=False)
    token = Column(JSONB, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)


class TokenExpiredError(Exception):
    """Raised when token is expired"""
    pass


class AuthenticationError(Exception):
    """Raised when authentication fails"""
    pass


class DatabaseTokenService:
    """Service for retrieving third-party tokens directly from the database"""
    
    def __init__(self):
        # Try to get DATABASE_URL first (for backward compatibility)
        self.database_url = os.getenv('DATABASE_URL')
        
        # If DATABASE_URL is not provided, construct from individual RDS environment variables
        if not self.database_url:
            db_host = os.getenv('DB_HOST')
            db_name = os.getenv('DB_NAME') 
            db_user = os.getenv('DB_USER')
            db_password = os.getenv('DB_PASSWORD')
            db_port = os.getenv('DB_PORT', '5432')  # Default PostgreSQL port
            
            if not all([db_host, db_name, db_user, db_password]):
                missing = [var for var, val in [
                    ('DB_HOST', db_host), ('DB_NAME', db_name), 
                    ('DB_USER', db_user), ('DB_PASSWORD', db_password)
                ] if not val]
                raise ValueError(f"Missing required database environment variables: {', '.join(missing)}")
            
            # Construct the database URL from individual components
            self.database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
            logger.info(f"Constructed database URL from individual environment variables: postgresql://{db_user}:***@{db_host}:{db_port}/{db_name}")
        
        # Convert postgresql:// to postgresql+asyncpg:// for async support
        if self.database_url.startswith('postgresql://'):
            self.database_url = self.database_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
        elif not self.database_url.startswith('postgresql+asyncpg://'):
            self.database_url = f"postgresql+asyncpg://{self.database_url}"
        
        self.engine = create_async_engine(self.database_url, echo=False)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )
    
    async def get_user_token(self, user_id: str, service_type: str) -> str:
        """
        Get authentication token for user from database
        
        Args:
            user_id: User identifier (UUID string)
            service_type: Service type (OUTLOOK, DROPBOX, QUICKBOOKS, etc.)
            
        Returns:
            Valid access token
            
        Raises:
            AuthenticationError: If token retrieval fails
            TokenExpiredError: If token is expired
        """

        import logging
        logger = logging.getLogger(__name__)
        try:
            # Convert string UUID to UUID object
            user_uuid = UUID(user_id)
            logger.debug(f"Retrieving token for user {user_id}, service {service_type}")
            
            # Convert service type to enum
            try:
                service_enum = ServiceTypeEnum(service_type.upper())
            except ValueError:
                raise AuthenticationError(f"Unsupported service type: {service_type}")
            
            async with self.async_session() as session:
                # Query for the user token
                stmt = select(UserTokenModel).where(
                    UserTokenModel.user_id == user_uuid,
                    UserTokenModel.service_type == service_enum
                )
                
                result = await session.execute(stmt)
                user_token = result.scalar_one_or_none()
                
                if not user_token:
                    raise AuthenticationError(
                        f"No token found for user {user_id} and service {service_type}"
                    )
                
                # Check if token is expired
                if user_token.expires_at and datetime.now(timezone.utc) >= user_token.expires_at:
                    # Provide service-specific error messages
                    if service_type.upper() == "DROPBOX":
                        raise TokenExpiredError(
                            f"Dropbox token has expired at {user_token.expires_at}. "
                            "Please re-authenticate via the web interface to refresh your Dropbox token."
                        )
                    else:
                        raise TokenExpiredError(f"{service_type} token has expired at {user_token.expires_at}")
                
                # Extract access token from the JSONB field
                token_data = user_token.token
                if not isinstance(token_data, dict):
                    raise AuthenticationError("Invalid token data format")
                
                access_token = token_data.get('access_token')
                if not access_token:
                    raise AuthenticationError("No access token in database record")
                
                # Log token details for debugging
                expires_at_str = user_token.expires_at.isoformat() if user_token.expires_at else "Never"
                logger.info(
                    f"Successfully retrieved {service_type} token for user {user_id}. "
                    f"Expires at: {expires_at_str}"
                )
                return access_token
                
        except (ValueError, TypeError) as e:
            raise AuthenticationError(f"Invalid user ID format: {user_id}") from e
        except TokenExpiredError:
            # Re-raise TokenExpiredError without wrapping
            raise
        except AuthenticationError:
            # Re-raise AuthenticationError without wrapping
            raise
        except Exception as e:
            logger.error(f"Database error retrieving token for user {user_id}: {str(e)}")
            raise AuthenticationError(f"Failed to retrieve token: {str(e)}") from e
    
    async def close(self):
        """Close database connections"""
        await self.engine.dispose()


# Global instance
_token_service: Optional[DatabaseTokenService] = None


async def get_token_service() -> DatabaseTokenService:
    """Get or create the global token service instance"""
    global _token_service
    if _token_service is None:
        _token_service = DatabaseTokenService()
    return _token_service


async def get_user_token(user_id: str, service_type: str) -> str:
    """
    Convenience function to get user token from database
    
    Args:
        user_id: User identifier
        service_type: Service type (OUTLOOK, DROPBOX, QUICKBOOKS, etc.)
        
    Returns:
        Valid access token
        
    Raises:
        AuthenticationError: If token retrieval fails
        TokenExpiredError: If token is expired
    """
    service = await get_token_service()
    return await service.get_user_token(user_id, service_type)


async def close_database_connections():
    """Close all database connections"""
    global _token_service
    if _token_service:
        await _token_service.close()
        _token_service = None

