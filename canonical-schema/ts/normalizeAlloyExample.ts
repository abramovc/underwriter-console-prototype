import { loadAlloyMapping } from "./loadAlloyMapping";
import { normalizeAlloy } from "./normalizeAlloy";

const alloyTags = [
  {
    tag: "KYC Approved",
    description: "Applicant passed KYC checks",
  },
  {
    tag: "High Fraud Risk",
    description: "Applicant triggered high fraud risk logic",
  },
  {
    tag: "Watchlist Review",
    description: "Applicant requires watchlist review",
  },
  {
    tag: "UNKNOWN_TAG",
    description: "Something new we have not mapped yet",
  },
];

const mappingRows = loadAlloyMapping();

const signals = normalizeAlloy(alloyTags, mappingRows, {
  product: "workflowTags",
  timestamp: new Date().toISOString(),
});

console.log("Normalized Alloy Signals:");
console.log(JSON.stringify(signals, null, 2));