from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.application.services.user_service import UserService
from app.application.schemas.user import UserCreate, UserUpdate, UserResponse
from app.application.schemas.auth import AuthenticatedUser
from app.core.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate, 
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    user_service = UserService(db)
    try:
        return user_service.create_user(user_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0, 
    limit: int = 100, 
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users with pagination (admin only)"""
    user_service = UserService(db)
    return user_service.get_users(skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a user by ID (user can only access their own data, admin can access any)"""
    # Check if user can access the requested user's data
    if not current_user.can_access_user_data(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only access your own user data."
        )
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/email/{email}", response_model=UserResponse)
def get_user_by_email(
    email: str, 
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get a user by email (admin only)"""
    user_service = UserService(db)
    user = user_service.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID, 
    user_data: UserUpdate, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a user (user can only update their own data, admin can update any)"""
    # Check if user can access the requested user's data
    if not current_user.can_access_user_data(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only update your own user data."
        )
    
    user_service = UserService(db)
    try:
        user = user_service.update_user(user_id, user_data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID, 
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    user_service = UserService(db)
    if not user_service.delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found") 