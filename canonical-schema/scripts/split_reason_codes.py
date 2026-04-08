import json
import csv
import re
from pathlib import Path
from collections import defaultdict
from typing import List, Optional


ROOT = Path(__file__).resolve().parents[1]
RAW_JSON = ROOT / "raw" / "all_providers_raw.json"
PROVIDERS_DIR = ROOT / "providers"
MIDDESK_DIR = ROOT / "middesk"


def slugify(value: str) -> str:
    value = value.strip()
    value = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", value)
    value = value.replace("&", "and")
    value = re.sub(r"[^a-zA-Z0-9]+", "_", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("_").lower()


def is_mcc_row(row: dict) -> bool:
    description = (row.get("description") or "").strip()
    return "(MCC)" in description


def is_naics_row(row: dict) -> bool:
    code = str(row.get("code") or "").strip()
    description = (row.get("description") or "").strip()

    if "(MCC)" in description:
        return False

    if not code:
        return False

    return bool(re.fullmatch(r"\d+(,\d+)?", code))


def classify_middesk_row(row: dict) -> str:
    if is_mcc_row(row):
        return "mcc"
    if is_naics_row(row):
        return "naics"
    return "kyb"


def write_csv(file_path: Path, rows: List[dict], extra_fields: Optional[List[str]] = None) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)

    base_fields = [
        "reason_code_id",
        "code",
        "description",
        "service_name",
        "service_internal_name",
        "service_id",
    ]

    fieldnames = base_fields[:]
    if extra_fields:
        fieldnames.extend(extra_fields)

    with file_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main() -> None:
    if not RAW_JSON.exists():
        raise FileNotFoundError(f"Missing input file: {RAW_JSON}")

    with RAW_JSON.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Expected top-level JSON array.")

    provider_groups = defaultdict(list)

    for row in data:
        provider_key = (row.get("service_internal_name") or "unknown").strip()
        provider_groups[provider_key].append(row)

    print("\n--- Splitting provider files ---\n")

    for provider_key, rows in sorted(provider_groups.items()):
        slug = slugify(provider_key)
        output_file = PROVIDERS_DIR / f"raw_{slug}.csv"
        write_csv(output_file, rows)
        print(f"Wrote {len(rows):>5} rows -> providers/{output_file.name}")

    middesk_rows = provider_groups.get("Middesk", [])

    middesk_mcc = []
    middesk_naics = []
    middesk_kyb = []

    for row in middesk_rows:
        bucket = classify_middesk_row(row)

        row_with_bucket = dict(row)
        row_with_bucket["middesk_bucket"] = bucket

        if bucket == "mcc":
            middesk_mcc.append(row_with_bucket)
        elif bucket == "naics":
            middesk_naics.append(row_with_bucket)
        else:
            middesk_kyb.append(row_with_bucket)

    print("\n--- Splitting Middesk buckets ---\n")

    write_csv(
        MIDDESK_DIR / "raw_middesk_mcc.csv",
        middesk_mcc,
        extra_fields=["middesk_bucket"],
    )
    print(f"Wrote {len(middesk_mcc):>5} rows -> middesk/raw_middesk_mcc.csv")

    write_csv(
        MIDDESK_DIR / "raw_middesk_naics.csv",
        middesk_naics,
        extra_fields=["middesk_bucket"],
    )
    print(f"Wrote {len(middesk_naics):>5} rows -> middesk/raw_middesk_naics.csv")

    write_csv(
        MIDDESK_DIR / "raw_middesk_kyb.csv",
        middesk_kyb,
        extra_fields=["middesk_bucket"],
    )
    print(f"Wrote {len(middesk_kyb):>5} rows -> middesk/raw_middesk_kyb.csv")

    print("\n--- Done ---\n")


if __name__ == "__main__":
    main()