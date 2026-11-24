"""Give the armor stand Halloween props (ITEMS below) the updated Actions & Stuff pack's models, textures, animations and
glow (see import_port.py).

    python3 import_halloween.py path/to/unpacked/pack path/to/textures [--write]

All are on textures/oreville/ans/dpg, which import_additions.py already copied as new_prop_bamboo; the tombstone's zombie is
on dqj. None has versions for the stand's poses (v.jxykui is 0). All but the still ones play acts (KINDS), baked as what they
add to the look's pose, as import_christmas.py does. Two only come alive at night in the game (v.nwhdgv for the scarecrow, the
controller's time_of_day for the tombstone): the stage has no night, and the user asked for both as acts.

The glow: texels of alpha 1 that are lit in the MER (dpi), on the bones in LIT (everything else there is alpha 0 or 255), and
panels the pack draws with an additive material (oreville_auulis) where there's no Vibrant Visuals (v.wtlyok): bones 8dgo*,
which go in a model and layer of their own (prop_<item>_glow), drawn as soft light. The pack's scripts size some by how far
round they're seen from (v.habcyx, 1 from the front): GLOW has them as from the front, and the stage fades them round the side.
"""
import fnmatch
import math

import import_additions as ia
from import_christmas import EVERY, FPS, HIT, ZERO, Prop, act, beyond, loop, loop_times, moments, simple_act, tidy, together, whole
from import_port import copy_texture, put

im = ia.im

SHEET, TEXTURE = "textures/oreville/ans/dpg", "new_prop_bamboo"
ZOMBIE_SHEET, ZOMBIE_TEXTURE = "textures/oreville/ans/dqj", "prop_chiseled_stone_bricks"
ITEMS = ["lit_pumpkin", "pumpkin", "sugar", "skeleton_skull", "bone_meal", "chiseled_stone_bricks", "mangrove_door", "pointed_dripstone", "wheat",
         "ender_eye", "trapped_chest", "leaf_litter"]
STILL = ["pumpkin", "skeleton_skull", "bone_meal", "pointed_dripstone"]
# v.tkoeby and v.ufczzf: the way the stand is hit from, as v.vipnxs and v.cdntav are for the other way it rocks.
HIT.update({"v.tkoeby": HIT["v.vipnxs"], "v.ufczzf": HIT["v.cdntav"]})

LID, PUMPKIN, CANDLE = "da5", "hmehcaf", "42f5d6"
SWEETS = "ko66lk"
PUPILS, PANELS = "hmhadk", "8dgo*"
LIT = {"lit_pumpkin": [PUMPKIN, CANDLE, LID], "mangrove_door": ["n2ehaj6head", "d67l6q6", "ja89l6q6"], "pointed_dripstone": ["6d6e6flk"],
       "wheat": [PUPILS], "ender_eye": ["head6f56je2f", PUPILS, "l66l9"]}
# Each panel's width and height as seen from the front, in place of its cube's own (None: its own), and the kind of light: eyes
# fade as the face turns away.
GLOW = {"skeleton_skull": (None, "halo"), "mangrove_door": (None, "eyes"), "pointed_dripstone": ((9, 6), "eyes"), "wheat": ((12, 8), "eyes"),
        "ender_eye": (None, "eyes")}
# What only shows during an act: the jack in the box on its spring, the scarecrow's eyes, the coffin's glow (behind its door)
# and the tombstone's zombie.
JACK = ["khjaf8*", "4j66h6jhead", "b6kl6jhat*"]
ZOMBIE = "*rge3a6"
HIDDEN = {"trapped_chest": JACK, "wheat": [PUPILS]}
GLOW_HIDDEN = ["wheat", "mangrove_door"]
VAMPIRE = ["n2ehaj6*", "ja89l3jgo", "d67l3jgo", "6q6da5*", "d67l6q6", "ja89l6q6"]
# The pupils follow the camera: how far they move for each degree it's round to the side and above (look_at_target, wlqxdl).
GAZE = {"ender_eye": [PUPILS, 0.008, 0.006], "wheat": [PUPILS, 0.02, 0.006]}
# Their particles (src/particles.js), as in import_christmas.py. The flame comes as the pumpkin lands.
EMITS = {"lit_pumpkin": [["pumpkin_flame", 0.25]], "skeleton_skull": [["candle_flame"]]}
EARTH = [[t, e] for t, effects in ((0.0417, ("earth", "dust")), (1.0417, ("crumbs", "dust")), (9.0833, ("earth", "dust")), (15.5417, ("earth", "dust"))) for e in effects]
# How high an act goes, for the stage to be framed to, and how far under its feet what it reaches out looks (an arm, the door).
REACH = {"jack_in_the_box": 42}
LOW = {"coffin": 6.7, "enderman_portrait": 9.4}


