from typing import List, Dict, Any, Optional

from servers.quickbooks_server.server import mcp
from servers.quickbooks_server.utils.auth import get_user_qbo_token, get_qbo_realm_id, normalize_user_id
from servers.quickbooks_server.utils.qbo import qbo_query


async def _list_simple(token: str, realm_id: str, entity: str, fields: List[str]) -> List[Dict[str, Any]]:
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        select = ",".join(fields)
        q = f"select%20{select}%20from%20{entity}"
        logger.debug(f"qbo_query entity={entity} query={q}")
        
        resp = await qbo_query(token, realm_id, q)
        logger.debug(f"qbo_query_response entity={entity} resp_type={type(resp)} resp_keys={list(resp.keys()) if isinstance(resp, dict) else 'not_dict'}")
        
        if not isinstance(resp, dict):
            logger.warning(f"qbo_query returned non-dict: {type(resp)}")
            return []
            
        items = resp.get(entity)
        logger.debug(f"qbo_query_items entity={entity} items_type={type(items)} items_len={len(items) if isinstance(items, list) else 'not_list'}")
        
        if items is None:
            logger.debug(f"qbo_query_items entity={entity} items=None, returning empty list")
            return []
            
        if not isinstance(items, list):
            logger.warning(f"qbo_query_items entity={entity} items not list: {type(items)}")
            return []
            
        filtered = [i for i in items if isinstance(i, dict)]
        logger.debug(f"qbo_query_filtered entity={entity} filtered_count={len(filtered)}")
        return filtered
        
    except Exception as e:
        logger.error(f"qbo_list_simple_error entity={entity} error={e}")
        if "ApplicationAuthorizationFailed" in str(e) or "003100" in str(e):
            logger.error("QBO Authorization failed - token may be expired or wrong environment (sandbox/production)")
        return []


@mcp.tool(description="List QuickBooks Accounts (Name, Id, AccountType)")
async def list_quickbooks_accounts(user_id: str = "") -> List[Dict[str, Any]]:
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Hardcode the user_id as requested
        uid = user_id
        logger.debug(f"list_accounts_start user_id_raw='{user_id}' hardcoded_uid='{uid}'")
        
        token = await get_user_qbo_token(uid)
        logger.debug(f"list_accounts_token_ok uid='{uid}' token_len={len(token) if token else 0}")
        
        realm_id = await get_qbo_realm_id(uid)
        logger.debug(f"list_accounts_realm_ok uid='{uid}' realm_id='{realm_id}'")
        
        result = await _list_simple(token, realm_id, "Account", ["Id","Name","AccountType"])
        logger.debug(f"list_accounts_result uid='{uid}' count={len(result)}")
        return result
        
    except Exception as e:
        logger.error(f"list_accounts_error user_id='{user_id}' error={e}")
        import traceback
        logger.error(f"list_accounts_traceback: {traceback.format_exc()}")
        raise 


@mcp.tool(description="List QuickBooks Items (Name, Id, Type)")
async def list_quickbooks_items(user_id: str = "") -> List[Dict[str, Any]]:
    uid = normalize_user_id(user_id)
    token = await get_user_qbo_token(uid)
    realm_id = await get_qbo_realm_id(uid)
    return await _list_simple(token, realm_id, "Item", ["Id","Name","Type"]) 


@mcp.tool(description="List QuickBooks Classes (Name, Id)")
async def list_quickbooks_classes(user_id: str = "") -> List[Dict[str, Any]]:
    uid = normalize_user_id(user_id)
    token = await get_user_qbo_token(uid)
    realm_id = await get_qbo_realm_id(uid)
    return await _list_simple(token, realm_id, "Class", ["Id","Name"]) 


@mcp.tool(description="List QuickBooks Customers (DisplayName, Id)")
async def list_quickbooks_customers(user_id: str = "") -> List[Dict[str, Any]]:
    uid = normalize_user_id(user_id)
    token = await get_user_qbo_token(uid)
    realm_id = await get_qbo_realm_id(uid)
    return await _list_simple(token, realm_id, "Customer", ["Id","DisplayName"]) 


@mcp.tool(description="List QuickBooks Departments (Name, Id)")
async def list_quickbooks_departments(user_id: str = "") -> List[Dict[str, Any]]:
    uid = normalize_user_id(user_id)
    token = await get_user_qbo_token(uid)
    realm_id = await get_qbo_realm_id(uid)
    return await _list_simple(token, realm_id, "Department", ["Id","Name"]) 


@mcp.tool(description="List QuickBooks TaxCodes (Name, Id)")
async def list_quickbooks_taxcodes(user_id: str = "") -> List[Dict[str, Any]]:
    uid = normalize_user_id(user_id)
    token = await get_user_qbo_token(uid)
    realm_id = await get_qbo_realm_id(uid)
    return await _list_simple(token, realm_id, "TaxCode", ["Id","Name"]) 


