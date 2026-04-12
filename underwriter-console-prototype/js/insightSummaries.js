import {
  bucketSignals,
  getBucketMeta
} from './insightBuckets.js';

import {
  ACTION_LIBRARY,
  sortActions,
  getActionLibrary,
  getActionByKey
} from './recommendedActions.js';

import {
  getConceptActions
} from './conceptActions.js';

const SEVERITY_ORDER = ['low', 'medium', 'high'];

const BUCKET_ACTION_AFFINITY = {
  identity_integrity: [
    'request_selfie_id_liveness',
    'request_identity_documents',
    'request_data_correction',
    'escalate_manual_review',
    'run_additional_verification'
  ],
  contactability: [
    'request_text_otp',
    'request_email_confirmation',
    'request_address_proof',
    'request_data_correction',
    'escalate_manual_review'
  ],
  fraud_velocity: [
    'request_selfie_id_liveness',
    'run_additional_verification',
    'escalate_fraud_review',
    'request_text_otp'
  ],
  compliance_screening: [
    'escalate_compliance_review'
  ],
  business_legitimacy: [
    'request_business_documents',
    'order_secretary_of_state_documents',
    'escalate_business_review',
    'request_data_correction'
  ],
  bank_ownership: [
    'request_bank_connection_plaid',
    'request_bank_documents',
    'escalate_manual_review'
  ],
  positive_verification: [
    'proceed_with_monitoring'
  ],
  other: [
    'run_additional_verification',
    'escalate_manual_review'
  ]
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
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

function getRankedConcepts(signals = [], maxConcepts = 4) {
  const conceptMap = new Map();

  for (const signal of signals) {
    const concept = String(signal.canonicalConcept || '').trim();
    if (!concept) continue;

    const existing = conceptMap.get(concept);

    if (!existing) {
      conceptMap.set(concept, {
        concept,
        weight: signalWeight(signal),
        signalCount: 1,
        severity: getSignalSeverity(signal)
      });
      continue;
    }

    existing.weight += signalWeight(signal);
    existing.signalCount += 1;

    if (severityRank(getSignalSeverity(signal)) > severityRank(existing.severity)) {
      existing.severity = getSignalSeverity(signal);
    }
  }

  return Array.from(conceptMap.values())
    .sort((a, b) => {
      const weightDiff = b.weight - a.weight;
      if (weightDiff !== 0) return weightDiff;

      const severityDiff = severityRank(b.severity) - severityRank(a.severity);
      if (severityDiff !== 0) return severityDiff;

      return a.concept.localeCompare(b.concept);
    })
    .slice(0, maxConcepts);
}

function getBucketFallbackActionKeys(bucketKey, severity, signalCount) {
  const bucketMeta = getBucketMeta(bucketKey);
  const baseActions = [...(bucketMeta.recommendedActions || [])];

  if (bucketKey === 'positive_verification') {
    return [];
  }

  if (severity === 'low' && signalCount <= 1) {
    return baseActions.slice(0, 1);
  }

  if (severity === 'medium') {
    return baseActions.slice(0, 2);
  }

  return baseActions.slice(0, 3);
}

function getBucketAffinityRank(bucketKey, actionKey) {
  const bucketActions = BUCKET_ACTION_AFFINITY[bucketKey] || BUCKET_ACTION_AFFINITY.other || [];
  const idx = bucketActions.indexOf(actionKey);
  return idx === -1 ? 999 : idx;
}

function buildRecommendedActionsForBucket(bucketKey, severity, signals = []) {
  const rankedConcepts = getRankedConcepts(signals, 4);
  const conceptDerivedActionKeys = [];

  for (const item of rankedConcepts) {
    const actionKeys = getConceptActions(item.concept);
    for (const actionKey of actionKeys) {
      conceptDerivedActionKeys.push(actionKey);
    }
  }

  const fallbackActionKeys = getBucketFallbackActionKeys(bucketKey, severity, signals.length);

  const combined = [];
  const seen = new Set();

  for (const key of [...conceptDerivedActionKeys, ...fallbackActionKeys]) {
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const action = ACTION_LIBRARY[key];
    if (!action) continue;

    combined.push({
      ...action,
      __affinityRank: getBucketAffinityRank(bucketKey, key)
    });
  }

  combined.sort((a, b) => {
    const affinityDiff = a.__affinityRank - b.__affinityRank;
    if (affinityDiff !== 0) return affinityDiff;

    const sorted = sortActions([a, b]);
    if (sorted[0].key === a.key) return -1;
    if (sorted[0].key === b.key) return 1;
    return 0;
  });

  return combined
    .slice(0, 3)
    .map(({ __affinityRank, ...action }) => action);
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
  const actions = buildRecommendedActionsForBucket(
    bucket.key,
    severity,
    dedupedSignals
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

function getSummaryPriority(summary = {}) {
  const stanceRankMap = {
    blocking: 0,
    review: 1,
    monitor: 2,
    supportive: 3
  };

  const stanceRank = stanceRankMap[summary.stance] ?? 99;
  const severityScore = severityRank(summary.severity);
  const countScore = Number(summary.count || 0);

  return {
    stanceRank,
    severityScore,
    countScore
  };
}

function compareSummaryPriority(a = {}, b = {}) {
  const aPriority = getSummaryPriority(a);
  const bPriority = getSummaryPriority(b);

  if (aPriority.stanceRank !== bPriority.stanceRank) {
    return aPriority.stanceRank - bPriority.stanceRank;
  }

  const severityDiff = bPriority.severityScore - aPriority.severityScore;
  if (severityDiff !== 0) return severityDiff;

  const countDiff = bPriority.countScore - aPriority.countScore;
  if (countDiff !== 0) return countDiff;

  return String(a.label || '').localeCompare(String(b.label || ''));
}

function pickPrimaryDriverBucket(summaries = []) {
  const candidates = summaries.filter((summary) => summary.stance !== 'supportive');

  if (!candidates.length) {
    return summaries.length ? [...summaries].sort(compareSummaryPriority)[0] : null;
  }

  return [...candidates].sort(compareSummaryPriority)[0] || null;
}

export function buildInsightSummaries(signals = []) {
  const bucketed = bucketSignals(signals);
  const summaries = bucketed
    .map((bucket) => summarizeBucket(bucket))
    .sort(compareSummaryPriority);

  const recommendedActions = collectRecommendedActions(summaries);
  const primaryDriverBucket = pickPrimaryDriverBucket(summaries);

  return {
    summaries,
    recommendedActions,
    primaryDriverBucket,
    overview: buildInsightOverview(summaries, recommendedActions, primaryDriverBucket)
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

function buildInsightOverview(summaries = [], recommendedActions = [], primaryDriverBucket = null) {
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
  } else if (primaryDriverBucket) {
    headline = 'Manual review is warranted due to elevated concern in the surfaced signals.';
    subheadline = `${primaryDriverBucket.label}-oriented verification signals need human review before proceeding.`;
  } else if (supportive.length) {
    headline = 'The application contains multiple supportive verification signals.';
    subheadline = 'Positive evidence may offset weaker or isolated review triggers.';
  }

  const topRecommendedAction =
    (primaryDriverBucket?.recommendedActions || [])[0] ||
    recommendedActions[0] ||
    null;

  return {
    headline,
    subheadline,
    blockingCount: blocking.length,
    reviewCount: review.length,
    supportiveCount: supportive.length,
    topRecommendedAction
  };
}

export { getActionLibrary, getActionByKey };

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