"""Give the zombie nautilus the updated Actions & Stuff pack's models, animations, kinds and armor (see import_port.py).

    python3 import_zombie_nautilus.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models, models of its own (the plain and baby ones went by the old pack's bones;
the Halloween ones had the new models but nothing moved them). Its animations map lists the nautilus's, and the same
controllers play them, so it floats, swims in place and blinks as the nautilus does (see import_nautilus.py). It comes in
two kinds the game sets (q.property('minecraft:variant')): the plain one and coral, a skin of its own on the same model
(not on the Halloween looks). It can be saddled, and its armor is the nautilus's five kinds, the same model and textures
on the same skeleton (MOB_ARMOR). Run import_additions.py and import_nautilus.py first.
"""
import json

from import_nautilus import ACTS, ARMOR, MOTIONS, NAMED, STILL_EYED, fix
from import_port import ia, im, port, put

VARIANTS = ["", "coral"]


def answers(v):
    """What the game says for kind v: its variant property (the pack checks it for 'coral')."""
    said = {"minecraft:variant": VARIANTS[v] or "normal", "minecraft:climate_variant": "temperate"}
    return {"property": lambda p: said.get(p, 0.0)}


def armor():
    """MOB_ARMOR's entry: the nautilus's, once each kind's model and texture are checked to be the nautilus's."""
    ents, rcs, _g, mats, anims, _p, _a = im.read_pack()

    def worn(mob, slot):
        said = {"armor_texture_slot": lambda *a, s=slot: float(s), "equipped_item_any_tag": lambda *a: 1.0}
        layers, _, _ = im.look(ents[f"minecraft:{mob}"], rcs, mats, anims, "", mood=said)
        return layers[1][:2]

    for slot, kind in enumerate(ARMOR, 1):
        if worn("zombie_nautilus", slot) != worn("nautilus", slot):
            raise SystemExit(f"the zombie nautilus's {kind} armor isn't the nautilus's")
    return ia.parse_section(ia.MODELS_JS.read_text(), "MOB_ARMOR")["nautilus"]


if __name__ == "__main__":
    port("zombie_nautilus", variants=VARIANTS, answers=answers, acts=ACTS, motions=MOTIONS, remodel=["armourless", *NAMED],
         nested_poses=True, fix=fix, share=["nautilus"], sets={"still_eyed": STILL_EYED},
         plays={"baby": "still_eyed", **{n: "still_eyed" for n in NAMED}})
    entry = armor()
    print("armor:", json.dumps(entry))
    if ia.WRITE:
        ia.MODELS_JS.write_text(put(ia.MODELS_JS.read_text(), "MOB_ARMOR", "zombie_nautilus", entry))
