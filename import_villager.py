"""Give the villager the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_villager.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, Villager32, Hoppity, Beekeeper, Ghost, Elf and Snowy ones
went by the old pack's bones; the others had the new models but nothing moved them). The pack calls it villager_v2 (the
game's newer villager; the pack has no older one) and the page villager: read_pack() gives the pack's entity the page's
name. Its models and controllers are its own, not the wandering trader's (its idles are other animations under the same
keys), but its nervous flinch and its blink are the trader's, the same animations: so it imports those (FLINCH, BLINK).

A villager's skin is three textures on one model: a base skin (the game's skin id, 0 to 5, from where its biome's
villagers start among the pack's twelve), its biome's outfit (q.mark_variant: plains, desert, jungle, savanna, snow,
swamp or taiga) and its profession's (q.variant). A badge on its belt shows its level (q.trade_tier), but not on an
unemployed villager, a nitwit or a baby. The stage's variants are its professions (the game's q.variant), the farmer
first; unemployed and nitwit are climates (MOB_CLIMATES), as the pack draws them without the badge, and Trick or Treat
on them as the Ghost. Its biome and level are rows of their own (MOB_ROWS in src/mob-data.js), skins over the
profession's: this prints them. Every villager shown has skin id 0 (the darkest of its biome's six skins), which also
picks its stance. The game has babies of it (always unemployed); the pack makes none by itself. Run import_additions.py
first.
"""
import json

import import_additions as ia
from import_port import copy_texture, im, port, put
from import_wandering_trader import BLINK, FLINCH

# The professions, by the game's q.variant: the farmer (1) first, as the stage starts with it, then the rest in the
# game's order. Unemployed (0) and nitwit (14) are climates.
PROFESSIONS = ["farmer", "fisherman", "shepherd", "fletcher", "librarian", "cartographer", "cleric", "armorer",
               "weaponsmith", "toolsmith", "butcher", "leatherworker", "mason"]
CLIMATES = {"unemployed": {"variant": 0.0}, "nitwit": {"variant": 14.0}}
# The biomes, by the game's q.mark_variant, and the levels, by q.trade_tier (stone, iron, gold, emerald, diamond).
BIOMES = ["plains", "desert", "jungle", "savanna", "snow", "swamp", "taiga"]
LEVELS = ["stone", "iron", "gold", "emerald", "diamond"]


def game_any(x, *values):
    """q.any as the game answers it (the importer answers 0): the pack picks a biome's skins with it."""
    return 1.0 if any(x == v for v in values) else 0.0


def answers(v, mark=0, tier=0):
    return {"variant": float(v + 1), "mark_variant": float(mark), "trade_tier": float(tier), "skin_id": 0.0, "any": game_any}


# It stands breathing, swaying a little from side to side, its arms folded in front of it and its head tilting (kevang,
# the stance the pack gives skin ids 0 and 1; ioknti and ubytcm, the others', sway a little faster). Its eyes following
# what it looks at (target), the loops that copy its eyes' moves onto a costume's (qqfqcj, ktfjsp, jbacgi), its walk,
# run, swim, jumps, falls and landing, turning steps, deaths and riding are left out.
MOTIONS = [("kevang", 1)]

# Standing still for 0.24 seconds and then up to 6.33 more (the pack's idle controller), it does one of its six idles,
# blending in over the controller's 0.24 seconds, over its swaying (keep).
IDLE = lambda key: {"every": [0.24, 6.57], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]}
IDLES = [IDLE(k) for k in ("ciducd", "tculwn", "qofebb", "hyopyb", "lsswib", "vmmadd")]
# Fleeing a zombie or an illager (in a raid, say) it flinches and stays nervous for a while, as the wandering trader does
# (FLINCH, the same animations). Its sleep is left out: it drops onto its back in its bed (sleep, then hswwva), and with
# no bed on the stage it lay on the bare ground, its legs swinging out ahead of it as it went down. So is the game's
# raise_arms (the pack plays it while v.raise_arms is set, but neither defines it nor the bone it turns, arms). It has no
# trading or head-shaking animation (the pack's trading state plays nothing).
ACTS = [BLINK, *IDLES, FLINCH]

# Named Replica (or Life Form), it now and then glances sharply over its shoulder (tmyqlo) or shudders (qacjuf), at
# half speed and part strength as the pack plays them, over its idles.
REPLICA = {"motions": MOTIONS, "acts": [*ACTS,
           {"every": [1, 5], "keep": True, "parts": [("tmyqlo", 0, None, [], 0.5, 0.5)]},
           {"every": [1, 5], "keep": True, "parts": [("qacjuf", 0, None, [], 0.5, 0.75)]}]}
SETS = {"replica": REPLICA}
PLAYS = {"replica": "replica"}

REMODEL = ["villager32", "hoppity", "beekeeper", "ghost", "elf", "snowy", "hazmat", "replica", "replica tall",
           "replica triplets", "trick or treat", "cherry", "dappled"]
