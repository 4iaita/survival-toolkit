"""Give the sulfur cube the updated Actions & Stuff pack's animations, its see-through jelly and a face the stage can draw
(see import_port.py).

    python3 import_sulfur_cube.py path/to/unpacked/pack path/to/textures [--write]

Its looks were already the new pack's (import_additions.py added it). It has no kinds. The game has two sizes, large and
small (the small one splits off a large one and grows up), which the stage shows as sizes (MOB_SIZES, sizes()): the
pack draws the small one with a smaller model of its own, and its Baby name gives that look too. Its entity is the only one for minecraft:sulfur_cube; its models, animations and controllers are its own (it shares
only the slime's and magma cube's pop, particle and sound controllers).

Its body is jelly the game draws see-through (the pack's outer material, alpha blended): its shell bones, as the slime's.
The pack draws its face as three extra layers (two eyes and a mouth), one square each, whose texture it slides to one of
seventeen frames on the skin's sheet of eyes and mouths (uv_anim, by variables its expression animations' timelines
set). The stage can't slide a texture by a variable, but the models also have each frame as a bone of its own
(6q6j0-16 the right eye, 6q6d0-16 the left, egml90-16 the mouth: at the same places as the squares, which the pack hides):
finish() drops the face layers and shows frame 0 (the face at rest) on the body, and the acts show the other frames by
the timelines (face()).

A sulfur cube named for a ball (Baseball, the billiards balls, the bowling balls, Die, Cheese, the floaties...) is drawn as
that ball: the pack swaps its whole model for the ball's (a cube in the ball's skin, some with parts of their own), with
no jelly and no face; its animations then only roll or tumble it as it moves, so standing it doesn't move (no loop, no
acts: set "ball"). Named §s, §b or §l (Small Block, Block, Large Block) it's drawn at half, its own or twice its size,
with none of its animations (set "still"); with a block in it, the pack then hides the cube and shows only the block,
which the stage doesn't show. The blocks it can take in (the game's absorbed block, by the item the game says it holds)
aren't shown either.
"""
import json

from import_port import ia, im, port, put

# What the game says of a sulfur cube with no block in it: its archetype property is "none" (the importer would answer 0,
# which the pack's scripts take for a block, hiding its inner cube and, named §s, §b or §l, all of it).
NO_BLOCK = {"property": lambda p: "none", "has_property": lambda *a: 1.0}

# The jelly is see-through, as the slime's is.
im.SHELLED = (*im.SHELLED, "minecraft:sulfur_cube")

# It stands breathing, its body rocking a little and swelling (the pack's dkonna, at the weight the pack gives it standing
# with nothing in it, v.scayxu: 2). The rest of its loops tilt, raise, squash and turn it by how it's moving (zero
# standing), turn it against its body's turn (yseqaw) or follow its target (gczhgd).
MOTIONS = [("oyabwp", 2)]

EYE_R, EYE_L, MOUTH = "qchhaj", "gvjdzz", "vhrake"
FRAMES = {EYE_R: "6q6j", EYE_L: "6q6d", MOUTH: "egml9"}


def face_rules(state):
    rules = []
    for var, bone in FRAMES.items():
        rules += [[f"{bone}*", False], [f"{bone}{int(state[var])}", True]]
    return rules


def face(anim):
    """An animation's timeline as act parts that show its face frames: (None, from, to, rules) for each stretch whose face
    isn't the one at rest."""
    length = anim["animation_length"]
    state, parts = {v: 0 for v in FRAMES}, []
    times = sorted(anim.get("timeline", {}), key=float)
    for i, t in enumerate(times):
        for line in [anim["timeline"][t]] if isinstance(anim["timeline"][t], str) else anim["timeline"][t]:
            for stmt in line.split(";"):
                if "=" in stmt:
                    var, value = stmt.strip().removeprefix("v.").split("=")
                    if var in state:
                        state[var] = float(value)
        end = float(times[i + 1]) if i + 1 < len(times) else length
        if any(state.values()) and end > float(t):
            parts.append((None, round(float(t), 4), round(end, 4), face_rules(state)))
    return parts


_read_pack = im.read_pack
ANIMS = {}


def read_pack():
    out = _read_pack()
    ANIMS.update(out[4])
    return out


