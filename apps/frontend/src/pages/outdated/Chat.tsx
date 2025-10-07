import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
// Simple markdown renderer for basic formatting
const renderSimpleMarkdown = (content: string): string => {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
    // Line breaks
    .replace(/\n/g, '<br>');
};
import { TaskPlanRenderer } from '../components/common/TaskPlanRenderer';
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Popper,
  Paper,
  ClickAwayListener,
  MenuList,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ChatPanel } from "../components/ChatPanel";
import ActionButton from "../components/common/ActionButton";
import SearchField from "../components/common/SearchField";
import { useTask } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { usePostMessageMutation } from "../redux/message/messageApi";
import { IMessageResponse } from "../redux/data-types/message";
import { useTaskLayout } from "../context/TaskLayoutContext";
import { UserInput } from "../components/UserInput";
import { FileUploadResponse } from "../redux/data-types/message";
import { SpecialMessageRenderer } from "../components/common/SpecialMessageRenderer";
import { ChatMessage as SSEChatMessage } from "../types/index"; 

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type:
  | "user_request"
  | "supervisor_planning"
  | "supervisor_iteration"
  | "supervisor_complete"
  | "user_input_request"
  | "supervisor_task_plan"
  | "supervisor_task_result"
  | "internal_message"
  | "task_execution"
  | "system"
  | "debug"
  | "mcp_tools_executing"
  | "mcp_progress"
  | "mcp_tool_result";
  streaming?: boolean;
  files?: FileUploadResponse[];
  // Extended fields for special message types
  metadata?: {
    finish_reason?: string | null;
    tools_executing?: string[];
    progress_message?: string;
    tool_name?: string;
    tool_result?: any;
    [key: string]: any;
  };
}

