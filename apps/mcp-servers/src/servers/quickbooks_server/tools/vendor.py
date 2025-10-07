"""
QuickBooks Vendor Management Tools

Provides create, read, and update functionality for QuickBooks vendors.
"""

import logging
import json
from typing import Dict, Any, Optional, List
from fastmcp import FastMCP
from ..utils.auth import get_user_qbo_token, get_qbo_realm_id
from ..utils.qbo import qbo_query, qbo_request

logger = logging.getLogger(__name__)

# Get the MCP instance from the server module
from ..server import mcp


@mcp.tool()
async def create_quickbooks_vendor(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new vendor in QuickBooks.
    
    Args:
        user_id: The user ID for authentication
        parameters: Vendor details including:
            - name (required): Vendor name
            - company_name: Company name if different from name
            - email: Vendor email address
            - phone: Phone number
            - mobile: Mobile phone number
            - fax: Fax number
            - website: Website URL
            - billing_address: Dict with address fields (line1, city, state, postal_code, country)
            - tax_id: Tax identification number (EIN/SSN)
            - is_1099: Boolean, whether vendor receives 1099
            - currency: Currency code (defaults to USD)
            - payment_terms: Payment terms reference
            - account_number: Account number with this vendor
            - notes: Additional notes
    
    Returns:
        Dict containing the created vendor data and metadata
    """
    logger.debug(f"=== Create QuickBooks Vendor Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters type: {type(parameters)}")
    logger.debug(f"Input parameters: {parameters}")
    
    # Handle empty parameters
    if parameters is None:
        logger.debug("Parameters was None, using empty dict")
        parameters = {}
    
    logger.debug("Getting QBO token...")
    token = await get_user_qbo_token(user_id)
    logger.debug(f"Got token: {len(token)} chars")
    
    logger.debug("Getting QBO realm_id...")
    realm_id = await get_qbo_realm_id(user_id)
    logger.debug(f"Got realm_id: {realm_id}")
    
    logger.debug("Building vendor payload...")
    
    # Build the vendor payload
    vendor_data = {
        "DisplayName": parameters.get("name", "").strip()
    }
    
    if not vendor_data["DisplayName"]:
        raise ValueError("Vendor name is required")
    
    # Optional fields
    if parameters.get("company_name"):
        vendor_data["CompanyName"] = parameters["company_name"].strip()
    
    # Contact information
    if parameters.get("email"):
        vendor_data["PrimaryEmailAddr"] = {"Address": parameters["email"].strip()}
    
    if parameters.get("phone"):
        vendor_data["PrimaryPhone"] = {"FreeFormNumber": parameters["phone"].strip()}
    
    if parameters.get("mobile"):
        vendor_data["Mobile"] = {"FreeFormNumber": parameters["mobile"].strip()}
    
    if parameters.get("fax"):
        vendor_data["Fax"] = {"FreeFormNumber": parameters["fax"].strip()}
    
    if parameters.get("website"):
        vendor_data["WebAddr"] = {"URI": parameters["website"].strip()}
    
    # Address
    if parameters.get("billing_address"):
        billing = parameters["billing_address"]
        vendor_data["BillAddr"] = _build_address(billing)
    
    # Tax and financial settings
    if parameters.get("tax_id"):
        vendor_data["TaxIdentifier"] = parameters["tax_id"].strip()
    
    if parameters.get("is_1099") is not None:
        vendor_data["Vendor1099"] = bool(parameters["is_1099"])
    
    if parameters.get("currency"):
        vendor_data["CurrencyRef"] = {"value": parameters["currency"]}
    
    if parameters.get("payment_terms"):
        vendor_data["TermRef"] = {"value": parameters["payment_terms"]}
    
    if parameters.get("account_number"):
        vendor_data["AcctNum"] = parameters["account_number"].strip()
    
    if parameters.get("notes"):
        vendor_data["Notes"] = parameters["notes"].strip()
    
    payload = vendor_data
    
    logger.debug(f"Built vendor payload: {json.dumps(payload, indent=2)}")
    logger.debug("Making QBO Vendor API call...")
    
    try:
        result = await qbo_request(token, realm_id, "POST", "/vendor", payload)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
    except Exception as e:
        logger.error(f"QBO Vendor API call failed: {e}")
        raise
    
    logger.debug("Building response object...")
    
    # Extract vendor data from response
    response = {
        "success": True,
        "vendor": result.get("QueryResponse", {}).get("Vendor", [{}])[0] if result.get("QueryResponse") else result.get("Vendor", {}),
        "message": "Vendor created successfully"
    }
    
    logger.debug(f"=== End Create QuickBooks Vendor Debug ===")
    
    return response


@mcp.tool()
async def get_quickbooks_vendor(user_id: str, vendor_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific vendor from QuickBooks by ID.
    
    Args:
        user_id: The user ID for authentication
        vendor_id: The QuickBooks vendor ID
    
    Returns:
        Dict containing the vendor data
    """
    logger.debug(f"=== Get QuickBooks Vendor Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input vendor_id: '{vendor_id}'")
    
    token = await get_user_qbo_token(user_id)
    realm_id = await get_qbo_realm_id(user_id)
    
    logger.debug(f"Fetching vendor ID: {vendor_id}")
    
    try:
        result = await qbo_request(token, realm_id, "GET", f"/vendor/{vendor_id}")
        logger.debug(f"QBO API call successful!")
        
        vendor = result.get("QueryResponse", {}).get("Vendor", [{}])[0] if result.get("QueryResponse") else result.get("Vendor", {})
        
        response = {
            "success": True,
            "vendor": vendor
        }
        
        logger.debug(f"=== End Get QuickBooks Vendor Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Failed to get vendor {vendor_id}: {e}")
        raise


@mcp.tool()
async def update_quickbooks_vendor(user_id: str, vendor_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update an existing vendor in QuickBooks.
    
    Args:
        user_id: The user ID for authentication
        vendor_id: The QuickBooks vendor ID to update
        parameters: Vendor fields to update (same fields as create_quickbooks_vendor)
    
    Returns:
        Dict containing the updated vendor data
    """
    logger.debug(f"=== Update QuickBooks Vendor Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input vendor_id: '{vendor_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    token = await get_user_qbo_token(user_id)
    realm_id = await get_qbo_realm_id(user_id)
    
    # First, get the existing vendor to get the current sync token
    logger.debug("Fetching existing vendor data...")
    existing_result = await qbo_request(token, realm_id, "GET", f"/vendor/{vendor_id}")
    existing_vendor = existing_result.get("QueryResponse", {}).get("Vendor", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("Vendor", {})
    
    if not existing_vendor:
        raise ValueError(f"Vendor with ID {vendor_id} not found")
    
    logger.debug(f"Existing vendor sync token: {existing_vendor.get('SyncToken')}")
    
    # Build update payload starting with existing vendor
    vendor_data = existing_vendor.copy()
    
    # Update fields from parameters
    if parameters.get("name"):
        vendor_data["DisplayName"] = parameters["name"].strip()
    
    if parameters.get("company_name"):
        vendor_data["CompanyName"] = parameters["company_name"].strip()
    
    # Contact information updates
    if parameters.get("email"):
        vendor_data["PrimaryEmailAddr"] = {"Address": parameters["email"].strip()}
    
    if parameters.get("phone"):
        vendor_data["PrimaryPhone"] = {"FreeFormNumber": parameters["phone"].strip()}
    
    if parameters.get("mobile"):
        vendor_data["Mobile"] = {"FreeFormNumber": parameters["mobile"].strip()}
    
    if parameters.get("fax"):
        vendor_data["Fax"] = {"FreeFormNumber": parameters["fax"].strip()}
    
    if parameters.get("website"):
        vendor_data["WebAddr"] = {"URI": parameters["website"].strip()}
    
    # Address updates
    if parameters.get("billing_address"):
        billing = parameters["billing_address"]
        vendor_data["BillAddr"] = _build_address(billing)
    
    # Tax and financial setting updates
    if parameters.get("tax_id"):
        vendor_data["TaxIdentifier"] = parameters["tax_id"].strip()
    
    if parameters.get("is_1099") is not None:
        vendor_data["Vendor1099"] = bool(parameters["is_1099"])
    
    if parameters.get("currency"):
        vendor_data["CurrencyRef"] = {"value": parameters["currency"]}
    
    if parameters.get("payment_terms"):
        vendor_data["TermRef"] = {"value": parameters["payment_terms"]}
    
    if parameters.get("account_number"):
        vendor_data["AcctNum"] = parameters["account_number"].strip()
    
    if parameters.get("notes"):
        vendor_data["Notes"] = parameters["notes"].strip()
    
    payload = vendor_data
    
    logger.debug(f"Built update payload: {json.dumps(payload, indent=2)}")
    logger.debug("Making QBO Vendor update API call...")
    
    try:
        result = await qbo_request(token, realm_id, "POST", "/vendor", payload)
        logger.debug(f"QBO API update call successful!")
        
        response = {
            "success": True,
            "vendor": result.get("QueryResponse", {}).get("Vendor", [{}])[0] if result.get("QueryResponse") else result.get("Vendor", {}),
            "message": "Vendor updated successfully"
        }
        
        logger.debug(f"=== End Update QuickBooks Vendor Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Failed to update vendor {vendor_id}: {e}")
        raise


@mcp.tool()
async def list_quickbooks_vendors_detailed(user_id: str, active_only: bool = True) -> Dict[str, Any]:
    """
    List vendors from QuickBooks with detailed information.
    
    Args:
        user_id: The user ID for authentication
        active_only: If True, only return active vendors (default: True)
    
    Returns:
        Dict containing list of vendors with detailed information
    """
    logger.debug(f"=== List QuickBooks Vendors Detailed Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Active only: {active_only}")
    
    token = await get_user_qbo_token(user_id)
    realm_id = await get_qbo_realm_id(user_id)
    
    # Build query
    query = "SELECT * FROM Vendor"
    if active_only:
        query += " WHERE Active = true"
    
    logger.debug(f"Query: {query}")
    
    try:
        result = await qbo_query(token, realm_id, query)
        vendors = result.get("QueryResponse", {}).get("Vendor", [])
        
        response = {
            "success": True,
            "vendors": vendors,
            "count": len(vendors)
        }
        
        logger.debug(f"Found {len(vendors)} vendors")
        logger.debug(f"=== End List QuickBooks Vendors Detailed Debug ===")
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to list vendors: {e}")
        raise


def _build_address(address_dict: Dict[str, str]) -> Dict[str, str]:
    """Helper function to build address object for QuickBooks API."""
    address = {}
    
    if address_dict.get("line1"):
        address["Line1"] = address_dict["line1"].strip()
    
    if address_dict.get("line2"):
        address["Line2"] = address_dict["line2"].strip()
    
    if address_dict.get("city"):
        address["City"] = address_dict["city"].strip()
    
    if address_dict.get("state"):
        address["CountrySubDivisionCode"] = address_dict["state"].strip()
    
    if address_dict.get("postal_code"):
        address["PostalCode"] = address_dict["postal_code"].strip()
    
    if address_dict.get("country"):
        address["Country"] = address_dict["country"].strip()
    
    return address
