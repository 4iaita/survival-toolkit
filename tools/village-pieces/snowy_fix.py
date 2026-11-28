"""The snowy pieces as drawn (2026-11-28): the farm's wheat grown (the template's is just sown), and its snow blocks unshaded, however far
back (shaded by depth, white snow came out a dirty gray, which the user saw)."""


def fix(d):
    for k, t in d["legend"].items():
        if t.startswith("wheat:"):
            d["legend"][k] = "wheat:7"
    farm = d["pieces"]["farm"]
    farm["depth"] = ["".join(c if c == "." or int(c) <= 1 else "1" for c in row) for row in farm["depth"]]
