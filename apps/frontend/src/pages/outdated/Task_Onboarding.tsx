import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FolderIcon from '@mui/icons-material/Folder';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import { ChatPanel } from "../components/ChatPanel";
import { UserInput } from "../components/UserInput";
import { useTaskLayout } from "../context/TaskLayoutContext";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Execution log data from ClientOnboarding
const executionLogData = {
  taskPlanContent: `<task_plan>
## Client Onboarding Task Plan

1. **Send Welcome Packet** - Email comprehensive onboarding materials
2. **Create Dropbox Folder** - Set up secure document storage 
3. **Create Salesforce Record** - Initialize client profile in CRM
4. **Identify Required Documents** - Analyze questionnaire responses for tax document requirements
</task_plan>`,
  tasks: [
    {
      id: 'welcome-packet',
      title: 'Send Email',
      icon: <PersonAddIcon />,
      status: 'waiting_for_approval',
      description: 'I need to email comprehensive onboarding materials and welcome information to Linda Mahon.',
      details: {
        'Draft Status': '📝 Draft Ready for Review',
        'To': 'linda.mahon@email.com',
        'Subject': 'Welcome to Rialto Financial - Your Tax Preparation Journey Begins',
        'Email Preview': 'Dear Linda, Welcome to Rialto Financial! We are excited to help you with your tax preparation...',
        'Attachments Ready': '• Tax Organizer 2024.pdf\n• Client Portal Guide.pdf\n• Engagement Letter.pdf',
        'Action Required': 'Review and approve email before sending'
      }
    },
    {
      id: 'dropbox-folder',
      title: 'Create Dropbox Folder',
      icon: <FolderIcon />,
      status: 'waiting_for_approval', 
      description: 'I need to set up secure document storage folder structure for Linda Mahon in Dropbox Business.',
      details: {
        'Folder Path': '/Clients/2024/Linda Mahon - Tax Prep',
        'Subfolders Created': 'Source Documents, Working Papers, Final Returns, Correspondence',
        'Permissions': 'Linda Mahon (Editor), Tax Team (Full Access), Client Portal (View Only)',
        'Sharing Link': 'https://www.dropbox.com/sh/abc123/linda-mahon-2024',
        'Security': 'Password protected, Expiration: 12/31/2024',
        'Backup': 'Auto-sync enabled'
      }
    },
    {
      id: 'salesforce-record',
      title: 'Create Salesforce Record',
      icon: <BusinessIcon />,
      status: 'waiting_for_approval',
      description: 'I need to initialize comprehensive client profile and opportunity record in Salesforce CRM.',
      details: {
        'Account Name': 'Linda Mahon',
        'Contact ID': 'CON-LM-2024-001',
        'Opportunity': 'Tax Preparation 2024 - Individual Return',
        'Service Type': 'Individual Tax Return Preparation',
        'Estimated Value': '$850.00',
        'Assigned Preparer': 'Sarah Thompson, CPA',
        'Estimated Due Date': 'April 10, 2024',
        'Client Source': 'Referral - Existing Client',
        'Priority Level': 'Standard'
      }
    },
    {
      id: 'required-documents',
      title: 'Identify Required Tax Documents',
      icon: <DescriptionIcon />,
      status: 'waiting_for_client',
      description: 'I need to analyze questionnaire responses to determine specific tax documents needed for Linda Mahon\'s return.',
      details: {
        'Analysis Based On': 'Tax Organizer Questionnaire Responses',
        'Required Documents': 'W-2 (Employer: TechCorp Inc.), 1099-DIV (Schwab), 1099-INT (Chase Bank), 1098 Mortgage Interest (Wells Fargo)',
        'Optional Documents': '1099-B (Stock sales if any), HSA Statements, Charitable Donation Receipts',
        'Special Considerations': 'First-time homeowner - may qualify for credits, Contributing to 401k and IRA',
        'Estimated Complexity': 'Medium - Standard itemized deductions',
        'Document Checklist': 'Generated and emailed to client'
      }
    }
  ]
};

