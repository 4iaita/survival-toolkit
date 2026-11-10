"""Give the polar bear the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_polar_bear.py path/to/unpacked/pack path/to/textures [--write]

Its plain and baby looks get the pack's current models (they went by the old pack's bones, and the polar bear only
breathed and blinked by the old pack's keys). It has no kinds and no names but its cub's. Run import_additions.py first.
"""
from import_port import im, port

# It breathes, its body, head and front legs swaying a little, all the while (the pack's standing loop). The pack's
# head-look loop only turns its head towards what it looks at, which the stage has none of, so it's left out; so is
# its walk, weighted by how fast it moves.
MOTIONS = [("idle", 1)]

# Every 1 to 3.75 seconds it blinks (the pack's blink: its eyes, the blink bone, shrink to nothing for 0.15 seconds), at
# half the pack's speed so it's seen, over its breathing (keep).
BLINK = {"every": [1, 4], "keep": True, "weight": 3, "parts": [("blinking.step_eye", 0, None, [], 0.5)]}
# Now and then it rears up on its hind legs (the pack's stand, held, which the game plays while it's angry) and drops
# back down (its own animation for that), still breathing (keep). Its swipe is an attack, so it's left out.
UP_FOR = 3
STAND = {"every": [4, 8], "keep": True, "parts": [("stand", 0, UP_FOR, []), ("itmnzk", UP_FOR, None, [])]}
ACTS = [BLINK, STAND]

# A cub breathes faster (its own standing loop) and only blinks: the game doesn't make a cub angry, so it never rears up.
CUB = {"motions": [("lwvcsi", 1)], "acts": [BLINK]}

# The pack plays the game's own cub pose for a cub (animation.polarbear.baby_transform), which isn't in the pack: as the
# game has it, its head 1 pixel lower and 3 further back, and a quarter bigger. It's added here, played for a cub only (the
# pack's controller leaves that state at once for a grown bear).
BABY_TRANSFORM = {"loop": True, "bones": {"head": {"position": [0, -1, 3], "scale": 1.25}}}
CUB_CONTROLLER = "kmzsdl"
_read_pack = im.read_pack


def read_pack():
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    anims.setdefault("animation.polarbear.baby_transform", BABY_TRANSFORM)
    return ents, rcs, geos, mats, anims, props, armors


def fix(d):
    d["scripts"]["animate"] = [{"baby_transform": "v.cdrzno"} if a == CUB_CONTROLLER else a for a in d["scripts"]["animate"]]


if __name__ == "__main__":
    im.read_pack = read_pack
    port("polar_bear", variants=[""], acts=ACTS, motions=MOTIONS, sets={"cub": CUB}, plays={"baby": "cub"}, nested_poses=True, fix=fix)
