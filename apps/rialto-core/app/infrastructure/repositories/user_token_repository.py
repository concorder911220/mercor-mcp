from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.database.models import UserTokenModel
from app.application.schemas.user_token import UserTokenCreate, UserTokenUpdate


class UserTokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_token_data: UserTokenCreate) -> UserTokenModel:
        db_user_token = UserTokenModel(**user_token_data.model_dump())
        self.db.add(db_user_token)
        self.db.commit()
        self.db.refresh(db_user_token)
        return db_user_token

    def get_by_id(self, user_token_id: UUID) -> Optional[UserTokenModel]:
        return self.db.query(UserTokenModel).filter(UserTokenModel.id == user_token_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[UserTokenModel]:
        return self.db.query(UserTokenModel).offset(skip).limit(limit).all()

    def get_by_user_id(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[UserTokenModel]:
        return self.db.query(UserTokenModel).filter(UserTokenModel.user_id == user_id).offset(skip).limit(limit).all()

    def get_by_service_type(self, service_type: str, skip: int = 0, limit: int = 100) -> List[UserTokenModel]:
        return self.db.query(UserTokenModel).filter(UserTokenModel.service_type == service_type).offset(skip).limit(limit).all()

    def get_by_user_and_service(self, user_id: UUID, service_type: str) -> Optional[UserTokenModel]:
        return self.db.query(UserTokenModel).filter(
            UserTokenModel.user_id == user_id,
            UserTokenModel.service_type == service_type
        ).first()

    def update(self, user_token_id: UUID, user_token_data: UserTokenUpdate) -> Optional[UserTokenModel]:
        db_user_token = self.get_by_id(user_token_id)
        if not db_user_token:
            return None

        update_data = user_token_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_user_token, field, value)

        self.db.commit()
        self.db.refresh(db_user_token)
        return db_user_token

    def delete(self, user_token_id: UUID) -> bool:
        db_user_token = self.get_by_id(user_token_id)
        if not db_user_token:
            return False

        self.db.delete(db_user_token)
        self.db.commit()
        return True

    def delete_expired_tokens(self) -> int:
        from datetime import datetime
        
        result = self.db.query(UserTokenModel).filter(
            UserTokenModel.expires_at < datetime.now()
        ).delete()
        self.db.commit()
        return result 