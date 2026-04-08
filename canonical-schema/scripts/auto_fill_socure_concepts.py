import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "provider_mapping_socure.csv"


def map_concept(code: str, description: str) -> str:
    c = code.lower()
    d = description.lower()

    # NAME MATCH
    if "aka" in c or "alias" in d:
        if "exact" in c:
            return "identity_name_match_exact"
        if "fuzzy" in c or "phonetic" in c:
            return "identity_name_match_fuzzy"
        return "identity_name_match_fuzzy"

    # DOB
    if "dob" in c or "date of birth" in d:
        if "nomatch" in c or "does not match" in d:
            return "identity_dob_mismatch"
        return "identity_dob_match"

    # SSN
    if "ssn" in c:
        if "mismatch" in d:
            return "identity_ssn_mismatch"
        return "identity_ssn_match"

    # DECEASED
    if "deceased" in d:
        return "identity_deceased"

    # EMAIL
    if "email" in d:
        return "contactability_email_risk"

    # PHONE
    if "phone" in d:
        return "contactability_phone_risk"

    # WATCHLIST / COMPLIANCE
    if "watchlist" in d:
        return "compliance_watchlist_match"
    if "pep" in d:
        return "compliance_pep_match"
    if "adverse" in d:
        return "compliance_adverse_media"

    # FRAUD
    if "fraud" in d:
        return "fraud_known_fraud_association"

    # DEFAULT
    return ""


def main():
    rows = []

    with FILE.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            if not row["canonical_concept"]:  # don't overwrite manual work
                mapped = map_concept(row["source_code"], row["source_description"])
                if mapped:
                    row["canonical_concept"] = mapped
            rows.append(row)

    with FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print("\nAuto-fill complete.\n")


if __name__ == "__main__":
    main()