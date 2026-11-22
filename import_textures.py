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
    "leather_horse_armor": "items/leather_horse_armor", "name_tag": "items/name_tag", "armor_stand": "items/armor_stand",
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
    # The woodland mansion backdrop.
    "log_dark_oak": "blocks/log_big_oak", "planks_birch": "blocks/planks_birch",
    "door_dark_oak_upper": "blocks/door_dark_oak_upper", "door_dark_oak_lower": "blocks/door_dark_oak_lower",
    "door_oak_upper": "blocks/door_wood_upper", "door_oak_lower": "blocks/door_wood_lower",
    "door_spruce_upper": "blocks/door_spruce_upper", "door_spruce_lower": "blocks/door_spruce_lower",
    "door_acacia_upper": "blocks/door_acacia_upper", "door_acacia_lower": "blocks/door_acacia_lower",
    "smooth_sandstone": "blocks/sandstone_smooth", "chiseled_sandstone": "blocks/sandstone_carved",
    # The nether backdrop.
    "deepslate": "blocks/deepslate/deepslate", "glow_lichen": "blocks/glow_lichen",
    "moss_block": "blocks/moss_block", "clay": "blocks/clay", "big_dripleaf_top": "blocks/big_dripleaf_top", "big_dripleaf_stem": "blocks/big_dripleaf_stem",
    "small_dripleaf_side": "blocks/small_dripleaf_side", "big_dripleaf_side2": "blocks/big_dripleaf_side2", "small_dripleaf_top": "blocks/small_dripleaf_top",
    "small_dripleaf_stem_top": "blocks/small_dripleaf_stem_top", "small_dripleaf_stem_bottom": "blocks/small_dripleaf_stem_bottom", "azalea_side": "blocks/azalea_side", "flowering_azalea_side": "blocks/flowering_azalea_side",
    "azalea_leaves": "blocks/azalea_leaves_opaque", "azalea_leaves_flowers": "blocks/azalea_leaves_flowers_opaque", "cave_vines_body": "blocks/cave_vines_body",
    "cave_vines_berries": "blocks/cave_vines_body_berries", "cave_vines_tip": "blocks/cave_vines_head_berries",
    "kelp": "blocks/kelp_a", "kelp_top": "blocks/kelp_top", "kelp_bulb": "blocks/kelp_top_bulb", "seagrass": "blocks/seagrass",
    "tall_seagrass_top": "blocks/seagrass_doubletall_top_a", "tall_seagrass_bottom": "blocks/seagrass_doubletall_bottom_a",
    "sea_pickle": "blocks/sea_pickle", "sea_lantern": "blocks/sea_lantern", "prismarine": "blocks/prismarine_rough",
    "prismarine_bricks": "blocks/prismarine_bricks", "prismarine_dark": "blocks/prismarine_dark",
    "coral_red": "blocks/coral_red", "coral_yellow": "blocks/coral_yellow", "coral_pink": "blocks/coral_pink", "coral_blue": "blocks/coral_blue",
    "coral_plant_red": "blocks/coral_plant_red", "coral_plant_yellow": "blocks/coral_plant_yellow", "coral_plant_pink": "blocks/coral_plant_pink",
    "coral_plant_blue": "blocks/coral_plant_blue", "coral_fan_red": "blocks/coral_fan_red", "coral_fan_yellow": "blocks/coral_fan_yellow",
    "coral_fan_pink": "blocks/coral_fan_pink", "coral_fan_blue": "blocks/coral_fan_blue",
    "end_stone": "blocks/end_stone", "end_bricks": "blocks/end_bricks", "purpur_block": "blocks/purpur_block", "purpur_pillar": "blocks/purpur_pillar", "end_rod": "blocks/end_rod", "magenta_glass": "blocks/glass_magenta",
    "chorus_plant": "blocks/chorus_plant", "chorus_flower": "blocks/chorus_flower",
    "end_sky": "environment/end_sky", "torch": "blocks/torch_on", "iron_bars": "blocks/iron_bars",
    "leaves_birch": "blocks/leaves_birch", "log_birch": "blocks/log_birch", "mushroom_red": "blocks/mushroom_red", "mushroom_brown": "blocks/mushroom_brown",
    "oxeye_daisy": "blocks/flower_oxeye_daisy", "mob_spawner": "blocks/mob_spawner",
    "netherrack": "blocks/netherrack", "nether_brick": "blocks/nether_brick", "blackstone": "blocks/blackstone", "quartz_ore": "blocks/quartz_ore",
    "nether_gold_ore": "blocks/nether_gold_ore", "magma": "blocks/magma", "lava": "blocks/lava_still", "crimson_nylium": "blocks/crimson_nylium_side",
    "crimson_roots": "blocks/crimson_roots", "crimson_fungus": "blocks/crimson_fungus", "weeping_vines": "blocks/weeping_vines",
    "weeping_vines_base": "blocks/weeping_vines_base",
    # The cave backdrop.
    "coal_ore": "blocks/coal_ore", "iron_ore": "blocks/iron_ore", "copper_ore": "blocks/copper_ore", "gold_ore": "blocks/gold_ore",
    "redstone_ore": "blocks/redstone_ore", "lapis_ore": "blocks/lapis_ore", "diamond_ore": "blocks/diamond_ore", "tuff": "blocks/tuff",
    "dripstone_down_frustum": "blocks/pointed_dripstone_down_frustum",
    "dripstone_down_middle": "blocks/pointed_dripstone_down_middle", "dripstone_down_tip": "blocks/pointed_dripstone_down_tip",
    "dripstone_up_frustum": "blocks/pointed_dripstone_up_frustum", "dripstone_up_tip": "blocks/pointed_dripstone_up_tip",
    "hay_side": "blocks/hay_block_side", "wheat_crop": "blocks/wheat_stage_7", "dirt": "blocks/dirt", "packed_ice": "blocks/ice_packed",
    "poppy": "blocks/flower_rose", "dandelion": "blocks/flower_dandelion", "cornflower": "blocks/flower_cornflower",
    "short_grass": "blocks/tallgrass", "fern": "blocks/fern", "dead_bush": "blocks/deadbush",
    "berry_bush": "blocks/sweet_berry_bush_stage3", "vine": "blocks/vine", "lily_pad": "blocks/waterlily",
    "water": "blocks/water_still_grey", "grass_side_overlay": "blocks/grass_side", "grass_top": "blocks/grass_top",
    "bamboo_stem": "blocks/bamboo_stem", "bamboo_leaf": "blocks/bamboo_leaf", "large_fern_top": "blocks/double_plant_fern_top",
    "large_fern_bottom": "blocks/double_plant_fern_bottom", "mossy_stone_bricks": "blocks/stonebrick_mossy",
    # The wolf's wild biomes on the Mobs tab: badlands, groves and old growth taigas.
    "red_sand": "blocks/red_sand", "powder_snow": "blocks/powder_snow", "tall_grass_top": "blocks/double_plant_grass_top",
    "tall_grass_bottom": "blocks/double_plant_grass_bottom",
    # The warm frog's mangrove swamp: mangroves on arching roots, their leaves and hanging propagules.
    "mangrove_log": "blocks/mangrove_log_side", "mangrove_leaves": "blocks/mangrove_leaves", "mangrove_roots": "blocks/mangrove_roots_side",
    "muddy_mangrove_roots": "blocks/muddy_mangrove_roots_side", "mangrove_propagule_hanging": "blocks/mangrove_propagule_hanging",
    # The panda's bamboo jungle: the small leaves partway up a stalk and the shoots coming up beside it.
    "bamboo_small_leaf": "blocks/bamboo_small_leaf", "bamboo_sapling": "blocks/bamboo_sapling",
    # The mooshroom's mushroom fields: mycelium and the huge mushrooms' blocks.
    "mycelium_side": "blocks/mycelium_side", "mycelium_top": "blocks/mycelium_top",
    "red_mushroom_block": "blocks/mushroom_block_skin_red", "brown_mushroom_block": "blocks/mushroom_block_skin_brown",
    "mushroom_stem": "blocks/mushroom_block_skin_stem",
    # The biomes some name tags' looks come from: the cherry grove, pale garden, dappled forest and sulfur caves.
    "cherry_leaves": "blocks/cherry_leaves", "cherry_log": "blocks/cherry_log_side", "cherry_sapling": "blocks/cherry_sapling",
    "pale_oak_leaves": "blocks/pale_oak_leaves", "pale_oak_log": "blocks/pale_oak_log_side", "pale_moss_block": "blocks/pale_moss_block",
    "pale_hanging_moss": "blocks/pale_hanging_moss_middle", "pale_hanging_moss_tip": "blocks/pale_hanging_moss_tip",
    "pale_moss_carpet_side": "blocks/pale_moss_carpet_side_base", "eyeblossom": "blocks/eyeblossom_dormant",
    "eyeblossom_open": "blocks/eyeblossom_blooming", "eyeblossom_eyes": "blocks/eyeblossom_eyes_blooming", "creaking_heart": "blocks/creaking_heart_side_dormant",
    "wildflowers": "blocks/wildflowers", "firefly_bush": "blocks/firefly_bush", "bush": "blocks/bush", "leaf_litter": "blocks/leaf_litter",
    "short_dry_grass": "blocks/short_dry_grass",
    "sulfur": "blocks/sulfur", "potent_sulfur": "blocks/potent_sulfur", "calcite": "blocks/calcite", "emerald_ore": "blocks/emerald_ore",
    "sulfur_spike_up_tip": "blocks/sulfur_spike_up_tip", "sulfur_spike_up_frustum": "blocks/sulfur_spike_up_frustum",
    "sulfur_spike_down_frustum": "blocks/sulfur_spike_down_frustum", "sulfur_spike_down_middle": "blocks/sulfur_spike_down_middle",
    "sulfur_spike_down_tip": "blocks/sulfur_spike_down_tip", "cinnabar": "blocks/cinnabar", "sulfur_spike_up_base": "blocks/sulfur_spike_up_base",
    "sulfur_spike_up_middle": "blocks/sulfur_spike_up_middle", "sulfur_spike_down_base": "blocks/sulfur_spike_down_base",
    # The mineshaft: its rails, chests and the deepslate deep down.
    "rail": "blocks/rail_normal", "chest_front": "blocks/chest_front",
    # The silverfish's stronghold: stone bricks, cracked and mossy, an iron door, and the portal room's frames.
    "stone_bricks": "blocks/stonebrick", "cracked_stone_bricks": "blocks/stonebrick_cracked",
    "door_iron_upper": "blocks/door_iron_upper", "door_iron_lower": "blocks/door_iron_lower",
    "end_portal_frame": "blocks/endframe_side",
    # The breeze's trial chamber: tuff and copper, its spawners, vaults and copper bulbs.
    "tuff_bricks": "blocks/tuff_bricks", "chiseled_tuff": "blocks/chiseled_tuff", "chiseled_tuff_bricks": "blocks/chiseled_tuff_bricks",
    "polished_tuff": "blocks/polished_tuff", "cut_copper": "blocks/cut_copper", "weathered_cut_copper": "blocks/weathered_cut_copper",
    "oxidized_cut_copper": "blocks/oxidized_cut_copper", "copper_grate": "blocks/copper_grate",
    "weathered_copper_grate": "blocks/weathered_copper_grate", "oxidized_copper_grate": "blocks/oxidized_copper_grate",
    "chiseled_copper": "blocks/chiseled_copper", "oxidized_chiseled_copper": "blocks/oxidized_chiseled_copper",
    "copper_bulb_lit": "blocks/copper_bulb_lit", "oxidized_copper_bulb_lit": "blocks/oxidized_copper_bulb_lit",
    "trial_spawner": "blocks/trial_spawner_side_active", "vault": "blocks/vault_front_on",
    # The trial chamber's oxidized copper, its copper doors, a dispenser in its wall and its decorated pots.
    "oxidized_copper": "blocks/oxidized_copper", "oxidized_copper_door_top": "blocks/oxidized_copper_door_top",
    "oxidized_copper_door_bottom": "blocks/oxidized_copper_door_bottom", "dispenser_front_horizontal": "blocks/dispenser_front_horizontal",
    "decorated_pot_side": "blocks/decorated_pot_side",
    # The deep dark's ancient city: polished basalt for its pillars.
    "polished_basalt_side": "blocks/polished_basalt_side",
    # The woodland mansion's potted flowers.
    # The stronghold's end portal frames: an eye of ender set in one.
    "endframe_eye": "blocks/endframe_eye",
    "flower_pot": "blocks/flower_pot", "flower_allium": "blocks/flower_allium", "flower_tulip_red": "blocks/flower_tulip_red",
    # The plains' wildflowers (azure bluets, white and orange tulips); the swamp's blue orchids and sugar cane; the nether's fire.
    "fire": "blocks/fire_0", "flower_blue_orchid": "blocks/flower_blue_orchid", "reeds": "blocks/reeds", "flower_houstonia": "blocks/flower_houstonia", "flower_tulip_white": "blocks/flower_tulip_white", "flower_tulip_orange": "blocks/flower_tulip_orange",
    # The warden's deep dark: sculk and its sensors, shriekers and catalysts, an ancient city's deepslate and the
    # reinforced deepslate of its portal frame, soul lanterns and candles.
    "sculk": "blocks/sculk", "sculk_catalyst": "blocks/sculk_catalyst_side", "sculk_sensor": "blocks/sculk_sensor_side",
    "sculk_shrieker": "blocks/sculk_shrieker_side", "deepslate_bricks": "blocks/deepslate/deepslate_bricks",
    "cracked_deepslate_bricks": "blocks/deepslate/cracked_deepslate_bricks", "chiseled_deepslate": "blocks/deepslate/chiseled_deepslate",
    "polished_deepslate": "blocks/deepslate/polished_deepslate", "reinforced_deepslate": "blocks/reinforced_deepslate_side",
    "soul_lantern": "items/soul_lantern", 
    # The backdrops' lanterns and the village bell, drawn from parts of their block textures (backdrop.js, partsOf).
    "lantern_block": "blocks/lantern", "soul_lantern_block": "blocks/soul_lantern", "bell_body": "blocks/bell_side",
    "candle_lit": "blocks/candles/candle_lit",
    # The Mobs tab's drops and breeding foods.
    "glow_ink_sac": "items/dye_powder_glow", "shulker_shell": "items/shulker_shell", "nether_star": "items/nether_star", "dragon_egg": "blocks/dragon_egg", "totem_of_undying": "items/totem", "gold_nugget": "items/gold_nugget", "copper_ingot": "items/copper_ingot", "prismarine_shard": "items/prismarine_shard", "prismarine_crystals": "items/prismarine_crystals", "sponge": "blocks/sponge", "wet_sponge": "blocks/sponge_wet", "snowball": "items/snowball", "bamboo": "items/bamboo", "armadillo_scute": "items/armadillo_scute", "bone_meal": "items/dye_powder_white", "music_disc_cat": "items/record_cat", "goat_horn": "items/goat_horn", "egg": "items/egg", "glow_berries": "items/glow_berries", "wheat_seeds": "items/seeds_wheat", "golden_apple": "items/apple_golden", "hay_block_side": "blocks/hay_block_side", "hay_block_top": "blocks/hay_block_top", "tropical_fish_bucket": "items/bucket_tropical", "warped_fungus": "blocks/warped_fungus", "torchflower_seeds": "items/torchflower_seeds", "honeycomb": "items/honeycomb", "amethyst_shard": "items/amethyst_shard", "resin_clump": "items/resin_clump", "ominous_bottle": "items/ominous_bottle", "tide_armor_trim_smithing_template": "items/tide_armor_trim_smithing_template", "pufferfish_bucket": "items/bucket_pufferfish", "golden_dandelion": "blocks/golden_dandelion", "melon_seeds": "items/seeds_melon", "pumpkin_seeds": "items/seeds_pumpkin", "beetroot_seeds": "items/seeds_beetroot", "pitcher_pod": "items/pitcher_pod", "harness": "items/harness/harness_white", "milk_bucket": "items/bucket_milk",
    # The piglin's barters.
    "iron_nugget": "items/iron_nugget", "crying_obsidian": "blocks/crying_obsidian", "blackstone_top": "blocks/blackstone_top", "nether_brick_item": "items/netherbrick",
    # The wandering trader's trades.
    "fern_item": "blocks/fern_carried", "lily_pad_item": "blocks/carried_waterlily", "kelp_item": "items/kelp", "wildflowers_item": "items/wildflowers",
    "baked_potato": "items/potato_baked", "blue_ice": "blocks/blue_ice", "sugar_cane": "items/reeds", "flower_tulip_pink": "blocks/flower_tulip_pink",
    "flower_oxeye_daisy": "blocks/flower_oxeye_daisy", "flower_cornflower": "blocks/flower_cornflower", "flower_lily_of_the_valley": "blocks/flower_lily_of_the_valley", "sulfur_spike": "blocks/sulfur_spike_up_tip",
    "vine_carried": "blocks/vine_carried", "pointed_dripstone": "blocks/pointed_dripstone_up_tip",
    "rooted_dirt": "blocks/dirt_with_roots", "tall_dry_grass": "blocks/tall_dry_grass", "sea_pickle_item": "items/sea_pickle", "tube_coral_block": "blocks/coral_blue",
    "brain_coral_block": "blocks/coral_pink", "bubble_coral_block": "blocks/coral_purple", "fire_coral_block": "blocks/coral_red", "horn_coral_block": "blocks/coral_yellow",
    "log_acacia": "blocks/log_acacia", "log_acacia_top": "blocks/log_acacia_top", "log_birch_top": "blocks/log_birch_top", "log_cherry": "blocks/cherry_log_side",
    "log_cherry_top": "blocks/cherry_log_top", "log_dark_oak_top": "blocks/log_big_oak_top", "log_jungle": "blocks/log_jungle", "log_jungle_top": "blocks/log_jungle_top",
    "log_mangrove": "blocks/mangrove_log_side", "log_mangrove_top": "blocks/mangrove_log_top", "log_oak_top": "blocks/log_oak_top", "log_pale_oak": "blocks/pale_oak_log_side",
    "log_pale_oak_top": "blocks/pale_oak_log_top", "log_spruce_top": "blocks/log_spruce_top", "log_poplar": "blocks/poplar_log_side", "log_poplar_top": "blocks/poplar_log_top",
    "sapling_acacia": "blocks/sapling_acacia", "sapling_birch": "blocks/sapling_birch", "sapling_cherry": "blocks/cherry_sapling", "sapling_dark_oak": "blocks/sapling_roofed_oak",
    "sapling_jungle": "blocks/sapling_jungle", "mangrove_propagule": "items/mangrove_propagule", "sapling_oak": "blocks/sapling_oak", "sapling_pale_oak": "blocks/pale_oak_sapling",
    "sapling_spruce": "blocks/sapling_spruce", "sapling_poplar": "blocks/poplar_sapling", "iron_nautilus_armor": "items/nautilus_armor/iron_nautilus_armor", "bowl": "items/bowl", "iron_horse_armor": "items/iron_horse_armor",
}
# Animated block textures, a strip of frames top to bottom: only their first frame is kept.
FIRST_FRAME = {"sculk", "fire"}
for color in COLORS:
    pack_color = "silver" if color == "light_gray" else color
    FILES[f"{color}_dye"] = f"items/dye_powder_{DYE_FILES.get(color, color)}"
    FILES[f"{color}_wool"] = f"blocks/wool_colored_{pack_color}"
    FILES[f"{color}_terracotta"] = f"blocks/hardened_clay_stained_{pack_color}"
    FILES[f"{color}_glazed_terracotta"] = f"blocks/glazed_terracotta_{pack_color}"
    FILES[f"{color}_bed"] = f"items/bed_{pack_color}"
