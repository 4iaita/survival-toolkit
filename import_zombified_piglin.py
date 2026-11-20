"""Give the zombified piglin the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_zombified_piglin.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Baby Butcher and
Halloween ones had the new models but nothing moved them). The pack calls it zombie_pigman (the game's Bedrock name for
it) and the page zombified_piglin: read_pack() gives the pack's entity the page's name. Its models are its own (not the
piglin's, nor the zombie's) and so are its stances, but its blink and idles and their controllers are the piglin's, the
same animations: so it imports the piglin's acts; it shares nothing with the zombie but its has_target arms. Its glow
panels' texture is the piglin's (reuse). It has no kinds. The game has babies of it; the pack makes none by itself
(v.tocraa=0), and a baby named Baby is drawn as the game's own. Its eyes are lit and its one glow panel (8dgo, over its
glowing eye) fades in, as the piglin's; its costumes and its babies have none. The pack draws it no differently when
it's angry (it only raises its arms at its target). Its entity is the only one for minecraft:zombie_pigman. Run
import_piglin.py first.
"""
from import_piglin import BLINK, IDLES, reuse
from import_port import ia, im, port

im.GLOW_STRENGTH = "habcyx"

# Each zombified piglin takes one of four stances at random when it spawns (v.ngjrwv, 0 to 3), babies too: the stage
# shows the second (fezakx, 3.27 seconds round, as the old stage's), swaying, leaning back a little with its head tipped
# down and to one side, its one ear drooping and its arms hanging. Left out: the other three (other sways and leans),
# its sword arm (the stage shows nothing in its hands), its arms raised at a target, its
# head following what it looks at, its walks and runs, its attack, riding a strider or anything else, jumps, falls,
# landing and deaths. Now and then it blinks and does one of the piglin's three idles (the same controllers).
MOTIONS = [("ioknti", 1)]
ACTS = [BLINK, *IDLES]
REMODEL = ["baby butcher", "halloween"]


def fix(d):
    """Nothing on its head (v.rewfbh: the importer answers q.is_item_name_any with 0, so its empty head slot read as
    worn), so its glow panel shows."""
    pre = d["scripts"]["pre_animation"]
    i = next(i for i, s in enumerate(pre) if s.startswith("v.rewfbh="))
    pre[i] = "v.rewfbh=0;"


_read_pack = im.read_pack


def read_pack():
    """The pack's zombie_pigman under the page's name for it, zombified_piglin."""
    ents, *rest = _read_pack()
    ents["minecraft:zombified_piglin"] = ents["minecraft:zombie_pigman"]
    return (ents, *rest)


if __name__ == "__main__":
    im.read_pack = read_pack
    port("zombified_piglin", variants=[""], acts=ACTS, motions=MOTIONS, remodel=REMODEL, fix=fix)
    if ia.WRITE:
        reuse("zombified_piglin")
