from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.repositories.user_repository import UserRepository
from app.application.schemas.user import UserCreate, UserUpdate, UserResponse
from app.infrastructure.database.models import UserModel


class UserService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def create_user(self, user_data: UserCreate) -> UserResponse:
        # Check if user already exists
        existing_user = self.user_repository.get_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        existing_username = self.user_repository.get_by_username(user_data.username)
        if existing_username:
            raise ValueError("User with this username already exists")

        db_user = self.user_repository.create(user_data)
        return UserResponse.model_validate(db_user)

    def get_user_by_id(self, user_id: UUID) -> Optional[UserResponse]:
        db_user = self.user_repository.get_by_id(user_id)
        if not db_user:
            return None
        return UserResponse.model_validate(db_user)

    def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        db_user = self.user_repository.get_by_email(email)
        if not db_user:
            return None
        return UserResponse.model_validate(db_user)

    def get_user_by_username(self, username: str) -> Optional[UserResponse]:
        db_user = self.user_repository.get_by_username(username)
        if not db_user:
            return None
        return UserResponse.model_validate(db_user)

    def get_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        db_users = self.user_repository.get_all(skip=skip, limit=limit)
        return [UserResponse.model_validate(user) for user in db_users]

    def update_user(self, user_id: UUID, user_data: UserUpdate) -> Optional[UserResponse]:
        # Check if email is being changed and already exists
        if user_data.email:
            existing_user = self.user_repository.get_by_email(user_data.email)
            if existing_user and existing_user.id != user_id:
                raise ValueError("User with this email already exists")

        # Check if username is being changed and already exists
        if user_data.username:
            existing_username = self.user_repository.get_by_username(user_data.username)
            if existing_username and existing_username.id != user_id:
                raise ValueError("User with this username already exists")

        db_user = self.user_repository.update(user_id, user_data)
        if not db_user:
            return None
        return UserResponse.model_validate(db_user)

    def delete_user(self, user_id: UUID) -> bool:
        return self.user_repository.delete(user_id) 