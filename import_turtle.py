"""Give the turtle the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_turtle.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Halloween one had
the new model but nothing moved it). The stage shows it on a beach, as the pack's on-land state has it. It has no kinds
and no names but its baby's and its Halloween one's. Run import_additions.py first.
"""
from import_port import ia, im, port, put

# On land it stands with its legs in the pose its walk starts from (the pack moves the walk by how far it has gone, so a
# turtle standing still holds its first frame), bobs a little, its head and shell swaying (the pack's bob), and blinks
# (the pack plays its blink as a loop of its own: its eyes, the blink bone, shut for the last sixth of a second of every
# 1.83). The pack's head-look loop only turns its head towards what it looks at, which the stage has none of, so it's
# left out. In the water it would float and swim instead.
WALK = "qgafwd"
MOTIONS = [(WALK, 1, "held"), ("bob", 1), ("blinking.step", 1)]
# A baby bobs twice as fast and twice as far (the pack's bob for v.cdrzno).
HATCHLING = {"motions": [(WALK, 1, "held"), ("bob", 2, 2), ("blinking.step", 1)], "acts": []}
# The pack has no idles for it, so it does nothing now and then.
ACTS = []

# Its eyelids (the blink bone) are part of every look, shut over its eyes (hmhadk) only while the blink loop shows them:
# the stage hides a blink bone unless a look shows it, so every look shows it and the loop's scale does the rest.
LIDS = ["blink", True]


def lids_shown(looks):
    for look in looks:
        for layer in look["layers"]:
            if LIDS not in layer[2]:
                layer[2].append(LIDS)
    return looks


# The walk is all formulas with no length of its own (its time is how far the turtle has walked): held at its first
# frame, it's given a length of 0.
_read_pack = im.read_pack


def read_pack():
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    walk = anims[ents["minecraft:turtle"]["animations"][WALK]]
    walk.setdefault("animation_length", 0)
    return ents, rcs, geos, mats, anims, props, armors


if __name__ == "__main__":
    im.read_pack = read_pack
    port("turtle", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["halloween"], nested_poses=True,
         sets={"hatchling": HATCHLING}, plays={"baby": "hatchling"})
    if ia.WRITE:
        text = ia.MODELS_JS.read_text()
        ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "turtle", lids_shown(ia.parse_section(text, "MOB_LOOKS")["turtle"])))
