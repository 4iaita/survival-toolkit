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
# stage doesn't follow: the bow is held as the game draws it on a parched (the wiki's renders of it, Java and Bedrock
# alike): its grip (BOW_GRIP, the sprite's pixel) in the fist, the bow pointing forward from it, about level (BOW_TURN:
# the sprite's diagonal turned from the fore-and-aft), its string on top and its wood underneath.
BOW = "geometry.oreville_ans.ovshad"
BOW_TEXTURE = "textures/oreville/ans/dhw"
BOW_GRIP = (5, 8)
BOW_TURN = -50
BOW_KEY = f"{ia.PREFIX}parched_bow"
BOW_HAND = (0, -2, 0)  # from the rightitem bone's pivot to the grip: the bottom of the fist
SKELETONS = {"": "default", "baby": "irhbra", "baby executioner": "oxicyj", "halloween": "kvonsz"}


def bow_model(skeleton, texture=BOW_TEXTURE, grip_px=BOW_GRIP, turn=BOW_TURN, name="bow", hand_at=BOW_HAND):
    """skeleton (the look's pack geometry) with no cubes of its own, and the bow in its right hand (or another item drawn
    as a sprite: its texture, the sprite's pixel held in the fist, its turn, about x or [x, y, z], and its bone's
    name, and where the grip is from the rightitem bone's pivot)."""
    bones = {b["name"]: b for b in skeleton["bones"]}
    chain, bone = [], "rightitem"
    while bone:
        chain.insert(0, {k: v for k, v in bones[bone].items() if k != "cubes"})
        bone = bones[bone].get("parent")
    hand = bones["rightitem"]["pivot"]
    grip = [h + o for h, o in zip(hand, hand_at)]
    sprite = Image.open(im.texture_file(texture)).convert("RGBA")
    cubes = []
    for v in range(sprite.height):
        for u in range(sprite.width):
            if not sprite.getpixel((u, v))[3]:
                continue
            # The sprite stands in the bow bone's y-z plane, a pixel thick across x, its grip at the bone's pivot.
            z, y = grip[2] - (u - grip_px[0]) - 0.5, grip[1] + (v - grip_px[1]) - 0.5
            face = {"uv": [u, v], "uv_size": [1, 1]}
            cubes.append({"origin": [grip[0] - 0.5, y, z], "size": [1, 1, 1],
                          "uv": {f: dict(face) for f in ("north", "south", "east", "west", "up", "down")}})
    item = {"name": name, "parent": "rightitem", "pivot": grip, "rotation": list(turn) if isinstance(turn, (list, tuple)) else [turn, 0, 0],
            "cubes": cubes}
    return {"description": {"texture_width": sprite.width, "texture_height": sprite.height}, "bones": [*chain, item]}


def mesh_model(skeleton, texture, mesh, name, plane="xz", flip=(False, False)):
    """skeleton with no cubes of its own, and an item sprite in its right hand placed as a game attachable places a
    texture mesh: mesh = {position, rotation} (the mesh's, on the bone bound to rightitem) and {wield_position,
    wield_rotation} (the attachable's third-person animation of that bone). The sprite's pixels are cubes a pixel
    thick, the sprite centred on the mesh's position and lying in plane ("xz": flat, its u along x and v along z, as a
    texture mesh lies before it's turned), flip mirroring u or v."""
    bones = {b["name"]: b for b in skeleton["bones"]}
    chain, bone = [], "rightitem"
    while bone:
        chain.insert(0, {k: v for k, v in bones[bone].items() if k != "cubes"})
        bone = bones[bone].get("parent")
    hand = bones["rightitem"]["pivot"]
    wield = {"name": f"{name}_wield", "parent": "rightitem", "pivot": list(hand), "rotation": list(mesh.get("wield_rotation", [0, 0, 0]))}
    at = [h + w + m for h, w, m in zip(hand, mesh.get("wield_position", [0, 0, 0]), mesh["position"])]
    sprite = Image.open(im.texture_file(texture)).convert("RGBA")
    cubes = []
    for v in range(sprite.height):
        for u in range(sprite.width):
            if not sprite.getpixel((u, v))[3]:
                continue
            a = (sprite.width - 1 - u if flip[0] else u) - sprite.width / 2
            b = (sprite.height - 1 - v if flip[1] else v) - sprite.height / 2
            face = {"uv": [u, v], "uv_size": [1, 1]}
            origin = [at[0] + a, at[1] - 0.5, at[2] + b] if plane == "xz" else [at[0] + a, at[1] - b - 1, at[2] - 0.5]
            cubes.append({"origin": origin, "size": [1, 1, 1], "uv": {f: dict(face) for f in ("north", "south", "east", "west", "up", "down")}})
    item = {"name": name, "parent": wield["name"], "pivot": at, "rotation": list(mesh["rotation"]), "cubes": cubes}
    return {"description": {"texture_width": sprite.width, "texture_height": sprite.height}, "bones": [*chain, wield, item]}


def add_bow(mob="parched", skeletons=SKELETONS, item="bow", texture=BOW_TEXTURE, texture_key=BOW_KEY, grip=BOW_GRIP, turn=BOW_TURN, hand=BOW_HAND,
            mesh=None):
    """Each look's bow layer, last (a look written again by port() has none yet), on a copy of its skeleton (skeletons:
    first name -> the entity's geometry key for it). Other mobs holding a bow (the skeleton) draw it with the
    parched's texture. item, texture, texture_key, grip and turn: another item held as a sprite (the pillager's
    crossbow), and hand, as bow_model's; or mesh, an item placed as the game places it (mesh_model)."""
    ents, _rcs, geos, *_ = im.read_pack()
    d = ents[f"minecraft:{mob}"]
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")[mob]
    prefix = f"{ia.PREFIX}{mob}_{item}"
    for look in looks:
        name = (look["names"] or [""])[0]
        key = "_".join(filter(None, [prefix, name.replace(" ", "_")]))
        skeleton = geos[d["geometry"][skeletons[name]]]
        model = mesh_model(skeleton, texture, mesh, item) if mesh else bow_model(skeleton, texture, grip, turn, item, hand)
        text = put(text, "MOB_MODELS", key, im.model(model))
        look["layers"] = [layer for layer in look["layers"] if not layer[0].startswith(prefix)] + [[key, [texture_key], []]]
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", mob, looks))
    copy_texture(texture, texture_key)


if __name__ == "__main__":
    port("parched", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["baby executioner", "halloween"])
    if ia.WRITE:
        add_bow()
