import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle,
  Schedule,
  Error,
  Edit,
  HourglassEmpty,
  RateReview
} from '@mui/icons-material';

export type StatusKind = 'forReview' | 'inProgress' | 'completed' | 'error' | 'draft' | 'pending';

export interface StatusPillProps extends Omit<ChipProps, 'color' | 'variant'> {
  kind: StatusKind;
  size?: 'small' | 'medium';
}

const getStatusConfig = (theme: any) => ({
  forReview: {
    label: 'For Review',
    icon: RateReview,
    color: theme.palette.info.main,
    backgroundColor: theme.palette.info.light,
  },
  inProgress: {
    label: 'In Progress',
    icon: Schedule,
    color: theme.palette.warning.main,
    backgroundColor: theme.palette.warning.light,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: theme.palette.success.main,
    backgroundColor: theme.palette.success.light,
  },
  error: {
    label: 'Error',
    icon: Error,
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.light,
  },
  draft: {
    label: 'Draft',
    icon: Edit,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover,
  },
  pending: {
    label: 'Pending',
    icon: HourglassEmpty,
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.secondary.light,
  },
});

const StyledChip = styled(Chip)<{ kind: StatusKind }>(({ theme, kind }) => {
  const config = getStatusConfig(theme)[kind];
  
  return {
    backgroundColor: config.backgroundColor,
    color: config.color,
    fontWeight: theme.typography.fontWeightMedium,
    '& .MuiChip-icon': {
      color: config.color,
    },
    '&:hover': {
      backgroundColor: config.backgroundColor,
      opacity: 0.8,
    },
    '&.MuiChip-clickable:hover': {
      backgroundColor: config.backgroundColor,
      opacity: 0.8,
    },
  };
});

export const StatusPill = React.forwardRef<HTMLDivElement, StatusPillProps>(
  ({ kind, size = 'medium', ...props }, ref) => {
    const statusLabels = {
      forReview: 'For Review',
      inProgress: 'In Progress', 
      completed: 'Completed',
      error: 'Error',
      draft: 'Draft',
      pending: 'Pending'
    };

    const statusIcons = {
      forReview: RateReview,
      inProgress: Schedule,
      completed: CheckCircle,
      error: Error,
      draft: Edit,
      pending: HourglassEmpty
    };

    const IconComponent = statusIcons[kind];

    return (
      <StyledChip
        ref={ref}
        kind={kind}
        label={statusLabels[kind]}
        icon={<IconComponent />}
        size={size}
        variant="filled"
        {...props}
      />
    );
  }
);

StatusPill.displayName = 'StatusPill';