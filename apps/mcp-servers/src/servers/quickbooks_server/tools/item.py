"""
QuickBooks Item Management Tools
Handles product and service item creation, reading, and updating operations.
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
# CREATE ITEM
# ============================================================================

@mcp.tool()
async def create_quickbooks_item(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a new QuickBooks item (product or service) for use in invoices and bills.
    
    Args:
        user_id: The user ID for authentication
        parameters: Item details including:
            - name (required): Item name (string)
            - type (required): Item type - "Service", "NonInventory", "Inventory" (string)
            - description: Item description (string)
            - unit_price: Selling price per unit (number)
            - purchase_cost: Cost to purchase this item (number, for inventory/non-inventory)
            - income_account_id: Account ID for income when sold (string, required for most types)
            - expense_account_id: Account ID for expense when purchased (string, for inventory/non-inventory)
            - asset_account_id: Account ID for inventory asset (string, required for inventory items)
            - track_qty_on_hand: Track quantity on hand (boolean, for inventory items)
            - qty_on_hand: Initial quantity on hand (number, for inventory items)
            - inv_start_date: Inventory start date in YYYY-MM-DD format (string, for inventory items)
            - taxable: Whether item is taxable (boolean)
            - active: Whether item is active (boolean, default true)
    
    Returns:
        Dict containing the created item data and metadata
    """
    logger.debug("=== Create QuickBooks Item Debug ===")
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
        item_type = parameters.get("type")
        
        if not name:
            raise ValueError("name is required")
        if not item_type:
            raise ValueError("type is required (Service, NonInventory, or Inventory)")
        if item_type not in ["Service", "NonInventory", "Inventory"]:
            raise ValueError("type must be 'Service', 'NonInventory', or 'Inventory'")
        
        logger.debug("Building item payload...")
        
        # Build item payload
        item_data = {
            "Name": name.strip(),
            "Type": item_type
        }
        
        # Add optional fields
        if parameters.get("description"):
            item_data["Description"] = parameters["description"]
            
        if parameters.get("unit_price") is not None:
            item_data["UnitPrice"] = float(parameters["unit_price"])
            
        if parameters.get("purchase_cost") is not None:
            item_data["PurchaseCost"] = float(parameters["purchase_cost"])
            
        if "taxable" in parameters:
            item_data["Taxable"] = bool(parameters["taxable"])
        
        if "active" in parameters:
            item_data["Active"] = bool(parameters["active"])
        else:
            item_data["Active"] = True
            
        # Add account references based on item type
        if parameters.get("income_account_id"):
            item_data["IncomeAccountRef"] = {
                "value": str(parameters["income_account_id"])
            }
        elif item_type in ["Service", "NonInventory", "Inventory"]:
            # Income account is typically required for sellable items
            logger.debug("Warning: income_account_id not provided for sellable item type")
            
        if parameters.get("expense_account_id") and item_type in ["NonInventory", "Inventory"]:
            item_data["ExpenseAccountRef"] = {
                "value": str(parameters["expense_account_id"])
            }
            
        # Special handling for inventory items
        if item_type == "Inventory":
            if parameters.get("asset_account_id"):
                item_data["AssetAccountRef"] = {
                    "value": str(parameters["asset_account_id"])
                }
            else:
                raise ValueError("asset_account_id is required for Inventory items")
                
            if "track_qty_on_hand" in parameters:
                item_data["TrackQtyOnHand"] = bool(parameters["track_qty_on_hand"])
            else:
                item_data["TrackQtyOnHand"] = True
                
            if parameters.get("qty_on_hand") is not None:
                item_data["QtyOnHand"] = float(parameters["qty_on_hand"])
                
            if parameters.get("inv_start_date"):
                item_data["InvStartDate"] = parameters["inv_start_date"]
        
        logger.debug(f"Built item payload: {json.dumps(item_data, indent=2)}")
        
        logger.debug("Making QBO Item API call...")
        result = await qbo_request(token, realm_id, "POST", "/item", item_data)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
        
        # Parse response
        item = result.get("QueryResponse", {}).get("Item", [{}])[0] if result.get("QueryResponse") else result.get("Item", {})
        
        response = {
            "success": True,
            "item": item,
            "message": "Item created successfully"
        }
        
        logger.debug(f"Final response: {response}")
        logger.debug("=== End Create QuickBooks Item Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"QBO Item API call failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create item"
        }

# ============================================================================
# GET ITEM
# ============================================================================

