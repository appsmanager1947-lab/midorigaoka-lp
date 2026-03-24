import os
import sys
from pathlib import Path
from PIL import Image

# Windows CP932 対策
sys.stdout.reconfigure(encoding='utf-8')

img_dir = Path("img")
converted = []
skipped = []

for src in sorted(img_dir.rglob("*")):
    if src.suffix.lower() not in (".jpg", ".jpeg", ".png"):
        continue

    dst = src.with_suffix(".webp")

    try:
        with Image.open(src) as im:
            is_png = src.suffix.lower() == ".png"
            has_alpha = im.mode in ("RGBA", "LA") or (
                im.mode == "P" and "transparency" in im.info
            )

            if is_png and has_alpha:
                im.save(dst, "webp", lossless=True, quality=100)
                mode = "Lossless (transparent PNG)"
            elif is_png:
                im_rgb = im.convert("RGB")
                im_rgb.save(dst, "webp", quality=85)
                mode = "Quality 85 (PNG)"
            else:
                im_rgb = im.convert("RGB")
                im_rgb.save(dst, "webp", quality=80)
                mode = "Quality 80 (JPG)"

        size_before = src.stat().st_size / 1024
        size_after  = dst.stat().st_size / 1024
        saving      = (1 - size_after / size_before) * 100

        converted.append({
            "before_kb": size_before,
            "after_kb":  size_after,
        })
        print(f"OK  {src.name} -> {dst.name}  {size_before:.0f}KB -> {size_after:.0f}KB  ({saving:.0f}% saved) [{mode}]")

    except Exception as e:
        skipped.append(str(src))
        print(f"SKIP {src.name} : {e}")

print(f"\nConverted: {len(converted)} / Skipped: {len(skipped)}")
total_before = sum(r["before_kb"] for r in converted)
total_after  = sum(r["after_kb"]  for r in converted)
print(f"Total: {total_before:.0f}KB -> {total_after:.0f}KB  ({(1 - total_after/total_before)*100:.0f}% saved)")
