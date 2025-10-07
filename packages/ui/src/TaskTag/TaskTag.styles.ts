import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledTag = styled(Box, {
  name: 'TaskTag',
  slot: 'Tag',
})(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,
  padding: `${theme.spacing(0.25)} ${theme.spacing(1)}`,
  borderRadius: theme.spacing(1),
}));
