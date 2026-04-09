export const DISPLAY_BUCKET_ORDER = [
  "compliance",
  "identity_conflicts",
  "contactability_risk",
  "fraud_velocity",
  "business_validation",
  "positive_verification",
  "other_signals"
];

export const DISPLAY_BUCKET_META = {
  compliance: {
    label: "Compliance",
    description: "Watchlist, sanctions, PEP, adverse media, or related compliance evidence."
  },
  identity_conflicts: {
    label: "Identity Conflicts",
    description: "Identity mismatches, conflicting attributes, invalid identity data, or unresolved identity evidence."
  },
  contactability_risk: {
    label: "Contactability Risk",
    description: "Email, phone, and address risk signals that may indicate weak or inconsistent contactability."
  },
  fraud_velocity: {
    label: "Fraud / Velocity",
    description: "Fraud indicators, synthetic identity patterns, unusual velocity, or related high-risk behavior."
  },
  business_validation: {
    label: "Business Validation",
    description: "Business registration, website, litigation, classification, and related KYB evidence."
  },
  positive_verification: {
    label: "Positive Verification",
    description: "Low-risk positive evidence supporting identity, contactability, or business verification."
  },
  other_signals: {
    label: "Other Signals",
    description: "Signals that do not yet fit a more specific underwriting display bucket."
  }
};

const COMPLIANCE_TERMS = ["watchlist", "sanctions", "pep", "adverse_media", "adverse media", "compliance"];
const IDENTITY_CONFLICT_CONCEPTS = [
  "identity_unverifiable",
  "identity_name_not_found",
  "identity_name_mismatch",
  "identity_dob_partial_match",
  "identity_dob_mismatch",
  "identity_first_name_mismatch",
  "identity_last_name_mismatch",
  "identity_multiple_identities",
  "identity_multiple_last_names",
  "identity_multiple_dobs",
  "identity_issued_before_dob",
  "identity_ssn_name_address_association",
  "identity_ssn_not_verified",
  "identity_not_found",
  "identity_conflict",
  "identity_partial_match",
  "address_unresolvable",
  "name_unresolvable"
];
const FRAUD_CONCEPTS = [
  "fraud_synthetic_identity_risk",
  "fraud_identity_frequency_anomaly",
  "fraud_velocity_high",
  "identity_risky"
];
const FRAUD_TERMS = [
  "fraud",
  "synthetic",
  "velocity",
  "ssn_velocity",
  "identity_velocity",
  "frequency_anomaly",
  "frequency anomaly",
  "suspicious_frequency",
  "suspicious frequency",
  "unusually_high",
  "unusually high",
  "consortium",
  "identity_frequency",
  "identity frequency",
  "risky"
];
const CONTACTABILITY_TERMS = [
  "email_risk",
  "email risk",
  "phone_risk",
  "phone risk",
  "address_risk",
  "address risk",
  "contactability",
  "deliverability",
  "email_age_risk",
  "email age risk",
  "phone_tenure_risk",
  "phone tenure risk",
  "email_handle_risk",
  "email handle risk",
  "phone_resolve_risk",
  "phone resolve risk",
  "address_resolve_risk",
  "address resolve risk",
  "email_anomaly",
  "email anomaly",
  "address_unresolvable",
  "address unresolvable",
  "email_handle",
  "email handle",
  "phone_handle",
  "phone handle"
];
const IDENTITY_CONFLICT_TERMS = [
  "mismatch",
  "invalid",
  "unverifiable",
  "not_found",
  "not found",
  "partial_match",
  "partial match",
  "not_verified",
  "not verified",
  "cannot_resolve",
  "cannot resolve",
  "unable_to_verify",
  "unable to verify",
  "issued_before_dob",
  "issued before dob",
  "different_name",
  "different name",
  "different_address",
  "different address",
  "multiple_dobs",
  "multiple dobs",
  "multiple_last_names",
  "multiple last names",
  "multiple_identities",
  "multiple identities",
  "deceased",
  "identity_conflict",
  "identity conflict"
];
const BUSINESS_TERMS = [
  "business_registration",
  "business registration",
  "website",
  "litigation",
  "tin",
  "naics",
  "mcc",
  "kyb",
  "business_verification",
  "business verification"
];

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function matchesKnownConcept(concept, concepts) {
  return concepts.includes(concept);
}

function isPositiveVerification(signal) {
  return (
    signal?.direction === "positive" &&
    signal?.severity === "low" &&
    !signal?.requiresReview &&
    !signal?.canContributeToDecline
  );
}

export function getSignalDisplayBucket(signal) {
  const canonicalConcept = normalizeText(signal?.canonicalConcept);
  const conceptGroup = normalizeText(signal?.conceptGroup);
  const signalClass = normalizeText(signal?.signalClass);
  const combinedText = [canonicalConcept, conceptGroup, signalClass].filter(Boolean).join(" ");

  if (includesAny(combinedText, COMPLIANCE_TERMS)) {
    return "compliance";
  }

  if (matchesKnownConcept(canonicalConcept, FRAUD_CONCEPTS) || includesAny(canonicalConcept, FRAUD_TERMS)) {
    return "fraud_velocity";
  }

  if (matchesKnownConcept(canonicalConcept, IDENTITY_CONFLICT_CONCEPTS)) {
    return "identity_conflicts";
  }

  if (includesAny(combinedText, FRAUD_TERMS)) {
    return "fraud_velocity";
  }

  if (includesAny(combinedText, CONTACTABILITY_TERMS)) {
    return "contactability_risk";
  }

  if (includesAny(combinedText, IDENTITY_CONFLICT_TERMS)) {
    return "identity_conflicts";
  }

  if (canonicalConcept.startsWith("identity_")) {
    return "identity_conflicts";
  }

  if (canonicalConcept.startsWith("fraud_")) {
    return "fraud_velocity";
  }

  if (conceptGroup === "business" || includesAny(combinedText, BUSINESS_TERMS)) {
    return "business_validation";
  }

  if (isPositiveVerification(signal)) {
    return "positive_verification";
  }

  return "other_signals";
}
