"""Give the panda the updated Actions & Stuff pack's model, animations and variants (one mob ported to the new pack).

    python3 import_panda.py path/to/unpacked/pack path/to/textures

The pack's keys were all renamed, so the panda's old model can't take its new animations: this replaces its two looks
(adult and baby) with the pack's current models, bakes its animations (breathing; now and then a blink, sitting down to
eat bamboo, lying on its back, or rolling over) and copies the skins of its seven kinds (the variants, which share the
model). Its other looks (Freddy, Grizzly) were already the new pack's. Run import_additions.py first. It prints the
skins to put in MOB_VARIANTS (src/mob-data.js).
"""
import json
import re
import shutil
import sys

import import_additions as ia

im = ia.im
VARIANTS = ["normal", "lazy", "worried", "playful", "brown", "weak", "aggressive"]  # the pack's q.variant 0 to 6

# What it does now and then, as import_models.py's STAGE_ACTS has it (keys are the new pack's). The blink shows the closed
# eyelids for the end of the pack's blinking animation; sitting is held, breathing along, while it eats bamboo (shown
# in its paws) twice, and it stands up after; lying and rolling are the pack's own.
# The pack's head-look animation (look_at_target) always plays, turning the head relative to the entity, so the head stays
# level whatever the body does (it looks ahead as it sits up, and turns once, not twice, as it rolls): level_head.
HEAD = "h2f52_head"
ACTS = [
    {"every": [4, 9], "keep": True, "weight": 3, "parts": [("blinking.step", 0, None, [["blink", True]])]},
    {"every": [4, 9], "weight": 2, "level_head": HEAD, "parts": [
        ("sitting", 0, 6, []), ("vnfgiz", 0, 6, []),
        ("mgvrwd", 2.1, 5.6, [["32e3gg", True]]), ("eat", 2.1, 3.8, [["32e3gg", True]]), ("eat", 3.8, 5.5, [["32e3gg", True]]),
        ("standing", 6, None, [])]},
    {"every": [4, 9], "weight": 1, "level_head": HEAD, "parts": [("lying", 0, 5, []), ("rfxeub", 0, 5, []), ("eeejmv", 5, None, [])]},
    {"every": [4, 9], "weight": 1, "level_head": HEAD, "parts": [("rolling", 0, None, []), ("obxsno", 0, None, [])]},
]
MOTIONS = [("oyabwp", 1)]


def renamed(bones):
    return {ia.ren(b): v for b, v in bones.items()}


def main():
    ents, rcs, geos, mats, anims, _p, _a = im.read_pack()
    for g in geos.values():
        ia.rename_geo(g)
    d = ents["minecraft:panda"]
    text = ia.MODELS_JS.read_text()
    current = ia.parse_section(text, "MOB_LOOKS")["panda"]

    geo_keys, tex_keys = {}, {}

    def layers_out(label, layers):
        out = []
        for i, (geo, texs, rules, flags) in enumerate(layers):
            g = geos.get(geo)
            if not g:
                continue
            rules = [[ia.ren(p), on] for p, on in rules]
            part = ia.PREFIX + "_".join(filter(None, ["panda", label, str(i) if i else ""]))
            if not any(im.shown(b["name"], rules) for b in g.get("bones", []) if b.get("cubes")):
                continue
            geo_keys.setdefault(geo, part)
            names = []
            for j, t in enumerate(texs):
                tex_keys.setdefault(t, "_".join(filter(None, [part, str(j) if j else ""])))
                names.append(tex_keys[t])
            out.append([geo_keys[geo], names, rules[1:] if rules[:1] == [["*", True]] else rules] + ([flags] if flags else []))
        return out

    # The layer with the bamboo in its paws only exists while it holds some: build the look as if it did, then hide the bamboo
    # until an act shows it.
    answers = lambda v: {"variant": float(v), "is_item_name_any": lambda slot, *names: 1.0 if "minecraft:bamboo" in names else 0.0}
    base_layers, base_scale, _ = im.look(d, rcs, mats, anims, "", mood=answers(0))
    baby_layers, baby_scale, baby_pose = im.look(d, rcs, mats, anims, "Baby", mood=answers(0))
    adult = layers_out("", base_layers)
    baby = layers_out("baby", baby_layers)
    for layers in (adult, baby):
        for layer in layers:
            layer[2] = [[p, False if p == "32e3gg" else on] for p, on in layer[2]]
    looks = json.loads(json.dumps(current))
    looks[0]["layers"] = adult
    looks[1]["layers"] = baby
    looks[1]["scale"] = round(baby_scale / base_scale, 3)
    if baby_pose:
        looks[1]["pose"] = im.compact({ia.ren(b): p for b, p in baby_pose.items()})

    # The other kinds' skins, beside the plain panda's: new_panda_<kind> and new_panda_<kind>_baby.
    skins = {}
    for v, kind in enumerate(VARIANTS):
        if not v:
            continue
        for baby_look, suffix, layers in ((False, "", adult), (True, "_baby", baby)):
            lay, _, _ = im.look(d, rcs, mats, anims, "Baby" if baby_look else "", mood=answers(v))
            path = lay[0][1][0]
            tex_keys.setdefault(path, f"{ia.PREFIX}panda_{kind}{suffix}")
            skins[f"{ia.PREFIX}panda{'_baby' if baby_look else ''}"] = skins.get(f"{ia.PREFIX}panda{'_baby' if baby_look else ''}", {})
            skins[f"{ia.PREFIX}panda{'_baby' if baby_look else ''}"][kind] = tex_keys[path]

    motion = []
    for key, weight in MOTIONS:
        loop = im.baked_loop(d, anims, key, weight)
        loop["bones"] = renamed(loop["bones"])
        motion.append(loop)
    act = im.baked_act(d, anims, ACTS)
    for a in act:
        for part in a["parts"]:
            part["bones"] = renamed(part["bones"])

    print(f"panda: {len(adult)}+{len(baby)} layers, {len(motion)} loop, {len(act)} acts, {len(tex_keys)} textures")
    print("skins:", json.dumps(skins))
    if not ia.WRITE:
        return

    out = ia.im.root / "art" / "mobs"
    for path, key in sorted(tex_keys.items(), key=lambda kv: kv[1]):
        src = im.texture_file(path)
        if not src:
            print("missing texture", path)
        elif src.suffix == ".tga":
            im.tga_to_png(src, out / f"{key}.png")
        else:
            shutil.copyfile(src, out / f"{key}.png")
    dump = lambda v: json.dumps(v, separators=(",", ":"), ensure_ascii=False)

    def put(text, const, key, value):
        a = text.index(f"const {const} = {{")
        b = text.index("\n};", a)
        lines = [l for l in text[a:b].split("\n") if not l.startswith(f'  "{key}": ')]
        keys = [(i, re.match(r'  "([^"]+)":', l).group(1)) for i, l in enumerate(lines) if re.match(r'  "([^"]+)":', l)]
        at = next((i for i, k in keys if k > key), len(lines))
        lines.insert(at, f"  {dump(key)}: {dump(value)},")
        return text[:a] + "\n".join(lines) + text[b:]

    text = put(text, "MOB_LOOKS", "panda", looks)
    text = put(text, "MOB_MOTIONS", "panda", motion)
    text = put(text, "MOB_ACTS", "panda", act)
    for geo, key in geo_keys.items():
        text = put(text, "MOB_MODELS", key, im.model(geos[geo]))
    ia.MODELS_JS.write_text(text)
    print("wrote")


if __name__ == "__main__":
    main()
