"""Give the armor stand Christmas props (PROP_LOOKS' ITEMS below) the updated Actions & Stuff pack's models, textures,
animations and glow (see import_port.py).

    python3 import_christmas.py path/to/unpacked/pack path/to/textures [--write]

All are on textures/oreville/ans/dpg, which import_additions.py already copied as new_prop_bamboo, but the cookie jar (diq).
A stand named §§ shrinks its whole body to nothing (xyblkf scales its waist to 0), so what hangs in its hand never shows: the
plain snowball and the plain diamond shovel, whose layers the pack leaves on, are left out.

None has versions for the stand's poses (v.jxykui is 0), but a candy cane (twisting and weeping vines) has a big one, for a
stand placed diagonally (its render controller's arrays, by q.body_y_rotation): its variant.

How a prop rests is the last frame of its entrance (and, in the big snow globe, the loops' still poses), which goes in the
look's pose; its entrance and acts are baked as what they add to that, so that nothing is posed twice. What each plays is in
KINDS. The idles of the snow globes and the piñata are loops (a kind's loops; keep, one that goes on under its acts).

The glow: the tree's fairy lights, star and topper, the big globe's house windows and golem's eyes, and the gingerbread
house's windows (its light on bone, which the pack shows at night, in place of its light off one) are texels of alpha 1, lit in
the MER. The tree's whole layer is emissive in the pack, but the bee's wings (alpha 204, not lit in the MER) would bloom.
"""
import json
import re

import import_additions as ia
from import_port import copy_texture, put

im = ia.im

SHEET, TEXTURE = "textures/oreville/ans/dpg", "new_prop_bamboo"
JAR_SHEET, JAR_TEXTURE = "textures/oreville/ans/diq", "prop_cookie"
CANES = ["twisting_vines", "weeping_vines"]
STILL = ["mangrove_boat", "cookie", "snow", "snow_layer", "brick_block"]
# Their particles (src/particles.js): what goes on all the time, [effect, seconds in] (the big globe's snow starts twice, with its
# entrance and after 2 seconds), and what bursts out of an act, [seconds in, effect] (the shake's is in both the controller and the
# animation).
EMITS = {"powder_snow_bucket": [["globe_snow", 0.9583], ["globe_snow", 2]], "brick_block": [["smoke"]]}
SHAKE, WHACK = [[0, "globe_flurry"], [0, "globe_flurry"]], [[0, "confetti"]]
FPS = im.MOTION_FPS
EVERY = [4, 8]
# The way the stand is hit from decides which way these rock (v.vipnxs and v.cdntav, or v.tkoeby and v.ufczzf): sideways
# as the stage first shows them.
HIT = {"v.vipnxs": "0.56", "v.cdntav": "0.83"}
RUG, ROLL = [f"jm8{i}" for i in range(1, 8)], "jm87gd565"
GINGERBREAD_MAN = "8af86j3j625e2f*"
LIGHTS_ON, LIGHTS_OFF = "da89lgf", "da89lg77"
LIT = {"spruce_sapling": ["72ajqda89lk*", "lj66lghh6j", "kl2j"], "powder_snow_bucket": ["9gmk6", "hmhadk3"], "cocoa_beans": [LIGHTS_ON]}
RULES = {"spruce_sapling": [[ROLL, False]], "cocoa_beans": [[GINGERBREAD_MAN, False], [LIGHTS_OFF, False]]}
# The glass: alphablend bones (the jar's, the globes' walls and the big one's tint), and those whose materials show one side
# only: the globes' walls face inwards, so only the far ones show, behind what's inside.
WALLS, GLINTS, TINT = "2dh923d6f5fg72f4q3adaf62j", "2dh92l6klfg72f4qgf6ka565", "2dh923d6f5fg72f4q"
GLASS = {"cookie": ["gl96j"], "powder_snow_bucket": [WALLS, TINT], "snowball": [WALLS]}
CULLED = {"powder_snow_bucket": [WALLS, TINT, GLINTS], "snowball": [WALLS, GLINTS]}

# blend_weights: how strong an animation is t seconds in (Math.ease_out_expo is 1 - 2^-10x).
fades = lambda delay, span: lambda t: 2 ** (-10 * min(1, max(0, (t - delay) / span)))
# What an animation does on its own (a still pose, or a moment of it).
ZERO = {"r": [0, 0, 0], "p": [0, 0, 0], "s": [1, 1, 1]}


