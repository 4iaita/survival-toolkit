"""Give the rabbit the updated Actions & Stuff pack's models, animations and coats (see import_port.py).

    python3 import_rabbit.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, Toast and Killer Bunny ones went by the old pack's
bones; the Easter, Punk and Cherry ones had the new models but nothing moved them, and the rabbit had no animations at
all), and the skins of its six coats (the pack's q.variant 0 to 5, a skin of their own on the same model, the baby's
too). The Cherry look is the rabbit's own coat with cherry blossoms over it, so it changes with the coat; the Toast,
Killer Bunny, Easter and Punk looks keep their own skins. Run import_additions.py first. It prints the skins to put in
MOB_VARIANTS (src/mob-data.js).
"""
from import_port import ia, port, put

VARIANTS = ["brown", "white", "black", "black_and_white", "gold", "salt_and_pepper"]

# It breathes, its body bobbing, its head, ears and whiskers swaying a little, all the while (the pack's standing loop).
# The pack's other standing loop only turns its head towards what it looks at, which the stage has none of, so it's
# left out; so are its hops, which play while it moves.
MOTIONS = [("idle", 1)]

# Every half second to 2 seconds it blinks (the pack's blink: its eyes shrink to nothing for 0.15 seconds), at half the
# pack's speed so it's seen, over its breathing (keep).
BLINK = {"every": [1, 3], "keep": True, "weight": 3, "parts": [("blink", 0, None, [], 0.5)]}
# Standing still a while (the pack waits up to 4 seconds), it does one of three idles, blending in and out over its idle
# controller's 0.24 seconds, over its breathing (keep).
IDLES = [{"every": [2, 5], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
ACTS = [BLINK, *IDLES]

NAMED = ["toast", "killer bunny", "easter", "punk", "cherry"]

# The Cherry look's blossom is tucked into its left ear, at its base, but the pack hangs it on the head, and the rabbit's
# standing loop keeps its ears turned and swaying: the ear moved away and left the blossom in the air beside the head. It
# hangs from that ear here instead (the same place at rest), so it goes where the ear goes.
CHERRY_LAYER, EAR, EAR_PIVOT = "new_rabbit_cherry_1", "62jd67l", [1.5, 13, -3.5]


def blossom_on_ear(model):
    bones = model[2]
    if any(b[0] == EAR for b in bones):
        return model
    head = next(i for i, b in enumerate(bones) if b[0] == "head")
    bones.append([EAR, head, EAR_PIVOT, 0, bones[head][4]])
    bones[head][4] = []
    return model


if __name__ == "__main__":
    port("rabbit", variants=VARIANTS, acts=ACTS, motions=MOTIONS, remodel=NAMED, nested_poses=True)
    if ia.WRITE:
        text = ia.MODELS_JS.read_text()
        model = blossom_on_ear(ia.parse_section(text, "MOB_MODELS")[CHERRY_LAYER])
        ia.MODELS_JS.write_text(put(text, "MOB_MODELS", CHERRY_LAYER, model))
