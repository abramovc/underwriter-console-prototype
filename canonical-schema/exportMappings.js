const fs = require("fs");
const path = require("path");

const SOCURE_FILE = path.join(__dirname, "mappings/provider_mapping_socure.csv");
const LEXIS_FILE = path.join(__dirname, "mappings/provider_mapping_lexis_nexis_instant_id.csv");
const ID_ANALYTICS_FILE = path.join(__dirname, "mappings/provider_mapping_id_analytics.csv");
const MIDDESK_KYB_FILE = path.join(__dirname, "mappings/provider_mapping_middesk_kyb.csv");
const MIDDESK_MCC_FILE = path.join(__dirname, "mappings/provider_mapping_middesk_mcc.csv");
const MIDDESK_NAICS_FILE = path.join(__dirname, "mappings/provider_mapping_middesk_naics.csv");
const OUTPUT_FILE = path.join(
  __dirname,
  "../underwriter-console-prototype/data/provider-mappings.json"
);

function parseCSV(content) {
  const lines = content.split("\n").filter((line) => line.trim().length > 0);

  return lines.map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  });
}

function normalizeDirection(direction) {
  if (!direction) return "neutral";

  const d = direction.toLowerCase();

  if (d === "warning") return "negative";
  if (d === "positive") return "positive";
  if (d === "negative") return "negative";
  if (d === "neutral") return "neutral";

  return "neutral";
}

function normalizeSeverity(severity) {
  if (!severity) return "low";
  return severity.toLowerCase();
}

function buildSocureMappings(rows) {
  const map = {};

  rows.forEach((cols) => {
    // Because the CSV has a leading empty column, the real positions start at index 1
    const provider = cols[1];
    const sourceType = cols[2];
    const sourceCode = cols[3];
    const sourceDescription = cols[4];
    const canonicalConcept = cols[5];
    const conceptGroup = cols[6];
    const signalClass = cols[7];
    const severity = cols[8];
    const direction = cols[9];
    const requiresReview = cols[10];
    const canContributeToDecline = cols[11];
    const dedupeKey = cols[12];
    const narrativeKey = cols[13];
    const notes = cols[14];
    const status = cols[15];

    if (!provider || provider !== "socure") return;
    if (!sourceCode) return;

    map[sourceCode] = {
      provider,
      sourceType,
      sourceCode,
      sourceDescription,
      canonicalConcept,
      conceptGroup,
      signalClass,
      severity: normalizeSeverity(severity),
      direction: normalizeDirection(direction),
      requiresReview: String(requiresReview).toUpperCase() === "TRUE",
      canContributeToDecline: String(canContributeToDecline).toUpperCase() === "TRUE",
      dedupeKey,
      narrativeKey,
      notes,
      status,
      displayLabel: canonicalConcept || sourceDescription || sourceCode
    };
  });

  return map;
}

function buildStandardMappings(rows, expectedProvider) {
  const map = {};

  rows.forEach((cols, index) => {
    if (index === 0) return;
    if (!cols || cols.length < 16) return;

    const provider = cols[0];
    const sourceType = cols[1];
    const sourceCode = cols[2];
    const sourceDescription = cols[3];
    const canonicalConcept = cols[4];
    const conceptGroup = cols[5];
    const signalClass = cols[6];
    const severity = cols[7];
    const direction = cols[8];
    const requiresReview = cols[9];
    const canContributeToDecline = cols[10];
    const dedupeKey = cols[11];
    const narrativeKey = cols[12];
    const notes = cols[13];
    const status = cols[14];
    const displayLabel = cols[15];

    if (!provider || provider !== expectedProvider) return;
    if (!sourceCode) return;

    map[sourceCode] = {
      provider,
      sourceType,
      sourceCode,
      sourceDescription,
      canonicalConcept,
      conceptGroup,
      signalClass,
      severity: normalizeSeverity(severity),
      direction: normalizeDirection(direction),
      requiresReview: String(requiresReview).toUpperCase() === "TRUE",
      canContributeToDecline: String(canContributeToDecline).toUpperCase() === "TRUE",
      dedupeKey,
      narrativeKey,
      notes,
      status,
      displayLabel
    };
  });

  return map;
}

function run() {
  const socureRaw = fs.readFileSync(SOCURE_FILE, "utf-8");
  const lexisRaw = fs.readFileSync(LEXIS_FILE, "utf-8");
  const idAnalyticsRaw = fs.readFileSync(ID_ANALYTICS_FILE, "utf-8");
  const middeskKybRaw = fs.readFileSync(MIDDESK_KYB_FILE, "utf-8");
  const middeskMccRaw = fs.readFileSync(MIDDESK_MCC_FILE, "utf-8");
  const middeskNaicsRaw = fs.readFileSync(MIDDESK_NAICS_FILE, "utf-8");
  const socureRows = parseCSV(socureRaw);
  const lexisRows = parseCSV(lexisRaw);
  const idAnalyticsRows = parseCSV(idAnalyticsRaw);
  const middeskKybRows = parseCSV(middeskKybRaw);
  const middeskMccRows = parseCSV(middeskMccRaw);
  const middeskNaicsRows = parseCSV(middeskNaicsRaw);
  const socureMappings = buildSocureMappings(socureRows);
  const lexisMappings = buildStandardMappings(lexisRows, "lexis_nexis_instant_id");
  const idAnalyticsMappings = buildStandardMappings(idAnalyticsRows, "id_analytics");
  const middeskKybMappings = buildStandardMappings(middeskKybRows, "middesk");
  const middeskMccMappings = buildStandardMappings(middeskMccRows, "middesk");
  const middeskNaicsMappings = buildStandardMappings(middeskNaicsRows, "middesk");

  const output = {
    socure: socureMappings,
    lexis_nexis_instant_id: lexisMappings,
    id_analytics: idAnalyticsMappings,
    middesk_kyb: middeskKybMappings,
    middesk_mcc: middeskMccMappings,
    middesk_naics: middeskNaicsMappings
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log("✅ provider-mappings.json generated");
}

run();
