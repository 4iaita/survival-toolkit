"""Give the cow the updated Actions & Stuff pack's models, animations and climates (see import_port.py).

    python3 import_cow.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby and snowy ones went by the old pack's bones; the costume
ones had the new models but nothing moved them, and the cow had no animations at all), and it gets the pack's warm and
cold kinds, each with a model of its own (the pack's Snowy and Dappled looks only show on a cold cow, its Strawberry one
only on a temperate one). It gets the Dappled look, which the page didn't have. It has no q.variant kinds: its climates
are MOB_VARIANTS' (src/mob-data.js). Run import_additions.py first.
"""
from import_port import im, port

CLIMATES = {"warm": im._CLIMATE("warm"), "cold": im._CLIMATE("cold")}

# It breathes, its ears and tail swaying, all the while (the pack's standing loop).
MOTIONS = [("aujcyb", 1)]

# Now and then it blinks, or, standing still a while, does one of the three idles the pack picks from (a shake of the
# head, a look round, a swish of the tail), blending in and out over the pack's 0.24 seconds, over its breathing
# (keep). Its head-look animation turns the head relative to the entity, so the head stays level as the body dips
# (level_head).
BLINK = {"every": [3, 7], "keep": True, "weight": 3, "parts": [("blinking.1", 0, None, [], 0.5)]}


def idles(*keys):
    return [{"every": [3, 7], "keep": True, "ease": 0.24, "level_head": "head", "parts": [(key, 0, None, [])]} for key in keys]


ACTS = [BLINK, *idles("ciducd", "tculwn", "qofebb")]
# A cold cow picks from a fourth idle too: it sneezes.
CLIMATE_ACTS = {"cold": [BLINK, *idles("ciducd", "tculwn", "qofebb", "hyopyb")]}

NAMED = ["snowy", "zombified calf", "cherry", "strawberry", "halloween"]
DAPPLED = [["dappled", "Dappled"]]

if __name__ == "__main__":
    port("cow", variants=[""], acts=ACTS, motions=MOTIONS, remodel=NAMED, new_looks=DAPPLED, climates=CLIMATES, climate_acts=CLIMATE_ACTS)
