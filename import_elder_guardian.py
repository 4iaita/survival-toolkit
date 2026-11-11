"""Give the elder guardian the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_elder_guardian.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models, the guardian's (it's the guardian's shape 2.35 times as big, in a skin of its
own; its baby the guardian's baby's), so it uses the guardian's model keys. It has no kinds and no names but its baby's.
The stage shows it in the ocean, the guardian beside it at ELDER_RATIO of its size (src/mob-data.js).
Run import_guardian.py first.
"""
from import_guardian import ACTS, BABY_SPIKES, spikes_out
from import_port import ia, port

# It plays what the guardian plays (its animations map lists the same idle, neutral and has_target), but for its swim:
# the same moves, going round 2.35 times slower for the same speed, as it's that much bigger. So it floats, bobbing,
# its head and tail swaying, with its spikes drawn in, and its swim plays at half strength at the pace the stage had
# it before. The pack gives it no idles either; the stage pushes its spikes out now and then, as the guardian's.
MOTIONS = [("idle", 1), ("neutral", 1, "held"), ("swim", 0.5, 1.2)]

# A baby (named Baby, Fry or Beamy; the pack makes none by itself) moves its spikes three quarters as far. Its swim
# is the elder's own, as strong as a grown one's. The pack also raises its body by 16 pixels (its pose).
BABY = {"motions": [("idle", 1), ("neutral", 0.75, "held"), ("swim", 0.5, 1.2)], "acts": [BABY_SPIKES]}

if __name__ == "__main__":
    port("elder_guardian", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, share=["guardian"],
         sets={"baby": BABY}, plays={"baby": "baby"})
    if ia.WRITE:
        spikes_out("elder_guardian")
