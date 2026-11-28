"""A village template seen side on, as src/backdrop.js's pieceProp draws it: for each row and column the frontmost block's token (its
shape as seen from that side, and its Java name: see pieceBlock), how far back it is, and behind a block that doesn't fill its space
(a slab, a stair seen from its side, a fence, a torch, a door) the first whole block further back and how far. Used by make.py.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from pieces import load  # noqa: E402

DIRS = {"north": (0, -1), "south": (0, 1), "east": (1, 0), "west": (-1, 0)}
# side -> (to screen col and depth, the view's direction into the scene, the screen's right)
SIDES = {"N": (lambda x, z, sx, sz: (sx - 1 - x, z), (0, 1), (-1, 0)), "S": (lambda x, z, sx, sz: (x, sz - 1 - z), (0, -1), (1, 0)),
         "W": (lambda x, z, sx, sz: (z, x), (1, 0), (0, 1)), "E": (lambda x, z, sx, sz: (sz - 1 - z, sx - 1 - x), (-1, 0), (0, -1))}
SKIP = {"spruce_wall_sign", "purple_carpet", "spruce_pressure_plate", "acacia_pressure_plate", "red_carpet", "orange_carpet", "jungle_button", "stone_button", "sea_pickle", "white_carpet", "green_carpet", "lime_carpet", "chest", "ladder"}
def rel(d, v, r):
    d = DIRS[d]
    if d == (-v[0], -v[1]): return "front"
    if d == v: return "back"
    return "right" if d == r else "left"
def token(n, p, v, r):
    """(token, fills its space)"""
    if n.endswith("_bed"): return None
    tex = n.replace("_slab", "").replace("_stairs", "").replace("_wall", "")
    if n.endswith("_slab"):
        return (f"full:{tex}", True) if p["type"] == "double" else (f"slab:{tex}:{p['type']}", False)
    if n.endswith("_stairs"):
        p = {"half": "bottom", "shape": "straight", **p}  # a jigsaw's final state may name only its facing
        s = rel(p["facing"], v, r)
        shape = p.get("shape", "straight")
        if shape == "straight": return f"stair:{tex}:{s}:{p['half']}", s in ("front", "back")
        # A corner: its top quarter (outer) or the quarter it lacks (inner) at the corner of two directions, one across the view
        # (left or right) and one along it (front or back).
        f = DIRS[p["facing"]]
        cw, ccw = (-f[1], f[0]), (f[1], -f[0])
        name = lambda d: next(k for k, vv in DIRS.items() if vv == d)
        if shape.startswith("outer"):
            a, b = rel(p["facing"], v, r), rel(name(ccw if shape == "outer_left" else cw), v, r)
            lr, fb = (a, b) if a in ("left", "right") else (b, a)
            return f"stair:{tex}:corner-{lr}-{fb}:{p['half']}", False
        a, b = rel(name((-f[0], -f[1])), v, r), rel(name(cw if shape == "inner_left" else ccw), v, r)
        lr, fb = (a, b) if a in ("left", "right") else (b, a)
        # The quarter it lacks at the back: from the front it's whole; at the front: that side's top is set back.
        return (f"stair:{tex}:front:{p['half']}" if fb == "back" else f"stair:{tex}:inner-{lr}:{p['half']}"), True
    if n.endswith("_wall") or n.endswith("_fence") or n.endswith("_pane") or n == "iron_bars":
        sides = {rel(d, v, r): p.get(d, "false") for d in DIRS}
        return f"wall:{n}:{p.get('up', 'true')}:{sides['left']}:{sides['right']}:{sides['front']}", False
    if n.endswith("_door"):
        s = rel(p["facing"], v, r)
        if p["open"] == "true": s = {"front": "left", "back": "right", "left": "back", "right": "front"}[s]  # turned on its hinge, roughly
        face = s in ("front", "back")
        # Not whole: what's behind a door shows through its window.
        return f"door:{n}:{p['half']}:{'face' if face else ('left' if s == 'right' else 'right')}:{p['hinge']}", False
    if n.endswith("_trapdoor"):
        # Closed: a plate 3 texels thick at the block's top or bottom. Open: stood up against the side away from its facing.
        if p.get("open") != "true": return f"trap:{n}:{p['half']}", False
        opp = {"north": "south", "south": "north", "east": "west", "west": "east"}[p["facing"]]
        s = rel(opp, v, r)
        return f"trap:{n}:open-{s}", s in ("front", "back")
    if n == "campfire": return "campfire", False
    if n in ("fern", "large_fern", "pumpkin_stem", "sweet_berry_bush"): return f"plant:{n}:{p.get('half', '')}", False
    if n in ("torch", "wall_torch"): return "torch", False
    if n.endswith("_wall_banner"): return f"banner:{n[:-12]}:{rel(p['facing'], v, r)}", False
    if n in ("short_grass", "tall_grass", "poppy", "dandelion", "acacia_sapling") or n.endswith("_carpet") or n.endswith("pressure_plate"): return f"plant:{n}:{p.get('half', '')}", False
    if n == "water": return "water", False
    if n == "snow": return (f"snow:{p.get('layers', '1')}", p.get("layers") == "8")
    if n == "lantern": return f"lantern:{p.get('hanging', 'false')}", False
    if n.startswith("potted_"): return f"pot:{n[7:]}", False
    if n == "wheat": return f"wheat:{p['age']}", False
    if n == "bell": return ("bell" if p.get("attachment", "floor") == "floor" else f"bell:{p['attachment']}"), False
    if n.endswith("glazed_terracotta"): return f"glazed:{n}:{rel(p['facing'], v, r)}", True
    if "axis" in p:
        a = p["axis"]
        return (f"full:{n}" if a == "y" else f"end:{n}" if (a == "z") == (v[0] == 0) else f"turn:{n}"), True
    return f"full:{n}", True
def view(path, side, cols=None, low=1):
    (sx, sy, sz), bl = load(path)
    f, v, r = SIDES[side]
    w = sx if side in "NS" else sz
    cells = {}
    for (x, y, z), (n, p) in bl.items():
        if y < low or n in SKIP: continue
        t = token(n, p, v, r)
        if not t: continue
        c, d = f(x, z, sx, sz)
        cells.setdefault((y, c), []).append((d, t))
    c0, c1 = cols or (0, w)
    h = sy
    out = []
    for y in range(h - 1, low - 1, -1):
        row = []
        for c in range(c0, c1):
            line = sorted(cells.get((y, c), []))
            if not line: row.append(None); continue
            d, (t, full) = line[0]
            # Nothing behind a plant: through a crop you'd see more of it, not the block at the far end.
            # Behind a crop nothing (through it you'd see more of the crop, not the block at the far end); behind another plant (a
            # fern by a wall), a whole block up to two back.
            crop = t.split(":")[0] == "wheat"
            back = next(((dd, tt) for dd, (tt, ff) in line[1:] if ff), None) if not full and not crop else None
            if t.startswith("plant:"):
                win = lambda tt: tt.startswith("door:") or (tt.startswith("wall:") and tt.split(":")[1].endswith(("_pane", "_fence")))
                back = next(((dd, tt) for dd, (tt, ff) in line[1:] if ff or win(tt)), None)
                if back and back[0] - d > 2: back = None
            # A bell behind a lantern or a fence shows round it (meeting points hang both).
            if not full and not back: back = next(((dd, tt) for dd, (tt, ff) in line[1:] if tt.startswith("bell")), None)
            # A thin layer of snow shows a wall standing behind it (a chimney on the roof); not the roof's eaves further back.
            if not full and not back and t.startswith("snow:"): back = next(((dd, tt) for dd, (tt, ff) in line[1:] if tt.startswith("wall:") and not tt.endswith("_pane")), None)
            row.append((t, d, back))
        out.append(row)
    while out and all(c is None for c in out[0]): out.pop(0)
    return out
LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+=?<>"


def pieces(spec, village):
    """spec: {name: [template under structure/village/, side N|S|E|W, [c0, c1] or None, the lowest y kept]} -> {legend, pieces}."""
    tokens, res = [], {}

    def ch(t):
        if t not in tokens:
            tokens.append(t)
        return LETTERS[tokens.index(t)]
    for name, (path, side, *rest) in spec.items():
        rows = view(str(village / path), side, rest[0] if rest else None, rest[1] if len(rest) > 1 else 1)
        dmin = min(c[1] for row in rows for c in row if c)
        res[name] = {
            "rows": ["".join(ch(c[0]) if c else "." for c in row) for row in rows],
            "depth": ["".join(str(min(9, c[1] - dmin)) if c else "." for c in row) for row in rows],
            "behind": ["".join(ch(c[2][1]) if c and c[2] else "." for c in row) for row in rows],
            "behindDepth": ["".join(str(min(9, c[2][0] - dmin)) if c and c[2] else "." for c in row) for row in rows],
        }
    return {"legend": {LETTERS[i]: t for i, t in enumerate(tokens)}, "pieces": res}
