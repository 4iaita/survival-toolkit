"""Give the piglin brute the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_piglin_brute.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones; the baby and Halloween ones had
the new models but nothing moved them). Its plain and baby models are the piglin's (the same geometry, on its own
textures: share), its Halloween one its own; its glow panels' texture is the piglin's (reuse). Its stance, blink and
idles are the piglin's (the sword-carrying piglin's stance, the same animations), so it imports the piglin's acts. It
has no kinds. The game has no babies of it; the pack makes 1 in 200 piglin brutes babies by itself (v.tocraa 0.005, with
its seasonal mob variants off). Its eyes are lit and its glow panels fade in, as the piglin's; its Halloween costume and
its babies have none. Its entity is the only one for minecraft:piglin_brute. Run import_piglin.py first.
"""
from import_piglin import BLINK, IDLES, add_weapon, reuse
from import_port import ia, im, port

im.GLOW_STRENGTH = "habcyx"

# It stands swaying, its head nodding and its ears flicking (uvuvat, 1.6 seconds round, as the old stage's), its arms
# eased a little out and one foot a little forward (hrllie, held), as the sword piglin does; its golden axe in
# its hand (below). Now and then it blinks and does one of the piglin's three idles (the same controllers). Left
# out: its head following what it looks at, its walk and run, its axe raised at a target and its swings, riding,
# jumps, falls, landing and deaths. The pack has no shake while it turns into a zombified piglin in the Overworld.
MOTIONS = [("uvuvat", 1), ("dwdraj", 1, "held")]
ACTS = [BLINK, *IDLES]
REMODEL = ["halloween"]

# The game's piglin brutes always carry a golden axe: the pack's sprite as cubes, held as the game draws it (the wiki's
# renders) and as the vindicator's hangs: at right angles to its hanging forearm, its head out in front of the fist,
# gripped near the foot of its handle in the middle of the fist; on every look, the pack's babies too.
AXE = "textures/items/gold_axe"
AXE_GRIP = (4, 12)
AXE_LOOKS = {"": "default", "baby": "jzlkpv", "halloween": "umygkl"}

if __name__ == "__main__":
    port("piglin_brute", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL, share=["piglin"])
    if ia.WRITE:
        reuse("piglin_brute")
        add_weapon("piglin_brute", "axe", AXE, AXE_GRIP, AXE_LOOKS)
