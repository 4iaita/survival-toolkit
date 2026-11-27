"""Walk a jigsaw structure's pieces in Java's files and tell what each piece holds: its containers (by loot table), its spawners, its
mobs (the entities saved in the piece), its notable blocks, and the pools its jigsaws lead to.

    python3 tools/structure-pieces.py <java data> <start pool> [--counts <structure> [how many]]
    python3 tools/structure-pieces.py <java data> --end-city [how many]
    python3 tools/structure-pieces.py <java data> --mansion [how many] [src/structure-loot.js]
    python3 tools/structure-pieces.py --stronghold [how many]
    python3 tools/structure-pieces.py --mineshaft [how many]

<java data> is misode/mcmeta's `26.3-data` tag unpacked (see tools/structure-loot.py's header); <start pool> is a template pool's id
without "minecraft:", such as bastion/starts or trial_chambers/chamber/end. Each element of the start pool is a kind of the structure
(a bastion's four), walked on its own through every pool its jigsaws name.

With --counts it also builds the structure (worldgen/structure/<structure>.json: its size and max_distance_from_center) that many
times (2000) as Java's JigsawPlacement does, pieces' boxes and all (see build), and gives, for each kind, the mean, least and most of
each container (by loot table, and by the folder of pieces it's in), spawner and mob, the gold blocks left after the processors' decay,
and how often it has at least one. The game's own random numbers aren't used, so these are the game's odds, not any one seed's.

--end-city builds that many end cities (20000) as Java's EndCityPieces does (see EndCity), and counts the data markers in its pieces
(chests, shulkers, the elytra) and the ship.

--mansion builds that many woodland mansions (5000) as Java's WoodlandMansionPieces does (from memory of that code: see its section),
and counts its rooms by template, the data markers in them (chests, vindicators, evokers, allays), the chests placed full in the
templates, and every block summed over its pieces; given src/structure-loot.js, also the chance a mansion's chests hold each find.

--stronghold and --mineshaft build that many (5000) as Java's StrongholdPieces and MineshaftPieces do, from memory of that code (see
their sections), and count what's in them. They need no files.
"""
import gzip
import io
import json
import pathlib
import random
import struct
import sys
from collections import Counter, defaultdict


# ---------- NBT ----------

def nbt(path):
    """A structure .nbt (gzipped, big-endian) -> its root compound as plain Python."""
    f = io.BytesIO(gzip.decompress(pathlib.Path(path).read_bytes()))
    r = lambda n: f.read(n)
    u = lambda fmt: struct.unpack(">" + fmt, r(struct.calcsize(">" + fmt)))[0]
    string = lambda: r(u("H")).decode("utf-8", "replace")

    def payload(t):
        if t == 1: return u("b")
        if t == 2: return u("h")
        if t == 3: return u("i")
        if t == 4: return u("q")
        if t == 5: return u("f")
        if t == 6: return u("d")
        if t == 7: return list(r(u("i")))
        if t == 8: return string()
        if t == 9:
            et, n = u("b"), u("i")
            return [payload(et) for _ in range(n)]
        if t == 10:
            out = {}
            while True:
                tt = u("b")
                if tt == 0:
                    return out
                k = string()
                out[k] = payload(tt)
        if t == 11: return [u("i") for _ in range(u("i"))]
        if t == 12: return [u("q") for _ in range(u("i"))]
        raise ValueError(f"tag {t}")

    assert u("b") == 10
    string()
    return payload(10)


# ---------- Pieces ----------

NOTABLE = {"gold_block", "lodestone", "gilded_blackstone", "ancient_debris", "spawner", "chest", "trapped_chest", "barrel", "lava",
           "ender_chest", "brewing_stand", "dragon_head", "dragon_wall_head",
           # the ancient city's
           "reinforced_deepslate", "sculk_sensor", "sculk_shrieker", "sculk_catalyst", "skeleton_skull", "soul_lantern", "candle",
           "white_candle", "furnace", "lectern", "note_block", "packed_ice", "blue_ice", "redstone_lamp", "campfire"}


class Data:
    def __init__(self, root):
        self.base = pathlib.Path(root) / "data" / "minecraft"
        self._pieces = {}

    def pool(self, ref):
        ref = ref.replace("minecraft:", "")
        if ref == "empty":
            return {"elements": [], "fallback": "minecraft:empty"}
        return json.loads((self.base / "worldgen" / "template_pool" / f"{ref}.json").read_text())

    def piece(self, loc):
        """A template -> {containers: Counter(table), spawners: Counter(mob), mobs: Counter(entity), blocks: Counter, jigsaws: [...]}."""
        loc = loc.replace("minecraft:", "")
        if loc in self._pieces:
            return self._pieces[loc]
        path = self.base / "structure" / f"{loc}.nbt"
        if not path.exists():
            # A pool can name a template the game hasn't (the ancient city's walls/intact_horizontal_wall_stairs_5): Java's
            # StructureTemplateManager.getOrCreate makes an empty one, with no jigsaws, so it never attaches.
            self._pieces[loc] = {"containers": Counter(), "spawners": Counter(), "mobs": Counter(), "blocks": Counter(), "markers": Counter(),
                                 "jigsaws": [], "size": [0, 0, 0], "missing": True}
            return self._pieces[loc]
        t = nbt(path)
        pal = t["palette"] if "palette" in t else t["palettes"][0]
        out = {"containers": Counter(), "spawners": Counter(), "mobs": Counter(), "blocks": Counter(), "markers": Counter(), "jigsaws": [], "size": t["size"]}
        for b in t["blocks"]:
            st = pal[b["state"]]
            name = st.get("Name", st.get("id", "")).replace("minecraft:", "")  # mcmeta's files say id
            e = b.get("nbt", {})
            if name == "jigsaw":
                front, top = st.get("properties", {}).get("orientation", "north_up").split("_")
                out["jigsaws"].append({"pool": e.get("pool", "minecraft:empty").replace("minecraft:", ""), "name": e.get("name", ""),
                                       "target": e.get("target", ""), "final": e.get("final_state", "minecraft:air").replace("minecraft:", ""),
                                       "pos": b["pos"], "front": front, "top": top, "rollable": e.get("joint", "rollable") == "rollable"})
                continue
            if name == "structure_block" and e.get("mode") == "DATA":  # a data marker the structure's code acts on (the end city's)
                out["markers"][e.get("metadata", "")] += 1
                continue
            if "LootTable" in e:
                out["containers"][(name, e["LootTable"].replace("minecraft:", ""))] += 1
            elif name == "spawner":
                sd = e.get("SpawnData", {}).get("entity", e.get("SpawnData", {}))
                out["spawners"][sd.get("id", "?").replace("minecraft:", "")] += 1
            if name in NOTABLE:
                out["blocks"][name] += 1
        for ent in t.get("entities", []):
            e = ent["nbt"]
            held = (e.get("equipment", {}).get("mainhand") or {}).get("id", "").replace("minecraft:", "")
            out["mobs"][e.get("id", "?").replace("minecraft:", "") + (f" with {held}" if held else "")] += 1
        self._pieces[loc] = out
        return out


def elements(data, el):
    """A pool element -> the templates it places (a list element places several)."""
    t = el["element_type"].replace("minecraft:", "")
    if t in ("single_pool_element", "legacy_single_pool_element"):
        return [el["location"].replace("minecraft:", "")]
    if t == "list_pool_element":
        return [x for e in el["elements"] for x in elements(data, e)]
    return []


def walk(data, start_el):
    """Every template reachable from a start element, with the pools that lead to it (and their weights)."""
    seen, pools, todo = {}, {}, [(start_el, None)]
    while todo:
        el, via = todo.pop()
        for loc in elements(data, el):
            if loc in seen:
                seen[loc].add(via)
                continue
            seen[loc] = {via}
            for j in data.piece(loc)["jigsaws"]:
                p = j["pool"]
                if p == "empty" or p in pools:
                    continue
                pools[p] = data.pool(p)
                for e in pools[p]["elements"]:
                    todo.append((e["element"], p))
                fb = pools[p].get("fallback", "minecraft:empty").replace("minecraft:", "")
                if fb != "empty" and fb not in pools:
                    pools[fb] = data.pool(fb)
                    for e in pools[fb]["elements"]:
                        todo.append((e["element"], fb))
    return seen, pools


def report(data, start):
    sp = data.pool(start)
    total = sum(e["weight"] for e in sp["elements"])
    for e in sp["elements"]:
        locs = elements(data, e["element"])
        print(f"\n=== {locs[0]}  (start weight {e['weight']}/{total})")
        seen, pools = walk(data, e["element"])
        for p, d in sorted(pools.items()):
            tw = sum(x["weight"] for x in d["elements"]) or 1
            parts = ", ".join(f"{'+'.join(elements(data, x['element'])) or x['element']['element_type'].replace('minecraft:', '')} {x['weight']}/{tw}" for x in d["elements"])
            print(f"  pool {p}: {parts}")
        for loc in sorted(seen):
            pc = data.piece(loc)
            bits = []
            if pc["containers"]: bits.append("containers " + ", ".join(f"{n}×{b}:{t}" for (b, t), n in pc["containers"].items()))
            if pc["spawners"]: bits.append("spawners " + ", ".join(f"{n}×{m}" for m, n in pc["spawners"].items()))
            if pc["mobs"]: bits.append("mobs " + ", ".join(f"{n}×{m}" for m, n in pc["mobs"].items()))
            if pc["markers"]: bits.append("markers " + ", ".join(f"{n}×{m}" for m, n in pc["markers"].items()))
            nb = {k: v for k, v in pc["blocks"].items() if k not in ("chest", "spawner", "barrel")}
            if nb: bits.append("blocks " + ", ".join(f"{n}×{b}" for b, n in nb.items()))
            js = Counter(j["pool"] for j in pc["jigsaws"] if j["pool"] != "empty")
            if js: bits.append("jigsaws " + ", ".join(f"{n}×{p}" for p, n in js.items()))
            print(f"  {loc} {pc['size']}: " + "; ".join(bits))


# ---------- Counting: Java's jigsaw placement ----------
# As JigsawPlacement does it (26.3): the start piece at a random rotation; then, breadth first (every jigsaw's placement priority is 0
# here), each piece's jigsaws in a shuffled order; for each, the pool's elements (each as many times as its weight, shuffled; only the
# fallback's at the last depth) and, for each, the four rotations shuffled and its jigsaws shuffled: the first that attaches and fits
# is placed. An empty element stops the jigsaw. A piece fits if it lies inside the free space: its parent's box less what's been
# placed in it, where the jigsaw points into the parent, else the whole structure's box (max_distance_from_center round the start)
# less every piece placed outside. A piece placed inside its parent shares that space for its own jigsaws that point out of it.

