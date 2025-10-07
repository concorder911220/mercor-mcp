import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetTasksQuery } from "../redux/task/taskApi";
import ActionButton from "../components/common/ActionButton";
import ActionDropdown from "../components/common/ActionDropdown";
import SearchField from "../components/common/SearchField";
import TaskItem from "../components/common/TaskItem";
import { Task } from "../types";
import { ITask } from "../redux/data-types/task";

const Tasks: React.FC = () => {
  // Use the API query with empty parameters
  const { data: tasksResponse, isLoading, error } = useGetTasksQuery({});
  const navigate = useNavigate();

  // Map backend status to display status
  const statusMapping: Record<string, string> = {
    for_review: "FOR_REVIEW", 
    review: "FOR_REVIEW",
    waiting: "FOR_REVIEW",
    to_do: "FOR_REVIEW",
    todo: "FOR_REVIEW",
    pending: "FOR_REVIEW",
    in_progress: "IN_PROGRESS",
    started: "IN_PROGRESS",
    ongoing: "ONGOING",
    completed: "COMPLETED",
    done: "COMPLETED",
    finished: "COMPLETED",
    approved: "COMPLETED",
    success: "COMPLETED",
    failed: "FOR_REVIEW",
    rejected: "FOR_REVIEW",
  };

  const statuses = ["FOR_REVIEW", "IN_PROGRESS", "ONGOING", "COMPLETED"];

  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case "FOR_REVIEW":
        return "For Review";
      case "IN_PROGRESS":
        return "In Progress";
      case "ONGOING":
        return "Ongoing";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  // Convert backend tasks to display format
  const convertBackendTaskToDisplayTask = (backendTask: ITask): Task => {
    const mappedStatus = statusMapping[backendTask.current_status] || backendTask.current_status;

    // Create a task with required frontend properties
    const task = {
      ...backendTask,
      description: backendTask.request,
      status: mappedStatus,
      client: backendTask.account?.join(", ") || "Unknown",
    };
    
    return task as Task;
  };

  // Get tasks for display
  const getDisplayTasks = (): Task[] => {
    if (!tasksResponse?.success || !tasksResponse.tasks) {
      return [];
    }

    // Filter out user_input status tasks
    const filteredTasks = tasksResponse.tasks.filter(
      (task) => task.current_status !== "user_input" && task.actor_id !== "user_input"
    );

    return filteredTasks.map(convertBackendTaskToDisplayTask);
  };

  const displayTasks = getDisplayTasks();

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 2 }}>
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 2 }}>
        <Typography color="error">
          Error loading tasks: {JSON.stringify(error)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", width: "100%", height: "100%" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Tasks
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <ActionButton onClick={() => navigate("/tasks/new")}>
            New Task
          </ActionButton>
          <Box sx={{ display: "flex", gap: 2 }}>
            <ActionDropdown
              label="All Tasks"
              options={[
                { label: "All Tasks", onClick: () => {} },
                { label: "My Tasks", onClick: () => {} },
                { label: "Team Tasks", onClick: () => {} },
              ]}
            />
            <SearchField placeholder="Search..." size="small" sx={{ width: 200 }} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        {statuses.map((status) => (
          <Box
            key={status}
            sx={{
              flex: 1,
              minWidth: "250px",
              backgroundColor: "background.paper",
              p: 2,
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {getStatusDisplayName(status)}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {displayTasks
                .filter((task) => task.current_status === status)
                .map((task, index) => (
                  <TaskItem key={`${task.id}-${index}`} task={task} />
                ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Tasks;
