"""Give the turtle the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_turtle.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Halloween one had
the new model but nothing moved it). The stage shows it in the ocean, as the pack's in-water state has it. It has no
kinds and no names but its baby's and its Halloween one's. Run import_additions.py first.
"""
from import_port import ia, port, put

# In the water it floats, rocking and bobbing, its head and flippers swaying (the pack's float), and strokes slowly with
# its flippers (the pack's swim, which plays as it moves, at half strength, as the stage had it before). The pack's
# head-look loop only turns its head towards what it looks at, which the stage has none of, so it's left out.
MOTIONS = [("float", 1), ("swim", 0.5)]
# A hatchling strokes half as fast again (the pack's swim for v.cdrzno).
HATCHLING = {"motions": [("float", 1), ("swim", 0.5, 1.5)], "acts": []}
ACTS = []

if __name__ == "__main__":
    port("turtle", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["halloween"], nested_poses=True,
         sets={"hatchling": HATCHLING}, plays={"baby": "hatchling"})
