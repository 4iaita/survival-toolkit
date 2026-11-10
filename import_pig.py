"""Give the pig the updated Actions & Stuff pack's models, animations and climates (see import_port.py).

    python3 import_pig.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, muddy and snowy ones went by the old pack's bones; the
costume ones had the new models but nothing moved them, and the pig had no animations at all), and it gets the pack's
warm and cold kinds: a skin of their own on the same model. The pack's Muddy look only shows on a temperate pig; its
Snowy one shows on any (the importer's default for Snowy names is a cold mob, so the pig is asked as a temperate one).
It has no q.variant kinds: its climates are MOB_VARIANTS' (src/mob-data.js). Run import_additions.py first.
"""
from import_port import im, port

CLIMATES = {"warm": im._CLIMATE("warm"), "cold": im._CLIMATE("cold")}


def answers(v):
    return {"variant": float(v), **im._CLIMATE("temperate")}


# It breathes, its head, ears and legs swaying a little, all the while (the pack's standing loop), and blinks: the pack
# plays its blink as a loop of its own, the eyes shut for the last sixth of a second of every 1.83.
MOTIONS = [("idle", 1), ("blinking.step", 1)]


# Now and then, standing still a while, it does one of the three idles the pack picks from, blending in and out over
# the pack's 0.24 seconds, over its breathing (keep). Its baby and costume looks have the same bones and do the same.
def idles(*keys):
    return [{"every": [3, 7], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in keys]


ACTS = idles("ciducd", "tculwn", "qofebb")
NAMED = ["muddy", "snowy", "zombified piglet", "baby skeleton", "cherry", "dappled", "halloween", "skeleton"]

if __name__ == "__main__":
    port("pig", variants=[""], acts=ACTS, motions=MOTIONS, answers=answers, remodel=NAMED, climates=CLIMATES, nested_poses=True)
