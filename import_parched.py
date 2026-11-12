"""Give the parched the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_parched.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain one went by the old pack's bones, with a glow layer the pack no
longer has; the baby and Executioner ones had the new models but nothing moved them). Its models and animations are its
own, not the skeleton's or the husk's. It has no kinds. The game has no babies of it (it's a skeleton); the pack makes 1
in 200 parched babies by itself. Its head is drawn with an emissive material, so its eyes glow. Run import_additions.py
first.
"""
from import_port import port

# It stands swaying, its head rocking (the pack's idle), in the pose the pack eases into when it stands still with no
# target (qmodun, held: its body turned a little and its brows lowered). Its walk and run, weighted by how fast it
# moves, its head turning to look at its target and its bow drawn at a target are left out. The stage shows nothing in
# its hands.
MOTIONS = [("idle", 1), ("qmodun", 1, "held")]

# Standing still for 0.3 seconds and then up to 6.33 more (the pack's idle controller), it does one of three idles,
# blending in and out over the controller's 0.3 seconds, over its swaying (keep): it spins its head right round twice
# and shakes it straight, sways from side to side, or leans forward and back.
IDLES = [{"every": [3, 7], "keep": True, "ease": 0.3, "parts": [(key, 0, None, [])]} for key in ("ciducd", "tculwn", "qofebb")]
ACTS = IDLES

if __name__ == "__main__":
    port("parched", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["baby executioner", "halloween"])
