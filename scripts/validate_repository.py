#!/usr/bin/env python3
"""Validate F8SUN governance, data hygiene, and repository-safe limits."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAX_FILE_BYTES = 20 * 1024 * 1024

REQUIRED_FILES = (
    "README.md",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "DATA_POLICY.md",
    ".github/CODEOWNERS",
    ".github/workflows/governance.yml",
    "scripts/validate_repository.py",
)

IGNORED_PARTS = {".git", ".venv", "venv", "__pycache__"}

TEXT_SUFFIXES = {
    ".cfg",
    ".conf",
    ".csv",
    ".env",
    ".html",
    ".ini",
    ".json",
    ".md",
    ".py",
    ".rst",
    ".sh",
    ".toml",
    ".tsv",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}

FORBIDDEN_EXPORT_FILENAMES = (
    re.compile(r"^result(?:_\d+)?\.json$", re.IGNORECASE),
    re.compile(r"^messages?(?:_\d+)?\.html?$", re.IGNORECASE),
    re.compile(r".*(?:telegram|chat)[-_. ]?export.*", re.IGNORECASE),
)

# Construct distinctive prefixes in pieces so the validator does not flag its
# own source. Findings report only the rule label and path, never the value.
SECRET_PATTERNS = (
    (
        "github-token",
        re.compile(r"gh" + r"[pousr]_[A-Za-z0-9]{20,}"),
    ),
    (
        "openai-style-key",
        re.compile(r"s" + r"k-[A-Za-z0-9_-]{20,}"),
    ),
    (
        "aws-access-key",
        re.compile(r"A" + r"KIA[0-9A-Z]{16}"),
    ),
    (
        "google-api-key",
        re.compile(r"A" + r"Iza[0-9A-Za-z_-]{30,}"),
    ),
    (
        "telegram-bot-token",
        re.compile(r"\b[0-9]{8,12}:[A-Za-z0-9_-]{30,}\b"),
    ),
    (
        "private-key",
        re.compile(r"-{5}BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-{5}"),
    ),
)


def repository_files() -> list[Path]:
    """Return regular repository files outside ignored implementation dirs."""
    return sorted(
        path
        for path in ROOT.rglob("*")
        if path.is_file() and not any(part in IGNORED_PARTS for part in path.parts)
    )


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def validate_required_files(errors: list[str]) -> None:
    for relative in REQUIRED_FILES:
        path = ROOT / relative
        if not path.is_file():
            errors.append(f"required file is missing: {relative}")
        elif path.stat().st_size == 0:
            errors.append(f"required file is empty: {relative}")


def validate_file_names_and_sizes(files: list[Path], errors: list[str]) -> None:
    for path in files:
        relative = rel(path)
        if path.stat().st_size > MAX_FILE_BYTES:
            errors.append(f"file exceeds 20 MiB limit: {relative}")

        if any(pattern.fullmatch(path.name) for pattern in FORBIDDEN_EXPORT_FILENAMES):
            errors.append(f"prohibited raw chat-export filename: {relative}")


def read_text(path: Path) -> str | None:
    if path.suffix.lower() not in TEXT_SUFFIXES:
        return None
    try:
        return path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError:
        return None


def validate_json_and_secrets(files: list[Path], errors: list[str]) -> None:
    for path in files:
        relative = rel(path)
        text = read_text(path)
        if text is None:
            continue

        if path.suffix.lower() == ".json":
            try:
                json.loads(text)
            except (json.JSONDecodeError, UnicodeDecodeError):
                errors.append(f"invalid JSON: {relative}")

        for label, pattern in SECRET_PATTERNS:
            if pattern.search(text):
                errors.append(f"possible {label} detected: {relative}")


def main() -> int:
    errors: list[str] = []
    files = repository_files()

    validate_required_files(errors)
    validate_file_names_and_sizes(files, errors)
    validate_json_and_secrets(files, errors)

    if errors:
        print("Repository validation failed:")
        for error in sorted(set(errors)):
            print(f"- {error}")
        return 1

    print(f"Repository validation passed ({len(files)} files checked).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
