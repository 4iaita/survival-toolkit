"""Give the warden the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_warden.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones), and so do William, Jack and Yeti (the
same) and Bacteria (it had the new model but nothing moved it); the baby had the new model too. Its entity
(entity/dwe.json) is the only one for minecraft:warden. It has no kinds, and no names but its baby's (the pack makes
1 in 200 wardens babies by itself; the game has none), William's (a bow tie and a cane on the plain warden), Jack's
(also Gourden and Halloween, which the pack also gives every warden while its Seasonal Mob Variants setting is on
Halloween, off by default), Yeti's (also Festive) and Bacteria's. Its scripts set biome variables (snowy, cherry,
sulfur, dappled, pale) that nothing it draws reads. Its face is one of seven bones (72461 to 72467, by v.courpm): the
usual one, and the others while it sniffs or roars (acts below). Run import_additions.py first.
"""
import pathlib
import tempfile

from PIL import Image

from import_port import ia, im, port, put

# The game's warden_bioluminescent_layer material (which the pack names but doesn't define) draws a layer over the warden
# see-through and at full brightness, by day too, as strong as the layer's color alpha says. The stage can't draw one
# layer through another, so each look's glowing layers are baked into one texture (GLOWS): each texel the body's color
# blended toward the glowing layers' by how strong they are, its alpha saying how much it glows (lit), drawn over the
# body (over).
GLOW_ROOT = pathlib.Path(tempfile.mkdtemp(prefix="warden_glow_"))
_texture_file = im.texture_file
_material_kind = im.material_kind

# Each look's body texture, and its glowing layers with how strongly the pack draws them: the heart pulses with each beat
# (0.8 at the beat, fading to nothing: 0.4, its mean); the bioluminescent layer always at 0.7 (its texels' own alpha
# 50/255 on top); the two sets of pulsing spots in turn (0.25 at most, less than nothing half the time: 0.125, the
# middle of their bright half). The tendrils only glow for a moment when it senses a vibration: none here.
WARDEN = "textures/entity/warden/"
GLOWS = {
    "plain": ("textures/oreville/ans/ddm", [(WARDEN + "warden_heart", 0.4), (WARDEN + "warden_bioluminescent_layer", 0.7),
                                            (WARDEN + "warden_pulsating_spots_1", 0.125), (WARDEN + "warden_pulsating_spots_2", 0.125)]),
    "baby": ("textures/oreville/ans/dcs", [("textures/oreville/ans/dct", 0.4)]),
    # Jack's heart goes the other way (1 less the beat's: 0.6).
    "jack": ("textures/oreville/ans/dcq", [("textures/oreville/ans/ddc", 0.6)]),
    "yeti": ("textures/oreville/ans/ddl", [("textures/oreville/ans/ddj", 0.4)]),
}
# The entity's texture key each one's heart layer is drawn with.
HEART_KEYS = {"plain": "heart", "baby": "qejrmp", "jack": "alxsyt", "yeti": "svkphi"}


def baked(look):
    body, layers = GLOWS[look]
    base = Image.open(_texture_file(body)).convert("RGBA")
    out = Image.new("RGBA", base.size, (0, 0, 0, 0))
    over = [(Image.open(_texture_file(p)).convert("RGBA").resize(base.size, Image.NEAREST), a) for p, a in layers]
    bp, op = base.load(), out.load()
    for y in range(base.height):
        for x in range(base.width):
            if bp[x, y][3] == 0:
                continue
            rgb, glow = [float(c) for c in bp[x, y][:3]], 0.0
            for img, strength in over:
                c = img.getpixel((x, y))
                a = c[3] / 255 * strength
                if a <= 0:
                    continue
                rgb = [b * (1 - a) + o * a for b, o in zip(rgb, c[:3])]
                glow = glow + a - glow * a
            if glow > 0:
                op[x, y] = (*(round(v) for v in rgb), max(1, round(255 * (1 - glow))))
    path = GLOW_ROOT / f"{look}.png"
    out.save(path)
    return path


def texture_file(path):
    if path.startswith("warden_glow/"):
        return GLOW_ROOT / (path.split("/", 1)[1] + ".png")
    return _texture_file(path)


def material_kind(name, mats):
    return "lit" if name == "warden_bioluminescent_layer" else _material_kind(name, mats)


_read_pack = im.read_pack


