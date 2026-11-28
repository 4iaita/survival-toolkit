"""The taiga pieces as the user asked for them (2026-11-28): wheat grown (the templates' is young); the well's bell without the fence
row in front of it; the farm's post without the far pumpkin behind its sides (drawn as a dim room, a dark brown block). Cells left out
by the scene itself (a piece's drop) are in src/backdrop.js, not here."""


def fix(d):
    for k, t in d["legend"].items():
        if t.startswith("wheat:"):
            d["legend"][k] = "wheat:7"
    bell = next(k for k, t in d["legend"].items() if t == "bell:ceiling")
    well = d["pieces"]["well"]
    assert well["rows"][1] == "..BCCCB..", well["rows"][1]
    for key, row in (("rows", f"..B.{bell}.B.."), ("depth", "..0.3.0.."), ("behind", "..A...A.."), ("behindDepth", "..1...1..")):
        well[key][1] = row
    farm = d["pieces"]["farm"]
    assert farm["behind"][2][1] == "W", farm["behind"][2]
    farm["behind"][2] = farm["behindDepth"][2] = "." * len(farm["behind"][2])
