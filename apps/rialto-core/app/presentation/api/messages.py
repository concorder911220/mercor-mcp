from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.application.services.message_service import MessageService
from app.application.schemas.message import MessageCreate, MessageUpdate, MessageResponse
from app.application.schemas.auth import AuthenticatedUser
from app.core.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    message_data: MessageCreate, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new message"""
    message_service = MessageService(db)
    return message_service.create_message(message_data)


@router.get("/", response_model=List[MessageResponse])
def get_messages(
    skip: int = 0, 
    limit: int = 100, 
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all messages with pagination (admin only)"""
    message_service = MessageService(db)
    return message_service.get_messages(skip=skip, limit=limit)


@router.get("/{message_id}", response_model=MessageResponse)
def get_message(
    message_id: UUID, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a message by ID"""
    message_service = MessageService(db)
    message = message_service.get_message_by_id(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.get("/task/{task_id}", response_model=List[MessageResponse])
def get_messages_by_task(
    task_id: UUID, 
    skip: int = 0, 
    limit: int = 100, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages by task ID"""
    message_service = MessageService(db)
    return message_service.get_messages_by_task(task_id, skip=skip, limit=limit)


@router.get("/type/{message_type}", response_model=List[MessageResponse])
def get_messages_by_type(
    message_type: str, 
    skip: int = 0, 
    limit: int = 100, 
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get messages by message type (admin only)"""
    message_service = MessageService(db)
    return message_service.get_messages_by_type(message_type, skip=skip, limit=limit)


@router.get("/role/{role}", response_model=List[MessageResponse])
def get_messages_by_role(
    role: str, 
    skip: int = 0, 
    limit: int = 100, 
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get messages by role (admin only)"""
    message_service = MessageService(db)
    return message_service.get_messages_by_role(role, skip=skip, limit=limit)


@router.put("/{message_id}", response_model=MessageResponse)
def update_message(
    message_id: UUID, 
    message_data: MessageUpdate, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a message"""
    message_service = MessageService(db)
    message = message_service.update_message(message_id, message_data)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: UUID, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a message"""
    message_service = MessageService(db)
    if not message_service.delete_message(message_id):
        raise HTTPException(status_code=404, detail="Message not found") 