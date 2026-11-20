"""Give the ender dragon the updated Actions & Stuff pack's model and animations (see import_port.py).

    python3 import_ender_dragon.py path/to/unpacked/pack path/to/textures [--write]

Its look gets the pack's current model (it went by the old pack's bones). Its model, animations and controllers are its
own. It has no kinds and no names (its scripts check none), and no babies: the game has none, the pack makes none
(v.tocraa 0), so it has no baby look (port()'s baby=False). It's drawn with the game's ender_dragon material, which the
pack names but doesn't define (GAME_EMISSIVE in import_models.py), so the faint texels of its eyes glow. Its entity
(entity/dsq.json) is the only one for minecraft:ender_dragon. Run import_additions.py first.

The pack draws it two ways: flying, and perched on the exit portal (v.opvfxf, by its position near the middle of the
End): the stage shows it flying, as the old stage did.
"""
import json

from import_port import im, port

# It flies, beating its wings (the pack's sdlocr, which it plays while flying: its wings down and up, its body bobbing 10
# pixels down and up and pitching a little; the pack's 0.75 seconds a beat, at 0.75 speed as the old stage had it, one
# beat a second), its legs tucked up under it (oavwsa), its wingtips and toes fluttering a little (imildp), in the pack's
# setup pose: drawn at 0.9 of its model's size, its wings at 1.11 of that and its thighs at 0.95, and lifted 16 pixels.
# (setup also turns it half round, 180 less its body's turn, which the game's own turn of a dragon takes back: its model
# faces the way every other mob's does, as the old one did, so the stage leaves that out: read_pack().) Left out: its tail, neck and body swaying and its body rolling
# into turns and pitching as it climbs or dives (by the pack's smoothed turn and climb, nothing flying straight), its
# glide (by speed), a roll of its body as it starts flapping (wulelt, once), its head following its target and its
# breath attack (dxtyfv), and its deaths (its body dissolving, and the beams). Perched on the portal (the stage doesn't
# show it), it breathes and looks about (oyabwp, tculwn), roars at its target (zlxhxc, zvozjy, qofebb), and lands and
# takes off (fcgcuh, aexlpb, dwdraj, nugplr, tyedej). The pack gives it no idles in flight.
MOTIONS = [("setup_level", 1), ("oavwsa", 1), ("imildp", 1), ("sdlocr", 1, 0.75)]

_read_pack = im.read_pack


def read_pack():
    """setup_level: the pack's setup without its turn of the root (180 less the body's turn)."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:ender_dragon"]["animations"]
    setup = json.loads(json.dumps(anims[d["setup"]]))
    del setup["bones"]["root"]["rotation"]
    anims["animation.ender_dragon_setup_level"] = setup
    d["setup_level"] = "animation.ender_dragon_setup_level"
    return ents, rcs, geos, mats, anims, props, armors


im.read_pack = read_pack

if __name__ == "__main__":
    port("ender_dragon", variants=[""], acts=[], motions=MOTIONS, baby=False)
