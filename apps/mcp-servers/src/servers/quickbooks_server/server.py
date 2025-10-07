from mcp.server.fastmcp import FastMCP


mcp = FastMCP("QuickBooks MCP Server", stateless_http=True)


# Import tools to register with MCP
from .tools.expense import create_quickbooks_expense  # noqa: F401
from .tools.refs import (  # noqa: F401
    list_quickbooks_accounts,
    list_quickbooks_items,
    list_quickbooks_classes,
    list_quickbooks_customers,
    list_quickbooks_departments,
    list_quickbooks_taxcodes,
)
from .tools.customer import (  # noqa: F401
    create_quickbooks_customer,
    get_quickbooks_customer,
    update_quickbooks_customer,
    list_quickbooks_customers_detailed,
)
from .tools.vendor import (  # noqa: F401
    create_quickbooks_vendor,
    get_quickbooks_vendor,
    update_quickbooks_vendor,
    list_quickbooks_vendors_detailed,
)
from .tools.invoice import (  # noqa: F401
    create_quickbooks_invoice,
    get_quickbooks_invoice,
    query_quickbooks_invoices,
    update_quickbooks_invoice,
)
from .tools.payment import (  # noqa: F401
    create_quickbooks_payment,
    get_quickbooks_payment,
    query_quickbooks_payments,
    void_quickbooks_payment,
)
from .tools.creditmemo import (  # noqa: F401
    create_quickbooks_creditmemo,
    get_quickbooks_creditmemo,
    query_quickbooks_creditmemos,
)
from .tools.refundreceipt import (  # noqa: F401
    create_quickbooks_refundreceipt,
    get_quickbooks_refundreceipt,
    query_quickbooks_refundreceipts,
)
from .tools.bill import (  # noqa: F401
    create_quickbooks_bill,
    get_quickbooks_bill,
    query_quickbooks_bills,
    update_quickbooks_bill,
)
from .tools.billpayment import (  # noqa: F401
    create_quickbooks_billpayment,
    get_quickbooks_billpayment,
    query_quickbooks_billpayments,
    void_quickbooks_billpayment,
)
from .tools.account import (  # noqa: F401
    create_quickbooks_account,
    get_quickbooks_account,
    query_quickbooks_accounts,
    update_quickbooks_account,
)
from .tools.journalentry import (  # noqa: F401
    create_quickbooks_journalentry,
    get_quickbooks_journalentry,
    query_quickbooks_journalentries,
    update_quickbooks_journalentry,
)
from .tools.item import (  # noqa: F401
    create_quickbooks_item,
    get_quickbooks_item,
    query_quickbooks_items,
    update_quickbooks_item,
)
from .tools.reports import (  # noqa: F401
    get_quickbooks_profit_loss,
    get_quickbooks_balance_sheet,
    get_quickbooks_trial_balance,
    get_quickbooks_cash_flow,
    get_quickbooks_general_ledger,
)
from .tools.query import (  # noqa: F401
    query_quickbooks_entities,
    search_quickbooks_transactions,
    get_quickbooks_entity_relationships,
)
from .tools.metadata import (  # noqa: F401
    get_quickbooks_company_info,
    get_quickbooks_preferences,
    update_quickbooks_preferences,
    get_quickbooks_auth_status,
)


