import { NormalizedSignal, SignalDirection, SignalSeverity } from "./NormalizedSignal";

export interface SocureReasonCode {
  code: string;
  description?: string;
}

export interface SocureMappingRow {
  provider: string;
  source_type: string;
  source_code: string;
  source_description?: string;
  canonical_concept: string;
  concept_group?: string;
  signal_class?: string;
  severity?: string;
  direction?: string;
  requires_review?: string;
  can_contribute_to_decline?: string;
  dedupe_key?: string;
  narrative_key?: string;
  notes?: string;
  status?: string;
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

export function normalizeSocure(
  reasonCodes: SocureReasonCode[],
  mappingRows: SocureMappingRow[],
  options?: {
    product?: string;
    timestamp?: string;
    includeInactive?: boolean;
  }
): NormalizedSignal[] {
  const includeInactive = options?.includeInactive ?? false;

  const mappingByCode = new Map<string, SocureMappingRow>();
  for (const row of mappingRows) {
    mappingByCode.set(row.source_code, row);
  }

  const signals: NormalizedSignal[] = [];

  reasonCodes.forEach((reason, index) => {
    const mapping = mappingByCode.get(reason.code);

    if (!mapping) {
      signals.push({
        id: buildSignalId("socure", reason.code, index),
        provider: "socure",
        product: options?.product,
        sourceType: "reason_code",
        sourceCode: reason.code,
        sourceDescription: reason.description,
        canonicalConcept: "needs_review",
        conceptGroup: "unknown",
        signalClass: "unknown",
        severity: "low",
        direction: "neutral",
        requiresReview: true,
        canContributeToDecline: false,
        timestamp: options?.timestamp,
        dedupeKey: reason.code,
      });
      return;
    }

    if (!includeInactive && mapping.status && mapping.status !== "active") {
      return;
    }

    signals.push({
      id: buildSignalId("socure", reason.code, index),
      provider: "socure",
      product: options?.product,
      sourceType: mapping.source_type || "reason_code",
      sourceCode: mapping.source_code,
      sourceDescription: reason.description || mapping.source_description,
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