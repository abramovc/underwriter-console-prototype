import { loadSocureMapping } from "./loadSocureMapping";
import { normalizeSocure } from "./normalizeSocure";

const socureResponse = [
  {
    code: "I1002",
    description: "National ID was not provided and Socure was unable to prefill National ID for the given identity",
  },
  {
    code: "I1003",
    description: "National ID was not provided and Socure was able to prefill National ID for the given identity",
  },
  {
    code: "R1001",
    description: "Found at least 2 distinct DOBs associated with the given identity",
  },
  {
    code: "UNKNOWN_CODE",
    description: "Something new we haven't mapped",
  },
];

const mappingRows = loadSocureMapping();

const signals = normalizeSocure(socureResponse, mappingRows, {
  product: "accountIntelligence",
  timestamp: new Date().toISOString(),
});

console.log("Normalized Signals From Real CSV:");
console.log(JSON.stringify(signals, null, 2));