"""Give the vex the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_vex.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain one went by the old pack's bones; the baby had the new model but
nothing moved it). It has no kinds and no names but its baby's (the pack makes 1 in 200 vexes babies by itself; the game
has none). The pack draws it unlit, with glowing outlines round its body and wings (kept as rims), and a soft halo
behind it, which the baby has none of. Run import_additions.py first.
"""
import json

import import_additions as ia
from import_port import copy_texture, im, keep_rims, port, put

_read_pack = im.read_pack


def read_pack():
    """The sword pose with a length of 0 (it has none): held from its start."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    anims[ents["minecraft:vex"]["animations"]["eypfmy"]].setdefault("animation_length", 0)
    return ents, rcs, geos, mats, anims, props, armors


# It hovers, its body and head swaying and its tail curling from side to side (the pack's idle), its wings beating (the
# pack's flap, at half its speed so they can be seen), leaning forward with both hands together low in front of it,
# gripping its sword (the pack's pose while it holds one, held: the game's vexes always hold an iron sword). Its
# move (weighted by how fast it flies), its head turning to look at its target, and its charge (an attack, and its red
# charging skin) are left out.
WINGS = ("uauoua", 1, 0.5)
MOTIONS = [("idle", 1), WINGS, ("eypfmy", 1, "held")]

# Every 0.1 to 3 seconds it blinks: its lids (the blink bone) shut over its eyes for 0.15 seconds, at half the pack's
# speed so it's seen, over its hovering (keep). The pack's idle holds the lids shrunk to nothing all the while; the stage
# hides them by itself (and the idle's shrink is taken off: it can't be undone) and shows them while it blinks.
BLINK = {"every": [1, 3], "keep": True, "weight": 3, "parts": [("blinking.step_head", 0, None, [["blink", True]], 0.5)]}
ACTS = [BLINK]
# Left out: the pack's spawn animation (it drops in, squashes and stretches as it appears, with a white flash), which
# it plays once, as an evoker summons it.


# Its sword: the pack's iron sword (its attachable, minecraft:iron_sword: a model of its own, its sword bone bound to the
# hand, the rightitem bone), on a copy of each look's skeleton so it moves with the hand, held as the pack holds it in
# the third person (SWORD_HOLD: its sword bone turned and moved, as the look's pose). The model is sized for a player's
# hand, so on the vex it would stand twice as tall as the vex: it's scaled to the vex's size beside a player (SWORD_SIZE,
# not the pack's), as the game's own vex holds an ordinary sword shrunk with it.
SWORD = "geometry.oreville_ans.jpcapk"
SWORD_TEXTURE = "textures/oreville/ans/dim"
SWORD_KEY = f"{ia.PREFIX}vex_sword"
SWORD_SIZE = 0.4
SWORD_HOLD = {"r": [90, 0, -90], "p": [0, -2, 4], "s": [SWORD_SIZE] * 3}
SKELETONS = {"": "default", "baby": "udcwre"}


def sword_model(skeleton, sword):
    """skeleton (the look's pack geometry) with no cubes of its own, and the sword bound to its right hand."""
    bones = {b["name"]: b for b in skeleton["bones"]}
    chain, name = [], "rightitem"
    while name:
        chain.insert(0, {k: v for k, v in bones[name].items() if k != "cubes"})
        name = bones[name].get("parent")
    hand = bones["rightitem"]["pivot"]
    moved = lambda xyz: [a + b for a, b in zip(xyz, hand)]
    cubes = []
    for bone in sword["bones"]:
        for c in bone.get("cubes", []):
            c = json.loads(json.dumps(c))
            c["origin"] = moved(c["origin"])
            if "pivot" in c:
                c["pivot"] = moved(c["pivot"])
            cubes.append(c)
    blade = {"name": "sword", "parent": "rightitem", "pivot": hand, "cubes": cubes}
    return {"description": sword["description"], "bones": [*chain, blade]}


def finish():
    """The halo drawn behind the vex (behind): the pack holds its glow panel 4 pixels behind its pivot and turns it to
    face the camera, as the allay's; the idle's shrink of the lids off its loop; and its sword in its hand, last."""
    ents, _rcs, geos, *_ = im.read_pack()
    d = ents["minecraft:vex"]
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["vex"]
    for look in looks:
        for layer in look["layers"]:
            if len(layer) > 3 and layer[3].get("halo"):
                layer[3]["behind"] = 1
        name = (look["names"] or [""])[0]
        key = "_".join(filter(None, [SWORD_KEY, name]))
        text = put(text, "MOB_MODELS", key, im.model(sword_model(geos[d["geometry"][SKELETONS[name]]], geos[SWORD])))
        look["layers"] = [layer for layer in look["layers"] if not layer[0].startswith(SWORD_KEY)] + [[key, [SWORD_KEY], []]]
        look["pose"] = {**look.get("pose", {}), "sword": SWORD_HOLD}
    copy_texture(SWORD_TEXTURE, SWORD_KEY)
    motions = ia.parse_section(text, "MOB_MOTIONS")["vex"]
    for loop in motions:
        loop["bones"].pop("blink", None)
    ia.MODELS_JS.write_text(put(put(text, "MOB_LOOKS", "vex", looks), "MOB_MOTIONS", "vex", motions))


if __name__ == "__main__":
    im.read_pack = read_pack
    keep_rims()
    port("vex", variants=[""], acts=ACTS, motions=MOTIONS)
    if ia.WRITE:
        finish()
