#!/usr/bin/env python3
"""
Generate Tuibao app icon: red field + white 「退」 in Heiti (STHeiti Medium SC).
Outputs 1024×1024 (App Store) and 1144×1144 (root asset).
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# Match earlier app red
BG = (253, 0, 0, 255)
WHITE = (255, 255, 255, 255)
FONT_PATH = "/System/Library/Fonts/Supplemental/STHeiti Medium.ttc"
# 1 = Heiti SC (简体), 0 = Heiti TC
FONT_INDEX = 1


def render_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)
    # ~54% of canvas for glyph height; tune for margin
    font_size = max(200, int(size * 0.54))
    font = ImageFont.truetype(FONT_PATH, font_size, index=FONT_INDEX)
    text = "退"
    bbox = draw.textbbox((0, 0), text, font=font)
    cx, cy = size // 2, size // 2
    x = cx - (bbox[0] + bbox[2]) / 2
    y = cy - (bbox[1] + bbox[3]) / 2
    # 细白描边略加厚，接近「加粗」观感
    draw.text(
        (x, y),
        text,
        font=font,
        fill=WHITE,
        stroke_width=1,
        stroke_fill=WHITE,
    )
    return img


def main() -> None:
    # scripts/generate_app_icon.py → parents[2] = tuibao workspace root
    workspace = Path(__file__).resolve().parents[2]

    out_1024 = (
        workspace
        / "tuibao-app"
        / "ios"
        / "App"
        / "App"
        / "Assets.xcassets"
        / "AppIcon.appiconset"
        / "AppIcon-512@2x.png"
    )
    out_1144 = workspace / "1144.png"

    im1024 = render_icon(1024)
    out_1024.parent.mkdir(parents=True, exist_ok=True)
    im1024.save(out_1024, format="PNG")
    print(f"Wrote {out_1024}")

    im1144 = render_icon(1144)
    im1144.save(out_1144, format="PNG")
    print(f"Wrote {out_1144}")


if __name__ == "__main__":
    main()
