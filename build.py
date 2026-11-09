"""Combine src/ into a single self-contained index.html and draw the site icons."""
import base64
import pathlib
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
<meta name="description" content="Anvil enchanting planner, potion brewing guide, villager trade guide, mobs and name tag secrets, and armor stand props for Minecraft, Java and Bedrock.">
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
    body = read("body.html")
    for part in ("brew.html", "trade.html", "mob.html", "prop.html"):
        body = body.replace(f"<!-- {part} -->\n", read(part))
    scripts = ["brew-data.js", "art.js", "icons.js", "icons2.js", "icons3.js", "icons4.js", "icons5.js",
               "villager.js", "backdrop.js", "trade-data.js", "mob-models.js", "mobs.js", "mob-data.js", "tag-data.js", "tag-data-more.js", "prop-data.js", "prop-data-more.js",
               "ui.js", "brew-ui.js", "trade-ui.js", "mob-ui.js", "prop-ui.js"]
    out = (head + read("style.css") + read("brew.css") + read("trade.css") + read("mob.css") + read("prop.css") + "</style>\n</head>\n<body>\n" + body +
           '\n<script id="solver">\n' + read("solver.js") + "</script>\n<script>\n" +
           art_script() + "\n" + skins_script() + "\n" + mob_skins_script() + "\n" + "\n".join(read(f) for f in scripts) +
           "</script>\n</body>\n</html>\n")
    (root / "index.html").write_text(out)
    print(f"index.html: {len(out)} bytes")


# ---------- Texture pack art ----------
# Every 16x16 PNG in art/ is embedded as base64 RGBA so the page stays one self-contained file.

