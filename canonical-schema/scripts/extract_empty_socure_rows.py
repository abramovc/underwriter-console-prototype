import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT_FILE = ROOT / "provider_mapping_socure.csv"
OUTPUT_FILE = ROOT / "output" / "socure_empty_concepts.csv"


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with INPUT_FILE.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = [row for row in reader if not (row.get("canonical_concept") or "").strip()]

    with OUTPUT_FILE.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Extracted {len(rows)} empty rows -> {OUTPUT_FILE}")


if __name__ == "__main__":
    main()