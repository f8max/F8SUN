#!/usr/bin/env python3
"""Repeatable release builder for the Russian anti-fraud guide.

Builds PDF, DOCX and EPUB3 from a selected canonical Markdown manuscript.
Mermaid diagrams are rendered by an explicitly supplied Mermaid CLI. The build
is labelled repeatable rather than
bit-reproducible because third-party PDF and OOXML libraries may add
implementation-specific identifiers even when timestamps are normalized.
"""

from __future__ import annotations

import argparse
import dataclasses
import datetime as dt
import hashlib
import html
import importlib.metadata
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
import unicodedata
import zipfile
from pathlib import Path
from typing import Any, Iterable, Sequence


ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE = ROOT / "output" / "ANTIFRAUD_ULTIMATE_GUIDE_2026_RU_LOCAL.md"
DEFAULT_OUT_DIR = ROOT / "dist_local"
DEFAULT_LEDGER = ROOT / "research" / "SOURCE_LEDGER.md"
DEFAULT_CLAIM_MAP = ROOT / "research" / "CLAIM_MAP.md"
DEFAULT_REQUIREMENTS = ROOT / "requirements-build.txt"
DEFAULT_PACKAGE_JSON = ROOT / "package.json"
DEFAULT_PACKAGE_LOCK = ROOT / "package-lock.json"
DEFAULT_EPOCH = 1784592000  # 2026-07-21T00:00:00Z
WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
DRAWING_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
SVG_NS = "http://schemas.microsoft.com/office/drawing/2016/SVG/main"


class BuildError(RuntimeError):
    """Expected build or preflight failure with a user-actionable message."""


@dataclasses.dataclass(frozen=True)
class Heading:
    level: int
    title: str
    slug: str
    word_bookmark: str


@dataclasses.dataclass(frozen=True)
class MermaidAsset:
    index: int
    token: str
    caption: str
    alt: str
    svg_path: Path
    png_path: Path
    relative_svg: str
    relative_png: str


@dataclasses.dataclass(frozen=True)
class StaticAsset:
    source_path: Path
    output_path: Path
    relative_path: str
    media_type: str
    alt: str


def sha256_path(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def exact_path(value: str | Path, *, base: Path | None = None) -> Path:
    candidate = Path(value).expanduser()
    if not candidate.is_absolute():
        candidate = (base or Path.cwd()) / candidate
    return candidate.resolve()


def fixed_datetime(epoch: int) -> dt.datetime:
    return dt.datetime.fromtimestamp(epoch, tz=dt.timezone.utc)


def iso_datetime(epoch: int) -> str:
    return fixed_datetime(epoch).strftime("%Y-%m-%dT%H:%M:%SZ")


def safe_clean_directory(path: Path) -> None:
    resolved = path.resolve()
    home = Path.home().resolve()
    anchor = Path(resolved.anchor).resolve()
    if resolved in {home, anchor, ROOT.resolve(), ROOT.parent.resolve()}:
        raise BuildError(f"Refusing to clean a broad directory: {resolved}")
    if len(resolved.parts) < 4:
        raise BuildError(f"Refusing to clean an insufficiently specific path: {resolved}")
    if resolved.exists():
        if not resolved.is_dir():
            raise BuildError(f"Output path exists and is not a directory: {resolved}")
        shutil.rmtree(resolved)


def parse_front_matter(text: str) -> tuple[dict[str, str], str]:
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = normalized.splitlines()
    if not lines or lines[0].strip() != "---":
        raise BuildError("The manuscript must begin with YAML-style front matter.")

    end_index: int | None = None
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            end_index = index
            break
    if end_index is None:
        raise BuildError("Front matter is not closed by a second --- line.")

    metadata: dict[str, str] = {}
    for line in lines[1:end_index]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            raise BuildError(f"Unsupported front matter line: {line}")
        key, value = line.split(":", 1)
        clean_key = key.strip()
        clean_value = value.strip().strip('"').strip("'")
        if not clean_key:
            raise BuildError(f"Empty front matter key in line: {line}")
        metadata[clean_key] = clean_value

    if not metadata.get("title"):
        raise BuildError("Front matter must define title.")
    metadata.setdefault("subtitle", "")
    metadata.setdefault("author", "")
    metadata.setdefault("language", "ru-RU")
    metadata.setdefault("date", "21.07.2026")
    metadata.setdefault("edition", "Local repeatable release")

    body = "\n".join(lines[end_index + 1 :]).strip() + "\n"
    if not body.strip():
        raise BuildError("The manuscript body is empty.")
    return metadata, body


def extract_cutoff_date(metadata: dict[str, str], body: str) -> str:
    candidates = [
        metadata.get("cutoff_date", ""),
        metadata.get("date", ""),
        body[:8000],
    ]
    for candidate in candidates:
        match = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", candidate)
        if match:
            return match.group(1)
    raise BuildError("No ISO cutoff date was found in front matter or the manuscript opening.")


RAW_LATEX_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("display delimiter opening", re.compile(r"\\\[")),
    ("display delimiter closing", re.compile(r"\\\]")),
    ("double-dollar formula", re.compile(r"(?<!\\)\$\$")),
    (
        "LaTeX environment",
        re.compile(r"\\begin\{(?:equation|align|gather|multline|math)\*?\}", re.I),
    ),
)


def reject_raw_latex(text: str, context: str) -> None:
    hits = [label for label, pattern in RAW_LATEX_PATTERNS if pattern.search(text)]
    if hits:
        raise BuildError(
            f"Raw LaTeX remains in {context}: {', '.join(hits)}. "
            "Render or rewrite formulas before release."
        )


def reject_raw_reader_tokens(text: str, context: str) -> None:
    raw_mermaid_marker = chr(96) * 3 + "mermaid"
    forbidden = [
        raw_mermaid_marker,
        "~~~mermaid",
        "sequenceDiagram",
        "flowchart LR",
        "flowchart TD",
        "\\[",
        "\\]",
    ]
    hits = [token for token in forbidden if token in text]
    if hits:
        raise BuildError(f"Raw reader-facing source tokens remain in {context}: {hits}")


def tool_invocation(path: Path) -> list[str]:
    suffix = path.suffix.lower()
    if os.name == "nt" and suffix in {".cmd", ".bat"}:
        return ["cmd.exe", "/d", "/s", "/c", str(path)]
    if os.name == "nt" and suffix == ".ps1":
        return [
            "powershell.exe",
            "-NoLogo",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(path),
        ]
    return [str(path)]


def resolve_tool(explicit: str | None, fallback_name: str, label: str) -> Path:
    if explicit:
        candidate = exact_path(explicit)
        if not candidate.is_file():
            raise BuildError(f"{label} executable does not exist: {candidate}")
        return candidate
    discovered = shutil.which(fallback_name)
    if not discovered:
        raise BuildError(
            f"{label} is required but was not found. Supply its exact path on the CLI."
        )
    return Path(discovered).resolve()


