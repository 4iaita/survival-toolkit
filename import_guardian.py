"""Give the guardian the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_guardian.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain and baby ones went by the old pack's bones). It has no kinds and no
names but its baby's. The stage shows it in the ocean, at ELDER_RATIO of the elder guardian's size (src/mob-data.js).
Run import_additions.py first.
"""
from import_port import port

# In the water it floats, bobbing, its head and tail swaying (the pack's idle), with its spikes drawn in (the pack's
# neutral, which plays once and holds while it has no target; with one it pushes them out, and after a while it ripples
# them in and out as it fires its beam, which the stage doesn't show). Its swim plays at half strength standing still,
# but only moves on as it swims, so the stage plays it at the pace it had before, its tail swishing and its body
# turning a little from side to side. Its eye looks at the camera, which the stage leaves looking ahead.
MOTIONS = [("idle", 1), ("neutral", 1, "held"), ("swim", 0.5, 1.8)]
# The pack gives it no idles: what it does now and then is all with a target (its spikes out, its beam).

# A baby (the pack's, named Baby, Fry or Prismy) draws its spikes in three quarters as far, and swims twice as strongly
# at half the pace.
BABY = {"motions": [("idle", 1), ("neutral", 0.75, "held"), ("swim", 1, 0.9)]}

if __name__ == "__main__":
    port("guardian", variants=[""], acts=[], motions=MOTIONS, nested_poses=True, sets={"baby": BABY}, plays={"baby": "baby"})
