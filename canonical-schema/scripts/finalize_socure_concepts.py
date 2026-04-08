import csv
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "provider_mapping_socure.csv"


def infer_concept(description: str) -> Optional[str]:
    d = description.lower()

    if "distinct dobs" in d:
        return "identity_dob_conflict"

    if "distinct first names" in d or "distinct last names" in d:
        return "identity_name_conflict"

    if "applications within 30 days" in d:
        return "fraud_velocity_high"

    if "applications within 90 days" in d:
        return "fraud_velocity_medium"

    if "delinquency" in d:
        return "credit_delinquency_risk"

    if "closed accounts" in d:
        return "credit_history_signal"

    if "proxy" in d:
        return "proxy_usage_risk"

    if "distance between input address" in d:
        if "less than" in d:
            return "address_consistency_positive"
        else:
            return "address_distance_risk"

    if "not confirmed as deliverable" in d:
        return "address_deliverability_risk"

    if "po box" in d:
        return "address_type_pobox"

    if "military location" in d:
        return "address_type_military"

    if "correctional facility" in d:
        return "address_type_correctional"

    if "ssn/itin cannot be resolved" in d:
        return "identity_ssn_unverifiable"

    if "name cannot be resolved" in d:
        return "identity_name_unverifiable"

    if "dob cannot be resolved" in d:
        return "identity_dob_unverifiable"

    if "cannot be resolved" in d:
        return "identity_unverifiable"

    if "dob is not valid" in d:
        return "identity_dob_invalid"

    if "id extracted" in d and "not valid" in d:
        return "identity_document_invalid"

    if "unsupported id type" in d or "unable to classify the id" in d:
        return "identity_document_unsupported"

    if "liveness" in d or "obstructions on the face" in d:
        return "identity_liveness_risk"

    if "barcode" in d or "mrz" in d:
        return "identity_extraction_failure"

    if "gap in address history" in d:
        return "identity_address_history_gap"

    return None


def main():
    rows = []

    with FILE.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        for row in reader:
            concept = (row.get("canonical_concept") or "").strip()
            description = (row.get("description") or "").strip()
            status = (row.get("status") or "").strip()

            if not concept and status == "active":
                inferred = infer_concept(description)
                if inferred:
                    row["canonical_concept"] = inferred

            rows.append(row)

    with FILE.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print("Final Socure concept pass complete.")


if __name__ == "__main__":
    main()