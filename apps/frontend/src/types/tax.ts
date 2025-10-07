// Client lifecycle statuses
export enum ClientStatus {
  Onboarding = "Onboarding",
  OrganizerSent = "Organizer sent",
  WaitingOnDocs = "Waiting on docs",
  MissingDocuments = "Missing documents",
  FirstPassCheck = "First pass check",
  ReadyToReview = "Ready to review",
  InReview = "In review",
  ExportData = "Export data",
  ReturnFiled = "Return filed",
  // Optional e-file statuses
  ReadyToEFile = "Ready to e-file",
  Submitted = "Submitted",
  Accepted = "Accepted",
  Rejected = "Rejected"
}

// Document statuses
export enum DocumentStatus {
  NotReceived = "Not received",
  Received = "Received",
  Validated = "Validated",
  NeedsReupload = "Needs re-upload",
  Approved = "Approved",
  Exported = "Exported"
}

// Document flags
export enum DocumentFlag {
  Duplicate = "Duplicate",
  NameMismatch = "Name mismatch",
  TINMismatch = "TIN mismatch",
  WrongTaxYear = "Wrong tax year",
  Illegible = "Illegible",
  Incomplete = "Incomplete",
  OutOfScope = "Out of scope",
  LowConfidence = "Low confidence"
}

// Review statuses
export enum ReviewStatus {
  PendingReview = "Pending review",
  InReview = "In review",
  ChangesRequested = "Changes requested",
  Approved = "Approved",
  ExportQueued = "Export queued",
  Exported = "Exported",
  Exception = "Exception"
}

// Tax Filing type (renamed from TaxClient)
export interface TaxClient {
  id: string; // filing-001, filing-002, etc.
  clientId: string; // client-001, client-002, etc.
  name: string;
  status: ClientStatus;
  lastUpdated: string;
  email?: string;
  phone?: string;
  taxYear: number;
  assignedTo?: string;
  preferredName?: string;
  address?: string;
  ssn?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  communicationPreference?: "email" | "phone" | "text";
}

// Document type
export interface TaxDocument {
  id: string;
  clientId: string;
  docType: string;
  fileName?: string;
  filePath?: string;
  status: DocumentStatus;
  uploadedDate: string | null;
  flags?: DocumentFlag[];
  required: boolean;
  extractedData?: any;
  dropboxUrl?: string;
}

// Anchor type for PDF coordinates
export type Anchor = {
  id: string;
  page: number;
  rect: { x: number; y: number; w: number; h: number; };
};

// Extracted field type
export interface ExtractedField {
  id: string;
  label: string;
  value: string | number | null;
  confidence: number;
  validated: boolean;
  corrected?: boolean;
  originalValue?: string | number | null;
  anchor?: Anchor;
  level?: number; // Indentation level (0, 1, 2, etc.)
  isSection?: boolean; // Whether this is a section title
}

// Status color mapping - using simplified color palette (green, red, yellow, blue)
export const statusColors: Record<ClientStatus, { bg: string; text: string; border: string }> = {
  // Yellow - Warning/Attention needed
  [ClientStatus.Onboarding]: { bg: "warning.50", text: "warning.700", border: "warning.200" },
  [ClientStatus.MissingDocuments]: { bg: "warning.50", text: "warning.700", border: "warning.200" },
  [ClientStatus.FirstPassCheck]: { bg: "warning.50", text: "warning.700", border: "warning.200" },
  
  // Blue - Information/Ready states  
  [ClientStatus.OrganizerSent]: { bg: "info.50", text: "info.700", border: "info.200" },
  [ClientStatus.WaitingOnDocs]: { bg: "info.50", text: "info.700", border: "info.200" },
  [ClientStatus.ReadyToReview]: { bg: "info.50", text: "info.700", border: "info.200" },
  [ClientStatus.ReadyToEFile]: { bg: "info.50", text: "info.700", border: "info.200" },
  
  // Blue - Active/In Progress states
  [ClientStatus.InReview]: { bg: "primary.50", text: "primary.700", border: "primary.200" },
  [ClientStatus.ExportData]: { bg: "primary.50", text: "primary.700", border: "primary.200" },
  [ClientStatus.Submitted]: { bg: "primary.50", text: "primary.700", border: "primary.200" },
  
  // Green - Success/Completed states
  [ClientStatus.ReturnFiled]: { bg: "success.50", text: "success.700", border: "success.200" },
  [ClientStatus.Accepted]: { bg: "success.50", text: "success.700", border: "success.200" },
  
  // Red - Error/Rejected states
  [ClientStatus.Rejected]: { bg: "error.50", text: "error.700", border: "error.200" }
};

// Next action tooltips
export const nextActions: Record<ClientStatus, string> = {
  [ClientStatus.Onboarding]: "Client onboarding in progress",
  [ClientStatus.OrganizerSent]: "Waiting for client to complete organizer",
  [ClientStatus.WaitingOnDocs]: "Upload missing documents",
  [ClientStatus.MissingDocuments]: "Client needs to provide missing required documents",
  [ClientStatus.FirstPassCheck]: "Agent validating documents",
  [ClientStatus.ReadyToReview]: "CPA needs to review documents",
  [ClientStatus.InReview]: "CPA is reviewing documents",
  [ClientStatus.ExportData]: "Export to tax software",
  [ClientStatus.ReturnFiled]: "Tax return completed",
  [ClientStatus.ReadyToEFile]: "Ready to file electronically",
  [ClientStatus.Submitted]: "E-file submitted, awaiting response",
  [ClientStatus.Accepted]: "E-file accepted by IRS",
  [ClientStatus.Rejected]: "E-file rejected, needs correction"
};