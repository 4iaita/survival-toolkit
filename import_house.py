"""Give the armor stand "Around the house" props (ITEMS below) the updated Actions & Stuff pack's models, textures,
animations and glow (see import_port.py).

    python3 import_house.py path/to/unpacked/pack path/to/textures [--write]

Most are on textures/oreville/ans/dpg, which import_additions.py already copied as new_prop_bamboo; the others' sheets are in
SHEETS. Four come in versions for the stand's poses (v.jxykui, and v.rczxgr itself for the scoreboard): the drying rack, the
sports nets, the spotlight, the flag and the scoreboard (VARIANTS). The flag also has a design for each dye of the leather
boots the stand wears (v.aroalz): without boots a banner shows nothing, the stand's hand being shrunk away. (With anything
else in its hand the boots are the Stockings, which the tab doesn't have.)

Things that change on their own go in a look's cycles ([seconds each, bones shown one at a time]): the fireplace's fire (its
render controller's geometries, ten a second, there and back) and the scoreboard's screen. The spotlight's beam is a layer of
its own (beam), added to what's behind it: the pack has a bone for each color of the rainbow one, made one here.

How a prop rests, its entrance and its acts: see import_christmas.py. The glow: texels of alpha 1 to 3 that are lit in the MER
(LIT, the bones they're on), and the soft panels round the candles' flames (see import_halloween.py), on bones 8dgo*. The candles' own layers are emissive in the pack but have no such
texel, but for the pupils of the red candelabra's skull.
"""
import fnmatch
import math
import re

import import_additions as ia
from import_christmas import HIT, ZERO, Prop, act, beyond, entrance, fades, first, loop, loop_times, moments, together, whole
from import_halloween import panels_apart, settled_act
from import_halloween import GLOW as PANEL_SIZES
from import_port import copy_texture, put

im = ia.im

SHEET, TEXTURE = "textures/oreville/ans/dpg", "new_prop_bamboo"
ITEMS = ["cake", "furnace", "cartography_table", "lava_bucket", "soul_lantern", "red_candle", "white_candle", "rail", "feather", "carrot_on_a_stick",
         "heartbreak_pottery_sherd", "creeper_head", "bamboo", "rose_bush", "banner", "beehive", "orange_candle", "spyglass", "leather", "web",
         "copper_bulb", "copper_lantern"]
ANS = "textures/oreville/ans/"
SHEETS = {ANS + "dpn": "prop_lava_bucket", ANS + "obr": "new_prop_leather", ANS + "noh": "new_prop_web", ANS + "noz": "new_prop_web_1", ANS + "noa": "new_prop_web_2",
          ANS + "nol": "new_prop_copper_bulb", ANS + "nof": "new_prop_copper_lantern", ANS + "nod": "new_prop_copper_lantern_1", ANS + "npn": "new_prop_banner", SHEET: TEXTURE}
LIT = {"rail": ["lj277a4_da89l"], "feather": ["haddgok"], "furnace": ["dg81jgl2l63", "dg82jgl2l63"], "red_candle": ["6d6e6flk"]}
LIT_WHOLE = ["lava_bucket", "copper_bulb", "copper_lantern"]
# How far under their feet their near corners look, where that's more than the stage has (see import_halloween.py); a list is
# the versions'. And the room for the spotlight's beam.
LOW = {"rail": 10.5, "feather": 11.4, "furnace": 5.1, "web": [None, 10.9, 16.7]}
BEAM_ROOM = 48
# How far into the ground the pack has it, and so shows just what's over it.
# The other halo (bloomOf) spills out past the lava lamp in patches, and is off these small lights, and another from each side.
EVEN = ["lava_bucket", "rail", "feather"]
SUNK = {"heartbreak_pottery_sherd": 5.09}
OPAQUE = ["cartography_table"]  # oreville_sxepuo ignores alpha
GLASS = {"lava_bucket": ["gl96j"], "soul_lantern": ["2dh923d6f5fg72f4q"]}
CULLED = {"soul_lantern": ["2dh923d6f5fg72f4q"]}
PANELS = "8dgo*"
EYES = "8dgo4"  # the red candelabra's skull's: they face one way
for candle in ("cake", "soul_lantern", "red_candle", "white_candle"):
    PANEL_SIZES[candle] = (None, "halo")
