import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Anchor } from "../../types/review";

interface PdfViewerProps {
  fileUrl: string;
  anchors: Anchor[];
  activeAnchorId: string | null;
}

export default function PdfViewer({ fileUrl, anchors, activeAnchorId }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeAnchorId && containerRef.current) {
      const anchorElement = containerRef.current.querySelector(`[data-anchor-id="${activeAnchorId}"]`);
      if (anchorElement) {
        anchorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Add highlight animation
        anchorElement.classList.add("anchor-highlight");
        setTimeout(() => {
          anchorElement.classList.remove("anchor-highlight");
        }, 1200);
      }
    }
  }, [activeAnchorId]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6">Document Preview</Typography>
      </Box>

      {/* PDF Viewer Area */}
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1, 
          overflow: "auto",
          bgcolor: "grey.100",
          position: "relative",
        }}
      >
        {/* Actual PDF Viewer using iframe */}
        <Box sx={{ position: "relative", height: "100%" }}>
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="PDF Preview"
          />
          
          {/* Render anchor overlays - positioned absolutely over PDF */}
          {anchors.map((anchor) => (
            <Box
              key={anchor.id}
              data-anchor-id={anchor.id}
              sx={{
                position: "absolute",
                left: `${anchor.rect.x * 100}%`,
                top: `${anchor.rect.y * 100 + 10}%`, // Offset for PDF viewer toolbar
                width: `${anchor.rect.w * 100}%`,
                height: `${anchor.rect.h * 100}%`,
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: 1,
                backgroundColor: "primary.light",
                opacity: 0,
                transition: "all 0.3s ease",
                cursor: "pointer",
                pointerEvents: "none",
                "&:hover": {
                  opacity: 0.3,
                },
                "&.anchor-highlight": {
                  opacity: 0.6,
                  animation: "pulse 1.2s ease-out",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 0.8; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </Box>
  );
}