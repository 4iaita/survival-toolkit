"""Give the zombie the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_zombie.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, Brian, Snowman, Zanta and Snowy ones went by the old pack's
bones; the Baby Frankenstein, Halloween and biome ones had the new models but nothing moved them). Its models are its
own, not the husk's (the husk's have a second, glowing-eyed head and legs hung from bones of other names), but its
stances, idles and their controllers are the husk's, the same animations: so it imports the husk's (MOTIONS, IDLES). It
has none of the husk's day and night eyes: only Brian's eyes glow (and 1 in 200 zombies have them). It has no kinds; the
game has babies of it, and the pack makes none by itself. Run import_additions.py first.
"""
from import_husk import IDLES, MOTIONS
from import_port import ia, im, port

# Brian's glow panels fade in over 3 seconds (v.habcyx), as the husk's.
im.GLOW_STRENGTH = "habcyx"

# Each zombie takes one of eight stances at random when it spawns (v.srbken, 0 to 7), as the husk does: the stage shows
# the first (0), swaying with its arms held out (MOTIONS, the husk's). The even stances hold the arms out, and some looks
# (the Snowman's, Snowy, Dappled and the Cherry blossoms) have sleeves of their own for them (v.qjaocr): those show.
# Now and then it does one of the husk's two idles, leaning forward or back (IDLES). A zombie holding an iron sword or
# shovel stands as the second sway, arms down, and now and then raises it (the stage shows nothing in its hands, so that
# stance is left out), and its walk, weighted by how fast it moves, is left out.
ACTS = IDLES


def fix(d):
    """Its arms held out, as stance 0 holds them (v.qjaocr: q.any isn't answered)."""
    init = d["scripts"]["initialize"]
    init[init.index("v.qjaocr=q.any(v.srbken,0,2,4,6)||v.cdrzno;")] = "v.qjaocr=1;"


# A baby always sways the fourth way (idqskp), its arms held out, as the husk's baby does, and does the same idles.
BABY = {"motions": [("idqskp", 1), ("has_target", 1, "held")], "acts": ACTS}
SETS = {"baby": BABY}
PLAYS = {"baby": "baby", "baby frankenstein": "baby"}
REMODEL = ["brian", "snowman", "zanta", "snowy", "baby frankenstein", "halloween", "cherry", "sulfur", "dappled", "pale"]

if __name__ == "__main__":
    port("zombie", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL, sets=SETS, plays=PLAYS, fix=fix)
