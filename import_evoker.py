"""Give the evoker the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_evoker.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones; the baby and Dracula ones had
the new models but nothing moved them). The pack calls it evocation_illager (the game's own name for it) and the page
evoker: read_pack() gives the pack's entity the page's name. Its models and controllers are its own: its sway (zygxsz)
is the vindicator's, the same animation, but it has none of the vindicator's stance and its arms are folded, so it
shares nothing. It has no kinds. The game has no babies of it; the pack makes 1 in 200 evokers babies by itself. Its
scripts check the vindicator's baby names (Vindilet and Grumpy), not names of its own, and Dracula for its Halloween
look, whose red eyes glow (faint texels on an emissive material). Run import_additions.py first.
"""
from import_port import im, port

# It stands swaying a little, its head nodding and its arms folded in front of it (zygxsz; the pack shows its folded
# arms, 2jek, and hides its arms but while it casts). Left out: casting its spells (summoning vexes and fangs: its arms
# raised and waving, its body turning to its target), its brows lowered while it has a target or casts, its head
# following what it looks at (udurqi), its walk and run, turning steps, swim, jumps, falls and landing, riding a ravager
# and its deaths. Its animations list a celebrating one the pack doesn't have, and none of its controllers play it.
MOTIONS = [("zygxsz", 1)]

# It blinks: its lids (6q6da5k) stretch down over its eyes for a moment, over its swaying (keep), as the pillager's and
# the vindicator's (the pack doesn't blink it while it casts). The pack gives it no idles.
BLINK = {"every": [3, 7], "keep": True, "weight": 3, "parts": [("blinking.0", 0, None, [])]}
ACTS = [BLINK]

REMODEL = ["halloween"]

_read_pack = im.read_pack


def read_pack():
    """The pack's evocation_illager under the page's name for it, evoker."""
    ents, *rest = _read_pack()
    ents["minecraft:evoker"] = ents["minecraft:evocation_illager"]
    return (ents, *rest)


if __name__ == "__main__":
    im.read_pack = read_pack
    port("evoker", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL)