DIRS = {"north": (0, 0, -1), "south": (0, 0, 1), "west": (-1, 0, 0), "east": (1, 0, 0), "up": (0, 1, 0), "down": (0, -1, 0)}
CW = {"north": "east", "east": "south", "south": "west", "west": "north", "up": "up", "down": "down"}
OPP = {"north": "south", "south": "north", "east": "west", "west": "east", "up": "down", "down": "up"}


def turn(pos, rot):
    """A template position turned rot quarter turns clockwise round (0, 0, 0), as StructureTemplate.transform does."""
    x, y, z = pos
    for _ in range(rot):
        x, z = -z, x
    return (x, y, z)


def facing(d, rot):
    for _ in range(rot):
        d = CW[d]
    return d


def box_of(size, rot, at):
    a, b = turn((0, 0, 0), rot), turn((size[0] - 1, size[1] - 1, size[2] - 1), rot)
    return tuple(min(a[i], b[i]) + at[i] for i in range(3)) + tuple(max(a[i], b[i]) + at[i] for i in range(3))


def inside(box, p):
    return all(box[i] <= p[i] <= box[i + 3] for i in range(3))


def overlaps(a, b):
    return all(a[i] <= b[i + 3] and b[i] <= a[i + 3] for i in range(3))


class Free:
    """A box less the boxes taken out of it (Java's VoxelShape, for boxes on whole blocks)."""
    def __init__(self, box, taken=()):
        self.box, self.taken = box, list(taken)

    def fits(self, b):
        return all(self.box[i] <= b[i] and b[i + 3] <= self.box[i + 3] for i in range(3)) and not any(overlaps(b, t) for t in self.taken)


def shuffled_elements(pool, rng):
    out = [e["element"] for e in pool["elements"] for _ in range(e["weight"])]
    rng.shuffle(out)
    return out


def processors_of(data, el):
    p = el.get("processors", [])
    if isinstance(p, str):
        p = json.loads((data.base / "worldgen" / "processor_list" / f"{p.replace('minecraft:', '')}.json").read_text())
    return p.get("processors", []) if isinstance(p, dict) else p


def kept(data, el, block):
    """The chance a block of the template is still that block after the element's processors (their random_block_match rules)."""
    keep = 1.0
    for pr in processors_of(data, el):
        for r in pr.get("rules", []):
            i = r["input_predicate"]
            if i.get("predicate_type", "").endswith("random_block_match") and i.get("block", "").replace("minecraft:", "") == block:
                keep *= 1 - i["probability"]
            elif i.get("predicate_type", "").endswith("block_match") and i.get("block", "").replace("minecraft:", "") == block:
                keep = 0.0
    return keep


def build(data, start_el, depth, reach, rng, anchor=None):
    """One structure: [(template, element, depth)] of every piece placed. A feature element (the ancient city's sculk patches) is
    placed as a block's box where its jigsaw points, and listed as ("feature:<id>", element, depth).
    anchor: (start_jigsaw_name, its absolute Y, the world's lowest and highest Y) for a structure placed by a named jigsaw (the
    ancient city's city_anchor at Y -27): the structure's box is then round that jigsaw's height and cut off at the world's bottom
    and top, as JigsawPlacement.addPieces does."""
    rot = rng.randrange(4)
    loc = elements(data, start_el)[0]
    pc = data.piece(loc)
    box = box_of(pc["size"], rot, (0, 0, 0))
    cx, cz = (box[0] + box[3]) // 2, (box[2] + box[5]) // 2
    lo, hi = box[1] - reach, box[4] + reach
    if anchor:
        name, y, bottom, top = anchor
        a = next(j["pos"][1] for j in pc["jigsaws"] if j["name"] == name)
        lo, hi = max(a - reach, bottom - (y - a)), min(a + reach, top - (y - a))
    outer = Free((cx - reach, lo, cz - reach, cx + reach, hi, cz + reach), [box])
    placed = [(loc, start_el, 0)]
    queue = [(loc, start_el, rot, (0, 0, 0), box, outer, 0)]
    while queue:
        loc, el, rot, at, box, free, d = queue.pop(0)
        inner = None
        js = list(data.piece(loc)["jigsaws"])
        rng.shuffle(js)
        for j in js:
            jp = tuple(a + b for a, b in zip(turn(j["pos"], rot), at))
            front = facing(j["front"], rot)
            top = facing(j["top"], rot)
            tgt = tuple(a + b for a, b in zip(jp, DIRS[front]))
            pool = data.pool(j["pool"])
            if not pool["elements"] and j["pool"] != "empty":
                continue
            if inside(box, tgt):
                if inner is None:
                    inner = Free(box)
                here = inner
            else:
                here = free
            cands = shuffled_elements(pool, rng) if d != depth else []
            fb = pool.get("fallback", "minecraft:empty").replace("minecraft:", "")
            cands += shuffled_elements(data.pool(fb), rng)
            done = False
            for c in cands:
                if c["element_type"].endswith("empty_pool_element") or done:
                    break
                if c["element_type"].endswith("feature_pool_element"):
                    # FeaturePoolElement: one jigsaw named minecraft:bottom at its own block, its box that one block.
                    fb = tgt + tgt
                    if j["target"] == "minecraft:bottom" and here.fits(fb):
                        here.taken.append(fb)
                        placed.append(("feature:" + c["feature"].replace("minecraft:", ""), c, d + 1))
                        break
                    continue
                cloc = elements(data, c)
                if not cloc:
                    break
                cloc = cloc[0]
                cp = data.piece(cloc)
                rots = [0, 1, 2, 3]
                rng.shuffle(rots)
                for r in rots:
                    cjs = list(cp["jigsaws"])
                    rng.shuffle(cjs)
                    for cj in cjs:
                        cf, ct = facing(cj["front"], r), facing(cj["top"], r)
                        if not (front == OPP[cf] and (j["rollable"] or top == ct) and j["target"] == cj["name"]):
                            continue
                        cpos = turn(cj["pos"], r)
                        off = tuple(a - b for a, b in zip(tgt, cpos))
                        cb = box_of(cp["size"], r, off)
                        if not here.fits(cb):
                            continue
                        here.taken.append(cb)
                        placed.append((cloc, c, d + 1))
                        if d + 1 <= depth:
                            queue.append((cloc, c, r, off, cb, here, d + 1))
                        done = True
                        break
                    if done:
                        break
    return placed


def tally_of(data, placed):
    t = Counter()
    for loc, el, d in placed:
        if loc.startswith("feature:"):
            t[("feature", loc[8:])] += 1
            continue
        pc = data.piece(loc)
        group = loc.rsplit("/", 1)[0]
        for (b, tb), n in pc["containers"].items():
            t[("container", tb)] += n
            t[("container in", tb, group)] += n
        for m, n in pc["spawners"].items():
            t[("spawner", m)] += n
        for m, n in pc["mobs"].items():
            t[("mob", m)] += n
            if " with " in m:
                t[("mob", m.split(" with ")[0], "any")] += n
            t[("mob in", m, group)] += n
        golds = pc["blocks"].get("gold_block", 0) + sum(1 for j in pc["jigsaws"] if j["final"] == "gold_block")
        if golds:
            t[("gold blocks, after decay",)] += golds * kept(data, el, "gold_block")
        for b, n in pc["blocks"].items():
            if b not in ("gold_block", "chest", "spawner", "barrel"):
                n += sum(1 for j in pc["jigsaws"] if j["final"] == b)
                t[("block", b)] += n * kept(data, el, b)
                t[("block in", b, group)] += n * kept(data, el, b)
        t[("piece", loc)] += 1
    return t


def counts(data, start, depth, reach, n, seed=1, anchor=None):
    sp = data.pool(start)
    for e in sp["elements"]:
        rng, runs = random.Random(seed), []
        for _ in range(n):
            runs.append(tally_of(data, build(data, e["element"], depth, reach, rng, anchor)))
        keys = sorted({k for t in runs for k in t}, key=str)
        print(f"\n=== {elements(data, e['element'])[0]}  ({n} built, depth {depth})")
        for k in keys:
            v = [t[k] for t in runs]
            share = sum(1 for x in v if x) / n
            print(f"  {' · '.join(k)}: mean {sum(v) / n:.2f}, {min(v):g}–{max(v):g}, in {share:.0%}")


# ---------- The end city: Java's EndCityPieces ----------
# The end city isn't a jigsaw: its layout is in code (26.3's EndCityPieces, from memory of it), and its templates (structure/end_city)
# mark what the code adds with data markers: "Chest" (a chest of chests/end_city_treasure in the block under it), "Sentry" (a shulker)
# and "Elytra" (an item frame with an elytra). Ported as it is, random calls in the same order:
#   - the start (startHouseTower): base_floor, second_floor_1, third_floor_1 and third_roof stacked, then a tower on the roof (depth 1).
#   - a tower: tower_base, then 2 to 4 tower_pieces; 1 time in 3 the first piece, and each piece but the last half the times, is where
#     bridges go out (each of 4 sides half the times), and then tower_top. Without bridges a fat tower goes on it (unless at depth 7),
#     and if that fails the tower fails.
#   - a fat tower: fat_tower_base, fat_tower_middle, up to 2 more middles (each 2 in 3, while the last went on), each with bridges out
#     of each side half the times; then fat_tower_top (2 chests).
#   - a bridge: 1 to 4 pieces (flat, steep or gentle stairs), then a ship (once a city: 1 in 10 − depth, while none has been made) or a
#     house (base_floor; then a roof, or second_floor_2 and a roof and a tower, or second_floor_2, third_floor_2 (1 chest), a roof and a
#     tower, each 1 in 3), and a bridge_end back.
#   - recursiveChildren: past depth 8 nothing; a section's pieces are all kept or all dropped: dropped if one of them overlaps a piece
#     already in the list it joins, but for one with the same genDepth as its parent (pieces get a random genDepth as their section is
#     kept; new ones have 0, the bridges' first and last pieces -1). Only the first overlapping piece is looked at, as findCollisionPiece.
# A city is only made where the land is at Y 60 or more (the lowest of four points 5 blocks apart): that isn't modelled.
TOWER_BRIDGES = [(0, (1, -1, 0)), (1, (6, -1, 1)), (3, (0, -1, 5)), (2, (5, -1, 6))]
FAT_TOWER_BRIDGES = [(0, (4, -1, 0)), (1, (12, -1, 4)), (3, (0, -1, 8)), (2, (8, -1, 12))]


class ECPiece:
    def __init__(self, data, name, tp, rot):
        self.name, self.tp, self.rot, self.gd = name, tp, rot, 0
        self.box = box_of(data.piece(f"end_city/{name}")["size"], rot, tp)


