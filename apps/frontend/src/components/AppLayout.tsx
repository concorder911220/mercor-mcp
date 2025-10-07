
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const Root = styled(Box)`
  display: flex;
  height: 100vh;
  background: ${({ theme }) => theme.palette.background.default};
`;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return <Root>{children}</Root>;
}
