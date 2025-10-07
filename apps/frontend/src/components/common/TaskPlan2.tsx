import React, { useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { StandardPanel } from "./StandardPanel";
import ActionButton from "./ActionButton";
import { TextFieldLarge } from "./TextFieldLarge";

interface TaskPlan2Item {
  task: string;
  tag: string;
  isAutomated: boolean;
  details: string;
  showInput?: boolean;
  documents?: string[];
}

interface TaskPlan2Props {
  title?: string;
  description?: string;
  tasks: TaskPlan2Item[];
  actionButtonText?: string;
  onActionClick?: () => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export function TaskPlan2({
  title = "Planning",
  description = "Rialto will assign and execute the following tasks:",
  tasks,
  actionButtonText = "Schedule tasks",
  onActionClick,
  inputValue,
  onInputChange,
}: TaskPlan2Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <StandardPanel
      title={title}
      actions={
        actionButtonText && onActionClick ? (
          <ActionButton onClick={onActionClick}>
            {actionButtonText}
          </ActionButton>
        ) : undefined
      }
    >
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        {description}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {tasks.map((item, index) => {
          const expanded = index === expandedIndex;
          return (
            <Box key={index}>
              <Box
                onClick={() => setExpandedIndex(expanded ? null : index)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "grey.50",
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "text.primary" }}
                  >
                    {item.task}
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
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      transition: "transform 0.2s",
                      transform: expanded ? "rotate(180deg)" : "none",
                    }}
                  >
                    ▼
                  </Box>
                </Box>
              </Box>
              {expanded && (
                <Box
                  sx={{
                    p: 2,
                    pr: 3,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    mt: 0.5,
                    typography: "body2",
                    color: "text.secondary",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ mb: item.documents ? 2 : 0 }}
                  >
                    {item.details}
                  </Typography>
                  {item.documents && (
                    <Box sx={{ mt: 2 }}>
                      {item.documents.map((doc, docIndex) => (
                        <Box
                          key={docIndex}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1,
                            "&:hover": {
                              bgcolor: "rgba(0, 0, 0, 0.02)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <ListAltIcon
                              sx={{
                                fontSize: 20,
                                color: "text.secondary",
                              }}
                            />
                            <Typography variant="body2">{doc}</Typography>
                          </Box>
                          <IconButton
                            size="small"
                            sx={{ color: "text.secondary" }}
                          >
                            ✕
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        sx={{
                          mt: 2,
                          color: "text.secondary",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.02)",
                          },
                        }}
                        startIcon={<span>+</span>}
                      >
                        Add additional documents
                      </Button>
                    </Box>
                  )}
                  {item.showInput && (
                    <Box>
                      <TextFieldLarge
                        value={inputValue || ""}
                        onChange={onInputChange || (() => {})}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </StandardPanel>
  );
} 