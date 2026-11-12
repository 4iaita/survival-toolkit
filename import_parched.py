"""Give the parched the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_parched.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones, with a glow layer the pack no
longer has; the baby and Executioner ones had the new models but nothing moved them). Its models and animations are its
own, not the skeleton's or the husk's. It has no kinds. The game has no babies of it (it's a skeleton); the pack makes 1
in 200 parched babies by itself. Its head is drawn with an emissive material, so its eyes glow. It holds a bow (BOW).
Run import_additions.py first.
"""
from PIL import Image

from import_port import copy_texture, ia, im, port, put

# It stands swaying, its head rocking (the pack's idle), in the pose the pack eases into when it stands still with no
# target (qmodun, held: its body turned a little and its brows lowered). Its walk and run, weighted by how fast it
# moves, its head turning to look at its target and its bow drawn at a target are left out.
MOTIONS = [("idle", 1), ("qmodun", 1, "held")]

# Standing still for 0.3 seconds and then up to 6.33 more (the pack's idle controller), it does one of three idles,
# blending in and out over the controller's 0.3 seconds, over its swaying (keep): it spins its head right round twice
# and shakes it straight, sways from side to side, or leans forward and back.
IDLES = [{"every": [3, 7], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
ACTS = IDLES

# The game's parched always spawn with a bow. The pack's bow (its attachable, minecraft:bow) is its 16 by 16 sprite
# drawn as a texture mesh, a flat sprite a pixel thick, which the stage can't draw: here it's a cube for each of the
# sprite's pixels, on a bone of its own in the parched's right hand (its rightitem bone, which the pack binds the bow
# to), on a copy of each look's skeleton, so the bow moves with the arm (and is twice as big on a baby, as the pack's
# baby pose scales rightitem). The pack's own placement of the mesh is in the game's terms for attachables, which the
# stage doesn't follow: the bow is stood upright in the fist (BOW_TURN: the sprite's diagonal turned to the vertical),
# its grip (BOW_GRIP, the sprite's pixel) in the hand and its wood to the front, as the game's skeletons hold theirs.
BOW = "geometry.oreville_ans.ovshad"
BOW_TEXTURE = "textures/oreville/ans/dhw"
BOW_GRIP = (5, 8)
BOW_TURN = 45
BOW_KEY = f"{ia.PREFIX}parched_bow"
BOW_HAND = (0, -2, 0)  # from the rightitem bone's pivot to the grip: the bottom of the fist
SKELETONS = {"": "default", "baby": "irhbra", "baby executioner": "oxicyj", "halloween": "kvonsz"}


def bow_model(skeleton):
    """skeleton (the look's pack geometry) with no cubes of its own, and the bow in its right hand."""
    bones = {b["name"]: b for b in skeleton["bones"]}
    chain, name = [], "rightitem"
    while name:
        chain.insert(0, {k: v for k, v in bones[name].items() if k != "cubes"})
        name = bones[name].get("parent")
    hand = bones["rightitem"]["pivot"]
    grip = [h + o for h, o in zip(hand, BOW_HAND)]
    sprite = Image.open(im.texture_file(BOW_TEXTURE)).convert("RGBA")
    cubes = []
    for v in range(sprite.height):
        for u in range(sprite.width):
            if not sprite.getpixel((u, v))[3]:
                continue
            # The sprite stands in the bow bone's y-z plane, a pixel thick across x, its grip at the bone's pivot.
            z, y = grip[2] + (u - BOW_GRIP[0]) - 0.5, grip[1] + (BOW_GRIP[1] - v) - 0.5
            face = {"uv": [u, v], "uv_size": [1, 1]}
            cubes.append({"origin": [grip[0] - 0.5, y, z], "size": [1, 1, 1],
                          "uv": {f: dict(face) for f in ("north", "south", "east", "west", "up", "down")}})
    bow = {"name": "bow", "parent": "rightitem", "pivot": grip, "rotation": [BOW_TURN, 0, 0], "cubes": cubes}
    return {"description": {"texture_width": sprite.width, "texture_height": sprite.height}, "bones": [*chain, bow]}


def add_bow():
    """Each look's bow layer, last (a look written again by port() has none yet)."""
    ents, _rcs, geos, *_ = im.read_pack()
    d = ents["minecraft:parched"]
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["parched"]
    for look in looks:
        name = (look["names"] or [""])[0]
        key = "_".join(filter(None, [BOW_KEY, name.replace(" ", "_")]))
        text = put(text, "MOB_MODELS", key, im.model(bow_model(geos[d["geometry"][SKELETONS[name]]])))
        look["layers"] = [layer for layer in look["layers"] if not layer[0].startswith(BOW_KEY)] + [[key, [BOW_KEY], []]]
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "parched", looks))
    copy_texture(BOW_TEXTURE, BOW_KEY)


if __name__ == "__main__":
    port("parched", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["baby executioner", "halloween"])
    if ia.WRITE:
        add_bow()
