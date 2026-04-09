const REVIEW_TAG_METADATA = {
  "SSN Warning": {
    group: "identity",
    canonicalConcept: "ssn_warning",
    severity: "medium",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: false
  },
  "Watchlist Review": {
    group: "compliance",
    canonicalConcept: "watchlist_review",
    severity: "high",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: false
  },
  "Secret of State Unmatched": {
    group: "business",
    canonicalConcept: "business_registration_match",
    severity: "high",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: true
  },
  "Secret of State Status Inactive/Unknown": {
    group: "business",
    canonicalConcept: "business_registration_inactive",
    severity: "high",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: true
  },
  "Business Name Matched": {
    group: "business",
    canonicalConcept: "business_name_verification",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "Business Address Matched": {
    group: "business",
    canonicalConcept: "business_address_verification",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "FEIN Found": {
    group: "business",
    canonicalConcept: "business_tin_verification",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "Watchlist Warning": {
    group: "compliance",
    canonicalConcept: "watchlist_review",
    severity: "high",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: true
  },
  "Litigations Found": {
    group: "business",
    canonicalConcept: "business_litigation_history",
    severity: "high",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: false
  },
  "KYC Approved": {
    group: "workflow",
    canonicalConcept: "kyc_approved",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "Fraud Review": {
    group: "fraud",
    canonicalConcept: "fraud_review",
    severity: "high",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: false
  },
  "Denied Fraud": {
    group: "fraud",
    canonicalConcept: "fraud_denied",
    severity: "high",
    direction: "negative",
    requiresReview: false,
    canContributeToDecline: true
  },
  "High Fraud Risk": {
    group: "fraud",
    canonicalConcept: "fraud_risk_high",
    severity: "high",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: true
  },
  "Medium Fraud Risk": {
    group: "fraud",
    canonicalConcept: "fraud_risk_medium",
    severity: "medium",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: false
  },
  "SSN Velocity Warning": {
    group: "fraud",
    canonicalConcept: "ssn_velocity_warning",
    severity: "medium",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: false
  },
  "Velocity Warning": {
    group: "fraud",
    canonicalConcept: "velocity_warning",
    severity: "medium",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: false
  },
  "Address Warning": {
    group: "identity",
    canonicalConcept: "address_warning",
    severity: "medium",
    direction: "negative",
    requiresReview: true,
    canContributeToDecline: false
  },
  "Socure SSN Match": {
    group: "identity",
    canonicalConcept: "ssn_match",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "Socure Name Match": {
    group: "identity",
    canonicalConcept: "name_match",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "Socure DOB Match": {
    group: "identity",
    canonicalConcept: "dob_match",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "Socure Address Match": {
    group: "identity",
    canonicalConcept: "address_match",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "KYC Name Verified": {
    group: "identity",
    canonicalConcept: "name_verified",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "KYC SSN Verified": {
    group: "identity",
    canonicalConcept: "ssn_verified",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "KYC Address Verified": {
    group: "identity",
    canonicalConcept: "address_verified",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  },
  "KYC DOB Verified": {
    group: "identity",
    canonicalConcept: "dob_verified",
    severity: "low",
    direction: "positive",
    requiresReview: false,
    canContributeToDecline: false
  }
};

const severityRank = { high: 3, medium: 2, low: 1 };
const directionRank = { negative: 3, neutral: 2, positive: 1 };

function normalizeDirection(value) {
  if (value === "positive" || value === "negative" || value === "neutral") return value;
  if (value === "warning") return "negative";
  return "neutral";
}

function formatOutcome(value) {
  if (!value) return "Unknown";

  const normalized = String(value).replace(/_/g, " ").trim();
  return normalized
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
}

function formatProviderName(name) {
  const providerNames = {
    socure: "Socure",
    id_analytics: "ID Analytics",
    lexis_nexis_instant_id: "LexisNexis Instant ID",
    middesk: "Middesk"
  };

  if (providerNames[name]) return providerNames[name];

  return String(name || "Unknown")
    .replace(/_/g, " ")
    .trim()
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
}

function countServicesRun(services) {
  if (!services || typeof services !== "object") return 0;

  return Object.values(services).filter((value) => {
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      return normalized === "executed" || normalized === "complete" || normalized === "completed" || normalized === "success";
    }
    return !!value;
  }).length;
}

function buildReviewTags(rawTags) {
  return (rawTags || [])
    .map((tag, index) => {
      const meta = REVIEW_TAG_METADATA[tag] || {
        group: "unknown",
        canonicalConcept: "needs_review",
        severity: "low",
        direction: "neutral",
        requiresReview: true,
        canContributeToDecline: false
      };

      return {
        id: `review_tag:${tag}:${index}`,
        tag,
        group: meta.group,
        canonicalConcept: meta.canonicalConcept,
        severity: meta.severity,
        direction: normalizeDirection(meta.direction),
        requiresReview: meta.requiresReview,
        canContributeToDecline: meta.canContributeToDecline,
        dedupeKey: tag
      };
    })
    .sort((a, b) => {
      const sev = severityRank[b.severity] - severityRank[a.severity];
      if (sev !== 0) return sev;
      return directionRank[b.direction] - directionRank[a.direction];
    });
}

function buildNormalizedSignal(provider, product, sourceType, code, description, mapping, index) {
  const meta = mapping || {
    canonicalConcept: "needs_review",
    conceptGroup: "unknown",
    signalClass: "unknown",
    severity: "low",
    direction: "neutral",
    requiresReview: true,
    canContributeToDecline: false,
    displayLabel: "Needs review"
  };

  return {
    id: `${provider}:${code}:${index}`,
    provider,
    providerDisplayName: formatProviderName(provider),
    product,
    sourceType,
    sourceCode: code,
    sourceDescription: description || meta.displayLabel || code,
    canonicalConcept: meta.canonicalConcept || "needs_review",
    conceptGroup: meta.conceptGroup || "unknown",
    signalClass: meta.signalClass || "unknown",
    severity: meta.severity || "low",
    direction: normalizeDirection(meta.direction),
    requiresReview: !!meta.requiresReview,
    canContributeToDecline: !!meta.canContributeToDecline,
    displayLabel: meta.displayLabel || meta.canonicalConcept || "Needs review",
    dedupeKey: `${provider}:${code}`
  };
}

function getProviderMapping(providerMappings, provider, code) {
  return providerMappings?.[provider]?.[code] || null;
}

function getTruthyCodes(obj) {
  if (!obj || typeof obj !== "object") {
    return [];
  }

  return Object.entries(obj)
    .filter(([, value]) => !!value)
    .map(([code]) => String(code).toUpperCase());
}

function pushProviderSignals(target, providerMappings, provider, product, codes, descriptionBuilder) {
  (codes || []).forEach((code, index) => {
    const mapping = getProviderMapping(providerMappings, provider, code);
    const fallbackDescription = descriptionBuilder ? descriptionBuilder(code) : `${product} reason code ${code}`;
    const description =
      mapping?.sourceDescription ||
      mapping?.displayLabel ||
      fallbackDescription;

    target.push(
      buildNormalizedSignal(
        provider,
        product,
        "reason_code",
        code,
        description,
        mapping,
        index
      )
    );
  });
}

function getMiddeskTaskDefaults(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "failure") {
    return {
      direction: "negative",
      severity: "high",
      requiresReview: true,
      canContributeToDecline: true
    };
  }

  if (normalizedStatus === "warning") {
    return {
      direction: "negative",
      severity: "medium",
      requiresReview: true,
      canContributeToDecline: false
    };
  }

  if (normalizedStatus === "success") {
    return {
      direction: "positive",
      severity: "low",
      requiresReview: false,
      canContributeToDecline: false
    };
  }

  return {
    direction: "neutral",
    severity: "low",
    requiresReview: false,
    canContributeToDecline: false
  };
}

function getMiddeskTaskMeta(taskKey, status) {
  const normalizedStatus = String(status || "").toLowerCase();
  const defaults = getMiddeskTaskDefaults(normalizedStatus);
  const taskMap = {
    sos_match: {
      canonicalConcept: "business_registration_match",
      conceptGroup: "business"
    },
    sos_active: {
      canonicalConcept: "business_registration_active",
      conceptGroup: "business"
    },
    sos_inactive: {
      canonicalConcept: "business_registration_inactive",
      conceptGroup: "business"
    },
    sos_domestic: {
      canonicalConcept: "business_domestic_registration_status",
      conceptGroup: "business"
    },
    sos_domestic_sub_status: {
      canonicalConcept: "business_good_standing_status",
      conceptGroup: "business"
    },
    watchlist: {
      canonicalConcept: "compliance_watchlist_match",
      conceptGroup: "compliance"
    },
    website_status: {
      canonicalConcept: "website_status_check",
      conceptGroup: "business"
    },
    website_verification: {
      canonicalConcept: "website_verification",
      conceptGroup: "business"
    },
    litigations: {
      canonicalConcept: "business_litigation_history",
      conceptGroup: "business"
    },
    phone: {
      canonicalConcept: "business_phone_verification",
      conceptGroup: "business"
    },
    name: {
      canonicalConcept: "business_name_verification",
      conceptGroup: "business"
    },
    address_verification: {
      canonicalConcept: "business_address_verification",
      conceptGroup: "business"
    },
    address_deliverability: {
      canonicalConcept: "business_address_deliverability",
      conceptGroup: "business"
    },
    address_property_type: {
      canonicalConcept: "business_address_property_type",
      conceptGroup: "business"
    },
    address_risk: {
      canonicalConcept: "business_address_risk",
      conceptGroup: "business"
    },
    location_frequency: {
      canonicalConcept: "business_location_frequency",
      conceptGroup: "business"
    },
    person_verification: {
      canonicalConcept: "business_person_verification",
      conceptGroup: "business"
    },
    tin: {
      canonicalConcept: "business_tin_verification",
      conceptGroup: "business"
    },
    industry: {
      canonicalConcept: "business_industry_risk",
      conceptGroup: "business"
    }
  };

  const meta = taskMap[taskKey] || {
    canonicalConcept: "business_review_task",
    conceptGroup: "business"
  };

  const combined = {
    canonicalConcept: meta.canonicalConcept,
    conceptGroup: meta.conceptGroup,
    signalClass: "business",
    severity: defaults.severity,
    direction: defaults.direction,
    requiresReview: defaults.requiresReview,
    canContributeToDecline: defaults.canContributeToDecline
  };

  if (
    normalizedStatus === "failure" &&
    (taskKey === "watchlist" || taskKey === "sos_inactive" || taskKey === "sos_active" || taskKey === "sos_match")
  ) {
    combined.severity = "high";
    combined.direction = "negative";
    combined.requiresReview = true;
    combined.canContributeToDecline = true;
  }

  if (normalizedStatus === "failure" && taskKey === "litigations") {
    combined.severity = "high";
    combined.direction = "negative";
    combined.requiresReview = true;
    combined.canContributeToDecline = false;
  }

  if (normalizedStatus === "failure" && taskKey === "website_status") {
    combined.severity = "medium";
    combined.direction = "negative";
    combined.requiresReview = true;
  }

  if (normalizedStatus === "warning" && (taskKey === "website_verification" || taskKey === "phone")) {
    combined.severity = "medium";
    combined.direction = "negative";
    combined.requiresReview = true;
  }

  return combined;
}

function buildMiddeskTaskSignal(task, index) {
  if (!task?.key) return null;

  const meta = getMiddeskTaskMeta(task.key, task.status);
  const descriptionParts = [task.message || task.label || task.key];
  if (task.sub_label) {
    descriptionParts.push(task.sub_label);
  }
  const sourceDescription = descriptionParts.filter(Boolean).join(" — ");

  return {
    id: `middesk:task:${task.key}:${index}`,
    provider: "middesk",
    providerDisplayName: formatProviderName("middesk"),
    product: "Middesk",
    sourceType: "review_task",
    sourceCode: task.key,
    sourceDescription,
    canonicalConcept: meta.canonicalConcept,
    conceptGroup: meta.conceptGroup,
    signalClass: "business",
    severity: meta.severity,
    direction: meta.direction,
    requiresReview: meta.requiresReview,
    canContributeToDecline: meta.canContributeToDecline,
    displayLabel: task.label || formatOutcome(task.key),
    dedupeKey: `middesk:${task.key}`
  };
}

function getMiddeskClassificationMapping(providerMappings, classificationSystem, category) {
  const system = String(classificationSystem || "").toUpperCase();
  const prohibitedLabel = (category?.prohibited_labels || []).find(
    (label) => label && label !== "OTHER_NON_PROHIBITED"
  );

  if (system === "NAICS") {
    const code = category?.naics_codes?.[0];
    return code ? providerMappings?.middesk_naics?.[String(code)] || null : null;
  }

  if (system === "MCC") {
    const code = category?.mcc_codes?.[0];
    return code ? providerMappings?.middesk_mcc?.[String(code)] || null : null;
  }

  if (system === "PROHIBITED") {
    return prohibitedLabel ? providerMappings?.middesk_kyb?.[String(prohibitedLabel)] || null : null;
  }

  return null;
}

function shouldIncludeMiddeskIndustryCategory(classificationSystem, category, mapping) {
  const prohibitedLabels = (category?.prohibited_labels || []).filter(
    (label) => label && label !== "OTHER_NON_PROHIBITED"
  );
  const hasRiskyProhibitedLabel = String(classificationSystem || "").toUpperCase() === "PROHIBITED" && prohibitedLabels.length > 0;
  const isHighRisk = category?.high_risk === true;
  const hasRiskyMapping =
    !!mapping &&
    (
      mapping.direction === "negative" ||
      mapping.severity === "medium" ||
      mapping.severity === "high" ||
      mapping.requiresReview ||
      mapping.canContributeToDecline
    );

  return isHighRisk || prohibitedLabels.length > 0 || hasRiskyProhibitedLabel || hasRiskyMapping;
}

function buildMiddeskIndustrySignal(providerMappings, category, classificationSystem, index) {
  if (!category) return null;

  const mapping = getMiddeskClassificationMapping(providerMappings, classificationSystem, category);
  if (!shouldIncludeMiddeskIndustryCategory(classificationSystem, category, mapping)) {
    return null;
  }

  const system = String(classificationSystem || "").toUpperCase();
  const sourceCode =
    category?.naics_codes?.[0] ||
    category?.mcc_codes?.[0] ||
    (category?.prohibited_labels || []).find((label) => label && label !== "OTHER_NON_PROHIBITED") ||
    category?.category ||
    category?.name ||
    `industry_${index}`;
  const meta = mapping || {
    canonicalConcept: "business_classification_context",
    conceptGroup: "business",
    signalClass: "business",
    severity: "low",
    direction: "neutral",
    requiresReview: false,
    canContributeToDecline: false,
    displayLabel: category.name || category.category || String(sourceCode)
  };

  return {
    id: `middesk:industry:${system}:${sourceCode}:${index}`,
    provider: "middesk",
    providerDisplayName: formatProviderName("middesk"),
    product: "Middesk",
    sourceType: "industry_classification",
    sourceCode: String(sourceCode),
    sourceDescription: category.name || category.category || String(sourceCode),
    canonicalConcept: meta.canonicalConcept || "business_classification_context",
    conceptGroup: meta.conceptGroup || "business",
    signalClass: meta.signalClass || "business",
    severity: meta.severity || "low",
    direction: normalizeDirection(meta.direction),
    requiresReview: !!meta.requiresReview,
    canContributeToDecline: !!meta.canContributeToDecline,
    displayLabel: meta.displayLabel || category.name || category.category || String(sourceCode),
    dedupeKey: `middesk:industry:${system}:${sourceCode || category?.category || index}`
  };
}

function getMiddeskObject(alloy) {
  return (
    alloy?.formatted?.data?.object ||
    alloy?.formatted_responses?.Middesk?.data?.object ||
    alloy?.raw_responses?.Middesk?.[0] ||
    null
  );
}

function normalize(alloy, providerMappings) {
  const reviewTags = buildReviewTags(alloy.summary?.tags || []);
  const supportingSignals = [];
  const formatted = alloy.formatted_responses || {};
  const socureData = formatted["Socure 30"]?.data || {};
  const malformedSocureData = formatted["Socure 30"]?.[" data"] || {};

  const socureCodes = socureData.reasonCodes || [];
  const socureWatchlistCodes = getTruthyCodes(socureData.global_watchlist);
  const socureEcbsvCodes = getTruthyCodes(socureData.eCBSV);
  const socureMalformedEcbsvCodes = getTruthyCodes(malformedSocureData.eCBSV);
  const socureRuleCodes = getTruthyCodes(socureData.rules?.reason_codes);
  const mergedSocureCodes = Array.from(
    new Set([
      ...socureCodes.map((code) => String(code).toUpperCase()),
      ...socureWatchlistCodes,
      ...socureEcbsvCodes,
      ...socureMalformedEcbsvCodes,
      ...socureRuleCodes
    ])
  );

  pushProviderSignals(
    supportingSignals,
    providerMappings,
    "socure",
    "Socure 30",
    mergedSocureCodes,
    (code) => `Socure reason code ${code}`
  );

  const idaCodes = formatted["ID Analytics ID Score"]?.data?.reason_codes || [];
  pushProviderSignals(
    supportingSignals,
    providerMappings,
    "id_analytics",
    "ID Analytics ID Score",
    idaCodes,
    (code) => `ID Analytics reason code ${code}`
  );

  const lexisCodes =
    formatted["LexisNexis Instant ID"]?.data?.risk_codes ||
    formatted["Lexis Nexis Instant ID"]?.data?.risk_codes ||
    [];
  pushProviderSignals(
    supportingSignals,
    providerMappings,
    "lexis_nexis_instant_id",
    "LexisNexis Instant ID",
    lexisCodes,
    (code) => `LexisNexis Instant ID reason code ${code}`
  );

  const middeskObject = getMiddeskObject(alloy);
  const middeskTasks = middeskObject?.review?.tasks || [];
  const middeskCategories = middeskObject?.industry_classification?.categories || [];

  middeskTasks.forEach((task, index) => {
    const signal = buildMiddeskTaskSignal(task, index);
    if (signal) {
      supportingSignals.push(signal);
    }
  });

  middeskCategories.forEach((category, index) => {
    const signal = buildMiddeskIndustrySignal(
      providerMappings,
      category,
      category?.classification_system,
      index
    );
    if (signal) {
      supportingSignals.push(signal);
    }
  });

  const sortedSignals = supportingSignals.sort((a, b) => {
    const sev = severityRank[b.severity] - severityRank[a.severity];
    if (sev !== 0) return sev;
    return directionRank[b.direction] - directionRank[a.direction];
  });

  return {
    outcome: formatOutcome(alloy.summary?.outcome || "Unknown"),
    servicesRun: countServicesRun(alloy.summary?.services),
    reviewTags,
    supportingSignals: sortedSignals
  };
}

function buildOutcomeReasons(alloy) {
  const explicit = alloy.summary?.outcome_reasons || [];

  return explicit.map((reason, index) => ({
    id: `outcome_reason:${index}`,
    label: reason,
    type: "explicit"
  }));
}

export function buildIntuitionReview(alloy, providerMappings) {
  const review = normalize(alloy, providerMappings);

  return {
    ...review,
    outcomeReasons: buildOutcomeReasons(alloy)
  };
}