interface UserInputRequest {
  id: string;
  message: string;
  agent: string;
  timestamp: Date;
  task_id?: string;
  context?: {
    child_task_id: string;
    created_at: string;
  };
}

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { taskId: urlTaskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const { setToolbarContent, setUserInputContent } = useTaskLayout();
  const [postMessage, { isLoading: isApiLoading, error: apiError }] =
    usePostMessageMutation();

  // Local chat messages state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Get the current task ID from URL (this is our single source of truth)
  const currentTaskId = urlTaskId ? (urlTaskId.startsWith('task-') ? urlTaskId : `task-${urlTaskId}`) : null;

  // Check for initial message and supervisor response from NewTask2
  useEffect(() => {
    const messages: ChatMessage[] = [];

    // Get initial user message
    const initialMessageStr = localStorage.getItem("initialMessage");
    if (initialMessageStr) {
      try {
        const initialMessage = JSON.parse(initialMessageStr);
        const chatMessage: ChatMessage = {
          id: initialMessage.id,
          text: initialMessage.text,
          isUser: initialMessage.isUser,
          timestamp: new Date(initialMessage.timestamp),
          type: initialMessage.type as ChatMessage["type"],
          // Include files for user messages only
          ...(initialMessage.isUser && initialMessage.files && { files: initialMessage.files }),
        };
        messages.push(chatMessage);
        localStorage.removeItem("initialMessage");
      } catch (error) {
        console.error("Error parsing initial message:", error);
        localStorage.removeItem("initialMessage");
      }
    }

    // Get supervisor response message
    const supervisorResponseStr = localStorage.getItem("supervisorResponse");
    if (supervisorResponseStr) {
      try {
        const supervisorResponse = JSON.parse(supervisorResponseStr);
        const chatMessage: ChatMessage = {
          id: supervisorResponse.id,
          text: supervisorResponse.text,
          isUser: supervisorResponse.isUser,
          timestamp: new Date(supervisorResponse.timestamp),
          type: supervisorResponse.type as ChatMessage["type"],
        };
        messages.push(chatMessage);
        localStorage.removeItem("supervisorResponse");
      } catch (error) {
        console.error("Error parsing supervisor response:", error);
        localStorage.removeItem("supervisorResponse");
      }
    }

    // Set all initial messages at once
    if (messages.length > 0) {
      setChatMessages(messages);
    }
  }, []);



  const [pendingUserInputs, setPendingUserInputs] = useState<
    UserInputRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingApproval, setProcessingApproval] = useState<string | null>(
    null
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure DOM has updated before scrolling
    const scrollTimeout = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    
    return () => clearTimeout(scrollTimeout);
  }, [chatMessages]);

  const handleSendMessage = async (messageText: string, files?: FileUploadResponse[]) => {
    if ((messageText.trim() || (files && files.length > 0)) && !isLoading && !isApiLoading && user) {
      console.log("📤 [Chat] Received message with files:", {
        message: messageText,
        filesCount: files?.length || 0,
        files: files?.map(file => ({
          filename: file.metadata.original_filename,
          s3_url: file.s3_url,
          content_type: file.metadata.content_type,
          file_size: file.metadata.file_size
        })) || []
      });

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
        type: "user_request",
        // Include files for user messages
        ...(files && files.length > 0 && { files: files }),
      };

      // Add user message to local chat state
      setChatMessages(prev => [...prev, newMessage]);

      setIsLoading(true);

      try {
        console.log("🚀 [Chat] Sending message with files:", {
          content: messageText,
          user_id: user.email,
          continue_task_id: currentTaskId,
          hasFiles: !!(files && files.length > 0),
          fileCount: files?.length || 0,
          files: files || []
        });

        const response = await postMessage({
          content: messageText,
          user_id: "test@rialto-financial.com",
          continue_task_id: currentTaskId || undefined,
          hasFiles: !!(files && files.length > 0),
          fileCount: files?.length || 0,
          files: files || [],
          enable_streaming: true,
        }).unwrap();

        console.log("✅ [Chat] Received response:", response);

        // Handle the response based on IMessageResponse interface
        if (response.success) {
          const supervisorResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: response.message,
            isUser: false,
            timestamp: new Date(),
            type: getMessageTypeFromStatus(response.status),
          };
          setChatMessages(prev => [...prev, supervisorResponse]);

          // Handle user input request if present
          if (response.user_input_request) {
            const userInputRequest: UserInputRequest = {
              id: response.user_input_request.actual_child_task_id || response.task_id || Date.now().toString(),
              message: response.user_input_request.message,
              agent: response.user_input_request.agent_name,
              timestamp: new Date(),
              task_id: response.user_input_request.actual_child_task_id || response.task_id,
              context: response.user_input_request.context,
            };
            setPendingUserInputs((prev) => [...prev, userInputRequest]);

            // Also add to chat messages
            const inputRequestMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              text: `🔔 ${response.user_input_request.agent_name} requests approval: ${response.user_input_request.message}`,
              isUser: false,
              timestamp: new Date(),
              type: "user_input_request",
            };
            setChatMessages(prev => [...prev, inputRequestMessage]);
          }
        } else {
          console.error("❌ [Chat] API returned error:", response);
          throw new Error(response.message || `API Error: ${JSON.stringify(response)}`);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        let errorMessage = "Unknown error occurred";

        if (error && typeof error === "object" && "data" in error) {
          errorMessage = (error as any).data?.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        // Log full error details for debugging
        console.error("Full error details:", {
          error,
          errorType: typeof error,
          errorKeys: error && typeof error === "object" ? Object.keys(error) : [],
          currentTaskId,
          urlTaskId,
        });

        const errorChatMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `❌ Error: ${errorMessage}`,
          isUser: false,
          timestamp: new Date(),
          type: "system",
        };
        setChatMessages(prev => [...prev, errorChatMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getMessageTypeFromStatus = (status: string): ChatMessage["type"] => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "complete":
      case "success":
        return "supervisor_complete";
      case "processing":
      case "in_progress":
      default:
        return "supervisor_planning";
    }
  };

  // Helper function to create special messages from SSE data
  const createSpecialMessage = (type: 'debug' | 'mcp_tools_executing' | 'mcp_progress' | 'mcp_tool_result', data: any): ChatMessage => {
    const messageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let content = '';
    let metadata: any = {};
    
    switch (type) {
      case 'debug':
        content = data.message || 'Debug message';
        metadata = { finish_reason: data.finish_reason };
        break;
      case 'mcp_tools_executing':
        content = `Executing tools: ${(data.tools_executing || []).join(', ')}`;
        metadata = { tools_executing: data.tools_executing || [] };
        break;
      case 'mcp_progress':
        content = data.message || 'Progress update';
        metadata = { progress_message: data.message };
        break;
      case 'mcp_tool_result':
        content = `Tool ${data.tool_name} completed ${data.success !== false ? 'successfully' : 'with errors'}`;
        metadata = { 
          tool_name: data.tool_name,
          tool_result: data.result || data 
        };
        break;
    }
    
    return {
      id: messageId,
      text: content,
      isUser: false,
      timestamp: new Date(),
      type: type,
      metadata: metadata
    };
  };

  // Demo function to test special message types
  const addTestSpecialMessages = () => {
    const testMessages: ChatMessage[] = [
      createSpecialMessage('debug', { 
        message: 'Executed 1 tools', 
        finish_reason: null 
      }),
      createSpecialMessage('mcp_tools_executing', { 
        tools_executing: ['quickbooks_online_create_bill_account_based'],
        finish_reason: null 
      }),
      createSpecialMessage('mcp_progress', { 
        message: 'QuickBooks bill creation in progress - this should complete quickly like Claude\'s requests',
        finish_reason: null 
      }),
      createSpecialMessage('mcp_tool_result', { 
        tool_name: 'quickbooks_online_create_bill_account_based',
        success: true,
        result: {
          original_response: {
            result: JSON.stringify({
              results: [{
                DueDate: "2025-08-01",
                VendorAddr: {
                  Id: "96",
                  Line1: "430 California Street 12th floor",
                  City: "San Francisco",
                  CountrySubDivisionCode: "CA",
                  PostalCode: "94104"
                },
                Balance: 162,
                domain: "QBO",
                sparse: false,
                Id: "157",
                SyncToken: "0",
                TxnDate: "2025-08-01",
                CurrencyRef: {
                  value: "USD",
                  name: "United States Dollar"
                },
                PrivateNote: "Invoice INV-02DQW-00036 for HR services and benefits",
                VendorRef: {
                  value: "58",
                  name: "People Center, Inc."
                },
                TotalAmt: 162
              }]
            })
          },
          processed_data: {
            bill_created: true,
            bill_id: null,
            amount: null,
            date: null,
            vendor: null,
            status: "SUCCESS",
            message: "Bill created successfully in QuickBooks"
          }
        },
        finish_reason: null 
      })
    ];
    
    setChatMessages(prev => [...prev, ...testMessages]);
  };

  const handleUserInputResponse = async (
    inputRequest: UserInputRequest,
    response: "approve" | "deny"
  ) => {
    // Prevent multiple submissions
    if (processingApproval === inputRequest.id) return;

    setProcessingApproval(inputRequest.id);

    try {
      // Send approval/denial to backend via the message API
      const responseText = `${response === "approve" ? "APPROVE" : "DENY"}`;

      console.log("🚀 [Chat] Sending user input response:", {
        continue_task_id: currentTaskId,
        response,
        context: inputRequest.context,
      });

      // Add user response to chat first
      const userResponseMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `${response === "approve" ? "✅ Approved" : "❌ Denied"}`,
        isUser: true,
        timestamp: new Date(),
        type: "user_request",
      };
      setChatMessages(prev => [...prev, userResponseMessage]);

      // Send the response to the backend
      const apiResponse = await postMessage({
        content: responseText,
        user_id: "test@rialto-financial.com",
        continue_task_id: currentTaskId || undefined,
        enable_streaming: true,
      }).unwrap();

      console.log("✅ [Chat] Received user input response:", apiResponse);

      // Remove from pending only after successful API call
      setPendingUserInputs((prev) =>
        prev.filter((req) => req.id !== inputRequest.id)
      );

      // Handle any supervisor response from the approval/denial
      if (apiResponse.success && apiResponse.message) {
        const supervisorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: apiResponse.message,
          isUser: false,
          timestamp: new Date(),
          type: getMessageTypeFromStatus(apiResponse.status),
        };
        setChatMessages(prev => [...prev, supervisorResponse]);

        // Handle any new user input requests that might come from this response
        if (apiResponse.user_input_request) {
          const newUserInputRequest: UserInputRequest = {
            id: apiResponse.user_input_request.actual_child_task_id || apiResponse.task_id || Date.now().toString(),
            message: apiResponse.user_input_request.message,
            agent: apiResponse.user_input_request.agent_name,
            timestamp: new Date(),
            task_id: apiResponse.user_input_request.actual_child_task_id || apiResponse.task_id,
            context: apiResponse.user_input_request.context,
          };
          setPendingUserInputs((prev) => [...prev, newUserInputRequest]);

          // Add to chat messages
          const newInputRequestMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            text: `🔔 ${apiResponse.user_input_request.agent_name} requests approval: ${apiResponse.user_input_request.message}`,
            isUser: false,
            timestamp: new Date(),
            type: "user_input_request",
          };
          setChatMessages(prev => [...prev, newInputRequestMessage]);
        }
      }
    } catch (error) {
      console.error("❌ [Chat] Error sending user input response:", error);
      // Add error message to chat if needed
      const errorChatMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `❌ Error sending ${response}: ${error instanceof Error ? error.message : error}`,
        isUser: false,
        timestamp: new Date(),
        type: "system",
      };
      setChatMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setProcessingApproval(null);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Los_Angeles", // PST/PDT timezone
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, messageId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMessageId(null);
  };

  const handleCopyMessage = (messageText: string) => {
    navigator.clipboard.writeText(messageText);
    handleMenuClose();
  };

  const handleThumbsUp = (messageId: string) => {
    console.log("👍 Thumbs up for message:", messageId);
    handleMenuClose();
  };

  const handleThumbsDown = (messageId: string) => {
    console.log("👎 Thumbs down for message:", messageId);
    handleMenuClose();
  };

  const handleTaskPlanEdit = (content: string, type: 'task_plan' | 'tool_call') => {
    console.log(`🖊️ Edit ${type}:`, content);
    // TODO: Implement edit functionality - could open a modal for editing
    // For now, just log the action
  };

  const handleTaskPlanAccept = async (content: string, type: 'task_plan' | 'tool_call') => {
    console.log(`✅ Accept ${type}:`, content);
    
    try {
      // Send acceptance to backend
      const response = await postMessage({
        content: `ACCEPT_${type.toUpperCase()}: ${content}`,
        user_id: "test@rialto-financial.com",
        continue_task_id: currentTaskId || undefined,
        enable_streaming: true,
      }).unwrap();

      console.log("✅ [Chat] Acceptance response:", response);

      // Handle the response
      if (response.success && response.message) {
        const acceptanceResponse: ChatMessage = {
          id: (Date.now()).toString(),
          text: response.message,
          isUser: false,
          timestamp: new Date(),
          type: getMessageTypeFromStatus(response.status),
        };
        setChatMessages(prev => [...prev, acceptanceResponse]);
      }
    } catch (error) {
      console.error("❌ [Chat] Error accepting:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now()).toString(),
        text: `❌ Error accepting ${type}: ${error instanceof Error ? error.message : error}`,
        isUser: false,
        timestamp: new Date(),
        type: "system",
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "complete":
        return "success.main";
      case "waiting":
        return "warning.main";
      case "failed":
        return "error.main";
      case "progress":
      default:
        return "primary.main";
    }
  };

  const getTypeDisplayText = (type: string) => {
    switch (type) {
      case "supervisor_planning":
        return "Planning";
      case "supervisor_iteration":
        return "Iterating";
      case "supervisor_complete":
        return "Complete";
      case "supervisor_task_plan":
        return "Task Plan";
      case "supervisor_task_result":
        return "Task Results";
      case "user_input_request":
        return "Input Required";
      case "system":
        return "System";
      default:
        return type;
    }
  };

  // Set toolbar content
  useEffect(() => {
    setToolbarContent(
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
        <ActionButton
          onClick={() => navigate("/tasks")}
          sx={{
            minWidth: "auto",
            border: "none",
            p: 1,
            "&:hover": {
              border: "none",
              background: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <ArrowBackIcon /> All tasks
        </ActionButton>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={addTestSpecialMessages}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        >
          Test SSE Messages
        </Button>
        <SearchField placeholder="Search..." size="small" sx={{ width: 200 }} />
      </Box>
    );
  }, [navigate, setToolbarContent]);

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
            isLoading={isApiLoading}
            placeholder={
              isApiLoading
                ? "Connecting to backend..."
                : "How can I help?"
            }
            disabled={!user}
          />
        </Box>
      </Box>
    );
  }, [handleSendMessage, isApiLoading, user, setUserInputContent]);

  return (
    <ChatPanel>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 1,
        }}
      >
        {/* Chat Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pr: 1,
            pb: "128px", // Add bottom padding to prevent scrolling behind user input
          }}
        >
          {/* API Error Display */}
          {apiError && (
            <Box
              sx={{
                p: 1.5,
                backgroundColor: "error.light",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "error.main",
              }}
            >
              <Typography
                sx={{
                  color: "error.dark",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                ❌ API Connection Error:{" "}
                {(apiError as any)?.data?.message ||
                  "Failed to connect to backend"}
              </Typography>
            </Box>
          )}



          {/* User Auth Warning */}
          {!user && (
            <Box
              sx={{
                p: 1.5,
                backgroundColor: "warning.light",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "warning.main",
              }}
            >
              <Typography
                sx={{
                  color: "warning.dark",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                ⚠️ Please log in to send messages to the supervisor
              </Typography>
            </Box>
          )}

          {chatMessages.map((msg, index) => {
            const showDate =
              index === 0 ||
              !isSameDay(
                chatMessages[index - 1].timestamp,
                msg.timestamp
              );

            return (
              <Box key={msg.id} sx={{ mb: 2 }}>
                {showDate && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      my: 2,
                      color: "text.secondary",
                    }}
                  >
                    {formatDate(msg.timestamp)}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: msg.isUser ? "flex-end" : "flex-start",
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget.querySelector('.message-actions');
                    if(target && target instanceof HTMLElement) target.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget.querySelector('.message-actions');
                    if(target && target instanceof HTMLElement) target.style.opacity = '0';
                  }}
                >
                  {msg.isUser ? (
                    // User messages: keep the box styling
                    <Box
                      sx={{
                        bgcolor: "#FFE0B2",  // Light orange background for user messages
                        color: "#424242",  // Dark grey text for user messages
                        p: 1.5,
                        borderRadius: 2,
                        maxWidth: "70%",
                        boxShadow: 1,
                      }}
                    >
                      <Typography 
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-wrap',  // Preserve whitespace and line breaks
                          wordBreak: 'break-word'  // Break long words if needed
                        }}
                      >
                        {msg.text}
                      </Typography>
                      
                      {/* Display uploaded files if they exist */}
                      {msg.files && msg.files.length > 0 && (
                        <Box sx={{ mt: 1.5, mb: 1 }}>
                          <Typography variant="caption" sx={{ color: "#616161", fontWeight: 500 }}>
                            Attached files:
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {msg.files.map((file, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  p: 1,
                                  backgroundColor: '#FFF3E0',
                                  borderRadius: 1,
                                  border: '1px solid #FFCC80',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    backgroundColor: '#FF9800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {file.metadata.content_type.startsWith('image/') ? '🖼️' : 
                                   file.metadata.content_type.includes('pdf') ? '📄' : 
                                   file.metadata.content_type.includes('word') ? '📝' : 
                                   file.metadata.content_type.includes('excel') || file.metadata.content_type.includes('spreadsheet') ? '📊' : 
                                   '📎'}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      color: '#424242',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {file.metadata.original_filename}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: '#757575' }}
                                  >
                                    {(file.metadata.file_size / 1024).toFixed(1)} KB
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          mt: 1,
                          color: "#616161",  // Slightly lighter grey for user message timestamps
                          opacity: 0.7,
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </Box>
                  ) : (
                    // Agent messages: no box, render Markdown or special message types
                    <Box
                      sx={{
                        maxWidth: "85%",
                        color: "text.primary",
                      }}
                    >
                      {/* Handle special message types */}
                      {(msg.type === 'debug' || msg.type === 'mcp_tools_executing' || 
                        msg.type === 'mcp_progress' || msg.type === 'mcp_tool_result') ? (
                        <SpecialMessageRenderer 
                          message={{
                            id: msg.id,
                            role: 'assistant',
                            content: msg.text,
                            timestamp: msg.timestamp,
                            type: msg.type as 'debug' | 'mcp_tools_executing' | 'mcp_progress' | 'mcp_tool_result',
                            metadata: msg.metadata,
                            conversation_id: undefined
                          }} 
                        />
                      ) : (
                        <>
                          <TaskPlanRenderer 
                            content={msg.text}
                            onEdit={handleTaskPlanEdit}
                            onAccept={handleTaskPlanAccept}
                          />
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
                        </>
                      )}
                    </Box>
                  )}
                  <Box
                    className="message-actions"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      [msg.isUser ? 'left' : 'right']: '-40px',
                      display: 'flex',
                      flexDirection: msg.isUser ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: 0,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, msg.id)}>
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            );
          })}
          <div ref={chatEndRef} />
        </Box>
      </Box>

      {/* Dropdown Menu */}
      <Popper
        open={Boolean(menuAnchorEl)}
        anchorEl={menuAnchorEl}
        placement="bottom-end"
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleMenuClose}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              minWidth: 200,
              mt: 1,
              border: "1px solid",
              borderColor: "grey.300",
              backgroundColor: "white",
            }}
          >
            <MenuList>
              <MenuItem onClick={() => { console.log("Duplicate Chat"); handleMenuClose(); }}>
                <ListItemText
                  primary="Duplicate Chat"
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    color: "grey.600",
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
              <MenuItem onClick={() => { console.log("Report Issue"); handleMenuClose(); }}>
                <ListItemText
                  primary="Report Issue"
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    color: "grey.600",
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
              <MenuItem onClick={() => { console.log("Copy Request ID"); handleMenuClose(); }}>
                <ListItemText
                  primary="Copy Request ID"
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    color: "grey.600",
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </ChatPanel>
  );
}
