"""Combine src/ into a single self-contained index.html and draw the site icons."""
import pathlib
import random
import re
import struct
import zlib

root = pathlib.Path(__file__).parent
read = lambda n: (root / "src" / n).read_text()

head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Survival Toolkit</title>
<meta name="description" content="Anvil enchanting planner, potion brewing guide and villager trade guide for Minecraft, Java and Bedrock.">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Karla:wght@400;500;600;700;800&display=swap">
<style>
body { margin: 0; }
[hidden] { display: none !important; }
"""


def build_page():
    body = read("body.html").replace("<!-- brew.html -->\n", read("brew.html")).replace("<!-- trade.html -->\n", read("trade.html"))
    scripts = ["brew-data.js", "icons.js", "icons2.js", "icons3.js", "icons4.js", "trade-data.js", "ui.js", "brew-ui.js", "trade-ui.js"]
    out = (head + read("style.css") + read("brew.css") + read("trade.css") + "</style>\n</head>\n<body>\n" + body +
           '\n<script id="solver">\n' + read("solver.js") + "</script>\n<script>\n" +
           "\n".join(read(f) for f in scripts) + "</script>\n</body>\n</html>\n")
    (root / "index.html").write_text(out)
    print(f"index.html: {len(out)} bytes")


# ---------- Icons ----------
# The favicon is the page's own "ui:logo" pixel template from src/icons3.js,
# drawn with the same outline rule as the browser renderer so both match.

def logo_pixels():
    icons, icons2 = read("icons.js"), read("icons2.js") + read("icons3.js")
    t, m, s = re.search(r'"ui:logo":\s*\{ t: "(\w+)", m: "(\w+)", s: "(\w+)" \}', icons2).groups()
    rows = re.findall(r'"([^"]*)"', re.search(rf"\b{t}: \[(.*?)\]", icons2, re.S).group(1))
    colors = lambda name: re.findall(r"#[0-9a-fA-F]{6}", re.search(rf"\b{name}:\s*\[([^\]]*)\]", icons).group(1))
    fixed = dict(re.findall(r'(\w): "(#[0-9a-fA-F]{6})"', re.search(r"const FIXED = \{(.*?)\};", icons).group(1)))
    pal = {**fixed, **dict(zip("1234", colors(m))), **dict(zip("abcd", colors(s)))}
    rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
    rows = [r.ljust(16, ".") for r in rows] + ["." * 16] * (16 - len(rows))
    px = [[None if ch == "." else rgb(pal[ch]) for ch in row] for row in rows]
    out = [row[:] for row in px]
    for y in range(16):
        for x in range(16):
            if px[y][x]:
                continue
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < 16 and 0 <= ny < 16 and px[ny][nx]:
                    out[y][x] = tuple(int(v * 0.3 + 0.5) for v in px[ny][nx])
                    break
    return out


def png(px, scale):
    h, w = len(px) * scale, len(px[0]) * scale
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            p = px[y // scale][x // scale]
            raw += bytes((*p, 255)) if p else b"\0\0\0\0"
    chunk = lambda tag, data: struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) +
            chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b""))


def ico(images):
    """ICO file holding PNG images, one per size."""
    offset = 6 + 16 * len(images)
    entries, data = b"", b""
    for size, blob in images:
        entries += struct.pack("<BBBBHHII", size % 256, size % 256, 0, 0, 1, 32, len(blob), offset + len(data))
        data += blob
    return struct.pack("<HHH", 0, 1, len(images)) + entries + data


def svg(px):
    rects = []
    for y, row in enumerate(px):
        x = 0
        while x < 16:
            p = row[x]
            if not p:
                x += 1
                continue
            w = 1
            while x + w < 16 and row[x + w] == p:
                w += 1
            rects.append(f'<rect x="{x}" y="{y}" width="{w}" height="1" fill="#{p[0]:02x}{p[1]:02x}{p[2]:02x}"/>')
            x += w
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">' + "".join(rects) + "</svg>\n"


def apple_icon(px):
    """180×180 home-screen icon: the logo at 10× on the page's deepslate backdrop."""
    rng = random.Random(3)
    stone = [(42, 42, 47), (47, 47, 53), (38, 38, 43), (51, 51, 58)]
    grid = [[rng.choice(stone) for _ in range(18)] for _ in range(18)]
    for y, row in enumerate(px):
        for x, p in enumerate(row):
            if p:
                grid[y + 1][x + 1] = p
    return png(grid, 10)


def build_icons():
    px = logo_pixels()
    (root / "favicon.ico").write_bytes(ico([(n, png(px, n // 16)) for n in (16, 32, 48)]))
    (root / "icon.svg").write_text(svg(px))
    (root / "apple-touch-icon.png").write_bytes(apple_icon(px))
    print("icons: favicon.ico, icon.svg, apple-touch-icon.png")


if __name__ == "__main__":
    build_page()
    build_icons()
