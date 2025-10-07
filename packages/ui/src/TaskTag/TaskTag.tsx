import React from 'react';
import { useTheme } from '@mui/material/styles';
import { StyledTag } from './TaskTag.styles';
import { TaskTagProps } from './TaskTag.types';
import { TagType } from '../types';

export const TaskTag: React.FC<TaskTagProps> = ({ type, value }) => {
  const theme = useTheme();
  
  // Handle different tag types with appropriate styling
  const getTagConfig = (tagType: TagType, tagValue: string) => {
    switch (tagType) {
      case 'status':
        const statusConfig: Record<string, { label: string; backgroundColor: string; color: string } | null> = {
          ready: { label: 'Validated', backgroundColor: 'transparent', color: theme.palette.text.secondary },
          queued: null, // Don't show "Requested" - it's duplicative with group title
          processing: { label: 'Uploaded', backgroundColor: 'transparent', color: theme.palette.text.secondary },
          optional: { label: 'Missing', backgroundColor: 'transparent', color: theme.palette.text.secondary },
          completed: { label: 'Completed', backgroundColor: 'transparent', color: theme.palette.text.secondary },
          pending: { label: 'Pending', backgroundColor: 'transparent', color: theme.palette.text.secondary }
        };
        return statusConfig[tagValue];
      
      case 'required':
        return {
          label: tagValue === 'true' ? 'Required' : 'Optional',
          backgroundColor: 'transparent',
          color: theme.palette.text.secondary
        };
      
      case 'atRisk':
        if (tagValue === 'true') {
          return {
            label: 'At risk',
            backgroundColor: 'transparent',
            color: theme.palette.text.secondary
          };
        }
        return null;
      
      case 'wrongYear':
        if (tagValue === 'true') {
          return {
            label: 'Wrong year',
            backgroundColor: `${theme.palette.error.main}40`,
            color: theme.palette.text.secondary
          };
        }
        return null;
      
      case 'missing':
        if (tagValue === 'true') {
          return {
            label: 'Missing',
            backgroundColor: `${theme.palette.error.main}40`,
            color: theme.palette.text.secondary
          };
        }
        return null;
      
      case 'optional':
        if (tagValue === 'true') {
          return {
            label: 'Optional',
            backgroundColor: 'transparent',
            color: theme.palette.text.secondary
          };
        }
        return null;

      case 'bucket':
        return {
          label: tagValue,
          backgroundColor: theme.palette.grey[300],
          color: theme.palette.grey[700]
        };
      
      case 'lastActivity':
        return {
          label: tagValue,
          backgroundColor: 'transparent',
          color: theme.palette.text.secondary
        };
      
      default:
        return null;
    }
  };

  const config = getTagConfig(type, value);
  
  if (!config) {
    return null;
  }

  return (
    <StyledTag sx={{
      backgroundColor: config.backgroundColor,
      color: config.color,
    }}>
      {config.label}
    </StyledTag>
  );
};