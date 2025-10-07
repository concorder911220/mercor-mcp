import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: 32,
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.grey[700]}`,
    '& fieldset': {
      border: 'none'
    },
    '&:hover fieldset': {
      border: 'none'
    },
    '&.Mui-focused fieldset': {
      border: 'none'
    }
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(0.5, 1.5),
    '&::placeholder': {
      color: theme.palette.text.primary,
      opacity: 1
    }
  }
}));

type SearchFieldProps = TextFieldProps & {
  placeholder?: string;
};

const SearchField = ({ placeholder = "Search...", ...props }: SearchFieldProps) => {
  return <StyledTextField placeholder={placeholder} {...props} />;
};

export default SearchField;