export default function Task_Onboarding() {
  const { setUserInputContent } = useTaskLayout();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-user-message',
      text: 'Help me onboard a new client\nLinda Mahon\nlinda@gmail.com',
      isUser: true,
      timestamp: new Date(),
    }
  ]);
  const [approvedTasks, setApprovedTasks] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const handleApprove = (taskId: string) => {
    setApprovedTasks(prev => new Set([...prev, taskId]));
  };

  const handleEdit = (taskId: string) => {
    console.log('Edit task:', taskId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'waiting_for_approval': return 'warning';
      case 'waiting_for_client': return 'info';
      case 'in_progress': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };


  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Los_Angeles",
    }).format(date);
  };

  // Set user input content
  useEffect(() => {
    setUserInputContent(
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 800,
          }}
        >
          <UserInput
            onSendMessage={handleSendMessage}
            isLoading={false}
            placeholder="How can I help?"
          />
        </Box>
      </Box>
    );
  }, [setUserInputContent]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <>
      <ChatPanel>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 1,
          }}
        >
        {/* Chat Messages Area with Scrollable Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pr: 1,
            pb: "128px", // Padding to prevent content hiding behind input
          }}
        >
          {/* Chat Messages */}
          {chatMessages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                justifyContent: msg.isUser ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              {msg.isUser ? (
                // User messages: right-aligned with orange background
                <Box
                  sx={{
                    bgcolor: "#FFE0B2",
                    color: "#424242",
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: "70%",
                    boxShadow: 1,
                  }}
                >
                  <Typography 
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "right",
                      mt: 1,
                      color: "#616161",
                      opacity: 0.7,
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              ) : (
                // System messages: left-aligned, no background
                <Box
                  sx={{
                    maxWidth: "85%",
                    color: "text.primary",
                  }}
                >
                  <Typography 
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "left",
                      mt: 1,
                      color: "text.secondary",
                      opacity: 0.7,
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}

          {/* Execution Log Content */}
          <Box sx={{ mb: 4 }}>
            
            {/* Task Plan Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 1.5, color: 'text.secondary' }}>
                I'm happy to help onboard Linda. Below are the tasks I plan to complete.
              </Typography>
              
              <Card 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                {/* Action Buttons - Top Right */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12, 
                  display: 'flex', 
                  gap: 1 
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => console.log('Edit task plan')}
                    size="small"
                    sx={{ 
                      color: 'text.secondary',
                      borderColor: '#e0e0e0',
                      '&:hover': {
                        borderColor: '#bdbdbd',
                        backgroundColor: '#fafafa'
                      }
                    }}
                  >
                    Edit
                  </Button>
                </Box>

                <CardContent sx={{ pb: 1, pr: '120px' }}>
                  {/* Title */}
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Client Onboarding Task Plan
                  </Typography>
                  
                  {/* Task boxes */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { id: 1, text: 'Send Email - Email comprehensive onboarding materials', completed: true },
                      { id: 2, text: 'Create Dropbox Folder - Set up secure document storage', completed: true },
                      { id: 3, text: 'Create Salesforce Record - Initialize client profile in CRM', completed: true },
                      { id: 4, text: 'Identify Required Documents - Analyze questionnaire responses for tax document requirements', completed: false }
                    ].map((task) => (
                      <Box
                        key={task.id}
                        sx={{
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          p: 1.5,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          opacity: task.completed ? 0.7 : 1,
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: task.completed ? 'normal' : 'bold',
                            color: task.completed ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {task.id}. {task.text}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Task Execution Details */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#000000' }}>
                Send Welcome Packet
              </Typography>
              
              {executionLogData.tasks.map((task, index) => (
                <Box key={task.id} sx={{ mb: 3 }}>
                  {/* Section Title for tasks 2-4 */}
                  {index > 0 && (
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 4, color: '#000000' }}>
                      {task.title}
                    </Typography>
                  )}
                  
                  {/* Task Description - Outside the card */}
                  <Typography variant="body1" sx={{ mb: 1.5, color: 'text.secondary' }}>
                    {task.description}
                  </Typography>
                  
                  <Card 
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                  {/* Action Buttons - Top Right */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 12, 
                    right: 12, 
                    display: 'flex', 
                    gap: 1 
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(task.id)}
                      size="small"
                      sx={{ 
                        color: 'text.secondary',
                        borderColor: '#e0e0e0',
                        '&:hover': {
                          borderColor: '#bdbdbd',
                          backgroundColor: '#fafafa'
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={() => handleApprove(task.id)}
                      disabled={approvedTasks.has(task.id)}
                      size="small"
                      sx={{ 
                        backgroundColor: approvedTasks.has(task.id) ? '#4caf50' : '#81c784',
                        color: 'white',
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: approvedTasks.has(task.id) ? '#4caf50' : '#66bb6a',
                        },
                        '&:disabled': {
                          backgroundColor: '#4caf50',
                          color: 'white'
                        }
                      }}
                    >
                      {approvedTasks.has(task.id) ? 'Approved' : 'Approve'}
                    </Button>
                  </Box>

                  <CardContent sx={{ pb: 2, pr: '200px' }}>
                    {/* Task Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                        {task.id === 'welcome-packet' ? (
                          <img src="/outlook_logo.png" alt="Outlook" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        ) : task.id === 'dropbox-folder' ? (
                          <img src="/dropbox_logo.png" alt="Dropbox" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        ) : task.id === 'salesforce-record' ? (
                          <img src="/salesforce_logo.png" alt="Salesforce" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        ) : (
                          <Box sx={{ color: '#1976d2' }}>{task.icon}</Box>
                        )}
                      </Box>
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status.replace(/_/g, ' ')}
                          color={getStatusColor(task.status)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Box>

                    {/* Task Details */}
                    <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, border: '1px solid #e9ecef' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#495057' }}>
                        📝 Execution Details:
                      </Typography>
                      {Object.entries(task.details).map(([key, value]) => (
                        <Box key={key} sx={{ mb: 1, display: 'flex' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold', 
                              minWidth: 150, 
                              color: 'text.secondary',
                              mr: 1
                            }}
                          >
                            {key}:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flex: 1,
                              wordBreak: 'break-word'
                            }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
                </Box>
              ))}
            </Box>

          </Box>

          <div ref={chatEndRef} />
        </Box>
      </Box>
      </ChatPanel>
      
      {/* Fixed Summary Box on the Right */}
      <Box
        sx={{
          position: 'fixed',
          top: 80, // Adjust based on your header height
          right: 20,
          width: 300,
          zIndex: 1000,
        }}
      >
        <Paper sx={{ p: 3, backgroundColor: '#f0f8ff', border: '1px solid #2196f3' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
            📊 Onboarding Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Tasks Completed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                3/4
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => console.log('Approve all tasks')}
            sx={{
              backgroundColor: '#4caf50',
              mb: 2,
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            Approve All
          </Button>
          
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Next Step
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              Wait for client to fill organizer
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
}