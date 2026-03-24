import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

files_to_update = ["index.html", "css/style.css"]
extensions = [".jpg", ".jpeg", ".JPG", ".JPEG", ".png", ".PNG"]

for filepath in files_to_update:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        original = content
        for ext in extensions:
            content = re.sub(
                rf'(img/[^"\')\s]+){re.escape(ext)}',
                r'\1.webp',
                content
            )

        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"OK  {filepath} -- paths updated")
        else:
            print(f"--  {filepath} -- no changes")

    except FileNotFoundError:
        print(f"SKIP {filepath} -- file not found")
