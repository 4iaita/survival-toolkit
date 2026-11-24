"""Give the armor stand carpets (PROP_LOOKS' 16 *_carpet) the updated Actions & Stuff pack's models, texture and
animation (see import_port.py).

    python3 import_couches.py path/to/unpacked/pack path/to/textures [--write]

The pack's own list of props (texts/en_US.lang) calls them market stall canopies and rugs; the page had them as couches.
Each carpet comes in two versions, one for each of the stand's poses in turn (v.jxykui picks from their render
controller's arrays): a canopy that drapes over the block under it, and a rug. The pack's first is the canopy, but the page
starts with the rug (the user's choice): it's the look, and the canopy its variant, framed on its own (the rug is three times
as wide). Both are on textures/oreville/ans/dpg, which import_additions.py already copied as new_prop_bamboo. Nothing glows: no emissive
material, and no texel of theirs is lit in the sheet's MER (dpi).

vpofdg restarts each time the version changes. It only has the rug's bones: the roll (jm8k42d6) hops in and rolls out,
leaving the rug's strips (jm81 to jm84) behind it one by one, and flattens away. The pack hides the strips and the roll
by scaling them to nothing; here they're hidden by name instead (im.look gives the animation's end as a pose too, which
would do it twice).
"""
import import_additions as ia
from import_port import copy_texture, put

im = ia.im

ITEMS = [f"{c}_carpet" for c in ["white", "light_gray", "gray", "black", "brown", "red", "orange", "yellow", "lime", "green",
                                 "cyan", "light_blue", "blue", "purple", "magenta", "pink"]]
SHEET, TEXTURE = "textures/oreville/ans/dpg", "new_prop_bamboo"
ROLL, STRIPS = "jm8k42d6", ["jm81", "jm82", "jm83", "jm84"]
ROLLED_OUT = [[ROLL, False]]


def appears(channel):
    """When a strip that the animation scales up from nothing shows: the keyframe it jumps to full size at."""
    return next(float(t) for t, v in channel["scale"].items() if isinstance(v, dict) and v["pre"] == [0, 0, 0] and v["post"] == [1, 1, 1])


def main():
    _ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    items = ia.read_props()
    text = ia.MODELS_JS.read_text()
    spawns = []
    for item in ITEMS:
        d = items[f"minecraft:{item}"]
        [[geo, texs, rules, flags]], _scale, _pose = im.look(d, rcs, mats, anims, "§§", held=True)
        assert not rules and not flags, item
        rc = next(rcs[n] for r in d["render_controllers"] if isinstance(r, dict) for n, cond in r.items() if cond == "v.eclqlw")
        keys = lambda group: [v.split(".", 1)[1] for v in next(iter(rc["arrays"][group].values()))]
        versions = [(d["geometry"][g], d["textures"][t]) for g, t in zip(keys("geometries"), keys("textures"))]
        assert versions[0] == (geo, texs[0]) and len(versions) == 2 and {t for _, t in versions} == {SHEET}, item
        # The canopy has none of the animation's bones; the rug has them all.
        anim = anims[d["animations"]["vpofdg"]]
        bones = [{b["name"] for b in geos[g]["bones"]} for g, _ in versions]
        assert not set(anim["bones"]) & bones[0] and set(anim["bones"]) <= bones[1], item
        names = [f"prop_{item}", f"prop_{item}_2"]
        for name, (g, _t) in zip(names, versions):
            text = put(text, "MOB_MODELS", name, im.model(geos[g]))
        text = put(text, "PROP_LOOKS", item, {"names": ["§§"], "scale": 1, "anim": "rug", "layers": [[names[1], [TEXTURE], ROLLED_OUT]],
                                              "variants": [{"layers": [[names[0], [TEXTURE], []]], "anim": None, "ownFit": 1}]})
        spawn = im.baked_act(d, anims, {"every": [4, 8], "parts": [("vpofdg", 0, None, [[ROLL, True]])]
                                        + [(None, 0, appears(anim["bones"][strip]), [[strip, False]]) for strip in STRIPS]})
        for strip in STRIPS:
            del spawn["parts"][0]["bones"][strip]
        spawns.append(spawn)
    assert all(s == spawns[0] for s in spawns)
    text = put(text, "PROP_ACTS", "rug", {"spawn": spawns[0], "acts": []})
    print(len(ITEMS), "carpets; the rug rolls out in", spawns[0]["length"])
    if not ia.WRITE:
        return
    copy_texture(SHEET, TEXTURE)
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    main()
