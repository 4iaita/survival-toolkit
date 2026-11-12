"""Give the husk the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_husk.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby and Mummy ones went by the old pack's bones; the Executioner
ones had the new models but nothing moved them). Its models and animations are its own: the zombie's entity lists
other keys for its stances, and the husk has eyes that light up yellow, which the zombie's don't. It has no kinds, and the
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

# Its eyes glow: the pack shows a head with glowing yellow eyes (head8dgo, on an emissive material) in place of its own
# while v.exzbfg is set, with a soft glow over each eye (the glow panels 8dgo1 and 8dgo2, a layer of their own, fading in
# over 3 seconds: v.habcyx, GLOW_STRENGTH). Its day and night animations set and clear v.exzbfg on their timelines: by
# day its eyes stay dark, at night they flicker on as night falls and then light now and then (the pack's blink). The
# stage shows them as at night, lit all the while (fix), with the glow over them at its full strength; the backdrop stays
# the desert's, by day.
im.GLOW_STRENGTH = "habcyx"
EYES_DARK = [["head", True], ["head8dgo", False], ["fsdyhky*", False]]


def fix(d):
    """Its eyes lit (v.exzbfg set), as the pack's night animations leave them."""
    init = d["scripts"]["initialize"]
    init[init.index("v.exzbfg=0;")] = "v.exzbfg=1;"


def dark(times, end):
    """Act parts showing its dark eyes from each time to the next (v.exzbfg cleared, then set again)."""
    offs = times + [end] if len(times) % 2 else times
    return [(None, a, b, EYES_DARK) for a, b in zip(offs[::2], offs[1::2])]


# Now and then it twitches as it does when night falls (the pack's night state), its eyes flickering out and back on
# (the times its timeline clears and sets v.exzbfg again), over its swaying (keep). Its daybreak twitch, which puts its
# eyes out, is left out.
DUSK = [0, 0.1, 0.2, 0.3, 0.4333, 0.6667, 0.8, 0.9333, 1.0333, 1.1]
NIGHTFALL = {"every": [5, 10], "keep": True, "parts": [("yaykcq", 0, None, []), *dark(DUSK, 0)]}
ACTS = [*IDLES, NIGHTFALL]

# The Executioner (the pack's v.rpqxbs 2) never shows the husk's lit eyes or their glow: its own eye glows yellow all
# the while (its head's emissive material). It twitches all the same.
DARK = [IDLES[0], IDLES[1], {**NIGHTFALL, "parts": NIGHTFALL["parts"][:1]}]
EXECUTIONER = {"motions": MOTIONS, "acts": DARK}
# A baby always sways the fourth way (idqskp), its arms held out. Its glowing-eyed head always shows (the pack's baby layer
# shows it over its own, on the emissive material), so its eyes glow all the while and never flicker.
BABY = {"motions": [("idqskp", 1), ("has_target", 1, "held")], "acts": DARK}
SETS = {"executioner": EXECUTIONER, "baby": BABY}
PLAYS = {"halloween": "executioner", "baby": "baby", "baby executioner": "baby"}


def finish():
    """The baby's head under its glowing-eyed one hidden (the two are the same size in the same place: the pack draws the
    glowing-eyed one over it), and the Mummy's wrappings drawn over the husk under them (over): the pack draws them on
    the same model, after it."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["husk"]
    for look in looks:
        name = (look["names"] or [""])[0]
        if name == "baby":
            look["layers"][0][2] = [["head", False], *look["layers"][0][2]]
        if name == "mummy":
            for layer in look["layers"][1:2]:
                layer[3:] = [{**(layer[3] if len(layer) > 3 else {}), "over": 1}]
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "husk", looks))


if __name__ == "__main__":
    port("husk", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["mummy", "baby executioner", "halloween"],
         sets=SETS, plays=PLAYS, fix=fix)
    if ia.WRITE:
        finish()
