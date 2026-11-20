"""Give the wither the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_wither.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones, with glow panels on the
stray's texture the pack no longer gives it; the Baby one had the new model but nothing moved it). Its models and
animations are its own. It has no kinds. The game has no babies of it and the pack makes none (v.tocraa=0): a wither
named Baby, Witherling or Sooty is drawn with the pack's baby model, a smaller wither with bigger heads, at full scale
(its entity has no scale script: the model is small itself). Its body is drawn with an emissive material, so the faint
texels of its eyes glow, and a glow layer of soft panels (oreville_auulis) lights its mouths; the baby has no glow
layer. Its entity is the only one for minecraft:wither.

Below half health the game puts its armor on (q.is_shield_powered): the stage shows that as its mood (MOODS), as the
pack draws it. Left out: its spawning (it swells and flashes blue for its first seconds, the soul sand and skull it's
built from drawn round it).
"""
from import_port import ia, keep_rims, port, put

# It hovers (the pack's xkttzn, 3.27 seconds round, as the old stage's): rocking and bobbing from side to side, its spine
# and ribs swaying and its three heads nodding. The pack's loop also circles two markers round it (3al_2 and 3al_3, for
# its particles), at a speed of their own: pinned, as the old stage's were. Left out: its heads turning to its target or
# the player, its lunge forward while it moves fast and the swing back when it stops (by move speed), its flinch when
# hurt, its roar while it's spawning, and its deaths.
MOTIONS = [("oyabwp", 1, 1, ("3al_2", "3al_3"))]

# Its heads do their idles over its hovering (keep), blended in over the pack's 0.12 seconds. The pack has a controller
# for each head that plays one of its idles after another without a pause, all three at once; here one plays now and
# then. The head on its left (cvknes, d67l_head): it tilts and nods, narrowing its mouth (homtlr); it turns to look
# aside, its mouth narrowing twice (sychmx); or it turns to look up and aside a while (luuvvp). All three heads
# (pvqaao): they tip to the side while the middle one opens its mouth wide (kprrhl, while it has no target); or the
# body tips back and the heads turn and look up, eyes narrowing (nnrutj). The head on its right (jpemwo, ja89l_head):
# it twists right round to one side (htbomr); it jerks round to look up and back (nrmfhb); or it turns to look aside a
# while (crjrur).
HEAD_IDLES = ["ujwqka", "rkemki", "fxniox", "wtqviq", "orwsvn", "upjozi", "ywuhvu", "inzzlb"]
IDLES = [{"every": [1, 4], "keep": True, "ease": 0.12, "parts": [(key, 0, None, [])]} for key in HEAD_IDLES]
# Its heads blink one after another, the middle one first, then its right and its left (the old stage's spacing): each head's eyes (6q6k,
# and their glow panels) shrink to nothing for 0.15 seconds (the pack's hufdpi, gizmmp and abqfqr). The pack plays those
# three all the while, beside the idles that narrow and widen the same eyes, so its wither's eyes never show: taken
# for blinks, as the old pack had them, so its eyes glow. Picked as often as four idles (weight).
BLINK = {"every": [1, 4], "keep": True, "weight": 4, "parts": [("hufdpi", 0, None, []), ("gizmmp", 0.6, None, []), ("abqfqr", 1.2, None, [])]}
ACTS = [*IDLES, BLINK]

# Armored, below half health: the pack draws its body in an armored skin (pxukfj, glowing pale cyan along its bones;
# its mouths' glow too, wlqxdl), a thin glowing outline round it (a rim: kxkpjg, its parts again a little bigger on an
# emissive material that only draws where the wither isn't; keep_rims), a shell a little bigger again whose texture
# scrolls across it (lbsbts, drawn as a glow: MOOD_STAGE runs its scroll), dimmed by the pack's black overlay to a
# quarter (its 0.625 to 0.875, which pulses; the stage keeps the middle, finish()), and big soft glow panels held
# behind its heads and body and turned to the camera (8dgo1 to 8dgo4, which fade in over a second as the armor comes
# on: drawn behind it, finish()). A baby keeps only its armored skin: the pack also gives it the adult's panels, sized
# and placed for the adult, which glowed over the empty space where an adult's heads would be (left off, finish()).
# It moves as it does without its armor.
MOODS = {"armored": {"answers": {"is_shield_powered": 1.0}, "motions": MOTIONS, "act": ACTS}}
SHELL_STRENGTH = 0.25


def finish():
    """The armor's scrolling shell at the strength the pack's overlay leaves it, its panels drawn behind it, and the
    baby's (the adult's) left off."""
    text = ia.MODELS_JS.read_text()
    moods = ia.parse_section(text, "MOB_MOODS")["wither"]
    for i, look in enumerate(moods["armored"]["looks"]):
        if i == 1:
            look["layers"] = [layer for layer in look["layers"] if not (len(layer) > 3 and layer[3].get("halo"))]
        for layer in look["layers"]:
            flags = layer[3] if len(layer) > 3 else {}
            if flags.get("scroll"):
                flags["bright"] = SHELL_STRENGTH
            if flags.get("halo"):
                flags["behind"] = 1
    ia.MODELS_JS.write_text(put(text, "MOB_MOODS", "wither", moods))

if __name__ == "__main__":
    keep_rims()
    port("wither", variants=[""], acts=ACTS, motions=MOTIONS, moods=MOODS)
    if ia.WRITE:
        finish()
