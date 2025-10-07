import React from 'react';
import { TaskRibbonProps } from './TaskRibbon.types';
import { TaskRibbonColor } from './TaskRibbonColorMapping';
import { TaskTag, TagType } from '../TaskTag';
import { 
  StyledTaskRibbon,
  StyledRibbonContent,
  StyledRibbonMainRow,
  StyledRibbonLeft,
  StyledRibbonColorIndicator,
  StyledRibbonLabel,
  StyledRibbonBadges,
  StyledRibbonRight,
  StyledRibbonAutomation
} from './TaskRibbon.styles';

export const TaskRibbon = React.forwardRef<HTMLButtonElement, TaskRibbonProps>(
  ({ 
    label, 
    onSelect,
    color = TaskRibbonColor.GRAY,
    disabled = false,
    tags = {},
    automationStatus,
    isJoined = false,
    ...buttonProps 
  }, ref) => {


    const getAutomationDisplay = (status?: string) => {
      switch (status) {
        case 'automatable':
          return { emoji: '⚡', label: 'Auto' };
        case 'automated':
          return { emoji: '✨', label: 'Done' };
        // manual tasks aren't advertised
        default:
          return null;
      }
    };


    return (
      <StyledTaskRibbon
        ref={ref}
        variant="ghost"
        disabled={disabled}
        isJoined={isJoined}
        onClick={disabled ? undefined : onSelect}
        title={label}
        {...buttonProps}
      >
        <StyledRibbonContent>
          {/* Main row: color indicator, label, and automation status */}
          <StyledRibbonMainRow>
            <StyledRibbonLeft>
              <StyledRibbonColorIndicator 
                sx={{ backgroundColor: color }}
              />
              <StyledRibbonLabel>
                {label}
              </StyledRibbonLabel>
            </StyledRibbonLeft>
            
            {/* Automation status on the right */}
            {automationStatus && (
              <StyledRibbonRight>
                <StyledRibbonAutomation>
                  {(() => {
                    const display = getAutomationDisplay(automationStatus);
                    return display && (
                      <>
                        <span>{display.emoji}</span>
                        <span>{display.label}</span>
                      </>
                    );
                  })()}
                </StyledRibbonAutomation>
              </StyledRibbonRight>
            )}
          </StyledRibbonMainRow>

          {/* Badge row */}
          <StyledRibbonBadges>
            {Object.entries(tags).map(([type, value]) => (
              <TaskTag key={type} type={type as TagType} value={value} />
            ))}
          </StyledRibbonBadges>
        </StyledRibbonContent>
      </StyledTaskRibbon>
    );
  }
);

TaskRibbon.displayName = 'TaskRibbon';
