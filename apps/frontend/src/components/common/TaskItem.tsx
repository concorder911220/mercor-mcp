import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { Task } from "../../types/index";
import { useTask } from "../../context/TaskContext";

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 250,
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const StyledChip = styled(Chip)(() => ({
  borderRadius: "12px",
  backgroundColor: "hsl(48,33%,97%)",
  color: "#4B5563",
  "& .MuiChip-label": {
    fontWeight: 500,
  },
}));

interface TaskItemProps {
  task: Task;
  onClick?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // const { setTask } = useTask(); // Removed - using URL-based navigation instead
  const handleTaskClick = () => {
    if (task.status === "WAITING") {
      if (task.description?.includes("Sync Linda Mahon's base facts")) {
        navigate("/tasks/review2");
      } else {
        navigate("/tasks/review");
      }
    }
  };
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const taskHandler = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click from interfering
    const taskId = task.parent_id || task.id || "default-task-id";
    localStorage.setItem("selectedTask", taskId);
    // setTask(taskId);
    
    // Navigate to task-specific URL (remove "task-" prefix for URL if present)
    const taskIdForUrl = taskId.startsWith('task-') ? taskId.replace('task-', '') : taskId;
    navigate(`/task/${taskIdForUrl}`);
  };

  // Function to truncate description to max 50 characters
  const truncateDescription = (
    description: string,
    maxLength: number = 150
  ) => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength).trim() + "...";
  };

  // Get display values with fallbacks
  const displayDescription = task.description || task.request || "No description";
  const displayTypes = task.type || (task.actor_id ? [task.actor_id] : ["General"]);
  const displayOwner = task.owner || "Rialto";
  const displayClient = task.client || (task.account?.join(", ")) || "Unknown";
  const displayTimeline = task.timeline || "No timeline";

  return (
    <StyledCard onClick={handleTaskClick} sx={{ cursor: "pointer" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 1.5,
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: 1.4,
              color: "#1f2937",
            }}
            onClick={taskHandler}
          >
            {truncateDescription(displayDescription)}
          </Typography>
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{ color: "text.secondary", mt: -0.5, mr: -1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
          >
            <MenuItem onClick={handleClose}>Option 1</MenuItem>
            <MenuItem onClick={handleClose}>Option 2</MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
          {displayTypes.map((t, index) => (
            <StyledChip key={index} label={t} variant="filled" size="small" />
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
          }}
        >
          <Typography variant="body2">{displayClient}</Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2">{displayTimeline}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {displayOwner === "Rialto" ? (
              <Box
                component="img"
                src="/logo.png"
                sx={{
                  width: 24,
                  height: 24,
                  objectFit: "contain",
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: "primary.main",
                  fontSize: "12px",
                }}
              >
                {displayOwner.charAt(0)}
              </Avatar>
            )}
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default TaskItem;
