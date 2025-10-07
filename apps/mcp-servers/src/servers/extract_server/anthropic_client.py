#!/usr/bin/env python3
"""
Anthropic Client for Extract MCP Server

Direct Anthropic API integration for document extraction functionality.
Adapted from the AI service to work within the MCP server context.
"""

import anthropic
import json
import logging
from typing import List, Dict, Any
from .config import settings

logger = logging.getLogger(__name__)


class RemoteFile:
    """Simple remote file representation for extraction."""
    def __init__(self, url: str, content_type: str):
        self.url = url
        self.content_type = content_type


class AnthropicExtractClient:
    """Anthropic client specifically designed for document extraction."""
    
    def __init__(self):
        """Initialize the Anthropic client."""
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is required")
        
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL
        logger.info(f"Initialized Anthropic client with model: {self.model}")
    
    def _prepare_content_with_attachments(self, query: str, attachments: List[RemoteFile]) -> List[Dict[str, Any]]:
        """Prepare content including text and file attachments for Anthropic API."""
        content = []
        
        # Add text content
        content.append({
            "type": "text",
            "text": query
        })
        
        # Add attachments based on content type
        for attachment in attachments:
            try:
                if attachment.content_type == "application/pdf":
                    content.append({
                        "type": "document",
                        "source": {
                            "type": "url",
                            "url": attachment.url
                        }
                    })
                elif attachment.content_type in ["image/png", "image/jpeg", "image/heic"]:
                    content.append({
                        "type": "image",
                        "source": {
                            "type": "url",
                            "url": attachment.url
                        }
                    })
                else:
                    # For other file types, we'll still try to process them as documents
                    # Anthropic will handle what it can
                    content.append({
                        "type": "document",
                        "source": {
                            "type": "url",
                            "url": attachment.url
                        }
                    })
                    
            except Exception as e:
                logger.warning(f"Could not add attachment {attachment.url}: {str(e)}")
                continue
        
        return content
    
    def extract_with_anthropic(
        self,
        query: str,
        attachments: List[RemoteFile],
        temperature: float = 0.1  # Lower temperature for more consistent extraction
    ) -> str:
        """
        Send extraction request to Anthropic Claude.
        
        Args:
            query: The extraction prompt/query
            attachments: List of files to process
            temperature: Generation temperature (lower = more consistent)
            
        Returns:
            String response from Claude
            
        Raises:
            Exception: If the API call fails
        """
        try:
            content = self._prepare_content_with_attachments(query, attachments)
            
            # Prepare messages in Anthropic format
            messages = [{
                "role": "user",
                "content": content
            }]
            
            logger.debug(f"Sending request to Anthropic with {len(attachments)} attachments")
            
            # Make the API call
            response = self.client.beta.messages.create(
                model=self.model,
                messages=messages,
                max_tokens=4096,
                temperature=temperature,
                betas=["files-api-2025-04-14"]
            )
            
            # Extract text from response
            if response.content and len(response.content) > 0:
                result = response.content[0].text
                logger.debug(f"Received response from Anthropic: {len(result)} characters")
                return result
            else:
                raise Exception("Empty response from Anthropic API")
                
        except Exception as e:
            logger.error(f"Anthropic API call failed: {str(e)}")
            raise Exception(f"Failed to call Anthropic API: {str(e)}")