class EndCity:
    def __init__(self, data, rng):
        self.data, self.rng, self.ship = data, rng, False

    def add(self, out, parent, off, name, rot):
        o = turn(off, parent.rot)
        p = ECPiece(self.data, name, tuple(a + b for a, b in zip(parent.tp, o)), rot % 4)
        out.append(p)
        return p

    def children(self, gen, depth, parent, off, pieces):
        if depth > 8:
            return False
        made = []
        if not gen(depth, parent, off, made):
            return False
        i = self.rng.getrandbits(32) - 2 ** 31
        for p in made:
            p.gd = i
            hit = next((q for q in pieces if overlaps(q.box, p.box)), None)
            if hit is not None and hit.gd != parent.gd:
                return False
        pieces.extend(made)
        return True

    def house(self, depth, parent, off, out):
        if depth > 8:
            return False
        r, rng = parent.rot, self.rng
        p = self.add(out, parent, off, "base_floor", r)
        i = rng.randrange(3)
        if i == 0:
            self.add(out, p, (-1, 4, -1), "base_roof", r)
        elif i == 1:
            p = self.add(out, p, (-1, 0, -1), "second_floor_2", r)
            p = self.add(out, p, (-1, 8, -1), "second_roof", r)
            self.children(self.tower, depth + 1, p, None, out)
        else:
            p = self.add(out, p, (-1, 0, -1), "second_floor_2", r)
            p = self.add(out, p, (-1, 4, -1), "third_floor_2", r)
            p = self.add(out, p, (-1, 8, -1), "third_roof", r)
            self.children(self.tower, depth + 1, p, None, out)
        return True

    def tower(self, depth, parent, off, out):
        r, rng = parent.rot, self.rng
        x = 3 + rng.randrange(2)
        p = self.add(out, parent, (x, -3, 3 + rng.randrange(2)), "tower_base", r)
        p = self.add(out, p, (0, 7, 0), "tower_piece", r)
        bridges = p if rng.randrange(3) == 0 else None
        floors = 1 + rng.randrange(3)
        for j in range(floors):
            p = self.add(out, p, (0, 4, 0), "tower_piece", r)
            if j < floors - 1 and rng.random() < 0.5:
                bridges = p
        if bridges is not None:
            for tr, at in TOWER_BRIDGES:
                if rng.random() < 0.5:
                    b = self.add(out, bridges, at, "bridge_end", r + tr)
                    self.children(self.bridge, depth + 1, b, None, out)
        elif depth != 7:
            return self.children(self.fat_tower, depth + 1, p, None, out)
        self.add(out, p, (-1, 4, -1), "tower_top", r)
        return True

    def bridge(self, depth, parent, off, out):
        r, rng = parent.rot, self.rng
        n = rng.randrange(4) + 1
        p = self.add(out, parent, (0, 0, -4), "bridge_piece", r)
        p.gd = -1
        j = 0
        for _ in range(n):
            if rng.random() < 0.5:
                p = self.add(out, p, (0, j, -4), "bridge_piece", r)
                j = 0
            else:
                if rng.random() < 0.5:
                    p = self.add(out, p, (0, j, -4), "bridge_steep_stairs", r)
                else:
                    p = self.add(out, p, (0, j, -8), "bridge_gentle_stairs", r)
                j = 4
        if not self.ship and rng.randrange(10 - depth) == 0:
            x = -8 + rng.randrange(8)
            self.add(out, p, (x, j, -70 + rng.randrange(10)), "ship", r)
            self.ship = True
        elif not self.children(self.house, depth + 1, p, (-3, j + 1, -11), out):
            return False
        p = self.add(out, p, (4, j, 0), "bridge_end", r + 2)
        p.gd = -1
        return True

    def fat_tower(self, depth, parent, off, out):
        r, rng = parent.rot, self.rng
        p = self.add(out, parent, (-3, 4, -3), "fat_tower_base", r)
        p = self.add(out, p, (0, 4, 0), "fat_tower_middle", r)
        i = 0
        while i < 2 and rng.randrange(3) != 0:
            p = self.add(out, p, (0, 8, 0), "fat_tower_middle", r)
            for tr, at in FAT_TOWER_BRIDGES:
                if rng.random() < 0.5:
                    b = self.add(out, p, at, "bridge_end", r + tr)
                    self.children(self.bridge, depth + 1, b, None, out)
            i += 1
        self.add(out, p, (-2, 8, -2), "fat_tower_top", r)
        return True

    def build(self):
        rot = self.rng.randrange(4)
        pieces = [ECPiece(self.data, "base_floor", (0, 0, 0), rot)]
        for off, name in (((-1, 0, -1), "second_floor_1"), ((-1, 4, -1), "third_floor_1"), ((-1, 8, -1), "third_roof")):
            self.add(pieces, pieces[-1], off, name, rot)
        self.children(self.tower, 1, pieces[-1], None, pieces)
        return pieces


def end_city_counts(data, n, seed=1):
    """Build n end cities and tell, for each, the mean, least and most of every marker by piece, and of the ship."""
    rng, runs = random.Random(seed), []
    for _ in range(n):
        t = Counter()
        for p in EndCity(data, rng).build():
            pc = data.piece(f"end_city/{p.name}")
            t[("piece", p.name)] += 1
            for m, k in pc["markers"].items():
                t[(m,)] += k
                t[(m, "in", p.name)] += k
            for b in ("ender_chest", "brewing_stand", "dragon_wall_head"):
                if pc["blocks"].get(b):
                    t[("block", b)] += pc["blocks"][b]
        runs.append(t)
    print(f"\n=== end city ({n} built)")
    for k in sorted({k for t in runs for k in t}, key=str):
        v = [t[k] for t in runs]
        hist = Counter(v)
        print(f"  {' · '.join(k)}: mean {sum(v) / n:.3f}, {min(v):g}–{max(v):g}, in {sum(1 for x in v if x) / n:.1%}"
              + (f"; {', '.join(f'{x}: {hist[x] / n:.1%}' for x in sorted(hist))}" if len(hist) <= 12 else ""))


# ---------- The stronghold: Java's StrongholdPieces ----------
# The stronghold has no templates either: every room is built block by block in code (26.3's StrongholdPieces and StrongholdStructure,
# from memory of them). Its layout is ported as it is, random calls in the same order; what each room holds is counted from its
# postProcess (also from memory), not by placing blocks:
#   - the start is a spiral staircase (StairsDown, its entrance open) at Y 64 facing a random way; its one child must be a five-way
#     crossing (imposedPiece). Then pending pieces are taken in a random order, each adding its children.
#   - a child: past genDepth 50, or more than 112 blocks (x or z) from the start's corner, nothing. Else up to 5 tries: a piece picked
#     by weight from those left (straight 40, prison hall 5 (at most 5), left and right turns 20 each, room crossing 10 (6), straight
#     stairs down 5 (5), spiral stairs 5 (5), five-way crossing 5 (4), chest corridor 5 (4), library 10 (2, only past depth 4), portal
#     room 20 (1, only past depth 5)); a pick that can't be placed there, or is the piece picked last, ends that try (a pick whose box
#     doesn't fit goes on to the next one down the list, as Java's loop does). A box fits if its bottom is over Y 10 and it overlaps no
#     piece. Failing those, a filler corridor up to the piece in the way, if it's on the same level. Nothing is added once every piece
#     with a limit has reached it.
#   - a stronghold without a portal room is thrown away and made again, so every one has exactly one.
#   - then the whole is moved down so its top is at a random Y from its height − 63 up to 52 (moveBelowSeaLevel, sea level 63, the
#     world's bottom −64, 10 below the sea).
# Each room with a door picks it at random (randomSmallDoor): open 2 in 5, oak door, iron bars or iron door (with a stone button
# either side) 1 in 5 each. The portal room's is always iron bars, the start's open.
SH_WEIGHTS = [("straight", 40, 0), ("prison_hall", 5, 5), ("left_turn", 20, 0), ("right_turn", 20, 0), ("room_crossing", 10, 6),
              ("straight_stairs_down", 5, 5), ("stairs_down", 5, 5), ("five_crossing", 5, 4), ("chest_corridor", 5, 4),
              ("library", 10, 2), ("portal_room", 20, 1)]
# Each piece's box: its offset from the door it's entered by, and its size (orientBox's arguments).
SH_BOXES = {"straight": (-1, -1, 0, 5, 5, 7), "chest_corridor": (-1, -1, 0, 5, 5, 7), "left_turn": (-1, -1, 0, 5, 5, 5),
            "right_turn": (-1, -1, 0, 5, 5, 5), "prison_hall": (-1, -1, 0, 9, 5, 11), "room_crossing": (-4, -1, 0, 11, 7, 11),
            "straight_stairs_down": (-1, -7, 0, 5, 11, 8), "stairs_down": (-1, -7, 0, 5, 11, 5), "five_crossing": (-4, -3, 0, 10, 9, 11),
            "library": (-4, -1, 0, 14, 11, 15), "portal_room": (-4, -1, 0, 11, 8, 16)}
SH_DOORS = ["opening", "opening", "oak_door", "iron_bars", "iron_door"]
# What each room holds, counted from its postProcess. Bookshelves: a library's 9 shelves of 4 down each side (and 9 more over the
# gallery in a tall one) and its 15 middle shelves of 6, less the one its chest takes. Cobwebs: 7% of the library's floor space that
# nothing else is put in (422 blocks, 417 in a tall one, whose ladder takes some). Iron bars: 7 in a barred door, 20 in the prison
# hall's cells, 32 in the portal room's walls. Lava: the portal room's 15 (two strips of 3 by its stairs, 9 under the portal).
SH_PRISON_BARS, SH_PORTAL_BARS, SH_DOOR_BARS = 20, 32, 7
SH_SHELVES = {False: 161, True: 233}
SH_WEB_ROOM = {False: 422, True: 417}
# The walls: generateBox's edge blocks with the stone brick selector, 5% of them infested (cracked 20%, mossy 30%), less 9 for each
# doorway cut in them, where caves don't cut through first (not modelled). The five-way crossing's inner walls and the portal room's
# floor and gallery (less its 32 barred windows) are more. Less the doorways, they're the wiki's own counts for each room's stone bricks
# (406 for a room crossing, 300 a prison hall, 895 and 627 a tall and a short library, 704 the portal room, 536–572 a five-way crossing).
SH_SHELL = {"straight": 130, "chest_corridor": 130, "left_turn": 98, "right_turn": 98, "prison_hall": 306 + 12, "room_crossing": 442,
            "straight_stairs_down": 278, "stairs_down": 194, "five_crossing": 486 + 122, "library": None, "portal_room": 652 + 70, "filler": 0, "start": 194}
