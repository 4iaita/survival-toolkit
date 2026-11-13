"""Give the stray the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_stray.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones; the baby and Grim Reaper ones
had the new models but nothing moved them). Its plain body is the skeleton's own model (share), on its own texture, with
its rags over it (a model of their own, a little bigger all round) and a soft glow over each eye (glow panels, as the
husk's, fading in over 3 seconds: v.habcyx, GLOW_STRENGTH). Its standing animations and their controllers are the
skeleton's and the parched's, but for its third idle, which is its own: so it imports the parched's (MOTIONS, ACTS), whose
keys bake to its own idle. It holds the parched's bow (add_bow). It has no kinds. The game has no babies of it; the pack
makes 1 in 200 strays babies by itself. Run import_additions.py first.
"""
from import_parched import ACTS, MOTIONS, add_bow
from import_port import ia, im, port

im.GLOW_STRENGTH = "habcyx"

# It stands swaying, its head rocking, in the pose the pack eases into when it stands still with no target, and now and
# then does one of three idles: it spins its head round or sways from side to side, as the skeleton does, or (its own)
# twists its body and head about, its arms shifting. Its walk and run, its bow drawn at a target and its skeleton horse
# and spider jockeys are left out. The Grim Reaper's cloak swings as it moves (the pack's cloth physics), which standing
# still leaves it hanging.

# Each look's skeleton (the entity's geometry key), for the bow.
SKELETONS = {"": "default", "baby": "jynmog", "halloween": "qzhwuy"}

if __name__ == "__main__":
    port("stray", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["halloween"], share=["skeleton"])
    if ia.WRITE:
        add_bow("stray", SKELETONS)
