
import { Box } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { styled } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';

const LayoutRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: theme.palette.background.paper,
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  marginLeft: theme.spacing(18.75), // 150px sidebar width
  height: '100vh',
  backgroundColor: theme.palette.background.paper,
}));

export function MainLayout() {
  return (
    <LayoutRoot>
      <Sidebar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutRoot>
  );
}
