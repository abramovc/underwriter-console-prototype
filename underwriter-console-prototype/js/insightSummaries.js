import {
  bucketSignals,
  getBucketMeta
} from './insightBuckets.js';

const SEVERITY_ORDER = ['low', 'medium', 'high'];
const ACTION_PRIORITY = [
  'request_selfie_id',
  'send_otp',
  'request_plaid',
  'escalate_fraud_review',
  'escalate_compliance_review',
  'request_manual_identity_review',
  'request_manual_contact_review',
  'request_manual_business_review',
  'request_manual_bank_review',
  'request_document_upload',
  'request_business_documents',
  'request_bank_documentation',
  'request_email_confirmation'
];

const ACTION_LIBRARY = {
  request_selfie_id: {
    key: 'request_selfie_id',
    label: 'Request selfie + ID capture',
    shortWhy: 'Resolve identity uncertainty and confirm applicant authenticity.'
  },
  send_otp: {
    key: 'send_otp',
    label: 'Send 6-digit authentication code',
    shortWhy: 'Test whether the applicant controls the provided phone number.'
  },
  request_plaid: {
    key: 'request_plaid',
    label: 'Request bank connection via Plaid',
    shortWhy: 'Validate payout ownership and strengthen bank-account confidence.'
  },
  escalate_fraud_review: {
    key: 'escalate_fraud_review',
    label: 'Escalate fraud review',
    shortWhy: 'Patterns suggest elevated abuse risk that may require specialist review.'
  },
  escalate_compliance_review: {
    key: 'escalate_compliance_review',
    label: 'Escalate compliance review',
    shortWhy: 'Compliance-related screening signals may require a separate review path.'
  },
  request_manual_identity_review: {
    key: 'request_manual_identity_review',
    label: 'Send to manual identity review',
    shortWhy: 'Identity signals are mixed enough that manual review is warranted.'
  },
  request_manual_contact_review: {
    key: 'request_manual_contact_review',
    label: 'Review contact details manually',
    shortWhy: 'Phone or email confidence is weak and may need human judgment.'
  },
  request_manual_business_review: {
    key: 'request_manual_business_review',
    label: 'Review business details manually',
    shortWhy: 'Business legitimacy signals need human validation.'
  },
  request_manual_bank_review: {
    key: 'request_manual_bank_review',
    label: 'Review bank ownership manually',
    shortWhy: 'Ownership or payout-control signals are not strong enough to trust outright.'
  },
  request_document_upload: {
    key: 'request_document_upload',
    label: 'Request supporting identity documents',
    shortWhy: 'Additional documents can help resolve missing or conflicting identity evidence.'
  },
  request_business_documents: {
    key: 'request_business_documents',
    label: 'Request business formation documents',
    shortWhy: 'Business documentation can confirm legitimacy and formation details.'
  },
  request_bank_documentation: {
    key: 'request_bank_documentation',
    label: 'Request bank documentation',
    shortWhy: 'Bank statements or voided checks can help verify ownership.'
  },
  request_email_confirmation: {
    key: 'request_email_confirmation',
    label: 'Request email confirmation',
    shortWhy: 'Useful when email quality is weak but not enough to block the case by itself.'
  }
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function compactText(parts = []) {
  return normalizeText(parts.filter(Boolean).join(' '));
}

function getSignalLabel(signal = {}) {
  return (
    signal.fullLabel ||
    signal.label ||
    signal.reason ||
    signal.tag ||
    signal.canonicalConcept ||
    signal.code ||
    'Unnamed signal'
  );
}

function getSignalSeverity(signal = {}) {
  const raw = normalizeText(signal.severity);

  if (raw.includes('high')) return 'high';
  if (raw.includes('medium') || raw.includes('med')) return 'medium';
  if (raw.includes('low')) return 'low';

  if (normalizeText(signal.disposition).includes('positive')) return 'low';

  return 'medium';
}

function getDisposition(signal = {}) {
  const disposition = normalizeText(signal.disposition);

  if (disposition.includes('positive')) return 'positive';
  if (disposition.includes('negative')) return 'negative';
  return 'neutral';
}

function severityRank(severity) {
  const idx = SEVERITY_ORDER.indexOf(severity);
  return idx === -1 ? 1 : idx;
}

function signalWeight(signal = {}) {
  let weight = 0;

  const severity = getSignalSeverity(signal);
  const disposition = getDisposition(signal);
  const searchText = compactText([
    signal.canonicalConcept,
    signal.label,
    signal.fullLabel,
    signal.reason,
    signal.tag
  ]);

  if (severity === 'high') weight += 5;
  else if (severity === 'medium') weight += 3;
  else weight += 1;

  if (disposition === 'negative') weight += 2;
  if (disposition === 'positive') weight -= 1;

  if (searchText.includes('fraud')) weight += 2;
  if (searchText.includes('synthetic')) weight += 2;
  if (searchText.includes('deceased')) weight += 3;
  if (searchText.includes('watchlist')) weight += 3;
  if (searchText.includes('sanctions')) weight += 3;
  if (searchText.includes('velocity')) weight += 1;
  if (searchText.includes('verified')) weight -= 1;
  if (searchText.includes('match')) weight -= 1;

  return weight;
}

function buildDedupKey(signal = {}) {
  return compactText([
    signal.provider,
    signal.service,
    signal.canonicalConcept,
    signal.code,
    getSignalLabel(signal)
  ]);
}

function dedupeSignals(signals = []) {
  const byKey = new Map();

  for (const signal of signals) {
    const key = buildDedupKey(signal);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, signal);
      continue;
    }

    const existingWeight = signalWeight(existing);
    const candidateWeight = signalWeight(signal);

    if (candidateWeight > existingWeight) {
      byKey.set(key, signal);
    }
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const weightDiff = signalWeight(b) - signalWeight(a);
    if (weightDiff !== 0) return weightDiff;

    return getSignalLabel(a).localeCompare(getSignalLabel(b));
  });
}

