"""Work out every structure container's loot, in both editions, from the games' own loot tables, and write src/structure-loot.js.

    python3 tools/structure-loot.py <java data> <bedrock-samples> <en_us.json>

<java data> is misode/mcmeta's `26.3-data` tag unpacked (the folder holding data/minecraft); <bedrock-samples> is a checkout of
Mojang/bedrock-samples with behavior_pack/loot_tables in it. Fetch them with:

    curl -sSL https://codeload.github.com/misode/mcmeta/tar.gz/refs/tags/26.3-data | tar xz
    git clone --depth 1 --filter=blob:none --sparse https://github.com/Mojang/bedrock-samples.git && \
        git -C bedrock-samples sparse-checkout set behavior_pack/loot_tables
    curl -sSO https://raw.githubusercontent.com/misode/mcmeta/26.3-assets/assets/minecraft/lang/en_us.json

For each table it gives each thing that can come out (an item and what's done to it: enchanted, worn, a potion, a map's destination)
the stack it comes in (least and most) and the chance a container holds at least one, exactly:
  - a pool runs (its random_chance condition passes) and rolls r times (a uniform whole number); each roll picks one entry by weight
    from those whose conditions pass; an item's count is drawn (uniform, constant or binomial) and a count of 0 gives nothing;
  - a loot_table entry rolls that whole table;
  - so a pool's chance of none = sum over r of P(r) * (sum over entries of weight share * the entry's chance of none) ** r, and the
    table's chance of none is the product over its pools.
Conditions on the place (Java's location_check, Bedrock's biome_has_tag) are worked out as if the place matched none of them; an
entry only found where one matches gets a row of its own worked out there (`where`). Bonus rolls go by luck, which a chest hasn't.
An id with more than one kind of thing (an iron axe plain and enchanted) also gets a row "*": the chance of any of them.
"""
import json
import pathlib
import re
import sys
from math import comb

root = pathlib.Path(__file__).resolve().parent.parent


def lenient(path):
    """Read JSON with // and /* */ comments and trailing commas (bedrock-samples has both)."""
    s, out, i, q = path.read_text(encoding="utf-8-sig"), [], 0, False
    while i < len(s):
        c = s[i]
        if q:
            out.append(c)
            if c == "\\":
                out.append(s[i + 1]); i += 1
            elif c == '"':
                q = False
        elif c == '"':
            q = True; out.append(c)
        elif s.startswith("//", i):
            while i < len(s) and s[i] != "\n":
                i += 1
            continue
        elif s.startswith("/*", i):
            i = s.index("*/", i) + 2; continue
        else:
            out.append(c)
        i += 1
    return json.loads(re.sub(r",(\s*[\]}])", r"\1", "".join(out)))


