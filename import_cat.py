"""Give the cat the updated Actions & Stuff pack's models, animations and kinds (see import_port.py).

    python3 import_cat.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain, baby, party, elf and OIIA ones went by the old pack's bones, so
the new animations couldn't move them), and the skins of its eleven kinds. Run import_additions.py first. It prints the skins to put in MOB_VARIANTS (src/mob-data.js).
"""
from import_port import im, port

# The pack's q.variant 0 to 10, as Bedrock numbers them. Tame cats' skins differ from wild ones only in their alpha (a
# channel of the pack's material), so the wild ones, which the game shows first, are the ones copied.
VARIANTS = ["white", "tuxedo", "red", "siamese", "british_shorthair", "calico", "persian", "ragdoll", "tabby", "black", "jellie"]

# It breathes, swaying a little, and its tail sways, all the while (bob, and the tail's idle).
MOTIONS = [("bob", 1), ("fsseta", 1)]

# What it does now and then, over its breathing and tail (keep), as the pack's controllers have it. The eyelids (the
# blink bone) sit inside the head until an animation slides them out to the face, so every part may show them.
EYES = [["blink", True]]
step, seq = im._step, im._wolf_seq
BLINK = {"every": [3, 7], "keep": True, "weight": 4, "parts": [("blinking.2", 0, None, EYES)]}
# Standing, it does one of four idles (the pack picks one every few seconds), blending in and out over 0.24 seconds.
IDLES = [{"every": [3, 7], "keep": True, "ease": 0.24, "parts": [(key, 0, None, EYES)]} for key in ("ciducd", "tculwn", "qofebb", "hyopyb")]
# Half the time it sits plainly, doing one of its sitting idles, and stands up again.
SIT_FOR = 7
PLAIN_SIT = [{"every": [3, 7], "keep": True, "parts": [("sit", 0, SIT_FOR, EYES), (idle, 2, None, EYES), ("stand_up", SIT_FOR, None, EYES)]}
             for idle in ("lsswib", "vmmadd")]
# Otherwise it sits down neatly, its breathing steadied (kgnhkn takes back some of bob's sway), sits a while, does one of
# its settled idles (a stretch, a lick, a look round), sits again and gets up; or, sitting, curls up and falls asleep with
# Zs floating up (the pack's 30 to 60 seconds would be too long here), wakes and gets up.
SAT, NAPS = 2, 8


def neat(*middle):
    parts, effects = seq(step("ajgcjf", 0.9583, show=EYES, along=["kgnhkn"]), step("ukvljj", SAT, show=EYES, along=["kgnhkn"]), *middle,
                         step("ukvljj", SAT, show=EYES, along=["kgnhkn"]), step("dekync", 1.0417, show=EYES))
    return {"every": [3, 7], "keep": True, "parts": parts, "effects": effects}


NEAT_SIT = [neat(step(key, length, show=EYES, along=["kgnhkn"])) for key, length in (("thjllu", 2.875), ("lvfdho", 5.0833), ("aprush", 3.2917))]
NAP = neat(step("peurfe", 7.2917, show=EYES, along=["kgnhkn"]), step("udwdvw", NAPS, show=EYES, along=["kgnhkn"], effect="z"),
           step("eykatz", 0.375, show=EYES, along=["kgnhkn"]))
ACTS = [BLINK, *IDLES, *PLAIN_SIT, *NEAT_SIT, NAP]

# Called OIIA, it spins on the spot in place of everything else, as the pack has it.
OWN_MOTIONS = {"OIIA OIIA": [("obmjdk", 1)]}

if __name__ == "__main__":
    port("cat", variants=VARIANTS, acts=ACTS, motions=MOTIONS, remodel=["party", "elf", "OIIA OIIA", "halloween", "witch kitten"],
         own_motions=OWN_MOTIONS)
