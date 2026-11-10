"""Give the cave spider the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_cave_spider.py path/to/unpacked/pack path/to/textures [--write]

It has the spider's rig and textures of its own (the plain look went by the old pack's bones; the baby and Halloween
ones had the new models but nothing moved them), and plays the spider's walk. Its controllers have none of the spider's
breathing or settling down, so standing still it only holds its legs in the walk's first pose, and does nothing now
and then. It has no kinds. Run import_additions.py and import_spider.py first.
"""
from import_port import port

MOTIONS = [("walk", 1, "held")]

if __name__ == "__main__":
    port("cave_spider", variants=[""], acts=[], motions=MOTIONS, remodel=["halloween"], nested_poses=True, share=["spider"])
