import { buildReviewTags } from "./buildReviewTags";
import { normalizeSocure } from "./normalizeSocure";
import { loadSocureMapping } from "./loadSocureMapping";
import { buildUnderwritingReview } from "./buildUnderwritingReview";

// ------------------------------
// Simulated Alloy tags
// ------------------------------
const alloyTags = [
  { tag: "KYC Approved", description: "Applicant passed KYC checks" },
  { tag: "High Fraud Risk", description: "Fraud risk detected" },
  { tag: "Watchlist Review", description: "Needs compliance review" },
];

// ------------------------------
// Simulated Socure response
// ------------------------------
const socureResponse = [
  {
    code: "I1002",
    description: "National ID was not provided",
  },
  {
    code: "R1001",
    description: "Found at least 2 distinct DOBs",
  },
];

// ------------------------------
// Build layers
// ------------------------------
const reviewTags = buildReviewTags(alloyTags, {
  timestamp: new Date().toISOString(),
});

const socureMapping = loadSocureMapping();

const normalizedSignals = normalizeSocure(
  socureResponse,
  socureMapping,
  {
    product: "accountIntelligence",
    timestamp: new Date().toISOString(),
  }
);

// ------------------------------
// Build final review object
// ------------------------------
const review = buildUnderwritingReview({
  reviewTags,
  signals: normalizedSignals,
});

console.log("Underwriting Review:");
console.log(JSON.stringify(review, null, 2));