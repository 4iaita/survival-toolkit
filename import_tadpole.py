"""Write the tadpole's model and swim (import_models.py's TADPOLE_MODEL and TADPOLE_SWIM) into src/mob-models.js.

    python3 import_tadpole.py path/to/unpacked/pack path/to/textures [--write]

The pack has no tadpole (see import_models.py), so these are written by hand there; this puts them on the page without
running import_models.py again. Its texture is the pack's own (art/mobs/tadpole.png), and it has no names.
"""
import json

from import_port import ia, im, put

if __name__ == "__main__":
    model = im.model(json.loads(json.dumps(im.TADPOLE_MODEL)))
    d = {"animations": {"swim": "tadpole.swim"}}
    motions = [im.baked_loop(d, {"tadpole.swim": im.TADPOLE_SWIM}, *loop) for loop in im.STAGE_MOTIONS["minecraft:tadpole"]]
    print(f"tadpole: {len(model[2])} bones, {len(motions)} loop of {motions[0]['length']} s")
    if ia.WRITE:
        text = ia.MODELS_JS.read_text()
        text = put(put(text, "MOB_MODELS", "tadpole", model), "MOB_MOTIONS", "tadpole", motions)
        ia.MODELS_JS.write_text(text)
        print("wrote")
