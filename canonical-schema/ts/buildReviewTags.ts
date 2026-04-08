import { ReviewTag } from "./ReviewTag";
import { REVIEW_TAG_METADATA } from "./reviewTagMetadata";

export interface ReviewTagInput {
  tag: string;
  description?: string;
}

function buildReviewTagId(tag: string, index: number): string {
  return `review_tag:${tag}:${index}`;
}

export function buildReviewTags(
  tags: ReviewTagInput[],
  options?: {
    timestamp?: string;
  }
): ReviewTag[] {
  return tags.map((item, index) => {
    const metadata = REVIEW_TAG_METADATA[item.tag];

    if (!metadata) {
      return {
        id: buildReviewTagId(item.tag, index),
        tag: item.tag,
        description: item.description,
        group: "unknown",
        severity: "low",
        direction: "neutral",
        requiresReview: true,
        canContributeToDecline: false,
        timestamp: options?.timestamp,
        dedupeKey: item.tag,
      };
    }

    return {
      id: buildReviewTagId(item.tag, index),
      tag: metadata.tag,
      description: item.description,
      group: metadata.group,
      severity: metadata.severity,
      direction: metadata.direction,
      requiresReview: metadata.requiresReview,
      canContributeToDecline: metadata.canContributeToDecline,
      timestamp: options?.timestamp,
      dedupeKey: item.tag,
    };
  });
}