"""Give the bogged the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_bogged.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones; the baby and Scarecrow ones had
the new models but nothing moved them). Its models are its own, not the skeleton's or the stray's (they have mushrooms,
a mossy hood and other bones), but for the glow panels over its eyes, which are the stray's model (share). Its stance is
the skeleton's and the parched's, the same animations under the same keys (MOTIONS), but its idle controller is its own:
it picks one of two idles where they pick one of three, the first its own animation and the second theirs. It holds the
parched's bow (add_bow). It has no kinds. The game has no babies of it; the pack makes 1 in 200 bogged babies by itself.
Run import_additions.py first.
"""
from import_parched import ACTS as PARCHED_ACTS, MOTIONS, add_bow
from import_port import ia, im, port

# Its eyes glow (a few faint texels on its hat, drawn with an emissive material, and the Scarecrow's on its head), with
# a soft glow over each eye (glow panels, a layer of their own, fading in over 3 seconds: v.habcyx, GLOW_STRENGTH), as
# the stray's. Its baby's eyes glow, without the panels.
im.GLOW_STRENGTH = "habcyx"

# It stands swaying, its head rocking, in the pose the pack eases into when it stands still with no target (MOTIONS, the
# parched's). Standing still for 0.3 seconds and then up to 6.33 more, it does one of two idles, over its swaying: its
# own (its head lolls far over to one side and back, its body leaning with it), or the skeleton's sway from side to side.
# The parched's idles by key: here ciducd is the bogged's own idle, tculwn the skeleton's sway, and it has no third. Its
# walk and run, its bow drawn at a target, its cloth swinging as it moves (the pack's physics) and its death are left out.
ACTS = [a for a in PARCHED_ACTS if a["parts"][0][0] in ("ciducd", "tculwn")]

# Its mushrooms (emk9jgge*) show unless it's sheared or wears something on its head (q.is_item_name_any, which the
# importer answers with 0): shown here, and taken off by shearing (MOB_WOOL in src/mob-data.js). The Scarecrow has none.
SHOWS = {name: {"emk9jgge*": True} for name in ("", "baby", "halloween")}
# Each look's skeleton (the entity's geometry key), for the bow.
SKELETONS = {"": "default", "baby": "bqygun", "halloween": "dphsvn"}

if __name__ == "__main__":
    port("bogged", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["halloween"], share=["stray"], shows=SHOWS)
    if ia.WRITE:
        add_bow("bogged", SKELETONS)
