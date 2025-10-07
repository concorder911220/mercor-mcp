#!/usr/bin/env python3
"""
Document Extraction Tools

Provides AI-powered extraction of structured data from unstructured documents
including PDFs, images, Word documents, and other file types.

This implementation uses direct Anthropic API calls within the MCP server
instead of making HTTP requests to a separate AI service.

Key Features:
- Direct Anthropic Claude integration
- Multi-format document support (PDF, DOCX, images, etc.)
- AI-powered schema inference
- Custom schema-guided extraction
- Integration with Dropbox for file access
- Comprehensive error handling and validation
"""

import logging
import traceback
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

# Import our extractor
from ..extractor import get_extractor
from ..config import settings

# Set up logging
logger = logging.getLogger(__name__)

# =============================================================================
# Configuration Constants
# =============================================================================

MAX_FILE_SIZE = settings.MAX_FILE_SIZE
MAX_FILES_PER_REQUEST = settings.MAX_FILES_PER_REQUEST
USER_ID_MAX_LENGTH = 100

# =============================================================================
# Helper Functions
# =============================================================================

def validate_file_url(url: str) -> bool:
    """Validate that the provided URL is accessible and reasonable"""
    if not url or not isinstance(url, str):
        return False
    if not (url.startswith('http://') or url.startswith('https://')):
        return False
    if len(url) > 2000:  # Reasonable URL length limit
        return False
    return True

def detect_content_type(filename: str, provided_type: Optional[str] = None) -> str:
    """
    Detect content type from filename extension or use provided type.
    
    Args:
        filename: The filename to analyze
        provided_type: Optional content type already provided
        
    Returns:
        Detected or provided content type
    """
    if provided_type:
        return provided_type
        
    # Simple extension to content type mapping
    extension_map = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.txt': 'text/plain',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.heic': 'image/heic',
        '.csv': 'text/csv',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.html': 'text/html',
        '.xml': 'application/xml',
        '.json': 'application/json'
    }
    
    # Extract extension
    ext = os.path.splitext(filename.lower())[1]
    return extension_map.get(ext, 'application/octet-stream')

def prepare_file_data(file_urls: List[str], content_types: Optional[List[str]] = None) -> List[Dict[str, str]]:
    """
    Prepare file data for extraction.
    
    Args:
        file_urls: List of URLs pointing to documents
        content_types: Optional list of content types for each URL
        
    Returns:
        List of dictionaries with 'url' and 'content_type' keys
    """
    file_data = []
    for i, url in enumerate(file_urls):
        # Use provided content type or detect from URL
        if content_types and i < len(content_types):
            content_type = content_types[i]
        else:
            # Try to detect from URL filename
            filename = url.split('/')[-1] if '/' in url else url
            content_type = detect_content_type(filename)
        
        file_data.append({
            "url": url,
            "content_type": content_type
        })
    
    return file_data

# =============================================================================
# MCP Tool Registration
# =============================================================================

from ..server import mcp