def read_pack():
    """The glow panels' layer (Jack's: over its chest and head) glows as a whole: the pack gives only its panel bones
    (8dgo1, 8dgo2) its glowing material, and the importer renames those bones before it reads the layers."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    rc = rcs["controller.render.oreville_ans.ccrvxj"]
    if not any("*" in m for m in rc["materials"]):
        rc["materials"] = [{"*": "Material.wlqxdl"}, *rc["materials"]]
    # Its tendrils' quiver when it senses a vibration (the pack's shiver: each tendril swung by v.tendril_animation, which
    # falls from 1 to 0 over half a second after the vibration, times cos(q.life_time * 2578.31) * 18 degrees, the other
    # tendril the other way), as an animation of its own that time.
    swing = f"(1-q.anim_time/{SHIVER})*Math.cos(q.anim_time*2578.31)*18"
    anims["animation.warden_shiver"] = {"animation_length": SHIVER, "bones": {
        "d67l_l6f5jad": {"rotation": [swing, 0, 0]}, "ja89l_l6f5jad": {"rotation": [f"-{swing}", 0, 0]}}}
    ents["minecraft:warden"]["animations"]["shiver_baked"] = "animation.warden_shiver"
    return ents, rcs, geos, mats, anims, props, armors


# The layers the glow texture takes the place of: the bioluminescent layer, the two sets of spots and the tendrils.
DROPPED = {f"controller.render.oreville_ans.{k}" for k in ("chixmv", "cmbxhf", "katbyk", "nexhjd")}


def fix(d):
    for look, key in HEART_KEYS.items():
        baked(look)
        d["textures"][key] = f"warden_glow/{look}"
    d["render_controllers"] = [r for r in d["render_controllers"] if (r if isinstance(r, str) else next(iter(r))) not in DROPPED]


# It stands swaying gently from side to side, its head and arms swinging a little with it (the pack's bob, which it always
# plays, 2.57 seconds round). Left out: its walk and run (weighted by how fast it moves: nothing standing), its stances
# with a target (leaning in, arms out), its head turning to its target, emerging and digging (they only move it in and
# out of the ground), its attack and sonic boom, its flinch when hurt, its swim, jump, fall and landing, its deaths, and
# its sounds and particles.
MOTIONS = [("bob", 1)]

# Standing a second and then up to 5 more (the pack's idle controller), it does one of its two idles: it shifts its weight
# and looks about, or gives a little shudder, blending in and out over the controller's 0.3 seconds, over its swaying.
IDLES = [{"every": [2, 6], "keep": True, "ease": 0.3, "weight": 3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn")]


def faces(times, end):
    """Act parts showing its other faces (the pack's 72462 to 72467, by v.courpm: 1 is its usual face, 72461) from each
    time the animation's timeline sets one to the next."""
    out = []
    for (at, face), nxt in zip(times, [*(t for t, _ in times[1:]), end]):
        if face != 1:
            out.append((None, at, nxt, [["72461", False], [f"7246{face}", True]]))
    return out


# Game states the user asked for, now and then (they aren't attacks). Sniffing (q.is_sniffing): it turns its head one way
# and the other, sniffing, its weight shifting from foot to foot (the pack's sniff and the legs' ikjzji, at full weight
# standing), its nostrils flaring (face 2) while it breathes in.
SNIFF = {"every": [2, 6], "keep": True, "ease": 0.1, "weight": 2,
         "parts": [("sniff", 0, None, []), ("ikjzji", 0, None, []), *faces([(0, 1), (0.48, 2), (1.56, 1), (2.32, 2), (2.88, 1)], 3.68)]}
# Roaring (q.is_roaring): it rears back and roars, shaking its head, its jaw opening (faces 2 and 3), roaring with its
# face shaking between 4 and 5, and closing again (6, 7). Its head's tilt to its target (fnhkvs) is left out.
ROAR_FACES = [(0, 1), (0.6667, 2), (0.75, 3), *((round(1.5 + i * 0.0833, 4), 4 + i % 2) for i in range(20)), (3.1667, 6), (3.25, 7), (3.375, 1)]
ROAR = {"every": [2, 6], "keep": True, "ease": 0.1, "weight": 1, "parts": [("roar", 0, None, []), *faces(ROAR_FACES, 4.7917)]}
# Sensing a vibration (q.time_since_last_vibration_detection): its tendrils quiver for half a second (shiver_baked, from
# the pack's shiver), here at half speed, as 7 swings a second baked at the stage's 20 frames a second came out as a
# jitter. The game also lights the tendrils for that moment (their glowing layer's alpha, v.tendrils_alpha), which the
# stage leaves out: their layer is drawn on the same bones as the body.
SHIVER = 0.5
SHIVER_ACT = {"every": [2, 6], "keep": True, "weight": 2, "parts": [("shiver_baked", 0, None, [], 0.5)]}
ACTS = [*IDLES, SNIFF, ROAR, SHIVER_ACT]



def finish():
    """The glow layer is drawn over the body where their faces meet (over), as the game draws an overlay on the same model."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["warden"]
    for look in looks:
        first = look["layers"][0][0]
        for layer in look["layers"][1:]:
            if layer[0] == first and len(layer) > 3 and layer[3].get("lit"):
                layer[3]["over"] = 1
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "warden", looks))


if __name__ == "__main__":
    im.texture_file = texture_file
    im.material_kind = material_kind
    im.read_pack = read_pack
    im.GLOW_STRENGTH = "habcyx"
    port("warden", variants=[""], acts=ACTS, motions=MOTIONS, fix=fix, remodel=("william", "jack", "yeti", "bacteria"))
    if ia.WRITE:
        finish()
