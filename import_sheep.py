"""Give the sheep the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_sheep.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby and snowy ones went by the old pack's bones; the ghost lamb,
biome and Halloween ones had the new models but nothing moved them, and the sheep had no animations at all). The pack
gives 15% of sheep in snowy biomes their Snowy look, and sheep in cherry groves and dappled forests their Cherry and
Dappled looks, by themselves, but the names work anywhere and it has no climates, so it has no kinds. Run
import_additions.py first.
"""
from import_port import port

# It breathes, its body, head, ears and legs swaying a little, all the while (the pack's standing loop), and blinks: the
# pack plays its blink as a loop of its own, the eyes shut for the last sixth of a second of every 1.83.
MOTIONS = [("aujcyb", 1), ("blinking.step", 1)]


# Now and then, standing still a while, it does one of the two idles the pack picks from (a shake, a wiggle), blending
# in and out over the pack's 0.3 seconds, or crops the grass at its feet (the pack's grazing, when the game says it's
# eating), over its breathing (keep).
def idles(*keys):
    return [{"every": [3, 7], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in keys]


GRAZE = {"every": [3, 7], "keep": True, "ease": 0.06, "parts": [("grazing", 0, None, [])]}
ACTS = [*idles("ciducd", "tculwn"), GRAZE]
NAMED = ["snowy", "ghost lamb", "cherry", "dappled", "halloween"]

if __name__ == "__main__":
    port("sheep", variants=[""], acts=ACTS, motions=MOTIONS, remodel=NAMED, nested_poses=True)