def run_command(
    command: Sequence[str],
    *,
    label: str,
    env: dict[str, str] | None = None,
    cwd: Path | None = None,
) -> subprocess.CompletedProcess[str]:
    process = subprocess.run(
        list(command),
        cwd=str(cwd) if cwd else None,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if process.returncode != 0:
        details = "\n".join(
            item
            for item in [
                f"{label} failed with exit code {process.returncode}.",
                process.stdout.strip(),
                process.stderr.strip(),
            ]
            if item
        )
        raise BuildError(details)
    return process


def tool_version(path: Path, arguments: Sequence[str] = ("--version",)) -> str:
    try:
        process = run_command(
            [*tool_invocation(path), *arguments],
            label=f"Version check for {path.name}",
        )
    except BuildError as exc:
        return f"unavailable: {exc}"
    combined = "\n".join(
        item for item in [process.stdout.strip(), process.stderr.strip()] if item
    )
    return combined.splitlines()[0] if combined else "version not reported"


def clean_inline_markup(value: str) -> str:
    result = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", value)
    result = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", result)
    result = re.sub(r"\{#[^\s{}]+\}\s*$", "", result)
    result = re.sub(r"[*_~]+", "", result)
    result = result.replace(chr(96), "")
    result = re.sub(r"<[^>]+>", "", result)
    return html.unescape(result).strip()


def slugify(value: str, used: set[str]) -> str:
    normalized = unicodedata.normalize("NFKC", clean_inline_markup(value)).lower()
    normalized = re.sub(r"[^\w\u0400-\u04ff]+", "-", normalized, flags=re.UNICODE)
    normalized = normalized.strip("-_") or "section"
    candidate = normalized
    counter = 2
    while candidate in used:
        candidate = f"{normalized}-{counter}"
        counter += 1
    used.add(candidate)
    return candidate


def prepare_heading_ids(markdown_text: str) -> tuple[str, list[Heading]]:
    lines = markdown_text.splitlines()
    result: list[str] = []
    headings: list[Heading] = []
    used: set[str] = set()
    active_fence: str | None = None
    fence_pattern = re.compile(r"^\s*((?:\x60{3,})|(?:~{3,}))")
    heading_pattern = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
    explicit_id_pattern = re.compile(r"\s+\{#([^\s{}]+)\}\s*$")

    for line in lines:
        fence_match = fence_pattern.match(line)
        if fence_match:
            marker = fence_match.group(1)[0]
            if active_fence is None:
                active_fence = marker
            elif active_fence == marker:
                active_fence = None
            result.append(line)
            continue

        if active_fence is not None:
            result.append(line)
            continue

        match = heading_pattern.match(line)
        if not match:
            result.append(line)
            continue

        marks, raw_title = match.groups()
        explicit = explicit_id_pattern.search(raw_title)
        if explicit:
            slug = explicit.group(1)
            title_source = explicit_id_pattern.sub("", raw_title).strip()
            if slug in used:
                slug = slugify(slug, used)
            else:
                used.add(slug)
        else:
            title_source = raw_title.strip().rstrip("#").strip()
            slug = slugify(title_source, used)

        title = clean_inline_markup(title_source)
        word_bookmark = f"h_{len(headings) + 1:04d}"
        headings.append(
            Heading(
                level=len(marks),
                title=title,
                slug=slug,
                word_bookmark=word_bookmark,
            )
        )
        result.append(f"{marks} {title_source} {{#{slug}}}")

    if not headings:
        raise BuildError("No Markdown headings were found.")
    return "\n".join(result).strip() + "\n", headings


def extract_mermaid_caption(code: str, index: int) -> str:
    for line in code.splitlines():
        match = re.match(r"\s*%%\s*(?:caption|title)\s*:\s*(.+?)\s*$", line, re.I)
        if match:
            return clean_inline_markup(match.group(1))
    return f"Схема {index}. Архитектурная диаграмма"


def render_mermaid_assets(
    markdown_text: str,
    *,
    assets_dir: Path,
    mmdc_path: Path | None,
    puppeteer_config: Path | None,
    epoch: int,
) -> tuple[str, list[MermaidAsset]]:
    fence_pattern = re.compile(
        r"(?P<fence>(?:\x60{3,})|(?:~{3,}))mermaid[^\n]*\n"
        r"(?P<code>.*?)(?P=fence)[ \t]*(?:\n|$)",
        re.I | re.S,
    )
    matches = list(fence_pattern.finditer(markdown_text))
    if not matches:
        return markdown_text, []
    if mmdc_path is None:
        raise BuildError(
            "Mermaid fences are present, but no working mmdc renderer was supplied."
        )

    assets_dir.mkdir(parents=True, exist_ok=True)
    environment = os.environ.copy()
    environment["SOURCE_DATE_EPOCH"] = str(epoch)
    mermaid_assets: list[MermaidAsset] = []

    with tempfile.TemporaryDirectory(prefix="antifraud_mermaid_") as temp_name:
        temp_dir = Path(temp_name)
        for index, match in enumerate(matches, start=1):
            code = match.group("code").strip() + "\n"
            caption = extract_mermaid_caption(code, index)
            alt = caption
            stem = f"diagram_{index:02d}"
            source_file = temp_dir / f"{stem}.mmd"
            svg_path = assets_dir / f"{stem}.svg"
            png_path = assets_dir / f"{stem}.png"
            source_file.write_text(code, encoding="utf-8", newline="\n")

            common = ["-i", str(source_file), "-b", "transparent"]
            if puppeteer_config is not None:
                common.extend(["-p", str(puppeteer_config)])

            run_command(
                [
                    *tool_invocation(mmdc_path),
                    *common,
                    "-o",
                    str(svg_path),
                ],
                label=f"Mermaid SVG render {index}",
                env=environment,
                cwd=ROOT,
            )
            run_command(
                [
                    *tool_invocation(mmdc_path),
                    *common,
                    "-o",
                    str(png_path),
                    "-s",
                    "2",
                ],
                label=f"Mermaid PNG fallback render {index}",
                env=environment,
                cwd=ROOT,
            )

            if not svg_path.is_file() or "<svg" not in svg_path.read_text(
                encoding="utf-8", errors="replace"
            ):
                raise BuildError(f"mmdc did not create a valid SVG: {svg_path}")
            if not png_path.is_file() or png_path.stat().st_size == 0:
                raise BuildError(f"mmdc did not create a PNG fallback: {png_path}")

            mermaid_assets.append(
                MermaidAsset(
                    index=index,
                    token=f"@@MERMAID_{index:04d}@@",
                    caption=caption,
                    alt=alt,
                    svg_path=svg_path,
                    png_path=png_path,
                    relative_svg=f"assets/{svg_path.name}",
                    relative_png=f"assets/{png_path.name}",
                )
            )

    iterator = iter(mermaid_assets)

    def replacement(_: re.Match[str]) -> str:
        asset = next(iterator)
        return f"\n\n{asset.token}\n\n"

    processed = fence_pattern.sub(replacement, markdown_text)
    raw_marker = chr(96) * 3 + "mermaid"
    if raw_marker in processed or "~~~mermaid" in processed:
        raise BuildError("Mermaid preprocessing left a raw Mermaid fence.")
    return processed, mermaid_assets


def copy_static_images(
    markdown_text: str,
    *,
    source_dir: Path,
    assets_dir: Path,
) -> tuple[str, list[StaticAsset]]:
    pattern = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)(?:\s+[\"'][^\"']*[\"'])?\)")
    copied: dict[Path, StaticAsset] = {}

    def replace(match: re.Match[str]) -> str:
        alt = clean_inline_markup(match.group(1)) or "Иллюстрация"
        target = match.group(2)
        if re.match(r"^(?:https?:|data:)", target, re.I):
            raise BuildError(
                f"External or data-URI image must be vendored for an offline release: {target}"
            )
        clean_target = target.split("#", 1)[0].split("?", 1)[0]
        source_path = exact_path(clean_target, base=source_dir)
        if not source_path.is_file():
            raise BuildError(f"Referenced image does not exist: {source_path}")

        if source_path not in copied:
            media_type = mimetypes.guess_type(source_path.name)[0] or "application/octet-stream"
            if not media_type.startswith("image/"):
                raise BuildError(f"Unsupported non-image asset: {source_path}")
            digest = sha256_path(source_path)[:12]
            safe_stem = re.sub(r"[^A-Za-z0-9_-]+", "_", source_path.stem).strip("_")
            safe_stem = safe_stem or "image"
            output_name = f"{safe_stem}_{digest}{source_path.suffix.lower()}"
            output_path = assets_dir / output_name
            assets_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_path, output_path)
            copied[source_path] = StaticAsset(
                source_path=source_path,
                output_path=output_path,
                relative_path=f"assets/{output_name}",
                media_type=media_type,
                alt=alt,
            )
        return f"![{alt}]({copied[source_path].relative_path})"

    return pattern.sub(replace, markdown_text), list(copied.values())


def inject_mermaid_html(
    markdown_text: str, mermaid_assets: Sequence[MermaidAsset]
) -> str:
    result = markdown_text
    for asset in mermaid_assets:
        figure = (
            f'<figure class="diagram" id="diagram-{asset.index:02d}">'
            f'<img src="{html.escape(asset.relative_svg)}" '
            f'alt="{html.escape(asset.alt)}">'
            f"<figcaption>{html.escape(asset.caption)}</figcaption>"
            "</figure>"
        )
        result = result.replace(asset.token, figure)
    return result


def render_markdown_html(markdown_text: str) -> str:
    try:
        import markdown
    except ImportError as exc:
        raise BuildError(f"Python-Markdown is required: {exc}") from exc
    return markdown.markdown(
        markdown_text,
        extensions=[
            "tables",
            "fenced_code",
            "sane_lists",
            "toc",
            "attr_list",
            "md_in_html",
        ],
        output_format="html5",
    )


def toc_tree(headings: Sequence[Heading], max_level: int = 3) -> list[dict[str, Any]]:
    root: list[dict[str, Any]] = []
    stack: list[tuple[int, list[dict[str, Any]]]] = [(0, root)]
    for heading in headings:
        if heading.level > max_level:
            continue
        while len(stack) > 1 and stack[-1][0] >= heading.level:
            stack.pop()
        node: dict[str, Any] = {"heading": heading, "children": []}
        stack[-1][1].append(node)
        stack.append((heading.level, node["children"]))
    return root


def render_toc_nodes(nodes: Sequence[dict[str, Any]]) -> str:
    if not nodes:
        return ""
    chunks = ["<ol>"]
    for node in nodes:
        heading: Heading = node["heading"]
        chunks.append(
            f'<li class="toc-level-{heading.level}">'
            f'<a href="#{html.escape(heading.slug)}">'
            f"{html.escape(heading.title)}</a>"
        )
        chunks.append(render_toc_nodes(node["children"]))
        chunks.append("</li>")
    chunks.append("</ol>")
    return "".join(chunks)


