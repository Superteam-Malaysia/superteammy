#!/usr/bin/env python3
"""Rasterize Demo Day PDFs into per-slide WebPs for the on-page viewer."""
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DECKS = ROOT / "public/images/teams/demo-day/decks"
OUT = ROOT / "public/images/teams/demo-day/slides"
MAX_WIDTH = 1280
WEBP_QUALITY = 72


def export_pdf(pdf_path: Path) -> int:
    slug = pdf_path.stem
    dest = OUT / slug
    dest.mkdir(parents=True, exist_ok=True)
    doc = pdfium.PdfDocument(str(pdf_path))
    count = 0
    for index, page in enumerate(doc, start=1):
        bitmap = page.render(scale=1.4)
        image = bitmap.to_pil()
        if image.width > MAX_WIDTH:
            height = round(image.height * MAX_WIDTH / image.width)
            image = image.resize((MAX_WIDTH, height), Image.Resampling.LANCZOS)
        if image.mode != "RGB":
            image = image.convert("RGB")
        out_path = dest / f"{index:02d}.webp"
        image.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
        count += 1
        page.close()
    doc.close()
    return count


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(DECKS.glob("*.pdf"))
    total = 0
    for pdf_path in pdfs:
        n = export_pdf(pdf_path)
        total += n
        print(f"{pdf_path.stem}: {n} slides")
    print(f"wrote {total} slides under {OUT}")


if __name__ == "__main__":
    main()
