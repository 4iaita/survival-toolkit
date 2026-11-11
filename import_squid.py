"""Give the squid the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_squid.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain and baby ones went by the old pack's bones). It has no kinds and no
names but its baby's. The stage shows it in the ocean. Run import_additions.py first.
"""
import math

from import_port import port

# Its eight tentacles, which hang from a ring under its body.
TENTACLES = tuple(f"l6fl24d6{i}" for i in range(1, 9))

# In the water it pulses, its body squeezing and bobbing and its tentacles sweeping out and back (the pack's move, at the
# strength and speed it has at a standstill: v.obhshf and v.rsvfdv, 0.7 and 2). The pack also slides each tentacle up
# and out as it sweeps, which pushes its top out through the body's walls, so the stage leaves that slide out, as it did
# with the old pack. Out of the water it flops, which the stage doesn't show; its turn (driven by the way it swims)
# does nothing standing.
MOTIONS = [("move", 0.7, 2, TENTACLES)]
# How far the tentacles sweep out from hanging straight, at that strength: 30 degrees and 45 either side of it.
SWING = math.radians(0.7 * 75)

# Every 0 to 3 seconds it does one of its three idles, which only move its eyes (the pack's: it glances down, or down
# and to one side, for a second or so), over its pulsing (keep).
GLANCES = [{"every": [0.5, 3], "keep": True, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
ACTS = GLANCES


def seat_tentacles(geos):
    """Keep the tentacles inside the body as they sweep (import_models.py's seat_tentacles, for the new pack's bones).
    The model hangs each from a pivot just above the body's bottom and against its wall, so sweeping out pushes the
    tentacle through the wall. This pivots each at the bottom instead, moved in just far enough that at its widest sweep
    its outer edge leaves the bottom face inside the wall. What's above the pivot then swings inward, out of sight."""
    for g in geos.values():
        bones = {b["name"]: b for b in g.get("bones", [])}
        if not all(t in bones for t in TENTACLES) or not bones.get("bodyegn6", {}).get("cubes"):
            continue
        body = bones["bodyegn6"]["cubes"][0]
        bottom, wall = body["origin"][1], body["origin"][0] + body["size"][0]
        for name in TENTACLES:
            b = bones[name]
            x, y, z = b["pivot"]
            reach = math.hypot(x, z)
            half = b["cubes"][0]["size"][0] / 2
            # How far along the ring's direction the wall is, and how much of the tentacle's width sticks out sideways.
            along = max(abs(x), abs(z)) / reach
            across = math.sqrt(1 - along * along)
            ring = min(reach, (wall - half * across) / along - half / math.cos(SWING))
            dx, dz = x / reach * ring - x, z / reach * ring - z
            b["pivot"] = [x + dx, min(y, bottom), z + dz]
            for c in b["cubes"]:
                c["origin"] = [c["origin"][0] + dx, c["origin"][1], c["origin"][2] + dz]


if __name__ == "__main__":
    port("squid", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, fix_geos=seat_tentacles)