SH_OPENINGS = {"straight": 2, "chest_corridor": 2, "left_turn": 2, "right_turn": 2, "prison_hall": 2, "room_crossing": 4,
               "straight_stairs_down": 2, "stairs_down": 2, "five_crossing": 6, "library": 1, "portal_room": 1, "filler": 0, "start": 2}
N, E, S, W = "north", "east", "south", "west"


def orient_box(x, y, z, ox, oy, oz, sx, sy, sz, d):
    if d == N:
        return (x + ox, y + oy, z - sz + 1 + oz, x + sx - 1 + ox, y + sy - 1 + oy, z + oz)
    if d == W:
        return (x - sz + 1 + oz, y + oy, z + ox, x + oz, y + sy - 1 + oy, z + sx - 1 + ox)
    if d == E:
        return (x + oz, y + oy, z + ox, x + sz - 1 + oz, y + sy - 1 + oy, z + sx - 1 + ox)
    return (x + ox, y + oy, z + oz, x + sx - 1 + ox, y + sy - 1 + oy, z + sz - 1 + oz)


class SHPiece:
    def __init__(self, kind, box, d, depth):
        self.kind, self.box, self.d, self.depth = kind, box, d, depth
        self.door, self.attrs = "opening", {}


class Stronghold:
    def __init__(self, rng):
        self.rng = rng

    # -- the weights --
    def reset(self):
        self.current = [[k, w, m, 0] for k, w, m in SH_WEIGHTS]
        self.imposed, self.previous = None, None

    def update(self):
        flag = any(m > 0 and c < m for _, _, m, c in self.current)
        self.total = sum(w for _, w, _, _ in self.current)
        return flag

    def may(self, pw, depth):
        k, _, m, c = pw
        ok = m == 0 or c < m
        return ok and (k != "library" or depth > 4) and (k != "portal_room" or depth > 5)

    # -- the pieces --
    def collision(self, box):
        return next((p for p in self.pieces if overlaps(p.box, box)), None)

    def fits(self, box):
        return box[1] > 10 and self.collision(box) is None

    def create(self, kind, x, y, z, d, depth):
        rng = self.rng
        box = orient_box(x, y, z, *SH_BOXES[kind], d)
        if kind == "library" and not self.fits(box):
            box = orient_box(x, y, z, -4, -1, 0, 14, 6, 15, d)
        if not self.fits(box):
            return None
        p = SHPiece(kind, box, d, depth)
        if kind != "portal_room":
            p.door = SH_DOORS[rng.randrange(5)]
        else:
            p.door = "iron_bars"
        if kind == "straight":
            p.attrs = {"left": rng.randrange(2) == 0, "right": rng.randrange(2) == 0}
        elif kind == "room_crossing":
            p.attrs = {"type": rng.randrange(5)}
        elif kind == "five_crossing":
            p.attrs = {"left_low": rng.random() < 0.5, "left_high": rng.random() < 0.5, "right_low": rng.random() < 0.5,
                       "right_high": rng.randrange(3) > 0}
        elif kind == "library":
            p.attrs = {"tall": box[4] - box[1] + 1 > 6}
        elif kind == "portal_room":
            p.attrs = {"eyes": sum(1 for _ in range(12) if rng.random() > 0.9)}
        return p

    def filler_box(self, x, y, z, d):
        box = orient_box(x, y, z, -1, -1, 0, 5, 5, 4, d)
        hit = self.collision(box)
        if hit is None:
            return None
        if hit.box[1] == box[1]:
            for j in (2, 1):
                if not overlaps(hit.box, orient_box(x, y, z, -1, -1, 0, 5, 5, j, d)):
                    return orient_box(x, y, z, -1, -1, 0, 5, 5, j + 1, d)
        return None

    def from_small_door(self, x, y, z, d, depth):
        rng = self.rng
        if not self.update():
            return None
        if self.imposed:
            p = self.create(self.imposed, x, y, z, d, depth)
            self.imposed = None
            if p:
                return p
        for _ in range(5):
            j = rng.randrange(self.total)
            for pw in list(self.current):
                j -= pw[1]
                if j < 0:
                    if not self.may(pw, depth) or pw is self.previous:
                        break
                    p = self.create(pw[0], x, y, z, d, depth)
                    if p:
                        pw[3] += 1
                        self.previous = pw
                        if not (pw[2] == 0 or pw[3] < pw[2]):
                            self.current.remove(pw)
                        return p
        box = self.filler_box(x, y, z, d)
        if box is not None and box[1] > 1:
            return SHPiece("filler", box, d, depth)
        return None

    def add(self, x, y, z, d, depth):
        if depth > 50:
            return None
        if abs(x - self.start.box[0]) <= 112 and abs(z - self.start.box[2]) <= 112:
            p = self.from_small_door(x, y, z, d, depth + 1)
            if p:
                self.pieces.append(p)
                self.pending.append(p)
            return p
        return None

    def forward(self, p, xo, yo):
        b = p.box
        if p.d == N: return self.add(b[0] + xo, b[1] + yo, b[2] - 1, p.d, p.depth)
        if p.d == S: return self.add(b[0] + xo, b[1] + yo, b[5] + 1, p.d, p.depth)
        if p.d == W: return self.add(b[0] - 1, b[1] + yo, b[2] + xo, p.d, p.depth)
        return self.add(b[3] + 1, b[1] + yo, b[2] + xo, p.d, p.depth)

    def left(self, p, yo, zo):
        b = p.box
        if p.d in (N, S): return self.add(b[0] - 1, b[1] + yo, b[2] + zo, W, p.depth)
        return self.add(b[0] + zo, b[1] + yo, b[2] - 1, N, p.depth)

    def right(self, p, yo, zo):
        b = p.box
        if p.d in (N, S): return self.add(b[3] + 1, b[1] + yo, b[2] + zo, E, p.depth)
        return self.add(b[0] + zo, b[1] + yo, b[5] + 1, S, p.depth)

    def children(self, p):
        k, a = p.kind, p.attrs
        if k == "start":
            self.imposed = "five_crossing"
            self.forward(p, 1, 1)
        elif k in ("stairs_down", "chest_corridor", "prison_hall", "straight_stairs_down"):
            self.forward(p, 1, 1)
        elif k == "straight":
            self.forward(p, 1, 1)
            if a["left"]: self.left(p, 1, 2)
            if a["right"]: self.right(p, 1, 2)
        elif k == "left_turn":
            (self.left if p.d in (N, E) else self.right)(p, 1, 1)
        elif k == "right_turn":
            (self.right if p.d in (N, E) else self.left)(p, 1, 1)
        elif k == "room_crossing":
            self.forward(p, 4, 1)
            self.left(p, 1, 4)
            self.right(p, 1, 4)
        elif k == "five_crossing":
            i, j = (5, 3) if p.d in (W, N) else (3, 5)  # Java's own swap (8 - i): a north or west crossing's side doors come out wrong
            self.forward(p, 5, 1)
            if a["left_low"]: self.left(p, i, 1)
            if a["left_high"]: self.left(p, j, 7)
            if a["right_low"]: self.right(p, i, 1)
            if a["right_high"]: self.right(p, j, 7)
        elif k == "portal_room":
            self.portal = p

    def build(self):
        rng, tries = self.rng, 0
        while True:
            tries += 1
            self.reset()
            d = [N, E, S, W][rng.randrange(4)]
            self.start = SHPiece("start", (2, 64, 2, 6, 74, 6), d, 0)
            self.pieces, self.pending, self.portal = [self.start], [], None
            self.children(self.start)
            while self.pending:
                self.children(self.pending.pop(rng.randrange(len(self.pending))))
            lo = min(p.box[1] for p in self.pieces)
            hi = max(p.box[4] for p in self.pieces)
            top = hi - lo + 1 - 64 + 1
            if top < 53:
                top += rng.randrange(53 - top)
            self.shift = top - hi
            if self.portal is not None:
                return self.pieces, tries


def stronghold_tally(sh, pieces, tries):
    t = Counter()
    t[("remade, times",)] += tries - 1
    t[("pieces",)] += len(pieces)
    for p in pieces:
        k, a = p.kind, p.attrs
        t[("piece", k)] += 1
        if k == "chest_corridor":
            t[("chest", "stronghold_corridor")] += 1
        elif k == "library":
            t[("library", "tall" if a["tall"] else "short")] += 1
            t[("chest", "stronghold_library")] += 1 + a["tall"]
            t[("block", "bookshelf")] += SH_SHELVES[a["tall"]]
            t[("block", "cobweb (expected)")] += 0.07 * SH_WEB_ROOM[a["tall"]]
            t[("block", "ladder")] += 7 * a["tall"]
        elif k == "room_crossing":
            t[("room crossing", ["pillar", "fountain", "storeroom", "empty", "empty"][a["type"]])] += 1
            if a["type"] == 2:
                t[("chest", "stronghold_crossing")] += 1
                t[("block", "ladder")] += 3
        elif k == "prison_hall":
            t[("block", "iron_bars")] += SH_PRISON_BARS
            t[("block", "iron_door (prison cells)")] += 2
        elif k == "portal_room":
            t[("block", "iron_bars")] += SH_PORTAL_BARS
            t[("block", "end_portal_frame")] += 12
            t[("eyes",)] += a["eyes"]
            t[("eyes", str(a["eyes"]))] += 1
            t[("block", "spawner (silverfish)")] += 1
            t[("block", "lava")] += 15
            t[("portal room depth",)] += p.depth
            s = sh.start.box
            t[("portal room, blocks from the start (x, z)",)] += max(abs((p.box[0] + p.box[3]) / 2 - 4), abs((p.box[2] + p.box[5]) / 2 - 4))
        if k not in ("start", "filler"):
            t[("door", p.door)] += 1
            if p.door == "iron_bars":
                t[("block", "iron_bars")] += SH_DOOR_BARS
            elif p.door == "iron_door":
                t[("block", "iron_door (doorways)")] += 1
                t[("block", "stone_button")] += 2
            elif p.door == "oak_door":
                t[("block", "oak_door")] += 1
        shell = SH_SHELL.get(k) if k != "library" else (906 if a["tall"] else 636)
        if shell:
            t[("block", "infested_stone_bricks (expected)")] += 0.05 * (shell - 9 * SH_OPENINGS.get(k, 0))
    xs = [v for p in pieces for v in (p.box[0], p.box[3])]
    zs = [v for p in pieces for v in (p.box[2], p.box[5])]
    t[("size", "across (x or z, the wider)")] += max(max(xs) - min(xs), max(zs) - min(zs)) + 1
    t[("size", "high")] += max(p.box[4] for p in pieces) - min(p.box[1] for p in pieces) + 1
    t[("Y", "top")] += max(p.box[4] for p in pieces) + sh.shift
    t[("Y", "bottom")] += min(p.box[1] for p in pieces) + sh.shift
    t[("Y", "start staircase's top")] += sh.start.box[4] + sh.shift
    t[("Y", "portal room's floor")] += sh.portal.box[1] + sh.shift
    return t


