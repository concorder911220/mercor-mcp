import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Grid,
  Paper
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Button as RialtoButton } from '@rialto/ui';
import { Document, FieldNode, Node } from '../types/document';
import PDFViewerWithHighlights from './PDFViewerWithHighlights';
import NodeRenderer from './NodeRenderer';

interface ExtractionReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentUrl?: string;
  document?: Document;
  onApprove?: (taskId: string) => void;
  onFieldValueChange?: (path: string, newValue: string, originalValue: string) => void;
  taskId?: string;
}


export default function ExtractionReviewDrawer({
  isOpen,
  onClose,
  documentName,
  documentUrl,
  document,
  onApprove,
  onFieldValueChange,
  taskId
}: ExtractionReviewDrawerProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [hoveredField, setHoveredField] = useState<FieldNode | null>(null);
  
  // Debounce hover field changes to prevent excessive re-renders
  const [debouncedHoveredField, setDebouncedHoveredField] = useState<FieldNode | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHoveredField(hoveredField);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [hoveredField]);

  // Convert FieldNode to HighlightField format for PDF viewer
  const convertFieldToHighlight = (field: FieldNode) => {
    if (!field.boundingBox) {
      return null;
    }
    
    return {
      content: field.value.current || field.value.original || '',
      bbox: {
        left: field.boundingBox.left || 0,
        top: field.boundingBox.top || 0,
        width: field.boundingBox.width || 0,
        height: field.boundingBox.height || 0,
        page: field.boundingBox.page || 1,
        original_page: field.boundingBox.page || 1
      },
      isHovered: true // Always true since this field is being hovered
    };
  };

  const handleApprove = async () => {
    if (!taskId || !onApprove) return;
    
    setIsApproving(true);
    try {
      await onApprove(taskId);
    } finally {
      setIsApproving(false);
    }
  };

  if (!documentUrl) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '90vw',
          maxWidth: '1400px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {documentName}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <RialtoButton
            variant="primary"
            startIcon={<ApproveIcon />}
            onClick={handleApprove}
            disabled={isApproving}
            loading={isApproving}
          >
            Approve
          </RialtoButton>
          
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        minHeight: 0 
      }}>
        <Grid container sx={{ height: '100%', minHeight: 0 }}>
          {/* Left: PDF Viewer */}
          <Grid item xs={12} md={8} sx={{ height: '100%', minHeight: 0 }}>
            <PDFViewerWithHighlights
              documentUrl={documentUrl}
              highlightField={debouncedHoveredField ? convertFieldToHighlight(debouncedHoveredField) || undefined : undefined}
            />
          </Grid>

          {/* Right: Extracted Fields */}
          <Grid item xs={12} md={4} sx={{ height: '100%', minHeight: 0 }}>
            <Paper 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2 
              }}>
                {document && document.nodes ? (
                  <Box>
                    {document.nodes.map((node, index) => (
                      <NodeRenderer
                        key={`${node.reference.path}-${index}`}
                        node={node}
                        onFieldValueChange={onFieldValueChange}
                        onFieldHover={setHoveredField}
                        depth={0}
                        isEditable={true}
                      />
                    ))}
                  </Box>
                ) : null}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
}