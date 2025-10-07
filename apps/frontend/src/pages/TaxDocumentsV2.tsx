import { useState, useMemo, useCallback } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import {
  TaskDashboard
} from "@rialto/ui";
import { RootState } from '../redux/store';
import { moveTaskToGroup } from '../redux/task/taskSlice';
import { closeChat } from '../redux/chat/chatSlice';
import ReviewDrawer from '../components/ReviewDrawer';
import ExtractionReviewDrawer from '../components/ExtractionReviewDrawer';
import { requestForDocsEmailTemplate, EmailTemplate } from '../mocks/welcome_email';
import { ExtractedField } from '../types/tax';
import { Node } from '../types/document';
import { mockDocuments, mockExtractedData } from '../mocks/taxData';
import { useConfetti } from '../hooks/useConfetti';


// Constants
const TASK_GROUPS = {
  QUEUED: 'queued',
  READY: 'ready',
  PROCESSING: 'processing',
  PENDING: 'pending'
} as const;

const SUPPORTED_TASKS = ['w2', 'k1', '1099div'] as const;


const STATUS_MESSAGES = {
  COMPLETED: {
    title: "All done! Great work! 🎉",
    subtitle: "You've completed all your tasks"
  },
  READY: {
    title: "Ready when you are! 🤔",
    subtitle: "Select a task from the left to take action"
  }
} as const;

// Layout constants
const LAYOUT_STYLES = {
  CONTAINER: {
    height: '100vh',
    width: '100%',
    backgroundColor: 'white',
    display: 'flex'
  },
  MAIN_BOX: {
    maxWidth: '7xl',
    mx: 'auto',
    px: 0,
    py: 0,
    width: '100%',
    height: '100%',
    display: 'flex'
  },
  TASK_RAIL: {
    backgroundColor: '#F3F4F6'
  },
  CONTENT_AREA: {
    height: '100vh',
    minHeight: '60vh',
    backgroundColor: '#F3F4F6',
    paddingTop: 16 // 64px - aligns with horizontal line in task dashboard
  },
  ACTION_CARD_CONTAINER: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingX: 8,
    paddingTop: 2
  },
  STATUS_MESSAGE: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    py: 8
  }
} as const;



