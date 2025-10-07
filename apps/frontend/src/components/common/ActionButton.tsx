
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const ActionButton = styled(Button)<ButtonProps>(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 2,
  height: 32,
  padding: theme.spacing(0.5, 1.5),
  border: `1px solid ${theme.palette.grey[700]}`,
  color: theme.palette.text.primary,
  '&:disabled': {
    color: theme.palette.text.secondary,
    borderColor: theme.palette.grey[500]
  }
}));

export default ActionButton;
