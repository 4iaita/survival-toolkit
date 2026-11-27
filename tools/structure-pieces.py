"""Walk a jigsaw structure's pieces in Java's files and tell what each piece holds: its containers (by loot table), its spawners, its
mobs (the entities saved in the piece), its notable blocks, and the pools its jigsaws lead to.

    python3 tools/structure-pieces.py <java data> <start pool> [--counts <structure> [how many]]
    python3 tools/structure-pieces.py <java data> --end-city [how many]

<java data> is misode/mcmeta's `26.3-data` tag unpacked (see tools/structure-loot.py's header); <start pool> is a template pool's id
without "minecraft:", such as bastion/starts or trial_chambers/chamber/end. Each element of the start pool is a kind of the structure
(a bastion's four), walked on its own through every pool its jigsaws name.

With --counts it also builds the structure (worldgen/structure/<structure>.json: its size and max_distance_from_center) that many
times (2000) as Java's JigsawPlacement does, pieces' boxes and all (see build), and gives, for each kind, the mean, least and most of
each container (by loot table, and by the folder of pieces it's in), spawner and mob, the gold blocks left after the processors' decay,
and how often it has at least one. The game's own random numbers aren't used, so these are the game's odds, not any one seed's.

--end-city builds that many end cities (20000) as Java's EndCityPieces does (see EndCity), and counts the data markers in its pieces
(chests, shulkers, the elytra) and the ship.
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


if __name__ == "__main__":
    d = Data(sys.argv[1])
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