HTML_CSS = r"""
@page {
  size: A5;
  margin: 15mm 13mm 17mm;
  @bottom-center {
    content: counter(page);
    font-family: "DejaVu Sans", sans-serif;
    font-size: 8pt;
    color: #667085;
  }
}
@page cover {
  size: A5;
  margin: 18mm;
  @bottom-center { content: none; }
}
html {
  font-family: "DejaVu Sans", sans-serif;
  font-size: 9.35pt;
  line-height: 1.42;
  color: #17212b;
  hyphens: auto;
}
body { margin: 0; }
.cover {
  page: cover;
  min-height: 170mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  break-after: page;
}
.cover h1 {
  bookmark-level: none;
  font-size: 25pt;
  line-height: 1.08;
  color: #0b486b;
  margin: 0 0 8mm;
}
.cover .subtitle { font-size: 13pt; color: #315d73; margin-bottom: 10mm; }
.cover .meta { font-size: 9pt; color: #667085; }
.cover .canonical-title-line {
  font-size: 6.8pt;
  color: #667085;
  white-space: nowrap;
  letter-spacing: -.02em;
  margin-top: 5mm;
}
.toc {
  break-after: page;
}
.toc > h1 {
  bookmark-level: none;
  break-before: avoid;
}
.toc ol { list-style: none; padding-left: 0; margin: 0; }
.toc ol ol { padding-left: 5mm; }
.toc li { margin: 1.1mm 0; }
.toc a {
  color: #174a65;
  text-decoration: none;
}
.toc a::after {
  content: leader(".") target-counter(attr(href), page);
  color: #667085;
}
h1, h2, h3, h4 { font-weight: 700; color: #0b486b; }
h1 {
  font-size: 18.5pt;
  line-height: 1.12;
  break-before: page;
  margin: 0 0 6mm;
}
h2 {
  font-size: 13.5pt;
  color: #11698e;
  margin: 7mm 0 2.3mm;
  break-after: avoid;
}
h3 {
  font-size: 11pt;
  color: #174a65;
  margin: 5mm 0 1.8mm;
  break-after: avoid;
}
h4 { font-size: 9.8pt; break-after: avoid; }
p { margin: 0 0 2.4mm; orphans: 3; widows: 3; }
a { color: #11698e; text-decoration: none; overflow-wrap: anywhere; }
ul, ol { margin: 1.5mm 0 2.8mm; padding-left: 6mm; }
li { margin: .7mm 0; }
blockquote {
  margin: 3mm 0;
  padding: 2.5mm 3mm;
  border-left: 1mm solid #d08b28;
  background: #fff8ed;
}
code {
  font-family: "DejaVu Sans Mono", monospace;
  font-size: .9em;
  background: #eef3f5;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: #eef3f5;
  border-left: 1mm solid #3d91b8;
  padding: 2.5mm;
  font-size: 7.2pt;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 7.3pt;
  margin: 3mm 0;
  break-inside: auto;
}
thead { display: table-header-group; }
tr { break-inside: avoid; }
th, td {
  border: .25mm solid #a9bec8;
  padding: 1.25mm;
  vertical-align: top;
  overflow-wrap: anywhere;
}
th { background: #dceef5; color: #173b4f; font-weight: 700; }
figure.diagram, figure {
  margin: 4mm auto;
  break-inside: avoid;
  text-align: center;
}
figure img { max-width: 100%; max-height: 155mm; }
figcaption {
  margin-top: 1.5mm;
  font-size: 7.8pt;
  color: #52606d;
}
img { max-width: 100%; height: auto; }
"""


def full_html_document(
    metadata: dict[str, str],
    body_html: str,
    headings: Sequence[Heading],
) -> str:
    title = html.escape(metadata["title"])
    subtitle = html.escape(metadata.get("subtitle", ""))
    author = html.escape(metadata.get("author", ""))
    date = html.escape(metadata.get("date", ""))
    edition = html.escape(metadata.get("edition", ""))
    toc_html = render_toc_nodes(toc_tree(headings))
    return f"""<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="author" content="{author}">
  <meta name="dcterms.created" content="{date}">
  <title>{title}</title>
  <style>{HTML_CSS}</style>
</head>
<body>
  <section class="cover">
    <h1>{title}</h1>
    <p class="subtitle">{subtitle}</p>
    <p class="meta">{author}</p>
    <p class="meta">{date} · {edition}</p>
    <p class="canonical-title-line">{title}</p>
  </section>
  <nav class="toc" id="toc" aria-label="Оглавление">
    <h1>Оглавление</h1>
    {toc_html}
  </nav>
  <main>{body_html}</main>
</body>
</html>
"""


def build_pdf(
    document_html: str,
    *,
    target: Path,
    base_url: Path,
    weasyprint_bin: Path,
    epoch: int,
) -> None:
    environment = os.environ.copy()
    environment["SOURCE_DATE_EPOCH"] = str(epoch)
    with tempfile.TemporaryDirectory(prefix="antifraud_html_") as temp_name:
        html_path = Path(temp_name) / "book.html"
        html_path.write_text(document_html, encoding="utf-8", newline="\n")
        run_command(
            [
                *tool_invocation(weasyprint_bin),
                "--encoding",
                "utf-8",
                "--base-url",
                str(base_url),
                "--custom-metadata",
                "--pdf-tags",
                str(html_path),
                str(target),
            ],
            label="WeasyPrint PDF build",
            env=environment,
            cwd=ROOT,
        )
    if not target.is_file() or target.stat().st_size == 0:
        raise BuildError(f"PDF was not created: {target}")


def set_run_language(run_properties: Any, language: str = "ru-RU") -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    language_node = run_properties.find(qn("w:lang"))
    if language_node is None:
        language_node = OxmlElement("w:lang")
        run_properties.append(language_node)
    language_node.set(qn("w:val"), language)
    language_node.set(qn("w:eastAsia"), language)


def configure_docx_styles(document: Any) -> None:
    from docx.enum.style import WD_STYLE_TYPE
    from docx.oxml.ns import qn
    from docx.shared import Pt, RGBColor

    styles = document.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")
    normal.font.size = Pt(9.2)
    normal.paragraph_format.space_after = Pt(5.5)
    normal.paragraph_format.line_spacing = 1.12
    set_run_language(normal.element.get_or_add_rPr())

    heading_tokens = {
        "Heading 1": (18, RGBColor(11, 72, 107), 12, 7),
        "Heading 2": (13.5, RGBColor(17, 105, 142), 10, 4),
        "Heading 3": (11, RGBColor(23, 74, 101), 8, 3),
        "Heading 4": (9.8, RGBColor(23, 74, 101), 6, 2),
    }
    for style_name, (size, color, before, after) in heading_tokens.items():
        style = styles[style_name]
        style.font.name = "Aptos Display"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos Display")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = color
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True
        if style_name == "Heading 1":
            style.paragraph_format.page_break_before = True
        set_run_language(style.element.get_or_add_rPr())

    custom_styles = {
        "Cover Title": (WD_STYLE_TYPE.PARAGRAPH, 25, True, RGBColor(11, 72, 107)),
        "Cover Subtitle": (
            WD_STYLE_TYPE.PARAGRAPH,
            13,
            False,
            RGBColor(49, 93, 115),
        ),
        "TOC Heading Local": (
            WD_STYLE_TYPE.PARAGRAPH,
            18,
            True,
            RGBColor(11, 72, 107),
        ),
        "Code Block Local": (
            WD_STYLE_TYPE.PARAGRAPH,
            7.5,
            False,
            RGBColor(23, 33, 43),
        ),
        "Figure Caption Local": (
            WD_STYLE_TYPE.PARAGRAPH,
            8,
            False,
            RGBColor(82, 96, 109),
        ),
    }
    for name, (style_type, size, bold, color) in custom_styles.items():
        style = styles[name] if name in styles else styles.add_style(name, style_type)
        style.font.name = "Aptos"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")
        style.font.size = Pt(size)
        style.font.bold = bold
        style.font.color.rgb = color
        set_run_language(style.element.get_or_add_rPr())

    code_style = styles["Code Block Local"]
    code_style.font.name = "Cascadia Mono"
    code_style._element.rPr.rFonts.set(qn("w:eastAsia"), "Cascadia Mono")
    code_style.paragraph_format.left_indent = Pt(8)
    code_style.paragraph_format.space_before = Pt(4)
    code_style.paragraph_format.space_after = Pt(5)

    caption_style = styles["Figure Caption Local"]
    caption_style.paragraph_format.space_before = Pt(2)
    caption_style.paragraph_format.space_after = Pt(6)
    caption_style.paragraph_format.keep_with_next = False


def create_numbering_definitions(document: Any) -> tuple[int, int]:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    numbering = document.part.numbering_part.element
    existing_abstract = [
        int(node.get(qn("w:abstractNumId")))
        for node in numbering.findall(qn("w:abstractNum"))
        if node.get(qn("w:abstractNumId"), "").isdigit()
    ]
    next_abstract = max(existing_abstract, default=-1) + 1

    def add_abstract(abstract_id: int, kind: str) -> None:
        abstract = OxmlElement("w:abstractNum")
        abstract.set(qn("w:abstractNumId"), str(abstract_id))
        multi = OxmlElement("w:multiLevelType")
        multi.set(qn("w:val"), "multilevel")
        abstract.append(multi)

        for level in range(3):
            level_node = OxmlElement("w:lvl")
            level_node.set(qn("w:ilvl"), str(level))
            start = OxmlElement("w:start")
            start.set(qn("w:val"), "1")
            level_node.append(start)

            number_format = OxmlElement("w:numFmt")
            number_format.set(qn("w:val"), "decimal" if kind == "ordered" else "bullet")
            level_node.append(number_format)

            level_text = OxmlElement("w:lvlText")
            if kind == "ordered":
                level_text.set(qn("w:val"), f"%{level + 1}.")
            else:
                level_text.set(qn("w:val"), "•")
            level_node.append(level_text)

            justification = OxmlElement("w:lvlJc")
            justification.set(qn("w:val"), "left")
            level_node.append(justification)

            paragraph_properties = OxmlElement("w:pPr")
            tabs = OxmlElement("w:tabs")
            tab = OxmlElement("w:tab")
            tab.set(qn("w:val"), "num")
            tab.set(qn("w:pos"), str(420 + level * 360))
            tabs.append(tab)
            paragraph_properties.append(tabs)
            indentation = OxmlElement("w:ind")
            indentation.set(qn("w:left"), str(420 + level * 360))
            indentation.set(qn("w:hanging"), "240")
            paragraph_properties.append(indentation)
            level_node.append(paragraph_properties)
            abstract.append(level_node)

        numbering.append(abstract)

    ordered_id = next_abstract
    bullet_id = next_abstract + 1
    add_abstract(ordered_id, "ordered")
    add_abstract(bullet_id, "bullet")
    return ordered_id, bullet_id


def create_number_instance(document: Any, abstract_id: int) -> int:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    numbering = document.part.numbering_part.element
    existing = [
        int(node.get(qn("w:numId")))
        for node in numbering.findall(qn("w:num"))
        if node.get(qn("w:numId"), "").isdigit()
    ]
    num_id = max(existing, default=0) + 1
    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(num_id))
    abstract = OxmlElement("w:abstractNumId")
    abstract.set(qn("w:val"), str(abstract_id))
    num.append(abstract)
    numbering.append(num)
    return num_id


