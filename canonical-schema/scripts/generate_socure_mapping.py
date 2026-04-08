import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT_FILE = ROOT / "providers" / "raw_socure3.csv"
OUTPUT_FILE = ROOT / "provider_mapping_socure.csv"


def infer_group_and_severity(code: str, description: str):
    code = code.upper()

    # R codes = negative
    if code.startswith("R"):
        if "DECEASED" in description.upper():
            return "identity", "high", "negative"
        if "WATCHLIST" in description.upper() or "PEP" in description.upper():
            return "compliance", "high", "negative"
        if "FRAUD" in description.upper():
            return "fraud", "high", "negative"
        if "EMAIL" in description.upper():
            return "contactability", "medium", "warning"
        if "PHONE" in description.upper():
            return "contactability", "medium", "warning"
        if "ADDRESS" in description.upper():
            return "identity", "medium", "warning"

        return "identity", "medium", "negative"

    # I codes = positive
    if code.startswith("I"):
        return "identity", "low", "positive"

    return "unknown", "low", "neutral"


def main():
    with INPUT_FILE.open("r", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        rows = list(reader)

    fieldnames = [
        "provider",
        "source_type",
        "source_code",
        "source_description",
        "canonical_concept",
        "concept_group",
        "signal_class",
        "severity",
        "direction",
        "requires_review",
        "can_contribute_to_decline",
        "dedupe_key",
        "narrative_key",
        "notes",
    ]

    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        for row in rows:
            code = row["code"]
            description = row["description"]

            concept_group, severity, direction = infer_group_and_severity(code, description)

            writer.writerow({
                "provider": "socure",
                "source_type": "reason_code",
                "source_code": code,
                "source_description": description,
                "canonical_concept": "",  # ← YOU will define later
                "concept_group": concept_group,
                "signal_class": concept_group,
                "severity": severity,
                "direction": direction,
                "requires_review": "true" if severity in ["medium", "high"] else "false",
                "can_contribute_to_decline": "true" if severity == "high" else "false",
                "dedupe_key": code,
                "narrative_key": "",
                "notes": "",
            })

    print(f"\nCreated: {OUTPUT_FILE}\n")


if __name__ == "__main__":
    main()