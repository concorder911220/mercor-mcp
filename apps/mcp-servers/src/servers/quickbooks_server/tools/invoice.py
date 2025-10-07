"""
QuickBooks Invoice Management Tools
Handles invoice creation, reading, updating, and querying operations.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from fastmcp import FastMCP
from ..utils.auth import get_user_qbo_token, get_qbo_realm_id
from ..utils.qbo import qbo_request, qbo_query

logger = logging.getLogger(__name__)

# Get the MCP instance from the server module
from ..server import mcp

# ============================================================================
# CREATE INVOICE
# ============================================================================

@mcp.tool()
async def create_quickbooks_invoice(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks invoice.
    
    Args:
        user_id: The user ID for authentication
        parameters: Invoice details including:
            - customer_id (required): QuickBooks Customer ID
            - line_items (required): List of line items, each containing:
              - amount: Line item amount (number, required)
              - item_id: QuickBooks Item ID (string, optional if using description)
              - description: Line item description (string, optional)
              - quantity: Quantity (number, optional, default 1)
            - due_date: Invoice due date in YYYY-MM-DD format (string)
            - doc_number: Invoice number (string, auto-generated if not provided)
            - private_note: Internal memo (string)
            - customer_memo: Message to customer (string)
            - terms_ref: Payment terms reference ID (string)
            - deposit_to_account_id: Account ID for deposit (string)
    
    Returns:
        Dict containing the created invoice data and metadata
    """
    logger.debug("=== Create QuickBooks Invoice Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters type: {type(parameters)}")
    logger.debug(f"Input parameters: {parameters}")
    
    # Handle empty parameters
    if parameters is None:
        logger.debug("Parameters was None, using empty dict")
        parameters = {}
    
    try:
        logger.debug("Getting QBO token...")
        token = await get_user_qbo_token(user_id)
        logger.debug(f"Got token: {len(token)} chars")
        
        logger.debug("Getting QBO realm_id...")
        realm_id = await get_qbo_realm_id(user_id)
        logger.debug(f"Got realm_id: {realm_id}")
        
        # Validate required parameters
        customer_id = parameters.get("customer_id")
        line_items = parameters.get("line_items", [])
        
        if not customer_id:
            raise ValueError("customer_id is required")
        if not line_items:
            raise ValueError("line_items are required")
        
        logger.debug("Building invoice payload...")
        
        # Build line items
        lines = []
        for idx, item in enumerate(line_items):
            amount = item.get("amount")
            if not amount:
                raise ValueError(f"Line item {idx + 1}: amount is required")
                
            line = {
                "Amount": float(amount),
                "DetailType": "SalesItemLineDetail",
                "SalesItemLineDetail": {}
            }
            
            # Add item reference if provided
            if item.get("item_id"):
                line["SalesItemLineDetail"]["ItemRef"] = {
                    "value": str(item["item_id"])
                }
            
            # Add description if provided
            if item.get("description"):
                line["Description"] = item["description"]
                
            # Add quantity if provided
            if item.get("quantity"):
                line["SalesItemLineDetail"]["Qty"] = float(item["quantity"])
                line["SalesItemLineDetail"]["UnitPrice"] = float(amount) / float(item["quantity"])
            
            lines.append(line)
        
        # Build invoice payload
        invoice_data = {
            "Line": lines,
            "CustomerRef": {
                "value": str(customer_id)
            }
        }
        
        # Add optional fields
        if parameters.get("due_date"):
            invoice_data["DueDate"] = parameters["due_date"]
            
        if parameters.get("doc_number"):
            invoice_data["DocNumber"] = parameters["doc_number"]
            
        if parameters.get("private_note"):
            invoice_data["PrivateNote"] = parameters["private_note"]
            
        if parameters.get("customer_memo"):
            invoice_data["CustomerMemo"] = {
                "value": parameters["customer_memo"]
            }
            
        if parameters.get("terms_ref"):
            invoice_data["SalesTermRef"] = {
                "value": str(parameters["terms_ref"])
            }
        
        if parameters.get("deposit_to_account_id"):
            invoice_data["DepositToAccountRef"] = {
                "value": str(parameters["deposit_to_account_id"])
            }
        
        logger.debug(f"Built invoice payload: {json.dumps(invoice_data, indent=2)}")
        
        logger.debug("Making QBO Invoice API call...")
        result = await qbo_request(token, realm_id, "POST", "/invoice", invoice_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        invoice = result.get("QueryResponse", {}).get("Invoice", [{}])[0] if result.get("QueryResponse") else result.get("Invoice", {})
        
        response = {
            "success": True,
            "invoice": invoice,
            "message": "Invoice created successfully"
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks Invoice Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO Invoice API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create invoice"
        }

# ============================================================================
# GET INVOICE
# ============================================================================

@mcp.tool()
async def get_quickbooks_invoice(user_id: str, invoice_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks invoice by ID.
    
    Args:
        user_id: The user ID for authentication
        invoice_id: QuickBooks Invoice ID
    
    Returns:
        Dict containing the invoice details
    """
    logger.debug("=== Get QuickBooks Invoice Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input invoice_id: '{invoice_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching invoice ID: {invoice_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/invoice/{invoice_id}")
        logger.debug(f"QBO API call successful!")
        
        invoice = result.get("QueryResponse", {}).get("Invoice", [{}])[0] if result.get("QueryResponse") else result.get("Invoice", {})
        
        response = {
            "success": True,
            "invoice": invoice
        }
        
        logger.debug("=== End Get QuickBooks Invoice Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving invoice: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve invoice {invoice_id}"
        }

# ============================================================================
# QUERY INVOICES
# ============================================================================

@mcp.tool()
async def query_quickbooks_invoices(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks invoices with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including:
            - customer_id: Filter by customer ID
            - start_date: Filter invoices from this date, YYYY-MM-DD format
            - end_date: Filter invoices to this date, YYYY-MM-DD format
            - doc_number: Filter by invoice number
            - active_only: Include only active invoices (default true)
            - max_results: Maximum number of results to return (default 20)
    
    Returns:
        Dict containing list of invoices matching the criteria
    """
    logger.debug("=== Query QuickBooks Invoices Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    max_results = parameters.get("max_results", 20)
    
    logger.debug(f"Max results: {max_results}")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build query
        query_parts = ["SELECT * FROM Invoice"]
        where_conditions = []
        
        # Note: Invoice entity doesn't have an Active field, so we skip this filter for invoices
            
        if parameters.get("customer_id"):
            where_conditions.append(f"CustomerRef = '{parameters['customer_id']}'")
            
        if parameters.get("doc_number"):
            where_conditions.append(f"DocNumber = '{parameters['doc_number']}'")
            
        if parameters.get("start_date"):
            where_conditions.append(f"TxnDate >= '{parameters['start_date']}'")
            
        if parameters.get("end_date"):
            where_conditions.append(f"TxnDate <= '{parameters['end_date']}'")
        
        if where_conditions:
            query_parts.append("WHERE " + " AND ".join(where_conditions))
            
        query_parts.append(f"MAXRESULTS {max_results}")
        
        query = " ".join(query_parts)
        logger.debug(f"Query: {query}")
        
        result = await qbo_query(token, realm_id, query)
        
        invoices = result.get("QueryResponse", {}).get("Invoice", [])
        
        response = {
            "success": True,
            "invoices": invoices,
            "count": len(invoices)
        }
        
        logger.debug(f"Found {len(invoices)} invoices")
        logger.debug("=== End Query QuickBooks Invoices Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying invoices: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query invoices"
        }

# ============================================================================
# UPDATE INVOICE
# ============================================================================

@mcp.tool()
async def update_quickbooks_invoice(user_id: str, invoice_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Update an existing QuickBooks invoice.
    
    Args:
        user_id: The user ID for authentication
        invoice_id: QuickBooks Invoice ID to update
        parameters: Updated invoice details (only include fields to update)
    
    Returns:
        Dict containing the updated invoice details
    """
    logger.debug("=== Update QuickBooks Invoice Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input invoice_id: '{invoice_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    # Handle empty parameters
    if parameters is None:
        logger.debug("Parameters was None, using empty dict")
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # First, get the existing invoice to get the current sync token
        logger.debug("Fetching existing invoice data...")
        existing_result = await qbo_request(token, realm_id, "GET", f"/invoice/{invoice_id}")
        existing_invoice = existing_result.get("QueryResponse", {}).get("Invoice", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("Invoice", {})
        
        if not existing_invoice:
            raise ValueError(f"Invoice with ID {invoice_id} not found")
        
        # Build update payload starting with existing invoice
        update_data = existing_invoice.copy()
        
        # Update fields as specified
        if parameters.get("line_items"):
            lines = []
            for idx, item in enumerate(parameters["line_items"]):
                amount = item.get("amount")
                if not amount:
                    raise ValueError(f"Line item {idx + 1}: amount is required")
                    
                line = {
                    "Amount": float(amount),
                    "DetailType": "SalesItemLineDetail",
                    "SalesItemLineDetail": {}
                }
                
                if item.get("item_id"):
                    line["SalesItemLineDetail"]["ItemRef"] = {
                        "value": str(item["item_id"])
                    }
                
                if item.get("description"):
                    line["Description"] = item["description"]
                    
                if item.get("quantity"):
                    line["SalesItemLineDetail"]["Qty"] = float(item["quantity"])
                    line["SalesItemLineDetail"]["UnitPrice"] = float(amount) / float(item["quantity"])
                
                lines.append(line)
            update_data["Line"] = lines
        
        if parameters.get("due_date"):
            update_data["DueDate"] = parameters["due_date"]
            
        if parameters.get("doc_number"):
            update_data["DocNumber"] = parameters["doc_number"]
            
        if parameters.get("private_note"):
            update_data["PrivateNote"] = parameters["private_note"]
            
        if parameters.get("customer_memo"):
            update_data["CustomerMemo"] = {
                "value": parameters["customer_memo"]
            }
            
        if parameters.get("terms_ref"):
            update_data["SalesTermRef"] = {
                "value": str(parameters["terms_ref"])
            }
        
        logger.debug("Making QBO Invoice update API call...")
        result = await qbo_request(token, realm_id, "POST", "/invoice", update_data)
        logger.debug(f"QBO API call successful!")
        
        invoice = result.get("QueryResponse", {}).get("Invoice", [{}])[0] if result.get("QueryResponse") else result.get("Invoice", {})
        
        response = {
            "success": True,
            "invoice": invoice,
            "message": "Invoice updated successfully"
        }
        
        logger.debug("=== End Update QuickBooks Invoice Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error updating invoice: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to update invoice {invoice_id}"
        }
