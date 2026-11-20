"""Give the wither the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_wither.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones, with glow panels on the
stray's texture the pack no longer gives it; the Baby one had the new model but nothing moved it). Its models and
animations are its own. It has no kinds. The game has no babies of it and the pack makes none (v.tocraa=0): a wither
named Baby, Witherling or Sooty is drawn with the pack's baby model, a smaller wither with bigger heads, at full scale
(its entity has no scale script: the model is small itself). Its body is drawn with an emissive material, so the faint
texels of its eyes glow, and a glow layer of soft panels (oreville_auulis) lights its mouths; the baby has no glow
layer. Its entity is the only one for minecraft:wither.

Left out: its armor, which the game puts on below half health (q.is_shield_powered: the pack draws it with a shell of
its own, a scrolling layer and glow panels, and its body darker), and its spawning (it swells and flashes blue for its
first seconds, the soul sand and skull it's built from drawn round it).
"""
from import_port import ia, im, port

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

if __name__ == "__main__":
    port("wither", variants=[""], acts=ACTS, motions=MOTIONS)
