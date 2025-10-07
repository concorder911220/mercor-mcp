from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uvicorn
import logging
import sys
from pathlib import Path
from datetime import datetime, timezone

from app.core.config import settings
from app.presentation.api import users, tasks, clients, messages, documents, user_tokens, files, conversations, chat, attachments, auth, oauth, events, projects

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format=settings.log_format,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("app.log") if not settings.debug else logging.NullHandler(),
    ]
)

logger = logging.getLogger(__name__)

# Create FastAPI application with conditional docs
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    openapi_url=settings.openapi_url,
)

# Add CORS middleware if enabled
if settings.enable_cors:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_credentials=settings.allow_credentials,
        allow_methods=settings.get_cors_methods(),
        allow_headers=settings.get_cors_headers(),
    )

# Include API routers
# Authentication routes (no prefix, public endpoints)
app.include_router(auth.router, prefix=settings.api_prefix)

# Protected routes (require authentication)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(tasks.router, prefix=settings.api_prefix)
app.include_router(clients.router, prefix=settings.api_prefix)
app.include_router(conversations.router, prefix=settings.api_prefix)
app.include_router(messages.router, prefix=settings.api_prefix)
app.include_router(documents.router, prefix=settings.api_prefix)
app.include_router(user_tokens.router, prefix=settings.api_prefix)
app.include_router(files.router, prefix=settings.api_prefix)
app.include_router(chat.router, prefix=settings.api_prefix)
app.include_router(attachments.router, prefix=settings.api_prefix)
app.include_router(oauth.router, prefix=settings.api_prefix)
app.include_router(events.router, prefix=settings.api_prefix)
app.include_router(projects.router, prefix=settings.api_prefix)


# Custom exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "body": exc.body if settings.debug else None,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.debug else "An error occurred",
        },
    )


# # Startup and shutdown events
# @app.on_event("startup")
# async def startup_event():
#     """Application startup"""
#     logger.info(f"Starting {settings.app_name} v{settings.app_version}")
#     logger.info(f"Environment: {'Development' if settings.debug else 'Production'}")
#     logger.info(f"Database: {settings.database_url_complete.split('@')[1] if '@' in settings.database_url_complete else 'Not configured'}")
    
#     # Create upload directory if it doesn't exist
#     upload_dir = Path(settings.upload_dir)
#     upload_dir.mkdir(exist_ok=True)


# @app.on_event("shutdown")
# async def shutdown_event():
#     """Application shutdown"""
#     logger.info(f"Shutting down {settings.app_name}")


# Health check endpoints
@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "environment": "development" if settings.debug else "production",
        "docs": settings.docs_url,
        "redoc": settings.redoc_url,
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/info")
def app_info():
    """Application information endpoint"""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "description": settings.app_description,
        "debug": settings.debug,
        "environment": "development" if settings.debug else "production",
        "features": {
            "swagger_enabled": settings.enable_swagger and settings.docs_url is not None,
            "metrics_enabled": settings.enable_metrics,
            "rate_limiting_enabled": settings.enable_rate_limiting,
            "cors_enabled": settings.enable_cors,
        },
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower(),
        access_log=settings.debug,
    ) 