def matrix(angles):
    """The stage's turn (src/villager.js): about X, then Y, then Z."""
    (a, b, c) = (math.radians(v) for v in angles)
    ca, sa, cb, sb, cc, sc = math.cos(a), math.sin(a), math.cos(b), math.sin(b), math.cos(c), math.sin(c)
    return [[cc * cb, cc * sb * sa - sc * ca, cc * sb * ca + sc * sa],
            [sc * cb, sc * sb * sa + cc * ca, sc * sb * ca - cc * sa],
            [-sb, cb * sa, cb * ca]]


def times_(m, n):
    return [[sum(m[i][k] * n[k][j] for k in range(3)) for j in range(3)] for i in range(3)]


def angles_of(m):
    return [math.degrees(v) for v in (math.atan2(m[2][1], m[2][2]), math.asin(max(-1, min(1, -m[2][0]))), math.atan2(m[1][0], m[0][0]))]


def level(moves, bone, geo):
    """A bone turned relative to the entity (relative_to), whatever the bones it hangs from do: its own turns with theirs
    taken off."""
    bones = {b["name"]: b for b in geo["bones"]}
    frames = []
    for i, want in enumerate(moves[bone]["r"]):
        up, chain = bones[bone].get("parent"), matrix([0, 0, 0])
        while up:
            turned = moves.get(up, {}).get("r")
            own = turned[i] if turned else [0, 0, 0]
            chain = times_(matrix([a + b for a, b in zip(own, bones[up].get("rotation") or [0, 0, 0])]), chain)
            up = bones[up].get("parent")
        back = [[chain[j][i_] for j in range(3)] for i_ in range(3)]
        frames.append(angles_of(times_(back, matrix(want))))
    # The same turn can be written more than one way: near the last, so that between frames it doesn't spin round.
    for i in range(1, len(frames)):
        (a, b, c), was = frames[i], frames[i - 1]
        best = min(([x + 360 * round((w - x) / 360) for x, w in zip(way, was)] for way in ([a, b, c], [a + 180, 180 - b, c + 180])),
                   key=lambda way: sum((x - w) ** 2 for x, w in zip(way, was)))
        frames[i] = best
    moves[bone]["r"] = frames
    return moves


def segments(moves, length):
    """A long act as held parts: each channel for just the seconds it moves in (import_christmas.py's held_parts, for one
    that doesn't come to rest)."""
    times, parts = moments(length), {}
    for bone, channels in moves.items():
        for ch, frames in channels.items():
            frames = [[round(v, 2) + 0.0 for v in f] for f in frames]
            if all(f == ZERO[ch] for f in frames):
                continue
            a = max(0, next((i for i, f in enumerate(frames) if f != frames[0]), len(frames)) - 1)
            b = min(len(frames) - 1, max((i for i, f in enumerate(frames) if f != frames[-1]), default=0) + 1)
            a, b = min(a, b) // FPS * FPS, min(len(frames) - 1, -(-b // FPS) * FPS)
            parts.setdefault((a, b), {}).setdefault(bone, {})[ch] = frames[a:b + 1]
    return [{"from": round(times[a], 4), "to": round(times[b], 4), "held": 1, "bones": im.compact(bones), "show": []} for (a, b), bones in sorted(parts.items())]


def shows(start, end, names, on):
    return {"from": round(start, 4), "to": round(end, 4), "bones": {}, "show": [[n, on] for n in names]}


def without(moves, channel, *bones):
    for b in bones or list(moves):
        if b in moves:
            moves[b].pop(channel, None)
    return moves


