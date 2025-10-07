import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const PanelsWrapper = styled(Box)`
  display: flex;
  align-items: flex-start;
  flex: 1;
  overflow: hidden;
  gap: 24px;
  width: 100%;
`;

export const LeftPanel = styled(Box)`
  flex: 0 0 60%;
  max-width: 60%;
  display: flex;
  flex-direction: column;
  height: 100%;
  @media (max-width: 900px) {
    flex: 0 0 100%;
    max-width: 100%;
  }
`;

export const RightPanel = styled(Box)`
  flex: 0 0 40%;
  max-width: 40%;
  @media (max-width: 900px) {
    flex: 0 0 100%;
    max-width: 100%;
  }
`;