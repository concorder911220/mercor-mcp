"""
QuickBooks Account Management Tools
Handles account creation, reading, and updating operations for Chart of Accounts.
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
# CREATE ACCOUNT
# ============================================================================

@mcp.tool()
async def create_quickbooks_account(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks chart of accounts entry.
    
    Args:
        user_id: The user ID for authentication
        parameters: Account details including:
            - name (required): Account name (string)
            - account_type (required): Account type - must be valid QuickBooks type (string)
              Valid types: "Bank", "Accounts Receivable", "Other Current Asset", "Fixed Asset", 
              "Other Asset", "Accounts Payable", "Credit Card", "Other Current Liability", 
              "Long Term Liability", "Equity", "Income", "Cost of Goods Sold", "Expense", "Other Income", "Other Expense"
            - account_sub_type: Account sub type for more specific classification (string)
            - description: Account description (string)
            - opening_balance: Opening balance amount (number)
            - opening_balance_date: Opening balance date in YYYY-MM-DD format (string)
            - currency: Currency code (string, defaults to USD)
            - tax_code_id: Tax code reference ID (string)
    
    Returns:
        Dict containing the created account data and metadata
    """
    logger.debug("=== Create QuickBooks Account Debug ===")
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
        name = parameters.get("name")
        account_type = parameters.get("account_type")
        
        if not name:
            raise ValueError("name is required")
        if not account_type:
            raise ValueError("account_type is required")
        
        logger.debug("Building account payload...")
        
        # Build account payload
        account_data = {
            "Name": name.strip(),
            "AccountType": account_type
        }
        
        # Add optional fields
        if parameters.get("account_sub_type"):
            account_data["AccountSubType"] = parameters["account_sub_type"]
            
        if parameters.get("description"):
            account_data["Description"] = parameters["description"]
            
        if parameters.get("opening_balance") is not None:
            account_data["OpeningBalance"] = float(parameters["opening_balance"])
            
        if parameters.get("opening_balance_date"):
            account_data["OpeningBalanceDate"] = parameters["opening_balance_date"]
            
        if parameters.get("currency"):
            account_data["CurrencyRef"] = {
                "value": parameters["currency"]
            }
        else:
            account_data["CurrencyRef"] = {
                "value": "USD"
            }
            
        if parameters.get("tax_code_id"):
            account_data["TaxCodeRef"] = {
                "value": str(parameters["tax_code_id"])
            }
        
        logger.debug(f"Built account payload: {json.dumps(account_data, indent=2)}")
        
        logger.debug("Making QBO Account API call...")
        result = await qbo_request(token, realm_id, "POST", "/account", account_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        account = result.get("QueryResponse", {}).get("Account", [{}])[0] if result.get("QueryResponse") else result.get("Account", {})
        
        response = {
            "success": True,
            "account": account,
            "message": "Account created successfully"
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks Account Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO Account API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create account"
        }

# ============================================================================
# GET ACCOUNT
# ============================================================================

@mcp.tool()
async def get_quickbooks_account(user_id: str, account_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks account by ID.
    
    Args:
        user_id: The user ID for authentication
        account_id: QuickBooks Account ID
    
    Returns:
        Dict containing the account details
    """
    logger.debug("=== Get QuickBooks Account Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input account_id: '{account_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching account ID: {account_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/account/{account_id}")
        logger.debug(f"QBO API call successful!")
        
        account = result.get("QueryResponse", {}).get("Account", [{}])[0] if result.get("QueryResponse") else result.get("Account", {})
        
        response = {
            "success": True,
            "account": account
        }
        
        logger.debug("=== End Get QuickBooks Account Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving account: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve account {account_id}"
        }

# ============================================================================
# QUERY ACCOUNTS (Enhanced version of existing list_accounts)
# ============================================================================

@mcp.tool()
async def query_quickbooks_accounts(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks chart of accounts with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including:
            - account_type: Filter by account type (string)
            - active_only: Include only active accounts (boolean, default true)
            - name_contains: Filter accounts containing this name (string)
            - max_results: Maximum number of results to return (default 100)
    
    Returns:
        Dict containing list of accounts matching the criteria with full details
    """
    logger.debug("=== Query QuickBooks Accounts Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    active_only = parameters.get("active_only", True)
    max_results = parameters.get("max_results", 100)
    
    logger.debug(f"Active only: {active_only}")
    logger.debug(f"Max results: {max_results}")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build query
        query_parts = ["SELECT * FROM Account"]
        where_conditions = []
        
        if active_only:
            where_conditions.append("Active = true")
            
        if parameters.get("account_type"):
            where_conditions.append(f"AccountType = '{parameters['account_type']}'")
            
        if parameters.get("name_contains"):
            where_conditions.append(f"Name LIKE '%{parameters['name_contains']}%'")
        
        if where_conditions:
            query_parts.append("WHERE " + " AND ".join(where_conditions))
            
        query_parts.append(f"MAXRESULTS {max_results}")
        
        query = " ".join(query_parts)
        logger.debug(f"Query: {query}")
        
        result = await qbo_query(token, realm_id, query)
        
        accounts = result.get("QueryResponse", {}).get("Account", [])
        
        response = {
            "success": True,
            "accounts": accounts,
            "count": len(accounts)
        }
        
        logger.debug(f"Found {len(accounts)} accounts")
        logger.debug("=== End Query QuickBooks Accounts Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying accounts: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query accounts"
        }

# ============================================================================
# UPDATE ACCOUNT
# ============================================================================

@mcp.tool()
async def update_quickbooks_account(user_id: str, account_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Update an existing QuickBooks account.
    
    Args:
        user_id: The user ID for authentication
        account_id: QuickBooks Account ID to update
        parameters: Updated account details (only include fields to update):
            - name: Updated account name
            - description: Updated description
            - active: Set account active/inactive status (boolean)
    
    Returns:
        Dict containing the updated account details
    """
    logger.debug("=== Update QuickBooks Account Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input account_id: '{account_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    # Handle empty parameters
    if parameters is None:
        logger.debug("Parameters was None, using empty dict")
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # First, get the existing account to get the current sync token
        logger.debug("Fetching existing account data...")
        existing_result = await qbo_request(token, realm_id, "GET", f"/account/{account_id}")
        existing_account = existing_result.get("QueryResponse", {}).get("Account", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("Account", {})
        
        if not existing_account:
            raise ValueError(f"Account with ID {account_id} not found")
        
        # Build update payload starting with existing account
        update_data = existing_account.copy()
        
        # Update fields as specified
        if parameters.get("name"):
            update_data["Name"] = parameters["name"].strip()
            
        if parameters.get("description"):
            update_data["Description"] = parameters["description"]
            
        if "active" in parameters:
            update_data["Active"] = bool(parameters["active"])
        
        logger.debug("Making QBO Account update API call...")
        result = await qbo_request(token, realm_id, "POST", "/account", update_data)
        logger.debug(f"QBO API call successful!")
        
        account = result.get("QueryResponse", {}).get("Account", [{}])[0] if result.get("QueryResponse") else result.get("Account", {})
        
        response = {
            "success": True,
            "account": account,
            "message": "Account updated successfully"
        }
        
        logger.debug("=== End Update QuickBooks Account Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error updating account: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to update account {account_id}"
        }
