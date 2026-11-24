"""Give the armor stand Stockings (PROP_LOOKS' leather_boots) the updated Actions & Stuff pack's models, animation and glow
(see import_port.py).

    python3 import_stockings.py path/to/unpacked/pack path/to/textures [--write]

Dyed leather boots worn by a stand named §§, with anything but a banner in its hand (then they're the flag's design, see
import_house.py): a Christmas stocking. Which one is by the boots' exact color (v.dhvjqp, from q.armor_color_slot): the 16
dyes, and eight mixes of two (DESIGNS; the names are texts/en_US.lang's). It isn't by the stand's pose, and punching it does
nothing. All 24 are on textures/oreville/ans/dpg, which import_additions.py already copied as new_prop_bamboo.

The entrance (ztxrdh) is one for all and starts again when the boots are dyed: the nail is knocked in and the stocking drops
onto it and swings. Its last frame is how it rests, and it's baked as what it adds to that (see import_christmas.py). The pack
hangs it off the ground (6d6e6flk, moved up 17.5); here it's landed, like every prop.

Some bones have emissive materials (GLOWING): their faint texels (alpha 1 and up) glow, the flame's by how faint they are. The
outlines are inside out (a negative size), so only their far sides show, round what they're round (turned_out).
"""
import fnmatch
import re

import import_additions as ia
from import_christmas import ZERO, Prop, entrance
from import_house import WITHIN, turned_out
from import_port import put

im = ia.im

ITEM = "leather_boots"
SHEET, TEXTURE = "textures/oreville/ans/dpg", "new_prop_bamboo"
# The page's order: a color's name and the boots' color (as the pack's scripts check it), in the order of PROP_ROWS (src/prop-data.js).
DESIGNS = {"red": (176, 46, 38), "black": (29, 29, 33), "blue": (60, 68, 170), "brown": (131, 84, 50), "cyan": (22, 156, 156), "gray": (71, 79, 82),
           "green": (94, 124, 22), "light_blue": (58, 179, 218), "light_gray": (157, 157, 151), "lime": (128, 199, 31), "magenta": (199, 78, 189),
           "orange": (249, 128, 29), "pink": (243, 139, 170), "purple": (137, 50, 184), "white": (240, 240, 240), "yellow": (254, 216, 61),
           "brown_black": (80, 56, 41), "gray_lime": (99, 139, 56), "green_black": (61, 76, 27), "green_brown": (112, 104, 36),
           "green_yellow": (174, 170, 41), "magenta_black": (114, 53, 111), "orange_yellow": (251, 172, 45), "red_magenta": (187, 62, 113)}
RC = "controller.render.oreville_ans.fbkggi"
# The render controller's materials: plain, and those that glow by how faint a texel is.
PLAIN, GLOWING = {"irduzd"}, {"mqwxej": "entity_emissive_alpha", "vppzlt": "entity_emissive_alpha", "uhrqgp": "entity_emissive"}

# The Vibe Cat is white and glows all over: a halo washes its face and outlines out, so it has none.
WASHED = "blue"
# The material that shows one side only. A hook is two boxes in the same place, one inside out, for its outer and inner
# faces; one design's hook has the plain material, which shows both sides of both: here it's as the others are.
ONE_SIDED, HOOK = "uhrqgp", "9ggcgmldaf6"


def material_of(bone, rc):
    """The last of the render controller's patterns that fits a bone."""
    return [e.split(".", 1)[1] for m in rc["materials"] for p, e in m.items() if fnmatch.fnmatchcase(bone.lower(), p.lower())][-1]


def based_on(name, mats, root):
    chain = []
    while name and name not in chain:
        chain.append(name)
        name = mats.get(name, ("", {}))[0]
    return root in chain


def main():
    _ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    d = ia.read_props()[f"minecraft:{ITEM}"]
    rc = rcs[RC]
    [cond] = [c for r in d["render_controllers"] for n, c in r.items() if n == RC]
    assert cond == "v.dhvjqp>=0&&v.mgwsac&&v.aroalz<0&&!v.dkbeiz"
    pre = " ".join(d["scripts"]["pre_animation"])
    assert "v.mgwsac=v.eclqlw&&!q.is_item_name_any('slot.weapon.mainhand','minecraft:banner');" in pre
    number = {tuple(map(int, m[:3])): int(m[3]) for m in re.findall(r"v\.ujysjy\.r==(\d+)&&v\.ujysjy\.g==(\d+)&&v\.ujysjy\.b==(\d+)\?\{v\.dhvjqp=(\d+);\}", pre)}
    assert sorted(number) == sorted(DESIGNS.values()) and sorted(number.values()) == list(range(24))
    on = {next(iter(a)) if isinstance(a, dict) else a for a in d["scripts"]["animate"]}
    assert on == {"kgklcq", "dcdzju", "ztxrdh", "lqlrks"} and "particle_effects" not in d
    assert "bones" not in anims[d["animations"]["dcdzju"]]
    keys = lambda group: [v.split(".", 1)[1] for v in next(iter(rc["arrays"][group].values()))]
    assert {d["textures"][t] for t in keys("textures")} == {SHEET}
    for key, root in GLOWING.items():
        assert based_on(d["materials"][key], mats, root), key
    text = ia.MODELS_JS.read_text()
    shapes = {c: geos[d["geometry"][keys("geometries")[number[rgb]]]] for c, rgb in DESIGNS.items()}
    every = {b["name"] for g in shapes.values() for b in g["bones"]}
    layers = []
    for color, shape in shapes.items():
        kinds = {b["name"]: material_of(b["name"], rc) for b in shape["bones"] if b.get("cubes")}
        assert set(kinds.values()) <= PLAIN | set(GLOWING), (color, kinds)
        turned = turned_out(shape)
        lit = sorted(b["name"] for b in turned["bones"] if b.get("cubes") and kinds.get(b["name"].removesuffix(WITHIN)) in GLOWING)
        text = put(text, "MOB_MODELS", f"prop_stocking_{color}", im.model(turned))
        culled = [b["name"] for b in turned["bones"] if b.get("cubes") and b["name"] in kinds and (kinds[b["name"]] == ONE_SIDED or b["name"] == HOOK)]
        layers.append([[f"prop_stocking_{color}", [TEXTURE], [], {"opaqueBones" if color == WASHED else "litBones": lit, "insideBones": [f"*{WITHIN}"], "culledBones": culled}]])
    p = Prop(ITEM, d, anims, every)
    rest, spawn = entrance(p, "ztxrdh")
    rest = im.compact({b: {c: [round(x, 4) for x in v] for c, v in ch.items() if v != ZERO[c]} for b, ch in rest.items()})
    rest = {b: ch for b, ch in rest.items() if ch}
    look = {"names": ["§§"], "scale": 1, "anim": "stocking", "evenBloom": 1, "pose": rest, "layers": layers[0], "variants": [{"layers": l} for l in layers[1:]]}
    text = put(text, "PROP_LOOKS", ITEM, look)
    text = put(text, "PROP_ACTS", "stocking", {"spawn": spawn, "acts": []})
    # The old pack's, which nothing drew.
    text = "\n".join(l for l in text.split("\n") if not l.startswith('  "prop_leather_boots":'))
    print(len(layers), "stockings; the entrance takes", spawn["length"])
    if not ia.WRITE:
        return
    (im.root / "art" / "mobs" / "prop_leather_boots.png").unlink(missing_ok=True)
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    main()
