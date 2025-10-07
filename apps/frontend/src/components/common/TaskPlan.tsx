import React from "react";
import { Box, Typography, Button } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import { useTaskLayout } from "../../context/TaskLayoutContext";

interface TaskPlanItem {
  task: string;
  tag: string;
  isAutomated: boolean;
}

interface TaskPlanProps {
  tasks: TaskPlanItem[];
  onApprove?: () => void;
}

export function TaskPlan({
  tasks,
  onApprove,
}: TaskPlanProps) {
  const { openModal, setModalContent } = useTaskLayout();

  const handleEditClick = () => {
    setModalContent(
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Edit Task</Typography>
        {/* Modal content will be added later */}
      </Box>
    );
    openModal();
  };

  return (
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
          Onboard Linda Mahon
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
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
            Configure
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<CheckIcon />}
            onClick={onApprove}
            sx={{
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Approve
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {tasks.map((item, index) => {
          return (
            <Box key={index}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "text.primary" }}
                  >
                    {index + 1}. {item.task}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      bgcolor: "grey.100",
                      px: 1,
                      py: 0.5,
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {item.tag}
                  </Typography>
                  <Box
                    component="img"
                    src={
                      item.isAutomated
                        ? "/logo.png"
                        : "/ProfilePicture.png"
                    }
                    sx={{
                      width: 24,
                      height: 24,
                      objectFit: "contain",
                      ml: 1,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
} 