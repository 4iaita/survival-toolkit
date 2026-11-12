"""Give the husk the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_husk.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby and Mummy ones went by the old pack's bones; the Executioner
ones had the new models but nothing moved them). Its models and animations are its own: the zombie's entity lists
other keys for its stances, and the husk has eyes that light up blue, which the zombie's don't. It has no kinds, and the
pack makes no babies of it by itself. Run import_additions.py first.
"""
from import_port import ia, im, port, put

# Each husk takes one of eight stances at random when it spawns (the pack's v.srbken, 0 to 7): one of four ways of
# swaying on its feet, its arms held out in front of it or hanging at its sides (they come up when it has a target).
# The stage shows the first (0): it sways, its head lolling, its arms held out (the pack's has_target, held). One holding
# an iron sword or shovel stands as the second sway, arms down; the stage shows nothing in its hands. Its walk, weighted
# by how fast it moves, is left out.
MOTIONS = [("kevang", 1), ("has_target", 1, "held")]

# Standing still for 0.3 seconds and then up to 6.33 more (the pack's idle controller), it does one of two idles: it
# leans forward or back, swaying (the second at the pack's 1.2 blend weight), blending in and out over the controller's
# 0.3 seconds, over its swaying (keep).
IDLES = [{"every": [3, 7], "keep": True, "ease": 0.3, "parts": [("ciducd", 0, None, [])]},
         {"every": [3, 7], "keep": True, "ease": 0.3, "parts": [("tculwn", 0, None, [], 1, 1.2)]}]

# Its eyes light up: the pack shows a head with glowing blue eyes (head8dgo, on an emissive material) in place of its
# own while v.exzbfg is set, which its day and night animations set and clear on their timelines.
EYES_LIT = [["head", False], ["head8dgo", True]]


def lit(times, end):
    """Act parts showing its lit eyes between each pair of times (v.exzbfg set, then cleared)."""
    ons = times + [end] if len(times) % 2 else times
    return [(None, a, b, EYES_LIT) for a, b in zip(ons[::2], ons[1::2])]


# As night falls (the pack's night state) it twitches, its eyes flickering on and off, and stays lit until its first
# blink; after that its eyes flash for 0.15 seconds every 0.45 to 3.8 seconds all night (the pack's blink: on, then off).
# The stage has no night: it plays the nightfall now and then, with three flashes after it, over its swaying (keep).
DUSK = [0.1, 0.2, 0.3, 0.4333, 0.6667, 0.8, 0.9333, 1.0333, 1.1, 1.48]
FLASHES = [2.4, 2.55, 4.1, 4.25, 5.2, 5.35]
NIGHTFALL = {"every": [5, 10], "keep": True, "parts": [("yaykcq", 0, None, []), *lit(DUSK + FLASHES, 0)]}
# As day breaks (the pack's day state) it twitches again, its eyes flickering on twice and going out.
DAWN = [0.1333, 0.2667, 0.4, 0.6]
DAYBREAK = {"every": [5, 10], "keep": True, "parts": [("ghqxof", 0, None, []), *lit(DAWN, 0)]}
ACTS = [*IDLES, NIGHTFALL, DAYBREAK]

# The Executioner (the pack's v.rpqxbs 2) never shows its lit eyes: its own glow yellow all the while (its head's
# emissive material). It twitches all the same.
DARK = [IDLES[0], IDLES[1], {**NIGHTFALL, "parts": NIGHTFALL["parts"][:1]}, {**DAYBREAK, "parts": DAYBREAK["parts"][:1]}]
EXECUTIONER = {"motions": MOTIONS, "acts": DARK}
# A baby always sways the fourth way (idqskp), its arms held out. Its blue-eyed head always shows (the pack's baby layer
# shows it over its own, on the emissive material), so its eyes glow all the while and never flicker.
BABY = {"motions": [("idqskp", 1), ("has_target", 1, "held")], "acts": DARK}
SETS = {"executioner": EXECUTIONER, "baby": BABY}
PLAYS = {"halloween": "executioner", "baby": "baby", "baby executioner": "baby"}


def finish():
    """The baby's head under its blue-eyed one hidden (the two are the same size in the same place: the pack draws the
    blue-eyed one over it), and the Mummy's wrappings drawn over the husk under them (over): the pack draws them on the
    same model, after it."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["husk"]
    for look in looks:
        name = (look["names"] or [""])[0]
        if name == "baby":
            look["layers"][0][2] = [["head", False], *look["layers"][0][2]]
        if name == "mummy":
            for layer in look["layers"][1:]:
                layer[3:] = [{**(layer[3] if len(layer) > 3 else {}), "over": 1}]
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "husk", looks))


if __name__ == "__main__":
    port("husk", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["mummy", "baby executioner", "halloween"],
         sets=SETS, plays=PLAYS)
    if ia.WRITE:
        finish()
