"""Give the frog the updated Actions & Stuff pack's models, animations and kinds (see import_port.py).

    python3 import_frog.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones; the others had the new models
but nothing moved them, and the frog had no animations at all), and the skins of its three kinds (the pack's q.variant
0 to 2: temperate, cold and warm, a skin of their own on the same model; the game picks it by the biome a tadpole grows
up in). The baby, Baby Imp and Halloween looks have a skin for each kind too; Rana, Rhadora and Sapo keep their own.
Run import_additions.py first. It prints the skins to put in MOB_VARIANTS (src/mob-data.js).
"""
from import_port import ia, port, put

VARIANTS = ["temperate", "cold", "warm"]

# It breathes, its body swaying a little, all the while (the pack's standing loop). The pack's head-look loop only
# turns it towards what it looks at, which the stage has none of, so it's left out; so is its walk, weighted by how fast
# it moves.
MOTIONS = [("idle", 1)]

# Its eyes dip into its head for a moment, one after the other (the pack plays its two eye-dips one after another, each
# after a wait of up to 3.8 seconds), over its breathing (keep); and now and then it croaks, its throat swelling three
# times (the pack's croak, which the game plays now and then).
DIPS = [{"every": [1, 4], "keep": True, "weight": 3, "parts": [(key, 0, None, [])]} for key in ("rilkfa", "gmfucc")]
CROAK = {"every": [3, 7], "keep": True, "parts": [("croak", 0, None, [])]}
ACTS = [*DIPS, CROAK]

# Rana, Rhadora and Sapo have eyes of their own, with lids the pack keeps out of sight (its loop shrinks them to nothing)
# until they blink (their own blink, every 1.25 to 3.75 seconds: the lids come down over the eyes as they sink back). The
# stage can't undo a shrink, so the lids are hidden by the looks' rules instead and shown while they blink. Their model
# has neither the frog's eyes nor its throat: the frog's eye dips would only jerk the whole body back and forth (a
# stutter), and its croak would show nothing, so they only blink.
LIDS = "j2f26q63dafc*"
OWN_EYES = {"motions": [("idle", 1)],
            "acts": [{"every": [1, 4], "keep": True, "weight": 3, "parts": [("blink", 0, None, [[LIDS, True]])]}]}
PLAYS = {"rana": "own_eyes", "rhadora": "own_eyes", "sapo": "own_eyes"}

NAMED = ["baby imp", "rana", "rhadora", "sapo", "halloween"]

if __name__ == "__main__":
    port("frog", variants=VARIANTS, acts=ACTS, motions=MOTIONS, remodel=NAMED, sets={"own_eyes": OWN_EYES}, plays=PLAYS, nested_poses=True)
    if ia.WRITE:
        text = ia.MODELS_JS.read_text()
        looks = ia.parse_section(text, "MOB_LOOKS")["frog"]
        for look in looks:
            if look.get("plays") == "own_eyes":
                # The pack's lid loop is in their pose too (its controller's first state): the rules hide the lids instead.
                pose = {b: p for b, p in look.get("pose", {}).items() if not b.startswith(LIDS[:-1])}
                if pose:
                    look["pose"] = pose
                else:
                    look.pop("pose", None)
                for layer in look["layers"]:
                    if [LIDS, False] not in layer[2]:
                        layer[2].append([LIDS, False])
        ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "frog", looks))
