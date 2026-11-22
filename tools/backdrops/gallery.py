"""The numbered gallery of the Mobs tab's stage backgrounds, from capture.mjs's screenshots in a folder:
    python3 tools/backdrops/gallery.py <dir>
writes <dir>/mob-backgrounds.html, every background's picture (embedded) with its number, key and the mobs, variants
and names that show it. A background not captured yet shows as missing."""
import base64, html, json, sys
from pathlib import Path

folder = Path(sys.argv[1])
index = json.loads((folder / "index.json").read_text())
cards = []
for i, entry in enumerate(index, 1):
    png = folder / f"{i:02d}_{entry['biome']}.png"
    img = f'<img src="data:image/png;base64,{base64.b64encode(png.read_bytes()).decode()}">' if png.exists() else '<div class="missing">not captured</div>'
    mobs = ", ".join(html.escape(m) for m in entry["mobs"])
    cards.append(f'<figure id="b{i}">{img}<figcaption><b>#{i} · {entry["biome"]}</b><br><span>{mobs}</span></figcaption></figure>')
(folder / "mob-backgrounds.html").write_text(f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mob backgrounds</title><style>
body{{font:14px system-ui;background:#1b1b1b;color:#ddd;margin:20px}}h1{{font-size:20px}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:18px}}
figure{{margin:0;background:#2a2a2a;padding:8px;border-radius:6px}}img{{width:100%;image-rendering:pixelated;display:block}}
.missing{{aspect-ratio:5/3;display:grid;place-items:center;color:#888;background:#111}}
figcaption{{margin-top:6px;line-height:1.4}}span{{color:#aaa;font-size:12px}}</style></head><body>
<h1>Survival Toolkit · all {len(index)} mob stage backgrounds (mob hidden)</h1><main>{"".join(cards)}</main></body></html>""")
print(folder / "mob-backgrounds.html")
