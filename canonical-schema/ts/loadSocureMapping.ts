import { loadCsvMapping } from "./loadCsvMapping";
import { SocureMappingRow } from "./normalizeSocure";

export function loadSocureMapping(csvFilePath?: string): SocureMappingRow[] {
  const rows = loadCsvMapping(
    csvFilePath ?? "mappings/provider_mapping_socure.csv"
  );

  return rows.map((row) => {
    return {
      provider: row.provider,
      source_type: row.source_type,
      source_code: row.source_code,
      source_description: row.source_description,
      canonical_concept: row.canonical_concept,
      concept_group: row.concept_group,
      signal_class: row.signal_class,
      severity: row.severity,
      direction: row.direction,
      requires_review: row.requires_review,
      can_contribute_to_decline: row.can_contribute_to_decline,
      dedupe_key: row.dedupe_key,
      narrative_key: row.narrative_key,
      notes: row.notes,
      status: row.status,
    };
  });
}