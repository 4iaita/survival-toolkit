"""Give the camel husk the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_camel_husk.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Halloween and
Executioner Calf ones had the new models but nothing moved them). Its models are its own, not the camel's (they're
drawn on other textures, and have bones the camel's don't), but the pack moves it with the camel's animations and
controllers, so it does what the camel does, besides what's its own. Its saddle is a part of the model the pack shows
while it's saddled (MOB_SADDLES). Its eyes glow (soft panels on the sides of its head) on all but its Halloween look
and its babies. Run import_additions.py first.
"""
from import_camel import IDLES, SITS_FOR
from import_port import im, port

# The new pack's name for the glow panels' strength (1 by day), as the wolf's.
im.GLOW_STRENGTH = "habcyx"

# It stands breathing, as the camel does (the pack's standing state), and something inside its ribs (962jl) swells
# and shrinks, twice every 1.25 seconds, all the while (a loop of its own).
PULSE = ("jtrwnn", 1)
MOTIONS = [("qdimxz", 1), PULSE]

# Now and then it does one of the camel's three idles, over its breathing (keep), blending in and out over the idle
# controller's 0.24 seconds; or sits down for a while, breathing as it sits (at half strength, as the pack has it),
# and gets up again, as the camel does. Its ribs go on pulsing while it sits.
SIT_END = 1.6667 + SITS_FOR
SIT = {"every": [4, 9], "parts": [("sit_down", 0, SIT_END, []), ("oyabwp", 1.6667, SIT_END, [], 1, 0.5),
                                  ("stand_up", SIT_END, None, []), (PULSE[0], 0, SIT_END + 2, [])]}
ACTS = [*IDLES, SIT]

if __name__ == "__main__":
    port("camel_husk", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["executioner calf", "halloween"])
