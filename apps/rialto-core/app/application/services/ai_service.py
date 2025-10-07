import aiohttp
import json
import asyncio
import logging
from typing import AsyncGenerator, Dict, Any, List

from rialto_shared_types.agent_interface import AgentInboundRequest
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    """Service for interacting with external AI API"""
    
    def __init__(self):
        self.ai_base_url = settings.ai_server_url.rstrip('/')  # Remove trailing slash if present
        self.ai_endpoint = f"{self.ai_base_url}/chat"
        self.timeout = aiohttp.ClientTimeout(total=settings.ai_service_timeout)
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for AI service requests including authentication"""
        headers = {"Content-Type": "application/json"}
        
        if settings.ai_service_auth_token:
            headers["Authorization"] = f"Bearer {settings.ai_service_auth_token}"
            logger.debug("Added AI service authentication token to request")
        else:
            logger.warning("AI service auth token not configured - requests will be unauthenticated")
            
        return headers
    
    async def stream_chat_response(
        self, 
        query: str, 
        user_id: str,
        messages: List[Dict[str, Any]] = None,
        attachments: List[Dict[str, str]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream chat response from AI service
        
        Args:
            query: User's query
            messages: Previous conversation messages
            attachments: File attachments as RemoteFile objects (if any)
            
        Yields:
            Dict containing streamed response chunks
        """
        if messages is None:
            messages = []
        if attachments is None:
            attachments = []
            
        payload = {
            "query": query,
            "messages": messages,
            "attachments": attachments,
            "user_id": user_id
        }
        
        try:
            # Configure session with larger limits for big responses
            connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
            timeout = aiohttp.ClientTimeout(total=self.timeout.total, sock_read=60)
            
            async with aiohttp.ClientSession(
                timeout=timeout, 
                connector=connector,
                read_bufsize=2**16  # 64KB buffer size
            ) as session:
                async with session.post(
                    self.ai_endpoint,
                    json=payload,
                    headers=self._get_headers()
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"AI service error: {response.status} - {error_text}")
                    
                    # Process SSE stream with chunk size limit
                    current_event = None
                    buffer = ""
                    
                    async for chunk in response.content.iter_chunked(8192):  # 8KB chunks
                        try:
                            buffer += chunk.decode('utf-8')
                            
                            # Process complete lines
                            while '\n' in buffer:
                                line, buffer = buffer.split('\n', 1)
                                line = line.strip()
                                
                                if line.startswith('event: '):
                                    current_event = line[7:]  # Remove 'event: ' prefix
                                elif line.startswith('data: '):
                                    data_str = line[6:]  # Remove 'data: ' prefix
                                    if data_str.strip():
                                        try:
                                            # Limit data size to prevent memory issues
                                            if len(data_str) > 1024 * 1024:  # 1MB limit per chunk
                                                # For very large chunks, just extract key info
                                                if '"content"' in data_str:
                                                    data = {"content": "[Large content truncated]", "truncated": True}
                                                else:
                                                    continue  # Skip oversized non-content chunks
                                            else:
                                                data = json.loads(data_str)
                                                
                                            # Add event type to the data
                                            data['event_type'] = current_event
                                            yield data
                                        except json.JSONDecodeError:
                                            # Skip malformed JSON lines
                                            continue
                                        except Exception as e:
                                            # Handle other parsing errors
                                            yield {
                                                "content": f"[Parsing error: {str(e)}]",
                                                "event_type": current_event or "error"
                                            }
                                # Skip id: lines and empty lines
                                
                        except UnicodeDecodeError:
                            # Skip chunks that can't be decoded
                            continue
                        except Exception as e:
                            # Handle chunk processing errors
                            yield {
                                "content": f"[Chunk processing error: {str(e)}]", 
                                "event_type": "error"
                            }
                                    
        except aiohttp.ClientError as e:
            raise Exception(f"Failed to connect to AI service: {str(e)}")
        except asyncio.TimeoutError:
            raise Exception("AI service request timed out")
        except Exception as e:
            raise Exception(f"AI service error: {str(e)}")
    
    async def stream_event_response(
        self, 
        request: AgentInboundRequest
    ) -> AsyncGenerator[str, None]:
        """
        Stream event response from AI service /event endpoint
        
        Args:
            request: The request payload to send to AI service
            
        Yields:
            Raw SSE formatted strings from the AI service
        """
        ai_event_endpoint = f"{self.ai_base_url}/event"
        
        try:
            logger.info(f"=== Calling AI service at {ai_event_endpoint} ===")
            logger.info(f"Request payload: {request.model_dump(mode='json')}")
            # Configure session with larger limits for big responses
            connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
            timeout = aiohttp.ClientTimeout(total=self.timeout.total, sock_read=60)
            
            async with aiohttp.ClientSession(
                timeout=timeout, 
                connector=connector,
                read_bufsize=2**16  # 64KB buffer size
            ) as session:
                async with session.post(
                    ai_event_endpoint,
                    json=request.model_dump(mode='json'),
                    headers=self._get_headers()
                ) as response:
                    logger.info(f"AI service response status: {response.status}")
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"AI service error response: {error_text}")
                        raise Exception(f"AI service error: {response.status} - {error_text}")
                    
                    # Stream raw SSE data directly from AI service
                    async for chunk in response.content.iter_chunked(8192):  # 8KB chunks
                        try:
                            chunk_str = chunk.decode('utf-8')
                            yield chunk_str
                        except UnicodeDecodeError:
                            # Skip chunks that can't be decoded
                            continue
                                    
        except aiohttp.ClientError as e:
            # Yield error as SSE format
            logger.error(f"aiohttp.ClientError calling AI service: {str(e)}")
            error_sse = f"event: error\ndata: {{\"error\": \"Failed to connect to AI service.\"}}\n\n"
            yield error_sse
        except asyncio.TimeoutError:
            # Yield timeout error as SSE format
            logger.error("AI service request timed out")
            timeout_sse = f"event: error\ndata: {{\"error\": \"AI service request timed out\"}}\n\n"
            yield timeout_sse
        except Exception as e:
            # Yield general error as SSE format
            logger.error(f"Exception calling AI service: {str(e)}")
            error_sse = f"event: error\ndata: {{\"error\": \"AI service error occurred.\"}}\n\n"
            yield error_sse

    async def get_chat_title(self, query: str) -> str:
        """
        Generate a title for the conversation based on the first query
        
        Args:
            query: User's first message
            
        Returns:
            Generated title for the conversation
        """
        # Simple title generation - take first 50 chars or create based on query
        if len(query) <= 50:
            return query
        else:
            # Take first sentence or first 50 characters
            first_sentence = query.split('.')[0]
            if len(first_sentence) <= 50:
                return first_sentence
            else:
                return query[:47] + "..."