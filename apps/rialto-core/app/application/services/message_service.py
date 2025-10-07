from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.repositories.message_repository import MessageRepository
from app.infrastructure.repositories.conversation_repository import ConversationRepository
from app.application.schemas.message import MessageCreate, MessageUpdate, MessageResponse


class MessageService:
    def __init__(self, db: Session):
        self.message_repository = MessageRepository(db)
        self.conversation_repository = ConversationRepository(db)

    def create_message(self, message_data: MessageCreate) -> MessageResponse:
        # Check if conversation exists
        conversation = self.conversation_repository.get_by_id(message_data.conversation_id)
        if not conversation:
            raise ValueError("Conversation not found")

        db_message = self.message_repository.create(message_data)
        return MessageResponse.model_validate(db_message)

    def get_message_by_id(self, message_id: UUID) -> Optional[MessageResponse]:
        db_message = self.message_repository.get_by_id(message_id)
        if not db_message:
            return None
        return MessageResponse.model_validate(db_message)

    def get_messages(self, skip: int = 0, limit: int = 100) -> List[MessageResponse]:
        db_messages = self.message_repository.get_all(skip=skip, limit=limit)
        return [MessageResponse.model_validate(message) for message in db_messages]

    def get_messages_by_conversation(self, conversation_id: UUID, skip: int = 0, limit: int = 100) -> List[MessageResponse]:
        # Check if conversation exists
        conversation = self.conversation_repository.get_by_id(conversation_id)
        if not conversation:
            raise ValueError("Conversation not found")

        db_messages = self.message_repository.get_by_conversation_id(conversation_id, skip=skip, limit=limit)
        return [MessageResponse.model_validate(message) for message in db_messages]

    def get_messages_by_type(self, message_type: str, skip: int = 0, limit: int = 100) -> List[MessageResponse]:
        db_messages = self.message_repository.get_by_message_type(message_type, skip=skip, limit=limit)
        return [MessageResponse.model_validate(message) for message in db_messages]

    def get_messages_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[MessageResponse]:
        db_messages = self.message_repository.get_by_role(role, skip=skip, limit=limit)
        return [MessageResponse.model_validate(message) for message in db_messages]

    def update_message(self, message_id: UUID, message_data: MessageUpdate) -> Optional[MessageResponse]:
        db_message = self.message_repository.update(message_id, message_data)
        if not db_message:
            return None
        return MessageResponse.model_validate(db_message)

    def delete_message(self, message_id: UUID) -> bool:
        return self.message_repository.delete(message_id) 