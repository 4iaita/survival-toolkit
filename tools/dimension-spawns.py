"""Work out which mobs spawn in each biome of each dimension, in both editions, from the games' own files, and write
src/dimension-spawns.js (the Structures tab's dimension Mobs sections).

    python3 tools/dimension-spawns.py <java data> <bedrock-samples> <en_us.json>

<java data> is misode/mcmeta's `26.3-data` tag unpacked (the folder holding data/minecraft); <bedrock-samples> is a checkout of
Mojang/bedrock-samples with behavior_pack/spawn_rules and behavior_pack/biomes in it. Fetch them with:

    curl -sSL https://codeload.github.com/misode/mcmeta/tar.gz/refs/tags/26.3-data | tar xz
    git clone --depth 1 --filter=blob:none --sparse https://github.com/Mojang/bedrock-samples.git && \
        git -C bedrock-samples sparse-checkout set behavior_pack/spawn_rules behavior_pack/biomes
    curl -sSO https://raw.githubusercontent.com/misode/mcmeta/26.3-assets/assets/minecraft/lang/en_us.json

Java: each biome's attribute gameplay/natural_mob_spawns (spawns_by_category: [type, weight, count]; spawn_costs), the biome tags
is_overworld, is_nether and is_end for each dimension's biomes, the dimensions' light rules (dimension_type), the attribute
creature_world_gen_spawn_probability (how many chunks get animals as they're made; 0.1 where a biome hasn't one), and which biomes'
trees carry bee nests (features with "bees" in their id, reached from the biome's placed features).
Bedrock: every spawn rule (behavior_pack/spawn_rules) whose biome filter passes on a biome's tags (behavior_pack/biomes), with its
weight, herd size and filters. A rule with no weight (the guardian's, the monuments') isn't natural spawning; the phantom's and the
pillager patrol's are events, told by the page itself. Bedrock's biomes are put under Java's names (BEDROCK_BIOMES); its End is
one biome, so every Java End biome gets it.

Each row is [kind, mob, weight, least, most, opts]. kind is what the weight is a share of: Java's own spawn categories (monster,
creature, ambient, water_creature, water_ambient, underground_water_creature, axolotls); Bedrock's population_control (monster,
animal, water_animal, ambient), with its animals that spawn underwater (squid, dolphins, nautiluses, glow squid) a kind of their
own, `water`. A mob with two rules in one biome (Bedrock's tropical fish) is one row: weights added, sizes spanned. opts (Bedrock):
h, the height filter; l, the brightness filter; cap, the density limit; r, the weight's rarity; p, [mob, weight] it's turned into
(its permute_type), of a total of 100; ride, what it spawns with.
"""
import importlib.util
import json
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("structure_loot", root / "tools" / "structure-loot.py")
_loot = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_loot)
lenient = _loot.lenient

DIMS = {"overworld": "is_overworld", "nether": "is_nether", "end": "is_end"}
# Java's biome -> Bedrock's: its biome files keep the old names, and many old variants (hills, mutated) that are no longer made.
BEDROCK_BIOMES = {
    "badlands": "mesa", "eroded_badlands": "mesa_bryce", "wooded_badlands": "mesa_plateau_stone", "dark_forest": "roofed_forest",
    "old_growth_birch_forest": "birch_forest_mutated", "ice_spikes": "ice_plains_spikes", "mushroom_fields": "mushroom_island",
    "nether_wastes": "hell", "old_growth_pine_taiga": "mega_taiga", "old_growth_spruce_taiga": "redwood_taiga_mutated",
    "windswept_savanna": "savanna_mutated", "snowy_beach": "cold_beach", "snowy_plains": "ice_plains", "snowy_taiga": "cold_taiga",
    "soul_sand_valley": "soulsand_valley", "sparse_jungle": "jungle_edge", "stony_shore": "stone_beach", "swamp": "swampland",
    "windswept_forest": "extreme_hills_plus_trees", "windswept_gravelly_hills": "extreme_hills_mutated", "windswept_hills": "extreme_hills",
    "end_highlands": "the_end", "end_midlands": "the_end", "end_barrens": "the_end", "small_end_islands": "the_end",
}
# Events, not natural spawning: the page tells them from the Mobs tab's facts.
BEDROCK_EVENTS = {"phantom", "pillager_patrol"}
# Bedrock's ids that Java (and the page) call otherwise.
BEDROCK_MOBS = {"zombie_pigman": "zombified_piglin", "zombie_villager_v2": "zombie_villager", "tropicalfish": "tropical_fish"}
short = lambda i: i.split(":")[-1].split("<")[0]


def count(c):
    return (c, c) if isinstance(c, int) else (c["min_inclusive"], c["max_inclusive"])


# ---------- Java ----------