function determineBucketSeverity(bucketKey, signals = []) {
  if (!signals.length) return 'low';

  if (bucketKey === 'positive_verification') return 'low';

  const severities = signals.map(getSignalSeverity);
  const highCount = severities.filter((s) => s === 'high').length;
  const mediumCount = severities.filter((s) => s === 'medium').length;
  const negativeCount = signals.filter(
    (signal) => getDisposition(signal) === 'negative'
  ).length;

  const totalWeight = signals.reduce((sum, signal) => sum + signalWeight(signal), 0);

  if (highCount >= 2) return 'high';
  if (highCount >= 1 && negativeCount >= 2) return 'high';
  if (totalWeight >= 12) return 'high';

  if (mediumCount >= 2) return 'medium';
  if (negativeCount >= 2) return 'medium';
  if (totalWeight >= 6) return 'medium';

  return 'low';
}

function summarizeTopSignals(signals = [], maxItems = 3) {
  return signals
    .slice(0, maxItems)
    .map((signal) => getSignalLabel(signal));
}

function buildIdentityNarrative(severity, signals) {
  const top = summarizeTopSignals(signals, 3);

  if (severity === 'high') {
    return `Identity signals suggest material inconsistency or elevated authenticity risk. Most relevant evidence: ${top.join('; ')}.`;
  }

  if (severity === 'medium') {
    return `Identity confidence is mixed. There are enough inconsistencies to justify review, but not necessarily enough on their own to force a final denial. Most relevant evidence: ${top.join('; ')}.`;
  }

  return `Identity evidence is mostly supportive, with limited inconsistency. Supporting signals: ${top.join('; ')}.`;
}

function buildContactabilityNarrative(severity, signals) {
  const top = summarizeTopSignals(signals, 3);

  if (severity === 'high') {
    return `Phone or email confidence appears weak enough to affect trust in the application. Most relevant evidence: ${top.join('; ')}.`;
  }

  if (severity === 'medium') {
    return `Contact details may be valid, but there are enough quality or ownership concerns to justify follow-up. Most relevant evidence: ${top.join('; ')}.`;
  }

  return `Contactability looks mostly stable, with only limited risk indicators. Supporting signals: ${top.join('; ')}.`;
}

function buildFraudNarrative(severity, signals) {
  const top = summarizeTopSignals(signals, 3);

  if (severity === 'high') {
    return `Fraud or velocity patterns appear elevated and should materially influence the review. Most relevant evidence: ${top.join('; ')}.`;
  }

  if (severity === 'medium') {
    return `Some fraud-related or repeat-attempt patterns are present, but may require corroboration before they drive the final decision. Most relevant evidence: ${top.join('; ')}.`;
  }

  return `Fraud and velocity signals are limited. Supporting signals: ${top.join('; ')}.`;
}

function buildComplianceNarrative(severity, signals) {
  const top = summarizeTopSignals(signals, 3);

  if (severity === 'high') {
    return `Compliance screening produced signals that likely require a dedicated review path. Most relevant evidence: ${top.join('; ')}.`;
  }

  if (severity === 'medium') {
    return `Compliance-related findings exist and should be reviewed before proceeding. Most relevant evidence: ${top.join('; ')}.`;
  }

  return `No major compliance blockers stand out from the currently surfaced signals. Supporting signals: ${top.join('; ')}.`;
}

