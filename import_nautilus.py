"""Give the nautilus the updated Actions & Stuff pack's models, animations and armor (see import_port.py).

    python3 import_nautilus.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Halloween ones had
the new models but nothing moved them). It has no kinds. It can be saddled (MOB_SADDLES) and wear any of the five
nautilus armors, each a texture of its own on one armor model, on the nautilus's skeleton (MOB_ARMOR). Its Armourless
and Saddleless names only hide the armor or saddle (the stage does that for the name; Armourless keeps a look of its
own, the plain one, as the pack's armor layer once made it differ). The stage shows it in the ocean.
Run import_additions.py first.
"""
import json

from import_port import copy_texture, ia, im, port, put

# In the water it floats, rocking and bobbing, its tentacles waving (the pack's idle in the water), slowed to a beat
# about a second, and swims slowly in place, its shell pulsing (the pack's move, which plays as it moves: at the strength
# and speed the stage had it before). Its base pose only turns its head and body the way it swims and looks, which does
# nothing standing; its dash plays only as the game has it dash.
MOTIONS = [("idle", 1, 0.6), ("move", 0.45, 0.4)]

# Every 0.5 to 4.25 seconds it blinks (the pack's blink controller): for 0.12 seconds its head shows with its eyes shut
# (the blink bone, a box over the head's own) in place of its head and eyes, by the pack's part_visibility. A baby
# doesn't blink, and the Halloween looks have no shut eyes (the pack keeps their head as it is).
EYES_SHUT = [["blink", True], ["head", False], ["hmhadd", False], ["hmhadj", False]]
BLINK = {"every": [0.5, 4.25], "keep": True, "parts": [(None, 0, 0.12, EYES_SHUT)]}
ACTS = [BLINK]
STILL_EYED = {"motions": MOTIONS, "acts": []}
NAMED = ["sea monster nautiling", "halloween"]

# Its armor, by q.armor_texture_slot 1 to 5, as the game numbers the nautilus armors.
ARMOR = ["copper", "iron", "golden", "diamond", "netherite"]
ARMOR_LAYER = "controller.render.oreville_ans.ktneis"


def fix(d):
    """No armor layer: with none on it draws the nautilus's own texture on the armor model; worn armor is MOB_ARMOR's."""
    d["render_controllers"] = [r for r in d["render_controllers"] if r != ARMOR_LAYER and not (isinstance(r, dict) and ARMOR_LAYER in r)]


def armor(mob="nautilus"):
    """MOB_ARMOR's entry, its model and its textures to copy (pack path -> key). The pack leaves it off the baby and
    Halloween looks (and off one named Armourless, which the page's row says)."""
    ents, rcs, geos, mats, anims, _p, _a = im.read_pack()
    for g in geos.values():
        ia.rename_geo(g)
    d = ents[f"minecraft:{mob}"]
    textures, model, kinds = {}, None, {}
    for slot, kind in enumerate(ARMOR, 1):
        said = {"armor_texture_slot": lambda *a, s=slot: float(s), "equipped_item_any_tag": lambda *a: 1.0}
        layers, _, _ = im.look(d, rcs, mats, anims, "", mood=said)
        geo, texs = next((g, t) for g, t, _, _ in layers if g != layers[0][0])
        key = f"{ia.PREFIX}nautilus_armor_{kind}"
        model, textures[texs[0]] = im.model(geos[geo]), key
        kinds[kind] = {"model": f"{ia.PREFIX}nautilus_armor", "plain": key}
    return {"kinds": kinds, "bare": NAMED}, model, textures


if __name__ == "__main__":
    port("nautilus", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["armourless", *NAMED], nested_poses=True, fix=fix,
         sets={"still_eyed": STILL_EYED}, plays={"baby": "still_eyed", **{n: "still_eyed" for n in NAMED}})
    entry, model, textures = armor()
    print("armor:", json.dumps(entry))
    if ia.WRITE:
        for path, key in sorted(textures.items(), key=lambda kv: kv[1]):
            copy_texture(path, key)
        text = ia.MODELS_JS.read_text()
        text = put(text, "MOB_MODELS", f"{ia.PREFIX}nautilus_armor", model)
        ia.MODELS_JS.write_text(put(text, "MOB_ARMOR", "nautilus", entry))
