"""Give the goat the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_goat.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Evil Kiddo and
Halloween ones had the new models but nothing moved them, and the goat had no animations at all). The pack picks its
horns at random (one of eight shapes); the stage shows the second, as before. Which horns a goat still has is the
game's to say (it loses one ramming a block), and a grown goat has both, so the Halloween goat's horns (one shape, not
eight) show too. It has no kinds. Run import_additions.py first.
"""
from import_port import port

# It breathes, its body, head, ears and legs swaying a little, all the while (the pack's standing loop). The pack has no
# blink or idles for it.
MOTIONS = [("aujcyb", 1)]

# Now and then, as a goat does before it rams, it lowers its head (held there), shifts its weight and stamps a while, and
# lifts its head again, as the pack's bow-head controller plays it when the ram is called off; over its breathing (keep).
BOW = 2.5
RAM = {"every": [5, 10], "keep": True, "parts": [("aiyvni", 0, BOW, []), ("ciamxd", 0, BOW, []), ("gqawcx", BOW, None, [])]}
ACTS = [RAM]



def fix(d):
    """Both horns, as the game says for a goat that hasn't lost one (v.goat_has_left_horn and v.goat_has_right_horn)."""
    d["scripts"]["initialize"] = ["v.goat_has_left_horn=1;v.goat_has_right_horn=1;", *d["scripts"].get("initialize", [])]


if __name__ == "__main__":
    port("goat", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["evil kiddo", "halloween"], nested_poses=True, fix=fix)
