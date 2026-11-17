"""Give the slime the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_slime.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, RGB, Snowy and Snowman ones went by the old pack's bones; the
baby one had the new model but nothing moved it). It has no kinds. It comes in three sizes, which the game sets
(q.variant 4, 2 and 1; MOB_SIZES): the pack draws them all with the same models, the small one with skins of its own
(the game gives a small slime 1 health, q.max_health 1), and plays its idle faster the smaller it is.

The pack draws a slime named Baby (or Slimeling, Bloblet) with its plain model at the smallest size, whatever its own
size (its scale script: v.cdrzno?1:q.variant), in the skin of its own size: so its look is a quarter the size of a big
slime, half a medium one's, a small one's own. The game has no babies of it and the pack makes none (v.tocraa=0). The
pack also has a desert-looking model and skin (its geometry yuqprx, texture yuqprx) that it shows only while v.ybhndd is
set, which nothing sets: left out. Its entity is the only one for minecraft:slime. Run import_additions.py first.
"""
import copy
import re

from import_port import ia, im, copy_texture, port, put

# Big, medium and small, as the game sets them, with the health it gives each (a small slime's skins are its own).
SIZES = {"big": {"variant": 4.0, "max_health": 16.0}, "medium": {"variant": 2.0, "max_health": 4.0}, "small": {"variant": 1.0, "max_health": 1.0}}
ZOOMS = {"big": 1, "medium": 0.5, "small": 0.25}

# It stands quivering: its jelly squashes and stretches, the cube inside it sways and bobs with its face, and the
# Snowman's top hat bobs (the pack's idle). The pack plays it faster the smaller the slime (anim_time_update: 1 + 2 over
# its size, kept between 0.35 and 1.25): one and a half times as fast for a big slime, twice for a medium one, 2.25 times
# for a small one. Its eyes would bob too (v.bpolcy), and its mouth sway (v.ybhndd), but the pack sets neither. The pack
# gives it no idles. Its hop is the game moving it; the pack plays its jump and fall only while v.dxqalg is set, which the
# slime's scripts never set, and its landing (its eyes dropping and bouncing back as it lands) is left out, as is its pop
# (which only plays under keys the slime's animations don't have) and its deaths (splitting into smaller slimes).
RATES = {"big": 1.5, "medium": 2, "small": 2.25}


def motions(size):
    return [("idle", 1, RATES[size])]


SETS = {size: {"motions": motions(size), "acts": []} for size in ("medium", "small")}

REMODEL = ["rgb", "snowy", "snowman"]


def label_of(i, look, bi):
    return "" if i == 0 else "baby" if i == bi else (look["names"] or [""])[0].lower().replace(" ", "_")


def sized(mob, sizes, zooms, sets=True):
    """MOB_SIZES: each size's looks, the biggest's as MOB_LOOKS has them. A smaller size's look takes the skins the
    pack gives it at that size (new_<mob>_<size>_...), and plays that size's set; the Baby look is drawn at the
    smallest size whatever the mob's own (so it's as big beside each size as the smallest is)."""
    ents, rcs, _g, mats, anims, _p, _a = im.read_pack()
    d = ents[f"minecraft:{mob}"]
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")[mob]
    bi = next(i for i, l in enumerate(looks) if "Baby" in l["names"])
    names = ["" if i == 0 else "Baby" if i == bi else (l["names"] or [""])[0] for i, l in enumerate(looks)]
    biggest = next(iter(sizes))
    plain = [im.look(d, rcs, mats, anims, n, mood=sizes[biggest])[0] for n in names]
    keys = {}
    for look, lay in zip(looks, plain):
        for layer, (_, texs, _, _) in zip(look["layers"], lay):
            for key, t in zip(layer[1], texs):
                keys.setdefault(t, key)
    out = {}
    for size, said in sizes.items():
        if size == biggest:
            out[size] = {"zoom": zooms[size]}
            continue
        fresh = copy.deepcopy(looks)
        for i, (look, n) in enumerate(zip(fresh, names)):
            lay = im.look(d, rcs, mats, anims, n, mood=said)[0]
            for layer, (_, texs, _, _) in zip(look["layers"], lay):
                for j, t in enumerate(texs):
                    if t not in keys:
                        keys[t] = "_".join(filter(None, [f"{ia.PREFIX}{mob}_{size}", label_of(i, look, bi), str(j) if j else ""]))
                        if ia.WRITE:
                            copy_texture(t, keys[t])
                    layer[1][j] = keys[t]
            if sets:
                look["plays"] = size
        fresh[bi]["scale"] = round(looks[bi]["scale"] * zooms[biggest] / zooms[size], 4)
        out[size] = {"zoom": zooms[size], "looks": fresh}
    if ia.WRITE:
        text = put(text, "MOB_SIZES", mob, out)
        # The sets' acts: a size with no acts has none, not an empty list.
        a = text.index("const MOB_ACTS = {")
        b = text.index("\n};", a)
        text = text[:a] + "\n".join(l for l in text[a:b].split("\n") if not re.match(rf'  "{mob}:[^"]*": \[\],$', l)) + text[b:]
        ia.MODELS_JS.write_text(text)
    return out


if __name__ == "__main__":
    port("slime", variants=[""], acts=[], motions=motions("big"), answers=lambda v: SIZES["big"], remodel=REMODEL, sets=SETS)
    sized("slime", SIZES, ZOOMS)
