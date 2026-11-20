"""Give the piglin the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_piglin.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Baby Butcher and
Halloween ones had the new models but nothing moved them). Its models are the piglin brute's too (the same geometry, on
the brute's own textures), but not the zombified piglin's; its blink and idles and their controllers are the brute's
and the zombified piglin's, the same animations, but its stances are its own. It has no kinds the stage shows: the
game's q.variant only says what it carries (0 a crossbow, 1 a golden sword, half and half), and the pack gives each its
own stance; the stage shows the crossbow piglin (q.variant 0, the importer's answer), holding its crossbow. The
game has babies of it; the pack makes none by itself (v.tocraa=0), and a baby named Baby is drawn as the game's own
(the same big head and sway). Its eyes (3dafc, on an emissive material) are lit, and its glow panels (8dgo1 and 8dgo2,
over its eyes) fade in over seconds (v.habcyx); the Halloween costume hides them (the pack's overlay blacks them out),
and babies have none. Its entity is the only one for minecraft:piglin. Run import_additions.py first.
"""
import import_additions as ia
from import_pillager import CROSSBOW, CROSSBOW_KEY, CROSSBOW_MESH
from import_parched import bow_model, mesh_model
from import_port import copy_texture, im, port, put

im.GLOW_STRENGTH = "habcyx"

# It stands as a piglin with a crossbow does (q.variant 0): swaying, its head tipping from side to side and its weight
# shifting (the pack's tytiby, 1.8 seconds round, as the old stage's), its arms hanging and its crossbow in its right
# fist, as the game draws a crossbow piglin (the wiki's render). The pack also plays a carrying pose of its own all the
# while (vdhjyz: its body turned, its right arm out and its left reaching across its chest), which is left out: with
# the crossbow where the game puts it, the left hand reached for nothing, as the pillager's two-handed hold did. Also
# left out: the sword piglin's stance (q.variant 1: uvuvat, the brute's), its head following what it looks at (nnxixp),
# its walks and runs (by move speed), fleeing, its crossbow drawn and fired, its attacks, admiring gold (it holds a gold
# ingot up and looks it over, egezmj: the stage has no ingot to show), riding a hoglin or anything else, jumps, falls,
# landing and its deaths. The pack has no dance after a hunt and no shake while it turns into a zombified piglin in the
# Overworld (q.is_shaking only turns its body as it dies).
MOTIONS = [("gclbvp", 1)]