function buildBusinessNarrative(severity, signals) {
  const top = summarizeTopSignals(signals, 3);

  if (severity === 'high') {
    return `Business legitimacy signals raise meaningful concern about whether the entity is active, real, or consistent across records. Most relevant evidence: ${top.join('; ')}.`;
  }

  if (severity === 'medium') {
    return `Business legitimacy is not fully settled and may need supporting documentation or manual review. Most relevant evidence: ${top.join('; ')}.`;
  }

  return `Business signals are mostly supportive, with limited issues surfaced. Supporting signals: ${top.join('; ')}.`;
}

function buildBankNarrative(severity, signals) {
  const top = summarizeTopSignals(signals, 3);

  if (severity === 'high') {
    return `Payout ownership or bank-account confidence appears weak enough to justify additional verification. Most relevant evidence: ${top.join('; ')}.`;
  }

  if (severity === 'medium') {
    return `Bank ownership confidence is mixed and may benefit from a direct verification step. Most relevant evidence: ${top.join('; ')}.`;
  }

  return `Bank ownership signals appear mostly supportive based on the currently surfaced evidence. Supporting signals: ${top.join('; ')}.`;
}

function buildPositiveNarrative(_severity, signals) {
  const top = summarizeTopSignals(signals, 4);
  return `Several signals increase confidence in the application and may offset weaker review triggers. Most relevant evidence: ${top.join('; ')}.`;
}

function buildOtherNarrative(severity, signals, bucketMeta) {
  const top = summarizeTopSignals(signals, 3);

  if (severity === 'high') {
    return `${bucketMeta.label} contains several unmapped but potentially material signals. Most relevant evidence: ${top.join('; ')}.`;
  }

  return `${bucketMeta.label} contains supporting signals that may warrant classification refinement over time. Most relevant evidence: ${top.join('; ')}.`;
}

function buildBucketNarrative(bucketKey, severity, signals, bucketMeta) {
  if (!signals.length) {
    return bucketMeta.description || '';
  }

  switch (bucketKey) {
    case 'identity_integrity':
      return buildIdentityNarrative(severity, signals);
    case 'contactability':
      return buildContactabilityNarrative(severity, signals);
    case 'fraud_velocity':
      return buildFraudNarrative(severity, signals);
    case 'compliance_screening':
      return buildComplianceNarrative(severity, signals);
    case 'business_legitimacy':
      return buildBusinessNarrative(severity, signals);
    case 'bank_ownership':
      return buildBankNarrative(severity, signals);
    case 'positive_verification':
      return buildPositiveNarrative(severity, signals);
    default:
      return buildOtherNarrative(severity, signals, bucketMeta);
  }
}

function recommendedActionsForBucket(bucketKey, severity, signalCount) {
  const bucketMeta = getBucketMeta(bucketKey);
  const baseActions = [...(bucketMeta.recommendedActions || [])];

  if (bucketKey === 'positive_verification') {
    return [];
  }

  if (severity === 'low' && signalCount <= 1) {
    return baseActions.slice(0, 1).map((key) => ACTION_LIBRARY[key]).filter(Boolean);
  }

  if (severity === 'medium') {
    return baseActions.slice(0, 2).map((key) => ACTION_LIBRARY[key]).filter(Boolean);
  }

  return baseActions.slice(0, 3).map((key) => ACTION_LIBRARY[key]).filter(Boolean);
}

function sortActions(actions = []) {
  return [...actions].sort((a, b) => {
    const aIdx = ACTION_PRIORITY.indexOf(a.key);
    const bIdx = ACTION_PRIORITY.indexOf(b.key);

    const aRank = aIdx === -1 ? 999 : aIdx;
    const bRank = bIdx === -1 ? 999 : bIdx;

    return aRank - bRank;
  });
}

function deriveBucketStance(bucketKey, severity) {
  if (bucketKey === 'positive_verification') return 'supportive';
  if (severity === 'high') return 'blocking';
  if (severity === 'medium') return 'review';
  return 'monitor';
}

function buildEvidencePreview(signals = [], maxItems = 3) {
  return signals.slice(0, maxItems).map((signal) => ({
    provider: signal.provider || signal.service || 'Unknown provider',
    code: signal.code || '',
    label: getSignalLabel(signal),
    severity: getSignalSeverity(signal),
    disposition: getDisposition(signal),
    canonicalConcept: signal.canonicalConcept || ''
  }));
}

