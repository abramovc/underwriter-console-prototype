export function detectCaseComposition(payload = {}) {
  const services = payload?.summary?.services || {};
  const formattedResponses = payload?.formatted_responses || {};
  const rawResponses = payload?.raw_responses || {};

  const serviceKeys = Object.keys(services).map((key) => String(key).toLowerCase());
  const formattedKeys = Object.keys(formattedResponses).map((key) => String(key).toLowerCase());
  const rawKeys = Object.keys(rawResponses).map((key) => String(key).toLowerCase());

  const ranMiddesk =
    serviceKeys.some((key) => key.includes("middesk")) ||
    formattedKeys.some((key) => key.includes("middesk")) ||
    rawKeys.some((key) => key.includes("middesk"));

  const ranSocure =
    serviceKeys.some((key) => key.includes("socure")) ||
    formattedKeys.some((key) => key.includes("socure")) ||
    rawKeys.some((key) => key.includes("socure"));

  const ranIDA =
    serviceKeys.some((key) => key.includes("id analytics")) ||
    formattedKeys.some((key) => key.includes("id analytics")) ||
    rawKeys.some((key) => key.includes("id_analytics"));

  const ranLexis =
    serviceKeys.some((key) => key.includes("lexis")) ||
    formattedKeys.some((key) => key.includes("lexis")) ||
    rawKeys.some((key) => key.includes("lexis"));

  return {
    business: ranMiddesk,
    contact: ranSocure || ranIDA || ranLexis
  };
}

export function formatCaseComposition(composition = {}) {
  const parts = [];

  if (composition.business) parts.push("Business");
  if (composition.contact) parts.push("Contact");

  return parts.length ? parts.join(" + ") : "Unknown";
}
