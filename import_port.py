"""Port one mob to the updated Actions & Stuff pack: its plain and baby looks get the pack's current models, its
animations are baked, and the skins of its kinds (q.variant) are copied. Used by import_panda.py and import_mooshroom.py,
which say what's particular to their mob; run those, not this.

The pack's keys were all renamed, so a mob's old model can't take its new animations: this replaces its first two looks
(adult and baby) with the pack's current models. Its other looks (named ones) were already the new pack's (see
import_additions.py, run first). It prints the skins to put in MOB_VARIANTS (src/mob-data.js).
"""
import json
import re
import shutil

import import_additions as ia

im = ia.im


def renamed(bones):
    return {ia.ren(b): v for b, v in bones.items()}


def port(mob, *, variants, acts, motions, answers=lambda v: {"variant": float(v)}, hidden=(), fix=None, named=(), remodel=()):
    """variants: the mob's kinds by q.variant (the first is the plain one); acts and motions as import_models.py's
    STAGE_ACTS and its loops (keys are the new pack's); answers(v): what the game says for kind v; hidden: parts that
    only show while an act shows them (the panda's bamboo); fix(d): mends the entity before it's read (a texture the
    pack forgot); named: the first names of named looks to refresh too (see below); remodel: those of them that take the
    pack's current models too (the bat's vampire), as the plain looks do. A motion can say how fast it plays (a third
    item, its speed)."""
    ents, rcs, geos, mats, anims, _p, _a = im.read_pack()
    for g in geos.values():
        ia.rename_geo(g)
    d = ents[f"minecraft:{mob}"]
    if fix:
        fix(d)
    text = ia.MODELS_JS.read_text()
    current = ia.parse_section(text, "MOB_LOOKS")[mob]

    geo_keys, tex_keys = {}, {}

    def layers_out(label, layers):
        out = []
        for i, (geo, texs, rules, flags) in enumerate(layers):
            g = geos.get(geo)
            if not g:
                continue
            rules = [[ia.ren(p), on] for p, on in rules]
            part = ia.PREFIX + "_".join(filter(None, [mob, label, str(i) if i else ""]))
            if not any(im.shown(b["name"], rules) for b in g.get("bones", []) if b.get("cubes")):
                continue
            geo_keys.setdefault(geo, part)
            names = []
            for j, t in enumerate(texs):
                tex_keys.setdefault(t, "_".join(filter(None, [part, str(j) if j else ""])))
                names.append(tex_keys[t])
            im.glow_panels(g, rules, flags)
            rules = [[p, False if p in hidden else on] for p, on in rules]
            out.append([geo_keys[geo], names, rules[1:] if rules[:1] == [["*", True]] else rules] + ([flags] if flags else []))
        return out

    base_layers, base_scale, _ = im.look(d, rcs, mats, anims, "", mood=answers(0))
    baby_layers, baby_scale, baby_pose = im.look(d, rcs, mats, anims, "Baby", mood=answers(0))
    adult = layers_out("", base_layers)
    baby = layers_out("baby", baby_layers)
    looks = json.loads(json.dumps(current))
    # The baby look: the one named Baby (usually the second).
    bi = next((i for i, l in enumerate(looks) if "Baby" in l["names"]), 1)
    looks[0]["layers"] = adult
    looks[bi]["layers"] = baby
    looks[bi]["scale"] = round(baby_scale / base_scale, 3)
    if baby_pose:
        looks[bi]["pose"] = im.compact({ia.ren(b): p for b, p in baby_pose.items()})
    else:
        looks[bi].pop("pose", None)

    # The other kinds' skins, in place of the plain one's, layer by layer: new_<mob>_<kind>... beside new_<mob>...
    skins = {}
    plain = {False: base_layers, True: baby_layers}
    for v, kind in enumerate(variants):
        if not v:
            continue
        for baby_look in (False, True):
            lay, _, _ = im.look(d, rcs, mats, anims, "Baby" if baby_look else "", mood=answers(v))
            for (_, texs, _, _), (_, own, _, _) in zip(plain[baby_look], lay):
                for t, o in zip(texs, own):
                    if t == o:
                        continue
                    key = tex_keys[t]
                    tex_keys.setdefault(o, key.replace(f"{ia.PREFIX}{mob}", f"{ia.PREFIX}{mob}_{kind}", 1))
                    skins.setdefault(key, {})[kind] = tex_keys[o]

    # Named looks (named: their first names) keep their models, but take the pack's materials afresh (how each layer is
    # lit) and get the other kinds' skins as the plain looks do. Those in remodel get the pack's current models instead.
    for look in (l for i, l in enumerate(looks) if i not in (0, bi)):
        name = (look["names"] or [""])[0]
        if name not in named and name not in remodel:
            continue
        lay0, _, _ = im.look(d, rcs, mats, anims, name, mood=answers(0))
        if name in remodel:
            look["layers"] = layers_out(name.lower().replace(" ", "_"), lay0)
            continue
        if len(lay0) != len(look["layers"]):
            print(f"{mob} {name}: the pack has {len(lay0)} layers, the look {len(look['layers'])}; left as it is")
            continue
        for layer, (_, texs, _, flags) in zip(look["layers"], lay0):
            del layer[3:]
            if flags:
                layer.append(flags)
            for t, key in zip(texs, layer[1]):
                tex_keys.setdefault(t, key)
        for v, kind in enumerate(variants):
            if not v:
                continue
            lay, _, _ = im.look(d, rcs, mats, anims, name, mood=answers(v))
            for (_, texs, _, _), (_, own, _, _) in zip(lay0, lay):
                for t, o in zip(texs, own):
                    if t != o:
                        key = tex_keys[t]
                        tex_keys.setdefault(o, key.replace(f"{ia.PREFIX}{mob}", f"{ia.PREFIX}{mob}_{kind}", 1))
                        skins.setdefault(key, {})[kind] = tex_keys[o]

    motion = []
    for key, weight, *rate in motions:
        loop = im.baked_loop(d, anims, key, weight, *rate)
        loop["bones"] = renamed(loop["bones"])
        motion.append(loop)
    act = im.baked_act(d, anims, acts)
    for a in act:
        for part in a["parts"]:
            part["bones"] = renamed(part["bones"])

    print(f"{mob}: {len(adult)}+{len(baby)} layers, {len(motion)} loop, {len(act)} acts, {len(tex_keys)} textures")
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

    text = put(text, "MOB_LOOKS", mob, looks)
    text = put(text, "MOB_MOTIONS", mob, motion)
    text = put(text, "MOB_ACTS", mob, act)
    for geo, key in geo_keys.items():
        text = put(text, "MOB_MODELS", key, im.model(geos[geo]))
    ia.MODELS_JS.write_text(text)
    print("wrote")
