"""Give the breeze the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_breeze.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones; the baby one had the new model but
nothing moved it): a head with glowing eyes on three rods, and its wind, a model of its own (three spinning rings of
see-through wind, drawn unlit, its texture sliding round). It has no kinds and no names but its baby's (the pack makes 1
in 200 breezes babies by itself; the game has none), whose wind is the grown breeze's, as big. Its entity (entity/duk.json)
is the only one for minecraft:breeze. Its scripts set biome variables (snowy, cherry, sulfur, dappled, pale) that nothing
it draws reads. Run import_additions.py first.

The pack draws it in two states, by whether it has a target: with none it calms down (its wind shrinks to nothing, it
sinks 6 pixels and its rods hang straight down); with one it whirls (its wind spreads out again, it rises and its rods
splay out 25 degrees), and its sway and spin go twice as fast. The stage shows it whirling only, as the pack draws it
with a target: its wind always slides round it (MOOD_STAGE in src/mob-data.js).
"""
import json

from import_port import im, port

_read_pack = im.read_pack


def read_pack():
    """The spin as a loop the importer can bake: the pack turns its rods (jg5k) by a variable it adds 270 degrees a
    second to (v.pgcoey, twice that with a target), which baked_loop can't follow. Here it turns them by q.anim_time, a
    full turn in 4/3 of a second."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:breeze"]["animations"]
    spin = json.loads(json.dumps(anims[d["spin"]]))
    spin.pop("anim_time_update", None)
    spin["animation_length"] = 4 / 3
    spin["bones"]["jg5k"]["rotation"] = [0, "q.anim_time*270", 0]
    anims["animation.breeze_spin"] = spin
    d["spin_baked"] = "animation.breeze_spin"
    return ents, rcs, geos, mats, anims, props, armors


# It hovers whirling: its head and wind swaying (the pack's idle, which its anim_time_update plays 3 times as fast with a
# target), its rods spinning round under it twice as fast as calm (540 degrees a second), wound up (the pack's czfrre,
# held at its end: its wind spread out, risen, rods splayed). Left out: calming down and its calm loop (no target), its
# head and pupils turning to its target (target, which also turns a bone holding only a locator), its slide (weighted by
# how fast it moves, 0.01 standing), its jump, its shot (an attack), its flinch when hurt, its deaths, and its sounds and
# particles.
WHIRLING = [("idle", 1, 3), ("spin_baked", 1, 2), ("czfrre", 1, "held")]

# Every 0.5 to 2.5 seconds it blinks: its pupils stretch over its eyes for 0.15 seconds (the pack's blink), at half speed
# so it's seen, over its hovering (keep). The pack gives it no other idles.
BLINK = {"every": [0.5, 2.5], "keep": True, "parts": [("blink", 0, None, [], 0.5)]}
ACTS = [BLINK]


if __name__ == "__main__":
    im.read_pack = read_pack
    port("breeze", variants=[""], acts=ACTS, motions=WHIRLING, answers=lambda v: {"has_target": 1.0})
