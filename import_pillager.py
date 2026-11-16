"""Give the pillager the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_pillager.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, Krampus and Snowy ones went by the old pack's bones; the baby and
Halloween ones had the new models but nothing moved them). Its models, animations and controllers are its own, not the
vindicator's or the evoker's: it bobs where they sway. It has no kinds. The game has no babies
of it; the pack makes 1 in 200 pillagers babies by itself. In snowy biomes the pack dresses every pillager in its Snowy
look (with its biome looks setting on). It holds a crossbow (CROSSBOW). Run import_additions.py first.
"""
from import_parched import add_bow
from import_port import ia, port, put

# It stands bobbing, its body swaying and its arms and legs shifting with it (the pack's bob), its arms at its sides and
# its crossbow hanging in its right hand, as the game draws a pillager standing (the wiki's Bedrock render). The pack
# also plays a two-handed hold of its own all the while (crossbow_hold: its body turned, its left hand reaching across
# for the crossbow), which is left out: with the stage's crossbow it looked wrong. Also left out: its walk and run
# (weighted by how fast it moves), its turning steps, its head and pupils following its target (look_at_target), its
# brows lowered while it has a target (ovmxnb), loading and shooting its crossbow (an attack), its swim, jumps, falls and
# landing, riding a ravager and its deaths. The pack has no celebrating animation for it (the game's after a raid).
MOTIONS = [("bob", 1)]

# It blinks: its lids (6q6da5k) stretch down over its eyes for a moment, over its bobbing (keep). The pack blinks it every
# 0.5 to 2.5 seconds; the stage every 3 to 7, as the wandering trader's. The pack gives it no idles.
BLINK = {"every": [3, 7], "keep": True, "weight": 3, "parts": [("blinking.0", 0, None, [])]}
ACTS = [BLINK]

REMODEL = ["krampus", "snowy", "halloween"]

# The game's pillagers always carry a crossbow. The pack's (its attachable, minecraft:crossbow) is the game's unloaded
# crossbow sprite drawn as a texture mesh, which the stage can't draw: here it's a cube for each pixel, as the parched's
# bow (add_bow), on a copy of each look's skeleton (SKELETONS: the entity's geometry key for each look), in its right
# hand. The pack places the mesh in the game's terms for attachables, which the stage doesn't follow: the crossbow is
# placed by eye to match the wiki's Bedrock render of a standing pillager: gripped on the stock behind the trigger
# (CROSSBOW_GRIP), a little below and in front of the fist (CROSSBOW_HAND, from the rightitem bone's pivot), upright
# beside the leg, its bow low at the front and its butt rising back towards the chest (CROSSBOW_TURN, about the hand's
# x). The pack doesn't scale it down on a baby, whose full-size crossbow would hang through the ground: the stage holds
# it at half size (BABY_HAND: the baby look's rightitem scaled, a post-step), as the game draws a baby's held item.
SKELETONS = {"": "default", "krampus": "hltdtx", "snowy": "crvgzv", "baby": "apanel", "halloween": "vevqfw"}
CROSSBOW = "textures/items/crossbow_standby"
CROSSBOW_KEY = f"{ia.PREFIX}pillager_crossbow"
CROSSBOW_GRIP = (10, 10)
CROSSBOW_TURN = -60
CROSSBOW_HAND = (1, -5, -6)
BABY_HAND = 0.5


def baby_hand():
    """The baby's crossbow at half size."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["pillager"]
    look = next(l for l in looks if "Baby" in l["names"])
    look["pose"] = {**look.get("pose", {}), "rightitem": {"s": [BABY_HAND] * 3}}
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "pillager", looks))

# Its Halloween look (Helsing) carries one of three things at its belt, picked at random (v.rvgres, 0 to 2): a quiver of
# bolts, four potion vials or a wooden stake. The importer answers Math.random_integer(0, 2) with 1: the vials, which
# glow (faint texels on an emissive material, as its eyes are).

if __name__ == "__main__":
    port("pillager", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL)
    if ia.WRITE:
        add_bow("pillager", SKELETONS, "crossbow", CROSSBOW, CROSSBOW_KEY, CROSSBOW_GRIP, CROSSBOW_TURN,
                CROSSBOW_HAND)
        baby_hand()
