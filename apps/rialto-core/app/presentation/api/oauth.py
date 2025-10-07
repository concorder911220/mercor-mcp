from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from uuid import UUID
import logging
import secrets
import json
from datetime import datetime, timedelta, timezone

from app.infrastructure.database.connection import get_db
from app.application.services.oauth_service import OAuthService
from app.application.services.user_token_service import UserTokenService
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.application.schemas.auth import AuthenticatedUser
from app.core.auth import auth

router = APIRouter(prefix="/oauth", tags=["oauth"])
logger = logging.getLogger(__name__)

# In-memory session store for OAuth state
# In production, you'd want to use Redis or a database table
oauth_sessions = {}

def create_oauth_session(user_id: UUID, service: str) -> str:
    """Create a temporary OAuth session and return session ID"""
    session_id = secrets.token_urlsafe(32)
    oauth_sessions[session_id] = {
        'user_id': str(user_id),
        'service': service,
        'created_at': datetime.utcnow().replace(tzinfo=timezone.utc),
        'expires_at': datetime.utcnow().replace(tzinfo=timezone.utc) + timedelta(minutes=10)  # 10 minute expiry
    }
    # Clean up expired sessions
    cleanup_expired_sessions()
    return session_id

def get_oauth_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Get OAuth session data"""
    session = oauth_sessions.get(session_id)
    if session and datetime.utcnow().replace(tzinfo=timezone.utc) < session['expires_at']:
        return session
    elif session:
        # Clean up expired session
        oauth_sessions.pop(session_id, None)
    return None

def cleanup_expired_sessions():
    """Clean up expired OAuth sessions"""
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    expired_sessions = [
        session_id for session_id, data in oauth_sessions.items()
        if now > data['expires_at']
    ]
    for session_id in expired_sessions:
        oauth_sessions.pop(session_id, None)





@router.get("/")
def oauth_root():
    """OAuth service status endpoint"""
    return {
        "status": "ok", 
        "service": "third-party-auth backend",
        "available_services": ["dropbox", "outlook", "salesforce"]
    }


# Dropbox OAuth Routes
@router.get("/auth/dropbox/url")
def get_dropbox_auth_url(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Dropbox OAuth URL (returns JSON instead of redirecting)"""
    oauth_service = OAuthService(db)
    try:
        # Create OAuth session
        session_id = create_oauth_session(current_user.user_id, "dropbox")
        
        # Generate auth URL with session ID as state
        auth_url = oauth_service.generate_auth_url("dropbox", session_id)
        return {"auth_url": auth_url, "session_id": session_id}
    except Exception as e:
        logger.error(f"Dropbox auth URL generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Dropbox auth URL: {str(e)}")

@router.get("/auth/dropbox")
def initiate_dropbox_auth(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate Dropbox OAuth flow (for direct navigation)"""
    oauth_service = OAuthService(db)
    try:
        # Create OAuth session
        session_id = create_oauth_session(current_user.user_id, "dropbox")
        
        # Generate auth URL with session ID as state
        auth_url = oauth_service.generate_auth_url("dropbox", session_id)
        return RedirectResponse(url=auth_url)
    except Exception as e:
        logger.error(f"Dropbox auth initiation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate Dropbox auth: {str(e)}")


@router.get("/auth/dropbox/callback")
async def dropbox_callback(
    code: str = Query(..., description="Authorization code from Dropbox"),
    state: str = Query(None, description="State parameter"),
    error: str = Query(None, description="Error from OAuth provider"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle Dropbox OAuth callback - redirects to frontend"""
    frontend_base = settings.frontend_origin
    
    if error:
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"{frontend_base}/oauth/callback/dropbox?error={error}",
            status_code=302
        )
    
    if not code:
        return RedirectResponse(
            url=f"{frontend_base}/oauth/callback/dropbox?error=missing_parameters",
            status_code=302
        )
    
    try:
        # Use authenticated user ID from JWT token
        user_id = current_user.user_id
        logger.info(f"Processing Dropbox OAuth callback for user {user_id}")
        
        oauth_service = OAuthService(db)
        
        # Exchange code for token
        token_result = await oauth_service.exchange_code_for_token("dropbox", code, user_id)
        
        # Log successful token save
        logger.info(f"Successfully saved Dropbox token for user {user_id}. Token ID: {token_result.get('token_id')}")
        
        # Redirect to frontend with success - redirect to agents page
        return RedirectResponse(
            url=f"{frontend_base}/oauth/callback/dropbox?success=true&redirect=agents",
            status_code=302
        )
        
    except Exception as e:
        logger.error(f"Dropbox OAuth error for user {current_user.user_id}: {e}")
        return RedirectResponse(
            url=f"{frontend_base}/oauth/callback/dropbox?error=token_exchange_failed",
            status_code=302
        )


