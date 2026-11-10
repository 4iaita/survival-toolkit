"""Give the cave spider the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_cave_spider.py path/to/unpacked/pack path/to/textures [--write]

It has the spider's rig and textures of its own (the plain look went by the old pack's bones; the baby and Halloween
ones had the new models but nothing moved them), and uses the spider's models. Its own controllers only hold its legs
in the walk's first pose when it stands still, so it would stand stock still on the stage: it moves as the spider does
instead (the same rig, and the spider's own animations), breathing and now and then settling down for a rest. It has
no kinds. Run import_additions.py and import_spider.py first.
"""
from import_port import im, port
from import_spider import ACTS, MOTIONS


def fix(d):
    """The spider's settle and stand, which the cave spider's entity doesn't list (the same animations, by the spider's keys)."""
    spider = im.read_pack()[0]["minecraft:spider"]["animations"]
    for key in ("rilzjy", "stand"):
        d["animations"].setdefault(key, spider[key])


if __name__ == "__main__":
    port("cave_spider", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["halloween"], nested_poses=True, share=["spider"], fix=fix)
