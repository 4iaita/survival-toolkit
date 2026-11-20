"""Give the wither skeleton the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_wither_skeleton.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones, with glow panels on the
bogged's model and the allay's texture; the baby one had the new model but nothing moved it). Its baby's model is the
skeleton's baby's (the same geometry, on its own texture: share), but its plain model is its own, and so are most of
its animations: its sway, its stance and one of its two idles are its own, its other idle and the pose it eases into
are the skeleton's and the parched's (the same animation ids), and its controllers are its own (no bow, two idles, not
three). It has no kinds and no biome looks (its render controllers check no biome). The game has no babies of it; the
pack makes 1 in 200 wither skeletons babies by itself. Its eyes (on the pack's eye material, oreville_uhlnyb) glow,
and so do its two glow panels over them (8dgo1 and 8dgo2), which fade in over seconds (v.habcyx); babies have none. It
holds the stone sword the game gives every wither skeleton. Its entity is the only one for minecraft:wither_skeleton.
Run import_piglin.py first.
"""
import json

from import_piglin import SWORD_GRIP, add_weapon
from import_port import ia, im, port, put

im.GLOW_STRENGTH = "habcyx"

# It stands swaying, its head rocking and its weight shifting (the pack's idle, bhofhq: the skeleton's sway with its
# arms and legs held a little differently, 3.27 seconds round, as the old stage's), in the pose the pack eases into when
# it stands still with no target (bhjpsa, the skeleton's: its body turned a little, its sword arm drawn back and its
# legs apart; it also lowers the skeleton's brows, which its model hasn't got), and with its sword arm raised a little
# (rcnkkx, played with it: the pack also tips the sword's bone 30 degrees for its own placement of the sword, left out,
# as the zombified piglin's). Left out: its walk and run (by move speed), its head turning to look at its target, its
# swings, sitting while it rides, jumps, falls, landing and its deaths. Being on fire and shaking only change how it
# dies.
MOTIONS = [("idle", 1), ("bhjpsa", 1, "held"), ("arm_up", 1, "held")]

# Standing still for 0.3 seconds and then up to 6.33 more (the pack's idle controller), it does one of its two idles,
# blending in and out over the controller's 0.3 seconds, over its sway (keep): it tips its head right over to one side
# and back, its free arm swinging out, and shakes it; or it sways from side to side, kicking a leg out (the skeleton's
# tculwn). The pack gives it no blink.
IDLES = [{"every": [0.3, 6.63], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn")]
ACTS = IDLES

# Its stone sword: the game's sprite as cubes, held as the piglins' golden swords are (add_weapon), on every look: the
# game gives every wither skeleton one (its equipment table, in its components), and the pack's babies are wither
# skeletons drawn small (the game has none of its own), their item bone twice the size, as the skeleton's bow.
SWORD = "textures/items/stone_sword"
SWORD_LOOKS = {"": "default", "baby": "gbzvcu"}

_read_pack = im.read_pack


def read_pack():
    """Its sword arm raised (rcnkkx) without the pack's tip of the sword's bone (rightitem), as arm_up."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:wither_skeleton"]["animations"]
    arm = json.loads(json.dumps(anims[d["dqyakn"]]))
    arm["bones"].pop("rightitem")
    anims["animation.wither_skeleton_arm_up"] = arm
    d["arm_up"] = "animation.wither_skeleton_arm_up"
    return ents, rcs, geos, mats, anims, props, armors


def finish():
    """The body drawn once: the pack draws it a second time on the adult (pnlxok), the same model and texture, only to
    tint it when it's on fire or hurt."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["wither_skeleton"]
    for look in looks:
        out = []
        for layer in look["layers"]:
            if layer not in out:
                out.append(layer)
        look["layers"] = out
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "wither_skeleton", looks))


if __name__ == "__main__":
    im.read_pack = read_pack
    port("wither_skeleton", variants=[""], acts=ACTS, motions=MOTIONS, share=["skeleton"])
    if ia.WRITE:
        finish()
        add_weapon("wither_skeleton", "sword", SWORD, SWORD_GRIP, SWORD_LOOKS, tex_key=f"{ia.PREFIX}wither_skeleton_sword")