# Spawn eggs: the Mobs tab's icons, egg_<mob>.
for egg in sorted((pack / "items" / "spawn_eggs").glob("spawn_egg_*.png")):
    FILES[f"egg_{egg.stem[len('spawn_egg_'):]}"] = f"items/spawn_eggs/{egg.stem}"
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
    """Rewrite a 24- or 32-bit TGA (plain or run-length) as an RGBA PNG."""
    d = src.read_bytes()
    kind, w, h, n, desc = d[2], d[12] | d[13] << 8, d[14] | d[15] << 8, d[16] // 8, d[17]
    pos, px = 18 + d[0], []
    while len(px) < w * h:
        if kind == 10 and d[pos] & 128:
            px += [d[pos + 1:pos + 1 + n]] * ((d[pos] & 127) + 1)
            pos += 1 + n
            continue
        count = (d[pos] & 127) + 1 if kind == 10 else 1
        pos += kind == 10
        px += [d[pos + n * i:pos + n * i + n] for i in range(count)]
        pos += n * count
    rows = [px[y * w:(y + 1) * w] for y in range(h)]
    if not desc & 32:
        rows.reverse()
    raw = b"".join(b"\0" + b"".join(bytes((p[2], p[1], p[0], p[3] if n == 4 else 255)) for p in row) for row in rows)
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


