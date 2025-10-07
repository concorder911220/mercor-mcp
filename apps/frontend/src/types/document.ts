// Document structure types for tax document extraction

export interface Document {
  /** All extracted content, represented as recursive nodes */
  nodes: Node[];
}

// --------- Discriminated union ---------

export type Node = ObjectNode | ListNode | FieldNode;

export interface BaseNode {
  /** Human-readable label (e.g., "Employer", "First State", "Tax Year") */
  label: string;

  /** Source location in the parsed tree */
  reference: {
    /** Fully-qualified path, e.g. "states[0].stateIncomeTax" */
    path: string;
    /** Nesting depth (1 = top-level) */
    depth: number;
  };
}

// --------- Object node (dictionary-like) ---------

export interface ObjectNode extends BaseNode {
  type: "object";
  /** Named properties (or nested groups) */
  children: Node[];
}

// --------- List node (array-like) ---------

export interface ListNode extends BaseNode {
  type: "list";
  /** Indexed items; labels typically use ordinals (e.g., "First State") */
  items: Node[];
}

// --------- Field node (leaf) ---------

export interface FieldNode extends BaseNode {
  type: "field";

  /** Per spec: current must match original (OCR text or stringified fallback) */
  value: {
    original: string | null;
    current: string | null; // always equal to original
  };

  /** Bounding box when available */
  boundingBox: BoundingBox | null;

  /** Inferred from original text (no coercion) */
  subtype: FieldSubtype;

  /** Coarse confidence from provider (if present) */
  confidence: {
    level: ConfidenceLevel | null;
  };
}

// --------- Supporting types ---------

export interface BoundingBox {
  left: number | null;
  top: number | null;
  width: number | null;
  height: number | null;
  page: number | null;
}

export type FieldSubtype = "string" | "number" | "boolean" | "null";

export type ConfidenceLevel = "high" | "med" | "low";