class Prop:
    def __init__(self, item, d, anims, bones):
        self.item, self.d, self.anims, self.bones = item, d, anims, bones

    def length(self, key):
        return self.anims[self.d["animations"][key]]["animation_length"]

    def at(self, key, times, weight=lambda t: 1, rate=1):
        """An animation's moves at those times, weight(t) times as strong: bone -> {r, p, s}, a list of values each."""
        text = json.dumps(self.anims[self.d["animations"][key]])
        for name, value in HIT.items():
            text = text.replace(name, value)
        anim = json.loads(text)
        anim["bones"] = {b: {c: v for c, v in ch.items() if c != "relative_to"} for b, ch in anim.get("bones", {}).items() if b in self.bones}
        out = {}
        for i, t in enumerate(times):
            for bone, channels in im.baked_bones(self.d, anim, [t * rate]).items():
                for ch, [v] in channels.items():
                    w = weight(t)
                    out.setdefault(bone, {}).setdefault(ch, [ZERO[ch]] * len(times))[i] = [1 + (x - 1) * w if ch == "s" else x * w for x in v]
        return out


def together(*moves):
    """Moves that play at the same time: turns and moves add, scales multiply."""
    out = {}
    for m in moves:
        for bone, channels in m.items():
            for ch, frames in channels.items():
                was = out.setdefault(bone, {}).get(ch)
                out[bone][ch] = frames if was is None else [[a * b if ch == "s" else a + b for a, b in zip(p, q)] for p, q in zip(was, frames)]
    return out


def beyond(moves, rest, count):
    """What moves add to a rest pose (bone -> {r, p, s}): the rest taken off, also for bones the moves leave alone."""
    out = {}
    for bone in {**rest, **moves}:
        for ch in {**rest.get(bone, {}), **moves.get(bone, {})}:
            base = rest.get(bone, {}).get(ch, ZERO[ch])
            frames = moves.get(bone, {}).get(ch, [ZERO[ch]] * count)
            assert ch != "s" or all(base), bone
            out.setdefault(bone, {})[ch] = [[a / b if ch == "s" else a - b for a, b in zip(f, base)] for f in frames]
    return out


def first(moves):
    return {bone: {ch: frames[0] for ch, frames in channels.items()} for bone, channels in moves.items()}


def tidy(moves):
    """Moves as they're stored: rounded, one frame where nothing changes, and nothing that does nothing."""
    out = {}
    for bone, channels in moves.items():
        for ch, frames in channels.items():
            frames = [[round(v, 2) + 0.0 for v in f] for f in frames]
            if any(f != ZERO[ch] for f in frames):
                out.setdefault(bone, {})[ch] = frames[:1] if all(f == frames[0] for f in frames) else frames
    return im.compact(out)


def moments(length):
    count = max(2, round(length * FPS) + 1)
    return [i / (count - 1) * length for i in range(count)]


# A long act's bones mostly move for a moment of it: each is stored for just the seconds it moves in, held at its first
# frame before them (it comes to rest at the end).
def held_parts(moves, length, show):
    times, parts = moments(length), {}
    for bone, channels in moves.items():
        for ch, frames in channels.items():
            frames = [[round(v, 2) + 0.0 for v in f] for f in frames]
            if all(f == ZERO[ch] for f in frames):
                continue
            assert frames[-1] == ZERO[ch], (bone, ch, frames[-1])
            a = next((i for i, f in enumerate(frames) if f != frames[0]), len(frames)) - 1
            b = max(i for i, f in enumerate(frames) if f != ZERO[ch]) + 1
            a, b = a // FPS * FPS, min(len(frames) - 1, -(-b // FPS) * FPS)
            parts.setdefault((a, b), {}).setdefault(bone, {})[ch] = frames[a:b + 1]
    return [{"from": round(times[a], 4), "to": round(times[b], 4), "held": 1, "bones": im.compact(bones), "show": []} for (a, b), bones in sorted(parts.items())] + show


def whole(moves, length, show=(), start=0):
    return {"from": start, "to": round(start + length, 4), "bones": tidy(moves), "show": list(show)}


def act(parts, length, **more):
    return {"every": EVERY, "length": round(length, 4), **more, "parts": parts}


def jumps_in(channel):
    """When a strip the entrance scales up from nothing shows: the keyframe it jumps to full size at."""
    return next(float(t) for t, v in channel["scale"].items() if isinstance(v, dict) and v["pre"] == [0, 0, 0] and v["post"] == [1, 1, 1])


