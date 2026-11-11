"""Give the salmon the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_salmon.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain one went by the old pack's bones, and nothing moved the baby's). It
has no kinds and no names but its baby's: the pack makes 1 in 5 salmon babies by itself (with its setting). It comes in
three sizes, which the game sets (a small salmon is drawn half as big as a medium one, a large one half as big again):
the pack draws them all with the same model, so they're MOB_SIZES with no looks of their own. The stage shows it in the
ocean. Run import_additions.py first.
"""
from import_port import ia, port, put

# In the water it floats, rocking and bobbing, its head, fins and tail swaying (the pack's idle), and swims slowly in
# place (the pack's swim, which plays as it moves: at the strength and speed it has swimming slowly, as the stage had
# it before). Out of the water it flops, which the stage doesn't show; its turn as it swims does nothing standing.
MOTIONS = [("idle", 1), ("swim", 0.6, 0.62)]

# Every few seconds it flutters its fins and its body shivers (the pack's loop of a second, played again after 0 to 4
# seconds), over its floating (keep).
FLUTTER = {"every": [0.5, 4], "keep": True, "parts": [("hudizv", 0, None, [])]}
ACTS = [FLUTTER]

# Large, medium and small: 1.5, 1 and 0.5 times the model's size, beside the biggest.
SIZES = {"big": {"zoom": 1}, "medium": {"zoom": round(1 / 1.5, 4)}, "small": {"zoom": round(0.5 / 1.5, 4)}}

if __name__ == "__main__":
    port("salmon", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True)
    if ia.WRITE:
        ia.MODELS_JS.write_text(put(ia.MODELS_JS.read_text(), "MOB_SIZES", "salmon", SIZES))