EMITS = {"cake": [["cake_flames"]], "soul_lantern": [["soul_flame"]], "red_candle": [["red_flames"]], "white_candle": [["white_flames"]],
         "furnace": [["hearth_flames", 1.5], ["hearth_sparks", 1.5]]}
WHACK = [[0, "confetti_bright"]]
DYES = ["black", "blue", "brown", "cyan", "gray", "green", "light_blue", "light_gray", "lime", "magenta", "orange", "pink", "purple", "red", "white", "yellow"]
DESIGNS = "bcdefghijklmopqr"  # npb to npr, but npn (the poles)
FIRE, FIRE_SECONDS, WITHIN = "fire", 0.1, "within"
SCREENS, DIGIT = [f"k4j66f{i}" for i in range(5)], "k4gj6"
# The scoreboard's segments by pose (v.osauqc and the rest, in its pre_animation line).
TOP, TOP_LEFT, TOP_RIGHT, MIDDLE, LOW_LEFT, LOW_RIGHT, BOTTOM = (DIGIT + s for s in ("lgh", "lghd", "lghj", "ea55d6", "3gllged", "3gllgej", "3gllge"))
BEAM, BEAM_WHITE, BEAM_RAINBOW = "362e", "362efgje2d", "362ej83"


def turned_out(geo):
    """A model with its inside-out cubes (a negative size) in bones of their own, named for insideBones."""
    bones = []
    for b in geo["bones"]:
        odd = [c for c in b.get("cubes", []) if min(c["size"]) < 0]
        bones.append({**b, "cubes": [c for c in b["cubes"] if c not in odd]} if odd else b)
        if odd:
            bones.append({"name": b["name"] + WITHIN, "parent": b["name"], "pivot": b["pivot"], "cubes": odd})
    return {**geo, "bones": bones}


def rows_of(text, const, stale):
    """text without those entries of a table."""
    a = text.index(f"const {const} = {{")
    b = text.index("\n};", a)
    return text[:a] + "\n".join(l for l in text[a:b].split("\n") if not any(l.startswith(f'  "{n}": ') for n in stale)) + text[b:]


def scoreboard_poses(d):
    """The segments lit for each of the stand's poses: {pose: [bones]}."""
    line = next(l for l in d["scripts"]["pre_animation"] if "v.rczxgr==1?" in l)
    bone = {}
    for part in im_rc(d, "ulhjzw")["part_visibility"]:
        [(name, cond)] = part.items()
        if not cond.startswith("v.bakctb"):
            bone[cond] = name
    return {int(n): [bone[v] for v in re.findall(r"(v\.\w+)=1;", body)] for n, body in re.findall(r"v\.rczxgr==(\d+)\?\{([^}]*)\}", line)}


RCS = {}


def im_rc(d, name):
    return RCS[f"controller.render.oreville_ans.{name}"]


def fire_model(d, geos):
    """The fire's five moments as one model, a bone for each, hung from the fireplace's own bone (which the entrance moves)."""
    keys = RCS["controller.render.oreville_ans.pgnmwu"]["arrays"]["geometries"]["Array.epvbkc"]
    names = [k.split(".", 1)[1] for k in keys]
    each = list(dict.fromkeys(names))
    shape = geos[d["geometry"][each[0]]]
    cubed = {b["name"] for k in each for b in geos[d["geometry"][k]]["bones"] if b.get("cubes")}
    assert len(cubed) == 1
    [on] = cubed
    bones = [{k: v for k, v in b.items() if k != "cubes"} for b in shape["bones"]]
    pivot = next(b["pivot"] for b in bones if b["name"] == on)
    for i, k in enumerate(each):
        cubes = next(b["cubes"] for b in geos[d["geometry"][k]]["bones"] if b["name"] == on)
        # The hearth's glowing walls are an inside-out cube.
        for name, some in ((f"{FIRE}{i}", [c for c in cubes if c["size"][0] > 0]), (f"{FIRE}{i}{WITHIN}", [c for c in cubes if c["size"][0] < 0])):
            bones.append({"name": name, "parent": on, "pivot": pivot, "cubes": some})
    return {**shape, "bones": bones}, [f"{FIRE}{each.index(k)}*" for k in names]


