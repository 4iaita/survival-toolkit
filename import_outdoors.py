"""Give the armor stand "Outdoors" props (ITEMS below) the updated Actions & Stuff pack's models, textures, animations, glow
and particles (see import_port.py).

    python3 import_outdoors.py path/to/unpacked/pack path/to/textures [--write]

Many are on textures/oreville/ans/dpg, which import_additions.py already copied as new_prop_bamboo; the others' sheets are in
SHEETS. Versions for the stand's poses (v.jxykui): the campfires (four sheets), the torches (but the copper one), the
balloons, the windmill, the cart, the fence and the logs (VERSIONS and the functions below). The mushrooms and fungi have
another model for a stand placed diagonally (q.body_y_rotation in their render controllers' arrays).

The glow item frame's prop is the armor stand's own (minecraft:armor_stand, v.wrnkzf): a doorway in the air that shows a room
of its own, the backrooms (a stencil: the room is only drawn where the doorway is). Here the room's layers are flagged room,
and the doorway's one portal (src/mobs.js). The doorway is as wide as v.bscdns says: by how far off the camera is, by pose.

The fishing rod, which the old pack's scripts made one of these, isn't a prop: its model hangs in the stand's shrunken hand,
and the animations its scripts turn on for a §§ stand have none of its bones (they're the piñata's). It's taken out.

How a prop rests, its entrance and its acts: see import_christmas.py.
"""
import math
import re

import import_additions as ia
from import_christmas import HIT, ZERO, Prop, act, beyond, first, loop, loop_times, moments, together, whole
from import_halloween import rocking, settled_act, shows
from import_house import rows_of
from import_port import copy_texture, put

im = ia.im

ANS = "textures/oreville/ans/"
SHEET, TEXTURE = ANS + "dpg", "new_prop_bamboo"
ITEMS = ["water_bucket", "campfire", "torch", "soul_torch", "copper_torch", "brown_mushroom", "red_mushroom", "crimson_fungus",
         "warped_fungus", "moss_carpet", "pale_moss_carpet", "cobblestone", "mossy_cobblestone", "stone_bricks", "redstone_torch", "carrot", "pufferfish",
         "pale_oak_trapdoor", "spruce_trapdoor", "spruce_boat", "spruce_fence", "stick", "target", "glow_frame"]
SHEETS = {SHEET: TEXTURE, ANS + "djs": "prop_water_bucket", ANS + "nys": "prop_campfire", ANS + "nyr": "prop_campfire_1", ANS + "nyq": "prop_campfire_2",
          ANS + "nyt": "prop_campfire_3", ANS + "dpy": "prop_torch", ANS + "dlj": "prop_carrot", ANS + "ocg": "new_prop_pale_oak_trapdoor",
          ANS + "ocw": "new_prop_spruce_trapdoor", ANS + "ocu": "new_prop_spruce_boat", ANS + "ocv": "new_prop_spruce_fence", ANS + "ocx": "new_prop_stick",
          ANS + "obi": "new_prop_glow_frame", ANS + "obj": "new_prop_glow_frame_1", ANS + "obk": "new_prop_glow_frame_2",
          ANS + "nyb": "prop_backrooms_floor", ANS + "nyc": "prop_backrooms_wall", ANS + "nyd": "prop_backrooms_ceiling",
          "textures/blocks/ochre_froglight_top": "prop_backrooms_light"}
