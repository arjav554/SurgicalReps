"""Turn public-domain Gray's Anatomy (1918) plates into the app's two figure styles.

- <key>-plate.jpg : sepia ink on warm paper, for textbook-style figure plates.
- <key>-ghost.png : ivory linework on transparency, for faint engraving watermarks on dark cards.

Usage (from the project root): python scripts/prepare-figures.py <dir-with-downloaded-originals>
Originals come from Wikimedia Commons (all public domain); see src/data/figures.ts for credits.
"""
import os
import sys

from PIL import Image, ImageOps

SOURCES = {
    "gallbladder": "Bilebladder.png",
    "pancreas": "Gray1098.png",
    "appendix": "Gray1073.png",
    "ileocecal": "Gray1044.png",
    "stomach": "Gray1050-stomach.png",
    "sigmoid": "Gray1076.png",
    "inguinal": "Gray547.png",
    "thorax": "Gray490blanco.png",
    "neck": "Gray_AnatomyOfHumanBody1918-P644_Figure557.jpg",
}

INK = (42, 36, 28)
MID = (140, 127, 108)
PAPER = (241, 235, 221)
GHOST = (220, 230, 238)


def load_gray(path):
    img = Image.open(path)
    if img.mode in ("P", "LA", "RGBA"):
        base = Image.new("RGBA", img.size, (255, 255, 255, 255))
        img = Image.alpha_composite(base, img.convert("RGBA"))
    gray = img.convert("L")
    # Trim the page margin around the engraving.
    mask = gray.point(lambda v: 255 if v < 235 else 0)
    box = mask.getbbox()
    if box:
        pad = 14
        box = (max(0, box[0] - pad), max(0, box[1] - pad), min(gray.width, box[2] + pad), min(gray.height, box[3] + pad))
        gray = gray.crop(box)
    return ImageOps.autocontrast(gray, cutoff=1)


def fit(img, max_w):
    if img.width <= max_w:
        return img
    return img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)


def main(src_dir):
    out_dir = os.path.join("assets", "figures")
    os.makedirs(out_dir, exist_ok=True)
    for key, name in SOURCES.items():
        path = os.path.join(src_dir, name)
        if not os.path.exists(path):
            print(f"skip {key}: {name} not found")
            continue
        gray = load_gray(path)

        plate = ImageOps.colorize(fit(gray, 1000), black=INK, white=PAPER, mid=MID)
        plate.save(os.path.join(out_dir, f"{key}-plate.jpg"), quality=86, optimize=True, progressive=True)

        small = fit(gray, 520)
        alpha = ImageOps.invert(small).point(lambda v: min(255, int(v * 1.5)))
        ghost = Image.new("RGBA", small.size, GHOST + (0,))
        ghost.putalpha(alpha)
        ghost.save(os.path.join(out_dir, f"{key}-ghost.png"), optimize=True)

        sizes = [os.path.getsize(os.path.join(out_dir, f"{key}-{kind}")) // 1024 for kind in ("plate.jpg", "ghost.png")]
        print(f"{key:12s} {plate.width}x{plate.height}  plate {sizes[0]} KB  ghost {sizes[1]} KB")


if __name__ == "__main__":
    main(sys.argv[1])
