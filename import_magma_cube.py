"""Give the magma cube the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_magma_cube.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones; the baby one had the new model but
nothing moved it): eight slices stacked round a glowing core, two eyes on the third slice and two more on the fourth. It
has no kinds and no names but its baby's. Like the slime it comes in three sizes, which the game sets (q.variant 4, 2
and 1; MOB_SIZES, written as the slime's are, import_slime.py's sized()), the small one with a skin of its own (the game
gives it 1 health, q.max_health 1), and a magma cube named Baby (Magmaling, Ember) is drawn at the smallest size
whatever its own, as the pack's scale script has it (v.cdrzno?1:q.variant). The game has no babies of it and the pack
makes none (v.tocraa=0).

Its animations and controllers are mostly its own, not the slime's. The two entities share their jump, fall, landing and
pop controllers (and those for sounds and particles; not their deaths) and five animations (spdgoh, khtluj, lrubqe,
danrzs, dzsczz; the slime's under keys of its own): the slime lands with lrubqe, and the magma cube plays khtluj and
lrubqe only with v.bpolcy, which it never sets, and its pop (danrzs, then dzsczz) as it splits off a bigger one. Its
idle, blink, jump, fall, landing, look_at_target and rotate are its own: its idle squashes its whole body, where the
slime's squashes its jelly round the cube inside. Its entity is the only one for minecraft:magma_cube. Run
import_additions.py and import_slime.py first.
"""
from import_port import im, port
from import_slime import sized

SIZES = {"big": {"variant": 4.0, "max_health": 16.0}, "medium": {"variant": 2.0, "max_health": 4.0}, "small": {"variant": 1.0, "max_health": 1.0}}
ZOOMS = {"big": 1, "medium": 0.5, "small": 0.25}

# It stands squashing and stretching (the pack's idle), faster the smaller it is (anim_time_update: 1 + 4 over its size,
# kept between 0.5 and 1.75): twice as fast for a big magma cube, 2.75 times for a medium or small one. Left out: its
# slices following its target round (look_at_target), its turning step (rotate), its hop (jump, fall and landing: its
# slices spreading apart and falling back together), its pop as it splits off a bigger one, and its deaths. Standing, its
# slices sit stacked, as its model has them. The pack gives it no idles.
RATES = {"big": 2, "medium": 2.75, "small": 2.75}


def motions(size):
    return [("idle", 1, RATES[size])]


# It blinks: its eyes (mhh6j6q6k and dgo6j6q6k) squash shut for a tenth of a second and open again, the pack's blink, which
# it loops after 0.2 to 3.2 seconds, over its squashing (keep).
BLINK = {"every": [0.2, 3.2], "keep": True, "parts": [("blink", 0, None, [])]}
ACTS = [BLINK]
SETS = {size: {"motions": motions(size), "acts": ACTS} for size in ("medium", "small")}


def material_kind(kind_of):
    """The game's magma_cube material, which the pack names but doesn't define: its faint texels (the core, the eyes and
    the tops of the slices, alpha 2 or 3) glow, as on an emissive one."""
    return lambda name, mats: "lit" if name == "magma_cube" else kind_of(name, mats)


if __name__ == "__main__":
    im.material_kind = material_kind(im.material_kind)
    port("magma_cube", variants=[""], acts=ACTS, motions=motions("big"), answers=lambda v: SIZES["big"], sets=SETS)
    sized("magma_cube", SIZES, ZOOMS)
