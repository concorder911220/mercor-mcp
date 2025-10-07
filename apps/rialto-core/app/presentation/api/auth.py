from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.infrastructure.database.connection import get_db
from app.application.services.auth_service import AuthService
from app.application.schemas.auth import (
    LoginRequest, 
    RegisterRequest, 
    LoginResponse, 
    RefreshTokenRequest,
    UserProfile,
    AuthenticatedUser
)
from app.core.auth import AuthTokens
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user account
    
    Creates a new user account and returns authentication tokens.
    Default role is 'USER' if not specified.
    
    Args:
        register_data: Registration information (username, email, password, role)
        db: Database session
        
    Returns:
        LoginResponse: Authentication tokens and user profile
        
    Raises:
        400: Username or email already exists
        422: Invalid input data
        500: Registration failed
    """
    auth_service = AuthService(db)
    return auth_service.register_user(register_data)


@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and get tokens
    
    Authenticates a user with username/email and password.
    Returns access and refresh tokens on success.
    
    Args:
        login_data: Login credentials (username/email and password)
        db: Database session
        
    Returns:
        LoginResponse: Authentication tokens and user profile
        
    Raises:
        401: Invalid credentials
        422: Invalid input data
        500: Authentication failed
    """
    auth_service = AuthService(db)
    return auth_service.authenticate_user(login_data)


@router.post("/refresh", response_model=AuthTokens)
def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token
    
    Generates a new access token using a valid refresh token.
    Returns both new access and refresh tokens.
    
    Args:
        refresh_data: Refresh token request
        db: Database session
        
    Returns:
        AuthTokens: New access and refresh tokens
        
    Raises:
        401: Invalid or expired refresh token
        422: Invalid input data
        500: Token refresh failed
    """
    auth_service = AuthService(db)
    return auth_service.refresh_access_token(refresh_data.refresh_token)


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user profile
    
    Returns the profile information of the currently authenticated user.
    Requires valid authentication token.
    
    Args:
        current_user: Current authenticated user from token
        db: Database session
        
    Returns:
        UserProfile: Current user's profile information
        
    Raises:
        401: Invalid or missing authentication token
        404: User not found
    """
    auth_service = AuthService(db)
    profile = auth_service.get_current_user_profile(current_user.user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return UserProfile(**profile)


@router.post("/logout")
def logout():
    """
    Logout user
    
    Since JWT tokens are stateless, logout is handled client-side
    by removing the tokens from storage. This endpoint is provided
    for API completeness and could be extended with token blacklisting.
    
    Returns:
        dict: Logout confirmation message
    """
    return {
        "message": "Successfully logged out",
        "detail": "Please remove tokens from client storage"
    }


@router.get("/validate")
def validate_token(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Validate authentication token
    
    Validates the current authentication token and returns user information.
    Useful for checking token validity without full profile fetch.
    
    Args:
        current_user: Current authenticated user from token
        
    Returns:
        dict: Token validation result with user info
        
    Raises:
        401: Invalid or expired token
    """
    return {
        "valid": True,
        "user": {
            "user_id": str(current_user.user_id),
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role
        },
        "message": "Token is valid"
    }