# Two items with the same model draw the same one.
SAME = {"soul_torch": "torch", "copper_torch": "torch"}
# Materials that show one side only.
CULLED = ["water_bucket", "crimson_fungus", "warped_fungus", "pale_oak_trapdoor", "spruce_trapdoor"]
LIT = {"crimson_fungus": ["emk9*"], "warped_fungus": ["emk9*"], "brown_mushroom": ["*:*"]}
BALLOONS = "32ddggf3mf5d6"  # and 2 to 6, one for each pose
LIT_BALLOONS = [f"{BALLOONS}33", f"{BALLOONS}23", f"{BALLOONS}62"]
# The block the enderman balloon holds (v.tullde, picked at random as the stand loads).
BLOCKS = ["8j2kk3dg4c", "lfl3dg4c", "k2f53dg4c", "j653dg4c", "hmehcaf3dg4c", "e6dgf3dg4c", "5ajl3dg4c", "4d2q3dg4c", "424lmk3dg4c", "4jaekgf3dg4c", "o2jh653dg4c", "eq46dame3dg4c"]
# How far into the ground the pack has them.
SUNK = {"brown_mushroom": 1, "red_mushroom": 1, "crimson_fungus": 1, "warped_fungus": 1, "stone_bricks": 0.15, "target": 1.38}
BRAZIER_SUNK = 0.71
LOGS_SUNK = {"lxaetg": 0.95, "lsypnt": 0.95, "octnvz": 0.87, "mdhmqq": 1.67, "eadmwl": 1.67, "gynhbn": 0.87}
# How far over where they'd land what turns must be, for its corners to clear the ground as they come round.
CLEAR = {"spruce_trapdoor": 6.15, "big": 4.05, "small": 2.29}
FIRE = [["campfire_flames", 0.3], ["campfire_sparks", 0.3], ["campfire_smoke", 0.3]]
OUT = [["put_out", 0.3], ["campfire_smoke", 0.3]]
EMITS = {"campfire": FIRE, "torch": [["torch_sparks"]], "soul_torch": [["soul_sparks"]]}
# v.tkoeby and v.ufczzf: the way the stand is hit from, as import_halloween.py; v.qgnhur, where in its bobbing a bundle of
# balloons starts (random). And what molang.py doesn't have.
HIT.update({"v.qgnhur": "0", "Math.ease_out_cubic(1,0,q.anim_time/1)": "Math.pow(1-q.anim_time,3)", "Math.ease_out_cubic(1,0.9,q.anim_time/1)": "(0.9+0.1*Math.pow(1-q.anim_time,3))"})
HIT.update({"v.tkoeby": HIT["v.vipnxs"], "v.ufczzf": HIT["v.cdntav"]})
SAILS, WHEEL = "oaf5eadd", "o2l6jo966d"


def geometry(d, key):
    return d["geometry"][key]


def balloons(p):
    """They come in (spawn) with a jiggle (vypqnl, which comes again as they change) and a wiggle (vbjsnf), and bob (bob, at a
    quarter strength, three times as fast). Hit, they wiggle (its blend_weight dies away over two seconds)."""
    dies = lambda t: 3 * (1 - min(1, t / 2)) ** 3
    bob = round(8 / 3, 4)
    sway = p.at("bob", loop_times(bob), lambda t: 0.25, 3)
    jiggle = p.length("vypqnl")
    held = lambda key, times, length: p.at(key, [min(t, length) for t in times])
    length = p.length("spawn")
    times = moments(length)
    rest = {bone: {ch: frames[-1] for ch, frames in channels.items()} for bone, channels in held("vypqnl", [jiggle], jiggle).items()}
    came = together(p.at("spawn", times), held("vypqnl", times, jiggle))
    wag = {b: {c: f for c, f in ch.items()} for b, ch in p.at("vbjsnf", [min(t, 2) for t in times], dies).items()}
    spawn = act([whole(beyond(together(came, wag), rest, len(times)), length)], length, keep=1)
    hit = p.length("wiggle")
    wiggle = act([whole(p.at("wiggle", moments(hit), dies), hit)], hit, ease=0.1, keep=1)
    turn = act([whole(beyond(p.at("vypqnl", moments(jiggle)), rest, len(moments(jiggle))), jiggle)], jiggle, keep=1)
    start = first(sway)
    posed = first(together({b: {c: [v] for c, v in ch.items()} for b, ch in rest.items()}, {b: {c: [v] for c, v in ch.items()} for b, ch in start.items()}))
    return posed, {"spawn": spawn, "acts": [wiggle], "turns": [turn] * 5, "loops": [loop(beyond(sway, start, len(loop_times(bob))), bob, keep=True)]}


