import fs from "fs";
import path from "path";

export type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function toObject(headers: string[], values: string[]): CsvRow {
  const row: CsvRow = {};
  headers.forEach((header, index) => {
    row[header] = values[index] ?? "";
  });
  return row;
}

export function loadCsvMapping(relativePathFromProjectRoot: string): CsvRow[] {
  const filePath = path.resolve(process.cwd(), relativePathFromProjectRoot);
  const raw = fs.readFileSync(filePath, "utf-8");

  const lines: string[] = raw
    .split(/\r?\n/)
    .filter((line: string) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line: string) => {
    const values = parseCsvLine(line);
    return toObject(headers, values);
  });
}