"""Give the ocelot the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_ocelot.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's own ocelot models (they used the cat's old models, the plain and baby ones going by the old
pack's bones, and the Halloween and Witch Kitten ones the cat's new models, which nothing moved): each is now the plain
or baby ocelot with the pack's witch's hat on. It has no kinds. Run import_additions.py first.
"""
from import_port import port

# It breathes, its head and front legs shifting a little, and its tail sways, all the while (the pack's standing loop
# and the tail's idle).
MOTIONS = [("xhmrvj", 1), ("fsseta", 1)]

# Now and then it blinks (its eyelids, the blink bones, slide out to the face for a moment, at half the pack's speed so
# it's seen), or, standing still a while, does one of the two idles the pack picks from (a look about, a longer
# fidget), blending in and out over the pack's 0.3 seconds, over its breathing and tail (keep).
EYES = [["blink", True]]
BLINK = {"every": [3, 7], "keep": True, "weight": 3, "parts": [("blinking.2", 0, None, EYES, 0.5)]}
IDLES = [{"every": [3, 7], "keep": True, "ease": 0.3, "parts": [(key, 0, None, EYES)]} for key in ("ciducd", "tculwn")]
ACTS = [BLINK, *IDLES]

if __name__ == "__main__":
    port("ocelot", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["witch kitten", "halloween"])