def beam_model(geo):
    """The spotlight's beam: one bone in place of the pack's one for each color."""
    keep = [b for b in geo["bones"] if not b.get("cubes") or b["name"] == BEAM_WHITE]
    return {**geo, "bones": keep}


def beam_colors():
    """The beam's colors: the white one's, and the ones the rainbow goes through, from its texture's lower row (the upper one is
    clear: the beam fades away along its length)."""
    from PIL import Image
    tex = Image.open(im.texture_file(ANS + "nod")).convert("RGBA")
    assert tex.size == (9, 2) and all(tex.getpixel((x, 0)) == (0, 0, 0, 0) for x in range(9))
    row = [list(tex.getpixel((x, 1))[:3]) for x in range(9)]
    return row[8], row[:8]


def rocking_wind():
    """The flag's flutter (its pre_animation line, v.sksctc to v.nhyzjn), in a wind that stays the same, and as a loop: its three
    waves go 0.62, 1.05 and 1.87 times as fast, near enough to 3, 5 and 9 times round."""
    length = round(3 * 360 / (20 * 0.62 * 11), 4)
    gust, lag = 0.5, 18
    sizes = (9 + gust * 7, 4 + gust * 3, 2 + gust * 1.5)
    sin = lambda a: math.sin(math.radians(a))
    bones, count = {}, round(length * 10)
    for i, share in enumerate((0.3, 0.5, 0.65, 0.82, 1)):
        frames = []
        for f in range(count):
            t = f / count * 360
            waves = (sin(3 * t - lag * i) * sizes[0], sin(5 * t - lag * 1.6 * i) * sizes[1], sin(9 * t - lag * 0.8 * i) * sizes[2])
            frames.append([0, round(sum(waves) * share, 2), 0])
        bones[f"7d28hgkl7d28fg56{i}"] = {"r": frames}
    return {"length": length, "bones": im.compact(bones)}


def kind_of(p):
    """A prop's kind: its name, its rest pose and its PROP_ACTS entry."""
    if p.item == "furnace":
        rest, spawn = entrance(p, "khxnew")
        return "fireplace", rest, {"spawn": spawn, "acts": []}
    if p.item == "cartography_table":
        wiggle = settled_act(p, "wiggle")
        return "globe", {}, {"spawn": {**wiggle, "keep": 1}, "acts": [wiggle]}
    if p.item == "lava_bucket":
        # The blobs go up and down in 18 seconds, and swell in 4.5.
        pick = lambda moves, ch: {b: {ch: c[ch]} for b, c in moves.items() if ch in c}
        times = lambda length, count: [i / count * length for i in range(count)]
        return "lava_lamp", {}, {"acts": [], "loops": [loop(pick(p.at("bnixud", times(18, 108)), "p"), 18), loop(pick(p.at("bnixud", times(4.5, 45)), "s"), 4.5)]}
    if p.item == "rail":
        # Its loop goes on from the start, under the entrance.
        came, spawn = entrance(p, "yswqxv")
        times = [i / 140 * 14 for i in range(140)]
        goes = p.at("ztihct", times)
        rest = together({b: {c: [v] for c, v in ch.items()} for b, ch in came.items()}, {b: {c: f[:1] for c, f in ch.items()} for b, ch in goes.items()})
        return "toy_train", first(rest), {"spawn": spawn, "acts": [], "loops": [loop(beyond(goes, first(goes), len(times)), 14, keep=True)]}
    if p.item == "carrot_on_a_stick":
        # As import_christmas.py's strider.
        length = p.length("spawn")
        times = moments(length)
        swing, rope = p.at("spawn", times, lambda t: 0.5 * fades(0, 4)(t)), p.at("hkjvxh", times)
        rest = {bone: {ch: frames[-1] for ch, frames in channels.items()} for bone, channels in rope.items()}
        spawn = act([whole(beyond(together(swing, rope), rest, len(times)), length)], length, keep=1)
        hit = p.length("wiggle")
        whack = act([whole(p.at("wiggle", moments(hit), fades(0.25, 3.5)), hit)], hit, ease=0.1, keep=1, puffs=WHACK)
        sway = loop(p.at("idle", loop_times(8 / 3), lambda t: 0.025, 0.25), round(8 / 3, 4), keep=True)
        return "llama_pinata", rest, {"spawn": spawn, "acts": [whack], "loops": [sway]}
    if p.item in ("bamboo", "rose_bush", "beehive", "orange_candle"):
        # Its controller plays it as it comes too.
        rock = settled_act(p, "qhvtxw")
        return {"bamboo": "bamboo_planter", "rose_bush": "rose_planter"}.get(p.item, "rocks"), {}, {"spawn": rock, "acts": [rock]}
    if p.item == "spyglass":
        spin = settled_act(p, "qhvtxw")
        return "telescope", {}, {"spawn": spin, "acts": [spin]}


