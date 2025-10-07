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
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { ChatPanel } from "../components/ChatPanel";
import { UserInput } from "../components/UserInput";
import { useTaskLayout } from "../context/TaskLayoutContext";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Execution log data for transaction processing
const executionLogData = {
  tasks: [
    {
      id: 'search-transactions',
      title: 'Search for Transactions',
      icon: <SearchIcon />,
      status: 'completed',
      description: 'I need to scan email inbox for relevant transactions that need to be logged in QuickBooks.',
      details: {
        'Email Source': 'Outlook Integration - Active Inbox Scan',
        'Search Criteria': 'Invoice attachments, receipt keywords, payment confirmations',
        'Date Range': 'Last 30 days from current date',
        'Keywords Found': 'Invoice, Receipt, Payment, Bill, Transaction, Expense',
        'Transactions Identified': '8 potential transactions requiring review',
        'Filter Applied': 'Business-related expenses only',
        'Action Required': 'Review identified transactions before processing'
      }
    },
    {
      id: 'log-rippling',
      title: 'Log Rippling Expense',
      icon: <ReceiptIcon />,
      status: 'waiting_for_approval', 
      description: 'I need to log the Rippling expense invoice into QuickBooks with accurate categorization.',
      details: {
        'Invoice Number': 'UU2RMADE-0002',
        'Vendor': 'Anthropic, PBC (Claude AI)',
        'Amount': '$100.00',
        'Date': 'August 10, 2025',
        'Payment Method': 'Visa ending in 6040',
        'Service Period': 'Aug 10 to Sept 10, 2025',
        'Category': 'Software/AI Services',
        'Tax Deductible': 'Yes - Business Software Expense',
        'Approval Status': 'Ready for QuickBooks entry'
      }
    }
  ]
};

export default function Task_Transaction() {
  const { setUserInputContent } = useTaskLayout();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-trigger-message',
      text: 'Scheduled trigger: Review email for relevant transactions to log in Quickbooks.',
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

            {/* Task Execution Details */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#000000' }}>
                Search for Transactions
              </Typography>
              
              {executionLogData.tasks.map((task, index) => (
                <Box key={task.id} sx={{ mb: 3 }}>
                  {/* Section Title for second task */}
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
                    {task.status !== 'completed' && (
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
                    )}
                  </Box>

                  <CardContent sx={{ pb: 2, pr: '200px' }}>
                    {/* Task Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                        {task.id === 'search-transactions' ? (
                          <img src="/outlook_logo.png" alt="Outlook" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        ) : task.id === 'log-rippling' ? (
                          <img src="/rippling_logo.png" alt="Rippling" style={{ width: 24, height: 24, objectFit: 'contain' }} />
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
            📊 Transaction Processing Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Tasks Completed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                1/2
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => console.log('Process all transactions')}
            sx={{
              backgroundColor: '#4caf50',
              mb: 2,
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            Process All
          </Button>
          
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Next Step
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              Review identified transactions
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
}