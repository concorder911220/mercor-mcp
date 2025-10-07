// Utility functions for type conversions

// Convert null to undefined for API compatibility
export const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

// Convert undefined to null for storage compatibility  
export const undefinedToNull = <T>(value: T | undefined): T | null => {
  return value === undefined ? null : value;
};

// Safe string conversion that handles null/undefined
export const safeString = (value: string | null | undefined): string | undefined => {
  return value === null ? undefined : value;
}; 