"""
QuickBooks Customer Management Tools

Provides create, read, and update functionality for QuickBooks customers.
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
async def create_quickbooks_customer(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new customer in QuickBooks.
    
    Args:
        user_id: The user ID for authentication
        parameters: Customer details including:
            - name (required): Customer name
            - company_name: Company name if different from name
            - email: Customer email address
            - phone: Phone number
            - mobile: Mobile phone number
            - fax: Fax number
            - website: Website URL
            - billing_address: Dict with address fields (line1, city, state, postal_code, country)
            - shipping_address: Dict with address fields (line1, city, state, postal_code, country)
            - tax_exempt: Boolean, whether customer is tax exempt
            - currency: Currency code (defaults to USD)
            - payment_terms: Payment terms reference
            - credit_limit: Credit limit amount
            - notes: Additional notes
    
    Returns:
        Dict containing the created customer data and metadata
    """
    logger.debug(f"=== Create QuickBooks Customer Debug ===")
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
    
    logger.debug("Building customer payload...")
    
    # Build the customer payload
    customer_data = {
        "DisplayName": parameters.get("name", "").strip()
    }
    
    if not customer_data["DisplayName"]:
        raise ValueError("Customer name is required")
    
    # Optional fields
    if parameters.get("company_name"):
        customer_data["CompanyName"] = parameters["company_name"].strip()
    
    # Contact information
    if parameters.get("email"):
        customer_data["PrimaryEmailAddr"] = {"Address": parameters["email"].strip()}
    
    if parameters.get("phone"):
        customer_data["PrimaryPhone"] = {"FreeFormNumber": parameters["phone"].strip()}
    
    if parameters.get("mobile"):
        customer_data["Mobile"] = {"FreeFormNumber": parameters["mobile"].strip()}
    
    if parameters.get("fax"):
        customer_data["Fax"] = {"FreeFormNumber": parameters["fax"].strip()}
    
    if parameters.get("website"):
        customer_data["WebAddr"] = {"URI": parameters["website"].strip()}
    
    # Addresses
    if parameters.get("billing_address"):
        billing = parameters["billing_address"]
        customer_data["BillAddr"] = _build_address(billing)
    
    if parameters.get("shipping_address"):
        shipping = parameters["shipping_address"]
        customer_data["ShipAddr"] = _build_address(shipping)
    
    # Financial settings
    if parameters.get("tax_exempt") is not None:
        customer_data["Taxable"] = not bool(parameters["tax_exempt"])
    
    if parameters.get("currency"):
        customer_data["CurrencyRef"] = {"value": parameters["currency"]}
    
    if parameters.get("payment_terms"):
        customer_data["SalesTermRef"] = {"value": parameters["payment_terms"]}
    
    if parameters.get("credit_limit"):
        customer_data["CreditLimit"] = float(parameters["credit_limit"])
    
    if parameters.get("notes"):
        customer_data["Notes"] = parameters["notes"].strip()
    
    payload = customer_data
    
    logger.debug(f"Built customer payload: {json.dumps(payload, indent=2)}")
    logger.debug("Making QBO Customer API call...")
    
    try:
        result = await qbo_request(token, realm_id, "POST", "/customer", payload)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
    except Exception as e:
        logger.error(f"QBO Customer API call failed: {e}")
        raise
    
    logger.debug("Building response object...")
    
    # Extract customer data from response
    response = {
        "success": True,
        "customer": result.get("QueryResponse", {}).get("Customer", [{}])[0] if result.get("QueryResponse") else result.get("Customer", {}),
        "message": "Customer created successfully"
    }
    
    logger.debug(f"=== End Create QuickBooks Customer Debug ===")
    
    return response