def main():
    _ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    RCS.update(rcs)
    items = ia.read_props()
    text = ia.MODELS_JS.read_text()
    acts = {}
    for item in ITEMS:
        d = items[f"minecraft:{item}"]
        layers, _scale, _pose = im.look(d, rcs, mats, anims, "§§", held=True)
        look = {"names": ["§§"], "scale": 1}
        if item in EMITS:
            look["emits"] = EMITS[item]
        if item in LOW and item != "web":
            look["low"] = LOW[item]
        if item == "rail":
            look["flat"] = 1  # no shadow: it would be a disc inside the track
        [geo, texs, rules, flags] = layers[-1]
        shape = geos[geo]
        if item == "banner":
            text = banner(text, look, d, geos)
            text = put(text, "PROP_LOOKS", item, look)
            continue
        if item in ("leather", "web"):
            rc = rcs[next(n for r in d["render_controllers"] for n, cond in r.items() if cond == "v.eclqlw")]
            versions = [k.split(".", 1)[1] for k in rc["arrays"]["geometries"]["Array.epvbkc"]]
            looks = []
            for i, key in enumerate(versions):
                name = f"prop_{item}" + (f"_{i + 1}" if i else "")
                text = put(text, "MOB_MODELS", name, im.model(geos[d["geometry"][key]]))
                # The goal's and the court's nets show one side only.
                net = [{"culledBones": ["f6l*"]}] if item == "web" and i else []
                looks.append({"layers": [[name, [SHEETS[d["textures"].get(key, texs[0])]], [], *net]]})
            assert d["geometry"][versions[0]] == geo
            look["layers"] = looks[0]["layers"]
            look["variants"] = [{**l, "ownFit": 1, **({"low": LOW[item][i]} if item in LOW else {})} for i, l in enumerate(looks) if i]
            text = put(text, "PROP_LOOKS", item, look)
            continue
        if item == "copper_lantern":
            text = spotlight(text, look, d, anims, geos, layers)
            text = put(text, "PROP_LOOKS", item, look)
            continue
        assert texs[0] in SHEETS, (item, texs)
        assert [p for p, on in rules] == ([PANELS] if any(fnmatch.fnmatchcase(b["name"], PANELS) for b in shape["bones"]) else []) or item in ("orange_candle", "copper_bulb"), (item, rules)
        hide, out = [], []
        own = {}
        if item in LIT:
            own["litBones"] = LIT[item]
        if item in LIT_WHOLE:
            own["lit"] = 1
        for flag, of in (("glassBones", GLASS), ("culledBones", CULLED)):
            if item in of:
                own[flag] = of[item]
        if item == "lava_bucket":
            shape = turned_out(shape)
            own["insideBones"] = [f"*{WITHIN}"]
        if item in EVEN:
            look["evenBloom"] = 1
        if item in SUNK:
            own["buried"] = 1
            look["sunk"] = SUNK[item]
        if item in OPAQUE:
            own["opaqueBones"] = ["*"]
        if item in ("cake", "soul_lantern", "red_candle", "white_candle"):
            shape, panels = panels_apart(shape, item)
            if item == "soul_lantern":
                # Its panel is a cube round the lamp: the light of one side, held out past the lamp's corners.
                for b in panels["bones"]:
                    for c in b.get("cubes", []):
                        c["size"], c["origin"] = [*c["size"][:2], 0], [*c["origin"][:2], -8.2]
            text = put(text, "MOB_MODELS", f"prop_{item}_glow", im.model(panels))
        if item == "furnace":
            fire, order = fire_model(d, geos)
            text = put(text, "MOB_MODELS", "prop_furnace_fire", im.model(fire))
            out.append(["prop_furnace_fire", [TEXTURE], [[f"{FIRE}*", False], [order[0], True]], {"lit": 1, "insideBones": [f"*{WITHIN}"]}])
            look["cycles"] = [[FIRE_SECONDS, order]]
        if item == "copper_bulb":
            digits = [[b, False] for b in (TOP, TOP_LEFT, TOP_RIGHT, MIDDLE, LOW_LEFT, LOW_RIGHT, BOTTOM)]
            hide = [*([s, i == 0] for i, s in enumerate(SCREENS)), *digits]
            look["cycles"] = [[0.1, SCREENS]]
            shown = scoreboard_poses(d)
            assert sorted(shown) == list(range(1, 13)) and {b for on in shown.values() for b in on} == {b for b, _ in digits}
            look["variants"] = [{"layers": [["prop_copper_bulb", [SHEETS[texs[0]]], [*hide[:5], *([b, b in shown[n]] for b, _ in digits)], own]]} for n in sorted(shown)]
        text = put(text, "MOB_MODELS", f"prop_{item}", im.model(shape))
        out.insert(0, [f"prop_{item}", [SHEETS[texs[0]]], hide, *([own] if own else [])])
        if item in ("cake", "soul_lantern", "red_candle", "white_candle"):
            eyes = [[EYES, False]] if item == "red_candle" else []
            out.append([f"prop_{item}_glow", [TEXTURE], eyes, {"glow": 1, "soft": 1, "halo": 1}])
            if eyes:
                out.append([f"prop_{item}_glow", [TEXTURE], [["*", False], [EYES, True]], {"glow": 1, "soft": 1, "eyes": 1, "flat": 1}])
        look["layers"] = out
        p = Prop(item, d, anims, {b["name"] for b in geos[geo]["bones"]})
        p.geo = geos[geo]
        made = kind_of(p)
        if item in ("feather", "copper_bulb"):
            made = ("glows", {}, {"acts": []})  # only their light
        if made:
            kind, rest, value = made
            assert kind not in acts or acts[kind] == value, (item, kind)
            acts[kind] = value
            look["anim"] = kind
            rest = im.compact({b: {c: [round(x, 4) for x in v] for c, v in ch.items() if v != ZERO[c]} for b, ch in rest.items()})
            rest = {b: ch for b, ch in rest.items() if ch}
            if rest:
                look["pose"] = rest
            print(item, kind, "rest", len(rest), "bones;", len(im.json.dumps(value)), "characters")
        text = put(text, "PROP_LOOKS", item, look)
    for kind, value in acts.items():
        text = put(text, "PROP_ACTS", kind, value)
    text = put(text, "PROP_ACTS", "flag_hung", {"acts": [], "loops": [FLAP]})
    text = put(text, "PROP_ACTS", "flag_flown", {"acts": [], "loops": [rocking_wind()]})
    # What the old pack's scripts also drew, and the plain items' own models.
    stale = [l.split('"')[1] for l in text[text.index("const MOB_MODELS"):].split("\n")[:3000] if l.startswith('  "new_prop_') or l.startswith('  "prop_furnace_')]
    stale = [n for n in stale if n in {f"new_prop_{i}" for i in ITEMS} | {f"new_prop_{i}_{k}" for i in ITEMS for k in range(1, 5)} | {f"prop_furnace_{k}" for k in range(1, 5)}]
    looks = ia.parse_section(text, "PROP_LOOKS")
    used = {layer[0] for look in looks.values() for v in [look, *look.get("variants", [])] for layer in v.get("layers", [])}
    print("stale models", [n for n in stale if n not in used])
    text = rows_of(text, "MOB_MODELS", [n for n in stale if n not in used])
    if not ia.WRITE:
        return
    for path, key in SHEETS.items():
        if key != "new_prop_copper_lantern_1":
            copy_texture(path, key)
    for dye, letter in zip(DYES, DESIGNS):
        copy_texture(f"{ANS}np{letter}", f"new_prop_banner_{dye}")
    im.copy_particles(im.root / "art" / "mobs")
    ia.MODELS_JS.write_text(text)


