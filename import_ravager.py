"""Give the ravager the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_ravager.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and Krampus ones went by the old pack's bones; the baby one had the
new model but nothing moved it). Its models, animations and controllers are its own: it shares nothing with the illagers
or the villager. Its harness is part of its texture: the pack shows no part of it by a variable. It has no kinds and no
biome looks. The game has no babies of it; the pack makes 1 in 200 ravagers babies by itself (and named Krampus or
Festive, never a baby). Its second model (a locator for what rides it) has no cubes. Run import_additions.py first.
"""
from import_port import port

# It stands with its head low, swaying and breathing, its head nodding, its legs shifting and its jaw working (idle), in
# its standing pose (qmodun: its legs splayed a little, its jaw a little open) with its brows raised (tkqbys, played while
# nothing rides it; the rest of it turns the body towards its target). Left out: its head and pupils following what it
# looks at (look_at_target), its walk and run (weighted by how fast it moves), its swim, jumps, falls and landing, its
# bite (an attack) and its deaths. The pack also names the game's own idle_mouth, which it doesn't define: the game's
# moves bones (mouth, neck) the pack's models don't have, and the pack's standing pose opens the jaw just as far, so it's
# left out. Nothing that rides it in a raid is shown: the stage shows it alone.
MOTIONS = [("qmodun", 1), ("idle", 1), ("tkqbys", 1)]

# It blinks: the pack shows its shut eyes (3dafc, renamed blink) for the last sixth of a second of every 1.83 (its blink
# loop, blinking.step, while it isn't roaring); here every 3 to 7 seconds, over its swaying (keep).
BLINK = {"every": [3, 7], "keep": True, "parts": [(None, 0, 0.1667, [["blink", True]])]}
# When a shield blocks its charge it's stunned (khnacx: its head lolls and wobbles, its eyes pulse, its body sways) for
# STUNNED seconds (the game's 40 ticks), and then, as the game has it, it roars (roaring, with ermejm: it rears back, its
# jaw gaping, and shakes its head from side to side), knocking back what's near: one act, over its swaying, the stun
# blending into the roar as the stage blends one part into the next. The pack blends into and out of the stun over 0.12
# seconds, where something has just struck it; played now and then, that snapped its head down and back up, so the act
# eases in over EASE seconds instead (the roar ends where it started).
STUNNED = 2
EASE = 0.5
STUN = {"every": [3, 7], "keep": True, "ease": EASE,
        "parts": [("khnacx", 0, STUNNED, []), ("roaring", STUNNED, None, []), ("ermejm", STUNNED, None, [])]}
ACTS = [BLINK, STUN]

REMODEL = ["krampus"]

if __name__ == "__main__":
    port("ravager", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL)
