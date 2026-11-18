"""Give the creaking the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_creaking.py path/to/unpacked/pack path/to/textures [--write]

Its plain, baby and Spruce looks get the pack's current models (they went by the old pack's bones; the Dappled one had the
new model but nothing moved it). Its entity (entity/drx.json) is the only one for minecraft:creaking. It has no kinds,
and no names but its baby's (the pack makes 1 in 200 creakings babies by itself; the game has none), Spruce's (also
Twinkle and Festive) and Dappled's, which the pack also gives a creaking in a dappled forest while its biome looks
setting (oreville_ans:fxwjdy) is on (off by default). Its scripts set other biome variables (snowy, cherry, sulfur,
pale) that nothing it draws reads. Run import_additions.py first.

Its three eyes glow orange all the while (texels on an emissive material), by day too, each with a soft glow panel over
it (8dgo1 to 8dgo3, faded in over 3 seconds: v.habcyx, GLOW_STRENGTH); the baby has two eyes and no panels. The pack
draws no difference between the game's states (q.property('minecraft:creaking_state'): neutral, hostile, frozen while
watched, twitching after its heart is broken, crumbling): the stage answers neutral, as one just standing with no player
about. Its tie to its creaking heart (the particles that run between them) isn't drawn.
"""
import random

from import_port import im, port

STATE = "neutral"


def answers(v):
    return {"property": lambda p: {"minecraft:creaking_state": STATE}.get(p, 0.0), "has_property": lambda *a: 1.0}


# The pack gives it no loop: it stands stock still. Left out: its walk (weighted 0.6 even standing, but timed by how far
# it has moved, so standing it's frozen at its first frame with the left foot lifted), its attack, the sway when it's
# hit while its heart protects it, its twitching death after its heart is broken and the crumbling, its jump, fall and
# landing, its deaths, and its sounds and particles.
MOTIONS = []

# Every 0.25 to 4 seconds one of its eyes goes out for a moment and its other eyes blink with it (the pack's three idles,
# picked at random: an eye and its glow panel shrunk to nothing for 0.15 seconds, one after another), and every 1 to 6
# seconds, while nothing is watching it, it twitches, its head and the branches on it jerking side to side (the pack's
# twitch, which stops while a player looks at it). Both over its standing (keep), weighted as often as the pack plays
# them.
FLICKERS = [{"every": [0.5, 3], "keep": True, "parts": [(key, 0, None, [])]} for key in ("ddgzsi", "mdokcl", "qudrju")]
TWITCH = {"every": [0.5, 3], "keep": True, "weight": 2, "parts": [("twitch", 0, None, [])]}
ACTS = [*FLICKERS, TWITCH]

# Spruce: a Christmas tree hung with lights, each of which the pack shows lit one way or the other (two copies of each
# light, gf and g77, lit in turn), picked again at random for every light every 0.75 seconds (its qhyzqw, which the pack
# plays with the name). The pose the importer would take from it keeps them all one way, so it's left out of the look
# (fix) and played instead as a loop of eight such picks, fixed (TWINKLE, a seeded random order), going round every 6
# seconds.
LIGHTS = ["body1", "body2", "leftleg1", "leftleg2", "rightleg1", "rightleg2", "leftarm1", "leftarm2", "rightarm1",
          "rightarm2", "rightarm3", "head"]
STEP, STEPS = 0.75, 8

_read_pack = im.read_pack


def read_pack():
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    rng = random.Random(7)
    bones = {}
    for light in LIGHTS:
        picks = [rng.randint(0, 1) for _ in range(STEPS)]
        for which, on in (("gf", lambda p: 1 - p), ("g77", lambda p: p)):
            keys = {"0.0": [on(picks[0])] * 3}
            for i in range(1, STEPS + 1):
                was, now = on(picks[i - 1]), on(picks[i % STEPS])
                keys[str(round(i * STEP, 4))] = {"pre": [was] * 3, "post": [now] * 3}
            bones[f"da89lk{light}{which}"] = {"scale": keys}
    anims["animation.creaking_twinkle"] = {"loop": True, "animation_length": STEP * STEPS, "bones": bones}
    ents["minecraft:creaking"]["animations"]["twinkle"] = "animation.creaking_twinkle"
    return ents, rcs, geos, mats, anims, props, armors


def fix(d):
    """No still pose for Spruce's lights: the twinkle loop shows them."""
    d["scripts"]["animate"] = [a for a in d["scripts"]["animate"] if not (isinstance(a, dict) and "ooisya" in a)]


SETS = {"spruce": {"motions": [("twinkle", 1)], "acts": ACTS}}
PLAYS = {"spruce": "spruce"}


if __name__ == "__main__":
    im.GLOW_STRENGTH = "habcyx"
    im.read_pack = read_pack
    port("creaking", variants=[""], acts=ACTS, motions=MOTIONS, answers=answers, fix=fix, remodel=("spruce",),
         sets=SETS, plays=PLAYS)
