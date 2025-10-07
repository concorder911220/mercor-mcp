#!/usr/bin/env python3
"""
Create default admin user for development
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from sqlalchemy.orm import Session
from app.infrastructure.database.connection import get_db
from app.application.services.user_service import UserService
from app.application.schemas.user import UserCreate

def create_admin_user():
    """Create a default admin user"""
    print("Creating default admin user...")
    
    # Get database session
    db = next(get_db())
    
    try:
        user_service = UserService(db)
        
        # Check if admin user already exists
        existing_user = user_service.get_user_by_email("admin@rialto-financial.com")
        if existing_user:
            print("Admin user already exists!")
            return
        
        # Create admin user
        admin_data = UserCreate(
            username="admin",
            email="admin@rialto-financial.com",
            password="admin123",
            role="ADMIN"
        )
        
        admin_user = user_service.create_user(admin_data)
        print(f"Admin user created successfully: {admin_user.username}")
        print(f"Email: {admin_user.email}")
        print(f"Role: {admin_user.role}")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        raise
    finally:
        db.close()

def create_test_user():
    """Create a test user"""
    print("Creating test user...")
    
    # Get database session
    db = next(get_db())
    
    try:
        user_service = UserService(db)
        
        # Check if test user already exists
        existing_user = user_service.get_user_by_email("test@rialto-financial.com")
        if existing_user:
            print("Test user already exists!")
            return
        
        # Create test user
        test_data = UserCreate(
            username="testuser",
            email="test@rialto-financial.com",
            password="test123",
            role="USER"
        )
        
        test_user = user_service.create_user(test_data)
        print(f"Test user created successfully: {test_user.username}")
        print(f"Email: {test_user.email}")
        print(f"Role: {test_user.role}")
        
    except Exception as e:
        print(f"Error creating test user: {e}")
        raise
    finally:
        db.close()

def main():
    """Main function"""
    print("Creating default users for development...")
    
    create_admin_user()
    create_test_user()
    
    print("\nDefault users created!")
    print("You can now login with:")
    print("  Admin: admin@rialto-financial.com / admin123")
    print("  Test:  test@rialto-financial.com / test123")

if __name__ == "__main__":
    main()
