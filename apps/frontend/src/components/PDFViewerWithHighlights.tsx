import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Box, Alert, Typography } from '@mui/material';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { addPaddingToBbox } from '../utils/boundingBoxUtils';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

interface HighlightField {
  content: string;
  bbox: {
    left: number;
    top: number;
    width: number;
    height: number;
    page: number;
    original_page: number;
  };
  isHovered?: boolean;
}

interface HighlightOverlayProps {
  field: HighlightField;
  container: Element | null;
}

// React component for individual highlight
const HighlightOverlay: React.FC<HighlightOverlayProps> = ({ field, container }) => {
  if (!container) return null;

  // Add padding to the bounding box
  const paddedBbox = addPaddingToBbox(field.bbox, 0.1);

  return createPortal(
    <Box
      sx={{
        position: 'absolute',
        left: `${paddedBbox.left * 100}%`,
        top: `${paddedBbox.top * 100}%`,
        width: `${paddedBbox.width * 100}%`,
        height: `${paddedBbox.height * 100}%`,
        backgroundColor: field.isHovered 
          ? 'rgba(76, 175, 80, 0.8)' 
          : 'rgba(255, 0, 0, 0.7)',
        border: field.isHovered 
          ? '1px solid #4caf50' 
          : '1px solid #ff0000',
        borderRadius: '1px',
        pointerEvents: 'none',
        zIndex: field.isHovered ? 20 : 10,
        animation: field.isHovered 
          ? 'none' 
          : 'gentle-pulse 2s infinite',
        '@keyframes gentle-pulse': {
          '0%': { opacity: 0.8 },
          '50%': { opacity: 1.0 },
          '100%': { opacity: 0.8 }
        }
      }}
      title={field.content}
    />,
    container
  );
};

interface PDFViewerWithHighlightsProps {
  documentUrl: string;
  highlightField?: HighlightField; // Single field instead of array
}

export default function PDFViewerWithHighlights({
  documentUrl,
  highlightField
}: PDFViewerWithHighlightsProps) {
  const [error, setError] = useState<string | null>(null);
  const [pdfContainer, setPdfContainer] = useState<Element | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // Initialize page navigation plugin
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Helper function to find PDF container
  const findPDFContainer = (targetPage?: number) => {
    if (!viewerRef.current) return null;

    const viewer = viewerRef.current;
    const container = viewer.querySelector('.rpv-core__viewer') || 
                     viewer.querySelector('.rpv-core__inner') ||
                     viewer.querySelector('[data-testid="core__viewer"]') ||
                     viewer;
    
    if (!container) return null;

    // If looking for a specific page
    if (targetPage) {
      const pageSelectors = [
        `[data-page-number="${targetPage}"]`,
        `[data-virtual-index="${targetPage - 1}"]`,
        `.rpv-core__page-layer[data-virtual-index="${targetPage - 1}"]`
      ];
      
      for (const selector of pageSelectors) {
        const pageElement = container.querySelector(selector);
        if (pageElement) return pageElement;
      }
    }
    
    // Fallback to any page container or main container
    return container.querySelector('.rpv-core__page-layer') ||
           container.querySelector('[data-page-number]') ||
           container.querySelector('.rpv-core__page') ||
           container;
  };

  // Handle document load success
  const onDocumentLoad = () => {
    setError(null);
  };

  // Handle jumping to the correct page when highlighting a field
  useEffect(() => {
    if (highlightField && highlightField.bbox.page && highlightField.bbox.page > 0 && jumpToPage) {
      setIsNavigating(true);
      
      // Jump to the page (page numbers are 1-based in the plugin)
      jumpToPage(highlightField.bbox.page - 1); // Plugin uses 0-based indexing
      
      // Wait longer for page to actually change, then force container re-detection
      setTimeout(() => {
        setPdfContainer(null);
        
        // Try to find the correct page container immediately
        const findCorrectPageContainer = () => {
          const container = findPDFContainer(highlightField.bbox.page);
          if (container) {
            setPdfContainer(container);
            return true;
          }
          return false;
        };
        
        // Try immediately and then retry a few times
        if (!findCorrectPageContainer()) {
          let retryCount = 0;
          const maxRetries = 5;
          const retryInterval = setInterval(() => {
            retryCount++;
            if (findCorrectPageContainer() || retryCount >= maxRetries) {
              clearInterval(retryInterval);
            }
          }, 200);
        }
        
        // Wait a bit more for the new page to render, then stop navigating indicator
        setTimeout(() => {
          setIsNavigating(false);
        }, 500);
      }, 1500);
    }
  }, [highlightField, jumpToPage]);

  // Render highlight component for the single field
  const highlightComponent = useMemo(() => {
    if (!highlightField) {
      return null;
    }
    
    // Try to find container if we don't have one
    let container = pdfContainer;
    if (!container) {
      container = findPDFContainer(highlightField.bbox.page);
    }
    
    if (!container) {
      return null;
    }
    
    return (
      <HighlightOverlay
        key={`${highlightField.content}-${highlightField.bbox.page}`}
        field={highlightField}
        container={container}
      />
    );
  }, [highlightField, pdfContainer]);

  // Reset state when document URL changes
  useEffect(() => {
    setError(null);
    setPdfContainer(null);
  }, [documentUrl]);

  // Handle PDF container detection
  useEffect(() => {
    if (!viewerRef.current) return;

    const detectContainer = () => {
      const container = findPDFContainer(highlightField?.bbox.page);
      if (container) {
        setPdfContainer(container);
        return true;
      }
      return false;
    };

    // Try immediately first
    if (detectContainer()) return;

    // Use MutationObserver to watch for PDF elements to appear
    const observer = new MutationObserver(() => {
      if (detectContainer()) {
        observer.disconnect();
      }
    });

    observer.observe(viewerRef.current, {
      childList: true,
      subtree: true
    });

    // Fallback timeout
    const fallbackTimer = setTimeout(() => {
      observer.disconnect();
      detectContainer();
    }, 2000);

    // Additional retry when highlight field changes
    const retryTimer = setTimeout(() => {
      if (!pdfContainer && highlightField) {
        detectContainer();
      }
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
      clearTimeout(retryTimer);
    };
  }, [documentUrl, highlightField]);

  // Additional effect to ensure container is found when highlight field changes
  useEffect(() => {
    if (highlightField && !pdfContainer) {
      const retryInterval = setInterval(() => {
        const container = findPDFContainer(highlightField.bbox.page);
        if (container) {
          setPdfContainer(container);
          clearInterval(retryInterval);
        }
      }, 200);
      
      // Stop retrying after 5 seconds
      setTimeout(() => clearInterval(retryInterval), 5000);
      
      return () => clearInterval(retryInterval);
    }
  }, [highlightField, pdfContainer]);

  if (error) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          <Typography variant="h6">Failed to load PDF</Typography>
          <Typography variant="body2">URL: {documentUrl}</Typography>
          <Typography variant="body2">Please check if the file exists and is accessible.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', pt: 4 }}>
      <Box
        ref={viewerRef}
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={documentUrl}
            plugins={[pageNavigationPluginInstance]}
            onDocumentLoad={onDocumentLoad}
          />
        </Worker>

        {/* Render highlight using React portal */}
        {highlightComponent}
        
        {/* Navigation indicator */}
        {isNavigating && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: 2,
            borderRadius: 1,
            zIndex: 1000,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Navigating to page {highlightField?.bbox.page}...
          </Box>
        )}
      </Box>
    </Box>
  );
}