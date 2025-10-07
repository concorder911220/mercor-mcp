from pydantic_settings import BaseSettings
from typing import Optional, List, Any
from pathlib import Path
import secrets
import os
from dotenv import load_dotenv

# Load environment variables from .env file
def _load_environment():
    """Load environment variables from .env file with proper error handling"""
    # Find the project root directory (where .env should be located)
    current_file = Path(__file__).resolve()
    project_root = current_file.parent.parent.parent  # Go up from app/core/config.py to project root
    env_file = project_root / ".env"
    
    # Try to load .env file (silent by default, prints only on debug)
    if env_file.exists():
        load_dotenv(dotenv_path=env_file)
    
    return env_file

# Load the environment variables
_env_file_path = _load_environment()

# Loads environment variables automatically when instantiated
# Priority:
# Direct constructor arguments
# Environment variables
# .env file
# Defaults
class Settings(BaseSettings):
    # Application
    app_name: str = "Rialto Core Backend"
    app_version: str = "1.0.0"
    app_description: str = "A FastAPI backend with DDD architecture"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    reload: bool = False
    
    # Security
    secret_key: str = secrets.token_urlsafe(32)
    access_token_expire_minutes: int = 300
    algorithm: str = "HS256"
    
    # Database Configuration
    database_url: Optional[str] = None
    db_host: Optional[str] = None
    db_port: Optional[int] = None
    db_user: Optional[str] = None
    db_password: Optional[str] = None
    db_name: Optional[str] = None
    db_echo: bool = False
    db_pool_size: int = 5
    db_max_overflow: int = 10
    
    # CORS Configuration
    allowed_origins: str = "*"  # Can be comma-separated string or "*" for all
    allowed_methods: str = "*"  # Can be comma-separated string or "*" for all
    allowed_headers: str = "*"  # Can be comma-separated string or "*" for all
    allow_credentials: bool = True
    
    # API Configuration
    api_prefix: str = "/api/v1"
    docs_url: Optional[str] = "/docs"
    redoc_url: Optional[str] = "/redoc"
    openapi_url: Optional[str] = "/openapi.json"
    
    # Logging Configuration
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # File Upload Configuration
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    upload_dir: str = "uploads"
    allowed_file_types: str = ".jpg,.jpeg,.png,.pdf,.doc,.docx"  # Comma-separated string
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    
    # AWS S3 Configuration
    aws_region: str = "us-east-1"
    s3_bucket_name: Optional[str] = None
    
    # AWS DynamoDB Configuration
    projects_table_name: Optional[str] = None
    file_metadata_table_name: Optional[str] = None
    
    # Feature Flags
    enable_swagger: bool = True
    enable_metrics: bool = False
    enable_rate_limiting: bool = True
    enable_cors: bool = True
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    
    # AI Service Configuration
    ai_server_url: Optional[str] = None
    ai_service_timeout: int = 300  # 5 minutes in seconds
    ai_service_auth_token: Optional[str] = None
    
    # MCP Server Configuration
    mcp_server_auth_token: Optional[str] = None
    
    # OAuth Configuration
    # Dropbox OAuth
    dropbox_client_id: str = None
    dropbox_client_secret: str = None
    dropbox_redirect_uri: Optional[str] = None
    
    # Microsoft Outlook OAuth
    outlook_client_id: str = None
    outlook_client_secret: str = None
    outlook_redirect_uri: Optional[str] = None
    azure_tenant_id: str = None
    
    # Salesforce OAuth
    salesforce_client_id: Optional[str] = None
    salesforce_client_secret: Optional[str] = None
    salesforce_redirect_uri: Optional[str] = None
    salesforce_domain: str = "login.salesforce.com"  # or test.salesforce.com for sandbox
    
    # QuickBooks OAuth
    quickbooks_client_id: str = None
    quickbooks_client_secret: str = None
    quickbooks_redirect_uri: Optional[str] = None
    quickbooks_sandbox: bool = True  # Set to False for production
    
    # Frontend origin for OAuth redirects
    frontend_origin: str = "http://localhost:3000"
    
    # SQS Configuration
    tax_prep_export_queue_url: Optional[str] = None

    def validate_database_url(self) -> None:
        """
        Validate that either the database_url is provided, or all individual DB_* environment variables are set.
        Raises:
            ValueError: If neither database_url nor all DB_* variables are provided.
        """
        if self.database_url:
            return  # database_url is provided, valid

        missing = []
        if not self.db_host:
            missing.append("db_host (DB_HOST)")
        if not self.db_port:
            missing.append("db_port (DB_PORT)")
        if not self.db_name:
            missing.append("db_name (DB_NAME)")
        if not self.db_user:
            missing.append("db_user (DB_USER)")
        if not self.db_password:
            missing.append("db_password (DB_PASSWORD)")

        if missing:
            raise ValueError(
                "Either 'database_url' must be provided, or all of the following DB_* environment variables must be set: "
                f"{', '.join(missing)}"
            )

    def model_post_init(self, __context: Any) -> None:  # type: ignore[override]
        """Compute environment-derived settings after initialization.

        Priority for derived values:
        1) Explicit field values (already set by env/constructor)
        2) RIALTO_* environment variables
        3) Existing defaults
        """
        # Set frontend based on RIALTO_FRONTEND_ENDPOINT environment variable
        rialto_frontend = os.getenv("RIALTO_FRONTEND_ENDPOINT")
        if rialto_frontend:
            self.frontend_origin = rialto_frontend.rstrip('/')
        else:
            raise ValueError("RIALTO_FRONTEND_ENDPOINT is not set")

        # Derive redirect URIs if not explicitly provided
        if not self.dropbox_redirect_uri:
            self.dropbox_redirect_uri = f"{self.frontend_origin}/auth/dropbox/callback"
        if not self.salesforce_redirect_uri:
            self.salesforce_redirect_uri = f"{self.frontend_origin}/auth/salesforce/callback"
        if not self.outlook_redirect_uri:
            self.outlook_redirect_uri = f"{self.frontend_origin}/auth/outlook/callback"
        if not self.quickbooks_redirect_uri:
            # Note: QuickBooks callback path
            self.quickbooks_redirect_uri = f"{self.frontend_origin}/auth/quickbooks/callback"

        # Set ai_server_url based on RIALTO_AI_SERVICE_ENDPOINT environment variable
        rialto_ai = os.getenv("RIALTO_AI_SERVICE_ENDPOINT")
        if rialto_ai:
            self.ai_server_url = rialto_ai.rstrip('/')
        else:
            raise ValueError("RIALTO_AI_SERVICE_ENDPOINT is not set")

        self.validate_database_url()
    
    @property
    def database_url_complete(self) -> str:
        """Construct database URL from individual components if not provided directly"""
        if self.database_url:
            return self.database_url
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins, handling string input for single origin"""
        if self.allowed_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    def get_cors_methods(self) -> List[str]:
        """Get CORS methods as a list"""
        if self.allowed_methods == "*":
            return ["*"]
        return [method.strip() for method in self.allowed_methods.split(",")]
    
    def get_cors_headers(self) -> List[str]:
        """Get CORS headers as a list"""
        if self.allowed_headers == "*":
            return ["*"]
        return [header.strip() for header in self.allowed_headers.split(",")]
    
    def get_allowed_file_types(self) -> List[str]:
        """Get allowed file types as a list"""
        return [file_type.strip() for file_type in self.allowed_file_types.split(",")]
    
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