# Rialto MCP Servers

A comprehensive Model Context Protocol (MCP) server implementation for Rialto, providing integration with Microsoft Outlook, Dropbox, and QuickBooks Online services. Built on top of FastMCP and FastAPI with direct database integration for secure token management.

## Features

### Outlook Integration
- **Email management** - List, send, reply, forward, and manage emails
- **Folder operations** - Access inbox, sent items, drafts, and custom folders
- **Multi-user support** - Isolated user contexts with external token management
- **Advanced filtering** - Date ranges, unread filters, and pagination

### Dropbox Integration
- **File operations** - List, upload, download, and manage files
- **Folder management** - Create, move, copy, and delete folders
- **Shared links** - Create and manage shared links for files
- **Search capabilities** - Search files across your Dropbox
 
### QuickBooks Integration
- **Expense management** - Create cash/credit expenses (Purchase)
- **Bill management** - Create, read, update, and query vendor bills for AP automation
- **Bill payment management** - Create, read, query, and void bill payments (Check, ACH, Credit Card)
- **Account management** - Create, read, update, and query chart of accounts
- **Journal entry management** - Create, read, update, and query journal entries for adjusting entries
- **Item management** - Create, read, update, and query products/services for invoice and bill line items
- **Reports & analytics** - Generate financial reports (P&L, Balance Sheet, Trial Balance, Cash Flow, General Ledger)
- **Query & search** - SQL-like queries for flexible entity searches and transaction analysis
- **Authentication & metadata** - Company information, preferences, and authentication status
- **Customer management** - Create, read, and update customers
- **Vendor management** - Create, read, and update vendors  
- **Invoice management** - Create, read, update, and query invoices

### Extract Integration
- **Document extraction** - AI-powered structured data extraction from unstructured documents
- **Multi-format support** - PDFs, Word documents, images, spreadsheets, and more
- **Schema operations** - Automatic schema inference and custom schema-guided extraction
- **Data validation** - Built-in validation against JSON schemas for quality assurance
- **Dropbox integration** - Direct extraction from Dropbox files with authentication
- **URL processing** - Extract from any accessible web URL or S3 bucket
- **Payment management** - Create, read, query, and void payments
- **Credit memo management** - Create, read, and query credit memos for AR adjustments
- **Refund receipt management** - Create, read, and query refund receipts
- **Reference helpers** - List accounts, items, classes, customers, departments, tax codes
- **Auto-resolve** - Optional fallback to auto-select suitable accounts when names not found

### Server Features
- **FastAPI-based** - Modern async web framework
- **Database integration** - Direct PostgreSQL access for secure token retrieval
- **Multi-user support** - User-isolated operations with database-backed authentication
- **Health checks** - Built-in monitoring endpoints
- **Docker support** - Containerized deployment
- **Environment configuration** - Flexible settings management
- **CORS support** - Cross-origin resource sharing
- **API documentation** - Auto-generated Swagger/OpenAPI docs

## Project Structure

```
apps/mcp-servers/
├── src/
│   ├── server.py          # Main FastAPI application
│   ├── config.py          # Configuration settings
│   ├── database.py        # Database utilities for token management
│   └── servers/
│       ├── outlook_server/     # Outlook MCP server
│       ├── dropbox_server/     # Dropbox MCP server
│       └── quickbooks_server/  # QuickBooks MCP server
├── Dockerfile             # Docker container definition
├── docker-compose.yml     # Docker Compose configuration
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── build.sh              # Build script
└── README.md             # This file
```

## Quick Start

### Prerequisites

- Python 3.11 or higher
- Docker (for containerized deployment)
- Microsoft Graph API access (for Outlook)
- Dropbox API access (for Dropbox)

### Local Development

1. **Clone and setup**
   ```bash
   cd apps/mcp-servers
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Run the server**
   ```bash
   python src/server.py
   ```

4. **Access the API**
   - Main API: http://localhost:8002/
   - Health check: http://localhost:8002/health
   - API docs: http://localhost:8002/docs
   - ReDoc: http://localhost:8002/redoc

### Docker Deployment

1. **Build the image**
   ```bash
   # Using the build script
   ./build.sh
   
   # Or manually
   docker build -t mcp-servers .
   ```

2. **Run with Docker**
   ```bash
   # Using docker run
   docker run -p 8002:8002 --env-file .env mcp-servers
   
   # Or using docker-compose
   docker-compose up
   ```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL database connection URL | None | Yes |
| `AUTH_TOKEN` | JWT authentication token for API access (deprecated) | None | No |
| `TOKEN_API_BASE_URL` | Base URL for token API (deprecated) | `https://api.rialto-financial.com` | No |
| `TOKEN_API_TIMEOUT` | Token API timeout in seconds | `30` | No |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARNING, ERROR) | `INFO` | No |
| `DEBUG_MODE` | Enable debug logging | `false` | No |
| `HTTP_TIMEOUT` | HTTP request timeout in seconds | `30` | No |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` | No |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | Rate limit requests per minute | `60` | No |

### API Endpoints

The server provides the following endpoints:

- **`/`** - Root endpoint with server information
- **`/health`** - Health check endpoint
- **`/docs`** - Swagger API documentation
- **`/redoc`** - ReDoc API documentation
- **`/dropbox`** - Dropbox MCP server
- **`/outlook`** - Outlook MCP server
- **`/quickbooks`** - QuickBooks MCP server
- **`/extract`** - Extract MCP server

## API Usage

### Health Check

```bash
curl http://localhost:8002/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Root Endpoint

