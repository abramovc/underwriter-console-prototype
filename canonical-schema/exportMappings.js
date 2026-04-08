const fs = require("fs");
const path = require("path");

const SOCURE_FILE = path.join(__dirname, "mappings/provider_mapping_socure.csv");
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

function run() {
  const socureRaw = fs.readFileSync(SOCURE_FILE, "utf-8");
  const rows = parseCSV(socureRaw);
  const socureMappings = buildSocureMappings(rows);

  const output = {
    socure: socureMappings
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log("✅ provider-mappings.json generated");
}

run();