"""
QuickBooks Payment Management Tools
Handles payment creation, reading, and querying operations.
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
# CREATE PAYMENT
# ============================================================================

@mcp.tool()
async def create_quickbooks_payment(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks payment record.
    
    Args:
        user_id: The user ID for authentication
        parameters: Payment details including:
            - customer_id (required): QuickBooks Customer ID
            - total_amount (required): Total payment amount
            - invoice_id: Invoice ID to apply payment to
            - payment_method: Payment method reference ID
            - deposit_to_account_id: Account ID to deposit payment
            - txn_date: Payment date in YYYY-MM-DD format
            - reference_number: Payment reference/check number
            - private_note: Internal memo
            - unapplied_amount: Amount to leave unapplied (defaults to 0)
    
    Returns:
        Dict containing the created payment data and metadata
    """
    logger.debug("=== Create QuickBooks Payment Debug ===")
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
        total_amount = parameters.get("total_amount")
        
        if not customer_id:
            raise ValueError("customer_id is required")
        if not total_amount:
            raise ValueError("total_amount is required")
        
        logger.debug("Building payment payload...")
        
        # Build payment payload
        payment_data = {
            "CustomerRef": {
                "value": str(customer_id)
            },
            "TotalAmt": float(total_amount)
        }
        
        # Add optional transaction date
        if parameters.get("txn_date"):
            payment_data["TxnDate"] = parameters["txn_date"]
        
        # Add payment method if provided
        if parameters.get("payment_method"):
            payment_data["PaymentMethodRef"] = {
                "value": str(parameters["payment_method"])
            }
            
        # Add deposit account if provided
        if parameters.get("deposit_to_account_id"):
            payment_data["DepositToAccountRef"] = {
                "value": str(parameters["deposit_to_account_id"])
            }
            
        # Add reference number if provided
        if parameters.get("reference_number"):
            payment_data["PaymentRefNum"] = parameters["reference_number"]
            
        # Add private note if provided
        if parameters.get("private_note"):
            payment_data["PrivateNote"] = parameters["private_note"]
        
        # Handle line items for applied/unapplied payments
        lines = []
        
        invoice_id = parameters.get("invoice_id")
        unapplied_amount = parameters.get("unapplied_amount", 0)
        
        if invoice_id:
            # Applied payment to specific invoice
            applied_amount = float(total_amount) - float(unapplied_amount)
            if applied_amount > 0:
                lines.append({
                    "Amount": applied_amount,
                    "LinkedTxn": [{
                        "TxnId": str(invoice_id),
                        "TxnType": "Invoice"
                    }]
                })
        
        # Add unapplied amount if any
        if unapplied_amount > 0:
            lines.append({
                "Amount": float(unapplied_amount)
            })
        
        # If no specific line items, create a general unapplied line
        if not lines:
            lines.append({
                "Amount": float(total_amount),
                "LinkedTxn": []  # Empty array for unapplied payments
            })
        
        payment_data["Line"] = lines
        
        logger.debug(f"Built payment payload: {json.dumps(payment_data, indent=2)}")
        
        logger.debug("Making QBO Payment API call...")
        result = await qbo_request(token, realm_id, "POST", "/payment", payment_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        payment = result.get("QueryResponse", {}).get("Payment", [{}])[0] if result.get("QueryResponse") else result.get("Payment", {})
        
        response = {
            "success": True,
            "payment": payment,
            "message": "Payment created successfully"
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks Payment Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO Payment API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create payment"
        }

# ============================================================================
# GET PAYMENT
# ============================================================================

@mcp.tool()
async def get_quickbooks_payment(user_id: str, payment_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks payment by ID.
    
    Args:
        user_id: The user ID for authentication
        payment_id: QuickBooks Payment ID
    
    Returns:
        Dict containing the payment details
    """
    logger.debug("=== Get QuickBooks Payment Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input payment_id: '{payment_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching payment ID: {payment_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/payment/{payment_id}")
        logger.debug(f"QBO API call successful!")
        
        payment = result.get("QueryResponse", {}).get("Payment", [{}])[0] if result.get("QueryResponse") else result.get("Payment", {})
        
        response = {
            "success": True,
            "payment": payment
        }
        
        logger.debug("=== End Get QuickBooks Payment Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving payment: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve payment {payment_id}"
        }

# ============================================================================
# QUERY PAYMENTS
# ============================================================================

@mcp.tool()
async def query_quickbooks_payments(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks payments with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including:
            - customer_id: Filter by customer ID
            - start_date: Filter payments from this date, YYYY-MM-DD format
            - end_date: Filter payments to this date, YYYY-MM-DD format
            - payment_method_id: Filter by payment method ID
            - max_results: Maximum number of results to return (default 20)
    
    Returns:
        Dict containing list of payments matching the criteria
    """
    logger.debug("=== Query QuickBooks Payments Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    max_results = parameters.get("max_results", 20)
    logger.debug(f"Max results: {max_results}")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build query
        query_parts = ["SELECT * FROM Payment"]
        where_conditions = []
        
        if parameters.get("customer_id"):
            where_conditions.append(f"CustomerRef = '{parameters['customer_id']}'")
            
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
        
        payments = result.get("QueryResponse", {}).get("Payment", [])
        
        response = {
            "success": True,
            "payments": payments,
            "count": len(payments)
        }
        
        logger.debug(f"Found {len(payments)} payments")
        logger.debug("=== End Query QuickBooks Payments Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying payments: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query payments"
        }

# ============================================================================
# VOID PAYMENT
# ============================================================================

@mcp.tool()
async def void_quickbooks_payment(user_id: str, payment_id: str) -> Dict[str, Any]:
    """
    Void an existing QuickBooks payment.
    
    Args:
        user_id: The user ID for authentication
        payment_id: QuickBooks Payment ID to void
    
    Returns:
        Dict containing confirmation of voided payment
    """
    logger.debug("=== Void QuickBooks Payment Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input payment_id: '{payment_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # First, get the existing payment to get the current sync token
        logger.debug("Fetching existing payment data...")
        existing_result = await qbo_request(token, realm_id, "GET", f"/payment/{payment_id}")
        existing_payment = existing_result.get("QueryResponse", {}).get("Payment", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("Payment", {})
        
        if not existing_payment:
            raise ValueError(f"Payment with ID {payment_id} not found")
        
        # Build void payload with ID and SyncToken
        void_data = {
            "Id": payment_id,
            "SyncToken": existing_payment.get("SyncToken")
        }
        
        logger.debug("Making QBO Payment void API call...")
        result = await qbo_request(token, realm_id, "POST", "/payment?operation=void", void_data)
        logger.debug(f"QBO API call successful!")
        
        payment = result.get("QueryResponse", {}).get("Payment", [{}])[0] if result.get("QueryResponse") else result.get("Payment", {})
        
        response = {
            "success": True,
            "payment": payment,
            "message": "Payment voided successfully"
        }
        
        logger.debug("=== End Void QuickBooks Payment Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error voiding payment: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to void payment {payment_id}"
        }
