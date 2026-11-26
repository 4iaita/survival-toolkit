"""Copy the banner patterns the Banners tab draws into art/banners/.

The pack (../textures) has only the plain banner (entity/banner/banner_base: the cloth, white, with the pole and the bar) and
the ominous banner (banner_pattern_illager). The patterns are the game's own, which differ a little between the editions
(Bedrock's edges are sharper, the gradients differ): Java's from misode/mcmeta (the assets branch, assets/minecraft/textures/
entity/banner/<pattern>.png), Bedrock's from Mojang/bedrock-samples (resource_pack/textures/entity/banner/banner_<pattern>.tga,
or .png for the newer ones). Only how solid each texel is (alpha) is kept: the page colors it with the layer's dye and shades
it with the pack's cloth, so the patterns' own grays (Java's grain) don't count.

Writes:
  art/banners/java.png, art/banners/bedrock.png   each pattern's alpha over the flag's part of the texture (BOX wide and high),
                                                  one under the next in PATTERNS' order, "base" (the whole cloth) first
  art/banners/cloth.png, art/banners/ominous.png  the pack's two banner textures, whole

The same patterns on a shield are textures of their own in both games, at half a banner's size: 10×20, the shield's front
less its one-texel rim (Java's assets/minecraft/textures/entity/shield/<pattern>.png, Bedrock's resource_pack/textures/entity/
shield_patterns/<pattern>.png, both 64×64 on the shield's layout). Their shapes are the same in both editions once Bedrock's
diagonal halves are mapped as its banner's are (BEDROCK_SHAPES: its shield files swap them the same way); their grays differ.
The game multiplies each layer's dye by the pattern's own gray, so the shields keep it (the pack has no cloth for a shield).
The pack has the plain shield (entity/shield) and redraws Bedrock's ominous one whole (entity/shield_patterns/illager: a shield
of its own, opaque all over); Java's ominous banner goes on a shield as its 8 layers.
  art/banners/shield_java.png, shield_bedrock.png   each pattern's gray and alpha over the shield's pattern area (SHIELD_AREA),
                                                    one under the next in PATTERNS' order, "base" first
  art/banners/shield.png, shield_ominous.png        the pack's shield and its ominous shield, whole

    python3 -c "import import_banner_patterns as m; m.shields()"    the shields alone

    python3 import_banner_patterns.py [path/to/textures]
Then run build.py.
"""
import io
import pathlib
import sys
import urllib.request

from PIL import Image

root = pathlib.Path(__file__).parent
textures = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / "textures"
out = root / "art" / "banners"

JAVA = "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/banner/{}.png"
BEDROCK = "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/banner/banner_{}.{}"
SHIELD_JAVA = "https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/textures/entity/shield/{}.png"
SHIELD_BEDROCK = "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/entity/shield_patterns/{}.png"
# Where the patterns lie on the shield's texture: the plate's front (12×22 at 1,1) less its rim.
SHIELD_AREA = (2, 2, 12, 22)
# The flag's part of the texture: its box (20×40×1 at uv 0,0) laid out as the game lays a box out.
BOX = (44, 42)
# In the loom's order (Java's tag banner_pattern/no_item_required, then the ones a banner pattern item gives). Must match
# BANNER_PATTERNS in src/banner-data.js.
PATTERNS = ["base",
            "square_bottom_left", "square_bottom_right", "square_top_left", "square_top_right", "stripe_bottom", "stripe_top",
            "stripe_left", "stripe_right", "stripe_center", "stripe_middle", "stripe_downright", "stripe_downleft", "small_stripes",
            "cross", "straight_cross", "triangle_bottom", "triangle_top", "triangles_bottom", "triangles_top", "diagonal_left",
            "diagonal_up_right", "diagonal_up_left", "diagonal_right", "circle", "rhombus", "half_vertical", "half_horizontal",
            "half_vertical_right", "half_horizontal_bottom", "border", "gradient", "gradient_up",
            "bricks", "curly_border", "flower", "creeper", "skull", "mojang", "globe", "piglin", "flow", "guster"]


# The patterns are kept by shape, under Java's names. Bedrock's four diagonal halves have each other's names: its banner_diagonal_left
# is Java's diagonal_up_left (the lower left half), and so on, so its names for them differ too (BANNER_PATTERNS' be).
BEDROCK_SHAPES = {"diagonal_left": "diagonal_up_left", "diagonal_up_right": "diagonal_right", "diagonal_up_left": "diagonal_left",
                  "diagonal_right": "diagonal_up_right"}


def fetch(url):
    with urllib.request.urlopen(url) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def bedrock(name):
    for ext in ("tga", "png"):
        try:
            return fetch(BEDROCK.format(name, ext))
        except Exception:
            pass
    raise SystemExit(f"bedrock-samples has no banner_{name}")


def atlas(load):
    sheet = Image.new("L", (BOX[0], BOX[1] * len(PATTERNS)))
    for i, name in enumerate(PATTERNS):
        img = load(name)
        assert img.size == (64, 64), (name, img.size)
        sheet.paste(img.crop((0, 0, *BOX)).getchannel("A"), (0, i * BOX[1]))
    return sheet


def shield_atlas(url, edition):
    w, h = SHIELD_AREA[2] - SHIELD_AREA[0], SHIELD_AREA[3] - SHIELD_AREA[1]
    sheet = Image.new("LA", (w, h * len(PATTERNS)))
    for i, name in enumerate(PATTERNS):
        img = fetch(url.format(BEDROCK_SHAPES.get(name, name) if edition == "bedrock" else name))
        assert img.size == (64, 64), (name, img.size)
        assert img.getchannel("A").getbbox() is None or all(a <= b if k < 2 else a >= b for k, (a, b) in enumerate(zip(SHIELD_AREA, img.getchannel("A").getbbox()))), name
        sheet.paste(img.crop(SHIELD_AREA).convert("LA"), (0, i * h))
    sheet.save(out / f"shield_{edition}.png", optimize=True)


def shields():
    out.mkdir(parents=True, exist_ok=True)
    shield_atlas(SHIELD_JAVA, "java")
    shield_atlas(SHIELD_BEDROCK, "bedrock")
    for name, src in (("shield", "shield"), ("shield_ominous", "shield_patterns/illager")):
        Image.open(textures / f"entity/{src}.png").convert("RGBA").save(out / f"{name}.png", optimize=True)


def main():
    out.mkdir(parents=True, exist_ok=True)
    # Java's base is the whole cloth; Bedrock's own (banner.tga) is bigger and isn't a pattern, so both take Java's.
    base = fetch(JAVA.format("base"))
    atlas(lambda n: base if n == "base" else fetch(JAVA.format(n))).save(out / "java.png", optimize=True)
    atlas(lambda n: base if n == "base" else bedrock(BEDROCK_SHAPES.get(n, n))).save(out / "bedrock.png", optimize=True)
    for name, src in (("cloth", "banner_base"), ("ominous", "banner_pattern_illager")):
        Image.open(textures / f"entity/banner/{src}.png").convert("RGBA").save(out / f"{name}.png", optimize=True)
    shields()
    print("art/banners:", ", ".join(sorted(p.name for p in out.iterdir())))


if __name__ == "__main__":
    main()
