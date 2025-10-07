from pydantic_settings import BaseSettings
from typing import Optional, List
from pathlib import Path
import secrets
import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
def _load_environment():
    """Load environment variables from .env file with proper error handling"""
    # Find the ai-service directory (where .env should be located)
    current_file = Path(__file__).resolve()
    ai_service_dir = current_file.parent.parent  # Go up from app/config.py to ai-service directory
    env_file = ai_service_dir / ".env"
    
    # Try to load .env file (silent by default, prints only on debug)
    if env_file.exists():
        load_dotenv(dotenv_path=env_file)
    
    return env_file

# Load the environment variables
_env_file_path = _load_environment()


class Settings(BaseSettings):
    # Application
    app_name: str = "Rialto AI Service"
    app_version: str = "1.0.0"
    app_description: str = "Rialto AI Service, a FastAPI web server"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = False
    reload: bool = False
    
    # CORS Configuration
    allowed_origins: str = "*"  # Can be comma-separated string or "*" for all
    allowed_methods: str = "*"  # Can be comma-separated string or "*" for all
    allowed_headers: str = "*"  # Can be comma-separated string or "*" for all
    
    # API Configuration
    api_prefix: str = "/api/v1"
    docs_url: Optional[str] = "/docs"
    redoc_url: Optional[str] = "/redoc"
    openapi_url: Optional[str] = "/openapi.json"
    
    # Logging Configuration
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Feature Flags
    enable_swagger: bool = True
    enable_metrics: bool = False
    enable_rate_limiting: bool = True
    enable_cors: bool = True
    
    # MCP Service Endpoint
    rialto_mcp_service_endpoint: str

    anthropic_model: str
    anthropic_api_key: str
    
    # Authentication
    ai_service_auth_token: Optional[str] = None
    mcp_server_auth_token: Optional[str] = None
    
    @property
    def env_file_path(self) -> Path:
        """Get the path to the .env file being used"""
        return _env_file_path
    
    def get_env_info(self) -> dict:
        """Get information about environment configuration for debugging"""
        return {
            "env_file_path": str(self.env_file_path),
            "env_file_exists": self.env_file_path.exists(),
            "env_file_size": self.env_file_path.stat().st_size if self.env_file_path.exists() else 0,
            "using_dotenv": True,
            "python_dotenv_version": getattr(__import__('dotenv'), '__version__', 'unknown')
        }
    
    def validate(self):
        """Validate the settings"""
        logging.info("Validating settings.")

        if not self.rialto_mcp_service_endpoint:
            raise ValueError("RIALTO_MCP_SERVICE_ENDPOINT is required")

        if not self.anthropic_model:
            raise ValueError("ANTHROPIC_MODEL is required")

        if not self.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")
    
    class Config:
        # Don't use pydantic's built-in .env loading since we're using python-dotenv explicitly
        env_file_encoding = "utf-8"
        case_sensitive = False
        
        # Allow environment variables to override settings
        @classmethod
        def prepare_field(cls, field) -> None:
            if 'env_names' in field.field_info.extra:
                return
            field.field_info.extra['env_names'] = {
                field.name,
                field.name.upper(),
                field.name.lower(),
            }


# Create global settings instance
settings = Settings()

# Disable docs in production
if not settings.debug:
    if settings.docs_url:
        settings.docs_url = None
    if settings.redoc_url:
        settings.redoc_url = None
    if settings.openapi_url:
        settings.openapi_url = None 