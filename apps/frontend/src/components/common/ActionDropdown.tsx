
import { useState } from 'react';
import { Button, Menu, MenuItem, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const StyledButton = styled(Button)<ButtonProps>(({ theme }) => ({
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

interface ActionDropdownProps {
  label: string;
  options: { label: string; onClick: () => void }[];
  disabled?: boolean;
}

export default function ActionDropdown({ label, options, disabled }: ActionDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionClick = (onClick: () => void) => {
    onClick();
    handleClose();
  };

  return (
    <>
      <StyledButton
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        disabled={disabled}
      >
        {label}
      </StyledButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {options.map((option, index) => (
          <MenuItem 
            key={index}
            onClick={() => handleOptionClick(option.onClick)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
