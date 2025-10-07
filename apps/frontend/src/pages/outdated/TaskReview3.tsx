import React, { useState, useEffect } from "react";
import { Box, Container, Button, Stack, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { mockReviewDocs } from "../mocks/reviewDocs";
import { ReviewDoc } from "../types/review";
import DocQueue from "../components/review/DocQueue";
import PdfViewer from "../components/review/PdfViewer";
import FieldPanel from "../components/review/FieldPanel";
import FooterActions from "../components/review/FooterActions";

export default function TaskReview3() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDocId, setSelectedDocId] = useState<string>(mockReviewDocs[0]?.id);
  const [docs, setDocs] = useState<ReviewDoc[]>(mockReviewDocs);
  const [mobileView, setMobileView] = useState<"queue" | "doc" | "fields">("fields");
  
  const selectedDoc = docs.find(doc => doc.id === selectedDocId);
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null);

  const handleFieldChange = (docId: string, fieldId: string, value: string | number | null) => {
    setDocs(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId 
          ? {
              ...doc,
              fields: doc.fields.map(field => 
                field.id === fieldId ? { ...field, value } : field
              )
            }
          : doc
      )
    );
  };


  const handleJumpToAnchor = (anchorId: string) => {
    setActiveAnchorId(anchorId);
    // PdfViewer will handle the actual scrolling
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'j':
          event.preventDefault();
          // Go to previous document
          const currentIndex = docs.findIndex(doc => doc.id === selectedDocId);
          if (currentIndex > 0) {
            setSelectedDocId(docs[currentIndex - 1].id);
          }
          break;
        case 'k':
          event.preventDefault();
          // Go to next document
          const nextIndex = docs.findIndex(doc => doc.id === selectedDocId);
          if (nextIndex < docs.length - 1) {
            setSelectedDocId(docs[nextIndex + 1].id);
          }
          break;
        case 'p':
          event.preventDefault();
          // Approve & next
          handleDocAction("approveNext");
          break;
        case 'g':
          event.preventDefault();
          // Go to next low confidence field
          if (selectedDoc) {
            const lowConfidenceField = selectedDoc.fields
              .sort((a, b) => a.confidence - b.confidence)
              .find(f => f.confidence < 0.92);
            if (lowConfidenceField && lowConfidenceField.anchorId) {
              handleJumpToAnchor(lowConfidenceField.anchorId);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docs, selectedDocId, selectedDoc]);

  const handleDocAction = async (action: "reject" | "hold" | "approve" | "approveNext") => {
    if (!selectedDoc) return;

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (action) {
      case "reject":
        setDocs(prevDocs =>
          prevDocs.map(doc =>
            doc.id === selectedDocId ? { ...doc, status: "error" } : doc
          )
        );
        break;
      case "hold":
        setDocs(prevDocs =>
          prevDocs.map(doc =>
            doc.id === selectedDocId ? { ...doc, status: "needs_review" } : doc
          )
        );
        break;
      case "approve":
      case "approveNext":
        setDocs(prevDocs =>
          prevDocs.map(doc =>
            doc.id === selectedDocId ? { ...doc, status: "posted" } : doc
          )
        );
        
        if (action === "approveNext") {
          const currentIndex = docs.findIndex(doc => doc.id === selectedDocId);
          const nextDoc = docs[currentIndex + 1];
          if (nextDoc) {
            setSelectedDocId(nextDoc.id);
          }
        }
        break;
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Mobile Navigation Bar */}
      {isMobile && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              variant={mobileView === "queue" ? "contained" : "outlined"}
              onClick={() => setMobileView("queue")}
              size="small"
            >
              Queue
            </Button>
            <Button
              variant={mobileView === "doc" ? "contained" : "outlined"}
              onClick={() => setMobileView("doc")}
              size="small"
            >
              Document
            </Button>
            <Button
              variant={mobileView === "fields" ? "contained" : "outlined"}
              onClick={() => setMobileView("fields")}
              size="small"
            >
              Fields
            </Button>
          </Stack>
        </Box>
      )}

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr", // Mobile: single column
            md: "320px 1fr", // Tablet: queue + rest
            lg: "320px minmax(480px, 1fr) 420px", // Desktop: 3 columns
          },
          gap: 2,
          p: 2,
          overflow: "hidden",
        }}
      >
        {/* Column 1: Document Queue */}
        <Box
          sx={{
            overflow: "hidden",
            display: { 
              xs: mobileView === "queue" ? "block" : "none", 
              md: "block" 
            },
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <DocQueue
            docs={docs}
            selectedId={selectedDocId}
            onSelect={setSelectedDocId}
          />
        </Box>

        {/* Column 2: PDF Viewer */}
        <Box
          sx={{
            overflow: "hidden",
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
            display: { 
              xs: mobileView === "doc" ? "block" : "none",
              md: mobileView === "queue" ? "none" : "block",
              lg: "block" 
            },
          }}
        >
          {selectedDoc && (
            <PdfViewer
              fileUrl={selectedDoc.fileUrl}
              anchors={selectedDoc.anchors}
              activeAnchorId={activeAnchorId}
            />
          )}
        </Box>

        {/* Column 3: Field Panel */}
        <Box
          sx={{
            overflow: "hidden",
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
            display: { 
              xs: mobileView === "fields" ? "block" : "none",
              md: mobileView === "queue" ? "none" : "block",
              lg: "block" 
            },
          }}
        >
          {selectedDoc && (
            <FieldPanel
              doc={selectedDoc}
              onChange={(fieldId, value) => handleFieldChange(selectedDoc.id, fieldId, value)}
              onJumpTo={handleJumpToAnchor}
            />
          )}
        </Box>
      </Box>

      {/* Footer Actions */}
      <FooterActions
        onReject={() => handleDocAction("reject")}
        onHold={() => handleDocAction("hold")}
        onApproveUpload={() => handleDocAction("approve")}
        onApproveNext={() => handleDocAction("approveNext")}
        canBulk={docs.filter(d => d.status === "ready").length > 1}
      />
    </Box>
  );
}