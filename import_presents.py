"""Give the armor stand presents (PROP_LOOKS' bundle and 16 *_bundle) the updated Actions & Stuff pack's models, texture,
animations and glow (see import_port.py).

    python3 import_presents.py path/to/unpacked/pack path/to/textures [--write]

Each is a present with a toy inside (the pack's own list, texts/en_US.lang, says which); the plain bundle is a sack of
coins. All are on textures/oreville/ans/dpg, which import_additions.py already copied as new_prop_bamboo. None has
variants (v.jxykui is 0).

Their controller (pdqpxo) has one animation at rest, pqblez, which scales what's inside to nothing: the toy, the cyan one's
fruit and the plain bundle's open top. Here those bones and all under them are hidden by name. Hitting the stand or
changing its pose plays qhvtxw, the act, which is one animation for all 17, with every toy's bones: the present opens, the
toy pops out and back in. It shows everything, and swaps the sack's shut top for its open one by name (the pack's scales
jump from or to nothing there, which would grow over a frame). The entrance, zgrzww, wags the ribbons.

The glow is on the toys alone (material ktgzhj and texels of alpha 1: the robot's lights, the cat's, golem's and
enderman's eyes, the TNT's fuse), but orange's is on its box: the whole box is alpha 192, and its MER has nothing lit, so
it's left unlit. The sack's inside (gh2im6) has a material that ignores alpha: its clear texels are black.
"""
import import_additions as ia
from import_port import copy_texture, put

im = ia.im

ITEMS = ["bundle"] + [f"{c}_bundle" for c in ["white", "light_gray", "gray", "black", "brown", "red", "orange", "yellow", "lime",
                                              "green", "cyan", "light_blue", "blue", "purple", "magenta", "pink"]]
SHEET, TEXTURE = "textures/oreville/ans/dpg", "new_prop_bamboo"
SHUT, OPEN, SACK_INSIDE = "k24cdahke2dd", "k24cdah3a8", "gh2im6"
# How high the stage makes room for: the toys pop up to 32 to 43, and it has more above for a name tag props don't have.
# (The lid flies to 56, out of the stage for a moment: framed for that, the present would be too small.)
REACH = 38
NOT_LIT = ["orange_bundle"]


def under(geo, tops):
    """The names of those of tops the model has, and of every bone under them."""
    out = []
    for b in geo["bones"]:  # a parent comes before its children
        if b["name"] in tops or b.get("parent") in out:
            out.append(b["name"])
    return out


def swap_times(channel):
    """When the shut top's scale jumps to nothing and back: when the sack is open."""
    jump = lambda side, other: next(float(t) for t, v in channel.items() if isinstance(v, dict) and v[side] == [0, 0, 0] and v[other] != [0, 0, 0])
    return jump("post", "pre"), jump("pre", "post")


def held_past(channel, start, end, inside):
    """A top's scale channel with the size it has at the swaps held on the side where it's hidden: before start and after
    end if it's only there between them (inside), between them if not."""
    side = lambda t, which: channel[t][which] if isinstance(channel[t], dict) else channel[t]
    at = {float(t): t for t in channel}
    first, last = side(at[start], "post" if inside else "pre"), side(at[end], "pre" if inside else "post")
    if inside:
        return {**{t: v for t, v in channel.items() if start < float(t) < end}, at[start]: first, at[end]: last}
    return {**{t: v for t, v in channel.items() if not start <= float(t) <= end}, at[start]: first, at[end]: last}


def main():
    _ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    items = ia.read_props()
    text = ia.MODELS_JS.read_text()
    played, bones = [], set()
    for item in ITEMS:
        d = items[f"minecraft:{item}"]
        [[geo, texs, rules, flags]], _scale, _pose = im.look(d, rcs, mats, anims, "§§", held=True)
        assert texs == [SHEET] and not rules and not (set(flags) - {"lit"}), item
        played.append([d["animations"][k] for k in ("pqblez", "qhvtxw", "zgrzww")])
        bones |= {b["name"] for b in geos[geo]["bones"]}
        if item == "bundle":
            open_top = [[b, False] for b in under(geos[geo], [OPEN])]
        inside = under(geos[geo], anims[d["animations"]["pqblez"]]["bones"])
        flags = {**({"lit": 1} if "lit" in flags and item not in NOT_LIT else {}),
                 **({"opaqueBones": [SACK_INSIDE]} if any(b["name"] == SACK_INSIDE for b in geos[geo]["bones"]) else {})}
        name = f"prop_{item}"
        text = put(text, "MOB_MODELS", name, im.model(geos[geo]))
        # What glows is small: the other halo (bloomOf) is off it, and another from each side.
        even = {"evenBloom": 1} if "lit" in flags else {}
        text = put(text, "PROP_LOOKS", item, {"names": ["§§"], "scale": 1, **even, "anim": "present",
                                              "layers": [[name, [TEXTURE], [[b, False] for b in inside], *([flags] if flags else [])]]})
        print(item, "hides", len(inside), flags)
    assert all(p == played[0] for p in played)
    opening = anims[d["animations"]["qhvtxw"]]
    moves = {b: dict(c) for b, c in opening["bones"].items() if b in bones}
    start, end = swap_times(moves[SHUT]["scale"])
    for top in (SHUT, OPEN):
        moves[top]["scale"] = held_past(moves[top]["scale"], start, end, top == OPEN)
    anims[d["animations"]["qhvtxw"]] = {**opening, "bones": moves}
    length = opening["animation_length"]
    act = im.baked_act(d, anims, {"every": [4, 8], "parts": [("qhvtxw", 0, None, [["*", True]]), (None, 0, start, open_top),
                                                            (None, start, end, [[SHUT, False]]), (None, end, length, open_top)]})
    spawn = im.baked_act(d, anims, {"every": [4, 8], "parts": [("zgrzww", 0, None, [])]})
    value = {"spawn": spawn, "acts": [act], "reach": REACH}
    text = put(text, "PROP_ACTS", "present", value)
    print("the sack is open from", start, "to", end, "of", length, ";", len(im.json.dumps(value)), "characters")
    if not ia.WRITE:
        return
    copy_texture(SHEET, TEXTURE)
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    main()
