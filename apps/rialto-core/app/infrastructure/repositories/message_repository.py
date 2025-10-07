from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.database.models import MessageModel
from app.application.schemas.message import MessageCreate, MessageUpdate


class MessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, message_data: MessageCreate) -> MessageModel:
        db_message = MessageModel(**message_data.model_dump())
        self.db.add(db_message)
        self.db.commit()
        self.db.refresh(db_message)
        return db_message

    def get_by_id(self, message_id: UUID) -> Optional[MessageModel]:
        return self.db.query(MessageModel).filter(MessageModel.id == message_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[MessageModel]:
        return self.db.query(MessageModel).offset(skip).limit(limit).all()

    def get_by_task_id(self, task_id: UUID, skip: int = 0, limit: int = 100) -> List[MessageModel]:
        return self.db.query(MessageModel).filter(MessageModel.task_id == task_id).offset(skip).limit(limit).all()

    def get_by_conversation_id(self, conversation_id: UUID, skip: int = 0, limit: int = 100) -> List[MessageModel]:
        return self.db.query(MessageModel).filter(MessageModel.conversation_id == conversation_id).offset(skip).limit(limit).all()

    def get_by_message_type(self, message_type: str, skip: int = 0, limit: int = 100) -> List[MessageModel]:
        return self.db.query(MessageModel).filter(MessageModel.message_type == message_type).offset(skip).limit(limit).all()

    def get_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[MessageModel]:
        return self.db.query(MessageModel).filter(MessageModel.role == role).offset(skip).limit(limit).all()

    def update(self, message_id: UUID, message_data: MessageUpdate) -> Optional[MessageModel]:
        db_message = self.get_by_id(message_id)
        if not db_message:
            return None

        update_data = message_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_message, field, value)

        self.db.commit()
        self.db.refresh(db_message)
        return db_message

    def delete(self, message_id: UUID) -> bool:
        db_message = self.get_by_id(message_id)
        if not db_message:
            return False

        self.db.delete(db_message)
        self.db.commit()
        return True 