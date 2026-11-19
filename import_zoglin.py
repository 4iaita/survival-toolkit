"""Give the zoglin the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_zoglin.py path/to/unpacked/pack path/to/textures [--write]

Its plain and baby looks get the pack's current models (they went by the old pack's bones). Its plain model is the
hoglin's, the same geometry (netdta) on its own texture (share); its baby's is its own (the hoglin baby's but for a
single eye). It has no kinds and no names but its baby's (Baby, Zoglet, Zoggin). The game has babies of it; the pack
makes none by itself (v.tocraa=0). Its head and eye are on an emissive material: their faint texels (a spot on its
head and its eye) are lit, by day too. Its entity is the only one for minecraft:zoglin. Run import_additions.py and
import_hoglin.py first.

Its animations map is much shorter than the hoglin's and its controllers are its own: they share only the jump, fall,
landing, turning step, attack, head-follow (xhvvxo) and death controllers and animations, and its baby's head (udpcrk,
mbghtd). It has no blink, no idles (the pack gives it none), no walk of its own (its run, jlokgl, and the baby's,
ncvlio, which is the hoglin baby's) and no sitting.
"""
import json

from import_port import im, port

# It stands breathing, its body swaying and its ears flicking (the pack's idle, 1.2 seconds round, as the old stage's).
# The pack times it by q.life_time, which the importer holds still: it's baked by its own time instead. The pack gives
# it one of three head tilts at random when it spawns (v.ddugne: 7.5 degrees left, none or right): the stage shows none.
# Its baby plays the same. Left out: its head following its target, its run, its turning steps, its jumps, falls and
# landing, its attack and its deaths.
MOTIONS = [("idle_timed", 1)]

_read_pack = im.read_pack


def read_pack():
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:zoglin"]["animations"]
    idle = json.loads(json.dumps(anims[d["idle"]]).replace("q.life_time", "q.anim_time"))
    anims["animation.zoglin_idle_timed"] = idle
    d["idle_timed"] = "animation.zoglin_idle_timed"
    return ents, rcs, geos, mats, anims, props, armors


if __name__ == "__main__":
    im.read_pack = read_pack
    port("zoglin", variants=[""], acts=[], motions=MOTIONS, share=["hoglin"])