```bash
curl http://localhost:8002/
```

Response:
```json
{
  "message": "Welcome to Rialto MCP Servers",
  "version": "1.0.0",
  "environment": "development",
  "docs": "/docs",
  "redoc": "/redoc"
}
```

## MCP Server Integration

The server implements the Model Context Protocol (MCP) for multiple services. Each service is mounted as a separate endpoint:

- **Outlook MCP**: `/outlook` - Email management capabilities
- **Dropbox MCP**: `/dropbox` - File management capabilities
- **QuickBooks MCP**: `/quickbooks` - Financial data management
- **Extract MCP**: `/extract` - AI-powered document extraction

### Outlook MCP Tools

Available tools for email management:

- `list_outlook_emails` - List emails from folders
- `get_unread_outlook_emails` - Get unread emails
- `send_outlook_email` - Send new emails
- `reply_to_outlook_email` - Reply to emails
- `forward_outlook_email` - Forward emails
- `mark_outlook_email_as_read` - Mark emails as read
- `delete_outlook_email` - Delete emails
- `list_outlook_folders` - List available folders

### Dropbox MCP Tools

Available tools for file management:

- `list_dropbox_folder` - List files in a folder
- `upload_dropbox_file` - Upload files
- `download_dropbox_file` - Download files
- `create_dropbox_folder` - Create folders
- `delete_dropbox_file_or_folder` - Delete files/folders
- `move_dropbox_file_or_folder` - Move files/folders
- `copy_dropbox_file_or_folder` - Copy files/folders
- `create_dropbox_shared_link` - Create shared links
- `search_dropbox_files` - Search for files

### Extract MCP Tools

Available tools for document extraction:

- `extract_from_url` - Extract structured data from documents at given URLs
- `extract_from_dropbox_file` - Extract data from files stored in Dropbox
- `extract_with_schema` - Extract data with predefined schema for consistent structure
- `infer_document_schema` - Analyze documents and infer JSON schema without extraction
- `validate_extracted_data` - Validate extracted data against JSON schema

### QuickBooks MCP Tools

Available tools for QuickBooks:

**Expense Management:**
- `create_quickbooks_expense(user_id, parameters)` - Create an expense (Purchase). Parameters match Zapier-style DTO (date, memo, account, currency, payment_type, reference_number, account_details_*, item_details_*). Auto-resolve fallbacks used if names don't resolve.

**Bill Management (Accounts Payable):**
- `create_quickbooks_bill(user_id, parameters)` - Create vendor bill with line items for AP automation
- `get_quickbooks_bill(user_id, bill_id)` - Retrieve a specific bill by ID with complete details
- `update_quickbooks_bill(user_id, bill_id, parameters)` - Update an existing bill
- `query_quickbooks_bills(user_id, parameters)` - Query bills with filters (vendor, date range, etc.)

**Bill Payment Management:**
- `create_quickbooks_billpayment(user_id, parameters)` - Create bill payment via Check, CreditCard, or Cash
- `get_quickbooks_billpayment(user_id, billpayment_id)` - Retrieve a specific bill payment by ID
- `query_quickbooks_billpayments(user_id, parameters)` - Query bill payments with filters (vendor, payment type, date range)
- `void_quickbooks_billpayment(user_id, billpayment_id)` - Void an existing bill payment

**Account Management (Chart of Accounts):**
- `create_quickbooks_account(user_id, parameters)` - Create new chart of accounts entry with account type and details
- `get_quickbooks_account(user_id, account_id)` - Retrieve a specific account by ID with full details
- `query_quickbooks_accounts(user_id, parameters)` - Query accounts with filters (type, active status, name search)
- `update_quickbooks_account(user_id, account_id, parameters)` - Update existing account details

