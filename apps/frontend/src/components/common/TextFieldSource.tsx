import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  TextField as MuiTextField,
  Tooltip,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";

const StyledTooltip = styled(
  ({
    className,
    ...props
  }: React.ComponentProps<typeof Tooltip> & { className?: string }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  )
)`
  & .MuiTooltip-tooltip {
    background-color: white;
    color: rgba(0, 0, 0, 0.87);
    padding: 16px;
    max-width: 300px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
  }
`;

const StyledChip = styled(Chip)`
  background-color: #f3f4f6;
  border: none;
  font-size: 12px;
  height: 24px;
`;

interface TextFieldSourceProps {
  value: string;
  source: string;
  link?: string;
  certainty?: number;
  onChange?: (value: string) => void;
}

export function TextFieldSource({
  value,
  source,
  link,
  certainty = 1,
  onChange,
}: TextFieldSourceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const lowCertainty = certainty < 0.9;

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "32px",
          border: `1px solid ${
            isEditing ? "#666666" : lowCertainty ? "#ef5350" : "#e0e0e0"
          }`,
          borderWidth: lowCertainty ? "2px" : "1px",
          borderRadius: 1,
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          backgroundColor: "background.paper",
          cursor: "text",
        }}
        onClick={handleClick}
      >
        {isEditing ? (
          <MuiTextField
            fullWidth
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            sx={{
              "& .MuiInputBase-root": {
                height: "auto",
                fontSize: "0.875rem",
                padding: 0,
              },
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
                color: "text.primary",
                padding: "0 !important",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { border: "none" },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "none" },
              },
            }}
          />
        ) : (
          <Typography
            sx={{
              mr: 10,
              fontSize: "0.875rem",
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            {value}
          </Typography>
        )}
        {link ? (
          <Link to={link} style={{ textDecoration: "none" }}>
            <StyledTooltip
              title={
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Source preview from <b>{source}</b>
                  </Typography>
                  <Paper sx={{ p: 1, mb: 1, bgcolor: "#f5f5f5" }}>
                    <Typography variant="body2" component="div">
                      ...and Linda mentioned that she is thinking about{" "}
                      <mark
                        style={{ backgroundColor: "#fff3cd", padding: "0 4px" }}
                      >
                        retiring around 65
                      </mark>
                      , but she isn't sure and has to think about it...
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ cursor: "pointer" }}
                  >
                    View full source →
                  </Typography>
                </Box>
              }
            >
              <StyledChip
                label={source}
                variant="outlined"
                size="small"
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </StyledTooltip>
          </Link>
        ) : (
          <StyledChip
            label={source}
            variant="outlined"
            size="small"
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
