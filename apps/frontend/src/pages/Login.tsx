import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StyledButton = styled(Button)({
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '16px',
  marginBottom: '12px',
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  alignItems: 'center'
});

const GoogleButton = styled(StyledButton)({
  backgroundColor: '#F5F5F5',
  color: '#000000',
  '&:hover': {
    backgroundColor: '#EEEEEE'
  }
});

const MicrosoftButton = styled(StyledButton)({
  backgroundColor: '#F5F5F5',
  color: '#000000',
  '&:hover': {
    backgroundColor: '#EEEEEE'
  }
});

const LoginButton = styled(StyledButton)({
  backgroundColor: '#2F2F2F',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#1F1F1F'
  }
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 8,
        px: 2
      }}
    >
      <Box
        component="img"
        src="/Rialto_logotext.png"
        sx={{
          width: 280,
          mb: 8,
          objectFit: 'contain'
        }}
      />
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
        Log in to your account
      </Typography>
      
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <GoogleButton startIcon={
          <img src="https://www.google.com/favicon.ico" width="20" height="20" alt="Google" />
        }>
          Sign in with Google
        </GoogleButton>
        
        <MicrosoftButton startIcon={
          <img src="https://www.microsoft.com/favicon.ico" width="20" height="20" alt="Microsoft" />
        }>
          Sign in with Microsoft
        </MicrosoftButton>

        <Typography sx={{ textAlign: 'center', my: 2, color: 'text.secondary' }}>
          Or
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          placeholder="test@rialto-financial.com"
          sx={{ mb: 2 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        
        <TextField
          fullWidth
          type="password"
          placeholder="••••••••"
          sx={{ mb: 3 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <LoginButton onClick={handleSubmit}>
          Log in
        </LoginButton>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          color: 'text.secondary'
        }}>
          <Link href="#" underline="hover" color="inherit">
            Forgot Password?
          </Link>
          <Box>
            <Link href="#" underline="hover" color="inherit">
              Terms of Service
            </Link>
            {' | '}
            <Link href="#" underline="hover" color="inherit">
              Privacy Policy
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