**Journal Entry Management (Adjusting Entries):**
- `create_quickbooks_journalentry(user_id, parameters)` - Create journal entry with balanced debit/credit lines
- `get_quickbooks_journalentry(user_id, journalentry_id)` - Retrieve a specific journal entry by ID
- `query_quickbooks_journalentries(user_id, parameters)` - Query journal entries with filters (date range, adjustments)
- `update_quickbooks_journalentry(user_id, journalentry_id, parameters)` - Update existing journal entry (must remain balanced)

**Item Management (Products/Services):**
- `create_quickbooks_item(user_id, parameters)` - Create new item (Service, NonInventory, or Inventory) with pricing and accounts
- `get_quickbooks_item(user_id, item_id)` - Retrieve a specific item by ID with full details
- `query_quickbooks_items(user_id, parameters)` - Query items with filters (type, active status, name search, taxable)
- `update_quickbooks_item(user_id, item_id, parameters)` - Update existing item details, pricing, and inventory

**Reports & Analytics:**
- `get_quickbooks_profit_loss(user_id, parameters)` - Generate Profit & Loss statement with date ranges and filters
- `get_quickbooks_balance_sheet(user_id, parameters)` - Generate Balance Sheet for financial position analysis
- `get_quickbooks_trial_balance(user_id, parameters)` - Generate Trial Balance for accounting verification
- `get_quickbooks_cash_flow(user_id, parameters)` - Generate Cash Flow statement for liquidity analysis
- `get_quickbooks_general_ledger(user_id, parameters)` - Generate General Ledger for detailed transaction history

**Query & Search Tools:**
- `query_quickbooks_entities(user_id, parameters)` - Execute SQL-like queries against any QuickBooks entity
- `search_quickbooks_transactions(user_id, parameters)` - Search transactions by date, amount, entity, with multi-type support
- `get_quickbooks_entity_relationships(user_id, parameters)` - Find all related entities and transactions for any entity

**Authentication & Metadata:**
- `get_quickbooks_company_info(user_id, parameters)` - Retrieve company information for setup and identity confirmation
- `get_quickbooks_preferences(user_id, parameters)` - Get company preferences (tax settings, multi-currency, accounting method)
- `update_quickbooks_preferences(user_id, parameters)` - Update writable company preferences and settings
- `get_quickbooks_auth_status(user_id, parameters)` - Check authentication status and connection health

**Customer Management:**
- `create_quickbooks_customer(user_id, parameters)` - Create a new customer with contact info, addresses, and financial settings
- `get_quickbooks_customer(user_id, customer_id)` - Retrieve a specific customer by ID
- `update_quickbooks_customer(user_id, customer_id, parameters)` - Update an existing customer
- `list_quickbooks_customers_detailed(user_id, active_only)` - List customers with full details

**Vendor Management:**
- `create_quickbooks_vendor(user_id, parameters)` - Create a new vendor with contact info, tax settings, and 1099 configuration
- `get_quickbooks_vendor(user_id, vendor_id)` - Retrieve a specific vendor by ID
- `update_quickbooks_vendor(user_id, vendor_id, parameters)` - Update an existing vendor
- `list_quickbooks_vendors_detailed(user_id, active_only)` - List vendors with full details

**Invoice Management:**
- `create_quickbooks_invoice(user_id, parameters)` - Create a new invoice with line items, customer, due date, and payment terms
- `get_quickbooks_invoice(user_id, invoice_id)` - Retrieve a specific invoice by ID with complete details
- `update_quickbooks_invoice(user_id, invoice_id, parameters)` - Update an existing invoice
- `query_quickbooks_invoices(user_id, parameters)` - Query invoices with filters (customer, date range, status, etc.)

**Payment Management:**
- `create_quickbooks_payment(user_id, parameters)` - Create payment record and apply to invoices or leave unapplied
- `get_quickbooks_payment(user_id, payment_id)` - Retrieve a specific payment by ID
- `query_quickbooks_payments(user_id, parameters)` - Query payments with filters (customer, date range, payment method)
- `void_quickbooks_payment(user_id, payment_id)` - Void an existing payment and reverse applied amounts

**Credit Memo Management:**
- `create_quickbooks_creditmemo(user_id, parameters)` - Create credit memo for AR adjustments and returns
- `get_quickbooks_creditmemo(user_id, creditmemo_id)` - Retrieve a specific credit memo by ID
- `query_quickbooks_creditmemos(user_id, parameters)` - Query credit memos with filters

**Refund Receipt Management:**
- `create_quickbooks_refundreceipt(user_id, parameters)` - Create refund receipt for customer refunds
- `get_quickbooks_refundreceipt(user_id, refundreceipt_id)` - Retrieve a specific refund receipt by ID
- `query_quickbooks_refundreceipts(user_id, parameters)` - Query refund receipts with filters

