"""Copy the mob models the Mobs tab draws from the Actions & Stuff pack into src/mob-models.js and art/mobs/.

The pack keeps its entities, render controllers and models in packed __brarchive files, under scrambled names (or,
unpacked, in plain JSON files in its folders: either works).
For every mob, this runs the pack's own entity scripts and render controllers (molang.py) with no name and with
each name it checks, to find how the mob looks: its models, their textures and which parts show. Textures come
from the texture folder. Run after changing the pack, then run build.py:

    python3 import_models.py path/to/actions_and_stuff.mcpack [path/to/textures]
    python3 import_models.py path/to/unpacked/pack [path/to/textures]
"""
import fnmatch
import json
import math
import pathlib
import re
import shutil
import struct
import sys
import zipfile

from import_textures import tga_to_png
from molang import Env, evaluate, num, truthy

root = pathlib.Path(__file__).parent
pack = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / "actions_and_stuff.mcpack"
textures = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else root.parent / "textures"

# The subpack the texture folder comes from ("Full Experience").
SUBPACK = "SP2"
# Layers the tab leaves out: the leash knot holder has no cubes of its own.
SKIP_LAYERS = ("controller.render.oreville_ans.bsytbia.vnjpdvb",)
# The pack names mobs by their game ids; the tab uses these keys.
MOB_KEYS = {"villager_v2": "villager", "zombie_villager_v2": "zombie_villager", "zombie_pigman": "zombified_piglin", "evocation_illager": "evoker"}
# Mobs and bosses that don't react to any name, which the pack's other entities (arrows, minecarts, potions) can't
# be told from by their definitions alone.
NAMELESS_MOBS = ("blaze", "bogged", "breeze", "cave_spider", "cod", "elder_guardian", "ender_dragon", "endermite", "evocation_illager",
                 "frog", "guardian", "magma_cube", "parched", "phantom", "piglin_brute", "pufferfish", "salmon", "shulker", "silverfish",
                 "stray", "tropicalfish", "vex", "wither", "wither_skeleton")
# What the game answers for a mob the stage shows one kind of: the shulker with no dye on it.
GAME_ANSWERS = {"minecraft:shulker": {"variant": 16.0}}
# The game colors some textures itself, so the pack's are white; these take dyes, one per texture: the tropical
# fish as a clownfish.
LAYER_DYES = {"minecraft:tropicalfish": ["orange", "white"]}
# Glow layers that are soft light rather than parts: the game blends them additively, facing the camera.
SOFT_GLOW = ("minecraft:glow_squid",)
# Mobs whose bone called "blink" is the open eye, which their blink animation shrinks to nothing for a moment. On the
# rest it's a closed eyelid, shown only for that moment.
OPEN_EYES = tuple(f"minecraft:{mob}" for mob in ("piglin", "piglin_brute", "zombie_pigman", "hoglin", "zoglin", "llama", "trader_llama", "chicken", "polar_bear", "rabbit"))
# The pack's glows are mostly flat panels of soft light, which the game turns to the camera about a pivot, so they only
# look right drawn as light at that pivot. Panels this wide or more, or behind their pivot, light up the whole mob (halo,
# seen from any side); the others are eyes (gone from behind).
HALO_PANEL = 16
# Animations the stage plays, layered as the game layers them in that state: each mob's looping animations as (key,
# how strongly, how fast, and which bones stay put while they turn). The strengths and speeds come from the pack's own formulas at a relaxed swimming or walking
# speed, since on the stage nothing is going anywhere. The game's fastest parts (wings, fins, tentacles) are slowed to
# about a beat a second, which is what looks calm up close and at a standstill. Baked at MOTION_FPS into MOB_MOTIONS.
_NAUTILUS = [("zxbvhct", 1, 0.6), ("move", 0.45, 0.4)]
# The pack also slides the squids' tentacles up as they pulse, which pushes their tops out through the body's walls.
_TENTACLES = tuple(f"bhndwpa{i}" for i in range(1, 9))
_GUARDIAN = [("zxbvhct", 1), ("swim", 0.5, 1.8)]
STAGE_MOTIONS = {
    "minecraft:axolotl": [("cwscbtb_orzlhpc", 1), ("swim", 0.54)],
    "minecraft:cod": [("zxbvhct", 1), ("tutdjcp_xxqqclq", 1, 0.4), ("swim", 0.6, 0.66)],
    "minecraft:salmon": [("zxbvhct", 1), ("xalvezs.tutdjcp_xxqqclq", 1, 0.4), ("swim", 0.6, 0.62)],
    "minecraft:tropicalfish": [("zxbvhct", 1), ("tutdjcp_enderyw", 1, 0.4), ("swim", 0.6, 0.66)],
    "minecraft:pufferfish": [("zxbvhct", 1, 0.45), ("swim", 0.5, 0.66)],
    "minecraft:dolphin": [("zxbvhct", 1), ("swim", 0.75, 1.23)],
    "minecraft:squid": [("move", 0.7, 2, _TENTACLES)],
    "minecraft:glow_squid": [("etzxqum.move", 0.7, 2, _TENTACLES)],
    "minecraft:turtle": [("nmmpsqz", 1), ("swim", 0.5)],
    "minecraft:nautilus": _NAUTILUS,
    "minecraft:zombie_nautilus": _NAUTILUS,
    "minecraft:guardian": _GUARDIAN,
    "minecraft:elder_guardian": [("zxbvhct", 1), ("swim", 0.5, 1.2)],
    "minecraft:tadpole": [("swim", 1)],
    # The camel stands breathing, as the pack's standing state has it (its idles and sitting are STAGE_ACTS).
    "minecraft:camel": [("zxbvhct_dhyaxuw_bhlxath", 1)],
    # The armadillo stands breathing (its idles and rolling up are STAGE_ACTS).
    "minecraft:armadillo": [("uqfdaza_xcsnfwi", 1)],
    # The polar bear stands breathing, as the pack's standing state has it (its blinking is a STAGE_ACT).
    "minecraft:polar_bear": [("zxbvhct", 1)],
    # The ocelot stands with its tail swaying and breathing, as the pack's standing state has it (its blinking and
    # fidgets are STAGE_ACTS).
    "minecraft:ocelot": [("jdgzfzq", 1), ("ttpzihs.dhyaxuw", 1)],
    # The chicken stands breathing, as the pack's standing state has it (its blinking and fidgets are STAGE_ACTS).
    "minecraft:chicken": [("zxbvhct", 1)],
    "minecraft:bee": [("yvwtrbk", 1, 0.5), ("zgpiqoz", 1)],
    "minecraft:bat": [("yvwtrbk", 1, 0.6)],
    "minecraft:wolf": [("hhjrlam", 1)],
    # A spider's legs hold their pose in this slow shuffle, which is its usual animation, over the breathing of its body.
    "minecraft:spider": [("vcnwlon", 1), ("ifmasqj_leg_ewclkdg", 1)],
    "minecraft:cave_spider": [("vcnwlon", 1), ("ifmasqj_leg_ewclkdg", 1)],
    "minecraft:slime": [("zxbvhct", 1)],
    # The End's mobs. The enderman sways in its idle; the endermite fidgets and wriggles a little; the shulker's head
    # wobbles (its move also sinks the head into the shell, which the stage's open lid leaves out); the dragon beats its
    # wings at about one a second with its legs tucked in, as the pack's flying state does.
    "minecraft:enderman": [("dhyaxuw", 1)],
    "minecraft:endermite": [("zxbvhct", 1), ("move", 0.4, 0.5)],
    "minecraft:shulker": [("move", 1, 1, ("head",))],
    "minecraft:ender_dragon": [("yvwtrbk_ewclkdg", 1), ("tutdjcp_usjvssc", 1, 0.75)],
    # The Nether's mobs, each in the idle the pack gives it.
    "minecraft:blaze": [("move", 1)],
    "minecraft:ghast": [("zxbvhct", 1)],
    "minecraft:happy_ghast": [("zxbvhct", 1)],
    "minecraft:hoglin": [("zxbvhct_pybbrwk", 1)],
    "minecraft:zoglin": [("zxbvhct", 1)],
    "minecraft:magma_cube": [("zxbvhct", 1)],
    "minecraft:piglin": [("zxbvhct_cdbdlxr", 1)],
    "minecraft:piglin_brute": [("kcukkwq.zxbvhct_wlswhwo", 1)],
    "minecraft:zombie_pigman": [("zxbvhct_ewclkdg_1", 1)],
    "minecraft:strider": [("zxbvhct_dhyaxuw", 1)],
    "minecraft:wither_skeleton": [("zxbvhct", 1)],
    # The wither's idle also circles two markers with nothing to draw, at a speed of their own that would stretch the loop.
    "minecraft:wither": [("zxbvhct_dhyaxuw", 1, 1, ("szehexq_olzaiyc", "szehexq_zxaydmm"))],
}
# A pet wolf now and then lies down for a while, as the pack's sitting controller has it: down, still a moment, one of
# its idles while it stays there (the pack picks one every few seconds), still again, and up. (The stage leaves out its
# sitting down, as it does the fox's.) Lying down, it falls asleep, its eyes closing (the blink bone, its eyelids, slid
# out to the face), sleeps with Zs floating up (a while: the pack's 30 to 60 seconds would be too long here), wakes,
# looks about once more and gets up. Lying down and getting up from it play at 1.5 times speed. All the while the game
# keeps the head level, looking ahead (its head-look animation turns the head relative to the entity; level_head here),
# and blends from one animation to the next.
def _wolf_seq(*steps):
    """Steps one after another, each (key, its length, speed, [bone pattern, shown] rules, animations played along,
    particles while it plays, a STAGE_PARTICLES kind): an act's parts and effects."""
    parts, effects, t = [], [], 0
    for key, length, speed, show, along, effect in steps:
        span = length / speed
        parts.append((key, round(t, 4), round(t + span, 4), show, speed))
        parts += [(other, round(t, 4), round(t + span, 4), []) for other in along]
        if effect:
            effects.append([effect, round(t, 4), round(t + span, 4)])
        t += span
    return parts, effects