def read_png(path):
    """Decode a non-interlaced PNG to the RGBA bytes of its top-left 16x16 frame. A wider texture is a bigger picture of
    the same block, so it's sampled down to 16x16 (a tall one of width 16 is frames of animation, one under the next)."""
    data = path.read_bytes()
    pos, idat, plte, trns = 8, b"", None, None
    while pos < len(data):
        n = struct.unpack(">I", data[pos:pos + 4])[0]
        tag, body = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + n]
        pos += 12 + n
        if tag == b"IHDR":
            w, h, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", body)
        elif tag == b"PLTE":
            plte = [tuple(body[i:i + 3]) for i in range(0, len(body), 3)]
        elif tag == b"tRNS":
            trns = body
        elif tag == b"IDAT":
            idat += body
    assert interlace == 0, f"{path.name}: interlaced PNGs are not supported"
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ctype]
    bpp, stride = max(1, channels * depth // 8), (w * channels * depth + 7) // 8
    raw, rows, prev, i = zlib.decompress(idat), [], bytearray(stride), 0
    for _ in range(h):
        f, line = raw[i], bytearray(raw[i + 1:i + 1 + stride])
        i += 1 + stride
        for x in range(stride):
            a, b = (line[x - bpp] if x >= bpp else 0), prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line)
        prev = line

    def sample(line, x):
        if depth == 8:
            return tuple(line[x * channels:(x + 1) * channels])
        if depth == 16:
            return tuple(line[(x * channels + k) * 2] for k in range(channels))
        bit = x * depth
        return ((line[bit // 8] >> (8 - depth - bit % 8)) & ((1 << depth) - 1),)

    out = bytearray()
    step = max(1, w // 16)
    for y in range(16):
        for x in range(16):
            s = sample(rows[y * step], x * step)
            if ctype == 6: out += bytes(s)
            elif ctype == 4: out += bytes((s[0], s[0], s[0], s[1]))
            elif ctype == 3: out += bytes((*plte[s[0]], trns[s[0]] if trns and s[0] < len(trns) else 255))
            elif ctype == 2:
                clear = trns and depth == 8 and s == tuple(struct.unpack(">HHH", trns))
                out += bytes((*s, 0 if clear else 255))
            else:
                v = s[0] * 255 // ((1 << depth) - 1)
                out += bytes((v, v, v, 255))
    return bytes(out)


def art_script():
    files = sorted((root / "art").glob("*.png"))
    entries = ",".join(f'"{f.stem}":"{base64.b64encode(read_png(f)).decode()}"' for f in files)
    return f"const ART = {{{entries}}};"


def skins_script():
    """Villager skins from art/villager/, kept as PNG data URLs; the page decodes them when it draws a villager."""
    files = sorted((root / "art" / "villager").glob("*.png"))
    entries = ",".join(f'"{f.stem}":"data:image/png;base64,{base64.b64encode(f.read_bytes()).decode()}"' for f in files)
    return f"const SKINS = {{{entries}}};"


def mob_skins_script():
    """Mob textures from art/mobs/ (copied from the pack by import_models.py), kept as PNG data URLs like SKINS."""
    files = sorted((root / "art" / "mobs").glob("*.png"))
    entries = ",".join(f'"{f.stem}":"data:image/png;base64,{base64.b64encode(f.read_bytes()).decode()}"' for f in files)
    return f"const MOB_SKINS = {{{entries}}};"


# ---------- Icons ----------
# The favicon is the page's "ui:logo": the texture pack's chest as an isometric block,
# drawn with the same projection as cube() in src/icons2.js so both match.

def logo_pixels(size):
    face = lambda n: [tuple(b[i:i + 4]) for b in [read_png(root / "art" / f"chest_{n}.png")] for i in range(0, 1024, 4)]
    left, top, right = face("front"), face("top"), face("side")
    k = size / 16
    out = [[None] * size for _ in range(size)]
    for y in range(size):
        for x in range(size):
            px, py = (x + 0.5) / k, (y + 0.5) / k
            dx, dy = (px - 8) / 8, (py - 4) / 4
            if abs(dx) + abs(dy) <= 1:
                u, v, f, src = (dx + dy + 1) / 2, (dy - dx + 1) / 2, 1, top
            elif px < 8 and 4 + px / 2 <= py < 12 + px / 2:
                u, v, f, src = px / 8, (py - 4 - px / 2) / 8, 0.8, left
            elif px >= 8 and 12 - px / 2 <= py < 20 - px / 2:
                u, v, f, src = (px - 8) / 8, (py - 12 + px / 2) / 8, 0.62, right
            else:
                continue
            p = src[min(15, int(v * 16)) * 16 + min(15, int(u * 16))]
            if p[3] >= 64:
                out[y][x] = tuple(round(c * f) for c in p[:3])
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
    n, rects = len(px), []
    for y, row in enumerate(px):
        x = 0
        while x < n:
            p = row[x]
            if not p:
                x += 1
                continue
            w = 1
            while x + w < n and row[x + w] == p:
                w += 1
            rects.append(f'<rect x="{x}" y="{y}" width="{w}" height="1" fill="#{p[0]:02x}{p[1]:02x}{p[2]:02x}"/>')
            x += w
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" shape-rendering="crispEdges">' + "".join(rects) + "</svg>\n"


def apple_icon(px):
    """180×180 home-screen icon: the 32px logo at 5× on the page's deepslate backdrop."""
    tiles = read_png(root / "art" / "deepslate_tiles.png")
    grid = [[tuple(round(c * 0.55) for c in tiles[((y // 2) % 16 * 16 + (x // 2) % 16) * 4:][:3]) for x in range(36)] for y in range(36)]
    for y, row in enumerate(px):
        for x, p in enumerate(row):
            if p:
                grid[y + 2][x + 2] = p
    return png(grid, 5)


def build_icons():
    small, px = logo_pixels(16), logo_pixels(32)
    (root / "favicon.ico").write_bytes(ico([(16, png(small, 1)), (32, png(px, 1)), (64, png(px, 2))]))
    (root / "icon.svg").write_text(svg(px))
    (root / "apple-touch-icon.png").write_bytes(apple_icon(px))
    print("icons: favicon.ico, icon.svg, apple-touch-icon.png")


if __name__ == "__main__":
    build_page()
    build_icons()
