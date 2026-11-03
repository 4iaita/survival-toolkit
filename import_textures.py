"""Copy the textures the site uses from the texture pack into art/.

The pack uses Bedrock file names; art/ uses the names src/icons5.js asks for.
Run after changing the pack, then run build.py:

    python3 import_textures.py [path/to/textures]
"""
import pathlib
import shutil
import sys

root = pathlib.Path(__file__).parent
pack = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / "textures"

DYE_FILES = {"white": "white_new", "light_gray": "silver", "black": "black_new", "blue": "blue_new", "brown": "brown_new"}
COLORS = ["white", "light_gray", "gray", "black", "brown", "red", "orange", "yellow",
          "lime", "green", "cyan", "light_blue", "blue", "purple", "magenta", "pink"]
METALS = {"iron": "iron", "chainmail": "chainmail", "diamond": "diamond", "golden": "gold", "stone": "stone"}
PIECES = ["helmet", "chestplate", "leggings", "boots", "axe", "shovel", "pickaxe", "hoe", "sword"]

# art name -> file in the pack
FILES = {
    # Items
    "apple": "items/apple", "arrow": "items/arrow", "beef": "items/beef_raw", "beetroot": "items/beetroot",
    "bell": "items/villagebell", "blaze_powder": "items/blaze_powder", "breeze_rod": "items/breeze_rod",
    "book": "items/book_normal", "enchanted_book": "items/book_enchanted", "writable_book": "items/book_writable",
    "bow": "items/bow_standby", "bread": "items/bread", "brick": "items/brick", "brush": "items/brush", "cake": "items/cake",
    "campfire": "items/campfire", "carrot": "items/carrot", "carrot_on_a_stick": "items/carrot_on_a_stick",
    "chicken": "items/chicken_raw", "clay_ball": "items/clay_ball", "clock": "items/clock_item", "coal": "items/coal",
    "cod": "items/fish_raw", "cod_bucket": "items/bucket_cod", "compass": "items/compass_item",
    "cooked_chicken": "items/chicken_cooked", "cooked_cod": "items/fish_cooked", "cooked_porkchop": "items/porkchop_cooked",
    "cooked_salmon": "items/fish_salmon_cooked", "cookie": "items/cookie", "crossbow_standby": "items/crossbow_standby",
    "diamond": "items/diamond", "dragon_breath": "items/dragons_breath", "elytra": "items/elytra", "emerald": "items/emerald",
    "ender_pearl": "items/ender_pearl", "experience_bottle": "items/experience_bottle", "feather": "items/feather",
    "fermented_spider_eye": "items/spider_eye_fermented", "fishing_rod": "items/fishing_rod_uncast", "flint": "items/flint",
    "flint_and_steel": "items/flint_and_steel", "ghast_tear": "items/ghast_tear", "glass_bottle": "items/potion_bottle_empty",
    "glistering_melon_slice": "items/melon_speckled", "globe_banner_pattern": "items/globe_banner_pattern",
    "glowstone_dust": "items/glowstone_dust", "gold_ingot": "items/gold_ingot", "golden_carrot": "items/carrot_golden",
    "gunpowder": "items/gunpowder", "ink_sac": "items/dye_powder_black", "iron_ingot": "items/iron_ingot",
    "item_frame": "items/item_frame", "lantern": "items/lantern", "lapis_lazuli": "items/dye_powder_blue",
    "lava_bucket": "items/bucket_lava", "leather": "items/leather", "mace": "items/mace", "magma_cream": "items/magma_cream",
    "map": "items/map_empty", "filled_map": "items/map_filled", "ocean_explorer_map": "items/map_monument",
    "woodland_explorer_map": "items/map_mansion", "trial_explorer_map": "items/map_trial_chambers",
    "mutton": "items/mutton_raw", "nether_wart": "items/nether_wart", "oak_boat": "items/boat_oak", "painting": "items/painting",
    "paper": "items/paper", "phantom_membrane": "items/phantom_membrane", "porkchop": "items/porkchop_raw", "potato": "items/potato",
    "potion": "items/potion_bottle_drinkable", "splash_potion": "items/potion_bottle_splash",
    "lingering_potion": "items/potion_bottle_lingering", "potion_heal": "items/potion_bottle_heal",
    "splash_potion_heal": "items/potion_bottle_splash_heal", "lingering_potion_heal": "items/potion_bottle_lingering_heal",
    "pufferfish": "items/fish_pufferfish_raw", "pumpkin_pie": "items/pumpkin_pie", "quartz": "items/quartz",
    "rabbit": "items/rabbit_raw", "rabbit_foot": "items/rabbit_foot", "rabbit_hide": "items/rabbit_hide",
    "rabbit_stew": "items/rabbit_stew", "red_bed": "items/bed_red", "redstone": "items/redstone_dust",
    "rotten_flesh": "items/rotten_flesh", "saddle": "items/saddle", "salmon": "items/fish_salmon_raw", "scute": "items/turtle_shell_piece",
    "shears": "items/shears", "spear": "items/spear/diamond_spear", "spider_eye": "items/spider_eye", "stick": "items/stick",
    "string": "items/string", "sugar": "items/sugar", "suspicious_stew": "items/suspicious_stew", "sweet_berries": "items/sweet_berries",
    "tipped_arrow_base": "items/tipped_arrow_base", "tipped_arrow_head": "items/tipped_arrow_head", "trident": "items/trident",
    "tropical_fish": "items/fish_clownfish_raw", "turtle_helmet": "items/turtle_helmet",
    "warped_fungus_on_a_stick": "items/warped_fungus_on_a_stick", "wheat": "items/wheat",
    "red_candle": "items/candles/red_candle", "yellow_candle": "items/candles/yellow_candle",
    "leather_helmet": "items/leather_helmet", "leather_chestplate": "items/leather_chestplate",
    "leather_leggings": "items/leather_leggings", "leather_boots": "items/leather_boots",
    "leather_horse_armor": "items/leather_horse_armor",
    # Blocks
    "andesite": "blocks/stone_andesite", "bedrock": "blocks/bedrock", "bookshelf": "blocks/bookshelf",
    "chiseled_stone_bricks": "blocks/stonebrick_carved", "cobweb": "blocks/web", "diorite": "blocks/stone_diorite",
    "dried_kelp_side": "blocks/dried_kelp_side_a", "dried_kelp_top": "blocks/dried_kelp_top",
    "dripstone_block": "blocks/dripstone_block", "glass": "blocks/glass", "glowstone": "blocks/glowstone",
    "granite": "blocks/stone_granite", "grass_block_side": "blocks/grass_side_carried", "grass_block_top": "blocks/grass_carried",
    "gravel": "blocks/gravel", "light_blue_glazed_terracotta": "blocks/glazed_terracotta_light_blue",
    "melon_side": "blocks/melon_side", "melon_top": "blocks/melon_top", "oak_planks": "blocks/planks_oak",
    "polished_andesite": "blocks/stone_andesite_smooth", "polished_diorite": "blocks/stone_diorite_smooth",
    "polished_granite": "blocks/stone_granite_smooth", "pumpkin_side": "blocks/pumpkin_side", "pumpkin_top": "blocks/pumpkin_top",
    "quartz_block_side": "blocks/quartz_block_side", "quartz_block_top": "blocks/quartz_block_top",
    "quartz_pillar": "blocks/quartz_block_lines", "quartz_pillar_top": "blocks/quartz_block_lines_top",
    "slime_block": "blocks/slime", "stone": "blocks/stone", "terracotta": "blocks/hardened_clay",
    "tripwire_hook": "blocks/trip_wire_source",
}
for color in COLORS:
    FILES[f"{color}_dye"] = f"items/dye_powder_{DYE_FILES.get(color, color)}"
    FILES[f"{color}_wool"] = f"blocks/wool_colored_{'silver' if color == 'light_gray' else color}"
for metal, file in METALS.items():
    for piece in PIECES:
        path = pack / f"items/{file}_{piece}.png"
        if path.exists():
            FILES[f"{metal}_{piece}"] = f"items/{file}_{piece}"


def main():
    out = root / "art"
    out.mkdir(exist_ok=True)
    missing = []
    for name, file in sorted(FILES.items()):
        src = pack / f"{file}.png"
        if src.exists():
            shutil.copyfile(src, out / f"{name}.png")
        else:
            missing.append(file)
    print(f"art/: {len(FILES) - len(missing)} textures from {pack}")
    if missing:
        print("missing (the drawn icon is used instead):", ", ".join(missing))


if __name__ == "__main__":
    main()
