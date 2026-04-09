const GROUP_NARRATIVES = {
  identity: "Multiple identity inconsistencies were detected, including mismatched or unresolved identity attributes. These signals may require manual verification.",
  fraud: "Signals consistent with fraud or synthetic identity behavior were detected. These patterns may indicate elevated risk and should be reviewed carefully.",
  compliance: "Compliance-related signals such as watchlist or sanctions matches were identified. These require review before proceeding.",
  business: "Business validation signals indicate potential issues with registration, classification, or operational legitimacy.",
  workflow: "Workflow-level signals provide supporting context from the decision process.",
  unknown: "Additional signals were returned that do not yet map to a primary risk category."
};

const DISPLAY_BUCKET_NARRATIVES = {
  compliance: GROUP_NARRATIVES.compliance,
  identity_conflicts: GROUP_NARRATIVES.identity,
  contactability_risk: "Contactability-related risk signals suggest the applicant's email, phone, or address details may be weak, inconsistent, or difficult to verify.",
  fraud_velocity: GROUP_NARRATIVES.fraud,
  business_validation: GROUP_NARRATIVES.business,
  positive_verification: "Positive verification signals support the applicant's identity, contactability, or business details. These signals help reinforce lower-risk elements of the review.",
  other_signals: GROUP_NARRATIVES.unknown
};

export function getGroupNarrative(groupKey, signals) {
  void signals;

  return (
    DISPLAY_BUCKET_NARRATIVES[groupKey] ||
    GROUP_NARRATIVES[groupKey] ||
    GROUP_NARRATIVES.unknown
  );
}
