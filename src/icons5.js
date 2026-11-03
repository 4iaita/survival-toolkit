/* ---------- Texture pack icons ----------
 * Point icons at texture pack art where the pack has the item. Each spec is layers (flat item),
 * cube: [left, top, right] face layers, boxes: a block model made of boxes, or rod: an upright rod block.
 * Entries whose textures are missing are skipped.
 */
const TIPPED = "#8932b8";
const L = (...names) => ({ layers: names.map(n => (Array.isArray(n) ? n : [n])) });
const C = (side, top = side, right = side) => ({ cube: [[[side]], [[top]], [[right]]] });
// The anvil model: base, step, waist and the long top, in block units.
const ANVIL = { boxes: [[2, 0, 2, 14, 4, 14], [4, 4, 3, 12, 5, 13], [6, 5, 4, 10, 10, 12], [3, 10, 0, 13, 16, 16]], art: "anvil", top: "anvil_top" };
const GRASS_CUBE = C("grass_block_side", "grass_block_top");

const ART_ICONS = {
  helmet: L("diamond_helmet"), chestplate: L("diamond_chestplate"), leggings: L("diamond_leggings"), boots: L("diamond_boots"),
  turtle_shell: L("turtle_helmet"), elytra: L("elytra"), sword: L("diamond_sword"), axe: L("diamond_axe"), trident: L("trident"),
  mace: L("mace"), spear: L("spear"), brush: L("brush"),
  bow: L("bow"), crossbow: L("crossbow_standby"), pickaxe: L("diamond_pickaxe"), shovel: L("diamond_shovel"), hoe: L("diamond_hoe"),
  fishing_rod: L("fishing_rod"), shears: L("shears"), flint_and_steel: L("flint_and_steel"),
  carrot_on_a_stick: L("carrot_on_a_stick"), warped_fungus_on_a_stick: L("warped_fungus_on_a_stick"),

  "ui:grass": GRASS_CUBE, "ui:bedrock": C("bedrock"), "ui:book": L("book"), "ui:emerald": L("emerald"),
  "ui:logo": C("chest_front", "chest_top", "chest_side"), "ui:enchant": L("enchanted_book"), "ui:anvil": ANVIL,
  "ui:orb": L("experience_bottle"), "ui:command": C("command_block_front", "command_block_side"),

  "b:dragon_breath": L("dragon_breath"), "b:nether_wart": L("nether_wart"), "b:sugar": L("sugar"), "b:rabbit_foot": L("rabbit_foot"),
  "b:glistering_melon": L("glistering_melon_slice"), "b:blaze_powder": L("blaze_powder"), "b:ghast_tear": L("ghast_tear"),
  "b:magma_cream": L("magma_cream"), "b:pufferfish": L("pufferfish"), "b:golden_carrot": L("golden_carrot"),
  "b:turtle_shell": L("turtle_helmet"), "b:phantom_membrane": L("phantom_membrane"), "b:spider_eye": L("spider_eye"),
  "b:fermented_spider_eye": L("fermented_spider_eye"), "b:breeze_rod": L("breeze_rod"), "b:cobweb": L("cobweb"), "b:slime_block": C("slime_block"),
  "b:stone": C("stone"), "b:redstone": L("redstone"), "b:glowstone": L("glowstone_dust"), "b:gunpowder": L("gunpowder"),

  "e:protection": L("iron_chestplate"), "e:fire_protection": L("fire_charge"), "e:blast_protection": C("tnt_side", "tnt_top"),
  "e:projectile_protection": L("arrow"), "e:feather_falling": L("feather"), "e:respiration": L("pufferfish"),
  "e:aqua_affinity": L("water_bucket"), "e:thorns": C("cactus_side", "cactus_top"), "e:depth_strider": L("nautilus_shell"),
  "e:frost_walker": C("frosted_ice"), "e:soul_speed": C("soul_sand"), "e:swift_sneak": L("echo_shard"),
  "e:sharpness": L("iron_sword"), "e:smite": L("bone"), "e:bane_of_arthropods": L("spider_eye"),
  "e:knockback": C("piston_side", "piston_top"), "e:fire_aspect": L("blaze_rod"), "e:looting": L("emerald"),
  "e:sweeping_edge": L("golden_sword"), "e:lunge": L("iron_spear"), "e:density": ANVIL, "e:breach": L("ominous_trial_key"),
  "e:wind_burst": L("wind_charge"), "e:efficiency": L("golden_pickaxe"), "e:fortune": L("diamond"), "e:silk_touch": GRASS_CUBE,
  "e:unbreaking": C("obsidian"), "e:mending": L("experience_bottle"),
  "e:power": L("bow"), "e:punch": L("slime_ball"), "e:flame": L("campfire"), "e:infinity": L(["tipped_arrow_base"], ["tipped_arrow_head", TIPPED]),
  "e:multishot": L("crossbow_firework"), "e:piercing": L("crossbow_arrow"), "e:quick_charge": L("sugar"),
  "e:impaling": L("trident"), "e:loyalty": L("lead"), "e:riptide": L("heart_of_the_sea"), "e:channeling": { rod: "lightning_rod" },
  "e:luck_of_the_sea": L("tropical_fish"), "e:lure": L("cod"), "e:binding_curse": L("chain"), "e:vanishing_curse": L("phantom_membrane"),
};

