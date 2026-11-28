"""A village template's blocks: {(x, y, z): (name, properties)}, air left out, a jigsaw block as its final state (the block it becomes
once the piece is placed: read as air, it left a hole in a desert house's wall). Reads the NBT with tools/structure-pieces.py's nbt.

    python3 tools/village-pieces/pieces.py <template.nbt>...   (each one's size and blocks, most first)
"""
import collections
import importlib.util
import pathlib
import sys

_spec = importlib.util.spec_from_file_location("structure_pieces", pathlib.Path(__file__).resolve().parent.parent / "structure-pieces.py")
_sp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_sp)


def load(path):
    t = _sp.nbt(path)
    pal = t["palette"] if "palette" in t else t["palettes"][0]
    blocks = {}
    for b in t["blocks"]:
        st = pal[b["state"]]
        n = st.get("Name", st.get("id", "")).replace("minecraft:", "")
        props = st.get("Properties", st.get("properties", {}))
        if n == "jigsaw":
            fs = (b.get("nbt") or {}).get("final_state", "minecraft:air")
            n, _, rest = fs.replace("minecraft:", "").partition("[")
            props = dict(kv.split("=") for kv in rest.rstrip("]").split(",")) if rest else {}
        if n in ("air", "cave_air", "structure_void"):
            continue
        blocks[tuple(b["pos"])] = (n, props)
    return t["size"], blocks


if __name__ == "__main__":
    for p in sys.argv[1:]:
        size, bl = load(p)
        print(p.split("/")[-1], size, dict(collections.Counter(n for n, _ in bl.values()).most_common()))
