"""Give the fox the updated Actions & Stuff pack's models, animations and kinds (see import_port.py).

    python3 import_fox.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Raccoon and
Jimothy ones had the new models but nothing moved them, and the fox had no animations at all), and the skins of its two
kinds: red and snow (the pack's q.variant 0 and 1, a skin of their own on the same model, the kit's too). The Raccoon
and Jimothy looks have skins of their own whatever the kind. Run import_additions.py first. It prints the skins to put
in MOB_VARIANTS (src/mob-data.js).
"""
from import_port import im, port

VARIANTS = ["red", "snow"]

# It breathes, its body, head, tail and front legs swaying a little, its ears turned out, all the while (the pack's
# standing loop). The pack's other standing loop only turns its head and ears towards what it looks at, which the stage
# has none of, so it's left out; so is its walk, weighted by how fast it moves.
MOTIONS = [("oyabwp", 1)]

# Its blink is no animation: the pack shows its head with open eyes, and every 3 seconds, for a fifth of a second, a
# head with its eyes shut in its place (part_visibility, head and head_kd66h). Asleep, the shut-eyed one shows.
EYES_SHUT = [["head", False], ["head_kd66h", True]]
BLINK = {"every": [2, 4], "keep": True, "weight": 3, "parts": [(None, 0, 0.2, EYES_SHUT)]}
# Standing still a while (the pack waits up to 6.33 seconds), it does one of three idles, blending in and out over its
# idle controller's 0.24 seconds, over its breathing (keep).
IDLES = [{"every": [3, 7], "keep": True, "ease": 0.24, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
# It sits down (the pack's sit, held), sits a while and stands up again, still breathing (keep).
SIT_FOR = 6
SIT = {"every": [3, 7], "keep": True, "parts": [("sit", 0, SIT_FOR, []), ("stand_up", SIT_FOR, None, [])]}
# It crouches low, its rump and tail wiggling, as it does stalking prey (the pack's stalking pose, held), and stands
# again, blending in and out over the pack's 0.1 seconds, over its breathing (keep). It doesn't pounce: that's a jump.
CROUCH_FOR = 4
CROUCH = {"every": [3, 7], "keep": True, "ease": 0.1, "parts": [("has_target", 0, CROUCH_FOR, [])]}
# Less often it curls up and falls asleep, its eyes shut, Zs floating up (the pack's sleeping particles), wakes and gets
# up. Asleep, it stops breathing and idling, as the pack's sleeping state has it.
step, seq = im._step, im._wolf_seq
NAP = 10
parts, effects = seq(step("sleep", NAP, show=EYES_SHUT, effect="z"), step("eetqjm", 1.3333))
SLEEP = {"every": [3, 7], "parts": parts, "effects": effects}
ACTS = [BLINK, *IDLES, SIT, CROUCH, SLEEP]

if __name__ == "__main__":
    port("fox", variants=VARIANTS, acts=ACTS, motions=MOTIONS, remodel=["raccoon", "jimothy"], nested_poses=True)