@mcp.tool()
async def get_quickbooks_item(user_id: str, item_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific QuickBooks item by ID.
    
    Args:
        user_id: The user ID for authentication
        item_id: QuickBooks Item ID
    
    Returns:
        Dict containing the item details
    """
    logger.debug("=== Get QuickBooks Item Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input item_id: '{item_id}'")
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        logger.debug(f"Fetching item ID: {item_id}")
        
        result = await qbo_request(token, realm_id, "GET", f"/item/{item_id}")
        logger.debug(f"QBO API call successful!")
        
        item = result.get("QueryResponse", {}).get("Item", [{}])[0] if result.get("QueryResponse") else result.get("Item", {})
        
        response = {
            "success": True,
            "item": item
        }
        
        logger.debug("=== End Get QuickBooks Item Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving item: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to retrieve item {item_id}"
        }

# ============================================================================
# QUERY ITEMS
# ============================================================================

@mcp.tool()
async def query_quickbooks_items(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Query QuickBooks items (products/services) with optional filters.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query filters including:
            - item_type: Filter by item type - "Service", "NonInventory", "Inventory" (string)
            - active_only: Include only active items (boolean, default true)
            - name_contains: Filter items containing this name (string)
            - taxable_only: Include only taxable items (boolean)
            - max_results: Maximum number of results to return (default 100)
    
    Returns:
        Dict containing list of items matching the criteria with full details
    """
    logger.debug("=== Query QuickBooks Items Debug ===")
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
        query_parts = ["SELECT * FROM Item"]
        where_conditions = []
        
        if active_only:
            where_conditions.append("Active = true")
            
        if parameters.get("item_type"):
            where_conditions.append(f"Type = '{parameters['item_type']}'")
            
        if parameters.get("name_contains"):
            where_conditions.append(f"Name LIKE '%{parameters['name_contains']}%'")
            
        if parameters.get("taxable_only"):
            where_conditions.append("Taxable = true")
        
        if where_conditions:
            query_parts.append("WHERE " + " AND ".join(where_conditions))
            
        query_parts.append(f"MAXRESULTS {max_results}")
        
        query = " ".join(query_parts)
        logger.debug(f"Query: {query}")
        
        result = await qbo_query(token, realm_id, query)
        
        items = result.get("QueryResponse", {}).get("Item", [])
        
        response = {
            "success": True,
            "items": items,
            "count": len(items)
        }
        
        logger.debug(f"Found {len(items)} items")
        logger.debug("=== End Query QuickBooks Items Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error querying items: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to query items"
        }

# ============================================================================
# UPDATE ITEM
# ============================================================================

@mcp.tool()
async def update_quickbooks_item(user_id: str, item_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Update an existing QuickBooks item.
    
    Args:
        user_id: The user ID for authentication
        item_id: QuickBooks Item ID to update
        parameters: Updated item details (only include fields to update):
            - name: Updated item name
            - description: Updated description
            - unit_price: Updated selling price
            - purchase_cost: Updated purchase cost
            - active: Set item active/inactive status (boolean)
            - taxable: Updated taxable status (boolean)
            - qty_on_hand: Updated quantity (for inventory items)
    
    Returns:
        Dict containing the updated item details
    """
    logger.debug("=== Update QuickBooks Item Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input item_id: '{item_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    # Handle empty parameters
    if parameters is None:
        logger.debug("Parameters was None, using empty dict")
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # First, get the existing item to get the current sync token
        logger.debug("Fetching existing item data...")
        existing_result = await qbo_request(token, realm_id, "GET", f"/item/{item_id}")
        existing_item = existing_result.get("QueryResponse", {}).get("Item", [{}])[0] if existing_result.get("QueryResponse") else existing_result.get("Item", {})
        
        if not existing_item:
            raise ValueError(f"Item with ID {item_id} not found")
        
        # Build update payload starting with existing item
        update_data = existing_item.copy()
        
        # Update fields as specified
        if parameters.get("name"):
            update_data["Name"] = parameters["name"].strip()
            
        if parameters.get("description"):
            update_data["Description"] = parameters["description"]
            
        if parameters.get("unit_price") is not None:
            update_data["UnitPrice"] = float(parameters["unit_price"])
            
        if parameters.get("purchase_cost") is not None:
            update_data["PurchaseCost"] = float(parameters["purchase_cost"])
            
        if "active" in parameters:
            update_data["Active"] = bool(parameters["active"])
            
        if "taxable" in parameters:
            update_data["Taxable"] = bool(parameters["taxable"])
            
        # Handle inventory quantity updates
        if parameters.get("qty_on_hand") is not None and existing_item.get("Type") == "Inventory":
            update_data["QtyOnHand"] = float(parameters["qty_on_hand"])
        
        logger.debug("Making QBO Item update API call...")
        result = await qbo_request(token, realm_id, "POST", "/item", update_data)
        logger.debug(f"QBO API call successful!")
        
        item = result.get("QueryResponse", {}).get("Item", [{}])[0] if result.get("QueryResponse") else result.get("Item", {})
        
        response = {
            "success": True,
            "item": item,
            "message": "Item updated successfully"
        }
        
        logger.debug("=== End Update QuickBooks Item Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error updating item: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to update item {item_id}"
        }
