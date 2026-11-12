"""Give the wandering trader the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_wandering_trader.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and Snowy ones went by the old pack's bones, each drawn twice; the
baby and Halloween ones had the new models but nothing moved them). It has no kinds; in snowy biomes the pack dresses
every wandering trader in its Snowy look (with its biome looks setting on). Its llamas are left out. Run
import_additions.py first.
"""
from import_port import port

# It stands breathing, swaying a little, its arms folded low in its sleeves (the pack's base pose). Its head and eyes
# following what it looks at (the pack's look), and its walk, weighted by how fast it moves, are left out.
MOTIONS = [("base_pose", 1)]

# Every 0.5 to 2.5 seconds it blinks: its lids (6q6da5k) stretch down over its eyes for a moment, over its breathing
# (keep).
BLINK = {"every": [3, 7], "keep": True, "weight": 3, "parts": [("blinking.0", 0, None, [])]}
# Standing still for 0.3 seconds and then up to 6.33 more (the pack's idle controller), it does its idle (the pack has
# the same one twice): it shifts its weight and looks about, blending in and out over the controller's 0.3 seconds.
IDLE = {"every": [3, 7], "keep": True, "ease": 0.3, "parts": [("ciducd", 0, None, [])]}
# With a potion (invisibility, at dusk) or a bucket of milk (at dawn) in its hand it drinks it, tipping its head back
# (the pack's drink: the stage shows nothing in its hand), over its breathing.
DRINK = {"every": [3, 7], "keep": True, "ease": 0.24, "parts": [("ygsrfx", 0, None, [])]}
# Fleeing a zombie or an illager it flinches, ducking (dqgmsi), and stays nervous: its brows up, its arms tucked in,
# its pupils small and its eyes narrowed (dszpta, held). The stage shows it nervous for NERVOUS seconds now and then,
# blending in and out over the controller's 0.2 seconds.
NERVOUS = 5
FLINCH = {"every": [3, 7], "keep": True, "ease": 0.2, "parts": [("dqgmsi", 0, None, []), ("dszpta", 0, NERVOUS, [])]}
ACTS = [BLINK, IDLE, DRINK, FLINCH]

if __name__ == "__main__":
    port("wandering_trader", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["snowy", "halloween"])