# Pieces cut out of a bigger texture: art/ name -> (file in the pack, its box). The ender dragon's head, side on, for
# the dragon head on an end ship's bow; its upper jaw's scales for the snout.
CUTS = {"dragon_head_side": ("entity/dragon/dragon", (112, 46, 128, 62)), "dragon_snout_side": ("entity/dragon/dragon", (112, 64, 128, 80))}
# The Mobs tab's heads, as drops: each skull texture's front, top and side, 8 pixels square, enlarged to 16 so the icon
# draws them as a block.
for head, file in {"creeper_head": "creeper", "skeleton_skull": "skeleton", "wither_skeleton_skull": "wither_skeleton", "zombie_head": "zombie"}.items():
    CUTS[f"{head}_front"] = (f"entity/skulls/{file}", (8, 8, 16, 16))
    CUTS[f"{head}_top"] = (f"entity/skulls/{file}", (8, 0, 16, 8))
    CUTS[f"{head}_side"] = (f"entity/skulls/{file}", (0, 8, 8, 16))


# The dried ghast, as the game's block model (models/block/dried_ghast.json) puts its textures on: a 10-pixel body and six
# tentacles a pixel high. The Mobs tab draws it as the game's inventory does, from the north-west (front on the left, its
# west side on the right), so only the up, north and west faces show. Each face's pixels are laid out here where
# boxModel in src/art.js reads them, so the icon needs no offsets: up at (16 − x, 16 − z), north at (16 − x, 16 − y), west
# at (z, 16 − y), the icon's x and z running the other way to the game's. The body and the tentacles get their own
# textures, as their faces overlap. The pack's files are Bedrock's: front for north, left for west.
DRIED_GHAST = "blocks/dried_ghast_state_1_"
DRIED_GHAST_TEXTURES = {"north": "front", "west": "left", "top": "top", "tentacles": "tentacles"}
# (from, to, {face: (uv, rotation, texture)}), only the faces the icon shows.
DRIED_GHAST_BODY = [((3, 0, 3), (13, 10, 13), {"north": ((0, 0, 10, 10), 0, "north"), "west": ((0, 0, 10, 10), 0, "west"),
                                               "up": ((0, 0, 10, 10), 180, "top")})]
