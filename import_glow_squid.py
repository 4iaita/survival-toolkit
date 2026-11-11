"""Give the glow squid the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_glow_squid.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain and baby ones went by the old pack's bones). It has no kinds and no
names but its baby's. The stage shows it in a flooded cave. Run import_additions.py first.
"""
from import_port import port
from import_squid import ACTS, MOTIONS, seat_tentacles

# It plays what the squid plays (its animations map lists the same ones): it pulses in the water and glances about now
# and then, its tentacles seated as the squid's are. The pack also turns its glow panel (the 8dgo bone) to face the
# camera, as the stage does with any soft glow.

if __name__ == "__main__":
    port("glow_squid", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, share=["squid"], fix_geos=seat_tentacles)
