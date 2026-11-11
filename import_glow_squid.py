"""Give the glow squid the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_glow_squid.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain and baby ones went by the old pack's bones). It has no kinds and no
names but its baby's. The stage shows it in a flooded cave. Run import_additions.py first.
"""
from import_port import ia, port, put
from import_squid import ACTS, MOTIONS, seat_tentacles

# It plays what the squid plays (its animations map lists the same ones): it pulses in the water and glances about now
# and then, its tentacles seated as the squid's are. The pack also turns its glow panel (the 8dgo bone) to face the
# camera, as the stage does with any soft glow.

# Its glow is one layer of soft light (the pack's additive glow layer): a panel on each eye, on that eye's bone, and a
# big one round the whole squid (8dgo, fsdyhky here), hung at the middle of its body. Drawn as one soft glow, each
# panel's light sat where the panel is, so the big one shone out in front of its face and the eyes shone through from
# behind. Split in two, as the Enderman's eyes are drawn: the eyes' light on each eye, fading out as its face turns
# away, and the halo's at the middle of its body, seen from any side.
HALO = "fsdyhky"


def split_glow(look):
    layers = []
    for layer in look["layers"]:
        flags = layer[3] if len(layer) > 3 else {}
        if not flags.get("glow"):
            layers.append(layer)
            continue
        model, texs, rules = layer[:3]
        layers.append([model, texs, [*rules, [HALO, False]], {**flags, "eyes": 1}])
        layers.append([model, texs, [*rules, ["*", False], [HALO, True]], {**flags, "halo": 1}])
    look["layers"] = layers
    return look


if __name__ == "__main__":
    port("glow_squid", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, share=["squid"], fix_geos=seat_tentacles)
    if ia.WRITE:
        text = ia.MODELS_JS.read_text()
        looks = [split_glow(look) for look in ia.parse_section(text, "MOB_LOOKS")["glow_squid"]]
        ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "glow_squid", looks))