DRIED_GHAST_TENTACLES = [  # the ones in front first: where two faces share pixels, the first is the one seen
    ((0, 0, 5), (3, 1, 7), {"north": ((1, 1.5, 2.5, 2), 0, "tentacles"), "west": ((2.5, 1.5, 3.5, 2), 0, "tentacles"), "up": ((2.5, 1.5, 1.5, 0), 90, "tentacles")}),
    ((0, 0, 9), (3, 1, 11), {"north": ((1, 3.5, 2.5, 4), 0, "tentacles"), "west": ((2.5, 3.5, 3.5, 4), 0, "tentacles"), "up": ((2.5, 3.5, 1.5, 2), 90, "tentacles")}),
    ((13, 0, 5), (16, 1, 7), {"north": ((2.5, 7.5, 1, 8), 0, "tentacles"), "west": ((1, 7.5, 0, 8), 0, "tentacles"), "up": ((2.5, 6, 1.5, 7.5), 90, "tentacles")}),
    ((13, 0, 9), (16, 1, 11), {"north": ((2.5, 5.5, 1, 6), 0, "tentacles"), "west": ((1, 5.5, 0, 6), 0, "tentacles"), "up": ((2.5, 4, 1.5, 5.5), 90, "tentacles")}),
    ((9, 0, 13), (11, 1, 16), {"north": ((6, 2.5, 5, 3), 0, "tentacles"), "west": ((10, 2.5, 8.5, 3), 0, "tentacles"), "up": ((6, 2.5, 7.5, 1.5), 90, "tentacles")}),
    ((5, 0, 13), (7, 1, 16), {"north": ((6, 1, 5, 1.5), 0, "tentacles"), "west": ((10, 1, 8.5, 1.5), 0, "tentacles"), "up": ((6, 1, 7.5, 0), 90, "tentacles")}),
]


