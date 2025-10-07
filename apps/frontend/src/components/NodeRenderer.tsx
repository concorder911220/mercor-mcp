import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Import the node types from document types
import { Node, ObjectNode, ListNode, FieldNode, FieldSubtype } from '../types/document';

// Constants for styling
const ACCORDION_STYLES = {
  boxShadow: 1,
  '&:before': { display: 'none' },
  '&.Mui-expanded': { margin: 0 }
} as const;

const ACCORDION_SUMMARY_STYLES = {
  backgroundColor: 'grey.50',
  '&.Mui-expanded': { minHeight: 'auto' }
} as const;

const CHIP_STYLES = {
  display: 'inline-block',
  borderRadius: 1,
  backgroundColor: 'action.hover',
  padding: '4px 12px',
  fontSize: '0.75rem',
  fontFamily: 'inherit',
  fontWeight: 'fontWeightMedium',
  color: 'text.secondary',
  ml: 2
} as const;

// Field value constants
const BOOLEAN_VALUES = {
  TRUE: 'true',
  FALSE: 'false',
  PYTHON_TRUE: 'True',
  PYTHON_FALSE: 'False'
} as const;

const BOOLEAN_DISPLAY = {
  TRUE: 'Yes',
  FALSE: 'No'
} as const;

const DEFAULT_BOOLEAN = BOOLEAN_VALUES.FALSE;
const NA_VALUE = 'N/A';

// Helper functions
const getConfidenceStyles = (level: string) => {
  const backgroundColorMap = {
    high: 'rgba(33, 150, 243, 0.1)',
    med: 'rgba(255, 193, 7, 0.1)',
    low: 'rgba(244, 67, 54, 0.1)',
  } as const;
  
  const colorMap = {
    high: 'primary.main',
    med: 'warning.main',
    low: 'error.main',
  } as const;
  
  return {
    backgroundColor: backgroundColorMap[level as keyof typeof backgroundColorMap] || 'transparent',
    color: colorMap[level as keyof typeof colorMap] || 'text.secondary'
  };
};

const isBooleanValue = (value: string) => 
  value === BOOLEAN_VALUES.TRUE || value === BOOLEAN_VALUES.FALSE ||
  value === BOOLEAN_VALUES.PYTHON_TRUE || value === BOOLEAN_VALUES.PYTHON_FALSE;

const normalizeBoolean = (value: string) => {
  if (value === BOOLEAN_VALUES.PYTHON_TRUE) return BOOLEAN_VALUES.TRUE;
  if (value === BOOLEAN_VALUES.PYTHON_FALSE) return BOOLEAN_VALUES.FALSE;
  return value;
};

const formatBooleanValue = (value: string) => {
  return (value === BOOLEAN_VALUES.TRUE || value === BOOLEAN_VALUES.PYTHON_TRUE) 
    ? BOOLEAN_DISPLAY.TRUE 
    : BOOLEAN_DISPLAY.FALSE;
};

interface NodeRendererProps {
  node: Node;
  onFieldValueChange?: (path: string, newValue: string, originalValue: string) => void;
  onFieldHover?: (field: FieldNode | null) => void;
  depth?: number;
  isEditable?: boolean;
}

