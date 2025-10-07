import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import ActionButton from "./ActionButton";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Are you sure you want Rialto to take similar actions autonomously
          going forward?
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton
            onClick={onConfirm}
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
            Auto-Pilot
          </ActionButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
