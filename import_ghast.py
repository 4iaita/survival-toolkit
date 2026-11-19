"""Give the ghast the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_ghast.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones): a head with nine tentacles under it,
4.5 times as big as its model (the pack's scale, played all the while, as the game's own). Its baby (Baby, Ghastlet,
Whimper; and 1 in 200 ghasts by itself, v.tocraa 0.005, with the pack's Seasonal Mob Variants setting at its default,
disabled; the game has none) is a little ghastling, a model of its own with a smaller head and shorter tentacles, at the
same 4.5 times. A ghast named Boo (v.vuvmby) is drawn just the same, on the same model and texture: the pack's only
other difference for the baby is fewer particles when it dies. The page had Boo's look with the baby's names on it; they
are two looks now, with the same layers, so the Baby row says it's a baby and how often. It has no kinds, and nothing on
it glows (its textures have no faint texels). Its scripts set biome variables that nothing it draws reads. Its entity
(entity/dsu.json) is the only one for minecraft:ghast. Run import_additions.py first.

Left out: its shooting face (the game's ischarging: another texture, its mouth open and its eyes angry) and what the
pack plays with it (it rears back and holds, then lunges forward as it shoots, or settles back if it loses its target):
an attack; its pop as it spawns (it grows from nothing with a squash and stretch); its tilts as it flies (forward and
aside by how fast it moves, and leaning into its turns: nothing standing); its deaths and the smoke that goes with them.
"""
import import_additions as ia
from import_port import port, put

BABY_NAMES = ["baby", "Baby", "ghastlet", "Ghastlet", "whimper", "Whimper"]

# It floats bobbing up and down, its head squashing and stretching a little and tilting, its tentacles swaying in turn
# (the pack's idle: 6.55 seconds round, as the old stage's), and waving (the pack's move, which it plays standing too, at
# half its pace as its anim_time_update has it with no climb or fall: a wave every 2 seconds). The pack gives it no idles.
MOTIONS = [("idle", 1), ("move", 1, 0.5)]


def split_boo():
    """The baby's names off Boo's look, which keeps only its own, onto a look of their own after it (port() then gives
    the baby look its layers, and Boo the same ones, remodel). After Boo, so make_tags.py sees the baby look as new."""
    text = ia.MODELS_JS.read_text()
    looks = ia.parse_section(text, "MOB_LOOKS")["ghast"]
    for look in looks:
        if "Boo" in look["names"] and "Baby" in look["names"]:
            look["names"] = [n for n in look["names"] if n not in BABY_NAMES]
            looks.insert(looks.index(look) + 1, {"names": BABY_NAMES, "scale": 1.0, "layers": []})
            break
    ia.MODELS_JS.write_text(put(text, "MOB_LOOKS", "ghast", looks))


if __name__ == "__main__":
    if ia.WRITE:
        split_boo()
    port("ghast", variants=[""], acts=[], motions=MOTIONS, remodel=["boo"])
