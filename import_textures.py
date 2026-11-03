"""Copy the textures the site uses from the texture pack into art/.

The pack uses Bedrock file names; art/ uses the names src/icons5.js asks for.
Run after changing the pack, then run build.py:

    python3 import_textures.py [path/to/textures]
"""
import pathlib
import shutil
import struct
import sys
import zlib

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
    "spruce_boat": "items/boat_spruce", "jungle_boat": "items/boat_jungle", "acacia_boat": "items/boat_acacia",
    "dark_oak_boat": "items/boat_dark_oak",
    "paper": "items/paper", "phantom_membrane": "items/phantom_membrane", "porkchop": "items/porkchop_raw", "potato": "items/potato",
    "potion": "items/potion_bottle_drinkable", "splash_potion": "items/potion_bottle_splash",
    "lingering_potion": "items/potion_bottle_lingering", "potion_heal": "items/potion_bottle_heal",
    "splash_potion_heal": "items/potion_bottle_splash_heal", "lingering_potion_heal": "items/potion_bottle_lingering_heal",
    "pufferfish": "items/fish_pufferfish_raw", "pumpkin_pie": "items/pumpkin_pie", "quartz": "items/quartz",
    "rabbit": "items/rabbit_raw", "rabbit_foot": "items/rabbit_foot", "rabbit_hide": "items/rabbit_hide",
    "rabbit_stew": "items/rabbit_stew", "redstone": "items/redstone_dust",
    "rotten_flesh": "items/rotten_flesh", "saddle": "items/saddle", "salmon": "items/fish_salmon_raw", "scute": "items/turtle_shell_piece",
    "shears": "items/shears", "spear": "items/spear/diamond_spear", "spider_eye": "items/spider_eye", "stick": "items/stick",
    "string": "items/string", "sugar": "items/sugar", "suspicious_stew": "items/suspicious_stew", "sweet_berries": "items/sweet_berries",
    "tipped_arrow_base": "items/tipped_arrow_base", "tipped_arrow_head": "items/tipped_arrow_head", "trident": "items/trident",
    "tropical_fish": "items/fish_clownfish_raw", "turtle_helmet": "items/turtle_helmet",
    "warped_fungus_on_a_stick": "items/warped_fungus_on_a_stick", "wheat": "items/wheat",
    "red_candle": "items/candles/red_candle", "yellow_candle": "items/candles/yellow_candle",
    "fire_charge": "items/fireball", "water_bucket": "items/bucket_water", "nautilus_shell": "items/nautilus",
    "echo_shard": "items/echo_shard", "bone": "items/bone", "blaze_rod": "items/blaze_rod", "iron_spear": "items/spear/iron_spear",
    "ominous_trial_key": "items/ominous_trial_key", "wind_charge": "items/wind_charge", "slime_ball": "items/slimeball",
    "crossbow_firework": "items/crossbow_firework", "crossbow_arrow": "items/crossbow_arrow", "lead": "items/lead",
    "heart_of_the_sea": "items/heartofthesea_closed", "chain": "items/chain",
    "leather_helmet": "items/leather_helmet", "leather_chestplate": "items/leather_chestplate",
    "leather_leggings": "items/leather_leggings", "leather_boots": "items/leather_boots",
    "leather_horse_armor": "items/leather_horse_armor",
    # Blocks
    "andesite": "blocks/stone_andesite", "anvil": "blocks/anvil_base", "anvil_top": "blocks/anvil_top_damaged_0", "bedrock": "blocks/bedrock", "bookshelf": "blocks/bookshelf",
    "cactus_side": "blocks/cactus_side", "cactus_top": "blocks/cactus_top",
    "chest_front": "blocks/chest_front", "chest_side": "blocks/chest_side", "chest_top": "blocks/chest_top",
    "command_block_front": "blocks/command_block_front_mipmap", "command_block_side": "blocks/command_block_side_mipmap",
    "deepslate_tiles": "blocks/deepslate/deepslate_tiles", "frosted_ice": "blocks/frosted_ice_0",
    "lightning_rod": "blocks/lightning_rod", "obsidian": "blocks/obsidian", "piston_side": "blocks/piston_side",
    "piston_top": "blocks/piston_top_normal", "soul_sand": "blocks/soul_sand", "tnt_side": "blocks/tnt_side", "tnt_top": "blocks/tnt_top",
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
    # Job site blocks
    "barrel_side": "blocks/barrel_side", "barrel_top": "blocks/barrel_top",
    "blast_furnace_front": "blocks/blast_furnace_front_off", "blast_furnace_side": "blocks/blast_furnace_side",
    "blast_furnace_top": "blocks/blast_furnace_top", "brewing_stand": "items/brewing_stand",
    "brewing_stand_block": "blocks/brewing_stand", "brewing_stand_base": "blocks/brewing_stand_base",
    "cartography_table_front": "blocks/cartography_table_side1", "cartography_table_side": "blocks/cartography_table_side2",
    "cartography_table_top": "blocks/cartography_table_top", "cauldron_side": "blocks/cauldron_side",
    "cauldron_top": "blocks/cauldron_top", "cauldron_inner": "blocks/cauldron_inner",
    "composter_side": "blocks/composter_side", "composter_top": "blocks/composter_top", "composter_bottom": "blocks/composter_bottom",
    "fletching_table_front": "blocks/fletcher_table_side1", "fletching_table_side": "blocks/fletcher_table_side2",
    "fletching_table_top": "blocks/fletcher_table_top", "grindstone_side": "blocks/grindstone_side",
    "grindstone_round": "blocks/grindstone_round", "grindstone_pivot": "blocks/grindstone_pivot",
    "lectern_front": "blocks/lectern_front", "lectern_sides": "blocks/lectern_sides", "lectern_top": "blocks/lectern_top",
    "lectern_base": "blocks/lectern_base", "loom_front": "blocks/loom_front", "loom_side": "blocks/loom_side", "loom_top": "blocks/loom_top",
    "smithing_table_front": "blocks/smithing_table_front", "smithing_table_side": "blocks/smithing_table_side",
    "smithing_table_top": "blocks/smithing_table_top", "smoker_front": "blocks/smoker_front_off", "smoker_side": "blocks/smoker_side",
    "smoker_top": "blocks/smoker_top", "stonecutter_side": "blocks/stonecutter2_side", "stonecutter_top": "blocks/stonecutter2_top",
    "stonecutter_saw": "blocks/stonecutter2_saw",
    # Village biomes
    "sand": "blocks/sand", "coarse_dirt": "blocks/coarse_dirt", "acacia_log": "blocks/log_acacia", "acacia_log_top": "blocks/log_acacia_top",
    "snowy_grass_side": "blocks/grass_side_snowed", "snow": "blocks/snow", "podzol_side": "blocks/dirt_podzol_side",
    "podzol_top": "blocks/dirt_podzol_top", "jungle_log": "blocks/log_jungle", "jungle_log_top": "blocks/log_jungle_top", "mud": "blocks/mud",
    # Biome backdrops: trees, buildings and plants. Leaves, grass, ferns, vines and water are gray and take
    # the biome's tint.
    "log_oak": "blocks/log_oak", "log_spruce": "blocks/log_spruce", "leaves_oak": "blocks/leaves_oak",
    "leaves_spruce": "blocks/leaves_spruce", "leaves_acacia": "blocks/leaves_acacia", "leaves_jungle": "blocks/leaves_jungle",
    "planks_spruce": "blocks/planks_spruce", "planks_acacia": "blocks/planks_acacia", "planks_dark_oak": "blocks/planks_big_oak",
    "cobblestone": "blocks/cobblestone", "mossy_cobblestone": "blocks/cobblestone_mossy",
    "door_oak_upper": "blocks/door_wood_upper", "door_oak_lower": "blocks/door_wood_lower",
    "door_spruce_upper": "blocks/door_spruce_upper", "door_spruce_lower": "blocks/door_spruce_lower",
    "door_acacia_upper": "blocks/door_acacia_upper", "door_acacia_lower": "blocks/door_acacia_lower",
    "smooth_sandstone": "blocks/sandstone_smooth", "chiseled_sandstone": "blocks/sandstone_carved",
    "hay_side": "blocks/hay_block_side", "wheat_crop": "blocks/wheat_stage_7", "dirt": "blocks/dirt", "packed_ice": "blocks/ice_packed",
    "poppy": "blocks/flower_rose", "dandelion": "blocks/flower_dandelion", "cornflower": "blocks/flower_cornflower",
    "short_grass": "blocks/tallgrass", "fern": "blocks/fern", "dead_bush": "blocks/deadbush",
    "berry_bush": "blocks/sweet_berry_bush_stage3", "vine": "blocks/vine", "lily_pad": "blocks/waterlily",
    "water": "blocks/water_still_grey", "grass_side_overlay": "blocks/grass_side", "grass_top": "blocks/grass_top",
    "bamboo_stem": "blocks/bamboo_stem", "bamboo_leaf": "blocks/bamboo_leaf", "large_fern_top": "blocks/double_plant_fern_top",
    "large_fern_bottom": "blocks/double_plant_fern_bottom", "mossy_stone_bricks": "blocks/stonebrick_mossy",
}
for color in COLORS:
    pack_color = "silver" if color == "light_gray" else color
    FILES[f"{color}_dye"] = f"items/dye_powder_{DYE_FILES.get(color, color)}"
    FILES[f"{color}_wool"] = f"blocks/wool_colored_{pack_color}"
    FILES[f"{color}_terracotta"] = f"blocks/hardened_clay_stained_{pack_color}"
    FILES[f"{color}_glazed_terracotta"] = f"blocks/glazed_terracotta_{pack_color}"
    FILES[f"{color}_bed"] = f"items/bed_{pack_color}"
