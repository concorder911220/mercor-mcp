import contextlib
import logging
from fastapi import FastAPI
from servers.quickbooks_server.server import mcp as quickbooks_mcp
from servers.extract_server.server import mcp as extract_mcp
from datetime import datetime, timezone
from config import settings
from middleware.auth_middleware import AuthenticationMiddleware

# Configure logging based on environment settings
def setup_logging():
    """Configure logging with the specified log level and format"""
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    
    # Clear any existing handlers to ensure clean setup
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    
    logging.basicConfig(
        level=log_level,
        format=settings.log_format,
        handlers=[
            logging.StreamHandler()  # This ensures logs go to console/terminal
        ],
        force=True  # Force reconfiguration even if basicConfig was called before
    )
    
    # Log the configuration for verification
    logger = logging.getLogger(__name__)
    logger.info(f"Logging configured with level: {settings.log_level.upper()}")
    logger.debug("Debug logging is now enabled!")

# Setup logging immediately when module is imported
setup_logging()

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    async with contextlib.AsyncExitStack() as stack:
        await stack.enter_async_context(quickbooks_mcp.session_manager.run())
        await stack.enter_async_context(extract_mcp.session_manager.run())
        yield

app = FastAPI(lifespan=lifespan)

# Add authentication middleware
app.add_middleware(AuthenticationMiddleware)

app.mount("/quickbooks", quickbooks_mcp.streamable_http_app())
app.mount("/extract", extract_mcp.streamable_http_app())

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)