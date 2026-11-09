"""Give the armadillo the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_armadillo.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Halloween and
Pumpkin Pup ones had the new models but nothing moved them). It has no kinds. Run import_additions.py first.
"""
from import_port import port

# It stands breathing and fidgeting, its ears and legs twitching (the pack's always-on idle).
MOTIONS = [("unroll_fast", 1)]

# Now and then it does one of the two idles the pack's idle controller picks from, easing in and out over that
# controller's 0.3 seconds, over its breathing (keep); or, one time in three, rolls up into its shell (the shell, its
# own bone, shows as the pack's render controller has it, and its tail, ears and back legs hide while it's rolled),
# peeks out, and unrolls.
SHELL = [["body_jgdd65", True]]
ROLLED = SHELL + [[bone, False] for bone in ("46fljga5", "l2ad", "3d_d68", "3j_d68")]
IDLES = [{"every": [4, 9], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn")]
ROLL = {"every": [4, 9], "parts": [("roll_up", 0, None, SHELL), ("rolled_up", 0.9048, 5.2, ROLLED), ("peek", 2, None, ROLLED),
                                   ("unroll", 5.2, None, SHELL)]}
ACTS = [*IDLES, ROLL]

if __name__ == "__main__":
    port("armadillo", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["pumpkin pup", "halloween"])