const ART_TRADES = {
  "Emerald": L("emerald"), "Diamond": L("diamond"), "Lapis Lazuli": L("lapis_lazuli"), "Nether Quartz": L("quartz"),
  "Flint": L("flint"), "Coal": L("coal"), "Iron Ingot": L("iron_ingot"), "Gold Ingot": L("gold_ingot"), "Brick": L("brick"),
  "Lava Bucket": L("lava_bucket"), "Bucket of Cod": L("cod_bucket"), "Bell": L("bell"), "Shears": L("shears"), "Bow": L("bow"),
  "Crossbow": L("crossbow_standby"), "Fishing Rod": L("fishing_rod"), "Book": L("book"), "Book and Quill": L("writable_book"),
  "Raw Chicken": L("chicken"), "Raw Rabbit": L("rabbit"), "Raw Porkchop": L("porkchop"), "Raw Beef": L("beef"), "Raw Mutton": L("mutton"),
  "Cooked Chicken": L("cooked_chicken"), "Cooked Porkchop": L("cooked_porkchop"), "Rotten Flesh": L("rotten_flesh"), "Bread": L("bread"),
  "Saddle": L("saddle"), "Rabbit Stew": L("rabbit_stew"), "Suspicious Stew": L("suspicious_stew"), "Raw Cod": L("cod"),
  "Cooked Cod": L("cooked_cod"), "Raw Salmon": L("salmon"), "Cooked Salmon": L("cooked_salmon"), "Tropical Fish": L("tropical_fish"),
  "Pufferfish": L("pufferfish"), "Paper": L("paper"), "Empty Map": L("map"), "Village Map": L("filled_map"),
  "Ocean Explorer Map": L("ocean_explorer_map"), "Trial Explorer Map": L("trial_explorer_map"), "Woodland Explorer Map": L("woodland_explorer_map"), "Globe Banner Pattern": L("globe_banner_pattern"),
  "Wheat": L("wheat"), "Carrot": L("carrot"), "Golden Carrot": L("golden_carrot"), "Potato": L("potato"), "Beetroot": L("beetroot"),
  "Apple": L("apple"), "Sweet Berries": L("sweet_berries"), "Cookie": L("cookie"), "Pumpkin Pie": L("pumpkin_pie"),
  "Ender Pearl": L("ender_pearl"), "Clay Ball": L("clay_ball"), "Ink Sac": L("ink_sac"), "Compass": L("compass"), "Clock": L("clock"),
  "Glistering Melon Slice": L("glistering_melon_slice"), "Rabbit's Foot": L("rabbit_foot"), "Nether Wart": L("nether_wart"),
  "Redstone Dust": L("redstone"), "Turtle Scute": L("scute"), "Glass Bottle": L("glass_bottle"), "Bottle o' Enchanting": L("experience_bottle"),
  "Lantern": L("lantern"), "Campfire": L("campfire"), "String": L("string"), "Feather": L("feather"), "Stick": L("stick"),
  "Arrow": L("arrow"), "Tipped Arrow": L(["tipped_arrow_base"], ["tipped_arrow_head", TIPPED]), "Tripwire Hook": L("tripwire_hook"),
  "Leather": L("leather"), "Rabbit Hide": L("rabbit_hide"), "Boat": L("oak_boat"), "Bed": L("red_bed"), "Red Candle": L("red_candle"), "Yellow Candle": L("yellow_candle"), "Item Frame": L("item_frame"), "Painting": L("painting"),
  "Cake": L("cake"), "Glowstone": C("glowstone"), "Pumpkin": C("pumpkin_side", "pumpkin_top"), "Melon": C("melon_side", "melon_top"),
  "Dried Kelp Block": C("dried_kelp_side", "dried_kelp_top"), "Gravel": C("gravel"), "Dripstone Block": C("dripstone_block"), "Stone": C("stone"), "Granite": C("granite"),
  "Andesite": C("andesite"), "Diorite": C("diorite"), "Polished Granite": C("polished_granite"), "Polished Andesite": C("polished_andesite"),
  "Polished Diorite": C("polished_diorite"), "Chiseled Stone Bricks": C("chiseled_stone_bricks"), "Terracotta": C("terracotta"),
  "Glazed Terracotta": C("light_blue_glazed_terracotta"), "Block of Quartz": C("quartz_block_side", "quartz_block_top"),
  "Quartz Pillar": C("quartz_pillar", "quartz_pillar_top"), "Glass": C("glass"), "Glass Pane": C("glass"),
  "Bookshelf": C("bookshelf", "oak_planks"), "Wool": C("white_wool"), "Carpet": C("white_wool"),
  "Leather Cap": L("leather_helmet"), "Leather Tunic": L("leather_chestplate"), "Leather Pants": L("leather_leggings"),
  "Leather Boots": L("leather_boots"), "Leather Horse Armor": L("leather_horse_armor"),
};
for (const color of Object.keys(DYES)) {
  const name = color.replace(/(^| )\w/g, s => s.toUpperCase()), file = color.replace(" ", "_");
  ART_TRADES[`${name} Wool`] = C(`${file}_wool`);
  ART_TRADES[`${name} Carpet`] = C(`${file}_wool`);
  ART_TRADES[`${name} Dye`] = L(`${file}_dye`);
}
for (const metal of ["Iron", "Chainmail", "Diamond", "Stone", "Golden"]) {
  for (const piece of ["Helmet", "Chestplate", "Leggings", "Boots", "Axe", "Shovel", "Pickaxe", "Hoe", "Sword"]) {
    ART_TRADES[`${metal} ${piece}`] = L(`${metal.toLowerCase()}_${piece.toLowerCase()}`);
  }
}

