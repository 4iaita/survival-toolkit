"""Give the silverfish the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_silverfish.py path/to/unpacked/pack path/to/textures [--write]

Its plain look gets the pack's current model (it went by the old pack's bones; the baby and Halloween ones had the new
models but nothing moved them), and the Halloween look the pack's current one too (a centipede). Its body layer (the
bristles over its head, body and tail, the d2q6j bones on the game's silverfish_layers material) is drawn with the rest,
cut out as the texture has it. It has no kinds and no names but its baby's (the pack makes 1 in 200 silverfish babies
by itself; the game has none) and Halloween's (Centipede), which the pack also gives every silverfish while its Seasonal
Mob Variants setting is on Halloween (off by default). Nothing on it glows. Its entity (entity/dsd.json) is the only one
for minecraft:silverfish. Its scripts set biome variables (snowy, cherry, sulfur, dappled, pale) that nothing it draws
reads. Run import_additions.py first.
"""
from import_port import port

# It lies wriggling: its body swelling and settling, its head nodding and its body and tail swaying side to side (the
# pack's oyabwp, which it always plays, 1.6 seconds round). Left out: its crawl and the centipede's legs scuttling (both
# weighted by how fast it moves, nothing standing), its jump, fall and landing, its flinch when hurt, its deaths, and
# hiding in infested blocks. The pack gives it no idles and no blink.
MOTIONS = [("oyabwp", 1)]


if __name__ == "__main__":
    port("silverfish", variants=[""], acts=[], motions=MOTIONS, remodel=("halloween",))
