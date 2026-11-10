"""Give the llama the updated Actions & Stuff pack's models, animations, coats and carpets (see import_port.py).

    python3 import_llama.py path/to/unpacked/pack path/to/textures [--write]

Its plain and baby looks get the pack's current models (they went by the old pack's bones, and the llama had no
animations at all), and the skins of its four coats. A carpet is a model of its own the pack lays over a grown llama
(its second layer), in the carpet's dye color: the game says which by v.DecorTextureIndex (0 for none, 1 to 16 the dye
colors), so the 16 carpets are copied as new_llama_carpet_<dye> for the stage to draw on that layer (MOB_CARPETS,
src/mob-data.js). q.mark_variant is 1 only for a trader llama (its trader's blanket, see import_trader_llama.py): a
wild llama's is 0. Its chest is part of the model the pack shows while it carries one (MOB_CHESTS). It has no names but
its baby's. Run import_additions.py first. It prints the skins to put in MOB_VARIANTS and the carpets' layers to put in
MOB_CARPETS (src/mob-data.js).
"""
import copy
import json

from import_port import copy_texture, ia, im, port

# The pack's q.variant 0 to 3, as Bedrock numbers them.
VARIANTS = ["creamy", "white", "brown", "gray"]
# v.DecorTextureIndex 1 to 16: the carpet's dye color, in the game's order (src/mob-data.js's DYES names).
CARPETS = ["white", "orange", "magenta", "light blue", "yellow", "lime", "pink", "gray", "light gray", "cyan", "purple", "blue",
           "brown", "green", "red", "black"]

# It breathes, its body and head swaying a little, all the while (the pack's standing loop).
MOTIONS = [("idle", 1)]
# Every 1 to 3.75 seconds it blinks (the pack's blink: its open eyes, the blink bones, shrink to nothing for 0.15
# seconds), at half the pack's speed so it's seen, over its breathing (keep).
BLINK = {"every": [1, 4], "keep": True, "weight": 3, "parts": [("blinking.step_eye", 0, None, [], 0.5)]}
# Standing still a while (the pack waits up to 6.33 seconds), it does one of three idles, blending in over its idle
# controller's 0.24 seconds, over its breathing (keep).
IDLES = [{"every": [3, 7], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
ACTS = [BLINK, *IDLES]


def wild(v):
    """What the game says for a wild llama of coat v: no trader's blanket."""
    return {"variant": float(v), "mark_variant": 0.0}


def carpet_key(dye):
    return f"{ia.PREFIX}llama_carpet_{dye.replace(' ', '_')}"


def carpeted(mob, name, mood, decor):
    """The look's layers with carpet decor on (v.DecorTextureIndex), as the pack draws them."""
    ents, rcs, _g, mats, anims, _p, _a = im.read_pack()
    d = copy.deepcopy(ents[f"minecraft:{mob}"])
    d["scripts"]["initialize"] = [f"v.DecorTextureIndex={decor};", *d["scripts"].get("initialize", [])]
    return im.look(d, rcs, mats, anims, name, mood=mood)[0]


def carpets():
    """Each carpet's texture in the pack, by its stage key, checked to be drawn on the plain look's carpet layer."""
    plain = carpeted("llama", "", wild(0), 0)
    out = {}
    for i, dye in enumerate(CARPETS, 1):
        layers = carpeted("llama", "", wild(0), i)
        if len(layers) != 2 or layers[1][0] != plain[1][0] or layers[0] != plain[0]:
            raise SystemExit(f"the {dye} carpet isn't drawn on the carpet layer")
        out[carpet_key(dye)] = layers[1][1][0]
    return out


if __name__ == "__main__":
    port("llama", variants=VARIANTS, acts=ACTS, motions=MOTIONS, answers=wild, nested_poses=True)
    textures = carpets()
    carpet_layer = ia.parse_section(ia.MODELS_JS.read_text(), "MOB_LOOKS")["llama"][0]["layers"][1]
    print("carpets:", json.dumps({"layers": {carpet_layer[1][0]: carpet_layer[0]}}))
    if ia.WRITE:
        for key, path in textures.items():
            copy_texture(path, key)
