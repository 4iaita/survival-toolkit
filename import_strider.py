"""Give the strider the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_strider.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Demon Stridling
and Halloween ones had the new models but nothing moved them). It has no kinds. The game has babies of it; the pack
makes none by itself (v.tocraa=0). Its names: Baby, Stridling and Sizzle (its baby), Demon Stridling and Baby Demon
(a baby in the demon costume) and Halloween and Demon (the demon costume: horns, bat wings and a tail, on a model of
its own with no bristles and no eyelids, drawn on an emissive material whose faint texels glow). Its saddle is a part
of the model the pack shows while it's saddled (MOB_SADDLES). A saddled Halloween strider is drawn on a model and
texture of their own (the costume's with the saddle): its look gets a second layer of that model with only the saddle
and its straps, shown while it's saddled (saddle()). (The pack's saddled costume texture has its red eyes opaque, not
glowing: the stage keeps them lit, as the costume's own texture has them.) Its entity is the only one for
minecraft:strider. Run import_additions.py first.
"""
from import_port import copy_texture, ia, im, port, put

# It stands as its walk leaves it standing (move, timed by the distance it's walked: its first frame, held), its body
# swaying and its bristles waving, as the pack has it while it carries a rider and stands still (oyabwp: 3.27 seconds
# round, as the old stage's loop). On its own the pack gives it nothing more while it stands. Left out: its walk, run
# and sprint, its eyes and body following its target (look_at_target), its sitting and swaying while it rides another
# strider, its jumps, falls and landing, and its deaths.
MOTIONS = [("move", 1, "held"), ("oyabwp", 1)]

# It blinks: its eyelids (6q6da5k) drop over its eyes for 0.15 seconds, after 0.5 to 2.5 seconds, as the pack's blink
# controller has it, over its swaying (keep). The demon costume has no eyelids: there it does nothing.
BLINK = {"every": [0.5, 2.5], "keep": True, "parts": [("blinking.0", 0, None, [])]}
ACTS = [BLINK]

REMODEL = ["demon stridling", "halloween"]


def saddle():
    """The Halloween look's saddle: a layer of the model the pack draws a saddled Halloween strider with, only its
    saddle and straps, which MOB_SADDLES shows."""
    ents, rcs, geos, mats, anims, _p, _a = im.read_pack()
    for g in geos.values():
        ia.rename_geo(g)
    d = ents["minecraft:strider"]
    layers, _, _ = im.look(d, rcs, mats, anims, "Halloween", mood={"is_saddled": 1.0})
    (geo, texs, _, _), = layers
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["strider"]
    look = next(l for l in looks if (l["names"] or [""])[0] == "halloween")
    key = f"{ia.PREFIX}strider_halloween_saddled"
    look["layers"].append([key, [key], [["*", False]]])
    copy_texture(texs[0], key)
    text = put(text, "MOB_MODELS", key, im.model(geos[geo]))
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "strider", looks))


if __name__ == "__main__":
    port("strider", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL)
    if ia.WRITE:
        saddle()
