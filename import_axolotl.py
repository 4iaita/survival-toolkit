"""Give the axolotl the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_axolotl.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones, and the Baby Gremlin,
Pirate and Halloween ones had the new models, which the old animations bent out of shape). It has no kinds on the page.
Run import_additions.py first.
"""
from import_port import port

# The stage shows it in the water, still, as the pack's swimming state has it: it sways as it floats (its swimming
# loop), paddles lightly (the pack's swim at the weight it has when not moving, at the speed it has then), and keeps its
# legs tucked in (the pack's still-in-water pose, held).
MOTIONS = [("hihqcy", 1), ("swim", 0.24, 0.5), ("mpfteb", 1, "held")]

if __name__ == "__main__":
    port("axolotl", variants=[""], acts=[], motions=MOTIONS, remodel=["baby gremlin", "pirate", "halloween"], nested_poses=True)
