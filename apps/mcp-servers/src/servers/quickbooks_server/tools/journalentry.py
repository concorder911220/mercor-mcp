"""
QuickBooks Journal Entry Management Tools
Handles journal entry creation, reading, and querying operations for adjusting entries.
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
# CREATE JOURNAL ENTRY
# ============================================================================

@mcp.tool()
async def create_quickbooks_journalentry(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks journal entry for adjusting entries, payroll syncs, accruals.
    
    Args:
        user_id: The user ID for authentication
        parameters: Journal entry details including:
            - line_items (required): List of journal entry lines, each containing:
              - account_id: QuickBooks Account ID (string, required)
              - posting_type: "Debit" or "Credit" (string, required)
              - amount: Line amount (number, required)
              - description: Line description (string, optional)
              - class_id: QuickBooks Class ID for tracking (string, optional)
              - department_id: QuickBooks Department ID (string, optional)
              - entity_id: Customer/Vendor ID if applicable (string, optional)
              - entity_type: "Customer" or "Vendor" if entity_id provided (string, optional)
            - txn_date: Journal entry date in YYYY-MM-DD format (string)
            - doc_number: Document/reference number (string)
            - private_note: Internal memo (string)
            - adjustment: Mark as adjustment entry (boolean, default false)
    
    Returns:
        Dict containing the created journal entry data and metadata
        
    Note: Journal entries must have balanced debits and credits (total debits = total credits)
    """
    logger.debug("=== Create QuickBooks Journal Entry Debug ===")
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
        
        if not line_items:
            raise ValueError("line_items are required")
        if len(line_items) < 2:
            raise ValueError("Journal entry must have at least 2 lines (debit and credit)")
        
        logger.debug("Building journal entry payload...")
        
        # Build line items and validate balancing
        lines = []
        total_debits = 0.0
        total_credits = 0.0
        
        for idx, item in enumerate(line_items):
            account_id = item.get("account_id")
            posting_type = item.get("posting_type")
            amount = item.get("amount")
            
            if not account_id:
                raise ValueError(f"Line item {idx + 1}: account_id is required")
            if not posting_type:
                raise ValueError(f"Line item {idx + 1}: posting_type is required (Debit or Credit)")
            if not amount:
                raise ValueError(f"Line item {idx + 1}: amount is required")
            if posting_type not in ["Debit", "Credit"]:
                raise ValueError(f"Line item {idx + 1}: posting_type must be 'Debit' or 'Credit'")
                
            amount_float = float(amount)
            if posting_type == "Debit":
                total_debits += amount_float
            else:
                total_credits += amount_float
                
            line = {
                "Amount": amount_float,
                "DetailType": "JournalEntryLineDetail",
                "JournalEntryLineDetail": {
                    "PostingType": posting_type,
                    "AccountRef": {
                        "value": str(account_id)
                    }
                }
            }
            
            # Add description if provided
            if item.get("description"):
                line["Description"] = item["description"]
                
            # Add class reference if provided
            if item.get("class_id"):
                line["JournalEntryLineDetail"]["ClassRef"] = {
                    "value": str(item["class_id"])
                }
                
            # Add department reference if provided
            if item.get("department_id"):
                line["JournalEntryLineDetail"]["DepartmentRef"] = {
                    "value": str(item["department_id"])
                }
                
            # Add entity reference if provided
            if item.get("entity_id") and item.get("entity_type"):
                entity_type = item["entity_type"]
                if entity_type == "Customer":
                    line["JournalEntryLineDetail"]["CustomerRef"] = {
                        "value": str(item["entity_id"])
                    }
                elif entity_type == "Vendor":
                    line["JournalEntryLineDetail"]["VendorRef"] = {
                        "value": str(item["entity_id"])
                    }
            
            lines.append(line)
        
        # Validate that debits equal credits (allow small rounding differences)
        if abs(total_debits - total_credits) > 0.01:
            raise ValueError(f"Journal entry is not balanced: Debits ${total_debits:.2f} != Credits ${total_credits:.2f}")
        
        # Build journal entry payload
        journalentry_data = {
            "Line": lines
        }
        
        # Add optional fields
        if parameters.get("txn_date"):
            journalentry_data["TxnDate"] = parameters["txn_date"]
            
        if parameters.get("doc_number"):
            journalentry_data["DocNumber"] = parameters["doc_number"]
            
        if parameters.get("private_note"):
            journalentry_data["PrivateNote"] = parameters["private_note"]
            
        if parameters.get("adjustment"):
            journalentry_data["Adjustment"] = bool(parameters["adjustment"])
        
        logger.debug(f"Built journal entry payload: {json.dumps(journalentry_data, indent=2)}")
        logger.debug(f"Validated balance: Debits ${total_debits:.2f} = Credits ${total_credits:.2f}")
        
        logger.debug("Making QBO Journal Entry API call...")
        result = await qbo_request(token, realm_id, "POST", "/journalentry", journalentry_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        journalentry = result.get("QueryResponse", {}).get("JournalEntry", [{}])[0] if result.get("QueryResponse") else result.get("JournalEntry", {})
        
        response = {
            "success": True,
            "journalentry": journalentry,
            "message": "Journal entry created successfully",
            "balance_check": {
                "total_debits": total_debits,
                "total_credits": total_credits,
                "balanced": abs(total_debits - total_credits) <= 0.01
            }
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks Journal Entry Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO Journal Entry API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create journal entry"
        }

# ============================================================================
# GET JOURNAL ENTRY
# ============================================================================

@mcp.tool()
async def get_quickbooks_journalentry(user_id: str, journalentry_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks journal entry by ID.
    
    Args:
        user_id: The user ID for authentication
        journalentry_id: QuickBooks Journal Entry ID
    
    Returns:
        Dict containing the journal entry details with line items
    """
    logger.debug("=== Get QuickBooks Journal Entry Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input journalentry_id: '{journalentry_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching journal entry ID: {journalentry_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/journalentry/{journalentry_id}")
        logger.debug(f"QBO API call successful!")
        
        journalentry = result.get("QueryResponse", {}).get("JournalEntry", [{}])[0] if result.get("QueryResponse") else result.get("JournalEntry", {})
        
        response = {
            "success": True,
            "journalentry": journalentry
        }
        
        logger.debug("=== End Get QuickBooks Journal Entry Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving journal entry: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve journal entry {journalentry_id}"
        }

# ============================================================================
# QUERY JOURNAL ENTRIES
# ============================================================================

@mcp.tool()
async def query_quickbooks_journalentries(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks journal entries with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including:
            - start_date: Filter journal entries from this date, YYYY-MM-DD format (string)
            - end_date: Filter journal entries to this date, YYYY-MM-DD format (string)
            - doc_number: Filter by document number (string)
            - adjustment_only: Include only adjustment entries (boolean)
            - max_results: Maximum number of results to return (default 20)
    
    Returns:
        Dict containing list of journal entries matching the criteria
    """
    logger.debug("=== Query QuickBooks Journal Entries Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    max_results = parameters.get("max_results", 20)
    logger.debug(f"Max results: {max_results}")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build query
        query_parts = ["SELECT * FROM JournalEntry"]
        where_conditions = []
        
        if parameters.get("doc_number"):
            where_conditions.append(f"DocNumber = '{parameters['doc_number']}'")
            
        if parameters.get("adjustment_only"):
            where_conditions.append("Adjustment = true")
            
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
        
        journalentries = result.get("QueryResponse", {}).get("JournalEntry", [])
        
        response = {
            "success": True,
            "journalentries": journalentries,
            "count": len(journalentries)
        }
        
        logger.debug(f"Found {len(journalentries)} journal entries")
        logger.debug("=== End Query QuickBooks Journal Entries Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying journal entries: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query journal entries"
        }

# ============================================================================
# UPDATE JOURNAL ENTRY
# ============================================================================

@mcp.tool()
async def update_quickbooks_journalentry(user_id: str, journalentry_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Update an existing QuickBooks journal entry.
    
    Args:
        user_id: The user ID for authentication
        journalentry_id: QuickBooks Journal Entry ID to update
        parameters: Updated journal entry details (only include fields to update):
            - line_items: Updated line items (must still balance)
            - txn_date: Updated transaction date
            - doc_number: Updated document number
            - private_note: Updated memo
    
    Returns:
        Dict containing the updated journal entry details
        
    Note: Updated journal entries must still have balanced debits and credits
    """
    logger.debug("=== Update QuickBooks Journal Entry Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input journalentry_id: '{journalentry_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    # Handle empty parameters
    if parameters is None:
        logger.debug("Parameters was None, using empty dict")
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # First, get the existing journal entry to get the current sync token
        logger.debug("Fetching existing journal entry data...")
        existing_result = await qbo_request(token, realm_id, "GET", f"/journalentry/{journalentry_id}")
        existing_journalentry = existing_result.get("QueryResponse", {}).get("JournalEntry", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("JournalEntry", {})
        
        if not existing_journalentry:
            raise ValueError(f"Journal entry with ID {journalentry_id} not found")
        
        # Build update payload starting with existing journal entry
        update_data = existing_journalentry.copy()
        
        # Update fields as specified
        if parameters.get("line_items"):
            lines = []
            total_debits = 0.0
            total_credits = 0.0
            
            for idx, item in enumerate(parameters["line_items"]):
                account_id = item.get("account_id")
                posting_type = item.get("posting_type")
                amount = item.get("amount")
                
                if not account_id:
                    raise ValueError(f"Line item {idx + 1}: account_id is required")
                if not posting_type or posting_type not in ["Debit", "Credit"]:
                    raise ValueError(f"Line item {idx + 1}: posting_type must be 'Debit' or 'Credit'")
                if not amount:
                    raise ValueError(f"Line item {idx + 1}: amount is required")
                    
                amount_float = float(amount)
                if posting_type == "Debit":
                    total_debits += amount_float
                else:
                    total_credits += amount_float
                    
                line = {
                    "Amount": amount_float,
                    "DetailType": "JournalEntryLineDetail",
                    "JournalEntryLineDetail": {
                        "PostingType": posting_type,
                        "AccountRef": {
                            "value": str(account_id)
                        }
                    }
                }
                
                if item.get("description"):
                    line["Description"] = item["description"]
                    
                if item.get("class_id"):
                    line["JournalEntryLineDetail"]["ClassRef"] = {
                        "value": str(item["class_id"])
                    }
                
                lines.append(line)
            
            # Validate balance
            if abs(total_debits - total_credits) > 0.01:
                raise ValueError(f"Updated journal entry is not balanced: Debits ${total_debits:.2f} != Credits ${total_credits:.2f}")
            
            update_data["Line"] = lines
        
        if parameters.get("txn_date"):
            update_data["TxnDate"] = parameters["txn_date"]
            
        if parameters.get("doc_number"):
            update_data["DocNumber"] = parameters["doc_number"]
            
        if parameters.get("private_note"):
            update_data["PrivateNote"] = parameters["private_note"]
        
        logger.debug("Making QBO Journal Entry update API call...")
        result = await qbo_request(token, realm_id, "POST", "/journalentry", update_data)
        logger.debug(f"QBO API call successful!")
        
        journalentry = result.get("QueryResponse", {}).get("JournalEntry", [{}])[0] if result.get("QueryResponse") else result.get("JournalEntry", {})
        
        response = {
            "success": True,
            "journalentry": journalentry,
            "message": "Journal entry updated successfully"
        }
        
        logger.debug("=== End Update QuickBooks Journal Entry Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error updating journal entry: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to update journal entry {journalentry_id}"
        }