@mcp.tool(description="Extract structured data from documents at given URLs")
async def extract_from_url(
    user_id: str,
    file_urls: List[str],
    content_types: Optional[List[str]] = None,
    schema: Optional[Dict[str, Any]] = None,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Extract structured data from documents at the provided URLs using AI analysis.
    
    Args:
        user_id: User identifier for authentication and logging
        file_urls: List of URLs pointing to documents to extract from
        content_types: Optional list of content types for each URL (auto-detected if not provided)
        schema: Optional JSON schema to guide extraction structure
        config: Optional configuration parameters for extraction
        
    Returns:
        Dictionary containing:
        - extracted_data: The structured data extracted from documents
        - inferred_schema: The JSON schema inferred from the documents
        - success: Boolean indicating if extraction was successful
        - error_message: Error details if extraction failed
        - metadata: Additional processing information
        
    Example:
        # Extract from a single PDF invoice
        result = await extract_from_url(
            user_id="user123",
            file_urls=["https://s3.amazonaws.com/bucket/invoice.pdf"],
            content_types=["application/pdf"]
        )
        
        # Extract with custom schema
        schema = {
            "type": "object",
            "properties": {
                "invoice_number": {"type": "string"},
                "total_amount": {"type": "number"},
                "vendor_name": {"type": "string"}
            }
        }
        result = await extract_from_url(
            user_id="user123", 
            file_urls=["https://s3.amazonaws.com/bucket/invoice.pdf"],
            schema=schema
        )
    """
    logger.info(f"Extract from URL request for user {user_id}: {len(file_urls)} files")
    
    try:
        # Validate inputs
        if not file_urls or not isinstance(file_urls, list):
            raise ValueError("file_urls must be a non-empty list")
            
        if len(file_urls) > MAX_FILES_PER_REQUEST:
            raise ValueError(f"Too many files requested (max {MAX_FILES_PER_REQUEST})")
            
        if not user_id or len(user_id) > USER_ID_MAX_LENGTH:
            raise ValueError("Valid user_id is required")
            
        # Validate all URLs
        for url in file_urls:
            if not validate_file_url(url):
                raise ValueError(f"Invalid URL provided: {url}")
        
        # Prepare file data for extraction
        file_data = prepare_file_data(file_urls, content_types)
        logger.debug(f"Prepared file data: {file_data}")
        
        # Get extractor and perform extraction
        extractor = get_extractor()
        result = extractor.extract_with_schema_inference(
            file_urls=file_data,
            predefined_schema=schema,
            user_id=user_id,
            config=config
        )
        
        # Convert ExtractResult to dictionary format
        return {
            "extracted_data": result.extracted_data,
            "inferred_schema": result.inferred_schema,
            "success": result.success,
            "error_message": result.error_message,
            "metadata": result.metadata
        }
        
    except ValueError as e:
        logger.warning(f"Validation error for user {user_id}: {str(e)}")
        return {
            "extracted_data": {},
            "inferred_schema": None,
            "success": False,
            "error_message": f"Validation error: {str(e)}",
            "metadata": {
                "user_id": user_id,
                "request_timestamp": datetime.now(timezone.utc).isoformat(),
                "error_type": "validation_error"
            }
        }
    except Exception as e:
        logger.error(f"Unexpected error during extraction for user {user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "extracted_data": {},
            "inferred_schema": None,
            "success": False,
            "error_message": f"Unexpected error: {str(e)}",
            "metadata": {
                "user_id": user_id,
                "request_timestamp": datetime.now(timezone.utc).isoformat(),
                "error_type": "unexpected_error"
            }
        }

@mcp.tool(description="Extract structured data from a file in Dropbox")
async def extract_from_dropbox_file(
    user_id: str,
    dropbox_path: str,
    schema: Optional[Dict[str, Any]] = None,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Extract structured data from a file stored in Dropbox using AI analysis.
    
    This tool first gets a shared link for the Dropbox file, then uses that
    URL for extraction. Requires the user to have Dropbox authentication.
    
    Args:
        user_id: User identifier for authentication
        dropbox_path: Path to the file in Dropbox (e.g., "/documents/invoice.pdf")
        schema: Optional JSON schema to guide extraction structure
        config: Optional configuration parameters for extraction
        
    Returns:
        Dictionary containing extraction results (same format as extract_from_url)
        
    Example:
        result = await extract_from_dropbox_file(
            user_id="user123",
            dropbox_path="/invoices/invoice_2024_001.pdf",
            schema={
                "type": "object",
                "properties": {
                    "invoice_number": {"type": "string"},
                    "amount": {"type": "number"}
                }
            }
        )
    """
    logger.info(f"Extract from Dropbox file request for user {user_id}: {dropbox_path}")
    
    try:
        # Import Dropbox tools (with better error handling)
        try:
            from ...dropbox_server.tools.file_transfer import create_shared_link
            from ...dropbox_server.tools.file_operations import get_file_metadata
        except ImportError:
            raise Exception("Dropbox tools not available. Make sure Dropbox server is properly configured.")
        
        # Get file metadata to determine content type
        try:
            metadata = await get_file_metadata(user_id, dropbox_path)
            
            # Extract content type from metadata if available
            filename = metadata.get('name', dropbox_path.split('/')[-1])
            content_type = detect_content_type(filename)
            
        except Exception as e:
            logger.warning(f"Could not get metadata for {dropbox_path}: {str(e)}")
            # Fall back to detecting from path
            filename = dropbox_path.split('/')[-1] if '/' in dropbox_path else dropbox_path
            content_type = detect_content_type(filename)
        
        # Create a shared link for the file
        try:
            shared_link_result = await create_shared_link(user_id, dropbox_path)
            
            if not shared_link_result.get('success', False):
                raise Exception(f"Failed to create shared link: {shared_link_result.get('error', 'Unknown error')}")
                
            file_url = shared_link_result.get('url')
            if not file_url:
                raise Exception("No URL returned from shared link creation")
                
        except Exception as e:
            logger.error(f"Failed to create Dropbox shared link for user {user_id}: {str(e)}")
            return {
                "extracted_data": {},
                "inferred_schema": None,
                "success": False,
                "error_message": f"Could not access Dropbox file: {str(e)}",
                "metadata": {
                    "user_id": user_id,
                    "dropbox_path": dropbox_path,
                    "request_timestamp": datetime.now(timezone.utc).isoformat(),
                    "error_type": "dropbox_access_error"
                }
            }
        
        # Now extract from the shared URL
        result = await extract_from_url(
            user_id=user_id,
            file_urls=[file_url],
            content_types=[content_type],
            schema=schema,
            config=config
        )
        
        # Add Dropbox-specific metadata
        if 'metadata' not in result or result['metadata'] is None:
            result['metadata'] = {}
            
        result['metadata'].update({
            "source": "dropbox",
            "dropbox_path": dropbox_path,
            "shared_url": file_url
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Unexpected error during Dropbox extraction for user {user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "extracted_data": {},
            "inferred_schema": None,
            "success": False,
            "error_message": f"Unexpected error: {str(e)}",
            "metadata": {
                "user_id": user_id,
                "dropbox_path": dropbox_path,
                "request_timestamp": datetime.now(timezone.utc).isoformat(),
                "error_type": "unexpected_error"
            }
        }

@mcp.tool(description="Extract data with a predefined schema for consistent structure")
async def extract_with_schema(
    user_id: str,
    file_urls: List[str],
    schema: Dict[str, Any],
    content_types: Optional[List[str]] = None,
    strict_mode: bool = False,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Extract structured data from documents using a predefined JSON schema.
    
    This tool enforces a specific schema structure and can optionally validate
    the extracted data against the schema for consistency.
    
    Args:
        user_id: User identifier for authentication
        file_urls: List of URLs pointing to documents to extract from
        schema: JSON schema that defines the expected structure of extracted data
        content_types: Optional list of content types for each URL
        strict_mode: If True, validate extracted data against schema and fail if invalid
        config: Optional configuration parameters for extraction
        
    Returns:
        Dictionary containing extraction results with schema validation info
        
    Example:
        # Define a strict schema for invoice extraction
        invoice_schema = {
            "type": "object",
            "required": ["invoice_number", "total_amount", "vendor_name"],
            "properties": {
                "invoice_number": {"type": "string"},
                "total_amount": {"type": "number", "minimum": 0},
                "vendor_name": {"type": "string"},
                "line_items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "description": {"type": "string"},
                            "quantity": {"type": "number"},
                            "unit_price": {"type": "number"}
                        }
                    }
                }
            }
        }
        
        result = await extract_with_schema(
            user_id="user123",
            file_urls=["https://s3.amazonaws.com/bucket/invoice.pdf"],
            schema=invoice_schema,
            strict_mode=True
        )
    """
    logger.info(f"Schema-guided extraction request for user {user_id}: {len(file_urls)} files")
    
    try:
        # Validate schema
        if not schema or not isinstance(schema, dict):
            raise ValueError("A valid JSON schema must be provided")
        
        # Add schema to config
        if config is None:
            config = {}
        config.update({
            "strict_mode": strict_mode,
            "schema_validation": True
        })
        
        # Perform extraction with the provided schema
        result = await extract_from_url(
            user_id=user_id,
            file_urls=file_urls,
            content_types=content_types,
            schema=schema,
            config=config
        )
        
        # If strict mode is enabled and extraction was successful, validate the data
        if strict_mode and result.get('success', False):
            try:
                from jsonschema import validate, ValidationError  # type: ignore
                
                extracted_data = result.get('extracted_data', {})
                validate(instance=extracted_data, schema=schema)
                
                # Add validation success info
                if 'metadata' not in result or result['metadata'] is None:
                    result['metadata'] = {}
                result['metadata']['schema_validation'] = {
                    "status": "passed",
                    "strict_mode": True
                }
                
            except ImportError:
                logger.warning("jsonschema library not available for validation")
                result['metadata']['schema_validation'] = {
                    "status": "skipped",
                    "reason": "jsonschema library not available"
                }
            except ValidationError as e:
                logger.warning(f"Schema validation failed for user {user_id}: {str(e)}")
                result['success'] = False
                result['error_message'] = f"Extracted data does not match schema: {str(e)}"
                result['metadata']['schema_validation'] = {
                    "status": "failed",
                    "error": str(e),
                    "strict_mode": True
                }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in schema-guided extraction for user {user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "extracted_data": {},
            "inferred_schema": None,
            "success": False,
            "error_message": f"Schema extraction error: {str(e)}",
            "metadata": {
                "user_id": user_id,
                "request_timestamp": datetime.now(timezone.utc).isoformat(),
                "error_type": "schema_extraction_error",
                "provided_schema": schema
            }
        }