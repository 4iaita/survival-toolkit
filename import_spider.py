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

# Its eyes' glow is one panel in front of its face (geometry ebtfmr, 12 by 12), which the pack's scripts turn to face the
# camera and stretch as the spider faces you (animation wlqxdl: x by v.habcyx * 2.5, y by v.habcyx ^ 0.4, v.habcyx
# rising to 1 over its first 3 seconds alive and falling to 0 as it turns away). The stage already turns it and fades it
# that way, so the panel is given its full-strength size: 2.5 times as wide, a wide glow across the eyes.
GLOW_PANEL, GLOW_STRETCH = "geometry.oreville_ans.ebtfmr", 2.5


def widen_glow(geos):
    for bone in geos[GLOW_PANEL]["bones"]:
        for cube in bone.get("cubes", []):
            if cube.get("widened"):
                continue
            middle = cube["origin"][0] + cube["size"][0] / 2
            cube["size"][0] *= GLOW_STRETCH
            cube["origin"][0] = middle - cube["size"][0] / 2
            cube["widened"] = cube["eyes"] = True  # still eyes, gone from behind, however wide (see glow_panels)


NAMED = ["snowy", "cherry", "sulfur", "dappled", "pale", "halloween"]

if __name__ == "__main__":
    port("spider", variants=[""], acts=ACTS, motions=MOTIONS, remodel=NAMED, nested_poses=True, fix_geos=widen_glow)