# The hung flag swings by 2.5 degrees (uhazgl).
FLAP = {"length": 9, "bones": {"32ff6j7d28": {"r": [[round(math.sin(i / 36 * 2 * math.pi) * 2.5, 2), 0, 0] for i in range(36)]}}}


def banner(text, look, d, geos):
    """The flag in its four poses (on a post, hung on a wall, on a flagpole, and the flag alone for one to go on), each in
    the 16 designs."""
    text = put(text, "MOB_MODELS", "prop_banner", im.model(geos[d["geometry"]["pmzuxm"]]))
    text = put(text, "MOB_MODELS", "prop_banner_flag", im.model(geos[d["geometry"]["ibpyhx"]]))
    post, bar, pole = "32ff6jhgkl", "32ff6jhgkl32j", "7d28hgkl"
    clips, cloth, flag = "32ff6j7d283alk", "32ff6j7d28", "7d28hgkl7d28*"
    rows = []
    assert [d["textures"][k] for k in ("gkwdif", "mdlook", "jymrye")] == [ANS + "npb", ANS + "npo", ANS + "npr"]
    for dye in DYES:
        for pose in range(4):
            # The parts of both models by the rules of hdxxwk and tyglmr.
            poles = [["*", False], *([[post, True]] if pose == 0 else []), *([[bar, True]] if pose < 2 else []), *([[pole, True]] if pose == 2 else [])]
            flags = [["*", False], *([[clips, True], [cloth, True]] if pose < 2 else [[flag, True]])]
            layers = [["prop_banner_flag", [f"new_prop_banner_{dye}"], flags]]
            if pose < 3:
                layers.insert(0, ["prop_banner", ["new_prop_banner"], poles, {"opaqueBones": ["*"]}])
            # quqtcv and kirugq.
            moved = {1: {clips: {"p": [0, 0, 10]}, bar: {"p": [0, 0, 10]}}, 2: {"7d28hgkl7d28": {"p": [0, 47.5, 0]}}, 3: {"7d28hgkl7d28": {"p": [0, -12, 0]}}}.get(pose)
            row = {"layers": layers, "anim": "flag_hung" if pose < 2 else "flag_flown", "ownFit": 1, "pose": moved or {}}
            rows.append(row)
    look.update(rows[0])
    look["variants"] = rows[1:]
    return text


