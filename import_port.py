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


def controller_animations(d, played=()):
    """The animations the entity's animation controllers play in their first state (the pack's animation_controllers
    folder), as scripts.animate entries {key: condition}, each condition the controller's own and the animation's
    together. Some looks' poses are there (the chicken jockey's rider sitting up, Peep's big head), not in
    scripts.animate. played: animations the stage plays as loops or acts, left out (they'd be frozen in a pose too)."""
    ctl = {}
    for top in (im.pack, im.pack / "subpacks" / im.SUBPACK):
        folder = top / "animation_controllers"
        for f in sorted(folder.glob("*.json")) if folder.is_dir() else []:
            ctl.update(json.loads(f.read_text(encoding="utf-8")).get("animation_controllers", {}))
    out = []
    keys = d.get("animations", {})

    def walk(key, cond, depth):
        c = ctl.get(keys.get(key, ""))
        if not c or depth > 4:
            return
        states = c.get("states", {})
        state = states.get(c.get("initial_state") or "default") or next(iter(states.values()), {})
        for a in state.get("animations", []):
            k, inner = (a, None) if isinstance(a, str) else next(iter(a.items()))
            if ";" in str(inner):
                continue  # a script (a walk's blend weight), not a condition: movement, not a pose
            both = "&&".join(f"({x})" for x in (cond, inner) if x) or "1"
            if keys.get(k, "").startswith("controller."):
                walk(k, both, depth + 1)
            elif k in keys and k not in played:
                out.append({k: both})

    for a in d.get("scripts", {}).get("animate", []):
        k, cond = (a, None) if isinstance(a, str) else next(iter(a.items()))
        walk(k, cond, 0)
    return out


def dump(v):
    return json.dumps(v, separators=(",", ":"), ensure_ascii=False)


def put(text, const, key, value):
    """text (src/mob-models.js) with key's entry in the table const set to value, in key order."""
    a = text.index(f"const {const} = {{")
    b = text.index("\n};", a)
    lines = [l for l in text[a:b].split("\n") if not l.startswith(f'  "{key}": ')]
    keys = [(i, re.match(r'  "([^"]+)":', l).group(1)) for i, l in enumerate(lines) if re.match(r'  "([^"]+)":', l)]
    at = next((i for i, k in keys if k > key), len(lines))
    lines.insert(at, f"  {dump(key)}: {dump(value)},")
    return text[:a] + "\n".join(lines) + text[b:]


def copy_texture(path, key):
    """The pack's texture path into art/mobs/ as key.png; False if it's missing."""
    src = im.texture_file(path)
    if not src:
        print("missing texture", path)
        return False
    if src.suffix == ".tga":
        im.tga_to_png(src, ia.im.root / "art" / "mobs" / f"{key}.png")
    else:
        shutil.copyfile(src, ia.im.root / "art" / "mobs" / f"{key}.png")
    return True


def still(pose):
    """A pose without the bones it leaves as they are (no turn, no shift, full size)."""
    out = {}
    for bone, p in pose.items():
        p = {k: v for k, v in p.items() if any(abs(x - (1 if k == "s" else 0)) > 1e-6 for x in v)}
        if p:
            out[bone] = p
    return out


