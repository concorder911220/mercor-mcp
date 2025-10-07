from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.infrastructure.database.models import ConversationModel
from app.application.schemas.conversation import ConversationCreate, ConversationUpdate


class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, conversation_data: ConversationCreate) -> ConversationModel:
        db_conversation = ConversationModel(
            user_id=conversation_data.user_id,
            title=conversation_data.title
        )
        self.db.add(db_conversation)
        self.db.commit()
        self.db.refresh(db_conversation)
        return db_conversation

    def get_by_id(self, conversation_id: UUID) -> Optional[ConversationModel]:
        return self.db.query(ConversationModel).filter(ConversationModel.id == conversation_id).first()

    def get_by_user_id(self, user_id: UUID, skip: int = 0, limit: int = 20) -> List[ConversationModel]:
        return (
            self.db.query(ConversationModel)
            .filter(ConversationModel.user_id == user_id)
            .order_by(ConversationModel.updated_at.desc().nullslast(), ConversationModel.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_all(self, skip: int = 0, limit: int = 20) -> List[ConversationModel]:
        return (
            self.db.query(ConversationModel)
            .order_by(ConversationModel.updated_at.desc().nullslast(), ConversationModel.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(self, conversation_id: UUID, conversation_data: ConversationUpdate) -> Optional[ConversationModel]:
        db_conversation = self.get_by_id(conversation_id)
        if not db_conversation:
            return None

        update_data = conversation_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_conversation, field, value)

        self.db.commit()
        self.db.refresh(db_conversation)
        return db_conversation

    def delete(self, conversation_id: UUID) -> bool:
        db_conversation = self.get_by_id(conversation_id)
        if not db_conversation:
            return False

        self.db.delete(db_conversation)
        self.db.commit()
        return True

    def get_by_user_and_id(self, user_id: UUID, conversation_id: UUID) -> Optional[ConversationModel]:
        return (
            self.db.query(ConversationModel)
            .filter(
                and_(
                    ConversationModel.id == conversation_id,
                    ConversationModel.user_id == user_id
                )
            )
            .first()
        )