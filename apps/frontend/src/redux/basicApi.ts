
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'

export const getApiUrl = (): string => {
    const currentDomain = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If we're in development, use localhost
    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
        return import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1` : 'http://localhost:8000/api/v1';
    }
    
    // In production, construct the core API subdomain
    return `${protocol}//core.api.${currentDomain}/api/v1`;
};

// Custom base query with auth error handling
const baseQueryWithAuth = fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers, { getState }) => {
        // Get token from localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQueryWithAuth(args, api, extraOptions);
    
    if (result.error && result.error.status === 401) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
            try {
                const refreshResponse = await fetch('http://localhost:8000/api/v1/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    const { access_token, refresh_token: newRefreshToken } = data;
                    
                    // Update tokens in localStorage
                    localStorage.setItem('auth_token', access_token);
                    if (newRefreshToken) {
                        localStorage.setItem('refresh_token', newRefreshToken);
                    }
                    
                    // Retry the original request with new token
                    result = await baseQueryWithAuth(args, api, extraOptions);
                } else {
                    // Refresh failed - redirect to login
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } catch (error) {
                // Refresh request failed - redirect to login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        } else {
            // No refresh token - redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }
    }
    
    return result;
}

export const basicApi = createApi({
    reducerPath: 'basicApi',
    baseQuery: retry(
        baseQueryWithReauth,
        { maxRetries: 0 },
    ),
    keepUnusedDataFor: 60 * 3,
    endpoints: () => ({}),
    tagTypes: ['Upcoming_Events', 'Messages', 'Tasks', 'Conversation', 'Conversations', 'OAuthTokens', 'OAuthHealth', 'OAuthToken'],
})
