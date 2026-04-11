const BUCKET_ORDER = [
  'identity_integrity',
  'contactability',
  'fraud_velocity',
  'compliance_screening',
  'business_legitimacy',
  'bank_ownership',
  'positive_verification',
  'other'
];

export const INSIGHT_BUCKETS = {
  identity_integrity: {
    key: 'identity_integrity',
    label: 'Identity Integrity',
    shortLabel: 'Identity',
    description:
      'Signals related to whether the applicant identity appears real, internally consistent, and attributable to a single person.',
    reviewQuestion:
      'Does this identity appear real, consistent, and attributable to the applicant?',
    recommendedActions: [
      'request_selfie_id',
      'request_manual_identity_review',
      'request_document_upload'
    ],
    conceptMatchers: [
      'identity',
      'identity_conflict',
      'identity_unverifiable',
      'identity_name_mismatch',
      'identity_address_mismatch',
      'identity_deceased',
      'identity_ssn_mismatch',
      'synthetic_identity',
      'fabricated_identity',
      'deceased',
      'dob',
      'ssn',
      'name',
      'address',
      'miskey',
      'not_verifiable',
      'verification_failed',
      'national id',
      'multiple identities',
      'issued before dob',
      'ssn invalid',
      'ssn likely invalid',
      'ssn issued before dob',
      'last name mismatch',
      'name mismatch',
      'address mismatch',
      'unverifiable'
    ],
    tagMatchers: [
      'ssn',
      'dob',
      'name match',
      'name warning',
      'address match',
      'address warning',
      'deceased',
      'synthetic',
      'miskey',
      'identity',
      'national id'
    ],
    codeMatchers: [
      /^r907$/i,
      /^r29\d$/i,
      /^r30\d$/i,
      /^r31\d$/i
    ]
  },

  contactability: {
    key: 'contactability',
    label: 'Contactability',
    shortLabel: 'Contactability',
    description:
      'Signals related to whether the applicant can be reliably reached and whether phone or email data appears trustworthy.',
    reviewQuestion:
      'Can we confidently reach this applicant through the provided contact details?',
    recommendedActions: [
      'send_otp',
      'request_email_confirmation',
      'request_manual_contact_review'
    ],
    conceptMatchers: [
      'contactability',
      'phone',
      'email',
      'email_risky',
      'phone_risky',
      'phone_owner',
      'email_owner',
      'voip',
      'disposable_email',
      'email_entropy',
      'scrambled_email',
      'contact details',
      'contact detail',
      'email first seen',
      'email has not been seen',
      'email username',
      'email handle',
      'phone number cannot be resolved'
    ],
    tagMatchers: [
      'phone',
      'email',
      'voip',
      'contact',
      'sms',
      'otp'
    ],
    codeMatchers: [
      /^r52\d$/i,
      /^r53\d$/i,
      /^r54\d$/i,
      /^r55\d$/i,
      /^r56\d$/i,
      /^r57\d$/i,
      /^r58\d$/i,
      /^r60\d$/i,
      /^r61\d$/i,
      /^r62\d$/i,
      /^r63\d$/i,
      /^r64\d$/i,
      /^r65\d$/i,
      /^r66\d$/i,
      /^r67\d$/i
    ]
  },

  fraud_velocity: {
    key: 'fraud_velocity',
    label: 'Fraud / Velocity',
    shortLabel: 'Fraud',
    description:
      'Signals related to suspected fraud patterns, rapid reuse of identity elements, or behavior that suggests elevated abuse risk.',
    reviewQuestion:
      'Do these patterns suggest fraud, repeated attempts, or suspicious reuse of identity attributes?',
    recommendedActions: [
      'request_selfie_id',
      'send_otp',
      'escalate_fraud_review'
    ],
    conceptMatchers: [
      'fraud',
      'velocity',
      'high_risk',
      'identity_attempts',
      'synthetic',
      'device_risk',
      'behavior_risk',
      'risk',
      'adverse_pattern',
      'fraud_review',
      'fraud_denied',
      'fraud_risk_high',
      'fraud_risk_medium',
      'ssn_velocity_warning',
      'velocity_warning',
      'frequency anomaly',
      'identity frequency',
      'repeated misuse',
      'repeated attempts',
      'reuse of identity',
      'synthetic fraud',
      'fabricated identity'
    ],
    tagMatchers: [
      'fraud',
      'velocity',
      'high fraud',
      'medium fraud',
      'fraud review',
      'denied fraud',
      'device',
      'synthetic',
      'high risk'
    ],
    codeMatchers: [
      /^r2\d\d$/i
    ]
  },

  compliance_screening: {
    key: 'compliance_screening',
    label: 'Compliance Screening',
    shortLabel: 'Compliance',
    description:
      'Signals related to sanctions, watchlist, PEP, adverse media, or other compliance-driven review requirements.',
    reviewQuestion:
      'Is there any sanctions, watchlist, PEP, or adverse media concern that requires escalation?',
    recommendedActions: [
      'escalate_compliance_review',
      'request_manual_compliance_review'
    ],
    conceptMatchers: [
      'watchlist',
      'pep',
      'sanctions',
      'adverse_media',
      'ofac',
      'compliance',
      'kyc_review',
      'sdn',
      'adverse watchlist',
      'watchlist review',
      'watchlist warning'
    ],
    tagMatchers: [
      'watchlist',
      'pep',
      'adverse media',
      'compliance',
      'ofac',
      'sanctions'
    ],
    codeMatchers: [
      /^r18\d$/i
    ]
  },

  business_legitimacy: {
    key: 'business_legitimacy',
    label: 'Business Legitimacy',
    shortLabel: 'Business',
    description:
      'Signals related to whether the business appears real, active, and consistent across formation, registration, and business profile data.',
    reviewQuestion:
      'Does the business appear legitimate, active, and consistent across business records?',
    recommendedActions: [
      'request_business_documents',
      'request_manual_business_review',
      'escalate_business_review'
    ],
    conceptMatchers: [
      'business',
      'kyb',
      'legal_entity',
      'entity',
      'registration',
      'ein',
      'formation',
      'incorporation',
      'secretary_of_state',
      'merchant',
      'website',
      'industry',
      'naics',
      'mcc',
      'tin',
      'business address',
      'business phone',
      'business classification',
      'litigation'
    ],
    tagMatchers: [
      'kyb',
      'business',
      'merchant',
      'entity',
      'website',
      'naics',
      'mcc'
    ],
    codeMatchers: []
  },

  bank_ownership: {
    key: 'bank_ownership',
    label: 'Bank Ownership / Payout Control',
    shortLabel: 'Bank',
    description:
      'Signals related to whether the linked bank account appears owned by or aligned with the applicant or business.',
    reviewQuestion:
      'Do we trust that the payout account belongs to and is controlled by the applicant or business?',
    recommendedActions: [
      'request_plaid',
      'request_bank_documentation',
      'request_manual_bank_review'
    ],
    conceptMatchers: [
      'bank',
      'bank_account',
      'bank_valid',
      'bank_invalid',
      'ownership',
      'account_owner',
      'plaid',
      'microdeposit',
      'payout',
      'ach'
    ],
    tagMatchers: [
      'bank',
      'plaid',
      'ownership',
      'payout'
    ],
    codeMatchers: []
  },

  positive_verification: {
    key: 'positive_verification',
    label: 'Positive Verification',
    shortLabel: 'Positive',
    description:
      'Signals that strengthen confidence in the application and may offset weaker review triggers.',
    reviewQuestion:
      'What evidence increases confidence that this application is legitimate?',
    recommendedActions: [],
    conceptMatchers: [
      'ssn_match',
      'dob_match',
      'name_match',
      'address_match',
      'phone_match',
      'email_match',
      'ssn_verified',
      'dob_verified',
      'name_verified',
      'address_verified',
      'kyc_approved',
      'kyc_verified',
      'bank_valid',
      'business_verified',
      'verified',
      'validated',
      'approved',
      'clear'
    ],
    tagMatchers: [
      'approved',
      'verified',
      'clear'
    ],
    codeMatchers: [
      /^i\d\d\d$/i
    ]
  },

  other: {
    key: 'other',
    label: 'Other',
    shortLabel: 'Other',
    description:
      'Signals that were not confidently mapped to a canonical underwriting bucket.',
    reviewQuestion:
      'Does this signal matter enough to reclassify or tune the mapping rules?',
    recommendedActions: []
  }
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactTextParts(parts) {
  return normalizeText(
    parts
      .filter(Boolean)
      .join(' ')
  );
}

function getSignalSearchText(signal = {}) {
  return compactTextParts([
    signal.provider,
    signal.service,
    signal.tag,
    signal.code,
    signal.canonicalConcept,
    signal.label,
    signal.fullLabel,
    signal.reason,
    signal.description,
    signal.summary,
    signal.rawText
  ]);
}

function matchesText(searchText, matcher) {
  if (!matcher) return false;
  return searchText.includes(normalizeText(matcher));
}

function matchesCode(code, regex) {
  if (!code || !regex) return false;
  return regex.test(String(code).trim());
}

function isExplicitlyNegative(signal = {}) {
  const disposition = normalizeText(signal.disposition);
  const searchText = getSignalSearchText(signal);

  if (disposition === 'negative') return true;

  const negativeTerms = [
    'watchlist',
    'ofac',
    'sanctions',
    'pep',
    'adverse media',
    'fraud',
    'velocity',
    'deceased',
    'synthetic',
    'invalid',
    'mismatch',
    'warning',
    'review',
    'denied',
    'risk'
  ];

  return negativeTerms.some((term) => searchText.includes(term));
}

function looksPositive(signal = {}) {
  const disposition = normalizeText(signal.disposition);
  const concept = normalizeText(signal.canonicalConcept);
  const searchText = getSignalSearchText(signal);

  // 🔥 HARD BLOCK (never positive)
  const blockedPositiveTerms = [
    'deceased',
    'watchlist',
    'ofac',
    'sanctions',
    'pep',
    'adverse media',
    'fraud',
    'velocity',
    'warning',
    'review',
    'denied',
    'risk'
  ];

  if (blockedPositiveTerms.some(term => searchText.includes(term))) {
    return false;
  }

  // Explicit negative always wins
  if (disposition === 'negative') return false;

  // Explicit positive is OK
  if (disposition === 'positive') return true;

  // Strong positive concept matches only
  const positiveConceptTerms = [
    'ssn match',
    'dob match',
    'name match',
    'address match',
    'phone match',
    'email match',
    'ssn verified',
    'dob verified',
    'name verified',
    'address verified',
    'kyc approved',
    'kyc verified',
    'bank valid',
    'business verified'
  ];

  if (positiveConceptTerms.some(term => concept.includes(term))) return true;
  if (positiveConceptTerms.some(term => searchText.includes(term))) return true;

  return false;
}

function scoreBucket(signal, bucket) {
  if (!bucket) return 0;

  const searchText = getSignalSearchText(signal);
  const code = String(signal.code || '').trim();
  let score = 0;

  for (const matcher of bucket.conceptMatchers || []) {
    if (matchesText(searchText, matcher)) score += 3;
  }

  for (const matcher of bucket.tagMatchers || []) {
    if (matchesText(searchText, matcher)) score += 2;
  }

  for (const regex of bucket.codeMatchers || []) {
    if (matchesCode(code, regex)) score += 4;
  }

  return score;
}

function applyBucketOverrides(signal = {}) {
  const searchText = getSignalSearchText(signal);

  if (
    searchText.includes('watchlist') ||
    searchText.includes('ofac') ||
    searchText.includes('sanctions') ||
    searchText.includes('pep') ||
    searchText.includes('adverse media') ||
    searchText.includes('sdn')
  ) {
    return INSIGHT_BUCKETS.compliance_screening;
  }

  if (
    searchText.includes('fraud') ||
    searchText.includes('velocity') ||
    searchText.includes('synthetic') ||
    searchText.includes('repeated attempts') ||
    searchText.includes('frequency anomaly')
  ) {
    return INSIGHT_BUCKETS.fraud_velocity;
  }

  if (
    searchText.includes('email') ||
    searchText.includes('phone') ||
    searchText.includes('voip') ||
    searchText.includes('contactability') ||
    searchText.includes('contact details')
  ) {
    return INSIGHT_BUCKETS.contactability;
  }

  if (
    searchText.includes('bank') ||
    searchText.includes('plaid') ||
    searchText.includes('ach') ||
    searchText.includes('payout')
  ) {
    return INSIGHT_BUCKETS.bank_ownership;
  }

  return null;
}

export function getInsightBucket(signal = {}) {
  if (looksPositive(signal)) {
    return INSIGHT_BUCKETS.positive_verification;
  }

  const overrideBucket = applyBucketOverrides(signal);
  if (overrideBucket) {
    return overrideBucket;
  }

  let bestBucket = INSIGHT_BUCKETS.other;
  let bestScore = 0;

  for (const bucketKey of BUCKET_ORDER) {
    if (bucketKey === 'positive_verification' || bucketKey === 'other') continue;

    const bucket = INSIGHT_BUCKETS[bucketKey];
    const score = scoreBucket(signal, bucket);

    if (score > bestScore) {
      bestScore = score;
      bestBucket = bucket;
    }
  }

  return bestScore > 0 ? bestBucket : INSIGHT_BUCKETS.other;
}

export function attachInsightBucket(signal = {}) {
  const bucket = getInsightBucket(signal);

  return {
    ...signal,
    insightBucket: bucket.key,
    insightBucketLabel: bucket.label,
    insightBucketShortLabel: bucket.shortLabel
  };
}

export function bucketSignals(signals = []) {
  const buckets = BUCKET_ORDER.map((key) => ({
    ...INSIGHT_BUCKETS[key],
    signals: []
  }));

  const bucketMap = Object.fromEntries(
    buckets.map((bucket) => [bucket.key, bucket])
  );

  for (const rawSignal of signals) {
    const signal = attachInsightBucket(rawSignal);
    const bucket = bucketMap[signal.insightBucket] || bucketMap.other;
    bucket.signals.push(signal);
  }

  return buckets.filter((bucket) => bucket.signals.length > 0);
}

export function summarizeBucketCounts(signals = []) {
  const bucketed = bucketSignals(signals);

  return bucketed.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    shortLabel: bucket.shortLabel,
    count: bucket.signals.length,
    recommendedActions: bucket.recommendedActions || []
  }));
}

export function getBucketMeta(bucketKey) {
  return INSIGHT_BUCKETS[bucketKey] || INSIGHT_BUCKETS.other;
}