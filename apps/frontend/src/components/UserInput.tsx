import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Popper,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
} from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
import { useAuth } from "../context/AuthContext";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import TuneIcon from "@mui/icons-material/Tune";
import MicIcon from "@mui/icons-material/Mic";
import ExtensionIcon from "@mui/icons-material/Extension";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import { FileUploadResponse } from "../redux/data-types/message";
import { useUploadFileMutation } from "../redux/message/messageApi";

interface FileUploadState {
  file: File;
  response?: FileUploadResponse;
  uploading: boolean;
  error?: string;
}

// Styled components using Rialto design system
const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(4), // 32px - increased corner radius
  backgroundColor: 'white',
  padding: theme.spacing(3), // Increased from 2 to 3 (16px to 24px)
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInput-underline:before': {
    display: 'none',
  },
  '& .MuiInput-underline:after': {
    display: 'none',
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    display: 'none',
  },
}));

const FileUploadContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const BottomContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const LeftActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2), // Increased from 1 to 2 (8px to 16px)
  alignItems: 'center',
}));

const RightActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2), // Increased from 1 to 2 (8px to 16px)
  alignItems: 'center',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: theme.spacing(2),
  borderRadius: '50%',
  width: theme.spacing(6), // 48px - increased from 40px
  height: theme.spacing(6), // 48px - increased from 40px
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '50%',
  width: theme.spacing(6), // 48px - increased from 40px
  height: theme.spacing(6), // 48px - increased from 40px
}));

const ToolsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  borderRadius: theme.spacing(2), // 16px
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ToolsText = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2.5), // 20px
  minWidth: theme.spacing(25), // 200px
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  elevation: 0,
}));

const MenuItemText = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));