def mushrooms(p, frames, cluster):
    """They wiggle as they come and when they're hit (the controller uhinch). The brown ones flash too: a particle, and a row of
    models (frames), 18 a second, that differ in how their texels glow, each a bone here. (The pack picks one by q.anim_time, which
    may only run as the stand is placed; here they flash with the particle.) Its other particle (vzoaiu) shows nothing: it draws
    an empty corner of its texture (dge)."""
    wiggle = settled_act(p, "wiggle", **({"puffs": [[0, "mushrooms_flash" if cluster else "mushroom_flash"]]} if frames else {}))
    for i, k in enumerate(frames):
        wiggle["parts"].append({"from": round(i / 18, 4), "to": round((i + 1) / 18, 4), "bones": {}, "show": [["*", False], [f"{k}:*", True]]})
    wiggle["length"] = round(max(len(frames) / 18, wiggle["length"]), 4)
    return {"spawn": wiggle, "acts": [wiggle]}


def main():
    ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    items = ia.read_props()
    text = ia.MODELS_JS.read_text()
    acts = {}
    for item in ITEMS:
        d = items[f"minecraft:{item}"]
        layers, _scale, _pose = im.look(d, rcs, mats, anims, "§§", held=True)
        look = {"names": ["§§"], "scale": 1}
        own = {}
        if item in CULLED:
            own["culledBones"] = ["*"]
        if item in LIT:
            own["litBones"] = LIT[item]
        if item in LIT:
            look["evenBloom"] = 1  # glowing at half strength, or dying away
        if item in SUNK:
            own["buried"] = 1
            look["sunk"] = SUNK[item]
        if item in EMITS:
            look["emits"] = EMITS[item]
        if item == "glow_frame":
            text = doorway(text, look, d, ents["minecraft:armor_stand"], geos, acts)
            text = put(text, "PROP_LOOKS", item, look)
            continue
        # The prop is the one the name turns on, the last (the target's first two are the plain block in the stand's hand).
        [geo, texs, rules, flags] = layers[-1]
        assert len(layers) == (3 if item == "target" else 1) and len(texs) == 1 and texs[0] in SHEETS, (item, layers)
        assert set(flags) <= {"lit"} and bool(rules) == (item == "pufferfish"), (item, rules, flags)
        name, texture, shape = f"prop_{SAME.get(item, item)}", SHEETS[texs[0]], geos[geo]
        layer = lambda model, tex=texture, hide=(), **more: [model, [tex], list(hide), *([{**own, **more}] if own or more else [])]
        text = put(text, "MOB_MODELS", name, im.model(shape))
        look["layers"] = [layer(name)]
        p = Prop(item, d, anims, {b["name"] for b in shape["bones"]})
        p.geo = shape
        if item == "campfire":
            # The soul campfire's prop is the same, its fire too: the page has the two as one.
            [soul], _, _ = im.look(items["minecraft:soul_campfire"], rcs, mats, anims, "§§", held=True)
            assert soul == layers[-1] and items["minecraft:soul_campfire"]["particle_effects"] == d["particle_effects"]
            rc = rcs[next(n for r in d["render_controllers"] for n, cond in r.items() if cond == "v.eclqlw")]
            sheets = [SHEETS[d["textures"][k.split(".", 1)[1]]] for k in rc["arrays"]["textures"]["Array.ncyhyp"]]
            assert sheets == ["prop_campfire", "prop_campfire_1", "prop_campfire_2", "prop_campfire_3"] and sheets[0] == texture
            look["reach"] = 40  # room for the smoke
            look["variants"] = [{"layers": [layer(name, s)], "emits": OUT if i == 0 else []} for i, s in enumerate(sheets[1:])]
        if item in ("torch", "soul_torch"):
            text = put(text, "MOB_MODELS", "prop_torch_2", im.model(geos[d["geometry"]["pwxfhx"]]))
            assert d["geometry"]["pbyzuw"] == geo
            look["variants"] = [{"layers": [layer("prop_torch_2", buried=1)], "sunk": BRAZIER_SUNK, "ownFit": 1, "emits": [["brazier_sparks" if item == "torch" else "soul_brazier_sparks"]]}]
        if item in ("red_mushroom", "crimson_fungus", "warped_fungus", "brown_mushroom"):
            rc = rcs[f"controller.render.oreville_ans.{item}"]
            arrays = list(rc["arrays"]["geometries"].values())
            keys = [[k.split(".", 1)[1] for k in a] for a in arrays]
            # The straight one first; the diagonal one is the other array's, or the first of two.
            straight, diagonal = ([keys[0], keys[1]] if item == "brown_mushroom" else [[keys[0][1]], [keys[0][0]]])
            assert d["geometry"][straight[0]] == geo
            for k, way, label in ((0, straight, ""), (1, diagonal, "_2")):
                of = geos[d["geometry"][way[0]]]
                kind = f"{item}{label}"
                model = f"prop_{kind}"
                look_ = look if not k else {}
                if item == "brown_mushroom":
                    of, moments_ = mushroom_model(d, geos, way)
                text = put(text, "MOB_MODELS", model, im.model(of))
                hide = [[f"{m}:*", False] for m in dict.fromkeys(moments_)] if item == "brown_mushroom" else []
                look_["layers"] = [layer(model, hide=hide)]
                if item.endswith("mushroom"):
                    q = Prop(item, d, anims, {b["name"] for b in geos[d["geometry"][way[0]]]["bones"]})
                    q.geo = geos[d["geometry"][way[0]]]
                    text = put(text, "PROP_ACTS", kind, mushrooms(q, moments_ if item == "brown_mushroom" else [], bool(k)))
                    look_["anim"] = kind
                elif not k:
                    look_["anim"] = "glows"
                if k:
                    look["variants"] = [{**look_, "ownFit": 1}]
            if item == "brown_mushroom":
                look["emits"] = [["fireflies"]]
        if item == "pufferfish":
            hide = [[b, False] for b in BLOCKS[1:]]
            kinds = [[[f"{BALLOONS}{n}*", n == 2 + pose] for n in range(2, 7)] for pose in range(5)]
            look["layers"] = [layer(name, hide=[*kinds[0], *hide], litBones=LIT_BALLOONS)]
            look["variants"] = [{"layers": [layer(name, hide=[*kinds[i], *([[b, False] for b in BLOCKS])], litBones=LIT_BALLOONS)], "picks": []} for i in range(1, 5)]
            look["picks"] = [BLOCKS]
            look["anim"] = "balloons"
            rest, value = balloons(p)
            look["pose"] = tidied(rest)
            text = put(text, "PROP_ACTS", "balloons", value)
        if item == "pale_oak_trapdoor":
            text = windmill(text, look, d, geos, rcs, anims, layer)
        if item == "spruce_trapdoor":
            # A turn in 14.4 seconds.
            text = put(text, "PROP_ACTS", "water_wheel", {"acts": [], "loops": [turning(WHEEL, 2, 1, 14.4)]})
            look.update({"anim": "water_wheel", "sunk": -CLEAR[item]})
        if item == "spruce_boat":
            poses = {k: p.at(k, [0]) for k in ("utatry", "jfngcm", "cwkaui")}
            rows = []
            for key, moved in poses.items():
                off = [b for b, ch in moved.items() if "s" in ch and not any(ch["s"][0])]
                pose = tidied(first({b: {c: f for c, f in ch.items()} for b, ch in moved.items() if b not in off}))
                rows.append({"layers": [layer(name, hide=[[b, False] for b in off])], **({"pose": flat(pose)} if pose else {}), **({"ownFit": 1} if pose else {})})
            look["variants"] = rows
        if item == "spruce_fence":
            rc = rcs["controller.render.oreville_ans.bmqdfw"]
            keys = [k.split(".", 1)[1] for k in rc["arrays"]["geometries"]["Array.toqyjz"]]
            assert d["geometry"][keys[0]] == geo
            look["variants"] = []
            for i, k in enumerate(keys[1:]):
                text = put(text, "MOB_MODELS", f"{name}_{i + 2}", im.model(geos[d["geometry"][k]]))
                look["variants"].append({"layers": [layer(f"{name}_{i + 2}")], "ownFit": 1})
        if item == "stick":
            ctl = ["yyhewz", "twdrre", "wegdll", "lxaetg", "lsypnt", "octnvz", "mdhmqq", "eadmwl", "kufprk", "eocvkl", "gynhbn"]
            # The pack has one more, orejbj, which is eocvkl again.
            assert tidied(first(p.at("orejbj", [0]))) == tidied(first(p.at("eocvkl", [0])))
            rows = []
            for key in ctl:
                moved = p.at(key, [0])
                off = [b for b, ch in moved.items() if "s" in ch and not any(ch["s"][0])]
                sunk = LOGS_SUNK.get(key, 0)
                rows.append({"layers": [layer(name, hide=[[b, False] for b in off], **({"buried": 1} if sunk else {}))], "pose": tidied(first({b: ch for b, ch in moved.items() if b not in off})),
                             "sunk": sunk, "ownFit": 1})
            look.update(rows[0])
            look["variants"] = rows[1:]
        if item == "target":
            # Its controller plays it as it comes too.
            rock = settled_act(p, "qhvtxw")
            text = put(text, "PROP_ACTS", "target", {"spawn": rock, "acts": [rock]})
            look["anim"] = "target"
        text = put(text, "PROP_LOOKS", item, look)
    text = stale(text)
    if not ia.WRITE:
        return
    for path, key in SHEETS.items():
        assert copy_texture(path, key), path
    im.copy_particles(im.root / "art" / "mobs")
    for old in ("prop_black_bundle", "new_prop_beehive", "new_prop_fishing_rod", "new_prop_fishing_rod_1"):
        (im.root / "art" / "mobs" / f"{old}.png").unlink(missing_ok=True)
    ia.MODELS_JS.write_text(text)


