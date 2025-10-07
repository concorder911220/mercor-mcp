from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
from uuid import UUID

from app.application.services.user_service import UserService
from app.application.schemas.auth import LoginRequest, RegisterRequest, LoginResponse, AuthenticatedUser
from app.application.schemas.user import UserCreate
from app.core.auth import auth, AuthTokens
from app.infrastructure.database.models import UserModel, UserRoleEnum
from app.infrastructure.repositories.user_repository import UserRepository


class AuthService:
    """Service for handling authentication operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)
        self.user_repository = UserRepository(db)
    
    def register_user(self, register_data: RegisterRequest) -> LoginResponse:
        """
        Register a new user and return authentication tokens
        
        Args:
            register_data: User registration data
            
        Returns:
            LoginResponse with tokens and user info
            
        Raises:
            HTTPException: If registration fails
        """
        try:
            # Check if username already exists
            existing_user = self.user_service.get_user_by_username(register_data.username)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            
            # Check if email already exists
            existing_email = self.user_service.get_user_by_email(register_data.email)
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Validate role
            valid_roles = [role.value for role in UserRoleEnum]
            if register_data.role not in valid_roles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid role. Must be one of: {valid_roles}"
                )
            
            # Create user (password will be hashed in repository)
            user_data = UserCreate(
                username=register_data.username,
                email=register_data.email,
                password=register_data.password,  # Will be hashed in repository
                role=register_data.role
            )
            
            new_user = self.user_service.create_user(user_data)
            
            # Generate tokens
            user_dict = {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "role": new_user.role if isinstance(new_user.role, str) else new_user.role.value
            }
            
            tokens = auth.create_tokens(user_dict)
            
            # Create user profile response
            from app.application.schemas.auth import UserProfile
            user_profile = UserProfile(
                id=new_user.id,
                username=new_user.username,
                email=new_user.email,
                role=user_dict["role"],
                created_at=new_user.created_at.isoformat()
            )
            
            return LoginResponse(
                access_token=tokens.access_token,
                refresh_token=tokens.refresh_token,
                token_type=tokens.token_type,
                expires_in=tokens.expires_in,
                user=user_profile
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {str(e)}"
            )
    
    def authenticate_user(self, login_data: LoginRequest) -> LoginResponse:
        """
        Authenticate user and return tokens
        
        Args:
            login_data: Login credentials
            
        Returns:
            LoginResponse with tokens and user info
            
        Raises:
            HTTPException: If authentication fails
        """
        try:
            # Try to find user by username or email (get raw DB model for password verification)
            user_db = None
            if "@" in login_data.username:
                user_db = self.user_repository.get_by_email(login_data.username)
            else:
                user_db = self.user_repository.get_by_username(login_data.username)
            
            if not user_db:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid username/email or password"
                )
            
            # Verify password
            if not auth.verify_password(login_data.password, user_db.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid username/email or password"
                )
            
            # Generate tokens
            user_dict = {
                "id": user_db.id,
                "username": user_db.username,
                "email": user_db.email,
                "role": user_db.role.value if hasattr(user_db.role, 'value') else user_db.role
            }
            
            tokens = auth.create_tokens(user_dict)
            
            # Create user profile response
            from app.application.schemas.auth import UserProfile
            user_profile = UserProfile(
                id=user_db.id,
                username=user_db.username,
                email=user_db.email,
                role=user_dict["role"],
                created_at=user_db.created_at.isoformat()
            )
            
            return LoginResponse(
                access_token=tokens.access_token,
                refresh_token=tokens.refresh_token,
                token_type=tokens.token_type,
                expires_in=tokens.expires_in,
                user=user_profile
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Authentication failed: {str(e)}"
            )
    
    def refresh_access_token(self, refresh_token: str) -> AuthTokens:
        """
        Refresh access token using refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            New set of tokens
            
        Raises:
            HTTPException: If refresh fails
        """
        try:
            # Verify refresh token
            token_data = auth.verify_token(refresh_token, "refresh")
            
            # Verify user still exists
            user_db = self.user_repository.get_by_id(token_data.user_id)
            if not user_db:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            # Generate new tokens
            user_dict = {
                "id": user_db.id,
                "username": user_db.username,
                "email": user_db.email,
                "role": user_db.role.value if hasattr(user_db.role, 'value') else user_db.role
            }
            
            return auth.create_tokens(user_dict)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Token refresh failed: {str(e)}"
            )
    
    def get_current_user_profile(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get current user profile
        
        Args:
            user_id: User ID from token
            
        Returns:
            User profile data
        """
        user = self.user_service.get_user_by_id(user_id)
        if not user:
            return None
            
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.value if hasattr(user.role, 'value') else user.role,
            "created_at": user.created_at.isoformat()
        }
