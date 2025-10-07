import { styled } from '@mui/material/styles';
import { Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

export const StyledAccordion = styled(Accordion, {
  name: 'TaskGroup',
  slot: 'Accordion',
})(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  marginBottom: theme.spacing(2.5),
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  border: 'none',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: 0,
    marginBottom: theme.spacing(2.5),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    boxShadow: 'none',
  },
}));

export const StyledAccordionSummary = styled(AccordionSummary, {
  name: 'TaskGroup',
  slot: 'Summary',
})(({ theme }) => ({
  padding: theme.spacing(1, 1.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: `${theme.spacing(2.5)} ${theme.spacing(2.5)} 0 0`,
  margin: 0,
  minHeight: 48,
  height: 48,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&.Mui-expanded': {
    minHeight: 48,
    height: 48,
    backgroundColor: theme.palette.background.paper,
    borderRadius: `${theme.spacing(2.5)} ${theme.spacing(2.5)} 0 0`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiAccordionSummary-content': {
    margin: 0,
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
  },
}));

export const StyledAccordionDetails = styled(AccordionDetails, {
  name: 'TaskGroup',
  slot: 'Details',
})(({ theme }) => ({
  padding: 0,
  borderRadius: `0 0 ${theme.spacing(2.5)} ${theme.spacing(2.5)}`,
  overflow: 'hidden',
}));

export const StyledCountChip = styled(Box, {
  name: 'TaskGroup',
  slot: 'CountChip',
})(({ theme }) => ({
  display: 'inline-block',
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.action.hover,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
  fontSize: theme.typography.caption.fontSize,
  fontFamily: theme.typography.fontFamily,
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.text.secondary,
}));

export const StyledTaskContainer = styled(Box, {
  name: 'TaskGroup',
  slot: 'TaskContainer',
  shouldForwardProp: (prop) => prop !== 'isJoined',
})<{ isJoined?: boolean }>(({ theme, isJoined }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  ...(isJoined && {
    borderLeft: '6px solid',
    borderLeftColor: theme.palette.grey[300],
  }),
  '& .task-entering': {
    animation: 'taskEnter 0.3s ease-out',
    '@keyframes taskEnter': {
      '0%': {
        opacity: 0,
        transform: 'translateY(-10px) scale(0.95)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
      },
    },
  },
  
  '& .task-exiting': {
    animation: 'taskExit 0.3s ease-in',
    '@keyframes taskExit': {
      '0%': {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
      },
      '100%': {
        opacity: 0,
        transform: 'translateY(-10px) scale(0.95)',
      },
    },
  },
}));