def settled_act(p, key, level_bone=None, **more):
    """An act that starts and ends as the prop rests."""
    length = p.length(key)
    moves = p.at(key, moments(length))
    if level_bone:
        moves = level(moves, level_bone, p.geo)
    for bone, ch in moves.items():
        for c, frames in ch.items():
            assert all(abs(a - b) < 0.02 for a, b in zip(frames[-1], ZERO[c])), (key, bone, c, frames[-1])
    return act([whole(moves, length)], length, **more)


def rocking(p, key, **more):
    """The stand being hit (blend_weight 3)."""
    length = p.length(key)
    return act([whole(p.at(key, moments(length), lambda t: 3), length)], length, ease=0.1, keep=1, **more)


def keyframes(anim, bone, channel="scale"):
    """The moments a bone jumps between nothing and its size: [(time, shown after it)]."""
    out = []
    for t, v in sorted(anim["bones"][bone][channel].items(), key=lambda kv: float(kv[0])):
        post = v["post"] if isinstance(v, dict) else v
        out.append((float(t), all(post)))
    return out


def scarecrow_awake(p, idle, weight):
    """One of its nights: it wakes (yaykcq), sways (uhzitb, blending in and out over a second and a half), does one of its
    idles and falls asleep (ghqxof). The eyes flicker as it wakes and falls asleep."""
    wake, sleep, idles, blend = p.length("yaykcq"), p.length("ghqxof"), p.length(idle), 1.5
    at = wake + 2
    asleep = at + idles + 1.5
    length = round(asleep + blend, 4)
    eased = lambda x: (1 - math.cos(math.pi * min(1, max(0, x)))) / 2
    sway = p.at("uhzitb", moments(length), lambda t: min(eased(t / blend), eased((length - t) / blend)))
    moving = lambda key, start, w=1: whole(without(p.at(key, moments(p.length(key)), lambda t: w), "s"), p.length(key), start=start)
    parts = [whole(sway, length), moving("yaykcq", 0), moving(idle, round(at, 4), weight), moving("ghqxof", round(asleep, 4))]
    # The eyes: shown between the flickers' jumps.
    flicks = [(t, on) for t, on in keyframes(p.anims[p.d["animations"]["yaykcq"]], PUPILS)] + [(asleep + t, on) for t, on in keyframes(p.anims[p.d["animations"]["ghqxof"]], PUPILS)] + [(length, False)]
    for (a, on), (b, _) in zip(flicks, flicks[1:]):
        if on:
            parts.append(shows(a, b, [PUPILS, PANELS], True))
    return act(parts, length, keep=1)


def first(moves):
    return {bone: {ch: frames[0] for ch, frames in channels.items()} for bone, channels in moves.items()}


