from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sse_starlette.sse import EventSourceResponse
import logging
from datetime import datetime, timezone
import uuid

from .config import settings
from rialto_shared_types.events import (
    ChatRequestEvent,
    RemoteFile,
)
from .models import ErrorResponse, ChatRequest
from .anthropic_client import AnthropicClient
from .agent.agent import Agent
from .agent.tool_gateway import ToolGateway
from .agent.event_gateway import EventGateway
from .agent.exemplar_provider import ExemplarProvider
from .agent.prompt_templates import get_prompt_constructor
from .agent.agent_config_resolver import AgentConfigResolver
from .agent.agent_config import load_agent_config_from_file
from rialto_shared_types.agent_interface import AgentInboundRequest
from .sse_transformer import sse_transformer
from .middleware.auth_middleware import AuthenticationMiddleware
# Configure logging for Docker
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # This ensures logs go to stdout/stderr for Docker
    ]
)

# Initialize FastAPI app
app = FastAPI(
    title="AI Service",
    description="AI service with Anthropic Claude integration and SSE streaming",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware
app.add_middleware(AuthenticationMiddleware)

# Initialize Anthropic client
anthropic_client = None
tool_gateway = None
event_gateway = None
prompt_constructor = None
exemplar_provider = None
agent_config_resolver = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    global anthropic_client, tool_gateway, event_gateway, exemplar_provider, agent_config_resolver
    try:
        # settings.validate()
        anthropic_client = AnthropicClient(settings.anthropic_api_key, settings.anthropic_model)
        tool_gateway = ToolGateway(settings.rialto_mcp_service_endpoint)
        event_gateway = EventGateway()
        exemplar_provider = ExemplarProvider()
        agent_config_resolver = AgentConfigResolver(load_agent_config_from_file())
    except Exception as e:
        logging.error(f"Failed to initialize services: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "environment": "development" if settings.debug else "production",
        "docs": settings.docs_url,
        "redoc": settings.redoc_url,
    }
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/agent/config")
async def get_agent_config_summary():
    """Get a summary of agent configuration.
    """
    if not agent_config_resolver:
        raise HTTPException(status_code=500, detail="Event processor not initialized")
    
    return agent_config_resolver.get_agent_config_summary()

LOADING_MESSAGES = [
    "Filing under 'Please Wait'...",
    "This delay is totally deductible...",
    "Pivot-ing to loading mode...",
    "Running the numbers...",
    "Closing the books...",
    "Crunching the numbers...",
    "Expensing some time..."
    "Adding it up...",
    "SUM-ming up your request...",

]

@app.post("/event", response_model=None, response_class=EventSourceResponse)
async def event(request: AgentInboundRequest):
    """
    Event endpoint for posting events to the agent.
    Agent configuration is automatically determined from event content.

    Args:
        request: An agent execution ID and an event.

    Returns:
        EventSourceResponse with SSE formatted events
    """
    logging.info("=== /event endpoint called ===")
    logging.info(f"Events Request: {request.to_json()}")
    
    if not anthropic_client or not agent_config_resolver:
        logging.error("Services not initialized")
        raise HTTPException(status_code=500, detail="Services not initialized")

    # Determine agent configuration from event
    try:
        agent_config = agent_config_resolver.resolve(request.event)
    except ValueError as e:
        raise HTTPException(
            status_code=400, 
            detail={
                "error": "Unsupported event type",
                "message": str(e),
                "event_type": request.event.type,
                "suggestion": "Please ensure the event type is properly configured in the agent configuration"
            }
        )
    
    logging.info(f"Using agent configuration: {agent_config.system_prompt_template.value}")

    # Create agent with the appropriate prompt constructor
    prompt_constructor = get_prompt_constructor(agent_config.system_prompt_template)
    agent = Agent(anthropic_client, tool_gateway, event_gateway, exemplar_provider, prompt_constructor, agent_config)

    return EventSourceResponse(sse_transformer(agent.run(request)),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.post("/chat", response_model=None)
async def chat_stream(request: ChatRequest):
    """
    Chat endpoint with Server-Sent Events streaming.

    Args:
        request: Chat request with query, message history, and attachments

    Returns:
        StreamingResponse with SSE formatted chat responses
    """
    logging.info(f"Chat Request: {request}")
    if not anthropic_client:
        raise HTTPException(status_code=500, detail="Anthropic client not initialized")
    
    logging.info(f"Request: {request}")

    chat_request = ChatRequestEvent(
        # TODO need a conversation ID which we can use to fetch the event history.
        id=f'rialto1.chat-request-{str(uuid.uuid4())}',
        timestamp=datetime.now(timezone.utc),
        user_id=request.user_id,
        message=request.query,
        # history=request.messages,
        files=[RemoteFile(url=attachment.url, content_type=attachment.content_type) for attachment in request.attachments]
    )
    agent_request = AgentInboundRequest(
        execution_id=f'rialto1.chat-request-{str(uuid.uuid4())}', #TODO this should persist across the lifecycle of an agent execution.
        user_id=request.user_id,
        event=chat_request
    )

    logging.info(f"Chat Request: {chat_request}")

    # Create agent with the appropriate prompt constructor for chat requests
    # Chat requests use the default agent configuration
    try:
        agent_config = agent_config_resolver.resolve(chat_request)
    except ValueError as e:
        raise HTTPException(
            status_code=400, 
            detail={
                "error": "Unsupported event type",
                "message": str(e),
                "event_type": chat_request.type,
                "suggestion": "Please ensure the event type is properly configured in the agent configuration"
            }
        )
    prompt_constructor = get_prompt_constructor(agent_config.system_prompt_template)
    agent = Agent(anthropic_client, tool_gateway, event_gateway, exemplar_provider, prompt_constructor, agent_config)

    return EventSourceResponse(sse_transformer(agent.run(agent_request)),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed logging."""
    body = await request.body()
    content_type = request.headers.get("content-type", "")
    
    logging.error(f"Validation error on {request.url}")
    logging.error(f"Content-Type: {content_type}")
    logging.error(f"Request body: {body.decode() if body else 'Empty'}")
    logging.error(f"Validation errors: {exc.errors()}")
    
    return HTTPException(
        status_code=422,
        detail={
            "message": "Validation failed",
            "errors": exc.errors(),
            "content_type": content_type,
            "body": body.decode() if body else 'Empty'
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logging.error(f"Unhandled exception on {request.url}: {str(exc)}")
    return ErrorResponse(
        error="Internal server error",
        detail=str(exc)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    ) 