"""
QuickBooks Query Tools
Handles SQL-like queries for searching across entities with flexible filtering.
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
# GENERAL QUERY
# ============================================================================

@mcp.tool()
async def query_quickbooks_entities(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Execute SQL-like queries against QuickBooks entities for flexible data retrieval.
    
    Args:
        user_id: The user ID for authentication
        parameters: Query parameters including:
            - query (required): SQL-like query string (string)
              Examples:
              - "SELECT * FROM Customer WHERE Active = true"
              - "SELECT * FROM Invoice WHERE TxnDate >= '2025-01-01'"
              - "SELECT * FROM Item WHERE Type = 'Service'"
              - "SELECT * FROM Account WHERE AccountType = 'Bank'"
            - max_results: Maximum number of results (default 100)
    
    Returns:
        Dict containing the query results with entities and metadata
        
    Note: QuickBooks Query Language (QBL) supports SELECT statements with WHERE clauses.
    Available entities: Account, Bill, BillPayment, Class, Customer, Department, 
    Employee, Invoice, Item, JournalEntry, Payment, Purchase, SalesReceipt, 
    TaxCode, Vendor, and more.
    """
    logger.debug("=== Query QuickBooks Entities Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Validate required parameters
        query_string = parameters.get("query")
        if not query_string:
            raise ValueError("query is required")
        
        max_results = parameters.get("max_results", 100)
        
        # Add MAXRESULTS if not present in query
        if "MAXRESULTS" not in query_string.upper():
            query_string += f" MAXRESULTS {max_results}"
        
        logger.debug(f"Executing query: {query_string}")
        
        result = await qbo_query(token, realm_id, query_string)
        logger.debug(f"QBO query successful!")
        
        # Extract entities from QueryResponse
        query_response = result.get("QueryResponse", {})
        entities = []
        entity_count = 0
        
        # Find the entity type in the response (first key that's not metadata)
        for key, value in query_response.items():
            if key not in ["startPosition", "maxResults", "totalCount"] and isinstance(value, list):
                entities = value
                entity_count = len(entities)
                break
        
        response = {
            "success": True,
            "entities": entities,
            "count": entity_count,
            "query": query_string,
            "metadata": {
                "startPosition": query_response.get("startPosition"),
                "maxResults": query_response.get("maxResults"),
                "totalCount": query_response.get("totalCount")
            }
        }
        
        logger.debug(f"Found {entity_count} entities")
        logger.debug("=== End Query QuickBooks Entities Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error executing query: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to execute query"
        }

# ============================================================================
# TRANSACTION SEARCH
# ============================================================================

@mcp.tool()
async def search_quickbooks_transactions(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Search QuickBooks transactions by date range, amount, or entity references.
    
    Args:
        user_id: The user ID for authentication
        parameters: Search parameters including:
            - transaction_types: List of transaction types to search ["Invoice", "Payment", "Bill", "JournalEntry", etc.] (list)
            - start_date: Start date for transaction search in YYYY-MM-DD format (string)
            - end_date: End date for transaction search in YYYY-MM-DD format (string)
            - customer_id: Filter by specific customer ID (string)
            - vendor_id: Filter by specific vendor ID (string)
            - min_amount: Minimum transaction amount (number)
            - max_amount: Maximum transaction amount (number)
            - account_id: Filter by specific account ID (string)
            - max_results: Maximum number of results per transaction type (default 50)
    
    Returns:
        Dict containing search results grouped by transaction type
    """
    logger.debug("=== Search QuickBooks Transactions Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Default transaction types if not specified
        transaction_types = parameters.get("transaction_types", ["Invoice", "Payment", "Bill", "JournalEntry"])
        max_results = parameters.get("max_results", 50)
        
        results = {}
        total_count = 0
        
        for txn_type in transaction_types:
            logger.debug(f"Searching {txn_type} transactions...")
            
            # Build query for this transaction type
            query_parts = [f"SELECT * FROM {txn_type}"]
            where_conditions = []
            
            # Add date filters
            if parameters.get("start_date"):
                where_conditions.append(f"TxnDate >= '{parameters['start_date']}'")
                
            if parameters.get("end_date"):
                where_conditions.append(f"TxnDate <= '{parameters['end_date']}'")
                
            # Add entity filters
            if parameters.get("customer_id") and txn_type in ["Invoice", "Payment", "SalesReceipt"]:
                where_conditions.append(f"CustomerRef = '{parameters['customer_id']}'")
                
            if parameters.get("vendor_id") and txn_type in ["Bill", "BillPayment", "Purchase"]:
                where_conditions.append(f"VendorRef = '{parameters['vendor_id']}'")
                
            # Add amount filters (if applicable to transaction type)
            if parameters.get("min_amount") and txn_type in ["Invoice", "Payment", "Bill", "BillPayment"]:
                where_conditions.append(f"TotalAmt >= {parameters['min_amount']}")
                
            if parameters.get("max_amount") and txn_type in ["Invoice", "Payment", "Bill", "BillPayment"]:
                where_conditions.append(f"TotalAmt <= {parameters['max_amount']}")
            
            # Build complete query
            if where_conditions:
                query_parts.append("WHERE " + " AND ".join(where_conditions))
                
            query_parts.append(f"MAXRESULTS {max_results}")
            query = " ".join(query_parts)
            
            try:
                result = await qbo_query(token, realm_id, query)
                query_response = result.get("QueryResponse", {})
                
                # Extract entities for this transaction type
                entities = query_response.get(txn_type, [])
                results[txn_type] = {
                    "entities": entities,
                    "count": len(entities),
                    "query": query
                }
                total_count += len(entities)
                
                logger.debug(f"Found {len(entities)} {txn_type} transactions")
                
            except Exception as e:
                logger.warning(f"Error searching {txn_type}: {e}")
                results[txn_type] = {
                    "entities": [],
                    "count": 0,
                    "error": str(e),
                    "query": query
                }
        
        response = {
            "success": True,
            "results": results,
            "total_count": total_count,
            "search_criteria": {
                "transaction_types": transaction_types,
                "start_date": parameters.get("start_date"),
                "end_date": parameters.get("end_date"),
                "customer_id": parameters.get("customer_id"),
                "vendor_id": parameters.get("vendor_id"),
                "min_amount": parameters.get("min_amount"),
                "max_amount": parameters.get("max_amount")
            }
        }
        
        logger.debug(f"Total transactions found: {total_count}")
        logger.debug("=== End Search QuickBooks Transactions Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error searching transactions: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to search transactions"
        }

# ============================================================================
# ENTITY RELATIONSHIPS
# ============================================================================

@mcp.tool()
async def get_quickbooks_entity_relationships(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Find related entities and transactions for a specific QuickBooks entity.
    
    Args:
        user_id: The user ID for authentication
        parameters: Relationship search parameters including:
            - entity_type (required): Type of entity ("Customer", "Vendor", "Account", "Item") (string)
            - entity_id (required): ID of the entity to find relationships for (string)
            - include_transactions: Include related transactions (boolean, default true)
            - date_range_months: Include transactions from last N months (number, default 12)
            - max_results: Maximum results per relationship type (default 50)
    
    Returns:
        Dict containing the entity details and all related entities/transactions
    """
    logger.debug("=== Get QuickBooks Entity Relationships Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Validate required parameters
        entity_type = parameters.get("entity_type")
        entity_id = parameters.get("entity_id")
        
        if not entity_type:
            raise ValueError("entity_type is required")
        if not entity_id:
            raise ValueError("entity_id is required")
            
        include_transactions = parameters.get("include_transactions", True)
        date_range_months = parameters.get("date_range_months", 12)
        max_results = parameters.get("max_results", 50)
        
        results = {
            "entity": {},
            "relationships": {}
        }
        
        # First, get the main entity details
        logger.debug(f"Fetching {entity_type} entity {entity_id}...")
        try:
            entity_result = await qbo_request(token, realm_id, "GET", f"/{entity_type.lower()}/{entity_id}")
            results["entity"] = entity_result.get(entity_type, {})
        except Exception as e:
            logger.warning(f"Could not fetch entity details: {e}")
        
        # Find related transactions based on entity type
        if include_transactions:
            if entity_type == "Customer":
                # Find customer invoices, payments, sales receipts
                transaction_queries = {
                    "Invoices": f"SELECT * FROM Invoice WHERE CustomerRef = '{entity_id}' MAXRESULTS {max_results}",
                    "Payments": f"SELECT * FROM Payment WHERE CustomerRef = '{entity_id}' MAXRESULTS {max_results}",
                    "SalesReceipts": f"SELECT * FROM SalesReceipt WHERE CustomerRef = '{entity_id}' MAXRESULTS {max_results}"
                }
            elif entity_type == "Vendor":
                # Find vendor bills, bill payments, purchases
                transaction_queries = {
                    "Bills": f"SELECT * FROM Bill WHERE VendorRef = '{entity_id}' MAXRESULTS {max_results}",
                    "BillPayments": f"SELECT * FROM BillPayment WHERE VendorRef = '{entity_id}' MAXRESULTS {max_results}",
                    "Purchases": f"SELECT * FROM Purchase WHERE VendorRef = '{entity_id}' MAXRESULTS {max_results}"
                }
            elif entity_type == "Account":
                # Find journal entries and transactions affecting this account
                transaction_queries = {
                    "JournalEntries": f"SELECT * FROM JournalEntry MAXRESULTS {max_results}",  # Will need to filter manually
                }
            elif entity_type == "Item":
                # Find invoices and bills containing this item
                transaction_queries = {
                    "Invoices": f"SELECT * FROM Invoice MAXRESULTS {max_results}",  # Will need to filter manually
                    "Bills": f"SELECT * FROM Bill MAXRESULTS {max_results}"  # Will need to filter manually
                }
            else:
                transaction_queries = {}
            
            # Execute relationship queries
            for relation_name, query in transaction_queries.items():
                try:
                    logger.debug(f"Executing query for {relation_name}: {query}")
                    result = await qbo_query(token, realm_id, query)
                    query_response = result.get("QueryResponse", {})
                    
                    # Extract the main entity from the response
                    for key, value in query_response.items():
                        if isinstance(value, list) and key not in ["startPosition", "maxResults", "totalCount"]:
                            results["relationships"][relation_name] = {
                                "entities": value,
                                "count": len(value)
                            }
                            break
                    
                    if relation_name not in results["relationships"]:
                        results["relationships"][relation_name] = {
                            "entities": [],
                            "count": 0
                        }
                        
                except Exception as e:
                    logger.warning(f"Error finding {relation_name}: {e}")
                    results["relationships"][relation_name] = {
                        "entities": [],
                        "count": 0,
                        "error": str(e)
                    }
        
        # Calculate total relationships
        total_related = sum(rel.get("count", 0) for rel in results["relationships"].values())
        
        response = {
            "success": True,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "entity": results["entity"],
            "relationships": results["relationships"],
            "total_related_entities": total_related
        }
        
        logger.debug(f"Found {total_related} related entities")
        logger.debug("=== End Get QuickBooks Entity Relationships Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error finding entity relationships: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to find entity relationships"
        }
