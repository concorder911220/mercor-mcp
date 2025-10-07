export type DocStatus = "new" | "needs_review" | "ready" | "posted" | "error";

export type Anchor = {
  id: string;                // e.g., "invoice_number"
  page: number;              // 1-based
  rect: { x: number; y: number; w: number; h: number }; // 0..1 normalized
};

export type Field = {
  id: string;                // "vendor_name"
  label: string;             // "Vendor"
  value: string | number | null;
  confidence: number;        // 0..1
  anchorId?: string;
  status?: "ok" | "warning" | "error";
  messages?: string[];       // validation messages
  locked?: boolean;          // user-locked
  materiality?: number;      // e.g., amount influence for sorting
};

export type RuleResult = {
  id: string;
  severity: "error" | "warning" | "info";
  title: string;
  detail?: string;
  canAutofix?: boolean;
  apply?: () => void;        // mock function to alter fields
};

export type DuplicateSuspect = {
  id: string;
  vendor: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  matchScore: number;        // 0..1
};

export type ReviewDoc = {
  id: string;
  title: string;             // "Rippling • INV-02DQW-00036"
  fileUrl: string;
  vendorDisplay: string;
  amountDisplay: string;
  dateDisplay: string;
  overallConfidence: number; // aggregate
  status: DocStatus;
  fields: Field[];
  anchors: Anchor[];
  rules: RuleResult[];
  duplicates: DuplicateSuspect[];
};