**Reference Data:**
- `list_quickbooks_accounts(user_id)` - List accounts (Id, Name, AccountType)
- `list_quickbooks_items(user_id)` - List items (Id, Name, Type)
- `list_quickbooks_classes(user_id)` - List classes (Id, Name)
- `list_quickbooks_customers(user_id)` - List customers (Id, DisplayName) - basic list
- `list_quickbooks_departments(user_id)` - List departments (Id, Name)
- `list_quickbooks_taxcodes(user_id)` - List tax codes (Id, Name)

Notes:
- For “Create Expense” we use QuickBooks Purchase (cash/credit). For A/P, use Bill; see the official docs: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/bill

## Development

### Running Tests

```bash
# Test health check
curl -f http://localhost:8002/health

# Test root endpoint
curl -f http://localhost:8002/
```

### Debug Mode

Enable debug logging by setting in your `.env` file:

```bash
DEBUG_MODE=true
LOG_LEVEL=DEBUG
```

### Local Development with Docker

```bash
# Build and run with volume mounting for development
docker run -p 8002:8002 --env-file .env -v $(pwd):/app mcp-servers
```

## Docker Configuration

The Docker setup includes:

- **Python 3.11 slim base image** - Optimized for size and security
- **Non-root user** - Security best practices
- **Health checks** - Automatic monitoring
- **Environment variable support** - Via `.env` file
- **Multi-stage build** - Optimized image size
- **Volume mounting** - For development

### Build Script

The `build.sh` script provides an easy way to build and run the container:

```bash
./build.sh
```

This script:
1. Checks for `.env` file and creates from `env.example` if needed
2. Builds the Docker image
3. Provides usage instructions

## Token Management

The MCP servers use a database-based approach for retrieving third-party service tokens:

### Database Integration

- **Direct Database Access**: Tokens are retrieved directly from the PostgreSQL database using the `DATABASE_URL` connection
- **User Isolation**: Each user's tokens are stored separately and accessed using user ID
- **Service Mapping**: Tokens are organized by service type (OUTLOOK, DROPBOX, QUICKBOOKS)
- **Automatic Expiration**: Expired tokens are automatically detected and rejected

### Token Storage Schema

Tokens are stored in the `user_tokens` table with the following structure:
- `user_id`: UUID of the user
- `service_type`: Service type enum (OUTLOOK, DROPBOX, QUICKBOOKS, etc.)
- `token`: JSONB field containing the access token and metadata
- `expires_at`: Token expiration timestamp

### Usage

When a request is made to any MCP server:
1. The server extracts the user ID from the request
2. Queries the database for the user's token for the specific service
3. Validates the token hasn't expired
4. Uses the token to make API calls to the third-party service

This approach eliminates the need for API calls to retrieve tokens and provides better security and performance.

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'fastapi'**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check that the Docker build completed successfully

2. **Port already in use**
   - Change the port in `src/server.py` or use a different port mapping
   - Check for other services using port 8002

3. **Environment variables not loading**
   - Ensure `.env` file exists and is properly formatted
   - Check that environment variables are set correctly

4. **Health check failing**
   - Verify the server is running on the correct port
   - Check logs for any startup errors

5. **Token expired errors (OAuth services not working)**
   - **Symptoms**: `OUTLOOK token has expired` or similar errors
   - **Cause**: Missing OAuth credentials for automatic token refresh
   - **Solution**: Configure OAuth credentials in your environment
   
   ```bash
   # Check your OAuth configuration
   cd apps/mcp-servers/src
   python check_oauth_config.py
   ```
   
   Required environment variables:
   ```bash
   # Microsoft Outlook
   OUTLOOK_CLIENT_ID=your_outlook_client_id
   OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
   AZURE_TENANT_ID=your_azure_tenant_id
   
   # Dropbox
   DROPBOX_CLIENT_ID=your_dropbox_client_id
   DROPBOX_CLIENT_SECRET=your_dropbox_client_secret
   
   # QuickBooks
   QUICKBOOKS_CLIENT_ID=your_quickbooks_client_id
   QUICKBOOKS_CLIENT_SECRET=your_quickbooks_client_secret
   ```
   
   **Note**: These should match the OAuth app credentials used in the main Rialto API.

6. **Token refresh debugging**
   - Use the debug tool to diagnose token refresh issues:
   ```bash
   cd apps/mcp-servers/src
   python debug_token_refresh.py
   ```

### Logs

Check Docker logs for debugging:

```bash
# Get container logs
docker logs <container_id>

# Follow logs in real-time
docker logs -f <container_id>
```

## Security

- **Non-root user** - Container runs as non-privileged user
- **Environment variables** - Sensitive data stored in environment
- **Input validation** - All inputs are validated
- **Rate limiting** - Configurable rate limiting to prevent abuse
- **CORS configuration** - Configurable cross-origin settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request


## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs for error details
3. Open an issue with detailed information
4. Include relevant configuration and error messages 