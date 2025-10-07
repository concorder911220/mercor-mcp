import React from "react";
import { Box, Typography, Chip, Divider, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { useTaskLayout } from '../../context/TaskLayoutContext';

interface TaskResultItem {
  task: string;
  status: "completed" | "in_progress" | "failed" | "pending";
  details?: string;
  timestamp?: Date;
  executedBy?: string;
  outputs?: string[];
}

interface TaskResultProps {
  title?: string;
  results: TaskResultItem[];
  summary?: string;
  onSend?: () => void;
}

const getStatusIcon = (status: TaskResultItem["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />;
    case "failed":
      return <ErrorIcon sx={{ color: "error.main", fontSize: 20 }} />;
    case "in_progress":
      return <PlayCircleIcon sx={{ color: "primary.main", fontSize: 20 }} />;
    case "pending":
      return <HourglassEmptyIcon sx={{ color: "warning.main", fontSize: 20 }} />;
    default:
      return null;
  }
};

const getStatusColor = (status: TaskResultItem["status"]) => {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "error";
    case "in_progress":
      return "primary";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const getStatusText = (status: TaskResultItem["status"]) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "in_progress":
      return "In Progress";
    case "pending":
      return "Pending";
    default:
      return status;
  }
};

export function TaskResult({ title = "Task Results", results, summary, onSend }: TaskResultProps) {
  const formatTime = (date: Date) => {
    // Convert UTC timestamp to PST
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Los_Angeles", // PST/PDT timezone
    });
  };

  const { openModal, setModalContent } = useTaskLayout();

  const fullEmailContent = `Hi Linda,

Welcome aboard! We're excited to start working together and want to make your onboarding as smooth as possible. To help keep everything on track, please use the checklist below to gather and complete the required items. Feel free to reach out if you have any questions along the way.

ONBOARDING CHECKLIST

1. Complete Intake Questionnaire
   You'll receive a secure link via email. Please fill out your risk profile, investment objectives, and basic contact details.

2. Account Application Forms
   • Custodian account application (IRA/Brokerage/Trust)
   • Please review, sign, and return via DocuSign

3. KYC & AML Documentation
   • Copy of government-issued ID (passport or driver's license)
   • Proof of address (utility bill or bank statement dated within 90 days)
   • Politically Exposed Person (PEP) questionnaire

4. Financial Data & Planning Information
   • Tax returns for the past two years
   • Recent investment statements (brokerage, retirement accounts)
   • Copies of any insurance policies
   • Estate-planning documents (wills, trusts)

5. Advisory Agreement & Disclosures
   • Review fee schedule and scope of services
   • Acknowledge privacy policy and electronic-delivery consent
   • Sign and return via DocuSign

6. Schedule Your Welcome Call
   Click here to book a 30-minute kickoff meeting with your advisor: [Scheduling Link]

Once you've completed each step, the system will automatically notify me so we can move forward. If you run into any issues or have questions about a particular item, just reply to this email or give me a call at (312) 420-7886.

Thank you, Linda, and welcome to Rialto Financial. We look forward to partnering with you!

Warm regards,
The Rialto Financial Team`;

  const handleEditClick = () => {
    setModalContent(
      <Box sx={{ p: 3, maxWidth: 800, width: '100%', backgroundColor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary", fontWeight: 600 }}>
          Email Draft - Full Content
        </Typography>
        <Box
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 2,
            backgroundColor: 'background.paper',
            minHeight: 400,
            maxHeight: 600,
            overflow: 'auto',
            fontSize: "0.875rem",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            color: "text.secondary",
            cursor: 'pointer',
            '&:hover': {
              color: 'text.primary'
            }
          }}
        >
          {fullEmailContent}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mt: 2, 
          justifyContent: 'flex-end',
          backgroundColor: 'background.paper',
          p: 2,
          borderRadius: 1,
          ml: -3,
          mr: -3,
          mb: -3
        }}>
          <Button 
            variant="outlined" 
            size="small"
            sx={{
              borderColor: "grey.400",
              color: "text.primary",
              "&:hover": {
                borderColor: "grey.600",
                backgroundColor: "grey.50",
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            size="small"
            sx={{
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    );
    openModal();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="body2"
        sx={{
          color: "text.primary",
          mb: 2,
          lineHeight: 1.5,
        }}
      >
      </Typography>

      <Box
        sx={{
          backgroundColor: "grey.100",
          borderRadius: 2,
          p: 2,
          width: "100%",
        }}
      >
        {/* Header with title and buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{
                borderColor: "grey.400",
                color: "text.primary",
                "&:hover": {
                  borderColor: "grey.600",
                  backgroundColor: "grey.50",
                },
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<SendIcon />}
              onClick={onSend}
              sx={{
                backgroundColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              }}
            >
              Send
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            cursor: 'pointer',
            border: '1px solid #e0e0e0',
            p: 2,
            borderRadius: 1,
            width: '100%',
            minHeight: 200,
            maxHeight: 300,
            fontSize: "0.875rem",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            color: "text.secondary",
            boxSizing: "border-box",
            position: "relative",
            '&:hover': {
              color: 'text.primary'
            }
          }}
        >
{fullEmailContent.split('\n').slice(0, 15).join('\n')}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              background: 'linear-gradient(transparent, rgba(245, 245, 245, 0.9))',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pb: 1
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic'
              }}
            >
              ... Click Edit to view full email
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 