for metal, file in METALS.items():
    for piece in PIECES:
        path = pack / f"items/{file}_{piece}.png"
        if path.exists():
            FILES[f"{metal}_{piece}"] = f"items/{file}_{piece}"

# Villager skins: art/villager/ name -> file in the pack. The pack keeps its own villagers under
# scrambled names in oreville/ans; its entity/villager2 files are empty placeholders.
# Layers: 12 base skins, the outfit of each village biome and of each profession.
VILLAGER_DIR = "_base/oreville/ans/cxwybzn/nyktkbm_wytmhbn2_"
VILLAGER = {f"skin_{n}": f"vhlfbbj_{n}.png" for n in range(1, 13)}
VILLAGER.update({f"biome_{biome}": f"tsxw_{file}.png" for biome, file in {
    "plains": "fvrtlky", "desert": "nrrwoaf", "savanna": "jfvysxz", "snowy": "ercwnlh",
    "taiga": "uxzcqwd", "jungle": "jungle", "swamp": "lyuidaf"}.items()})
VILLAGER.update({f"profession_{job}": f"{file}.tga" for job, file in {
    "armorer": "kmlueng", "butcher": "amaalfo", "cartographer": "dbpkyyk", "cleric": "jhbmbmf",
    "farmer": "cmyiayh", "fisherman": "gajncax", "fletcher": "oumexto", "leatherworker": "ehcxrhb",
    "librarian": "kvrsbvs", "mason": "zcburpx", "shepherd": "uyliprf", "toolsmith": "acsxpro",
    "weaponsmith": "cytwzec"}.items()})


