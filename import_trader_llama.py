"""Give the trader llama the updated Actions & Stuff pack's models, animations, coats and carpets (see import_port.py).

    python3 import_trader_llama.py path/to/unpacked/pack path/to/textures [--write]

Its looks all get the pack's current models, the llama's, with skins of their own (the plain, baby and snowy ones went by
the old pack's bones, and the trader llama had no animations at all), and the skins of its four coats, the llama's. It
moves as the llama does (see import_llama.py): the pack gives it the llama's loop and acts. The game gives every trader
llama q.mark_variant 1, which is its trader's blanket: a model the pack lays over it (its second layer), snowy for the
Snowy look, and swapped for a fortune teller's costume by the Halloween and Fortune Teller names, which the page didn't
have. A carpet takes the blanket's place, or the costume's (MOB_CARPETS, src/mob-data.js); the baby has the blanket
painted on as well. Its chest is part of the model the pack shows while it carries one (MOB_CHESTS). Run
import_additions.py and import_llama.py first. It prints the skins to put in MOB_VARIANTS and the carpets' layers to
put in MOB_CARPETS (src/mob-data.js).
"""
import json

from import_llama import ACTS, MOTIONS, VARIANTS, carpet_key, carpeted, carpets
from import_port import ia, port


def trader(v):
    """What the game says for a trader llama of coat v: its trader's blanket on."""
    return {"variant": float(v), "mark_variant": 1.0}


FORTUNE_TELLER = [["halloween", "Halloween", "fortune teller", "fortune Teller", "Fortune teller", "Fortune Teller"]]

if __name__ == "__main__":
    port("trader_llama", variants=VARIANTS, acts=ACTS, motions=MOTIONS, answers=trader, remodel=["snowy"], new_looks=FORTUNE_TELLER,
         nested_poses=True, share=["llama"])
    text = ia.MODELS_JS.read_text()
    looks, models = ia.parse_section(text, "MOB_LOOKS")["trader_llama"], ia.parse_section(text, "MOB_MODELS")
    geos = ia.im.read_pack()[2]
    for g in geos.values():
        ia.rename_geo(g)
    # With a carpet on, each grown look's decor layer (the blanket, or the costume) is the carpet in the pack, on a model
    # the stage has already: the llama's carpets.
    textures = {path: key for key, path in carpets().items()}
    layers = {}
    for look in looks:
        name = (look["names"] or [""])[0]
        if look["scale"] < 1:
            continue  # the baby: the game doesn't put a carpet on one
        for dye, decor in (("white", 1), ("black", 16)):
            geo, texs = carpeted("trader_llama", name, trader(0), decor)[1][:2]
            if textures.get(texs[0]) != carpet_key(dye):
                raise SystemExit(f"trader_llama {name!r}: the {dye} carpet isn't the llama's")
        drawn = json.dumps(ia.im.model(geos[geo]))
        layers[look["layers"][1][1][0]] = next(k for k, v in models.items() if json.dumps(v) == drawn)
    print("carpets:", json.dumps({"layers": layers}))
