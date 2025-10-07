export enum TaskRibbonColor {
  GRAY = '#6b7280',
  BLUE = '#3b82f6',
  GREEN = '#10b981',
  YELLOW = '#f59e0b',
  RED = '#ef4444',
  PURPLE = '#8b5cf6',
  PINK = '#ec4899',
  INDIGO = '#6366f1',
  ORANGE = '#f97316',
  TEAL = '#14b8a6',
  CYAN = '#06b6d4',
  LIME = '#84cc16',
  EMERALD = '#10b981',
  ROSE = '#f43f5e',
  VIOLET = '#8b5cf6',
  AMBER = '#f59e0b',
}

/**
 * Color mapping for document types based on the accounting index tree structure.
 * This provides a centralized mapping from document types to TaskRibbonColor enum values.
 */
export const DOCUMENT_COLOR_MAPPING: Record<string, TaskRibbonColor> = {
  // 1. Administrative (100-199) - Blue tones
  'engagement': TaskRibbonColor.BLUE,
  'client-info': TaskRibbonColor.INDIGO,
  'prior-year': TaskRibbonColor.INDIGO,
  
  // 2. Income Documents (200-299) - Green tones
  'w2': TaskRibbonColor.GREEN,
  '1099-int': TaskRibbonColor.EMERALD,
  '1099-div': TaskRibbonColor.EMERALD,
  '1099-b': TaskRibbonColor.EMERALD,
  'k1': TaskRibbonColor.EMERALD,
  'rental': TaskRibbonColor.EMERALD,
  'business': TaskRibbonColor.EMERALD,
  
  // 3. Adjustments/Deductions (300-399) - Purple tones
  'ira': TaskRibbonColor.PURPLE,
  'hsa': TaskRibbonColor.VIOLET,
  'education': TaskRibbonColor.VIOLET,
  'self-employment': TaskRibbonColor.VIOLET,
  
  // 4. Itemized Deductions (400-499) - Orange tones
  'medical': TaskRibbonColor.ORANGE,
  'taxes-paid': TaskRibbonColor.ORANGE,
  '1098': TaskRibbonColor.RED,
  'charitable': TaskRibbonColor.RED,
  'misc-deductions': TaskRibbonColor.RED,
  
  // 5. Credits (500-599) - Yellow tones
  'child-tax': TaskRibbonColor.YELLOW,
  'education-credits': TaskRibbonColor.AMBER,
  'energy': TaskRibbonColor.AMBER,
  'other-credits': TaskRibbonColor.AMBER,
  
  // 6. Other Items (600-699) - Gray tones
  'estimated': TaskRibbonColor.GRAY,
  'irs-notices': TaskRibbonColor.GRAY,
  'foreign': TaskRibbonColor.GRAY,
  'state': TaskRibbonColor.GRAY,
  'bank-statements': TaskRibbonColor.GRAY,
  
  // 7. Return Assembly (700-799) - Indigo tones
  'draft': TaskRibbonColor.INDIGO,
  'review': TaskRibbonColor.INDIGO,
  'final': TaskRibbonColor.INDIGO,
  'deliverables': TaskRibbonColor.INDIGO,
};

/**
 * Get the appropriate TaskRibbonColor for a given document type.
 * Falls back to GRAY if the document type is not found.
 */
export const getDocumentColor = (documentType: string): TaskRibbonColor => {
  return DOCUMENT_COLOR_MAPPING[documentType] || TaskRibbonColor.GRAY;
};

