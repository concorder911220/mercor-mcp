import React from "react";
import { Box } from "@mui/material";
import { Card, CardBody } from "./common/Card";

interface ChatPanelProps {
  children: React.ReactNode;
}

export function ChatPanel({ children }: ChatPanelProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
              <Box
          sx={{
            width: "100%",
            maxWidth: 800,
          }}
        >
        <Card sx={{ border: "none", boxShadow: "none" }}>
          <CardBody
            sx={{
              p: 0,
              height: "100%",
            }}
          >
            {children}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
} 