def dried_ghast_faces(elements, textures):
    """The up, north and west faces of these model elements, each a 16×16 picture laid out as boxModel reads it."""
    from PIL import Image
    out = {face: Image.new("RGBA", (16, 16)) for face in ("up", "north", "west")}
    for (fx, fy, fz), (tx, ty, tz), faces in elements:
        for face, (uv, rotation, name) in faces.items():
            tex = textures[name]
            scale = tex.width / 16
            if face == "up":  # seen from above: s along x, t along z
                cells = [(x, z, (x + .5 - fx) / (tx - fx), (z + .5 - fz) / (tz - fz), (15 - x, 15 - z)) for x in range(fx, tx) for z in range(fz, tz)]
            elif face == "north":  # seen from the north: s from east to west, t from top to bottom
                cells = [(x, y, (tx - x - .5) / (tx - fx), (ty - y - .5) / (ty - fy), (15 - x, 15 - y)) for x in range(fx, tx) for y in range(fy, ty)]
            else:  # west, seen from the west: s from north to south
                cells = [(z, y, (z + .5 - fz) / (tz - fz), (ty - y - .5) / (ty - fy), (z, 15 - y)) for z in range(fz, tz) for y in range(fy, ty)]
            for _, _, s, t, at in cells:
                # The texture turned clockwise on the face: which of its points lands here.
                s, t = {0: (s, t), 90: (t, 1 - s), 180: (1 - s, 1 - t), 270: (1 - t, s)}[rotation]
                u, v = uv[0] + (uv[2] - uv[0]) * s, uv[1] + (uv[3] - uv[1]) * t
                px = tex.getpixel((min(tex.width - 1, int(u * scale)), min(tex.height - 1, int(v * scale))))
                if out[face].getpixel(at)[3] == 0:
                    out[face].putpixel(at, px)
    return out