def apply_numbering(paragraph: Any, num_id: int, level: int) -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    properties = paragraph._p.get_or_add_pPr()
    num_properties = properties.find(qn("w:numPr"))
    if num_properties is None:
        num_properties = OxmlElement("w:numPr")
        properties.append(num_properties)
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), str(max(0, min(level, 2))))
    num = OxmlElement("w:numId")
    num.set(qn("w:val"), str(num_id))
    num_properties.append(ilvl)
    num_properties.append(num)


def add_word_field(paragraph: Any, instruction: str, placeholder: str = "") -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    begin.set(qn("w:dirty"), "true")
    instruction_node = OxmlElement("w:instrText")
    instruction_node.set(qn("xml:space"), "preserve")
    instruction_node.text = f" {instruction} "
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    text_node = OxmlElement("w:t")
    text_node.text = placeholder
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instruction_node, separate, text_node, end])


def enable_update_fields(document: Any) -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    settings = document.settings.element
    existing = settings.find(qn("w:updateFields"))
    if existing is None:
        existing = OxmlElement("w:updateFields")
        settings.append(existing)
    existing.set(qn("w:val"), "true")


def add_bookmark(paragraph: Any, name: str, bookmark_id: int) -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    start = OxmlElement("w:bookmarkStart")
    start.set(qn("w:id"), str(bookmark_id))
    start.set(qn("w:name"), name[:40])
    end = OxmlElement("w:bookmarkEnd")
    end.set(qn("w:id"), str(bookmark_id))
    paragraph._p.insert(0, start)
    paragraph._p.append(end)


def add_hyperlink(paragraph: Any, text: str, target: str, bookmarks: dict[str, str]) -> None:
    from docx.opc.constants import RELATIONSHIP_TYPE as RT
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    hyperlink = OxmlElement("w:hyperlink")
    if target.startswith("#"):
        slug = target[1:]
        anchor = bookmarks.get(slug)
        if not anchor:
            paragraph.add_run(text)
            return
        hyperlink.set(qn("w:anchor"), anchor)
    else:
        relationship_id = paragraph.part.relate_to(target, RT.HYPERLINK, is_external=True)
        hyperlink.set(qn("r:id"), relationship_id)

    run = OxmlElement("w:r")
    properties = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "11698E")
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    properties.extend([color, underline])
    run.append(properties)
    text_node = OxmlElement("w:t")
    text_node.text = text
    run.append(text_node)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


INLINE_TOKEN_PATTERN = re.compile(
    r"(!\[[^\]]*\]\([^)]+\)|"
    r"\[[^\]]+\]\([^)]+\)|"
    r"\*\*[^*]+\*\*|"
    r"\x60[^\x60]+\x60|"
    r"(?<!\*)\*[^*]+\*(?!\*))"
)


DOCX_MERMAID_LINE_PREFIX = re.compile(
    r"^(\s*)(flowchart|graph|sequenceDiagram|classDiagram|"
    r"stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|mindmap|timeline)\b",
    re.I,
)


def protect_docx_text_from_false_mermaid_detection(value: str) -> str:
    """Keep visible wording while preventing keyword-only Mermaid false positives."""

    return DOCX_MERMAID_LINE_PREFIX.sub(
        lambda match: f"{match.group(1)}\u2060{match.group(2)}",
        value,
    )


def resolve_processed_asset(target: str, out_dir: Path) -> Path:
    clean = target.split("#", 1)[0].split("?", 1)[0]
    return exact_path(clean, base=out_dir)


def add_inline_markdown(
    paragraph: Any,
    value: str,
    *,
    bookmarks: dict[str, str],
    out_dir: Path,
) -> None:
    value = protect_docx_text_from_false_mermaid_detection(value)
    position = 0
    for match in INLINE_TOKEN_PATTERN.finditer(value):
        if match.start() > position:
            paragraph.add_run(value[position : match.start()])
        token = match.group(0)

        image_match = re.fullmatch(r"!\[([^\]]*)\]\(([^)]+)\)", token)
        link_match = re.fullmatch(r"\[([^\]]+)\]\(([^)]+)\)", token)
        if image_match:
            alt, target = image_match.groups()
            path = resolve_processed_asset(target, out_dir)
            if not path.is_file():
                raise BuildError(f"DOCX image is missing: {path}")
            if path.suffix.lower() == ".svg":
                raise BuildError(
                    f"Standalone SVG image lacks a raster fallback for DOCX: {path}"
                )
            from docx.shared import Mm

            shape = paragraph.add_run().add_picture(str(path), width=Mm(112))
            shape._inline.docPr.set("descr", clean_inline_markup(alt) or "Иллюстрация")
        elif link_match:
            label, target = link_match.groups()
            add_hyperlink(
                paragraph,
                protect_docx_text_from_false_mermaid_detection(
                    clean_inline_markup(label)
                ),
                target,
                bookmarks,
            )
        elif token.startswith("**") and token.endswith("**"):
            paragraph.add_run(
                protect_docx_text_from_false_mermaid_detection(token[2:-2])
            ).bold = True
        elif token.startswith(chr(96)) and token.endswith(chr(96)):
            run = paragraph.add_run(
                protect_docx_text_from_false_mermaid_detection(token[1:-1])
            )
            run.font.name = "Cascadia Mono"
        elif token.startswith("*") and token.endswith("*"):
            paragraph.add_run(
                protect_docx_text_from_false_mermaid_detection(token[1:-1])
            ).italic = True
        else:
            paragraph.add_run(protect_docx_text_from_false_mermaid_detection(token))
        position = match.end()

    if position < len(value):
        paragraph.add_run(value[position:])


def add_svg_with_png_fallback(
    paragraph: Any,
    asset: MermaidAsset,
    *,
    width: Any,
) -> None:
    from docx.opc.constants import RELATIONSHIP_TYPE as RT
    from docx.opc.packuri import PackURI
    from docx.opc.part import Part
    from docx.oxml import parse_xml

    run = paragraph.add_run()
    shape = run.add_picture(str(asset.png_path), width=width)
    shape._inline.docPr.set("descr", asset.alt)
    shape._inline.docPr.set("title", asset.caption)

    part_name = PackURI(f"/word/media/diagram_{asset.index:02d}.svg")
    svg_part = Part(
        part_name,
        "image/svg+xml",
        asset.svg_path.read_bytes(),
        paragraph.part.package,
    )
    svg_relationship = paragraph.part.relate_to(svg_part, RT.IMAGE)
    blips = shape._inline.xpath(".//a:blip")
    if not blips:
        raise BuildError("Could not attach the SVG relationship to the DOCX drawing.")
    extension = parse_xml(
        f'<a:extLst xmlns:a="{DRAWING_NS}" xmlns:asvg="{SVG_NS}" '
        f'xmlns:r="{REL_NS}"><a:ext '
        f'uri="{{96DAC541-7B7A-43D3-8B79-37D633B846F1}}">'
        f'<asvg:svgBlip r:embed="{svg_relationship}"/></a:ext></a:extLst>'
    )
    blips[0].append(extension)


def parse_table_row(line: str) -> list[str]:
    value = line.strip()
    if value.startswith("|"):
        value = value[1:]
    if value.endswith("|"):
        value = value[:-1]
    return [cell.strip() for cell in re.split(r"(?<!\\)\|", value)]


def is_table_separator(line: str) -> bool:
    cells = parse_table_row(line)
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells)


def set_table_cell_margins(cell: Any, top: int = 80, start: int = 90, bottom: int = 80, end: int = 90) -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    properties = cell._tc.get_or_add_tcPr()
    margins = properties.first_child_found_in("w:tcMar")
    if margins is None:
        margins = OxmlElement("w:tcMar")
        properties.append(margins)
    for name, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = margins.find(qn(f"w:{name}"))
        if node is None:
            node = OxmlElement(f"w:{name}")
            margins.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row: Any) -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    properties = row._tr.get_or_add_trPr()
    header = properties.find(qn("w:tblHeader"))
    if header is None:
        header = OxmlElement("w:tblHeader")
        properties.append(header)
    header.set(qn("w:val"), "true")


def set_table_geometry(table: Any, rows: Sequence[Sequence[str]], total_twips: int = 6700) -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    column_count = len(table.columns)
    weights: list[int] = []
    for column_index in range(column_count):
        maximum = max(
            (len(row[column_index]) if column_index < len(row) else 0)
            for row in rows
        )
        weights.append(max(6, min(maximum, 48)))
    weight_sum = sum(weights)
    widths = [max(600, round(total_twips * weight / weight_sum)) for weight in weights]
    widths[-1] += total_twips - sum(widths)

    table.autofit = False
    properties = table._tbl.tblPr
    layout = properties.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        properties.append(layout)
    layout.set(qn("w:type"), "fixed")
    table_width = properties.find(qn("w:tblW"))
    if table_width is None:
        table_width = OxmlElement("w:tblW")
        properties.append(table_width)
    table_width.set(qn("w:w"), str(total_twips))
    table_width.set(qn("w:type"), "dxa")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        column = OxmlElement("w:gridCol")
        column.set(qn("w:w"), str(width))
        grid.append(column)

    for row in table.rows:
        for index, cell in enumerate(row.cells):
            cell_width = cell._tc.get_or_add_tcPr().find(qn("w:tcW"))
            if cell_width is None:
                cell_width = OxmlElement("w:tcW")
                cell._tc.get_or_add_tcPr().append(cell_width)
            cell_width.set(qn("w:w"), str(widths[index]))
            cell_width.set(qn("w:type"), "dxa")
            set_table_cell_margins(cell)