def stronghold_counts(n, seed=1):
    """Build n strongholds and tell, for each thing in them, its mean, least and most, and how many strongholds have it."""
    rng, runs = random.Random(seed), []
    for _ in range(n):
        sh = Stronghold(rng)
        pieces, tries = sh.build()
        runs.append(stronghold_tally(sh, pieces, tries))
    print(f"\n=== stronghold ({n} built)")
    for k in sorted({k for t in runs for k in t}, key=str):
        v = [t[k] for t in runs]
        hist = Counter(round(x) for x in v)
        print(f"  {' · '.join(k)}: mean {sum(v) / n:.3f}, {min(v):g}–{max(v):g}, in {sum(1 for x in v if x) / n:.1%}"
              + (f"; {', '.join(f'{x}: {hist[x] / n:.1%}' for x in sorted(hist))}" if len(hist) <= 12 else ""))
        if len(hist) > 12:
            s = sorted(v)
            print(f"      middle half {s[n // 4]:g}–{s[3 * n // 4]:g}, 5% {s[n // 20]:g}, 95% {s[19 * n // 20]:g}")


# ---------- The mineshaft: Java's MineshaftPieces ----------
# The mineshaft has no templates: every piece is built in code (26.3's MineshaftStructure and MineshaftPieces, from memory of them). Its
# layout is ported as it is, random calls in the same order; what each piece holds is counted from its postProcess (also from memory),
# drawing the same random numbers for each block, as if every piece were in solid stone:
#   - the start is a room (MineShaftRoom) 8 to 13 blocks each way and 5 to 10 high, at Y 50 (genDepth 0). Along each of its four walls in
#     turn, from one end: step on a random 0 to (the wall's length − 1); stop once that leaves under 3 blocks; else a piece out of the wall
#     at a random height 1 to (its height − 4) over its floor, then step 4 more.
#   - a piece (generateAndAddPiece): past depth 8, or more than 80 blocks (x or z) from the room's corner, nothing. Else a roll of 100:
#     80 and over a crossing, 70 to 79 stairs, under 70 a corridor; if its box overlaps a piece already placed, nothing (no second try).
#     Each piece adds its own children at once, depth first.
#   - a corridor: 2 to 4 sections of 5 blocks (fewer while the longer overlaps, nothing if even 1 does), 3 wide, 3 high. Rails 1 in 3;
#     without rails, a spider corridor 1 in 23. On from its end: 1 in 2 straight on, 1 in 4 left, 1 in 4 right (at its far end's last
#     4 blocks for a side turn), each 1 lower to 1 higher. Under depth 8, out of each side every 5 blocks (from its 4th): 1 in 5 left,
#     1 in 5 right, at depth + 2.
#   - a crossing: 5 by 5, 3 high, or 7 high 1 in 4 (two floors). Out of its three other sides, and from the upper floor of a tall one out
#     of all four, each 1 in 2.
#   - stairs: 9 long, 3 wide, going down 5; one piece on from its foot.
#   - then the whole is moved down so its top is at a random Y from its height − 63 up to 52 (moveBelowSeaLevel, as the stronghold). A
#     badlands mineshaft (MineshaftStructure.Type.MESA) is moved instead so its middle is at a random Y from sea level (63) up to the
#     ground there: that isn't modelled.
# What a corridor holds (postProcess): each section has a support 2 blocks in (two fences 2 high, and a beam of 3 planks, or 1 in 4 only
# its 2 ends with a torch 1 in 20 on each side of the beam); round it 8 cobwebs at the ceiling's corners (4 at 1 in 10, 4 at 1 in 20);
# a chest minecart on its rail 1 in 100 on either side of it (only where the block is still air: in a spider corridor its cobwebs
# take 3 in 5 of them). A spider corridor is filled with cobwebs 3 in 5 of its lower two layers before that, and has one cave spider
# spawner in the middle of its floor. A corridor with rails has one 7 in 10 of its floor's middle blocks. A crossing has a pillar of
# planks in each corner, 3 or 7 high. A room and stairs hold nothing (the room's dirt floor was taken out in 1.18).
# Not modelled, as it's the land's: a piece touching water or lava isn't built (isInInvalidLocation); where a corridor's floor is over
# a cave it gets planks under it and logs down to the ground or chains up to the roof, and where it's open to the sky no cobwebs, chest
# minecarts or rails; caves carved later cut through it all.
MS_N, MS_E, MS_S, MS_W = "north", "east", "south", "west"


class MSPiece:
    def __init__(self, kind, box, d, depth):
        self.kind, self.box, self.d, self.depth, self.attrs = kind, box, d, depth, {}


