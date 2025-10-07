"""
QuickBooks Authentication & Metadata Tools
Handles company information and preferences for setup and configuration.
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
# COMPANY INFO
# ============================================================================

@mcp.tool()
async def get_quickbooks_company_info(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Retrieve QuickBooks company information for setup and identity confirmation.
    
    Args:
        user_id: The user ID for authentication
        parameters: Optional parameters (currently unused, for future expansion)
    
    Returns:
        Dict containing complete company information including:
        - Company name, address, contact details
        - Legal entity information
        - Industry type and classification
        - Tax ID and registration numbers
        - Fiscal year settings
        - Creation and modification dates
    """
    logger.debug("=== Get QuickBooks Company Info Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug("Fetching company info via Query endpoint...")
        
        # Use query endpoint to get company info (more reliable than direct endpoint)
        result = await qbo_query(token, realm_id, "SELECT * FROM CompanyInfo")
        logger.debug(f"QBO query successful!")
        
        # Extract company info from query response
        query_response = result.get("QueryResponse", {})
        company_info_list = query_response.get("CompanyInfo", [])
        
        if company_info_list:
            company_info = company_info_list[0]
        else:
            # Fallback to direct endpoint if query doesn't work
            logger.debug("Query returned no results, trying direct endpoint...")
            result = await qbo_request(token, realm_id, "GET", f"/companyinfo/{realm_id}")
            company_info = result.get("QueryResponse", {}).get("CompanyInfo", [{}])[0] if result.get("QueryResponse") else result.get("CompanyInfo", {})
        
        response = {
            "success": True,
            "company_info": company_info,
            "realm_id": realm_id
        }
        
        logger.debug("=== End Get QuickBooks Company Info Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving company info: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve company information"
        }

# ============================================================================
# PREFERENCES
# ============================================================================

@mcp.tool()
async def get_quickbooks_preferences(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Retrieve QuickBooks company preferences for configuration and setup.
    
    Args:
        user_id: The user ID for authentication
        parameters: Optional parameters including:
            - preference_type: Specific preference category to retrieve (string)
              Options: "AccountingInfoPrefs", "ProductAndServicesPrefs", "SalesFormsPrefs", 
              "EmailMessagesPrefs", "VendorAndPurchasesPrefs", "TimeTrackingPrefs", 
              "TaxPrefs", "CurrencyPrefs", "ReportPrefs", "OtherPrefs"
    
    Returns:
        Dict containing company preferences including:
        - Accounting method (Cash vs Accrual)
        - Multi-currency settings
        - Tax handling preferences
        - Invoice/sales form settings
        - Time tracking and billing preferences
        - Department and class tracking
        - Custom field configurations
        - Email message templates
    """
    logger.debug("=== Get QuickBooks Preferences Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug("Fetching preferences...")
        
        # Get preferences using direct endpoint
        result = await qbo_request(token, realm_id, "GET", "/preferences")
        logger.debug(f"QBO API call successful!")
        
        # Extract preferences from response
        preferences = result.get("QueryResponse", {}).get("Preferences", [{}])[0] if result.get("QueryResponse") else result.get("Preferences", {})
        
        # If user requested a specific preference type, extract just that section
        preference_type = parameters.get("preference_type")
        if preference_type and preference_type in preferences:
            filtered_preferences = {
                preference_type: preferences[preference_type],
                "Id": preferences.get("Id"),
                "SyncToken": preferences.get("SyncToken"),
                "MetaData": preferences.get("MetaData")
            }
            response = {
                "success": True,
                "preferences": filtered_preferences,
                "preference_type": preference_type,
                "filtered": True
            }
        else:
            response = {
                "success": True,
                "preferences": preferences,
                "filtered": False
            }
        
        logger.debug("=== End Get QuickBooks Preferences Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving preferences: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve company preferences"
        }

# ============================================================================
# UPDATE PREFERENCES
# ============================================================================

@mcp.tool()
async def update_quickbooks_preferences(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Update QuickBooks company preferences (limited subset that are writable).
    
    Args:
        user_id: The user ID for authentication
        parameters: Preference updates including:
            - accounting_info_prefs: Accounting information preferences (dict)
              - track_departments: Enable department tracking (boolean)
              - department_terminology: Custom name for departments (string)
              - class_tracking_per_txn: Class tracking per transaction (boolean)
              - class_tracking_per_txn_line: Class tracking per line item (boolean)
              - customer_terminology: Custom name for customers (string)
            - sales_forms_prefs: Sales form preferences (dict)
              - custom_txn_numbers: Use custom transaction numbers (boolean)
              - allow_discount: Allow discounts on sales forms (boolean)
              - allow_estimates: Enable estimates/quotes (boolean)
              - default_terms: Default payment terms ID (string)
              - default_customer_message: Default message on invoices (string)
            - tax_prefs: Tax preferences (dict)
              - using_sales_tax: Enable sales tax tracking (boolean)
            - currency_prefs: Currency preferences (dict)
              - multi_currency_enabled: Enable multi-currency (boolean)
              - home_currency: Home currency code (string)
            - report_prefs: Report preferences (dict)
              - report_basis: Accounting method "Cash" or "Accrual" (string)
    
    Returns:
        Dict containing the updated preferences
        
    Note: Only a subset of preferences are writable via the API. Most are read-only.
    """
    logger.debug("=== Update QuickBooks Preferences Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # First, get current preferences to get sync token
        logger.debug("Fetching current preferences...")
        current_result = await qbo_request(token, realm_id, "GET", "/preferences")
        current_prefs = current_result.get("QueryResponse", {}).get("Preferences", [{}])[0] if current_result.get("QueryResponse") else current_result.get("Preferences", {})
        
        if not current_prefs:
            raise ValueError("Could not retrieve current preferences")
        
        # Build update payload starting with current preferences
        update_data = current_prefs.copy()
        
        # Update AccountingInfoPrefs if provided
        if parameters.get("accounting_info_prefs"):
            accounting_prefs = parameters["accounting_info_prefs"]
            if "AccountingInfoPrefs" not in update_data:
                update_data["AccountingInfoPrefs"] = {}
                
            if "track_departments" in accounting_prefs:
                update_data["AccountingInfoPrefs"]["TrackDepartments"] = bool(accounting_prefs["track_departments"])
                
            if "department_terminology" in accounting_prefs:
                update_data["AccountingInfoPrefs"]["DepartmentTerminology"] = accounting_prefs["department_terminology"]
                
            if "class_tracking_per_txn" in accounting_prefs:
                update_data["AccountingInfoPrefs"]["ClassTrackingPerTxn"] = bool(accounting_prefs["class_tracking_per_txn"])
                
            if "class_tracking_per_txn_line" in accounting_prefs:
                update_data["AccountingInfoPrefs"]["ClassTrackingPerTxnLine"] = bool(accounting_prefs["class_tracking_per_txn_line"])
                
            if "customer_terminology" in accounting_prefs:
                update_data["AccountingInfoPrefs"]["CustomerTerminology"] = accounting_prefs["customer_terminology"]
        
        # Update SalesFormsPrefs if provided
        if parameters.get("sales_forms_prefs"):
            sales_prefs = parameters["sales_forms_prefs"]
            if "SalesFormsPrefs" not in update_data:
                update_data["SalesFormsPrefs"] = {}
                
            if "custom_txn_numbers" in sales_prefs:
                update_data["SalesFormsPrefs"]["CustomTxnNumbers"] = bool(sales_prefs["custom_txn_numbers"])
                
            if "allow_discount" in sales_prefs:
                update_data["SalesFormsPrefs"]["AllowDiscount"] = bool(sales_prefs["allow_discount"])
                
            if "allow_estimates" in sales_prefs:
                update_data["SalesFormsPrefs"]["AllowEstimates"] = bool(sales_prefs["allow_estimates"])
                
            if "default_terms" in sales_prefs:
                update_data["SalesFormsPrefs"]["DefaultTerms"] = {"value": str(sales_prefs["default_terms"])}
                
            if "default_customer_message" in sales_prefs:
                update_data["SalesFormsPrefs"]["DefaultCustomerMessage"] = sales_prefs["default_customer_message"]
        
        # Update TaxPrefs if provided
        if parameters.get("tax_prefs"):
            tax_prefs = parameters["tax_prefs"]
            if "TaxPrefs" not in update_data:
                update_data["TaxPrefs"] = {}
                
            if "using_sales_tax" in tax_prefs:
                update_data["TaxPrefs"]["UsingSalesTax"] = bool(tax_prefs["using_sales_tax"])
        
        # Update CurrencyPrefs if provided
        if parameters.get("currency_prefs"):
            currency_prefs = parameters["currency_prefs"]
            if "CurrencyPrefs" not in update_data:
                update_data["CurrencyPrefs"] = {}
                
            if "multi_currency_enabled" in currency_prefs:
                update_data["CurrencyPrefs"]["MultiCurrencyEnabled"] = bool(currency_prefs["multi_currency_enabled"])
                
            if "home_currency" in currency_prefs:
                update_data["CurrencyPrefs"]["HomeCurrency"] = {"value": currency_prefs["home_currency"]}
        
        # Update ReportPrefs if provided
        if parameters.get("report_prefs"):
            report_prefs = parameters["report_prefs"]
            if "ReportPrefs" not in update_data:
                update_data["ReportPrefs"] = {}
                
            if "report_basis" in report_prefs:
                update_data["ReportPrefs"]["ReportBasis"] = report_prefs["report_basis"]
        
        logger.debug("Making preferences update API call...")
        result = await qbo_request(token, realm_id, "POST", "/preferences", update_data)
        logger.debug(f"QBO API call successful!")
        
        preferences = result.get("QueryResponse", {}).get("Preferences", [{}])[0] if result.get("QueryResponse") else result.get("Preferences", {})
        
        response = {
            "success": True,
            "preferences": preferences,
            "message": "Preferences updated successfully"
        }
        
        logger.debug("=== End Update QuickBooks Preferences Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to update preferences"
        }

# ============================================================================
# AUTHENTICATION STATUS
# ============================================================================

@mcp.tool()
async def get_quickbooks_auth_status(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Check QuickBooks authentication status and connection health.
    
    Args:
        user_id: The user ID for authentication
        parameters: Optional parameters (currently unused)
    
    Returns:
        Dict containing authentication status and basic connection info
    """
    logger.debug("=== Get QuickBooks Auth Status Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    
    if parameters is None:
        parameters = {}
    
    try:
        # Test authentication by getting token and realm
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Test connection with a simple query
        try:
            result = await qbo_query(token, realm_id, "SELECT * FROM CompanyInfo")
            company_info = result.get("QueryResponse", {}).get("CompanyInfo", [{}])
            company_name = company_info[0].get("CompanyName", "Unknown") if company_info else "Unknown"
            connection_test = "SUCCESS"
        except Exception as conn_error:
            company_name = "Connection Failed"
            connection_test = f"FAILED: {str(conn_error)}"
        
        response = {
            "success": True,
            "authenticated": True,
            "user_id": user_id,
            "realm_id": realm_id,
            "company_name": company_name,
            "connection_test": connection_test,
            "token_length": len(token),
            "message": "Authentication verified"
        }
        
        logger.debug("=== End Get QuickBooks Auth Status Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Authentication check failed: {e}")
        return {
            "success": False,
            "authenticated": False,
            "user_id": user_id,
            "error": str(e),
            "message": "Authentication failed"
        }


