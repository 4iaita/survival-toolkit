"""Give the drowned the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_drowned.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby and Snowy ones went by the old pack's bones; the Gillman
ones had the new models but nothing moved them). The pack has two drowned entities (entity/dss.json and entity/due.json),
as the game itself has an old one and a newer one: the game uses the one with the newest min_engine_version it can (due,
1.16.0; dss is 1.8.0, kept for worlds locked to older versions), and so does import_models.py's read_pack. They differ
only in a few keys' order, a spare geometry and texture key, and the newer one's baby head (the game's humanoid_big_head)
where the older one has a controller for its legs while it rides.

Its models are its own (the zombie's have no outer layer and their own legs), and so are its controllers: its stances
are the zombie's animations (the same animation ids under other keys), but it picks one of three (v.srbken, 0 to 2) where
the zombie picks one of eight, its arms only come up when it has a target (the zombie always holds them out in its even
stances), and it has no idles. It has no kinds. The game has babies of it, and the pack makes none by itself (v.tocraa
is 0). Run import_additions.py first.
"""
from import_port import port

# It sways on its feet, its head lolling and its arms hanging at its sides: the first of its three stances (njeoqx), which
# the stage shows. The second (vneqcu) and third (jwfarw, which one holding a trident always takes) sway another way. Its
# arms come up when it has a target and go down again after (has_target, ykvdbt), its walk is weighted by how fast it
# moves, and it swims when it's off the ground in water: all left out. The pack gives it no idles, so it has no acts.
MOTIONS = [("njeoqx", 1)]
ACTS = []

# A baby sways another way (xzyuea), its arms held out (has_target, held: the pack plays it on a baby all the while unless
# it holds a trident), with its big head and short legs (the pack's baby pose, utryba). It has no idles either.
BABY = {"motions": [("xzyuea", 1), ("has_target", 1, "held")], "acts": []}
SETS = {"baby": BABY}
PLAYS = {"baby": "baby", "baby gillman": "baby"}
# Its glowing teal patches are faint texels on the game's own drowned material (GAME_EMISSIVE in import_models.py); the
# Gillman's eyes are faint texels on an emissive head (the pack's Material.qaiblk).
REMODEL = ["snowy", "baby gillman", "halloween"]

if __name__ == "__main__":
    port("drowned", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL, sets=SETS, plays=PLAYS)
