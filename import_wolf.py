"""Give the wolf the updated Actions & Stuff pack's models, animations, variants, moods and armor (see import_port.py).

    python3 import_wolf.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, Skeleton, Party and Reindeer ones went by the old pack's
bones; the Hellhound ones had the new models but nothing moved them, and its moods went by the old pack's keys), and the
skins of its nine biome variants (the pack's q.variant 0 to 8, a skin of their own on the same model, the pup's, the
angry ones' and the Hellhound looks' too). Its moods (angry, and a pet with a collar) are each look again as the pack
draws it then, and its armor goes on a copy of its skeleton (MOB_ARMOR). Run import_additions.py first. It prints the
skins to put in MOB_VARIANTS (src/mob-data.js).
"""
import json

from import_port import copy_texture, ia, im, port, put

# The pack's q.variant 0 to 8, as Bedrock numbers them.
VARIANTS = ["pale", "ashen", "black", "chestnut", "rusty", "snowy", "spotted", "striped", "woods"]

# The pack's glow panels (an angry wolf's red eyes) fade with how dark it is: v.habcyx, 1 at full strength, in the new
# pack (import_models.py still says the old pack's name).
im.GLOW_STRENGTH = "habcyx"

# It breathes, swaying a little, its head, tail and legs moving with it (the pack's standing loop), and holds its tail as
# the game says: a wild wolf's straight out behind (36 degrees down), a pet's as high as its health (the pack's tail
# loop, by q.tail_angle). The pack's head-look loop only turns its head towards what it looks at, which the stage has
# none of, so it's left out; so are its walk and run, weighted by how fast it moves.
MOTIONS = [("stand", 1), ("tail", 1)]

