import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography,
  Button,
  Stack,
  TextField,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  LinearProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { TaxClient, TaxDocument, DocumentStatus, ExtractedField } from "../types/tax";
import { mockClients, mockDocuments, mockExtractedData } from "../mocks/taxData";

export default function TaxDocumentReview() {
  const navigate = useNavigate();
  const { clientId, docId } = useParams<{ clientId: string; docId: string }>();
  const [client, setClient] = useState<TaxClient | null>(null);
  const [document, setDocument] = useState<TaxDocument | null>(null);
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);

  useEffect(() => {
    // Find client and documents
    const foundClient = mockClients.find(c => c.id === clientId);
    const clientDocs = mockDocuments[clientId!] || [];
    const foundDoc = clientDocs.find(d => d.id === docId);
    const docIndex = clientDocs.findIndex(d => d.id === docId);

    if (foundClient && foundDoc) {
      setClient(foundClient);
      setDocument(foundDoc);
      setDocuments(clientDocs);
      setCurrentIndex(docIndex);
      
      // Load extracted data if available
      const extractedData = (mockExtractedData as any)[docId!];
      if (extractedData) {
        const extractedFields: ExtractedField[] = Object.entries(extractedData).map(([key, data]: [string, any]) => ({
          id: key,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value: data.value,
          confidence: data.confidence,
          validated: data.confidence > 0.95,
          corrected: false,
          anchor: data.anchor
        }));
        setFields(extractedFields);
      }
    }
  }, [clientId, docId]);

  if (!client || !document) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Document not found</Typography>
      </Box>
    );
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === fieldId
          ? { ...field, value, corrected: true, validated: true }
          : field
      )
    );
  };

  const handleApprove = async () => {
    setUploading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update document status
    setDocument({ ...document, status: DocumentStatus.Approved });
    
    // Go to next document
    if (currentIndex < documents.length - 1) {
      const nextDoc = documents[currentIndex + 1];
      navigate(`/clients/${clientId}/review/${nextDoc.id}`);
    } else {
      navigate(`/clients/${clientId}/documents`);
    }
    setUploading(false);
  };

  const handleReject = async () => {
    if (rejectReason) {
      setUploading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update document status
      setDocument({ ...document, status: DocumentStatus.NeedsReupload });
      setRejectDialog(false);
      setRejectReason("");
      
      // Go back to documents page
      navigate(`/clients/${clientId}/documents`);
      setUploading(false);
    }
  };

  const navigateToDocument = (index: number) => {
    if (index >= 0 && index < documents.length) {
      const doc = documents[index];
      navigate(`/clients/${clientId}/review/${doc.id}`);
    }
  };

  const allFieldsValidated = fields.every(field => field.validated);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/clients")}
            underline="hover"
            color="inherit"
          >
            Clients
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate(`/clients/${clientId}/documents`)}
            underline="hover"
            color="inherit"
          >
            {client.name}
          </Link>
          <Typography color="text.primary" variant="body2">
            {document.docType}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate(`/clients/${clientId}/documents`)}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {document.docType} - {client.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Document {currentIndex + 1} of {documents.length}
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<PrevIcon />}
              onClick={() => navigateToDocument(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              size="small"
              endIcon={<NextIcon />}
              onClick={() => navigateToDocument(currentIndex + 1)}
              disabled={currentIndex === documents.length - 1}
            >
              Next
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Document Viewer */}
        <Box sx={{ width: "50%", p: 2, overflow: "auto" }}>
          <Paper sx={{ height: "100%", bgcolor: "grey.100", p: 2, position: "relative" }}>
            {document.filePath ? (
              <Box sx={{ position: "relative", height: "100%" }}>
                <iframe
                  src={document.filePath}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  title="Document Preview"
                />
                {/* PDF Overlay for highlighting */}
                {fields.map((field) => {
                  if (!field.anchor || hoveredFieldId !== field.id) return null;
                  
                  const { rect } = field.anchor;
                  return (
                    <Box
                      key={field.id}
                      sx={{
                        position: "absolute",
                        left: `${rect.x * 100}%`,
                        top: `${rect.y * 100}%`,
                        width: `${rect.w * 100}%`,
                        height: `${rect.h * 100}%`,
                        backgroundColor: "rgba(33, 150, 243, 0.2)",
                        border: "2px solid #1976d2",
                        borderRadius: "4px",
                        pointerEvents: "none",
                        zIndex: 10,
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%": { opacity: 0.2 },
                          "50%": { opacity: 0.4 },
                          "100%": { opacity: 0.2 }
                        }
                      }}
                    />
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ 
                height: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <Typography color="text.secondary">
                  No document uploaded
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Right: Extracted Fields */}
        <Box sx={{ width: "50%", p: 2, overflow: "auto", borderLeft: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Extracted Fields
          </Typography>

          {fields.length === 0 ? (
            <Alert severity="info">
              No fields extracted from this document yet.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {fields.map((field) => (
                <Box
                  key={field.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: field.confidence < 0.92 ? "warning.main" : "divider",
                    borderRadius: 1,
                    bgcolor: field.confidence < 0.92 ? "warning.light" : "background.paper",
                    cursor: field.anchor ? "pointer" : "default",
                  }}
                  onMouseEnter={() => {
                    if (field.anchor) {
                      setHoveredFieldId(field.id);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredFieldId(null);
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {field.label}
                    </Typography>
                    <Chip
                      label={`${(field.confidence * 100).toFixed(0)}%`}
                      size="small"
                      color={field.confidence > 0.95 ? "success" : field.confidence > 0.90 ? "warning" : "error"}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={field.value || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottom: field.corrected ? "2px solid" : "1px solid",
                        borderColor: field.corrected ? "primary.main" : "divider",
                      },
                    }}
                  />
                  {field.corrected && (
                    <Typography variant="caption" color="primary.main" sx={{ mt: 0.5 }}>
                      Value corrected
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}

          {/* Validation Status */}
          {fields.length > 0 && (
            <Alert 
              severity={allFieldsValidated ? "success" : "warning"} 
              sx={{ mt: 3 }}
            >
              {allFieldsValidated
                ? "All fields validated - ready to approve"
                : "Some fields need validation"
              }
            </Alert>
          )}
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        {uploading && <LinearProgress sx={{ mb: 2 }} />}
        
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => setRejectDialog(true)}
            disabled={uploading}
          >
            Reject (Request Re-upload)
          </Button>
          
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            endIcon={currentIndex < documents.length - 1 ? <NextIcon /> : null}
            onClick={handleApprove}
            disabled={uploading || !allFieldsValidated}
          >
            {currentIndex < documents.length - 1 ? "Approve & Next" : "Approve"}
          </Button>
        </Stack>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)}>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this document. The client will be notified to re-upload.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g., Document is illegible, wrong tax year, missing pages..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={!rejectReason}
          >
            Reject Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}