def spotlight(text, look, d, anims, geos, layers):
    """The spotlight: which way it's tilted (dkqkhz) and the color of its beam, by pose."""
    [[geo, texs, rules, flags], [beam, beam_texs, _, _]] = layers
    assert (texs, beam_texs) == ([ANS + "nof"], [ANS + "nod"]) and flags == {"lit": 1}, (texs, beam_texs, flags)
    white, rainbow = beam_colors()
    text = put(text, "MOB_MODELS", "prop_copper_lantern", im.model(geos[geo]))
    text = put(text, "MOB_MODELS", "prop_copper_lantern_beam", im.model(beam_model(geos[beam])))
    bones = {b["name"] for b in geos[beam]["bones"]}
    p = Prop("copper_lantern", d, anims, bones)
    HIT["v.ngjrwv"] = "0"  # where in its swing it starts, picked at random
    rows = []
    for pose in range(4):
        key = "noxoal" if pose % 2 else "yiimld"
        tilt = p.at(key, [i / 30 * 6 for i in range(30)])["da89l"]["r"]
        pan = p.at(key, [i / 36 * 7.2 for i in range(36)])["hangl"]["r"]
        middle = [(min(f[0] for f in tilt) + max(f[0] for f in tilt)) / 2, 0, 0]
        kind = "spotlight_low" if pose % 2 else "spotlight_high"
        value = {"acts": [], "loops": [loop({"hangl": {"r": pan}}, 7.2), loop({"da89l": {"r": [[a - b for a, b in zip(f, middle)] for f in tilt]}}, 6)]}
        text = put(text, "PROP_ACTS", kind, value)
        colors = {"colors": [white]} if pose < 2 else {"colors": rainbow, "seconds": 3.75}
        rows.append({"anim": kind, "reach": BEAM_ROOM, "pose": im.compact({"da89l": {"r": middle}}), "layers": [
            ["prop_copper_lantern", ["new_prop_copper_lantern"], [], {"lit": 1}], ["prop_copper_lantern_beam", ["new_prop_copper_lantern"], [], {"beam": colors}]]})
    look.update(rows[0])
    look["variants"] = rows[1:]
    return text


if __name__ == "__main__":
    main()
