import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';
import { getApiUrl } from "../redux/basicApi";

export function OAuthCallback() {

    const { provider } = useParams()
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const [message, setMessage] = useState('Completing authorization...')

    useEffect(() => {
        const code = params.get('code')
        const state = params.get('state')
        const realmId = params.get('realmId') // QuickBooks company ID
        
        if (!code) {
            setMessage('Missing authorization code')
            return
        }

        // Clean up old OAuth entries (older than 10 minutes)
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i)
            if (key?.startsWith('oauth_')) {
                try {
                    const item = sessionStorage.getItem(key)
                    const timestamp = parseInt(key.split('_').pop() || '0')
                    if (timestamp < tenMinutesAgo) {
                        sessionStorage.removeItem(key)
                    }
                } catch (e) {
                    // Remove invalid entries
                    sessionStorage.removeItem(key)
                }
            }
        }

        // Prevent duplicate code exchanges
        const processedKey = `oauth_${provider}_${code}_${Date.now()}`
        const existingKey = Object.keys(sessionStorage).find(key =>
            key.startsWith(`oauth_${provider}_${code}_`)
        )

        if (existingKey) {
            setMessage('Authorization already processed. Redirecting...')
            setTimeout(() => navigate('/'), 1000)
            return
        }

        // Mark as being processed
        sessionStorage.setItem(processedKey, 'processing')

        async function finishAuth() {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('auth_token')
                if (!token) {
                    setMessage('Authentication required. Please log in first.')
                    setTimeout(() => navigate('/login'), 2000)
                    return
                }

                // Build callback URL with all available parameters
                let callbackUrl = `${getApiUrl()}/oauth/auth/${provider}/callback?code=${encodeURIComponent(code ?? '')}`
                if (state) {
                    callbackUrl += `&state=${encodeURIComponent(state)}`
                }
                if (realmId) {
                    callbackUrl += `&realmId=${encodeURIComponent(realmId)}`
                }
                
                const res = await fetch(callbackUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                if (!res.ok) throw new Error('Callback failed')

                // Mark as completed
                sessionStorage.setItem(processedKey, 'completed')
                setMessage('Authorization successful. Redirecting...')
                setTimeout(() => navigate('/agents'), 1200)
            } catch (e) {
                console.error(e)
                // Remove the processing flag on error so user can retry
                sessionStorage.removeItem(processedKey)
                setMessage('Authorization failed. Please try again.')
            }
        }

        finishAuth()
    }, [provider, params, navigate])

    const handleReturnHome = () => {
        const returnPath = sessionStorage.getItem('oauth_return_path') || '/agents';
        sessionStorage.removeItem('oauth_return_path');
        navigate(returnPath);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.default',
            }}
        >
            {status === 'processing' && (
                <>
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        {message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please wait while we complete the authorization...
                    </Typography>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom color="success.main">
                        Authorization Successful!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Redirecting you back to the previous page...
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<HomeIcon />}
                        onClick={handleReturnHome}
                    >
                        Return Now
                    </Button>
                </>
            )}

            {status === 'error' && (
                <>
                    <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom color="error.main">
                        Authorization Failed
                    </Typography>
                    <Alert severity="error" sx={{ mt: 2, mb: 3, maxWidth: 500 }}>
                        {message}
                    </Alert>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Please try connecting the service again.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={handleReturnHome}
                    >
                        Return to Integrations
                    </Button>
                </>
            )}
        </Box>
    );
}
