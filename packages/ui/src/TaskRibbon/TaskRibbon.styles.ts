import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { Button } from '../Button';
import { TaskRibbonColor } from './TaskRibbonColorMapping';

export const StyledTaskRibbon = styled(Button, {
  name: 'TaskRibbon',
  slot: 'Ribbon',
  shouldForwardProp: (prop: string) => !['color', 'disabled', 'isJoined'].includes(prop),
})<{ color?: TaskRibbonColor; disabled?: boolean; isJoined?: boolean }>(({ theme, color, disabled, isJoined }) => ({
  height: 'auto',
  minHeight: 60,
  width: '100%',
  justifyContent: 'flex-start',
  borderRadius: 0,
  padding: theme.spacing(1.5, 2), 
  textAlign: 'left',
  textTransform: 'none',
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.fontWeightRegular,
  minWidth: 'auto',
  border: 'none', 
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none', 
  transition: 'all 0.2s ease',
  borderBottom: isJoined ? `1px dashed ${theme.palette.divider}` : `1px solid ${theme.palette.divider}`,
  
  '&:hover': {
    backgroundColor: theme.palette.action.hover, 
    transform: 'none',
    boxShadow: 'none',
  },
  '&:active': {
    transform: 'scale(0.98)',
    transition: 'transform 0.1s ease',
  },
  // Remove bottom border from last ribbon
  '&.last-ribbon': {
    borderBottom: 'none',
  },
  // Disabled state
  ...(disabled && {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      transform: 'none',
      boxShadow: 'none',
    },
  }),
}));

export const StyledRibbonContent = styled(Box, {
  name: 'TaskRibbon',
  slot: 'Content',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  width: '100%',
}));

export const StyledRibbonMainRow = styled(Box, {
  name: 'TaskRibbon',
  slot: 'MainRow',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  width: '100%',
}));

export const StyledRibbonLeft = styled(Box, {
  name: 'TaskRibbon',
  slot: 'Left',
})(({ theme }) => ({
  display: 'flex', 
  alignItems: 'center', 
  gap: theme.spacing(1),
  flex: 1,
}));

export const StyledRibbonColorIndicator = styled(Box, {
  name: 'TaskRibbon',
  slot: 'ColorIndicator',
})(({ theme }) => ({
  width: 14, // Hardcoded color square
  height: 14, 
  borderRadius: theme.spacing(0.25), 
}));

export const StyledRibbonLabel = styled(Box, {
  name: 'TaskRibbon',
  slot: 'Label',
})(({ theme }) => ({
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.body2.fontSize,
}));

export const StyledRibbonActivity = styled(Box, {
  name: 'TaskRibbon',
  slot: 'Activity',
})(({ theme }) => ({
  justifySelf: 'end',
  fontSize: theme.typography.caption.fontSize,
  color: 'text.secondary',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

export const StyledRibbonBadges = styled(Box, {
  name: 'TaskRibbon',
  slot: 'Badges',
})(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const StyledRibbonBadge = styled(Box, {
  name: 'TaskRibbon',
  slot: 'Badge',
})(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,
  padding: `${theme.spacing(0.25)} ${theme.spacing(1)}`,
  borderRadius: theme.spacing(1),
}));

export const StyledRibbonRight = styled(Box, {
  name: 'TaskRibbon',
  slot: 'Right',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

export const StyledRibbonAutomation = styled(Box, {
  name: 'TaskRibbon',
  slot: 'Automation',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontSize: theme.typography.caption.fontSize,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));
