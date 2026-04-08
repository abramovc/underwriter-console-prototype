import { normalizeSocure } from "./normalizeSocure";

// Simulated Socure API response
const socureResponse = [
  {
    code: "I1002",
    description: "National ID not provided"
  },
  {
    code: "R1001",
    description: "Found at least 2 distinct DOBs"
  },
  {
    code: "UNKNOWN_CODE",
    description: "Something new we haven't mapped"
  }
];

// Simulated mapping rows (normally from CSV)
const mappingRows = [
  {
    provider: "socure",
    source_type: "reason_code",
    source_code: "I1002",
    source_description: "National ID not provided",
    canonical_concept: "identity_ssn_missing",
    concept_group: "identity",
    signal_class: "identity",
    severity: "low",
    direction: "negative",
    requires_review: "false",
    can_contribute_to_decline: "false",
    dedupe_key: "I1002",
    status: "active"
  },
  {
    provider: "socure",
    source_type: "reason_code",
    source_code: "R1001",
    source_description: "Multiple DOBs found",
    canonical_concept: "identity_conflict",
    concept_group: "identity",
    signal_class: "identity",
    severity: "high",
    direction: "negative",
    requires_review: "true",
    can_contribute_to_decline: "true",
    dedupe_key: "R1001",
    status: "active"
  }
];

// Run normalization
const signals = normalizeSocure(socureResponse, mappingRows, {
  product: "accountIntelligence",
  timestamp: new Date().toISOString()
});

console.log("Normalized Signals:");
console.log(JSON.stringify(signals, null, 2));