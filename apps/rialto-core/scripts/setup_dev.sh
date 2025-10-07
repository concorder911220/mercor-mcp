#!/bin/bash

# FastAPI DDD Backend - Development Setup Script
# This script sets up the development environment

set -e  # Exit on error

echo "🚀 Setting up FastAPI DDD Backend development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python 3.8+ is installed
check_python() {
    print_info "Checking Python version..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
        
        if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
            print_info "Python $PYTHON_VERSION found ✓"
        else
            print_error "Python 3.8+ is required. Found: $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python3 is not installed"
        exit 1
    fi
}

# Check if PostgreSQL is available
check_postgresql() {
    print_info "Checking PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        print_info "PostgreSQL client found ✓"
    else
        print_warning "PostgreSQL client not found. You can use Docker instead."
    fi
}

# Create virtual environment
create_venv() {
    print_info "Creating virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_info "Virtual environment created ✓"
    else
        print_info "Virtual environment already exists ✓"
    fi
}

# Activate virtual environment and install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    print_info "Dependencies installed ✓"
}

# Setup environment file
setup_env() {
    print_info "Setting up environment file..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_info "Environment file created from template ✓"
        print_warning "Please edit .env file with your actual configuration"
    else
        print_info "Environment file already exists ✓"
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p storage
    
    print_info "Directories created ✓"
}

# Initialize database with Alembic
init_database() {
    print_info "Setting up database..."
    
    source venv/bin/activate
    
    # Generate initial migration if none exists
    if [ ! -d "alembic/versions" ] || [ -z "$(ls -A alembic/versions)" ]; then
        print_info "Generating initial migration..."
        alembic revision --autogenerate -m "Initial migration"
    fi
    
    # Run migrations
    print_info "Running database migrations..."
    alembic upgrade head
    
    print_info "Database setup complete ✓"
}

# Create a simple run script
create_run_script() {
    print_info "Creating run script..."
    
    cat > run_dev.sh << 'EOF'
#!/bin/bash
# Development server runner

echo "🚀 Starting FastAPI development server..."

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Run the development server
python main.py
EOF

    chmod +x run_dev.sh
    print_info "Run script created ✓"
}

# Main setup function
main() {
    echo "=================================="
    echo "Rialto Core Backend Setup"
    echo "=================================="
    
    check_python
    check_postgresql
    create_venv
    install_dependencies
    setup_env
    create_directories
    
    # Only initialize database if not using Docker
    if [ "$1" != "--docker" ]; then
        init_database
    fi
    
    create_run_script
    
    echo ""
    echo "=================================="
    print_info "🎉 Setup complete!"
    echo "=================================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Start PostgreSQL server (or use Docker)"
    echo "3. Run './run_dev.sh' to start the development server"
    echo ""
    echo "Or use Docker:"
    echo "docker-compose up -d"
    echo ""
    echo "API will be available at: http://localhost:8000"
    echo "API docs will be available at: http://localhost:8000/docs"
}

# Run main function
main "$@" 