def entrance(p, key):
    """An entrance (a plain animation, which holds its last frame): that frame, and what it adds to it."""
    length = p.length(key)
    times = moments(length)
    moves = p.at(key, times)
    rest = {bone: {ch: frames[-1] for ch, frames in channels.items()} for bone, channels in moves.items()}
    if p.item == "spruce_sapling":
        # The roll is gone by the end and the strips jump in from nothing: shown and hidden by name instead.
        keys = p.anims[p.d["animations"][key]]["bones"]
        rest[ROLL]["s"] = [1, 1, 1]
        gone = next(t for t, f in zip(times, moves[ROLL]["s"]) if t > 0.2 and not all(f))
        moves[ROLL]["s"] = [f if t < gone else [1, 1, 1] for t, f in zip(times, moves[ROLL]["s"])]
        show = [{"from": 0, "to": round(gone, 4), "bones": {}, "show": [[ROLL, True]]}]
        for strip in RUG:
            moves[strip]["s"] = [[1, 1, 1]] * len(times)
            show.append({"from": 0, "to": jumps_in(keys[strip]), "bones": {}, "show": [[strip, False]]})
    else:
        show = []
    return rest, act(held_parts(beyond(moves, rest, len(times)), length, show), length, keep=1)


def simple_act(p, key, **more):
    length = p.length(key)
    return act([whole(p.at(key, moments(length)), length)], length, **more)


def loop(moves, length, keep=False):
    return {"length": length, **({"keep": 1} if keep else {}), "bones": tidy(moves)}


def loop_times(length):
    count = round(length * FPS)
    return [i / count * length for i in range(count)]


def kind_of(p):
    """A prop's kind: its name, its rest pose and its PROP_ACTS entry."""
    if p.item == "spruce_sapling":
        # Its controller (lecmqd) plays wiggle when it's hit, but that has none of the tree's bones.
        rest, spawn = entrance(p, "spawn")
        return "christmas_tree", rest, {"spawn": spawn, "acts": []}
    if p.item in ("spruce_leaves", "sweet_berries"):
        rest, spawn = entrance(p, {"spruce_leaves": "yyhqum", "sweet_berries": "zuyrkf"}[p.item])
        return {"spruce_leaves": "wreath", "sweet_berries": "holly"}[p.item], rest, {"spawn": spawn, "acts": []}
    if p.item == "powder_snow_bucket":
        # At rest: lvhwtp (a still pose), idle and okzyiu (the creeper) loop; shaken, ermejm in place of the first and last.
        came, spawn = entrance(p, "spawn")
        creeper = p.at("okzyiu", loop_times(5))
        still = first(together(p.at("lvhwtp", [0]), {b: {c: f[:1] for c, f in ch.items()} for b, ch in creeper.items()}))
        length = p.length("ermejm")
        times = moments(length)
        shake = act([whole(beyond(p.at("ermejm", times), still, len(times)), length)], length, ease=0.1, puffs=SHAKE)
        rest = first(together({b: {c: [v] for c, v in ch.items()} for b, ch in came.items()}, {b: {c: [v] for c, v in ch.items()} for b, ch in still.items()}))
        return "snow_globe", rest, {"spawn": spawn, "acts": [shake], "loops": [
            loop(p.at("idle", loop_times(1)), 1, keep=True), loop(beyond(creeper, first(creeper), len(loop_times(5))), 5)]}
    if p.item == "snowball":
        rest, spawn = entrance(p, "spawn")
        return "snowball_globe", rest, {"spawn": spawn, "acts": [simple_act(p, "ermejm")], "loops": [loop(p.at("idle", loop_times(2)), 2, keep=True)]}
    if p.item == "cocoa_beans":
        # Three knocks: the door jumps at two, and at the third the gingerbread man steps out (v.kexdrz shows him).
        knock, out = p.length("qhvtxw"), p.length("vzllmt")
        parts, at = [], 0
        for key, length, show in (("qhvtxw", knock, []), ("qhvtxw", knock, []), ("vzllmt", out, [[GINGERBREAD_MAN, True]])):
            parts.append(whole(p.at(key, moments(length)), length, show, at))
            at = round(at + length + 0.25, 4)
        return "gingerbread_house", {}, {"acts": [act(parts, at - 0.25)]}
    if p.item in CANES:
        rest, spawn = entrance(p, "spawn")
        # blend_weight 3.
        length = p.length("wiggle")
        wiggle = act([whole(p.at("wiggle", moments(length), lambda t: 3), length)], length, ease=0.1)
        return "candy_cane", rest, {"spawn": spawn, "acts": [wiggle], "turns": [spawn, spawn]}
    if p.item == "warped_fungus_on_a_stick":
        # The rope comes in (hkjvxh) and it swings (spawn, at half strength and dying away: its blend_weight); idle is at a
        # fortieth, at a quarter of the speed.
        length = p.length("spawn")
        times = moments(length)
        swing, rope = p.at("spawn", times, lambda t: 0.5 * fades(0, 4)(t)), p.at("hkjvxh", times)
        rest = {bone: {ch: frames[-1] for ch, frames in channels.items()} for bone, channels in rope.items()}
        spawn = act([whole(beyond(together(swing, rope), rest, len(times)), length)], length, keep=1)
        hit = p.length("wiggle")
        whack = act([whole(p.at("wiggle", moments(hit), fades(0.25, 3.5)), hit)], hit, ease=0.1, keep=1, puffs=WHACK)
        sway = loop(p.at("idle", loop_times(8 / 3), lambda t: 0.025, 0.25), round(8 / 3, 4), keep=True)
        return "pinata", rest, {"spawn": spawn, "acts": [whack], "loops": [sway]}
    if p.item == "diamond_shovel":
        rest, spawn = entrance(p, "spawn")
        return "snow_shovel", rest, {"spawn": spawn, "acts": [simple_act(p, "qhvtxw")]}


