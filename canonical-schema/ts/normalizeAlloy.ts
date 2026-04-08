import { NormalizedSignal, SignalDirection, SignalSeverity } from "./NormalizedSignal";
import { AlloyMappingRow } from "./loadAlloyMapping";

export interface AlloyTagInput {
  tag: string;
  description?: string;
}

function toSeverity(value?: string): SignalSeverity {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "low";
}

function toDirection(value?: string): SignalDirection {
  if (value === "positive" || value === "negative" || value === "neutral") return value;
  return "neutral";
}

function toBoolean(value?: string): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase().trim();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

function buildSignalId(provider: string, sourceCode: string, index: number): string {
  return `${provider}:${sourceCode}:${index}`;
}

export function normalizeAlloy(
  tags: AlloyTagInput[],
  mappingRows: AlloyMappingRow[],
  options?: {
    product?: string;
    timestamp?: string;
    includeInactive?: boolean;
  }
): NormalizedSignal[] {
  const includeInactive = options?.includeInactive ?? false;

  const mappingByCode = new Map<string, AlloyMappingRow>();
  for (const row of mappingRows) {
    mappingByCode.set(row.source_code, row);
  }

  const signals: NormalizedSignal[] = [];

  tags.forEach((item, index) => {
    const mapping = mappingByCode.get(item.tag);

    if (!mapping) {
      signals.push({
        id: buildSignalId("alloy", item.tag, index),
        provider: "alloy",
        product: options?.product,
        sourceType: "tag",
        sourceCode: item.tag,
        sourceDescription: item.description,
        canonicalConcept: "needs_review",
        conceptGroup: "unknown",
        signalClass: "unknown",
        severity: "low",
        direction: "neutral",
        requiresReview: true,
        canContributeToDecline: false,
        timestamp: options?.timestamp,
        dedupeKey: item.tag,
      });
      return;
    }

    if (!includeInactive && mapping.status && mapping.status !== "active") {
      return;
    }

    signals.push({
      id: buildSignalId("alloy", item.tag, index),
      provider: "alloy",
      product: options?.product,
      sourceType: mapping.source_type || "tag",
      sourceCode: mapping.source_code,
      sourceDescription: item.description || mapping.source_description,
      canonicalConcept: mapping.canonical_concept || "needs_review",
      conceptGroup: mapping.concept_group,
      signalClass: mapping.signal_class,
      severity: toSeverity(mapping.severity),
      direction: toDirection(mapping.direction),
      requiresReview: toBoolean(mapping.requires_review),
      canContributeToDecline: toBoolean(mapping.can_contribute_to_decline),
      narrativeKey: mapping.narrative_key || undefined,
      timestamp: options?.timestamp,
      dedupeKey: mapping.dedupe_key || mapping.source_code,
    });
  });

  return signals;
}