# Every 1.25 to 3.75 seconds it blinks (the pack's blink: its eyelids, the blink bone, slide out over its eyes for 0.15
# seconds), at half the pack's speed so it's seen, over its breathing (keep).
EYES = [["blink", True]]
BLINK = {"every": [1, 4], "keep": True, "weight": 3, "parts": [("blinking.1", 0, None, EYES, 0.5)]}
# Standing still a while (the pack waits up to 6.33 seconds), it does one of its idles (a look round, a stretch, a sniff
# and so on), blending in and out over its idle controller's 0.24 seconds, over its breathing (keep). The pack's other two
# (sitting down to scratch itself, and howling, which it only does on a full moon's night) are left out.
IDLE_KEYS = ("ciducd", "tculwn", "qofebb", "lsswib", "vmmadd", "sztvzu")
IDLES = [{"every": [3, 7], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in IDLE_KEYS]
ACTS = [BLINK, *IDLES]

# An angry wolf tenses up (the pack's has-target stance, held) and now and then growls with a shake of its head (the
# pack's angry animation), still blinking; the pack gives it angry skins and red eyes.
GROWL = {"every": [3, 6], "parts": [("notonr", 0, None, [])]}
ANGRY = {"answers": {"is_angry": 1.0}, "motions": [*MOTIONS, ("has_target", 1, "held")], "act": [BLINK, GROWL]}

# A pet wears a collar (its color can be picked) and can wear armor, and holds its tail high, 0.55 of a half turn at
# full health, as the game has it. Now and then it does one of its idles, shakes itself like a dog (the pack's shake),
# or lies down for a while, as the pack's sitting controller has it: down, still a moment, one of its idles lying there
# (the pack picks one every few seconds), still again; then its eyes close (the blink bone, its eyelids, slid out to the
# face) and it sleeps with Zs floating up (a while: the pack's 30 to 60 seconds would be too long here), wakes, looks
# about once more and gets up. Lying down and getting up play at 1.5 times speed, as the pack has them. All the while
# the game keeps the head level, looking ahead (its head-look animation turns the head relative to the entity), and
# blends from one animation to the next. (The pack's sitting is left out.)
step, seq = im._step, im._wolf_seq
STILL, SLEEP_FOR = 1.5, 10
LIE_IDLES = [("pqdlcq", 2.9583), ("mhfejd", 3.4583), ("rlzrxy", 2.9167), ("yzxqbs", 2.9167)]


def lie(first, last):
    parts, effects = seq(
        step("wkqknx", 1.2917, 1.5, along=["jeazgp"]), step("lying", STILL), step(*first), step("lying", STILL),
        step("lxyumt", 5.3333, show=EYES, along=["jeazgp"]),
        step("hivrji", SLEEP_FOR, show=EYES, along=["jeazgp"], effect="z"),
        step("fvbauj", 3.25, show=EYES), step("lying", STILL), step(*last), step("lying", STILL),
        step("esfalz", 1.625, 1.5))
    return {"every": [6, 12], "level_head": True, "parts": parts, "effects": effects}


SHAKE = {"every": [6, 12], "parts": [("kwsytf", 0, None, [])]}
PET = {"answers": {"is_tamed": 1.0, "tail_angle": 0.55 * 3.141592653589793}, "motions": MOTIONS, "collar": True, "armor": True,
       "act": [BLINK, *IDLES, SHAKE, lie(LIE_IDLES[0], LIE_IDLES[2]), lie(LIE_IDLES[1], LIE_IDLES[3])]}
MOODS = {"angry": ANGRY, "pet": PET}

NAMED = ["skeleton", "party", "reindeer", "hellhound pup", "hellhound"]

# Its armor: the pack keeps it as an item whose bones are named for the wolf's, so its cubes go on a copy of the wolf's own
# skeleton. plain and dyed: its two textures (the dyed one's alpha says where the dye goes); cracks: its wear. The pack
# doesn't draw it on a pup or the Hellhound (bare: the first names of the looks it leaves bare).
ARMOR_ITEM = "minecraft:wolf_armor"
ARMOR_TEXTURES = {"plain": "default", "dyed": "mauatk"}
CRACKS = {"low": "jfregp", "medium": "tcviuk", "high": "npozmm"}
BARE = ["hellhound pup", "hellhound"]
ARMOR_KEY = f"{ia.PREFIX}wolf_armor"


def armor():
    """MOB_ARMOR's entry, its model, and its textures to copy (pack path -> key)."""
    ents, _rcs, geos, _m, _a, _p, armors = im.read_pack()
    for g in geos.values():
        ia.rename_geo(g)
    item = armors[ARMOR_ITEM]
    worn = geos[next(iter(item["geometry"].values()))]
    cubes = {b["name"]: b.get("cubes", []) for b in worn["bones"]}
    wolf = geos[ents["minecraft:wolf"]["geometry"]["default"]]
    missing = [b for b, c in cubes.items() if c and b not in {w["name"] for w in wolf["bones"]}]
    if missing:
        raise SystemExit(f"the armor's bones {missing} aren't the wolf's")
    model = im.model({"description": worn["description"], "bones": [{**b, "cubes": cubes.get(b["name"], [])} for b in wolf["bones"]]})
    textures = {item["textures"][ARMOR_TEXTURES["plain"]]: ARMOR_KEY, item["textures"][ARMOR_TEXTURES["dyed"]]: f"{ARMOR_KEY}_dyed",
                **{item["textures"][tex]: f"{ARMOR_KEY}_cracks_{k}" for k, tex in CRACKS.items()}}
    entry = {"model": ARMOR_KEY, "plain": ARMOR_KEY, "dyed": f"{ARMOR_KEY}_dyed", "cracks": {k: f"{ARMOR_KEY}_cracks_{k}" for k in CRACKS},
             "bare": BARE}
    return entry, model, textures


# Named, a pet wears a little gold tag on its collar (the pack shows it for a pet with any name but the Hellhound’s).
# The plain and baby looks are the ones with no name (the baby one is also an unnamed pup's), so they go without it.
NAME_TAG_LAYER = f"{ia.PREFIX}wolf_pet_2"


def unnamed_pets(text):
    moods = ia.parse_section(text, "MOB_MOODS")["wolf"]
    for i in (0, 1):
        look = moods["pet"]["looks"][i]
        look["layers"] = [layer for layer in look["layers"] if layer[0] != NAME_TAG_LAYER]
    return put(text, "MOB_MOODS", "wolf", moods)


if __name__ == "__main__":
    port("wolf", variants=VARIANTS, acts=ACTS, motions=MOTIONS, remodel=NAMED, nested_poses=True, moods=MOODS)
    entry, model, textures = armor()
    print("armor:", json.dumps(entry))
    if ia.WRITE:
        for path, key in sorted(textures.items(), key=lambda kv: kv[1]):
            copy_texture(path, key)
        text = unnamed_pets(put(ia.MODELS_JS.read_text(), "MOB_MODELS", ARMOR_KEY, model))
        ia.MODELS_JS.write_text(put(text, "MOB_ARMOR", "wolf", entry))
