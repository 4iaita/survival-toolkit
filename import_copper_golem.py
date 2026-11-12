"""Give the copper golem the updated Actions & Stuff pack's models, animations and oxidation stages (see import_port.py).

    python3 import_copper_golem.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and Robot ones went by the old pack's bones; the others had the
new models but nothing moved them). The game oxidizes it as it does copper blocks (q.property('minecraft:oxidation_level'):
unaffected, exposed, weathered, oxidized): the pack gives every look a skin for each, which it prints for MOB_VARIANTS
(src/mob-data.js). Weathered and oxidized, its idles blink and spin the rod on its head differently (the pack's eye
animations for those stages): those acts are the "weathered" climate's (MOB_CLIMATES), which both rows pick. Run
import_additions.py first.
"""
import import_additions as ia
from import_port import port, put

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

# Fully oxidized, a copper golem can turn into a statue, a block the game keeps in one of four poses (standing,
# running, sitting, star) and at any stage of oxidation (an axe scrapes it back). The pack only reskins the statue as an
# item held in the hand, standing, and the game poses the block in its own code, so the poses here are made on the
# golem's own skeleton to look like the game's: degrees each bone turns (r) and how far the whole statue drops (root p).
# A statue doesn't move, and its eyes don't glow (the glowing layers and lit eyes are left off). They're its moods
# (MOB_MOODS), on a row of their own (MOOD_ROWS in src/mob-data.js).
STATUES = {
    "statue_standing": {},
    "statue_running": {"body": {"r": [-12, 0, 0]}, "head": {"r": [8, 0, 0]}, "rightarm": {"r": [-55, 0, 0]}, "leftarm": {"r": [45, 0, 0]},
                       "rightleg": {"r": [35, 0, 0]}, "leftleg": {"r": [-35, 0, 0]}, "root": {"p": [0, -0.5, 0]}},
    "statue_sitting": {"rightleg": {"r": [-90, 8, 0]}, "leftleg": {"r": [-90, -8, 0]}, "rightarm": {"r": [-25, 0, 0]},
                       "leftarm": {"r": [-25, 0, 0]}, "root": {"p": [0, -3, 0]}},
    "statue_star": {"rightarm": {"r": [0, 0, 70]}, "leftarm": {"r": [0, 0, -70]}, "rightleg": {"r": [0, 0, 18]},
                    "leftleg": {"r": [0, 0, -18]}, "head": {"r": [-8, 0, 0]}, "root": {"p": [0, -0.3, 0]}},
}


def statues():
    """MOB_MOODS' copper golem: every look again as each statue, still and unlit."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["copper_golem"]
    out = {}
    for mood, pose in STATUES.items():
        posed = []
        for look in looks:
            layers = []
            for layer in look["layers"]:
                flags = {k: v for k, v in (layer[3] if len(layer) > 3 else {}).items() if k not in ("litBones",)}
                if flags.get("glow"):
                    continue
                layers.append(layer[:3] + ([flags] if flags else []))
            both = {**look.get("pose", {})}
            for bone, p in pose.items():
                both[bone] = {**both.get(bone, {}), **p}
            posed.append({**{k: v for k, v in look.items() if k not in ("layers", "pose")}, "layers": layers, **({"pose": both} if both else {})})
        out[mood] = {"looks": posed, "motions": None, "act": None}
    ia.MODELS_JS.write_text(put(text, "MOB_MOODS", "copper_golem", out))


if __name__ == "__main__":
    port("copper_golem", variants=VARIANTS, answers=answers, acts=ACTS, motions=MOTIONS,
         remodel=["robot", "maid", "halloween"], nested_poses=True,
         climates={"weathered": {}}, climate_acts={"weathered": WEATHERED})
    if ia.WRITE:
        statues()
