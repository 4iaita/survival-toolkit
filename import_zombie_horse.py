"""Give the zombie horse the updated Actions & Stuff pack's models, animations and armor (see import_port.py).

    python3 import_zombie_horse.py path/to/unpacked/pack path/to/textures [--write]

Its plain and baby looks get the pack's current models, the horse's, with skins of their own (they went by the old
pack's bones, and the zombie horse had no animations at all). It breathes as the horse does (see import_horse.py) and
picks from three of the horse's idles, as the skeleton horse does (import_skeleton_horse.py). Its saddle is part of the
model the pack shows while it's saddled (MOB_SADDLES, src/mob-data.js); the pack's render controller also shows chests
for q.is_chested, but the horse's model has no chest bones, so none show. Its armor is the horse's six kinds, the same
models and textures on the same skeleton (MOB_ARMOR). It has no kinds and no names but its baby's. Run
import_additions.py, import_horse.py and import_skeleton_horse.py first.
"""
import json

from import_horse import ARMOR, MOTIONS, fix
from import_port import ia, im, port, put
from import_skeleton_horse import ACTS


def armor():
    """MOB_ARMOR's entry: the horse's, once each kind's model and texture are checked to be the horse's."""
    ents, rcs, _g, mats, anims, _p, _a = im.read_pack()

    def worn(mob, slot):
        layers, _, _ = im.look(ents[f"minecraft:{mob}"], rcs, mats, anims, "", mood={"armor_texture_slot": lambda *a, s=slot: float(s)})
        return layers[1][:2]

    for slot, kind in enumerate(ARMOR, 1):
        if worn("zombie_horse", slot) != worn("horse", slot):
            raise SystemExit(f"the zombie horse's {kind} armor isn't the horse's")
    return ia.parse_section(ia.MODELS_JS.read_text(), "MOB_ARMOR")["horse"]


if __name__ == "__main__":
    port("zombie_horse", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, fix=fix, share=["horse"])
    kinds = armor()
    print("armor:", json.dumps(kinds))
    if ia.WRITE:
        ia.MODELS_JS.write_text(put(ia.MODELS_JS.read_text(), "MOB_ARMOR", "zombie_horse", kinds))
