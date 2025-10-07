#!/usr/bin/env python3
"""
QuickBooks Expense Tool

Implements Create Expense using QuickBooks Online Accounting API.
Maps Zapier-like DTO parameters to QuickBooks Purchase/Bill objects.

Reference: QuickBooks Accounting API (Bill/Purchase)
Docs: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/bill
"""

import logging
from typing import Any, Dict, Optional, List
from datetime import datetime, timezone
import json

import aiohttp

from servers.quickbooks_server.utils.auth import get_user_qbo_token, get_qbo_realm_id
import os

logger = logging.getLogger(__name__)


def _safe_float(value: Optional[str]) -> Optional[float]:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except Exception:
        return None


async def _qbo_query(token: str, realm_id: str, query: str) -> Dict[str, Any]:
    base = _qbo_base_host()
    url = f"{base}/v3/company/{realm_id}/query?query={query}&minorversion=65"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            data = await resp.json()
    fault = data.get("Fault") or data.get("fault")
    if fault:
        raise ValueError(json.dumps(fault))
    return data.get("QueryResponse", {})


async def _resolve_ref(token: str, realm_id: str, entity: str, name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not name:
        return None
    # Escape quotes in name
    safe_name = name.replace("'", "\'")
    q = f"select%20%2a%20from%20{entity}%20where%20Name%20%3d%20%27{safe_name}%27"
    resp = await _qbo_query(token, realm_id, q)
    items = resp.get(entity)
    if items and len(items) > 0:
        item = items[0]
        return {"value": item.get("Id"), "name": name}
    return None


async def _build_purchase_payload(token: str, realm_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build QuickBooks Purchase (cash expense) payload from DTO-like params.
    For vendor bills, the Bill entity could be used instead, but Purchase is
    the typical expense entry.
    """
    txn_date = params.get("date") or datetime.now(timezone.utc).date().isoformat()
    currency = params.get("currency")
    private_note = params.get("memo")
    exchange_rate = _safe_float(params.get("exchange_rate"))
    payment_type = params.get("payment_type")  # cash/credit

    account_ref_name = params.get("account")  # Bank/Credit Account name

    # Line: either AccountBasedExpenseLineDetail or ItemBasedExpenseLineDetail
    lines: List[Dict[str, Any]] = []

    # Item details line
    item_amount = _safe_float(params.get("item_details_amount"))
    item_quantity = _safe_float(params.get("item_details_quantity"))
    item_unit_price = _safe_float(params.get("item_details_unit_price"))
    if item_amount or item_quantity or item_unit_price or params.get("item_details_item"):
        item_line: Dict[str, Any] = {
            "DetailType": "ItemBasedExpenseLineDetail",
            "Amount": item_amount or (item_quantity or 1.0) * (item_unit_price or 0.0),
            "ItemBasedExpenseLineDetail": {
                # ItemRef should be an id; resolve by name
                "ItemRef": None,
                "ClassRef": None,
                "TaxCodeRef": None,
                "Qty": item_quantity,
                "UnitPrice": item_unit_price,
                "CustomerRef": None,
                "BillableStatus": params.get("item_details_billable_status") or None,
            },
            "Description": params.get("item_details_description") or None,
        }
        lines.append(item_line)

    # Account details line
    acct_amount = _safe_float(params.get("account_details_amount"))
    if acct_amount or params.get("account_details_account"):
        account_line: Dict[str, Any] = {
            "DetailType": "AccountBasedExpenseLineDetail",
            "Amount": acct_amount or 0.0,
            "AccountBasedExpenseLineDetail": {
                "AccountRef": None,
                "ClassRef": None,
                "TaxCodeRef": None,
                "CustomerRef": None,
                "BillableStatus": params.get("account_details_billable_status") or None,
            },
            "Description": params.get("account_details_description") or None,
        }
        lines.append(account_line)

    obj: Dict[str, Any] = {
        "TxnDate": txn_date,
        "Line": lines,
        "PrivateNote": private_note,
    }

    if currency:
        # Use ISO code directly
        obj["CurrencyRef"] = {"value": currency}
    if exchange_rate is not None:
        obj["ExchangeRate"] = exchange_rate
    if params.get("reference_number"):
        obj["DocNumber"] = params.get("reference_number")
    if params.get("department"):
        obj["DepartmentRef"] = None  # resolve below
    if params.get("location"):
        obj["LocationType"] = params.get("location")

    # Payment account
    if account_ref_name:
        obj["AccountRef"] = None  # resolve below

    # PaymentType informs cash/credit in Purchase entity
    if payment_type:
        obj["PaymentType"] = payment_type

    # Resolve all Name-based refs to Ids where possible
    # Top-level AccountRef
    if account_ref_name:
        acc_ref = await _resolve_ref(token, realm_id, "Account", account_ref_name)
        if acc_ref:
            obj["AccountRef"] = acc_ref

    # DepartmentRef
    if params.get("department"):
        dept_ref = await _resolve_ref(token, realm_id, "Department", params.get("department"))
        if dept_ref:
            obj["DepartmentRef"] = dept_ref

    # Line-level refs
    for line in obj["Line"]:
        if line["DetailType"] == "ItemBasedExpenseLineDetail":
            details = line["ItemBasedExpenseLineDetail"]
            if params.get("item_details_item"):
                item_ref = await _resolve_ref(token, realm_id, "Item", params.get("item_details_item"))
                if item_ref:
                    details["ItemRef"] = item_ref
            if params.get("item_details_class"):
                class_ref = await _resolve_ref(token, realm_id, "Class", params.get("item_details_class"))
                if class_ref:
                    details["ClassRef"] = class_ref
            if params.get("item_details_tax_code"):
                tax_ref = await _resolve_ref(token, realm_id, "TaxCode", params.get("item_details_tax_code"))
                if tax_ref:
                    details["TaxCodeRef"] = tax_ref
                else:
                    details["TaxCodeRef"] = {"value": params.get("item_details_tax_code")}
            if params.get("item_details_customer"):
                cust_ref = await _resolve_ref(token, realm_id, "Customer", params.get("item_details_customer"))
                if cust_ref:
                    details["CustomerRef"] = cust_ref
        elif line["DetailType"] == "AccountBasedExpenseLineDetail":
            details = line["AccountBasedExpenseLineDetail"]
            if params.get("account_details_account"):
                a_ref = await _resolve_ref(token, realm_id, "Account", params.get("account_details_account"))
                if a_ref:
                    details["AccountRef"] = a_ref
            if params.get("account_details_class"):
                class_ref = await _resolve_ref(token, realm_id, "Class", params.get("account_details_class"))
                if class_ref:
                    details["ClassRef"] = class_ref
            if params.get("account_details_tax_code"):
                tax_ref = await _resolve_ref(token, realm_id, "TaxCode", params.get("account_details_tax_code"))
                if tax_ref:
                    details["TaxCodeRef"] = tax_ref
                else:
                    details["TaxCodeRef"] = {"value": params.get("account_details_tax_code")}
            if params.get("account_details_customer"):
                cust_ref = await _resolve_ref(token, realm_id, "Customer", params.get("account_details_customer"))
                if cust_ref:
                    details["CustomerRef"] = cust_ref

    return obj


def _qbo_base_host() -> str:
    env = (os.getenv("QBO_ENV") or "sandbox").lower()
    if env in ("sandbox", "sbx", "dev"):
        return "https://sandbox-quickbooks.api.intuit.com"
    return "https://quickbooks.api.intuit.com"


async def _qbo_request(token: str, realm_id: str, method: str, path: str, body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    base = _qbo_base_host()
    # Append minorversion for compatibility
    full_path = f"/v3/company/{realm_id}{path}"
    sep = "?" if "?" not in full_path else "&"
    url = f"{base}{full_path}{sep}minorversion=65"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    import logging
    logger = logging.getLogger(__name__)
    
    logger.debug(f"=== QBO Request Debug ===")
    logger.debug(f"Method: {method}")
    logger.debug(f"URL: {url}")
    logger.debug(f"Body: {json.dumps(body, indent=2) if body else 'None'}")
    
    async with aiohttp.ClientSession() as session:
        if method.upper() == "POST":
            async with session.post(url, headers=headers, data=json.dumps(body or {})) as resp:
                logger.debug(f"QBO Response Status: {resp.status}")
                response_text = await resp.text()
                logger.debug(f"QBO Raw Response: {response_text[:500]}...")
                data = json.loads(response_text)
        elif method.upper() == "GET":
            async with session.get(url, headers=headers) as resp:
                logger.debug(f"QBO Response Status: {resp.status}")
                response_text = await resp.text()
                logger.debug(f"QBO Raw Response: {response_text[:500]}...")
                data = json.loads(response_text)
        else:
            raise ValueError("Unsupported method")
    
    # Normalize fault detection (QuickBooks may use 'Fault' or 'fault')
    fault = data.get("Fault") or data.get("fault")
    if fault:
        logger.debug(f"QBO Fault: {json.dumps(fault, indent=2)}")
        raise ValueError(json.dumps(fault))
    
    logger.debug(f"QBO Success Response Keys: {list(data.keys())}")
    logger.debug(f"=== End QBO Request Debug ===")
    return data


from servers.quickbooks_server.server import mcp


@mcp.tool(description="Create a QuickBooks expense (Purchase)")
async def create_quickbooks_expense(
    user_id: str,
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create an expense in QuickBooks using the provided parameters DTO.
    Parameters align with Zapier QuickBooks Create Expense as provided by user.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.debug(f"=== Create QuickBooks Expense Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters type: {type(parameters)}")
    logger.debug(f"Input parameters: {parameters}")
    
    # Defensive defaults
    if parameters is None:
        logger.debug("Parameters was None, using empty dict")
        parameters = {}

    logger.debug("Getting QBO token...")
    token = await get_user_qbo_token(user_id)
    logger.debug(f"Got token: {len(token)} chars")
    
    logger.debug("Getting QBO realm_id...")
    realm_id = await get_qbo_realm_id(user_id)
    logger.debug(f"Got realm_id: {realm_id}")

    logger.debug("Building purchase payload...")
    payload = await _build_purchase_payload(token, realm_id, parameters or {})
    logger.debug(f"Built payload keys: {list(payload.keys()) if isinstance(payload, dict) else 'not dict'}")

    # Auto-resolve fallbacks for accounts when names don't resolve
    fallbacks: Dict[str, Any] = {}
    logger.debug("Setting up account resolution fallbacks...")

    async def _find_payment_account() -> Optional[Dict[str, Any]]:
        ptype = (parameters or {}).get("payment_type") or "CreditCard"
        preferred = (parameters or {}).get("account")
        logger.debug(f"Finding payment account - type: {ptype}, preferred: {preferred}")
        
        if preferred:
            logger.debug(f"Querying for preferred payment account: {preferred}")
            q = f"select%20Id,Name,AccountType%20from%20Account%20where%20Name%20%3d%20%27{preferred.replace(chr(39), chr(92) + chr(39))}%27"
            try:
                resp = await _qbo_query(token, realm_id, q)
                accs = resp.get("Account", [])
                logger.debug(f"Preferred account query returned {len(accs)} results")
                if accs:
                    atype = accs[0].get("AccountType")
                    logger.debug(f"Found preferred account: {accs[0]['Name']} (Type: {atype})")
                    if ptype.lower().startswith("credit") and atype == "Credit Card":
                        return {"value": accs[0]["Id"], "name": accs[0]["Name"]}
                    if not ptype.lower().startswith("credit") and atype in ("Bank", "Cash On Hand"):
                        return {"value": accs[0]["Id"], "name": accs[0]["Name"]}
            except Exception as e:
                logger.error(f"Error querying preferred payment account: {e}")
        
        # Fallback search
        logger.debug(f"Fallback search for payment account type: {ptype}")
        if ptype.lower().startswith("credit"):
            q = "select%20Id,Name%20from%20Account%20where%20AccountType%20%3d%20%27Credit%20Card%27%20and%20Active%20%3d%20true%20startposition%201%20maxresults%201"
        else:
            q = "select%20Id,Name%20from%20Account%20where%20(AccountType%20%3d%20%27Bank%27%20or%20AccountType%20%3d%20%27Cash%20On%20Hand%27)%20and%20Active%20%3d%20true%20startposition%201%20maxresults%201"
        
        try:
            logger.debug(f"Executing fallback query: {q}")
            resp = await _qbo_query(token, realm_id, q)
            accs = resp.get("Account", [])
            logger.debug(f"Fallback query returned {len(accs)} results")
            if accs:
                logger.debug(f"Found fallback payment account: {accs[0]['Name']}")
                return {"value": accs[0]["Id"], "name": accs[0]["Name"]}
        except Exception as e:
            logger.error(f"Error in fallback payment account query: {e}")
        
        logger.debug("No payment account found")
        return None

    async def _find_expense_account(preferred: Optional[str]) -> Optional[Dict[str, Any]]:
        if preferred:
            q = f"select%20Id,Name,AccountType%20from%20Account%20where%20Name%20%3d%20%27{preferred.replace(chr(39), chr(92) + chr(39))}%27"
            resp = await _qbo_query(token, realm_id, q)
            accs = resp.get("Account", [])
            if accs and accs[0].get("AccountType") in ("Expense", "Other Expense", "Cost of Goods Sold"):
                return {"value": accs[0]["Id"], "name": accs[0]["Name"]}
        q = "select%20Id,Name%20from%20Account%20where%20(AccountType%20%3d%20%27Expense%27%20or%20AccountType%20%3d%20%27Other%20Expense%27%20or%20AccountType%20%3d%20%27Cost%20of%20Goods%20Sold%27)%20and%20Active%20%3d%20true%20startposition%201%20maxresults%201"
        resp = await _qbo_query(token, realm_id, q)
        accs = resp.get("Account", [])
        if accs:
            return {"value": accs[0]["Id"], "name": accs[0]["Name"]}
        return None

    logger.debug("Checking payload AccountRef...")
    account_ref = payload.get("AccountRef")
    logger.debug(f"Current AccountRef: {account_ref}")
    logger.debug(f"AccountRef boolean evaluation: {bool(account_ref)}")
    
    if not account_ref:
        logger.debug("No AccountRef found, resolving payment account...")
        pay_acc = await _find_payment_account()
        if pay_acc:
            payload["AccountRef"] = pay_acc
            fallbacks["payment_account"] = pay_acc
            logger.debug(f"Set payment account fallback: {pay_acc}")
    else:
        logger.debug(f"AccountRef already present: {account_ref}, skipping payment account resolution")

    logger.debug("Checking expense lines for AccountRef...")
    lines = payload.get("Line", [])
    logger.debug(f"Processing {len(lines)} lines")
    
    for i, line in enumerate(lines):
        logger.debug(f"Processing line {i}: {line.get('DetailType')}")
        if line.get("DetailType") == "AccountBasedExpenseLineDetail":
            details = line.get("AccountBasedExpenseLineDetail", {})
            current_ref = details.get("AccountRef")
            logger.debug(f"Line {i} current AccountRef: {current_ref}")
            
            if not current_ref:
                logger.debug(f"No AccountRef on line {i}, resolving expense account...")
                try:
                    exp_acc = await _find_expense_account((parameters or {}).get("account_details_account"))
                    if exp_acc:
                        details["AccountRef"] = exp_acc
                        fallbacks["expense_account"] = exp_acc
                        logger.debug(f"Set expense account fallback: {exp_acc}")
                    else:
                        logger.debug(f"No expense account found for line {i}")
                except Exception as e:
                    logger.error(f"Error resolving expense account for line {i}: {e}")
            else:
                logger.debug(f"Line {i} already has AccountRef, skipping")

    logger.debug("Account resolution complete, preparing final payload...")
    logger.debug(f"Final payload structure: {json.dumps(payload, indent=2)}")
    logger.debug("Making QBO Purchase API call...")
    
    try:
        result = await _qbo_request(token, realm_id, "POST", "/purchase", payload)
        logger.debug(f"QBO API call successful!")
        logger.debug(f"QBO API result keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}")
    except Exception as e:
        logger.error(f"QBO API call failed: {e}")
        raise

    logger.debug("Building response object...")
    response: Dict[str, Any] = {
        "status": "created",
        "entity": "Purchase",
        "request": payload,
        "response": result,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    if fallbacks:
        response["fallbacks"] = fallbacks
        logger.debug(f"Added fallbacks to response: {fallbacks}")
    
    logger.debug(f"=== End Create QuickBooks Expense Debug ===")
    return response


@mcp.tool(description="Create a QuickBooks expense (flexible input)")
async def create_quickbooks_expense_v2(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Flexible variant that accepts either:
    - { user_id, parameters: {...dto...} }
    - A raw QBO-like shape (e.g., { TotalAmt, DocNumber, Line, ... })
      In this case, user_id is taken from TEST_USER_ID and fields are mapped.
    """
    if payload is None:
        payload = {}

    user_id = payload.get("user_id")
    parameters = payload.get("parameters")
    if parameters is None:
        # Treat entire payload as the parameter set
        parameters = {k: v for k, v in payload.items() if k != "user_id"}

    # Map common QBO fields to DTO when missing
    if "TotalAmt" in parameters and not parameters.get("account_details_amount"):
        try:
            parameters["account_details_amount"] = str(parameters.get("TotalAmt"))
        except Exception:
            pass
    if "DocNumber" in parameters and not parameters.get("reference_number"):
        parameters["reference_number"] = parameters.get("DocNumber")
    if "PaymentType" in parameters and not parameters.get("payment_type"):
        parameters["payment_type"] = parameters.get("PaymentType")
    if "CurrencyRef" in parameters and not parameters.get("currency"):
        c = parameters.get("CurrencyRef")
        if isinstance(c, dict):
            parameters["currency"] = c.get("value") or c.get("name")
        elif isinstance(c, str):
            parameters["currency"] = c
    if "AccountRef" in parameters and not parameters.get("account"):
        acc = parameters.get("AccountRef")
        if isinstance(acc, dict):
            parameters["account"] = acc.get("name") or acc.get("value")
        elif isinstance(acc, str):
            parameters["account"] = acc

    # If a QBO Line array is provided, try to pull one account-based line
    line = parameters.get("Line")
    if isinstance(line, list) and line and not parameters.get("account_details_account"):
        first = line[0]
        try:
            if first.get("DetailType") == "AccountBasedExpenseLineDetail":
                det = first.get("AccountBasedExpenseLineDetail", {})
                aref = det.get("AccountRef")
                if isinstance(aref, dict):
                    parameters["account_details_account"] = aref.get("name") or aref.get("value")
                parameters["account_details_amount"] = str(first.get("Amount"))
                if first.get("Description"):
                    parameters["account_details_description"] = first.get("Description")
        except Exception:
            pass

    # Provide sensible defaults if still missing
    parameters.setdefault("payment_type", "CreditCard")
    parameters.setdefault("currency", "USD")

    return await create_quickbooks_expense(user_id=user_id or "", parameters=parameters)


