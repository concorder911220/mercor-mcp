import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export const StyledContainer = styled(Box, {
  name: 'TaskDashboard',
  slot: 'Container',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  gap: 0,
  backgroundColor: 'transparent',
  borderRight: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[4],
  overflow: 'hidden',
  zIndex: 2,
  position: 'relative',
  padding: 0,
  margin: 0
}));

export const StyledHeader = styled(Box, {
  name: 'TaskDashboard',
  slot: 'Header',
})(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`
}));

export const StyledHeaderContent = styled(Box, {
  name: 'TaskDashboard',
  slot: 'HeaderContent',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`
}));

export const StyledContent = styled(Box, {
  name: 'TaskDashboard',
  slot: 'Content',
})(({ theme }) => ({
  padding: theme.spacing(2.5),
  flex: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.text.disabled,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.text.secondary,
    },
  },
}));

export const StyledDashboard = styled(Box, {
  name: 'TaskDashboard',
  slot: 'Dashboard',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  minWidth: 200,
  padding: 0,
}));
