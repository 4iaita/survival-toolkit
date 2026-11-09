"""Add what the updated Actions & Stuff pack (1.1.x, rewritten) has that src/mob-models.js doesn't yet: new mobs and the
looks its newer names give (Frankenstein, Halloween, Cherry...), without touching the looks, models and animations that are
already there (the pack's keys were all renamed, which import_models.py's animation tables still use).

    python3 import_additions.py path/to/unpacked/pack path/to/textures [--write]

Without --write it only says what it would add. With it, the new looks are put in MOB_LOOKS (and the new spellings of
names a look already has are added to it), their models into MOB_MODELS, and their textures into art/mobs/ as new_*.png.
The new looks' bones go by the new pack's names, so they only move where those match the old ones (the plain humanoid
ones); the blink and glow bones are renamed to the old names the stage looks for.
"""
import json
import re
import shutil
import sys

pack_arg, textures_arg = sys.argv[1], sys.argv[2]
WRITE = "--write" in sys.argv
sys.argv = ["import_models.py", pack_arg, textures_arg]

import import_models as im  # noqa: E402  (reads its paths from argv)

im.SUBPACK = "SP2"
# The pack's own names for the blink and glow bones, now scrambled differently: to the names the stage knows.
RENAMES = [(re.compile(r"^3dafc$"), "blink"), (re.compile(r"^8dgo(\d*)$"), r"fsdyhky\1")]
# Entities that aren't mobs the tab shows (projectiles, vehicles, furniture) and the pack's own markers.
NOT_MOBS = {"armor_stand", "player", "cushion", "xp_orb", "fishing_hook", "evocation_fang"}
NEW_MOBS = ["sulfur_cube"]
HIDDEN_NAMES = {"§§", "§§§§", "prop", "item"}
PREFIX = "new_"
MODELS_JS = im.root / "src" / "mob-models.js"


def ren(name):
    for pattern, to in RENAMES:
        if pattern.match(name):
            return pattern.sub(to, name)
    return name


def rename_geo(g):
    for b in g.get("bones", []):
        b["name"] = ren(b["name"])
        if b.get("parent"):
            b["parent"] = ren(b["parent"])


def parse_section(text, const):
    """A table of MOB_MODELS.js's lines: key -> parsed value."""
    a = text.index(f"const {const} = {{")
    b = text.index("\n};", a)
    out = {}
    for line in text[a:b].split("\n"):
        m = re.match(r'  "([^"]+)": (.*?),?$', line)
        if m:
            out[m.group(1)] = json.loads(m.group(2))
    return out


def read_props():
    """Attachables that turn an item into a prop in the hand of an armor stand named §§: nearly every item's attachable
    now checks the name, so the real ones are told apart by looking different with it (see main)."""
    out = {}
    for top in (im.pack, im.pack / "subpacks" / im.SUBPACK):
        folder = top / "attachables"
        for f in sorted(folder.glob("*.json")) if folder.is_dir() else []:
            d = json.loads(f.read_text(encoding="utf-8")).get("minecraft:attachable", {}).get("description")
            if d and re.search(r"is_name_any\('(?:§§|\\u00a7\\u00a7)'", json.dumps(d, ensure_ascii=False)):
                out[d["identifier"]] = d
    return out


