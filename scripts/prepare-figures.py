"""Turn public-domain Gray's Anatomy (1918) plates into the app's figure images.

- <key>-plate.jpg : sepia ink on warm paper, for textbook-style figure plates. The longest side is
  fitted to 1000 px, and JPEG quality steps down until the file is near the size target.
- <key>-ghost.png : ivory linework on transparency. Only the original plates in GHOST_KEYS still get
  one; no UI reads ghosts, so new plates skip them to keep the bundle small.

Usage (from the project root): python scripts/prepare-figures.py <dir-with-downloaded-originals>
Originals come from Wikimedia Commons (all public domain); see src/data/figures.ts for the captions,
which are Gray's own figure captions from the 1918 edition.
"""
import io
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
    "neck": "Gray_AnatomyOfHumanBody1918-P644_Figure557.jpg",
    "inguinal": "Gray547.png",
    "eyeball": "Gray869.png",
    "eye-front": "Gray883.png",
    "aortic-arch": "Gray505.png",
    "abdominal-aorta": "Gray531.png",
    "femoral-artery": "Gray550.png",
    "carotid": "Gray513.png",
    "leg-section": "Gray440.png",
    "leg-bones": "Gray258.png",
    "hip-joint": "Gray342.png",
    "broad-ligament": "Gray1161.png",
    "female-pelvis": "Gray1165.png",
    "uterus": "Gray1167.png",
    "female-sagittal": "Gray1139.png",
    "uterine-vessels": "Gray589.png",
    "brain-base": "Gray516.png",
    "cerebrum": "Gray726.png",
    "meninges": "Gray769.png",
    "nasal-septum": "Gray854.png",
    "mouth": "Gray1014.png",
    "neck-lymph": "Gray602.png",
    "tongue-lymph": "Gray605.png",
    "mandible": "Gray176.png",
    "mandibular-nerve": "Gray781.png",
    "colic-valve": "Gray1075.png",
    "stomach-outline": "Gray1046.png",
    "spleen": "Gray1188.png",
    "intestines": "Gray988.png",
    "kidneys": "Gray1121.png",
    "male-pelvis": "Gray1135.png",
    "testis": "Gray1148.png",
    "pleura": "Gray965.png",
    "surface-anatomy": "Gray1219.png",
    "surface-lines": "Gray1220.png",
    "skin": "Gray940.png",
}

GHOST_KEYS = {"gallbladder", "pancreas", "appendix", "ileocecal", "stomach", "sigmoid", "neck"}

INK = (42, 36, 28)
MID = (140, 127, 108)
PAPER = (241, 235, 221)
GHOST = (220, 230, 238)
MAX_SIDE = 1000
TARGET_KB = 120


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


def fit(img, max_side):
    scale = max_side / max(img.width, img.height)
    if scale >= 1:
        return img
    return img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)


def save_plate(plate, path):
    """Step JPEG quality down from 86 until the file is at or under the target (floor 70)."""
    for quality in range(86, 69, -4):
        buf = io.BytesIO()
        plate.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
        if buf.tell() <= TARGET_KB * 1024:
            break
    with open(path, "wb") as f:
        f.write(buf.getvalue())
    return quality


def main(src_dir):
    out_dir = os.path.join("assets", "figures")
    os.makedirs(out_dir, exist_ok=True)
    for key, name in SOURCES.items():
        path = os.path.join(src_dir, name)
        if not os.path.exists(path):
            print(f"skip {key}: {name} not found")
            continue
        gray = load_gray(path)

        plate = ImageOps.colorize(fit(gray, MAX_SIDE), black=INK, white=PAPER, mid=MID)
        plate_path = os.path.join(out_dir, f"{key}-plate.jpg")
        quality = save_plate(plate, plate_path)
        line = f"{key:17s} {plate.width}x{plate.height}  q{quality}  plate {os.path.getsize(plate_path) // 1024} KB"

        if key in GHOST_KEYS:
            small = fit(gray, 520)
            alpha = ImageOps.invert(small).point(lambda v: min(255, int(v * 1.5)))
            ghost = Image.new("RGBA", small.size, GHOST + (0,))
            ghost.putalpha(alpha)
            ghost_path = os.path.join(out_dir, f"{key}-ghost.png")
            ghost.save(ghost_path, optimize=True)
            line += f"  ghost {os.path.getsize(ghost_path) // 1024} KB"
        print(line)


if __name__ == "__main__":
    main(sys.argv[1])
