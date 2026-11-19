"""Give the blaze the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_blaze.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones; the baby had the new model but nothing
moved it): a head over three rings of four rods, drawn unlit (the pack's render controller ignores lighting), with a soft
halo behind it (a glow panel on a model of its own, 5 pixels behind the head's pivot, turned to face the camera, so in
the game it's always behind the blaze, as the allay's and the vex's: flagged behind). Its baby (Baby, Spark, Sizzle; and
1 in 200 blazes by itself, v.tocraa 0.005, with the pack's Seasonal Mob Variants setting at its default, disabled; the
game has none) is a model of its own with a bigger head and only two rings of rods, at the same scale. It has no kinds.
Its scripts set biome variables (snowy, cherry, sulfur, dappled, pale) that nothing it draws reads. Its entity
(entity/dvg.json) is the only one for minecraft:blaze. Run import_additions.py first.
"""
import json

import import_additions as ia
from import_port import im, port, put

_read_pack = im.read_pack


def read_pack():
    """The spin as a loop the importer can bake: the pack turns its rings of rods by a variable it adds 180 degrees a
    second to (v.pgcoey, 1.8 times that while it's charged), which baked_loop can't follow. Here it turns them by
    q.anim_time, a full turn in 2 seconds (the top and bottom rings one way, the middle one the other)."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:blaze"]["animations"]
    spin = json.loads(json.dumps(anims[d["spin"]]))
    spin.pop("anim_time_update", None)
    spin["animation_length"] = 2
    for bone, rot in spin["bones"].items():
        rot["rotation"] = [0, rot["rotation"][1].replace("v.pgcoey", "q.anim_time*180"), 0]
    anims["animation.blaze_spin"] = spin
    d["spin_baked"] = "animation.blaze_spin"
    return ents, rcs, geos, mats, anims, props, armors


# It hovers, its rings of rods bobbing and rocking out of step and its head bobbing and tilting (the pack's move, which
# it plays all the while: 1.5 times its 3 seconds, as its anim_time_update has it, 1.8 times faster again while it's
# charged), its rings spinning round it (the pack's spin, rewritten above). Left out: its head turning to its target
# (biowgi), its volley of fireballs (tyooml: it rocks back with each shot, an attack), being charged (flame particles
# round it, and its move and spin 1.8 times as fast: the stage draws no particles), its deaths and the smoke and sounds
# that go with them.
MOTIONS = [("move", 1, 1.5), ("spin_baked", 1)]

# Every 1.25 to 3.75 seconds it blinks: its lids (the blink bone, inside its head) slide forward over its eyes for 0.15
# seconds (the pack's blink), at half speed so it's seen, over its hovering (keep). The pack gives it no idles.
BLINK = {"every": [1.25, 3.75], "keep": True, "parts": [("blinking.1", 0, None, [["blink", True]], 0.5)]}
ACTS = [BLINK]


def finish():
    """The halo drawn behind the blaze (behind)."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["blaze"]
    for look in looks:
        for layer in look["layers"]:
            if len(layer) > 3 and layer[3].get("halo"):
                layer[3]["behind"] = 1
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "blaze", looks))


if __name__ == "__main__":
    im.read_pack = read_pack
    port("blaze", variants=[""], acts=ACTS, motions=MOTIONS)
    if ia.WRITE:
        finish()