def main():
    ents, rcs, geos, mats, anims, _props, _armors = im.read_pack()
    prop_items = read_props()
    for g in geos.values():
        rename_geo(g)
    text = MODELS_JS.read_text()
    current = parse_section(text, "MOB_LOOKS")
    current_models = parse_section(text, "MOB_MODELS")
    lower = lambda names: {n.lower() for n in names}

    geo_keys, tex_keys = {}, {}

    def layers_out(key, label, layers):
        out = []
        for i, (geo, texs, rules, flags) in enumerate(layers):
            g = geos.get(geo)
            if not g:
                continue
            rules = [[ren(p), on] for p, on in rules]
            if flags.get("litBones"):
                flags["litBones"] = [ren(p) for p in flags["litBones"]]
            im.glow_panels(g, rules, flags)
            part = PREFIX + "_".join(filter(None, [key, label, str(i) if i else ""]))
            if not any(im.shown(b["name"], rules) for b in g.get("bones", []) if b.get("cubes")):
                continue
            geo_keys.setdefault(geo, part)
            names = []
            for j, t in enumerate(texs):
                if t not in tex_keys:
                    tex_keys[t] = "_".join(filter(None, [part, str(j) if j else ""]))
                names.append(tex_keys[t])
            out.append([geo_keys[geo], names, rules[1:] if rules[:1] == [["*", True]] else rules] + ([flags] if flags else []))
        return out

    wanted = set(current) | set(NEW_MOBS)
    added, extended = {}, {}
    for ident, d in sorted(ents.items()):
        mob = im.MOB_KEYS.get(ident.split(":")[1], ident.split(":")[1])
        if mob not in wanted or mob in NOT_MOBS:
            continue
        names = [n for n in im.names_of(d) if n.lower() not in HIDDEN_NAMES]
        base_layers, base_scale, _ = im.look(d, rcs, mats, im.anims if False else anims, "")
        groups = [[[], base_layers, base_scale, {}]]
        for n in names:
            layers, scale, pose = im.look(d, rcs, mats, anims, n)
            same = next((g for g in groups if g[1:] == [layers, scale, pose]), None)
            if not same:
                groups.append([[n], layers, scale, pose])
            elif same is not groups[0]:
                same[0].append(n)
        have = current.get(mob)
        entries = []
        for names_, layers, scale, pose in groups:
            if have is not None:
                hit = next((i for i, l in enumerate(have) if names_ and lower(l["names"]) & lower(names_)), None)
                if hit is not None:
                    fresh = sorted(lower(names_) - lower(have[hit]["names"]))
                    if fresh:
                        extended.setdefault(mob, {})[hit] = [n for n in names_ if n.lower() in fresh]
                    continue
                if not names_:
                    continue  # the plain look the tab already has
            label = re.sub(r"\W+", "_", names_[0].lower()).strip("_") if names_ else ""
            rel = round(scale / base_scale, 3) if base_scale else 1
            pose = {ren(b): p for b, p in pose.items()}
            layer_list = layers_out(mob, label, layers)
            if not layer_list:
                continue
            entries.append({"names": names_, "scale": rel, "layers": layer_list, **({"pose": im.compact(pose)} if pose else {})})
        if entries:
            added[mob] = entries

    # Props: items whose look with the name differs from the plain item's, that the tab doesn't have yet.
    have_props = set(parse_section(text, "PROP_LOOKS"))
    new_props = {}
    for ident, d in sorted(prop_items.items()):
        item = ident.split(":")[1]
        if not ident.startswith("minecraft:") or item in have_props or not re.fullmatch(r"[a-z_0-9]+", item):
            continue
        try:
            plain, _, plain_pose = im.look(d, rcs, mats, anims, "", held=True)
            layers, _, pose = im.look(d, rcs, mats, anims, "§§", held=True)
        except Exception:
            continue
        if not layers or (layers == plain and pose == plain_pose):
            continue
        pose = {ren(b): p for b, p in pose.items()}
        layer_list = layers_out(f"prop_{item}", "", layers)
        if layer_list:
            new_props[item] = {"names": ["§§"], "scale": 1, "layers": layer_list, **({"pose": im.compact(pose)} if pose else {})}

    print(f"{len(new_props)} new props: {', '.join(sorted(new_props))}")
    print(f"{len(added)} mobs get new looks, {sum(len(v) for v in added.values())} looks in all;"
          f" {sum(len(v) for v in extended.values())} existing looks get new spellings")
    for mob, entries in sorted(added.items()):
        print(" ", mob, "+", [e["names"][0] if e["names"] else "(plain)" for e in entries])
    for mob, by in sorted(extended.items()):
        print(" ", mob, "spellings:", {current[mob][i]["names"][0] if current[mob][i]["names"] else "(plain)": v for i, v in by.items()})
    if not WRITE:
        return

    out = im.root / "art" / "mobs"
    missing = []
    for path, key in sorted(tex_keys.items(), key=lambda kv: kv[1]):
        src = im.texture_file(path)
        if not src:
            missing.append(path)
        elif src.suffix == ".tga":
            im.tga_to_png(src, out / f"{key}.png")
        else:
            shutil.copyfile(src, out / f"{key}.png")
    have_png = {p.stem for p in out.glob("*.png")}
    for e in list(new_props.values()) + [e for entries in added.values() for e in entries]:
        for L in e["layers"]:
            L[1] = [t for t in L[1] if t in have_png]
        e["layers"] = [L for L in e["layers"] if L[1]]
    models = {key: im.model(geos[geo]) for geo, key in sorted(geo_keys.items(), key=lambda kv: kv[1])}
    dump = lambda v: json.dumps(v, separators=(",", ":"), ensure_ascii=False)

    def put(text, const, key, value):
        a = text.index(f"const {const} = {{")
        b = text.index("\n};", a)
        lines = [l for l in text[a:b].split("\n") if not l.startswith(f'  "{key}": ')]
        keys = [(i, re.match(r'  "([^"]+)":', l).group(1)) for i, l in enumerate(lines) if re.match(r'  "([^"]+)":', l)]
        at = next((i for i, k in keys if k > key), len(lines))
        lines.insert(at, f"  {dump(key)}: {dump(value)},")
        return text[:a] + "\n".join(lines) + text[b:]

    for mob in sorted(set(added) | set(extended)):
        looks = json.loads(json.dumps(current.get(mob, [])))
        for i, more in extended.get(mob, {}).items():
            looks[i]["names"] = looks[i]["names"] + more
        looks += [e for e in added.get(mob, []) if e["layers"]]
        text = put(text, "MOB_LOOKS", mob, looks)
    for key, value in models.items():
        text = put(text, "MOB_MODELS", key, value)
    for item, value in new_props.items():
        if value["layers"]:
            text = put(text, "PROP_LOOKS", item, value)
    MODELS_JS.write_text(text)
    print(f"wrote {len(models)} models and {len(tex_keys) - len(missing)} textures; {len(missing)} textures not found")
    if missing:
        print("missing:", ", ".join(missing[:10]), "..." if len(missing) > 10 else "")


if __name__ == "__main__":
    main()
