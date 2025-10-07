# 🗄️ Database Migration Guide

This guide explains how to use Alembic migrations in our FastAPI DDD project.

## ✅ Migration Strategy Verification

Our migration strategy is **correctly configured** with:

- ✅ **Environment Variables**: Uses `.env` file for database configuration
- ✅ **DDD Structure**: Properly imports all models from `app/infrastructure/database/models`
- ✅ **Auto-generation**: Can automatically detect model changes
- ✅ **PostgreSQL Support**: Correctly handles UUID, JSONB, Enums
- ✅ **Foreign Keys**: All relationships properly mapped

## 🚀 Common Migration Commands

### Check Migration Status
```bash
# Check current migration state
python -m alembic current

# Check if database is up to date
python -m alembic check

# View migration history
python -m alembic history

# Show specific migration details
python -m alembic show <revision_id>
```

### Generate New Migration
```bash
# Auto-generate migration based on model changes
python -m alembic revision --autogenerate -m "Description of changes"

# Create empty migration (for data migrations)
python -m alembic revision -m "Data migration description"
```

### Apply Migrations
```bash
# Apply all pending migrations
python -m alembic upgrade head

# Apply specific migration
python -m alembic upgrade <revision_id>

# Apply next migration only
python -m alembic upgrade +1
```

### Rollback Migrations
```bash
# Rollback one migration
python -m alembic downgrade -1

# Rollback to specific migration
python -m alembic downgrade <revision_id>

# Rollback all migrations
python -m alembic downgrade base
```

## 📋 Migration Workflow

### 1. Development Workflow
```bash
# 1. Make changes to models in app/infrastructure/database/models.py
# 2. Generate migration
python -m alembic revision --autogenerate -m "Add new field to User model"

# 3. Review generated migration file
# 4. Apply migration
python -m alembic upgrade head
```

### 2. Production Deployment
```bash
# 1. Deploy new code
# 2. Apply migrations (in production)
python -m alembic upgrade head

# 3. Verify migration status
python -m alembic current
```

### 3. Team Collaboration
```bash
# 1. Pull latest code
git pull origin main

# 2. Apply any new migrations
python -m alembic upgrade head

# 3. Make your model changes
# 4. Generate your migration
python -m alembic revision --autogenerate -m "Your changes"
```

## 🛠️ Generated Migration Example

Our initial migration (`84f38ed843f6`) creates:

### Tables Created:
- **users** - User accounts with roles and metadata
- **clients** - Client information linked to users
- **tasks** - Task management with hierarchy (parent_id)
- **messages** - Messages associated with tasks
- **documents** - Documents linked to clients
- **user_tokens** - External service tokens

### Key Features:
- ✅ **UUID Primary Keys** - All tables use UUID for IDs
- ✅ **Foreign Key Relationships** - Proper constraints between tables
- ✅ **PostgreSQL Enums** - UserRole and ServiceType enums
- ✅ **JSONB Fields** - For flexible metadata storage
- ✅ **Timestamps** - Created/updated timestamps with defaults
- ✅ **Self-referencing** - Tasks can have parent tasks

## 🔧 Configuration Details

### Environment Integration
- Uses `python-dotenv` to load `.env` file
- Database URL from `settings.database_url_complete`
- No hardcoded database credentials

### File Structure
```
alembic/
├── env.py              # Alembic environment configuration
├── script.py.mako      # Migration template
└── versions/           # Generated migration files
    └── 84f38ed843f6_initial_migration_create_all_tables.py

alembic.ini             # Alembic configuration (no hardcoded URLs)
```

## 🚨 Important Notes

### Before Running Migrations
1. **Database Setup**: Ensure PostgreSQL is running
2. **Credentials**: Update `.env` with correct database URL
3. **Backup**: Always backup production database before migrations
4. **Review**: Always review auto-generated migrations before applying

### Database URL Format
```env
DATABASE_URL=postgresql://username:password@host:port/database_name

# Examples:
# Local development
DATABASE_URL=postgresql://postgres:password@localhost:5432/fastapi_db

# Production
DATABASE_URL=postgresql://prod_user:prod_pass@db.example.com:5432/prod_db
```

### Migration Best Practices
- ✅ **Review** all auto-generated migrations
- ✅ **Test** migrations on development database first
- ✅ **Backup** production database before applying
- ✅ **Descriptive names** for migration messages
- ✅ **One logical change** per migration
- ❌ **Don't edit** applied migration files
- ❌ **Don't delete** migration files from git

## 🔍 Troubleshooting

### Common Issues
1. **"No such file or directory"** - Ensure `alembic/versions/` directory exists
2. **"Can't connect to database"** - Check `.env` DATABASE_URL
3. **"Target database is not up to date"** - Run `python -m alembic upgrade head`
4. **"Multiple heads"** - Merge migrations or use specific revision

### Debug Commands
```bash
# Check configuration
python -m alembic check

# Test database connection
python -c "from app.core.config import settings; print(settings.database_url_complete)"

# Verify model imports
python -c "from app.infrastructure.database.models import *; print('Models imported successfully')"
```

## 🎯 Next Steps

1. **Set up database**: Update `.env` with your PostgreSQL credentials
2. **Run initial migration**: `python -m alembic upgrade head`
3. **Verify tables**: Check that all tables are created correctly
4. **Start development**: Begin using the CRUD APIs

---

**Remember**: Always review auto-generated migrations before applying them! 