"""Give the phantom the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_phantom.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones; the baby and Halloween ones had the new
models but nothing moved them), and the Halloween look the pack's current one too (a giant bat, its wings on a material
of their own that doesn't glow). It has no kinds and no sizes (its scripts read no q.variant), and no names but its
baby's (the pack makes 1 in 200 phantoms babies by itself; the game has none) and Halloween's (Bat), which the pack also
gives every phantom while its Seasonal Mob Variants setting is on Halloween (off by default). All three looks' eyes
glow (faint texels on the game's phantom material); the grown one's also have soft glow panels in front of them, faded in
over 3 seconds (v.habcyx: GLOW_STRENGTH), which the baby and the Halloween bat haven't got. Its entity (entity/dwi.json)
is the only one for minecraft:phantom. Its scripts set biome variables (snowy, cherry, sulfur, dappled, pale) that nothing
it draws reads. Run import_additions.py first.
"""
from import_port import im, port

# It hovers, beating its wings, its body bobbing and its head and tail swinging with each beat (the pack's flight state
# for flying slower than 3 blocks a second, bgzzgz, 0.75 seconds a beat, played at half speed: 1.5 seconds, as the pack's
# looked too fast on the stage), its wings swaying a little more over six
# seconds (the pack's idle, which otherwise tips it to its target). Left out: its other flight states (gliding fast,
# wings held out, and climbing, beating faster), its deaths, and its fire and death particles. The pack gives it no
# idles and no blink.
MOTIONS = [("gddkln", 1), ("kpngdd", 1, 0.5)]


if __name__ == "__main__":
    im.GLOW_STRENGTH = "habcyx"
    port("phantom", variants=[""], acts=[], motions=MOTIONS, remodel=("halloween",))
