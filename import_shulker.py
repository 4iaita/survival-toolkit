"""Give the shulker the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_shulker.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones; the Halloween one had the new model but
nothing moved it): a shell whose base and lid have walls that fit together like battlements, with gaps in them, and a
head inside. Its models, animations and controllers are its own. The game has no babies of it and the pack makes none
(v.tocraa 0, and no baby names), so it has no baby look (port()'s baby=False). Its skin is picked by its color
(q.variant: 0 to 15 dyed, 16 undyed, the stage's: GAME_ANSWERS in import_models.py), for both looks. Named Halloween or
Pumpkin (v.yjnlad) it's a pumpkin, drawn with a model of its own on an emissive material, so the faint texels inside its
shell glow. Its entity (entity/dtu.json) is the only one for minecraft:shulker. Run import_additions.py first.

The pack keeps its lid shut, and lifts it by how far the game says it peeks (v.Shulker.PeekAmount): a little (3.2
pixels, xntrqx) while it peeks, as one with nothing to shoot at does now and then; and with a target it twists its lid
half a turn as it lifts it a whole block and raises its head (hvrido, and xntrqx five times over), and back as it shuts
(jblgtd and close). On the stage it stands peeking, so its eyes show (the old stage had its lid lifted 7 pixels, by its
MOBS stand), and now and then it shuts and peeks again. Left out: its full opening (an attack), its head turning to its
target or the camera (biowgi, nvpxbw), its moving about and facing (the game's offsets for a shulker on a wall or a
ceiling: one on the floor gets none, and the base's 0.98 scale against the lid, kept), its hurt shake, its teleport
and its deaths.
"""
from import_port import port

# It stands peeking: its lid lifted 3.2 pixels (the pack's xntrqx, held), its head wobbling and bobbing a little inside
# (the pack's move, which the game plays all the while; it sinks the head by the game's facing variables, which are 0
# here, as the old stage pinned it), and its base drawn at 0.98 of its size inside the lid (the pack's facing, as the
# game's own).
MOTIONS = [("xntrqx", 1, "held"), ("move", 1), ("facing", 1)]

# It blinks: its eyelids (3dafc, renamed blink, which the stage hides till an act shows them) slide out over its eyes for 0.15 seconds, which the pack plays after
# 1.25 to 3.75 seconds, again and again, over the rest (keep). Now and then it shuts: its lid comes down in half a second
# (the pack's close, from the peek), stays shut a second and a half, and lifts again (xntrqx), eased in and out over the
# stage's quarter second as its peeking fades out and back. It blinks three times as often as it shuts.
SHUT_FOR = 1.5
BLINK = {"every": [1.25, 3.75], "keep": True, "weight": 3, "parts": [("blinking.1", 0, None, [["blink", True]])]}
SHUT = {"every": [1.25, 3.75], "ease": 0.25, "parts": [("close", 0, None, []), ("xntrqx", 0.5 + SHUT_FOR, None, [])]}
ACTS = [BLINK, SHUT]

if __name__ == "__main__":
    port("shulker", variants=[""], acts=ACTS, motions=MOTIONS, answers=lambda v: {"variant": 16.0}, remodel=["halloween"], baby=False)
