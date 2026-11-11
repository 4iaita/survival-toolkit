"""Give the tropical fish the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_tropicalfish.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain one went by the old pack's bones, and nothing moved the baby's). The
game picks its shape (q.variant: small or large), its pattern (q.mark_variant: one of six for each shape) and two dye
colors, its body's and its pattern's (q.color and q.color2). The pack draws each shape with a model of its own (and a
baby model of its own), and each pattern as a white texture laid over the white body, the game tinting the body and the
pattern with their colors (its multiplicative material). So the large shape is a MOB_CLIMATES kind of its own (its looks'
layers, as the chicken's climates are), the patterns are skins (MOB_VARIANTS, src/mob-data.js, one kind per pattern),
and the colors are MOB_TINTS. Its names are only its baby's: the pack makes 1 in 5 tropical fish babies by itself (with
its setting). The stage shows it in the ocean. Run import_additions.py first.
"""
import json

from import_port import copy_texture, ia, im, port

# In the water it floats, rocking and bobbing, its fins and tail swaying (the pack's idle), and swims gently in place
# (the pack's swim, which plays as it moves: at half the strength the cod's and salmon's have, and at the speed the pack
# plays it at rest, so it drifts calmly rather than darting). Out of the water it flops, which the stage doesn't show;
# its turn as it swims does nothing standing.
MOTIONS = [("idle", 1), ("swim", 0.3, 0.5)]

# Every few seconds it flutters its fins and its body shivers (the pack's loop of a second, played again after 0 to 4
# seconds), over its floating (keep).
FLUTTER = {"every": [0.5, 4], "keep": True, "parts": [("xppdxg", 0, None, [])]}
ACTS = [FLUTTER]

# The patterns by shape, as the game numbers them (q.mark_variant 0 to 5), with their names.
PATTERNS = {"a": ["kob", "sunstreak", "snooper", "dasher", "brinely", "spotty"],
            "b": ["flopper", "stripey", "glitter", "blockfish", "betty", "clayfish"]}


def fix(d):
    """Its shape and pattern, which the game gives the pack's render controller as v.TropicalFish.Base (q.variant) and
    v.TropicalFish.Pattern (an index into all twelve patterns, the small shape's first)."""
    d["scripts"]["pre_animation"] = [*d["scripts"].get("pre_animation", []),
                                     "v.TropicalFish.Base=q.variant;v.TropicalFish.Pattern=q.variant*6+q.mark_variant;"]


def skins(d):
    """Each pattern's texture (pack path -> key), and MOB_VARIANTS' skins for each pattern: the plain look's pattern
    texture (the small shape's first) or the large shape's (its first) -> the pattern's own."""
    ents = im.read_pack()[0]
    textures = ents["minecraft:tropicalfish"]["textures"]
    paths, out = {}, {}
    for shape, names in PATTERNS.items():
        first = f"{ia.PREFIX}tropicalfish{'_large' if shape == 'b' else ''}_1"
        for i, name in enumerate(names):
            if i:
                key = f"{ia.PREFIX}tropicalfish_{name}"
                paths[textures[f"{shape}Pattern{i + 1}"]] = key
                out[name] = {first: key}
            else:
                out[name] = {}
    return paths, out


if __name__ == "__main__":
    port("tropicalfish", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, fix=fix,
         answers=lambda v: {"variant": 0.0, "mark_variant": 0.0}, climates={"large": {"variant": 1.0, "mark_variant": 0.0}})
    paths, out = skins(None)
    print("pattern skins:", json.dumps(out))
    if ia.WRITE:
        for path, key in sorted(paths.items(), key=lambda kv: kv[1]):
            copy_texture(path, key)