@mcp.tool()
async def get_quickbooks_customer(user_id: str, customer_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific customer from QuickBooks by ID.
    
    Args:
        user_id: The user ID for authentication
        customer_id: The QuickBooks customer ID
    
    Returns:
        Dict containing the customer data
    """
    logger.debug(f"=== Get QuickBooks Customer Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input customer_id: '{customer_id}'")
    
    token = await get_user_qbo_token(user_id)
    realm_id = await get_qbo_realm_id(user_id)
    
    logger.debug(f"Fetching customer ID: {customer_id}")
    
    try:
        result = await qbo_request(token, realm_id, "GET", f"/customer/{customer_id}")
        logger.debug(f"QBO API call successful!")
        
        customer = result.get("QueryResponse", {}).get("Customer", [{}])[0] if result.get("QueryResponse") else result.get("Customer", {})
        
        response = {
            "success": True,
            "customer": customer
        }
        
        logger.debug(f"=== End Get QuickBooks Customer Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Failed to get customer {customer_id}: {e}")
        raise


@mcp.tool()
async def update_quickbooks_customer(user_id: str, customer_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update an existing customer in QuickBooks.
    
    Args:
        user_id: The user ID for authentication
        customer_id: The QuickBooks customer ID to update
        parameters: Customer fields to update (same fields as create_quickbooks_customer)
    
    Returns:
        Dict containing the updated customer data
    """
    logger.debug(f"=== Update QuickBooks Customer Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input customer_id: '{customer_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    token = await get_user_qbo_token(user_id)
    realm_id = await get_qbo_realm_id(user_id)
    
    # First, get the existing customer to get the current sync token
    logger.debug("Fetching existing customer data...")
    existing_result = await qbo_request(token, realm_id, "GET", f"/customer/{customer_id}")
    existing_customer = existing_result.get("QueryResponse", {}).get("Customer", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("Customer", {})
    
    if not existing_customer:
        raise ValueError(f"Customer with ID {customer_id} not found")
    
    logger.debug(f"Existing customer sync token: {existing_customer.get('SyncToken')}")
    
    # Build update payload starting with existing customer
    customer_data = existing_customer.copy()
    
    # Update fields from parameters
    if parameters.get("name"):
        customer_data["DisplayName"] = parameters["name"].strip()
    
    if parameters.get("company_name"):
        customer_data["CompanyName"] = parameters["company_name"].strip()
    
    # Contact information updates
    if parameters.get("email"):
        customer_data["PrimaryEmailAddr"] = {"Address": parameters["email"].strip()}
    
    if parameters.get("phone"):
        customer_data["PrimaryPhone"] = {"FreeFormNumber": parameters["phone"].strip()}
    
    if parameters.get("mobile"):
        customer_data["Mobile"] = {"FreeFormNumber": parameters["mobile"].strip()}
    
    if parameters.get("fax"):
        customer_data["Fax"] = {"FreeFormNumber": parameters["fax"].strip()}
    
    if parameters.get("website"):
        customer_data["WebAddr"] = {"URI": parameters["website"].strip()}
    
    # Address updates
    if parameters.get("billing_address"):
        billing = parameters["billing_address"]
        customer_data["BillAddr"] = _build_address(billing)
    
    if parameters.get("shipping_address"):
        shipping = parameters["shipping_address"]
        customer_data["ShipAddr"] = _build_address(shipping)
    
    # Financial setting updates
    if parameters.get("tax_exempt") is not None:
        customer_data["Taxable"] = not bool(parameters["tax_exempt"])
    
    if parameters.get("currency"):
        customer_data["CurrencyRef"] = {"value": parameters["currency"]}
    
    if parameters.get("payment_terms"):
        customer_data["SalesTermRef"] = {"value": parameters["payment_terms"]}
    
    if parameters.get("credit_limit"):
        customer_data["CreditLimit"] = float(parameters["credit_limit"])
    
    if parameters.get("notes"):
        customer_data["Notes"] = parameters["notes"].strip()
    
    payload = customer_data
    
    logger.debug(f"Built update payload: {json.dumps(payload, indent=2)}")
    logger.debug("Making QBO Customer update API call...")
    
    try:
        result = await qbo_request(token, realm_id, "POST", "/customer", payload)
        logger.debug(f"QBO API update call successful!")
        
        response = {
            "success": True,
            "customer": result.get("QueryResponse", {}).get("Customer", [{}])[0] if result.get("QueryResponse") else result.get("Customer", {}),
            "message": "Customer updated successfully"
        }
        
        logger.debug(f"=== End Update QuickBooks Customer Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Failed to update customer {customer_id}: {e}")
        raise


@mcp.tool()
async def list_quickbooks_customers_detailed(user_id: str, active_only: bool = True) -> Dict[str, Any]:
    """
    List customers from QuickBooks with detailed information.
    
    Args:
        user_id: The user ID for authentication
        active_only: If True, only return active customers (default: True)
    
    Returns:
        Dict containing list of customers with detailed information
    """
    logger.debug(f"=== List QuickBooks Customers Detailed Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Active only: {active_only}")
    
    token = await get_user_qbo_token(user_id)
    realm_id = await get_qbo_realm_id(user_id)
    
    # Build query
    query = "SELECT * FROM Customer"
    if active_only:
        query += " WHERE Active = true"
    
    logger.debug(f"Query: {query}")
    
    try:
        result = await qbo_query(token, realm_id, query)
        customers = result.get("QueryResponse", {}).get("Customer", [])
        
        response = {
            "success": True,
            "customers": customers,
            "count": len(customers)
        }
        
        logger.debug(f"Found {len(customers)} customers")
        logger.debug(f"=== End List QuickBooks Customers Detailed Debug ===")
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to list customers: {e}")
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
