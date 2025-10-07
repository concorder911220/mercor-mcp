import os
import json
from typing import Optional, Dict, Any

import aiohttp


def qbo_base_host() -> str:
    import logging
    logger = logging.getLogger(__name__)
    
    env = (os.getenv("QBO_ENV") or "sandbox").lower()
    if env in ("sandbox", "sbx", "dev"):
        host = "https://sandbox-quickbooks.api.intuit.com"
    else:
        host = "https://quickbooks.api.intuit.com"
    logger.debug(f"Using QBO environment: {env} -> {host}")
    return host


async def qbo_request(token: str, realm_id: str, method: str, path: str, body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    # Handle mock tokens for testing without auth
    if token == "mock_qbo_access_token_for_testing" or realm_id == "mock_realm_id_for_testing":
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Mock QBO request: {method} {path}")
        # Return mock response based on the path
        if "Account" in path:
            return {
                "QueryResponse": {
                    "Account": [
                        {"Id": "1", "Name": "Checking Account", "AccountType": "Bank"},
                        {"Id": "2", "Name": "Credit Card", "AccountType": "Credit Card"},
                        {"Id": "3", "Name": "Office Supplies", "AccountType": "Expense"}
                    ]
                }
            }
        return {"QueryResponse": {}}
    
    base = qbo_base_host()
    full_path = f"/v3/company/{realm_id}{path}"
    sep = "?" if "?" not in full_path else "&"
    url = f"{base}{full_path}{sep}minorversion=65"
    
    # Debug logging (can be removed in production)
    import logging
    logger = logging.getLogger(__name__)
    logger.debug(f"QBO API call: {method} {url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    # Configure session to handle gzip compression
    timeout = aiohttp.ClientTimeout(total=30)
    connector = aiohttp.TCPConnector()
    async with aiohttp.ClientSession(timeout=timeout, connector=connector, auto_decompress=True) as session:
        if method.upper() == "POST":
            async with session.post(url, headers=headers, data=json.dumps(body or {})) as resp:
                if resp.status >= 400:
                    try:
                        error_text = await resp.text()
                    except Exception:
                        error_text = f"HTTP {resp.status} error"
                    raise ValueError(f"{resp.status}, message:\n  {error_text}")
                try:
                    data = await resp.json()
                except Exception as e:
                    text = await resp.text()
                    raise ValueError(f"JSON decode error: {e}, response text: {text[:200]}")
        elif method.upper() == "GET":
            async with session.get(url, headers=headers) as resp:
                import logging
                logger = logging.getLogger(__name__)
                logger.debug(f"QBO API GET response: {resp.status} from {url}")
                if resp.status != 200:
                    error_text = await resp.text()
                    logger.debug(f"QBO API GET error: {resp.status}, response: {error_text}")
                data = await resp.json()
        else:
            raise ValueError("Unsupported method")
    fault = data.get("Fault") or data.get("fault")
    if fault:
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"QBO API fault: {json.dumps(fault, indent=2)}")
        raise ValueError(json.dumps(fault))
    return data


async def qbo_query(token: str, realm_id: str, query: str) -> Dict[str, Any]:
    import logging
    logger = logging.getLogger(__name__)
    
    logger.debug(f"=== QBO Query Debug ===")
    logger.debug(f"Query: {query}")
    logger.debug(f"Realm ID: {realm_id}")
    logger.debug(f"Token length: {len(token)} chars")
    logger.debug(f"Token preview: {token[:50]}...")
    
    base = qbo_base_host()
    url = f"{base}/v3/company/{realm_id}/query?query={query}&minorversion=65"
    logger.debug(f"Full URL: {url}")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    logger.debug(f"Headers: {dict((k, v[:50] + '...' if k == 'Authorization' else v) for k, v in headers.items())}")
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            logger.debug(f"QBO Response Status: {resp.status}")
            logger.debug(f"QBO Response Headers: {dict(resp.headers)}")
            
            # Get the raw response text first
            response_text = await resp.text()
            logger.debug(f"QBO Raw Response: {response_text[:500]}...")
            
            # Try to parse as JSON
            try:
                data = json.loads(response_text)
                logger.debug(f"QBO Parsed Response Keys: {list(data.keys()) if isinstance(data, dict) else 'not a dict'}")
            except json.JSONDecodeError as e:
                logger.error(f"QBO JSON Parse Error: {e}")
                logger.error(f"Raw response was: {response_text}")
                raise ValueError(f"Invalid JSON response: {response_text[:200]}")
    
    fault = data.get("Fault") or data.get("fault")
    if fault:
        logger.debug(f"QBO Fault Found: {json.dumps(fault, indent=2)}")
        raise ValueError(json.dumps(fault))
    
    query_response = data.get("QueryResponse", {})
    logger.debug(f"QueryResponse Keys: {list(query_response.keys()) if isinstance(query_response, dict) else 'not a dict'}")
    logger.debug(f"=== End QBO Query Debug ===")
    
    return query_response


async def resolve_ref(token: str, realm_id: str, entity: str, name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not name:
        return None
    safe_name = name.replace("'", "\'")
    q = f"select%20%2a%20from%20{entity}%20where%20Name%20%3d%20%27{safe_name}%27"
    resp = await qbo_query(token, realm_id, q)
    items = resp.get(entity)
    if items and len(items) > 0:
        item = items[0]
        return {"value": item.get("Id"), "name": name}
    return None


