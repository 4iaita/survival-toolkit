"""Give the camel the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_camel.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Halloween and
baby mummy ones had the new models but nothing moved them). Its saddle is a part of the model the pack shows while
it's saddled (MOB_VARIANTS' saddled camel shows it). Run import_additions.py first.
"""
from import_port import port

# It stands breathing, as the pack's standing state has it.
MOTIONS = [("qdimxz", 1)]

# Now and then it does one of the three idles the pack's idle controller picks from, over its breathing (keep),
# blending in and out over that controller's 0.24 seconds; or sits down for a while, breathing as it sits (the pack's
# sitting breath, at half strength), and gets up again.
SITS_FOR = 6
IDLES = [{"every": [4, 9], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
SIT = {"every": [4, 9], "parts": [("sit_down", 0, 1.6667 + SITS_FOR, []), ("oyabwp", 1.6667, 1.6667 + SITS_FOR, [], 1, 0.5),
                                  ("stand_up", 1.6667 + SITS_FOR, None, [])]}
ACTS = [*IDLES, SIT]

if __name__ == "__main__":
    port("camel", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["baby mummy", "halloween"])
