"""Give the bee the updated Actions & Stuff pack's models, animations and moods (see import_port.py).

    python3 import_bee.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby and queen ones went by the old pack's bones; the firefly
had the new model but nothing moved it), and it gets the pack's moths, which the page didn't have. Its kinds are the
skins the pack gives an angry bee, with and without nectar (a calm one with nectar has the plain skin; its pollen is a
layer of its own the stage leaves out). Run import_additions.py first. It prints the skins to put in MOB_VARIANTS
(src/mob-data.js).
"""
from import_port import port

VARIANTS = ["calm", "nectar", "angry", "angry_nectar"]  # nectar + 2 * angry


def answers(v):
    nectar, angry = v % 2, v // 2
    return {"is_angry": float(angry), "property": lambda p: {"minecraft:has_nectar": float(nectar)}.get(p, 0.0), "has_property": lambda *a: 1.0}


# Its wings beat (at half the pack's speed, so they can be seen) and it bobs as it hovers.
MOTIONS = [("flying", 1, 0.5), ("afrdvx", 1)]

# Now and then, over its flying (keep), it has its nectar (the pack's has-nectar animations: a squint, a tilt and a
# wiggle), blinks, or, less often, stings.
NECTAR = {"every": [4, 8], "keep": True, "weight": 2, "parts": [("bcuheu", 0, None, []), ("jfqcnk", 0, None, []), ("hfzfmg", 0, None, [])]}
BLINK = {"every": [4, 8], "keep": True, "weight": 2, "parts": [("blinking.0", 0, None, [])]}
STING = {"every": [4, 8], "keep": True, "parts": [("attack", 0, None, [])]}
ACTS = [NECTAR, BLINK, STING]

# The pack's moths, by the names that pick their color; a bee called just Moth is one of the four at random, so that
# name goes with the first.
_SPELL = lambda c: [f"{c} moth", f"{c.title()} Moth", f"{c.title()} moth", f"{c} Moth"]
MOTHS = [_SPELL("black") + ["moth", "Moth"], _SPELL("brown"), _SPELL("green"), _SPELL("pink")]

if __name__ == "__main__":
    port("bee", variants=VARIANTS, acts=ACTS, motions=MOTIONS, answers=answers, remodel=["qween", "queen", "firefly"], new_looks=MOTHS)
