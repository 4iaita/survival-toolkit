"""Give the creeper the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_creeper.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, Skeleton, Pig and Snowy ones went by the old pack's bones;
the biome ones had the new models but nothing moved them). It has no kinds. The game has no babies of it; the pack makes
1 in 200 creeper babies by itself. Struck by lightning it's charged (q.is_powered): the stage shows that as its mood
(MOODS), as the pack draws it. Run import_additions.py first.
"""
import json

from import_port import ia, im, keep_rims, port, put

# It stands bobbing on its four legs, its head nodding and its body swaying a little (the pack's bob). The pack gives it
# no idles. Its head turning to look at its target, its walk and its turning steps (weighted by how fast it moves and
# turns), its swim, its jumps and falls, its swelling before it explodes (an attack) and its death are left out.
MOTIONS = [("bob", 1)]

# Charged: the pack draws its body again in a charged skin (vbqbti, in place of its own: on every look but the Skeleton,
# the Pig and the Snowy one it's the plain creeper's, so the biome looks lose their flowers, sulfur and leaves), a
# glowing cyan outline round it (a rim: jgl2l6*, its parts again a little bigger, on an emissive material that only
# draws where the creeper isn't; keep_rims) that shimmers (vwpadn), and the lightning aura over it (masfnr, on the
# game's charged_creeper material: bright lines that scroll across it, drawn as a glow). It twitches, its body and head
# jerking about (nvplwb). The pack also tints the charged body a flickering cyan and draws it unlit, which the stage
# can't. MOOD_STAGE in src/mob-data.js runs the aura's scroll and shows it by day.
#
# vwpadn's shimmer is a jitter of two dozen speeds that only all come round together after 3 minutes: it's baked as a
# 3-second loop (a jump in the jitter every 3 seconds doesn't show). nvplwb plays at a weight that rises and falls with
# time (its blend_weight, which baked loops ignore): each channel is multiplied by it (nvplwb_weighted). Its speeds
# (53, 73 and 130 degrees a second, with the creeper's random offset, v.ngjrwv, at 0) would take 6 minutes to come
# round: they're 54, 72 and 126 here, so it loops every 20 seconds.
CHARGED = [("bob", 1), ("vwpadn", 1), ("nvplwb_weighted", 1)]

# Charged by lightning, the pack plays a jolt once: it leaps up with its legs splayed, shaking, and drops back (bvudml,
# a baby's legs splayed wider: biczoq, with ohknry's shaking), its body flashing to its skeleton and back (v.lbcbew on
# the jolt's timeline swaps in other layers, which the stage can't do: left out). The stage plays the jolt now and then
# while it's charged, over its bobbing (keep).
JOLT = {"every": [8, 16], "keep": True, "parts": [("bvudml", 0, None, []), ("ohknry", 0, None, [])]}
JOLT_BABY = {**JOLT, "parts": [("biczoq", 0, None, []), ("ohknry", 0, None, [])]}
MOODS = {"charged": {"answers": {"is_powered": 1.0}, "motions": CHARGED, "act": [JOLT]}}
# A look's set comes before its mood's loops on the stage, so the charged baby plays a set of its own (finish()).
SETS = {"charged_baby": {"motions": CHARGED, "acts": [JOLT_BABY]}}

REMODEL = ["skeleton", "pig", "snowy", "cherry", "blossom", "sulfur", "dappled", "poplar", "pale"]

_read_pack = im.read_pack


def read_pack():
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:creeper"]["animations"]
    shimmer = json.loads(json.dumps(anims[d["vwpadn"]]))
    shimmer["animation_length"] = 3
    anims["animation.vwpadn_cut"] = shimmer
    d["vwpadn"] = "animation.vwpadn_cut"
    text = json.dumps(anims[d["nvplwb"]]).replace("(q.anim_time+v.ngjrwv)", "q.anim_time")
    for old, new in (("*53)", "*54)"), ("*73)", "*72)"), ("*130)", "*126)")):
        text = text.replace(old, new)
    twitch = json.loads(text)
    weight = twitch.pop("blend_weight")
    for channels in twitch["bones"].values():
        for ch, v in channels.items():
            channels[ch] = [f"({x})*({weight})" for x in v]
    twitch["animation_length"] = 20
    anims["animation.nvplwb_weighted"] = twitch
    d["nvplwb_weighted"] = "animation.nvplwb_weighted"
    return ents, rcs, geos, mats, anims, props, armors


def material_kind(kind_of):
    """The game's charged_creeper material, which the pack names but doesn't define: light added on top (a glow)."""
    return lambda name, mats: "glow" if name == "charged_creeper" else kind_of(name, mats)


def finish():
    """The charged baby plays its own set (its splayed legs wider)."""
    text = ia.MODELS_JS.read_text()
    moods = ia.parse_section(text, "MOB_MOODS")["creeper"]
    for look in moods["charged"]["looks"]:
        look.pop("plays", None)
        if (look["names"] or [""])[0] == "baby":
            look["plays"] = "charged_baby"
    ia.MODELS_JS.write_text(put(text, "MOB_MOODS", "creeper", moods))


if __name__ == "__main__":
    im.read_pack = read_pack
    keep_rims()
    im.material_kind = material_kind(im.material_kind)
    port("creeper", variants=[""], acts=[], motions=MOTIONS, remodel=REMODEL, moods=MOODS, sets=SETS)
    if ia.WRITE:
        finish()
