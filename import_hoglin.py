"""Give the hoglin the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_hoglin.py path/to/unpacked/pack path/to/textures [--write]

Its plain and baby looks get the pack's current models (they went by the old pack's bones). It has no kinds and no
names but its baby's (Baby, Hoglet, Hoggin). The game has babies of it; the pack makes none by itself (v.tocraa=0). Its
eyes (3dafc, the open eyes, which its blink shrinks to nothing) are white texels of faint alpha on an emissive
material, so they're lit, by day too; the pack's soft glow panels round them (mdbuql) are drawn with every part
hidden, so the old stage's soft glow on its eyes is gone. Its entity is the only one for minecraft:hoglin. Run
import_additions.py first.

Left out: its zombification (the pack has no look or shake for it: q.is_shaking only turns its body as it dies), its
head following its target (xhvvxo), its walks and run, its turning steps, its jumps, falls and landing, its attack
(the head-butt), its sitting while it rides something, and its deaths. The game's own babies get a slightly different
head (iivysx: 1.4 times as big and raised; a baby named Baby gets mbghtd's 1.25): the stage shows the named one's, as
it does for every mob.
"""
from import_port import port

# It stands breathing, its body swaying and its ears flicking (the pack's standing loop, yxqllc: 1.8 seconds round, as
# the old stage's); its baby the same, faster (lwvcsi: 1.125 seconds round).
MOTIONS = [("yxqllc", 1)]
BABY_MOTIONS = [("lwvcsi", 1)]

# It blinks: its eyelids (3dafc) drop shut for a tenth of a second and open (the pack's blink, looped after 0.46 to 4.6
# seconds), over its breathing (keep).
BLINK = {"every": [0.46, 4.6], "keep": True, "parts": [("blinking.motion", 0, None, [])]}
# Now and then, as the pack's idle controller has it (0.3 seconds after it stops, then 0 to 6.33 seconds more), it does
# one of its three idles over its breathing (keep), blended in and out over the controller's 0.3 seconds: it looks
# left and right, snorting; it tosses its head up and shakes it; or it shakes its head and flicks its ears, stamping a
# hind leg.
IDLES = [{"every": [0.3, 6.63], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
ACTS = [BLINK, *IDLES]
SETS = {"baby": {"motions": BABY_MOTIONS, "acts": ACTS}}

if __name__ == "__main__":
    port("hoglin", variants=[""], acts=ACTS, motions=MOTIONS, sets=SETS, plays={"baby": "baby"})
