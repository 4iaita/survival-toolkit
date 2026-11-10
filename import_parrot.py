"""Give the parrot the updated Actions & Stuff pack's models, animations and colors (see import_port.py).

    python3 import_parrot.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one and the Crow, Blue Jay, Cardinal, Robin and Turtle Dove ones
went by the old pack's bones; the baby one had the new model but nothing moved it, and the parrot had no animations at
all), and the skins of its five colors (the pack's q.variant 0 to 4, a skin of their own on the same model; the baby
look's changes with it). The named birds keep their own skins. Run import_additions.py first. It prints the skins to
put in MOB_VARIANTS (src/mob-data.js).
"""
import copy

from import_port import ia, port, put

VARIANTS = ["red", "blue", "green", "cyan", "gray"]

# It stands perched, bobbing a little, its head, wings and tail swaying (the pack's standing loop). The pack's two
# head-look loops only turn its head towards what it looks at, which the stage has none of, so they're left out. So are
# its sitting (a tame parrot told to sit) and its dance (while a jukebox plays nearby), which the game sets off.
MOTIONS = [("vmoegh", 1)]

# Standing still a while (the pack waits 0.1 to 4 seconds), it does one of five idles, blending in and out over its idle
# controller's 0.24 seconds, over its standing loop (keep). The pack has no blink for it.
IDLES = [{"every": [2, 5], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb", "hyopyb", "lsswib")]
ACTS = IDLES

NAMED = ["crow", "blue jay", "cardinal", "robin", "turtle dove"]

# The Crow's eyes glow orange: a flat panel on each side of its head (the pack's 8dgo bones), drawn with a material of
# their own that adds its light (a soft round glow, brightest in the middle). The rest of the crow is drawn with the
# pack's emissive-alpha material, by which the panels' faint texels would come out solid orange discs, so the panels are
# a glow layer of their own here (a copy of the model with only their cubes), and the crow's own layer leaves them out.
# The pack hangs both panels from one bone in the middle of the head, where the stage would put their light (inside the
# head); each goes on a bone of its own here, pivoted on its eye (the eye texel at the front of the top row of each side
# of the head), as the Enderman's glowing eyes are, so the light sits on the eye and faces out from that side.
CROW_MODEL, EYES_MODEL, PANELS = "new_parrot_crow", "new_parrot_crow_eyes", "fsdyhky*"
EYE_AT = [1, 9.5, 0]


def crow_eyes(text):
    models = ia.parse_section(text, "MOB_MODELS")
    eyes = copy.deepcopy(models[CROW_MODEL])
    for bone in eyes[2]:
        if not bone[0].startswith(PANELS[:-1]):
            bone[4] = []
    i = next(i for i, b in enumerate(eyes[2]) if b[0].startswith(PANELS[:-1]))
    panel = eyes[2][i]
    side = lambda cube: 1 if cube[0] > 0 else -1
    (right,) = [c for c in panel[4] if side(c) > 0]
    (left,) = [c for c in panel[4] if side(c) < 0]
    eyes[2][i] = [f"{PANELS[:-1]}1", panel[1], EYE_AT, 0, [right]]
    eyes[2].append([f"{PANELS[:-1]}2", panel[1], [-EYE_AT[0], *EYE_AT[1:]], 0, [left]])
    looks = ia.parse_section(text, "MOB_LOOKS")["parrot"]
    crow = next(l for l in looks if "crow" in l["names"])
    layer = crow["layers"][0]
    layer[2] = [r for r in layer[2] if r[0] != "8dgo*"] + [[PANELS, False]]
    crow["layers"].insert(1, [EYES_MODEL, layer[1], [], {"glow": 1, "soft": 1, "eyes": 1}])
    text = put(text, "MOB_MODELS", EYES_MODEL, eyes)
    return put(text, "MOB_LOOKS", "parrot", looks)


if __name__ == "__main__":
    port("parrot", variants=VARIANTS, acts=ACTS, motions=MOTIONS, remodel=NAMED, nested_poses=True)
    if ia.WRITE:
        ia.MODELS_JS.write_text(crow_eyes(ia.MODELS_JS.read_text()))