def import_dried_ghast(out):
    from PIL import Image
    textures = {}
    for key, file in DRIED_GHAST_TEXTURES.items():
        img = Image.open(pack / f"{DRIED_GHAST}{file}.png").convert("RGBA")
        textures[key] = img.crop((0, 0, img.width, img.width))  # the front is frames of animation: the first
    for part, elements in (("dried_ghast", DRIED_GHAST_BODY), ("dried_ghast_tentacles", DRIED_GHAST_TENTACLES)):
        for face, img in dried_ghast_faces(elements, textures).items():
            img.save(out / f"{part}_{face}.png")


def import_item_pictures(out):
    """Items the pack only has as sheets of model parts, put together from those parts for the Mobs tab's trade rows:
    the small dripleaf (its leaf over its stem) and the shelf mushroom (its cap twice, stacked as it grows)."""
    from PIL import Image
    leaf = Image.open(pack / "blocks/small_dripleaf_top.png").convert("RGBA").crop((0, 0, 8, 9))
    dripleaf = Image.open(pack / "blocks/small_dripleaf_stem_top.png").convert("RGBA")
    dripleaf.alpha_composite(leaf, (4, 0))
    dripleaf.save(out / "small_dripleaf_item.png")
    cap = Image.open(pack / "blocks/shelf_mushroom_small.png").convert("RGBA").crop((0, 0, 12, 6))
    shelf = Image.new("RGBA", (16, 16))
    shelf.paste(cap, (4, 2))
    shelf.paste(cap, (0, 8))
    shelf.save(out / "shelf_mushroom_item.png")


