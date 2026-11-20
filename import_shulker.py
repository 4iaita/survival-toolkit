"""Give the shulker the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_shulker.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones; the Halloween one had the new model but
nothing moved it): a shell whose base and lid have walls that fit together like battlements, with gaps in them, and a
head inside. Its models, animations and controllers are its own. The game has no babies of it and the pack makes none
(v.tocraa 0, and no baby names), so it has no baby look (port()'s baby=False). Its skin is picked by its color
(q.variant: 0 to 15 dyed, in Bedrock's own order of the dyes, black first and white last; 16 undyed, as it starts),
for both looks: its kinds (VARIANTS), undyed first. The Halloween look's pumpkin stays orange whatever its color; its candle and the glow inside take it. Named Halloween or
Pumpkin (v.yjnlad) it's a pumpkin, drawn with a model of its own on an emissive material, so the faint texels inside its
shell glow. Its entity (entity/dtu.json) is the only one for minecraft:shulker. Run import_additions.py first.

The pack keeps its lid shut, and lifts it by how far the game says it peeks (v.Shulker.PeekAmount): a little (3.2
pixels, xntrqx) while it peeks, and with a target it twists its lid half a turn as it lifts it a whole block (hvrido,
xntrqx). On the stage it stands open, as the old stage had it, its lid lifted 7 pixels so its head shows, and now and
then shuts and opens again, eased in and out (SHELL: written here, after the old stage's, not the pack's). Left out:
the pack's peek and its full opening with a target, its head turning to its target or the camera (biowgi, nvpxbw), its
moving about and facing (the game's offsets for a shulker on a wall or a ceiling: one on the floor gets none, and the
base's 0.98 scale against the lid, kept), its hurt shake, its teleport and its deaths.
"""
from import_port import im, port

# It stands open: its lid lifted 7 pixels (open_shell, held, as the old stage's stand had it), its head wobbling and
# bobbing a little inside (the pack's move, which the game plays all the while; it sinks the head by the game's facing
# variables, which are 0 here), and its base drawn at 0.98 of its size inside the lid (the pack's facing, as the game's
# own).
OPEN = 7
MOTIONS = [("open_shell", 1, "held"), ("move", 1), ("facing", 1)]

# It blinks: its eyelids (3dafc, renamed blink, which the stage hides till an act shows them) slide out over its eyes
# for 0.15 seconds, which the pack plays after 1.25 to 3.75 seconds, again and again, over the rest (keep). And now and
# then it shuts, as the old stage had it: its lid comes down 7 pixels with a quarter turn (0.7 seconds), stays shut
# (1.6), and rises back the same way (0.7), each move easing in and out (smoothstep), over its standing open (keep: the
# act takes the lid down from there). It shuts as often as it blinks, about every 5 seconds.
MOVE, SHUT_FOR, TURN = 0.7, 1.6, -90

# Its colors: undyed (as it spawns), then the dyes in the creative inventory's order, each with the q.variant the game
# gives it (Bedrock's dye order).
DYE_VARIANT = {"black": 0, "red": 1, "green": 2, "brown": 3, "blue": 4, "purple": 5, "cyan": 6, "light_gray": 7, "gray": 8,
               "pink": 9, "lime": 10, "yellow": 11, "light_blue": 12, "magenta": 13, "orange": 14, "white": 15}
VARIANTS = ["", "white", "light_gray", "gray", "black", "brown", "red", "orange", "yellow", "lime", "green", "cyan",
            "light_blue", "blue", "purple", "magenta", "pink"]


def answers(v):
    return {"variant": float(DYE_VARIANT.get(VARIANTS[v], 16))}
BLINK = {"every": [1.25, 3.75], "keep": True, "parts": [("blinking.1", 0, None, [["blink", True]])]}
SHUT = {"every": [1.25, 3.75], "keep": True, "parts": [("shut_shell", 0, None, [])]}
ACTS = [BLINK, SHUT]


def ease(f):
    return f * f * (3 - 2 * f)


def shut_frames():
    """The shut, as keyframes 0.05 seconds apart: how far down (0 to 1) at each moment."""
    length, steps = 2 * MOVE + SHUT_FOR, 20
    out = {}
    for i in range(round(length * steps) + 1):
        s = i / steps
        down = ease(min(1, s / MOVE)) if s < MOVE + SHUT_FOR else 1 - ease(min(1, (s - MOVE - SHUT_FOR) / MOVE))
        out[f"{s:.2f}"] = down
    return length, out


_length, _down = shut_frames()
SHELL = {
    "open_shell": {"animation_length": 0, "bones": {"da5": {"position": [0, OPEN, 0]}}},
    "shut_shell": {"animation_length": _length, "bones": {"da5": {
        "position": {s: [0, round(-OPEN * f, 4), 0] for s, f in _down.items()},
        "rotation": {s: [0, round(TURN * f, 4), 0] for s, f in _down.items()}}}},
}
_read_pack = im.read_pack


def read_pack():
    """open_shell and shut_shell (SHELL): its lid held open, and its shut, written here."""
    ents, rcs, geos, mats, anims, props, armors = _read_pack()
    d = ents["minecraft:shulker"]["animations"]
    for key, anim in SHELL.items():
        anims[f"animation.shulker_{key}"] = anim
        d[key] = f"animation.shulker_{key}"
    return ents, rcs, geos, mats, anims, props, armors


im.read_pack = read_pack

if __name__ == "__main__":
    port("shulker", variants=VARIANTS, acts=ACTS, motions=MOTIONS, answers=answers, remodel=["halloween"], baby=False)
