import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Table,
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Alert,
  Stack,
  Breadcrumbs,
  Link,
  Badge,
  TextField,
  InputAdornment,
  Chip as MuiChip,
} from "@mui/material";
import { 
  Button, 
  Chip, 
  Select,
  IconButton,
  Tabs
} from "@rialto/ui";
import { useTheme } from '@mui/material/styles';
import {
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  FolderOpen as OrganizerIcon,
  Description as DocumentsIcon,
  RateReview as ReviewIcon,
  GetApp as DeliverablesIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  CheckCircle as ApproveIcon,
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  CloudUpload as ExportIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { TaxClient, TaxDocument, DocumentStatus, DocumentFlag, ExtractedField, statusColors, nextActions } from "../types/tax";
import type { TabItem } from "@rialto/ui";
import { mockClients, mockDocuments, mockExtractedData } from "../mocks/taxData";
import ReviewDrawer from '../components/ReviewDrawer';
import { reminderEmailTemplate } from '../mocks/welcome_email';

const documentStatusColors: Record<DocumentStatus, any> = {
  [DocumentStatus.NotReceived]: "default",
  [DocumentStatus.Received]: "success",
  [DocumentStatus.Validated]: "success",
  [DocumentStatus.NeedsReupload]: "error",
  [DocumentStatus.Approved]: "success",
  [DocumentStatus.Exported]: "success"
};


export default function TaxDocuments() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { filingId } = useParams<{ filingId: string }>();
  const [client, setClient] = useState<TaxClient | null>(null);
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedTab, setSelectedTab] = useState('documents'); // Start with "Documents" tab selected
  
  // Review tab state
  const [selectedDocument, setSelectedDocument] = useState<TaxDocument | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [showApprovalSuccess, setShowApprovalSuccess] = useState(false);
  const [isReminderDrawerOpen, setIsReminderDrawerOpen] = useState(false);

  useEffect(() => {
    // Find client by filing ID
    const foundClient = mockClients.find(c => c.id === filingId);
    if (foundClient) {
      setClient(foundClient);
      setDocuments(mockDocuments[filingId!] || []);
    }
  }, [filingId]);

  // Auto-load first document when switching to Review tab
  useEffect(() => {
    if (selectedTab === 'review' && documents.length > 0 && !selectedDocument) {
      const firstDocWithContent = documents.find(doc => doc.status !== DocumentStatus.NotReceived);
      if (firstDocWithContent) {
        loadDocumentForReview(firstDocWithContent);
      } else if (documents.length > 0) {
        loadDocumentForReview(documents[0]);
      }
    }
  }, [selectedTab, documents, selectedDocument]);

  if (!client) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Client not found</Typography>
      </Box>
    );
  }

  // Check if first pass is complete
  const requiredDocs = documents.filter(doc => doc.required);
  const firstPassComplete = requiredDocs.every(
    doc => doc.status === DocumentStatus.Validated || doc.status === DocumentStatus.Approved
  ) && requiredDocs.some(doc => doc.status !== DocumentStatus.NotReceived);
  
  // Check if there are missing required documents
  const hasMissingRequiredDocs = requiredDocs.some(doc => doc.status === DocumentStatus.NotReceived);

  // Calculate stats for conditional highlighting
  const missingCount = documents.filter(d => d.required && d.status === DocumentStatus.NotReceived).length;
  const withIssuesCount = documents.filter(d => d.status === DocumentStatus.NeedsReupload).length;
  const hasProblems = missingCount > 0 || withIssuesCount > 0;
  const validatedColor = hasProblems ? "error" : (firstPassComplete ? "success" : "default");

  const getStatusChip = (status: DocumentStatus) => {
    return (
      <Chip
        label={status}
        color={documentStatusColors[status] === 'default' ? undefined : documentStatusColors[status]}
        variant={documentStatusColors[status] === 'default' ? 'outlined' : 'filled'}
        size="sm"
      />
    );
  };

  const getFlagChips = (flags?: DocumentFlag[]) => {
    if (!flags || flags.length === 0) return null;
    
    return (
      <Stack direction="row" spacing={0.5}>
        {flags.map((flag, index) => (
          <Chip
            key={index}
            label={flag}
            size="sm"
            color="error"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        ))}
      </Stack>
    );
  };

  // Review functionality
  const loadDocumentForReview = (document: TaxDocument) => {
    setSelectedDocument(document);
    const docIndex = documents.findIndex(d => d.id === document.id);
    setCurrentIndex(docIndex);
    
    // Load extracted data if available
    const extractedData = (mockExtractedData as any)[document.id];
    if (extractedData) {
      // Handle new Reducto AI format with citations
      if (extractedData.result && extractedData.citations) {
        const result = extractedData.result[0]; // Get first result
        const citations = extractedData.citations;
        
        const extractedFields: ExtractedField[] = [];
        
        // Helper function to create a field
        const createField = (id: string, label: string, value: any, citation: any, level: number = 0) => ({
          id,
          label,
          value,
          confidence: citation?.granular_confidence?.extract_confidence || 0.9,
          validated: (citation?.granular_confidence?.extract_confidence || 0.9) > 0.95,
          corrected: false,
          level, // Add level for indentation
          anchor: citation?.bbox ? {
            id,
            page: citation.bbox.page || 1,
            rect: {
              x: citation.bbox.left,
              y: citation.bbox.top,
              w: citation.bbox.width,
              h: citation.bbox.height
            }
          } : undefined
        });
        
        // Helper function to create a section title
        const createSectionTitle = (id: string, title: string, level: number = 0) => ({
          id,
          label: title,
          value: null,
          confidence: 1,
          validated: true,
          corrected: false,
          level,
          isSection: true, // Mark as section title
          anchor: undefined
        });
        
        // Helper function to process nested sections
        const processSection = (sectionKey: string, sectionData: any, sectionCitations: any, sectionTitle: string, level: number = 0) => {
          if (sectionData && sectionCitations) {
            extractedFields.push(createSectionTitle(`${sectionKey}_section`, sectionTitle, level));
            Object.keys(sectionData).forEach(fieldKey => {
              const fieldValue = sectionData[fieldKey];
              
              // Handle nested objects (like stateTaxWithheld)
              if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
                if (sectionCitations[fieldKey]) {
                  extractedFields.push(createSectionTitle(`${sectionKey}_${fieldKey}_section`, 
                    fieldKey.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), 
                    level + 1));
                  
                  Object.keys(fieldValue).forEach(nestedKey => {
                    if (sectionCitations[fieldKey] && sectionCitations[fieldKey][nestedKey] && sectionCitations[fieldKey][nestedKey][0]) {
                      const citation = sectionCitations[fieldKey][nestedKey][0];
                      extractedFields.push(createField(
                        `${sectionKey}_${fieldKey}_${nestedKey}`,
                        nestedKey.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                        fieldValue[nestedKey],
                        citation,
                        level + 2
                      ));
                    }
                  });
                }
              } else {
                // Handle regular fields
                if (sectionCitations[fieldKey] && sectionCitations[fieldKey][0]) {
                  const citation = sectionCitations[fieldKey][0];
                  const displayValue = typeof fieldValue === 'boolean' ? (fieldValue ? 'Yes' : 'No') : fieldValue;
                  extractedFields.push(createField(
                    `${sectionKey}_${fieldKey}`,
                    fieldKey.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    displayValue,
                    citation,
                    level + 1
                  ));
                }
              }
            });
          }
        };

        // Process flat fields (employee_ssn, omb_number, control_number for W-2)
        ['employee_ssn', 'omb_number', 'control_number'].forEach(fieldKey => {
          if (result[fieldKey] && citations[fieldKey] && citations[fieldKey][0]) {
            const citation = citations[fieldKey][0];
            extractedFields.push(createField(
              fieldKey,
              fieldKey.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              result[fieldKey],
              citation,
              0
            ));
          }
        });
        
        // Process W-2 sections
        processSection('employer', result.employer, citations.employer, 'Employer', 0);
        processSection('employee', result.employee, citations.employee, 'Employee', 0);
        processSection('wages_and_taxes', result.wages_and_taxes, citations.wages_and_taxes, 'Wages and Taxes', 0);
        processSection('box_12', result.box_12, citations.box_12, 'Box 12', 0);
        processSection('checkboxes', result.checkboxes, citations.checkboxes, 'Checkboxes', 0);
        
        // Process 1099-DIV sections
        processSection('generalHeaderInformation', result.generalHeaderInformation, citations.generalHeaderInformation, 'General Information', 0);
        processSection('form1099DIV', result.form1099DIV, citations.form1099DIV, 'Form 1099-DIV', 0);
        processSection('form1099INT', result.form1099INT, citations.form1099INT, 'Form 1099-INT', 0);
        processSection('form1099B', result.form1099B, citations.form1099B, 'Form 1099-B', 0);
        processSection('form1099OID', result.form1099OID, citations.form1099OID, 'Form 1099-OID', 0);
        processSection('form1099MISC_NEC', result.form1099MISC_NEC, citations.form1099MISC_NEC, 'Form 1099-MISC/NEC', 0);
        processSection('supplementalInformation', result.supplementalInformation, citations.supplementalInformation, 'Supplemental Information', 0);
        
        setFields(extractedFields);
      } else {
        // Handle old format (fallback)
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
    } else {
      setFields([]);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === fieldId
          ? { ...field, value, corrected: true, validated: true }
          : field
      )
    );
  };

  const handleApproveAndNext = async () => {
    if (!allFieldsValidated || isApproving) return;

    setIsApproving(true);
    
    try {
      // Simulate API call to save document approval
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success state briefly
      setShowApprovalSuccess(true);
      
      // Wait a moment to show success
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Advance to next document
      const nextIndex = currentIndex + 1;
      if (nextIndex < documents.length) {
        navigateToDocument(nextIndex);
      } else {
        // If no more documents, show completion message
        alert('All documents have been reviewed and approved!');
      }
      
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Error saving document approval. Please try again.');
    } finally {
      setIsApproving(false);
      setShowApprovalSuccess(false);
    }
  };

  const navigateToDocument = (index: number) => {
    if (index >= 0 && index < documents.length) {
      const doc = documents[index];
      loadDocumentForReview(doc);
    }
  };

  const allFieldsValidated = fields.filter(field => !field.isSection).every(field => field.validated);

  // Define tabs
  const tabItems: TabItem[] = [
    {
      id: 'organizer',
      label: 'Organizer',
      icon: <OrganizerIcon />,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <DocumentsIcon />,
    },
    {
      id: 'review',
      label: 'Review',
      icon: <ReviewIcon />,
    },
    {
      id: 'deliverables',
      label: 'Deliverables',
      icon: <DeliverablesIcon />,
    },
  ];

  return (
    <Box sx={{ p: theme.spacing(3) }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: theme.spacing(2) }}>
        <Link
          component="button"
          onClick={() => navigate("/tax")}
          underline="hover"
          color="text.secondary"
          sx={{ 
            fontSize: theme.typography.body2.fontSize, 
            lineHeight: theme.typography.body2.lineHeight, 
            fontWeight: theme.typography.fontWeightMedium,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Tax Filing
        </Link>
        <Typography 
          color="text.secondary"
          sx={{ 
            fontSize: theme.typography.body2.fontSize, 
            lineHeight: theme.typography.body2.lineHeight, 
            fontWeight: theme.typography.fontWeightMedium,
            fontFamily: theme.typography.fontFamily
          }}
        >
          {client.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: theme.spacing(5) }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: theme.spacing(4) }}>
          <Typography 
            variant="h4"
            sx={{ 
              fontSize: theme.typography.h4.fontSize, 
              lineHeight: theme.typography.h4.lineHeight, 
              fontWeight: theme.typography.fontWeightBold,
              fontFamily: theme.typography.fontFamily,
              whiteSpace: 'nowrap'
            }}
          >
            Form 1040 - Individual
          </Typography>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value as string)}
            options={[
              { value: '2024', label: '2024' }
            ]}
            sx={{ 
              minWidth: theme.spacing(20), 
              width: theme.spacing(20)
            }}
            size="sm"
            fullWidth={false}
            disabled
          />
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: theme.spacing(2) }}>
          <Typography 
            sx={{ 
              fontSize: theme.typography.body1.fontSize, 
              lineHeight: theme.typography.body1.lineHeight, 
              fontWeight: theme.typography.fontWeightMedium,
              fontFamily: theme.typography.fontFamily,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Status:
          </Typography>
        <Chip
          label={client.status}
          size="md"
          variant="filled"
          color="primary"
          title={nextActions[client.status]}
        />
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        tabs={tabItems}
        value={selectedTab}
        onChange={(tabId) => setSelectedTab(tabId)}
        size="md"
        showContent={false}
        divider={false}
        sx={{ mb: theme.spacing(3) }}
      />

      {/* Tab Content */}
      {selectedTab === 'documents' && (
        <Box sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.spacing(2),
          borderBottom: 'none',
          boxShadow: theme.shadows[2],
          p: theme.spacing(4),
          backgroundColor: 'transparent',
          minHeight: 'calc(100vh - 270px)',
          paddingBottom: '100vh'
        }}>

          {/* Search, Stats, and Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <TextField
              placeholder="Search documents..."
              size="small"
              variant="outlined"
              sx={{ 
                width: theme.spacing(50)
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: theme.spacing(10) }}>
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography 
                    sx={{ 
                      fontSize: theme.typography.body2.fontSize, 
                      lineHeight: theme.typography.body2.lineHeight, 
                      fontWeight: theme.typography.fontWeightRegular,
                      fontFamily: theme.typography.fontFamily 
                    }}
                  >
                    Required:
                  </Typography>
                  <Chip
                    label={documents.filter(d => d.required).length}
                    size="sm"
                    variant="filled"
                    sx={{ backgroundColor: theme.palette.grey[200], color: theme.palette.grey[700] }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography 
                    sx={{ 
                      fontSize: theme.typography.body2.fontSize, 
                      lineHeight: theme.typography.body2.lineHeight, 
                      fontWeight: theme.typography.fontWeightRegular,
                      fontFamily: theme.typography.fontFamily 
                    }}
                  >
                    Validated:
                  </Typography>
                  <Chip
                    label={documents.filter(d => d.status === DocumentStatus.Validated || d.status === DocumentStatus.Approved).length}
                    size="sm"
                    variant="filled"
                    sx={{ backgroundColor: theme.palette.grey[200], color: theme.palette.grey[700] }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography 
                    sx={{ 
                      fontSize: theme.typography.body2.fontSize, 
                      lineHeight: theme.typography.body2.lineHeight, 
                      fontWeight: theme.typography.fontWeightRegular,
                      fontFamily: theme.typography.fontFamily 
                    }}
                  >
                    Missing:
                  </Typography>
                  <Chip
                    label={missingCount}
                    size="sm"
                    variant="filled"
                    sx={{ backgroundColor: theme.palette.grey[200], color: theme.palette.grey[700] }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography 
                    sx={{ 
                      fontSize: theme.typography.body2.fontSize, 
                      lineHeight: theme.typography.body2.lineHeight, 
                      fontWeight: theme.typography.fontWeightRegular,
                      fontFamily: theme.typography.fontFamily 
                    }}
                  >
                    With issues:
                  </Typography>
                  <Chip
                    label={withIssuesCount}
                    size="sm"
                    variant="filled"
                    sx={{ backgroundColor: theme.palette.grey[200], color: theme.palette.grey[700] }}
                  />
                </Box>
              </Stack>
              <Button
                variant="primary"
                size="sm"
                startIcon={<UploadIcon />}
                onClick={() => {/* Handle upload */}}
              >
                Upload Document
              </Button>
            </Box>
          </Box>

          {/* First Pass Complete Banner */}
          {firstPassComplete && (
            <Alert 
              severity="success" 
              icon={<CheckIcon fontSize="small" />}
              sx={{ 
                mb: 3,
                textAlign: 'center',
                padding: theme.spacing(0.5, 2)
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: theme.typography.body2.fontSize, 
                  lineHeight: theme.typography.body2.lineHeight, 
                  fontWeight: theme.typography.fontWeightRegular,
                  fontFamily: theme.typography.fontFamily 
                }}
              >
                First Pass Complete - All required documents have been validated and are ready for CPA review.
              </Typography>
            </Alert>
          )}

          {/* Incomplete Documents Banner */}
          {hasMissingRequiredDocs && !firstPassComplete && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                padding: theme.spacing(0.5, 2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  sx={{ 
                    fontSize: theme.typography.body2.fontSize, 
                    lineHeight: theme.typography.body2.lineHeight, 
                    fontWeight: theme.typography.fontWeightRegular,
                    fontFamily: theme.typography.fontFamily 
                  }}
                >
                  Incomplete - missing required documents.{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setIsReminderDrawerOpen(true)}
                    sx={{
                      color: 'inherit',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      fontFamily: 'inherit'
                    }}
                  >
                    Send an email reminder
                  </Link>
                </Typography>
                <IconButton
                  size="sm"
                  onClick={() => setIsReminderDrawerOpen(true)}
                >
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Box>
            </Alert>
          )}

          {/* Documents Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: theme.typography.body1.fontSize, lineHeight: theme.typography.body1.lineHeight, fontWeight: theme.typography.fontWeightBold, width: '30%' }}>Document Type</TableCell>
                  <TableCell sx={{ fontSize: theme.typography.body1.fontSize, lineHeight: theme.typography.body1.lineHeight, fontWeight: theme.typography.fontWeightBold, width: '15%' }}>Status</TableCell>
                  <TableCell sx={{ fontSize: theme.typography.body1.fontSize, lineHeight: theme.typography.body1.lineHeight, fontWeight: theme.typography.fontWeightBold, width: '15%' }}>Uploaded Date</TableCell>
                  <TableCell sx={{ fontSize: theme.typography.body1.fontSize, lineHeight: theme.typography.body1.lineHeight, fontWeight: theme.typography.fontWeightBold, width: '15%' }}>Flags</TableCell>
                  <TableCell sx={{ fontSize: theme.typography.body1.fontSize, lineHeight: theme.typography.body1.lineHeight, fontWeight: theme.typography.fontWeightBold, width: '10%' }}>Required</TableCell>
                  <TableCell align="right" sx={{ fontSize: theme.typography.body1.fontSize, lineHeight: theme.typography.body1.lineHeight, fontWeight: theme.typography.fontWeightBold, width: '15%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    sx={{ 
                      "&:hover": { bgcolor: "action.hover" },
                      opacity: doc.status === DocumentStatus.NotReceived ? 0.6 : 1
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography 
                          sx={{ 
                            fontSize: theme.typography.body1.fontSize, 
                            lineHeight: theme.typography.body1.lineHeight, 
                            fontWeight: theme.typography.fontWeightBold 
                          }}
                        >
                          {doc.docType}
                        </Typography>
                        {doc.fileName && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography 
                              color="text.secondary"
                              sx={{ 
                                fontSize: theme.typography.body2.fontSize, 
                                lineHeight: theme.typography.body2.lineHeight, 
                                fontWeight: theme.typography.fontWeightRegular 
                              }}
                            >
                              {doc.fileName}
                            </Typography>
                            {doc.dropboxUrl && (
                              <Chip
                                label="Dropbox"
                                size="sm"
                                sx={{ 
                                  backgroundColor: theme.palette.grey[100],
                                  color: theme.palette.grey[600],
                                  cursor: "pointer",
                                  height: theme.spacing(2.5),
                                  fontSize: theme.typography.caption.fontSize,
                                  "&:hover": {
                                    backgroundColor: theme.palette.grey[200]
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(doc.dropboxUrl, "_blank");
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(doc.status)}</TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          fontSize: theme.typography.body1.fontSize, 
                          lineHeight: theme.typography.body1.lineHeight, 
                          fontWeight: theme.typography.fontWeightRegular 
                        }}
                      >
                        {doc.uploadedDate || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getFlagChips(doc.flags)}
                    </TableCell>
                    <TableCell>
                      {doc.required ? (
                        <Chip label="Required" size="sm" variant="outlined" />
                      ) : (
                        <Chip label="Optional" size="sm" variant="outlined" color="default" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {doc.status !== DocumentStatus.NotReceived && (
                        <Button
                          size="sm"
                          variant="ghost"
                          startIcon={<ViewIcon fontSize="small" />}
                          onClick={() => navigate('/task/e785bd65-ce62-49e7-a772-ed1112c3bd29')}
                          sx={{ fontSize: theme.typography.body2.fontSize, padding: theme.spacing(0.5, 1) }}
                        >
                          Agent log
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Other Tab Content Placeholders */}
      {selectedTab === 'organizer' && (
        <Box sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.spacing(2),
          borderBottom: 'none',
          boxShadow: theme.shadows[2],
          p: theme.spacing(4),
          backgroundColor: 'transparent',
          minHeight: 'calc(100vh - 270px)',
          paddingBottom: '100vh',
          textAlign: 'center'
        }}>
          <Typography variant="h5" color="text.secondary">
            Organizer content will go here
          </Typography>
        </Box>
      )}

      {selectedTab === 'review' && (
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 270px)' }}>
          {/* Left: Document Viewer */}
          <Box sx={{ 
            flex: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px 8px 0 0',
            borderBottom: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            paddingBottom: '100vh'
          }}>
            {/* Document Navigation Header */}
            <Box sx={{ p: 4, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedDocument ? selectedDocument.docType : 'Document Viewer'}
              </Typography>
              {selectedDocument && (
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="sm"
                    onClick={() => navigateToDocument(currentIndex - 1)}
                    disabled={currentIndex === 0}
                  >
                    <PrevIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ px: 2, py: 1 }}>
                    {currentIndex + 1} of {documents.length}
                  </Typography>
                  <IconButton
                    size="sm"
                    onClick={() => navigateToDocument(currentIndex + 1)}
                    disabled={currentIndex === documents.length - 1}
                  >
                    <NextIcon />
                  </IconButton>
                </Stack>
              )}
            </Box>
            
            {/* Document Content */}
            <Box sx={{ height: 'calc(100vh - 270px)', bgcolor: theme.palette.grey[100], position: 'relative' }}>
              {selectedDocument?.filePath ? (
                <Box sx={{ position: "relative", height: "100%" }}>
                  <iframe
                    src={`${selectedDocument.filePath}#toolbar=0&navpanes=0&scrollbar=0`}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title="Document Preview"
                  />
                  {/* Highlighting overlays */}
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
                          backgroundColor: `${theme.palette.primary.main}20`,
                          border: `2px solid ${theme.palette.primary.main}`,
                          borderRadius: "4px",
                          pointerEvents: "none",
                          zIndex: 10,
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
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 2
                }}>
                  <Typography color="text.secondary">
                    Select a document to review
                  </Typography>
                  {documents.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => loadDocumentForReview(documents[0])}
                    >
                      Load First Document
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          
          {/* Right: Extracted Fields */}
          <Box sx={{ 
            flex: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px 8px 0 0',
            borderBottom: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            paddingBottom: '100vh'
          }}>
            <Box sx={{ p: 4, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Extracted Fields
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  startIcon={
                    isApproving ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            border: `2px solid ${theme.palette.primary.main}`,
                            borderTop: `2px solid transparent`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }}
                        />
                      </Box>
                    ) : showApprovalSuccess ? (
                      <Box sx={{ color: theme.palette.success.main }}>✓</Box>
                    ) : (
                      <ApproveIcon />
                    )
                  }
                  disabled={!allFieldsValidated || isApproving}
                  onClick={handleApproveAndNext}
                  sx={{
                    border: `1px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      border: `1px solid ${theme.palette.primary.dark}`,
                    },
                    backgroundColor: showApprovalSuccess ? theme.palette.success.light : 'transparent',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  {isApproving ? 'Saving...' : showApprovalSuccess ? 'Approved!' : 'Approve & Next'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  startIcon={
                    <Box 
                      component="img" 
                      src="/acacia_logo.png" 
                      alt="Auto-pilot" 
                      sx={{ 
                        width: 24, 
                        height: 16,
                        filter: 'brightness(0) invert(1)' // Make logo white
                      }} 
                    />
                  }
                  title="Turn on auto-pilot to approve similar documents in the future"
                >
                  Auto-pilot
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ p: 4, height: 'calc(100vh - 270px)', overflow: 'auto' }}>
              {selectedDocument && fields.length === 0 ? (
                <Alert severity="info">
                  No fields extracted from this document yet.
                </Alert>
              ) : fields.length > 0 ? (
                <Stack spacing={2}>
                  {/* Validation Status - moved to top */}
                  <Alert 
                    severity={allFieldsValidated ? "success" : "warning"}
                  >
                    {allFieldsValidated
                      ? "All fields validated - ready to approve"
                      : "Some fields need validation"
                    }
                  </Alert>
                  
                   {/* General section title */}
                   <Typography 
                     variant="h6" 
                     sx={{ 
                       mt: 2,
                       width: '150px',
                       textAlign: 'left',
                       color: theme.palette.primary.main,
                       fontWeight: theme.typography.fontWeightMedium,
                       fontSize: '1.1rem'
                     }}
                   >
                     General
                   </Typography>
                  
                  {fields.map((field) => (
                    <Box
                      key={field.id}
                      sx={{
                        cursor: field.anchor ? "pointer" : "default",
                        marginLeft: `${(field.level || 0) * 24}px`, // Indent based on level
                      }}
                      onMouseEnter={() => {
                        if (field.anchor) {
                          setHoveredFieldId(field.id);
                          // Scroll PDF to the anchor position
                          const iframe = document.querySelector('iframe[title="Document Preview"]') as HTMLIFrameElement;
                          if (iframe && selectedDocument) {
                            try {
                              // Try to access iframe content and scroll directly
                              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                              if (iframeDoc) {
                                const scrollY = field.anchor.rect.y * iframeDoc.body.scrollHeight;
                                iframe.contentWindow?.scrollTo({
                                  top: scrollY,
                                  behavior: 'smooth'
                                });
                              } else if (selectedDocument.filePath) {
                                // Fallback: reload iframe with scroll position
                                const baseSrc = selectedDocument.filePath.split('#')[0];
                                const scrollPercent = Math.round(field.anchor.rect.y * 100);
                                iframe.src = `${baseSrc}#toolbar=0&navpanes=0&page=${field.anchor.page}&zoom=FitV,${scrollPercent}`;
                              }
                            } catch (error) {
                              console.log('PDF scroll attempt failed:', error);
                          console.log('Field anchor:', field.anchor);
                          console.log('Attempting to scroll to Y position:', field.anchor.rect.y);
                              // Final fallback: just update the URL
                              if (selectedDocument.filePath) {
                                const baseSrc = selectedDocument.filePath.split('#')[0];
                                iframe.src = `${baseSrc}#toolbar=0&navpanes=0&page=${field.anchor.page}`;
                              }
                            }
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredFieldId(null);
                      }}
                    >
                      {field.isSection ? (
                        // Render section title
                         <Typography 
                           variant="h6" 
                           sx={{ 
                             mb: 1, 
                             mt: field.level === 0 ? 2 : 1,
                             width: '150px',
                             textAlign: 'left',
                             color: theme.palette.primary.main,
                             fontWeight: theme.typography.fontWeightMedium,
                             fontSize: field.level === 0 ? '1.1rem' : '1rem'
                           }}
                         >
                           {field.label}
                         </Typography>
                      ) : (
                        // Render regular field with label on the left
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                           <Typography
                             variant="body2"
                             sx={{
                               minWidth: '150px',
                               maxWidth: '150px',
                               textAlign: 'left',
                               color: theme.palette.text.secondary,
                               fontSize: theme.typography.body2.fontSize,
                               fontWeight: theme.typography.body2.fontWeight,
                               overflow: 'hidden',
                               textOverflow: 'ellipsis',
                               whiteSpace: 'nowrap',
                             }}
                             title={field.label} // Show full label on hover
                           >
                             {field.label}
                           </Typography>
                          <TextField
                            value={field.value || ""}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            size="small"
                            variant="outlined"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <MuiChip
                                    label={`${(field.confidence * 100).toFixed(0)}%`}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: theme.palette.grey[300],
                                      color: theme.palette.text.secondary,
                                      fontSize: theme.typography.caption.fontSize,
                                      fontWeight: theme.typography.caption.fontWeight,
                                      height: '20px',
                                      '& .MuiChip-label': {
                                        fontSize: theme.typography.caption.fontSize,
                                        fontWeight: theme.typography.caption.fontWeight,
                                      }
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              width: `${Math.max(150, (field.value?.toString().length || 0) * 8 + 120)}px`,
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: field.confidence < 0.92 ? theme.palette.warning.light : 'background.paper',
                                '& fieldset': {
                                  borderColor: field.corrected 
                                    ? theme.palette.primary.main 
                                    : field.confidence < 0.92 
                                      ? theme.palette.warning.main 
                                      : theme.palette.divider,
                                  borderWidth: field.corrected ? 2 : 1,
                                },
                                '&:hover fieldset': {
                                  borderColor: field.corrected 
                                    ? theme.palette.primary.main 
                                    : field.confidence < 0.92 
                                      ? theme.palette.warning.main 
                                      : theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.main,
                                  borderWidth: 2,
                                },
                              },
                            }}
                          />
                          {field.corrected && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: theme.palette.primary.main,
                                fontSize: theme.typography.caption.fontSize,
                                fontStyle: 'italic',
                                ml: 1
                              }}
                            >
                              Value corrected
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Select a document to view extracted fields
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {selectedTab === 'deliverables' && (
        <Box sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.spacing(2),
          borderBottom: 'none',
          boxShadow: theme.shadows[2],
          p: theme.spacing(4),
          backgroundColor: 'transparent',
          minHeight: 'calc(100vh - 270px)',
          paddingBottom: '100vh'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: theme.spacing(4),
            mt: theme.spacing(8)
          }}>
            {/* Download Client Binder Card */}
            <Paper sx={{ 
              p: theme.spacing(4), 
              textAlign: 'center', 
              minWidth: theme.spacing(37.5), // 300px
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              }
            }}>
              <PdfIcon sx={{ 
                fontSize: theme.spacing(8), 
                color: theme.palette.error.main, 
                mb: theme.spacing(2) 
              }} />
              <Typography variant="h6" sx={{ 
                mb: theme.spacing(1),
                fontWeight: theme.typography.fontWeightMedium
              }}>
                Download Client Binder
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: theme.spacing(2) }}>
                PDF
              </Typography>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  // TODO: Implement download functionality
                  console.log('Download client binder PDF');
                }}
              >
                Download
              </Button>
            </Paper>

            {/* Download Tie-outs Card */}
            <Paper sx={{ 
              p: theme.spacing(4), 
              textAlign: 'center', 
              minWidth: theme.spacing(37.5), // 300px
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              }
            }}>
              <ExcelIcon sx={{ 
                fontSize: theme.spacing(8), 
                color: theme.palette.success.main, 
                mb: theme.spacing(2) 
              }} />
              <Typography variant="h6" sx={{ 
                mb: theme.spacing(1),
                fontWeight: theme.typography.fontWeightMedium
              }}>
                Download Tie-outs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: theme.spacing(2) }}>
                Excel
              </Typography>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  // TODO: Implement download functionality
                  console.log('Download tie-outs Excel');
                }}
              >
                Download
              </Button>
            </Paper>

            {/* Export to Lacerte Card */}
            <Paper sx={{ 
              p: theme.spacing(4), 
              textAlign: 'center', 
              minWidth: theme.spacing(37.5), // 300px
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              }
            }}>
              <ExportIcon sx={{ 
                fontSize: theme.spacing(8), 
                color: theme.palette.primary.main, 
                mb: theme.spacing(2) 
              }} />
              <Typography variant="h6" sx={{ 
                mb: theme.spacing(1),
                fontWeight: theme.typography.fontWeightMedium
              }}>
                Export to Lacerte
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: theme.spacing(2) }}>
                Tax Software
              </Typography>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  // TODO: Implement export functionality
                  console.log('Export to Lacerte');
                }}
              >
                Export
              </Button>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Reminder Email Drawer */}
      <ReviewDrawer
        isOpen={isReminderDrawerOpen}
        onClose={() => setIsReminderDrawerOpen(false)}
        messages={[]}
        connectionStatus={'connected'}
        conversationId={filingId}
        emailTemplate={reminderEmailTemplate}
      />

    </Box>
  );
}