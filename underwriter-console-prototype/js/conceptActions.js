// Canonical concept -> recommended action mapping
// This layer sits between normalized concepts and bucket-level fallback actions.

export const CONCEPT_ACTIONS = {
  // Identity
  identity_verified: ['proceed_with_monitoring'],
  identity_supporting: ['proceed_with_monitoring'],
  identity_not_verified: ['request_identity_documents', 'escalate_manual_review'],
  identity_mismatch: ['request_data_correction', 'escalate_manual_review'],
  identity_deceased: ['escalate_fraud_review'],
  identity_review_required: ['escalate_manual_review'],

  // Fraud / synthetic / velocity
  fraud_high_risk: ['request_selfie_id_liveness', 'escalate_fraud_review'],
  fraud_medium_risk: ['run_additional_verification', 'escalate_fraud_review'],
  fraud_supporting: ['proceed_with_monitoring'],
  synthetic_identity_high: ['request_selfie_id_liveness', 'escalate_fraud_review'],
  synthetic_identity_medium: ['run_additional_verification', 'escalate_fraud_review'],
  synthetic_identity_review: ['request_selfie_id_liveness', 'escalate_fraud_review'],
  synthetic_supporting: ['proceed_with_monitoring'],
  velocity_risk: ['run_additional_verification', 'escalate_fraud_review'],

  // Contactability
  email_risky: ['request_email_confirmation', 'escalate_manual_review'],
  phone_risky: ['request_text_otp', 'escalate_manual_review'],
  address_risky: ['request_address_proof', 'escalate_manual_review'],
  contact_mismatch: ['request_data_correction', 'escalate_manual_review'],
  email_supporting: ['proceed_with_monitoring'],
  phone_supporting: ['proceed_with_monitoring'],
  address_supporting: ['proceed_with_monitoring'],
  phone_invalid: ['request_data_correction', 'request_text_otp'],
  address_invalid: ['request_data_correction', 'request_address_proof'],

  // Bank / payout ownership
  bank_valid: ['proceed_with_monitoring'],
  bank_supporting: ['proceed_with_monitoring'],
  bank_review: ['request_bank_connection_plaid', 'escalate_manual_review'],
  bank_invalid: ['request_bank_connection_plaid', 'request_bank_documents'],
  bank_unknown: ['request_bank_connection_plaid', 'escalate_manual_review'],
  bank_ownership_match: ['proceed_with_monitoring'],
  bank_ownership_mismatch: ['request_bank_connection_plaid', 'request_bank_documents'],
  bank_ownership_unknown: ['request_bank_connection_plaid', 'escalate_manual_review'],

  // Compliance
  pep_match: ['escalate_compliance_review'],
  sanctions_match: ['escalate_compliance_review'],
  adverse_media: ['escalate_compliance_review'],
  watchlist_match: ['escalate_compliance_review'],
  compliance_supporting: ['proceed_with_monitoring'],

  // Business
  business_verified: ['proceed_with_monitoring'],
  business_not_found: ['request_business_documents', 'order_secretary_of_state_documents'],
  business_mismatch: ['request_data_correction', 'escalate_business_review'],
  business_inactive: ['request_business_documents', 'escalate_business_review'],
  high_risk_industry: ['escalate_business_review'],

  // Credit / legal
  credit_approved: ['proceed_with_monitoring'],
  credit_denied: ['escalate_manual_review'],
  credit_review_required: ['escalate_manual_review'],
  bankruptcy_detected: ['escalate_business_review'],
  liens_detected: ['escalate_business_review'],
  litigation_detected: ['escalate_business_review'],

  // Working concepts currently used in mappings / live system but not fully normalized in concept_dictionary yet
  identity_name_match_fuzzy: ['proceed_with_monitoring'],
  identity_name_match_exact: ['proceed_with_monitoring'],
  compliance_watchlist_match: ['escalate_compliance_review'],
  identity_ssn_not_verified: ['request_identity_documents', 'escalate_manual_review'],
  identity_name_not_found: ['request_identity_documents', 'escalate_manual_review'],
  address_unresolvable: ['request_address_proof', 'escalate_manual_review'],
  identity_unverifiable: ['request_identity_documents', 'escalate_manual_review'],
  identity_strong_positive_signal: ['proceed_with_monitoring'],
  contactability_email_risk: ['request_email_confirmation', 'escalate_manual_review'],
  contactability_email_anomaly: ['request_email_confirmation', 'run_additional_verification'],
  fraud_identity_frequency_anomaly: ['run_additional_verification', 'escalate_fraud_review'],
  contactability_phone_risk: ['request_text_otp', 'escalate_manual_review'],

  // Alloy-only informational concepts currently present in mappings
  bank_info_provided: ['proceed_with_monitoring'],
  business_info_provided: ['proceed_with_monitoring'],
  identity_info_provided: ['proceed_with_monitoring'],

  // Middesk KYB restricted / high-risk business classes
  business_adult_content: ['escalate_business_review'],
  business_aggregation: ['escalate_business_review'],
  business_cannabis: ['escalate_business_review'],
  business_counterfeit_goods: ['escalate_business_review'],
  business_drug_of_concern: ['escalate_business_review'],
  business_drug_paraphernalia: ['escalate_business_review'],
  business_gambling: ['escalate_business_review'],
  business_high_risk_marketing: ['escalate_business_review'],
  business_gift_card: ['escalate_business_review'],
  business_financial_services: ['escalate_business_review'],
  business_legal_services: ['escalate_business_review'],
  business_mlm: ['escalate_business_review'],
  business_pseudo_pharma: ['escalate_business_review'],
  business_regulated_or_illegal: ['escalate_business_review'],
  business_social_media_manipulation: ['escalate_business_review'],
  business_virtual_currency: ['escalate_business_review']
};

export function getConceptActions(concept) {
  return CONCEPT_ACTIONS[String(concept || '').trim()] || [];
}

export function hasConceptActions(concept) {
  return getConceptActions(concept).length > 0;
}