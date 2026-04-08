import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "provider_mapping_socure.csv"


def contains_any(text: str, terms: list[str]) -> bool:
    return any(term in text for term in terms)


def infer_status_and_concept(description: str, existing_concept: str, existing_status: str):
    d = (description or "").lower().strip()
    concept = (existing_concept or "").strip()
    status = (existing_status or "").strip()

    if status:
        final_status = status
    else:
        final_status = "active"

    # Deprecated
    if "(deprecated)" in d or "deprecated" in d:
        if not status:
            final_status = "deprecated"

    # Not used in current API-based flow
    inactive_terms = [
        "profile image",
        "selfie",
        "document image",
        "document number",
        "driver license image",
        "drivers license image",
        "identification image",
        "photo",
        "facial",
        "face match",
        "device",
        "ip address",
        "ip ",
        "aamva",
    ]
    if contains_any(d, inactive_terms):
        if not status:
            final_status = "inactive_not_used"

    # Canonical concept fills
    if not concept:
        # AAMVA / ID / document
        if contains_any(d, ["aamva", "driver license", "drivers license", "document", "identification", "id card"]):
            concept = "identity_document_verification"

        # Device / IP
        elif "device" in d:
            concept = "identity_device_risk"
        elif "ip address" in d or d.startswith("ip ") or " ip " in d:
            concept = "identity_ip_risk"

        # Bank / account / routing
        elif contains_any(d, ["routing number", "account number", "bank account", "banking", "dda", "aba"]):
            if contains_any(d, ["correlated", "ownership", "owner", "belongs to", "linked to", "associated with"]):
                concept = "bank_account_ownership_match"
            elif contains_any(d, ["seen in", "15 days", "30 days", "60 days", "90 days", "recent", "recency"]):
                concept = "bank_account_recency_signal"
            else:
                concept = "bank_account_supporting_signal"

        # Velocity
        elif "velocity" in d or contains_any(d, ["seen in the last", "seen between", "seen within"]):
            concept = "fraud_velocity_risk"

        # Address risk
        elif "address" in d and contains_any(d, [
            "vacant", "commercial", "institutional", "transient", "mailbox",
            "private mailbox", "prison", "campground", "trailer park", "invalid"
        ]):
            concept = "identity_address_risk"

        # Age
        elif "age" in d or "under 18" in d:
            concept = "identity_age_risk"

    return final_status, concept


def main():
    rows = []

    with FILE.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])

        if "status" not in fieldnames:
            fieldnames.append("status")

        for row in reader:
            existing_concept = row.get("canonical_concept", "")
            existing_status = row.get("status", "")
            description = row.get("source_description", "")

            status, concept = infer_status_and_concept(
                description=description,
                existing_concept=existing_concept,
                existing_status=existing_status,
            )

            row["status"] = status
            if concept and not existing_concept.strip():
                row["canonical_concept"] = concept

            rows.append(row)

    with FILE.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print("Updated provider_mapping_socure.csv with status + additional canonical concepts.")


if __name__ == "__main__":
    main()