# Microsoft Outlook OAuth Routes
@router.get("/auth/outlook/url")
def get_outlook_auth_url(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Outlook OAuth URL (returns JSON instead of redirecting)"""
    oauth_service = OAuthService(db)
    try:
        # Create OAuth session
        session_id = create_oauth_session(current_user.user_id, "outlook")
        
        # Generate auth URL with session ID as state
        auth_url = oauth_service.generate_auth_url("outlook", session_id)
        return {"auth_url": auth_url, "session_id": session_id}
    except Exception as e:
        logger.error(f"Outlook auth URL generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Outlook auth URL: {str(e)}")

@router.get("/auth/outlook")
def initiate_outlook_auth(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate Outlook OAuth flow (for direct navigation)"""
    oauth_service = OAuthService(db)
    try:
        # Create OAuth session
        session_id = create_oauth_session(current_user.user_id, "outlook")
        
        # Generate auth URL with session ID as state
        auth_url = oauth_service.generate_auth_url("outlook", session_id)
        return RedirectResponse(url=auth_url)
    except Exception as e:
        logger.error(f"Outlook auth initiation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate Outlook auth: {str(e)}")


@router.get("/auth/outlook/callback")
async def outlook_callback(
    code: str = Query(..., description="Authorization code from Microsoft"),
    state: str = Query(None, description="State parameter"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle Outlook OAuth callback"""
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not received")
    
    oauth_service = OAuthService(db)
    
    try:
        # Use authenticated user ID from JWT token
        user_id = current_user.user_id
        logger.info(f"Processing Outlook OAuth callback for user {user_id}")
        
        token_result = await oauth_service.exchange_code_for_token("outlook", code, user_id)
        logger.info(f"Outlook token exchange successful for user {user_id}")
        
        if not token_result.get('refresh_token'):
            logger.warning('No refresh token received from Microsoft. User may need to re-authorize for offline access.')
        
        # Redirect to frontend with success
        frontend_callback_url = f"{settings.frontend_origin}/auth/outlook/callback?success=true&redirect=agents"
        return RedirectResponse(url=frontend_callback_url)
        
    except Exception as e:
        logger.error(f"Outlook OAuth error for user {current_user.user_id}: {e}")
        # Redirect to frontend with error
        frontend_callback_url = f"{settings.frontend_origin}/auth/outlook/callback?error=token_exchange_failed"
        return RedirectResponse(url=frontend_callback_url)


# Salesforce OAuth Routes
@router.get("/auth/salesforce/url")
def get_salesforce_auth_url(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Salesforce OAuth URL (returns JSON instead of redirecting)"""
    oauth_service = OAuthService(db)
    try:
        # Create OAuth session
        session_id = create_oauth_session(current_user.user_id, "salesforce")
        
        # Generate auth URL with session ID as state
        auth_url = oauth_service.generate_auth_url("salesforce", session_id)
        return {"auth_url": auth_url, "session_id": session_id}
    except Exception as e:
        logger.error(f"Salesforce auth URL generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Salesforce auth URL: {str(e)}")

@router.get("/auth/salesforce")
def initiate_salesforce_auth(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate Salesforce OAuth flow (for direct navigation)"""
    oauth_service = OAuthService(db)
    try:
        # Create OAuth session
        session_id = create_oauth_session(current_user.user_id, "salesforce")
        
        # Generate auth URL with session ID as state
        auth_url = oauth_service.generate_auth_url("salesforce", session_id)
        return RedirectResponse(url=auth_url)
    except Exception as e:
        logger.error(f"Salesforce auth initiation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate Salesforce auth: {str(e)}")


@router.get("/auth/salesforce/callback")
async def salesforce_callback(
    code: str = Query(..., description="Authorization code from Salesforce"),
    state: str = Query(None, description="State parameter"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle Salesforce OAuth callback"""
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not received")
    
    oauth_service = OAuthService(db)
    
    try:
        # Use authenticated user ID from JWT token
        user_id = current_user.user_id
        logger.info(f"Processing Salesforce OAuth callback for user {user_id}")
        
        token_result = await oauth_service.exchange_code_for_token("salesforce", code, user_id)
        logger.info(f"Salesforce token exchange successful for user {user_id}")
        
        # Redirect to frontend with success
        frontend_callback_url = f"{settings.frontend_origin}/auth/salesforce/callback?success=true&redirect=agents"
        return RedirectResponse(url=frontend_callback_url)
        
    except Exception as e:
        logger.error(f"Salesforce OAuth error for user {current_user.user_id}: {e}")
        # Redirect to frontend with error
        frontend_callback_url = f"{settings.frontend_origin}/auth/salesforce/callback?error=token_exchange_failed"
        return RedirectResponse(url=frontend_callback_url)


# QuickBooks OAuth Routes
@router.get("/auth/quickbooks/url")
def get_quickbooks_auth_url(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get QuickBooks OAuth URL (returns JSON instead of redirecting)"""
    oauth_service = OAuthService(db)
    try:
        session_id = create_oauth_session(current_user.user_id, "quickbooks")
        auth_url = oauth_service.generate_auth_url("quickbooks", session_id)
        return {"auth_url": auth_url, "session_id": session_id}
    except Exception as e:
        logger.error(f"QuickBooks auth URL generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate QuickBooks auth URL: {str(e)}")


@router.get("/auth/quickbooks")
def quickbooks_auth(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate QuickBooks OAuth flow"""
    oauth_service = OAuthService(db)
    try:
        # Create OAuth session
        session_id = create_oauth_session(current_user.user_id, "quickbooks")
        
        # Generate auth URL with session ID as state
        auth_url = oauth_service.generate_auth_url("quickbooks", session_id)
        return RedirectResponse(url=auth_url)
    except Exception as e:
        logger.error(f"QuickBooks auth initiation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate QuickBooks auth: {str(e)}")


@router.get("/auth/quickbooks/callback")
async def quickbooks_callback(
    request: Request,
    code: str = Query(..., description="Authorization code from QuickBooks"),
    state: str = Query(None, description="State parameter"),
    realmId: str = Query(None, description="QuickBooks Company ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle QuickBooks OAuth callback"""
    # Check for alternative parameter names for realmId
    query_params = dict(request.query_params)
    realm_alternatives = ['realmId', 'companyID', 'realm_id', 'company_id', 'companyId', 'CompanyID']
    found_realm = None
    for alt in realm_alternatives:
        if alt in query_params:
            found_realm = query_params[alt]
            break
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not received")
    
    oauth_service = OAuthService(db)
    
    try:
        # Use authenticated user ID from JWT token
        user_id = current_user.user_id
        final_realm_id = found_realm or realmId
        
        # CRITICAL: QuickBooks requires realmId for all API calls
        if not final_realm_id:
            logger.error("QuickBooks token creation failed: realmId parameter missing")
            # Redirect with error
            frontend_callback_url = f"{settings.frontend_origin}/auth/quickbooks/callback?error=missing_realm_id&message=QuickBooks+app+configuration+issue"
            return RedirectResponse(url=frontend_callback_url)
        
        # Note: We need to pass realmId to the token exchange method
        token_result = await oauth_service.exchange_code_for_token("quickbooks", code, user_id, final_realm_id)
        logger.info(f"QuickBooks token exchange successful for user {user_id}")
        
        # Redirect to frontend with success
        frontend_callback_url = f"{settings.frontend_origin}/auth/quickbooks/callback?success=true&redirect=agents"
        return RedirectResponse(url=frontend_callback_url)
        
    except Exception as e:
        logger.error(f"QuickBooks OAuth error for user {current_user.user_id}: {e}")
        # Redirect to frontend with error
        frontend_callback_url = f"{settings.frontend_origin}/auth/quickbooks/callback?error=token_exchange_failed"
        return RedirectResponse(url=frontend_callback_url)


# Token Management Endpoints
@router.get("/api/user-tokens/email/{email}/service/{service}")
async def get_token_by_email(
    email: str,
    service: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get token by user email (for mail integration)
    
    Note: Currently requires authentication. For system-to-system integration,
    you might want to implement API key authentication or service accounts.
    """
    service_upper = service.upper()
    
    logger.info(f"Token request by email: {email} for service: {service_upper} by user: {current_user.user_id}")
    
    user_token_service = UserTokenService(db)
    
    try:
        # For security, only allow users to access their own tokens by email
        # or implement admin/system access for service integrations
        if current_user.email != email and not current_user.is_admin():
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Access denied",
                    "message": "You can only access your own tokens"
                }
            )
        
        # Use the authenticated user's ID
        user_id = current_user.user_id
        
        # Get token from database
        token_data = user_token_service.get_user_token_by_service(user_id, service_upper)
        
        if not token_data:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "Token not found",
                    "message": f"No {service_upper} token found for user {email}"
                }
            )
        
        logger.info(f"Successfully retrieved token for {email}: service={service_upper}, "
                   f"expires_at={token_data.expires_at}, "
                   f"has_access_token={bool(token_data.token.get('access_token'))}, "
                   f"has_refresh_token={bool(token_data.token.get('refresh_token'))}")
        
        return token_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving token for email {email}, service {service_upper}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": f"Failed to retrieve token: {str(e)}"
            }
        )


@router.get("/api/health/{service}")
async def service_health_check(
    service: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Health check endpoint for specific service tokens"""
    service_upper = service.upper()
    
    user_token_service = UserTokenService(db)
    oauth_service = OAuthService(db)
    
    try:
        token_data = user_token_service.get_user_token_by_service(current_user.user_id, service_upper)
        
        if not token_data:
            return {
                "service": service,
                "connected": False,
                "health": {"valid": False, "error": "No token found"}
            }
        
        # Perform detailed health check
        health_result = await oauth_service.perform_health_check(service_upper, token_data.token)
        
        return {
            "service": service,
            "connected": True,
            "health": health_result,
            "expires_at": token_data.expires_at.isoformat(),
            "token_id": str(token_data.id)
        }
        
    except Exception as e:
        logger.error(f"Health check error for {service}: {e}")
        return {
            "service": service,
            "connected": False,
            "health": {"valid": False, "error": str(e)}
        }


@router.get("/api/tokens")
async def get_token_statuses(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """API endpoint to get stored tokens status - gets user from auth token automatically"""
    user_token_service = UserTokenService(db)
    oauth_service = OAuthService(db)
    
    try:
        logger.info(f"Fetching OAuth token statuses for user {current_user.user_id} ({current_user.email})")
        
        token_statuses = {}
        services = ['OUTLOOK', 'DROPBOX', 'SALESFORCE', 'QUICKBOOKS']
        
        # Get all user tokens at once for debugging
        all_user_tokens = user_token_service.get_tokens_by_user(current_user.user_id)
        logger.info(f"Found {len(all_user_tokens)} total tokens for user {current_user.user_id}")
        
        for service in services:
            try:
                logger.debug(f"Checking {service} token for user {current_user.user_id}")
                token_data = user_token_service.get_user_token_by_service(current_user.user_id, service)
                
                if token_data:
                    # Check if token is expired - normalize everything to UTC for comparison
                    now = datetime.utcnow().replace(tzinfo=timezone.utc)
                    
                    # Convert expires_at to UTC regardless of how it's stored
                    if token_data.expires_at.tzinfo is None:
                        # If naive, assume it's UTC
                        expires_at_utc = token_data.expires_at.replace(tzinfo=timezone.utc)
                    else:
                        # Convert any timezone to UTC
                        expires_at_utc = token_data.expires_at.astimezone(timezone.utc)
                    
                    is_expired = now >= expires_at_utc
                    
                    # Auto-refresh tokens if expired but refresh token available
                    if is_expired and token_data.token.get('refresh_token'):
                        try:
                            if service == 'QUICKBOOKS':
                                logger.info(f"Auto-refreshing expired QuickBooks token for user {current_user.user_id}")
                                await oauth_service.refresh_quickbooks_token(current_user.user_id)
                            elif service == 'OUTLOOK':
                                logger.info(f"Auto-refreshing expired Outlook token for user {current_user.user_id}")
                                await oauth_service.refresh_outlook_token(current_user.user_id)
                            elif service == 'DROPBOX':
                                logger.info(f"Auto-refreshing expired Dropbox token for user {current_user.user_id}")
                                await oauth_service.refresh_dropbox_token(current_user.user_id)
                            else:
                                # Skip auto-refresh for services that don't support it yet
                                logger.info(f"Auto-refresh not implemented for {service}")
                                continue
                            
                            # Re-fetch token data after refresh
                            token_data = user_token_service.get_user_token_by_service(current_user.user_id, service)
                            if token_data:
                                # Re-check expiration with proper timezone handling
                                if token_data.expires_at.tzinfo is None:
                                    expires_at_utc = token_data.expires_at.replace(tzinfo=timezone.utc)
                                else:
                                    expires_at_utc = token_data.expires_at.astimezone(timezone.utc)
                                is_expired = now >= expires_at_utc
                                logger.info(f"{service} token auto-refreshed for user {current_user.user_id}, new expiry: {expires_at_utc}")
                        except Exception as refresh_error:
                            logger.error(f"Auto-refresh failed for {service} token: {refresh_error}")
                    
                    # Validate token with service API (if not expired)
                    is_valid = False
                    if not is_expired:
                        try:
                            is_valid = await oauth_service.validate_token(service, token_data.token)
                        except Exception as validation_error:
                            logger.warning(f"Token validation failed for {service}: {validation_error}")
                            is_valid = False
                    
                    token_statuses[service.lower()] = {
                        "connected": True,
                        "valid": is_valid and not is_expired,
                        "expired": is_expired,
                        "token": token_data.token,
                        "expires_at": token_data.expires_at.isoformat(),
                        "id": str(token_data.id)
                    }
                    
                    logger.info(f"{service} token found: expires_at={token_data.expires_at}, expired={is_expired}, valid={is_valid}")
                else:
                    logger.info(f"No {service} token found for user {current_user.user_id}")
                    token_statuses[service.lower()] = {
                        "connected": False,
                        "valid": False,
                        "expired": False,
                        "token": None,
                        "expires_at": None,
                        "id": None
                    }
                    
            except Exception as error:
                logger.error(f"Error checking {service} token for user {current_user.user_id}: {error}")
                token_statuses[service.lower()] = {
                    "connected": False,
                    "valid": False,
                    "expired": False,
                    "token": None,
                    "expires_at": None,
                    "id": None,
                    "error": str(error)
                }
        
        logger.info(f"Returning token statuses for user {current_user.user_id}: {list(token_statuses.keys())}")
        return token_statuses
        
    except Exception as e:
        logger.error(f"Error fetching token statuses for user {current_user.user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch token statuses")


@router.post("/dropbox/refresh")
async def refresh_dropbox_token(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refresh an expired Dropbox token"""
    try:
        oauth_service = OAuthService(db)
        result = await oauth_service.refresh_dropbox_token(current_user.user_id)
        
        logger.info(f"Successfully refreshed Dropbox token for user {current_user.user_id}")
        return {
            "success": True,
            "message": "Dropbox token refreshed successfully",
            "token_info": {
                "expires_at": result["expires_at"],
                "expires_in": result["expires_in"]
            }
        }
    except Exception as e:
        logger.error(f"Failed to refresh Dropbox token for user {current_user.user_id}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to refresh Dropbox token: {str(e)}")


@router.post("/quickbooks/refresh")
async def refresh_quickbooks_token(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refresh an expired QuickBooks token"""
    try:
        oauth_service = OAuthService(db)
        result = await oauth_service.refresh_quickbooks_token(current_user.user_id)
        
        logger.info(f"Successfully refreshed QuickBooks token for user {current_user.user_id}")
        return {
            "success": True,
            "message": "QuickBooks token refreshed successfully",
            "token_info": {
                "expires_at": result["expires_at"],
                "expires_in": result["expires_in"]
            }
        }
    except Exception as e:
        logger.error(f"Failed to refresh QuickBooks token for user {current_user.user_id}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to refresh QuickBooks token: {str(e)}")


@router.post("/outlook/refresh")
async def refresh_outlook_token(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refresh an expired Outlook token"""
    try:
        oauth_service = OAuthService(db)
        result = await oauth_service.refresh_outlook_token(current_user.user_id)
        
        logger.info(f"Successfully refreshed Outlook token for user {current_user.user_id}")
        return {
            "success": True,
            "message": "Outlook token refreshed successfully",
            "token_info": {
                "expires_at": result["expires_at"],
                "expires_in": result["expires_in"]
            }
        }
    except Exception as e:
        logger.error(f"Failed to refresh Outlook token for user {current_user.user_id}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to refresh Outlook token: {str(e)}")