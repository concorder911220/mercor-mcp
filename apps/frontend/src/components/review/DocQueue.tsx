import React from "react";
import { Box, Typography, List, ListItem, ListItemButton, Chip, TextField, Stack } from "@mui/material";
import { ReviewDoc } from "../../types/review";

interface DocQueueProps {
  docs: ReviewDoc[];
  selectedId: string;
  onSelect: (docId: string) => void;
}

const getConfidenceColor = (confidence: number) => {
  if (confidence > 0.97) return "success";
  if (confidence >= 0.90) return "warning";
  return "error";
};

const getConfidenceLabel = (confidence: number) => {
  if (confidence > 0.97) return "High";
  if (confidence >= 0.90) return "Med";
  return "Low";
};

const getStatusColor = (status: ReviewDoc["status"]) => {
  switch (status) {
    case "new": return "default";
    case "needs_review": return "warning";
    case "ready": return "success";
    case "posted": return "info";
    case "error": return "error";
    default: return "default";
  }
};

export default function DocQueue({ docs, selectedId, onSelect }: DocQueueProps) {
  const [filter, setFilter] = React.useState("");

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(filter.toLowerCase()) ||
    doc.vendorDisplay.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Document Queue ({filteredDocs.length})
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter documents..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Box>

      {/* Document List */}
      <List sx={{ flex: 1, overflow: "auto", p: 0 }}>
        {filteredDocs.map((doc) => (
          <ListItem key={doc.id} disablePadding>
            <ListItemButton
              selected={doc.id === selectedId}
              onClick={() => onSelect(doc.id)}
              sx={{
                flexDirection: "column",
                alignItems: "stretch",
                py: 2,
                px: 2,
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  "&:hover": {
                    bgcolor: "primary.light",
                  },
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {doc.title}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {doc.vendorDisplay}
                </Typography>
                <Typography variant="caption">•</Typography>
                <Typography variant="caption" color="text.secondary">
                  {doc.amountDisplay}
                </Typography>
                <Typography variant="caption">•</Typography>
                <Typography variant="caption" color="text.secondary">
                  {doc.dateDisplay}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Chip
                  label={getConfidenceLabel(doc.overallConfidence)}
                  color={getConfidenceColor(doc.overallConfidence)}
                  size="small"
                  sx={{ height: 20 }}
                />
                <Chip
                  label={doc.status.replace("_", " ")}
                  color={getStatusColor(doc.status)}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20 }}
                />
              </Stack>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}