def main():
    _ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    items = ia.read_props()
    text = ia.MODELS_JS.read_text()
    acts = {}
    for item in ["spruce_sapling", "spruce_leaves", "powder_snow_bucket", "cocoa_beans", *CANES, "sweet_berries", "warped_fungus_on_a_stick",
                 "snowball", "diamond_shovel", *STILL]:
        d = items[f"minecraft:{item}"]
        layers, _scale, _pose = im.look(d, rcs, mats, anims, "§§", held=True)
        # The prop is the one the name turns on, the last; the rest is the plain item in the stand's shrunken hand.
        [geo, texs, rules, flags] = layers[-1]
        assert len(layers) == 1 or item in ("snowball", "diamond_shovel"), item
        texture = JAR_TEXTURE if item == "cookie" else TEXTURE
        assert texs == [JAR_SHEET if item == "cookie" else SHEET] and set(flags) <= {"lit", "litBones"}, item
        assert [p for p, on in rules if not on] == ([GINGERBREAD_MAN, LIGHTS_ON] if item == "cocoa_beans" else []), item
        flags = {flag: of[item] for flag, of in (("litBones", LIT), ("glassBones", GLASS), ("culledBones", CULLED)) if item in of}
        bones = {b["name"] for b in geos[geo]["bones"]}
        text = put(text, "MOB_MODELS", f"prop_{item}", im.model(geos[geo]))
        look = {"names": ["§§"], "scale": 1}
        if item in EMITS:
            look["emits"] = EMITS[item]
        if item == "brick_block":
            look["reach"] = 52  # room for its smoke
        if item in LIT:
            look["evenBloom"] = 1  # small lights: the other halo is off them, and another from each side
        if item not in STILL:
            kind, rest, value = kind_of(Prop(item, d, anims, bones))
            # The same animation bakes the same for both canes.
            assert kind not in acts or acts[kind] == value, item
            acts[kind] = value
            look["anim"] = kind
            rest = im.compact({b: {c: [round(x, 4) for x in v] for c, v in ch.items() if v != ZERO[c]} for b, ch in rest.items()})
            rest = {b: ch for b, ch in rest.items() if ch}
            print(item, kind, "rest", rest if len(rest) < 4 else len(rest), "bones;", len(im.json.dumps(value)), "characters")
        layer = [f"prop_{item}", [texture], RULES.get(item, []), *([flags] if flags else [])]
        look["layers"] = [layer]
        if item not in STILL and rest:
            look["pose"] = rest
        if item in CANES:
            big = d["geometry"]["gyauwa"]
            assert geo == d["geometry"]["butskk"] and d["textures"]["gyauwa"] == SHEET and bones == {b["name"] for b in geos[big]["bones"]}
            text = put(text, "MOB_MODELS", f"prop_{item}_2", im.model(geos[big]))
            look["variants"] = [{"layers": [[f"prop_{item}_2", [TEXTURE], []]], "ownFit": 1}]
        text = put(text, "PROP_LOOKS", item, look)
    for kind, value in acts.items():
        text = put(text, "PROP_ACTS", kind, value)
    # What the old pack's scripts also drew.
    stale = ("prop_snowball_1", "prop_diamond_shovel_1")
    text = "\n".join(l for l in text.split("\n") if not l.startswith(tuple(f'  "{n}": ' for n in stale)))
    if not ia.WRITE:
        return
    copy_texture(SHEET, TEXTURE)
    copy_texture(JAR_SHEET, JAR_TEXTURE)
    im.copy_particles(im.root / "art" / "mobs")
    (im.root / "art" / "mobs" / "prop_snowball.png").unlink(missing_ok=True)
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    main()
