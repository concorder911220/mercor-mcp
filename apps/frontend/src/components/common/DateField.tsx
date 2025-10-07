import React, { useState } from 'react';
import { Box, Typography, TextField as MuiTextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateField({ value, onChange }: DateFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date | null>(value ? new Date(value) : null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsEditing(true);
  };

  const handleClickAway = () => {
    setIsEditing(false);
    setAnchorEl(null);
  };

  const handleChange = (newDate: Date | null) => {
    setDate(newDate);
    if (newDate) {
      onChange(newDate.toLocaleDateString());
    }
    setIsEditing(false);
    setAnchorEl(null);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box onClick={handleClick} sx={{ 
        cursor: 'pointer',
        border: `1px solid ${isEditing ? '#666666' : '#e0e0e0'}`,
        p: 1,
        borderRadius: 1,
        width: '140px',
        height: '24px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
          <Typography 
            color="text.secondary" 
            sx={{ 
              fontSize: '0.875rem',
              '&:hover': {
                color: 'text.primary'
              }
            }}
          >
            {value}
          </Typography>
        </Box>
        {isEditing && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker 
              value={date}
              onChange={handleChange}
              open={true}
              slotProps={{
                popper: {
                  anchorEl: anchorEl,
                  placement: 'bottom-start'
                }
              }}
              sx={{
                width: 0,
                height: 0,
                overflow: 'hidden',
                '& .MuiInputBase-root': {
                  display: 'none'
                }
              }}
            />
          </LocalizationProvider>
        )}
      </Box>
    </ClickAwayListener>
  );
}