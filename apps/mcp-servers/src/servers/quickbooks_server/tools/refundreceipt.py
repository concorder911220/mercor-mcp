"""
QuickBooks Refund Receipt Management Tools
Handles refund receipt creation, reading, and querying operations.
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
# CREATE REFUND RECEIPT
# ============================================================================

@mcp.tool()
async def create_quickbooks_refundreceipt(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks refund receipt.
    
    Args:
        user_id: The user ID for authentication
        parameters: Refund receipt details including:
            - line_items (required): List of line items
            - deposit_to_account_id (required): Account ID to record the refund
            - customer_id: QuickBooks Customer ID for customer refunds
            - txn_date: Refund date in YYYY-MM-DD format
            - doc_number: Refund receipt number
            - private_note: Internal memo
            - customer_memo: Message to customer
            - payment_method_id: Payment method reference ID
            - payment_ref_num: Payment reference number
    
    Returns:
        Dict containing the created refund receipt data and metadata
    """
    logger.debug("=== Create QuickBooks Refund Receipt Debug ===")
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
        line_items = parameters.get("line_items", [])
        deposit_to_account_id = parameters.get("deposit_to_account_id")
        
        if not line_items:
            raise ValueError("line_items are required")
        if not deposit_to_account_id:
            raise ValueError("deposit_to_account_id is required")
        
        logger.debug("Building refund receipt payload...")
        
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
        
        # Build refund receipt payload
        refundreceipt_data = {
            "Line": lines,
            "DepositToAccountRef": {
                "value": str(deposit_to_account_id)
            }
        }
        
        # Add optional customer reference
        if parameters.get("customer_id"):
            refundreceipt_data["CustomerRef"] = {
                "value": str(parameters["customer_id"])
            }
        
        # Add optional fields
        if parameters.get("txn_date"):
            refundreceipt_data["TxnDate"] = parameters["txn_date"]
            
        if parameters.get("doc_number"):
            refundreceipt_data["DocNumber"] = parameters["doc_number"]
            
        if parameters.get("private_note"):
            refundreceipt_data["PrivateNote"] = parameters["private_note"]
            
        if parameters.get("customer_memo"):
            refundreceipt_data["CustomerMemo"] = {
                "value": parameters["customer_memo"]
            }
            
        if parameters.get("payment_method_id"):
            refundreceipt_data["PaymentMethodRef"] = {
                "value": str(parameters["payment_method_id"])
            }
            
        if parameters.get("payment_ref_num"):
            refundreceipt_data["PaymentRefNum"] = parameters["payment_ref_num"]
        
        logger.debug(f"Built refund receipt payload: {json.dumps(refundreceipt_data, indent=2)}")
        
        logger.debug("Making QBO Refund Receipt API call...")
        result = await qbo_request(token, realm_id, "POST", "/refundreceipt", refundreceipt_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        refundreceipt = result.get("QueryResponse", {}).get("RefundReceipt", [{}])[0] if result.get("QueryResponse") else result.get("RefundReceipt", {})
        
        response = {
            "success": True,
            "refundreceipt": refundreceipt,
            "message": "Refund receipt created successfully"
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks Refund Receipt Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO Refund Receipt API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create refund receipt"
        }

# ============================================================================
# GET REFUND RECEIPT
# ============================================================================

@mcp.tool()
async def get_quickbooks_refundreceipt(user_id: str, refundreceipt_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks refund receipt by ID.
    
    Args:
        user_id: The user ID for authentication
        refundreceipt_id: QuickBooks Refund Receipt ID
    
    Returns:
        Dict containing the refund receipt details
    """
    logger.debug("=== Get QuickBooks Refund Receipt Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input refundreceipt_id: '{refundreceipt_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching refund receipt ID: {refundreceipt_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/refundreceipt/{refundreceipt_id}")
        logger.debug(f"QBO API call successful!")
        
        refundreceipt = result.get("QueryResponse", {}).get("RefundReceipt", [{}])[0] if result.get("QueryResponse") else result.get("RefundReceipt", {})
        
        response = {
            "success": True,
            "refundreceipt": refundreceipt
        }
        
        logger.debug("=== End Get QuickBooks Refund Receipt Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving refund receipt: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve refund receipt {refundreceipt_id}"
        }

# ============================================================================
# QUERY REFUND RECEIPTS
# ============================================================================

@mcp.tool()
async def query_quickbooks_refundreceipts(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks refund receipts with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including customer_id, date ranges, etc.
    
    Returns:
        Dict containing list of refund receipts matching the criteria
    """
    logger.debug("=== Query QuickBooks Refund Receipts Debug ===")
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
        query_parts = ["SELECT * FROM RefundReceipt"]
        where_conditions = []
        
        if active_only:
            where_conditions.append("Active = true")
            
        if parameters.get("customer_id"):
            where_conditions.append(f"CustomerRef = '{parameters['customer_id']}'")
            
        if parameters.get("doc_number"):
            where_conditions.append(f"DocNumber = '{parameters['doc_number']}'")
            
        if parameters.get("payment_method_id"):
            where_conditions.append(f"PaymentMethodRef = '{parameters['payment_method_id']}'")
            
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
        
        refundreceipts = result.get("QueryResponse", {}).get("RefundReceipt", [])
        
        response = {
            "success": True,
            "refundreceipts": refundreceipts,
            "count": len(refundreceipts)
        }
        
        logger.debug(f"Found {len(refundreceipts)} refund receipts")
        logger.debug("=== End Query QuickBooks Refund Receipts Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying refund receipts: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query refund receipts"
        }
