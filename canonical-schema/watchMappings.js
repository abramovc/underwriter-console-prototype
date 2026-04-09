const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const MAPPINGS_DIR = path.join(__dirname, "mappings");
const EXPORT_SCRIPT = path.join(__dirname, "exportMappings.js");

let exportTimer = null;
let exportInFlight = false;
let rerunRequested = false;

function timestamp() {
  return new Date().toLocaleTimeString();
}

function log(message) {
  console.log(`[${timestamp()}] ${message}`);
}

function runExport() {
  if (exportInFlight) {
    rerunRequested = true;
    return;
  }

  exportInFlight = true;

  const child = spawn(process.execPath, [EXPORT_SCRIPT], {
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    exportInFlight = false;

    if (code === 0) {
      log("Mappings regenerated");
    } else {
      log(`Mapping export failed with code ${code}`);
    }

    if (rerunRequested) {
      rerunRequested = false;
      runExport();
    }
  });
}

function scheduleExport(fileName) {
  if (fileName && !String(fileName).toLowerCase().endsWith(".csv")) {
    return;
  }

  clearTimeout(exportTimer);
  exportTimer = setTimeout(() => {
    log(`Change detected${fileName ? ` in ${fileName}` : ""}`);
    runExport();
  }, 100);
}

fs.watch(MAPPINGS_DIR, (eventType, fileName) => {
  if (eventType === "rename" || eventType === "change") {
    scheduleExport(fileName);
  }
});

log(`Watching ${MAPPINGS_DIR} for CSV changes...`);
runExport();
