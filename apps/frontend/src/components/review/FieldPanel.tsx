import React, { useState } from "react";
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography,
  TextField,
  Tooltip,
  Stack,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import {
  AutoFixHigh as AutoFixIcon,
} from "@mui/icons-material";
import { ReviewDoc, Field } from "../../types/review";

interface FieldPanelProps {
  doc: ReviewDoc;
  onChange: (fieldId: string, value: string | number | null) => void;
  onJumpTo: (anchorId: string) => void;
}

export default function FieldPanel({ doc, onChange, onJumpTo }: FieldPanelProps) {
  const [tabValue, setTabValue] = useState(0);

  // Sort fields by confidence (ascending) and materiality (descending) for priority
  const sortedFields = [...doc.fields].sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return a.confidence - b.confidence; // Low confidence first (needs review)
    }
    return (b.materiality || 0) - (a.materiality || 0); // High materiality first
  });

  const handleFieldChange = (field: Field, value: string) => {
    const parsedValue = field.label.includes("amount") || field.label.includes("Subtotal") 
      ? parseFloat(value) || 0 
      : value;
    onChange(field.id, parsedValue);
  };

  const needsReview = (field: Field) => field.confidence < 0.92;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Fields" />
          <Tab label="Rules" />
          <Tab label="Duplicates" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {/* Fields Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              {sortedFields.map((field) => (
                <Tooltip
                  key={field.id}
                  title={
                    field.anchorId 
                      ? `Source: Page ${doc.anchors.find(a => a.id === field.anchorId)?.page || 1} • Confidence: ${(field.confidence * 100).toFixed(0)}%`
                      : `Confidence: ${(field.confidence * 100).toFixed(0)}%`
                  }
                  placement="left"
                  arrow
                >
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: needsReview(field) ? "warning.main" : "divider",
                      borderRadius: 1,
                      bgcolor: needsReview(field) ? "warning.light" : "background.paper",
                      cursor: field.anchorId ? "pointer" : "default",
                      "&:hover": {
                        borderColor: needsReview(field) ? "warning.dark" : "primary.main",
                        bgcolor: needsReview(field) ? "warning.light" : "action.hover",
                      },
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => field.anchorId && onJumpTo(field.anchorId)}
                  >
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {field.label}
                    </Typography>
                    <TextField
                      fullWidth
                      variant="standard"
                      value={field.value || ""}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
                      sx={{
                        "& .MuiInput-underline:before": {
                          borderBottom: "none",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        },
                        "& .MuiInput-underline:after": {
                          borderColor: "primary.main",
                        },
                      }}
                    />
                    {field.messages && field.messages.length > 0 && (
                      <Typography 
                        variant="caption" 
                        color="warning.main"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {field.messages[0]}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          </Box>
        )}

        {/* Rules Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              {doc.rules.map((rule) => (
                <Alert 
                  key={rule.id} 
                  severity={rule.severity}
                  action={
                    rule.canAutofix && (
                      <Button 
                        size="small" 
                        startIcon={<AutoFixIcon />}
                        onClick={() => rule.apply?.()}
                      >
                        Autofix
                      </Button>
                    )
                  }
                >
                  <Typography variant="subtitle2">{rule.title}</Typography>
                  {rule.detail && (
                    <Typography variant="caption">{rule.detail}</Typography>
                  )}
                </Alert>
              ))}
            </Stack>
          </Box>
        )}

        {/* Duplicates Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 2 }}>
            {doc.duplicates.length === 0 ? (
              <Alert severity="info">No duplicate suspects found</Alert>
            ) : (
              <Stack spacing={2}>
                {doc.duplicates.map((dup) => (
                  <Paper key={dup.id} sx={{ p: 2 }}>
                    <Typography variant="subtitle2">
                      {dup.vendor} - {dup.invoiceNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dup.date} • ${dup.amount} • Match: {(dup.matchScore * 100).toFixed(0)}%
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}