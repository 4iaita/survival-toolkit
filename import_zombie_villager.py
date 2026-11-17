"""Give the zombie villager the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_zombie_villager.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby and Snowy ones went by the old pack's bones; the Cherry one
had the new model but nothing moved it). The pack calls it zombie_villager_v2 (the game's newer zombie villager; it has no
older one) and the page zombie_villager: read_pack() gives the pack's entity the page's name. Its models, stances and
controllers are its own, not the zombie's or the villager's (its four stances are other animations under the zombie's
keys), so it shares nothing but the villager's profession outfits, the same textures, and the game's baby_transform.

Its skin is the zombie's green over its biome's outfit (q.mark_variant, as the villager's) and its profession's
(q.variant, the villager's outfits; a baby has none): its looks are built as a farmer's, the stage's variants are its
professions (unemployed first, as the villager's), and its biome is a row of its own (MOB_ROWS in src/mob-data.js): this prints its skins. It has no skin shades and no level
badge. Its eyes, white with red pupils, glow (faint texels on an emissive material). The game has babies of it; the pack
makes none by itself. Run import_additions.py first.
"""
import import_additions as ia
from import_port import im, port, put
from import_villager import BIOMES, finish, game_any, look, rows

# The professions, by the game's q.variant: the farmer (1) first, as its looks are built with it, then the rest in the
# game's order, unemployed (0) and the nitwit (14) last. Its outfits are the villager's.
PROFESSIONS = ["farmer", "fisherman", "shepherd", "fletcher", "librarian", "cartographer", "cleric", "armorer",
               "weaponsmith", "toolsmith", "butcher", "leatherworker", "mason", "unemployed", "nitwit"]
VARIANTS = [*range(1, 14), 0, 14]


def answers(v, mark=0):
    return {"variant": float(VARIANTS[v]), "mark_variant": float(mark), "any": game_any}


# Each zombie villager takes one of four stances at random when it spawns (v.ngjrwv, 0 to 3), each with its arms hanging
# at its sides (the pack only raises them, straight out, at a target): the stage shows the first (kevang), slumped and
# turned a little, swaying, its head lolling to one side. The pack gives it no idles and no blink.
# Left out: its arms raised at a target (has_target, held, then ykvdbt as it lowers them), its attack, its head and eyes
# following what it looks at (wreqkw), its walk and run, swim, jumps, falls and landing, deaths and riding. Being cured
# (the game shakes it, with particles) has no animation in the pack.
MOTIONS = [("kevang", 1)]

_read_pack = im.read_pack


def read_pack():
    """The pack's zombie_villager_v2 under the page's name for it, zombie_villager; and the game's baby_transform (the
    head half as big again), which the pack plays on its babies from a nested controller (peguiv) but doesn't define."""
    ents, rcs, geos, mats, anims, *rest = _read_pack()
    ents["minecraft:zombie_villager"] = ents["minecraft:zombie_villager_v2"]
    anims.setdefault("animation.villager.baby_transform", {"loop": True, "bones": {"head": {"scale": 1.5}}})
    return (ents, rcs, geos, mats, anims, *rest)


def fix(d):
    """The baby's big head: the pack plays baby_transform in its peguiv controller's second state while v.cdrzno."""
    d["scripts"]["animate"] = [*d["scripts"]["animate"], {"baby_transform": "v.cdrzno"}]


def shared():
    """Its textures that are the villager's (its profession outfits, plain and snowy, and the Cherry look's blossoms) by
    the villager's keys, the copies deleted: run after import_villager.py."""
    art = ia.im.root / "art" / "mobs"
    theirs = {}
    for f in sorted(art.glob(f"{ia.PREFIX}villager*.png")):
        theirs.setdefault(f.read_bytes(), f.stem)
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["zombie_villager"]
    same = {}
    for look in looks:
        for layer in look["layers"]:
            for i, key in enumerate(layer[1]):
                f = art / f"{key}.png"
                if key in same or (f.exists() and f.read_bytes() in theirs):
                    same.setdefault(key, theirs.get(f.read_bytes()) if f.exists() else None)
                    layer[1][i] = same[key]
    # Its professions' outfits too (its variants' skins are the villager's: src/mob-data.js).
    for f in sorted(art.glob(f"{ia.PREFIX}zombie_villager*.png")):
        if f.read_bytes() in theirs:
            f.unlink()
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "zombie_villager", looks))
    print("the villager's:", same)


if __name__ == "__main__":
    # A baby has no profession, as the villager's (its model is laid out for the pack's 96 by 96 baby textures, and the
    # professions' outfits, 64 by 64, come out scrambled on it).
    im.read_pack, im.look = read_pack, look
    port("zombie_villager", variants=PROFESSIONS, answers=answers, acts=[], motions=MOTIONS, remodel=["snowy", "cherry"],
         fix=fix)
    if ia.WRITE:
        shared()
        finish("zombie_villager")
        rows("zombie_villager", answers, {}, [("biome", BIOMES, lambda k: {"mark_variant": float(k)})])
