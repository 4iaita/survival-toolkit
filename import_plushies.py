"""Give the armor stand plushies (PROP_LOOKS' wools, Rabbit's Foot, Dragon's Breath, Sculk Vein and Dried Ghast) the updated
Actions & Stuff pack's models, texture and animations (see import_port.py).

    python3 import_plushies.py path/to/unpacked/pack path/to/textures [--write]

They had the old pack's models and texture sheet. All are on one sheet in the new pack (textures/oreville/ans/dpg),
which import_additions.py already copied as new_prop_bamboo, but three of the axolotls (myu). A plushie pops in when the item is put in the stand's hand
(spawn), and squishes when the stand is hit or its pose changes (qhvtxw); the stage plays the first when one is picked and
the second now and then (PROP_ACTS). Blue wool's and the dried ghast's are reversible: the pack keeps both halves in one
model, hides one, and turns it inside out when the pose changes (mhaifv and afrfdb, PROP_ACTS' turns: to each variant). Other plushies come in several versions, one for each of the stand's poses, in turn
(v.jxykui picks from their render controller's arrays): the first is the look, the rest its variants.
"""
import import_additions as ia
from import_port import copy_texture, put

im = ia.im

COLORS = ["white", "silver", "gray", "black", "brown", "red", "orange", "yellow", "lime", "green", "cyan", "light_blue", "blue",
          "purple", "magenta", "pink"]
ITEMS = [f"{c}_wool" for c in COLORS] + ["rabbit_foot", "dragon_breath", "sculk_vein", "dried_ghast"]
TEXTURES = {"textures/oreville/ans/dpg": "new_prop_bamboo", "textures/oreville/ans/myu": "new_prop_axolotl"}
# The reversible ones' bones for each half, the one that shows to start with first, and how the other stands (qnxpka).
HALVES = {"blue_wool": [["hdmk9kima5*", "hdmk9d68kima5*"], ["hdmk98dgokima5*", "hdmk9d688dgokima5*"]],
          "dried_ghast": [["hdmk9kima5*", "92hhq892kld68*"], ["hdmk98dgokima5*", "5ja65892kld68*"]]}
INSIDE_OUT = {"hdmk98dgokima5": {"r": [0, 0, -180]}}
EVERY = [4, 8]


def flip(d, anims, key, at):
    """The act that turns a reversible plushie inside out (mhaifv) or back (afrfdb), over how it stands afterwards (at, that
    pose), so the turn the pose already has is taken off."""
    act = im.baked_act(d, anims, {"every": EVERY, "parts": [(key, 0, None, [[p, True] for both in HALVES.values() for half in both for p in half])]})
    for bone, channels in at.items():
        act["parts"][0]["bones"].setdefault(bone, {})["r"] = [[-v for v in channels["r"]]]
    return act


def main():
    _ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    items = ia.read_props()
    text = ia.MODELS_JS.read_text()
    acts = {}
    for item in ITEMS:
        d = items[f"minecraft:{item}"]
        [[geo, texs, rules, flags]], _scale, pose = im.look(d, rcs, mats, anims, "§§", held=True)
        assert not rules and not pose and not (set(flags) - {"lit"}), item
        # The other versions, by the same material: their geometries and textures are lists the pose picks from.
        rc = next(rcs[n] for r in d["render_controllers"] if isinstance(r, dict) for n, cond in r.items() if cond == "v.eclqlw")
        lists = rc.get("arrays", {})
        keys = lambda group: [v.split(".", 1)[1] for v in next(iter(lists[group].values()))]
        versions = [(d["geometry"][g], d["textures"][t]) for g, t in zip(keys("geometries"), keys("textures"))] if lists else [(geo, texs[0])]
        assert versions[0] == (geo, texs[0]), item
        layers = []
        for i, (g, t) in enumerate(versions):
            name = f"prop_{item}" + (f"_{i + 1}" if i else "")
            text = put(text, "MOB_MODELS", name, im.model(geos[g]))
            layers.append([[name, [TEXTURES[t]], [], *([flags] if flags else [])]])
        kind = "reversible" if item in HALVES else "plush"
        variants = [{"layers": l} for l in layers[1:]]
        if kind == "reversible":
            outer, inner = HALVES[item]
            hide = lambda half: [[layers[0][0][0], layers[0][0][1], [[p, False] for p in half], *layers[0][0][3:]]]
            layers, variants = [hide(inner)], [{"layers": hide(outer), "pose": INSIDE_OUT}]
        text = put(text, "PROP_LOOKS", item, {"names": ["§§"], "scale": 1, "anim": kind, "layers": layers[0],
                                              **({"variants": variants} if variants else {})})
        if kind not in acts:
            squish = im.baked_act(d, anims, {"every": EVERY, "parts": [("qhvtxw", 0, None, [])]})
            spawn = im.baked_act(d, anims, {"every": EVERY, "parts": [("spawn", 0, None, [])]})
            acts[kind] = {"spawn": spawn, "acts": [squish],
                          **({"turns": [flip(d, anims, "afrfdb", {}), flip(d, anims, "mhaifv", INSIDE_OUT)]} if kind == "reversible" else {})}
        print(item, kind, len(versions), "lit" if flags else "")
    # The dragon's bottle, which the old pack's scripts also drew.
    text = "\n".join(l for l in text.split("\n") if not l.startswith('  "prop_dragon_breath_1": '))
    if "const PROP_ACTS = {" not in text:
        text = text.rstrip("\n") + "\nconst PROP_ACTS = {\n};\n"
    for kind, value in acts.items():
        text = put(text, "PROP_ACTS", kind, value)
    if not ia.WRITE:
        return
    for path, name in TEXTURES.items():
        copy_texture(path, name)
    (im.root / "art" / "mobs" / "prop_dragon_breath.png").unlink(missing_ok=True)
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    main()
