from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID


class LoginRequest(BaseModel):
    """Login request schema"""
    username: str = Field(..., min_length=3, max_length=50, description="Username or email")
    password: str = Field(..., min_length=6, max_length=100, description="User password")


class RegisterRequest(BaseModel):
    """User registration request schema"""
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, max_length=100, description="User password")
    role: Optional[str] = Field(default="USER", description="User role (ADMIN, USER, MANAGER)")


class LoginResponse(BaseModel):
    """Login response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserProfile"


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str


class UserProfile(BaseModel):
    """User profile information"""
    id: UUID
    username: str
    email: str
    role: str
    created_at: str
    
    class Config:
        from_attributes = True


class AuthenticatedUser(BaseModel):
    """Current authenticated user context"""
    user_id: UUID
    username: str
    email: str
    role: str
    
    def is_admin(self) -> bool:
        """Check if user has admin role"""
        return self.role == "ADMIN"
    
    def is_manager(self) -> bool:
        """Check if user has manager role"""
        return self.role in ["ADMIN", "MANAGER"]
    
    def can_access_user_data(self, target_user_id: UUID) -> bool:
        """Check if user can access another user's data"""
        return self.is_admin() or self.user_id == target_user_id


# Import here to avoid circular imports
from app.application.schemas.user import UserResponse
UserProfile.model_rebuild()
