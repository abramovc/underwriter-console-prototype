import { loadCsvMapping } from "./loadCsvMapping";

export interface AlloyMappingRow {
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

export function loadAlloyMapping(csvFilePath?: string): AlloyMappingRow[] {
  const rows = loadCsvMapping(
    csvFilePath ?? "mappings/provider_mapping_alloy.csv"
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