export function summarizeBucket(bucket = {}) {
  const bucketMeta = getBucketMeta(bucket.key);
  const dedupedSignals = dedupeSignals(bucket.signals || []);
  const severity = determineBucketSeverity(bucket.key, dedupedSignals);
  const narrative = buildBucketNarrative(
    bucket.key,
    severity,
    dedupedSignals,
    bucketMeta
  );
  const actions = recommendedActionsForBucket(
    bucket.key,
    severity,
    dedupedSignals.length
  );

  return {
    key: bucket.key,
    label: bucketMeta.label,
    shortLabel: bucketMeta.shortLabel,
    description: bucketMeta.description,
    reviewQuestion: bucketMeta.reviewQuestion,
    severity,
    stance: deriveBucketStance(bucket.key, severity),
    count: dedupedSignals.length,
    signals: dedupedSignals,
    narrative,
    recommendedActions: actions,
    evidencePreview: buildEvidencePreview(dedupedSignals, 3)
  };
}

export function buildInsightSummaries(signals = []) {
  const bucketed = bucketSignals(signals);
  const summaries = bucketed
    .map((bucket) => summarizeBucket(bucket))
    .sort((a, b) => {
      if (a.key === 'positive_verification' && b.key !== 'positive_verification') return 1;
      if (b.key === 'positive_verification' && a.key !== 'positive_verification') return -1;

      const severityDiff = severityRank(b.severity) - severityRank(a.severity);
      if (severityDiff !== 0) return severityDiff;

      return b.count - a.count;
    });

  const recommendedActions = collectRecommendedActions(summaries);

  return {
    summaries,
    recommendedActions,
    overview: buildInsightOverview(summaries, recommendedActions)
  };
}

function collectRecommendedActions(summaries = []) {
  const actionMap = new Map();

  for (const summary of summaries) {
    for (const action of summary.recommendedActions || []) {
      const existing = actionMap.get(action.key);

      if (!existing) {
        actionMap.set(action.key, {
          ...action,
          sourceBuckets: [summary.label],
          highestSeverity: summary.severity
        });
        continue;
      }

      existing.sourceBuckets.push(summary.label);

      if (
        severityRank(summary.severity) > severityRank(existing.highestSeverity)
      ) {
        existing.highestSeverity = summary.severity;
      }
    }
  }

  return sortActions(Array.from(actionMap.values())).slice(0, 4);
}

function buildInsightOverview(summaries = [], recommendedActions = []) {
  const blocking = summaries.filter((s) => s.stance === 'blocking');
  const review = summaries.filter((s) => s.stance === 'review');
  const supportive = summaries.filter((s) => s.stance === 'supportive');

  const topBlocking = blocking.slice(0, 2).map((s) => s.label);
  const topReview = review.slice(0, 2).map((s) => s.label);

  let headline = 'Signals are limited and appear manageable.';
  let subheadline = 'No major blockers stand out from the currently summarized evidence.';

  if (blocking.length) {
    headline = `Manual review is warranted due to elevated concern in ${topBlocking.join(' and ')}.`;
    subheadline = 'The application contains signals that should materially influence the review decision.';
  } else if (review.length) {
    headline = `The case appears reviewable, with uncertainty concentrated in ${topReview.join(' and ')}.`;
    subheadline = 'The evidence is mixed enough to justify targeted follow-up before a final decision.';
  } else if (supportive.length) {
    headline = 'The application contains multiple supportive verification signals.';
    subheadline = 'Positive evidence may offset weaker or isolated review triggers.';
  }

  return {
    headline,
    subheadline,
    blockingCount: blocking.length,
    reviewCount: review.length,
    supportiveCount: supportive.length,
    topRecommendedAction: recommendedActions[0] || null
  };
}

export function getActionLibrary() {
  return ACTION_LIBRARY;
}

export function getActionByKey(actionKey) {
  return ACTION_LIBRARY[actionKey] || null;
}

export function groupSignalsForDisplay(signals = []) {
  const result = buildInsightSummaries(signals);

  return result.summaries.map((summary) => ({
    title: summary.label,
    severity: summary.severity,
    stance: summary.stance,
    narrative: summary.narrative,
    reviewQuestion: summary.reviewQuestion,
    recommendedActions: summary.recommendedActions,
    evidencePreview: summary.evidencePreview,
    signalCount: summary.count
  }));
}

export function formatBucketDebug(summary = {}) {
  return {
    bucket: summary.label || summary.key,
    severity: summary.severity,
    stance: summary.stance,
    signalCount: summary.count,
    topSignals: (summary.signals || []).slice(0, 5).map((signal) => ({
      label: getSignalLabel(signal),
      severity: getSignalSeverity(signal),
      disposition: getDisposition(signal),
      provider: signal.provider || signal.service || '',
      code: signal.code || '',
      concept: signal.canonicalConcept || ''
    })),
    recommendedActions: (summary.recommendedActions || []).map((action) => action.label)
  };
}