import React from 'react';
import { Typography } from '@mui/material';
import { TaskGroup } from '../TaskGroup';
import { TaskDashboardProps } from './TaskDashboard.types';
import { 
  StyledContainer, 
  StyledHeader,
  StyledContent, 
  StyledDashboard 
} from './TaskDashboard.styles';

export const TaskDashboard = React.forwardRef<HTMLDivElement, TaskDashboardProps>(
  ({ 
    groups, 
    onSelect, 
    header,
    ...props 
  }, ref) => {
    return (
      <StyledContainer 
        ref={ref} 
        className="task-dashboard"
        data-testid="task-dashboard"
        {...props}
      >
          {header && (
            <StyledHeader 
              className="task-dashboard-header" 
              data-testid="task-dashboard-header"
            >
              <Typography 
                variant="body2" 
                fontWeight="medium"
                className="task-dashboard-header-text"
              >
                {header.title}
              </Typography>
              {header.subtitle && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  className="task-dashboard-header-subtitle"
                >
                  {header.subtitle}
                </Typography>
              )}
            </StyledHeader>
          )}
        
        <StyledContent 
          className="task-dashboard-content" 
          data-testid="task-dashboard-content"
        >
          <StyledDashboard 
            className="task-dashboard-dashboard"
          >
            {groups.map((group) => (
              <TaskGroup
                key={group.title}
                {...group}
                onSelect={group.onSelect || onSelect}
              />
            ))}
          </StyledDashboard>
        </StyledContent>
      </StyledContainer>
    );
  }
);

TaskDashboard.displayName = 'TaskDashboard';