def import_cuts(out):
    from PIL import Image
    for name, (file, box) in CUTS.items():
        src = pack / f"{file}.png"
        if not src.exists():
            tga_to_png(pack / f"{file}.tga", out / f"_{name}.png")
            src = out / f"_{name}.png"
        img = Image.open(src).convert("RGBA").crop(box)
        if img.width < 16:
            img = img.resize((16, 16 * img.height // img.width), Image.NEAREST)
        img.save(out / f"{name}.png")
        (out / f"_{name}.png").unlink(missing_ok=True)


def main():
    out = root / "art"
    out.mkdir(exist_ok=True)
    missing = []
    for name, file in sorted(FILES.items()):
        src = pack / f"{file}.png"
        if src.exists() and name in FIRST_FRAME:
            from PIL import Image
            img = Image.open(src)
            img.crop((0, 0, img.width, img.width)).save(out / f"{name}.png")
        elif src.exists():
            shutil.copyfile(src, out / f"{name}.png")
        elif src.with_suffix(".tga").exists():
            tga_to_png(src.with_suffix(".tga"), out / f"{name}.png")
        else:
            missing.append(file)
    print(f"art/: {len(FILES) - len(missing)} textures from {pack}")
    if missing:
        print("missing (the drawn icon is used instead):", ", ".join(missing))
    import_cuts(out)
    import_dried_ghast(out)
    import_item_pictures(out)
    import_villagers()


if __name__ == "__main__":
    main()