interface UserInputProps {
  onSendMessage: (messageText: string, files?: FileUploadResponse[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function UserInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Assign me a task...",
  disabled = false
}: UserInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUploadState[]>([]);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const toolsButtonRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [uploadFile] = useUploadFileMutation();
  const theme = useTheme();

  // MCP integrations state
  const [mcpIntegrations, setMcpIntegrations] = useState([
    { name: 'Outlook', icon: '/integration_logos/outlook.png', enabled: true },
    { name: 'Salesforce', icon: '/integration_logos/salesforce.png', enabled: true },
    { name: 'Dropbox', icon: '/integration_logos/dropbox.png', enabled: true },
    { name: 'QuickBooks', icon: '/integration_logos/quickbooks.png', enabled: true },
  ]);

  const handleSendMessage = () => {
    console.log("fileUploads", fileUploads)
    const successfulUploads = fileUploads
      .filter(upload => upload.response && !upload.error)
      .map(upload => upload.response!);

    console.log("successfulUploads", successfulUploads) 

    if ((inputValue.trim() || successfulUploads.length > 0) && !isLoading && !disabled) {
      console.log("📤 [UserInput] Sending message with file uploads:", {
        message: inputValue.trim(),
        uploadsCount: successfulUploads.length,
        uploads: successfulUploads.map(r => ({
          filename: r.metadata.original_filename,
          s3_url: r.s3_url,
        }))
      });

      onSendMessage(inputValue.trim(), successfulUploads.length > 0 ? successfulUploads : undefined);
      setInputValue("");
      setFileUploads([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
  };

  const handleToolsClick = () => {
    setToolsDropdownOpen(!toolsDropdownOpen);
  };

  const handleToolsDropdownClose = () => {
    setToolsDropdownOpen(false);
  };

  const handleToggleIntegration = (index: number) => {
    setMcpIntegrations(prev => prev.map((integration, i) =>
      i === index ? { ...integration, enabled: !integration.enabled } : integration
    ));
  };

  const handleConfigure = () => {
    console.log("Configure clicked");
    setToolsDropdownOpen(false);
  };

  const handleAddFromApps = () => {
    console.log("Add from apps clicked");
    setDropdownOpen(false);
  };

  const handleAddPhotosFiles = () => {
    console.log("Add photos and files clicked");
    setDropdownOpen(false);
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadFileHandler = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadFile(formData).unwrap();
      return result;
    } catch (error) {
      console.error("❌ File upload failed:", error);
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      console.log("📎 Files selected, starting upload:", files.map(f => f.name));

      // Add files to state with uploading status
      const newUploads: FileUploadState[] = files.map(file => ({
        file,
        uploading: true,
      }));

      setFileUploads(prev => [...prev, ...newUploads]);

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadIndex = fileUploads.length + i;

        try {
          console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`);
          const uploadResponse = await uploadFileHandler(file);

          // Update the upload state with the response
          setFileUploads(prev => prev.map((upload, index) =>
            index === uploadIndex ? {
              ...upload,
              uploading: false,
              response: uploadResponse,
            } : upload
          ));

          console.log(`✅ File uploaded successfully: ${file.name}`, uploadResponse);
        } catch (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error);

          // Update the upload state with the error
          setFileUploads(prev => prev.map((upload, index) =>
            index === uploadIndex ? {
              ...upload,
              uploading: false,
              error: error instanceof Error ? error.message : 'Upload failed',
            } : upload
          ));
        }
      }
    }

    // Reset the input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFileUploads(prev => prev.filter((_, i) => i !== index));
    console.log("File upload removed");
  };

  const getFileIcon = (upload: FileUploadState) => {
    if (upload.uploading) {
      return <CircularProgress size={16} />;
    } else if (upload.error) {
      return <ErrorIcon fontSize="small" color="error" />;
    } else if (upload.response) {
      return <CheckCircleIcon fontSize="small" color="success" />;
    }
    return <AttachFileIcon fontSize="small" />;
  };

  const getFileColor = (upload: FileUploadState) => {
    if (upload.error) return "error";
    if (upload.response) return "success";
    return "default";
  };

  return (
    <StyledContainer
      sx={{
        backgroundColor: (disabled || isLoading)
          ? theme.palette.action.hover
          : 'white',
      }}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*,application/pdf,.doc,.docx,.txt,.csv,.xlsx"
        style={{ display: 'none' }}
      />

      {/* Display file uploads */}
      {fileUploads.length > 0 && (
        <FileUploadContainer>
          {fileUploads.map((upload, index) => (
            <Chip
              key={`${upload.file.name}-${index}`}
              icon={getFileIcon(upload)}
              label={upload.file.name}
              onDelete={() => handleRemoveFile(index)}
              deleteIcon={<CloseIcon fontSize="small" />}
              variant="outlined"
              size="small"
              color={getFileColor(upload)}
              title={upload.error || (upload.response ? "Upload successful" : "Uploading...")}
              sx={{
                maxWidth: theme.spacing(25), // 200px
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
          ))}
        </FileUploadContainer>
      )}

      <StyledTextField
        fullWidth
        multiline
        maxRows={3}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        variant="standard"
        disabled={disabled || isLoading}
      />
      <BottomContainer>
        <LeftActionContainer>
          <Box sx={{ position: "relative" }}>
            <StyledIconButton
              ref={addButtonRef}
              onClick={handleAddClick}
            >
              <AddIcon fontSize="small" />
            </StyledIconButton>
            <StyledPopper
              open={dropdownOpen}
              anchorEl={addButtonRef.current}
              placement="bottom-start"
            >
              <ClickAwayListener onClickAway={handleDropdownClose}>
                <StyledPaper>
                  <MenuList>
                    <MenuItem onClick={handleAddFromApps}>
                      <ListItemIcon>
                        <ExtensionIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <MenuItemText>Add from apps</MenuItemText>
                        }
                      />
                      <ChevronRightIcon fontSize="small" sx={{ color: theme.palette.text.disabled }} />
                    </MenuItem>
                    <MenuItem onClick={handleAddPhotosFiles}>
                      <ListItemIcon>
                        <PhotoLibraryIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <MenuItemText>Add photos and files</MenuItemText>
                        }
                      />
                    </MenuItem>
                  </MenuList>
                </StyledPaper>
              </ClickAwayListener>
            </StyledPopper>
          </Box>
          <Box sx={{ position: "relative" }}>
            <ToolsContainer ref={toolsButtonRef} onClick={handleToolsClick}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: theme.spacing(3), // 24px
                  height: theme.spacing(3), // 24px
                }}
              >
                <TuneIcon fontSize="small" />
              </Box>
              <ToolsText>Tools</ToolsText>
            </ToolsContainer>
            <StyledPopper
              open={toolsDropdownOpen}
              anchorEl={toolsButtonRef.current}
              placement="bottom-start"
            >
              <ClickAwayListener onClickAway={handleToolsDropdownClose}>
                <StyledPaper>
                  <MenuList>
                    {mcpIntegrations.map((integration, index) => (
                      <MenuItem key={integration.name} onClick={() => handleToggleIntegration(index)}>
                        <ListItemIcon>
                          <Box
                            component="img"
                            src={integration.icon}
                            alt={integration.name}
                            sx={{
                              width: 20,
                              height: 20,
                              objectFit: 'contain',
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <MenuItemText>{integration.name}</MenuItemText>
                          }
                          sx={{ marginRight: theme.spacing(2) }}
                        />
                        {integration.enabled && (
                          <CheckIcon
                            sx={{
                              fontSize: 16,
                              color: theme.palette.success.main,
                              border: `1px solid ${theme.palette.success.main}`,
                              borderRadius: '2px',
                              padding: '1px',
                            }}
                          />
                        )}
                      </MenuItem>
                    ))}
                    <MenuItem onClick={handleConfigure}>
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <MenuItemText>Configure</MenuItemText>
                        }
                      />
                    </MenuItem>
                  </MenuList>
                </StyledPaper>
              </ClickAwayListener>
            </StyledPopper>
          </Box>
        </LeftActionContainer>
        <RightActionContainer>
          <StyledIconButton>
            <MicIcon fontSize="small" />
          </StyledIconButton>
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && fileUploads.length === 0 || isLoading || disabled}
            sx={{
              backgroundColor: (inputValue.trim() || fileUploads.length > 0) ? theme.palette.primary.main : "transparent",
              color: (inputValue.trim() || fileUploads.length > 0) ? theme.palette.primary.contrastText : theme.palette.text.disabled,
              "&:hover": {
                backgroundColor: (inputValue.trim() || fileUploads.length > 0)
                  ? theme.palette.primary.dark
                  : theme.palette.action.hover,
              },
            }}
          >
            <SendIcon fontSize="small" />
          </SendButton>
        </RightActionContainer>
      </BottomContainer>
    </StyledContainer>
  );
} 