def tidied(pose):
    pose = im.compact({b: {c: [round(x, 4) for x in v] for c, v in ch.items() if v != ZERO[c]} for b, ch in pose.items()})
    return {b: ch for b, ch in pose.items() if ch}


def flat(pose):
    """The tipped cart's back lies flat (a height of nothing, which would hide it: nearly nothing here)."""
    for ch in pose.values():
        if "s" in ch:
            ch["s"] = [v or 0.001 for v in ch["s"]]
    return pose


def turning(bone, axis, way, seconds):
    """A bone going round at a steady speed (one frame for each quarter turn: the stage goes the short way between frames)."""
    return {"length": seconds, "keep": 1, "bones": {bone: {"r": [[way * 60 * i if k == axis else 0 for k in range(3)] for i in range(6)]}}}


def mushroom_model(d, geos, keys):
    """The brown mushroom's entrance as one model: the shape that stays, and a bone for each of the others' ("<key>:<bone>")."""
    shape = geos[d["geometry"][keys[0]]]
    bones = [dict(b) for b in shape["bones"]]
    tops = {b["name"]: b.get("parent") for b in shape["bones"]}
    for k in dict.fromkeys(keys):
        for b in geos[d["geometry"][k]]["bones"]:
            if b.get("cubes"):
                assert b["name"] in tops, (k, b["name"])
                bones.append({"name": f"{k}:{b['name']}", "parent": b["name"], "pivot": b["pivot"], "cubes": b["cubes"], **({"rotation": b["rotation"]} if b.get("rotation") else {})})
    return {**shape, "bones": bones}, keys


