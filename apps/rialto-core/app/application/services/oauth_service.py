import secrets
import requests
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple
from urllib.parse import urlencode
from uuid import UUID
from sqlalchemy.orm import Session

from app.core.config import settings
from app.application.services.user_token_service import UserTokenService
from app.application.schemas.user_token import UserTokenCreate, ServiceType

logger = logging.getLogger(__name__)


class OAuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_token_service = UserTokenService(db)

    def generate_auth_url(self, service: str, state: Optional[str] = None) -> str:
        """Generate OAuth authorization URL for the specified service"""
        if not state:
            state = secrets.token_urlsafe(16)
        
        service_upper = service.upper()
        
        if service_upper == "DROPBOX":
            return self._generate_dropbox_auth_url(state)
        elif service_upper == "OUTLOOK":
            return self._generate_outlook_auth_url(state)
        elif service_upper == "SALESFORCE":
            return self._generate_salesforce_auth_url(state)
        elif service_upper == "QUICKBOOKS":
            return self._generate_quickbooks_auth_url(state)
        else:
            raise ValueError(f"Unsupported service: {service}")

    def _generate_dropbox_auth_url(self, state: str) -> str:
        """Generate Dropbox OAuth authorization URL with offline access for refresh tokens"""
        params = {
            'client_id': settings.dropbox_client_id,
            'response_type': 'code',
            'redirect_uri': settings.dropbox_redirect_uri,
            'token_access_type': 'offline',  # CRITICAL: Required for refresh tokens
            'scope': 'account_info.write account_info.read files.metadata.write files.metadata.read files.content.write files.content.read sharing.write sharing.read file_requests.write file_requests.read contacts.write contacts.read',  # All required scopes
            'state': state
        }
        return f"https://www.dropbox.com/oauth2/authorize?{urlencode(params)}"

    def _generate_outlook_auth_url(self, state: str) -> str:
        """Generate Microsoft Outlook OAuth authorization URL"""
        # Comprehensive Microsoft Graph scopes for calendar and mail access
        scopes = [
            'https://graph.microsoft.com/User.Read',           # Sign in and read user profile
            'https://graph.microsoft.com/Mail.Read',           # Read mail in all mailboxes
            'https://graph.microsoft.com/Mail.ReadBasic',      # Read basic mail in all mailboxes
            'https://graph.microsoft.com/Mail.ReadWrite',      # Read and write mail in all mailboxes
            'https://graph.microsoft.com/Mail.Send',           # Send mail as any user
            'https://graph.microsoft.com/Calendars.Read',      # Read calendars in all mailboxes
            'https://graph.microsoft.com/Calendars.ReadWrite', # Read and write calendars in all mailboxes
            'offline_access'                                    # Maintain access to data you have given it access to
        ]
        
        params = {
            'client_id': settings.outlook_client_id,
            'response_type': 'code',
            'redirect_uri': settings.outlook_redirect_uri,
            'scope': ' '.join(scopes),
            'state': state
        }
        return f"https://login.microsoftonline.com/{settings.azure_tenant_id}/oauth2/v2.0/authorize?{urlencode(params)}"

    def _generate_salesforce_auth_url(self, state: str) -> str:
        """Generate Salesforce OAuth authorization URL"""
        params = {
            'client_id': settings.salesforce_client_id,
            'response_type': 'code',
            'redirect_uri': settings.salesforce_redirect_uri,
            'scope': 'api refresh_token',
            'state': state
        }
        return f"https://{settings.salesforce_domain}/services/oauth2/authorize?{urlencode(params)}"

    def _generate_quickbooks_auth_url(self, state: str) -> str:
        """Generate QuickBooks OAuth authorization URL"""
        # QuickBooks uses the same OAuth URL for both sandbox and production
        base_url = "https://appcenter.intuit.com/connect/oauth2"
        params = {
            'client_id': settings.quickbooks_client_id,
            'scope': 'com.intuit.quickbooks.accounting',
            'redirect_uri': settings.quickbooks_redirect_uri,
            'response_type': 'code',
            'access_type': 'offline',
            'state': state
        }
        return f"{base_url}?{urlencode(params)}"

    async def exchange_code_for_token(self, service: str, code: str, user_id: UUID, realm_id: Optional[str] = None) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        service_upper = service.upper()
        
        if service_upper == "DROPBOX":
            return await self._exchange_dropbox_code(code, user_id)
        elif service_upper == "OUTLOOK":
            return await self._exchange_outlook_code(code, user_id)
        elif service_upper == "SALESFORCE":
            return await self._exchange_salesforce_code(code, user_id)
        elif service_upper == "QUICKBOOKS":
            return await self._exchange_quickbooks_code(code, user_id, realm_id)
        else:
            raise ValueError(f"Unsupported service: {service}")

    async def _exchange_dropbox_code(self, code: str, user_id: UUID) -> Dict[str, Any]:
        """Exchange Dropbox authorization code for tokens"""
        data = {
            'code': code,
            'grant_type': 'authorization_code',
            'client_id': settings.dropbox_client_id,
            'client_secret': settings.dropbox_client_secret,
            'redirect_uri': settings.dropbox_redirect_uri
        }
        
        response = requests.post(
            'https://api.dropboxapi.com/oauth2/token',
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to exchange code for token: {response.text}")
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in', 14400)  # Default 4 hours if not provided
        
        # Use actual expiry time from Dropbox response
        # Ensure UTC storage
        utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)
        expires_at = utc_now + timedelta(seconds=expires_in)
        
        # Prepare token data - include all relevant fields
        token_dict = {
            'access_token': access_token,
            'expires_in': expires_in
        }
        if refresh_token:
            token_dict['refresh_token'] = refresh_token
        
        # Save token to database
        user_token_create = UserTokenCreate(
            user_id=user_id,
            service_type=ServiceType.DROPBOX,
            token=token_dict,
            expires_at=expires_at
        )
        
        saved_token = self.user_token_service.create_user_token(user_token_create)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_at': expires_at.isoformat(),
            'expires_in': expires_in,
            'token_id': saved_token.id
        }

    async def _exchange_outlook_code(self, code: str, user_id: UUID) -> Dict[str, Any]:
        """Exchange Outlook authorization code for tokens"""
        data = {
            'code': code,
            'grant_type': 'authorization_code',
            'client_id': settings.outlook_client_id,
            'client_secret': settings.outlook_client_secret,
            'redirect_uri': settings.outlook_redirect_uri
        }
        
        response = requests.post(
            f'https://login.microsoftonline.com/{settings.azure_tenant_id}/oauth2/v2.0/token',
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to exchange code for token: {response.text}")
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in', 3600)
        
        # Ensure UTC storage
        utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)
        expires_at = utc_now + timedelta(seconds=expires_in)
        
        # Prepare token data (only include refresh_token if it exists)
        token_dict = {'access_token': access_token, 'expires_in': expires_in}
        if refresh_token:
            token_dict['refresh_token'] = refresh_token
        
        # Save token to database
        user_token_create = UserTokenCreate(
            user_id=user_id,
            service_type=ServiceType.OUTLOOK,
            token=token_dict,
            expires_at=expires_at
        )
        
        saved_token = self.user_token_service.create_user_token(user_token_create)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_at': expires_at.isoformat(),
            'expires_in': expires_in,
            'token_id': saved_token.id
        }

    async def _exchange_salesforce_code(self, code: str, user_id: UUID) -> Dict[str, Any]:
        """Exchange Salesforce authorization code for tokens"""
        data = {
            'code': code,
            'grant_type': 'authorization_code',
            'client_id': settings.salesforce_client_id,
            'client_secret': settings.salesforce_client_secret,
            'redirect_uri': settings.salesforce_redirect_uri
        }
        
        response = requests.post(
            f'https://{settings.salesforce_domain}/services/oauth2/token',
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to exchange code for token: {response.text}")
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        instance_url = token_data.get('instance_url')
        
        # Salesforce tokens don't have a fixed expiry, but we'll set a reasonable default
        # Ensure UTC storage
        utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)
        expires_at = utc_now + timedelta(hours=2)
        
        # Save token to database
        user_token_create = UserTokenCreate(
            user_id=user_id,
            service_type=ServiceType.SALESFORCE,
            token={
                'access_token': access_token, 
                'refresh_token': refresh_token,
                'instance_url': instance_url
            },
            expires_at=expires_at
        )
        
        saved_token = self.user_token_service.create_user_token(user_token_create)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'instance_url': instance_url,
            'expires_at': expires_at.isoformat(),
            'token_id': saved_token.id
        }

    async def _exchange_quickbooks_code(self, code: str, user_id: UUID, realm_id: Optional[str] = None) -> Dict[str, Any]:
        """Exchange QuickBooks authorization code for tokens"""
        # Determine the base URL based on sandbox setting
        base_url = "https://sandbox-quickbooks.api.intuit.com" if settings.quickbooks_sandbox else "https://quickbooks.api.intuit.com"
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': settings.quickbooks_redirect_uri
        }
        
        # QuickBooks requires Basic Auth for token exchange
        import base64
        auth_string = f"{settings.quickbooks_client_id}:{settings.quickbooks_client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        response = requests.post(
            'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            data=data,
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to exchange QuickBooks code for token: {response.text}")
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in', 3600)  # Default to 1 hour
        # Use the realmId passed from the callback URL
        realmId = realm_id
        
        # Calculate expiration time - ensure it's stored as UTC
        utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)
        expires_at = utc_now + timedelta(seconds=expires_in)
        
        # Save token to database
        user_token_create = UserTokenCreate(
            user_id=user_id,
            service_type=ServiceType.QUICKBOOKS,
            token={
                'access_token': access_token,
                'refresh_token': refresh_token,
                'realmId': realmId,
                'base_url': base_url,
                'sandbox': settings.quickbooks_sandbox
            },
            expires_at=expires_at
        )
        
        saved_token = self.user_token_service.create_user_token(user_token_create)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'realmId': realmId,
            'base_url': base_url,
            'expires_at': expires_at.isoformat(),
            'token_id': saved_token.id
        }

    async def validate_token(self, service: str, token_data: Dict[str, Any]) -> bool:
        """Validate if a token is still valid by making a test API call"""
        service_upper = service.upper()
        
        try:
            if service_upper == "DROPBOX":
                return await self._validate_dropbox_token(token_data)
            elif service_upper == "OUTLOOK":
                return await self._validate_outlook_token(token_data)
            elif service_upper == "SALESFORCE":
                return await self._validate_salesforce_token(token_data)
            elif service_upper == "QUICKBOOKS":
                return await self._validate_quickbooks_token(token_data)
            else:
                return False
        except Exception:
            return False

    async def _validate_dropbox_token(self, token_data: Dict[str, Any]) -> bool:
        """Validate Dropbox token by making a test API call"""
        access_token = token_data.get('access_token')
        if not access_token:
            return False
        
        response = requests.post(
            'https://api.dropboxapi.com/2/users/get_current_account',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        return response.status_code == 200

    async def _validate_outlook_token(self, token_data: Dict[str, Any]) -> bool:
        """Validate Outlook token by making a test API call"""
        access_token = token_data.get('access_token')
        if not access_token:
            return False
        
        response = requests.get(
            'https://graph.microsoft.com/v1.0/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        return response.status_code == 200

    async def _validate_salesforce_token(self, token_data: Dict[str, Any]) -> bool:
        """Validate Salesforce token by making a test API call"""
        access_token = token_data.get('access_token')
        instance_url = token_data.get('instance_url')
        if not access_token or not instance_url:
            return False
        
        response = requests.get(
            f'{instance_url}/services/data/v55.0/sobjects/',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        return response.status_code == 200

    async def _validate_quickbooks_token(self, token_data: Dict[str, Any]) -> bool:
        """Validate QuickBooks token by making a test API call"""
        access_token = token_data.get('access_token')
        base_url = token_data.get('base_url')
        realmId = token_data.get('realmId')
        
        if not access_token or not base_url or not realmId:
            logger.warning(f"QuickBooks validation failed - missing required fields: access_token={bool(access_token)}, base_url={bool(base_url)}, realmId={bool(realmId)}")
            return False
        
        try:
            # Test the token by getting company info
            url = f'{base_url}/v3/company/{realmId}/companyinfo/{realmId}'
            headers = {'Authorization': f'Bearer {access_token}', 'Accept': 'application/json'}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code != 200:
                logger.warning(f"QuickBooks API validation failed with status {response.status_code}")
            
            return response.status_code == 200
        except Exception as e:
            logger.error(f"QuickBooks token validation failed with exception: {e}")
            return False

    async def perform_health_check(self, service: str, token_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform detailed health check for a service token"""
        is_valid = await self.validate_token(service, token_data)
        
        health_result = {
            'valid': is_valid,
            'last_checked': datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()
        }
        
        if not is_valid:
            health_result['error'] = f'Token validation failed for {service}'
        
        return health_result

    async def refresh_quickbooks_token(self, user_id: UUID) -> Dict[str, Any]:
        """Refresh QuickBooks access token using refresh token"""
        # Get existing token
        existing_token = self.user_token_service.get_user_token_by_service(user_id, "QUICKBOOKS")
        if not existing_token:
            raise Exception("No QuickBooks token found to refresh")
        
        refresh_token = existing_token.token.get('refresh_token')
        if not refresh_token:
            raise Exception("No refresh token available for QuickBooks")
        
        # QuickBooks token refresh endpoint
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token
        }
        
        # QuickBooks requires Basic Auth for token refresh
        import base64
        auth_string = f"{settings.quickbooks_client_id}:{settings.quickbooks_client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        response = requests.post(
            'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            data=data,
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to refresh QuickBooks token: {response.text}")
        
        token_data = response.json()
        new_access_token = token_data.get('access_token')
        new_refresh_token = token_data.get('refresh_token')  # QuickBooks gives new refresh token!
        expires_in = token_data.get('expires_in', 3600)
        
        # Calculate new expiration time - ensure UTC storage
        utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)
        new_expires_at = utc_now + timedelta(seconds=expires_in)
        
        # DETAILED LOGGING FOR REFRESH
        logger.info(f"=== REFRESHING QUICKBOOKS TOKEN ===")
        logger.info(f"UTC now: {utc_now}")
        logger.info(f"New expires in: {expires_in} seconds")
        logger.info(f"New expires_at: {new_expires_at}")
        logger.info(f"New expires_at type: {type(new_expires_at)}")
        logger.info(f"New expires_at tzinfo: {new_expires_at.tzinfo}")
        logger.info(f"=== END REFRESH DEBUG ===")
        
        # Update existing token with new values
        updated_token = existing_token.token.copy()
        updated_token['access_token'] = new_access_token
        if new_refresh_token:  # Store new refresh token if provided
            updated_token['refresh_token'] = new_refresh_token
        
        # Update in database
        from app.application.schemas.user_token import UserTokenUpdate
        update_data = UserTokenUpdate(
            token=updated_token,
            expires_at=new_expires_at
        )
        self.user_token_service.update_user_token(existing_token.id, update_data)
        
        return {
            'access_token': new_access_token,
            'refresh_token': new_refresh_token,
            'expires_at': new_expires_at.isoformat(),
            'expires_in': expires_in
        }

    async def refresh_outlook_token(self, user_id: UUID) -> Dict[str, Any]:
        """Refresh Microsoft Outlook access token using refresh token"""
        # Get existing token
        existing_token = self.user_token_service.get_user_token_by_service(user_id, "OUTLOOK")
        if not existing_token:
            raise Exception("No Outlook token found to refresh")
        
        refresh_token = existing_token.token.get('refresh_token')
        if not refresh_token:
            raise Exception("No refresh token available for Outlook")
        
        # Microsoft Graph token refresh endpoint
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': settings.outlook_client_id,
            'client_secret': settings.outlook_client_secret
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        response = requests.post(
            f'https://login.microsoftonline.com/{settings.azure_tenant_id}/oauth2/v2.0/token',
            data=data,
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to refresh Outlook token: {response.text}")
        
        token_data = response.json()
        new_access_token = token_data.get('access_token')
        new_refresh_token = token_data.get('refresh_token')  # Microsoft provides new refresh token
        expires_in = token_data.get('expires_in', 3600)
        
        # Calculate new expiration time - ensure UTC storage
        utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)
        new_expires_at = utc_now + timedelta(seconds=expires_in)
        
        # DETAILED LOGGING FOR REFRESH
        logger.info(f"=== REFRESHING OUTLOOK TOKEN ===")
        logger.info(f"UTC now: {utc_now}")
        logger.info(f"New expires in: {expires_in} seconds")
        logger.info(f"New expires_at: {new_expires_at}")
        logger.info(f"New expires_at type: {type(new_expires_at)}")
        logger.info(f"New expires_at tzinfo: {new_expires_at.tzinfo}")
        logger.info(f"=== END REFRESH DEBUG ===")
        
        # Update existing token with new values
        updated_token = existing_token.token.copy()
        updated_token['access_token'] = new_access_token
        if new_refresh_token:  # Store new refresh token if provided
            updated_token['refresh_token'] = new_refresh_token
        updated_token['expires_in'] = expires_in
        
        # Update in database
        from app.application.schemas.user_token import UserTokenUpdate
        update_data = UserTokenUpdate(
            token=updated_token,
            expires_at=new_expires_at
        )
        self.user_token_service.update_user_token(existing_token.id, update_data)
        
        return {
            'access_token': new_access_token,
            'refresh_token': new_refresh_token,
            'expires_at': new_expires_at.isoformat(),
            'expires_in': expires_in
        }

    async def refresh_dropbox_token(self, user_id: UUID) -> Dict[str, Any]:
        """Refresh Dropbox access token using refresh token"""
        # Get existing token
        existing_token = self.user_token_service.get_user_token_by_service(user_id, "DROPBOX")
        if not existing_token:
            raise Exception("No Dropbox token found to refresh")
        
        refresh_token = existing_token.token.get('refresh_token')
        if not refresh_token:
            raise Exception("No refresh token available for Dropbox")
        
        # Dropbox token refresh endpoint
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': settings.dropbox_client_id,
            'client_secret': settings.dropbox_client_secret
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        response = requests.post(
            'https://api.dropboxapi.com/oauth2/token',
            data=data,
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to refresh Dropbox token: {response.text}")
        
        token_data = response.json()
        new_access_token = token_data.get('access_token')
        new_refresh_token = token_data.get('refresh_token')  # Dropbox may provide new refresh token
        expires_in = token_data.get('expires_in', 14400)  # Default 4 hours if not provided
        
        # Calculate new expiration time - ensure UTC storage
        utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)
        new_expires_at = utc_now + timedelta(seconds=expires_in)
        
        # DETAILED LOGGING FOR REFRESH
        logger.info(f"=== REFRESHING DROPBOX TOKEN ===")
        logger.info(f"UTC now: {utc_now}")
        logger.info(f"New expires in: {expires_in} seconds")
        logger.info(f"New expires_at: {new_expires_at}")
        logger.info(f"New expires_at type: {type(new_expires_at)}")
        logger.info(f"New expires_at tzinfo: {new_expires_at.tzinfo}")
        logger.info(f"=== END REFRESH DEBUG ===")
        
        # Update existing token with new values
        updated_token = existing_token.token.copy()
        updated_token['access_token'] = new_access_token
        if new_refresh_token:  # Store new refresh token if provided
            updated_token['refresh_token'] = new_refresh_token
        updated_token['expires_in'] = expires_in
        
        # Update in database
        from app.application.schemas.user_token import UserTokenUpdate
        update_data = UserTokenUpdate(
            token=updated_token,
            expires_at=new_expires_at
        )
        self.user_token_service.update_user_token(existing_token.id, update_data)
        
        return {
            'access_token': new_access_token,
            'refresh_token': new_refresh_token,
            'expires_at': new_expires_at.isoformat(),
            'expires_in': expires_in
        }

    def get_user_by_email(self, email: str) -> Optional[UUID]:
        """Map email to user ID - can be extended to query users table by email"""
        # For now, we can implement a simple lookup by querying the users table
        # This would require adding user_service as a dependency
        # For the current implementation, we'll return None and require authentication
        # TODO: Implement user lookup by email from database
        return None
