"""Give the mooshroom the updated Actions & Stuff pack's model, animations and variants (see import_port.py).

    python3 import_mooshroom.py path/to/unpacked/pack path/to/textures [--write]

Its two looks (adult and baby) get the pack's current models, its mushrooms a layer of their own; it breathes, and now
and then shakes its head and ears; and the brown kind's skins are copied beside the red one's. Run import_additions.py
first. It prints the skins to put in MOB_VARIANTS (src/mob-data.js).
"""
from import_port import port

VARIANTS = ["red", "brown"]  # the pack's q.variant 0 and 1

# The pack picks one of three idles (the same animation each time) every few seconds while it stands still: a shake of
# its head and ears. Its head-look animation turns the head relative to the entity, so the head stays level as the body
# dips (level_head).
ACTS = [{"every": [3, 8], "level_head": "head", "parts": [("ciducd", 0, None, [])]}]
MOTIONS = [("aujcyb", 1)]


# The zombie mooshroom (Halloween, Zombified) and its calf glow faintly where the skin says (their eyes), and come in
# brown too.
NAMED = ["halloween", "zombified calf"]


def fix(d):
    # The pack's render controller gives the red calf Texture.ifwclj, which the entity never defines (the game shows it
    # untextured); the red calf's skin is there under yybzhy, beside the brown calf's.
    d["textures"].setdefault("ifwclj", d["textures"]["yybzhy"])


if __name__ == "__main__":
    port("mooshroom", variants=VARIANTS, acts=ACTS, motions=MOTIONS, fix=fix, named=NAMED)
