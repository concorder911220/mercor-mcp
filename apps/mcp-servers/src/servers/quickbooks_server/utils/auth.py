import aiohttp
import os
import sys
from datetime import datetime, timezone

# Import database token service and token refresh service
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from database import get_user_token as get_user_token_from_db, AuthenticationError as DBAuthenticationError, TokenExpiredError
from token_refresh_service import get_user_token_with_refresh


class AuthenticationError(Exception):
    pass


def normalize_user_id(raw_user_id: str) -> str:
    user_id = (raw_user_id or "").strip()
    if not user_id or user_id.lower() in {"user", "test", "me"}:
        fallback = os.getenv("TEST_USER_ID")
        if fallback:
            return fallback
    return user_id

async def get_user_qbo_token(user_id: str) -> str:
    user_id = normalize_user_id(user_id)
    
    try:
        # Try to get token with automatic refresh
        return await get_user_token_with_refresh(user_id, "QUICKBOOKS")
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Failed to get/refresh token from database: {e}, falling back to mock")
        return "mock_qbo_access_token_for_testing"


async def get_qbo_realm_id(user_id: str) -> str:
    user_id = normalize_user_id(user_id)
    # Realm ID may come from env first
    realm_id = os.getenv("QBO_REALM_ID")
    if realm_id:
        return realm_id
    
    try:
        # Try to get realm_id from database token
        from database import get_token_service
        service = await get_token_service()
        async with service.async_session() as session:
            from database import UserTokenModel, ServiceTypeEnum
            from sqlalchemy import select
            from uuid import UUID
            
            user_uuid = UUID(user_id)
            service_enum = ServiceTypeEnum.QUICKBOOKS
            
            stmt = select(UserTokenModel).where(
                UserTokenModel.user_id == user_uuid,
                UserTokenModel.service_type == service_enum
            )
            
            result = await session.execute(stmt)
            user_token = result.scalar_one_or_none()
            
            if user_token and user_token.token:
                token_data = user_token.token
                realm_id = token_data.get("realm_id") or token_data.get("company_id") or token_data.get("realmId")
                if realm_id:
                    return realm_id
        
        import logging
        logger = logging.getLogger(__name__)
        logger.debug("No realm_id found in database token, using mock")
        return "mock_realm_id_for_testing"
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Failed to get realm_id from database: {e}, falling back to mock")
        return "mock_realm_id_for_testing"