interface FieldEditorProps {
  field: FieldNode;
  onValueChange: (newValue: string, originalValue: string) => void;
  onHover?: (field: FieldNode | null) => void;
  isEditable: boolean;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onValueChange, onHover, isEditable }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const getCurrentValue = () => field.value.current ?? field.value.original ?? '';
  const currentValue = getCurrentValue();
  const isCorrected = currentValue !== field.value.original;
  
  const getInitialEditValue = () => {
    const currentValue = getCurrentValue();
    if (field.subtype === 'boolean') {
      return isBooleanValue(currentValue) ? normalizeBoolean(currentValue) : DEFAULT_BOOLEAN;
    }
    return currentValue;
  };
  
  const [editValue, setEditValue] = useState(getInitialEditValue());

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(getInitialEditValue());
  };

  const handleSave = () => {
    const originalValue = field.value.original || '';
    
    let valueToSave = editValue;
    if (field.subtype === 'boolean') {
      const originalIsPythonStyle = originalValue === BOOLEAN_VALUES.PYTHON_TRUE || originalValue === BOOLEAN_VALUES.PYTHON_FALSE;
      if (originalIsPythonStyle) {
        valueToSave = editValue === BOOLEAN_VALUES.TRUE ? BOOLEAN_VALUES.PYTHON_TRUE : BOOLEAN_VALUES.PYTHON_FALSE;
      }
    }
    
    field.value.current = valueToSave;
    onValueChange(valueToSave, originalValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(getInitialEditValue());
    setIsEditing(false);
  };

  const getInputType = (subtype: FieldSubtype) => {
    switch (subtype) {
      case 'number': return 'number';
      case 'boolean': return 'checkbox';
      default: return 'text';
    }
  };

  const formatValue = (value: string | null, subtype: FieldSubtype) => {
    if (value === null) return NA_VALUE;
    if (subtype === 'boolean') {
      return formatBooleanValue(value);
    }
    return value;
  };

  // Get the current value to display (either edited or original)
  const displayValue = isEditing ? editValue : currentValue || '';

  const handleMouseEnter = () => {
    onHover?.(field.boundingBox ? field : null);
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  const renderEditMode = () => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      {field.subtype === 'boolean' ? (
        <FormControl size="small" sx={{ flex: 1 }}>
          <Select
            value={editValue || DEFAULT_BOOLEAN}
            onChange={(e) => setEditValue(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiSelect-select': {
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }
            }}
          >
            <MenuItem value={BOOLEAN_VALUES.TRUE}>{BOOLEAN_DISPLAY.TRUE}</MenuItem>
            <MenuItem value={BOOLEAN_VALUES.FALSE}>{BOOLEAN_DISPLAY.FALSE}</MenuItem>
          </Select>
        </FormControl>
      ) : (
        <TextField
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          type={getInputType(field.subtype)}
          size="small"
          fullWidth
          variant="outlined"
        />
      )}
      <IconButton size="small" onClick={handleSave} color="primary">
        <CheckIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={handleCancel}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>
  );

  const renderDisplayMode = () => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Typography variant="body2" sx={{ 
        fontFamily: 'monospace',
        backgroundColor: 'grey.100',
        p: 1,
        borderRadius: 1,
        minHeight: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        flex: 1
      }}>
        {formatValue(displayValue, field.subtype)}
      </Typography>
      {isEditable && (
        <IconButton size="small" onClick={handleEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <Box 
      sx={{ 
        p: 2, 
        border: 1, 
        borderColor: 'divider', 
        borderRadius: 1,
        backgroundColor: 'background.paper',
        position: 'relative',
        cursor: field.boundingBox ? 'pointer' : 'default',
        '&:hover': field.boundingBox ? {
          backgroundColor: 'action.hover',
          borderColor: 'primary.main',
          boxShadow: 1
        } : {}
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isEditing ? renderEditMode() : renderDisplayMode()}

      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        <Box
          sx={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: 0,
            backgroundColor: 'transparent',
            color: 'text.secondary',
            fontWeight: 500
          }}
        >
          {field.label}
        </Box>
        {field.confidence.level && (
          <Box
            sx={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 500,
              ...getConfidenceStyles(field.confidence.level)
            }}
          >
            {field.confidence.level}
          </Box>
        )}
        {isCorrected && (
          <Box
            sx={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              color: 'error.main',
              fontWeight: 500
            }}
          >
            corrected
          </Box>
        )}
      </Stack>

    </Box>
  );
};

const NodeRenderer: React.FC<NodeRendererProps> = ({ 
  node, 
  onFieldValueChange, 
  onFieldHover,
  depth = 0,
  isEditable = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const renderObjectNode = (objectNode: ObjectNode) => (
    <Accordion 
      expanded={isExpanded} 
      onChange={() => setIsExpanded(!isExpanded)}
      sx={ACCORDION_STYLES}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={ACCORDION_SUMMARY_STYLES}
      >
        <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
          {objectNode.label}
        </Typography>
        <Box sx={CHIP_STYLES}>
          {objectNode.children.length}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {objectNode.children.map((child, index) => (
              <NodeRenderer
                key={`${child.reference.path}-${index}`}
                node={child}
                onFieldValueChange={onFieldValueChange}
                onFieldHover={onFieldHover}
                depth={depth + 1}
                isEditable={isEditable}
              />
            ))}
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const renderListNode = (listNode: ListNode) => (
    <Accordion 
      expanded={isExpanded} 
      onChange={() => setIsExpanded(!isExpanded)}
      sx={ACCORDION_STYLES}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={ACCORDION_SUMMARY_STYLES}
      >
        <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
          {listNode.label}
        </Typography>
        <Box sx={CHIP_STYLES}>
          {listNode.items.length}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {listNode.items.map((item, index) => (
              <Box key={`${item.reference.path}-${index}`}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Item {index + 1}
                </Typography>
                <NodeRenderer
                  node={item}
                  onFieldValueChange={onFieldValueChange}
                  onFieldHover={onFieldHover}
                  depth={depth + 1}
                  isEditable={isEditable}
                />
                {index < listNode.items.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const renderFieldNode = (fieldNode: FieldNode) => (
    <FieldEditor
      field={fieldNode}
      onValueChange={(newValue, originalValue) => onFieldValueChange?.(fieldNode.reference.path, newValue, originalValue)}
      onHover={onFieldHover}
      isEditable={isEditable}
    />
  );

  return (
    <Box sx={{ ml: depth * 2 }}>
      {node.type === 'object' && renderObjectNode(node as ObjectNode)}
      {node.type === 'list' && renderListNode(node as ListNode)}
      {node.type === 'field' && renderFieldNode(node as FieldNode)}
    </Box>
  );
};

export default NodeRenderer;