// Job site blocks, by the block names in VILLAGERS. Hollow blocks fill their top with the inside texture;
// the lectern, grindstone and stonecutter are box models whose faces line up with the pack's model textures.
const HOLLOW = (side, inside, top) => ({ cube: [[[side]], [[inside], [top]], [[side]]] });
const ART_SITES = {
  "Barrel": C("barrel_side", "barrel_top"),
  "Blast Furnace": C("blast_furnace_front", "blast_furnace_top", "blast_furnace_side"),
  "Brewing Stand": L("brewing_stand"),
  "Cartography Table": C("cartography_table_front", "cartography_table_top", "cartography_table_side"),
  "Cauldron": HOLLOW("cauldron_side", "cauldron_inner", "cauldron_top"),
  "Composter": HOLLOW("composter_side", "composter_bottom", "composter_top"),
  "Fletching Table": C("fletching_table_front", "fletching_table_top", "fletching_table_side"),
  "Loom": C("loom_front", "loom_top", "loom_side"),
  "Smithing Table": C("smithing_table_front", "smithing_table_top", "smithing_table_side"),
  "Smoker": C("smoker_front", "smoker_top", "smoker_side"),
  "Lectern": { boxes: [
    { b: [0, 0, 0, 16, 2, 16], faces: [["lectern_top"], ["lectern_top"], ["lectern_top"]] },
    { b: [4, 2, 4, 12, 13, 12], faces: [["lectern_sides"], ["lectern_top"], ["lectern_front", -4]] },
    { b: [1, 13, 1, 15, 16, 15], faces: [["lectern_sides"], ["lectern_base"], ["lectern_sides"]] },
  ] },
  "Grindstone": { boxes: [
    { b: [2, 4, 4, 14, 16, 12], faces: [["grindstone_round", -4], ["grindstone_round", -4, -2, true], ["grindstone_side", -2]] },
    { b: [0, 6, 3, 2, 12, 13], faces: [["grindstone_pivot", -3, -4], ["grindstone_pivot", -3, 0, true], ["grindstone_pivot", 0, -4]] },
    { b: [14, 6, 3, 16, 12, 13], faces: [["grindstone_pivot", -3, -4], ["grindstone_pivot", -3, -14, true], ["grindstone_pivot", -14, -4]] },
    { b: [0, 0, 7, 2, 6, 9], faces: [["grindstone_pivot", -7, -10], ["grindstone_pivot"], ["grindstone_pivot", 0, -10]] },
    { b: [14, 0, 7, 16, 6, 9], faces: [["grindstone_pivot", -7, -10], ["grindstone_pivot"], ["grindstone_pivot", -14, -10]] },
  ] },
  "Stonecutter": { boxes: [
    { b: [0, 0, 0, 16, 9, 16], faces: [["stonecutter_side"], ["stonecutter_top"], ["stonecutter_side"]] },
    { b: [1, 9, 7.5, 15, 16, 8.5], faces: [["stonecutter_saw", 0, 9], ["stonecutter_saw", 0, 9], ["stonecutter_saw", 0, 9]] },
  ] },
};

// Village biomes: the ground block each biome's villages stand on, grass in the biome's own grass color.
const grassIn = biome => {
  const color = BIOME_TINTS[biome].grass, side = [["dirt"], ["grass_side_overlay", color, "multiply"]];
  return { cube: [side, [["grass_top", color, "multiply"]], side] };
};
const ART_BIOMES = {
  plains: grassIn("plains"), desert: C("sand"), savanna: grassIn("savanna"), snowy: C("snowy_grass_side", "snow"),
  taiga: C("podzol_side", "podzol_top"), jungle: grassIn("jungle"), swamp: grassIn("swamp"),
};

const artReady = spec => artNeeds(spec).every(([n]) => art(n));
for (const [key, spec] of Object.entries(ART_ICONS)) if (artReady(spec)) ICONS[key] = spec;
for (const [name, spec] of Object.entries(ART_SITES)) if (artReady(spec)) ICONS[`site:${name}`] = spec;
for (const [biome, spec] of Object.entries(ART_BIOMES)) if (artReady(spec)) ICONS[`biome:${biome}`] = spec;
for (const [name, spec] of Object.entries(ART_TRADES)) if (artReady(spec)) TRADE_ICONS[name] = spec;