def port(mob, *, variants, acts, motions, answers=lambda v: {"variant": float(v)}, hidden=(), fix=None, named=(), remodel=(), own_motions=None, new_looks=(),
         sets=None, plays=None, climates=None, climate_acts=None, nested_poses=False, share=(), climate_motions=None, shows=None, fix_geos=None,
         moods=None):
    """variants: the mob's kinds by q.variant (the first is the plain one); acts and motions as import_models.py's
    STAGE_ACTS and its loops (keys are the new pack's); answers(v): what the game says for kind v; hidden: parts that
    only show while an act shows them (the panda's bamboo); fix(d): mends the entity before it's read (a texture the
    pack forgot); named: the first names of named looks to refresh too (see below); remodel: those of them that take the
    pack's current models too (the bat's vampire), as the plain looks do, with their size and pose; own_motions: first
    name -> the loops a named look plays in place of the mob's (and no acts), as motions; new_looks: the names of looks
    the page doesn't have yet (the bee's moths), each a list whose first is the one the pack is asked about, added after
    the others and built as remodel's are. A motion can say how fast it plays (a third item, its speed), or "held"
    for an animation held at its last frame (at its strength, the second item).
    sets: other animations the pack plays for some looks (the chicken's babies), set name -> {motions, acts}, written to
    MOB_MOTIONS and MOB_ACTS as "<mob>:<set>"; plays: first name -> the set that look plays in place of the mob's.
    climates: climate -> what the game says in it (the chicken's and cow's warm and cold kinds): the looks that come out
    different there go into MOB_CLIMATES, by their place in the mob's looks, with only their layers (the stage keeps the
    rest of the look); climate_acts: climate -> acts it plays in place of the mob's (the cold cow sneezes too);
    climate_motions: climate -> loops it plays in place of the mob's, baked with what the game says there (the cold
    pig's tail sits a little differently).
    nested_poses: the poses a name turns on are looked for in the entity's animation controllers too (see
    controller_animations).
    share: other mobs whose models it uses too (the cave spider the spider's): a model the same as one their looks use
    takes that one's key, not one of its own.
    shows: first name -> {bone pattern: shown}, parts the pack shows on only some of the mobs with that look, picked at
    random, that the stage shows (or hides) on it all the same (the muddy pig's rose). fix_geos(geos): mends the pack's
    models before they're read (a glow panel the pack's scripts stretch, the spider's).
    moods: mood -> {answers (what the game says in it, over answers(v)), motions, act, and collar or armor (1: its collar's
    color can be picked, it can wear MOB_ARMOR's)}: the mob's other moods (the wolf's angry and pet), each look again as it
    is in that mood (MOB_MOODS, in MOB_LOOKS' order), with its kinds' skins as the plain looks', and loops and acts of its
    own, baked with what the game says there."""
    ents, rcs, geos, mats, anims, _p, _a = im.read_pack()
    for g in geos.values():
        ia.rename_geo(g)
    if fix_geos:
        fix_geos(geos)
    d = ents[f"minecraft:{mob}"]
    if fix:
        fix(d)
    if nested_poses:
        def act_keys(a):
            return [k for x in (a if isinstance(a, list) else [a]) for k, *_ in x["parts"]]
        played = {k for k, *_ in motions} | set(act_keys(acts))
        played |= {k for loops in (own_motions or {}).values() for k, *_ in loops}
        played |= {k for s in (sets or {}).values() for k, *_ in s["motions"]} | {k for s in (sets or {}).values() for k in act_keys(s.get("acts", []))}
        played |= {k for a in (climate_acts or {}).values() for k in act_keys(a)}
        played |= {k for m in (moods or {}).values() for k, *_ in m["motions"]} | {k for m in (moods or {}).values() for k in act_keys(m.get("act", []))}
        d["scripts"]["animate"] = [*d["scripts"].get("animate", []), *controller_animations(d, played)]
    text = ia.MODELS_JS.read_text()
    current = ia.parse_section(text, "MOB_LOOKS")[mob]

    geo_keys, tex_keys = {}, {}
    models = ia.parse_section(text, "MOB_MODELS")
    looks_of = ia.parse_section(text, "MOB_LOOKS")
    shared = {json.dumps(models[layer[0]]): layer[0] for other in share for look in looks_of[other] for layer in look["layers"]}

    def layers_out(label, layers):
        out = []
        for i, (geo, texs, rules, flags) in enumerate(layers):
            g = geos.get(geo)
            if not g:
                continue
            rules = [[ia.ren(p), on] for p, on in rules]
            if flags.get("litBones"):
                flags = {**flags, "litBones": [ia.ren(p) for p in flags["litBones"]]}
            part = ia.PREFIX + "_".join(filter(None, [mob, label, str(i) if i else ""]))
            if not any(im.shown(b["name"], rules) for b in g.get("bones", []) if b.get("cubes")):
                continue
            geo_keys.setdefault(geo, shared.get(json.dumps(im.model(g)), part))
            names = []
            for j, t in enumerate(texs):
                if t not in tex_keys:
                    # A layer's second texture (new_<mob>_1) and the next layer's first (new_<mob>_1) are named alike:
                    # a different texture under a name already taken gets a number of its own, or one would overwrite the
                    # other (the trader llama's empty overlay and its blanket).
                    key = base = "_".join(filter(None, [part, str(j) if j else ""]))
                    n = 2
                    while key in tex_keys.values():
                        key, n = f"{base}_{n}", n + 1
                    tex_keys[t] = key
                names.append(tex_keys[t])
            im.glow_panels(g, rules, flags)
            rules = [[p, False if p in hidden else on] for p, on in rules]
            out.append([geo_keys[geo], names, rules[1:] if rules[:1] == [["*", True]] else rules] + ([flags] if flags else []))
        return out

    base_layers, base_scale, _ = im.look(d, rcs, mats, anims, "", mood=answers(0))
    baby_layers, baby_scale, baby_pose = im.look(d, rcs, mats, anims, "Baby", mood=answers(0))
    if nested_poses:
        baby_pose = still(baby_pose)
    adult = layers_out("", base_layers)
    baby = layers_out("baby", baby_layers)
    looks = json.loads(json.dumps(current))
    have = {(l["names"] or [""])[0] for l in looks}
    looks += [{"names": list(names), "scale": 1.0, "layers": []} for names in new_looks if names[0] not in have]
    remodel = [*remodel, *(names[0] for names in new_looks)]
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
        lay0, scale, pose = im.look(d, rcs, mats, anims, name, mood=answers(0))
        if nested_poses:
            pose = still(pose)
        if name in remodel:
            look["layers"] = layers_out(name.lower().replace(" ", "_"), lay0)
            look["scale"] = round(scale / base_scale, 3)
            if pose:
                look["pose"] = im.compact({ia.ren(b): p for b, p in pose.items()})
            else:
                look.pop("pose", None)
        elif len(lay0) != len(look["layers"]):
            print(f"{mob} {name}: the pack has {len(lay0)} layers, the look {len(look['layers'])}; left as it is")
            continue
        else:
            for layer, (_, texs, _, flags) in zip(look["layers"], lay0):
                del layer[3:]
                if flags:
                    layer.append({**flags, "litBones": [ia.ren(p) for p in flags["litBones"]]} if flags.get("litBones") else flags)
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

    for look in looks:
        name = (look["names"] or [""])[0]
        for layer in look["layers"] if shows and name in shows else ():
            layer[2] = [[p, shows[name].get(p, on)] for p, on in layer[2]]

    # Climates: each look again in that climate, where it comes out different (the plain and baby looks by no name and Baby).
    climate_out = {}
    for climate, extra in (climates or {}).items():
        changed = {}
        for i, look in enumerate(looks):
            name = "" if i == 0 else "Baby" if i == bi else (look["names"] or [""])[0]
            lay, _, _ = im.look(d, rcs, mats, anims, name, mood={**answers(0), **extra})
            if lay == im.look(d, rcs, mats, anims, name, mood=answers(0))[0]:
                continue
            label = "_".join(filter(None, [climate, "baby" if i == bi else name.lower().replace(" ", "_")]))
            changed[str(i)] = {"layers": layers_out(label, lay)}
        climate_out[climate] = {"looks": changed}

    # Moods: every look again as the game draws it in that mood (the plain and baby looks by no name and Baby), its kinds'
    # skins found as the plain looks' are.
    mood_looks = {}
    for mood, spec in (moods or {}).items():
        out = []
        for i, look in enumerate(looks):
            name = "" if i == 0 else "Baby" if i == bi else (look["names"] or [""])[0]
            lay0, _, _ = im.look(d, rcs, mats, anims, name, mood={**answers(0), **spec["answers"]})
            label = "_".join(filter(None, [mood, "baby" if i == bi else name.lower().replace(" ", "_")]))
            out.append({k: v for k, v in look.items() if k != "layers"} | {"layers": layers_out(label, lay0)})
            for v, kind in enumerate(variants):
                if not v:
                    continue
                lay, _, _ = im.look(d, rcs, mats, anims, name, mood={**answers(v), **spec["answers"]})
                for (_, texs, _, _), (_, own, _, _) in zip(lay0, lay):
                    for t, o in zip(texs, own):
                        if t != o:
                            key = tex_keys[t]
                            tex_keys.setdefault(o, key.replace(f"{ia.PREFIX}{mob}", f"{ia.PREFIX}{mob}_{kind}", 1))
                            skins.setdefault(key, {})[kind] = tex_keys[o]
        mood_looks[mood] = out

    def baked_loops(motions, mood=None):
        out = []
        for key, weight, *rate in motions:
            # "held": an animation that plays once and holds its last frame (the axolotl tucking its legs in).
            loop = im.baked_held(d, anims, key, answers=mood, weight=weight) if rate == ["held"] else im.baked_loop(d, anims, key, weight, *rate, answers=mood)
            loop["bones"] = renamed(loop["bones"])
            out.append(loop)
        return out

    motion = baked_loops(motions)
    for look in looks:
        name = (look["names"] or [""])[0]
        if own_motions and name in own_motions:
            look["motions"] = baked_loops(own_motions[name])
    act = im.baked_act(d, anims, acts)
    for a in act:
        for part in a["parts"]:
            part["bones"] = renamed(part["bones"])

    for climate, climate_act in (climate_acts or {}).items():
        baked = im.baked_act(d, anims, climate_act)
        for a in baked:
            for part in a["parts"]:
                part["bones"] = renamed(part["bones"])
        climate_out[climate]["act"] = baked
    for climate, loops in (climate_motions or {}).items():
        climate_out[climate]["motions"] = baked_loops(loops, {**answers(0), **climates[climate]})
    set_out = {}
    for key, spec in (sets or {}).items():
        baked = im.baked_act(d, anims, spec.get("acts", []))
        for a in baked:
            for part in a["parts"]:
                part["bones"] = renamed(part["bones"])
        set_out[key] = (baked_loops(spec["motions"]), baked)
    for look in looks:
        name = (look["names"] or [""])[0]
        if plays and name in plays:
            look["plays"] = plays[name]
        else:
            look.pop("plays", None)

    mood_out = {}
    for mood, spec in (moods or {}).items():
        said = {**answers(0), **spec["answers"]}
        baked = im.baked_act(d, anims, spec.get("act", []), said)
        for a in baked:
            for part in a["parts"]:
                part["bones"] = renamed(part["bones"])
        mood_out[mood] = {"looks": mood_looks[mood], "motions": baked_loops(spec["motions"], said), "act": baked,
                          **{k: 1 for k in ("collar", "armor") if spec.get(k)}}

    print(f"{mob}: {len(adult)}+{len(baby)} layers, {len(motion)} loop, {len(act)} acts, {len(tex_keys)} textures"
          + (f", sets {sorted(set_out)}" if set_out else "") + (f", climates {({c: sorted(v['looks']) for c, v in climate_out.items()})}" if climate_out else ""))
    print("skins:", json.dumps(skins))
    if not ia.WRITE:
        return

    for path, key in sorted(tex_keys.items(), key=lambda kv: kv[1]):
        copy_texture(path, key)
    text = put(text, "MOB_LOOKS", mob, looks)
    text = put(text, "MOB_MOTIONS", mob, motion)
    if act:
        text = put(text, "MOB_ACTS", mob, act)
    else:  # a mob with only its loops has no acts at all, not an empty list
        a = text.index("const MOB_ACTS = {")
        b = text.index("\n};", a)
        text = text[:a] + "\n".join(l for l in text[a:b].split("\n") if not l.startswith(f'  "{mob}": ')) + text[b:]
    # Sets other mobs' importers wrote before are left be; this mob's are written afresh.
    for const in ("MOB_MOTIONS", "MOB_ACTS"):
        a = text.index(f"const {const} = {{")
        b = text.index("\n};", a)
        text = text[:a] + "\n".join(l for l in text[a:b].split("\n") if not l.startswith(f'  "{mob}:')) + text[b:]
    for key, (loops, acts_) in set_out.items():
        text = put(text, "MOB_MOTIONS", f"{mob}:{key}", loops)
        text = put(text, "MOB_ACTS", f"{mob}:{key}", acts_)
    if climates:
        text = put(text, "MOB_CLIMATES", mob, climate_out)
    if moods:
        text = put(text, "MOB_MOODS", mob, mood_out)
    for geo, key in geo_keys.items():
        text = put(text, "MOB_MODELS", key, im.model(geos[geo]))
    ia.MODELS_JS.write_text(text)
    print("wrote")
