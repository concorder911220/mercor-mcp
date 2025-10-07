import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import AsyncGenerator

from app.infrastructure.database.connection import get_db
from app.application.services.chat_service import ChatService
from app.application.services.ai_service import AIService
from app.application.schemas.message import ChatRequest
from app.application.schemas.auth import AuthenticatedUser
from app.core.dependencies import get_ai_service, get_chat_service, get_current_user


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
async def chat_stream(
    chat_request: ChatRequest, 
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Stream chat responses using Server-Sent Events (SSE)
    
    Expected flow:
    1. If no conversation_id provided, creates new conversation and sends SSE immediately
    2. Saves user message to database
    3. Creates assistant message placeholder
    4. Calls AI service and streams responses
    5. Updates assistant message with complete response
    
    Returns SSE stream with the following event types:
    - conversation_created: When new conversation is created
    - chat_response: Streaming AI response chunks
    - error: If any error occurs
    - chat_complete: When chat is fully processed
    """
    
    async def generate_stream() -> AsyncGenerator[str, None]:
        """Generate SSE stream"""
        try:
            chat_service = get_chat_service(db=db, ai_service=ai_service)
            # Pass current user to chat service for user context
            chat_service.current_user = current_user
            
            async for response in chat_service.process_chat_request(chat_request):
                # Format as SSE
                response_type = response.get("type", "data")
                response_data = response.get("data", {})
                
                # Send the event type and data
                yield f"event: {response_type}\n"
                yield f"data: {json.dumps(response_data)}\n\n"
                
        except ValueError as e:
            # Handle validation errors (like user not found, etc.)
            error_data = {
                "error": str(e),
                "error_type": "validation_error"
            }
            yield f"event: error\n"
            yield f"data: {json.dumps(error_data)}\n\n"
            
        except Exception as e:
            # Handle unexpected errors
            error_data = {
                "error": "An unexpected error occurred",
                "error_type": "internal_error",
                "details": str(e) if hasattr(e, '__str__') else "Unknown error"
            }
            yield f"event: error\n"
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
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