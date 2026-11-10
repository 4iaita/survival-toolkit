"""Give the sniffer the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_sniffer.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models (the plain and baby ones went by the old pack's bones; the Snowy, Cherry and
Dappled ones had the new models but nothing moved them, and the sniffer had no animations at all). The pack gives
sniffers in snowy biomes, cherry groves and dappled forests their Snowy, Cherry and Dappled looks by themselves, but
the names work anywhere and it has no climates, so it has no kinds. Run import_additions.py first.
"""
from import_port import port

# It breathes, its body swelling a little, its head and ears swaying, all the while (the pack's standing loop).
MOTIONS = [("idle", 1)]

# Standing still a while, it does one of the three idles the pack picks from (a look round, a stretch of the neck, a
# shake); now and then it sniffs about, its nose to the ground, swinging its head from side to side (the pack's search,
# twice round); and less often it digs: it settles down on its folded legs, roots in the ground with its nose and gets
# up again (the pack's dig and stand up). All over its breathing (keep), blending in as the pack's controller does.
def idles(*keys):
    return [{"every": [3, 7], "keep": True, "weight": 2, "parts": [(key, 0, None, [])]} for key in keys]


SNIFFS = 4
SEARCH = {"every": [3, 7], "keep": True, "weight": 2, "ease": 0.2, "parts": [("search", 0, SNIFFS, [])]}
DIG_FOR = 8
DIG = {"every": [3, 7], "keep": True, "ease": 0.1, "parts": [("dig", 0, DIG_FOR, []), ("stand_up", DIG_FOR, None, [])]}
ACTS = [*idles("ciducd", "tculwn", "qofebb"), SEARCH, DIG]

if __name__ == "__main__":
    port("sniffer", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["snowy", "cherry", "dappled"], nested_poses=True)
