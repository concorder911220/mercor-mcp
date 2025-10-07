# Rialto Core Backend

## ✨ Features

- **🏗️ Domain-Driven Design (DDD)** architecture
- **🔒 Professional Security** with environment variables and secret management
- **🐘 PostgreSQL** database with connection pooling and health checks
- **🔄 Alembic** database migrations with version control
- **🚀 FastAPI** with conditional OpenAPI/Swagger documentation
- **📝 Complete CRUD APIs** for all entities with validation
- **🛡️ Pydantic** schemas for request/response validation
- **🏪 Repository pattern** for clean data access
- **⚡ Service layer** for business logic separation
- **📊 Monitoring** and logging ready
- **🔧 Professional DevOps** with deployment scripts

## 📋 Entities

The application manages the following entities with complete CRUD operations:

- **👥 Users** - User accounts with roles and metadata
- **📋 Tasks** - Task management with hierarchical structure
- **🏢 Clients** - Client information and settings
- **💬 Messages** - Messages associated with tasks
- **📄 Documents** - Document management for clients  
- **🔑 User Tokens** - External service tokens for users
- **🔗 OAuth Integration** - Third-party authentication (Dropbox, Outlook, Salesforce)

## 📁 Project Structure

```
fastapi/
├── app/
│   ├── core/
│   │   └── config.py                 # Professional configuration management
│   ├── domain/
│   │   └── entities/                 # Domain entities
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── connection.py         # Database connection with pooling
│   │   │   └── models.py             # SQLAlchemy models
│   │   └── repositories/             # Data access layer
│   ├── application/
│   │   ├── schemas/                  # Pydantic schemas
│   │   └── services/                 # Business logic layer
│   └── presentation/
│       └── api/                      # FastAPI routers
├── alembic/                          # Database migrations
├── docker/                           # Docker configuration
├── scripts/                          # Setup and deployment scripts
├── requirements.txt                  # Python dependencies
├── .env.example                     # Environment template
├── .gitignore                       # Professional gitignore
└── README.md                        # This file
```

## 🚀 Quick Start

### Option 1: Development Setup Script (Recommended)

```bash
# Clone the repository
cd fastapi

# Run the automated setup script
chmod +x scripts/setup_dev.sh
./scripts/setup_dev.sh

# Edit environment file with your configuration
cp .env.example .env
# Edit .env with your database credentials

# Start the development server
./run_dev.sh
```

### Option 2: Manual Setup

1. **Prerequisites**
   - Python 3.8+
   - PostgreSQL 12+
   - Git

2. **Environment Setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Setup environment
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Generate initial migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Apply migrations
   alembic upgrade head
   ```

4. **Run Application**
   ```bash
   python main.py
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file from `.env.example` and configure:

```env
# Database (Required)
DATABASE_URL=postgresql://username:password@localhost:5432/fastapi_db

# Security (Important!)
SECRET_KEY=your-super-secret-key-change-this-in-production

# Server
DEBUG=False  # Set to True for development
PORT=8000

# Features
ENABLE_SWAGGER=True  # Set to False in production
```

**⚠️ Security Important:**
- Never commit `.env` files to version control
- Use strong, unique secret keys in production
- Disable debugging and docs in production
- Use environment-specific configurations

### Configuration Features

- **🔐 Security**: Secret key management, password hashing
- **🗄️ Database**: Connection pooling, health checks, multiple DB support
- **📨 CORS**: Configurable cross-origin resource sharing
- **📝 Logging**: Structured logging with levels
- **📤 File Upload**: Size limits, type validation
- **⏱️ Rate Limiting**: Request throttling
- **📧 Email**: SMTP configuration for notifications
- **☁️ Cloud**: AWS, Google Cloud, Azure integration ready
- **📊 Monitoring**: Sentry integration, metrics collection

## 🌐 API Documentation

Once running, access the API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **App Info**: http://localhost:8000/info

## 🔌 API Endpoints

### 👥 Users (`/api/v1/users`)
- `POST /` - Create user
- `GET /` - List users (paginated)
- `GET /{user_id}` - Get user by ID
- `GET /email/{email}` - Get user by email
- `PUT /{user_id}` - Update user
- `DELETE /{user_id}` - Delete user

