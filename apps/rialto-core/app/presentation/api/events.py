from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator

from app.application.services.ai_service import AIService
from app.core.dependencies import get_ai_service, get_current_user
from app.application.schemas.auth import AuthenticatedUser
from rialto_shared_types.agent_interface import AgentInboundRequest
from rialto_shared_types.response_types_union import ResponseTypesUnion

import logging

router = APIRouter(prefix="/events", tags=["events"])

logger = logging.getLogger(__name__)

async def stream_event_response(
    request: AgentInboundRequest,
    ai_service: AIService
) -> AsyncGenerator[str, None]:
    """
    Stream event responses from AI service, passing through SSE events unmodified
    
    Args:
        request: The AgentInboundRequest to forward to AI service
        current_user: The current user
        ai_service: AI service instance
        
    Yields:
        Raw SSE formatted strings from AI service
    """
    
    # Stream from AI service and pass through unmodified
    async for sse_chunk in ai_service.stream_event_response(request):
        yield sse_chunk


# This is a dummy endpoint to generate types for the frontend via FastAPI's auto-generation of openapi.json specs.
@router.get("/types", response_model=ResponseTypesUnion)
async def types(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Types endpoint for getting the types of the backend.
    """
    logging.info("=== /types endpoint called ===")
    return {
        "healthy": "true"
    }

@router.post("/", response_model=None)
async def events(
    request: AgentInboundRequest, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Stream event responses using Server-Sent Events (SSE)
    
    Takes the request, sends it to the AI service /events API, and passes through
    the SSE events to the client unmodified.
    """
    logger.info(f"AgentInboundRequest: {request.to_json()}")
    logger.info(f"Event request type: {request.event.type}")
    
    return StreamingResponse(
        stream_event_response(request, ai_service),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        }
    )


@router.get("/health")
def chat_health_check():
    """Health check for chat service"""
    return {
        "status": "healthy",
        "service": "chat",
        "message": "Chat service is running"
    }