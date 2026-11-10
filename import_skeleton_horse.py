"""Give the skeleton horse the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_skeleton_horse.py path/to/unpacked/pack path/to/textures [--write]

Its plain and baby looks get the pack's current models, the horse's, with skins of their own (they went by the old
pack's bones, and the skeleton horse had no animations at all). It breathes as the horse does (see import_horse.py),
but the pack gives it only three idles of its own to pick from (SKELETON_ACTS). Its saddle is part of the model the
pack shows while it's saddled (MOB_SADDLES, src/mob-data.js). It has no kinds and no names but its baby's. Run
import_additions.py and import_horse.py first.
"""
from import_horse import MOTIONS
from import_port import port


def idles(*keys):
    """Standing still a while (the pack waits up to 6.33 seconds), it does one of three idles, blending in over its idle
    controller's 0.24 seconds, over its breathing (keep)."""
    return [{"every": [3, 7], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in keys]


# The skeleton and zombie horses' idle controllers pick from three of the horse's six (the zombie horse's first three,
# the skeleton horse's third, second and sixth), under the same keys.
ACTS = idles("ciducd", "tculwn", "qofebb")

if __name__ == "__main__":
    port("skeleton_horse", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, share=["horse"])