def add_docx_table(
    document: Any,
    rows: Sequence[Sequence[str]],
    *,
    bookmarks: dict[str, str],
    out_dir: Path,
) -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    column_count = max(len(row) for row in rows)
    table = document.add_table(rows=len(rows), cols=column_count)
    table.style = "Table Grid"
    for row_index, row_values in enumerate(rows):
        for column_index in range(column_count):
            value = row_values[column_index] if column_index < len(row_values) else ""
            cell = table.cell(row_index, column_index)
            cell.text = ""
            paragraph = cell.paragraphs[0]
            add_inline_markdown(
                paragraph,
                value,
                bookmarks=bookmarks,
                out_dir=out_dir,
            )
            if row_index == 0:
                for run in paragraph.runs:
                    run.bold = True
                shading = OxmlElement("w:shd")
                shading.set(qn("w:fill"), "DCEEF5")
                cell._tc.get_or_add_tcPr().append(shading)
    set_repeat_table_header(table.rows[0])
    set_table_geometry(table, rows)


def is_special_markdown_line(line: str, next_line: str | None, mermaid_tokens: set[str]) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if stripped in mermaid_tokens:
        return True
    if re.match(r"^#{1,6}\s+", stripped):
        return True
    if re.match(r"^(?:[-*+]\s+|\d+[.)]\s+)", stripped):
        return True
    if stripped.startswith(">"):
        return True
    if re.match(r"^(?:\x60{3,}|~{3,})", stripped):
        return True
    if stripped.startswith("|") and next_line and is_table_separator(next_line):
        return True
    return False


