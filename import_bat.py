"""Give the bat the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_bat.py path/to/unpacked/pack path/to/textures [--write]

Its plain, baby and vampire looks get the pack's current models, which share their bones, so all three flap, blink and
rest alike (the old plain and vampire models went by the old pack's bones, which the baby's didn't have, so it never
moved). It has no kinds. Run import_additions.py first.
"""
from import_port import port

# The bat blinks now and then, its eyelids (the blink bone) showing for a moment; or, less often, flies up and hangs
# upside down to rest, its eyes shut, as the pack's resting state has it: it settles (held there all the while), does
# its two resting idles in turn with a slow sway, and takes off again, its wings still while it hangs.
EYES = [["blink", True]]
SETTLE, HANG = 2.2083, [("ciducd", 2.7917), ("tculwn", 1.625), ("ciducd", 2.7917)]
DOWN = SETTLE + sum(length for _, length in HANG)
REST = {"every": [3, 6], "parts": [
    ("resting", 0, DOWN, EYES), ("bob", SETTLE, DOWN, []),
    *[(key, SETTLE + sum(l for _, l in HANG[:i]), SETTLE + sum(l for _, l in HANG[:i + 1]), []) for i, (key, _) in enumerate(HANG)],
    ("eetqjm", DOWN, None, EYES)]}
BLINK = {"every": [3, 6], "keep": True, "weight": 3, "parts": [("blinking.step_head", 0, None, EYES)]}
ACTS = [BLINK, REST]
# It flies on the spot, its wings beating a little slower than the pack's half-second flap, so they can be seen.
MOTIONS = [("flying", 1, 0.6)]

if __name__ == "__main__":
    port("bat", variants=["bat"], acts=ACTS, motions=MOTIONS, remodel=["vampire"])
