import { basicApi } from '../basicApi';

// OAuth Token types
export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  instance_url?: string;
}

export interface OAuthTokenStatus {
  connected: boolean;
  valid: boolean;
  token: OAuthToken | null;
  expires_at: string | null;
  id: string | null;
  expired?: boolean;
  error?: string;
}

export interface OAuthTokensResponse {
  dropbox: OAuthTokenStatus;
  outlook: OAuthTokenStatus;
  salesforce: OAuthTokenStatus;
}

export interface OAuthHealthResponse {
  service: string;
  connected: boolean;
  health: {
    valid: boolean;
    error?: string;
    last_checked?: string;
  };
  expires_at?: string;
  token_id?: string;
}

const apiWithTag = basicApi.enhanceEndpoints({});

export const oauthApi = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    // Get all OAuth token statuses
    getOAuthTokens: build.query<OAuthTokensResponse, void>({
      query: () => ({
        url: '/oauth/api/tokens',
        method: 'GET',
      }),
      providesTags: ['OAuthTokens'],
    }),

    // Get health status for a specific service
    getOAuthHealth: build.query<OAuthHealthResponse, string>({
      query: (service) => ({
        url: `/oauth/api/health/${service}`,
        method: 'GET',
      }),
      providesTags: (result, error, service) => [{ type: 'OAuthHealth', id: service }],
    }),

    // Get token by email and service (for mail integration)
    getTokenByEmail: build.query<any, { email: string; service: string }>({
      query: ({ email, service }) => ({
        url: `/oauth/api/user-tokens/email/${email}/service/${service}`,
        method: 'GET',
      }),
      providesTags: (result, error, { email, service }) => [
        { type: 'OAuthToken', id: `${email}-${service}` }
      ],
    }),

    // Get OAuth URL (returns the OAuth provider URL)
    getOAuthUrl: build.query<{ auth_url: string; session_id: string }, string>({
      query: (service) => ({
        url: `/oauth/auth/${service}/url`,
        method: 'GET',
      }),
    }),

    // Initiate OAuth flow (returns redirect URL)
    initiateOAuth: build.mutation<{ url: string }, string>({
      query: (service) => ({
        url: `/oauth/auth/${service}`,
        method: 'GET',
        // This will trigger a redirect, so we handle it differently
      }),
      invalidatesTags: ['OAuthTokens'],
    }),

    // Refresh OAuth tokens (trigger a re-fetch)
    refreshOAuthTokens: build.mutation<void, void>({
      query: () => ({
        url: '/oauth/api/tokens',
        method: 'GET',
      }),
      invalidatesTags: ['OAuthTokens', 'OAuthHealth'],
    }),
  }),
});

export const {
  useGetOAuthTokensQuery,
  useLazyGetOAuthTokensQuery,
  useGetOAuthHealthQuery,
  useLazyGetOAuthHealthQuery,
  useGetTokenByEmailQuery,
  useLazyGetTokenByEmailQuery,
  useGetOAuthUrlQuery,
  useLazyGetOAuthUrlQuery,
  useInitiateOAuthMutation,
  useRefreshOAuthTokensMutation,
} = oauthApi;