export default function TaxDocumentsV2() {
  const dispatch = useDispatch();
  const { triggerConfetti } = useConfetti();
  
  // Get state from Redux
  const { groups } = useSelector((state: RootState) => state.tasks);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [showExtractionDrawer, setShowExtractionDrawer] = useState(false);
  const [currentEmailTemplate, setCurrentEmailTemplate] = useState(requestForDocsEmailTemplate);
  const [currentExtractionTask, setCurrentExtractionTask] = useState<{
    taskId: string;
    documentName: string;
    documentUrl?: string;
    extractedFields: ExtractedField[];
  } | null>(null);


  // Memoize document mapping to prevent recalculation on every render
  const taskToDocumentMap = useMemo(() => {
    const saraRandallDocuments = mockDocuments['filing-001'] || [];
    return {
      'w2': {
        docId: 'doc-001',
        documentName: 'W-2: Davis Group',
        filePath: saraRandallDocuments.find(d => d.id === 'doc-001')?.filePath || ''
      },
      'k1': {
        docId: 'doc-004', 
        documentName: 'K-1: Swick Capital',
        filePath: saraRandallDocuments.find(d => d.id === 'doc-004')?.filePath || ''
      },
      '1099div': {
        docId: 'doc-002',
        documentName: '1099-Composite: Schwab', 
        filePath: saraRandallDocuments.find(d => d.id === 'doc-002')?.filePath || ''
      }
    };
  }, []);

  // Memoize status message to prevent recalculation on every render
  const statusMessage = useMemo(() => {
    const allGroupsDisabled = groups.every(group => group.disabled);
    return allGroupsDisabled ? STATUS_MESSAGES.COMPLETED : STATUS_MESSAGES.READY;
  }, [groups]);

  /**
   * Handler for queued group action - shows email template
   */
  const handleQueuedGroupAction = () => {
    setCurrentEmailTemplate(requestForDocsEmailTemplate);
    setShowReviewDrawer(true);
  };

  /**
   * Generic handler for document extraction tasks
   */
  const handleDocumentAction = (taskId: string) => {
    const docInfo = taskToDocumentMap[taskId as keyof typeof taskToDocumentMap];
    if (!docInfo) return;

    setCurrentExtractionTask({
      taskId,
      documentName: docInfo.documentName,
      documentUrl: docInfo.filePath,
      extractedFields: []
    });
    setShowExtractionDrawer(true);
  };

  /**
   * Maps task IDs to their specific callback functions
   */
  const getTaskCallback = useCallback((taskId: string) => {
    return SUPPORTED_TASKS.includes(taskId as any) 
      ? () => handleDocumentAction(taskId)
      : () => {}; // No specific handler for this task
  }, []);

  /**
   * Handle extraction approval - move task to processing group
   */
  const handleExtractionApprove = (taskId: string) => {
    dispatch(moveTaskToGroup({ 
      taskId, 
      fromGroupId: TASK_GROUPS.READY, 
      toGroupId: TASK_GROUPS.PROCESSING 
    }));
    setShowExtractionDrawer(false);
    setCurrentExtractionTask(null);
    triggerConfetti();
  };

  /**
   * Handle extraction rejection - move task back to queued group
   */
  const handleExtractionReject = (taskId: string, reason: string) => {
    dispatch(moveTaskToGroup({ 
      taskId, 
      fromGroupId: TASK_GROUPS.READY, 
      toGroupId: TASK_GROUPS.QUEUED 
    }));
    setShowExtractionDrawer(false);
    setCurrentExtractionTask(null);
  };


  /**
   * Email sending handler - moves tasks from queued to pending group
   */
  const handleEmailSend = (email: EmailTemplate) => {
    dispatch(closeChat());
    
    const queuedGroup = groups.find(group => group.id === TASK_GROUPS.QUEUED);
    if (queuedGroup) {
      queuedGroup.tasks.forEach(task => {
        dispatch(moveTaskToGroup({ 
          taskId: task.id, 
          fromGroupId: TASK_GROUPS.QUEUED, 
          toGroupId: TASK_GROUPS.PENDING 
        }));
      });
    }
    
    triggerConfetti();
  };


  return (
    <Box sx={LAYOUT_STYLES.CONTAINER}>
      <Box sx={LAYOUT_STYLES.MAIN_BOX}>
        <Grid container spacing={0} sx={{ height: '100%' }}>
          <Grid id="task-rail" item xs={12} md={3} sx={LAYOUT_STYLES.TASK_RAIL}>
            <TaskDashboard
              groups={groups.map(group => ({
                title: group.title,
                tasks: group.tasks,
                onSelect: (taskId: string) => getTaskCallback(taskId)(),
                onGroupSelect: group.id === TASK_GROUPS.QUEUED ? handleQueuedGroupAction : () => {},
                defaultExpanded: group.defaultExpanded,
                isJoined: group.isJoined,
                disabled: group.disabled
              }))}
              header={{
                title: "Sara Randall",
                subtitle: "2024 Form 1040"
              }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container sx={LAYOUT_STYLES.CONTENT_AREA}>
              <Grid item xs={12} md={10} sx={LAYOUT_STYLES.ACTION_CARD_CONTAINER}>
                <Box sx={LAYOUT_STYLES.STATUS_MESSAGE}>
                  <Typography variant="h4" fontWeight="medium" color="text.primary" sx={{ mb: 2 }}>
                    {statusMessage.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {statusMessage.subtitle}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      
      <ReviewDrawer
        isOpen={showReviewDrawer}
        onClose={() => {
          setShowReviewDrawer(false);
          setCurrentEmailTemplate({} as EmailTemplate); // Reset to empty template
          dispatch(closeChat()); // Close chat when drawer is closed
        }}
        messages={[]}
        connectionStatus="connected"
        conversationId="test-conversation"
        emailTemplate={currentEmailTemplate}
        onApprove={handleEmailSend}
      />

      <ExtractionReviewDrawer
        isOpen={showExtractionDrawer}
        onClose={() => {
          setShowExtractionDrawer(false);
          setCurrentExtractionTask(null);
        }}
        documentName={currentExtractionTask?.documentName || ''}
        documentUrl={currentExtractionTask?.documentUrl}
        document={{
          nodes: currentExtractionTask ? (mockExtractedData as any)[taskToDocumentMap[currentExtractionTask.taskId as keyof typeof taskToDocumentMap]?.docId] as Node[] : []
        }}
        onFieldValueChange={(path, newValue, originalValue) => {
          console.log(`Field changed: ${path} = ${newValue} (original: ${originalValue})`);
          // TODO: Implement field value update logic
        }}
        taskId={currentExtractionTask?.taskId}
        onApprove={handleExtractionApprove}
      />
    
    </Box>
  );
}
