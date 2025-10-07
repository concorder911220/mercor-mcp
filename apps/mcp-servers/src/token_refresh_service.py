"""
Token Refresh Service for MCP Servers

Provides automatic token refresh capabilities for expired OAuth tokens by directly
calling the third-party OAuth providers (Microsoft, Dropbox, QuickBooks). This
duplicates the refresh logic from the main Rialto API but allows MCP servers to
operate independently without requiring authentication to the main API.
"""

import os
import logging
import aiohttp
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from uuid import UUID
from pathlib import Path
import traceback

# Ensure environment is loaded before token refresh service initialization
try:
    from dotenv import load_dotenv
    current_file = Path(__file__).resolve()
    
    # Try .env first (local development), then secrets.env (Docker)
    env_files = [
        current_file.parent.parent / ".env",
        current_file.parent.parent / "secrets.env"
    ]
    
    for env_file in env_files:
        if env_file.exists():
            load_dotenv(dotenv_path=env_file)
            break
except ImportError:
    pass  # python-dotenv not available, rely on system environment variables

from database import get_token_service, TokenExpiredError, AuthenticationError

logger = logging.getLogger(__name__)


class TokenRefreshService:
    """Service for automatically refreshing expired OAuth tokens by calling third-party OAuth providers directly"""
    
    def __init__(self):
        self.timeout = int(os.getenv('TOKEN_REFRESH_TIMEOUT', '30'))
        
        # Validate required Azure tenant ID for Outlook OAuth
        azure_tenant_id = os.getenv('AZURE_TENANT_ID')
        if not azure_tenant_id:
            raise ValueError(
                "AZURE_TENANT_ID environment variable is required for Outlook OAuth. "
                "Please set it to your Azure AD tenant ID. The 'common' endpoint is not supported "
                "for single-tenant applications registered after October 15, 2018."
            )
        
        # OAuth endpoints for each service
        self.oauth_endpoints = {
            'OUTLOOK': f"https://login.microsoftonline.com/{azure_tenant_id}/oauth2/v2.0/token",
            'DROPBOX': 'https://api.dropboxapi.com/oauth2/token',
            'QUICKBOOKS': 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
        }
        
        # OAuth credentials environment variable mapping
        self.oauth_credentials = {
            'OUTLOOK': {
                'client_id': 'OUTLOOK_CLIENT_ID',
                'client_secret': 'OUTLOOK_CLIENT_SECRET',
                'use_basic_auth': False
            },
            'DROPBOX': {
                'client_id': 'DROPBOX_CLIENT_ID',
                'client_secret': 'DROPBOX_CLIENT_SECRET',
                'use_basic_auth': False
            },
            'QUICKBOOKS': {
                'client_id': 'QUICKBOOKS_CLIENT_ID',
                'client_secret': 'QUICKBOOKS_CLIENT_SECRET',
                'use_basic_auth': True  # QuickBooks uses Basic Auth
            }
        }
    
    async def refresh_service_token(self, user_id: str, service_type: str) -> bool:
        """
        Attempt to refresh an expired token by calling the OAuth provider directly
        
        Args:
            user_id: User identifier
            service_type: Service type (OUTLOOK, DROPBOX, QUICKBOOKS)
            
        Returns:
            True if refresh was successful, False otherwise
        """
        service_type_upper = service_type.upper()
        
        if service_type_upper not in self.oauth_endpoints:
            logger.warning(f"Token refresh not supported for service: {service_type}")
            return False
        
        logger.info(f"Starting token refresh for {service_type_upper}, user {user_id}")
        
        try:
            result = await self._refresh_oauth_token(user_id, service_type_upper)
            logger.info(f"Token refresh result for {service_type_upper}: {result}")
            return result
        except Exception as e:
            logger.error(f"Error refreshing {service_type} token for user {user_id}: {e}")            
            logger.error(f"Token refresh traceback: {traceback.format_exc()}")
            return False
    
    async def _refresh_oauth_token(self, user_id: str, service_type: str) -> bool:
        """
        Generic OAuth token refresh implementation - calls OAuth provider directly
        
        Args:
            user_id: User identifier
            service_type: Service type (OUTLOOK, DROPBOX, QUICKBOOKS)
        """
        try:
            # Get current token from database
            token_service = await get_token_service()
            
            async with token_service.async_session() as session:
                from database import UserTokenModel, ServiceTypeEnum
                from sqlalchemy import select
                
                user_uuid = UUID(user_id)
                service_enum = getattr(ServiceTypeEnum, service_type)
                
                stmt = select(UserTokenModel).where(
                    UserTokenModel.user_id == user_uuid,
                    UserTokenModel.service_type == service_enum
                )
                
                result = await session.execute(stmt)
                user_token = result.scalar_one_or_none()
                
                if not user_token:
                    logger.error(f"No token found for user {user_id} and service {service_type}")
                    return False
                
                refresh_token = user_token.token.get('refresh_token')
                if not refresh_token:
                    logger.error(f"No refresh token available for {service_type}")
                    return False
                
                # Get OAuth configuration for this service
                oauth_config = self.oauth_credentials[service_type]
                token_endpoint = self.oauth_endpoints[service_type]
                
                # Get OAuth credentials from environment
                client_id = os.getenv(oauth_config['client_id'])
                client_secret = os.getenv(oauth_config['client_secret'])
                
                logger.debug(f"OAuth config for {service_type}")
                
                if not client_id or not client_secret:
                    logger.error(f"Missing OAuth credentials for {service_type}. Please check your environment configuration.")
                    return False
                
                # Prepare refresh request
                data = {
                    'grant_type': 'refresh_token',
                    'refresh_token': refresh_token
                }
                
                headers = {'Content-Type': 'application/x-www-form-urlencoded'}
                
                if oauth_config['use_basic_auth']:
                    # QuickBooks uses Basic Auth
                    import base64
                    auth_string = f"{client_id}:{client_secret}"
                    auth_bytes = auth_string.encode('ascii')
                    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
                    headers['Authorization'] = f'Basic {auth_b64}'
                else:
                    # Microsoft/Dropbox include credentials in form data
                    data.update({
                        'client_id': client_id,
                        'client_secret': client_secret
                    })
                
                # Make refresh request to OAuth provider
                timeout = aiohttp.ClientTimeout(total=self.timeout)
                async with aiohttp.ClientSession(timeout=timeout) as http_session:
                    async with http_session.post(token_endpoint, data=data, headers=headers) as response:
                        if response.status != 200:
                            error_text = await response.text()
                            logger.error(f"Token refresh failed for {service_type}: HTTP {response.status} - {error_text}")
                            return False
                        
                        token_data = await response.json()
                        new_access_token = token_data.get('access_token')
                        new_refresh_token = token_data.get('refresh_token')
                        expires_in = token_data.get('expires_in', 3600)
                        
                        if not new_access_token:
                            logger.error(f"No access token in refresh response for {service_type}")
                            return False
                        
                        # Update token in database
                        updated_token = user_token.token.copy()
                        updated_token['access_token'] = new_access_token
                        if new_refresh_token:
                            updated_token['refresh_token'] = new_refresh_token
                        
                        # For Dropbox, also update expires_in field in token
                        if service_type == 'DROPBOX':
                            updated_token['expires_in'] = expires_in
                        
                        # Calculate new expiration
                        new_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                        
                        # Update the database record
                        user_token.token = updated_token
                        user_token.expires_at = new_expires_at
                        
                        await session.commit()
                        
                        logger.info(f"Successfully refreshed {service_type} token for user {user_id}, "
                                  f"new expiry: {new_expires_at}")
                        return True
                        
        except Exception as e:
            logger.error(f"Error in _refresh_oauth_token for {service_type}: {e}")
            return False
    
    async def get_user_token_with_refresh(self, user_id: str, service_type: str) -> str:
        """
        Get user token with automatic refresh if expired
        
        Args:
            user_id: User identifier
            service_type: Service type (OUTLOOK, DROPBOX, QUICKBOOKS)
            
        Returns:
            Valid access token
            
        Raises:
            AuthenticationError: If token retrieval/refresh fails permanently
        """
        try:
            # First, try to get the token normally
            logger.debug(f"Attempting to get token for user {user_id}, service {service_type}")
            token_service = await get_token_service()
            token = await token_service.get_user_token(user_id, service_type)
            logger.debug(f"Successfully retrieved token for user {user_id}, service {service_type}")
            return token
            
        except TokenExpiredError as e:
            logger.info(f"Token expired for user {user_id}, service {service_type}. Attempting refresh...")
            
            # Attempt to refresh the token
            try:
                refresh_success = await self.refresh_service_token(user_id, service_type)
                logger.info(f"Token refresh attempt result for {service_type}: {refresh_success}")
                
                if refresh_success:
                    # Token was refreshed, try to get it again
                    try:
                        token_service = await get_token_service()
                        new_token = await token_service.get_user_token(user_id, service_type)
                        logger.info(f"Successfully retrieved refreshed {service_type} token for user {user_id}")
                        return new_token
                    except Exception as retry_error:
                        logger.error(f"Failed to retrieve token after refresh: {retry_error}")
                        raise AuthenticationError(
                            f"Token refresh appeared successful but retrieval failed: {retry_error}"
                        ) from retry_error
                else:
                    # Refresh failed, raise the original error with additional context
                    logger.error(f"Token refresh failed for {service_type}, user {user_id}")
                    raise AuthenticationError(
                        f"Token expired and automatic refresh failed for {service_type}. "
                        f"Please re-authenticate via the web interface. Original error: {e}"
                    ) from e
            except Exception as refresh_error:
                logger.error(f"Exception during token refresh for {service_type}, user {user_id}: {refresh_error}")
                raise AuthenticationError(
                    f"Token refresh failed with error: {refresh_error}. Original expiry error: {e}"
                ) from refresh_error
        
        except AuthenticationError:
            # Re-raise authentication errors as-is
            raise
        
        except Exception as e:
            # Wrap other errors in AuthenticationError
            logger.error(f"Unexpected error retrieving token for user {user_id}: {e}")
            logger.error(f"Exception type: {type(e).__name__}")
            logger.error(f"Exception args: {e.args}")
            raise AuthenticationError(f"Failed to retrieve token: {e}") from e


# Global instance
_refresh_service: Optional[TokenRefreshService] = None


async def get_refresh_service() -> TokenRefreshService:
    """Get or create the global token refresh service instance"""
    global _refresh_service
    if _refresh_service is None:
        _refresh_service = TokenRefreshService()
    return _refresh_service


async def get_user_token_with_refresh(user_id: str, service_type: str) -> str:
    """
    Convenience function to get user token with automatic refresh
    
    Args:
        user_id: User identifier
        service_type: Service type (OUTLOOK, DROPBOX, QUICKBOOKS)
        
    Returns:
        Valid access token
        
    Raises:
        AuthenticationError: If token retrieval/refresh fails permanently
    """
    service = await get_refresh_service()
    return await service.get_user_token_with_refresh(user_id, service_type)
