"""
Dependency injection container for application services
"""
from functools import lru_cache
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.application.services.ai_service import AIService
from app.application.services.chat_service import ChatService
from app.application.services.conversation_service import ConversationService
from app.application.services.message_service import MessageService
from app.application.services.user_service import UserService
from app.application.services.project_service import ProjectService
from app.core.auth import auth, TokenData
from app.application.schemas.auth import AuthenticatedUser
from app.infrastructure.database.connection import get_db


# Singleton services (stateless, no DB dependency)
@lru_cache()
def get_ai_service() -> AIService:
    """
    Get singleton AI service instance.
    Safe to be singleton because it's stateless and doesn't hold DB sessions.
    """
    return AIService()


@lru_cache()
def get_project_service() -> ProjectService:
    """
    Get singleton Project service instance.
    Safe to be singleton because it's stateless and doesn't hold DB sessions.
    """
    return ProjectService()


# Factory functions for per-request services (need DB sessions)
def get_conversation_service(db: Session) -> ConversationService:
    """Get conversation service with DB session."""
    return ConversationService(db)


def get_message_service(db: Session) -> MessageService:
    """Get message service with DB session."""
    return MessageService(db)


def get_chat_service(
    db: Session,
    ai_service: AIService,
    conversation_service: ConversationService = None,
    message_service: MessageService = None
) -> ChatService:
    """
    Get chat service with all dependencies injected.
    
    Args:
        db: Database session (per-request)
        ai_service: AI service (singleton)
        conversation_service: Optional conversation service
        message_service: Optional message service
    """
    if conversation_service is None:
        conversation_service = get_conversation_service(db)
    
    if message_service is None:
        message_service = get_message_service(db)
    
    return ChatService(
        db=db,
        ai_service=ai_service,
        conversation_service=conversation_service,
        message_service=message_service
    )


# Authentication dependencies
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AuthenticatedUser:
    """
    Get current authenticated user from JWT token.
    
    This dependency validates the JWT token and returns the authenticated user context.
    Use this for all protected endpoints.
    
    Args:
        credentials: HTTP Authorization credentials with Bearer token
        db: Database session for user validation
        
    Returns:
        AuthenticatedUser: Current user context
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Verify and decode the JWT token
        token_data = auth.verify_token(credentials.credentials)
        
        # Verify user still exists in database
        user_service = UserService(db)
        user = user_service.get_user_by_id(token_data.user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return AuthenticatedUser(
            user_id=token_data.user_id,
            username=token_data.username,
            email=token_data.email,
            role=token_data.role
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_admin_user(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """
    Dependency that requires admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        AuthenticatedUser: Admin user context
        
    Raises:
        HTTPException: If user is not admin
    """
    if not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def get_current_manager_user(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """
    Dependency that requires manager role (ADMIN or MANAGER).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        AuthenticatedUser: Manager user context
        
    Raises:
        HTTPException: If user is not manager or admin
    """
    if not current_user.is_manager():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager access required"
        )
    return current_user


def get_user_service(db: Session) -> UserService:
    """Get user service with DB session."""
    return UserService(db)