def windmill(text, look, d, geos, rcs, anims, layer):
    """Eight poses (idle): two sets of sails, standing or lying flat, turning once in 18 seconds or once a second. The pack moves
    them by how they lie (position)."""
    keys = [k.split(".", 1)[1] for k in rcs["controller.render.oreville_ans.dnverp"]["arrays"]["geometries"]["Array.toqyjz"]]
    for i, k in enumerate(keys):
        text = put(text, "MOB_MODELS", "prop_pale_oak_trapdoor" + ("_2" if i else ""), im.model(geos[d["geometry"][k]]))
    rows = []
    for pose in range(8):
        lying, fast = pose >= 4, pose % 4 >= 2
        kind = f"windmill_{'lying' if lying else 'standing'}_{'fast' if fast else 'slow'}"
        text = put(text, "PROP_ACTS", kind, {"acts": [], "loops": [turning(SAILS, 1 if lying else 2, -1, 1 if fast else 18)]})
        moved = {"p": [0, -7.5 if pose % 2 else -12.5, 0 if lying else -8]}
        rows.append({"layers": [layer("prop_pale_oak_trapdoor" + ("_2" if pose % 2 else ""))], "anim": kind, "pose": {SAILS: {**({"r": [-90, 0, 0]} if lying else {}), **moved}},
                     "sunk": 0 if lying else -CLEAR["small" if pose % 2 else "big"], "low": 16 if lying else 0})
    look.update(rows[0])
    look["variants"] = rows[1:]
    return text


