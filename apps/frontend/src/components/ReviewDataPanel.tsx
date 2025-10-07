import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { TextFieldSource } from "./common/TextFieldSource";
import ActionDropdown from "./common/ActionDropdown";

interface ReviewDataPanelProps {
  content: Record<string, any>;
}

export function ReviewDataPanel({ content }: ReviewDataPanelProps) {
  const [filterType, setFilterType] = useState("All Fields");

  const getFieldsNeedingReview = (content: Record<string, any>) => {
    let count = 0;
    Object.values(content).forEach((section: any) => {
      Object.values(section).forEach((field: any) => {
        if (field.Certainty < 0.9) count++;
      });
    });
    return count;
  };

  const filterContent = (content: Record<string, any>) => {
    if (filterType === "All Fields") return content;

    const filteredContent: Record<string, any> = {};
    Object.entries(content).forEach(([section, fields]) => {
      const filteredFields = Object.entries(
        fields as Record<string, any>
      ).reduce((acc, [fieldName, fieldData]) => {
        if ((fieldData as any).Certainty < 0.9) {
          acc[fieldName] = fieldData;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(filteredFields).length > 0) {
        filteredContent[section] = filteredFields;
      }
    });
    return filteredContent;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
          py: 0.25,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ActionDropdown
          label={filterType}
          options={[
            { label: "All Fields", onClick: () => setFilterType("All Fields") },
            {
              label: "Uncertain Fields",
              onClick: () => setFilterType("Uncertain Fields"),
            },
          ]}
        />
        <Typography
          sx={{ color: "#ef5350", fontSize: "14px", fontWeight: "bold" }}
        >
          {getFieldsNeedingReview(content)} fields need review
        </Typography>
      </Box>
      <Box sx={{ maxHeight: "calc(70vh - 48px)", overflowY: "auto" }}>
        {Object.entries(filterContent(content)).map(
          ([sectionTitle, fields]) => (
            <Box key={sectionTitle} sx={{ mt: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "text.primary",
                  fontSize: "16px",
                  fontWeight: 500,
                  mb: 2,
                }}
              >
                {sectionTitle}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {Object.entries(fields).map(
                  ([fieldName, fieldData]: [string, any]) => (
                    <Box
                      key={fieldName}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          minWidth: "140px",
                          color: "text.primary",
                          fontSize: "14px",
                        }}
                      >
                        <span
                          style={{
                            color:
                              fieldData.Certainty < 0.9 ? "#ef5350" : "inherit",
                            fontWeight:
                              fieldData.Certainty < 0.9 ? "bold" : "inherit",
                          }}
                        >
                          {fieldName}
                        </span>
                      </Typography>
                      <Box
                        sx={{
                          width: "60%",
                          display: "flex",
                          justifyContent: "flex-start",
                        }}
                      >
                        <TextFieldSource
                          value={fieldData.Value}
                          source={fieldData.Source}
                          link={fieldData.Link}
                          certainty={fieldData.Certainty}
                        />
                      </Box>
                    </Box>
                  )
                )}
              </Box>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}

export default ReviewDataPanel;
