import React from "react";
import { Box, Typography } from "@mui/material";
import { Card, CardHeader, CardBody } from "./Card";
import ActionDropdown from "./ActionDropdown";

interface StandardPanelProps {
  title: string;
  actions?: React.ReactNode;
  dropdown?: {
    label: string;
    options: { label: string; onClick: () => void }[];
  };
  children: React.ReactNode;
}

export function StandardPanel({
  title,
  actions,
  dropdown,
  children,
}: StandardPanelProps) {
  return (
    <Card>
      <CardHeader sx={{ px: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ textAlign: "left", flexGrow: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            {actions}
            {dropdown && (
              <ActionDropdown
                label={dropdown.label}
                options={dropdown.options}
              />
            )}
          </Box>
        </Box>
      </CardHeader>
      <CardBody
        sx={{
          px: 2,
          py: 2,
          height: "100%",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: 8,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (theme) => theme.palette.grey[200],
            borderRadius: 3,
          },
        }}
      >
        {children}
      </CardBody>
    </Card>
  );
}
