import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { Sidebar2 } from "../components/Sidebar2";
import { StandardPanel } from "../components/common/StandardPanel";
import ActionButton from "../components/common/ActionButton";
import NotesIcon from "@mui/icons-material/Notes";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingDialog } from "../components/common/OnboardingDialog";
import { OAuthIntegrations } from "../components/OAuthIntegrations";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({ open, onClose, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Onboarding</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to start onboarding?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Start Onboarding</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Agents() {
  const [onboardingDialogOpen, setOnboardingDialogOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        // const agentsData = await integrationService.getAgents();
        // setAgents(agentsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch agents:", err);
        setError(
          "Failed to load agents. Please check if the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Sidebar2 />
        <Box
          sx={{
            flex: 1,
            p: 4,
            pl: 6,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar2 />
      <Box
        sx={{
          flex: 1,
          p: 4,
          pl: 6,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: "75%",
          margin: "0 auto",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <StandardPanel
          title="Template Gallery"
          actions={
            <ActionButton sx={{ bgcolor: "rgba(0, 0, 0, 0.04)" }}>
              See More
            </ActionButton>
          }
        >
          <Box sx={{ display: "flex", gap: 2, height: "fit-content" }}>
            <Box
              sx={{
                flex: 1,
                p: 3,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: 1,
                  }}
                >
                  <NotesIcon
                    sx={{ width: 32, height: 24, color: "text.secondary" }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Meeting Assistant Agent
                  </Typography>
                  <Typography variant="body2">
                    Attends meetings, adds notes and tasks to CRM, and completes
                    follow-ups
                  </Typography>
                </Box>
              </Box>
              <ActionButton
                onClick={() => setOnboardingDialogOpen(true)}
                sx={{ alignSelf: "flex-start", bgcolor: "rgba(0, 0, 0, 0.04)" }}
              >
                Get started
              </ActionButton>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 3,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: 1,
                  }}
                >
                  <DocumentScannerIcon
                    sx={{ width: 32, height: 24, color: "text.secondary" }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Client Onboarding Agent
                  </Typography>
                  <Typography variant="body2">
                    Automate the entire lifecycle of onboarding a new client
                  </Typography>
                </Box>
              </Box>
              <ActionButton
                onClick={() => setOnboardingDialogOpen(true)}
                sx={{ alignSelf: "flex-start", bgcolor: "rgba(0, 0, 0, 0.04)" }}
              >
                Get started
              </ActionButton>
            </Box>
            <OnboardingDialog
              open={onboardingDialogOpen}
              onClose={() => setOnboardingDialogOpen(false)}
            />

            <Box
              sx={{
                flex: 1,
                p: 3,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: 1,
                  }}
                >
                  <TrendingUpIcon
                    sx={{ width: 32, height: 24, color: "text.secondary" }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Financial Planning Agent
                  </Typography>
                  <Typography variant="body2">
                    Creates financial plans in one click and integrates them
                    into your planning tool
                  </Typography>
                </Box>
              </Box>
              <ActionButton
                onClick={() => setOnboardingDialogOpen(true)}
                sx={{ alignSelf: "flex-start", bgcolor: "rgba(0, 0, 0, 0.04)" }}
              >
                Get started
              </ActionButton>
            </Box>
            <OnboardingDialog
              open={onboardingDialogOpen}
              onClose={() => setOnboardingDialogOpen(false)}
            />
          </Box>
        </StandardPanel>
        <StandardPanel title="Custom Agents">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                p: 1,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: 2,
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <EditIcon sx={{ color: "text.secondary" }} />
              <TextField
                fullWidth
                placeholder="Type your agent description here"
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  endAdornment: (
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark" },
                        width: 32,
                        height: 32,
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <Typography sx={{ mt: 0.5, mb: 0.5, color: "text.secondary" }}>
              Suggestions for you
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 2,
              }}
            >
              {[
                "Automates meeting scheduling",
                "Prepares me for client meetings and drafts proposals",
                "Helps me find new leads",
                "Creates automated and recurring marketing content",
              ].map((suggestion) => (
                <Box
                  key={suggestion}
                  sx={{
                    p: 1,
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                    },
                  }}
                >
                  <Typography variant="body2">{suggestion}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </StandardPanel>
        
        {/* OAuth Integrations Panel */}
        <OAuthIntegrations />
        
        {/* <StandardPanel
          title="Available Integrations"
          actions={
            <ActionButton sx={{ bgcolor: "rgba(0, 0, 0, 0.04)" }}>
              Browse All
            </ActionButton>
          }
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 3,
              p: 3,
            }}
          >
            {[
              "logo_altruist",
              "anthropic",
              "envestnet",
              "fidelity",
              "gmail",
              "gemini",
              "jump",
              "orion",
              "redtail",
              "salesforce",
              "schwab",
              "ssc",
              "wealthbox",
            ].map((logo) => (
              <Box
                key={logo}
                component="img"
                src={`./integration_logos/${logo}.png`}
                sx={{
                  width: "100%",
                  height: 40,
                  objectFit: "contain",
                  opacity: 0.85,
                  transition: "all 0.2s",
                  "&:hover": {
                    opacity: 1,
                    transform: "scale(1.05)",
                  },
                }}
              />
            ))}
          </Box>
        </StandardPanel> */}
      </Box>
    </Box>
  );
}