DOOR = "324cjggek5ggjo2q"


def doorway(text, look, d, stand, geos, acts):
    """The glow item frame's doorway (see the top). Its eight poses: it opens as the camera comes near (0 and 1), shuts as it does
    (2 and 3), stays open (4 and 5) or shut (6 and 7), the even ones with a frame round it (kchgjj)."""
    raw = {"frame": d["geometry"]["drsnes"], "chair": d["geometry"]["hxemnm"], "chair_2": d["geometry"]["gosedr"],
           "floor": stand["geometry"]["vbeixn"], "walls": stand["geometry"]["wgcewx"], "ceiling": stand["geometry"]["rlspyf"], "lights": stand["geometry"]["undiyg"]}
    # A stencil: these bones' panels say where the room may show, and where its depth is wiped. The doorway's own is kept.
    masks = {"324cjggekhj6e2kc", "324cjggekj6k6l56hl9", "324cjggekk6l56hl9"}
    opening = "324cjggekhgkle2kc"
    out = {}
    for key, geo in raw.items():
        shape = {**geos[geo], "bones": [b for b in geos[geo]["bones"] if b["name"] not in masks]}
        # The room's textures go on and on (uv_anim's scale): a texel to each unit, round and round.
        if key in ("floor", "walls", "ceiling"):
            shape["description"] = {**shape["description"], "texture_width": 16, "texture_height": 16}
        out[key] = shape
    out["door"] = {**out["walls"], "bones": [b for b in out["walls"]["bones"] if not b.get("cubes") or b["name"] == opening]}
    out["walls"]["bones"] = [b for b in out["walls"]["bones"] if b["name"] != opening]
    # The jamb is an inside-out cube (32 wide, backwards): its faces are the doorway's sides.
    for key, shape in out.items():
        text = put(text, "MOB_MODELS", f"prop_backrooms_{key}" if key != "frame" else "prop_glow_frame", im.model(shape))
    room = [["prop_backrooms_floor", ["prop_backrooms_floor"], [], {"room": 1, "wrap": 1}], ["prop_backrooms_walls", ["prop_backrooms_wall"], [], {"room": 1, "wrap": 1, "insideBones": ["324cjggek32k66"]}],
            ["prop_backrooms_ceiling", ["prop_backrooms_ceiling"], [], {"room": 1, "wrap": 1}], ["prop_backrooms_lights", ["prop_backrooms_light"], [], {"room": 1, "bare": 1}],
            ["prop_backrooms_chair", ["new_prop_glow_frame"], [], {"room": 1}], ["prop_backrooms_chair_2", ["new_prop_glow_frame_1"], [], {"room": 1}]]
    door = ["prop_backrooms_door", ["prop_backrooms_wall"], [], {"portal": 1}]
    frame = ["prop_glow_frame", ["new_prop_glow_frame_2"], []]
    shut = round(1 / 32, 4)
    # As the camera walks from five blocks off to a block and a half (hermite).
    wide = lambda x: 1 / 32 + (1 - 1 / 32) * (3 * x * x - 2 * x ** 3)
    steps = lambda seconds: [i / round(seconds * im.MOTION_FPS) for i in range(round(seconds * im.MOTION_FPS) + 1)]
    move = lambda start, seconds, xs, rest: {"from": start, "to": round(start + seconds, 4), "held": 1, "bones": im.compact({DOOR: {"s": [[round(wide(x) / rest, 3), 1, 1] for x in xs]}}), "show": []}
    walk, stay = 1, 1.5
    whole_ = lambda rest, xs, every=(6, 10): {"every": list(every), "length": round(2 * walk + stay, 4), "parts": [
        {"from": 0, "to": round(2 * walk + stay, 4), "bones": im.compact({DOOR: {"s": [[round(wide(x) / rest, 3), 1, 1] for x in xs]}}), "show": []}]}
    go = steps(walk)
    pause = round(stay * im.MOTION_FPS) - 1
    away = [1 - x for x in go] + [0] * pause + go
    near = go + [1] * pause + [1 - x for x in go]
    opens = {"every": [6, 10], "length": walk, "parts": [{"from": 0, "to": walk, "bones": im.compact({DOOR: {"s": [[round(wide(x), 3), 1, 1] for x in go]}}), "show": []}]}
    shuts = {"every": [6, 10], "length": walk, "parts": [{"from": 0, "to": walk, "bones": im.compact({DOOR: {"s": [[round(wide(1 - x) / shut, 3), 1, 1] for x in go]}}), "show": []}]}
    text = put(text, "PROP_ACTS", "doorway_opens", {"spawn": opens, "acts": [whole_(1, away)]})
    text = put(text, "PROP_ACTS", "doorway_shuts", {"spawn": shuts, "acts": [whole_(shut, near)]})
    rows = []
    for pose in range(8):
        way = pose // 2
        row = {"layers": [*([frame] if pose % 2 == 0 else []), door, *room]}
        row["anim"] = [["doorway_opens", "doorway_shuts"][way] if way < 2 else None][0]
        row["pose"] = {DOOR: {"s": [shut, 1, 1]}} if way in (1, 3) else {}
        rows.append(row)
    look.update(rows[0])
    look["variants"] = rows[1:]
    return text


def stale(text):
    """What the old pack's scripts drew, the plain items' own models, and the fishing rod."""
    text = rows_of(text, "PROP_LOOKS", ["fishing_rod", "soul_campfire"])
    looks = ia.parse_section(text, "PROP_LOOKS")
    used = {layer[0] for look in looks.values() for v in [look, *look.get("variants", [])] for layer in v.get("layers", [])}
    old = [f"new_prop_{i}{k}" for i in [*ITEMS, "fishing_rod"] for k in ("", "_1", "_2")] + ["prop_copper_torch"]
    here = [n for n in old if f'  "{n}": ' in text and n not in used]
    print("stale models", here)
    return rows_of(text, "MOB_MODELS", here)


if __name__ == "__main__":
    main()
