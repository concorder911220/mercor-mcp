from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.repositories.conversation_repository import ConversationRepository
from app.infrastructure.repositories.user_repository import UserRepository
from app.infrastructure.repositories.message_repository import MessageRepository
from app.application.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse
from app.application.schemas.message import MessageResponse
from app.infrastructure.database.models import ConversationModel


class ConversationService:
    def __init__(self, db: Session):
        self.conversation_repository = ConversationRepository(db)
        self.user_repository = UserRepository(db)
        self.message_repository = MessageRepository(db)

    def create_conversation(self, conversation_data: ConversationCreate) -> ConversationResponse:
        # Check if user exists
        user = self.user_repository.get_by_id(conversation_data.user_id)
        if not user:
            raise ValueError("User not found")

        db_conversation = self.conversation_repository.create(conversation_data)
        
        # Create conversation response and set messages to empty list for new conversations
        conversation_response = ConversationResponse.model_validate(db_conversation)
        conversation_response.messages = []
        
        return conversation_response

    def get_conversation_by_id(self, conversation_id: UUID, include_messages: bool = True) -> Optional[ConversationResponse]:
        db_conversation = self.conversation_repository.get_by_id(conversation_id)
        if not db_conversation:
            return None
        
        # Create conversation response
        conversation_response = ConversationResponse.model_validate(db_conversation)
        
        # Fetch messages for this conversation if requested
        if include_messages:
            db_messages = self.message_repository.get_by_conversation_id(conversation_id)
            messages = [MessageResponse.model_validate(message) for message in db_messages]
            conversation_response.messages = messages
        else:
            conversation_response.messages = []
        
        return conversation_response

    def get_conversations_by_user(self, user_id: UUID, skip: int = 0, limit: int = 20) -> List[ConversationResponse]:
        # Check if user exists
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        # Get conversations ordered by most recent first (updated_at desc, then created_at desc)
        db_conversations = self.conversation_repository.get_by_user_id(user_id, skip=skip, limit=limit)
        conversations = []
        for conversation in db_conversations:
            conversation_response = ConversationResponse.model_validate(conversation)
            conversation_response.messages = []  # Don't include messages in list responses for performance
            conversations.append(conversation_response)
        return conversations

    def get_conversations(self, skip: int = 0, limit: int = 20) -> List[ConversationResponse]:
        # Get conversations ordered by most recent first (updated_at desc, then created_at desc)
        db_conversations = self.conversation_repository.get_all(skip=skip, limit=limit)
        conversations = []
        for conversation in db_conversations:
            conversation_response = ConversationResponse.model_validate(conversation)
            conversation_response.messages = []  # Don't include messages in list responses for performance
            conversations.append(conversation_response)
        return conversations

    def update_conversation(self, conversation_id: UUID, conversation_data: ConversationUpdate) -> Optional[ConversationResponse]:
        db_conversation = self.conversation_repository.update(conversation_id, conversation_data)
        if not db_conversation:
            return None
        
        # Create conversation response and set messages to empty list for updates
        conversation_response = ConversationResponse.model_validate(db_conversation)
        conversation_response.messages = []
        
        return conversation_response

    def delete_conversation(self, conversation_id: UUID) -> bool:
        return self.conversation_repository.delete(conversation_id)

    def get_user_conversation(self, user_id: UUID, conversation_id: UUID, include_messages: bool = True) -> Optional[ConversationResponse]:
        """Get a specific conversation that belongs to a user"""
        db_conversation = self.conversation_repository.get_by_user_and_id(user_id, conversation_id)
        if not db_conversation:
            return None
        
        # Create conversation response
        conversation_response = ConversationResponse.model_validate(db_conversation)
        
        # Fetch messages for this conversation if requested
        if include_messages:
            db_messages = self.message_repository.get_by_conversation_id(conversation_id)
            messages = [MessageResponse.model_validate(message) for message in db_messages]
            conversation_response.messages = messages
        else:
            conversation_response.messages = []
        
        return conversation_response