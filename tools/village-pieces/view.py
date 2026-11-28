"""A template's frontmost blocks from each side, a letter each (? for one with no letter), and beside them how far back each is: to pick
the side a piece reads best from (a house from its door's side, a roof of logs end on).

    python3 tools/village-pieces/view.py NSEW <template.nbt>...
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from pieces import load  # noqa: E402

SIDES = {"N": lambda x, z, sx, sz: (sx - 1 - x, z), "S": lambda x, z, sx, sz: (x, sz - 1 - z),
         "W": lambda x, z, sx, sz: (z, x), "E": lambda x, z, sx, sz: (sz - 1 - z, sx - 1 - x)}
CH = {"spruce_log": "Z", "spruce_planks": "P", "cobblestone": "C", "mossy_cobblestone": "M", "spruce_trapdoor": "t", "spruce_door": "D",
      "glass_pane": "g", "campfire": "F", "pumpkin": "O", "pumpkin_stem": "s", "fern": "f", "large_fern": "F", "grass_block": "G", "dirt": "d",
      "dirt_path": "p", "spruce_fence": "|", "cobblestone_wall": "#", "spruce_wood": "W", "bookshelf": "B", "smooth_sandstone": "S",
      "cut_sandstone": "C", "sand": "a", "sandstone": "s", "terracotta": "T", "water": "~", "bell": "B", "torch": "i", "wall_torch": "i",
      "jungle_door": "D", "potted_cactus": "c", "potted_dead_bush": "d", "cactus": "K", "hay_block": "H", "composter": "o", "wheat": "w",
      "farmland": "f", "packed_ice": "I", "blue_ice": "b", "snow_block": "N", "snow": "n", "stripped_spruce_wood": "W", "stripped_spruce_log": "L", "lantern": "l", "stone_bricks": "K", "diorite": "R", "light_gray_wool": "w"}


def show(path, side):
    (sx, sy, sz), bl = load(path)
    w = sx if side in "NS" else sz
    grid, dep, best = [["."] * w for _ in range(sy)], [[" "] * w for _ in range(sy)], {}
    for (x, y, z), (n, pr) in bl.items():
        c, d = SIDES[side](x, z, sx, sz)
        if (y, c) not in best or d < best[(y, c)][0]:
            best[(y, c)] = (d, n, pr)
    for (y, c), (d, n, pr) in best.items():
        ch = CH.get(n) or ("/" if "stairs" in n else ("^" if pr.get("type") == "top" else "_") if "slab" in n else "|" if "wall" in n or "fence" in n else "?")
        grid[sy - 1 - y][c], dep[sy - 1 - y][c] = ch, str(min(d, 9))
    print(path.split("/")[-1], side)
    for r, dd in zip(grid, dep):
        print("".join(r), " ", "".join(dd))


if __name__ == "__main__":
    for p in sys.argv[2:]:
        for s in sys.argv[1]:
            show(p, s)
