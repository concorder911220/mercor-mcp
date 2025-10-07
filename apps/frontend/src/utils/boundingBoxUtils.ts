/**
 * Utility functions for working with bounding boxes and adding padding
 */

export interface BoundingBoxCoords {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RectCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Adds padding to a bounding box by adjusting coordinates
 * @param bbox - The original bounding box coordinates
 * @param padding - Padding amount as a percentage (0.01 = 1% padding)
 * @returns New bounding box with padding applied
 */
export function addPaddingToBoundingBox(
  bbox: BoundingBoxCoords,
  padding: number = 0.02 // 2% padding by default
): BoundingBoxCoords {
  // Calculate padding amounts
  const paddingX = bbox.width * padding;
  const paddingY = bbox.height * padding;
  
  return {
    left: Math.max(0, bbox.left - paddingX),
    top: Math.max(0, bbox.top - paddingY),
    width: Math.min(1, bbox.width + (paddingX * 2)),
    height: Math.min(1, bbox.height + (paddingY * 2))
  };
}

/**
 * Adds padding to a rect object (used in anchor coordinates)
 * @param rect - The original rect coordinates
 * @param padding - Padding amount as a percentage (0.01 = 1% padding)
 * @returns New rect with padding applied
 */
export function addPaddingToRect(
  rect: RectCoords,
  padding: number = 0.02 // 2% padding by default
): RectCoords {
  // Calculate padding amounts
  const paddingX = rect.w * padding;
  const paddingY = rect.h * padding;
  
  return {
    x: Math.max(0, rect.x - paddingX),
    y: Math.max(0, rect.y - paddingY),
    w: Math.min(1, rect.w + (paddingX * 2)),
    h: Math.min(1, rect.h + (paddingY * 2))
  };
}

/**
 * Adds padding to a bbox object (used in PDFViewerWithHighlights)
 * @param bbox - The original bbox coordinates
 * @param padding - Padding amount as a percentage (0.01 = 1% padding)
 * @returns New bbox with padding applied
 */
export function addPaddingToBbox(
  bbox: { left: number; top: number; width: number; height: number },
  padding: number = 0.02 // 2% padding by default
): { left: number; top: number; width: number; height: number } {
  // Calculate padding amounts
  const paddingX = bbox.width * padding;
  const paddingY = bbox.height * padding;
  
  return {
    left: Math.max(0, bbox.left - paddingX),
    top: Math.max(0, bbox.top - paddingY),
    width: Math.min(1, bbox.width + (paddingX * 2)),
    height: Math.min(1, bbox.height + (paddingY * 2))
  };
}
