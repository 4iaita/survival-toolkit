"""Give the endermite the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_endermite.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones; the Baby and Halloween ones had the new
models but nothing moved them). Its models, animations and controllers are its own. It has no kinds, and no scale
script: its baby (Baby, Mite, Twitchy; and 1 in 200 endermites by itself, v.tocraa 0.005, with the pack's Seasonal Mob
Variants setting at its default, disabled; the game has none) is a model of its own, one small segment with its eyes,
drawn at full scale. Named Halloween or Eye (v.fvvddg) it's drawn with a model of its own. Its whole body is drawn
with an emissive material (entity_emissive_alpha, its controller ignoring the light too), so the faint texels on it
glow: the plain look's eyes (two magenta texels of alpha 3). Its scripts also work out biome variables (snowy, cherry,
sulfur, dappled, pale) that nothing it draws reads. Its entity (entity/drz.json) is the only one for
minecraft:endermite. Run import_additions.py first.
"""
from import_port import port

# It stands breathing and fidgeting (the pack's idle, kuxyzf: its body swelling a little, its head and tail nodding and
# tipping from side to side, 1.6 seconds round), and wriggling a little (the pack's move, which it plays only while it
# moves, by its move speed: kept from the old stage at 0.4 strength and half its pace, as it fidgeted there). Left out:
# its jump, fall and landing, its eye following the camera on the Halloween look (casgih: a look at the viewer), its hurt
# (a timeline only, for its overlay) and its deaths.
MOTIONS = [("idle", 1), ("move", 0.4, 0.5)]

# It blinks: its eyes (6q6) squash shut for a tenth of a second and open again, the pack's blinking.vertical, which it
# loops after 0.2 to 3.2 seconds, over its idle (keep). The pack's animations map also lists a blink (fafvst, the same
# but for its keyframes' pre and post) that no controller plays: left out. The pack gives it no idles.
BLINK = {"every": [0.2, 3.2], "keep": True, "parts": [("blinking.vertical", 0, None, [])]}
ACTS = [BLINK]

if __name__ == "__main__":
    port("endermite", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["halloween"])