def build_docx(
    metadata: dict[str, str],
    markdown_text: str,
    headings: Sequence[Heading],
    mermaid_assets: Sequence[MermaidAsset],
    *,
    target: Path,
    out_dir: Path,
    epoch: int,
) -> None:
    try:
        from docx import Document
        from docx.enum.section import WD_SECTION_START
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
        from docx.shared import Mm, Pt
    except ImportError as exc:
        raise BuildError(f"python-docx is required: {exc}") from exc

    document = Document()
    section = document.sections[0]
    section.page_width = Mm(148)
    section.page_height = Mm(210)
    section.top_margin = Mm(15)
    section.bottom_margin = Mm(17)
    section.left_margin = Mm(14.5)
    section.right_margin = Mm(14.5)
    section.header_distance = Mm(7)
    section.footer_distance = Mm(8)
    configure_docx_styles(document)
    enable_update_fields(document)

    cover = document.add_paragraph(style="Cover Title")
    cover.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover.paragraph_format.space_before = Pt(100)
    cover.add_run(metadata["title"])
    subtitle = document.add_paragraph(style="Cover Subtitle")
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.add_run(metadata.get("subtitle", ""))
    cover_meta = document.add_paragraph()
    cover_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover_meta.add_run(
        " · ".join(
            item
            for item in [
                metadata.get("author", ""),
                metadata.get("date", ""),
                metadata.get("edition", ""),
            ]
            if item
        )
    )
    document.add_page_break()

    document.add_paragraph("Оглавление", style="TOC Heading Local")
    toc_paragraph = document.add_paragraph()
    add_word_field(
        toc_paragraph,
        'TOC \\o "1-3" \\h \\z \\u',
        "Оглавление обновится при открытии документа.",
    )
    document.add_page_break()

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_word_field(footer, "PAGE", "1")

    ordered_abstract, bullet_abstract = create_numbering_definitions(document)
    bookmark_map = {heading.slug: heading.word_bookmark for heading in headings}
    heading_lookup = {(heading.level, heading.slug): heading for heading in headings}
    mermaid_by_token = {asset.token: asset for asset in mermaid_assets}
    mermaid_tokens = set(mermaid_by_token)

    lines = markdown_text.splitlines()
    index = 0
    bookmark_id = 100
    active_list_kind: str | None = None
    active_num_id: int | None = None

    while index < len(lines):
        line = lines[index]
        stripped = line.strip()
        next_line = lines[index + 1] if index + 1 < len(lines) else None

        if not stripped:
            active_list_kind = None
            active_num_id = None
            index += 1
            continue

        if stripped in mermaid_by_token:
            asset = mermaid_by_token[stripped]
            paragraph = document.add_paragraph()
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            add_svg_with_png_fallback(paragraph, asset, width=Mm(112))
            caption = document.add_paragraph(style="Figure Caption Local")
            caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
            caption.add_run(asset.caption)
            active_list_kind = None
            active_num_id = None
            index += 1
            continue

        fence_match = re.match(r"^\s*((?:\x60{3,})|(?:~{3,}))(.*)$", line)
        if fence_match:
            marker = fence_match.group(1)[0]
            code_lines: list[str] = []
            index += 1
            while index < len(lines):
                if re.match(rf"^\s*{re.escape(marker)}{{3,}}", lines[index]):
                    break
                code_lines.append(lines[index])
                index += 1
            if index >= len(lines):
                raise BuildError("Unclosed fenced code block in DOCX source.")
            paragraph = document.add_paragraph(style="Code Block Local")
            paragraph.add_run(
                "\n".join(
                    protect_docx_text_from_false_mermaid_detection(code_line)
                    for code_line in code_lines
                )
            )
            index += 1
            active_list_kind = None
            active_num_id = None
            continue

        if stripped.startswith("|") and next_line and is_table_separator(next_line):
            rows = [parse_table_row(line)]
            index += 2
            while index < len(lines) and lines[index].strip().startswith("|"):
                rows.append(parse_table_row(lines[index]))
                index += 1
            add_docx_table(
                document,
                rows,
                bookmarks=bookmark_map,
                out_dir=out_dir,
            )
            active_list_kind = None
            active_num_id = None
            continue

        heading_match = re.match(
            r"^(#{1,6})\s+(.+?)\s+\{#([^\s{}]+)\}\s*$",
            stripped,
        )
        if heading_match:
            marks, raw_title, slug = heading_match.groups()
            level = len(marks)
            word_level = min(level, 4)
            paragraph = document.add_paragraph(
                protect_docx_text_from_false_mermaid_detection(
                    clean_inline_markup(raw_title)
                ),
                style=f"Heading {word_level}",
            )
            heading = heading_lookup.get((level, slug))
            if heading:
                add_bookmark(paragraph, heading.word_bookmark, bookmark_id)
                bookmark_id += 1
            active_list_kind = None
            active_num_id = None
            index += 1
            continue

        list_match = re.match(r"^(\s*)([-*+]|\d+[.)])\s+(.+)$", line)
        if list_match:
            indentation, marker, value = list_match.groups()
            kind = "bullet" if marker in {"-", "*", "+"} else "ordered"
            level = min(len(indentation.expandtabs(4)) // 2, 2)
            if active_list_kind != kind or active_num_id is None:
                abstract = bullet_abstract if kind == "bullet" else ordered_abstract
                active_num_id = create_number_instance(document, abstract)
                active_list_kind = kind
            paragraph = document.add_paragraph()
            apply_numbering(paragraph, active_num_id, level)
            add_inline_markdown(
                paragraph,
                value,
                bookmarks=bookmark_map,
                out_dir=out_dir,
            )
            index += 1
            continue

        if stripped.startswith(">"):
            quote_lines: list[str] = []
            while index < len(lines) and lines[index].strip().startswith(">"):
                quote_lines.append(lines[index].strip()[1:].lstrip())
                index += 1
            paragraph = document.add_paragraph()
            paragraph.paragraph_format.left_indent = Mm(5)
            paragraph.paragraph_format.right_indent = Mm(2)
            add_inline_markdown(
                paragraph,
                " ".join(quote_lines),
                bookmarks=bookmark_map,
                out_dir=out_dir,
            )
            active_list_kind = None
            active_num_id = None
            continue

        paragraph_lines = [stripped]
        index += 1
        while index < len(lines):
            candidate = lines[index]
            candidate_next = lines[index + 1] if index + 1 < len(lines) else None
            if is_special_markdown_line(candidate, candidate_next, mermaid_tokens):
                break
            paragraph_lines.append(candidate.strip())
            index += 1
        paragraph = document.add_paragraph()
        add_inline_markdown(
            paragraph,
            " ".join(paragraph_lines),
            bookmarks=bookmark_map,
            out_dir=out_dir,
        )
        active_list_kind = None
        active_num_id = None

    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

    core = document.core_properties
    core.title = metadata["title"]
    core.subject = metadata.get("subtitle", "")
    core.author = metadata.get("author", "")
    core.keywords = "антифрод, fraud prevention, defensive security"
    core.comments = "Repeatable local release; fixed source and normalized archive timestamps."
    core.created = fixed_datetime(epoch).replace(tzinfo=None)
    core.modified = fixed_datetime(epoch).replace(tzinfo=None)
    core.last_modified_by = "Codex local repeatable builder"

    temporary = target.with_suffix(target.suffix + ".writing")
    document.save(temporary)
    os.replace(temporary, target)
    normalize_zip_timestamps(target, epoch, epub=False)


EPUB_CSS = r"""
html { font-family: sans-serif; line-height: 1.48; color: #17212b; }
body { margin: 0 auto; padding: 1rem; max-width: 48rem; }
h1, h2, h3 { color: #0b486b; line-height: 1.18; }
h1 { margin-top: 1.8rem; }
p { margin: 0 0 .85rem; }
a { color: #11698e; overflow-wrap: anywhere; }
img, svg { max-width: 100%; height: auto; }
figure { margin: 1.2rem 0; text-align: center; }
figcaption { color: #52606d; font-size: .86rem; margin-top: .4rem; }
table { width: 100%; border-collapse: collapse; font-size: .86rem; display: table; }
th, td { border: 1px solid #a9bec8; padding: .35rem; vertical-align: top; }
th { background: #dceef5; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #eef3f5; padding: .7rem; }
blockquote { border-left: .3rem solid #d08b28; margin-left: 0; padding-left: .8rem; }
.cover { min-height: 75vh; display: flex; flex-direction: column; justify-content: center; text-align: center; }
@media (max-width: 32rem) {
  body { padding: .7rem; }
  table { font-size: .76rem; }
  th, td { padding: .22rem; overflow-wrap: anywhere; }
  h1 { font-size: 1.55rem; }
  h2 { font-size: 1.25rem; }
}
"""


def split_html_chapters(
    body_html: str, metadata: dict[str, str]
) -> list[tuple[str, str, list[tuple[int, str, str]]]]:
    try:
        from bs4 import BeautifulSoup
        from bs4.element import Tag
    except ImportError as exc:
        raise BuildError(f"BeautifulSoup is required for EPUB chapter splitting: {exc}") from exc

    soup = BeautifulSoup(body_html, "html.parser")
    # The manuscript intentionally keeps FAQ and glossary under one H1. EPUB
    # readers navigate by spine items, so promote the glossary subsection to a
    # dedicated semantic chapter while leaving the canonical Markdown intact.
    for heading in soup.find_all(["h2", "h3", "h4"]):
        if "глоссар" in heading.get_text(" ", strip=True).casefold():
            heading.name = "h1"

    groups: list[list[Any]] = []
    current: list[Any] = []
    for node in list(soup.contents):
        if isinstance(node, Tag) and node.name == "h1" and current:
            groups.append(current)
            current = []
        current.append(node)
    if current:
        groups.append(current)

    chapters: list[tuple[str, str, list[tuple[int, str, str]]]] = []
    for index, group in enumerate(groups, start=1):
        fragment = BeautifulSoup("".join(str(item) for item in group), "html.parser")
        first_h1 = fragment.find("h1")
        if first_h1:
            title = first_h1.get_text(" ", strip=True)
        elif index == 1:
            title = "Введение"
        else:
            title = f"Материал {index}"
        internal: list[tuple[int, str, str]] = []
        for heading in fragment.find_all(["h2", "h3"]):
            heading_id = heading.get("id")
            if heading_id:
                internal.append(
                    (
                        int(heading.name[1]),
                        heading.get_text(" ", strip=True),
                        str(heading_id),
                    )
                )
        chapters.append((title, str(fragment), internal))
    if not chapters:
        raise BuildError("EPUB chapter splitter produced no chapters.")
    return chapters


def build_epub(
    metadata: dict[str, str],
    body_html: str,
    static_assets: Sequence[StaticAsset],
    mermaid_assets: Sequence[MermaidAsset],
    *,
    target: Path,
    source_hash: str,
    epoch: int,
) -> None:
    try:
        from ebooklib import epub
    except ImportError as exc:
        raise BuildError(f"EbookLib is required: {exc}") from exc

    book = epub.EpubBook()
    book.set_identifier(f"urn:sha256:{source_hash}")
    book.set_title(metadata["title"])
    book.set_language("ru")
    if metadata.get("author"):
        book.add_author(metadata["author"])
    book.add_metadata("DC", "date", iso_datetime(epoch))
    book.add_metadata(
        "OPF",
        "meta",
        iso_datetime(epoch),
        {"property": "dcterms:modified"},
    )

    stylesheet = epub.EpubItem(
        uid="style",
        file_name="styles/book.css",
        media_type="text/css",
        content=EPUB_CSS.encode("utf-8"),
    )
    book.add_item(stylesheet)

    for asset in static_assets:
        item = epub.EpubItem(
            uid=f"asset_{sha256_path(asset.output_path)[:16]}",
            file_name=asset.relative_path,
            media_type=asset.media_type,
            content=asset.output_path.read_bytes(),
        )
        book.add_item(item)
    for asset in mermaid_assets:
        png_item = epub.EpubItem(
            uid=f"diagram_{asset.index:02d}_png",
            file_name=asset.relative_png,
            media_type="image/png",
            content=asset.png_path.read_bytes(),
        )
        book.add_item(png_item)

    cover = epub.EpubHtml(
        title=metadata["title"],
        file_name="cover.xhtml",
        lang="ru",
    )
    cover.content = (
        '<section class="cover">'
        f"<h1>{html.escape(metadata['title'])}</h1>"
        f"<p>{html.escape(metadata.get('subtitle', ''))}</p>"
        f"<p>{html.escape(metadata.get('author', ''))}</p>"
        f"<p>{html.escape(metadata.get('date', ''))}</p>"
        "</section>"
    )
    cover.add_item(stylesheet)
    book.add_item(cover)

    chapters: list[Any] = []
    toc_entries: list[Any] = []
    epub_body_html = body_html
    for asset in mermaid_assets:
        epub_body_html = epub_body_html.replace(
            asset.relative_svg,
            asset.relative_png,
        )

    for index, (title, content, internal) in enumerate(
        split_html_chapters(epub_body_html, metadata),
        start=1,
    ):
        file_name = f"chapter_{index:03d}.xhtml"
        chapter = epub.EpubHtml(title=title, file_name=file_name, lang="ru")
        chapter.content = f"<article>{content}</article>"
        chapter.add_item(stylesheet)
        book.add_item(chapter)
        chapters.append(chapter)

        nested_links = tuple(
            epub.Link(
                f"{file_name}#{heading_id}",
                heading_title,
                f"nav_{index:03d}_{link_index:03d}",
            )
            for link_index, (_, heading_title, heading_id) in enumerate(
                internal,
                start=1,
            )
        )
        toc_entries.append((chapter, nested_links) if nested_links else chapter)

    book.toc = tuple(toc_entries)
    book.spine = ["nav", cover, *chapters]
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    epub.write_epub(str(target), book, {"epub3_pages": False})
    normalize_zip_timestamps(target, epoch, epub=True)


def normalize_zip_timestamps(path: Path, epoch: int, *, epub: bool) -> None:
    timestamp = fixed_datetime(epoch)
    year = max(1980, min(timestamp.year, 2107))
    date_tuple = (
        year,
        timestamp.month,
        timestamp.day,
        timestamp.hour,
        timestamp.minute,
        timestamp.second - (timestamp.second % 2),
    )
    with zipfile.ZipFile(path, "r") as source:
        entries = [(info, source.read(info.filename)) for info in source.infolist()]

    if epub:
        entries.sort(key=lambda pair: (pair[0].filename != "mimetype", pair[0].filename))
    else:
        entries.sort(key=lambda pair: pair[0].filename)

    temporary = path.with_suffix(path.suffix + ".normalized")
    with zipfile.ZipFile(
        temporary,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
    ) as target:
        for original, data in entries:
            info = zipfile.ZipInfo(original.filename, date_time=date_tuple)
            info.create_system = 0
            info.external_attr = original.external_attr or 0o600 << 16
            info.comment = b""
            info.extra = b""
            info.compress_type = (
                zipfile.ZIP_STORED
                if epub and original.filename == "mimetype"
                else zipfile.ZIP_DEFLATED
            )
            target.writestr(info, data, compress_type=info.compress_type, compresslevel=9)
    os.replace(temporary, path)


def collect_package_versions() -> dict[str, str]:
    names = [
        "Markdown",
        "python-docx",
        "EbookLib",
        "PyMuPDF",
        "Pillow",
        "beautifulsoup4",
    ]
    versions: dict[str, str] = {}
    for name in names:
        try:
            versions[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            versions[name] = "not installed"
    return versions


def add_check(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def preflight_pdf(path: Path) -> dict[str, Any]:
    try:
        import fitz
    except ImportError as exc:
        raise BuildError(f"PyMuPDF is required for PDF preflight: {exc}") from exc

    errors: list[str] = []
    document = fitz.open(path)
    try:
        page_count = len(document)
        add_check(errors, page_count > 0, "PDF has no pages.")
        sizes = {
            (round(page.rect.width, 1), round(page.rect.height, 1))
            for page in document
        }
        a5_ok = all(
            abs(width - 419.5) <= 2.0 and abs(height - 595.3) <= 2.0
            for width, height in sizes
        )
        add_check(errors, a5_ok, f"PDF contains non-A5 page sizes: {sorted(sizes)}")
        toc = document.get_toc(simple=True)
        add_check(errors, len(toc) > 0, "PDF has no heading bookmarks.")
        link_count = sum(len(page.get_links()) for page in document)
        add_check(errors, link_count > 0, "PDF has no hyperlinks.")
        page_text = [page.get_text("text") for page in document]
        blanks = [
            index + 1
            for index, value in enumerate(page_text)
            if len(value.strip()) < 8
        ]
        add_check(errors, not blanks, f"PDF has blank-like pages: {blanks}")
        all_text = "\n".join(page_text)
        try:
            reject_raw_reader_tokens(all_text, "PDF text layer")
            reject_raw_latex(all_text, "PDF text layer")
        except BuildError as exc:
            errors.append(str(exc))
    finally:
        document.close()

    if errors:
        raise BuildError("PDF preflight failed:\n- " + "\n- ".join(errors))
    return {
        "pages": page_count,
        "page_sizes_points": sorted([list(item) for item in sizes]),
        "bookmarks": len(toc),
        "links": link_count,
        "blank_like_pages": blanks,
    }


def preflight_docx(path: Path, expected_mermaid: int) -> dict[str, Any]:
    errors: list[str] = []
    with zipfile.ZipFile(path, "r") as archive:
        bad_member = archive.testzip()
        names = set(archive.namelist())
        add_check(errors, bad_member is None, f"DOCX CRC failed at: {bad_member}")
        required = {
            "[Content_Types].xml",
            "word/document.xml",
            "word/styles.xml",
            "word/numbering.xml",
            "word/settings.xml",
        }
        add_check(errors, required.issubset(names), f"DOCX is missing: {sorted(required - names)}")
        if not required.issubset(names):
            raise BuildError("DOCX preflight failed:\n- " + "\n- ".join(errors))

        document_xml = archive.read("word/document.xml").decode("utf-8", "replace")
        styles_xml = archive.read("word/styles.xml").decode("utf-8", "replace")
        numbering_xml = archive.read("word/numbering.xml").decode("utf-8", "replace")
        settings_xml = archive.read("word/settings.xml").decode("utf-8", "replace")
        footer_xml = "\n".join(
            archive.read(name).decode("utf-8", "replace")
            for name in names
            if name.startswith("word/footer") and name.endswith(".xml")
        )
        rels_xml = (
            archive.read("word/_rels/document.xml.rels").decode("utf-8", "replace")
            if "word/_rels/document.xml.rels" in names
            else ""
        )
        all_xml = "\n".join(
            [document_xml, styles_xml, numbering_xml, settings_xml, footer_xml, rels_xml]
        )

        add_check(errors, 'w:styleId="Heading1"' in styles_xml, "Heading 1 style is missing.")
        add_check(errors, 'w:styleId="Heading2"' in styles_xml, "Heading 2 style is missing.")
        add_check(errors, " TOC " in document_xml, "A real TOC field is missing.")
        add_check(errors, " PAGE " in footer_xml, "PAGE footer field is missing.")
        add_check(errors, "w:updateFields" in settings_xml, "Automatic field update hint is missing.")
        add_check(errors, "<w:bookmarkStart" in document_xml, "Heading bookmarks are missing.")
        add_check(errors, "<w:hyperlink" in document_xml, "DOCX hyperlinks are missing.")
        add_check(errors, "TargetMode=\"External\"" in rels_xml, "External hyperlink relationships are missing.")
        add_check(errors, "<w:abstractNum" in numbering_xml, "Real list numbering definitions are missing.")
        add_check(errors, "<w:numPr" in document_xml, "List paragraphs do not reference numbering.")
        add_check(errors, "<w:tblHeader" in document_xml, "Repeating table header markup is missing.")
        add_check(errors, "<w:tblGrid" in document_xml, "Explicit table grids are missing.")

        svg_files = [name for name in names if name.startswith("word/media/") and name.endswith(".svg")]
        png_files = [name for name in names if name.startswith("word/media/") and name.endswith(".png")]
        if expected_mermaid:
            add_check(
                errors,
                len(svg_files) >= expected_mermaid,
                f"Expected at least {expected_mermaid} embedded SVG diagrams, found {len(svg_files)}.",
            )
            add_check(
                errors,
                len(png_files) >= expected_mermaid,
                f"Expected at least {expected_mermaid} PNG fallbacks, found {len(png_files)}.",
            )
        try:
            reject_raw_reader_tokens(all_xml, "DOCX OOXML")
            reject_raw_latex(all_xml, "DOCX OOXML")
        except BuildError as exc:
            errors.append(str(exc))

    if errors:
        raise BuildError("DOCX preflight failed:\n- " + "\n- ".join(errors))
    return {
        "zip_crc": "ok",
        "heading_bookmarks": document_xml.count("<w:bookmarkStart"),
        "hyperlinks": document_xml.count("<w:hyperlink"),
        "embedded_svg": len(svg_files),
        "embedded_png": len(png_files),
        "toc_field": True,
        "page_field": True,
    }


def preflight_epub(path: Path, expected_mermaid: int) -> dict[str, Any]:
    errors: list[str] = []
    with zipfile.ZipFile(path, "r") as archive:
        infos = archive.infolist()
        names = set(archive.namelist())
        add_check(errors, bool(infos), "EPUB ZIP is empty.")
        if infos:
            add_check(errors, infos[0].filename == "mimetype", "mimetype is not the first entry.")
            add_check(
                errors,
                infos[0].compress_type == zipfile.ZIP_STORED,
                "mimetype is not stored uncompressed.",
            )
        add_check(
            errors,
            archive.read("mimetype") == b"application/epub+zip"
            if "mimetype" in names
            else False,
            "EPUB mimetype is invalid.",
        )
        add_check(
            errors,
            "META-INF/container.xml" in names,
            "EPUB container.xml is missing.",
        )
        nav_files = [name for name in names if name.endswith("nav.xhtml")]
        opf_files = [name for name in names if name.endswith(".opf")]
        add_check(errors, bool(nav_files), "EPUB navigation document is missing.")
        add_check(errors, bool(opf_files), "EPUB OPF package is missing.")

        textual_names = [
            name
            for name in names
            if name.endswith((".xhtml", ".html", ".opf", ".ncx"))
        ]
        combined = "\n".join(
            archive.read(name).decode("utf-8", "replace") for name in textual_names
        )
        add_check(errors, "version=\"3.0\"" in combined, "EPUB3 package version is not declared.")
        add_check(errors, "Раздел 1" not in combined, "Generic chapter titles remain.")
        if nav_files:
            nav_text = archive.read(nav_files[0]).decode("utf-8", "replace")
            add_check(errors, "<nav" in nav_text and "<ol" in nav_text, "EPUB nav is empty.")
        svg_files = [name for name in names if name.endswith(".svg")]
        mermaid_svg_files = [
            name
            for name in svg_files
            if re.search(r"(?:^|/)diagram_\d+\.svg$", name)
        ]
        png_files = [name for name in names if name.endswith(".png")]
        mermaid_png_files = [
            name
            for name in png_files
            if re.search(r"(?:^|/)diagram_\d+\.png$", name)
        ]
        if expected_mermaid:
            add_check(
                errors,
                not mermaid_svg_files,
                "Mermaid SVG files must not be packaged in EPUB because browser-rendered "
                f"SVG may contain invalid foreignObject markup: {mermaid_svg_files}",
            )
            add_check(
                errors,
                len(mermaid_png_files) >= expected_mermaid,
                f"Expected at least {expected_mermaid} EPUB PNG diagrams, "
                f"found {len(mermaid_png_files)}.",
            )
        try:
            reject_raw_reader_tokens(combined, "EPUB text")
            reject_raw_latex(combined, "EPUB text")
        except BuildError as exc:
            errors.append(str(exc))

    try:
        from ebooklib import ITEM_DOCUMENT, epub

        book = epub.read_epub(str(path))
        documents = list(book.get_items_of_type(ITEM_DOCUMENT))
        add_check(errors, len(documents) > 1, "EPUB has too few document items.")
        titles: list[str] = []
        for item in documents:
            title = str(getattr(item, "title", "") or "").strip()
            if not title:
                try:
                    item_html = item.get_content().decode("utf-8", "replace")
                except Exception:
                    item_html = ""
                # EbookLib does not always hydrate EpubHtml.title when reading
                # an EPUB back. Derive the visible title so the manifest records
                # useful chapter names instead of a misleading list of blanks.
                for tag in ("title", "h1"):
                    match = re.search(
                        rf"<{tag}[^>]*>(.*?)</{tag}>", item_html, re.I | re.S
                    )
                    if match:
                        title = html.unescape(re.sub(r"<[^>]+>", "", match.group(1)))
                        title = " ".join(title.split())
                        if title:
                            break
            titles.append(title)
        add_check(
            errors,
            all(not title.startswith("Раздел ") for title in titles if title),
            "EPUB contains generic chapter titles.",
        )
    except Exception as exc:
        errors.append(f"EbookLib could not read the EPUB: {exc}")
        documents = []
        titles = []

    if errors:
        raise BuildError("EPUB preflight failed:\n- " + "\n- ".join(errors))
    return {
        "zip_crc": "ok",
        "document_items": len(documents),
        "chapter_titles": titles,
        "embedded_svg": len(svg_files),
        "embedded_png": len(png_files),
        "mermaid_svg": len(mermaid_svg_files),
        "mermaid_png": len(mermaid_png_files),
        "epubcheck": "not run by builder; required as an external release gate",
    }


def manifest_input_record(path: Path, role: str) -> dict[str, Any]:
    resolved = path.resolve()
    try:
        relative = resolved.relative_to(ROOT.resolve())
    except ValueError as exc:
        raise BuildError(
            f"Manifest input {role} must be snapshotted inside the release root: {resolved}"
        ) from exc
    return {
        "role": role,
        "file": relative.as_posix(),
        "bytes": resolved.stat().st_size,
        "sha256": sha256_path(resolved),
    }


def snapshot_external_input(
    path: Path | None,
    *,
    out_dir: Path,
    output_name: str,
) -> Path | None:
    if path is None:
        return None
    resolved = path.resolve()
    snapshot_dir = out_dir / "build_inputs"
    snapshot_dir.mkdir(parents=True, exist_ok=True)
    snapshot = snapshot_dir / output_name

    if output_name.casefold().endswith(".json") and "puppeteer" in output_name.casefold():
        try:
            configuration = json.loads(resolved.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise BuildError(f"Invalid Puppeteer JSON config: {resolved}: {exc}") from exc
        if not isinstance(configuration, dict):
            raise BuildError(f"Puppeteer config root must be an object: {resolved}")
        arguments = configuration.get("args", [])
        if not isinstance(arguments, list) or not all(
            isinstance(item, str) for item in arguments
        ):
            raise BuildError(f"Puppeteer config args must be a string list: {resolved}")
        for required_argument in (
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
        ):
            if required_argument not in arguments:
                arguments.append(required_argument)
        configuration["args"] = arguments
        configuration.setdefault("headless", True)
        current_timeout = configuration.get("timeout", 0)
        if not isinstance(current_timeout, int) or current_timeout < 120000:
            configuration["timeout"] = 120000
        snapshot.write_text(
            json.dumps(configuration, ensure_ascii=False, indent=2, sort_keys=True)
            + "\n",
            encoding="utf-8",
            newline="\n",
        )
    else:
        shutil.copy2(resolved, snapshot)
    return snapshot.resolve()


def build_manifest(
    *,
    source: Path,
    ledger: Path,
    claim_map: Path,
    requirements: Path,
    package_json: Path,
    package_lock: Path,
    artifacts: Sequence[Path],
    output_path: Path,
    epoch: int,
    cutoff_date: str,
    weasyprint_bin: Path,
    mmdc_path: Path | None,
    puppeteer_config: Path | None,
    preflight: dict[str, Any],
) -> None:
    builder_path = Path(__file__).resolve()
    source_record = manifest_input_record(source, "source")
    ledger_record = manifest_input_record(ledger, "source_ledger")
    claim_map_record = manifest_input_record(claim_map, "claim_map")
    requirements_record = manifest_input_record(requirements, "requirements")
    package_json_record = manifest_input_record(package_json, "package_json")
    package_lock_record = manifest_input_record(package_lock, "package_lock")
    builder_record = manifest_input_record(builder_path, "builder")
    puppeteer_record = (
        manifest_input_record(puppeteer_config, "puppeteer_config")
        if puppeteer_config
        else None
    )
    input_records = [
        source_record,
        ledger_record,
        claim_map_record,
        requirements_record,
        package_json_record,
        package_lock_record,
        builder_record,
    ]
    if puppeteer_record:
        input_records.append(puppeteer_record)

    manifest = {
        "schema_version": "1.0",
        "release": "repeatable-reader-release",
        "cutoff_date": cutoff_date,
        "generated_at": iso_datetime(epoch),
        "source_date_epoch": epoch,
        "reproducibility": {
            "claim": "repeatable_not_bit_reproducible",
            "reason": (
                "Inputs, metadata and ZIP timestamps are fixed, but WeasyPrint, "
                "EbookLib and OOXML packaging may emit implementation-specific "
                "identifiers. Two-build SHA comparison remains a separate gate."
            ),
        },
        "source": source_record,
        "source_ledger": ledger_record,
        "claim_map": claim_map_record,
        "requirements": requirements_record,
        "package_json": package_json_record,
        "package_lock": package_lock_record,
        "builder": builder_record,
        "puppeteer_config": puppeteer_record,
        "inputs": input_records,
        "tools": {
            "python": sys.version.replace("\n", " "),
            "python_packages": collect_package_versions(),
            "weasyprint": {
                "path": str(weasyprint_bin),
                "version": tool_version(weasyprint_bin),
                "sha256": sha256_path(weasyprint_bin),
            },
            "mmdc": (
                {
                    "path": str(mmdc_path),
                    "version": tool_version(mmdc_path),
                    "sha256": sha256_path(mmdc_path),
                }
                if mmdc_path
                else None
            ),
        },
        "artifacts": [
            {
                "file": artifact.name,
                "bytes": artifact.stat().st_size,
                "sha256": sha256_path(artifact),
            }
            for artifact in artifacts
        ],
        "preflight": preflight,
        "external_release_gates": [
            "Render and inspect every PDF page at original resolution.",
            "Render and inspect every DOCX page through Word or LibreOffice.",
            "Run EPUBCheck and inspect every EPUB spine document at mobile and tablet widths.",
            "Run two clean builds and compare artifact SHA-256 values.",
        ],
    }
    output_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Build a canonical anti-fraud manuscript into repeatable "
            "A5 PDF, DOCX and EPUB3 artifacts."
        )
    )
    parser.add_argument(
        "--source",
        default=str(DEFAULT_SOURCE),
        help=f"Canonical Markdown source (default: {DEFAULT_SOURCE}).",
    )
    parser.add_argument(
        "--out-dir",
        default=str(DEFAULT_OUT_DIR),
        help=f"Output directory (default: {DEFAULT_OUT_DIR}).",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Safely remove only the resolved output directory before building.",
    )
    parser.add_argument(
        "--weasyprint-bin",
        default=None,
        help="Exact standalone WeasyPrint executable path; PATH fallback is attempted.",
    )
    parser.add_argument(
        "--mmdc",
        default=None,
        help="Exact Mermaid CLI executable path. Required when Mermaid fences exist.",
    )
    parser.add_argument(
        "--puppeteer-config",
        default=None,
        help="Optional Puppeteer JSON config passed to mmdc with -p.",
    )
    parser.add_argument(
        "--source-date-epoch",
        type=int,
        default=int(os.environ.get("SOURCE_DATE_EPOCH", DEFAULT_EPOCH)),
        help=(
            "Fixed UTC epoch for metadata and ZIP timestamps "
            f"(default: SOURCE_DATE_EPOCH or {DEFAULT_EPOCH})."
        ),
    )
    return parser.parse_args(argv)


def build(args: argparse.Namespace) -> list[Path]:
    source = exact_path(args.source)
    out_dir = exact_path(args.out_dir)
    ledger = DEFAULT_LEDGER.resolve()
    claim_map = DEFAULT_CLAIM_MAP.resolve()
    requirements = DEFAULT_REQUIREMENTS.resolve()
    package_json = DEFAULT_PACKAGE_JSON.resolve()
    package_lock = DEFAULT_PACKAGE_LOCK.resolve()
    if not source.is_file():
        raise BuildError(f"Canonical source does not exist: {source}")
    if not ledger.is_file():
        raise BuildError(f"Source ledger does not exist: {ledger}")
    if not claim_map.is_file():
        raise BuildError(f"Claim map does not exist: {claim_map}")
    if not requirements.is_file():
        raise BuildError(f"Build requirements do not exist: {requirements}")
    if not package_json.is_file():
        raise BuildError(f"package.json does not exist: {package_json}")
    if not package_lock.is_file():
        raise BuildError(f"package-lock.json does not exist: {package_lock}")
    if args.source_date_epoch < 0:
        raise BuildError("--source-date-epoch must be non-negative.")

    weasyprint_bin = resolve_tool(
        args.weasyprint_bin,
        "weasyprint",
        "WeasyPrint",
    )
    mmdc_path = (
        resolve_tool(args.mmdc, "mmdc", "Mermaid CLI")
        if args.mmdc or shutil.which("mmdc")
        else None
    )
    puppeteer_config = (
        exact_path(args.puppeteer_config) if args.puppeteer_config else None
    )
    if puppeteer_config is not None and not puppeteer_config.is_file():
        raise BuildError(f"Puppeteer config does not exist: {puppeteer_config}")

    if args.clean:
        safe_clean_directory(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    assets_dir = out_dir / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    manifest_puppeteer_config = snapshot_external_input(
        puppeteer_config,
        out_dir=out_dir,
        output_name="puppeteer-config.json",
    )

    source_text = source.read_text(encoding="utf-8")
    metadata, body = parse_front_matter(source_text)
    cutoff_date = extract_cutoff_date(metadata, body)
    reject_raw_latex(body, "Markdown source")

    body_with_mermaid_tokens, mermaid_assets = render_mermaid_assets(
        body,
        assets_dir=assets_dir,
        mmdc_path=mmdc_path,
        puppeteer_config=manifest_puppeteer_config,
        epoch=args.source_date_epoch,
    )
    body_with_images, static_assets = copy_static_images(
        body_with_mermaid_tokens,
        source_dir=source.parent,
        assets_dir=assets_dir,
    )
    prepared_markdown, headings = prepare_heading_ids(body_with_images)
    html_markdown = inject_mermaid_html(prepared_markdown, mermaid_assets)
    body_html = render_markdown_html(html_markdown)
    reader_html = full_html_document(metadata, body_html, headings)
    reject_raw_reader_tokens(reader_html, "generated HTML")
    reject_raw_latex(reader_html, "generated HTML")

    # Name artifacts after the selected canonical source. This keeps LOCAL smoke
    # builds and FINAL reader builds unambiguous without post-build renaming.
    base_name = source.stem
    pdf_path = out_dir / f"{base_name}.pdf"
    docx_path = out_dir / f"{base_name}.docx"
    epub_path = out_dir / f"{base_name}.epub"
    manifest_path = out_dir / "manifest.json"

    build_pdf(
        reader_html,
        target=pdf_path,
        base_url=out_dir,
        weasyprint_bin=weasyprint_bin,
        epoch=args.source_date_epoch,
    )
    build_docx(
        metadata,
        prepared_markdown,
        headings,
        mermaid_assets,
        target=docx_path,
        out_dir=out_dir,
        epoch=args.source_date_epoch,
    )
    build_epub(
        metadata,
        body_html,
        static_assets,
        mermaid_assets,
        target=epub_path,
        source_hash=sha256_path(source),
        epoch=args.source_date_epoch,
    )

    preflight = {
        "pdf": preflight_pdf(pdf_path),
        "docx": preflight_docx(docx_path, len(mermaid_assets)),
        "epub": preflight_epub(epub_path, len(mermaid_assets)),
    }
    artifacts = [pdf_path, docx_path, epub_path]
    build_manifest(
        source=source,
        ledger=ledger,
        claim_map=claim_map,
        requirements=requirements,
        package_json=package_json,
        package_lock=package_lock,
        artifacts=artifacts,
        output_path=manifest_path,
        epoch=args.source_date_epoch,
        cutoff_date=cutoff_date,
        weasyprint_bin=weasyprint_bin,
        mmdc_path=mmdc_path,
        puppeteer_config=manifest_puppeteer_config,
        preflight=preflight,
    )
    return [*artifacts, manifest_path]


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        outputs = build(args)
    except BuildError as exc:
        print(f"BUILD ERROR: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:
        print(f"UNEXPECTED BUILD ERROR: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1

    for path in outputs:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
