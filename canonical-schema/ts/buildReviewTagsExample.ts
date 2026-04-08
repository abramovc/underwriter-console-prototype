import { buildReviewTags } from "./buildReviewTags";

const alloyTags = [
  { tag: "KYC Approved", description: "Applicant passed KYC checks" },
  { tag: "High Fraud Risk", description: "Applicant triggered high fraud risk logic" },
  { tag: "Watchlist Review", description: "Applicant requires watchlist review" },
  { tag: "UNKNOWN_TAG", description: "Something new we have not mapped yet" },
];

const reviewTags = buildReviewTags(alloyTags, {
  timestamp: new Date().toISOString(),
});

console.log("Review Tags:");
console.log(JSON.stringify(reviewTags, null, 2));