# It blinks: its open eyes (3dafc) and its glow panels shrink to nothing for 0.15 seconds, every 1 to 3.75 seconds (the
# pack's blink controller), over its stance (keep).
BLINK = {"every": [1, 3.75], "keep": True, "parts": [("blinking.step_eye", 0, None, [])]}
# Now and then, as the pack's idle controller has it (0.3 seconds after it stops, then 0 to 6.33 seconds more), it does
# one of its three idles over its stance (keep), blended in and out over the controller's 0.3 seconds: it looks left and
# right, flicking its ears; it shifts its weight to one side, tipping its head down and over, an ear flicking; or it
# bends to look down at its feet and kicks a foot up.
IDLES = [{"every": [0.3, 6.63], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
ACTS = [BLINK, *IDLES]

# A baby (holding nothing, as the game's babies do) sways and bobs from side to side (wsbyfa, 1.44 seconds round) and
# blinks, with no idles (the pack's baby state has no idle controller). Baby Butcher plays the same.
SETS = {"baby": {"motions": [("lwvcsi", 1)], "acts": [BLINK]}}
PLAYS = {"baby": "baby", "baby butcher": "baby"}
REMODEL = ["baby butcher", "halloween"]


# Its crossbow: the pillager's (import_pillager.py), the game's unloaded crossbow sprite as cubes (mesh_model), placed as
# the game's crossbow attachable places it with the pillager's wield (its stock in the fist), on a copy of each adult
# look's skeleton (CROSSBOW_LOOKS: the entity's geometry key for each), drawn with the pillager's texture. The game's
# baby piglins hold nothing.
CROSSBOW_LOOKS = {"": "default", "halloween": "eapnwa"}

# The zombified piglin's golden sword (import_zombified_piglin.py). The pack's (its attachable, minecraft:golden_sword)
# is, with its 3D items setting off as it starts, the game's sprite drawn as a texture mesh: here it's a cube for each
# pixel, as the vindicator's axe (bow_model), in the right hand, held as the game draws a sword in a hanging hand (the
# wiki's renders): at right angles to the forearm, the blade out in front of the fist (HANG_TURN, the vindicator's), its
# handle through the middle of the fist (fist()): the guard just in front of it and the pommel just behind.
SWORD = "textures/items/gold_sword"
SWORD_GRIP = (3, 12)
HANG_TURN = -45


def fist(skeleton):
    """Where a held item's grip goes, from the rightitem bone's pivot (as bow_model's hand_at): the middle of the fist,
    the bottom 4 pixels of the right arm's lowest cube. The pack puts rightitem at the bottom of the arm and towards its
    back (and on the babies' thicker arms off to one side), so an item gripped there cut through the bottom of the hand."""
    bones = {b["name"]: b for b in skeleton["bones"]}
    cube = min(bones["rightarm"]["cubes"], key=lambda c: c["origin"][1])
    (x, y, z), (w, _h, d) = cube["origin"], cube["size"]
    pivot = bones["rightitem"]["pivot"]
    return (x + w / 2 - pivot[0], y + 2 - pivot[1], z + d / 2 - pivot[2])


def add_weapon(mob, item, texture, grip, looks_of, turn=HANG_TURN, entity=None, mesh=None, tex_key=None):
    """The weapon: a layer of its own, last, on a copy of each holding look's skeleton (looks_of: first name -> the
    entity's geometry key), gripped in the middle of the fist."""
    ents, _rcs, geos, *_ = im.read_pack()
    d = ents[f"minecraft:{entity or mob}"]
    key = f"{ia.PREFIX}{mob}_{item}"
    tex_key = tex_key or f"{ia.PREFIX}piglin_{item}"
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")[mob]
    for look in looks:
        name = (look["names"] or [""])[0]
        look["layers"] = [layer for layer in look["layers"] if not layer[0].startswith(key)]
        if name not in looks_of:
            continue
        model_key = "_".join(filter(None, [key, name.replace(" ", "_")]))
        skeleton = geos[d["geometry"][looks_of[name]]]
        model = mesh_model(skeleton, texture, mesh, item) if mesh else bow_model(skeleton, texture, grip, turn, item, fist(skeleton))
        text = put(text, "MOB_MODELS", model_key, im.model(model))
        # held: the stage frames the mob on its body, not its weapon (src/mobs.js).
        look["layers"].append([model_key, [tex_key], [], {"held": 1}])
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", mob, looks))
    copy_texture(texture, tex_key)


def reuse(mob):
    """Its layers' textures that are the piglin's, byte for byte (the glow panels'), by the piglin's keys, the copies
    deleted: run after import_piglin.py."""
    art = ia.im.root / "art" / "mobs"
    theirs = {}
    for f in sorted(art.glob(f"{ia.PREFIX}piglin*.png")):
        if not f.stem.startswith(f"{ia.PREFIX}piglin_brute"):
            theirs.setdefault(f.read_bytes(), f.stem)
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")[mob]
    for look in looks:
        for layer in look["layers"]:
            for i, key in enumerate(layer[1]):
                f = art / f"{key}.png"
                if f.exists() and f.read_bytes() in theirs and theirs[f.read_bytes()] != key:
                    layer[1][i] = theirs[f.read_bytes()]
                    f.unlink()
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", mob, looks))


if __name__ == "__main__":
    port("piglin", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL, sets=SETS, plays=PLAYS)
    if ia.WRITE:
        add_weapon("piglin", "crossbow", CROSSBOW, None, CROSSBOW_LOOKS, mesh=CROSSBOW_MESH, tex_key=CROSSBOW_KEY)
