"""Give the chicken the updated Actions & Stuff pack's models, animations and climates (see import_port.py).

    python3 import_chicken.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, jockey, cooked, lava and snowy ones went by the old
pack's bones, so the new animations couldn't move them; the costume ones had the new models but nothing moved them),
and its warm and cold kinds are built again from the pack (the cold one has a model of its own, and the pack's Snowy
and Dappled looks only show on a cold chicken, its Cherry one only on a temperate one). It gets the Dappled look, which
the page didn't have. It has no q.variant kinds: its climates are MOB_VARIANTS' (src/mob-data.js). Run
import_additions.py first.
"""
from import_port import im, port

CLIMATES = {"warm": im._CLIMATE("warm"), "cold": im._CLIMATE("cold")}

# Its eyes (open ones: the blink bones) shrink to nothing for a moment now and then, at half the pack's speed so it's
# seen, over its usual motion (keep).
BLINK = {"every": [3, 6], "keep": True, "weight": 3, "parts": [("blinking.step_eye", 0, None, [], 0.5)]}


def idles(*keys):
    """Standing still a while, it does one of the pack's three idles (a peck, a look about, a scratch), blending in and
    out over its idle controller's 0.35 seconds."""
    return [{"every": [3, 6], "keep": True, "ease": 0.35, "parts": [(key, 0, None, [])]} for key in keys]


# A grown chicken bobs as it stands (the pack's idle), and does a grown chicken's idles.
MOTIONS = [("idle", 1)]
ACTS = [BLINK, *idles("ciducd", "tculwn", "qofebb")]

# A chick (Baby, and the baby zombie and skeleton) bobs and wiggles faster, and has idles of its own. Peep, a chick
# drawn the size of a hen, moves as a hen does, as the pack has it.
CHICK = {"motions": [("lwvcsi", 1, 2)], "acts": [BLINK, *idles("kkxpck", "vhancu", "tiexaw")]}
# Egg Head, a chick in an eggshell, moves as a hen does but twice as fast (the pack counts it as a chick for the speed
# of its idle), and now and then, besides a hen's idles, pops the top of its shell, peeks out a while and shuts it.
PEEKS = 4
EGG_HEAD = {"motions": [("idle", 1, 2)], "acts": [BLINK, *idles("ciducd", "tculwn", "qofebb"), {
    "every": [3, 6], "keep": True, "parts": [("goycux", 0, None, []), ("xfalgo", 1.5, 1.5 + PEEKS, []), ("mtdqmg", 1.5 + PEEKS, None, [])]}]}
# Chickzilla, a giant chick, stomps slowly on the spot (the pack's own loop for it) and only blinks.
CHICKZILLA = {"motions": [("mllwlv", 1)], "acts": [BLINK]}
# Villager, a chicken dressed as a villager, has a villager's nose and eyes that move as it stands (its own loop) and
# blink (its own blink), besides a hen's.
VILLAGER = {"motions": [("idle", 1), ("xuntnk", 1)],
            "acts": [BLINK, {"every": [3, 6], "keep": True, "weight": 3, "parts": [("qzrmue", 0, None, [], 0.5)]}, *idles("ciducd", "tculwn", "qofebb")]}
SETS = {"chick": CHICK, "egg_head": EGG_HEAD, "chickzilla": CHICKZILLA, "villager": VILLAGER}
PLAYS = {"baby": "chick", "baby zombified": "chick", "baby skeleton": "chick", "egg head": "egg_head", "chickzilla": "chickzilla", "villager": "villager"}

NAMED = ["chicken jockey", "cooked", "lava chicken", "snowy", "halloween", "baby zombified", "skeleton", "baby skeleton", "peep", "egg head",
         "chickzilla", "chickle", "turkey", "rooster", "duck", "cherry", "villager"]
DAPPLED = [["dappled", "Dappled"]]

if __name__ == "__main__":
    port("chicken", variants=[""], acts=ACTS, motions=MOTIONS, remodel=NAMED, new_looks=DAPPLED, sets=SETS, plays=PLAYS, climates=CLIMATES,
         nested_poses=True)
