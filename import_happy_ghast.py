"""Give the happy ghast the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_happy_ghast.py path/to/unpacked/pack path/to/textures [--write]

Its plain, baby and balloon looks get the pack's current models (the plain and baby ones went by the old pack's bones;
the balloons had the new model but nothing moved it). It has no kinds. Its baby (Baby, Ghastlet, Smiley) is drawn on
the plain model in a texture of its own, its body a quarter as big (the pack's scale animation, which every happy ghast
plays, sets the body's scale from a variable: 0.248 for a named baby against 0.994, so the importer, which only bakes
poses that a name turns on, never saw it: finish() sets it). The pack makes no babies by itself (v.tocraa 0), and isn't
asked about the game's own (the ghastling, grown from a dried ghast): it draws one with the plain look, at the size the
game gives it, and plays three idles for it (the two below and a spin). Its balloon names (Creeper, Enderman, Pig and
Pumpkin Balloon) swap it for a hot air balloon, a model of its own with a texture for each, which plays only the idle
(set "balloon"). Its scripts set biome variables that nothing it draws reads. Its entity (entity/dus.json) is the only one
for minecraft:happy_ghast. Run import_additions.py first.

Its face is one of seven bones (7246_*) picked by v.courpm, which its idles' timelines set: -3 and -2 a frown, -1 a
flat mouth, 0 a soft smile, 1 a smile, 2 a big smile with its eyes shut in happy arcs, 3 an open "oh" mouth. It starts
at 0, but every idle ends by stepping through 0 and 1 to 2 (uzwbkg), so it wears the big smile nearly all the time: the
stage shows that (fix), and the idles' faces as act parts.

Left out: its harness (worn as the harness item's attachable, a model of its own for each of the 16 colors), Saddleless
(which only hides the harness), its leash knots (shown while it pulls a boat or a horse), its wiggle as it's harnessed,
how it settles and its tentacles hang still while it's ridden or told to stay, its tilts as it flies (by how fast it
moves and turns: nothing standing), the balloons' sway as they're towed, and its deaths.
"""
import import_additions as ia
from import_port import port, put

BALLOONS = ["creeper balloon", "enderman balloon", "pig balloon", "pumpkin balloon"]
BABY_SCALE = 0.25  # v.onoiya: 0.2484375 for a named baby, 0.99375 for a grown one with no harness

# It floats bobbing up and down, its head squashing and stretching a little and tilting, its tentacles swaying in turn
# (the pack's idle, at its blend weight of 0.65: 6.55 seconds round, as the old stage's), and waving them (the pack's
# move, which it plays standing too, a wave a second).
MOTIONS = [("idle", 0.65), ("move", 1)]

FACES = {-3: "7246_k25", -2: "7246_2f8jq", -1: "7246_f6mlj2d", 0: "7246_5672mdl", 1: "7246_92hhq", 2: "7246_92hha6j", 3: "7246_hg8"}
REST = 2


def faces(times, end):
    """Act parts showing its other faces from each time a timeline sets one to the next."""
    out = []
    for (at, face), nxt in zip(times, [*(t for t, _ in times[1:]), end]):
        if face != REST:
            out.append((None, at, nxt, [[FACES[REST], False], [FACES[face], True]]))
    return out


def then_settle(times, length):
    """A timeline followed by the pack's uzwbkg (0.5 seconds: faces 0, 1 and 2), as the idle controller plays it."""
    return [*times, (length + 0.1667, 0), (round(length + 0.25, 4), 1), (round(length + 0.3333, 4), 2)], round(length + 0.5, 4)


# Every 2 to 12 seconds (the pack's idle controller waits Math.random(2,12)) it does one of its two idles, at half
# weight as the controller has them, over its floating (keep), blended in over the controller's 0.15 seconds: it gasps,
# its mouth an "oh", squashes and stretches and beams; or it frowns, sways from side to side and back to a smile.
GASP, GASP_END = then_settle([(0, 3), (0.4167, 0), (0.5833, 1), (0.6667, 2), (1.2917, 1), (1.375, 0)], 2.0417)
SWAY, SWAY_END = then_settle([(0, 0), (0.4583, -1), (0.5417, -3), (1.125, -1), (1.2083, 0), (1.2917, 1), (1.375, 2),
                              (1.875, 1), (1.9583, 0), (2.0417, -1), (2.125, -2), (2.5, -1), (2.5833, 0)], 3.5417)
IDLES = [{"every": [2, 12], "keep": True, "ease": 0.15, "parts": [("ciducd", 0, None, [], 1, 0.5), *faces(GASP, GASP_END)]},
         {"every": [2, 12], "keep": True, "ease": 0.15, "parts": [("qofebb", 0, None, [], 1, 0.5), *faces(SWAY, SWAY_END)]}]
ACTS = IDLES

# A balloon only floats (the pack's balloon state: the idle, and its tilts as it's towed).
SETS = {"balloon": {"motions": [("idle", 0.65)], "acts": []}}


def fix(d):
    """The face it wears nearly all the time: the big smile its idles end on."""
    d["scripts"]["initialize"] = [*d["scripts"].get("initialize", []), f"v.courpm={REST};"]


def finish():
    """The baby a quarter as big."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["happy_ghast"]
    next(l for l in looks if "Baby" in l["names"])["scale"] = BABY_SCALE
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "happy_ghast", looks))


if __name__ == "__main__":
    port("happy_ghast", variants=[""], acts=ACTS, motions=MOTIONS, remodel=BALLOONS, sets=SETS, fix=fix,
         plays={b: "balloon" for b in BALLOONS})
    if ia.WRITE:
        finish()
