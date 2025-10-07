from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.application.services.user_token_service import UserTokenService
from app.application.schemas.user_token import UserTokenCreate, UserTokenUpdate, UserTokenResponse

router = APIRouter(prefix="/user-tokens", tags=["user-tokens"])


@router.post("/", response_model=UserTokenResponse, status_code=status.HTTP_201_CREATED)
def create_user_token(user_token_data: UserTokenCreate, db: Session = Depends(get_db)):
    """Create a new user token or update existing one"""
    user_token_service = UserTokenService(db)
    return user_token_service.create_user_token(user_token_data)


@router.get("/", response_model=List[UserTokenResponse])
def get_user_tokens(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all user tokens with pagination"""
    user_token_service = UserTokenService(db)
    return user_token_service.get_user_tokens(skip=skip, limit=limit)


@router.get("/{user_token_id}", response_model=UserTokenResponse)
def get_user_token(user_token_id: UUID, db: Session = Depends(get_db)):
    """Get a user token by ID"""
    user_token_service = UserTokenService(db)
    user_token = user_token_service.get_user_token_by_id(user_token_id)
    if not user_token:
        raise HTTPException(status_code=404, detail="User token not found")
    return user_token


@router.get("/user/{user_id}", response_model=List[UserTokenResponse])
def get_tokens_by_user(user_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get user tokens by user ID"""
    user_token_service = UserTokenService(db)
    return user_token_service.get_tokens_by_user(user_id, skip=skip, limit=limit)


@router.get("/service/{service_type}", response_model=List[UserTokenResponse])
def get_tokens_by_service(service_type: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get user tokens by service type"""
    user_token_service = UserTokenService(db)
    return user_token_service.get_tokens_by_service(service_type, skip=skip, limit=limit)


@router.get("/user/{user_id}/service/{service_type}", response_model=UserTokenResponse)
def get_user_token_by_service(user_id: UUID, service_type: str, db: Session = Depends(get_db)):
    """Get user token by user ID and service type"""
    user_token_service = UserTokenService(db)
    user_token = user_token_service.get_user_token_by_service(user_id, service_type)
    if not user_token:
        raise HTTPException(status_code=404, detail="User token not found")
    return user_token


@router.put("/{user_token_id}", response_model=UserTokenResponse)
def update_user_token(user_token_id: UUID, user_token_data: UserTokenUpdate, db: Session = Depends(get_db)):
    """Update a user token"""
    user_token_service = UserTokenService(db)
    user_token = user_token_service.update_user_token(user_token_id, user_token_data)
    if not user_token:
        raise HTTPException(status_code=404, detail="User token not found")
    return user_token


@router.delete("/{user_token_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_token(user_token_id: UUID, db: Session = Depends(get_db)):
    """Delete a user token"""
    user_token_service = UserTokenService(db)
    if not user_token_service.delete_user_token(user_token_id):
        raise HTTPException(status_code=404, detail="User token not found")


@router.post("/cleanup-expired", status_code=status.HTTP_200_OK)
def cleanup_expired_tokens(db: Session = Depends(get_db)):
    """Clean up expired tokens"""
    user_token_service = UserTokenService(db)
    deleted_count = user_token_service.cleanup_expired_tokens()
    return {"message": f"Deleted {deleted_count} expired tokens"} 