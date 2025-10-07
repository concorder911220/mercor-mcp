import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FolderIcon from '@mui/icons-material/Folder';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import { TaskPlanRenderer } from '../components/common/TaskPlanRenderer';

const ClientOnboarding: React.FC = () => {
  const [approvedTasks, setApprovedTasks] = useState<Set<string>>(new Set());

  const handleApprove = (taskId: string) => {
    setApprovedTasks(prev => new Set([...prev, taskId]));
  };

  const handleEdit = (taskId: string) => {
    // Handle edit functionality - could open a modal or navigate to edit page
    console.log('Edit task:', taskId);
  };

  // Task plan content for the TaskPlanRenderer
  const taskPlanContent = `
## Client Onboarding Task Plan

**Client:** Linda Mahon  
**Date:** ${new Date().toLocaleDateString()}  
**Status:** In Progress

### Tasks to Complete:
1. **Send Welcome Packet** - Email comprehensive onboarding materials
2. **Create Dropbox Folder** - Set up secure document storage 
3. **Create Salesforce Record** - Initialize client profile in CRM
4. **Identify Required Documents** - Analyze questionnaire responses for tax document requirements

**Estimated Completion:** 2-3 hours  
**Priority:** High
  `;

  const tasks = [
    {
      id: 'welcome-packet',
      title: 'Send Welcome Packet',
      icon: <PersonAddIcon />,
      status: 'completed',
      description: 'Email comprehensive onboarding materials and welcome information to Linda Mahon.',
      details: {
        'Email Recipient': 'linda.mahon@email.com',
        'Subject': 'Welcome to Rialto Financial - Your Tax Preparation Journey Begins',
        'Content': 'Welcome packet including: client portal access, tax organizer checklist, document upload instructions, privacy policy, engagement letter, and contact information.',
        'Attachments': 'Tax Organizer 2024.pdf, Client Portal Guide.pdf, Engagement Letter.pdf',
        'Sent At': new Date().toLocaleString(),
        'Status': 'Delivered ✓'
      }
    },
    {
      id: 'dropbox-folder',
      title: 'Create Client Folder in Dropbox',
      icon: <FolderIcon />,
      status: 'completed', 
      description: 'Set up secure document storage folder structure for Linda Mahon in Dropbox Business.',
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
      title: 'Create Client File in Salesforce',
      icon: <BusinessIcon />,
      status: 'completed',
      description: 'Initialize comprehensive client profile and opportunity record in Salesforce CRM.',
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
      status: 'completed',
      description: 'Analyze questionnaire responses to determine specific tax documents needed for Linda Mahon\'s return.',
      details: {
        'Analysis Based On': 'Tax Organizer Questionnaire Responses',
        'Required Documents': 'W-2 (Employer: TechCorp Inc.), 1099-DIV (Schwab), 1099-INT (Chase Bank), 1098 Mortgage Interest (Wells Fargo)',
        'Optional Documents': '1099-B (Stock sales if any), HSA Statements, Charitable Donation Receipts',
        'Special Considerations': 'First-time homeowner - may qualify for credits, Contributing to 401k and IRA',
        'Estimated Complexity': 'Medium - Standard itemized deductions',
        'Document Checklist': 'Generated and emailed to client'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
          🎯 Client Onboarding Execution Log
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
          Linda Mahon - New Client Setup
        </Typography>
        <Chip 
          label="All Tasks Completed" 
          color="success" 
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      {/* Task Plan Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2196f3' }}>
          📋 Task Plan
        </Typography>
        <TaskPlanRenderer 
          content={taskPlanContent}
          onEdit={(content, type) => console.log('Edit:', content, type)}
          onAccept={(content, type) => console.log('Accept:', content, type)}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Task Execution Details */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#ff9800' }}>
          🔍 Task Execution Details
        </Typography>
        
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            sx={{ 
              mb: 3, 
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              {/* Task Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2, color: '#1976d2' }}>
                  {task.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {task.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={task.status.replace('_', ' ')}
                      color={getStatusColor(task.status)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {getStatusIcon(task.status)} Task {task.status.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Task Description */}
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                {task.description}
              </Typography>

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

            {/* Action Buttons */}
            <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
              <Button
                variant={approvedTasks.has(task.id) ? "contained" : "outlined"}
                color={approvedTasks.has(task.id) ? "success" : "primary"}
                startIcon={<CheckIcon />}
                onClick={() => handleApprove(task.id)}
                disabled={approvedTasks.has(task.id)}
                sx={{ mr: 1 }}
              >
                {approvedTasks.has(task.id) ? 'Approved' : 'Approve'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={() => handleEdit(task.id)}
              >
                Edit
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Summary Footer */}
      <Paper sx={{ p: 3, backgroundColor: '#f0f8ff', border: '1px solid #2196f3' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
          📊 Onboarding Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tasks Completed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              4/4
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Client Status  
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Ready for Tax Prep
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Next Step
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              Await Documents
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ClientOnboarding;