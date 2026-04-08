import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "provider_mapping_socure.csv"


def contains_any(text: str, terms: list[str]) -> bool:
    return any(term in text for term in terms)


def map_concept(code: str, description: str) -> str:
    c = (code or "").lower().strip()
    d = (description or "").lower().strip()
    text = f"{c} {d}"

    # deceased / death
    if contains_any(text, ["deceased", "dead"]):
        return "identity_deceased"

    # watchlist / sanctions / pep / adverse media
    if contains_any(text, ["watchlist", "sanction"]):
        return "compliance_watchlist_match"
    if "pep" in text:
        return "compliance_pep_match"
    if contains_any(text, ["adverse media", "negative news"]):
        return "compliance_adverse_media"

    # fraud / synthetic / velocity
    if "synthetic" in text:
        return "fraud_synthetic_identity_risk"
    if "velocity" in text:
        return "fraud_velocity_risk"
    if "fraud" in text:
        return "fraud_known_fraud_association"

    # email
    if "email" in text:
        if contains_any(text, ["risk", "risky", "invalid", "disposable", "suspicious"]):
            return "contactability_email_risk"
        if contains_any(text, ["tagged as positive", "positive"]):
            return "identity_strong_positive_signal"

    # phone
    if "phone" in text:
        if contains_any(text, ["risk", "risky", "invalid", "disconnected", "voip", "pager", "suspicious"]):
            return "contactability_phone_risk"
        if contains_any(text, ["tagged as positive", "positive"]):
            return "identity_strong_positive_signal"

    # address
    if "address" in text:
        if contains_any(text, ["mismatch", "does not match", "invalid", "vacant", "mailbox", "prison", "commercial", "transient"]):
            return "identity_address_mismatch"
        if contains_any(text, ["match", "verified", "correlated", "tagged as positive", "positive"]):
            return "identity_address_match"

    # ssn
    if "ssn" in text:
        if contains_any(text, ["mismatch", "does not match", "invalid", "miskeyed", "different"]):
            return "identity_ssn_mismatch"
        if contains_any(text, ["match", "verified", "correlated", "tagged as positive", "positive"]):
            return "identity_ssn_match"

    # dob
    if contains_any(text, ["dob", "date of birth"]):
        if contains_any(text, ["nomatch", "mismatch", "does not match", "miskeyed", "different"]):
            return "identity_dob_mismatch"
        if contains_any(text, ["exact", "fuzzy", "match", "verified", "correlated", "tagged as positive", "positive"]):
            return "identity_dob_match"

    # name / alias / aka / phonetic / fuzzy
    if contains_any(text, ["aka", "alias", "phonetic", "name", "fuzzy"]):
        if contains_any(text, ["nomatch", "mismatch", "does not match", "different"]):
            return "identity_name_mismatch"
        if contains_any(text, ["exact", "verified", "correlated", "match"]):
            return "identity_name_match_exact"
        if contains_any(text, ["fuzzy", "phonetic", "alias"]):
            return "identity_name_match_fuzzy"

    # not found / no file / no record
    if contains_any(text, ["not found", "no record", "not on record", "unable to verify"]):
        return "identity_not_found"

    # positive identity / strong signals
    if contains_any(text, [
        "tagged as positive",
        "matched identity",
        "verified by",
        "representative of a broader digital footprint",
        "social networks match",
        "full name tagged as positive",
        "device tagged as positive",
        "ip address tagged as positive",
    ]):
        return "identity_strong_positive_signal"

    return ""


def main():
    rows = []

    with FILE.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        for row in reader:
            if not row["canonical_concept"].strip():
                mapped = map_concept(row["source_code"], row["source_description"])
                if mapped:
                    row["canonical_concept"] = mapped
            rows.append(row)

    with FILE.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print("Auto-fill v2 complete.")


if __name__ == "__main__":
    main()