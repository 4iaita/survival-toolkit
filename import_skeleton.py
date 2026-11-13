"""Give the skeleton the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_skeleton.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and Snowy ones went by the old pack's bones; the baby, Halloween
and biome ones had the new models but nothing moved them). Its models are its own (the stray's plain one is the same as
its own, but not the parched's), and its standing animations and their controllers are the parched's, the same
animations: so it imports the parched's (MOTIONS, ACTS) and holds the parched's bow (add_bow). It has no kinds. The game
has no babies of it; the pack makes 1 in 200 skeletons babies by itself. Run import_additions.py first.
"""
from import_parched import ACTS, MOTIONS, add_bow
from import_port import ia, port

# It stands swaying, its head rocking, in the pose the pack eases into when it stands still with no target, and now and
# then does one of three idles (spinning its head round, swaying from side to side, leaning forward and back), as the
# parched does: its idle controller is the parched's. The pack's flinch when it's hurt (one of three), its walk and run,
# its bow drawn at a target, its spider and skeleton horse jockeys and its shaking as it freezes into a stray in powder
# snow (the game's, which the pack has no animation of) are left out.

# Its Pale look's eyes glow at night (v.shawci, by q.time_of_day: the pack shows its glowing eyes, 6q63dgkkge3dggeaf8,
# in place of its plain ones): the stage shows them lit all the while, as at night, with the backdrop by day.


def fix(d):
    """The Pale look's night eyes (v.shawci set)."""
    pre = d["scripts"]["pre_animation"]
    i = next(i for i, s in enumerate(pre) if s.startswith("v.kcrehx?{t.zyh=q.time_of_day;"))
    pre[i] = "v.kcrehx?{v.shawci=1;};"


# Each look's skeleton (the entity's geometry key), for the bow.
SKELETONS = {"": "default", "snowy": "zqykjy", "baby": "oltrej", "halloween": "icajuu", "cherry": "default",
             "sulfur": "qjrtub", "dappled": "default", "pale": "zwckdi"}
REMODEL = ["snowy", "halloween", "cherry", "sulfur", "dappled", "pale"]

if __name__ == "__main__":
    port("skeleton", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL, fix=fix)
    if ia.WRITE:
        add_bow("skeleton", SKELETONS)
