import secrets
import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from ..config import settings

logger = logging.getLogger(__name__)


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware to validate Bearer token authentication for AI service requests"""
    
    def __init__(self, app, expected_token: str = None):
        super().__init__(app)
        
        if expected_token is not None:
            self.expected_token = expected_token
            self._token_override = True
            logger.warning("AuthenticationMiddleware initialized with override token. Is this intentional?")
        else:
            self.expected_token = settings.ai_service_auth_token
            self._token_override = False
            logger.info("AuthenticationMiddleware initialized with token from settings")
            
        if self.expected_token:
            logger.info(f"Authentication enabled with token length: {len(self.expected_token)} characters")
        else:
            logger.warning("Authentication disabled - no token configured")
        
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for health checks and docs
        if self._should_skip_auth(request):
            logger.info(f"Authentication skipped for {request.url.path}")
            return await call_next(request)
            
        # If no token is configured, skip authentication
        if not self.expected_token:
            logger.info(f"No authentication token configured, allowing request to {request.url.path}")
            return await call_next(request)
            
        # Extract Bearer token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            logger.warning(f"Missing Authorization header for {request.url}")
            return self._create_auth_error("Missing Authorization header")
            
        if not auth_header.startswith("Bearer "):
            logger.warning(f"Invalid Authorization header format for {request.url}")
            return self._create_auth_error("Invalid Authorization header format")
            
        provided_token = auth_header[7:]  # Remove "Bearer " prefix
        
        # Validate token using time-constant comparison
        if not self._validate_token(provided_token):
            logger.warning(f"Invalid authentication token for {request.url}")
            return self._create_auth_error("Invalid authentication token")
            
        logger.info(f"Authentication successful for {request.url}")
        return await call_next(request)
    
    def _should_skip_auth(self, request: Request) -> bool:
        """Check if the request should skip authentication"""
        skip_paths = [
            "/health",
            "/docs",
            "/redoc", 
            "/openapi.json",
            "/agent/config"
        ]
        return request.url.path in skip_paths
    
    def _validate_token(self, provided_token: str) -> bool:
        """Validate token using time-constant comparison to prevent timing attacks"""
        if not self.expected_token:
            logger.error("No expected token configured for authentication")
            return False
            
        if not provided_token:
            return False
            
        # Use secrets.compare_digest for time-constant comparison
        return secrets.compare_digest(provided_token, self.expected_token)
    
    def _create_auth_error(self, message: str) -> JSONResponse:
        """Create a standardized authentication error response"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "Authentication failed",
                "message": message,
                "error_type": "authentication_error"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )
