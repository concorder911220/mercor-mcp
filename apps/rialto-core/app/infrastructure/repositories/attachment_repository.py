from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.database.models import AttachmentModel
from app.application.schemas.attachment import AttachmentCreate, AttachmentUpdate


class AttachmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, attachment_data: AttachmentCreate) -> AttachmentModel:
        db_attachment = AttachmentModel(
            message_id=attachment_data.message_id,
            filename=attachment_data.filename,
            content_type=attachment_data.content_type,
            file_size=attachment_data.file_size,
            s3_url=attachment_data.s3_url,
            s3_key=attachment_data.s3_key
        )
        self.db.add(db_attachment)
        self.db.commit()
        self.db.refresh(db_attachment)
        return db_attachment

    def get_by_id(self, attachment_id: UUID) -> Optional[AttachmentModel]:
        return self.db.query(AttachmentModel).filter(AttachmentModel.id == attachment_id).first()

    def get_by_message_id(self, message_id: UUID, skip: int = 0, limit: int = 100) -> List[AttachmentModel]:
        return (
            self.db.query(AttachmentModel)
            .filter(AttachmentModel.message_id == message_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_all(self, skip: int = 0, limit: int = 100) -> List[AttachmentModel]:
        return self.db.query(AttachmentModel).offset(skip).limit(limit).all()

    def update(self, attachment_id: UUID, attachment_data: AttachmentUpdate) -> Optional[AttachmentModel]:
        db_attachment = self.get_by_id(attachment_id)
        if not db_attachment:
            return None

        update_data = attachment_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_attachment, field, value)

        self.db.commit()
        self.db.refresh(db_attachment)
        return db_attachment

    def delete(self, attachment_id: UUID) -> bool:
        db_attachment = self.get_by_id(attachment_id)
        if not db_attachment:
            return False

        self.db.delete(db_attachment)
        self.db.commit()
        return True

    def delete_by_message_id(self, message_id: UUID) -> int:
        """Delete all attachments for a message and return count of deleted attachments"""
        deleted_count = (
            self.db.query(AttachmentModel)
            .filter(AttachmentModel.message_id == message_id)
            .delete()
        )
        self.db.commit()
        return deleted_count
