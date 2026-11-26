"""The player on the Equipment tab's stage: src/player-models.js and art/mobs/player_*.png, from the unpacked Actions & Stuff
pack (its player, entity/dtr.json: skins, stances, Morphs; its armor and what's held, attachables) and the game's own files.

    python3 import_player.py path/to/unpacked/pack path/to/textures [--write]

What's worn and held are models of their own (GEAR_MODELS), in the space of the bone they hang from, so that they go on
any body (gearModel in src/player.js puts one on a body's skeleton). How the game places an attachable (checked on the
shield, whose handle comes out in the fist, and on the pack's 3D sword, which lies where its flat one does):
- a bone named as one of the wearer's takes its place, its cubes measured from the wearer's pivot (the armor);
- a bone bound to one (binding) hangs from it as from a parent: from its own file parent's pivot, or with none from
  (0, 24, 0), as the game measures a bone with no parent from there;
- a texture mesh is in the game's own axes, y down: its position is from its bone's pivot, and its pixels lie across x
  and z, a pixel thick downward, before it's turned.
"""
import fnmatch
import json
import math
import re
import sys

from PIL import Image

# Read before the importers below, which read the command line for themselves.
WRITE = "--write" in sys.argv

import import_port as ip

im = ip.im
OUT = im.root / "src" / "player-models.js"
ART = im.root / "art" / "mobs"
PLAYER = "minecraft:player"

ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
player = ents[PLAYER]
atts = {}
for top in (im.pack, im.pack / "subpacks" / im.SUBPACK):
    for f in sorted((top / "attachables").glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8")).get("minecraft:attachable", {}).get("description")
        if d:
            atts[d["identifier"]] = d

models, gear_models, worn, textures = {}, {}, {}, {}


# ---------- Bodies ----------
# The game's own player models, wide arms (Steve's) and slim (Alex's): Mojang's bedrock-samples, resource_pack/models/mobs.json
# (geometry.humanoid.custom and geometry.humanoid.customSlim), bones in lower case as the pack's animations have them.
def body_model(arm, arm_top):
    shoulder, item = arm_top, arm_top - 7
    low = arm_top - 10
    def arms(side, uv, sleeve_uv):
        x = 4 if side > 0 else -4 - arm
        name = "left" if side > 0 else "right"
        return [
            {"name": f"{name}arm", "parent": "body", "pivot": [5 * side, shoulder, 0], "cubes": [{"origin": [x, low, -2], "size": [arm, 12, 4], "uv": uv}]},
            {"name": f"{name}sleeve", "parent": f"{name}arm", "pivot": [5 * side, shoulder, 0], "cubes": [{"origin": [x, low, -2], "size": [arm, 12, 4], "uv": sleeve_uv, "inflate": 0.25}]},
            {"name": f"{name}item", "parent": f"{name}arm", "pivot": [6 * side, item, 1]},
        ]
    def legs(side, uv, pants_uv):
        name, x = ("left", -0.1) if side > 0 else ("right", -3.9)
        return [
            {"name": f"{name}leg", "parent": "root", "pivot": [1.9 * side, 12, 0], "cubes": [{"origin": [x, 0, -2], "size": [4, 12, 4], "uv": uv}]},
            {"name": f"{name}pants", "parent": f"{name}leg", "pivot": [1.9 * side, 12, 0], "cubes": [{"origin": [x, 0, -2], "size": [4, 12, 4], "uv": pants_uv, "inflate": 0.25}]},
        ]
    return {"description": {"texture_width": 64, "texture_height": 64}, "bones": [
        {"name": "root", "pivot": [0, 0, 0]},
        {"name": "waist", "parent": "root", "pivot": [0, 12, 0]},
        {"name": "body", "parent": "waist", "pivot": [0, 24, 0], "cubes": [{"origin": [-4, 12, -2], "size": [8, 12, 4], "uv": [16, 16]}]},
        {"name": "jacket", "parent": "body", "pivot": [0, 24, 0], "cubes": [{"origin": [-4, 12, -2], "size": [8, 12, 4], "uv": [16, 32], "inflate": 0.25}]},
        {"name": "head", "parent": "body", "pivot": [0, 24, 0], "cubes": [{"origin": [-4, 24, -4], "size": [8, 8, 8], "uv": [0, 0]}]},
        {"name": "hat", "parent": "head", "pivot": [0, 24, 0], "cubes": [{"origin": [-4, 24, -4], "size": [8, 8, 8], "uv": [32, 0], "inflate": 0.5}]},
        *arms(1, [32, 48], [48, 48]), *arms(-1, [40, 16], [40, 32]),
        *legs(1, [16, 48], [0, 48]), *legs(-1, [0, 16], [0, 32]),
    ]}


BODIES = {"wide": body_model(4, 22), "slim": body_model(3, 21.5)}


def skeleton(g):
    """All of a body's bones, those with nothing to draw too (im.model leaves out the hands: they have no cubes)."""
    bones = g["bones"]
    index = {b["name"]: i for i, b in enumerate(bones)}
    drawn = {b[0]: b[4] for b in im.model(g)[2]}
    return im.compact([64, 64, [[b["name"], index.get(b.get("parent"), -1), b["pivot"], 0, drawn.get(b["name"], [])] for b in bones]])


def copy(path, key):
    """A texture of the pack's (its path) into art/mobs as player_<key>."""
    textures[f"player_{key}"] = Image.open(im.texture_file(path)).convert("RGBA")
    return f"player_{key}"


# ---------- Stances ----------
# How the player stands idle, by what's in its right hand, as the pack's own controllers have it (njvelc, and knoyhk for a
# spear; third person): what plays once as it's taken in hand and is held at its last frame, and what loops. Each animation's
# own way to cancel what comes before it (-this) has nothing to cancel at a standstill. Keys are the player's own.
#   bob: hands empty, or anything not below. mshwsb: ready, with what's a weapon. mtgdcm, ypjqpd: an axe, in both hands, or
#   in one with something in the other. zvagyy: a sword, drawn and lowered. tjnuyj: a mace, taken in both hands. tcucxa: a
#   crossbow. gyjqzs, ztvjhq, cfsugb: a spear, swung round and lowered. shears, uyaebq: shears, in both hands or one. fzimtw:
#   anything else comes into the hand.
STANCES = {
    "empty": ([], ["bob"]),
    "plain": (["fzimtw"], ["bob"]),
    "sword": (["zvagyy"], ["mshwsb"]),
    "axe": (["fzimtw", "mtgdcm"], ["mshwsb"]),
    "axe_off": (["fzimtw", "ypjqpd"], ["mshwsb"]),
    "mace": (["tjnuyj"], ["mshwsb"]),
    "crossbow": (["tcucxa"], ["mshwsb"]),
    "spear": (["gyjqzs", "ztvjhq", "cfsugb"], ["mshwsb"]),
    "shears": (["shears"], ["bob"]),
    "shears_off": (["uyaebq"], ["bob"]),
}
# What a piece of armor does as it's put on (each armor attachable's own): its slot -> the attachables' key.
POPS = {"head": "zeosts", "chest": "lduxzk", "legs": "zvhsej", "feet": "ooxfeb"}


def env_at(t, i=0):
    """What the pack's player scripts come to for a player standing still: i, which Morph (v.tnlxsa)."""
    return im.Env({**im.queries(""), "life_time": t, "anim_time": t, "modified_move_speed": 0.0},
                  v={"tnlxsa": float(i), "wtlyok": 1.0, "jycjqy": "slime" if i in (11, 12) else "default"})


ONCE_FPS = 30


def bones_at(key, times, i=0, only=None, anim=None):
    """An animation of the player's (its key, or itself) at those moments: bone -> {r, p, s} frames (one where it never changes,
    none where it does nothing)."""
    anim = anim or anims[player["animations"][key]]
    weight = anim.get("blend_weight", 1)
    out = {}
    for bone, channels in anim["bones"].items():
        if only and not only(bone):
            continue
        for ch, k in (("rotation", "r"), ("position", "p"), ("scale", "s")):
            if ch not in channels:
                continue
            frames = []
            for t in times:
                vals = im.channel_at(channels[ch], t, env_at(t, i))
                frames.append([round(1 + (v - 1) * weight if k == "s" else v * weight, 2) for v in vals])
            if all(f == frames[0] for f in frames):
                frames = frames[:1]
            if frames != [[1, 1, 1] if k == "s" else [0, 0, 0]]:
                out.setdefault(bone.lower(), {})[k] = frames
    return im.compact(out)


def loops_of(key, i=0, only=None):
    """A looping animation: its formulas' loop, when their so many degrees a second all come round together; one for each speed
    its bones go at, if those only come round together after long (the Pixie's wings)."""
    anim = anims[player["animations"][key]]
    spans = {}
    for bone, channels in anim["bones"].items():
        speeds = [round(float(x) * 10) for x in re.findall(r"(?:anim_time|life_time)\s*\*\s*([\d.]+)", json.dumps(channels))]
        spans[bone] = anim.get("animation_length") or (3600 / math.gcd(*speeds) if speeds else None)
    all_speeds = [round(3600 / s) for s in set(spans.values()) if s]
    together = 3600 / math.gcd(*all_speeds) if all_speeds and not anim.get("animation_length") else anim.get("animation_length") or 1
    if together <= 8:
        spans = {b: together for b in spans}
    out = []
    for span in sorted({s or 1 for s in spans.values()}):
        count = max(1, math.ceil(span * im.MOTION_FPS))
        bones = bones_at(key, [k / count * span for k in range(count)], i, only=lambda b: (spans[b] or 1) == span and (not only or only(b)))
        if bones:
            out.append({"length": round(span, 4), "bones": bones})
    return out


def once_of(anim, only=None):
    """An animation that plays once and is held at its end (at once, one that's all formulas)."""
    length = anim.get("animation_length") or 0
    count = max(2, math.ceil(length * ONCE_FPS) + 1) if length else 1
    return {"length": round(length, 4) or 1, "once": 1, "bones": bones_at(None, [n / max(1, count - 1) * length for n in range(count)], only=only, anim=anim)}


# ---------- Skins ----------
# The pack's Morphs, by v.tnlxsa (its settings' list): their key here, and the pack's keys for their model and texture
# (controller.render.player.third_person's arrays). The pack says which armor each of them hides.
MORPHS = {
    1: ("mini_me", None, None),
    2: ("rana", "ryhgyw", "ryhgyw"),
    3: ("pixie", "yqnbgt", "yqnbgt"),
    4: ("lucy", "tcrhcl", "ktodte"),
    5: ("ash", "czmwel", "czmwel"),
    6: ("iris", "yoprrk", "yoprrk"),
    7: ("bandit", "vnxocp", "vnxocp"),
    9: ("rusty", "rphcxl", "rphcxl"),
    10: ("echo", "xwfqzz", "xwfqzz"),
    11: ("goober", "iiovaj", "iiovaj"),
    12: ("sully", "qgdnim", "qgdnim"),
    13: ("russell", "tzqpds", "gwgcqc"),
}
# What its bones are drawn with: each Morph's own material (the same controller's array), and the ones their names ask for. cut,
# by alpha; lit, its alpha is how much it glows; solid, its alpha ignored; shine, both of those; side, lit but seen from one
# side only; glass, its alpha is how solid it is; glow, light added.
MORPH_MATERIAL = {3: "shine", 5: "lit", 6: "lit", 9: "lit", 10: "lit", 11: "solid", 12: "solid", 13: "lit"}
BONE_MATERIALS = [("*2dh923d6f5fg72f4q*", "glass"), ("*6eakkan6gh2im6fg72f4q*", "shine"), ("*6eakkan6255alan62dh923adaf62j*", "glow"),
                  ("*6eakkan6gf6ka565fg72f4q3adaf62j*", "side"), ("*6eakkan62dh92fg72f4q*", "lit")]
# Four are drawn twice: what glows in them first, from another texture (controller.render.iqisvz), then the rest, for which
# the bones that glow are just cut out.
GLOWING = {5: "cmzejy", 6: "yhfnqg", 9: "htgqaw", 10: "idrvja"}
# Each kind as a layer's flags, and whether it's seen from one side only (a cube of a negative size, inside out, then only
# shows its far walls from within).
KINDS = {"cut": ({}, False), "lit": ({"lit": 1}, False), "shine": ({"lit": 1}, True), "side": ({"lit": 1}, True), "solid": ({"opaqueBones": ["*"]}, True),
         "glass": ({"glassBones": ["*"]}, True), "glow": ({"glow": 1, "soft": 1, "halo": 1, "behind": 1}, False)}
# The flat panels of light round some Morphs, on bones named as the skin's outer layer, which the pack turns to the camera (wlqxdl);
# they stand in the middle of it, so what's in front of that hides them and they light what's round it (behind).
PANELS = ("jacket", "leftsleeve", "rightsleeve")


def material_of(bone, i):
    kind = MORPH_MATERIAL.get(i, "cut")
    for pattern, k in BONE_MATERIALS:
        if fnmatch.fnmatchcase(bone, pattern):
            kind = k
    return "glow" if bone.lower() in PANELS else kind


def morph_layers(key, i, g, texture):
    """A Morph's layers: its model cut up by what its bones are drawn with."""
    out = []
    passes = [(GLOWING[i], lambda k: k), (texture, lambda k: "cut" if k in ("shine", "side", "lit") and k != MORPH_MATERIAL.get(i) else k)] if i in GLOWING else [(texture, lambda k: k)]
    for n, (tex, drawn) in enumerate(passes):
        path = player["textures"][tex]
        name = copy(path, f"{key}{'_lit' if len(passes) > 1 and n == 0 else ''}")
        for kind, (flags, one_sided) in KINDS.items():
            for within in (False, True):
                bones = []
                for b in g["bones"]:
                    cubes = [c for c in b.get("cubes", []) if (min(c["size"]) < 0 and one_sided) == within] if drawn(material_of(b["name"], i)) == kind else []
                    bones.append({**{k: v for k, v in b.items() if k != "cubes"}, **({"cubes": cubes} if cubes else {})})
                if not any(b.get("cubes") for b in bones) or (kind == "glow" and n and len(passes) > 1):
                    continue
                model = "_".join(filter(None, ["player", key, str(n) if n else "", kind if kind != "cut" else "", "in" if within else ""]))
                models[model] = im.model({**g, "bones": bones})
                tex_name = name
                if kind == "shine":
                    # Its alpha is ignored but for the glow, so what's clear shines in full.
                    img = textures[name].copy()
                    img.putalpha(img.getchannel("A").point(lambda v: max(1, v)))
                    tex_name = f"{name}_shine"
                    textures[tex_name] = img
                out.append([model, [tex_name], [], {**flags, **({"insideBones": ["*"]} if within else {"culledBones": ["*"]} if kind in ("glass", "side") else {})}])
    # See-through parts over the rest.
    return sorted(out, key=lambda l: "glassBones" in l[3])


# What plays on one Morph only: loops, and what's held (its place among its arms and hands: pxfdpb, from its settings' line).
MORPH_LOOPS = {3: ["qdyytq"], 4: ["bqvlex"], 5: ["zoqgum"], 6: ["hxygku"], 11: ["prhiys"], 12: ["prhiys"]}
# The bones hidden while something's worn (the same controller's part_visibility): by the slot it's in.
MORPH_HIDES = {2: {"head": ["egjh9hat*", "egjh9ja89lhgfql2ad", "egjh9d67lhgfql2ad", "egjh932f8k", "egjh9ja89l32f8", "egjh9d67l32f8"], "chest": ["egjh9324ch24c"]},
               3: {"head": ["egjh93mf*"]}, 6: {"chest": ["egjh99gg5*"]}, 7: {"head": ["egjh9la6*"], "chest": ["egjh9k24c"]},
               10: {"chest": ["egjh9cape"], "head": ["egjh9d67l9gjf", "egjh9ja89l9gjf"]}}


def morph_settings():
    """Each Morph's line in the player's pre_animation: the armor it hides, and how far its arms, hands and body are from the
    player's."""
    line = next(s for s in player["scripts"]["pre_animation"] if "pntihm" in s)
    out = {}
    for m in re.finditer(r"pntihm','\w+'\)\?\{v\.tnlxsa=(\d+);([^}]*)\}", line):
        vals = dict(re.findall(r"v\.([\w.]+)=(-?[\d.]+)", m.group(2)))
        out[int(m.group(1))] = {k: float(v) for k, v in vals.items()}
    return out


SLOTS = {"helmet": "head", "chestplate": "chest", "leggings": "legs", "boots": "feet"}
PLACED = {"kcpbpp": ("leftarm", "egjh9leftarm"), "bfqoqc": ("rightarm", "egjh9rightarm"), "kucfwk": ("waist", "egjh9waist"),
          "hiwmfu": ("body", "egjh9body"), "bjvukh": ("rightitem",), "loduhj": ("leftitem",)}


def cube_rects(c):
    """The parts of its texture a cube uses: (left, top, right, bottom), in whole texels."""
    if isinstance(c["uv"], dict):
        faces = [(*u["uv"], *u.get("uv_size", [0, 0])) for u in c["uv"].values()]
        return [(math.floor(min(x, x + w)), math.floor(min(y, y + h)), math.ceil(max(x, x + w)), math.ceil(max(y, y + h))) for x, y, w, h in faces]
    (x, y), (w, h, dd) = c["uv"], [math.floor(n + 1e-6) for n in c["size"]]
    return [(math.floor(x), math.floor(y), math.ceil(x + 2 * (dd + w)), math.ceil(y + dd + h))]


def moved_uvs(g, x0, y0, x1, y1):
    """A model (changed in place) for that part of its texture alone."""
    for b in g["bones"]:
        for c in b.get("cubes", []):
            if isinstance(c["uv"], dict):
                for u in c["uv"].values():
                    u["uv"] = [u["uv"][0] - x0, u["uv"][1] - y0]
            else:
                c["uv"] = [c["uv"][0] - x0, c["uv"][1] - y0]
    g["description"].update(texture_width=x1 - x0, texture_height=y1 - y0)


def crop(g, path, key):
    """A model's texture cut down to what the model uses (the pack keeps many on one big sheet), under player_<key>; the model's
    uvs are moved along with it."""
    img = Image.open(im.texture_file(path)).convert("RGBA")
    d = g["description"]
    tw, th = d.get("texture_width", 64), d.get("texture_height", 64)
    kx, ky = img.width / tw, img.height / th
    rects = [r for b in g["bones"] for c in b.get("cubes", []) for r in cube_rects(c)]
    x0, y0 = min(r[0] for r in rects), min(r[1] for r in rects)
    x1, y1 = min(tw, max(r[2] for r in rects)), min(th, max(r[3] for r in rects))
    textures[f"player_{key}"] = img.crop((round(x0 * kx), round(y0 * ky), round(x1 * kx), round(y1 * ky)))
    g = json.loads(json.dumps(g))
    moved_uvs(g, x0, y0, x1, y1)
    return g


# The pack's own skins, in the textures folder's skins (they're in the Marketplace's skin pack, not in the resource pack), by
# their file's name: the name shown and what each is. Its example_skin_N are left out: one figure with each kind of eyes, to make
# skins from.
SKINS = {
    "rana": ("Rana", "frog girl"), "rana_oreville": ("Rana", "in an Oreville shirt"), "sapo": ("Sapo", "frog"), "rhadora": ("Rhadora", "frog"),
    "lucy": ("Lucy", "axolotl"), "cole": ("Cole", "Oreville’s logo"), "endie": ("Endie", "enderman in an Oreville shirt"), "buzz": ("Buzz", "bee"),
    "flint": ("Flint", "miner"), "bufferfish": ("Bufferfish", "pufferfish"), "shelldon": ("Shelldon", "turtle"),
}
# The pack's Expressions: what it draws over the face (its model pfsswq, with the skin's own texture), from parts of the skin the
# game doesn't use. The face without its eyes, the pupils and the brows, each kind of which has its own place (what a skin leaves
# clear isn't drawn), and the lids, which show as it blinks (fyennh: the eyes' handles scaled away for 0.15 seconds, bvlbek) while the
# brows don't. Its eyes also wander, in what the pack plays after standing a while, which isn't here.
FACE = "player_face"
LIDS, BROWS = "3dafc7246*", "6q63jgok*"
BLINK = {"every": [1.25, 4.25], "keep": 1, "length": 0.15, "parts": [{"from": 0, "to": 0.15, "bones": {}, "show": [[LIDS, True], [BROWS, False]]}]}


def has_face(g, texture):
    """Whether a skin's texture has anything for each part of the face: (any, lids)."""
    alpha = textures[texture].getchannel("A")
    drawn = [b["name"].lower() for b in g["bones"] for c in b.get("cubes", []) if any(max(alpha.crop(r).tobytes()) > 127 for r in cube_rects(c))]
    return bool(drawn), any(fnmatch.fnmatchcase(n, LIDS) for n in drawn)


def skins():
    """PLAYER_SKINS: who can stand on the stage, the pack's Steve and Alex (both editions'), then its skins and its Morphs
    (pack: only in Bedrock; morph)."""
    face = geos[player["geometry"]["pfsswq"]]
    models[FACE] = im.model({**face, "bones": [{**b, "name": b["name"].lower()} for b in face["bones"]]})
    out = {
        "steve": {"n": "Steve", "body": "wide", "texture": copy("textures/entity/steve", "steve")},
        "alex": {"n": "Alex", "body": "slim", "texture": copy("textures/entity/alex", "alex")},
    }
    for key, (name, what) in SKINS.items():
        texture = f"player_skin_{key}"
        img = textures[texture] = Image.open(im.textures / "skins" / f"{key}.png").convert("RGBA")
        assert img.size == (64, 64), key
        # Slim arms are 3 wide: what would be the fourth pixel's back is clear.
        out[f"skin_{key}"] = {"n": name, "what": what, "pack": 1, "body": "wide" if max(img.getchannel("A").crop((54, 20, 56, 32)).tobytes()) else "slim", "texture": texture}
    for skin in out.values():
        any_face, lids = has_face(face, skin["texture"])
        if any_face:
            skin["face"] = 1
        if lids:
            skin["acts"] = [BLINK]
    names = {"mini_me": "Mini Me", "rana": "Rana", "pixie": "Pixie", "lucy": "Lucy", "ash": "Ash", "iris": "Iris", "bandit": "Bandit",
             "rusty": "Rusty", "echo": "Echo", "goober": "Goober", "sully": "Sully", "russell": "Russell"}
    # What each is, as the pack's settings list them (texts/en_US.lang).
    what = {"mini_me": "baby player", "rana": "frog girl", "pixie": "allay", "lucy": "axolotl", "ash": "blaze knight", "iris": "ender eye", "bandit": "fox",
            "rusty": "redstone golem", "echo": "sculk whisperer", "goober": "slime", "sully": "sulfur cube", "russell": "bushling"}
    settings = morph_settings()
    for i, (key, geo, tex) in MORPHS.items():
        skin = {"n": names[key], "what": what[key], "pack": 1, "morph": 1}
        mine = settings.get(i, {})
        off = [slot for piece, slot in SLOTS.items() if mine.get(f"oreville_{piece}_armor_layer_hidden")]
        if off:
            skin["off"] = off
        if geo is None:
            # A small player, its head and what's in its hands their usual size (the player's scale, and bxaenm).
            out[key] = {**skin, "body": "wide", "texture": "player_steve", "scale": 0.64,
                        "pose": {b: {"s": [round(1 / 0.6, 4)] * 3} for b in ("head", "rightitem", "leftitem")}}
            continue
        g = geos[player["geometry"][geo]]
        bone_names = {b["name"].lower() for b in g["bones"]}
        mine_only = lambda b: b.lower() in bone_names | {x["name"] for x in BODIES["wide"]["bones"]}
        pose = {}
        for v, bones in PLACED.items():
            at = [mine.get(f"{v}.{a}", 0.0) for a in "xyz"]
            if any(at):
                for b in bones:
                    pose[b] = {"p": at}
        if i in (2, 11, 12):  # kppmnq
            for b in ("leftarm", "rightarm", "egjh9leftarm", "egjh9rightarm"):
                at = pose.setdefault(b, {})
                at["p"] = [a + c for a, c in zip(at.get("p", [0, 0, 0]), [0, 0.1, 0])]
                at["s"] = [0.9, 1, 0.9]
        layers = morph_layers(key, i, g, tex)
        loops = [l for k in MORPH_LOOPS.get(i, []) for l in loops_of(k, i, mine_only)]
        # It blinks: as its own animation has it, or, where the pack only shuts the eyes it draws over the skin's (bvlbek, dpoyzc), by
        # showing the lids it has for that (bones that are shut away otherwise) for as long.
        acts = []
        lids = [b for b in bone_names if b.startswith("3dafc7246")]
        if lids:
            for layer in layers:
                layer[2] += [["3dafc7246*", False]]
            acts.append({"from": 0, "to": 0.15, "bones": {}, "show": [["3dafc7246*", True]]})
        for k in () if lids else ("drqjht", *(["iodvus"] if i == 2 else [])):
            span = anims[player["animations"][k]]["animation_length"]
            count = max(2, math.ceil(span * im.MOTION_FPS * 2) + 1)
            bones = bones_at(k, [n / (count - 1) * span for n in range(count)], i, only=lambda b: b.lower() in bone_names)
            if bones:
                acts.append({"from": 0, "to": round(span, 4), "bones": bones, "show": []})
        entry = {**skin, "layers": layers, "body": "wide"}
        if pose:
            entry["pose"] = im.compact(pose)
        if loops:
            entry["loops"] = loops
        if acts:
            entry["acts"] = [{"every": [3, 6], "keep": 1, "length": max(a["to"] for a in acts), "parts": acts}]
        if i in MORPH_HIDES:
            entry["hides"] = MORPH_HIDES[i]
        out[key] = entry
    return out


# ---------- What's worn and held ----------
def gear_model(key, g, attach, base=None, mesh=None, keep=lambda name: True, draw=lambda name: True):
    """A model of the pack's (g) as one in the space of the bone of the wearer's it hangs from: GEAR_MODELS' [texture width,
    texture height, bones], each [name, its parent (an index here, or the wearer's bone by name), pivot, rotation or 0, cubes].
    attach: a bone's name -> the wearer's it hangs from (the rest hang from their file parents). base: such a bone -> where it's
    measured from. mesh: for a texture mesh, whose pixels gearModel makes cubes of. keep, draw: which bones there are, and which
    of those have their cubes."""
    out, index, origins = [], {}, {}
    for b in g["bones"]:
        name, parent = b["name"].lower(), (b.get("parent") or "").lower()
        if not keep(name) or (name not in attach and parent not in index):
            continue
        hangs = name in attach
        origin = origins[name] = (base or {}).get(name, [0, 0, 0]) if hangs else origins[parent]
        rel = lambda p: [a - o for a, o in zip(p, origin)]
        cubes = []
        for c in im.model({**g, "bones": [{**b, "parent": None}]})[2] if draw(name) else []:
            for cube in c[4]:
                cube = [*rel(cube[:3]), *cube[3:]]
                if len(cube) > 7 and "pivot" in cube[7]:
                    cube[7] = {**cube[7], "pivot": rel(cube[7]["pivot"])}
                cubes.append(cube)
        index[name] = len(out)
        out.append([name, attach[name] if hangs else index[parent], rel(b.get("pivot", [0, 0, 0])), b.get("rotation") if any(b.get("rotation") or []) else 0, cubes])
        for m in b.get("texture_meshes", [])[:1] if mesh else []:
            x, y, z = m["position"]
            out.append([f"{name}_mesh", index[name], [p + o for p, o in zip(rel(b.get("pivot", [0, 0, 0])), (x, -y, z))], m["rotation"], mesh])
    d = g["description"]
    # Without the bones that have nothing to draw under them.
    used = set()
    for i, bone in enumerate(out):
        while bone[4] and not isinstance(i, str) and i not in used:
            used.add(i)
            i = out[i][1]
    at = {old: new for new, old in enumerate(sorted(used))}
    gear_models[key] = im.compact([d.get("texture_width", 64), d.get("texture_height", 64),
                                   [[n, p if isinstance(p, str) else at[p], *rest] for i, (n, p, *rest) in enumerate(out) if i in used]])


# Where the wearer's own pivots are in a model file, for the bones a bound bone's base would be.
NO_PARENT = [0, 24, 0]
ARMOR_BONES = {b: b for b in ("head", "body", "leftarm", "rightarm", "leftleg", "rightleg")}
ARMOR = ("leather", "copper", "chainmail", "iron", "golden", "diamond", "netherite")
# Undyed leather, as the game colors it.
LEATHER = (160, 101, 64)


def leather_texture(path):
    """Leather armor's texture as the game draws it undyed: solid texels take its color, faint ones (alpha 1) keep theirs."""
    img = Image.open(im.texture_file(path)).convert("RGBA")
    img.putdata([(r * LEATHER[0] // 255, g * LEATHER[1] // 255, b * LEATHER[2] // 255, 255) if a > 127 else (r, g, b, 255 if a else 0) for r, g, b, a in img.getdata()])
    return img


def armor():
    sheets = {}
    for mat in ARMOR:
        for piece, slot in SLOTS.items():
            d = atts[f"minecraft:{mat}_{piece}.player"]
            layers, _scale, _pose = im.look(d, rcs, mats, anims, "", held=True)
            geo, texs, rules, _flags = layers[0]
            g = geos[geo]
            key = f"{mat}_{piece}"
            gear_model(key, g, ARMOR_BONES, draw=lambda n: im.shown(n, rules))
            sheets.setdefault(mat, [texs[0], []])[1].append(gear_models[key])
            worn[key] = {"slot": slot, "layers": [[key, f"player_armor_{mat}"]]}
    d = atts["minecraft:turtle_helmet.player"]
    layers, _scale, _pose = im.look(d, rcs, mats, anims, "", held=True)
    gear_model("turtle_shell", geos[layers[0][0]], ARMOR_BONES)
    sheets["turtle"] = [layers[0][1][0], [gear_models["turtle_shell"]]]
    worn["turtle_shell"] = {"slot": "head", "layers": [["turtle_shell", "player_armor_turtle"]]}
    for mat, (path, used) in sheets.items():
        img = leather_texture(path) if mat == "leather" else Image.open(im.texture_file(path)).convert("RGBA")
        box = img.getbbox()
        w, h = math.ceil(box[2] / 16) * 16, math.ceil(box[3] / 16) * 16
        # The sheets are mostly empty: what's used is in the corner (the rest is for the pack's costumes).
        textures[f"player_armor_{mat}"] = img.crop((0, 0, w, h))
        # Leather to be dyed as the page draws it (src/player.js): the pack's sheet as it is, which leather_texture colors brown.
        if mat == "leather":
            textures["player_armor_leather_dye"] = Image.open(im.texture_file(path)).convert("RGBA").crop((0, 0, w, h))
        for m in used:
            assert (m[0], m[1]) == img.size, mat
            m[0], m[1] = w, h
    # The elytra: the game's own model, folded (Java's ElytraModel and the wings' layer: on the body, 2 pixels behind it, each wing
    # turned 15 degrees back and out from the shoulder), with the pack's texture.
    wing = lambda side: [f"{'left' if side > 0 else 'right'}_wing", "body", [5 * side, 0, 2], [15, 0, -15 * side],
                         [[-10 if side > 0 else 0, -20, 0, 10, 20, 2, [22, 0], {"inflate": 1, **({} if side > 0 else {"mirror": 1})}]]]
    bones = []
    for side in (1, -1):
        name, on, pivot, turn, [(x, y, z, *rest)] = wing(side)
        bones.append([name, on, pivot, turn, [[pivot[0] + x, y, z + 2, *rest]]])
    gear_models["elytra"] = [64, 32, bones]
    copy("textures/models/armor/elytra", "elytra")
    worn["elytra"] = {"slot": "chest", "layers": [["elytra", "player_elytra"]]}


# The pack's costumes: leather armor with one of these trims on is drawn as one (its setting, ltqtrn, starts on). All of them are cubes
# of the leather piece's own model, beside the leather's (d62l96j*), and all on its one sheet. The trim's texture is laid over that,
# white at half strength on every costume but its own, which leaves those out (the game drops what's under half); the leather itself is
# left out the same way, by a stencil. A cube that only touches another costume's part of the sheet isn't that one's: the pack's trims
# all leave a few texels of the maid's too (a 3x3 spot on the legs).
COSTUMES = ("bolt", "eye", "host", "rib", "shaper", "silence", "snout", "spire", "tide", "wild")
COSTUME_SHEET = "textures/oreville/ans/cdq"
VISOR = "nakgj"  # the hazmat suit's, the only see-through part (kipfdc)


def costumes():
    sheet = Image.open(im.texture_file(COSTUME_SHEET)).convert("RGBA")
    for trim in COSTUMES:
        mask = Image.open(im.texture_file(f"textures/trims/{trim}")).convert("RGBA").getchannel("A")
        own = sheet.copy()
        own.putalpha(Image.composite(Image.new("L", sheet.size, 0), sheet.getchannel("A"), mask.point(lambda a: 255 if a == 127 else 0)))
        solid, mine = (i.getchannel("A").point(lambda a: 255 if a > 127 else 0) for i in (sheet, own))
        count = lambda img, box: sum(v > 0 for v in img.crop(box).tobytes())
        pieces, boxes = {}, []
        for piece in SLOTS:
            d = atts[f"minecraft:leather_{piece}.player"]
            g = json.loads(json.dumps(geos[im.look(d, rcs, mats, anims, "", held=True)[0][0][0]]))
            assert [g["description"][k] for k in ("texture_width", "texture_height")] == list(sheet.size), piece
            for b in g["bones"]:
                kept = []
                for c in [] if b["name"].startswith("d62l96j") else b.get("cubes", []):
                    rects = cube_rects(c)
                    if sum(count(mine, r) for r in rects) * 2 > sum(count(solid, r) for r in rects):
                        kept.append(c)
                        boxes += rects
                b["cubes"] = kept
            assert any(b["cubes"] for b in g["bones"]), (trim, piece)
            pieces[piece] = g
        x0, y0 = min(r[0] for r in boxes), min(r[1] for r in boxes)
        x1, y1 = min(sheet.width, max(r[2] for r in boxes)), min(sheet.height, max(r[3] for r in boxes))
        textures[f"player_costume_{trim}"] = own.crop((x0, y0, x1, y1))
        for piece, g in pieces.items():
            moved_uvs(g, x0, y0, x1, y1)
            key = f"leather_{piece}_{trim}"
            gear_model(key, g, ARMOR_BONES)
            visor = any(b[0] == VISOR and b[4] for b in gear_models[key][2])
            worn[key] = {"slot": SLOTS[piece], "layers": [[key, f"player_costume_{trim}", *([{"glassBones": [f"*{VISOR}"]}] if visor else [])]]}


# ---------- Trims and dyes ----------
# Armor trims, as the pack draws them (its controller for v.has_trim: oaozfh, and tvjlvq on leather): the trim's texture (trims/<trim>,
# or <trim>_leggings on leggings; laid out on the pack's big armor sheets) on a model of its own (the attachable's ttywjo: mostly the
# armor's, a little off on some; leather's in tvjlvq, as the costumes are off). The texture is in grays, each of the game's key palette taking the color at the same place in the
# trim material's palette (trims/color_palettes; the game's key, trim_palette, is from Mojang's bedrock-samples: it isn't in the pack).
# On armor of its own material the material's _darker palette is used. The pack's palettes are at alpha 7 and its material is
# emissive (avltwh), so its trims glow ("Emissive armour trims!"); copper_darker isn't in the pack, so the game's is used, unlit.
# src/player.js recolors them as it draws, so the textures here are the grays and TRIM_PALETTES the colors. Costumes have no trim drawn.
TRIMS = ("sentry", "dune", "coast", "wild", "ward", "eye", "vex", "tide", "snout", "rib", "spire", "wayfinder", "shaper", "silence", "raiser", "host", "flow", "bolt")
TRIM_KEY = (224, 192, 160, 128, 96, 64, 32, 0)
TRIM_PALETTES = ("amethyst", "copper", "diamond", "diamond_darker", "emerald", "gold", "gold_darker", "iron", "iron_darker", "lapis",
                 "netherite", "netherite_darker", "quartz", "redstone", "resin")
# The game's own (bedrock-samples, resource_pack/textures/trims/color_palettes/copper_darker.png), at full alpha.
COPPER_DARKER = ((123, 65, 53), (107, 54, 40), (89, 42, 25), (76, 36, 22), (64, 30, 17), (54, 25, 15), (41, 20, 12), (27, 14, 8))


def trims():
    models_of, rects = {}, []
    for key in [f"{mat}_{piece}" for mat in ARMOR for piece in SLOTS] + ["turtle_shell"]:
        w = worn[key]
        d = atts["minecraft:turtle_helmet.player" if key == "turtle_shell" else f"minecraft:{key}.player"]
        # Leather's has a second (mocaaj) for when the pack's costumes are off: the other leaves the costumes' trims out, as they're
        # costumes there. The page has costumes only in Bedrock, where a costume is drawn instead, so it's this one (the same for the rest).
        g = geos[d["geometry"]["mocaaj" if key.startswith("leather_") else "ttywjo"]]
        rects += [r for b in g["bones"] for c in b.get("cubes", []) for r in cube_rects(c)]
        gear_model("trim", g, ARMOR_BONES)
        made = gear_models.pop("trim")
        # The same model for several armors is kept once.
        name = next((k for k, m in models_of.items() if m == made), None)
        if not name:
            name = f"trim_{len(models_of)}"
            models_of[name] = made
        w["trim"] = name
    # Every trim model on one texture, cut down to what they use.
    w, h = (math.ceil(max(r[i] for r in rects) / 16) * 16 for i in (2, 3))
    for name, m in models_of.items():
        m[0], m[1] = w, h
        gear_models[name] = m
    keep = lambda p: p if p[3] == 255 and p[:3] in [(v, v, v) for v in TRIM_KEY] else (0, 0, 0, 0)
    for trim in TRIMS:
        for legs in ("", "_leggings"):
            img = Image.open(im.texture_file(f"textures/trims/{trim}{legs}")).convert("RGBA")
            assert img.size == (384, 256), trim
            img = img.crop((0, 0, w, h))
            img.putdata([keep(p) for p in img.getdata()])
            # The leggings' own only where it's another (the shaper's).
            if legs and img.tobytes() == textures[f"player_trim_{trim}"].tobytes():
                continue
            textures[f"player_trim_{trim}{legs}"] = img
    palettes = {}
    for name in TRIM_PALETTES:
        img = Image.open(im.texture_file(f"textures/trims/color_palettes/{name}")).convert("RGBA")
        palettes[name] = ["#%02x%02x%02x%02x" % p for p in img.getdata()]
    palettes["copper_darker"] = ["#%02x%02x%02xff" % p for p in COPPER_DARKER]
    return {"key": list(TRIM_KEY), "palettes": palettes}


def posed(att, keys, slot="main_hand"):
    """The pose the attachable's animations (its own keys) hold its bones in, in third person."""
    d = atts[att]
    out = {}
    for key in keys:
        anim = anims[d["animations"][key]]
        for bone, channels in anim["bones"].items():
            env = im.Env({**im.queries(""), "life_time": 0.0, "anim_time": 0.0}, v={"wtlyok": 1.0, "evlypi": "jhotdc"}, c={"item_slot": slot, "is_first_person": 0.0})
            for ch, k in (("rotation", "r"), ("position", "p"), ("scale", "s")):
                if ch in channels and "relative_to" not in channels:
                    v = [round(x, 3) for x in im.channel_at(channels[ch], 0.0, env)]
                    was = out.setdefault(bone.lower(), {}).get(k)
                    out[bone.lower()][k] = v if was is None else [a * b if k == "s" else a + b for a, b in zip(was, v)]
    return im.compact(out)


TOOLS = ("sword", "axe", "pickaxe", "shovel", "hoe")
TOOL_MATS = ("wooden", "stone", "copper", "iron", "golden", "diamond", "netherite")


def held():
    # Tools and weapons: their flat pictures (the pack's 3D ones are a setting that starts off), the icons the page already has, on
    # one model. A shovel is held another way up than the rest.
    g = geos[atts["minecraft:iron_sword"]["geometry"]["rcvngv"]]
    gear_model("tool", g, {"sword": "rightitem"}, {"sword": [0, 0, 0]}, mesh="sprite", keep=lambda n: n == "sword")
    for kind in TOOLS:
        for mat in TOOL_MATS:
            att = f"minecraft:{mat}_{kind}"
            assert geos[atts[att]["geometry"]["rcvngv"]]["bones"][1]["texture_meshes"][0]["position"] == [-11.31, -11.31, 0.5], att
            worn[f"{mat}_{kind}"] = {"slot": "main", "layers": [["tool", f"art:{mat}_{kind}"]], "stance": {"sword": "sword", "axe": "axe"}.get(kind, "plain"),
                                     "pose": posed(att, ["ahdzzx" if kind == "shovel" else "sclurs"])}
    for mat in TOOL_MATS:
        att = f"minecraft:{mat}_spear"
        g = geos[atts[att]["geometry"]["rcvngv"]]
        if "spear" not in gear_models:
            gear_model("spear", g, {"spear": "rightitem"}, {"spear": [0, 0, 0]}, mesh="sprite", keep=lambda n: n == "spear")
        worn[f"{mat}_spear"] = {"slot": "main", "layers": [["spear", copy(atts[att]["textures"]["rcvngv"], f"spear_{mat}")]], "stance": "spear",
                                "pose": posed(att, ["lftgaq", "inugyd"])}
    g = geos[atts["minecraft:bow"]["geometry"]["default"]]
    gear_model("bow", g, {"item": "rightitem"}, {"item": [0, 0, 0]}, mesh="sprite", keep=lambda n: n in ("item", "3go"))
    worn["bow"] = {"slot": "main", "layers": [["bow", copy(atts["minecraft:bow"]["textures"]["default"], "bow")]], "stance": "plain", "pose": posed("minecraft:bow", ["wield"])}
    g = geos[atts["minecraft:crossbow"]["geometry"]["default"]]
    gear_model("crossbow", g, {"item": "rightitem"}, {"item": NO_PARENT}, mesh="sprite", keep=lambda n: n == "item")
    worn["crossbow"] = {"slot": "main", "layers": [["crossbow", "art:crossbow_standby"]], "stance": "crossbow", "pose": posed("minecraft:crossbow", ["wield_third_person"])}
    # With models of their own. The pack keeps some of these on big sheets.
    for key, att, geo, bone, base, keys, stance, drop in (
        ("mace", "minecraft:mace", "mace", "e246", NO_PARENT, ["position"], "mace", ("khac6k",)),
        ("trident", "minecraft:trident", "default", "pole", NO_PARENT, ["wield"], "plain", ()),
        ("shears", "minecraft:shears", "default", "item", [0, 0, 0], ["third_person", "ulxynq"], "shears", ()),
        ("brush", "minecraft:brush", "default", "item", [0, 0, 0], ["third_person"], "plain", ()),
        ("carrot_on_a_stick", "minecraft:carrot_on_a_stick", "default", "item", [0, 0, 0], ["uthxqh"], "plain", ()),
        ("warped_fungus_on_a_stick", "minecraft:warped_fungus_on_a_stick", "default", "item", [0, 0, 0], ["uthxqh"], "plain", ()),
    ):
        d = atts[att]
        g = geos[d["geometry"][geo]]
        g = {**g, "bones": [b for b in g["bones"] if b["name"].lower() not in drop]}
        path = d["textures"].get(geo) or d["textures"]["default"]
        g = crop(g, path, key)
        gear_model(key, g, {bone: "rightitem"}, {bone: base}, keep=lambda n: n != "root")
        pose = posed(att, keys)
        worn[key] = {"slot": "main", "layers": [[key, f"player_{key}"]], "stance": stance, "pose": pose}
    # The line hangs straight down whatever the rod does: turned back by as much as the rod leans.
    for key in ("carrot_on_a_stick", "warped_fungus_on_a_stick"):
        worn[key]["pose"]["kljaf81"] = {"r": [20, 0, 0]}
    # Flint and steel: one in the hand and the other in the left hand (bound to its arm).
    d = atts["minecraft:flint_and_steel"]
    g = crop(geos[d["geometry"]["default"]], d["textures"]["default"], "flint_and_steel")
    gear_model("flint_and_steel", g, {"al6e1": "rightitem", "al6e2": "leftarm"}, {"al6e1": [0, 0, 0], "al6e2": [0, 0, 0]}, keep=lambda n: n != "root")
    worn["flint_and_steel"] = {"slot": "main", "layers": [["flint_and_steel", "player_flint_and_steel"]], "stance": "plain", "pose": posed("minecraft:flint_and_steel", ["third_person"])}
    # The fishing rod isn't an attachable for a player (the pack's is for others): the game draws its picture itself, as it does any
    # rod, and the pack only moves the hand's bone (chkdiy). Java's own transform of a rod in the hand (item/handheld_rod).
    gear_models["fishing_rod"], size = rod_model()
    worn["fishing_rod"] = {"slot": "main", "layers": [["fishing_rod", "art:fishing_rod"]], "stance": "plain", "pose": {"rod": {"s": [size] * 3}}}
    # The shield: the game's own model (bedrock-samples, models/entity/shield.geo.json), in the left hand.
    shield = {"description": {"texture_width": 64, "texture_height": 64}, "bones": [{"name": "shield", "pivot": [1, 15.5, 3], "cubes": [
        {"origin": [0, 25, 0], "size": [2, 6, 6], "uv": [26, 0]}, {"origin": [-5, 17, -1], "size": [12, 22, 1], "uv": [0, 0]}]}]}
    gear_model("shield", shield, {"shield": "leftitem"}, {"shield": NO_PARENT})
    copy("textures/entity/shield", "shield")
    worn["shield"] = {"slot": "off", "layers": [["shield", "player_shield"]], "pose": posed("minecraft:shield", ["third_person"], "off_hand")}


def rod_model():
    """A rod's picture in the hand, by Java's own numbers: the arm's space, turned and moved as ItemInHandLayer does, then
    item/handheld_rod's thirdperson_righthand, then the picture's middle to the middle. Worked out as one turn and one place."""
    def mul(a, b):
        return [[sum(a[i][k] * b[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    def shift(x, y, z):
        return [[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]]
    def rot(axis, deg):
        c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
        return {"x": [[1, 0, 0, 0], [0, c, -s, 0], [0, s, c, 0], [0, 0, 0, 1]],
                "y": [[c, 0, s, 0], [0, 1, 0, 0], [-s, 0, c, 0], [0, 0, 0, 1]],
                "z": [[c, -s, 0, 0], [s, c, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]}[axis]
    def size(v):
        return [[v, 0, 0, 0], [0, v, 0, 0], [0, 0, v, 0], [0, 0, 0, 1]]
    m = shift(0, 0, 0)
    for step in (rot("x", -90), rot("y", 180), shift(1, 2, -10),
                 shift(0, 4, 2.5), rot("x", 0), rot("y", 90), rot("z", 55), size(0.85), shift(-8, -8, -8)):
        m = mul(m, step)
    # In that space the picture stands across x and y (y up), its pixels 1 each from z 7.5 to 8.5. A mesh's pixels lie across x
    # and z, so many down (the texture's v is z): x = u, y = 16 - v, z = 8.5 - thick.
    to_mesh = [[1, 0, 0, 0], [0, 0, -1, 16], [0, -1, 0, 8.5], [0, 0, 0, 1]]
    m = mul(m, to_mesh)
    s = math.sqrt(sum(m[i][0] ** 2 for i in range(3)))
    r = [[m[i][j] / s for j in range(3)] for i in range(3)]
    # The turn as the renderer's, x then y then z (y down, as the arm's space is).
    ry = math.asin(max(-1, min(1, -r[2][0])))
    rx, rz = math.atan2(r[2][1], r[2][2]), math.atan2(r[1][0], r[0][0])
    at = [m[0][3], -m[1][3], m[2][3]]
    turn = [round(math.degrees(v), 3) for v in (rx, ry, rz)]
    # Hung from the arm's own pivot.
    return im.compact([16, 16, [["rod", "rightarm", at, turn, []], ["rod_mesh", 0, at, 0, "sprite"]]]), round(s, 4)


def main():
    for key, g in BODIES.items():
        models[f"player_{key}"] = skeleton(g)
    people = skins()
    armor()
    costumes()
    trimmed = trims()
    held()
    # Only the bones the bodies and the Morphs have.
    known = {b[0].lower() for m in models.values() for b in m[2]}
    plain_bones = lambda b: b.lower() in known
    pops = {slot: once_of(anims[atts["minecraft:iron_" + {v: k for k, v in SLOTS.items()}[slot] + ".player"]["animations"][key]]) for slot, key in POPS.items()}
    moves = {}
    for hold, loop in STANCES.values():
        moves.update({k: [once_of(anims[player["animations"][k]], plain_bones)] for k in hold if k not in moves})
        moves.update({k: loops_of(k, only=plain_bones) for k in loop if k not in moves})
    stances = {key: [*hold, *loop] for key, (hold, loop) in STANCES.items()}
    js = ["// Generated by import_player.py: the Equipment tab's player, what it wears and holds, and how it stands.",
          f"Object.assign(MOB_MODELS, {ip.dump(models)});",
          f"const PLAYER_SKINS = {ip.dump(people)};",
          f"const PLAYER_MOVES = {ip.dump(moves)};",
          f"const PLAYER_STANCES = {ip.dump(stances)};",
          f"const GEAR_POPS = {ip.dump(pops)};",
          f"const GEAR_MODELS = {ip.dump(gear_models)};",
          f"const GEAR_WORN = {ip.dump(worn)};",
          f"const TRIM_COLORS = {ip.dump(trimmed)};", ""]
    text = "\n".join(js)
    print(f"{OUT.name}: {len(text)} bytes, {len(textures)} textures, {len(worn)} things worn")
    if WRITE:
        OUT.write_text(text)
        for old in ART.glob("player_*.png"):
            old.unlink()
        for name, img in textures.items():
            img.save(ART / f"{name}.png", optimize=True)


if __name__ == "__main__":
    main()
