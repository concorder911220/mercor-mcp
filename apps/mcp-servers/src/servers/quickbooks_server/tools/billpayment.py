"""
QuickBooks BillPayment Management Tools
Handles bill payment creation, reading, and querying operations for vendor payments.
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
# CREATE BILL PAYMENT
# ============================================================================

@mcp.tool()
async def create_quickbooks_billpayment(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks bill payment to pay vendor bills.
    
    Args:
        user_id: The user ID for authentication
        parameters: Bill payment details including:
            - vendor_id (required): QuickBooks Vendor ID
            - total_amount (required): Total payment amount (number)
            - pay_type (required): Payment type - "Check", "CreditCard", or "Cash"
            - bank_account_id: Bank account ID for check payments (required for Check)
            - credit_card_account_id: Credit card account ID (required for CreditCard)
            - bill_payments (optional): List of specific bills to pay, each containing:
              - bill_id: QuickBooks Bill ID to pay
              - amount: Amount to pay on this bill
            - txn_date: Payment date in YYYY-MM-DD format (string)
            - reference_number: Check number or reference (string)
            - private_note: Internal memo (string)
    
    Returns:
        Dict containing the created bill payment data and metadata
    """
    logger.debug("=== Create QuickBooks BillPayment Debug ===")
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
        total_amount = parameters.get("total_amount")
        pay_type = parameters.get("pay_type")
        
        if not vendor_id:
            raise ValueError("vendor_id is required")
        if not total_amount:
            raise ValueError("total_amount is required")
        if not pay_type:
            raise ValueError("pay_type is required (Check, CreditCard, or Cash)")
        
        logger.debug("Building bill payment payload...")
        
        # Build bill payment payload
        billpayment_data = {
            "VendorRef": {
                "value": str(vendor_id)
            },
            "PayType": pay_type,
            "TotalAmt": float(total_amount)
        }
        
        # Add payment method specific details
        if pay_type == "Check":
            bank_account_id = parameters.get("bank_account_id")
            if not bank_account_id:
                raise ValueError("bank_account_id is required for Check payments")
            billpayment_data["CheckPayment"] = {
                "BankAccountRef": {
                    "value": str(bank_account_id)
                }
            }
            if parameters.get("reference_number"):
                billpayment_data["CheckPayment"]["PrintStatus"] = "NeedToPrint"
        elif pay_type == "CreditCard":
            credit_card_account_id = parameters.get("credit_card_account_id")
            if not credit_card_account_id:
                raise ValueError("credit_card_account_id is required for CreditCard payments")
            billpayment_data["CreditCardPayment"] = {
                "CCAccountRef": {
                    "value": str(credit_card_account_id)
                }
            }
        
        # Add optional transaction date
        if parameters.get("txn_date"):
            billpayment_data["TxnDate"] = parameters["txn_date"]
            
        # Add private note if provided
        if parameters.get("private_note"):
            billpayment_data["PrivateNote"] = parameters["private_note"]
        
        # Handle line items for bill payments
        lines = []
        bill_payments = parameters.get("bill_payments", [])
        
        if bill_payments:
            # Specific bills to pay
            for bill_payment in bill_payments:
                bill_id = bill_payment.get("bill_id")
                amount = bill_payment.get("amount")
                if not bill_id or not amount:
                    continue
                    
                lines.append({
                    "Amount": float(amount),
                    "LinkedTxn": [{
                        "TxnId": str(bill_id),
                        "TxnType": "Bill"
                    }]
                })
        else:
            # General payment (will be applied as vendor credit)
            lines.append({
                "Amount": float(total_amount),
                "LinkedTxn": []  # Empty array for unapplied vendor payments
            })
        
        billpayment_data["Line"] = lines
        
        logger.debug(f"Built bill payment payload: {json.dumps(billpayment_data, indent=2)}")
        
        logger.debug("Making QBO BillPayment API call...")
        result = await qbo_request(token, realm_id, "POST", "/billpayment", billpayment_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        billpayment = result.get("QueryResponse", {}).get("BillPayment", [{}])[0] if result.get("QueryResponse") else result.get("BillPayment", {})
        
        response = {
            "success": True,
            "billpayment": billpayment,
            "message": "Bill payment created successfully"
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks BillPayment Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO BillPayment API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create bill payment"
        }

# ============================================================================
# GET BILL PAYMENT
# ============================================================================

@mcp.tool()
async def get_quickbooks_billpayment(user_id: str, billpayment_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks bill payment by ID.
    
    Args:
        user_id: The user ID for authentication
        billpayment_id: QuickBooks BillPayment ID
    
    Returns:
        Dict containing the bill payment details
    """
    logger.debug("=== Get QuickBooks BillPayment Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input billpayment_id: '{billpayment_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching bill payment ID: {billpayment_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/billpayment/{billpayment_id}")
        logger.debug(f"QBO API call successful!")
        
        billpayment = result.get("QueryResponse", {}).get("BillPayment", [{}])[0] if result.get("QueryResponse") else result.get("BillPayment", {})
        
        response = {
            "success": True,
            "billpayment": billpayment
        }
        
        logger.debug("=== End Get QuickBooks BillPayment Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving bill payment: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve bill payment {billpayment_id}"
        }

# ============================================================================
# QUERY BILL PAYMENTS
# ============================================================================

@mcp.tool()
async def query_quickbooks_billpayments(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks bill payments with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including:
            - vendor_id: Filter by vendor ID
            - start_date: Filter bill payments from this date, YYYY-MM-DD format
            - end_date: Filter bill payments to this date, YYYY-MM-DD format
            - pay_type: Filter by payment type (Check, CreditCard, Cash)
            - max_results: Maximum number of results to return (default 20)
    
    Returns:
        Dict containing list of bill payments matching the criteria
    """
    logger.debug("=== Query QuickBooks BillPayments Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    max_results = parameters.get("max_results", 20)
    logger.debug(f"Max results: {max_results}")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build query
        query_parts = ["SELECT * FROM BillPayment"]
        where_conditions = []
        
        if parameters.get("vendor_id"):
            where_conditions.append(f"VendorRef = '{parameters['vendor_id']}'")
            
        if parameters.get("pay_type"):
            where_conditions.append(f"PayType = '{parameters['pay_type']}'")
            
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
        
        billpayments = result.get("QueryResponse", {}).get("BillPayment", [])
        
        response = {
            "success": True,
            "billpayments": billpayments,
            "count": len(billpayments)
        }
        
        logger.debug(f"Found {len(billpayments)} bill payments")
        logger.debug("=== End Query QuickBooks BillPayments Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying bill payments: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query bill payments"
        }

# ============================================================================
# VOID BILL PAYMENT
# ============================================================================

@mcp.tool()
async def void_quickbooks_billpayment(user_id: str, billpayment_id: str) -> Dict[str, Any]:
    """
    Void an existing QuickBooks bill payment.
    
    Args:
        user_id: The user ID for authentication
        billpayment_id: QuickBooks BillPayment ID to void
    
    Returns:
        Dict containing confirmation of voided bill payment
    """
    logger.debug("=== Void QuickBooks BillPayment Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input billpayment_id: '{billpayment_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # First, get the existing bill payment to get the current sync token
        logger.debug("Fetching existing bill payment data...")
        existing_result = await qbo_request(token, realm_id, "GET", f"/billpayment/{billpayment_id}")
        existing_billpayment = existing_result.get("QueryResponse", {}).get("BillPayment", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("BillPayment", {})
        
        if not existing_billpayment:
            raise ValueError(f"Bill payment with ID {billpayment_id} not found")
        
        # Build void payload with ID and SyncToken
        void_data = {
            "Id": billpayment_id,
            "SyncToken": existing_billpayment.get("SyncToken")
        }
        
        logger.debug("Making QBO BillPayment void API call...")
        result = await qbo_request(token, realm_id, "POST", "/billpayment?operation=void", void_data)
        logger.debug(f"QBO API call successful!")
        
        billpayment = result.get("QueryResponse", {}).get("BillPayment", [{}])[0] if result.get("QueryResponse") else result.get("BillPayment", {})
        
        response = {
            "success": True,
            "billpayment": billpayment,
            "message": "Bill payment voided successfully"
        }
        
        logger.debug("=== End Void QuickBooks BillPayment Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error voiding bill payment: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to void bill payment {billpayment_id}"
        }
