import { ReviewDoc } from "../types/review";

export const mockReviewDocs: ReviewDoc[] = [
  {
    id: "doc-001",
    title: "Rippling • INV-02DQW-00036",
    fileUrl: "/Rippling sample invoice.pdf",
    vendorDisplay: "People Center, Inc.",
    amountDisplay: "$162.00",
    dateDisplay: "Aug 01, 2025",
    overallConfidence: 0.96,
    status: "needs_review",
    fields: [
      { 
        id: "vendor_name", 
        label: "Vendor", 
        value: "People Center, Inc.", 
        confidence: 0.94, 
        anchorId: "vendor_name", 
        status: "ok" 
      },
      { 
        id: "invoice_number", 
        label: "Invoice #", 
        value: "INV-02DQW-00036", 
        confidence: 0.99, 
        anchorId: "invoice_number", 
        status: "ok" 
      },
      { 
        id: "invoice_date", 
        label: "Invoice Date", 
        value: "2025-08-01", 
        confidence: 0.98, 
        anchorId: "invoice_date", 
        status: "ok" 
      },
      { 
        id: "terms", 
        label: "Terms", 
        value: "Due Immediately", 
        confidence: 0.95, 
        status: "ok" 
      },
      { 
        id: "currency", 
        label: "Currency", 
        value: "USD", 
        confidence: 0.99, 
        status: "ok" 
      },
      { 
        id: "line_items", 
        label: "Line Items", 
        value: "2 items", 
        confidence: 0.87, 
        status: "warning", 
        messages: ["Click to review individual line items"] 
      },
      { 
        id: "subtotal", 
        label: "Subtotal", 
        value: 162.00, 
        confidence: 0.99, 
        anchorId: "total_amount", 
        status: "ok", 
        materiality: 162 
      },
      { 
        id: "due_date", 
        label: "Due Date", 
        value: "2025-08-01", 
        confidence: 0.85, 
        status: "warning", 
        messages: ["Please verify this due date is correct"] 
      },
    ],
    anchors: [
      { id: "invoice_number", page: 1, rect: { x: 0.78, y: 0.08, w: 0.18, h: 0.03 } },
      { id: "invoice_date", page: 1, rect: { x: 0.78, y: 0.12, w: 0.18, h: 0.03 } },
      { id: "vendor_name", page: 1, rect: { x: 0.08, y: 0.06, w: 0.32, h: 0.04 } },
      { id: "total_amount", page: 1, rect: { x: 0.78, y: 0.58, w: 0.18, h: 0.035 } },
    ],
    rules: [
      { 
        id: "date_in_past", 
        severity: "info", 
        title: "Invoice date is in the past", 
        detail: "OK" 
      },
      { 
        id: "vendor_exists", 
        severity: "warning", 
        title: "Vendor not found in QuickBooks", 
        detail: "Offer to create vendor", 
        canAutofix: true,
        apply: () => console.log("Creating vendor in QuickBooks...") 
      },
      { 
        id: "dup_check", 
        severity: "info", 
        title: "No duplicate by invoice #", 
        detail: "OK" 
      },
    ],
    duplicates: []
  },
  // Additional mock documents for multi-doc queue
  {
    id: "doc-002",
    title: "AWS • INV-2025-08-1234",
    fileUrl: "/aws-invoice.pdf",
    vendorDisplay: "Amazon Web Services",
    amountDisplay: "$1,250.00",
    dateDisplay: "Aug 05, 2025",
    overallConfidence: 0.88,
    status: "needs_review",
    fields: [],
    anchors: [],
    rules: [],
    duplicates: []
  },
  {
    id: "doc-003",
    title: "Slack • SLK-INV-789456",
    fileUrl: "/slack-invoice.pdf",
    vendorDisplay: "Slack Technologies",
    amountDisplay: "$450.00",
    dateDisplay: "Aug 10, 2025",
    overallConfidence: 0.99,
    status: "ready",
    fields: [],
    anchors: [],
    rules: [],
    duplicates: []
  }
];