def acts():
    """Its blink and its three faces now and then, from the animations' timelines."""
    ents, *_ = read_pack()
    keys = ents["minecraft:sulfur_cube"]["animations"]
    anim = lambda k: ANIMS[keys[k]]
    # It blinks every 0.3 to 3.33 seconds (ziudvf: its eyes half shut, then shut, for a sixth of a second).
    blink = {"every": [0.3, 3.33], "keep": True, "parts": face(anim("blink"))}
    # Standing still, every 1 to 8 seconds it pulls a face, picked at random (with nothing in it, v.ylaird -3 to 1): two
    # times in five it glances to one side and back (jptzwq), one in five it yawns, its eyes squeezed to lines, its mouth
    # gaping and its body shaking (xfsvnk, its own bones too), one in five it frowns, its brows slanting down and its
    # mouth turned down (yifxrk), and one in five it doesn't. (Its other faces play as a block goes in or comes out.)
    glance = {"every": [1.5, 8.5], "keep": True, "parts": face(anim("jptzwq"))}
    yawn = {"every": [1.5, 8.5], "keep": True, "parts": [("xfsvnk", 0, None, []), *face(anim("xfsvnk"))]}
    frown = {"every": [1.5, 8.5], "keep": True, "parts": face(anim("yifxrk"))}
    return [blink, blink, blink, glance, glance, yawn, frown]


FACE_MODELS = ("new_sulfur_cube_2", "new_sulfur_cube_baby_2")
SETS = {"ball": {"motions": [], "acts": []}, "still": {"motions": [], "acts": []}}
STILL = ["§s", "§b", "§l"]


def sizes(looks):
    """MOB_SIZES: big, and small (the game's small sulfur cube, which splits off a big one and grows up: q.max_health 4),
    which the pack draws with its small model whatever its name, as the Baby look is. Named for a ball, it's that small
    cube with no face (the face layers only show without a ball name) and stands still; named §s, §b or §l, it keeps that
    size. Its model is smaller in itself (10 pixels to 18), so it takes no zoom of its own."""
    baby = next(l for l in looks if "Baby" in l["names"])
    small = []
    for look in looks:
        out = {**json.loads(json.dumps(look)), "layers": json.loads(json.dumps(baby["layers"]))}
        out.pop("pose", None)
        if look.get("plays") == "ball":
            main = out["layers"][0]
            main[2] = [r for r in main[2] if not r[0].startswith(tuple(FRAMES.values()))] + [[f"{b}*", False] for b in FRAMES.values()]
        small.append(out)
    return {"big": {"zoom": 1}, "small": {"zoom": 1, "looks": small}}


def finish():
    """Each look with a face: the face layers dropped and frame 0 shown on its body, as the plain look is drawn with no
    block in it (its inner cube shown, its jelly see-through, and the § looks' pose that hides all but a block dropped);
    the balls and the § looks play their sets."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["sulfur_cube"]
    shell = looks[0]["layers"][0][3]["shellBones"]
    for i, look in enumerate(looks):
        main = look["layers"][0]
        main[2] = [[p, True if p == "aff6j*" else on] for p, on in main[2]]
        if len(look["layers"]) > 1 and i:
            main[3] = {**main[3], "shellBones": shell}
            look.pop("pose", None)
        main, *rest = look["layers"]
        name = (look["names"] or [""])[0]
        look.pop("plays", None)
        if rest:
            look["layers"] = [main]
            main[2] = [r for r in main[2] if r[0] not in ("6q6*", "egml9*")] + face_rules({v: 0 for v in FRAMES})
        else:
            look["plays"] = "ball"
        if name in STILL:
            look["plays"] = "still"
    text = put(text, "MOB_LOOKS", "sulfur_cube", looks)
    text = put(text, "MOB_SIZES", "sulfur_cube", sizes(looks))
    # The face layers' models (one square per part) are no look's any more.
    a = text.index("const MOB_MODELS = {")
    b = text.index("\n};", a)
    text = text[:a] + "\n".join(l for l in text[a:b].split("\n") if not l.startswith(tuple(f'  "{k}": ' for k in FACE_MODELS))) + text[b:]
    for key in SETS:
        a = text.index("const MOB_ACTS = {")
        b = text.index("\n};", a)
        text = text[:a] + "\n".join(l for l in text[a:b].split("\n") if not l.startswith(f'  "sulfur_cube:{key}": ')) + text[b:]
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    im.read_pack = read_pack
    port("sulfur_cube", variants=[""], acts=acts(), motions=MOTIONS, answers=lambda v: NO_BLOCK, sets=SETS)
    if ia.WRITE:
        finish()
