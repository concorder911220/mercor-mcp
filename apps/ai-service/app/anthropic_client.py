import anthropic
from typing import AsyncGenerator, List, Dict, Any
import json
from .models import Message, RemoteFile

class AnthropicClient:
    """Client for interacting with Anthropic's Claude API."""
    
    def __init__(self, anthropic_api_key: str, anthropic_model: str):
        """Initialize the Anthropic client."""        
        self.client = anthropic.Anthropic(api_key=anthropic_api_key)
        self.model = anthropic_model
    
    def _prepare_messages(self, messages: List[Message], query: str, attachments: List[RemoteFile], response_prefill: str = None) -> List[Dict[str, Any]]:
        """Prepare messages for Anthropic API format."""
        # Convert our Message objects to Anthropic format
        anthropic_messages = []
        
        # Add existing messages
        for message in messages:
            anthropic_messages.append({
                "role": message.role.value,
                "content": message.content
            })
        
        # Prepare content for the new user message
        content = []
        
        # Add text content
        content.append({
            "type": "text",
            "text": query
        })
        
        # Add attachments if provided using direct URL support
        for attachment in attachments:
            if attachment.content_type == "application/pdf":
                content.append({
                    "type": "document",
                    "source": {
                        "type": "url",
                        "url": attachment.url
                    }
                })
            elif attachment.content_type == "image/png" or attachment.content_type == "image/jpeg" or attachment.content_type == "image/heic":
                content.append({
                    "type": "image",
                    "source": {
                        "type": "url",
                        "url": attachment.url
                    }
                })
        
        # Add the new user message
        anthropic_messages.append({
            "role": "user",
            "content": content
        })

        if response_prefill:
            anthropic_messages.append({
                "role": "assistant",
                "content": response_prefill
            })
        
        return anthropic_messages
    
    def chat(
        self,
        query: str,
        messages: List[Message],
        attachments: List[RemoteFile] = None,
        response_prefill: str = None
    ) -> str:
        """
        Chat with Claude (non-streaming).
        """
        if attachments is None:
            attachments = []
        
        anthropic_messages = self._prepare_messages(messages, query, attachments, response_prefill)
        
        response = self.client.beta.messages.create(
            model=self.model,
            messages=anthropic_messages,
            max_tokens=4096,
            temperature=0.7,
            betas=["files-api-2025-04-14"]
        )

        return response.content[0].text
        

    async def stream_chat(
        self, 
        query: str, 
        messages: List[Message], 
        attachments: List[RemoteFile] = None,
        response_prefill: str = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat response from Claude.
        
        Args:
            query: The user's query
            messages: Message history
            attachments: List of S3 URLs for attachments
            
        Yields:
            JSON strings containing streaming response data
        """
        if attachments is None:
            attachments = []
        
        try:
            # Prepare messages for Anthropic API
            anthropic_messages = self._prepare_messages(messages, query, attachments, response_prefill)
            
            # Stream the response using the beta API with files support
            is_first_chunk = True
            with self.client.beta.messages.stream(
                model=self.model,
                messages=anthropic_messages,
                max_tokens=4096,
                temperature=0.7,
                betas=["files-api-2025-04-14"]
            ) as stream:
                for chunk in stream:
                    if chunk.type == "content_block_delta":
                        # Yield the content delta
                        chunk_content = chunk.delta.text

                        if is_first_chunk and response_prefill:
                            chunk_content = response_prefill + chunk_content

                        yield json.dumps({
                            "type": "content_delta",
                            "content": chunk_content,
                            "finish_reason": None
                        })
                        is_first_chunk = False
                    elif chunk.type == "message_stop":
                        # Yield the final message with usage info (handle missing usage)
                        usage_info = {}
                        if hasattr(chunk, 'usage') and chunk.usage:
                            usage_info = {
                                "input_tokens": getattr(chunk.usage, 'input_tokens', 0),
                                "output_tokens": getattr(chunk.usage, 'output_tokens', 0)
                            }
                        
                        yield json.dumps({
                            "type": "message_stop",
                            "content": "",
                            "finish_reason": "stop",
                            "usage": usage_info
                        })
                        
        except Exception as e:
            # Yield error response
            yield json.dumps({
                "type": "error",
                "error": str(e),
                "content": "",
                "finish_reason": "error"
            })