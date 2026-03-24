import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

img_dir = Path("img")
deleted = []

for src in sorted(img_dir.rglob("*")):
    if src.suffix.lower() not in (".jpg", ".jpeg", ".png"):
        continue
    webp = src.with_suffix(".webp")
    if webp.exists():
        src.unlink()
        deleted.append(str(src))
        print(f"Deleted: {src.name}")

print(f"\nTotal deleted: {len(deleted)}")
