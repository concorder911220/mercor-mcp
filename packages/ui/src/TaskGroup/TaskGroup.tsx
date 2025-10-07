import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { TaskRibbon } from '../TaskRibbon';
import { TaskGroupProps } from './TaskGroup.types';
import { Task } from '../types';
import { 
  StyledAccordion,
  StyledAccordionSummary,
  StyledAccordionDetails,
  StyledCountChip, 
  StyledTaskContainer 
} from './TaskGroup.styles';

export const TaskGroup = React.forwardRef<HTMLDivElement, TaskGroupProps>(
  ({ 
    title, 
    tasks, 
    onSelect, 
    onGroupSelect,
    defaultExpanded = true,
    isJoined = false,
    disabled = false,
    ...props 
  }, ref) => {
    const [taskStates, setTaskStates] = useState<Record<string, 'entering' | 'exiting' | 'stable'>>({});
    const prevTasksRef = useRef<Task[]>([]);

    // Animation logic: detect task changes and apply appropriate animations
    useEffect(() => {
      // Skip animation logic if no tasks
      if (tasks.length === 0) {
        prevTasksRef.current = tasks;
        return;
      }

      const prevTasks = prevTasksRef.current;
      const currentTaskIds = new Set(tasks.map(task => task.id));
      const prevTaskIds = new Set(prevTasks.map(task => task.id));

      // Find added tasks
      const addedTasks = tasks.filter(task => !prevTaskIds.has(task.id));
      // Find removed tasks
      const removedTasks = prevTasks.filter(task => !currentTaskIds.has(task.id));

      // Handle added tasks
      if (addedTasks.length > 0) {
        addedTasks.forEach(task => {
          setTaskStates(prev => ({ ...prev, [task.id]: 'entering' }));
        });

        // Clear entering animation after duration
        setTimeout(() => {
          addedTasks.forEach(task => {
            setTaskStates(prev => ({ ...prev, [task.id]: 'stable' }));
          });
        }, 300);
      }

      // Handle removed tasks
      if (removedTasks.length > 0) {
        removedTasks.forEach(task => {
          setTaskStates(prev => ({ ...prev, [task.id]: 'exiting' }));
        });

        // Clear exiting animation after duration
        setTimeout(() => {
          removedTasks.forEach(task => {
            setTaskStates(prev => {
              const { [task.id]: removed, ...rest } = prev;
              return rest;
            });
          });
        }, 300);
      }

      prevTasksRef.current = tasks;
    }, [tasks]);

    // Get animation class for a task
    const getTaskAnimationClass = (task: Task) => {
      const state = taskStates[task.id];
      if (state === 'entering') return 'task-entering';
      if (state === 'exiting') return 'task-exiting';
      return '';
    };

    // Handle group click for joined groups
    const handleGroupClick = () => {
      if (isJoined && onGroupSelect) {
        // Find the group ID from the first task's groupId
        const groupId = tasks[0]?.groupId;
        if (groupId) {
          onGroupSelect(groupId);
        }
      }
    };

    // Hide empty groups
    if (tasks.length === 0) {
      return null;
    }

    return (
      <StyledAccordion 
        ref={ref} 
        defaultExpanded={defaultExpanded}
        {...props}
      >
        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              fontWeight="medium" 
              color={disabled ? "text.disabled" : "text.primary"}
            >
              {title}
            </Typography>
            <StyledCountChip>
              {tasks.length}
            </StyledCountChip>
          </Box>
        </StyledAccordionSummary>
        
        <StyledAccordionDetails>
          <StyledTaskContainer isJoined={isJoined}>
            {tasks.map((task, index) => (
              <TaskRibbon
                key={task.id}
                label={task.label}
                onSelect={isJoined ? handleGroupClick : () => onSelect(task.id)}
                color={task.color}
                disabled={disabled}
                tags={task.tags}
                automationStatus={task.automationStatus}
                isJoined={isJoined}
                className={`${index === tasks.length - 1 ? 'last-ribbon' : ''} ${getTaskAnimationClass(task)}`}
              />
            ))}
          </StyledTaskContainer>
        </StyledAccordionDetails>
      </StyledAccordion>
    );
  }
);

TaskGroup.displayName = 'TaskGroup';
