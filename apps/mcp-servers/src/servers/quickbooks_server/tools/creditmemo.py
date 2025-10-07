"""
QuickBooks Credit Memo Management Tools
Handles credit memo creation, reading, and querying operations for AR adjustments.
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
# CREATE CREDIT MEMO
# ============================================================================

@mcp.tool()
async def create_quickbooks_creditmemo(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks credit memo for AR adjustments.
    
    Args:
        user_id: The user ID for authentication
        parameters: Credit memo details including:
            - customer_id (required): QuickBooks Customer ID
            - line_items (required): List of line items
            - txn_date: Credit memo date in YYYY-MM-DD format
            - doc_number: Credit memo number
            - private_note: Internal memo
            - customer_memo: Message to customer
            - terms_ref: Payment terms reference ID
    
    Returns:
        Dict containing the created credit memo data and metadata
    """
    logger.debug("=== Create QuickBooks Credit Memo Debug ===")
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
        
        logger.debug("Building credit memo payload...")
        
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
        
        # Build credit memo payload
        creditmemo_data = {
            "Line": lines,
            "CustomerRef": {
                "value": str(customer_id)
            }
        }
        
        # Add optional fields
        if parameters.get("txn_date"):
            creditmemo_data["TxnDate"] = parameters["txn_date"]
            
        if parameters.get("doc_number"):
            creditmemo_data["DocNumber"] = parameters["doc_number"]
            
        if parameters.get("private_note"):
            creditmemo_data["PrivateNote"] = parameters["private_note"]
            
        if parameters.get("customer_memo"):
            creditmemo_data["CustomerMemo"] = {
                "value": parameters["customer_memo"]
            }
            
        if parameters.get("terms_ref"):
            creditmemo_data["SalesTermRef"] = {
                "value": str(parameters["terms_ref"])
            }
        
        logger.debug(f"Built credit memo payload: {json.dumps(creditmemo_data, indent=2)}")
        
        logger.debug("Making QBO Credit Memo API call...")
        result = await qbo_request(token, realm_id, "POST", "/creditmemo", creditmemo_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        creditmemo = result.get("QueryResponse", {}).get("CreditMemo", [{}])[0] if result.get("QueryResponse") else result.get("CreditMemo", {})
        
        response = {
            "success": True,
            "creditmemo": creditmemo,
            "message": "Credit memo created successfully"
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks Credit Memo Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO Credit Memo API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create credit memo"
        }

# ============================================================================
# GET CREDIT MEMO
# ============================================================================

@mcp.tool()
async def get_quickbooks_creditmemo(user_id: str, creditmemo_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks credit memo by ID.
    
    Args:
        user_id: The user ID for authentication
        creditmemo_id: QuickBooks Credit Memo ID
    
    Returns:
        Dict containing the credit memo details
    """
    logger.debug("=== Get QuickBooks Credit Memo Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input creditmemo_id: '{creditmemo_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching credit memo ID: {creditmemo_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/creditmemo/{creditmemo_id}")
        logger.debug(f"QBO API call successful!")
        
        creditmemo = result.get("QueryResponse", {}).get("CreditMemo", [{}])[0] if result.get("QueryResponse") else result.get("CreditMemo", {})
        
        response = {
            "success": True,
            "creditmemo": creditmemo
        }
        
        logger.debug("=== End Get QuickBooks Credit Memo Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving credit memo: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve credit memo {creditmemo_id}"
        }

# ============================================================================
# QUERY CREDIT MEMOS
# ============================================================================

@mcp.tool()
async def query_quickbooks_creditmemos(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks credit memos with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including customer_id, date ranges, etc.
    
    Returns:
        Dict containing list of credit memos matching the criteria
    """
    logger.debug("=== Query QuickBooks Credit Memos Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    active_only = parameters.get("active_only", True)
    max_results = parameters.get("max_results", 20)
    
    logger.debug(f"Active only: {active_only}")
    logger.debug(f"Max results: {max_results}")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build query
        query_parts = ["SELECT * FROM CreditMemo"]
        where_conditions = []
        
        if active_only:
            where_conditions.append("Active = true")
            
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
        
        creditmemos = result.get("QueryResponse", {}).get("CreditMemo", [])
        
        response = {
            "success": True,
            "creditmemos": creditmemos,
            "count": len(creditmemos)
        }
        
        logger.debug(f"Found {len(creditmemos)} credit memos")
        logger.debug("=== End Query QuickBooks Credit Memos Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying credit memos: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query credit memos"
        }
