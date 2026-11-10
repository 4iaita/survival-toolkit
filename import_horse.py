"""Give the horse the updated Actions & Stuff pack's models, animations, coats, markings and armor (see import_port.py).

    python3 import_horse.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, snowy, reindeer and Rudolph ones went by the old pack's
bones; the Wendigo ones had the new models but nothing moved them, and the horse had no animations at all), and the
skins of its seven coats. Its markings are a second texture the pack lays over the coat (q.mark_variant), so they're
written as overlays, one for each look that has them. Its six kinds of armor are each a model of their own on the
horse's skeleton (MOB_ARMOR). Run import_additions.py first. It prints the skins to put in MOB_VARIANTS and the overlays
to put in MOB_MARKINGS (src/mob-data.js).
"""
import json

from import_port import copy_texture, ia, im, port, put

# The pack's q.variant 0 to 6, as Bedrock numbers them.
VARIANTS = ["white", "creamy", "chestnut", "brown", "black", "gray", "dark_brown"]
# Its q.mark_variant 1 to 4 (0 is none).
MARKINGS = ["white", "white_field", "white_dots", "black_dots"]
# Its armor, by q.armor_texture_slot 1 to 6.
ARMOR = ["leather", "iron", "golden", "diamond", "copper", "netherite"]
LEATHER = "#a06540"

# It breathes, its body, head, legs and reins swaying a little, all the while (the pack's standing loop). The pack's other
# standing loop only moves it while the game has it rear up (v.stand_anim), so it's left out.
MOTIONS = [("idle", 1)]


# Standing still a while (the pack waits up to 6.4 seconds), it does one of the six idles the pack picks from, blending
# in over its idle controller's 0.2 seconds, over its breathing (keep).
def idles(*keys):
    return [{"every": [3, 7], "keep": True, "ease": 0.2, "parts": [(key, 0, None, [])]} for key in keys]


ACTS = idles("ciducd", "tculwn", "qofebb", "hyopyb", "lsswib", "vmmadd")
ARMOR_LAYER = "controller.render.oreville_ans.lnqoee"


def fix(d):
    """No armor layer: with none on it draws the horse's own model again, see-through; worn armor is MOB_ARMOR's."""
    d["render_controllers"] = [r for r in d["render_controllers"] if r != ARMOR_LAYER]


NAMED = ["snowy", "reindeer", "rudolph", "wendigo foal", "halloween"]


def markings_and_armor():
    """The markings' overlays (look's coat texture -> marking -> overlay) and MOB_ARMOR's entry, with what to copy."""
    ents, rcs, geos, mats, anims, _p, _a = im.read_pack()
    for g in geos.values():
        ia.rename_geo(g)
    d = ents["minecraft:horse"]
    textures, models, overlays = {}, {}, {}
    # Each look's coat texture by the key port() gives it (named for the first look it's on), and the markings the pack
    # lays over it there (the plain and snowy looks share theirs; the reindeer and Rudolph have none).
    coat_keys = {}
    for label, name in [("", ""), ("baby", "Baby"), *((n.replace(" ", "_"), n) for n in NAMED)]:
        layers, _, _ = im.look(d, rcs, mats, anims, name)
        coat = coat_keys.setdefault(layers[0][1][0], "_".join(filter(None, [f"{ia.PREFIX}horse", label])))
        for m, mark in enumerate(MARKINGS, 1):
            marked, _, _ = im.look(d, rcs, mats, anims, name, mood={"variant": 0.0, "mark_variant": float(m)})
            if marked[0][1][1] != layers[0][1][1]:
                key = textures.setdefault(marked[0][1][1], coat.replace(f"{ia.PREFIX}horse", f"{ia.PREFIX}horse_marks_{mark}", 1))
                overlays.setdefault(mark, {})[coat] = key
    kinds = {}
    for slot, kind in enumerate(ARMOR, 1):
        layers, _, _ = im.look(d, rcs, mats, anims, "", mood={"armor_texture_slot": lambda *a, s=slot: float(s)})
        geo, texs = next((g, t) for g, t, _, _ in layers if g != layers[0][0])
        key = f"{ia.PREFIX}horse_armor_{kind}"
        models[key], textures[texs[0]] = im.model(geos[geo]), key
        kinds[kind] = {"model": key, "plain": key}
    # Leather is dyed (the pack's material tints it with the armor's color), and undyed it's the game's leather brown.
    kinds["leather"].update(dyed=kinds["leather"]["plain"], undyed=LEATHER)
    return overlays, {"kinds": kinds}, textures, models


if __name__ == "__main__":
    port("horse", variants=VARIANTS, acts=ACTS, motions=MOTIONS, remodel=NAMED, nested_poses=True, fix=fix)
    overlays, armor, textures, models = markings_and_armor()
    print("markings:", json.dumps(overlays))
    print("armor:", json.dumps(armor))
    if ia.WRITE:
        for path, key in sorted(textures.items(), key=lambda kv: kv[1]):
            copy_texture(path, key)
        text = ia.MODELS_JS.read_text()
        for key, model in models.items():
            text = put(text, "MOB_MODELS", key, model)
        text = put(text, "MOB_ARMOR", "horse", armor)
        ia.MODELS_JS.write_text(text)
