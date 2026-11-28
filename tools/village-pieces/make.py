"""A village kind's pieces for src/backdrop.js, generated from Java's own templates: prints its <KIND>_BLOCKS and <KIND>_PIECES, to
paste over the ones there.

    python3 tools/village-pieces/make.py <java data> <kind>

<java data> is misode/mcmeta's `26.3-data` tag unpacked (see tools/structure-loot.py's header); the templates are its
data/minecraft/structure/village/<kind>/. <kind>.json beside this file names the pieces: {name: [template under structure/village/,
the side you look from (N, S, E, W), the columns kept ([c0, c1] or null for all), the lowest y kept (1 if not given: the ground layer
left out; 2 for a meeting point whose ground is y 1; 0 for a lamp post or decoration standing on the ground)]}. <kind>_fix.py, if
there is one, changes the result by hand (fix(d)) before it's printed, so a regenerate keeps those changes.

Pick a piece's side with view.py first. Only the taiga's spec was kept: the desert's and savanna's were made before this folder, with
an older gen.py (nothing behind any plant), so regenerating them would differ.
"""
import importlib.util
import json
import pathlib
import sys

here = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(here))
from gen import pieces  # noqa: E402


def emit(d, name):
    q = lambda rows: "[" + ", ".join(json.dumps(r) for r in rows) + "]"  # noqa: E731
    out = [f"const {name}_BLOCKS = {{ " + ", ".join(f"{k}: {json.dumps(v)}" for k, v in d["legend"].items()) + " };", f"const {name}_PIECES = {{"]
    for k, p in d["pieces"].items():
        out.append(f"  {k}: {{ rows: {q(p['rows'])},\n    depth: {q(p['depth'])},\n    behind: {q(p['behind'])},\n    behindDepth: {q(p['behindDepth'])} }},")
    return "\n".join(out + ["};"])


if __name__ == "__main__":
    data, kind = pathlib.Path(sys.argv[1]), sys.argv[2]
    d = pieces(json.loads((here / f"{kind}.json").read_text()), data / "data/minecraft/structure/village")
    fixer = here / f"{kind}_fix.py"
    if fixer.exists():
        spec = importlib.util.spec_from_file_location(f"{kind}_fix", fixer)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        mod.fix(d)
    print(emit(d, kind.upper()))
