"""Give the cod the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_cod.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain one went by the old pack's bones, and nothing moved the baby's). It
has no kinds and no names but its baby's: the pack makes 1 in 5 cod babies by itself (with its setting). The stage shows
it in the ocean. Run import_additions.py first.
"""
from import_port import port

# In the water it floats, rocking and bobbing, its fins and tail swaying (the pack's idle), and swims slowly in place
# (the pack's swim, which plays as it moves: at the strength and speed it has swimming slowly, as the stage had it
# before). Out of the water it flops, which the stage doesn't show; its turn as it swims (driven by its speed and the
# way it's turning) does nothing standing.
MOTIONS = [("idle", 1), ("swim", 0.6, 0.66)]

# Every few seconds it flutters its fins and its body shivers (the pack's loop of a second, played again after 0 to 4
# seconds), over its floating (keep).
FLUTTER = {"every": [0.5, 4], "keep": True, "parts": [("noitrb", 0, None, [])]}
ACTS = [FLUTTER]

if __name__ == "__main__":
    port("cod", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True)