class Mineshaft:
    def __init__(self, rng):
        self.rng = rng

    def collision(self, box):
        return next((p for p in self.pieces if overlaps(p.box, box)), None)

    def corridor_box(self, x, y, z, d):
        for i in range(self.rng.randrange(3) + 2, 0, -1):
            n = i * 5
            b = {MS_N: (0, 0, -(n - 1), 2, 2, 0), MS_S: (0, 0, 0, 2, 2, n - 1), MS_W: (-(n - 1), 0, 0, 0, 2, 2), MS_E: (0, 0, 0, n - 1, 2, 2)}[d]
            b = (b[0] + x, b[1] + y, b[2] + z, b[3] + x, b[4] + y, b[5] + z)
            if self.collision(b) is None:
                return b
        return None

    def crossing_box(self, x, y, z, d):
        h = 6 if self.rng.randrange(4) == 0 else 2
        b = {MS_N: (-1, 0, -4, 3, h, 0), MS_S: (-1, 0, 0, 3, h, 4), MS_W: (-4, 0, -1, 0, h, 3), MS_E: (0, 0, -1, 4, h, 3)}[d]
        b = (b[0] + x, b[1] + y, b[2] + z, b[3] + x, b[4] + y, b[5] + z)
        return None if self.collision(b) else b

    def stairs_box(self, x, y, z, d):
        b = {MS_N: (0, -5, -8, 2, 2, 0), MS_S: (0, -5, 0, 2, 2, 8), MS_W: (-8, -5, 0, 0, 2, 2), MS_E: (0, -5, 0, 8, 2, 2)}[d]
        b = (b[0] + x, b[1] + y, b[2] + z, b[3] + x, b[4] + y, b[5] + z)
        return None if self.collision(b) else b

    def random_piece(self, x, y, z, d, depth):
        rng, r = self.rng, self.rng.randrange(100)
        if r >= 80:
            b = self.crossing_box(x, y, z, d)
            if b:
                p = MSPiece("crossing", b, d, depth)
                p.attrs = {"tall": b[4] - b[1] + 1 > 3}
                return p
        elif r >= 70:
            b = self.stairs_box(x, y, z, d)
            if b:
                return MSPiece("stairs", b, d, depth)
        else:
            b = self.corridor_box(x, y, z, d)
            if b:
                p = MSPiece("corridor", b, d, depth)
                rails = rng.randrange(3) == 0
                spider = not rails and rng.randrange(23) == 0
                span = (b[5] - b[2] + 1) if d in (MS_N, MS_S) else (b[3] - b[0] + 1)
                p.attrs = {"rails": rails, "spider": spider, "sections": span // 5}
                return p
        return None

    def add(self, x, y, z, d, depth):
        if depth > 8:
            return None
        s = self.start.box
        if abs(x - s[0]) <= 80 and abs(z - s[2]) <= 80:
            p = self.random_piece(x, y, z, d, depth + 1)
            if p:
                self.pieces.append(p)
                self.children(p)
            return p
        return None

    def children(self, p):
        rng, b, k, depth = self.rng, p.box, p.kind, p.depth
        if k == "room":
            xs, zs = b[3] - b[0] + 1, b[5] - b[2] + 1
            ys = max(b[4] - b[1] + 1 - 4, 1)
            for wall in (MS_N, MS_S, MS_W, MS_E):
                span, i = (xs if wall in (MS_N, MS_S) else zs), 0
                while i < span:
                    i += rng.randrange(span)
                    if i + 3 > span:
                        break
                    y = b[1] + rng.randrange(ys) + 1
                    at = {MS_N: (b[0] + i, y, b[2] - 1), MS_S: (b[0] + i, y, b[5] + 1), MS_W: (b[0] - 1, y, b[2] + i), MS_E: (b[3] + 1, y, b[2] + i)}[wall]
                    self.add(*at, wall, depth)
                    i += 4
        elif k == "corridor":
            r, d = rng.randrange(4), p.d
            y = b[1] - 1 + rng.randrange(3)
            if d == MS_N:
                [lambda: self.add(b[0], y, b[2] - 1, d, depth), lambda: self.add(b[0] - 1, y, b[2], MS_W, depth), lambda: self.add(b[3] + 1, y, b[2], MS_E, depth)][max(r - 1, 0)]()
            elif d == MS_S:
                [lambda: self.add(b[0], y, b[5] + 1, d, depth), lambda: self.add(b[0] - 1, y, b[5] - 3, MS_W, depth), lambda: self.add(b[3] + 1, y, b[5] - 3, MS_E, depth)][max(r - 1, 0)]()
            elif d == MS_W:
                [lambda: self.add(b[0] - 1, y, b[2], d, depth), lambda: self.add(b[0], y, b[2] - 1, MS_N, depth), lambda: self.add(b[0], y, b[5] + 1, MS_S, depth)][max(r - 1, 0)]()
            else:
                [lambda: self.add(b[3] + 1, y, b[2], d, depth), lambda: self.add(b[3] - 3, y, b[2] - 1, MS_N, depth), lambda: self.add(b[3] - 3, y, b[5] + 1, MS_S, depth)][max(r - 1, 0)]()
            if depth < 8:
                if d not in (MS_N, MS_S):
                    x = b[0] + 3
                    while x + 3 <= b[3]:
                        r2 = rng.randrange(5)
                        if r2 == 0: self.add(x, b[1], b[2] - 1, MS_N, depth + 1)
                        elif r2 == 1: self.add(x, b[1], b[5] + 1, MS_S, depth + 1)
                        x += 5
                else:
                    z = b[2] + 3
                    while z + 3 <= b[5]:
                        r2 = rng.randrange(5)
                        if r2 == 0: self.add(b[0] - 1, b[1], z, MS_W, depth + 1)
                        elif r2 == 1: self.add(b[3] + 1, b[1], z, MS_E, depth + 1)
                        z += 5
        elif k == "crossing":
            d = p.d
            outs = {MS_N: [(b[0] + 1, b[2] - 1, MS_N), (b[0] - 1, b[2] + 1, MS_W), (b[3] + 1, b[2] + 1, MS_E)],
                    MS_S: [(b[0] + 1, b[5] + 1, MS_S), (b[0] - 1, b[2] + 1, MS_W), (b[3] + 1, b[2] + 1, MS_E)],
                    MS_W: [(b[0] + 1, b[2] - 1, MS_N), (b[0] + 1, b[5] + 1, MS_S), (b[0] - 1, b[2] + 1, MS_W)],
                    MS_E: [(b[0] + 1, b[2] - 1, MS_N), (b[0] + 1, b[5] + 1, MS_S), (b[3] + 1, b[2] + 1, MS_E)]}[d]
            for x, z, dd in outs:
                self.add(x, b[1], z, dd, depth)
            if p.attrs["tall"]:
                for x, z, dd in [(b[0] + 1, b[2] - 1, MS_N), (b[0] - 1, b[2] + 1, MS_W), (b[3] + 1, b[2] + 1, MS_E), (b[0] + 1, b[5] + 1, MS_S)]:
                    if rng.random() < 0.5:
                        self.add(x, b[1] + 4, z, dd, depth)
        elif k == "stairs":
            d = p.d
            self.add(*{MS_N: (b[0], b[1], b[2] - 1), MS_S: (b[0], b[1], b[5] + 1), MS_W: (b[0] - 1, b[1], b[2]), MS_E: (b[3] + 1, b[1], b[2])}[d], d, depth)

    def build(self):
        rng = self.rng
        x, z = 2, 2
        self.start = MSPiece("room", (x, 50, z, x + 7 + rng.randrange(6), 54 + rng.randrange(6), z + 7 + rng.randrange(6)), None, 0)
        self.pieces = [self.start]
        self.children(self.start)
        lo, hi = min(p.box[1] for p in self.pieces), max(p.box[4] for p in self.pieces)
        top = hi - lo + 1 - 64 + 1
        if top < 53:
            top += rng.randrange(53 - top)
        self.shift = top - hi
        return self.pieces


def mineshaft_blocks(rng, p, t):
    """What a piece holds, counted from its postProcess with the same random draws, as if it were in solid stone."""
    k, a = p.kind, p.attrs
    t[("piece", k)] += 1
    if k == "crossing":
        t[("crossing", "two floors" if a["tall"] else "one floor")] += 1
        t[("block", "planks")] += 4 * (7 if a["tall"] else 3)
        t[("in a crossing", "planks")] += 4 * (7 if a["tall"] else 3)
        return
    if k != "corridor":
        return
    n = a["sections"]
    length = n * 5 - 1
    t[("corridor", "sections")] += n
    webs = set()
    if a["spider"]:
        t[("corridor", "spider corridor")] += 1
        for y in (0, 1):
            for x in range(3):
                for z in range(length + 1):
                    if rng.random() <= 0.6:
                        webs.add((x, y, z))
    if a["rails"]:
        t[("corridor", "with rails")] += 1
    for i in range(n):
        z = 2 + i * 5
        for x in (0, 2):  # the support's fences take what's there
            for y in (0, 1):
                webs.discard((x, y, z))
        t[("block", "fences")] += 4
        if rng.randrange(4) == 0:
            t[("block", "planks")] += 2
        else:
            t[("block", "planks")] += 3
            for _ in range(2):
                if rng.random() < 0.05:
                    t[("block", "torches")] += 1
        for chance, x, zz in [(0.1, 0, z - 1), (0.1, 2, z - 1), (0.1, 0, z + 1), (0.1, 2, z + 1), (0.05, 0, z - 2), (0.05, 2, z - 2), (0.05, 0, z + 2), (0.05, 2, z + 2)]:
            if rng.random() < chance:
                webs.add((x, 2, zz))
        for x, zz in ((2, z - 1), (0, z + 1)):
            if rng.randrange(100) == 0:
                if (x, 0, zz) in webs:
                    t[("chest minecart lost to a cobweb",)] += 1
                else:
                    t[("chest minecart",)] += 1
                    t[("block", "rails (under chest minecarts)")] += 1
                    t[("chest minecart", "in a spider corridor" if a["spider"] else "in a corridor with rails" if a["rails"] else "in a plain corridor")] += 1
        if a["spider"] and not t.get(("_spawner", id(p))):
            sz = z - 1 + rng.randrange(3)
            t[("_spawner", id(p))] = 1
            webs.discard((1, 0, sz))
            t[("spawner",)] += 1
    t[("block", "cobwebs")] += len(webs)
    if a["spider"]:
        t[("in a spider corridor", "cobwebs")] += len(webs)
    if a["rails"]:
        for z in range(length + 1):
            if rng.random() < 0.7:
                t[("block", "rails")] += 1


def mineshaft_tally(ms, pieces, rng):
    t = Counter()
    t[("pieces",)] += len(pieces)
    for p in pieces:
        mineshaft_blocks(rng, p, t)
    for k in [k for k in t if k[0] == "_spawner"]:
        del t[k]
    t[("depth", "deepest piece")] += max(p.depth for p in pieces)
    xs = [v for p in pieces for v in (p.box[0], p.box[3])]
    zs = [v for p in pieces for v in (p.box[2], p.box[5])]
    t[("size", "across (x or z, the wider)")] += max(max(xs) - min(xs), max(zs) - min(zs)) + 1
    t[("size", "high")] += max(p.box[4] for p in pieces) - min(p.box[1] for p in pieces) + 1
    t[("Y", "top")] += max(p.box[4] for p in pieces) + ms.shift
    t[("Y", "bottom")] += min(p.box[1] for p in pieces) + ms.shift
    t[("Y", "room's floor")] += ms.start.box[1] + ms.shift
    t[("corridor", "blocks long, all corridors")] += sum(p.attrs["sections"] * 5 for p in pieces if p.kind == "corridor")
    return t


def print_runs(name, runs):
    n = len(runs)
    print(f"\n=== {name} ({n} built)")
    for k in sorted({k for t in runs for k in t}, key=str):
        v = [t[k] for t in runs]
        hist = Counter(round(x) for x in v)
        print(f"  {' · '.join(k)}: mean {sum(v) / n:.3f}, {min(v):g}–{max(v):g}, in {sum(1 for x in v if x) / n:.1%}"
              + (f"; {', '.join(f'{x}: {hist[x] / n:.1%}' for x in sorted(hist))}" if len(hist) <= 12 else ""))
        if len(hist) > 12:
            s = sorted(v)
            print(f"      middle half {s[n // 4]:g}–{s[3 * n // 4]:g}, 5% {s[n // 20]:g}, 95% {s[19 * n // 20]:g}")


def mineshaft_counts(n, seed=1):
    """Build n mineshafts and tell, for each thing in them, its mean, least and most, and how many mineshafts have it."""
    rng, runs = random.Random(seed), []
    for _ in range(n):
        ms = Mineshaft(rng)
        runs.append(mineshaft_tally(ms, ms.build(), rng))
    print_runs("mineshaft", runs)


# ---------- The woodland mansion: Java's WoodlandMansionPieces ----------
# The mansion isn't a jigsaw: its layout is in code (26.3's WoodlandMansionStructure and WoodlandMansionPieces, from memory of them), and
# its rooms are templates (structure/woodland_mansion) whose data markers the code acts on: "ChestWest", "ChestSouth", "ChestNorth" (a
# chest of chests/woodland_mansion), "Warrior" (a vindicator), "Mage" (an evoker) and "Group of Allays" (half the times 1 to 3 allays: the 50% is
# the Minecraft Wiki's, the Allay page's). Ported as it is:
#   - MansionGrid: an 11 by 11 grid of 8-block cells, its outside blocked (5). Rows 0, 1, 9 and 10 are blocked; the entrance (3) is cells
#     7–8 by 4–5, with a room cell (2) west of it, corridors (1) north and south of it and cells 9–10 by 2–7 blocked. Four corridors are
#     dug west from beside it (recursiveCorridor: 6, 6, 3 and 3 cells long). Each step tries 8 times to turn a random way (not back, and
#     east only half the times it's drawn) where the next two cells are clear, and recurses there; then the clear cells round it become
#     rooms (2). Then cleanEdges, while it changes anything: a clear cell with 3 or 4 house neighbours, or 2 and at most 1 diagonal, is a
#     room.
#   - identifyRooms, for the first and second floors from that one grid, each on its own: the room cells shuffled; each not yet in a room
#     starts one: 2x2 if the three cells right and below (or left and below, or left and above) are free room cells, else 1x2 with the
#     right, below, left or above cell, else 1x1. A door goes on a random corner of it that touches a corridor (trying the others in a set
#     order); with none, the room has no door. Its first cell (or the door's) is its origin.
#   - the third floor (setupThirdFloor): one of the second floor's 1x2 rooms with a door is the stairs (c_stairs or d_stairs); over its far
#     cell a corridor of 4 is dug, in a random clear direction, and cleanEdges, inside the house's outline. With no such room or no clear
#     direction there's no third floor. Its rooms are identified as the others'.
#   - each room, from its origin: a 1x1 with a door gets one of the floor's 1x1s (first floor 1x1_a1–a5, the others 1x1_b1–b5); with
#     none, a secret 1x1_as1–as4. A 1x2 with its door on a long side gets 1x2_a1–a9 (first) or 1x2_c1–c4 (upper); with its door at an
#     end 1x2_b1–b5 or 1x2_d1–d5; the stairs room c_stairs or d_stairs; with no door a secret 1x2_s1–s2 (first) or 1x2_se1 (upper). A 2x2
#     with a door gets 2x2_a1–a4 (first) or 2x2_b1–b5 (upper), with none the secret 2x2_s1. Each pick is uniform.
#   - corridors: a corridor_floor in each corridor cell, carpets between corridor cells; indoor walls between rooms and corridors, a door
#     piece where the door is; the outer walls (wall_flat on the first floor, wall_window above) along the outline, wall_corner at each
#     outer corner; the entrance; and the roofs (roof, roof_front at the edges, roof_corner and roof_inner_corner, small_wall round
#     where the third floor rises).
# Not modelled, as it's the land's: the mansion is only made where the ground's lowest corner (of a square round its middle) is at Y 60
# or more, and cobblestone is filled under its first floor down to the ground. Pieces never clash (each cell is one piece), so nothing
# is dropped. Blocks are summed over every piece placed, so a block where two pieces meet (a wall over a floor's edge) can count twice.
MN_N, MN_E, MN_S, MN_W, MN_UP = (0, -1), (1, 0), (0, 1), (-1, 0), "up"
MN_CW = {MN_N: MN_E, MN_E: MN_S, MN_S: MN_W, MN_W: MN_N}
MN_CCW = {v: k for k, v in MN_CW.items()}
MN_OPP = {MN_N: MN_S, MN_S: MN_N, MN_E: MN_W, MN_W: MN_E}
MN_HORIZONTAL = [MN_N, MN_E, MN_S, MN_W]
MN_2D = [MN_S, MN_W, MN_N, MN_E]  # Direction.from2DDataValue
R1x1, R1x2, R2x2, ORIGIN, DOOR, STAIRS, CORR = 65536, 131072, 262144, 1048576, 2097152, 4194304, 8388608


class MGrid:
    def __init__(self, w, h, outside):
        self.w, self.h, self.outside = w, h, outside
        self.g = [[0] * h for _ in range(w)]

    def set(self, x, y, v):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.g[x][y] = v

    def fill(self, x0, y0, x1, y1, v):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.set(x, y, v)

    def get(self, x, y):
        return self.g[x][y] if 0 <= x < self.w and 0 <= y < self.h else self.outside

    def setif(self, x, y, old, v):
        if self.get(x, y) == old:
            self.set(x, y, v)

    def edges_to(self, x, y, v):
        return self.get(x - 1, y) == v or self.get(x + 1, y) == v or self.get(x, y + 1) == v or self.get(x, y - 1) == v


def is_house(g, x, y):
    return g.get(x, y) in (1, 2, 3, 4)


class Mansion:
    FIRST = {"1x1": lambda r: f"1x1_a{r.randrange(5) + 1}", "1x1s": lambda r: f"1x1_as{r.randrange(4) + 1}",
             "side": lambda r, st: f"1x2_a{r.randrange(9) + 1}", "front": lambda r, st: f"1x2_b{r.randrange(5) + 1}",
             "1x2s": lambda r: f"1x2_s{r.randrange(2) + 1}", "2x2": lambda r: f"2x2_a{r.randrange(4) + 1}", "2x2s": lambda r: "2x2_s1"}
    UPPER = {"1x1": lambda r: f"1x1_b{r.randrange(5) + 1}", "1x1s": lambda r: f"1x1_as{r.randrange(4) + 1}",
             "side": lambda r, st: "1x2_c_stairs" if st else f"1x2_c{r.randrange(4) + 1}",
             "front": lambda r, st: "1x2_d_stairs" if st else f"1x2_d{r.randrange(5) + 1}",
             "1x2s": lambda r: "1x2_se1", "2x2": lambda r: f"2x2_b{r.randrange(5) + 1}", "2x2s": lambda r: "2x2_s1"}

    def __init__(self, rng):
        self.rng = rng
        ex, ey = self.ex, self.ey = 7, 4
        g = self.base = MGrid(11, 11, 5)
        g.fill(ex, ey, ex + 1, ey + 1, 3)
        g.fill(ex - 1, ey, ex - 1, ey + 1, 2)
        g.fill(ex + 2, ey - 2, ex + 3, ey + 3, 5)
        g.fill(ex + 1, ey - 2, ex + 1, ey - 1, 1)
        g.fill(ex + 1, ey + 2, ex + 1, ey + 3, 1)
        g.set(ex - 1, ey - 1, 1)
        g.set(ex - 1, ey + 2, 1)
        g.fill(0, 0, 11, 1, 5)
        g.fill(0, 9, 11, 11, 5)
        self.corridor(g, ex, ey - 2, MN_W, 6)
        self.corridor(g, ex, ey + 3, MN_W, 6)
        self.corridor(g, ex - 2, ey - 1, MN_W, 3)
        self.corridor(g, ex - 2, ey + 2, MN_W, 3)
        while self.clean(g):
            pass
        self.rooms = [MGrid(11, 11, 5) for _ in range(3)]
        self.identify(g, self.rooms[0])
        self.identify(g, self.rooms[1])
        self.rooms[0].fill(ex + 1, ey, ex + 1, ey + 1, CORR)
        self.rooms[1].fill(ex + 1, ey, ex + 1, ey + 1, CORR)
        self.third = MGrid(11, 11, 5)
        self.setup_third()
        self.identify(self.third, self.rooms[2])

    def corridor(self, g, x, y, d, n):
        if n <= 0:
            return
        rng = self.rng
        g.set(x, y, 1)
        g.setif(x + d[0], y + d[1], 0, 1)
        for _ in range(8):
            d1 = MN_2D[rng.randrange(4)]
            if d1 != MN_OPP[d] and (d1 != MN_E or not rng.random() < 0.5):
                j, k = x + d[0], y + d[1]
                if g.get(j + d1[0], k + d1[1]) == 0 and g.get(j + d1[0] * 2, k + d1[1] * 2) == 0:
                    self.corridor(g, x + d[0] + d1[0], y + d[1] + d1[1], d1, n - 1)
                    break
        a, b = MN_CW[d], MN_CCW[d]
        for dx, dy in ((a[0], a[1]), (b[0], b[1]), (d[0] + a[0], d[1] + a[1]), (d[0] + b[0], d[1] + b[1]),
                       (d[0] * 2, d[1] * 2), (a[0] * 2, a[1] * 2), (b[0] * 2, b[1] * 2)):
            g.setif(x + dx, y + dy, 0, 2)

    @staticmethod
    def clean(g):
        changed = False
        for i in range(g.h):
            for j in range(g.w):
                if g.get(j, i) == 0:
                    k = is_house(g, j + 1, i) + is_house(g, j - 1, i) + is_house(g, j, i + 1) + is_house(g, j, i - 1)
                    if k >= 3:
                        g.set(j, i, 2)
                        changed = True
                    elif k == 2:
                        l = is_house(g, j + 1, i + 1) + is_house(g, j - 1, i + 1) + is_house(g, j + 1, i - 1) + is_house(g, j - 1, i - 1)
                        if l <= 1:
                            g.set(j, i, 2)
                            changed = True
        return changed

    def room_dir(self, x, y, floor, rid):
        for d in MN_HORIZONTAL:
            if (self.rooms[floor].get(x + d[0], y + d[1]) & 65535) == rid:
                return d
        return None

    def setup_third(self):
        rng, sg, t = self.rng, self.rooms[1], self.third
        cands = [(j, i) for i in range(t.h) for j in range(t.w) if (sg.get(j, i) & 983040) == R1x2 and sg.get(j, i) & DOOR]
        if not cands:
            t.fill(0, 0, t.w, t.h, 5)
            return
        a, b = cands[rng.randrange(len(cands))]
        v = sg.get(a, b)
        sg.set(a, b, v | STAIRS)
        d = self.room_dir(a, b, 1, v & 65535)
        x2, y2 = a + d[0], b + d[1]
        for j1 in range(t.h):
            for k1 in range(t.w):
                if not is_house(self.base, k1, j1):
                    t.set(k1, j1, 5)
                elif (k1, j1) == (a, b):
                    t.set(k1, j1, 3)
                elif (k1, j1) == (x2, y2):
                    t.set(k1, j1, 3)
                    self.rooms[2].set(k1, j1, CORR)
        dirs = [dd for dd in MN_HORIZONTAL if t.get(x2 + dd[0], y2 + dd[1]) == 0]
        if not dirs:
            t.fill(0, 0, t.w, t.h, 5)
            sg.set(a, b, v)
            return
        dd = dirs[rng.randrange(len(dirs))]
        self.corridor(t, x2 + dd[0], y2 + dd[1], dd, 4)
        while self.clean(t):
            pass

    def identify(self, g, rooms):
        rng = self.rng
        cells = [(j, i) for i in range(g.h) for j in range(g.w) if g.get(j, i) == 2]
        for i in range(len(cells) - 1, 0, -1):  # Util.shuffle
            k = rng.randrange(i + 1)
            cells[i], cells[k] = cells[k], cells[i]
        rid = 10
        free = lambda x, y: rooms.get(x, y) == 0 and g.get(x, y) == 2
        for l, l3 in cells:
            if rooms.get(l, l3) != 0:
                continue
            i1 = i4 = l
            j1 = k1 = l3
            kind = R1x1
            if free(l + 1, l3) and free(l, l3 + 1) and free(l + 1, l3 + 1):
                i4, k1, kind = l + 1, l3 + 1, R2x2
            elif free(l - 1, l3) and free(l, l3 + 1) and free(l - 1, l3 + 1):
                i1, k1, kind = l - 1, l3 + 1, R2x2
            elif free(l - 1, l3) and free(l, l3 - 1) and free(l - 1, l3 - 1):
                i1, j1, kind = l - 1, l3 - 1, R2x2
            elif free(l + 1, l3):
                i4, kind = l + 1, R1x2
            elif free(l, l3 + 1):
                k1, kind = l3 + 1, R1x2
            elif free(l - 1, l3):
                i1, kind = l - 1, R1x2
            elif free(l, l3 - 1):
                j1, kind = l3 - 1, R1x2
            i2 = i1 if rng.random() < 0.5 else i4
            j2 = j1 if rng.random() < 0.5 else k1
            door = DOOR
            if not g.edges_to(i2, j2, 1):
                i2 = i4 if i2 == i1 else i1
                j2 = k1 if j2 == j1 else j1
                if not g.edges_to(i2, j2, 1):
                    j2 = k1 if j2 == j1 else j1
                    if not g.edges_to(i2, j2, 1):
                        i2 = i4 if i2 == i1 else i1
                        j2 = k1 if j2 == j1 else j1
                        if not g.edges_to(i2, j2, 1):
                            door, i2, j2 = 0, i1, j1
            for y in range(j1, k1 + 1):
                for x in range(i1, i4 + 1):
                    rooms.set(x, y, (ORIGIN | door | kind | rid) if (x, y) == (i2, j2) else (kind | rid))
            rid += 1

    def outer_walls(self, g, sx, sy, ex, ey, t, wall):
        """traverseOuterWalls: walk the outline, a wall piece every cell and a corner at each outer turn."""
        i, j, d = sx, sy, MN_S
        start = MN_S
        while True:
            if not is_house(g, i + d[0], j + d[1]):
                t[("piece", "wall_corner")] += 1
                d = MN_CW[d]
                if (i, j, d) != (ex, ey, start):
                    t[("piece", wall)] += 1
            elif is_house(g, i + d[0] + MN_CCW[d][0], j + d[1] + MN_CCW[d][1]):
                i, j = i + d[0], j + d[1]
                d = MN_CCW[d]
            else:
                i, j = i + d[0], j + d[1]
                if (i, j, d) != (ex, ey, start):
                    t[("piece", wall)] += 1
            if (i, j, d) == (ex, ey, start):
                return

    def roof(self, g, above, t):
        H = lambda x, y: is_house(g, x, y)
        for i in range(g.h):
            for j in range(g.w):
                if H(j, i) and not (above and is_house(above, j, i)):
                    t[("piece", "roof")] += 1
                    t[("piece", "roof_front")] += (not H(j + 1, i)) + (not H(j - 1, i)) + (not H(j, i - 1)) + (not H(j, i + 1))
                    for dx in (1, -1):
                        if not H(j + dx, i):
                            for dy in (-1, 1):
                                if not H(j, i + dy):
                                    t[("piece", "roof_corner")] += 1
                                elif H(j + dx, i + dy):
                                    t[("piece", "roof_inner_corner")] += 1
                if above and H(j, i) and is_house(above, j, i):
                    t[("piece", "small_wall")] += (not H(j + 1, i)) + (not H(j - 1, i)) + (not H(j, i - 1)) + (not H(j, i + 1))
                    for dx in (1, -1):
                        if not H(j + dx, i):
                            t[("piece", "small_wall_corner")] += (not H(j, i - 1)) + (not H(j, i + 1))

    def build(self):
        """The pieces' names, counted, and the rooms placed: [(floor, template, kind)]."""
        rng, t, placed = self.rng, Counter(), []
        base, third = self.base, self.third
        t[("piece", "entrance")] += 1
        sx, sy = self.ex + 1, self.ey + 1
        self.outer_walls(base, sx, sy, self.ex + 1, self.ey, t, "wall_flat")
        self.outer_walls(base, sx, sy, self.ex + 1, self.ey, t, "wall_window")
        found = next(((l, k) for k in range(third.h) for l in range(third.w - 1, -1, -1) if is_house(third, l, k)), None)
        if found:
            t[("piece", "wall_window")] += 1
            self.outer_walls(third, found[0], found[1], found[0], found[1], t, "wall_window")
        self.roof(base, third, t)
        self.roof(third, None, t)
        for fl in range(3):
            rooms, g = self.rooms[fl], (third if fl == 2 else base)
            coll = self.FIRST if fl == 0 else self.UPPER
            for y in range(g.h):
                for x in range(g.w):
                    if g.get(x, y) == 1:
                        t[("piece", "corridor_floor")] += 1
                        for dx, dy, name in ((0, -1, "carpet_north"), (1, 0, "carpet_east"), (0, 1, "carpet_south_1" if fl == 0 else "carpet_south_2"),
                                             (-1, 0, "carpet_west_1" if fl == 0 else "carpet_west_2")):
                            if g.get(x + dx, y + dy) == 1 or rooms.get(x + dx, y + dy) & CORR:
                                t[("piece", name)] += 1
            wall, doorp = ("indoors_wall_1", "indoors_door_1") if fl == 0 else ("indoors_wall_2", "indoors_door_2")
            for y in range(g.h):
                for x in range(g.w):
                    f1 = fl == 2 and g.get(x, y) == 3
                    if not (g.get(x, y) == 2 or f1):
                        continue
                    v = rooms.get(x, y)
                    kind, rid = v & 983040, v & 65535
                    f1 = f1 and bool(v & CORR)
                    doors = [d for d in MN_HORIZONTAL if g.get(x + d[0], y + d[1]) == 1] if v & DOOR else []
                    d1 = doors[rng.randrange(len(doors))] if doors else (MN_UP if v & ORIGIN else None)
                    same = lambda xx, yy: (rooms.get(xx, yy) & 65535) == rid
                    if is_house(g, x - 1, y) and not same(x - 1, y):
                        t[("piece", doorp if d1 == MN_W else wall)] += 1
                    if g.get(x + 1, y) == 1 and not f1:
                        t[("piece", doorp if d1 == MN_E else wall)] += 1
                    if is_house(g, x, y + 1) and not same(x, y + 1):
                        t[("piece", doorp if d1 == MN_S else wall)] += 1
                    if g.get(x, y - 1) == 1 and not f1:
                        t[("piece", doorp if d1 == MN_N else wall)] += 1
                    if kind == R1x1:
                        name = coll["1x1"](rng) if d1 in MN_HORIZONTAL else coll["1x1s"](rng)
                        placed.append((fl, name, "1x1"))
                    elif kind == R1x2 and d1 is not None:
                        front = self.room_dir(x, y, fl, rid)
                        st = bool(v & STAIRS)
                        if d1 == MN_UP:
                            name = coll["1x2s"](rng)
                        elif d1 in (front, MN_OPP[front]):
                            name = coll["front"](rng, st)
                        else:
                            name = coll["side"](rng, st)
                        placed.append((fl, name, "1x2"))
                    elif kind == R2x2 and d1 is not None:
                        placed.append((fl, coll["2x2"](rng) if d1 != MN_UP else coll["2x2s"](rng), "2x2"))
        for fl, name, _ in placed:
            t[("piece", name)] += 1
        self.has_third = found is not None
        return t, placed


MANSION_SECRET = {"1x1_as1": "X room", "1x1_as2": "Spider room", "1x1_as3": "Obsidian room", "1x1_as4": "Birch pillar room",
                  "1x2_s1": "Clean chest room", "1x2_s2": "Fake End portal room", "1x2_se1": "Attic room", "2x2_s1": "Lava room"}


def mansion_templates(data):
    """Every template's blocks (air, structure voids and data markers left out), data markers and fixed chest contents."""
    out = {}
    for f in sorted((data.base / "structure" / "woodland_mansion").glob("*.nbt")):
        tp = nbt(f)
        pal = tp["palette"] if "palette" in tp else tp["palettes"][0]
        blocks, markers, fixed = Counter(), Counter(), []
        for b in tp["blocks"]:
            stt = pal[b["state"]]
            name = stt.get("Name", stt.get("id", "")).replace("minecraft:", "")
            e = b.get("nbt", {})
            if name == "structure_block" and e.get("mode") == "DATA":
                markers[e.get("metadata", "")] += 1
                continue
            if name in ("air", "structure_void", "jigsaw"):
                continue
            blocks[name] += 1
            if name in ("chest", "trapped_chest"):
                fixed.append((name, tuple((i["id"].replace("minecraft:", ""), i["count"], json.dumps(i.get("components", {}))) for i in e.get("Items", []))))
        out[f.stem] = {"blocks": blocks, "markers": markers, "fixed": fixed}
    return out


def mansion_counts(data, n, seed=1, loot=None):
    """Build n mansions and tell how many of each room, chest, mob and notable block they have, and how often each secret room."""
    rng, runs, tps = random.Random(seed), [], mansion_templates(data)
    for _ in range(n):
        m = Mansion(rng)
        pieces, placed = m.build()
        t = Counter()
        t[("third floor",)] += m.has_third
        for fl in range(3):
            t[("rooms", f"floor {fl + 1}")] += sum(1 for f, _, _ in placed if f == fl)
            t[("corridor cells", f"floor {fl + 1}")] += sum(1 for y in range(11) for x in range(11) if (m.third if fl == 2 else m.base).get(x, y) == 1)
        cells = [(x, y) for y in range(11) for x in range(11) if is_house(m.base, x, y)]
        t[("size", "cells across x")] += max(x for x, _ in cells) - min(x for x, _ in cells) + 1
        t[("size", "cells across y")] += max(y for _, y in cells) - min(y for _, y in cells) + 1
        t[("size", "house cells, floors 1 and 2")] += len(cells)
        t[("size", "house cells, floor 3")] += sum(1 for y in range(11) for x in range(11) if is_house(m.third, x, y))
        for fl, name, size in placed:
            t[("room", name)] += 1
            t[("room", name, f"floor {fl + 1}")] += 1
            t[("rooms", size)] += 1
            if name in MANSION_SECRET:
                t[("secret", MANSION_SECRET[name])] += 1
                t[("secret", "any")] += 1
        for (_, name), k in pieces.items():
            tp = tps[name]
            for b, c in tp["blocks"].items():
                t[("block", b)] += c * k
            for mk, c in tp["markers"].items():
                if mk.startswith("Chest"):
                    t[("chest",)] += c * k
                    t[("chest", "in", name)] += c * k
                elif mk == "Warrior":
                    t[("vindicator",)] += c * k
                    t[("vindicator", "in", name)] += c * k
                elif mk == "Mage":
                    t[("evoker",)] += c * k
                    t[("evoker", "in", name)] += c * k
                elif mk == "Group of Allays":
                    for _ in range(c * k):
                        t[("allay", "cells")] += 1
                        if rng.random() < 0.5:  # the Minecraft Wiki's Allay page: a 50% chance, in groups of 1 to 3
                            t[("allay",)] += rng.randrange(3) + 1
            for kind, items in tp["fixed"]:
                t[("fixed " + kind, name, ", ".join(f"{i}×{c}{'' if comp == '{}' else ' ' + comp}" for i, c, comp in items) or "empty")] += k
        runs.append(t)
    print_runs("woodland mansion", runs)
    if loot:
        # Each find's chance that a mansion has one, in either edition: 1 − the mean over the mansions of (1 − its chance a chest) ** chests.
        tables = [json.loads(line.split(": ", 1)[1].rstrip().rstrip(",")) for line in pathlib.Path(loot).read_text().splitlines()
                  if line.startswith('  "chests/woodland_mansion": ')]
        print("\n=== a mansion's chests: the chance it has at least one (java, bedrock)")
        for row in tables[0]:
            other = next((r for r in tables[1] if r[0] == row[0]), None)
            share = lambda p: 1 - sum((1 - p) ** t[("chest",)] for t in runs) / n
            print(f"  {row[0]} {row[1]}: {share(row[4]):.1%}, {share(other[4]) if other else 0:.1%}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--mineshaft":
        mineshaft_counts(int(sys.argv[2]) if len(sys.argv) > 2 else 5000)
        sys.exit()
    if len(sys.argv) > 1 and sys.argv[1] == "--stronghold":
        stronghold_counts(int(sys.argv[2]) if len(sys.argv) > 2 else 5000)
        sys.exit()
    d = Data(sys.argv[1])
    if sys.argv[2] == "--mansion":
        mansion_counts(d, int(sys.argv[3]) if len(sys.argv) > 3 else 5000, loot=sys.argv[4] if len(sys.argv) > 4 else None)
        sys.exit()
    if sys.argv[2] == "--end-city":
        end_city_counts(d, int(sys.argv[3]) if len(sys.argv) > 3 else 20000)
        sys.exit()
    report(d, sys.argv[2])
    if len(sys.argv) > 3 and sys.argv[3] == "--counts":
        st = json.loads((d.base / "worldgen" / "structure" / f"{sys.argv[4]}.json").read_text())
        anchor = None
        if "start_jigsaw_name" in st and "absolute" in st.get("start_height", {}):
            # The Overworld's bottom and top (dimension_type/overworld: min_y -64, height 384): the only dimension one is in now.
            anchor = (st["start_jigsaw_name"], st["start_height"]["absolute"], -64, 319)
        counts(d, sys.argv[2], st["size"], st.get("max_distance_from_center", 80), int(sys.argv[5]) if len(sys.argv) > 5 else 2000, anchor=anchor)