def _step(key, length, speed=1, show=(), along=(), effect=None):
    return (key, length, speed, list(show), list(along), effect)


_STILL = 1.5
_LIE_IDLES = [("nesxtwu_zxbvhct_0", 2.9583), ("nesxtwu_zxbvhct_1", 3.4583), ("nesxtwu_zxbvhct_2", 2.9167), ("nesxtwu_zxbvhct_3", 2.9167)]
_EYES_SHUT = [["blink", True]]
_WOLF_SLEEP_FOR = 10



def _wolf_lie(first, last):
    parts, effects = _wolf_seq(
        _step("nesxtwu_cwscbtb", 1.2917, 1.5, along=["nesxtwu_lrbzenm"]), _step("nesxtwu", _STILL), _step(*first), _step("nesxtwu", _STILL),
        _step("nesxtwu_qsoshkp_cwscbtb", 5.3333, show=_EYES_SHUT, along=["nesxtwu_lrbzenm"]),
        _step("nesxtwu_qsoshkp", _WOLF_SLEEP_FOR, show=_EYES_SHUT, along=["nesxtwu_lrbzenm"], effect="z"),
        _step("nesxtwu_qsoshkp_fofftzt", 3.25, show=_EYES_SHUT), _step("nesxtwu", _STILL), _step(*last), _step("nesxtwu", _STILL),
        _step("nesxtwu_fofftzt", 1.625, 1.5))
    return {"every": [6, 12], "level_head": True, "parts": parts, "effects": effects}


_WOLF_LIE = [_wolf_lie(_LIE_IDLES[0], _LIE_IDLES[2]), _wolf_lie(_LIE_IDLES[1], _LIE_IDLES[3])]
# Moods a mob can be put in on the stage, other than its calm self: what the game answers in that mood, the animations
# that loop, the ones held at their last frame (a stance it settles into) and what it does now and then, as STAGE_ACTS.
# An angry wolf tenses up and growls with a shake of its head; the pack gives it its own skins and red eyes. A pet wears a
# collar (collar: its color can be picked), can wear armor (armor: see STAGE_ARMOR) and holds its tail high, 0.55 of a half turn at full health, as the game has
# it; now and then it looks about and shakes itself like a dog.
STAGE_MOODS = {
    "minecraft:wolf": {
        "angry": {"queries": {"is_angry": 1.0}, "loops": [("hhjrlam", 1)], "held": ["gfggyzv_gkbnvqq"],
                  "act": {"every": [3, 6], "parts": [("cogyszp", 0, None, [])]}},
        "pet": {"queries": {"is_tamed": 1.0, "tail_angle": 0.55 * math.pi}, "loops": [("hhjrlam", 1), ("hjwhrxn", 1)], "held": [], "collar": True, "armor": True,
                "act": [{"every": [6, 12], "parts": [("zxbvhct_1", 0, None, []), ("furiuhw", 3.4583, None, [])]}, *_WOLF_LIE]},
    },
}
# Sizes a mob comes in, which the game sets by q.variant: how big each is beside the biggest, and what the game answers
# for it where that changes its look (the smallest has one health, and skins of its own).
_SIZES = {"big": {"zoom": 1}, "medium": {"zoom": 0.5}, "small": {"zoom": 0.25, "queries": {"max_health": 1.0}}}
STAGE_SIZES = {"minecraft:slime": _SIZES, "minecraft:magma_cube": _SIZES}
# Climates a mob comes in, which the game sets by its climate_variant property: the game's answers for each where that
# changes its look (the pack's chickens: a warm one's skin, and a cold one's own model and skin, babies too).
_CLIMATE = lambda c: {"property": lambda p: {"minecraft:climate_variant": c}.get(p, 0.0), "has_property": lambda *a: 1.0}
STAGE_CLIMATES = {"minecraft:chicken": {"warm": _CLIMATE("warm"), "cold": _CLIMATE("cold")}}
# Mobs with see-through shells round them (bones with the game's alpha blended material), drawn over what's inside.
SHELLED = ("minecraft:slime",)
# Armor a mob can wear in a mood. The pack keeps it as an item, whose bones are named for the wearer's so they move with
# it; here they go on a copy of the wearer's own skeleton. cracks: its wear, the attachable's own textures in order.
STAGE_ARMOR = {"minecraft:wolf": {"item": "minecraft:wolf_armor", "plain": "default", "dyed": "mauatk",
                                  "cracks": {"low": "jfregp", "medium": "tcviuk", "high": "npozmm"}}}
# The wolf's biome variants. The pack only draws the one it's given, so their skins are copied beside the pale wolf's
# (the pack's own "wolf", "wolf_angry", "wolf_baby", "wolf_angry_baby") as wolf_<variant>, wolf_<variant>_angry,
# wolf_<variant>_baby and wolf_<variant>_angry_baby, for the stage to swap in (WOLF_VARIANTS in src/mob-data.js).
# variant -> the pack's name for it.
WOLF_SKIN_DIR = "textures/oreville/ans/cxwybzn/jijpgcf"
WOLF_VARIANTS = {"ashen": "kbixkxy", "black": "fryyvuo", "chestnut": "vxzgdbj", "rusty": "ffjkhvf", "snowy": "vdeesct",
                 "spotted": "pcjqzuq", "striped": "zfzcnfg", "woods": "ohkkyjs"}


def copy_wolf_variants(out):
    """The wolf variants' skins into out (art/mobs/); returns the pack paths it couldn't find."""
    missing = []
    for variant, code in WOLF_VARIANTS.items():
        for baby in ("", "_baby"):
            for mood, angry in (("olzaiyc", ""), ("zxaydmm", "_angry")):
                path = f"{WOLF_SKIN_DIR}{'_rkwlfgo' if baby else ''}_{code}_{mood}"
                src = texture_file(path)
                if not src:
                    missing.append(path)
                elif src.suffix == ".tga":
                    tga_to_png(src, out / f"wolf_{variant}{angry}{baby}.png")
                else:
                    shutil.copyfile(src, out / f"wolf_{variant}{angry}{baby}.png")
    return missing


# Particles the stage draws for what a mob does (an act's effects): kind -> the pack's texture, copied into art/mobs/ as
# particle_<kind>. A sleeping wolf's Zs (the pack's oreville_ans:pupoyec_wrciiur).
STAGE_PARTICLES = {"z": "textures/particle/z"}


def copy_particles(out):
    """The stage's particle textures into out (art/mobs/); returns the ones it couldn't find."""
    missing = []
    for kind, path in STAGE_PARTICLES.items():
        src = texture_file(path)
        if not src:
            missing.append(path)
        elif src.suffix == ".tga":
            tga_to_png(src, out / f"particle_{kind}.png")
        else:
            shutil.copyfile(src, out / f"particle_{kind}.png")
    return missing


# Things a mob does now and then on the stage instead of its usual animation: how many seconds apart, and the parts of
# the sequence as (key, starts at, ends at or None for the animation's own length, which parts it shows or hides, and
# optionally its speed and weight). A mob with a list of them does one at random each time, by their weight (1 if not
# given), as often as the first one says.
# Rolled up, the armadillo's game state swaps its body for the shell, which the animations alone don't do.
_SHELL = [["body_kptqgue", True]]
_ROLLED = _SHELL + [[bone, False] for bone in ("xscxjyu", "hjwhrxn", "btvzfqb_leg", "zrmwhbt_leg")]
# The armadillo stands breathing, and now and then does one of the idles the pack's idle controller picks from (the
# first at its blend weight, 1.2), easing in and out over that controller's 0.3-second blend, over its breathing (keep);
# or rolls up (one time in three).
_ARMADILLO_IDLES = [{"every": [4, 9], "keep": True, "ease": 0.3, "parts": [("zxbvhct_0", 0, None, [], 1, 1.2)]},
                    {"every": [4, 9], "keep": True, "ease": 0.3, "parts": [("zxbvhct_1", 0, None, [])]}]
