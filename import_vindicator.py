"""Give the vindicator the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_vindicator.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and Clown ones went by the old pack's bones; the baby had the new
model but nothing moved it). Its models and controllers are its own, not the pillager's: its sway (zygxsz) is the
evoker's, the same animation, but its stance, its axe and its controllers aren't, so it shares nothing. It has no kinds.
The game has no babies of it; the pack makes 1 in 200 vindicators babies by itself (a big-headed model drawn at half
size). Named Clown (or with the pack's seasonal setting on), it's drawn as the clown instead, never as a baby. Run
import_additions.py first.
"""
import json

from import_parched import BOW_HAND, bow_model
from import_port import copy_texture, ia, im, port, put

# It stands swaying a little, its head nodding and its arms at its sides (zygxsz: the pack's model has no crossed arms,
# as the game's has), in the pose the pack eases into when it stands still with no target (qmodun, held: leaning a
# little forward, its body turned, its arms shifting and its brows tilted). The game's vindicators carry an iron axe,
# which the pack hides (its rightitem scaled to nothing, edbqtm) until it has a target: the stage shows it all the
# while, in its lowered hand (HANG_TURN, below).
# Left out: raising its axe at a target and lowering it after (has_target, then calm), its chop (an attack), its brows
# lowered while it has a target, its head following what it looks at (udurqi), its walk and run, turning steps, swim,
# jumps, falls and landing, riding a ravager and its deaths. Its animations list a dance (dance) that none of its
# controllers play, so it's left out too; the pack has no celebrating animation for it.
MOTIONS = [("zygxsz", 1), ("qmodun", 1, "held")]

# It blinks: its lids (6q6da5k) stretch down over its eyes for a moment, over its swaying (keep). The pack blinks it every
# 0.5 to 2.5 seconds; the stage every 3 to 7, as the pillager's. The pack gives it no idles.
BLINK = {"every": [3, 7], "keep": True, "weight": 3, "parts": [("blinking.0", 0, None, [])]}
ACTS = [BLINK]

REMODEL = ["clown"]

# Named Johnny, the game's vindicator attacks almost every mob, so it always has a target. The pack doesn't check the
# name, but draws a vindicator with a target as the stage shows Johnny (JOHNNY, a look of its own with a set of its own):
# its axe drawn and raised (has_target, held at its last frame: its right arm up with the axe, its body turned and its
# left arm out), its brows lowered (ovmxnb), swaying as it does, blinking, and now and then chopping (attack: the pack's
# swing of the axe, which the game plays as it hits).
CHOP = {"every": [3, 7], "keep": True, "parts": [("attack", 0, None, [])]}
# The pack's raise also turns its waist 18 degrees: left out (czfrre_facing), and Johnny stands in the still pose its
# other looks do (qmodun, held), so it faces the way they do.
JOHNNY = {"motions": [("zygxsz", 1), ("qmodun", 1, "held"), ("czfrre_facing", 1, "held"), ("ovmxnb", 1)], "acts": [BLINK, CHOP]}

# The game's vindicators carry an iron axe. The pack's (its attachable, minecraft:iron_axe) is, with its 3D items
# setting off as it starts, the game's iron axe sprite drawn as a texture mesh: here it's a cube for each pixel, as the
# parched's bow (bow_model), in its right hand. On Johnny's look:
# It's held as the game draws a vindicator's raised axe (the wiki's renders): gripped near the foot of its handle
# (AXE_GRIP), standing straight up from the fist, its blade forward. The game holds an item at right angles to the
# forearm and raises the arm straight out; the pack's raise lifts it 25 degrees higher, so the axe is turned that much
# further forward (AXE_TURN) to stand upright in it.
AXE = "textures/items/iron_axe"
AXE_KEY = f"{ia.PREFIX}vindicator_axe"
AXE_GRIP = (4, 12)
AXE_TURN = -20
# On its other looks (plain, Clown, baby), the axe hangs in its lowered right hand as the game draws a tool in a hanging
# hand (the wiki's renders of the piglin brute, which always carries a golden axe): at right angles to the forearm, its
# head out in front of the fist (HANG_TURN), each on a copy of that look's skeleton (SKELETONS: the entity's geometry
# key for each). The baby's model is drawn at half size, its axe with it.
HANG_TURN = -45
SKELETONS = {"": "default", "clown": "ljymoe", "baby": "tdrznc"}
# The grip, from the look's rightitem bone (as bow_model's hand_at): the bottom of the fist on the plain and Clown arms,
# where the pack puts the bone. On the baby's thick arm the pack puts it at the arm's outer back edge, so the axe hung
# beside the fist: its grip is moved to the middle of the fist.
HANDS = {"baby": (3, -2.5, -2)}


def add_axe():
    """The axe: a layer of its own, last, on a copy of each look's skeleton: raised on Johnny's, lowered on the others'."""
    ents, _rcs, geos, *_ = im.read_pack()
    d = ents["minecraft:vindicator"]
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["vindicator"]
    for look in looks:
        name = (look["names"] or [""])[0]
        if name == "Johnny":
            key, model = AXE_KEY, bow_model(geos[d["geometry"]["default"]], AXE, AXE_GRIP, AXE_TURN, "axe")
        else:
            key = "_".join(filter(None, [AXE_KEY, "hanging", name]))
            model = bow_model(geos[d["geometry"][SKELETONS[name]]], AXE, AXE_GRIP, HANG_TURN, "axe", HANDS.get(name, BOW_HAND))
        text = put(text, "MOB_MODELS", key, im.model(model))
        # held: the stage frames the vindicator on its body, not its axe (src/mobs.js), so every look stands in the same place.
        look["layers"] = [layer for layer in look["layers"] if not layer[0].startswith(AXE_KEY)] + [[key, [AXE_KEY], [], {"held": 1}]]
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "vindicator", looks))
    copy_texture(AXE, AXE_KEY)

_read_pack = im.read_pack


def read_pack():
    """czfrre_facing: the pack's raise (czfrre) without its waist's turn."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    keys = ents["minecraft:vindicator"]["animations"]
    raise_ = json.loads(json.dumps(anims[keys["czfrre"]]))
    for frame in raise_["bones"]["waist"]["rotation"].values():
        for v in [frame] if isinstance(frame, list) else [frame.get("pre"), frame.get("post")]:
            if v:
                v[1] = 0
    anims["animation.vindicator_czfrre_facing"] = raise_
    keys["czfrre_facing"] = "animation.vindicator_czfrre_facing"
    return ents, rcs, geos, mats, anims, props, armors


if __name__ == "__main__":
    im.read_pack = read_pack
    port("vindicator", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL, new_looks=[["Johnny"]],
         sets={"johnny": JOHNNY}, plays={"Johnny": "johnny"})
    if ia.WRITE:
        add_axe()
