from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.repositories.attachment_repository import AttachmentRepository
from app.infrastructure.repositories.message_repository import MessageRepository
from app.application.schemas.attachment import AttachmentCreate, AttachmentUpdate, AttachmentResponse


class AttachmentService:
    def __init__(self, db: Session):
        self.attachment_repository = AttachmentRepository(db)
        self.message_repository = MessageRepository(db)

    def create_attachment(self, attachment_data: AttachmentCreate) -> AttachmentResponse:
        # Check if message exists
        message = self.message_repository.get_by_id(attachment_data.message_id)
        if not message:
            raise ValueError("Message not found")

        db_attachment = self.attachment_repository.create(attachment_data)
        return AttachmentResponse.model_validate(db_attachment)

    def get_attachment_by_id(self, attachment_id: UUID) -> Optional[AttachmentResponse]:
        db_attachment = self.attachment_repository.get_by_id(attachment_id)
        if not db_attachment:
            return None
        return AttachmentResponse.model_validate(db_attachment)

    def get_attachments_by_message(self, message_id: UUID, skip: int = 0, limit: int = 100) -> List[AttachmentResponse]:
        # Check if message exists
        message = self.message_repository.get_by_id(message_id)
        if not message:
            raise ValueError("Message not found")

        db_attachments = self.attachment_repository.get_by_message_id(message_id, skip=skip, limit=limit)
        return [AttachmentResponse.model_validate(attachment) for attachment in db_attachments]

    def get_attachments(self, skip: int = 0, limit: int = 100) -> List[AttachmentResponse]:
        db_attachments = self.attachment_repository.get_all(skip=skip, limit=limit)
        return [AttachmentResponse.model_validate(attachment) for attachment in db_attachments]

    def update_attachment(self, attachment_id: UUID, attachment_data: AttachmentUpdate) -> Optional[AttachmentResponse]:
        db_attachment = self.attachment_repository.update(attachment_id, attachment_data)
        if not db_attachment:
            return None
        return AttachmentResponse.model_validate(db_attachment)

    def delete_attachment(self, attachment_id: UUID) -> bool:
        return self.attachment_repository.delete(attachment_id)

    def delete_attachments_by_message(self, message_id: UUID) -> int:
        """Delete all attachments for a message and return count of deleted attachments"""
        return self.attachment_repository.delete_by_message_id(message_id)
