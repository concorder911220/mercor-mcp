"""
QuickBooks Bill Management Tools
Handles bill creation, reading, updating, and querying operations for Accounts Payable.
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
# CREATE BILL
# ============================================================================

@mcp.tool()
async def create_quickbooks_bill(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks bill for vendor invoices (Accounts Payable).
    
    Args:
        user_id: The user ID for authentication
        parameters: Bill details including:
            - vendor_id (required): QuickBooks Vendor ID
            - line_items (required): List of line items, each containing:
              - amount: Line item amount (number, required)
              - account_id: QuickBooks Account ID for expense (string, required)
              - description: Line item description (string, optional)
              - billable_status: Billable status (string, optional)
              - customer_id: Customer ID if billable (string, optional)
            - due_date: Bill due date in YYYY-MM-DD format (string)
            - txn_date: Bill date in YYYY-MM-DD format (string)
            - doc_number: Bill/reference number (string)
            - private_note: Internal memo (string)
            - ap_account_id: Accounts Payable account ID (string)
    
    Returns:
        Dict containing the created bill data and metadata
    """
    logger.debug("=== Create QuickBooks Bill Debug ===")
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
        vendor_id = parameters.get("vendor_id")
        line_items = parameters.get("line_items", [])
        
        if not vendor_id:
            raise ValueError("vendor_id is required")
        if not line_items:
            raise ValueError("line_items are required")
        
        logger.debug("Building bill payload...")
        
        # Build line items
        lines = []
        for idx, item in enumerate(line_items):
            amount = item.get("amount")
            account_id = item.get("account_id")
            if not amount:
                raise ValueError(f"Line item {idx + 1}: amount is required")
            if not account_id:
                raise ValueError(f"Line item {idx + 1}: account_id is required")
                
            line = {
                "Amount": float(amount),
                "DetailType": "AccountBasedExpenseLineDetail",
                "AccountBasedExpenseLineDetail": {
                    "AccountRef": {
                        "value": str(account_id)
                    }
                }
            }
            
            # Add description if provided
            if item.get("description"):
                line["Description"] = item["description"]
                
            # Add billable status and customer if provided
            if item.get("billable_status"):
                line["AccountBasedExpenseLineDetail"]["BillableStatus"] = item["billable_status"]
                
            if item.get("customer_id"):
                line["AccountBasedExpenseLineDetail"]["CustomerRef"] = {
                    "value": str(item["customer_id"])
                }
            
            lines.append(line)
        
        # Build bill payload
        bill_data = {
            "Line": lines,
            "VendorRef": {
                "value": str(vendor_id)
            }
        }
        
        # Add optional fields
        if parameters.get("due_date"):
            bill_data["DueDate"] = parameters["due_date"]
            
        if parameters.get("txn_date"):
            bill_data["TxnDate"] = parameters["txn_date"]
            
        if parameters.get("doc_number"):
            bill_data["DocNumber"] = parameters["doc_number"]
            
        if parameters.get("private_note"):
            bill_data["PrivateNote"] = parameters["private_note"]
            
        if parameters.get("ap_account_id"):
            bill_data["APAccountRef"] = {
                "value": str(parameters["ap_account_id"])
            }
        
        logger.debug(f"Built bill payload: {json.dumps(bill_data, indent=2)}")
        
        logger.debug("Making QBO Bill API call...")
        result = await qbo_request(token, realm_id, "POST", "/bill", bill_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        bill = result.get("QueryResponse", {}).get("Bill", [{}])[0] if result.get("QueryResponse") else result.get("Bill", {})
        
        response = {
            "success": True,
            "bill": bill,
            "message": "Bill created successfully"
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks Bill Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO Bill API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create bill"
        }

# ============================================================================
# GET BILL
# ============================================================================

@mcp.tool()
async def get_quickbooks_bill(user_id: str, bill_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks bill by ID.
    
    Args:
        user_id: The user ID for authentication
        bill_id: QuickBooks Bill ID
    
    Returns:
        Dict containing the bill details
    """
    logger.debug("=== Get QuickBooks Bill Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input bill_id: '{bill_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching bill ID: {bill_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/bill/{bill_id}")
        logger.debug(f"QBO API call successful!")
        
        bill = result.get("QueryResponse", {}).get("Bill", [{}])[0] if result.get("QueryResponse") else result.get("Bill", {})
        
        response = {
            "success": True,
            "bill": bill
        }
        
        logger.debug("=== End Get QuickBooks Bill Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving bill: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve bill {bill_id}"
        }

# ============================================================================
# QUERY BILLS
# ============================================================================

@mcp.tool()
async def query_quickbooks_bills(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks bills with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including:
            - vendor_id: Filter by vendor ID
            - start_date: Filter bills from this date, YYYY-MM-DD format
            - end_date: Filter bills to this date, YYYY-MM-DD format
            - doc_number: Filter by bill number
            - max_results: Maximum number of results to return (default 20)
    
    Returns:
        Dict containing list of bills matching the criteria
    """
    logger.debug("=== Query QuickBooks Bills Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    max_results = parameters.get("max_results", 20)
    logger.debug(f"Max results: {max_results}")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build query
        query_parts = ["SELECT * FROM Bill"]
        where_conditions = []
        
        if parameters.get("vendor_id"):
            where_conditions.append(f"VendorRef = '{parameters['vendor_id']}'")
            
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
        
        bills = result.get("QueryResponse", {}).get("Bill", [])
        
        response = {
            "success": True,
            "bills": bills,
            "count": len(bills)
        }
        
        logger.debug(f"Found {len(bills)} bills")
        logger.debug("=== End Query QuickBooks Bills Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying bills: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query bills"
        }

# ============================================================================
# UPDATE BILL
# ============================================================================

@mcp.tool()
async def update_quickbooks_bill(user_id: str, bill_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Update an existing QuickBooks bill.
    
    Args:
        user_id: The user ID for authentication
        bill_id: QuickBooks Bill ID to update
        parameters: Updated bill details (only include fields to update)
    
    Returns:
        Dict containing the updated bill details
    """
    logger.debug("=== Update QuickBooks Bill Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input bill_id: '{bill_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    # Handle empty parameters
    if parameters is None:
        logger.debug("Parameters was None, using empty dict")
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # First, get the existing bill to get the current sync token
        logger.debug("Fetching existing bill data...")
        existing_result = await qbo_request(token, realm_id, "GET", f"/bill/{bill_id}")
        existing_bill = existing_result.get("QueryResponse", {}).get("Bill", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("Bill", {})
        
        if not existing_bill:
            raise ValueError(f"Bill with ID {bill_id} not found")
        
        # Build update payload starting with existing bill
        update_data = existing_bill.copy()
        
        # Update fields as specified
        if parameters.get("line_items"):
            lines = []
            for idx, item in enumerate(parameters["line_items"]):
                amount = item.get("amount")
                account_id = item.get("account_id")
                if not amount:
                    raise ValueError(f"Line item {idx + 1}: amount is required")
                if not account_id:
                    raise ValueError(f"Line item {idx + 1}: account_id is required")
                    
                line = {
                    "Amount": float(amount),
                    "DetailType": "AccountBasedExpenseLineDetail",
                    "AccountBasedExpenseLineDetail": {
                        "AccountRef": {
                            "value": str(account_id)
                        }
                    }
                }
                
                if item.get("description"):
                    line["Description"] = item["description"]
                    
                if item.get("billable_status"):
                    line["AccountBasedExpenseLineDetail"]["BillableStatus"] = item["billable_status"]
                    
                if item.get("customer_id"):
                    line["AccountBasedExpenseLineDetail"]["CustomerRef"] = {
                        "value": str(item["customer_id"])
                    }
                
                lines.append(line)
            update_data["Line"] = lines
        
        if parameters.get("due_date"):
            update_data["DueDate"] = parameters["due_date"]
            
        if parameters.get("txn_date"):
            update_data["TxnDate"] = parameters["txn_date"]
            
        if parameters.get("doc_number"):
            update_data["DocNumber"] = parameters["doc_number"]
            
        if parameters.get("private_note"):
            update_data["PrivateNote"] = parameters["private_note"]
        
        logger.debug("Making QBO Bill update API call...")
        result = await qbo_request(token, realm_id, "POST", "/bill", update_data)
        logger.debug(f"QBO API call successful!")
        
        bill = result.get("QueryResponse", {}).get("Bill", [{}])[0] if result.get("QueryResponse") else result.get("Bill", {})
        
        response = {
            "success": True,
            "bill": bill,
            "message": "Bill updated successfully"
        }
        
        logger.debug("=== End Update QuickBooks Bill Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error updating bill: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to update bill {bill_id}"
        }
