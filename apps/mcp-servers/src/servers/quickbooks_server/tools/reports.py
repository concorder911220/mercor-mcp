"""
QuickBooks Reports Tools
Handles financial reporting including Profit & Loss, Balance Sheet, Trial Balance, and other reports.
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
# PROFIT AND LOSS REPORT
# ============================================================================

@mcp.tool()
async def get_quickbooks_profit_loss(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate QuickBooks Profit and Loss (P&L) statement for dashboards and analytics.
    
    Args:
        user_id: The user ID for authentication
        parameters: Report parameters including:
            - start_date: Report start date in YYYY-MM-DD format (string)
            - end_date: Report end date in YYYY-MM-DD format (string)
            - accounting_method: "Cash" or "Accrual" (string, default "Accrual")
            - summarize_column_by: "Total", "Month", "Quarter", "Year" (string, default "Total")
            - customer: Filter by specific customer ID (string)
            - vendor: Filter by specific vendor ID (string)
            - class: Filter by specific class ID (string)
            - department: Filter by specific department ID (string)
    
    Returns:
        Dict containing the Profit & Loss report data with revenue, expenses, and net income
    """
    logger.debug("=== Get QuickBooks Profit & Loss Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build report URL with parameters
        report_path = "/reports/ProfitAndLoss"
        query_params = []
        
        if parameters.get("start_date"):
            query_params.append(f"start_date={parameters['start_date']}")
            
        if parameters.get("end_date"):
            query_params.append(f"end_date={parameters['end_date']}")
            
        if parameters.get("accounting_method"):
            query_params.append(f"accounting_method={parameters['accounting_method']}")
        else:
            query_params.append("accounting_method=Accrual")
            
        if parameters.get("summarize_column_by"):
            query_params.append(f"summarize_column_by={parameters['summarize_column_by']}")
            
        if parameters.get("customer"):
            query_params.append(f"customer={parameters['customer']}")
            
        if parameters.get("vendor"):
            query_params.append(f"vendor={parameters['vendor']}")
            
        if parameters.get("class"):
            query_params.append(f"class={parameters['class']}")
            
        if parameters.get("department"):
            query_params.append(f"department={parameters['department']}")
        
        # Add query parameters to path
        if query_params:
            report_path += "?" + "&".join(query_params)
        
        logger.debug(f"Report path: {report_path}")
        
        result = await qbo_request(token, realm_id, "GET", report_path)
        logger.debug(f"QBO API call successful!")
        
        response = {
            "success": True,
            "report": result,
            "report_type": "ProfitAndLoss"
        }
        
        logger.debug("=== End Get QuickBooks Profit & Loss Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error generating P&L report: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate Profit & Loss report"
        }

# ============================================================================
# BALANCE SHEET REPORT
# ============================================================================

@mcp.tool()
async def get_quickbooks_balance_sheet(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate QuickBooks Balance Sheet report for financial position analysis.
    
    Args:
        user_id: The user ID for authentication
        parameters: Report parameters including:
            - report_date: Report date in YYYY-MM-DD format (string, defaults to current date)
            - accounting_method: "Cash" or "Accrual" (string, default "Accrual")
            - summarize_column_by: "Total", "Month", "Quarter", "Year" (string, default "Total")
            - customer: Filter by specific customer ID (string)
            - vendor: Filter by specific vendor ID (string)
            - class: Filter by specific class ID (string)
            - department: Filter by specific department ID (string)
    
    Returns:
        Dict containing the Balance Sheet report data with assets, liabilities, and equity
    """
    logger.debug("=== Get QuickBooks Balance Sheet Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build report URL with parameters
        report_path = "/reports/BalanceSheet"
        query_params = []
        
        if parameters.get("report_date"):
            query_params.append(f"report_date={parameters['report_date']}")
            
        if parameters.get("accounting_method"):
            query_params.append(f"accounting_method={parameters['accounting_method']}")
        else:
            query_params.append("accounting_method=Accrual")
            
        if parameters.get("summarize_column_by"):
            query_params.append(f"summarize_column_by={parameters['summarize_column_by']}")
            
        if parameters.get("customer"):
            query_params.append(f"customer={parameters['customer']}")
            
        if parameters.get("vendor"):
            query_params.append(f"vendor={parameters['vendor']}")
            
        if parameters.get("class"):
            query_params.append(f"class={parameters['class']}")
            
        if parameters.get("department"):
            query_params.append(f"department={parameters['department']}")
        
        # Add query parameters to path
        if query_params:
            report_path += "?" + "&".join(query_params)
        
        logger.debug(f"Report path: {report_path}")
        
        result = await qbo_request(token, realm_id, "GET", report_path)
        logger.debug(f"QBO API call successful!")
        
        response = {
            "success": True,
            "report": result,
            "report_type": "BalanceSheet"
        }
        
        logger.debug("=== End Get QuickBooks Balance Sheet Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error generating Balance Sheet report: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate Balance Sheet report"
        }

# ============================================================================
# TRIAL BALANCE REPORT
# ============================================================================

@mcp.tool()
async def get_quickbooks_trial_balance(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate QuickBooks Trial Balance report for accounting verification.
    
    Args:
        user_id: The user ID for authentication
        parameters: Report parameters including:
            - report_date: Report date in YYYY-MM-DD format (string, defaults to current date)
            - accounting_method: "Cash" or "Accrual" (string, default "Accrual")
            - summarize_column_by: "Total", "Month", "Quarter", "Year" (string, default "Total")
            - customer: Filter by specific customer ID (string)
            - vendor: Filter by specific vendor ID (string)
            - class: Filter by specific class ID (string)
            - department: Filter by specific department ID (string)
    
    Returns:
        Dict containing the Trial Balance report data with account balances
    """
    logger.debug("=== Get QuickBooks Trial Balance Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build report URL with parameters
        report_path = "/reports/TrialBalance"
        query_params = []
        
        if parameters.get("report_date"):
            query_params.append(f"report_date={parameters['report_date']}")
            
        if parameters.get("accounting_method"):
            query_params.append(f"accounting_method={parameters['accounting_method']}")
        else:
            query_params.append("accounting_method=Accrual")
            
        if parameters.get("summarize_column_by"):
            query_params.append(f"summarize_column_by={parameters['summarize_column_by']}")
            
        if parameters.get("customer"):
            query_params.append(f"customer={parameters['customer']}")
            
        if parameters.get("vendor"):
            query_params.append(f"vendor={parameters['vendor']}")
            
        if parameters.get("class"):
            query_params.append(f"class={parameters['class']}")
            
        if parameters.get("department"):
            query_params.append(f"department={parameters['department']}")
        
        # Add query parameters to path
        if query_params:
            report_path += "?" + "&".join(query_params)
        
        logger.debug(f"Report path: {report_path}")
        
        result = await qbo_request(token, realm_id, "GET", report_path)
        logger.debug(f"QBO API call successful!")
        
        response = {
            "success": True,
            "report": result,
            "report_type": "TrialBalance"
        }
        
        logger.debug("=== End Get QuickBooks Trial Balance Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error generating Trial Balance report: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate Trial Balance report"
        }

# ============================================================================
# CASH FLOW REPORT
# ============================================================================

@mcp.tool()
async def get_quickbooks_cash_flow(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate QuickBooks Cash Flow statement for liquidity analysis.
    
    Args:
        user_id: The user ID for authentication
        parameters: Report parameters including:
            - start_date: Report start date in YYYY-MM-DD format (string)
            - end_date: Report end date in YYYY-MM-DD format (string)
            - accounting_method: "Cash" or "Accrual" (string, default "Accrual")
            - summarize_column_by: "Total", "Month", "Quarter", "Year" (string, default "Total")
    
    Returns:
        Dict containing the Cash Flow report data with operating, investing, and financing activities
    """
    logger.debug("=== Get QuickBooks Cash Flow Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build report URL with parameters
        report_path = "/reports/CashFlow"
        query_params = []
        
        if parameters.get("start_date"):
            query_params.append(f"start_date={parameters['start_date']}")
            
        if parameters.get("end_date"):
            query_params.append(f"end_date={parameters['end_date']}")
            
        if parameters.get("accounting_method"):
            query_params.append(f"accounting_method={parameters['accounting_method']}")
        else:
            query_params.append("accounting_method=Accrual")
            
        if parameters.get("summarize_column_by"):
            query_params.append(f"summarize_column_by={parameters['summarize_column_by']}")
        
        # Add query parameters to path
        if query_params:
            report_path += "?" + "&".join(query_params)
        
        logger.debug(f"Report path: {report_path}")
        
        result = await qbo_request(token, realm_id, "GET", report_path)
        logger.debug(f"QBO API call successful!")
        
        response = {
            "success": True,
            "report": result,
            "report_type": "CashFlow"
        }
        
        logger.debug("=== End Get QuickBooks Cash Flow Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error generating Cash Flow report: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate Cash Flow report"
        }

# ============================================================================
# GENERAL LEDGER REPORT
# ============================================================================

@mcp.tool()
async def get_quickbooks_general_ledger(user_id: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate QuickBooks General Ledger report for detailed transaction history.
    
    Args:
        user_id: The user ID for authentication
        parameters: Report parameters including:
            - start_date: Report start date in YYYY-MM-DD format (string)
            - end_date: Report end date in YYYY-MM-DD format (string)
            - accounting_method: "Cash" or "Accrual" (string, default "Accrual")
            - account: Filter by specific account ID (string)
            - customer: Filter by specific customer ID (string)
            - vendor: Filter by specific vendor ID (string)
            - class: Filter by specific class ID (string)
            - department: Filter by specific department ID (string)
    
    Returns:
        Dict containing the General Ledger report data with detailed transactions
    """
    logger.debug("=== Get QuickBooks General Ledger Debug ===")
    logger.debug(f"Input user_id: '{user_id}'")
    logger.debug(f"Input parameters: {parameters}")
    
    if parameters is None:
        parameters = {}
    
    try:
        token = await get_user_qbo_token(user_id)
        realm_id = await get_qbo_realm_id(user_id)
        
        # Build report URL with parameters
        report_path = "/reports/GeneralLedger"
        query_params = []
        
        if parameters.get("start_date"):
            query_params.append(f"start_date={parameters['start_date']}")
            
        if parameters.get("end_date"):
            query_params.append(f"end_date={parameters['end_date']}")
            
        if parameters.get("accounting_method"):
            query_params.append(f"accounting_method={parameters['accounting_method']}")
        else:
            query_params.append("accounting_method=Accrual")
            
        if parameters.get("account"):
            query_params.append(f"account={parameters['account']}")
            
        if parameters.get("customer"):
            query_params.append(f"customer={parameters['customer']}")
            
        if parameters.get("vendor"):
            query_params.append(f"vendor={parameters['vendor']}")
            
        if parameters.get("class"):
            query_params.append(f"class={parameters['class']}")
            
        if parameters.get("department"):
            query_params.append(f"department={parameters['department']}")
        
        # Add query parameters to path
        if query_params:
            report_path += "?" + "&".join(query_params)
        
        logger.debug(f"Report path: {report_path}")
        
        result = await qbo_request(token, realm_id, "GET", report_path)
        logger.debug(f"QBO API call successful!")
        
        response = {
            "success": True,
            "report": result,
            "report_type": "GeneralLedger"
        }
        
        logger.debug("=== End Get QuickBooks General Ledger Debug ===")
        return response
        
    except Exception as e:
        logger.error(f"Error generating General Ledger report: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate General Ledger report"
        }

