"""Give the allay the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_allay.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, Goldie, Ghost and Elf ones went by the old pack's bones; the
baby had the new model but nothing moved it). It has no kinds. The pack draws a glowing outline round it (a layer that
only draws round the others), which the stage leaves out, as it does every mob's; its glow panel (a soft halo) shows on
the plain, Ghost and Elf looks, not on Goldie or a baby. Run import_additions.py first.
"""
import import_additions as ia
from import_port import keep_rims, port, put

# It hovers, bobbing, its head swaying and its arms held out a little (the pack's idle), its wings beating (the pack's
# flap, at half its speed so they can be seen). Its head turning to look at what it's after (the pack's head look) is
# left out, and so is its flying, weighted by how fast it moves.
WINGS = ("semigg", 1, 0.5)
MOTIONS = [("idle", 1), WINGS]

# Every 0.2 to 3.2 seconds it blinks: its eyes (6q6) squash to nothing for a moment, over its hovering (keep).
BLINK = {"every": [2, 5], "keep": True, "weight": 3, "parts": [("blinking.vertical", 0, None, [])]}
# Flying up fast at full health, it does a little spin, squashing and stretching (the pack's two, one each way), over
# its hovering (keep). The stage plays them now and then.
SPINS = [{"every": [2, 5], "keep": True, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn")]
# Near a playing jukebox it dances, one of the pack's three dances picked at random, in place of its hovering (the
# pack's dancing state replaces its idle), its wings still beating. The stage dances for DANCES seconds now and then,
# fading in and out over the controller's 0.2 seconds.
DANCES = 6
DANCE = [{"every": [2, 5], "ease": 0.2, "parts": [(key, 0, DANCES, []), (WINGS[0], 0, DANCES, [], WINGS[2])]}
         for key in ("oyilus", "busmoj", "dgngrt")]
ACTS = [BLINK, *SPINS, *DANCE]


def halo_behind():
    """The halo drawn behind the allay (behind): the pack holds its glow panel 4 pixels behind its pivot, in the middle of
    the allay, and turns it to face the camera, so in the game it's always behind the allay and only glows round it."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["allay"]
    for look in looks:
        for layer in look["layers"]:
            if len(layer) > 3 and layer[3].get("halo"):
                layer[3]["behind"] = 1
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "allay", looks))


# The pack also draws a glowing outline round it (cyan, gold on Goldie, white on the Ghost): kept as rims (keep_rims).

if __name__ == "__main__":
    keep_rims()
    port("allay", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["goldie", "ghost", "elf"])
    if ia.WRITE:
        halo_behind()
