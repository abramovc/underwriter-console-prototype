// GROUP-LEVEL NARRATIVES (existing behavior)
const GROUP_NARRATIVES = {
  identity:
    "Multiple identity inconsistencies were detected, including mismatched or unresolved identity attributes. These signals may require manual verification.",
  fraud:
    "Signals consistent with fraud or synthetic identity behavior were detected. These patterns may indicate elevated risk and should be reviewed carefully.",
  compliance:
    "Compliance-related signals such as watchlist or sanctions matches were identified. These require review before proceeding.",
  business:
    "Business validation signals indicate potential issues with registration, classification, or operational legitimacy.",
  workflow:
    "Workflow-level signals provide supporting context from the decision process.",
  unknown:
    "Additional signals were returned that do not yet map to a primary risk category."
};

const DISPLAY_BUCKET_NARRATIVES = {
  compliance: GROUP_NARRATIVES.compliance,
  identity_conflicts: GROUP_NARRATIVES.identity,
  contactability_risk:
    "Contactability-related risk signals suggest the applicant's email, phone, or address details may be weak, inconsistent, or difficult to verify.",
  fraud_velocity: GROUP_NARRATIVES.fraud,
  business_validation: GROUP_NARRATIVES.business,
  positive_verification:
    "Positive verification signals support the applicant's identity, contactability, or business details. These signals help reinforce lower-risk elements of the review.",
  other_signals: GROUP_NARRATIVES.unknown
};

// 🔥 NEW: SIGNAL-LEVEL NARRATIVES (this is the real upgrade)
const SIGNAL_NARRATIVES = {
  fraud_synthetic_identity_risk:
    "This identity shows patterns commonly associated with synthetic identity fraud or fabricated identity behavior.",

  identity_conflict:
    "Identity details conflict across sources, which may indicate data mismatch, identity misuse, or the need for manual verification.",

  identity_unverifiable:
    "Core identity details could not be confidently verified, reducing confidence that the applicant can be tied to a single confirmed identity.",

  ssn_invalid:
    "The SSN appears invalid or inconsistent with expected identity records, which is a strong identity risk signal.",

  ssn_issued_before_dob:
    "The SSN appears older than expected based on the applicant's date of birth, which may indicate an identity inconsistency.",

  last_name_ssn_mismatch:
    "The last name does not align with SSN records, suggesting a possible identity mismatch.",

  identity_name_mismatch:
    "The applicant's name does not align with third-party identity records, weakening confidence in the identity profile.",

  address_unresolvable:
    "The provided address could not be resolved to the applicant, reducing confidence in contactability and residency validation.",

  identity_address_mismatch:
    "The address does not align with identity records, which may indicate incorrect or outdated applicant information.",

  phone_risky:
    "The phone number could not be reliably tied to the applicant, weakening confidence in contactability.",

  email_risky:
    "The email appears high risk or inconsistent with the identity profile and may require additional review.",

  contactability_risk:
    "Contact details could not be strongly verified, making it harder to reliably reach or validate the applicant.",

  fraud_velocity:
    "Velocity patterns suggest repeated or unusual identity usage, which may indicate elevated fraud risk.",

  fraud_identity_frequency_anomaly:
    "This identity appears more frequently across records than expected, which can be a sign of synthetic identity behavior or repeated misuse.",

  deceased_indicator:
    "Records suggest this identity may be associated with a deceased individual, which is a severe fraud risk.",

  watchlist_match:
    "Watchlist-related signals were returned and should be reviewed before proceeding.",

  pep_match:
    "A politically exposed person match was returned and requires compliance review.",

  sanctions_match:
    "A sanctions-related signal was returned and requires compliance review before approval.",

  adverse_media:
    "Negative or adverse media signals were returned and may warrant additional review.",

  business_unverifiable:
    "The business could not be confidently verified, reducing confidence in its legitimacy.",

  business_name_mismatch:
    "The business name does not align across records, which may indicate a mismatch or outdated information.",

  business_address_mismatch:
    "The business address does not align across records and may require additional validation.",

  naics_mismatch:
    "The business classification appears inconsistent with expected records and should be reviewed.",

  mcc_risky:
    "The business category may fall into a higher-risk segment and should be reviewed in context.",

  // Positive signals
  ssn_match:
    "Third-party records support that the SSN aligns with the applicant.",

  dob_match:
    "Third-party records support that the date of birth aligns with the applicant.",

  name_match:
    "Third-party records support that the name aligns with the identity profile.",

  address_match:
    "Third-party records support that the address aligns with the applicant.",

  phone_match:
    "Third-party records support that the phone number aligns with the applicant.",

  email_match:
    "Third-party records support that the email aligns with the applicant.",

  bank_valid:
    "Bank-related data returned a positive verification signal.",

  business_verified:
    "The business appears valid and registered based on third-party data.",

  kyc_verified:
    "The identity profile received positive verification signals, supporting a lower-risk assessment."
};

// Utility
function toTitleCase(value) {
  return String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Existing function (unchanged)
export function getGroupNarrative(groupKey, signals) {
  void signals;

  return (
    DISPLAY_BUCKET_NARRATIVES[groupKey] ||
    GROUP_NARRATIVES[groupKey] ||
    GROUP_NARRATIVES.unknown
  );
}

// 🔥 NEW FUNCTION
export function getSignalNarrative(signal) {
  const canonicalConcept =
    signal?.canonicalConcept || signal?.canonical_concept || "";

  const narrativeKey =
    signal?.narrativeKey || signal?.narrative_key || "";

  if (narrativeKey && SIGNAL_NARRATIVES[narrativeKey]) {
    return SIGNAL_NARRATIVES[narrativeKey];
  }

  if (canonicalConcept && SIGNAL_NARRATIVES[canonicalConcept]) {
    return SIGNAL_NARRATIVES[canonicalConcept];
  }

  const fallback =
    signal?.sourceDescription ||
    signal?.fullLabel ||
    toTitleCase(canonicalConcept || "signal");

  return `${fallback} was returned by the provider and should be reviewed in context with the rest of the application.`;
}