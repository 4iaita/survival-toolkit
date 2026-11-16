"""Give the pillager the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_pillager.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, Krampus and Snowy ones went by the old pack's bones; the baby and
Halloween ones had the new models but nothing moved them). Its models, animations and controllers are its own, not the
vindicator's or the evoker's: it bobs where they sway, and holds its crossbow. It has no kinds. The game has no babies
of it; the pack makes 1 in 200 pillagers babies by itself. In snowy biomes the pack dresses every pillager in its Snowy
look (with its biome looks setting on). It holds a crossbow (CROSSBOW). Run import_additions.py first.
"""
from import_parched import add_bow
from import_port import ia, im, port

# It stands bobbing, its body swaying and its arms and legs shifting with it (the pack's bob), holding its crossbow in
# both hands (crossbow_hold, which the pack plays all the while: the game's pillagers always carry one): its body turned
# a little, its right hand low at its side on the stock and its left reaching across to hold the crossbow's front.
# Left out: its walk and run (weighted by how fast it moves), its turning steps, its head and pupils following its
# target (look_at_target), its brows lowered while it has a target (ovmxnb), loading and shooting its crossbow (an
# attack), its swim, jumps, falls and landing, riding a ravager and its deaths. The pack has no celebrating animation for
# it (the game's after a raid).
MOTIONS = [("bob", 1), ("crossbow_hold", 1, "held")]

# It blinks: its lids (6q6da5k) stretch down over its eyes for a moment, over its bobbing (keep). The pack blinks it every
# 0.5 to 2.5 seconds; the stage every 3 to 7, as the wandering trader's. The pack gives it no idles.
BLINK = {"every": [3, 7], "keep": True, "weight": 3, "parts": [("blinking.0", 0, None, [])]}
ACTS = [BLINK]

REMODEL = ["krampus", "snowy", "halloween"]

# The game's pillagers always carry a crossbow. The pack's (its attachable, minecraft:crossbow) is the game's unloaded
# crossbow sprite drawn as a texture mesh, which the stage can't draw: here it's a cube for each pixel, as the parched's
# bow (add_bow), on a copy of each look's skeleton (SKELETONS: the entity's geometry key for each look), in its right
# hand. The pack places the mesh in the game's terms for attachables, which the stage doesn't follow: the crossbow is
# turned (CROSSBOW_TURN) so that in the pack's hold pose its stock runs from the right fist (gripped behind the trigger,
# CROSSBOW_GRIP) forward to the left one, pointing ahead and a little to the left, its bow upright at the front, as the
# game's renders hold one. The pack doesn't scale it down on a baby, which holds a full-size crossbow.
SKELETONS = {"": "default", "krampus": "hltdtx", "snowy": "crvgzv", "baby": "apanel", "halloween": "vevqfw"}
CROSSBOW = "textures/items/crossbow_standby"
CROSSBOW_KEY = f"{ia.PREFIX}pillager_crossbow"
CROSSBOW_GRIP = (10, 10)
CROSSBOW_TURN = (-100, -30, 15)

# Its Halloween look (Helsing) carries one of three things at its belt, picked at random (v.rvgres, 0 to 2): a quiver of
# bolts, four potion vials or a wooden stake. The importer answers Math.random_integer(0, 2) with 1: the vials, which
# glow (faint texels on an emissive material, as its eyes are).

_read_pack = im.read_pack


def read_pack():
    """crossbow_hold, a pose with no length: 0, so it can be held."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    hold = anims[ents["minecraft:pillager"]["animations"]["crossbow_hold"]]
    hold.setdefault("animation_length", 0)
    return ents, rcs, geos, mats, anims, props, armors


if __name__ == "__main__":
    im.read_pack = read_pack
    port("pillager", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL)
    if ia.WRITE:
        add_bow("pillager", SKELETONS, "crossbow", CROSSBOW, CROSSBOW_KEY, CROSSBOW_GRIP, CROSSBOW_TURN)
