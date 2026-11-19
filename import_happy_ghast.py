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

Its harnesses are MOB_ARMOR's kinds (harnesses(), the page calls the bar Harness): each color's attachable, a model of
its own, with its own loops; a happy ghast named Saddleless hides it (hides: "armor"). The pack also shrinks a harnessed
happy ghast's body to 0.935 (v.onoiya), left out. Left out too: its leash knots (shown while it pulls a boat or a horse), its wiggle as it's harnessed,
how it settles and its tentacles hang still while it's ridden or told to stay, its tilts as it flies (by how fast it
moves and turns: nothing standing), the balloons' sway as they're towed, and its deaths.
"""
import import_additions as ia
from import_port import copy_texture, im, port, put

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


# Its harnesses, in the game's dye order. Each is the harness item's attachable, worn on its body: in this pack a model
# of its own for each color (and its texture), not one model dyed.
HARNESSES = ["white", "orange", "magenta", "light_blue", "yellow", "lime", "pink", "gray", "light_gray", "cyan", "purple",
             "blue", "brown", "green", "red", "black"]
# The harness's own loops while it's worn with no rider: its goggles pushed up (iqgqqn's first state, cxqbtk, held), the
# swing every harness has (vmqrcm: all but a tail fin's swish go by how fast it flies, nothing standing) and the black,
# light blue and yellow harnesses' wings beating (uauoua). Left out: the glow panels' turn to the camera and their
# fade-in (axkhjp, wlqxdl: the stage draws soft glows facing the camera itself), the purple harness's panels shrinking
# as the camera looks down on them (qapdci) and the cyan one's random twitch now and then (oghmvl).
HARNESS_LOOPS = ["vmqrcm", "uauoua"]
HARNESS_HELD = {"iqgqqn": "cxqbtk"}


def harnesses():
    """MOB_ARMOR's entry (a kind for each color: its layers, as the pack's render controllers draw the attachable, each
    on a model with the happy ghast's skeleton so it follows its head; and its loops), the models, and the textures to
    copy (pack path -> key). Not on babies (the stage's rule, and the pack's: !v.cdrzno) nor balloons (bare)."""
    import copy
    import json

    from import_port import renamed
    ents, rcs, geos, mats, anims, _p, _a = im.read_pack()
    for g in geos.values():
        ia.rename_geo(g)
    ghast = ents["minecraft:happy_ghast"]
    skeleton = [{k: v for k, v in b.items() if k != "cubes"} for b in geos[ghast["geometry"]["default"]]["bones"]]
    found = {}
    for top in (im.pack, im.pack / "subpacks" / im.SUBPACK):
        for f in sorted((top / "attachables").glob("*.json")) if (top / "attachables").is_dir() else []:
            d = json.loads(f.read_text(encoding="utf-8")).get("minecraft:attachable", {}).get("description", {})
            if d.get("identifier", "").endswith("_harness"):
                found[d["identifier"].split(":")[1][: -len("_harness")]] = d
    strength, im.GLOW_STRENGTH = im.GLOW_STRENGTH, "habcyx"  # its glow panels' strength fades in by v.habcyx
    kinds, models, textures = {}, {}, {}
    for color in HARNESSES:
        d = copy.deepcopy(found[color])
        layers, _, _ = im.look(d, rcs, mats, anims, "")
        out = []
        for i, (geo, texs, rules, flags) in enumerate(layers):
            g = copy.deepcopy(geos[geo])
            bones = copy.deepcopy(skeleton)
            have = {b["name"] for b in bones}
            for b in g["bones"]:
                if b["name"] in have:  # its root bone, head: the happy ghast's own, with the harness's cubes on it
                    next(x for x in bones if x["name"] == b["name"]).setdefault("cubes", []).extend(b.get("cubes", []))
                else:
                    bones.append({**b, "parent": b.get("parent") or "head"})
            g["bones"] = bones
            rules = [[ia.ren(p), on] for p, on in rules]
            if flags.get("litBones"):
                flags = {**flags, "litBones": [ia.ren(p) for p in flags["litBones"]]}
            im.glow_panels(g, rules, flags)
            key = f"{ia.PREFIX}happy_ghast_harness_{color}" + (f"_{i}" if i else "")
            models[key] = im.model(g)
            textures.setdefault(texs[0], f"{ia.PREFIX}happy_ghast_harness_{color}")
            out.append([key, [textures[texs[0]]], rules[1:] if rules[:1] == [["*", True]] else rules] + ([flags] if flags else []))
        played = [a if isinstance(a, str) else next(iter(a)) for a in d["scripts"]["animate"]]
        loops = []
        for key in HARNESS_LOOPS:
            if key in played:
                loop = im.baked_loop(d, anims, key, 1)
                loop["bones"] = renamed({b: ch for b, ch in loop["bones"].items() if any(
                    any(abs(v - (1 if k == "s" else 0)) > 1e-6 for f in frames for v in f) for k, frames in ch.items())})
                if loop["bones"]:
                    loops.append(loop)
        for ctl, key in HARNESS_HELD.items():
            if ctl in played:
                held = im.baked_held(d, anims, key)
                held["bones"] = renamed(held["bones"])
                loops.append(held)
        kinds[color] = {"layers": out, **({"motions": loops} if loops else {})}
    im.GLOW_STRENGTH = strength
    return {"kinds": kinds, "bare": BALLOONS}, models, textures


if __name__ == "__main__":
    port("happy_ghast", variants=[""], acts=ACTS, motions=MOTIONS, remodel=BALLOONS, sets=SETS, fix=fix,
         plays={b: "balloon" for b in BALLOONS})
    if ia.WRITE:
        finish()
        entry, models, textures = harnesses()
        for path, key in sorted(textures.items(), key=lambda kv: kv[1]):
            copy_texture(path, key)
        text = ia.MODELS_JS.read_text()
        for key, model in models.items():
            text = put(text, "MOB_MODELS", key, model)
        ia.MODELS_JS.write_text(put(text, "MOB_ARMOR", "happy_ghast", entry))
