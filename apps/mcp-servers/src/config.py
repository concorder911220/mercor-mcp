from pydantic_settings import BaseSettings
from typing import Optional, List
from pathlib import Path
import secrets
import os
from dotenv import load_dotenv

# Load environment variables from .env or secrets.env file
def _load_environment():
    """Load environment variables from .env file with proper error handling"""
    # Find the project root directory (where env files should be located)
    current_file = Path(__file__).resolve()
    project_root = current_file.parent.parent  # Go up from src/config.py to project root (mcp-servers)
    
    env_file = project_root / ".env"
    
    # Try to load .env file (silent by default, prints only on debug)
    if env_file.exists():
        load_dotenv(dotenv_path=env_file)
    
    return env_file

# Load the environment variables
_env_file_path = _load_environment()


class Settings(BaseSettings):
    # Application
    app_name: str = "Rialto MCP Servers"
    app_version: str = "1.0.0"
    app_description: str = "Rialto private MCP servers built on top of FastMCP/FastAPI"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8002
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
    
    # Authentication
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