def kind_of(p):
    """A prop's kind: its name, its rest pose and its PROP_ACTS entry."""
    if p.item == "lit_pumpkin":
        # Thrown down when it's placed; punched, its lid pops up. The candle stays upright.
        return "jack_o_lantern", {}, {"spawn": settled_act(p, "spawn", CANDLE, keep=1), "acts": [settled_act(p, "qhvtxw", CANDLE)]}
    if p.item in ("sugar", "leaf_litter"):
        effect, comes = {"sugar": ("sweets", 0.0833), "leaf_litter": ("leaves", 0.2083)}[p.item]
        spawn = settled_act(p, "spawn", keep=1, puffs=[[comes, effect]])
        if p.item == "sugar":
            # The sweets on the ground appear at once as the bucket lands: hidden by name until then.
            [_, (lands, _), *_] = keyframes(p.anims[p.d["animations"]["spawn"]], SWEETS)
            frames = spawn["parts"][0]["bones"][SWEETS]["s"]
            frames[:] = [f if all(f) else next(g for g in frames if all(g)) for f in frames]
            spawn["parts"].append(shows(0, lands, [b["name"] for b in p.geo["bones"] if SWEETS in (b["name"], b.get("parent"))], False))
        return {"sugar": "candy_bucket", "leaf_litter": "leaf_pile"}[p.item], {}, {"spawn": spawn, "acts": [settled_act(p, "qhvtxw", puffs=[[0, effect]])]}
    if p.item == "mangrove_door":
        # At rest the vampire sleeps behind the door, its arms crossed and its eyes shut (cfhmyv). Woken, the arms stay
        # crossed underneath (wsigqm); it's gone (scaled to nothing) as the door slams shut on it.
        rest = first(p.at("cfhmyv", [0]))
        length = p.length("fiezdn")
        times = moments(length)
        moves = together(p.at("fiezdn", times), p.at("wsigqm", times))
        vampire = p.anims[p.d["animations"]["fiezdn"]]["bones"]["n2ehaj6"]["scale"]
        gone = next(float(t) for t, v in vampire.items() if isinstance(v, dict))
        # The panels face the camera: only their size is kept (both eyes open one after the other), and only while they have one.
        panels = {b: {"s": moves.pop(b)["s"]} for b in list(moves) if fnmatch.fnmatchcase(b, PANELS)}
        woken = whole(beyond(without(moves, "s", "n2ehaj6"), rest, len(times)), length)
        return "coffin", rest, {"acts": [act([woken, whole(panels, length), shows(0, gone, [PANELS], True), shows(gone, length, VAMPIRE, False)], length)]}
    if p.item == "trapped_chest":
        # The crank turns (music plays) till the creeper jumps out.
        length = p.length("nhocpc")
        moves = p.at("nhocpc", moments(length))
        # The springs shrink away as it goes back in: hidden by name at their jumps.
        keys = p.anims[p.d["animations"]["nhocpc"]]["bones"]
        springs = {b: next(float(t) for t, v in keys[b]["scale"].items() if isinstance(v, dict)) for b in ("khjaf8naka3d6", "khjaf8naka3d62")}
        without(moves, "s", *springs)
        parts = [whole(moves, length), shows(0, length, JACK, True), *(shows(t, length, [b], False) for b, t in springs.items())]
        return "jack_in_the_box", {}, {"acts": [act(parts, length)], "loops": [loop(without(p.at("cfhmyv", loop_times(1)), "s"), 1)], "reach": REACH["jack_in_the_box"]}
    if p.item == "ender_eye":
        # Flat in its frame (vvydmx); scared, it climbs out of it (rihqxb, scary_face and xptoxd), looking round at whoever's
        # there by the head's turn (the act's faces: v.tgmzwf, within 45 degrees).
        rest = first(p.at("vvydmx", [0]))
        length = p.length("rihqxb")
        times = moments(length)
        moves = together(*(p.at(key, times) for key in ("rihqxb", "scary_face", "xptoxd")))
        faces = [["head6f56je2f", 45, [[0.7083, 0], [1.25, 1], [1.4583, 1], [1.7917, 0]]]]
        return "enderman_portrait", rest, {"acts": [act([whole(beyond(moves, rest, len(times)), length)], length, faces=faces)]}
    if p.item == "wheat":
        # qofebb's blend_weight is 1.2.
        awake = [{**scarecrow_awake(p, "tculwn", 1), "weight": 2}, {**scarecrow_awake(p, "qofebb", 1.2), "weight": 2}]
        return "scarecrow", {}, {"spawn": rocking(p, "vbjsnf"), "acts": [*awake, rocking(p, "wiggle", puffs=[[0, "straw"]])]}
    if p.item == "chiseled_stone_bricks":
        length = p.length("bkmptz")
        times = moments(length)
        moves = together(p.at("bkmptz", times), p.at("ovyfal", times))
        # What shows when is by name: the arm first, the rest of the zombie later, all of it gone before the end.
        bones = p.anims[p.d["animations"]["bkmptz"]]["bones"]
        rises = {t for b in bones.values() for t, v in b.get("scale", {}).items() if isinstance(v, dict)}
        assert len(rises) == 1
        rise = float(rises.pop())
        gone = next(float(t) for t, v in p.anims[p.d["animations"]["bkmptz"]]["timeline"].items() if v == "v.wnpwuv=1;")
        late = [b for b in bones if "scale" in bones[b]]
        for b in late:
            moves[b].pop("s")
        level(moves, "headrge3a6", p.geo)
        hidden = [x["name"] for x in p.geo["bones"] if any(x["name"] == b or b in up_of(p.geo, x["name"]) for b in late)]
        climb = act([*segments(moves, length), shows(0, gone, [ZOMBIE], True), shows(0, rise, hidden, False)], length, puffs=EARTH)
        return "tombstone", {}, {"spawn": rocking(p, "vbjsnf"), "acts": [{**climb, "weight": 2}, rocking(p, "wiggle")]}


