"""Give the copper golem the updated Actions & Stuff pack's models, animations and oxidation stages (see import_port.py).

    python3 import_copper_golem.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and Robot ones went by the old pack's bones; the others had the
new models but nothing moved them). The game oxidizes it as it does copper blocks (q.property('minecraft:oxidation_level'):
unaffected, exposed, weathered, oxidized): the pack gives every look a skin for each, which it prints for MOB_VARIANTS
(src/mob-data.js). Weathered and oxidized, its idles blink and spin the rod on its head differently (the pack's eye
animations for those stages): those acts are the "weathered" climate's (MOB_CLIMATES), which both rows pick. Run
import_additions.py first.
"""
from import_port import port

VARIANTS = ["", "exposed", "weathered", "oxidized"]


def answers(v):
    """What the game says for oxidation stage v, standing about with no chest to fill and nothing in its hand."""
    said = {"minecraft:oxidation_level": VARIANTS[v] or "unaffected", "minecraft:chest_interaction": "none"}
    return {"property": lambda p: said.get(p, 0.0)}


# It sways a little from foot to foot, its head swaying with it (the pack's idle). Its walk is weighted by how fast it
# moves, and its turning steps by how far it turns, so they're left out.
MOTIONS = [("idle", 1)]

# After 3 to 9 seconds standing (the pack's idle controller) it does one of two idles: looks round, or looks down at
# its hands and about; in both its eyes blink, and the rod on its head spins round twice (the pack plays its eye
# animation along with each). Each blends in over the controller's 0.25 seconds, over its swaying (keep). The pack also
# plays an idle when its stage of oxidation changes, and shakes itself after standing in the rain: the stage shows
# neither. Its chest sorting (taking and putting items) and holding an item are left out too.
IDLE = lambda key, eyes: {"every": [3, 9], "keep": True, "ease": 0.25, "parts": [(key, 0, None, []), (eyes, 0, None, [])]}
ACTS = [IDLE("tculwn", "xwuikj"), IDLE("qofebb", "pplhoh")]
# Weathered or oxidized, its eyes and rod are stiffer (the pack's other eye animations, by v.sbqzuh).
WEATHERED = [IDLE("tculwn", "iqrbsk"), IDLE("qofebb", "bmbehs")]

if __name__ == "__main__":
    port("copper_golem", variants=VARIANTS, answers=answers, acts=ACTS, motions=MOTIONS,
         remodel=["robot", "maid", "halloween"], nested_poses=True,
         climates={"weathered": {}}, climate_acts={"weathered": WEATHERED})
