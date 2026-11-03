/* ---------- Villager trade data ----------
 * From the Minecraft Wiki trading tables (26.x). Java and Bedrock share these trades;
 * they differ in which of a level's trades a villager ends up offering.
 * Trade format: "wants > gives # note", with "+" between two wanted items and an
 * optional count or price range before each item.
 */
const LEVELS = ["Novice", "Apprentice", "Journeyman", "Expert", "Master"];

const VILLAGERS = [
  { k: "armorer", n: "Armorer", site: "Blast Furnace",
    tip: "Turns coal, iron, lava and diamonds into emeralds. Expert and Master sell enchanted diamond armor.",
    levels: [
      ["15 Coal > Emerald", "5 Emerald > Iron Helmet", "9 Emerald > Iron Chestplate", "7 Emerald > Iron Leggings", "4 Emerald > Iron Boots"],
      ["4 Iron Ingot > Emerald", "36 Emerald > Bell", "3 Emerald > Chainmail Leggings", "Emerald > Chainmail Boots"],
      ["Lava Bucket > Emerald", "Diamond > Emerald", "Emerald > Chainmail Helmet", "4 Emerald > Chainmail Chestplate", "5 Emerald > Shield"],
      ["19–33 Emerald > Enchanted Diamond Leggings", "13–27 Emerald > Enchanted Diamond Boots"],
      ["13–27 Emerald > Enchanted Diamond Helmet", "21–35 Emerald > Enchanted Diamond Chestplate"],
    ] },
  { k: "butcher", n: "Butcher", site: "Smoker",
    tip: "Buys raw meat, kelp and sweet berries, so it pairs well with an animal or berry farm.",
    levels: [
      ["14 Raw Chicken > Emerald", "4 Raw Rabbit > Emerald", "7 Raw Porkchop > Emerald", "Emerald > Rabbit Stew"],
      ["15 Coal > Emerald", "Emerald > 8 Cooked Chicken", "Emerald > 5 Cooked Porkchop"],
      ["10 Raw Beef > Emerald", "7 Raw Mutton > Emerald"],
      ["10 Dried Kelp Block > Emerald"],
      ["10 Sweet Berries > Emerald"],
    ] },
  { k: "cartographer", n: "Cartographer", site: "Cartography Table",
    tip: "Sells explorer maps that lead to villages, ocean monuments, trial chambers and woodland mansions.",
    levels: [
      ["24 Paper > Emerald", "7 Emerald > Empty Map"],
      ["11 Glass Pane > Emerald", "8 Emerald + Compass > Village Map"],
      ["Compass > Emerald", "13 Emerald + Compass > Ocean Explorer Map", "12 Emerald + Compass > Trial Explorer Map"],
      ["7 Emerald > Item Frame", "3 Emerald > Banner # any color"],
      ["8 Emerald > Globe Banner Pattern", "14 Emerald + Compass > Woodland Explorer Map"],
    ] },
  { k: "cleric", n: "Cleric", site: "Brewing Stand",
    tip: "Buys rotten flesh, a free drop from zombies. Sells ender pearls and Bottles o’ Enchanting.",
    levels: [
      ["32 Rotten Flesh > Emerald", "Emerald > 2 Redstone Dust"],
      ["3 Gold Ingot > Emerald", "Emerald > Lapis Lazuli"],
      ["2 Rabbit's Foot > Emerald", "4 Emerald > Glowstone"],
      ["4 Turtle Scute > Emerald", "9 Glass Bottle > Emerald", "5 Emerald > Ender Pearl"],
      ["22 Nether Wart > Emerald", "3 Emerald > Bottle o' Enchanting"],
    ] },
  { k: "farmer", n: "Farmer", site: "Composter",
    tip: "Buys crops, the easiest emeralds in the game. Sells golden carrots, great food for long trips.",
    levels: [
      ["20 Wheat > Emerald", "26 Potato > Emerald", "22 Carrot > Emerald", "15 Beetroot > Emerald", "Emerald > 6 Bread"],
      ["6 Pumpkin > Emerald", "Emerald > 4 Pumpkin Pie", "Emerald > 4 Apple"],
      ["4 Melon > Emerald", "3 Emerald > 18 Cookie"],
      ["Emerald > Suspicious Stew", "Emerald > Cake"],
      ["3 Emerald > 3 Golden Carrot", "4 Emerald > 3 Glistering Melon Slice"],
    ] },
  { k: "fisherman", n: "Fisherman", site: "Barrel",
    tip: "Buys string, coal, fish and boats. Sells enchanted fishing rods and campfires.",
    levels: [
      ["20 String > Emerald", "10 Coal > Emerald", "3 Emerald > Bucket of Cod", "6 Raw Cod + Emerald > 6 Cooked Cod"],
      ["15 Raw Cod > Emerald", "2 Emerald > Campfire", "6 Raw Salmon + Emerald > 6 Cooked Salmon"],
      ["13 Raw Salmon > Emerald", "8–22 Emerald > Enchanted Fishing Rod"],
      ["6 Tropical Fish > Emerald"],
      ["4 Pufferfish > Emerald", "Boat > Emerald # wood type depends on the biome"],
    ] },
  { k: "fletcher", n: "Fletcher", site: "Fletching Table",
    tip: "Buys 32 sticks for an emerald, an easy trade next to a tree farm. Sells enchanted bows and crossbows.",
    levels: [
      ["32 Stick > Emerald", "Emerald > 16 Arrow", "10 Gravel + Emerald > 10 Flint"],
      ["26 Flint > Emerald", "2 Emerald > Bow"],
      ["14 String > Emerald", "3 Emerald > Crossbow"],
      ["24 Feather > Emerald", "7–21 Emerald > Enchanted Bow"],
      ["8 Tripwire Hook > Emerald", "8–22 Emerald > Enchanted Crossbow", "2 Emerald + 5 Arrow > 5 Tipped Arrow"],
    ] },
  { k: "leatherworker", n: "Leatherworker", site: "Cauldron",
    tip: "Buys leather, rabbit hide and flint. Sells dyed leather armor, horse armor and saddles.",
    levels: [
      ["6 Leather > Emerald", "3 Emerald > Leather Pants # random color", "7 Emerald > Leather Tunic # random color"],
      ["26 Flint > Emerald", "5 Emerald > Leather Cap # random color", "4 Emerald > Leather Boots # random color"],
      ["9 Rabbit Hide > Emerald", "7 Emerald > Leather Tunic # random color"],
      ["4 Turtle Scute > Emerald", "6 Emerald > Leather Horse Armor # random color"],
      ["5 Emerald > Leather Cap # random color", "6 Emerald > Saddle"],
    ] },
  { k: "librarian", n: "Librarian", site: "Lectern",
    tip: "The most useful villager: sells enchanted books, including Mending. Before its first trade, break and replace the lectern to roll new offers.",
    levels: [
      ["24 Paper > Emerald", "9 Emerald > Bookshelf", "5–64 Emerald + Book > Enchanted Book # random enchantment"],
      ["4 Book > Emerald", "Emerald > Lantern", "5–64 Emerald + Book > Enchanted Book # random enchantment"],
      ["5 Ink Sac > Emerald", "Emerald > 4 Glass", "5–64 Emerald + Book > Enchanted Book # random enchantment"],
      ["Book and Quill > Emerald # Bedrock asks for 2", "4 Emerald > Compass", "5 Emerald > Clock", "5–64 Emerald + Book > Enchanted Book # random enchantment"],
      ["3 Emerald > Red Candle", "3 Emerald > Yellow Candle"],
    ] },
  { k: "mason", n: "Mason", bedrockName: "Stone Mason", site: "Stonecutter",
    tip: "Buys clay, stone and quartz. Sells polished stone, dripstone, terracotta and quartz blocks for building.",
    levels: [
      ["10 Clay Ball > Emerald", "Emerald > 10 Brick"],
      ["20 Stone > Emerald", "Emerald > 4 Chiseled Stone Bricks"],
      ["16 Granite > Emerald", "16 Andesite > Emerald", "16 Diorite > Emerald", "Emerald > 4 Dripstone Block", "Emerald > 4 Polished Andesite", "Emerald > 4 Polished Diorite", "Emerald > 4 Polished Granite"],
      ["12 Nether Quartz > Emerald", "Emerald > Terracotta # any color", "Emerald > Glazed Terracotta # any color"],
      ["Emerald > Quartz Pillar", "Emerald > Block of Quartz"],
    ] },
  { k: "shepherd", n: "Shepherd", site: "Loom",
    tip: "Buys wool and dyes. Sells shears, beds, banners, carpets and paintings.",
    levels: [
      ["18 White Wool > Emerald", "18 Brown Wool > Emerald", "18 Black Wool > Emerald", "18 Gray Wool > Emerald", "2 Emerald > Shears"],
      ["12 White Dye > Emerald", "12 Gray Dye > Emerald", "12 Black Dye > Emerald", "12 Light Blue Dye > Emerald", "12 Lime Dye > Emerald", "Emerald > Wool # any color", "Emerald > 4 Carpet # any color"],
      ["12 Yellow Dye > Emerald", "12 Light Gray Dye > Emerald", "12 Orange Dye > Emerald", "12 Red Dye > Emerald", "12 Pink Dye > Emerald", "3 Emerald > Bed # any color"],
      ["12 Brown Dye > Emerald", "12 Purple Dye > Emerald", "12 Blue Dye > Emerald", "12 Green Dye > Emerald", "12 Magenta Dye > Emerald", "12 Cyan Dye > Emerald", "3 Emerald > Banner # any color"],
      ["2 Emerald > 3 Painting"],
    ] },
  { k: "toolsmith", n: "Toolsmith", site: "Smithing Table",
    tip: "Buys coal, iron, flint and diamonds. Sells enchanted iron and diamond tools.",
    levels: [
      ["15 Coal > Emerald", "Emerald > Stone Axe", "Emerald > Stone Shovel", "Emerald > Stone Pickaxe", "Emerald > Stone Hoe"],
      ["4 Iron Ingot > Emerald", "36 Emerald > Bell"],
      ["30 Flint > Emerald", "6–20 Emerald > Enchanted Iron Axe", "7–21 Emerald > Enchanted Iron Shovel", "8–22 Emerald > Enchanted Iron Pickaxe", "4 Emerald > Diamond Hoe"],
      ["Diamond > Emerald", "17–31 Emerald > Enchanted Diamond Axe", "10–24 Emerald > Enchanted Diamond Shovel"],
      ["18–32 Emerald > Enchanted Diamond Pickaxe"],
    ] },
  { k: "weaponsmith", n: "Weaponsmith", site: "Grindstone",
    tip: "Buys coal, iron, flint and diamonds. Sells iron axes and enchanted swords and axes.",
    levels: [
      ["15 Coal > Emerald", "3 Emerald > Iron Axe", "7–21 Emerald > Enchanted Iron Sword"],
      ["4 Iron Ingot > Emerald", "36 Emerald > Bell"],
      ["24 Flint > Emerald"],
      ["Diamond > Emerald", "17–31 Emerald > Enchanted Diamond Axe"],
      ["13–27 Emerald > Enchanted Diamond Sword"],
    ] },
];

function parseTrade(text) {
  const [main, note = ""] = text.split(" # ");
  const [wants, gives] = main.split(" > ");
  const item = t => {
    const m = t.match(/^(\d+(?:–\d+)?) (.+)$/);
    return m ? { count: m[1], name: m[2] } : { count: "1", name: t };
  };
  return { wants: wants.split(" + ").map(item), gives: item(gives), note };
}
for (const v of VILLAGERS) v.trades = v.levels.map(list => list.map(parseTrade));