def java(base):
    tag = lambda t: [v.replace("minecraft:", "") for v in json.loads((base / "tags/worldgen/biome" / f"{t}.json").read_text())["values"]]
    dims = {d: [b for b in tag(t) if b != "the_void"] for d, t in DIMS.items()}
    spawns, costs, gen = {}, {}, {}
    for d in dims.values():
        for b in d:
            a = json.loads((base / "worldgen/biome" / f"{b}.json").read_text())["attributes"]
            arg = a["minecraft:gameplay/natural_mob_spawns"]["argument"]
            rows = []
            for kind, entries in arg.get("spawns_by_category", {}).items():
                for e in entries:
                    lo, hi = count(e["count"])
                    rows.append([kind, short(e["type"]), e["weight"], lo, hi])
            spawns[b] = merge(rows)
            if arg.get("spawn_costs"):
                costs[b] = {short(k): [v["energy_budget"], v["charge"]] for k, v in arg["spawn_costs"].items()}
            if "minecraft:gameplay/creature_world_gen_spawn_probability" in a:
                gen[b] = a["minecraft:gameplay/creature_world_gen_spawn_probability"]
    light = {}
    for d, f in (("overworld", "overworld"), ("nether", "the_nether"), ("end", "the_end")):
        t = json.loads((base / "dimension_type" / f"{f}.json").read_text())
        lv = t["monster_spawn_light_level"]
        light[d] = [[lv["min_inclusive"], lv["max_inclusive"]] if isinstance(lv, dict) else [lv, lv], t["monster_spawn_block_light_limit"]]
    return dims, spawns, costs, gen, light, bee_biomes(base, dims["overworld"])


# Cave biomes: their surface features (dripstone caves' and the deep dark's plains trees) only show where the cave reaches up.
CAVES = {"dripstone_caves", "lush_caves", "deep_dark", "sulfur_caves"}


def bee_biomes(base, biomes):
    """The biomes whose trees can carry bee nests: a placed feature that leads (through the features it names) to a tree with a
    beehive decorator."""
    seen = {}

    def bees(ref):
        ref = ref.replace("minecraft:", "")
        if ref not in seen:
            seen[ref] = False
            for kind in ("placed_feature", "feature"):
                p = base / "worldgen" / kind / f"{ref}.json"
                if p.exists():
                    text = p.read_text()
                    seen[ref] = seen[ref] or '"minecraft:beehive"' in text or any(bees(r) for r in set(re.findall(r'"minecraft:([a-z0-9_/]+)"', text)) if r != ref)
        return seen[ref]

    return [b for b in biomes if b not in CAVES and any(bees(f) for step in json.loads((base / "worldgen/biome" / f"{b}.json").read_text())["features"] for f in step)]


# ---------- Bedrock ----------

def passes(f, tags, cold):
    if f is None:
        return True
    if isinstance(f, list):
        return all(passes(x, tags, cold) for x in f)
    if "all_of" in f:
        return passes(f["all_of"], tags, cold)
    if "any_of" in f:
        return any(passes(x, tags, cold) for x in f["any_of"])
    if "none_of" in f:
        return not any(passes(x, tags, cold) for x in f["none_of"])
    test, op = f["test"], f.get("operator", "==")
    if test == "has_biome_tag":
        hit = f["value"] in tags
    elif test == "is_snow_covered":
        hit = cold
    else:
        raise ValueError(f"unknown biome test {test}")
    return hit if op in ("==", "equals") else not hit