### 📋 Tasks (`/api/v1/tasks`)
- `POST /` - Create task
- `GET /` - List tasks (paginated)
- `GET /{task_id}` - Get task by ID
- `GET /user/{user_id}` - Get user's tasks
- `GET /client/{client_id}` - Get client's tasks
- `GET /status/{status}` - Get tasks by status
- `GET /parent/{parent_id}/subtasks` - Get subtasks
- `PUT /{task_id}` - Update task
- `DELETE /{task_id}` - Delete task

### 🏢 Clients (`/api/v1/clients`)
- `POST /` - Create client
- `GET /` - List clients (paginated)
- `GET /{client_id}` - Get client by ID
- `GET /email/{email}` - Get client by email
- `GET /user/{user_id}` - Get user's clients
- `PUT /{client_id}` - Update client
- `DELETE /{client_id}` - Delete client

### 💬 Messages (`/api/v1/messages`)
- `POST /` - Create message
- `GET /` - List messages (paginated)
- `GET /{message_id}` - Get message by ID
- `GET /task/{task_id}` - Get task messages
- `GET /type/{message_type}` - Get messages by type
- `GET /role/{role}` - Get messages by role
- `PUT /{message_id}` - Update message
- `DELETE /{message_id}` - Delete message

### 📄 Documents (`/api/v1/documents`)
- `POST /` - Create document
- `GET /` - List documents (paginated)
- `GET /{document_id}` - Get document by ID
- `GET /client/{client_id}` - Get client documents
- `GET /search/{title}` - Search documents by title
- `PUT /{document_id}` - Update document
- `DELETE /{document_id}` - Delete document

### 🔑 User Tokens (`/api/v1/user-tokens`)
- `POST /` - Create/update user token
- `GET /` - List user tokens (paginated)
- `GET /{user_token_id}` - Get token by ID
- `GET /user/{user_id}` - Get user's tokens
- `GET /service/{service_type}` - Get tokens by service
- `GET /user/{user_id}/service/{service_type}` - Get specific token
- `PUT /{user_token_id}` - Update token
- `DELETE /{user_token_id}` - Delete token
- `POST /cleanup-expired` - Clean up expired tokens

### 🔗 OAuth Integration (`/api/v1/oauth`)
- `GET /auth/dropbox` - Initiate Dropbox OAuth
- `GET /auth/outlook` - Initiate Outlook OAuth  
- `GET /auth/salesforce` - Initiate Salesforce OAuth
- `GET /api/tokens` - Get all token statuses
- `GET /api/health/{service}` - Health check for service
- `GET /api/user-tokens/email/{email}/service/{service}` - Get token by email

📖 **[OAuth Setup Guide](OAUTH_SETUP.md)** - Complete OAuth configuration guide

## 🗄️ Database Operations

### Migrations
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check current version
alembic current
```

## 🚀 Production Deployment

### Automated Deployment
```bash
# Run as root on production server
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

### Manual Production Setup

1. **Server Requirements**
   - Ubuntu 20.04+ / CentOS 8+
   - Python 3.8+
   - PostgreSQL 12+
   - Nginx
   - SSL certificate

2. **Security Checklist**
   - [ ] Change default passwords
   - [ ] Configure firewall
   - [ ] Setup SSL/TLS certificates
   - [ ] Configure backup strategy
   - [ ] Setup monitoring and alerting
   - [ ] Review and secure environment variables

## 🔍 Development

### Code Quality
```bash
# Format code
black .
isort .

# Lint code
flake8 .

# Type checking
mypy app/
```

### Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

## 📊 Monitoring & Logging

### Application Logs
```bash
# View application logs
tail -f logs/app.log

# View with systemd (production)
journalctl -u fastapi-ddd-backend -f
```

### Health Monitoring
- **Health Check**: `GET /health`
- **Application Info**: `GET /info`
- **Metrics**: Configure with Prometheus/Grafana

## 🔒 Security Features

- **🔐 Environment Variable Security**: All secrets in environment variables
- **🛡️ Input Validation**: Pydantic schemas for all inputs
- **🔒 Password Hashing**: Secure password storage
- **🚫 CORS Protection**: Configurable CORS policies
- **⏱️ Rate Limiting**: Request throttling protection
- **📝 Audit Logging**: Comprehensive logging
- **🔍 SQL Injection Protection**: SQLAlchemy ORM protection
- **🚯 Data Sanitization**: Input sanitization and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure code quality (`black`, `isort`, `flake8`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

