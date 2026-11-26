"""Copy the decorated pot's textures from the texture pack into art/pots/, for the Decorated Pots tab (build.py embeds them as POT_ART).

Everything comes from the pack (../textures/blocks): nothing is taken from the games' files, as the pack has all the pot needs.

- decorated_pot_base (32×32): the neck and lip, and the body's top and bottom, laid out as the game's model has them (Java's
  DecoratedPotRenderer: the lip 8×3×8 at 0,0 and the neck 6×1×6 at 0,5, both turned upside down, so the lip's top shows its box's
  bottom, the dark opening at 16,0; the body's top 14×14 at 0,13 and its bottom at 14,13).
- decorated_pot_side and the 23 <name>_pottery_pattern (16×16): one side each, 14×16 in columns 1 to 14 (their alpha: the outer
  columns are clear).

The sherds' item pictures are art/'s own, through FILES in import_textures.py.

    python3 import_pots.py [path/to/textures]
"""
import pathlib
import shutil
import sys

root = pathlib.Path(__file__).parent
pack = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / "textures"

# The game's sherds (Java's tag decorated_pot_sherds, the same in Bedrock's language file).
SHERDS = ["angler", "archer", "arms_up", "blade", "brewer", "burn", "danger", "explorer", "flow", "friend", "guster", "heart", "heartbreak",
          "howl", "miner", "mourner", "plenty", "prize", "scrape", "sheaf", "shelter", "skull", "snort"]
FILES = {"base": "decorated_pot_base", "brick": "decorated_pot_side", **{k: f"{k}_pottery_pattern" for k in SHERDS}}


def main():
    out = root / "art" / "pots"
    out.mkdir(parents=True, exist_ok=True)
    for name, file in FILES.items():
        shutil.copyfile(pack / "blocks" / f"{file}.png", out / f"{name}.png")
    print(f"art/pots/: {len(FILES)} textures from {pack}")


if __name__ == "__main__":
    main()
