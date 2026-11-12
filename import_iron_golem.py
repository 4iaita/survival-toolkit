"""Give the iron golem the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_iron_golem.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, Snowy, Dapper, Frankenstein and Claus ones went by the old
pack's bones; the others had the new models but nothing moved them). It has no kinds. The game cracks it as it loses
health (a quarter, half and three quarters gone): the pack draws the cracks as a layer over every look but the Butler,
and hunches it over when it's badly hurt; the stage shows those as its moods. Run import_additions.py first.
"""
import json

import import_additions as ia
from import_port import im, port, put

# An iron golem has 100 health; the importer's mobs have 20, which would crack it badly.
FULL = {"health": 100.0, "max_health": 100.0}

# It stands swaying slowly from side to side, its arms swinging a little with its body and its head bobbing (the pack's
# standing loop). That loop also steps it into its stance as it starts (its legs apart, its waist turned a little):
# the stage plays it from there on (SETTLED), or it'd step into it again every time the loop came round. The pack's
# head-look animations only turn it towards what it looks at, which the stage has none of, so they're left out; so is
# its walk, weighted by how fast it moves.
MOTIONS = [("jxaiyb", 1)]
SETTLED = "jxaiyb"

# Standing still for 0.3 seconds and then up to 5 more (the pack's idle controller), it does one of its three idles:
# looks about, its eyes sliding from side to side; leans, turning its head; or looks over its shoulder, swinging its
# arms as it does (the pack plays that one's arm swing, njgdbh, along with it, easing it in over a second and out
# again after 2.75: EASED). Each blends in and out over the controller's 0.3 seconds, over its swaying (keep).
IDLE = lambda parts: {"every": [0.3, 5.3], "keep": True, "ease": 0.3, "parts": parts}
LOOK_ROUND = IDLE([("ciducd", 0, None, [])])
LEAN = IDLE([("tculwn", 0, None, [])])
SHOULDER = IDLE([("qofebb", 0, 3.75, []), ("njgdbh_eased", 0, 3.75, [])])
ACTS = [LOOK_ROUND, LEAN, SHOULDER]
EASED = ("njgdbh", "njgdbh_eased", "(Math.hermite_blend(Math.min(1,q.anim_time))-Math.hermite_blend(Math.clamp(q.anim_time-2.75,0,1)))")

# Named Festive or Claus, it has a fourth idle (the pack picks one of the four alike): it takes a present out from
# behind its back and holds it out for 3 seconds (the pack's mryawo), then puts it away (egqotm). The pack shows the
# present (the hj6k6fl bones) from half a second in until half a second into putting it away.
PRESENT_SHOWN = [["hj6k6fl*", True], ["hj6k6fl3go*", True]]
PRESENT = IDLE([("mryawo", 0, 3, []), (None, 0.5, 3.5, PRESENT_SHOWN), ("egqotm", 3, None, [])])
FESTIVE = {"motions": MOTIONS, "acts": [*ACTS, PRESENT]}
FESTIVE_LOOK = "claus"

# Cracked: the pack's cracks layer, by health. Badly cracked (a quarter of its health or less) it stands hunched over,
# its body leaning forward and its arms hanging lower (the pack's hajzkj, held), and sways less (the loop the pack
# plays then, dgdcuo, in place of its standing one); it still does its idles.
HURT = [("dgdcuo", 1), ("hajzkj", 1, "held")]
MOODS = {
    "slightly_cracked": {"answers": {"health": 60.0}, "motions": MOTIONS, "act": ACTS},
    "cracked": {"answers": {"health": 40.0}, "motions": MOTIONS, "act": ACTS},
    "badly_cracked": {"answers": {"health": 20.0}, "motions": HURT, "act": ACTS},
}

# A look's set comes before its mood's loops on the stage, so badly cracked the Festive look plays a set of its own: hunched
# over, as the others are, with its present too.
FESTIVE_HURT = {"motions": HURT, "acts": [*ACTS, PRESENT]}
SETS = {"festive": FESTIVE, "festive_hurt": FESTIVE_HURT}
MOOD_PLAYS = {"badly_cracked": "festive_hurt"}

REMODEL = ["snowy", "dapper", "frankenstein", "claus", "cherry", "butler", "dappled"]

_read_pack = im.read_pack


def read_pack():
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:iron_golem"]["animations"]
    # The standing loop as it is once it has stepped into its stance (q.anim_time well past its first 1.25 seconds).
    key = d[SETTLED]
    anims[key] = json.loads(json.dumps(anims[key]).replace("q.anim_time", "10"))
    # The hunch is a pose with no length: held from its start.
    anims[d["hajzkj"]].setdefault("animation_length", 0)
    # The arm swing, eased in and out as the pack's controller weights it.
    src, new, weight = EASED
    swing = json.loads(json.dumps(anims[d[src]]))
    for channels in swing["bones"].values():
        for ch, v in channels.items():
            channels[ch] = [f"({x})*{weight}" for x in v]
    swing.pop("start_delay", None)
    anims[f"animation.{new}"] = swing
    d[new] = f"animation.{new}"
    return ents, rcs, geos, mats, anims, props, armors


def finish():
    """The cracks drawn over the golem, and each mood's Festive look playing its set (festive, or festive_hurt badly
    cracked; the mood's other looks none). Every look but the Butler is the golem and its cracks over it (an empty
    layer when it has none): the pack draws them on the same model, over it (over), where the stage would otherwise
    draw what's under them."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["iron_golem"]
    moods = ia.parse_section(text, "MOB_MOODS")["iron_golem"]
    for look in [*looks, *(look for spec in moods.values() for look in spec["looks"])]:
        for layer in look["layers"][1:]:
            del layer[3:]
            layer.append({"over": 1})
    for mood, spec in moods.items():
        for look in spec["looks"]:
            look.pop("plays", None)
            if (look["names"] or [""])[0] == FESTIVE_LOOK:
                look["plays"] = MOOD_PLAYS.get(mood, "festive")
    ia.MODELS_JS.write_text(put(put(text, "MOB_LOOKS", "iron_golem", looks), "MOB_MOODS", "iron_golem", moods))


if __name__ == "__main__":
    im.read_pack = read_pack
    port("iron_golem", variants=[""], acts=ACTS, motions=MOTIONS, answers=lambda v: dict(FULL), remodel=REMODEL,
         nested_poses=True, sets=SETS, plays={FESTIVE_LOOK: "festive"}, moods=MOODS)
    if ia.WRITE:
        finish()
