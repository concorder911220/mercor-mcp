import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import ActionButton from "./ActionButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface OnboardingDialogProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingDialog({ open, onClose }: OnboardingDialogProps) {
  const navigate = useNavigate();
  const [onboardingName, setOnboardingName] = useState("");

  const handleStartOnboarding = () => {
    navigate(`/tasks/new?onboardingName=${onboardingName}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ p: 3 }}>
        <DialogTitle sx={{ p: 0, mb: 2 }}>
          Who are you looking to onboard?
        </DialogTitle>
        <TextField
          autoFocus
          fullWidth
          placeholder="Enter client name"
          variant="outlined"
          value={onboardingName}
          onChange={(e) => setOnboardingName(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton
            onClick={handleStartOnboarding}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "hsl(48,33%,97%)",
              "&:hover": {
                backgroundColor: "hsl(48,33%,94%)",
              },
            }}
          >
            <img src="/logo.png" alt="Logo" style={{ width: 16, height: 16 }} />
            Start Onboarding
          </ActionButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
