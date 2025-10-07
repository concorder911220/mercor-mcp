#!/bin/bash

# FastAPI DDD Backend - Production Deployment Script
# This script deploys the application to production environment

set -e  # Exit on error

# Configuration
APP_NAME="Rialto-core-backend"
APP_USER="app"
APP_DIR="/opt/${APP_NAME}"
SYSTEMD_SERVICE="${APP_NAME}.service"
BACKUP_DIR="/opt/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Install system dependencies
install_system_deps() {
    print_step "Installing system dependencies..."
    
    apt-get update
    apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        postgresql-client \
        nginx \
        supervisor \
        git \
        curl \
        unzip
    
    print_info "System dependencies installed ✓"
}

# Create application user
create_app_user() {
    print_step "Creating application user..."
    
    if ! id "$APP_USER" &>/dev/null; then
        useradd -r -s /bin/false -d "$APP_DIR" "$APP_USER"
        print_info "User $APP_USER created ✓"
    else
        print_info "User $APP_USER already exists ✓"
    fi
}

# Setup application directory
setup_app_directory() {
    print_step "Setting up application directory..."
    
    mkdir -p "$APP_DIR"
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/uploads"
    mkdir -p "$APP_DIR/storage"
    mkdir -p "$BACKUP_DIR"
    
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    chown -R "$APP_USER:$APP_USER" "$BACKUP_DIR"
    
    print_info "Application directory setup complete ✓"
}

# Deploy application code
deploy_code() {
    print_step "Deploying application code..."
    
    # If this is an update, backup current version
    if [ -d "$APP_DIR/app" ]; then
        print_info "Backing up current version..."
        tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$APP_DIR" app
    fi
    
    # Copy new code
    cp -r . "$APP_DIR/app/"
    chown -R "$APP_USER:$APP_USER" "$APP_DIR/app"
    
    print_info "Application code deployed ✓"
}

# Setup Python environment
setup_python_env() {
    print_step "Setting up Python environment..."
    
    cd "$APP_DIR/app"
    
    # Create virtual environment as app user
    sudo -u "$APP_USER" python3 -m venv venv
    
    # Install dependencies
    sudo -u "$APP_USER" venv/bin/pip install --upgrade pip
    sudo -u "$APP_USER" venv/bin/pip install -r requirements.txt
    
    print_info "Python environment setup complete ✓"
}

# Setup environment file
setup_production_env() {
    print_step "Setting up production environment..."
    
    if [ ! -f "$APP_DIR/app/.env" ]; then
        cp "$APP_DIR/app/.env.example" "$APP_DIR/app/.env"
        
        # Set production defaults
        sed -i 's/DEBUG=True/DEBUG=False/' "$APP_DIR/app/.env"
        sed -i 's/RELOAD=True/RELOAD=False/' "$APP_DIR/app/.env"
        sed -i 's/DOCS_URL=\/docs/DOCS_URL=/' "$APP_DIR/app/.env"
        sed -i 's/REDOC_URL=\/redoc/REDOC_URL=/' "$APP_DIR/app/.env"
        
        chown "$APP_USER:$APP_USER" "$APP_DIR/app/.env"
        chmod 600 "$APP_DIR/app/.env"
        
        print_warning "Environment file created. Please edit $APP_DIR/app/.env with production values"
    else
        print_info "Environment file already exists ✓"
    fi
}

# Run database migrations
run_migrations() {
    print_step "Running database migrations..."
    
    cd "$APP_DIR/app"
    sudo -u "$APP_USER" venv/bin/alembic upgrade head
    
    print_info "Database migrations complete ✓"
}

# Setup systemd service
setup_systemd_service() {
    print_step "Setting up systemd service..."
    
    cat > "/etc/systemd/system/$SYSTEMD_SERVICE" << EOF
[Unit]
Description=Rialto Core Backend
After=network.target postgresql.service

[Service]
Type=exec
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR/app
Environment=PATH=$APP_DIR/app/venv/bin
ExecStart=$APP_DIR/app/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "$SYSTEMD_SERVICE"
    
    print_info "Systemd service setup complete ✓"
}

# Setup nginx reverse proxy
setup_nginx() {
    print_step "Setting up Nginx reverse proxy..."
    
    cat > "/etc/nginx/sites-available/$APP_NAME" << EOF
server {
    listen 80;
    server_name your-domain.com;  # Change this to your domain
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    location /static/ {
        alias $APP_DIR/app/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias $APP_DIR/app/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
EOF

    ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"
    nginx -t
    systemctl reload nginx
    
    print_info "Nginx setup complete ✓"
}

# Setup log rotation
setup_log_rotation() {
    print_step "Setting up log rotation..."
    
    cat > "/etc/logrotate.d/$APP_NAME" << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        systemctl reload $SYSTEMD_SERVICE
    endscript
}
EOF

    print_info "Log rotation setup complete ✓"
}

# Setup firewall (UFW)
setup_firewall() {
    print_step "Setting up firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw allow ssh
        ufw allow 'Nginx Full'
        ufw --force enable
        print_info "Firewall setup complete ✓"
    else
        print_warning "UFW not found, skipping firewall setup"
    fi
}

# Start services
start_services() {
    print_step "Starting services..."
    
    systemctl start "$SYSTEMD_SERVICE"
    systemctl status "$SYSTEMD_SERVICE" --no-pager
    
    print_info "Services started ✓"
}

# Main deployment function
main() {
    echo "=================================="
    echo "FastAPI DDD Backend Deployment"
    echo "=================================="
    
    check_root
    install_system_deps
    create_app_user
    setup_app_directory
    deploy_code
    setup_python_env
    setup_production_env
    run_migrations
    setup_systemd_service
    setup_nginx
    setup_log_rotation
    setup_firewall
    start_services
    
    echo ""
    echo "=================================="
    print_info "🎉 Deployment complete!"
    echo "=================================="
    echo ""
    print_warning "Important next steps:"
    echo "1. Edit $APP_DIR/app/.env with production values"
    echo "2. Update server_name in /etc/nginx/sites-available/$APP_NAME"
    echo "3. Setup SSL certificate (Let's Encrypt recommended)"
    echo "4. Configure database backups"
    echo "5. Setup monitoring and alerting"
    echo ""
    echo "Service management:"
    echo "- Start: systemctl start $SYSTEMD_SERVICE"
    echo "- Stop: systemctl stop $SYSTEMD_SERVICE"
    echo "- Restart: systemctl restart $SYSTEMD_SERVICE"
    echo "- Status: systemctl status $SYSTEMD_SERVICE"
    echo ""
    echo "Logs: journalctl -u $SYSTEMD_SERVICE -f"
}

# Run main function
main "$@" 