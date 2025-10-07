
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export const HomeSearchField = styled(TextField)`
  & .MuiOutlinedInput-root {
    height: 48px;
    border-radius: 8px;
  }
  & .MuiOutlinedInput-input {
    padding: 12px 14px;
  }
`;
