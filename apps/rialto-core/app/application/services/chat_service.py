from typing import AsyncGenerator, Optional, Dict, Any, List
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.orm import Session
import asyncio
import logging

from app.application.services.conversation_service import ConversationService
from app.application.services.message_service import MessageService
from app.application.services.ai_service import AIService
from app.application.schemas.conversation import ConversationCreate
from app.application.schemas.message import (
    MessageCreate, 
    MessageUpdate, 
    MessageResponse, 
    ChatRequest, 
    ChatStreamResponse,
    ConversationCreatedResponse
)


class ChatService:
    """Service for handling chat functionality with AI integration"""
    
    def __init__(
        self, 
        db: Session,
        ai_service: AIService = None,
        conversation_service: ConversationService = None,
        message_service: MessageService = None
    ):
        self.db = db
        self.logger = logging.getLogger(__name__)
        
        # Use dependency injection or create defaults
        self.ai_service = ai_service or AIService()
        self.conversation_service = conversation_service or ConversationService(db)
        self.message_service = message_service or MessageService(db)
    
    async def process_chat_request(
        self, 
        chat_request: ChatRequest
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process chat request and stream responses with optimized performance.
        
        OPTIMIZED FLOW:
        1. Generate UUIDs immediately (no DB operations)
        2. Send SSE events instantly  
        3. Start AI streaming
        4. Create database records asynchronously in background
        
        Args:
            chat_request: Chat request containing query, messages, etc.
            
        Yields:
            Stream of responses including conversation creation and AI responses
        """
        conversation_id = chat_request.conversation_id
        create_new_conversation = conversation_id is None
        
        # 🚀 STEP 1: Generate UUIDs immediately (no DB blocking!)
        if create_new_conversation:
            conversation_id = uuid4()  # Instant UUID generation
        
        user_message_id = uuid4()      # Pre-generate user message ID
        assistant_message_id = uuid4() # Pre-generate assistant message ID
        
        # 🚀 STEP 2: Send SSE immediately with UUIDs (before any DB operations!)
        if create_new_conversation:
            conversation_title = await self.ai_service.get_chat_title(chat_request.query)
            
            # Send conversation created event IMMEDIATELY
            yield {
                "type": "conversation_created",
                "data": {
                    "conversation_id": str(conversation_id),
                    "title": conversation_title,
                    "created": True
                }
            }
        
        # 🚀 STEP 3: Start AI streaming immediately (parallel with DB operations)
        full_response = ""
        db_operations_task = None
        
        try:
            # Start background DB operations asynchronously
            db_operations_task = asyncio.create_task(
                self._create_database_records_async(
                    chat_request=chat_request,
                    conversation_id=conversation_id,
                    user_message_id=user_message_id,
                    assistant_message_id=assistant_message_id,
                    conversation_title=conversation_title if create_new_conversation else None
                )
            )
            
            # Stream AI responses immediately (don't wait for DB!)
            print("Starting AI streaming...")
            
            # Convert ChatAttachment objects to RemoteFile format for AI service
            attachments_for_ai = []
            if chat_request.attachments:
                for attachment in chat_request.attachments:
                    attachments_for_ai.append({
                        "url": attachment.s3_url,
                        "content_type": attachment.content_type
                    })
            
            # Get conversation history for AI context
            ai_messages = await self._get_conversation_history_for_ai(conversation_id, create_new_conversation)
            
            async for ai_response in self.ai_service.stream_chat_response(
                query=chat_request.query,
                messages=ai_messages[::-1],  # Use conversation history
                attachments=attachments_for_ai,  # Send full RemoteFile objects to AI service
                user_id=str(self.current_user.user_id)
            ):
                # Extract content based on AI service response format
                event_type = ai_response.get("event_type", "")
                content = ""
                finish_reason = None
                
                # Debug logging (commented out for production)
                # print(f"🔍 Event: {event_type}, Content preview: {str(ai_response.get('content', ''))[:100]}...")
                
                # Handle different event types from AI service
                if event_type == "text":
                    # Text content from AI response
                    content = ai_response.get("content", "")
                    full_response += content
                elif event_type == "text_message":
                    # Complete text message from AI
                    # Skip because we're streaming text_fragments instead
                    # content = ai_response.get("content", "")
                    # full_response += content
                    pass
                elif event_type == "debug:inference_output":
                    # Raw LLM inference output - extract meaningful content
                    # Don't render raw inference output
                    pass
                elif event_type == "debug:tool_result":
                    # Tool execution result - combine with previous tool call
                    tool_result = ai_response.get("content", {})
                    if isinstance(tool_result, dict) and "content" in tool_result:
                        # Extract text content from tool result
                        result_content = tool_result["content"]
                        combined_content = ""
                        
                        # Start with tool call info if available
                        if hasattr(self, 'current_tool_call'):
                            tool_info = self.current_tool_call
                            tool_namespace = tool_info.get("namespace", "")
                            tool_name = tool_info.get("name", "unknown")
                            combined_content += f"\n<tool_call tool=\"{tool_namespace}/{tool_name}\">\n"
                            combined_content += f"Calling {tool_name}...\n\n"
                        else:
                            combined_content += f"\n<tool_call tool=\"unknown\">\n"
                        
                        if isinstance(result_content, list):
                            for item in result_content:
                                if isinstance(item, dict) and item.get("type") == "text":
                                    text_content = item.get("text", "")
                                    combined_content += f"{text_content}\n"
                        elif isinstance(result_content, dict) and "structuredContent" in result_content:
                            # Handle structured content from tool results
                            structured = result_content["structuredContent"]
                            if "result" in structured:
                                import json
                                try:
                                    result_data = structured["result"]
                                    
                                    # Add result data to the same tool box
                                    combined_content += "**Result:**\n\n"
                                    
                                    if isinstance(result_data, (dict, list)):
                                        # Format as JSON for complex data
                                        json_str = json.dumps(result_data, indent=2)
                                        combined_content += f"```json\n{json_str}\n```\n"
                                    else:
                                        combined_content += f"{result_data}\n"
                                    
                                except Exception as e:
                                    combined_content += "Result processed successfully.\n"
                        
                        combined_content += "\n</tool_call>\n"
                        content = combined_content
                        full_response += content
                        
                        # Clear the stored tool call
                        if hasattr(self, 'current_tool_call'):
                            delattr(self, 'current_tool_call')
                elif event_type == "debug:tool_call":
                    # Tool call event - format for frontend rendering
                    tool_call_info = ai_response.get("content", "")
                    try:
                        if isinstance(tool_call_info, str):
                            import json
                            tool_info = json.loads(tool_call_info)
                            tool_name = tool_info.get("tool_name", "unknown")
                            tool_namespace = tool_info.get("tool_namespace", "")
                            
                            # Store current tool info for later result matching
                            self.current_tool_call = {
                                "name": tool_name,
                                "namespace": tool_namespace,
                                "content": f"Calling {tool_name}..."
                            }
                            
                            # Don't output immediately - wait for result
                            pass
                    except:
                        pass  # Skip malformed tool call info
                elif event_type == "debug:lifecycle_command":
                    # Workflow lifecycle commands (wait_for_tool_response, etc.)
                    lifecycle_cmd = ai_response.get("content", "")
                    if lifecycle_cmd == "wait_for_tool_response":
                        content = "\n⏳ **Processing tool response...**\n"
                        full_response += content
                    # Skip all other lifecycle commands (disengage, blocked_on_further_input, etc.)
                    # These are internal agent state transitions not meant for the user
                elif event_type == "debug:text_message":
                    # Debug text messages - filter for useful content
                    debug_content = ai_response.get("content", "")
                    if "message_stop" not in debug_content and "usage:" not in debug_content:
                        content = debug_content
                        full_response += content
                elif event_type == "text_fragment" or event_type == "agent_response":
                    # Agent response fragments
                    content = ai_response.get("content", "")
                    full_response += content
                elif event_type == "completion" or event_type == "agent_completion":
                    # End of stream
                    finish_reason = "stop"
                    content = ai_response.get("content", "")
                    if content:
                        full_response += content
                elif event_type == "debug:iter":
                    # Iteration markers - can show progress but don't add to response
                    iteration = ai_response.get("content", "")
                    if iteration == "0":
                        content = "\n🔄 **Starting workflow...**\n"
                        full_response += content
                    # Don't add iteration numbers to main response
                elif event_type == "debug:prompt":
                    # Skip system prompts - not user-facing content
                    pass
                elif event_type == "agent_terminated":
                    # Skip, nothing to render
                    pass
                else:
                    # Handle any other event types that might contain content
                    raw_content = ai_response.get("content", "")
                    if isinstance(raw_content, str) and raw_content.strip() and len(raw_content) < 1000:
                        # Only include short text content, skip debug info and system messages
                        if not any(debug_term in raw_content.lower() for debug_term in [
                            "you are an ai accountant", "system:", "assistant:", "<thinking>", 
                            "tool_namespace", "tool_name", "input_schema", "timestamp",
                            "debug:", "lifecycle", "inference"
                        ]):
                            content = raw_content
                            full_response += content
                
                # Only send response if there's content or it's a completion
                if content or finish_reason:
                    stream_response = {
                        "type": "chat_response",
                        "data": {
                            "content": content,
                            "finish_reason": finish_reason,
                            "conversation_id": str(conversation_id),
                            "message_id": str(assistant_message_id),
                            "event_type": event_type  # Include event type for debugging
                        }
                    }
                    
                    yield stream_response
                
                if finish_reason:
                    break
        
                    
        except Exception as e:
            # Handle AI service errors
            error_response = {
                "type": "error",
                "data": {
                    "error": str(e),
                    "conversation_id": str(conversation_id),
                    "message_id": str(assistant_message_id)
                }
            }
            yield error_response
            full_response = f"Error: {str(e)}"
        
        # 🚀 STEP 4: Wait for DB operations to complete and update assistant message
        try:
            if db_operations_task:
                await db_operations_task  # Ensure DB records are created
            
            # Update assistant message with complete response
            assistant_update_data = MessageUpdate(
                content=full_response,
                extra_metadata={"streaming": False, "completed": True}
            )
            
            self.message_service.update_message(assistant_message_id, assistant_update_data)
            
        except Exception as e:
            self.logger.error(f"Database operation failed: {e}")
            # Send error but don't break the stream
            yield {
                "type": "db_error",
                "data": {
                    "error": "Database operation failed",
                    "details": str(e),
                    "conversation_id": str(conversation_id)
                }
            }
        
        # Send completion event
        yield {
            "type": "chat_complete",
            "data": {
                "conversation_id": str(conversation_id),
                "message_id": str(assistant_message_id),
                "user_message_id": str(user_message_id),
                "complete": True
            }
        }
    
    async def _get_conversation_history_for_ai(self, conversation_id: UUID, is_new_conversation: bool) -> List[Dict[str, Any]]:
        """
        Get conversation history for AI service context
        
        Args:
            conversation_id: ID of the conversation
            is_new_conversation: Whether this is a new conversation
            
        Returns:
            Formatted messages for AI service (last 5 messages for existing conversations, empty for new)
        """
        if is_new_conversation:
            return []  # Empty array for new conversations
        
        try:
            # Get last 5 messages from the conversation (excluding the current user message)
            db_messages = self.message_service.get_messages_by_conversation(
                conversation_id=conversation_id,
                skip=0,
                limit=5
            )
            
            # Format messages for AI service
            ai_messages = []
            for db_message in reversed(db_messages):  # Reverse to get chronological order
                ai_messages.append({
                    "content": db_message.content,
                    "role": db_message.role  # "user" or "assistant"
                })
            
            return ai_messages
            
        except Exception as e:
            self.logger.error(f"Failed to get conversation history: {e}")
            return []  # Return empty array if error occurs
    
    def _format_messages_for_ai(self, messages: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """
        Format messages for AI service API (legacy method, now replaced by _get_conversation_history_for_ai)
        
        Args:
            messages: List of chat messages
            
        Returns:
            Formatted messages for AI service
        """
        if not messages:
            return []
        
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "content": msg.get("content", ""),
                "role": msg.get("role", "user")
            })
        
        return formatted_messages
    
    async def _create_database_records_async(
        self,
        chat_request: ChatRequest,
        conversation_id: UUID,
        user_message_id: UUID,
        assistant_message_id: UUID,
        conversation_title: Optional[str] = None
    ):
        """
        Create database records asynchronously in background.
        This happens in parallel with AI streaming for better performance.
        
        Args:
            chat_request: Original chat request
            conversation_id: Pre-generated conversation ID
            user_message_id: Pre-generated user message ID
            assistant_message_id: Pre-generated assistant message ID
            conversation_title: Title for new conversation (if creating new)
        """
        try:
            # Create conversation if needed (with pre-generated ID)
            if conversation_title:
                conversation_data = ConversationCreate(
                    title=conversation_title,
                    user_id=self.current_user.user_id
                )
                
                # Use repository directly to specify UUID
                from app.infrastructure.database.models import ConversationModel
                db_conversation = ConversationModel(
                    id=conversation_id,
                    title=conversation_data.title,
                    user_id=self.current_user.user_id,
                    created_at=datetime.utcnow()
                )
                self.db.add(db_conversation)
                self.db.flush()  # Flush but don't commit yet
            
            # Create user message (with pre-generated ID)
            from app.infrastructure.database.models import MessageModel, AttachmentModel
            user_message = MessageModel(
                id=user_message_id,
                message_type="chat",
                content=chat_request.query,
                role="user",
                timestamp=datetime.utcnow(),
                conversation_id=conversation_id,
                extra_metadata={
                    "has_attachments": len(chat_request.attachments) > 0 if chat_request.attachments else False,
                    "attachment_count": len(chat_request.attachments) if chat_request.attachments else 0
                }
            )
            self.db.add(user_message)
            
            # Create attachments if any
            if chat_request.attachments:
                for attachment_data in chat_request.attachments:
                    attachment = AttachmentModel(
                        id=uuid4(),
                        message_id=user_message_id,
                        filename=attachment_data.filename,
                        content_type=attachment_data.content_type,
                        file_size=attachment_data.file_size,
                        s3_url=attachment_data.s3_url,
                        s3_key=attachment_data.s3_key,
                        created_at=datetime.utcnow()
                    )
                    self.db.add(attachment)
            
            # Create assistant message placeholder (with pre-generated ID)
            assistant_message = MessageModel(
                id=assistant_message_id,
                message_type="chat",
                content="",  # Will be updated later
                role="assistant",
                timestamp=datetime.utcnow(),
                conversation_id=conversation_id,
                extra_metadata={"streaming": True}
            )
            self.db.add(assistant_message)
            
            # Commit all at once
            self.db.commit()
            self.logger.info(f"Database records created successfully for conversation {conversation_id}")
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Failed to create database records: {e}")
            raise
    
    def get_conversation_messages(self, conversation_id: UUID) -> List[MessageResponse]:
        """
        Get all messages for a conversation
        
        Args:
            conversation_id: ID of the conversation
            
        Returns:
            List of messages in the conversation
        """
        return self.message_service.get_messages_by_conversation(conversation_id)