def uniform(lo, hi):
    lo, hi = int(lo // 1), int(hi // 1)
    return {n: 1 / (hi - lo + 1) for n in range(lo, hi + 1)} if hi >= lo else {lo: 1.0}


def number(v):
    """A number provider -> {value: chance}. Java: a number, uniform, constant, binomial; Bedrock: a number or {min, max}."""
    if isinstance(v, (int, float)):
        return {int(v // 1): 1.0}
    t = v.get("type", "").replace("minecraft:", "")
    if t == "binomial":
        n, p = int(v["n"]), v["p"]
        return {k: comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(n + 1)}
    if t == "constant":
        return {int(v["value"] // 1): 1.0}
    return uniform(v["min"], v["max"])


def span(d):
    return [min(d), max(d)]


# ---------- Java ----------

def jcond(c):
    """A condition -> ("place", test) for one that depends on where the container is, ("chance", p), or None (always)."""
    if isinstance(c, list):
        parts = [jcond(x) for x in c]
        parts = [p for p in parts if p]
        return parts[0] if len(parts) == 1 else ("all", parts) if parts else None
    t = c["type"].replace("minecraft:", "")
    if t == "random_chance":
        return ("chance", c["chance"])
    if t == "location_check":
        b = c["predicate"]["biomes"]
        return ("place", ("biome", b if isinstance(b, str) else ",".join(b)), True)
    if t == "inverted":
        k, test, yes = jcond(c["term"])
        assert k == "place"
        return ("place", test, not yes)
    raise ValueError(f"condition {t}")


def jmods(m):
    return m if isinstance(m, list) else [m] if m else []


CAMP_NAMES = {}  # an abandoned camp map's kind -> its name's key, from Java's set_name


def jitem(e):
    """A Java item entry -> (id, variant, count distribution)."""
    name, count, var = e["name"].replace("minecraft:", ""), {1: 1.0}, []
    for m in jmods(e.get("modifier")):
        t = m["type"].replace("minecraft:", "")
        if "condition" in m:
            raise ValueError(f"conditional modifier {t} on {name}")
        if t == "set_count":
            d = number(m["count"])
            if m.get("add"):
                d = {a + b: p * q for a, p in count.items() for b, q in d.items()}
            count = d
        elif t == "enchant_randomly":
            o = m.get("options", "")
            var.append("ench" if o in ("", "#minecraft:on_random_loot") else "ench:" + (o if isinstance(o, str) else ",".join(o)).replace("minecraft:", ""))
        elif t == "enchant_with_levels":
            lv = span(number(m["levels"]))
            var.append(f"lvl:{lv[0]}-{lv[1]}")
        elif t == "set_enchantments":
            var.append("set:" + ",".join(sorted(f"{k.replace('minecraft:', '')}:{'-'.join(map(str, span(number(v))))}" for k, v in m["enchantments"].items())))
        elif t == "set_damage":
            var.append("worn")
        elif t == "set_potion":
            var.append("potion:" + m["id"].replace("minecraft:", ""))
        elif t == "set_stew_effect":
            var.append("stew")
        elif t == "exploration_map":
            d = m["destination"].replace("#minecraft:", "").replace("minecraft:", "")
            if d.startswith("on_abandoned_camp_"):
                var.append("camp:" + d[len("on_abandoned_camp_"):])
        elif t == "set_name":
            n = m["name"]
            camp = next((v for v in var if v.startswith("camp:")), None)
            if camp and isinstance(n, dict) and "translate" in n:
                CAMP_NAMES[camp] = n["translate"]
        elif t == "set_ominous_bottle_amplifier":
            a = span(number(m["amplifier"]))
            var.append(f"omen:{a[0]}-{a[1]}")
        elif t == "set_instrument":
            var.append("horn:" + m["options"].replace("#minecraft:", ""))
        elif t == "set_components" and "minecraft:trim" in m["components"]:
            tr = m["components"]["minecraft:trim"]
            var.append(f"trim:{tr['pattern'].replace('minecraft:', '')}.{tr['material'].replace('minecraft:', '')}")
        elif t == "filtered":
            pass
        else:
            raise ValueError(f"modifier {t} on {name}")
    if name == "book" and any(v.startswith(("ench", "lvl", "set")) for v in var):
        name = "enchanted_book"
    return name, var, count


def java_table(ref, base):
    path = base / "loot_table" / (ref.replace("minecraft:", "") + ".json")
    return parse_java(json.loads(path.read_text()), base)


def parse_java(t, base):
    pools = []
    for p in t.get("pools", []):
        if "modifier" in p:  # a pool-wide modifier (a set_potion, a set_instrument): fold it into each item entry
            p = {**p, "entries": [{**e, "modifier": jmods(e.get("modifier")) + jmods(p["modifier"])} for e in p["entries"]]}
        chance, place = 1.0, None
        if "condition" in p:
            c = jcond(p["condition"])
            if c[0] == "chance":
                chance = c[1]
            else:
                place = c[1:]
        entries = []
        for e in p["entries"]:
            t2 = e["type"].replace("minecraft:", "")
            c = jcond(e["condition"]) if "condition" in e else None
            if c and c[0] != "place":
                raise ValueError(f"entry condition {c}")
            ent = {"w": e.get("weight", 1), "place": c[1:] if c else None}
            if t2 == "empty":
                ent["kind"] = "empty"
            elif t2 == "item":
                ent["kind"] = "item"
                ent["id"], ent["var"], ent["count"] = jitem(e)
            elif t2 == "loot_table":
                v = e["value"]
                ent["kind"], ent["table"] = "table", java_table(v, base) if isinstance(v, str) else parse_java(v, base)
            else:
                raise ValueError(f"entry {t2}")
            entries.append(ent)
        pools.append({"rolls": number(p["rolls"]), "chance": chance, "place": place, "entries": entries})
    return pools


# ---------- Bedrock ----------

# Bedrock's names for what Java calls otherwise, and its data values (dyes are its old ones).
BEDROCK_IDS = {
    "appleEnchanted": "enchanted_golden_apple", "horsearmordiamond": "diamond_horse_armor", "horsearmorgold": "golden_horse_armor",
    "horsearmoriron": "iron_horse_armor", "muttonRaw": "mutton", "record_13": "music_disc_13", "record_cat": "music_disc_cat",
    "record_otherside": "music_disc_otherside", "record_pigstep": "music_disc_pigstep", "sapling": "oak_sapling", "web": "cobweb",
    "sign": "oak_sign", "deadbush": "dead_bush", "fireball": "fire_charge", "speckled_melon": "glistering_melon_slice",
    "empty_map": "map", "snow": "snow_block", "chain": "iron_chain", "golden_rail": "powered_rail", "buriedtreasure": "buried_treasure",
}
DYES = ["ink_sac", "red_dye", "green_dye", "cocoa_beans", "lapis_lazuli", "purple_dye", "cyan_dye", "light_gray_dye", "gray_dye", "pink_dye",
        "lime_dye", "yellow_dye", "light_blue_dye", "magenta_dye", "orange_dye", "bone_meal", "black_dye", "brown_dye", "blue_dye", "white_dye"]
PATTERNS = ["creeper_banner_pattern", "skull_banner_pattern", "flower_banner_pattern", "mojang_banner_pattern", "field_masoned_banner_pattern",
            "bordure_indented_banner_pattern", "piglin_banner_pattern", "globe_banner_pattern"]
SIGNS = ["oak_sign", "spruce_sign", "birch_sign", "jungle_sign", "acacia_sign", "dark_oak_sign"]
# Where Bedrock's explorer maps lead -> Java's item for that map.
BEDROCK_MAPS = {"buriedtreasure": "buried_treasure_map", "buried_ancient_city": "buried_ancient_city_map", "buried_mineshaft": "buried_mineshaft_map",
                "desert_pyramid": "desert_pyramid_map", "jungle_temple": "jungle_pyramid_map", "mansion": "woodland_mansion_map",
                "trial_chambers": "buried_trial_chambers_map", "warm_ocean_ruins": "warm_ocean_ruins_map"}
CAMP_BIOMES = {"extreme_hills_plus_trees": "windswept_forest", "swampland": "swamp"}
BEDROCK_POTIONS = {"nightvision": "night_vision", "strong_regeneration": "strong_regeneration"}


def bcond(c):
    t = c["condition"].replace("minecraft:", "")
    if t == "random_chance":
        return ("chance", c["chance"])
    if t == "biome_has_tag":
        return ("place", ("tag", c["tag"]), c.get("operator", "==") != "!=")
    raise ValueError(f"condition {t}")


def bitem(e):
    name, count, var = e["name"].replace("minecraft:", ""), number(e.get("count", 1)), []
    data = None
    for f in e.get("functions", []):
        t = f["function"].replace("minecraft:", "")
        if "conditions" in f:
            raise ValueError(f"conditional function {t} on {name}")
        if t == "set_count":
            count = number(f["count"])
        elif t == "enchant_randomly":
            var.append("ench:treasure" if f.get("treasure") else "ench")
        elif t == "enchant_with_levels":
            lv = span(number(f["levels"]))
            var.append(f"lvl:{lv[0]}-{lv[1]}")
        elif t == "specific_enchants":
            parts = []
            for x in f["enchants"]:
                if isinstance(x, str):
                    parts.append(f"{x}:1-1")
                else:
                    lv = x.get("level", 1)
                    lv = lv if isinstance(lv, list) else [lv, lv]
                    parts.append(f"{x['id']}:{lv[0]}-{lv[1]}")
            var.append("set:" + ",".join(sorted(parts)))
        elif t == "enchant_book_for_trading":
            var.append("ench:" + ",".join(x["name"] for x in f["enchantments"]))
        elif t == "set_damage":
            var.append("worn")
        elif t == "set_potion":
            var.append("potion:" + BEDROCK_POTIONS.get(f["id"], f["id"]))
        elif t in ("set_stew_effect", "random_aux_value") and name == "suspicious_stew":
            var.append("stew")
        elif t == "set_data":
            data = f["data"]
        elif t == "exploration_map":
            d = f["destination"]
            if d.startswith("abandoned_camp_"):
                var.append("camp:" + CAMP_BIOMES.get(d[len("abandoned_camp_"):], d[len("abandoned_camp_"):]))
                name = "abandoned_camp_map"
            else:
                name = BEDROCK_MAPS[d]
        elif t == "set_ominous_bottle_amplifier":
            a = span(number(f["amplifier"]))
            var.append(f"omen:{a[0]}-{a[1]}")
        elif t == "set_armor_trim":
            var.append(f"trim:{f['pattern']}.{f['material']}")
        else:
            raise ValueError(f"function {t} on {name}")
    if data is not None:
        if name == "dye":
            name = DYES[data]
        elif name == "banner_pattern":
            name = PATTERNS[data]
        elif name == "sign":
            name = SIGNS[data]
        elif name == "goat_horn":
            d = span(number(data))
            var.append(f"horn:{d[0]}-{d[1]}")
        else:
            raise ValueError(f"data on {name}")
    name = BEDROCK_IDS.get(name, name)
    if name == "arrow" and any(v.startswith("potion:") for v in var):
        name = "tipped_arrow"
    if name == "book" and any(v.startswith(("ench", "lvl", "set", "pick")) for v in var):
        name = "enchanted_book"
    return name, var, count


def bedrock_table(ref, base):
    return parse_bedrock(lenient(base / ref), base)


def parse_bedrock(t, base):
    pools = []
    for p in t.get("pools", []):
        if "tiers" in p:
            raise ValueError("tiers")
        chance, place = 1.0, None
        for c in p.get("conditions", []):
            c = bcond(c)
            if c[0] == "chance":
                chance *= c[1]
            else:
                place = c[1:]
        entries = []
        for e in p["entries"]:
            cs = [bcond(c) for c in e.get("conditions", [])]
            if any(c[0] != "place" for c in cs) or len(cs) > 1:
                raise ValueError(f"entry conditions {cs}")
            ent = {"w": e.get("weight", 1), "place": cs[0][1:] if cs else None}
            if e["type"] == "empty":
                ent["kind"] = "empty"
            elif e["type"] == "item":
                ent["kind"] = "item"
                ent["id"], ent["var"], ent["count"] = bitem(e)
            elif e["type"] == "loot_table":
                ent["kind"], ent["table"] = "table", bedrock_table(e["name"], base)
            else:
                raise ValueError(f"entry {e['type']}")
            entries.append(ent)
        pools.append({"rolls": number(p["rolls"]), "chance": chance, "place": place, "entries": entries})
    return pools


# ---------- Chances ----------

def passes(place, where):
    """Does a place condition pass, where `where` is the one place test taken to match (None: none match)?"""
    if not place:
        return True
    test, yes = place
    return (test == where) == yes


def none_of(pools, hit, where):
    """The chance a roll of the whole table gives nothing that `hit(id, var)` picks out."""
    out = 1.0
    for p in pools:
        if not passes(p["place"], where):
            continue
        ents = [e for e in p["entries"] if passes(e["place"], where)]
        total = sum(e["w"] for e in ents)
        if not total:
            continue
        miss = 0.0
        for e in ents:
            if e["kind"] == "item" and hit(e["id"], e["var"]):
                m = e["count"].get(0, 0.0) + sum(q for n, q in e["count"].items() if n < 0)
            elif e["kind"] == "table":
                m = none_of(e["table"], hit, where)
            else:
                m = 1.0
            miss += e["w"] / total * m
        roll = sum(q * miss ** r for r, q in p["rolls"].items())
        out *= 1 - p["chance"] + p["chance"] * roll
    return out


def things(pools, where, found=None, tests=None):
    """Every (id, var) the table can give where `where` matches, with its count's least and most; and every place test it has."""
    found = {} if found is None else found
    tests = set() if tests is None else tests
    for p in pools:
        if p["place"]:
            tests.add(p["place"][0])
        if not passes(p["place"], where):
            continue
        for e in p["entries"]:
            if e["place"]:
                tests.add(e["place"][0])
            if not passes(e["place"], where):
                continue
            if e["kind"] == "item":
                ns = [n for n in e["count"] if n > 0]
                if not ns:
                    continue
                k = (e["id"], "+".join(e["var"]))
                lo, hi = found.get(k, (min(ns), max(ns)))
                found[k] = (min(lo, min(ns)), max(hi, max(ns)))
            elif e["kind"] == "table":
                things(e["table"], where, found, tests)
    return found, tests


def rows(pools):
    found, tests = things(pools, None)
    out = []

    def add(found, where):
        by_id = {}
        for (i, v), (lo, hi) in found.items():
            p = 1 - none_of(pools, lambda a, b, i=i, v=v: a == i and "+".join(b) == v, where)
            if p > 1e-9:
                out.append([i, v, lo, hi, round(p, 6)] + ([where_say(where)] if where else []))
                by_id.setdefault(i, []).append((lo, hi))
        for i, spans in by_id.items():
            if len(spans) > 1:
                p = 1 - none_of(pools, lambda a, b, i=i: a == i, where)
                out.append([i, "*", min(s[0] for s in spans), max(s[1] for s in spans), round(p, 6)] + ([where_say(where)] if where else []))

    add(found, None)
    for t in sorted(tests):
        there, _ = things(pools, t)
        extra = {k: v for k, v in there.items() if k not in found}
        if extra:
            add(extra, t)
    return out


def where_say(test):
    kind, v = test
    return v.replace("minecraft:", "")


# ---------- The tables ----------

JAVA_DIRS = ["chests", "barrels", "dispensers", "pots", "spawners", "archaeology", "equipment"]
BEDROCK_DIRS = ["chests", "barrels", "dispensers", "pots", "spawners", "equipment"]


def names(java, bedrock, lang):
    """The Java names of everything the tables give, and of the enchantments, potions and maps they name."""
    ids, ench, pots, camps = set(), set(), set(), set()
    for d in (java, bedrock):
        for rs in d.values():
            for r in rs:
                ids.add(r[0])
                for v in r[1].split("+"):
                    k, _, rest = v.partition(":")
                    if k in ("ench", "set") and rest and rest != "treasure":
                        ench.update(x.split(":")[0] for x in rest.split(","))
                    elif k == "potion":
                        pots.add(rest)
                    elif k == "camp":
                        camps.add(v)
    get = lambda *ks: next((lang[k] for k in ks if k in lang), None)
    out = {"items": {}, "ench": {}, "effects": {}, "camps": {}}
    for i in sorted(ids):
        # Templates, patterns and discs share a name in the game, which tells them apart on a line under it.
        n = (i.endswith("_armor_trim_smithing_template") and f"{get('trim_pattern.minecraft.' + i[:-29])} Template"
             or i == "netherite_upgrade_smithing_template" and "Netherite Upgrade Template"
             or get(f"item.minecraft.{i}.new")
             or i.startswith("music_disc_") and f"Music Disc ({get(f'item.minecraft.{i}.desc').split(' - ')[-1]})"
             or i.startswith("disc_fragment_") and f"Disc Fragment ({get(f'item.minecraft.{i}.desc').split(' - ')[-1]})"
             or get(f"item.minecraft.{i}", f"block.minecraft.{i}"))
        if not n:
            raise ValueError(f"no name for {i}")
        out["items"][i] = n
    for e in sorted(ench):
        out["ench"][e] = get(f"enchantment.minecraft.{e}") or e
    for p in sorted(pots):
        base = re.sub(r"^(strong|long)_", "", p)
        out["effects"][base] = get(f"item.minecraft.potion.effect.{base}", f"effect.minecraft.{base}")[len("Potion of "):]
    for c in sorted(camps):
        out["camps"][c[5:]] = get(CAMP_NAMES.get(c, ""), f"filled_map.{c[5:]}_camp_map", f"filled_map.{c[5:].split('_')[0]}_camp_map")
    return out


def main(java_root, bedrock_root, lang_path):
    jbase = pathlib.Path(java_root) / "data" / "minecraft"
    bbase = pathlib.Path(bedrock_root) / "behavior_pack"
    java, bedrock = {}, {}
    for d in JAVA_DIRS:
        for f in sorted((jbase / "loot_table" / d).rglob("*.json")):
            k = f.relative_to(jbase / "loot_table").with_suffix("").as_posix()
            java[k] = rows(java_table(k, jbase))
    for d in BEDROCK_DIRS:
        for f in sorted((bbase / "loot_tables" / d).rglob("*.json")):
            k = f.relative_to(bbase / "loot_tables").with_suffix("").as_posix()
            bedrock[k] = rows(bedrock_table(f.relative_to(bbase).as_posix(), bbase))
    for f in sorted((bbase / "loot_tables" / "entities").glob("*brushable_block*.json")):
        k = f.relative_to(bbase / "loot_tables").with_suffix("").as_posix()
        bedrock[k] = rows(bedrock_table(f.relative_to(bbase).as_posix(), bbase))
    dump = lambda d: "{\n" + ",\n".join(f"  {json.dumps(k)}: {json.dumps(v, separators=(',', ':'))}" for k, v in d.items()) + "\n}"
    head = ("/* Generated by tools/structure-loot.py from Java 26.3's loot tables (misode/mcmeta 26.3-data) and Bedrock 1.26.60's\n"
            " * (Mojang/bedrock-samples): each table's [id, kind, least, most, chance a container has at least one, (where)]. Don't edit. */\n")
    lang = json.loads(pathlib.Path(lang_path).read_text())
    named = names(java, bedrock, lang)
    out = head + f"const STRUCTURE_LOOT = {{\n java: {dump(java)},\n bedrock: {dump(bedrock)}\n}};\n"
    out += "// Java's names (en_us.json) for what they give, the enchantments and potions they name, and the camp maps.\n"
    out += f"const STRUCTURE_NAMES = {json.dumps(named, separators=(',', ':'))};\n"
    (root / "src" / "structure-loot.js").write_text(out)
    print(f"src/structure-loot.js: {len(java)} Java tables, {len(bedrock)} Bedrock tables, {len(out)} bytes")


if __name__ == "__main__":
    main(*sys.argv[1:4])
