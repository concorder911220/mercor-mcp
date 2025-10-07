#!/usr/bin/env python3
"""
Schema Operations Tools

Provides utilities for working with JSON schemas in document extraction,
including schema inference, validation, and transformation operations.

This implementation uses direct extractor calls instead of HTTP requests.
"""

import logging
import traceback
import json
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone

# Import our extractor
from ..extractor import get_extractor

# Set up logging
logger = logging.getLogger(__name__)

# =============================================================================
# Schema Utilities
# =============================================================================

def merge_schemas(schema1: Dict[str, Any], schema2: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge two JSON schemas into a combined schema.
    
    Args:
        schema1: First JSON schema
        schema2: Second JSON schema
        
    Returns:
        Merged JSON schema
    """
    # Simple merge logic - this could be enhanced for more complex cases
    merged = schema1.copy()
    
    if 'properties' in schema1 and 'properties' in schema2:
        merged['properties'] = {**schema1['properties'], **schema2['properties']}
    
    if 'required' in schema1 and 'required' in schema2:
        merged['required'] = list(set(schema1['required'] + schema2['required']))
    elif 'required' in schema2:
        merged['required'] = schema2['required']
    
    return merged

def simplify_schema(schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simplify a complex JSON schema by removing advanced validation rules.
    
    Args:
        schema: JSON schema to simplify
        
    Returns:
        Simplified JSON schema
    """
    simplified = {}
    
    for key, value in schema.items():
        if key in ['type', 'properties', 'items', 'required']:
            if key == 'properties' and isinstance(value, dict):
                simplified[key] = {
                    prop: simplify_schema(prop_schema) if isinstance(prop_schema, dict) else prop_schema
                    for prop, prop_schema in value.items()
                }
            elif key == 'items' and isinstance(value, dict):
                simplified[key] = simplify_schema(value)
            else:
                simplified[key] = value
    
    return simplified

# =============================================================================
# Helper Functions (from document_extraction.py)
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
    """Detect content type from filename extension or use provided type."""
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
    import os
    ext = os.path.splitext(filename.lower())[1]
    return extension_map.get(ext, 'application/octet-stream')

# =============================================================================
# MCP Tool Registration
# =============================================================================

from ..server import mcp

@mcp.tool(description="Infer JSON schema from document URLs without extracting data")
async def infer_document_schema(
    user_id: str,
    file_urls: List[str],
    content_types: Optional[List[str]] = None,
    merge_schemas_flag: bool = True
) -> Dict[str, Any]:
    """
    Analyze documents and infer their JSON schema without performing full extraction.
    
    This tool is useful for understanding document structure before performing
    extraction, or for building reusable schemas for similar document types.
    
    Args:
        user_id: User identifier for authentication
        file_urls: List of URLs pointing to documents to analyze
        content_types: Optional list of content types for each URL
        merge_schemas_flag: If True and multiple files provided, merge their schemas
        
    Returns:
        Dictionary containing:
        - inferred_schema: The JSON schema inferred from documents
        - success: Boolean indicating if inference was successful
        - error_message: Error details if inference failed
        - metadata: Additional processing information including per-file schemas
        
    Example:
        # Infer schema from multiple invoice documents
        result = await infer_document_schema(
            user_id="user123",
            file_urls=[
                "https://s3.amazonaws.com/bucket/invoice1.pdf",
                "https://s3.amazonaws.com/bucket/invoice2.pdf"
            ],
            merge_schemas_flag=True
        )
        
        # Use the inferred schema for consistent extraction
        schema = result['inferred_schema']
    """
    logger.info(f"Schema inference request for user {user_id}: {len(file_urls)} files")
    
    try:
        # Validate inputs
        if not file_urls or not isinstance(file_urls, list):
            raise ValueError("file_urls must be a non-empty list")
            
        if len(file_urls) > 5:  # Reasonable limit for schema inference
            raise ValueError("Too many files for schema inference (max 5)")
            
        # Validate all URLs
        for url in file_urls:
            if not validate_file_url(url):
                raise ValueError(f"Invalid URL provided: {url}")
        
        schemas = []
        file_metadata = []
        
        # Process each file for schema inference
        for i, url in enumerate(file_urls):
            try:
                # Use provided content type or detect from URL
                if content_types and i < len(content_types):
                    content_type = content_types[i]
                else:
                    filename = url.split('/')[-1] if '/' in url else url
                    content_type = detect_content_type(filename)
                
                file_data = [{
                    "url": url,
                    "content_type": content_type
                }]
                
                # Get extractor and perform schema inference
                extractor = get_extractor()
                result = extractor.infer_schema_only(
                    file_urls=file_data,
                    user_id=user_id
                )
                
                if result.success and result.inferred_schema:
                    schemas.append(result.inferred_schema)
                    file_metadata.append({
                        "url": url,
                        "content_type": content_type,
                        "schema": result.inferred_schema
                    })
                else:
                    logger.warning(f"Schema inference failed for {url}: {result.error_message}")
                    file_metadata.append({
                        "url": url,
                        "content_type": content_type,
                        "error": result.error_message or 'Schema inference failed'
                    })
                    
            except Exception as e:
                logger.error(f"Error processing file {url} for schema inference: {str(e)}")
                file_metadata.append({
                    "url": url,
                    "content_type": content_type if 'content_type' in locals() else "unknown",
                    "error": str(e)
                })
        
        # Determine final schema
        if not schemas:
            return {
                "inferred_schema": None,
                "success": False,
                "error_message": "Could not infer schema from any of the provided files",
                "metadata": {
                    "user_id": user_id,
                    "request_timestamp": datetime.now(timezone.utc).isoformat(),
                    "files_processed": file_metadata,
                    "merge_schemas": merge_schemas_flag
                }
            }
        
        # Merge schemas if requested and multiple schemas exist
        if merge_schemas_flag and len(schemas) > 1:
            final_schema = schemas[0]
            for schema in schemas[1:]:
                final_schema = merge_schemas(final_schema, schema)
        else:
            final_schema = schemas[0]  # Use first successful schema
        
        return {
            "inferred_schema": final_schema,
            "success": True,
            "error_message": None,
            "metadata": {
                "user_id": user_id,
                "request_timestamp": datetime.now(timezone.utc).isoformat(),
                "files_processed": file_metadata,
                "merge_schemas": merge_schemas_flag,
                "schemas_found": len(schemas),
                "individual_schemas": schemas if not merge_schemas_flag else None
            }
        }
        
    except Exception as e:
        logger.error(f"Error in schema inference for user {user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "inferred_schema": None,
            "success": False,
            "error_message": f"Schema inference error: {str(e)}",
            "metadata": {
                "user_id": user_id,
                "request_timestamp": datetime.now(timezone.utc).isoformat(),
                "error_type": "schema_inference_error"
            }
        }

@mcp.tool(description="Validate extracted data against a JSON schema")
async def validate_extracted_data(
    user_id: str,
    extracted_data: Dict[str, Any],
    schema: Dict[str, Any],
    strict_validation: bool = True
) -> Dict[str, Any]:
    """
    Validate extracted data against a JSON schema for quality assurance.
    
    This tool is useful for verifying extraction quality and ensuring data
    consistency before using extracted information in downstream processes.
    
    Args:
        user_id: User identifier for logging
        extracted_data: The data to validate
        schema: JSON schema to validate against
        strict_validation: If True, use strict validation rules
        
    Returns:
        Dictionary containing:
        - valid: Boolean indicating if data is valid
        - errors: List of validation errors if any
        - warnings: List of validation warnings
        - success: Boolean indicating if validation completed
        - metadata: Validation details and statistics
        
    Example:
        # Validate extracted invoice data
        result = await validate_extracted_data(
            user_id="user123",
            extracted_data={
                "invoice_number": "INV-001",
                "total_amount": 1250.00,
                "vendor_name": "Acme Corp"
            },
            schema={
                "type": "object",
                "required": ["invoice_number", "total_amount", "vendor_name"],
                "properties": {
                    "invoice_number": {"type": "string"},
                    "total_amount": {"type": "number", "minimum": 0},
                    "vendor_name": {"type": "string"}
                }
            }
        )
    """
    logger.info(f"Data validation request for user {user_id}")
    
    try:
        # Validate inputs
        if not isinstance(extracted_data, dict):
            raise ValueError("extracted_data must be a dictionary")
        
        if not isinstance(schema, dict):
            raise ValueError("schema must be a valid JSON schema dictionary")
        
        errors = []
        warnings = []
        
        try:
            from jsonschema import validate, ValidationError, Draft7Validator  # type: ignore
            
            # Create validator
            validator = Draft7Validator(schema)
            
            # Validate the data
            validation_errors = list(validator.iter_errors(extracted_data))
            
            if validation_errors:
                for error in validation_errors:
                    error_info = {
                        "path": " -> ".join(str(p) for p in error.absolute_path),
                        "message": error.message,
                        "failed_value": error.instance,
                        "schema_path": " -> ".join(str(p) for p in error.schema_path)
                    }
                    errors.append(error_info)
            
            # Additional custom validations
            if strict_validation:
                # Check for required fields
                required_fields = schema.get('required', [])
                for field in required_fields:
                    if field not in extracted_data:
                        errors.append({
                            "path": field,
                            "message": f"Required field '{field}' is missing",
                            "failed_value": None,
                            "schema_path": "required"
                        })
                
                # Check for unexpected fields if additionalProperties is False
                if schema.get('additionalProperties') is False:
                    allowed_properties = set(schema.get('properties', {}).keys())
                    actual_properties = set(extracted_data.keys())
                    unexpected = actual_properties - allowed_properties
                    
                    for prop in unexpected:
                        warnings.append({
                            "path": prop,
                            "message": f"Unexpected property '{prop}' found",
                            "value": extracted_data[prop]
                        })
            
        except ImportError:
            # Fallback validation without jsonschema library
            logger.warning("jsonschema library not available, using basic validation")
            
            # Basic type checking
            properties = schema.get('properties', {})
            for prop, prop_schema in properties.items():
                if prop in extracted_data:
                    expected_type = prop_schema.get('type')
                    actual_value = extracted_data[prop]
                    
                    if expected_type == 'string' and not isinstance(actual_value, str):
                        errors.append({
                            "path": prop,
                            "message": f"Expected string, got {type(actual_value).__name__}",
                            "failed_value": actual_value,
                            "schema_path": f"properties.{prop}.type"
                        })
                    elif expected_type == 'number' and not isinstance(actual_value, (int, float)):
                        errors.append({
                            "path": prop,
                            "message": f"Expected number, got {type(actual_value).__name__}",
                            "failed_value": actual_value,
                            "schema_path": f"properties.{prop}.type"
                        })
                    elif expected_type == 'boolean' and not isinstance(actual_value, bool):
                        errors.append({
                            "path": prop,
                            "message": f"Expected boolean, got {type(actual_value).__name__}",
                            "failed_value": actual_value,
                            "schema_path": f"properties.{prop}.type"
                        })
                    elif expected_type == 'array' and not isinstance(actual_value, list):
                        errors.append({
                            "path": prop,
                            "message": f"Expected array, got {type(actual_value).__name__}",
                            "failed_value": actual_value,
                            "schema_path": f"properties.{prop}.type"
                        })
                    elif expected_type == 'object' and not isinstance(actual_value, dict):
                        errors.append({
                            "path": prop,
                            "message": f"Expected object, got {type(actual_value).__name__}",
                            "failed_value": actual_value,
                            "schema_path": f"properties.{prop}.type"
                        })
        
        # Calculate validation statistics
        total_properties = len(schema.get('properties', {}))
        validated_properties = len([p for p in schema.get('properties', {}) if p in extracted_data])
        coverage_percentage = (validated_properties / total_properties * 100) if total_properties > 0 else 0
        
        is_valid = len(errors) == 0
        
        return {
            "valid": is_valid,
            "errors": errors,
            "warnings": warnings,
            "success": True,
            "metadata": {
                "user_id": user_id,
                "validation_timestamp": datetime.now(timezone.utc).isoformat(),
                "strict_validation": strict_validation,
                "total_errors": len(errors),
                "total_warnings": len(warnings),
                "schema_coverage": {
                    "total_properties": total_properties,
                    "validated_properties": validated_properties,
                    "coverage_percentage": round(coverage_percentage, 2)
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error in data validation for user {user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "valid": False,
            "errors": [{"message": f"Validation error: {str(e)}"}],
            "warnings": [],
            "success": False,
            "metadata": {
                "user_id": user_id,
                "validation_timestamp": datetime.now(timezone.utc).isoformat(),
                "error_type": "validation_system_error"
            }
        }