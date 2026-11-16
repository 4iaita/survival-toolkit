"""Give the vindicator the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_vindicator.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and Clown ones went by the old pack's bones; the baby had the new
model but nothing moved it). Its models and controllers are its own, not the pillager's: its sway (zygxsz) is the
evoker's, the same animation, but its stance, its axe and its controllers aren't, so it shares nothing. It has no kinds.
The game has no babies of it; the pack makes 1 in 200 vindicators babies by itself (a big-headed model drawn at half
size). Named Clown (or with the pack's seasonal setting on), it's drawn as the clown instead, never as a baby. Run
import_additions.py first.
"""
from import_port import port

# It stands swaying a little, its head nodding and its arms at its sides (zygxsz: the pack's model has no crossed arms,
# as the game's has), in the pose the pack eases into when it stands still with no target (qmodun, held: leaning a
# little forward, its body turned, its arms shifting and its brows tilted). The game's vindicators carry an iron axe,
# but the pack hides it (its rightitem scaled to nothing) until it has a target, so the stage draws nothing in its hand.
# Left out: raising its axe at a target and lowering it after (has_target, then calm), its chop (an attack), its brows
# lowered while it has a target, its head following what it looks at (udurqi), its walk and run, turning steps, swim,
# jumps, falls and landing, riding a ravager and its deaths. Its animations list a dance (dance) that none of its
# controllers play, so it's left out too; the pack has no celebrating animation for it.
MOTIONS = [("zygxsz", 1), ("qmodun", 1, "held")]

# It blinks: its lids (6q6da5k) stretch down over its eyes for a moment, over its swaying (keep). The pack blinks it every
# 0.5 to 2.5 seconds; the stage every 3 to 7, as the pillager's. The pack gives it no idles.
BLINK = {"every": [3, 7], "keep": True, "weight": 3, "parts": [("blinking.0", 0, None, [])]}
ACTS = [BLINK]

REMODEL = ["clown"]

if __name__ == "__main__":
    port("vindicator", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL)