def up_of(geo, name):
    parents = {b["name"]: b.get("parent") for b in geo["bones"]}
    out = []
    while parents.get(name):
        name = parents[name]
        out.append(name)
    return out


def panels_apart(geo, item):
    """A prop's model without its glow panels, and one of just those, as big as they look from the front."""
    is_panel = lambda b: fnmatch.fnmatchcase(b["name"], PANELS)
    body = {**geo, "bones": [b for b in geo["bones"] if not is_panel(b)]}
    size = GLOW[item][0]

    def sized(c):
        if not size:
            return c
        (x, y, z), (w, h, _d) = c["origin"], c["size"]
        return {**c, "origin": [x + (w - size[0]) / 2, y + (h - size[1]) / 2, z], "size": [*size, 0]}

    panels = {**geo, "bones": [{**b, "cubes": [sized(c) for c in b["cubes"]]} if is_panel(b) else {k: v for k, v in b.items() if k != "cubes"} for b in geo["bones"]]}
    return body, panels


def main():
    _ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    items = ia.read_props()
    text = ia.MODELS_JS.read_text()
    for item in ITEMS:
        d = items[f"minecraft:{item}"]
        layers, _scale, _pose = im.look(d, rcs, mats, anims, "§§", held=True)
        [geo, texs, rules, flags] = layers[-1]
        assert texs == [SHEET] and set(flags) <= {"lit"} and bool(flags.get("lit")) == (item in LIT), item
        assert [p for p, on in rules] == ([PANELS] if item in GLOW else []), item
        assert len(layers) == (2 if item == "chiseled_stone_bricks" else 1), item
        shape = geos[geo]
        out = []
        if item == "chiseled_stone_bricks":
            # The zombie, in the ground but for its act.
            zombie = geos[layers[0][0]]
            assert layers[0][1] == [ZOMBIE_SHEET]
            text = put(text, "MOB_MODELS", f"prop_{item}_zombie", im.model(zombie))
            out.append([f"prop_{item}_zombie", [ZOMBIE_TEXTURE], [["*", False]], {"buried": 1}])
            shape_all = {**shape, "bones": [*shape["bones"], *zombie["bones"]]}
        else:
            shape_all = shape
        hide = [[b, False] for b in HIDDEN.get(item, [])]
        lit = [{"litBones": LIT[item]}] if item in LIT else []
        if item in GLOW:
            shape, panels = panels_apart(shape, item)
            text = put(text, "MOB_MODELS", f"prop_{item}_glow", im.model(panels))
        text = put(text, "MOB_MODELS", f"prop_{item}", im.model(shape))
        out.insert(0, [f"prop_{item}", [TEXTURE], hide, *lit])
        if item in GLOW:
            out.append([f"prop_{item}_glow", [TEXTURE], [[PANELS, False]] if item in GLOW_HIDDEN else [], {"glow": 1, "soft": 1, GLOW[item][1]: 1}])
        look = {"names": ["§§"], "scale": 1, "layers": out}
        if item in EMITS:
            look["emits"] = EMITS[item]
        if item in GAZE:
            look["gaze"] = GAZE[item]
        if item not in STILL:
            p = Prop(item, d, anims, {b["name"] for b in shape_all["bones"]})
            p.geo = shape_all
            kind, rest, value = kind_of(p)
            look["anim"] = kind
            if kind in LOW:
                value["low"] = LOW[kind]
            text = put(text, "PROP_ACTS", kind, value)
            rest = im.compact({b: {c: [round(x, 4) for x in v] for c, v in ch.items() if v != ZERO[c]} for b, ch in rest.items()})
            rest = {b: ch for b, ch in rest.items() if ch}
            if rest:
                look["pose"] = rest
            print(item, kind, "rest", rest, ";", len(im.json.dumps(value)), "characters")
        text = put(text, "PROP_LOOKS", item, look)
    # The old tombstone's second model.
    text = "\n".join(l for l in text.split("\n") if not l.startswith('  "prop_chiseled_stone_bricks_1": '))
    if not ia.WRITE:
        return
    copy_texture(SHEET, TEXTURE)
    copy_texture(ZOMBIE_SHEET, ZOMBIE_TEXTURE)
    im.copy_particles(im.root / "art" / "mobs")
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    main()