BABY_NAMES = {"Baby", "baby", "Child", "child", "Nosey", "nosey"}

_read_pack, _look = im.read_pack, im.look


def read_pack():
    """The pack's villager_v2 under the page's name for it, villager, and the game's baby_transform, which the pack plays
    on its babies but doesn't define (the game's: the head half as big again)."""
    ents, rcs, geos, mats, anims, *rest = _read_pack()
    ents["minecraft:villager"] = ents["minecraft:villager_v2"]
    anims.setdefault("animation.villager.baby_transform", {"loop": True, "bones": {"head": {"scale": 1.5}}})
    return (ents, rcs, geos, mats, anims, *rest)


def look(d, rcs, mats, anims, name, held=False, mood=None):
    """A baby villager has no profession (the game gives it none until it grows up)."""
    if name in BABY_NAMES and mood:
        mood = {**mood, "variant": 0.0}
    return _look(d, rcs, mats, anims, name, held, mood)


def over(layers):
    """Layers on the same model as the first (its outfit, its badge) drawn over it where their faces meet (over): the
    pack draws them on the same model, after it."""
    for layer in layers[1:]:
        if layer[0] == layers[0][0]:
            layer[3:] = [{**(layer[3] if len(layer) > 3 else {}), "over": 1}]


def finish(mob="villager"):
    """Every look's outfit and badge drawn over its skin, in its climates too."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")[mob]
    climates = ia.parse_section(text, "MOB_CLIMATES").get(mob, {})
    for look in [*looks, *(l for spec in climates.values() for l in spec["looks"].values())]:
        over(look["layers"])
    text = put(text, "MOB_LOOKS", mob, looks)
    ia.MODELS_JS.write_text(put(text, "MOB_CLIMATES", mob, climates) if climates else text)


def rows(mob="villager", answers=answers, climates_said=CLIMATES, spec=None):
    """The rows' skins (the villager's biome and level): for each kind, the textures that differ from the plain
    farmer's, in every look and climate, by their keys in src/mob-models.js. New textures are copied as
    new_<mob>_<kind>... spec: [(row, kinds, what the game says for kind k)]."""
    spec = spec or [("biome", BIOMES, lambda k: {"mark_variant": float(k)}), ("level", LEVELS, lambda k: {"trade_tier": float(k)})]
    ents, rcs, geos, mats, anims, *_ = im.read_pack()
    d = ents[f"minecraft:{mob}"]
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")[mob]
    climates = ia.parse_section(text, "MOB_CLIMATES").get(mob, {})
    bi = next(i for i, l in enumerate(looks) if "Baby" in l["names"])
    keys = {}
    out = {}

    def name_of(i):
        return "" if i == 0 else "Baby" if i == bi else looks[i]["names"][0]

    cases = [(i, l["layers"], {}) for i, l in enumerate(looks)]
    cases += [(int(i), l["layers"], climates_said[c]) for c, s in climates.items() for i, l in s["looks"].items()]
    # The path each key stands for, from the plain answers.
    for i, layers, extra in cases:
        lay, _, _ = im.look(d, rcs, mats, anims, name_of(i), mood={**answers(0), **extra})
        lay = [layer for layer in lay if layer[0] in geos and any(im.shown(b["name"], layer[2]) for b in geos[layer[0]].get("bones", []) if b.get("cubes"))]
        for (_, texs, _, _), layer in zip(lay, layers):
            for t, key in zip(texs, layer[1]):
                keys.setdefault(t, key)
    for row, kinds, said in spec:
        for k, kind in enumerate(kinds):
            if not k:
                continue
            for i, layers, extra in cases:
                base, _, _ = im.look(d, rcs, mats, anims, name_of(i), mood={**answers(0), **extra})
                own, _, _ = im.look(d, rcs, mats, anims, name_of(i), mood={**answers(0), **extra, **said(k)})
                for (_, texs, _, _), (_, texs2, _, _) in zip(base, own):
                    for t, o in zip(texs, texs2):
                        if t == o or t not in keys:
                            continue
                        new = keys.setdefault(o, keys[t].replace(f"{ia.PREFIX}{mob}", f"{ia.PREFIX}{mob}_{kind}", 1))
                        out.setdefault(row, {}).setdefault(kind, {})[keys[t]] = new
                        if ia.WRITE and new.startswith(f"{ia.PREFIX}{mob}_{kind}"):
                            copy_texture(o, new)
    print("rows:", json.dumps(out))


if __name__ == "__main__":
    im.read_pack, im.look = read_pack, look
    # Its eyes' whites and pupils are texels of alpha 2 drawn with the game's opaque entity material.
    im.OPAQUE_BONE_MOBS.add("minecraft:villager_v2")
    port("villager", variants=PROFESSIONS, answers=answers, acts=ACTS, motions=MOTIONS, remodel=REMODEL,
         climates=CLIMATES, sets=SETS, plays=PLAYS)
    if ia.WRITE:
        finish()
        rows()
