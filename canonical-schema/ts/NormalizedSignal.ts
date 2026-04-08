export type SignalSeverity = "low" | "medium" | "high";
export type SignalDirection = "positive" | "negative" | "neutral";

export interface NormalizedSignal {
  // Unique signal id
  id: string;

  // Source
  provider: string;
  product?: string;

  // Raw evidence
  sourceType: string;
  sourceCode: string;
  sourceDescription?: string;

  // Canonical layer
  canonicalConcept: string;
  conceptGroup?: string;

  // Classification / interpretation
  signalClass?: string;
  severity: SignalSeverity;
  direction: SignalDirection;

  // Decisioning hooks
  requiresReview?: boolean;
  canContributeToDecline?: boolean;

  // UX / explainability
  narrativeKey?: string;
  displayLabel?: string;

  // Metadata
  timestamp?: string;
  dedupeKey?: string;
}