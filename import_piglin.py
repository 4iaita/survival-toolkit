"""Give the piglin the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_piglin.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Baby Butcher and
Halloween ones had the new models but nothing moved them). Its models are the piglin brute's too (the same geometry, on
the brute's own textures), but not the zombified piglin's; its blink and idles and their controllers are the brute's
and the zombified piglin's, the same animations, but its stances are its own. It has no kinds the stage shows: the
game's q.variant only says what it carries (0 a crossbow, 1 a golden sword), and the pack gives each its own stance. The
game has babies of it; the pack makes none by itself (v.tocraa=0), and a baby named Baby is drawn as the game's own
(the same big head and sway). Its eyes (3dafc, on an emissive material) are lit, and its glow panels (8dgo1 and 8dgo2,
over its eyes) fade in over seconds (v.habcyx); the Halloween costume hides them (the pack's overlay blacks them out),
and babies have none. Its entity is the only one for minecraft:piglin. Run import_additions.py first.
"""
import import_additions as ia
from import_port import im, port, put

im.GLOW_STRENGTH = "habcyx"

# It stands as a piglin with a golden sword does (q.variant 1): swaying, its head nodding and its ears flicking (the
# pack's uvuvat, 1.6 seconds round), its arms eased a little out and one foot a little forward (hrllie, the pose the pack
# eases into when it stands still, held). The stage shows nothing in its hands. Left out: the crossbow piglin's stance
# (q.variant 0: a slower sway, tytiby, with its arms held up and across as if carrying a crossbow, vdhjyz), its head
# following what it looks at (nnxixp), its walks and runs (by move speed), fleeing, its crossbow drawn and fired, its
# attacks, admiring gold (it holds a gold ingot up and looks it over, egezmj: the stage has no ingot to show), riding a
# hoglin or anything else, jumps, falls, landing and its deaths. The pack has no dance after a hunt and no shake while it
# turns into a zombified piglin in the Overworld (q.is_shaking only turns its body as it dies).
MOTIONS = [("vnxdqo", 1), ("dwdraj", 1, "held")]

# It blinks: its open eyes (3dafc) and its glow panels shrink to nothing for 0.15 seconds, every 1 to 3.75 seconds (the
# pack's blink controller), over its stance (keep).
BLINK = {"every": [1, 3.75], "keep": True, "parts": [("blinking.step_eye", 0, None, [])]}
# Now and then, as the pack's idle controller has it (0.3 seconds after it stops, then 0 to 6.33 seconds more), it does
# one of its three idles over its stance (keep), blended in and out over the controller's 0.3 seconds: it looks left and
# right, flicking its ears; it shifts its weight to one side, tipping its head down and over, an ear flicking; or it
# bends to look down at its feet and kicks a foot up.
IDLES = [{"every": [0.3, 6.63], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
ACTS = [BLINK, *IDLES]

# A baby (holding nothing, as the game's babies do) sways and bobs from side to side (wsbyfa, 1.44 seconds round) and
# blinks, with no idles (the pack's baby state has no idle controller). Baby Butcher plays the same.
SETS = {"baby": {"motions": [("lwvcsi", 1)], "acts": [BLINK]}}
PLAYS = {"baby": "baby", "baby butcher": "baby"}
REMODEL = ["baby butcher", "halloween"]


def reuse(mob):
    """Its layers' textures that are the piglin's, byte for byte (the glow panels'), by the piglin's keys, the copies
    deleted: run after import_piglin.py."""
    art = ia.im.root / "art" / "mobs"
    theirs = {}
    for f in sorted(art.glob(f"{ia.PREFIX}piglin*.png")):
        if not f.stem.startswith(f"{ia.PREFIX}piglin_brute"):
            theirs.setdefault(f.read_bytes(), f.stem)
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")[mob]
    for look in looks:
        for layer in look["layers"]:
            for i, key in enumerate(layer[1]):
                f = art / f"{key}.png"
                if f.exists() and f.read_bytes() in theirs and theirs[f.read_bytes()] != key:
                    layer[1][i] = theirs[f.read_bytes()]
                    f.unlink()
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", mob, looks))


if __name__ == "__main__":
    port("piglin", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL, sets=SETS, plays=PLAYS,
         answers=lambda v: {"variant": 1.0})
