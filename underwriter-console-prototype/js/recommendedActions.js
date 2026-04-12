// Central source of truth for all recommended actions

export const ACTION_PRIORITY = [
  'request_selfie_id_liveness',
  'request_text_otp',
  'request_bank_connection_plaid',
  'request_email_confirmation',

  'request_identity_documents',
  'request_business_documents',
  'request_bank_documents',
  'request_address_proof',
  'request_data_correction',

  'escalate_fraud_review',
  'escalate_compliance_review',
  'escalate_business_review',
  'escalate_manual_review',

  'order_secretary_of_state_documents',
  'run_additional_verification',

  'proceed_with_monitoring'
];

export const ACTION_LIBRARY = {
  // 🔹 Step-up verification (Applicant)
  request_selfie_id_liveness: {
    key: 'request_selfie_id_liveness',
    label: 'Request selfie + ID verification',
    shortWhy: 'Confirm identity authenticity using liveness and document verification.',
    audience: 'applicant'
  },

  request_text_otp: {
    key: 'request_text_otp',
    label: 'Send 6-digit authentication code',
    shortWhy: 'Verify that the applicant controls the provided phone number.',
    audience: 'applicant'
  },

  request_bank_connection_plaid: {
    key: 'request_bank_connection_plaid',
    label: 'Connect bank account via Plaid',
    shortWhy: 'Validate ownership of the payout account and strengthen identity confidence.',
    audience: 'applicant'
  },

  request_email_confirmation: {
    key: 'request_email_confirmation',
    label: 'Request email confirmation',
    shortWhy: 'Confirm ownership and validity of the email address.',
    audience: 'applicant'
  },

  // 🔹 Supporting evidence (Applicant)
  request_identity_documents: {
    key: 'request_identity_documents',
    label: 'Request identity documents',
    shortWhy: 'Collect additional documentation to resolve identity inconsistencies.',
    audience: 'applicant'
  },

  request_business_documents: {
    key: 'request_business_documents',
    label: 'Request business documents',
    shortWhy: 'Verify business legitimacy using formation or registration documents.',
    audience: 'applicant'
  },

  request_bank_documents: {
    key: 'request_bank_documents',
    label: 'Request bank documentation',
    shortWhy: 'Confirm account ownership using statements or supporting documents.',
    audience: 'applicant'
  },

  request_address_proof: {
    key: 'request_address_proof',
    label: 'Request proof of address',
    shortWhy: 'Validate residency using supporting address documentation.',
    audience: 'applicant'
  },

  request_data_correction: {
    key: 'request_data_correction',
    label: 'Request data correction',
    shortWhy: 'Resolve inconsistencies by allowing the applicant to correct their information.',
    audience: 'applicant'
  },

  // 🔹 Internal review (Underwriter)
  escalate_manual_review: {
    key: 'escalate_manual_review',
    label: 'Escalate to manual review',
    shortWhy: 'Route the case to an underwriter for further evaluation.',
    audience: 'underwriter'
  },

  escalate_fraud_review: {
    key: 'escalate_fraud_review',
    label: 'Escalate fraud review',
    shortWhy: 'Signals suggest elevated fraud risk requiring specialist review.',
    audience: 'underwriter'
  },

  escalate_compliance_review: {
    key: 'escalate_compliance_review',
    label: 'Escalate compliance review',
    shortWhy: 'Compliance signals require review before proceeding.',
    audience: 'underwriter'
  },

  escalate_business_review: {
    key: 'escalate_business_review',
    label: 'Escalate business review',
    shortWhy: 'Business legitimacy signals require manual validation.',
    audience: 'underwriter'
  },

  // 🔹 Internal enrichment (System)
  order_secretary_of_state_documents: {
    key: 'order_secretary_of_state_documents',
    label: 'Order state registration documents',
    shortWhy: 'Retrieve official business records from the Secretary of State.',
    audience: 'system'
  },

  run_additional_verification: {
    key: 'run_additional_verification',
    label: 'Run additional verification checks',
    shortWhy: 'Trigger additional data providers or verification workflows.',
    audience: 'system'
  },

  // 🔹 Resolution
  proceed_with_monitoring: {
    key: 'proceed_with_monitoring',
    label: 'Proceed with monitoring',
    shortWhy: 'No immediate action required; monitor for future signals.',
    audience: 'underwriter'
  }
};

// Helpers
export function getActionLibrary() {
  return ACTION_LIBRARY;
}

export function getActionByKey(actionKey) {
  return ACTION_LIBRARY[actionKey] || null;
}

export function sortActions(actions = []) {
  return [...actions].sort((a, b) => {
    const aIdx = ACTION_PRIORITY.indexOf(a.key);
    const bIdx = ACTION_PRIORITY.indexOf(b.key);

    const aRank = aIdx === -1 ? 999 : aIdx;
    const bRank = bIdx === -1 ? 999 : bIdx;

    return aRank - bRank;
  });
}