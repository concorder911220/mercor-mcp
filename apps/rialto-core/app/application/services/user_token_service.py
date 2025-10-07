from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.repositories.user_token_repository import UserTokenRepository
from app.application.schemas.user_token import UserTokenCreate, UserTokenUpdate, UserTokenResponse


class UserTokenService:
    def __init__(self, db: Session):
        self.user_token_repository = UserTokenRepository(db)

    def create_user_token(self, user_token_data: UserTokenCreate) -> UserTokenResponse:
        # Check if token already exists for this user and service
        existing_token = self.user_token_repository.get_by_user_and_service(
            user_token_data.user_id, user_token_data.service_type
        )
        if existing_token:
            # Update existing token instead of creating a new one
            update_data = UserTokenUpdate(
                token=user_token_data.token,
                expires_at=user_token_data.expires_at
            )
            db_token = self.user_token_repository.update(existing_token.id, update_data)
            return UserTokenResponse.model_validate(db_token)

        db_user_token = self.user_token_repository.create(user_token_data)
        return UserTokenResponse.model_validate(db_user_token)

    def get_user_token_by_id(self, user_token_id: UUID) -> Optional[UserTokenResponse]:
        db_user_token = self.user_token_repository.get_by_id(user_token_id)
        if not db_user_token:
            return None
        return UserTokenResponse.model_validate(db_user_token)

    def get_user_tokens(self, skip: int = 0, limit: int = 100) -> List[UserTokenResponse]:
        db_user_tokens = self.user_token_repository.get_all(skip=skip, limit=limit)
        return [UserTokenResponse.model_validate(token) for token in db_user_tokens]

    def get_tokens_by_user(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[UserTokenResponse]:
        db_user_tokens = self.user_token_repository.get_by_user_id(user_id, skip=skip, limit=limit)
        return [UserTokenResponse.model_validate(token) for token in db_user_tokens]

    def get_tokens_by_service(self, service_type: str, skip: int = 0, limit: int = 100) -> List[UserTokenResponse]:
        db_user_tokens = self.user_token_repository.get_by_service_type(service_type, skip=skip, limit=limit)
        return [UserTokenResponse.model_validate(token) for token in db_user_tokens]

    def get_user_token_by_service(self, user_id: UUID, service_type: str) -> Optional[UserTokenResponse]:
        db_user_token = self.user_token_repository.get_by_user_and_service(user_id, service_type)
        if not db_user_token:
            return None
        return UserTokenResponse.model_validate(db_user_token)

    def update_user_token(self, user_token_id: UUID, user_token_data: UserTokenUpdate) -> Optional[UserTokenResponse]:
        db_user_token = self.user_token_repository.update(user_token_id, user_token_data)
        if not db_user_token:
            return None
        return UserTokenResponse.model_validate(db_user_token)

    def delete_user_token(self, user_token_id: UUID) -> bool:
        return self.user_token_repository.delete(user_token_id)

    def cleanup_expired_tokens(self) -> int:
        """Remove expired tokens and return count of deleted tokens"""
        return self.user_token_repository.delete_expired_tokens() 