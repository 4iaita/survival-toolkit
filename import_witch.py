"""Give the witch the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_witch.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, Emeralda, Cackle and Snowy ones went by the old pack's bones; the
baby and Cherry ones had the new models but nothing moved them). Its models are its own. Its controllers are mostly the
wandering trader's (its blink, its flinch while it's on fire and its potion-holding state are the same controllers and
animations), but it has no idles, its stance (base_pose) and drink are its own, and it has an attack the trader hasn't.
It has no kinds. The game has no babies of it; the pack makes 1 in 200 witches babies by itself. 1 in 20 witches are
Emeralda and 1 in 20 Cackle (with the pack's seasonal mob variants setting at its default, disabled). In snowy biomes the
pack dresses every witch in its Snowy look and in cherry groves in its Cherry look (with its biome looks setting on).
Run import_additions.py first.
"""
from import_port import ia, port, put
from import_wandering_trader import BLINK, FLINCH

# It stands swaying a little, its head bobbing and its arms folded in front of it (the pack's base pose). Left out: its
# head and pupils following what it looks at (wreqkw; its brows lower as it looks down), its nose swinging on a spring as
# it moves (rixcsr: still while it stands; the pack doesn't play the game's own nose wiggle), its walk (weighted by how
# fast it moves), turning steps, swim, jumps, falls and landing, riding (its legs out in front) and its deaths (the pack
# knocks its hat off as it dies: hat_562l92fae, kept out of sight, HAT_OFF). Its attack is left out too: it turns and
# swings its arms as it throws a potion (ejfctl, then cqxnme). The pack has no celebrating animation for it (the game's
# in a raid); its animations list two the controllers never play (irhjgy, nmfclm), left out.
MOTIONS = [("base_pose", 1)]

# It blinks, as the wandering trader does (the same controller and animation): its lids stretch down over its eyes for a
# moment, over its swaying (keep).
# When hurt, on fire, underwater or chasing a target (healing, fire resistance, water breathing, swiftness), it drinks a
# potion: it lifts its folded arms to its mouth, tips its head back, its nose turned up out of the way, and drinks, as
# the pack's drink (ygsrfx) has it. The pack also plays a pose with its arms where they are (lgktnn: "-this-47", which
# only cancels the animations played before it) and its pupils following its target (tqqqle) while it holds the potion:
# both left out. The stage shows nothing in its hands.
DRINK = {"every": [3, 7], "keep": True, "ease": 0.24, "parts": [("ygsrfx", 0, None, [])]}
# On fire it flinches, ducking, and stays nervous until the fire's out: its brows up, its arms tucked in, its pupils small
# and its eyes narrowed (the pack's on-fire controller, the same as the wandering trader's: its FLINCH).
ACTS = [BLINK, DRINK, FLINCH]

REMODEL = ["emeralda", "cackle", "snowy", "cherry"]

# The pack draws the witch's hat twice: on its head (hat) and again on a bone of its own hung from the root
# (hat_562l92fae: 46fl6jhangl, and the Snowy look's snow on it), which its death animations send flying. While it lives,
# the pack shrinks that one to nothing (woxibr); here the looks' rules hide it.
HAT_OFF = [["46fl6jhangl", False], ["*_92l562l9", False]]


def hat_off():
    """The falling hat hidden on every look."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["witch"]
    for look in looks:
        for layer in look["layers"]:
            layer[2] += [r for r in HAT_OFF if r not in layer[2]]
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "witch", looks))


if __name__ == "__main__":
    port("witch", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL)
    if ia.WRITE:
        hat_off()
