#!/usr/bin/env python3
"""
Document Extractor Implementation

Core extraction logic moved from AI service to MCP server.
Implements the same SimpleLLMExtractor logic but as a direct MCP tool.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .anthropic_client import AnthropicExtractClient, RemoteFile

logger = logging.getLogger(__name__)


class ExtractResult:
    """Result of an extraction operation."""
    def __init__(
        self,
        extracted_data: Dict[str, Any],
        inferred_schema: Optional[Dict[str, Any]] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.extracted_data = extracted_data
        self.inferred_schema = inferred_schema
        self.success = success
        self.error_message = error_message
        self.metadata = metadata or {}


class DocumentExtractor:
    """
    Document extractor that uses Anthropic Claude for AI-powered extraction.
    
    This class implements the same logic as SimpleLLMExtractor from the AI service
    but runs directly within the MCP server for better performance and simpler architecture.
    """
    
    # Extraction prompts (same as in AI service)
    INFER_SCHEMA_PROMPT = """
    You are a helpful assistant that infers a JSON schema from unstructured data. Output the JSON schema of the given document.
    """
    
    EXTRACT_JSON_PROMPT = """
    You are a helpful assistant that extracts JSON from documents. Below is the schema you should adhere to. Output the JSON.

    {schema}
    """
    
    DIRECT_EXTRACT_PROMPT = """
    You are a helpful assistant that extracts structured JSON data from documents.
    
    Analyze the provided document(s) and extract all relevant structured information as JSON.
    
    Output only valid JSON, no additional text.
    """
    
    def __init__(self):
        """Initialize the document extractor."""
        self.anthropic_client = AnthropicExtractClient()
        logger.info("Document extractor initialized")
    
    def _extract_json_from_response(self, response: str) -> Dict[str, Any]:
        """
        Extract JSON object from a string response.
        Returns the parsed JSON object if possible, otherwise an empty dict.
        """
        if not response or not isinstance(response, str):
            logger.warning("Empty or invalid response received")
            return {}
        
        # Try to find JSON in the response
        # Look for the first '{' and last '}'
        start = response.find('{')
        end = response.rfind('}')
        
        if start != -1 and end != -1 and end > start:
            json_str = response[start:end+1]
        else:
            # If no braces found, try the whole response
            json_str = response.strip()
        
        try:
            extracted_json = json.loads(json_str)
            logger.debug(f"Successfully parsed JSON with {len(extracted_json)} keys")
            return extracted_json
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse JSON: {str(e)}")
            logger.debug(f"Attempted to parse: {json_str[:200]}...")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error parsing JSON: {str(e)}")
            return {}
    
    def extract_with_schema_inference(
        self,
        file_urls: List[Dict[str, str]],
        predefined_schema: Optional[Dict[str, Any]] = None,
        user_id: str = "",
        config: Optional[Dict[str, Any]] = None
    ) -> ExtractResult:
        """
        Extract data from documents with automatic schema inference.
        
        This implements the two-step process from the AI service:
        1. Infer schema from documents (unless predefined schema provided)
        2. Extract data using the schema
        
        Args:
            file_urls: List of dicts with 'url' and 'content_type' keys
            predefined_schema: Optional predefined schema to use
            user_id: User identifier for logging/metadata
            config: Optional configuration parameters
            
        Returns:
            ExtractResult with extracted data and metadata
        """
        try:
            # Convert to RemoteFile objects
            attachments = [
                RemoteFile(url=file_data["url"], content_type=file_data["content_type"])
                for file_data in file_urls
            ]
            
            logger.info(f"Starting extraction for user {user_id}: {len(attachments)} files")
            
            # Step 1: Schema inference (if not provided)
            if predefined_schema:
                logger.debug("Using predefined schema")
                inferred_schema = predefined_schema
            else:
                logger.debug("Inferring schema from documents")
                schema_response = self.anthropic_client.extract_with_anthropic(
                    query=self.INFER_SCHEMA_PROMPT,
                    attachments=attachments,
                    temperature=0.1
                )
                
                inferred_schema = self._extract_json_from_response(schema_response)
                if not inferred_schema:
                    logger.warning("Schema inference failed, proceeding with direct extraction")
            
            # Step 2: Data extraction
            if inferred_schema:
                # Use schema-guided extraction
                extract_prompt = self.EXTRACT_JSON_PROMPT.format(
                    schema=json.dumps(inferred_schema, indent=2)
                )
                logger.debug("Performing schema-guided extraction")
            else:
                # Use direct extraction without schema
                extract_prompt = self.DIRECT_EXTRACT_PROMPT
                logger.debug("Performing direct extraction (no schema)")
            
            extraction_response = self.anthropic_client.extract_with_anthropic(
                query=extract_prompt,
                attachments=attachments,
                temperature=0.1
            )
            
            extracted_data = self._extract_json_from_response(extraction_response)
            
            # Prepare metadata
            metadata = {
                "user_id": user_id,
                "extraction_timestamp": datetime.now(timezone.utc).isoformat(),
                "file_count": len(file_urls),
                "files_processed": file_urls,
                "schema_provided": predefined_schema is not None,
                "extraction_method": "schema_guided" if inferred_schema else "direct"
            }
            
            # Add config info if provided
            if config:
                metadata["config"] = config
            
            success = bool(extracted_data)  # Consider successful if we got any data
            error_message = None if success else "No data could be extracted from the documents"
            
            logger.info(f"Extraction completed for user {user_id}: success={success}")
            
            return ExtractResult(
                extracted_data=extracted_data,
                inferred_schema=inferred_schema,
                success=success,
                error_message=error_message,
                metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Extraction failed for user {user_id}: {str(e)}")
            return ExtractResult(
                extracted_data={},
                inferred_schema=None,
                success=False,
                error_message=f"Extraction failed: {str(e)}",
                metadata={
                    "user_id": user_id,
                    "extraction_timestamp": datetime.now(timezone.utc).isoformat(),
                    "error_type": "extraction_error",
                    "file_count": len(file_urls) if file_urls else 0
                }
            )
    
    def infer_schema_only(
        self,
        file_urls: List[Dict[str, str]],
        user_id: str = ""
    ) -> ExtractResult:
        """
        Infer schema from documents without performing full extraction.
        
        Args:
            file_urls: List of dicts with 'url' and 'content_type' keys
            user_id: User identifier for logging/metadata
            
        Returns:
            ExtractResult with inferred schema
        """
        try:
            attachments = [
                RemoteFile(url=file_data["url"], content_type=file_data["content_type"])
                for file_data in file_urls
            ]
            
            logger.info(f"Inferring schema for user {user_id}: {len(attachments)} files")
            
            schema_response = self.anthropic_client.extract_with_anthropic(
                query=self.INFER_SCHEMA_PROMPT,
                attachments=attachments,
                temperature=0.1
            )
            
            inferred_schema = self._extract_json_from_response(schema_response)
            
            metadata = {
                "user_id": user_id,
                "inference_timestamp": datetime.now(timezone.utc).isoformat(),
                "file_count": len(file_urls),
                "files_analyzed": file_urls
            }
            
            success = bool(inferred_schema)
            error_message = None if success else "Could not infer schema from the documents"
            
            return ExtractResult(
                extracted_data={},
                inferred_schema=inferred_schema,
                success=success,
                error_message=error_message,
                metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Schema inference failed for user {user_id}: {str(e)}")
            return ExtractResult(
                extracted_data={},
                inferred_schema=None,
                success=False,
                error_message=f"Schema inference failed: {str(e)}",
                metadata={
                    "user_id": user_id,
                    "inference_timestamp": datetime.now(timezone.utc).isoformat(),
                    "error_type": "schema_inference_error"
                }
            )


# Global extractor instance
_extractor = None

def get_extractor() -> DocumentExtractor:
    """Get or create the global document extractor instance."""
    global _extractor
    if _extractor is None:
        _extractor = DocumentExtractor()
    return _extractor
