/* ---------- Pixel Perfection icons ----------
 * Point icons at texture pack art where the pack has the item. Each spec is layers (flat item)
 * or cube: [side layers, top layers]. Entries whose textures are missing are skipped.
 */
const LEATHER = "#a06540", GRASS = "#8cc850", TIPPED = "#8932b8";
const L = (...names) => ({ layers: names.map(n => (Array.isArray(n) ? n : [n])) });
const C = (side, top = side) => ({ cube: [[[side]], [[top]]] });
const GRASS_CUBE = { cube: [[["grass_block_side"], ["grass_block_side_overlay", GRASS]], [["grass_block_top", GRASS]]] };

const ART_ICONS = {
  helmet: L("diamond_helmet"), chestplate: L("diamond_chestplate"), leggings: L("diamond_leggings"), boots: L("diamond_boots"),
  turtle_shell: L("turtle_helmet"), elytra: L("elytra"), sword: L("diamond_sword"), axe: L("diamond_axe"), trident: L("trident"),
  bow: L("bow"), crossbow: L("crossbow_standby"), pickaxe: L("diamond_pickaxe"), shovel: L("diamond_shovel"), hoe: L("diamond_hoe"),
  fishing_rod: L("fishing_rod"), shears: L("shears"), flint_and_steel: L("flint_and_steel"),
  carrot_on_a_stick: L("carrot_on_a_stick"), warped_fungus_on_a_stick: L("warped_fungus_on_a_stick"),

  "ui:grass": GRASS_CUBE, "ui:bedrock": C("bedrock"), "ui:book": L("book"), "ui:emerald": L("emerald"),

  "b:dragon_breath": L("dragon_breath"), "b:nether_wart": L("nether_wart"), "b:sugar": L("sugar"), "b:rabbit_foot": L("rabbit_foot"),
  "b:glistering_melon": L("glistering_melon_slice"), "b:blaze_powder": L("blaze_powder"), "b:ghast_tear": L("ghast_tear"),
  "b:magma_cream": L("magma_cream"), "b:pufferfish": L("pufferfish"), "b:golden_carrot": L("golden_carrot"),
  "b:turtle_shell": L("turtle_helmet"), "b:phantom_membrane": L("phantom_membrane"), "b:spider_eye": L("spider_eye"),
  "b:fermented_spider_eye": L("fermented_spider_eye"), "b:cobweb": L("cobweb"), "b:slime_block": C("slime_block"),
  "b:stone": C("stone"), "b:redstone": L("redstone"), "b:glowstone": L("glowstone_dust"), "b:gunpowder": L("gunpowder"),

  "e:sharpness": L("iron_sword"), "e:smite": L("golden_sword"), "e:bane_of_arthropods": L("stone_sword"),
  "e:efficiency": L("golden_pickaxe"), "e:fortune": L("diamond"), "e:looting": L("emerald"), "e:silk_touch": GRASS_CUBE,
  "e:feather_falling": L("feather"), "e:impaling": L("trident"), "e:piercing": L("arrow"), "e:mending": L("experience_bottle"),
  "e:power": L("bow"), "e:quick_charge": L("crossbow_standby"), "e:lure": L("cod"), "e:luck_of_the_sea": L("tropical_fish"),
  "e:fire_aspect": L("blaze_powder"), "e:flame": L("campfire"), "e:infinity": L(["tipped_arrow_base"], ["tipped_arrow_head", TIPPED]),
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
  "Pufferfish": L("pufferfish"), "Paper": L("paper"), "Empty Map": L("map"), "Village Map": L("map"), "Ocean Explorer Map": L("map"),
  "Trial Explorer Map": L("map"), "Woodland Explorer Map": L("map"), "Globe Banner Pattern": L("globe_banner_pattern"),
  "Wheat": L("wheat"), "Carrot": L("carrot"), "Golden Carrot": L("golden_carrot"), "Potato": L("potato"), "Beetroot": L("beetroot"),
  "Apple": L("apple"), "Sweet Berries": L("sweet_berries"), "Cookie": L("cookie"), "Pumpkin Pie": L("pumpkin_pie"),
  "Ender Pearl": L("ender_pearl"), "Clay Ball": L("clay_ball"), "Ink Sac": L("ink_sac"), "Compass": L("compass_00"), "Clock": L("clock_00"),
  "Glistering Melon Slice": L("glistering_melon_slice"), "Rabbit's Foot": L("rabbit_foot"), "Nether Wart": L("nether_wart"),
  "Redstone Dust": L("redstone"), "Turtle Scute": L("scute"), "Glass Bottle": L("glass_bottle"), "Bottle o' Enchanting": L("experience_bottle"),
  "Lantern": L("lantern"), "Campfire": L("campfire"), "String": L("string"), "Feather": L("feather"), "Stick": L("stick"),
  "Arrow": L("arrow"), "Tipped Arrow": L(["tipped_arrow_base"], ["tipped_arrow_head", TIPPED]), "Tripwire Hook": L("tripwire_hook"),
  "Leather": L("leather"), "Rabbit Hide": L("rabbit_hide"), "Boat": L("oak_boat"), "Item Frame": L("item_frame"), "Painting": L("painting"),
  "Cake": L("cake"), "Glowstone": C("glowstone"), "Pumpkin": C("pumpkin_side", "pumpkin_top"), "Melon": C("melon_side", "melon_top"),
  "Dried Kelp Block": C("dried_kelp_side", "dried_kelp_top"), "Gravel": C("gravel"), "Stone": C("stone"), "Granite": C("granite"),
  "Andesite": C("andesite"), "Diorite": C("diorite"), "Polished Granite": C("polished_granite"), "Polished Andesite": C("polished_andesite"),
  "Polished Diorite": C("polished_diorite"), "Chiseled Stone Bricks": C("chiseled_stone_bricks"), "Terracotta": C("terracotta"),
  "Glazed Terracotta": C("light_blue_glazed_terracotta"), "Block of Quartz": C("quartz_block_side", "quartz_block_top"),
  "Quartz Pillar": C("quartz_pillar", "quartz_pillar_top"), "Glass": C("glass"), "Glass Pane": C("glass"),
  "Bookshelf": C("bookshelf", "oak_planks"), "Wool": C("white_wool"), "Carpet": C("white_wool"),
  "Leather Cap": L(["leather_helmet", LEATHER]), "Leather Tunic": L(["leather_chestplate", LEATHER]),
  "Leather Pants": L(["leather_leggings", LEATHER]), "Leather Boots": L(["leather_boots", LEATHER]),
  "Leather Horse Armor": L(["leather_horse_armor", LEATHER]),
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

const artReady = spec => (spec.cube ? spec.cube.flat() : spec.layers).every(([n]) => art(n));
for (const [key, spec] of Object.entries(ART_ICONS)) if (artReady(spec)) ICONS[key] = spec;
for (const [name, spec] of Object.entries(ART_TRADES)) if (artReady(spec)) TRADE_ICONS[name] = spec;