def tga_to_png(src, dst):
    """Rewrite a 32-bit TGA (plain or run-length) as an RGBA PNG."""
    d = src.read_bytes()
    kind, w, h, desc = d[2], d[12] | d[13] << 8, d[14] | d[15] << 8, d[17]
    pos, px = 18 + d[0], []
    while len(px) < w * h:
        if kind == 10 and d[pos] & 128:
            px += [d[pos + 1:pos + 5]] * ((d[pos] & 127) + 1)
            pos += 5
            continue
        count = (d[pos] & 127) + 1 if kind == 10 else 1
        pos += kind == 10
        px += [d[pos + 4 * i:pos + 4 * i + 4] for i in range(count)]
        pos += 4 * count
    rows = [px[y * w:(y + 1) * w] for y in range(h)]
    if not desc & 32:
        rows.reverse()
    raw = b"".join(b"\0" + b"".join(bytes((p[2], p[1], p[0], p[3])) for p in row) for row in rows)
    chunk = lambda tag, data: struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))
    dst.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) +
                    chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def import_villagers():
    out = root / "art" / "villager"
    out.mkdir(parents=True, exist_ok=True)
    missing = []
    for name, file in sorted(VILLAGER.items()):
        src = pack / f"{VILLAGER_DIR}{file}"
        if not src.exists():
            missing.append(file)
        elif src.suffix == ".tga":
            tga_to_png(src, out / f"{name}.png")
        else:
            shutil.copyfile(src, out / f"{name}.png")
    print(f"art/villager/: {len(VILLAGER) - len(missing)} villager skins")
    if missing:
        print("missing villager skins:", ", ".join(missing))


def main():
    out = root / "art"
    out.mkdir(exist_ok=True)
    missing = []
    for name, file in sorted(FILES.items()):
        src = pack / f"{file}.png"
        if src.exists():
            shutil.copyfile(src, out / f"{name}.png")
        elif src.with_suffix(".tga").exists():
            tga_to_png(src.with_suffix(".tga"), out / f"{name}.png")
        else:
            missing.append(file)
    print(f"art/: {len(FILES) - len(missing)} textures from {pack}")
    if missing:
        print("missing (the drawn icon is used instead):", ", ".join(missing))
    import_villagers()


if __name__ == "__main__":
    main()
