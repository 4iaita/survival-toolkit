"""Give the spider the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_spider.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and snowy ones went by the old pack's bones; the baby and the
biome and costume ones had the new models but nothing moved them). The pack gives a spider its Snowy, Cherry, Sulfur,
Dappled or Pale look by itself in snowy biomes, cherry groves, sulfur caves, dappled forests and pale gardens, but the
names work anywhere, so it has no climates or kinds. Run import_additions.py first.
"""
from import_port import port

# Standing, it breathes (its body bobbing, head and abdomen rocking: the pack's default leg pose), its legs in the pose
# its walk starts from (the pack moves the walk by how far it has gone, so a spider standing still holds it there).
MOTIONS = [("default_leg_pose", 1), ("walk", 1, "held")]

# Standing still a while, it settles down (the pack's settle, at its 0.7 blend weight, held), rests, and gets up again
# (the pack's stand), over its breathing and legs (keep). In the game it rests until it moves.
REST = 5
SETTLE = {"every": [4, 8], "keep": True, "parts": [("rilzjy", 0, 1.2 + REST, [], 1, 0.7), ("stand", 1.2 + REST, None, [], 1, 0.7)]}
ACTS = [SETTLE]

NAMED = ["snowy", "cherry", "sulfur", "dappled", "pale", "halloween"]

if __name__ == "__main__":
    port("spider", variants=[""], acts=ACTS, motions=MOTIONS, remodel=NAMED, nested_poses=True)
