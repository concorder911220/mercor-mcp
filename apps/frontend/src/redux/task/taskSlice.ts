import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskRibbonColor, AutomationStatus, getDocumentColor, TagType } from '@rialto/ui';

export interface Task {
  id: string;
  label: string;
  color: TaskRibbonColor;
  description?: string;
  groupId: string; // Track which group the task belongs to
  tags?: Partial<Record<TagType, string>>;
  automationStatus?: AutomationStatus;
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
  defaultExpanded: boolean;
  isJoined: boolean;
  disabled: boolean;
}

export interface TaskState {
  groups: TaskGroup[];
}

const initialState: TaskState = {
  groups: [
    {
      id: 'queued',
      title: 'Queued for reach out',
      tasks: [
        {
          id: '1098',
          label: 'Form 1098: Mortgage',
          color: getDocumentColor('1098'),
          description: 'Mortgage Interest Statement',
          groupId: 'queued',
          automationStatus: AutomationStatus.AUTOMATABLE,
          tags: {
            status: 'queued',
            missing: 'true',
            bucket: 'Deductions',
            lastActivity: '5d ago'
          }
        },
        {
          id: '1099-vanguard',
          label: '1099 Composite: Vanguard',
          color: getDocumentColor('1099-int'),
          description: 'Mortgage Interest Statement',
          groupId: 'queued',
          automationStatus: AutomationStatus.AUTOMATABLE,
          tags: {
            status: 'queued',
            wrongYear: 'true',
            bucket: 'Deductions',
            lastActivity: '5d ago'
          }
        }
      ],
      defaultExpanded: true,
      isJoined: true,
      disabled: false
    },
    {
      id: 'ready',
      title: 'Ready for review',
      tasks: [
        {
          id: 'w2',
          label: 'W-2: Davis Group',
          color: getDocumentColor('w2'),
          description: 'Wage and Tax Statement from your employer',
          groupId: 'ready',
          automationStatus: AutomationStatus.AUTOMATABLE,
          tags: {
            status: 'ready',
            atRisk: 'false',
            bucket: 'Income',
            lastActivity: '2d ago'
          }
        },
        {
          id: '1099div',
          label: '1099-Composite: Schwab',
          color: getDocumentColor('1099-div'),
          description: 'Dividend income statement',
          groupId: 'ready',
          automationStatus: AutomationStatus.AUTOMATABLE,
          tags: {
            status: 'ready',
            atRisk: 'false',
            bucket: 'Income',
            lastActivity: '1d ago'
          }
        },
        {
          id: 'k1',
          label: 'K-1: Swick Capital',
          color: getDocumentColor('k1'),
          description: 'Partnership income statement',
          groupId: 'ready',
          automationStatus: AutomationStatus.MANUAL,
          tags: {
            status: 'ready',
            atRisk: 'false',
            bucket: 'Income',
            lastActivity: '3d ago'
          }
        },
      ],
      defaultExpanded: true,
      isJoined: false,
      disabled: false
    },
    {
      id: 'processing',
      title: 'Processing',
      tasks: [],
      defaultExpanded: true,
      isJoined: false,
      disabled: true
    },
    {
      id: 'pending',
      title: 'Pending Response',
      tasks: [],
      defaultExpanded: true,
      isJoined: false,
      disabled: true
    },
    {
      id: 'received',
      title: 'Not Required',
      tasks: [
        {
          id: 'bank-statements',
          label: 'Bank Statements',
          color: getDocumentColor('bank-statements'),
          description: 'Monthly bank statements for verification',
          groupId: 'accepted',
          automationStatus: AutomationStatus.AUTOMATED,
          tags: {
            optional: 'true',
            atRisk: 'false',
            dueDate: 'Jan 10',
            lastActivity: '2w ago'
          }
        }
      ],
      defaultExpanded: true,
      isJoined: false,
      disabled: true
    },
    {
      id: 'accepted',
      title: 'Approved',
      tasks: [
        {
          id: 'donations',
          label: 'Donation Receipts',
          color: getDocumentColor('charitable'),
          description: 'Receipts for charitable donations',
          groupId: 'processing',
          automationStatus: AutomationStatus.MANUAL,
          tags: {
            status: 'processing',
            optional: 'true',
            atRisk: 'false',
            dueDate: 'Feb 1',
            bucket: 'Deductions',
            lastActivity: '1w ago'
          }
        }
      ],
      defaultExpanded: false,
      isJoined: false,
      disabled: true
    }
  ]
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    moveTaskToGroup: (state, action: PayloadAction<{ taskId: string; fromGroupId: string; toGroupId: string }>) => {
      const { taskId, fromGroupId, toGroupId } = action.payload;
      
      // Find the task in the source group
      const fromGroup = state.groups.find(group => group.id === fromGroupId);
      const toGroup = state.groups.find(group => group.id === toGroupId);
      
      if (fromGroup && toGroup) {
        const taskIndex = fromGroup.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          const task = fromGroup.tasks[taskIndex];
          
          // Remove from source group
          fromGroup.tasks.splice(taskIndex, 1);
          
          // Update task's groupId and status
          const updatedTask = {
            ...task,
            groupId: toGroupId,
            tags: {
              ...task.tags,
              status: toGroupId === 'pending' ? 'pending' : 
                     toGroupId === 'accepted' ? 'completed' : task.tags?.status || 'pending'
            }
          };
          
          // Add to destination group
          toGroup.tasks.push(updatedTask);
        }
      }
    },
    updateTaskStatus: (state, action: PayloadAction<{ taskId: string; status: string }>) => {
      const { taskId, status } = action.payload;
      
      // Find the task in any group
      for (const group of state.groups) {
        const task = group.tasks.find(task => task.id === taskId);
        if (task) {
          task.tags = {
            ...task.tags,
            status
          };
          break;
        }
      }
    },
    addTask: (state, action: PayloadAction<{ task: Omit<Task, 'groupId'>; groupId: string }>) => {
      const { task, groupId } = action.payload;
      const group = state.groups.find(g => g.id === groupId);
      
      if (group) {
        const newTask: Task = {
          ...task,
          groupId,
        };
        group.tasks.push(newTask);
      }
    }
  }
});

export const { 
  moveTaskToGroup, 
  updateTaskStatus, 
  addTask
} = taskSlice.actions;

export default taskSlice.reducer;
