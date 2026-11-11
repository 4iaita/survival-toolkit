"""Give the pufferfish the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_pufferfish.py path/to/unpacked/pack path/to/textures [--write]

Its look gets the pack's current models (it went by the old pack's bones). It has no kinds, but three states the game
puts it in (q.variant): calm and deflated (0), half puffed (1) and puffed up (2), as a player or a mob comes near it. The
pack draws each with a model of its own; the stage shows them as its moods. Its baby names (Baby, Fry, Bubbles) keep it
small: the pack never puffs it up then. The pack makes no pufferfish babies by itself. The stage shows it in the ocean.
Run import_additions.py first.
"""
import import_additions as ia
from import_port import port, put

# In the water it floats, rocking and bobbing, its fins fluttering and tail swaying (the pack's idle), and swims slowly
# in place (the pack's swim, which plays as it moves: at the strength and speed it has swimming slowly, as the stage had
# it before). Out of the water it flops, which the stage doesn't show; its turn as it swims does nothing standing. The
# same loops play puffed up: every state's model has the same fins and tail. The pack gives it no idles.
MOTIONS = [("idle", 1), ("swim", 0.5, 0.66)]
ACTS = []

MOODS = {state: {"answers": {"variant": v}, "motions": MOTIONS, "act": []} for state, v in (("half", 1.0), ("puffed", 2.0))}


def fix(d):
    """Which state's model it draws: the pack's puffing controller sets v.ldkkhi (puffed up) and v.uegyxr (half puffed)
    from q.variant as it settles in each state."""
    d["scripts"]["pre_animation"] = [*d["scripts"].get("pre_animation", []), "v.ldkkhi=q.variant==2;v.uegyxr=q.variant==1;"]


# The pack draws two layers: the puffed-up model or the small one, and the half-puffed one or the small one. While the
# fish is puffed up at all its loop shrinks the small model to nothing; calm (or a baby) both layers are the small one.
SMALL = f"{ia.PREFIX}pufferfish"


def one_model(look):
    big = [layer for layer in look["layers"] if layer[0] != SMALL]
    look["layers"] = big or look["layers"][:1]
    return look


if __name__ == "__main__":
    port("pufferfish", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, fix=fix, moods=MOODS,
         new_looks=[["baby", "Baby", "fry", "Fry", "bubbles", "Bubbles"]])
    if ia.WRITE:
        text = ia.MODELS_JS.read_text()
        looks = [one_model(look) for look in ia.parse_section(text, "MOB_LOOKS")["pufferfish"]]
        moods = ia.parse_section(text, "MOB_MOODS")["pufferfish"]
        for mood in moods.values():
            mood["looks"] = [one_model(look) for look in mood["looks"]]
        text = put(put(text, "MOB_LOOKS", "pufferfish", looks), "MOB_MOODS", "pufferfish", moods)
        ia.MODELS_JS.write_text(text)
