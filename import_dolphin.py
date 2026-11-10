"""Give the dolphin the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_dolphin.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby and Bubblegum ones went by the old pack's bones, and the
dolphin only swayed by the old pack's keys). It has no kinds: Bubblegum, its pink skin, is a name (or 1 in 100 dolphins,
picked at random). Run import_additions.py first.
"""
from import_port import port

# In the water it floats, its body rocking and bobbing, its tail and flippers swaying (the pack's idle in the water). Its
# swim is weighted by how fast it moves, so it's left out standing still; so is its head-look loop, which only turns it
# towards what it looks at. The pack also keeps its eyelids (the blink bone) shrunk to nothing all the while by a loop of
# their own; the stage hides them by itself, and shows them while it blinks.
MOTIONS = [("idle", 1)]

# Every 0.1 to 3 seconds it blinks (the pack's blink: its lids, the blink bone, shut over its eyes for 0.15 seconds), at
# half the pack's speed so it's seen, over its floating (keep).
BLINK = {"every": [1, 3], "keep": True, "weight": 3, "parts": [("blinking.step_head", 0, None, [["blink", True]], 0.5)]}
ACTS = [BLINK]

if __name__ == "__main__":
    port("dolphin", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["bubblegum"], nested_poses=True)
