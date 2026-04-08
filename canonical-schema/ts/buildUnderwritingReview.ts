import { ReviewTag } from "./ReviewTag";
import { NormalizedSignal } from "./NormalizedSignal";

export interface UnderwritingReview {
  summaryTags: ReviewTag[];
  supportingSignals: NormalizedSignal[];

  groupedSignals: Record<string, NormalizedSignal[]>;
}

function groupSignalsByConceptGroup(
  signals: NormalizedSignal[]
): Record<string, NormalizedSignal[]> {
  const groups: Record<string, NormalizedSignal[]> = {};

  for (const signal of signals) {
    const group = signal.conceptGroup || "unknown";

    if (!groups[group]) {
      groups[group] = [];
    }

    groups[group].push(signal);
  }

  return groups;
}

export function buildUnderwritingReview(params: {
  reviewTags: ReviewTag[];
  signals: NormalizedSignal[];
}): UnderwritingReview {
  const groupedSignals = groupSignalsByConceptGroup(params.signals);

  return {
    summaryTags: params.reviewTags,
    supportingSignals: params.signals,
    groupedSignals,
  };
}