# The bat blinks now and then, its eyelids (the blink bone) showing for a moment; or, less often, flies up and hangs
# upside down to rest, its eyes shut, as the pack's resting state has it: it settles (held there all the while), does
# its two resting idles in turn with a slow sway, and takes off again, its wings still while it hangs.
_BAT_EYES = [["blink", True]]
_BAT_SETTLE, _BAT_HANG = 2.2083, [("zxbvhct_0", 2.7917), ("zxbvhct_1", 1.625), ("zxbvhct_0", 2.7917)]
_BAT_DOWN = _BAT_SETTLE + sum(length for _, length in _BAT_HANG)
_BAT_REST = {"every": [3, 6], "weight": 1, "parts": [("iedyhtk", 0, _BAT_DOWN, _BAT_EYES), ("dhyaxuw", _BAT_SETTLE, _BAT_DOWN, []),
    *[(key, _BAT_SETTLE + sum(l for _, l in _BAT_HANG[:i]), _BAT_SETTLE + sum(l for _, l in _BAT_HANG[:i + 1]), []) for i, (key, _) in enumerate(_BAT_HANG)],
    ("uyoazhn_bghnmsg", _BAT_DOWN, None, _BAT_EYES)]}
_BAT_BLINK = {"every": [3, 6], "keep": True, "weight": 3, "parts": [("ybdngee.vrsrjmv_head", 0, None, _BAT_EYES)]}
# The bee now and then has its nectar (the pack's has-nectar animation: a tilt and a squint), blinks, or, less often,
# dives to sting, its wings beating all the while.
_BEE_NECTAR = {"every": [4, 8], "keep": True, "weight": 2, "parts": [("jtapgrq_rsaxbcr", 0, None, []), ("jtapgrq_rsaxbcr_xycyjhg", 0, None, []),
                                                                     ("jtapgrq_rsaxbcr_xlvwauz", 0, None, [])]}
