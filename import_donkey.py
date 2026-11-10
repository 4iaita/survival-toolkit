"""Give the donkey the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_donkey.py path/to/unpacked/pack path/to/textures [--write]

Its plain and baby looks get the pack's current models (they went by the old pack's bones, and the donkey had no
animations at all). It moves as the horse does (see import_horse.py): the pack gives it the horse's loop and idles. Its
saddle and chest are parts of the model the pack shows while it's saddled or carries a chest (MOB_SADDLES and
MOB_CHESTS, src/mob-data.js). It has no kinds and no names but its baby's. Run import_additions.py first.
"""
from import_horse import ACTS, MOTIONS
from import_port import port

if __name__ == "__main__":
    port("donkey", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True)
