"""Give the panda the updated Actions & Stuff pack's model, animations and variants (see import_port.py).

    python3 import_panda.py path/to/unpacked/pack path/to/textures [--write]

Its two looks (adult and baby) get the pack's current models; its animations are baked (breathing; now and then a
blink, sitting down to eat bamboo, lying on its back, or rolling over) and the skins of its seven kinds (the variants,
which share the model) copied. Run import_additions.py first. It prints the skins to put in MOB_VARIANTS
(src/mob-data.js).
"""
from import_port import port

VARIANTS = ["normal", "lazy", "worried", "playful", "brown", "weak", "aggressive"]  # the pack's q.variant 0 to 6

# What it does now and then, as import_models.py's STAGE_ACTS has it (keys are the new pack's). The blink shows the closed
# eyelids for the end of the pack's blinking animation; sitting is held, breathing along, while it eats bamboo (shown
# in its paws) twice, and it stands up after; lying and rolling are the pack's own.
# The pack's head-look animation (look_at_target) always plays, turning the head relative to the entity, so the head stays
# level whatever the body does (it looks ahead as it sits up, and turns once, not twice, as it rolls): level_head.
HEAD = "h2f52_head"
ACTS = [
    {"every": [4, 9], "keep": True, "weight": 3, "parts": [("blinking.step", 0, None, [["blink", True]])]},
    {"every": [4, 9], "weight": 2, "level_head": HEAD, "parts": [
        ("sitting", 0, 6, []), ("vnfgiz", 0, 6, []),
        ("mgvrwd", 2.1, 5.6, [["32e3gg", True]]), ("eat", 2.1, 3.8, [["32e3gg", True]]), ("eat", 3.8, 5.5, [["32e3gg", True]]),
        ("standing", 6, None, [])]},
    {"every": [4, 9], "weight": 1, "level_head": HEAD, "parts": [("lying", 0, 5, []), ("rfxeub", 0, 5, []), ("eeejmv", 5, None, [])]},
    {"every": [4, 9], "weight": 1, "level_head": HEAD, "parts": [("rolling", 0, None, []), ("obxsno", 0, None, [])]},
]
MOTIONS = [("oyabwp", 1)]


# The layer with the bamboo in its paws only exists while it holds some: build the look as if it did, then hide the bamboo
# until an act shows it.
def answers(v):
    return {"variant": float(v), "is_item_name_any": lambda slot, *names: 1.0 if "minecraft:bamboo" in names else 0.0}


if __name__ == "__main__":
    port("panda", variants=VARIANTS, acts=ACTS, motions=MOTIONS, answers=answers, hidden=("32e3gg",))
