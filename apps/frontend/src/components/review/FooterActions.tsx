import React, { useState } from "react";
import { 
  Box, 
  Button, 
  Stack, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Pause as PauseIcon,
  CloudUpload as UploadIcon,
  NavigateNext as NextIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

interface FooterActionsProps {
  onReject: () => void;
  onHold: () => void;
  onApproveUpload: () => void;
  onApproveNext: () => void;
  canBulk: boolean;
}

export default function FooterActions({ 
  onReject, 
  onHold, 
  onApproveUpload, 
  onApproveNext,
  canBulk 
}: FooterActionsProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);

  const handleReject = () => {
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    onReject();
    setRejectDialogOpen(false);
    setRejectReason("");
  };

  const handleApprove = async (andNext: boolean) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadLogs([]);

    // Simulate streaming upload with logs
    const logs = [
      "Connecting to QuickBooks...",
      "Validating document data...",
      "Creating vendor record...",
      "Posting invoice...",
      "Upload complete!"
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setUploadProgress((i + 1) / logs.length * 100);
      setUploadLogs(prev => [...prev, logs[i]]);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (andNext) {
      onApproveNext();
    } else {
      onApproveUpload();
    }
    
    setUploading(false);
    setUploadProgress(0);
    setUploadLogs([]);
  };

  return (
    <>
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "sticky",
          bottom: 0,
        }}
      >
        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 1 }} />
            <Box sx={{ maxHeight: 100, overflow: "auto" }}>
              {uploadLogs.map((log, i) => (
                <Typography key={i} variant="caption" display="block" color="text.secondary">
                  {log}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={handleReject}
              disabled={uploading}
            >
              Reject
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<PauseIcon />}
              onClick={onHold}
              disabled={uploading}
            >
              Hold
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            {canBulk && (
              <Button
                variant="outlined"
                disabled={uploading}
              >
                Bulk Approve All
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={() => handleApprove(false)}
              disabled={uploading}
            >
              Approve & Upload to QuickBooks
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              endIcon={<NextIcon />}
              onClick={() => handleApprove(true)}
              disabled={uploading}
            >
              Approve & Next
            </Button>
          </Stack>
        </Stack>

        {/* Keyboard shortcuts hint */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Shortcuts: J/K = prev/next • E = edit • P = approve & next • G = next low confidence
        </Typography>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}