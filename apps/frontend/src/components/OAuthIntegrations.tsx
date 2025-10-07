import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { StandardPanel } from './common/StandardPanel';
import ActionButton from './common/ActionButton';
import { 
  useGetOAuthTokensQuery,
  useRefreshOAuthTokensMutation,
  useLazyGetOAuthUrlQuery,
  OAuthTokenStatus 
} from '../redux/oauth/oauthApi';

interface ServiceConfig {
  key: string;
  label: string;
  icon: string;
  color: string;
}

const services: ServiceConfig[] = [
  { key: 'dropbox', label: 'Dropbox', icon: '📦', color: '#0061fe' },
  { key: 'salesforce', label: 'Salesforce', icon: '☁️', color: '#00a1e0' },
  { key: 'outlook', label: 'Outlook', icon: '📧', color: '#0078d4' },
  { key: 'quickbooks', label: 'QuickBooks', icon: '💰', color: '#0077c5' },
];

interface ServiceCardProps {
  service: ServiceConfig;
  status: OAuthTokenStatus;
  onAuthorize: (serviceKey: string) => void;
}

function ServiceCard({ service, status, onAuthorize }: ServiceCardProps) {
  const getStatusInfo = () => {
    if (!status.connected) {
      return {
        icon: <ErrorIcon sx={{ fontSize: 16 }} />,
        label: 'Not Connected',
        color: 'error' as const,
        bgcolor: 'rgba(211, 47, 47, 0.1)',
      };
    }
    if (status.expired || !status.valid) {
      return {
        icon: <WarningIcon sx={{ fontSize: 16 }} />,
        label: 'Expired',
        color: 'warning' as const,
        bgcolor: 'rgba(237, 108, 2, 0.1)',
      };
    }
    return {
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      label: 'Connected',
      color: 'success' as const,
      bgcolor: 'rgba(46, 125, 50, 0.1)',
    };
  };

  const statusInfo = getStatusInfo();
  const isExpired = status.connected && (status.expired || !status.valid);

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minHeight: 140,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2em',
            bgcolor: 'rgba(0, 0, 0, 0.04)',
            borderRadius: 1,
          }}
        >
          {service.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {service.label}
          </Typography>
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.label}
            size="small"
            sx={{
              mt: 0.5,
              height: 20,
              fontSize: '0.75rem',
              bgcolor: statusInfo.bgcolor,
              color: `${statusInfo.color}.main`,
              '& .MuiChip-icon': {
                color: `${statusInfo.color}.main`,
              },
            }}
          />
        </Box>
      </Box>

      {status.connected && status.expires_at && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Expires: {new Date(status.expires_at).toLocaleDateString()}
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 'auto' }}>
        <ActionButton
          onClick={() => onAuthorize(service.key)}
          sx={{
            width: '100%',
            bgcolor: isExpired ? 'warning.main' : status.connected ? 'success.main' : service.color,
            color: 'white',
            '&:hover': {
              bgcolor: isExpired ? 'warning.dark' : status.connected ? 'success.dark' : service.color,
              opacity: 0.9,
            },
          }}
          endIcon={<LaunchIcon fontSize="small" />}
        >
          {isExpired ? 'Refresh' : status.connected ? 'Reconnect' : 'Connect'}
        </ActionButton>
      </Box>
    </Box>
  );
}

export function OAuthIntegrations() {
  const { 
    data: tokens, 
    error, 
    isLoading, 
    refetch 
  } = useGetOAuthTokensQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const [refreshTokens, { isLoading: isRefreshing }] = useRefreshOAuthTokensMutation();
  const [getOAuthUrl] = useLazyGetOAuthUrlQuery();

  const handleRefresh = async () => {
    try {
      await refreshTokens().unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to refresh tokens:', err);
    }
  };

  const handleAuthorize = async (serviceKey: string) => {
    // Get the access token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please log in first to connect services.');
      return;
    }

    try {
      // Store the current path to return to after OAuth
      sessionStorage.setItem('oauth_return_path', window.location.pathname);
      
      // Get the OAuth URL from the backend
      const response = await getOAuthUrl(serviceKey).unwrap();
      
      // Navigate directly to the OAuth provider URL
      window.location.href = response.auth_url;
      
    } catch (error: any) {
      console.error('OAuth URL generation error:', error);
      
      if (error.status === 401) {
        alert('Authentication required. Please log in again.');
      } else {
        alert(`Failed to start OAuth flow: ${error.data?.detail || 'Unknown error'}`);
      }
    }
  };

  if (isLoading) {
    return (
      <StandardPanel title="OAuth Integrations">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </StandardPanel>
    );
  }

  if (error) {
    return (
      <StandardPanel title="OAuth Integrations">
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load OAuth integrations. Please ensure you're logged in and try again.
        </Alert>
      </StandardPanel>
    );
  }

  return (
    <StandardPanel
      title="OAuth Integrations"
      actions={
        <Tooltip title="Refresh token status">
          <IconButton
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="small"
            sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}
          >
            {isRefreshing ? (
              <CircularProgress size={16} />
            ) : (
              <RefreshIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      }
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Connect your third-party services to enable AI agents to access your data securely.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
        }}
      >
        {services.map((service) => (
          <ServiceCard
            key={service.key}
            service={service}
            status={tokens?.[service.key as keyof typeof tokens] || {
              connected: false,
              valid: false,
              token: null,
              expires_at: null,
              id: null,
            }}
            onAuthorize={handleAuthorize}
          />
        ))}
      </Box>

      {tokens && Object.values(tokens).some(status => status.connected) && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
          <Typography variant="body2" color="primary">
            <strong>Connected Services:</strong>{' '}
            {Object.entries(tokens)
              .filter(([, status]) => status.connected)
              .map(([service]) => service.charAt(0).toUpperCase() + service.slice(1))
              .join(', ')}
          </Typography>
        </Box>
      )}
    </StandardPanel>
  );
}