def bedrock(bbase, java_dims):
    biomes = {}
    for p in (bbase / "biomes").glob("*.biome.json"):
        c = lenient(p)["minecraft:biome"]["components"]
        # Snow falls where it's cold: Bedrock's is_snow_covered, taken as a climate under 0.15 (where Java snows too).
        biomes[p.name[:-len(".biome.json")]] = (set(c.get("minecraft:tags", {}).get("tags", [])), c.get("minecraft:climate", {}).get("temperature", 1) < 0.15)
    rules = []
    for p in sorted((bbase / "spawn_rules").glob("*.json")):
        r = lenient(p)["minecraft:spawn_rules"]
        mob, pop = short(r["description"]["identifier"]), r["description"].get("population_control")
        if mob in BEDROCK_EVENTS:
            continue
        for c in r.get("conditions", []):
            if "minecraft:weight" not in c:
                continue
            rules.append((BEDROCK_MOBS.get(mob, mob), pop, c))
    spawns = {}
    for d in java_dims.values():
        for b in d:
            tags, cold = biomes[BEDROCK_BIOMES.get(b, b)]
            rows = []
            for mob, pop, c in rules:
                # A rule with no biome filter (the glow squid's: underwater at Y 30 and lower) is taken as the Overworld's.
                if "minecraft:biome_filter" not in c and not tags & {"overworld", "overworld_generation"}:
                    continue
                if not passes(c.get("minecraft:biome_filter"), tags, cold):
                    continue
                kind = "water" if pop == "animal" and "minecraft:spawns_underwater" in c else pop
                herd = c.get("minecraft:herd", {"min_size": 1, "max_size": 1})
                herd = herd if isinstance(herd, list) else [herd]
                w = c["minecraft:weight"]
                opts = {}
                if "minecraft:height_filter" in c:
                    opts["h"] = [c["minecraft:height_filter"]["min"], c["minecraft:height_filter"]["max"]]
                if "minecraft:brightness_filter" in c:
                    opts["l"] = [c["minecraft:brightness_filter"]["min"], c["minecraft:brightness_filter"]["max"]]
                if "minecraft:density_limit" in c:
                    opts["cap"] = c["minecraft:density_limit"]
                if "rarity" in w:
                    opts["r"] = w["rarity"]
                perm = [x for x in c.get("minecraft:permute_type", []) if "entity_type" in x]
                if perm:
                    opts["p"] = [[BEDROCK_MOBS.get(short(x["entity_type"]), short(x["entity_type"])), x["weight"]] for x in perm]
                ride = [h.get("initial_event") or h.get("event") for h in herd if (h.get("initial_event") or h.get("event", "")).endswith("rider")]
                if ride:
                    opts["ride"] = short(ride[0])
                row = [kind, mob, w["default"], min(h["min_size"] for h in herd), max(h["max_size"] for h in herd)]
                rows.append(row + ([opts] if opts else []))
            spawns[b] = merge(rows)
    return spawns


def merge(rows):
    """One row per kind, mob and rider: weights added, sizes and heights spanned (the rest from the first rule)."""
    out = {}
    for r in rows:
        k = (r[0], r[1], (r[5] if len(r) > 5 else {}).get("ride"))
        if k not in out:
            out[k] = [*r[:5], dict(r[5]) if len(r) > 5 else {}]
            continue
        m = out[k]
        m[2] += r[2]
        m[3], m[4] = min(m[3], r[3]), max(m[4], r[4])
        o = r[5] if len(r) > 5 else {}
        for key in ("h", "l"):
            if key in m[5] and key in o:
                m[5][key] = [min(m[5][key][0], o[key][0]), max(m[5][key][1], o[key][1])]
            else:
                m[5].pop(key, None)
        for key, v in o.items():
            m[5].setdefault(key, v)
    return [r if r[5] else r[:5] for r in out.values()]


def main(java_root, bedrock_root, lang_path):
    jbase = pathlib.Path(java_root) / "data" / "minecraft"
    bbase = pathlib.Path(bedrock_root) / "behavior_pack"
    dims, jspawns, costs, gen, light, bees = java(jbase)
    bspawns = bedrock(bbase, dims)
    lang = json.loads(pathlib.Path(lang_path).read_text())
    names = {b: lang[f"biome.minecraft.{b}"] for d in dims.values() for b in d}
    dump = lambda d: "{\n" + ",\n".join(f"  {json.dumps(k)}: {json.dumps(v, separators=(',', ':'))}" for k, v in d.items()) + "\n}"
    out = ("/* Generated by tools/dimension-spawns.py from Java 26.3's biomes (misode/mcmeta 26.3-data) and Bedrock 1.26.60's spawn rules\n"
           " * (Mojang/bedrock-samples): each biome's [kind, mob, weight, least, most, opts]; its header says what they are. Don't edit. */\n")
    out += f"const DIM_SPAWNS = {{\n java: {dump(jspawns)},\n bedrock: {dump(bspawns)}\n}};\n"
    out += "// Each dimension's biomes (Java's tags), and their names (en_us.json).\n"
    out += f"const DIM_BIOMES = {json.dumps(dims, separators=(',', ':'))};\n"
    out += f"const DIM_BIOME_NAMES = {json.dumps(names, separators=(',', ':'))};\n"
    out += "// Java: [monster_spawn_light_level [least, most], monster_spawn_block_light_limit] for each dimension; spawn_costs\n"
    out += "// (mob -> [energy_budget, charge]); creature_world_gen_spawn_probability where it isn't 0.1; the biomes with bee nests on their trees.\n"
    out += f"const DIM_LIGHT = {json.dumps(light, separators=(',', ':'))};\n"
    out += f"const DIM_COSTS = {json.dumps(costs, separators=(',', ':'))};\n"
    out += f"const DIM_ANIMAL_GEN = {json.dumps(gen, separators=(',', ':'))};\n"
    out += f"const DIM_BEES = {json.dumps(bees, separators=(',', ':'))};\n"
    (root / "src" / "dimension-spawns.js").write_text(out)
    print(f"src/dimension-spawns.js: {len(jspawns)} Java biomes, {len(bspawns)} Bedrock, {len(out)} bytes; bees in {', '.join(bees)}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
