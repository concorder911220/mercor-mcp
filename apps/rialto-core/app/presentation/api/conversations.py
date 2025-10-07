from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.application.services.conversation_service import ConversationService
from app.application.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse
from app.application.schemas.auth import AuthenticatedUser
from app.core.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation_data: ConversationCreate, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new conversation"""
    conversation_service = ConversationService(db)
    try:
        # Override user_id with authenticated user
        conversation_data.user_id = current_user.user_id
        return conversation_service.create_conversation(conversation_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[ConversationResponse])
def get_conversations(
    skip: int = 0, 
    limit: int = 20, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for current user with pagination"""
    conversation_service = ConversationService(db)
    return conversation_service.get_conversations_by_user(user_id=current_user.user_id, skip=skip, limit=limit)


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: UUID, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a conversation by ID (user can only access their own conversations)"""
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_user_conversation(current_user.user_id, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("/user/{user_id}", response_model=List[ConversationResponse])
def get_user_conversations(
    user_id: UUID, 
    skip: int = 0, 
    limit: int = 100, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for a specific user (admin only or own conversations)"""
    # Check if user can access the requested user's data
    if not current_user.can_access_user_data(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only access your own conversations."
        )
    
    conversation_service = ConversationService(db)
    try:
        return conversation_service.get_conversations_by_user(user_id, skip=skip, limit=limit)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user/{user_id}/conversation/{conversation_id}", response_model=ConversationResponse)
def get_user_conversation(
    user_id: UUID, 
    conversation_id: UUID, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific conversation that belongs to a user (admin only or own conversations)"""
    # Check if user can access the requested user's data
    if not current_user.can_access_user_data(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only access your own conversations."
        )
    
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_user_conversation(user_id, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: UUID, 
    conversation_data: ConversationUpdate, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a conversation (user can only update their own conversations)"""
    conversation_service = ConversationService(db)
    
    # First verify the conversation belongs to the user
    existing_conversation = conversation_service.get_user_conversation(current_user.user_id, conversation_id)
    if not existing_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conversation_service.update_conversation(conversation_id, conversation_data)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: UUID, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation (user can only delete their own conversations)"""
    conversation_service = ConversationService(db)
    
    # First verify the conversation belongs to the user
    existing_conversation = conversation_service.get_user_conversation(current_user.user_id, conversation_id)
    if not existing_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if not conversation_service.delete_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")