_BEE_BLINK = {"every": [4, 8], "keep": True, "weight": 2, "parts": [("blink", 0, None, [])]}
_BEE_STING = {"every": [4, 8], "keep": True, "weight": 1, "parts": [("xxloynm", 0, None, [])]}
# The camel now and then does one of the three idles the pack's idle controller picks from, over its breathing (keep),
# blending in and out over that controller's 0.24 seconds; or sits down for a while, breathing as it sits (the pack's
# sitting breath, at half strength), and gets up again.
_CAMEL_IDLES = [{"every": [4, 9], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in ("zxbvhct_0", "zxbvhct_1", "zxbvhct_2")]
_CAMEL_SITS_FOR = 6
_CAMEL_SIT = {"every": [4, 9], "parts": [("rolmmlp_tsailnj", 0, 1.6667 + _CAMEL_SITS_FOR, []), ("zxbvhct_dhyaxuw", 1.6667, 1.6667 + _CAMEL_SITS_FOR, [], 1, 0.5),
                                        ("hhjrlam_bghnmsg", 1.6667 + _CAMEL_SITS_FOR, None, [])]}
# The polar bear blinks now and then (its open eyes shrink to nothing for a moment, over its breathing: keep, at half
# speed so it's seen).
_BEAR_BLINK = {"every": [3, 6], "keep": True, "parts": [("ybdngee.vrsrjmv_utidvpw", 0, None, [], 0.5)]}
# The ocelot blinks now and then (its eyelids, the blink bone, showing for a moment, over its standing motion: keep), or
# does one of the two idles the pack's standing state picks from (a look about, a longer fidget), blending in and out
# over that state's 0.3 seconds.
_OCELOT_BLINK = {"every": [3, 6], "keep": True, "weight": 3, "parts": [("ybdngee.2", 0, None, [["blink", True]], 0.5)]}
_OCELOT_IDLES = [{"every": [3, 6], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("zxbvhct_0", "zxbvhct_1")]
# The chicken's open eyes shrink to nothing for a moment now and then (over its breathing: keep, at half speed so it's
# seen), or it does one of the three idles the pack's standing state picks from (a peck, a look about), blending in and
# out over that state's 0.3 seconds.
_CHICKEN_BLINK = {"every": [3, 6], "keep": True, "weight": 3, "parts": [("ybdngee.vrsrjmv_utidvpw", 0, None, [], 0.5)]}
_CHICKEN_IDLES = [{"every": [3, 6], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("zxbvhct_0", "zxbvhct_1", "zxbvhct_2")]
STAGE_ACTS = {
    "minecraft:chicken": [_CHICKEN_BLINK, *_CHICKEN_IDLES],
    "minecraft:ocelot": [_OCELOT_BLINK, *_OCELOT_IDLES],
    "minecraft:polar_bear": _BEAR_BLINK,
    "minecraft:camel": [*_CAMEL_IDLES, _CAMEL_SIT],
    "minecraft:bat": [_BAT_BLINK, _BAT_REST],
    "minecraft:bee": [_BEE_NECTAR, _BEE_BLINK, _BEE_STING],
    "minecraft:armadillo": [*_ARMADILLO_IDLES, {"every": [8, 18], "parts": [
        ("vvwpqiu_bghnmsg", 0, None, _SHELL),
        ("kptqgue_bghnmsg", 0.9048, 5.2, _ROLLED),
        ("kpevzkf", 2, None, []),
        ("uqfdaza", 5.2, None, _SHELL),
    ]}],
    "minecraft:enderman": {"every": [7, 14], "parts": [("blink", 0, None, []), ("zxbvhct_1", 0.15, None, [])]},
    "minecraft:endermite": {"every": [3, 7], "parts": [("blink", 0, None, [])]},
    # The Nether's mobs blink, where the pack has them do it, and fidget as its idle fidgets go.
    "minecraft:happy_ghast": {"every": [8, 15], "parts": [("zxbvhct_0", 0, None, [])]},
    "minecraft:hoglin": {"every": [6, 12], "parts": [("ybdngee.rbpdocm", 0, None, []), ("zxbvhct_0", 0.25, None, [])]},
    "minecraft:magma_cube": {"every": [3, 7], "parts": [("blink", 0, None, [])]},
    "minecraft:piglin": {"every": [6, 12], "parts": [("ybdngee.vrsrjmv_utidvpw", 0, None, []), ("zxbvhct_0", 0.2, None, [])]},
    "minecraft:piglin_brute": {"every": [6, 12], "parts": [("ybdngee.vrsrjmv_utidvpw", 0, None, []), ("zxbvhct_1", 0.2, None, [])]},
    "minecraft:zombie_pigman": {"every": [6, 12], "parts": [("ybdngee.vrsrjmv_utidvpw", 0, None, []), ("zxbvhct_2", 0.2, None, [])]},
    "minecraft:strider": {"every": [3, 7], "parts": [("ybdngee.0", 0, None, [])]},
    "minecraft:wither_skeleton": {"every": [7, 14], "parts": [("zxbvhct_0", 0, None, [])]},
    # The wither's three heads look about on their own, as the pack has them, blinking one after another.
    "minecraft:wither": {"every": [6, 12], "parts": [
        ("zxbvhct_wcpswaz_1", 0, None, []), ("zxbvhct_left_1", 0, None, []), ("zxbvhct_right_1", 0.4, None, []),
        ("blink_bndlujl", 0.6, None, []), ("blink_right", 1.2, None, []), ("blink_left", 1.8, None, []),
    ]},
    # Spiders chatter their fangs now and then, and the bigger ones settle their bodies after. Their usual animation keeps
    # playing through it (keep), since that's what holds their legs in pose.
    "minecraft:spider": {"every": [5, 10], "keep": True, "parts": [("cogyszp", 0, None, []), ("dpxwbfw", 0.75, None, [])]},
    "minecraft:cave_spider": {"every": [5, 10], "keep": True, "parts": [("cogyszp", 0, None, [])]},
    "minecraft:slime": {"every": [4, 8], "parts": [("zijlcyt", 0, None, [])]},
    "minecraft:wolf": {"every": [6, 12], "parts": [("zxbvhct_0", 0, None, [])]},
    "minecraft:shulker": {"every": [2, 4], "parts": [("shut", 0, None, []), ("jlrfsid", 3, None, [])]},
}
# The shulker on the stage stands open, so the lid's own moves can't shut it: it pulls in with a twist, starting and
# stopping gently, stays shut, then rises the same way and settles with the pack's own shake (its hurt animation).
SHULKER_SHUT = {"animation_length": 3, "bones": {"ocbqbhz": {
    "position": {"0.0": [0, 0, 0], "0.15": [0, -0.8, 0], "0.5": [0, -6.2, 0], "0.65": [0, -7, 0], "2.1": [0, -7, 0], "2.3": [0, -6.2, 0], "2.8": [0, -0.8, 0], "3.0": [0, 0, 0]},
    "rotation": {"0.0": [0, 0, 0], "0.15": [0, -10, 0], "0.5": [0, -80, 0], "0.65": [0, -90, 0], "2.1": [0, -90, 0], "2.3": [0, -80, 0], "2.8": [0, -10, 0], "3.0": [0, 0, 0]},
}}}
# How far the squids' tentacles swing out from hanging straight, at their strength above.
TENTACLE_SWING = math.radians(52.5)
# The tadpole isn't in the pack, so neither is its swim: a wave down it once a second. Its body sways a little and bobs,
# its tail swings a beat behind and the tail's tip further still, so it ripples rather than flapping on a hinge.
TADPOLE_SWIM = {"bones": {
    "body": {"rotation": [0, "math.sin(q.anim_time*360)*7", 0], "position": [0, "math.sin(q.anim_time*180)*0.25", 0]},
    "tail": {"rotation": [0, "math.sin(q.anim_time*360-60)*20", 0]},
    "tail_tip": {"rotation": [0, "math.sin(q.anim_time*360-120)*24", 0]},
}}
MOTION_FPS = 20
# The pack leaves the tadpole to the game, so it has no model of one (only a smaller one inside its tadpole bucket, with
# its tail cut short), only its texture: a body and a flat tail, here in two pieces, the tip hanging from the base so the
# swim can bend it. The tail's faces are mapped by hand: box UV would give its far side the empty texels beside it.
TADPOLE_MODEL = {
    "description": {"identifier": "geometry.tadpole", "texture_width": 16, "texture_height": 16},
    "bones": [
        {"name": "root", "pivot": [0, 0, 0]},
        {"name": "body", "parent": "root", "pivot": [0, 2, -1.5], "cubes": [{"origin": [-1.5, 1, -3], "size": [3, 2, 3], "uv": [0, 0]}]},
        {"name": "tail", "parent": "body", "pivot": [0, 2, 0], "cubes": [{"origin": [0, 1, 0], "size": [0, 2, 4], "uv": {
            "east": {"uv": [3, 7], "uv_size": [4, 2]}, "west": {"uv": [7, 7], "uv_size": [-4, 2]}}}]},
        {"name": "tail_tip", "parent": "tail", "pivot": [0, 2, 4], "cubes": [{"origin": [0, 1, 4], "size": [0, 2, 3], "uv": {
            "east": {"uv": [0, 7], "uv_size": [3, 2]}, "west": {"uv": [3, 7], "uv_size": [-3, 2]}}}]},
    ],
}


def brarchive(data):
    """A .brarchive's files: count, version, 256-byte entries (name length, name, offset, size), then the data."""
    count = struct.unpack_from("<I", data, 8)[0]
    base, out = 16 + count * 256, {}
    for i in range(count):
        e = 16 + i * 256
        name = data[e + 1:e + 1 + data[e]].decode()
        off, size = struct.unpack_from("<II", data, e + 248)
        out[name] = json.loads(data[base + off:base + off + size])
    return out


def read_pack():
    """Entities, render controllers and models: the pack's own, then its Full Experience subpack's on top. The pack is
    the .mcpack, or a folder it was unpacked into, with each archive's files as plain JSON in a folder of its name."""
    if pack.is_dir():
        def load(tail):
            files = {}
            for top in (pack, pack / "subpacks" / SUBPACK):
                folder = top / tail.removesuffix(".brarchive")
                # Materials are .material files, the rest .json.
                for f in sorted([*folder.glob("*.json"), *folder.glob("*.material")]) if folder.is_dir() else []:
                    files[str(f.relative_to(pack))] = json.loads(f.read_text(encoding="utf-8"))
            return files
    else:
        z = zipfile.ZipFile(pack)
        def load(tail):
            files = {}
            for top in ("/__brarchive/", f"/subpacks/{SUBPACK}/__brarchive/"):
                name = next((n for n in z.namelist() if n.endswith(top + tail) and n.count("/subpacks/") == top.count("/subpacks/")), None)
                if name:
                    files.update(brarchive(z.read(name)))
            return files
    entities, controllers, models = load("entity.brarchive"), load("render_controllers.brarchive"), load("models/entity.brarchive")
    materials, animations, attachables = load("materials.brarchive"), load("animations.brarchive"), load("attachables.brarchive")
    # An entity can have a definition for each game version; the game takes the newest.
    ents, newest = {}, {}
    for f in entities.values():
        d = f.get("minecraft:client_entity", {}).get("description")
        if d:
            version = tuple(int(x) for x in (d.get("min_engine_version") or "0").split("."))
            if version >= newest.get(d["identifier"], (-1,)):
                ents[d["identifier"]], newest[d["identifier"]] = d, version
    rcs = {k: v for f in controllers.values() for k, v in f.get("render_controllers", {}).items()}
    geos = {g["description"]["identifier"]: g for f in models.values() for g in f.get("minecraft:geometry", [])}
    GEOS.update(geos)
    # Materials are "name:parent" with their changes; the pack's all come down to one of the game's own.
    mats = {}
    for f in materials.values():
        for key, props in f.get("materials", f).items():
            if isinstance(props, dict):
                name, _, parent = key.partition(":")
                mats[name] = (parent, props)
    anims = {k: v for f in animations.values() for k, v in f.get("animations", {}).items()}
    # Items that turn into props in the hand of an armor stand named §§.
    props = {}
    for f in attachables.values():
        d = f.get("minecraft:attachable", {}).get("description")
        if d and "is_name_any('§§')" in json.dumps(d, ensure_ascii=False):
            props[d["identifier"]] = d
    armors = {}
    for f in attachables.values():
        d = f.get("minecraft:attachable", {}).get("description")
        if d and d.get("identifier") in {a["item"] for a in STAGE_ARMOR.values()}:
            armors[d["identifier"]] = d
    return ents, rcs, geos, mats, anims, props, armors


# The game's own materials that glow by alpha, which the pack names but doesn't define: the eyes of the dragon, phantom,
# drowned and spiders (and the dragon's nostrils and the drowned's teal patches) are faint texels that shine at full
# color. (A baby spider's eyes are only that: cut out, they'd be holes.)
GAME_EMISSIVE = ("ender_dragon", "drowned", "phantom", "spider")
# And one that really is see-through: the breeze's wind.
GAME_SHEER = ("breeze_wind",)


def blended(name, mats):
    """Whether a material comes down to the game's alpha blended one: see-through by its texture's alpha."""
    chain = []
    while name and name not in chain:
        chain.append(name)
        name = mats.get(name, ("", {}))[0]
    return "entity_alphablend" in chain


def material_kind(name, mats):
    """What a material does to its layer: "glow" for light added on top (the eyes that shine in the dark, faded out
    by day), "stencil" for effects drawn only round other layers (outlines), "mask" when the texture's alpha picks
    what takes the mob's color (the sheep's wool), "lit" when it says how brightly each texel glows (so faint
    texels still show), "sheer" when its faint texels are see-through, or None for a plain layer."""
    states, add, chain, test = set(), False, [], None
    while name and name not in chain:
        chain.append(name)
        parent, props = mats.get(name, ("", {}))
        states |= set(props.get("+states", []))
        add = add or props.get("blendDst") == "One"
        test = test or props.get("frontFace", {}).get("stencilFunc")
        name = parent
    # Layers that write the stencil (Always) draw as usual; ones that test it only show round them.
    if any(n in GAME_SHEER for n in chain):
        return "sheer"
    if "EnableStencilTest" in states and test not in (None, "Always"):
        return "stencil"
    if "Blending" in states and add:
        return "glow"
    if any("change_color" in n or "color_mask" in n for n in chain):
        return "mask"
    return "lit" if any(n.startswith("entity_emissive") or n in GAME_EMISSIVE for n in chain) else None


# ---------- Looks ----------

# The pack's glow panels fade with how dark it is here: v.twozkac, 1 at full strength. A panel whose overlay still covers
# it completely at full strength never shows in this state (a calm wolf's red eyes); one it partly covers is that much
# dimmer (flags.bright, a spider's).
GLOW_STRENGTH = "twozkac"


def queries(name, held=False):
    """The game's answers while the pack's scripts run: a grown, untamed mob (an armadillo walking about, not rolled
    up) in a temperate biome, named name; or,
    held, an item in the hand of an armor stand named name. Snowy names only show on the cold kinds of cows, pigs
    and chickens, so those are cold."""
    no = lambda *a: 0.0
    climate = "cold" if name.lower() in ("snowy", "frosty", "frozen") else "temperate"
    return {
        "is_name_any": lambda *names: 1.0 if name in names else 0.0,
        "is_attached": 1.0 if held else 0.0,
        "graphics_mode_is_any": lambda *modes: 1.0 if "fancy" in modes else 0.0,
        "property": lambda p: {"minecraft:climate_variant": climate, "minecraft:armadillo_state": "unrolled"}.get(p, 0.0),
        "get_equipped_item_name": lambda *a: "", "in_range": lambda x, lo, hi: 1.0 if lo <= x <= hi else 0.0,
        "is_owner_identifier_any": lambda *ids: 1.0 if held and "minecraft:armor_stand" in ids else 0.0,
        **{q: no for q in ("entity_biome_has_any_identifier", "is_item_name_any", "has_property",
                           "relative_block_has_any_tag", "equipped_item_any_tag", "is_riding_any_entity_of_type", "position",
                           "bone_origin", "any", "has_any_leashed_entity_of_type", "armor_texture_slot", "get_animation_frame")},
        "health": 20.0, "max_health": 20.0, "is_alive": 1.0, "is_on_ground": 1.0, "time_of_day": 0.25, "delta_time": 0.05,
        "life_time": 10.0,
    }


def names_of(d):
    """Every name the entity's scripts check for, in the order they appear."""
    names = []
    s = d.get("scripts", {})
    for src in s.get("pre_animation", []) + s.get("initialize", []):
        for m in re.finditer(r"is_name_any\(([^)]*)\)", src):
            names += [n for n in re.findall(r"'([^']*)'", m.group(1)) if n not in names]
    return names


def scripted(d, name, held=False, mood=None):
    """The entity's (or item's) variables once its scripts have run for a mob called name, in a mood (more answers)."""
    env = Env({**queries(name, held), **GAME_ANSWERS.get(d.get("identifier"), {}), **(mood or {})}, c={"item_slot": "main_hand", "is_first_person": 0.0} if held else None)
    s = d.get("scripts", {})
    for src in s.get("initialize", []):
        evaluate(src, env)
    for _ in range(3):
        for src in s.get("pre_animation", []):
            evaluate(src, env)
    return env


def settled(channel):
    """A bone channel's value once its animation has settled: its last keyframe, if it has keyframes (props pop in
    from nothing, so their first keyframes are empty)."""
    if isinstance(channel, dict):
        last = channel[max(channel, key=float)]
        return last.get("post", last.get("pre")) if isinstance(last, dict) else last
    return channel


def poses(d, anims, env, plain):
    """The bone poses a name turns on: animations the entity only plays with that name, a while after they start.
    bone -> {r: rotation added, p: position added, s: scale}."""
    out = {}
    for a in d.get("scripts", {}).get("animate", []):
        if not isinstance(a, dict):
            continue
        key, cond = next(iter(a.items()))
        anim = anims.get(d.get("animations", {}).get(key, ""))
        if not anim or not truthy(evaluate(cond, env)) or truthy(evaluate(cond, plain)):
            continue
        aenv = Env({**env.q, "life_time": 10.0, "anim_time": 10.0}, v=dict(env.v))
        for bone, channels in anim.get("bones", {}).items():
            pose = out.setdefault(bone, {})
            for ch, k in (("rotation", "r"), ("position", "p"), ("scale", "s")):
                if ch not in channels:
                    continue
                v = settled(channels[ch])
                v = v if isinstance(v, list) else [v, v, v]
                vals = [x if isinstance(x, float) else 0.0 for x in (num(evaluate(x, aenv)) for x in v)]
                was = pose.get(k, [1, 1, 1] if k == "s" else [0, 0, 0])
                pose[k] = [a * b for a, b in zip(was, vals)] if k == "s" else [a + b for a, b in zip(was, vals)]
    return {b: p for b, p in out.items() if p}


def look(d, rcs, mats, anims, name, held=False, mood=None):
    """The entity's render layers while it's called name: [geometry id, [texture paths], [[bone pattern, shown]],
    flags], flags marking a layer that glows (emissive: the pack fades it out in daylight), one whose texture's
    alpha is a dye mask (the sheep's wool), and one whose texture scrolls (u and v per second); its scale; and the
    bone poses the name turns on."""
    env = scripted(d, name, held, mood)
    s = d.get("scripts", {})
    pick = lambda table, ref: isinstance(ref, tuple) and next((v for k, v in d.get(table, {}).items() if k.lower() == ref[1]), None)
    layers = []
    for r in d.get("render_controllers", []):
        rc_name, cond = (r, None) if isinstance(r, str) else next(iter(r.items()))
        rc = rcs.get(rc_name)
        if rc_name in SKIP_LAYERS or rc is None or (cond is not None and not truthy(evaluate(cond, env))):
            continue
        # A controller's arrays come in groups (geometries, textures, materials), and two groups can use the same name
        # (the bee's moths): each lookup takes its own group's first.
        groups = {}
        for kind_of, group in rc.get("arrays", {}).items():
            for k, vals in group.items():
                groups.setdefault(kind_of, {})[k.split(".", 1)[1].lower()] = [(v.split(".", 1)[0].lower(), v.split(".", 1)[1].lower()) for v in vals]
        arrays = {k: v for g in groups.values() for k, v in g.items()}
        renv = Env(env.q, arrays, v=env.v)
        of = lambda kind_of: Env(env.q, {**arrays, **groups.get(kind_of, {})}, v=env.v)
        geo = pick("geometry", evaluate(rc.get("geometry", "Geometry.default"), of("geometries")))
        texs = [pick("textures", evaluate(t, of("textures"))) for t in rc.get("textures", ["Texture.default"])]
        shown = [[pat, truthy(evaluate(expr, renv))] for pv in rc.get("part_visibility", []) for pat, expr in pv.items()]
        flags = {}
        mat = evaluate(next((expr for m in rc.get("materials", []) for pat, expr in m.items() if pat == "*"), "Material.default"), renv)
        kind = isinstance(mat, tuple) and material_kind(next((v for k, v in d.get("materials", {}).items() if k.lower() == mat[1]), ""), mats)
        # A layer whose every bone with cubes has a glowing material of its own glows as a whole: the sulfur spider's
        # eye panel is drawn with the spider's material but its one bone with the glowing one.
        if kind in (None, False, "lit"):
            def bone_kind_of(pat):
                expr = next((e for m in rc.get("materials", []) for p, e in m.items() if p == pat), None)
                bm = expr and evaluate(expr, renv)
                return isinstance(bm, tuple) and material_kind(next((v for k, v in d.get("materials", {}).items() if k.lower() == bm[1]), ""), mats)
            pats = [p for m in rc.get("materials", []) for p in m if p != "*"]
            solid = [b["name"] for b in GEOS.get(geo, {}).get("bones", []) if b.get("cubes")]
            glowing = [p for p in pats if bone_kind_of(p) == "glow"]
            if solid and glowing and all(any(fnmatch.fnmatchcase(b.lower(), p.lower()) for p in glowing) for b in solid):
                kind = "glow"
        if kind == "stencil":
            continue
        overlay = rc.get("overlay_color", {}).get("a") if kind == "glow" else None
        if isinstance(overlay, str) and GLOW_STRENGTH in overlay:
            cover = num(evaluate(overlay, Env(env.q, arrays, v={**env.v, GLOW_STRENGTH: 1.0})))
            if isinstance(cover, float) and cover >= 1:
                continue
            if isinstance(cover, float) and cover > 0:
                flags["bright"] = round(1 - cover, 3)
        if kind:
            flags[kind] = 1
        if kind == "glow" and d.get("identifier") in SOFT_GLOW:
            flags["soft"] = 1
        if d.get("identifier") in OPEN_EYES:
            flags["openEyes"] = 1
        if d.get("identifier") in LAYER_DYES:
            flags["dyes"] = LAYER_DYES[d["identifier"]]
        # Single bones can have a material of their own: the cats' eyes are emissive, on faint texels.
        lit_bones, dye_bones, shell_bones = [], [], []
        for m in rc.get("materials", []):
            for pat, expr in m.items():
                bone_mat = evaluate(expr, renv)
                bone_kind = isinstance(bone_mat, tuple) and material_kind(next((v for k, v in d.get("materials", {}).items() if k.lower() == bone_mat[1]), ""), mats)
                if pat != "*" and bone_kind == "lit" and pat not in lit_bones:
                    lit_bones.append(pat)
                if pat != "*" and bone_kind == "mask" and pat not in dye_bones:
                    dye_bones.append(pat)
                if pat != "*" and d.get("identifier") in SHELLED and isinstance(bone_mat, tuple) and pat not in shell_bones and blended(next((v for k, v in d.get("materials", {}).items() if k.lower() == bone_mat[1]), ""), mats):
                    shell_bones.append(pat)
        if lit_bones:
            flags["litBones"] = lit_bones
        if shell_bones:
            flags["shellBones"] = shell_bones
        # And some take a color the game gives them: a pet wolf's collar. (Only there: other mobs list these for armor the
        # stage doesn't show.)
        if dye_bones and mood and mood.get("is_tamed"):
            flags["dyeBones"] = dye_bones
        offset = rc.get("uv_anim", {}).get("offset")
        if offset:
            at = lambda t: [float(evaluate(o, Env({**env.q, "life_time": t}, arrays, v=dict(env.v)))) for o in offset]
            speed = [round(b - a, 4) for a, b in zip(at(0.0), at(1.0))]
            if any(speed):
                flags["scroll"] = speed
        if geo and all(texs):
            layers.append([geo, texs, shown, flags])
    scale = evaluate(s["scale"], env) if "scale" in s else 1.0
    return layers, scale, (poses(d, anims, env, scripted(d, "", held)) if name else {})


def channel_at(channel, t, env):
    """A bone channel's [x, y, z] at t seconds: its formulas, or between the keyframes either side of t."""
    def values(v):
        return [x if isinstance(x, float) else 0.0 for x in (num(evaluate(e, env)) for e in (v if isinstance(v, list) else [v, v, v]))]
    if not isinstance(channel, dict):
        return values(channel)
    side = lambda key, which: channel[key].get(which, channel[key].get("post", channel[key].get("pre"))) if isinstance(channel[key], dict) else channel[key]
    keys = sorted(channel, key=float)
    if t <= float(keys[0]):
        return values(side(keys[0], "pre"))
    smooth = lambda key: isinstance(channel[key], dict) and channel[key].get("lerp_mode") == "catmullrom"
    for i, (a, b) in enumerate(zip(keys, keys[1:])):
        if t <= float(b):
            mix = (t - float(a)) / (float(b) - float(a))
            p1, p2 = values(side(a, "post")), values(side(b, "pre"))
            if not (smooth(a) or smooth(b)):
                return [p + (q - p) * mix for p, q in zip(p1, p2)]
            # Catmull-Rom through the keyframes either side, as the game smooths a catmullrom keyframe's segments (an end
            # keyframe stands in for the missing neighbour).
            p0 = values(side(keys[i - 1], "post")) if i else p1
            p3 = values(side(keys[i + 2], "pre")) if i + 2 < len(keys) else p2
            m2, m3 = mix * mix, mix * mix * mix
            return [0.5 * (2 * q1 + (q2 - q0) * mix + (2 * q0 - 5 * q1 + 4 * q2 - q3) * m2 + (3 * q1 - q0 - 3 * q2 + q3) * m3)
                    for q0, q1, q2, q3 in zip(p0, p1, p2, p3)]
    return values(side(keys[-1], "post"))


def baked_loop(d, anims, key, weight, rate=1, pinned=(), answers=None):
    """One looping animation as {length, bones}: bone -> {r, p, s}, each a list of [x, y, z] frames over the loop (one
    frame where a channel never changes), weight times as strong and rate times as fast, with the pinned bones' moves
    left out. The loop is the animation's
    own length, or if it's all formulas, when their so many degrees a second all come round together."""
    anim = anims[d["animations"][key]]
    moves = {bone: {ch: v for ch, v in channels.items() if not (ch == "position" and bone in pinned)} for bone, channels in anim["bones"].items()}
    # In tenths: a speed can be a fraction (the wolf's 82.5), and rounding it would stretch the loop to minutes.
    speeds = [round(float(x) * 10) for x in re.findall(r"(?:anim_time|life_time)\s*\*\s*([\d.]+)", json.dumps(moves))]
    span = anim.get("animation_length") or (3600 / math.gcd(*speeds) if speeds else 1)
    length = span / rate
    count = max(1, math.ceil(length * MOTION_FPS))
    return {"length": round(length, 4), "bones": baked_bones(d, anim, [i / count * span for i in range(count)], weight, pinned, answers)}


def baked_bones(d, anim, times, weight=1, pinned=(), answers=None, level=(), loop=None):
    """An animation at those times: bone -> {r, p, s}, each a list of [x, y, z] frames (one where it never changes).
    answers: what the game says in the mood it's playing in. A bone turned relative to the entity (relative_to
    rotation: entity, as a wolf's head is while it sits or lies) keeps that turn whatever the bones it hangs from do: the
    turns the same animation gives those are taken off its own. level: bones kept turned relative to the entity whatever
    the animation says (the game's head-look animation does that for a wolf's head while it sits or lies). loop: how
    long a looping animation lasts, for its keyframes to go round again past that."""
    plain = scripted(d, "", mood=answers)
    bones = {}
    for bone, channels in anim["bones"].items():
        for ch, k in (("rotation", "r"), ("position", "p"), ("scale", "s")):
            if ch not in channels or (k == "p" and bone in pinned):
                continue
            frames = []
            for t in times:
                env = Env({**plain.q, "life_time": t, "anim_time": t}, v=dict(plain.v))
                vals = channel_at(channels[ch], t % loop if loop and t > loop else t, env)
                frames.append([1 + (v - 1) * weight if k == "s" else v * weight for v in vals])
            bones.setdefault(bone, {})[k] = frames
    parents = bone_parents(d)
    for bone in level:
        if not any(b.lower() == bone for b in bones):
            bones[bone] = {}
        named = next(b for b in bones if b.lower() == bone)
        bones[named].setdefault("r", [[0, 0, 0] for _ in times])
    for bone, channels in [*anim["bones"].items(), *((b, {}) for b in bones if b not in anim["bones"])]:
        entity = (channels.get("relative_to") or {}).get("rotation") == "entity" or bone.lower() in level
        if not entity or "r" not in bones.get(bone, {}):
            continue
        up = parents.get(bone.lower())
        while up:
            turned = next((b for b in bones if b.lower() == up), None)
            if turned and "r" in bones[turned]:
                bones[bone]["r"] = [[v - u for v, u in zip(f, bones[turned]["r"][i])] for i, f in enumerate(bones[bone]["r"])]
            up = parents.get(up)
    for channels in bones.values():
        for k, frames in channels.items():
            frames = [[round(v, 2) for v in f] for f in frames]
            channels[k] = frames[:1] if all(f == frames[0] for f in frames) else frames
    return compact(bones)


# The pack's models by name, once read_pack has read them, for the bones' hierarchy.
GEOS = {}


def bone_parents(d):
    """An entity's usual model's bones: bone -> the bone it hangs from (lower case), for relative_to."""
    geo = GEOS.get((d.get("geometry") or {}).get("default"), {})
    return {b["name"].lower(): b["parent"].lower() for b in geo.get("bones", []) if b.get("parent")}


def baked_held(d, anims, key, answers=None, weight=1):
    """An animation held at its last frame, as a loop that never changes, weight times as strong."""
    anim = anims[d["animations"][key]]
    return {"length": 1, "bones": baked_bones(d, anim, [anim["animation_length"]], weight, answers=answers)}


def baked_act(d, anims, act, answers=None):
    """Something a mob does now and then: {every: [least, most seconds apart], length, parts}, each part {from, to,
    bones (frames from its start to its end), show ([bone pattern, shown] rules while it plays)}. A part can play
    faster (a fifth item, its speed), as the pack's anim_time_update has it. A list of acts is baked one by one."""
    if isinstance(act, list):
        return [baked_act(d, anims, a, answers) for a in act]
    parts = []
    # level_head: True for a bone named head, or the head bone's own name (the panda's is scrambled).
    lh = act.get("level_head")
    level = ((lh if isinstance(lh, str) else "head").lower(),) if lh else ()
    for key, start, end, show, *more in act["parts"]:
        # No key: a part that only shows or hides bones for a while (the fox's blink swaps its head for one with its
        # eyes shut, by the pack's part_visibility).
        anim, rate, weight = anims[d["animations"][key]] if key else {"bones": {}}, (more + [1])[0], (more + [1, 1])[1]
        span = (end - start) if end is not None else anim["animation_length"] / rate
        count = max(2, math.ceil(span * MOTION_FPS) + 1)
        # A looping animation played longer than it lasts goes round again.
        loop = anim.get("animation_length") if anim.get("loop") is True else None
        parts.append({"from": start, "to": round(start + span, 4), "bones": baked_bones(d, anim, [i / (count - 1) * span * rate for i in range(count)], weight=weight, answers=answers, level=level, loop=loop), "show": show})
    return {"every": act["every"], "length": max(p["to"] for p in parts), **({"keep": 1} if act.get("keep") else {}), **({"ease": act["ease"]} if act.get("ease") else {}),
            **({"weight": act["weight"]} if act.get("weight", 1) != 1 else {}),
            "parts": parts, **({"effects": act["effects"]} if act.get("effects") else {})}


# ---------- Models ----------

def shown(name, rules):
    vis = True
    for pat, on in rules:
        if fnmatch.fnmatchcase(name.lower(), pat.lower()):
            vis = on
    return vis


def compact(v):
    if isinstance(v, float):
        v = round(v, 4)
        return int(v) if v == int(v) else v
    if isinstance(v, list):
        return [compact(x) for x in v]
    if isinstance(v, dict):
        return {k: compact(x) for k, x in v.items()}
    return v


FACE_KEYS = {"north": "n", "south": "s", "east": "e", "west": "w", "up": "u", "down": "d"}


def model(g):
    """A geometry as [texture width, texture height, bones]: each bone [name, parent index or -1, pivot,
    rotation or 0, cubes], each cube [x, y, z, w, h, d, uv, extras] with uv [u, v] for the usual box layout or
    {face: [u, v, w, h]} (and a fifth, the degrees the face's texture is turned clockwise, where the pack turns it: a
    pig saddle's side flaps), and extras {inflate, mirror, pivot, rotation} only where the cube has them."""
    bones = g.get("bones", [])
    by_name = {b["name"]: b for b in bones}
    has_cubes = {b["name"] for b in bones if b.get("cubes")}
    keep = set()
    for name in has_cubes:
        while name and name not in keep:
            keep.add(name)
            name = by_name.get(name, {}).get("parent")
    kept = [b for b in bones if b["name"] in keep]
    index = {b["name"]: i for i, b in enumerate(kept)}
    out = []
    for b in kept:
        cubes = []
        for c in b.get("cubes", []):
            uv = c["uv"]
            if isinstance(uv, dict):
                uv = {FACE_KEYS[f]: [*u["uv"], *u.get("uv_size", [0, 0]), *([u["uv_rotation"] % 360] if u.get("uv_rotation", 0) % 360 else [])]
                      for f, u in uv.items() if f in FACE_KEYS and "uv" in u}
            extras = {}
            inflate = c.get("inflate", b.get("inflate", 0))
            if inflate:
                extras["inflate"] = inflate
            if c.get("mirror", b.get("mirror", False)):
                extras["mirror"] = 1
            if c.get("rotation") and any(c["rotation"]):
                extras["pivot"], extras["rotation"] = c.get("pivot", [0, 0, 0]), c["rotation"]
            cubes.append([*c["origin"], *c["size"], uv] + ([extras] if extras else []))
        rot = b.get("rotation")
        out.append([b["name"], index.get(b.get("parent"), -1), b.get("pivot", [0, 0, 0]), rot if rot and any(rot) else 0, cubes])
    d = g["description"]
    return compact([d.get("texture_width", 64), d.get("texture_height", 64), out])


def seat_tentacles(g):
    """Keep a squid's tentacles inside its body as they swing. The model hangs each from a pivot above the body's bottom
    and against its wall, so swinging out pushes the tentacle through the wall. This pivots each at the bottom instead,
    moved in just far enough that at its widest swing the outer edge leaves the bottom face inside the wall. What's above
    the pivot then swings inward, out of sight."""
    bones = {b["name"]: b for b in g["bones"]}
    body = bones["body"]["cubes"][0]
    bottom, wall = body["origin"][1], body["origin"][0] + body["size"][0]
    for b in g["bones"]:
        if not b["name"].startswith(_TENTACLES[0][:-1]):
            continue
        x, y, z = b["pivot"]
        reach = math.hypot(x, z)
        half = b["cubes"][0]["size"][0] / 2
        # How far along the ring's direction the wall is, and how much of the tentacle's width sticks out sideways.
        along = max(abs(x), abs(z)) / reach
        across = math.sqrt(1 - along * along)
        ring = min(reach, (wall - half * across) / along - half / math.cos(TENTACLE_SWING))
        dx, dz = x / reach * ring - x, z / reach * ring - z
        b["pivot"] = [x + dx, min(y, bottom), z + dz]
        for c in b["cubes"]:
            c["origin"] = [c["origin"][0] + dx, c["origin"][1], c["origin"][2] + dz]


def glow_panels(g, rules, flags):
    """Mark a glow layer made of nothing but flat panels as soft light: eyes or a halo (see HALO_PANEL). Glows with any
    thickness (cubes on a face) stay solid."""
    if not flags.get("glow") or flags.get("soft"):
        return
    bones = [b for b in g.get("bones", []) if b.get("cubes") and shown(b["name"], rules)]
    cubes = [(b, c) for b in bones for c in b["cubes"]]
    if not cubes or any(0 not in c["size"] for _, c in cubes):
        return
    def behind(b, c):
        return c["size"][2] == 0 and c["origin"][2] >= b.get("pivot", [0, 0, 0])[2]
    # A panel an importer has stretched to the size the pack's scripts give it (the spider's eyes) says itself that it's eyes.
    halo = any((max(c["size"]) >= HALO_PANEL and not c.get("eyes")) or behind(b, c) for b, c in cubes)
    flags["soft"] = flags["halo" if halo else "eyes"] = 1


def texture_file(path):
    """A texture's file: from the texture folder, else (for an unpacked pack) the pack's Full Experience subpack's,
    else the pack's own. An empty file (a placeholder) doesn't count."""
    rel = path[len("textures/"):] if path.startswith("textures/") else path
    bases = [textures, textures / "_base"] + ([pack / "subpacks" / SUBPACK / "textures", pack / "textures"] if pack.is_dir() else [])
    for base in bases:
        for ext in (".png", ".tga"):
            f = base / (rel + ext)
            if f.exists() and f.stat().st_size:
                return f
    return None


def main():
    ents, rcs, geos, mats, anims, prop_items, armors = read_pack()
    geo_keys, tex_keys, looks, props = {}, {}, {}, {}

    def layers_out(key, label, layers):
        """A look's layers with models and textures named for it (key, then label, then the layer's number)."""
        out_layers = []
        for i, (geo, texs, rules, flags) in enumerate(layers):
            g = geos.get(geo)
            if not g:
                print(f"{key}: no model {geo}")
                continue
            glow_panels(g, rules, flags)
            part = "_".join(filter(None, [key, label, str(i) if i else ""]))
            if not any(shown(b["name"], rules) for b in g.get("bones", []) if b.get("cubes")):
                continue
            geo_keys.setdefault(geo, part)
            names = []
            for j, t in enumerate(texs):
                if t not in tex_keys:
                    tex_keys[t] = "_".join(filter(None, [part, str(j) if j else ""]))
                names.append(tex_keys[t])
            out_layers.append([geo_keys[geo], names, rules[1:] if rules[:1] == [["*", True]] else rules] + ([flags] if flags else []))
        return out_layers

    for ident, d in sorted(ents.items()):
        names = names_of(d)
        mob = ident.split(":")[1]
        if not names and mob not in NAMELESS_MOBS:
            continue
        mob = MOB_KEYS.get(mob, mob)
        base_layers, base_scale, _ = look(d, rcs, mats, anims, "")
        # Names that change nothing on their own (Saddleless needs a saddle on) look like no name.
        groups = [[[], base_layers, base_scale, {}]]
        for n in names:
            layers, scale, pose = look(d, rcs, mats, anims, n)
            same = next((g for g in groups if g[1:] == [layers, scale, pose]), None)
            if not same:
                groups.append([[n], layers, scale, pose])
            elif same is not groups[0]:
                same[0].append(n)
        entries = []
        for names_, layers, scale, pose in groups:
            label = re.sub(r"\W+", "_", names_[0].lower()).strip("_") if names_ else ""
            # The pack scales babies and some whole models; the tab draws each look the size of the mob's default.
            rel = round(scale / base_scale, 3) if base_scale else 1
            entries.append({"names": names_, "scale": rel, "layers": layers_out(mob, label, layers), **({"pose": compact(pose)} if pose else {})})
        looks[mob] = entries

    # Moods: each of the mob's looks again, in the same order, as it looks in that mood.
    mood_looks = {}
    for ident, moods in STAGE_MOODS.items():
        d, mob = ents[ident], MOB_KEYS.get(ident.split(":")[1], ident.split(":")[1])
        for mood, spec in moods.items():
            base_scale = look(d, rcs, mats, anims, "", mood=spec["queries"])[1]
            entries = []
            for entry in looks[mob]:
                names_ = entry["names"]
                layers, scale, pose = look(d, rcs, mats, anims, names_[0] if names_ else "", mood=spec["queries"])
                label = "_".join(filter(None, [mood, re.sub(r"\W+", "_", names_[0].lower()).strip("_") if names_ else ""]))
                rel = round(scale / base_scale, 3) if base_scale else 1
                entries.append({"names": names_, "scale": rel, "layers": layers_out(mob, label, layers), **({"pose": compact(pose)} if pose else {})})
            mood_looks.setdefault(mob, {})[mood] = entries

    # Sizes: where one looks different, each of the mob's looks again, in the same order.
    size_data = {}
    for ident, sizes in STAGE_SIZES.items():
        d, mob = ents[ident], MOB_KEYS.get(ident.split(":")[1], ident.split(":")[1])
        size_data[mob] = {}
        for size, spec in sizes.items():
            entry = {"zoom": spec["zoom"]}
            if spec.get("queries"):
                entry["looks"] = []
                for base in looks[mob]:
                    names_ = base["names"]
                    layers, _, pose = look(d, rcs, mats, anims, names_[0] if names_ else "", mood=spec["queries"])
                    label = "_".join(filter(None, [size, re.sub(r"\W+", "_", names_[0].lower()).strip("_") if names_ else ""]))
                    entry["looks"].append({"names": names_, "scale": base["scale"], "layers": layers_out(mob, label, layers), **({"pose": compact(pose)} if pose else {})})
            size_data[mob][size] = entry

    # Climates: the looks that come out different in that climate, by their place in the mob's looks.
    climate_data = {}
    for ident, climates in STAGE_CLIMATES.items():
        d, mob = ents[ident], MOB_KEYS.get(ident.split(":")[1], ident.split(":")[1])
        climate_data[mob] = {}
        for climate, answers in climates.items():
            changed = {}
            for i, base in enumerate(looks[mob]):
                names_ = base["names"]
                name = names_[0] if names_ else ""
                layers, _, pose = look(d, rcs, mats, anims, name, mood=answers)
                if layers == look(d, rcs, mats, anims, name)[0]:
                    continue
                label = "_".join(filter(None, [climate, re.sub(r"\W+", "_", name.lower()).strip("_")]))
                changed[i] = {"names": names_, "scale": base["scale"], "layers": layers_out(mob, label, layers), **({"pose": compact(pose)} if pose else {})}
            climate_data[mob][climate] = {"looks": changed}

    # Armor: its cubes on a copy of the wearer's skeleton, and its textures under names of their own.
    armor_data = {}
    for ident, spec in STAGE_ARMOR.items():
        mob = MOB_KEYS.get(ident.split(":")[1], ident.split(":")[1])
        item, key = armors[spec["item"]], f"{mob}_armor"
        worn = geos[next(iter(item["geometry"].values()))]
        cubes = {b["name"]: b.get("cubes", []) for b in worn["bones"]}
        geo = f"geometry.stage.{key}"
        geos[geo] = {"description": {**worn["description"], "identifier": geo},
                     "bones": [{**b, "cubes": cubes.get(b["name"], [])} for b in geos[ents[ident]["geometry"]["default"]]["bones"]]}
        geo_keys[geo] = key
        named = lambda tex, name: tex_keys.setdefault(item["textures"][tex], name)
        armor_data[mob] = {"model": key, "plain": named(spec["plain"], key), "dyed": named(spec["dyed"], f"{key}_dyed"),
                           "cracks": {k: named(tex, f"{key}_cracks_{k}") for k, tex in spec["cracks"].items()}}

    geos[TADPOLE_MODEL["description"]["identifier"]] = TADPOLE_MODEL
    looks["tadpole"] = [{"names": [], "scale": 1, "layers": layers_out("tadpole", "", [["geometry.tadpole", ["textures/entity/tadpole/tadpole"], [], {}]])}]

    for ident, d in sorted(prop_items.items()):
        item = ident.split(":")[1]
        layers, _, pose = look(d, rcs, mats, anims, "§§", held=True)
        out_layers = layers_out(f"prop_{item}", "", layers)
        if out_layers:
            props[item] = {"names": ["§§"], "scale": 1, "layers": out_layers, **({"pose": compact(pose)} if pose else {})}

    # Textures, as PNGs named for the first look that uses them.
    out = root / "art" / "mobs"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    missing = []
    for path, key in sorted(tex_keys.items(), key=lambda kv: kv[1]):
        src = texture_file(path)
        if not src:
            missing.append(path)
        elif src.suffix == ".tga":
            tga_to_png(src, out / f"{key}.png")
        else:
            shutil.copyfile(src, out / f"{key}.png")
    missing += copy_wolf_variants(out) + copy_particles(out)
    # A missing texture is left out of its layer (the glint on the leather boots); a layer left with none goes.
    have = {p.stem for p in out.glob("*.png")}
    for e in [e for entries in looks.values() for e in entries] + list(props.values()) + [e for moods in mood_looks.values() for entries in moods.values() for e in entries] + [e for sizes in size_data.values() for s in sizes.values() for e in s.get("looks", [])]:
        for L in e["layers"]:
            L[1] = [t for t in L[1] if t in have]
        e["layers"] = [L for L in e["layers"] if L[1]]
    props = {k: e for k, e in props.items() if e["layers"]}

    for geo in ents["minecraft:squid"]["geometry"].values():
        seat_tentacles(geos[geo])
    models = {key: model(geos[geo]) for geo, key in sorted(geo_keys.items(), key=lambda kv: kv[1])}
    motions = {}
    anims["tadpole.swim"] = TADPOLE_SWIM
    anims["shulker.shut"] = SHULKER_SHUT
    ents["minecraft:shulker"]["animations"]["shut"] = "shulker.shut"
    ents["minecraft:tadpole"] = {"animations": {"swim": "tadpole.swim"}}
    for ident, keys in STAGE_MOTIONS.items():
        mob = ident.split(":")[1]
        motions[MOB_KEYS.get(mob, mob)] = [baked_loop(ents[ident], anims, *loop) for loop in keys]
    acts = {MOB_KEYS.get(ident.split(":")[1], ident.split(":")[1]): baked_act(ents[ident], anims, act) for ident, act in STAGE_ACTS.items()}
    mood_data = {}
    for ident, moods in STAGE_MOODS.items():
        mob = MOB_KEYS.get(ident.split(":")[1], ident.split(":")[1])
        mood_data[mob] = {mood: {"looks": mood_looks[mob][mood],
                                 "motions": [baked_loop(ents[ident], anims, *loop, answers=spec["queries"]) for loop in spec["loops"]] + [baked_held(ents[ident], anims, key, spec["queries"]) for key in spec["held"]],
                                 "act": baked_act(ents[ident], anims, spec["act"], spec["queries"]), **({"collar": 1} if spec.get("collar") else {}), **({"armor": 1} if spec.get("armor") else {})} for mood, spec in moods.items()}
    dump = lambda v: json.dumps(v, separators=(",", ":"), ensure_ascii=False)
    js = ["/* ---------- Mob models ----------",
          " * Written by import_models.py from the Actions & Stuff pack; run it again rather than editing this file.",
          " * MOB_MODELS: model name -> [texture width, texture height, bones]. A bone is [name, parent index or -1,",
          " * pivot, rotation or 0, cubes]; a cube is [x, y, z, width, height, depth, uv, extras], where uv is [u, v] for",
          " * the usual box layout or {face: [u, v, width, height]} and extras holds inflate, mirror, pivot and rotation.",
          " * MOB_LOOKS: mob -> its looks, the first for no name: { names, scale, layers }, each layer [model, [textures,",
          " * bottom first], [[bone pattern, shown], ...], flags], flags maybe glow (light added on top, faded out by",
          " * day), mask (the texture's alpha is a dye mask), lit (its alpha is how much it glows), dyeBones (bone patterns dyed on their own), shellBones (bone patterns that are see-through shells), litBones (bone patterns",
          " * lit on their own), sheer (its faint texels are see-through), scroll (u and v per",
          " * second), openEyes (its blink bone is the open eye), dyes (a color name per texture), soft (a glow drawn as soft light facing the camera) eyes (a soft glow at its bone's pivot, on the face, gone from behind), halo (the same, seen from any side) and bright (how strong a soft glow is); pose, bone -> {r: rotation, p: position,",
          " * s: scale} from animations the name turns on; motions, loops it plays in place of the mob's (MOB_MOTIONS), without its acts; plays, the set of the mob's animations it plays instead (MOB_MOTIONS and MOB_ACTS' \"<mob>:<set>\"). Textures are in MOB_SKINS (art/mobs/).",
          " * PROP_LOOKS: item -> the look it takes in the hand of an armor stand named §§, like a mob's look.",
          " * MOB_MOTIONS: mob -> the animations the stage plays, layered: { length in seconds, bones: bone -> {r, p, s}, each",
          " * a list of [x, y, z] frames over the loop }.",
          " * MOB_ACTS: mob -> what it does now and then: { every: [least, most seconds apart], length, keep (its usual animation plays on through it), parts: { from, to,",
          " * bones as above, show: [[bone pattern, shown], ...] } }.",
          " * MOB_MOODS: mob -> its moods other than calm: mood -> { looks (MOB_LOOKS' in the same order), motions, act, collar (its color can be picked), armor (it can wear MOB_ARMOR's) }.",
          " * MOB_SIZES: mob -> its sizes, biggest first: size -> { zoom, beside the biggest; looks, where they differ }.",
          " * MOB_CLIMATES: mob -> its climates (warm, cold; or a kind drawn with models of its own, the tropical fish's large shape): climate -> { looks, motions, act }: the looks that differ there, by their place in MOB_LOOKS (what they have, over the usual look), and loops and acts it has there instead.",
          " * MOB_ARMOR: mob -> { model, plain and dyed (its textures), cracks: wear -> a texture to lay over it }, or { kinds: kind -> one such (undyed: the color one is tinted when not dyed, leather's brown) } for a mob with several (the horse's, import_horse.py).",
          " */",
          "const MOB_MODELS = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in models.items()]
    js += ["};", "const MOB_LOOKS = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in sorted(looks.items())]
    js += ["};", "const PROP_LOOKS = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in sorted(props.items())]
    js += ["};", "const MOB_MOTIONS = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in sorted(motions.items())]
    js += ["};", "const MOB_ACTS = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in sorted(acts.items())]
    js += ["};", "const MOB_MOODS = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in sorted(mood_data.items())]
    js += ["};", "const MOB_SIZES = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in sorted(size_data.items())]
    js += ["};", "const MOB_CLIMATES = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in sorted(climate_data.items())]
    js += ["};", "const MOB_ARMOR = {"]
    js += [f"  {dump(k)}: {dump(v)}," for k, v in sorted(armor_data.items())]
    js += ["};", ""]
    (root / "src" / "mob-models.js").write_text("\n".join(js))
    print(f"src/mob-models.js: {len(looks)} mobs, {len(props)} props, {len(models)} models; art/mobs/: {len(have)} textures from {textures}")
    if missing:
        print("missing textures (left out):", ", ".join(missing))


if __name__ == "__main__":
    main()
