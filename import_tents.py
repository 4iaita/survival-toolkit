"""Give the armor stand tents (PROP_LOOKS' 16 *_wool_stairs) the updated Actions & Stuff pack's model and textures (see
import_port.py).

    python3 import_tents.py path/to/unpacked/pack path/to/textures [--write]

Wool stairs turn into a tent, all 16 on one model, each on a sheet of its own. It's still and always the same: no versions
(v.jxykui is 0, and nothing reads v.pihgwp, the stand being hit), no particles, no animations but the plain item's (ITEM), and
no texel lit in its sheet's MER. The pack's own list (texts/en_US.lang) doesn't have them.

Its slanted poles reach a little under the ground (SUNK): the tent stands on its stakes and its two upright poles. It's drawn
a little further up than other props (LOW), or its near corner would be cut off.
"""
import json
import math

import import_additions as ia
from import_port import copy_texture, put

im = ia.im

ANS = "textures/oreville/ans/"
SHEETS = {"white": "odg", "light_gray": "obv", "gray": "obn", "black": "nyj", "brown": "nyo", "red": "ocr", "orange": "ocf", "yellow": "odj",
          "lime": "obx", "green": "obp", "cyan": "oak", "light_blue": "obt", "blue": "nyl", "purple": "oco", "magenta": "ocb", "pink": "oci"}
MODEL = "prop_wool_stairs"
# A script that only sets a variable, the plain item in the hand (first and third person) and a copper golem's hand.
ITEM = {"kgklcq", "xckqnr", "ecpndh", "lqlrks"}
SUNK = 1.11
# How far under its middle its near corner can look, the stage seen from STAGE_PITCH above (src/mobs.js).
STAGE_PITCH = 0.2
LOW = 11.6
OLD = "new_prop_{}_wool_stairs"


def corners(cube):
    """A cube's eight corners, turned as the game turns it."""
    (x, y, z), (w, h, d) = cube["origin"], cube["size"]
    a = math.radians(cube.get("rotation", [0, 0, 0])[2])
    px, py, _ = cube.get("pivot", [0, 0, 0])
    for cx, cy in ((x, y), (x + w, y), (x, y + h), (x + w, y + h)):
        dx, dy = cx - px, cy - py
        # Bedrock turns the other way round about z as the model is seen (positive leans a west slope in to the ridge).
        yield px + dx * math.cos(a) + dy * math.sin(a), py - dx * math.sin(a) + dy * math.cos(a)


def unlit(path):
    """Whether no texel is lit in the sheet's MER (green)."""
    from PIL import Image
    sheet = im.texture_file(path)
    spec = json.loads(sheet.with_suffix("").with_name(sheet.stem + ".texture_set.json").read_text())["minecraft:texture_set"]
    mer = Image.open(sheet.with_name(spec["metalness_emissive_roughness_subsurface"] + ".png")).convert("RGB")
    return mer.getchannel("G").getextrema() == (0, 0)


def main():
    _ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    items = ia.read_props()
    assert {k for k in items if k.endswith("wool_stairs")} == {f"minecraft:{c}_wool_stairs" for c in SHEETS}
    text = ia.MODELS_JS.read_text()
    shapes = set()
    for color, sheet in SHEETS.items():
        item = f"{color}_wool_stairs"
        d = items[f"minecraft:{item}"]
        [[geo, texs, rules, flags]], scale, pose = im.look(d, rcs, mats, anims, "§§", held=True)
        assert texs == [ANS + sheet] and scale == 1 and not rules and not flags and not pose, item
        on = {k for a in d["scripts"]["animate"] for k in ([a] if isinstance(a, str) else a)}
        assert on == ITEM and "particle_effects" not in d and "sound_effects" not in d, item
        pre = " ".join(d["scripts"]["pre_animation"])
        rest = json.dumps({k: v for k, v in d.items() if k != "scripts"}) + json.dumps(d["scripts"]["animate"])
        assert "v.jxykui=0;" in pre and "jxykui" not in rest and "pihgwp" not in rest and "body_y_rotation" not in rest, item
        assert unlit(texs[0]), item
        [cond] = [next(iter(r)) for r in d["render_controllers"] if next(iter(r.values())) == "v.eclqlw"]
        assert rcs[cond] == {"geometry": "Geometry.pbyzuw", "textures": ["Texture.pbyzuw"], "materials": [{"*": "Material.pbyzuw"}]}, item
        assert mats[d["materials"]["pbyzuw"]][0] == "entity_alphatest", item  # both sides show
        shapes.add(geo)
        text = put(text, "PROP_LOOKS", item, {"names": ["§§"], "scale": 1, "sunk": SUNK, "low": LOW, "layers": [[MODEL, [f"prop_{item}"], [], {"buried": 1}]]})
    [shape] = shapes
    cubes = [c for b in geos[shape]["bones"] for c in b.get("cubes", [])]
    assert all(not any(c.get("rotation", [0, 0, 0])[:2]) for c in cubes)
    points = [p for c in cubes for p in corners(c)]
    lowest, widest, highest = min(y for _, y in points), max(abs(x) for x, _ in points), max(y for _, y in points)
    assert round(-lowest, 2) == SUNK and min(y for c in cubes if not c.get("rotation") for _, y in corners(c)) < 0.01, lowest
    stakes = [c for c in cubes if not c.get("rotation")]
    corner = max(math.hypot(x, z) for c in stakes for x in (c["origin"][0], c["origin"][0] + c["size"][0]) for z in (c["origin"][2], c["origin"][2] + c["size"][2]))
    assert round(corner * math.sin(STAGE_PITCH), 1) == LOW, corner
    text = put(text, "MOB_MODELS", MODEL, im.model(geos[shape]))
    text = "\n".join(l for l in text.split("\n") if not l.startswith(f'  "{OLD.format("black")}":'))
    print(len(SHEETS), f"tents, {widest * 2:.0f} wide and {highest:.0f} tall, {SUNK} in the ground")
    if not ia.WRITE:
        return
    for color, sheet in SHEETS.items():
        copy_texture(ANS + sheet, f"prop_{color}_wool_stairs")
        (im.root / "art" / "mobs" / f"{OLD.format(color)}.png").unlink(missing_ok=True)
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    main()
