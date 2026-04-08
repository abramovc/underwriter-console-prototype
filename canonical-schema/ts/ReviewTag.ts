export type ReviewTagGroup =
  | "identity"
  | "fraud"
  | "compliance"
  | "credit"
  | "bank"
  | "business"
  | "workflow"
  | "unknown";

export type ReviewTagSeverity = "low" | "medium" | "high";
export type ReviewTagDirection = "positive" | "negative" | "neutral";

export interface ReviewTag {
  id: string;

  tag: string;
  description?: string;

  group: ReviewTagGroup;
  severity: ReviewTagSeverity;
  direction: ReviewTagDirection;

  requiresReview: boolean;
  canContributeToDecline: boolean;

  timestamp?: string;
  dedupeKey?: string;
}