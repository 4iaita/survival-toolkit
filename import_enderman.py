"""Give the enderman the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_enderman.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models: the plain, baby, Nutcracker, Snowy and Green ones went by the old pack's
bones, and the newer ones (Sunderman, Cherry, Sulfur, Dappled, Halloween, Pale) had the new models but nothing moved
them. Its models, animations and controllers are its own. It has no kinds. The pack picks its model and skin by name
(v.rpqxbs: Nutcracker, Sunderman, Snowy, Green, Cherry, Sulfur, Halloween, Pale, the later winning), and draws Dappled
as an overlay of its own over the plain look. In snowy biomes, cherry groves, sulfur caves, dappled forests and pale
gardens it gives an enderman that biome's look by itself (with its Biome Mob Variants setting at its default, enabled),
and 1 in 200 endermen are Green; the names work anywhere.

Its baby (Baby, Enderchild, Endie; and 1 in 200 endermen by itself, v.tocraa 0.005, with the pack's Seasonal Mob
Variants setting at its default, disabled; the game has none) is a model of its own, drawn at half size with its whole
body and its head twice as big again (the pack's iivysx), so it comes out as tall as an adult, with a big head.

Its eyes glow: their texels are on an emissive material (hmhadk, 6q6k, and l66l9 and b2o), and two soft glow panels
(8dgo1 and 8dgo2, on a layer of their own) light them, faded to 0.8 (the pack's overlay, 1 - v.habcyx^1.25 + 0.2, at
full strength: GLOW_STRENGTH), each 8 by 8 pixels, which the pack's scripts stretch to 1.5 times as wide (wlqxdl:
widen_glow()). The baby has no panels (its controller is off for v.cdrzno), nor has the Pale look (v.kcrehx): it has
only the eye texels. The Sulfur look's skin is emissive too, and its panels take a yellow texture of their own; the
Green one's are green. The panels' controller shows them only with the game's simple or fancy graphics (v.wtlyok), which
the importer can't answer: fix() sets it. Its entity (entity/dwh.json) is the only one for minecraft:enderman. Run
import_additions.py first.

Its Halloween look (a magician) wears a white mask over one side of its face half the time, at random (e2kc, v.jhgmaa),
which hides that eye's glow panel: the stage shows it without (molang.py's Math.random gives the middle). Left out, as
game states the stage doesn't show: its angry face and shaking while it's looked at or attacking (q.is_angry: its mouth
opening, l66l9, and the pack's scary_face and ermejm), and the block it carries once it has picked one up
(q.is_carrying_block: its arms raised, holding a block model, 72c62jek).
"""
import json

from import_port import ia, im, port

im.GLOW_STRENGTH = "habcyx"

# It stands swaying (the pack's bob: its body rocking from side to side, its head nodding and tilting, its arms and legs
# swaying a little, 2.32 seconds round). A baby sways its legs 3.5 times as far (bob_baby, the same with v.cdrzno 1).
# Left out: its walk and run (by move speed), its head and body turning to its target (look_at_target), the pose that
# hides the item in its hand (it has none on the stage), its jump, fall and landing, its attacks, its teleport (a quick
# flash of its arms and legs as it appears, and particles) and its deaths.
MOTIONS = [("bob", 1)]
BABY_MOTIONS = [("bob_baby", 1)]

# It blinks: its eyelids (6q6da5k_lgh) close and its glow panels go out for 0.15 seconds, which the pack plays after 0.5
# to 2.5 seconds, again and again, over its sway (keep). And now and then it does one of its two idles, blended in over
# 0.3 seconds as the pack's idle controller has them (which picks one after 0.3 to 6.63 seconds standing): it looks round
# to one side and the other, its eyes narrowing (ciducd); or it tilts its head and peers, squinting (tculwn). The stage
# picks one act every 0.5 to 2.5 seconds, the blink four times as often as each idle, so it blinks about every 1.5
# seconds and idles every 5 or so, near the pack's pace.
BLINK = {"every": [0.5, 2.5], "keep": True, "weight": 4, "parts": [("blinking.0", 0, None, [])]}
IDLES = [{"every": [0.3, 6.63], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn")]
ACTS = [BLINK, *IDLES]
SETS = {"baby": {"motions": BABY_MOTIONS, "acts": ACTS}}
NAMED = ["nutcracker", "snowy", "green", "sunderman", "cherry", "sulfur", "dappled", "halloween", "pale"]

GLOW_PANEL, GLOW_STRETCH = "geometry.oreville_ans.zzywlf", 1.5
_read_pack = im.read_pack


def read_pack():
    """bob_baby: the pack's bob with a baby's legs (v.cdrzno 1)."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:enderman"]["animations"]
    anims["animation.enderman_bob_baby"] = json.loads(json.dumps(anims[d["bob"]]).replace("v.cdrzno", "1"))
    d["bob_baby"] = "animation.enderman_bob_baby"
    return ents, rcs, geos, mats, anims, props, armors


im.read_pack = read_pack


def widen_glow(geos):
    """Its glow panels at their full-strength size: 1.5 times as wide about their bone's pivot, as the pack's wlqxdl
    stretches them (x by v.habcyx * 1.5, y by v.habcyx^0.2: 1 at full strength)."""
    for bone in geos[GLOW_PANEL]["bones"]:
        for cube in bone.get("cubes", []):
            if cube.get("widened"):
                continue
            pivot = bone["pivot"][0]
            cube["origin"][0] = pivot + (cube["origin"][0] - pivot) * GLOW_STRETCH
            cube["size"][0] *= GLOW_STRETCH
            cube["widened"] = True


def fix(d):
    """The game's graphics mode: simple or fancy, so its glow panels show (v.wtlyok)."""
    d["scripts"]["pre_animation"].append("v.wtlyok=1;")


if __name__ == "__main__":
    port("enderman", variants=[""], acts=ACTS, motions=MOTIONS, remodel=NAMED, sets=SETS, plays={"baby": "baby"},
         fix=fix, fix_geos=widen_glow)
