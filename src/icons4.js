/* ---------- Trade item icons ----------
 * Trades name hundreds of items, so icons come from a small set of templates and
 * generated blocks, tinted per item. Unknown names fall back to a plain block.
 */
Object.assign(MAT, {
  raw:    ["#ffc9c4", "#e8706f", "#b8433f", "#6a1d1b"],
  cooked: ["#e9b07a", "#b06a35", "#7a3f18", "#3f1e08"],
  rotten: ["#c9c98a", "#8f8f45", "#5f6a2c", "#2f3812"],
  bread:  ["#f6d894", "#d39a4a", "#9a6326", "#4f2f0f"],
  map:    ["#fff6d5", "#e9d9a6", "#c4ad74", "#7a6a3f"],
  hide:   ["#e8cfa8", "#c49a68", "#8f6a3f", "#4f3a20"],
  cod:    ["#e6d8b8", "#b9a27a", "#8a7350", "#4a3c26"],
  potato: ["#f0d58f", "#c9a35a", "#937033", "#4f3a14"],
  beet:   ["#e07a8f", "#a52a4a", "#6e1430", "#3a0718"],
  clay:   ["#d2d8e4", "#a3abbd", "#7a8296", "#454b5a"],
  ink:    ["#6a6a7a", "#3a3a48", "#20202a", "#0c0c12"],
  coal:   ["#7a7a84", "#3c3c44", "#25252b", "#101014"],
  straw:  ["#e4cf72", "#b89d3e", "#7f6a22", "#4a3d12"],
});

Object.assign(TPL, {
  ingot: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "....1111111111..",
    "...122222222221.",
    "..1222222222221.",
    "..3333333333332.",
    "..3333333333332.",
    "..4444444444443.",
  ],
  meat: [
    "................", "................", "................", "................",
    ".....11111......",
    "...1122222211...",
    "..122222222221..",
    "..1222a2222222..",
    "..12222222a222..",
    "..222222222223..",
    "...2222222233...",
    "....33333333....",
  ],
  bowl: [
    "................", "................", "................", "................", "................", "................",
    "..1aaaaaaaaaa1..",
    "..122222222223..",
    "...1222222223...",
    "....12222223....",
    ".....333333.....",
  ],
  paper: [
    "................", "................",
    "...1111111111...",
    "...1222222223...",
    "...12aaaaaa23...",
    "...1222222223...",
    "...12aaaaa223...",
    "...1222222223...",
    "...12aaaaaa23...",
    "...1222222223...",
    "...12aaaa2223...",
    "...1222222223...",
    "...3333333333...",
  ],
  bucket: [
    "................", "................",
    "....22222222....",
    "...2........2...",
    "...1111111111...",
    "...1aaaaaaaa3...",
    "...1222222223...",
    "...1222222223...",
    "....12222223....",
    "....12222223....",
    "....12222233....",
    ".....333333.....",
  ],
  bell: [
    "................", "................",
    ".......11.......",
    "......1222......",
    ".....122223.....",
    ".....122223.....",
    ".....122223.....",
    "....12222223....",
    "...1222222223...",
    "..122222222223..",
    "..333333333333..",
    ".......33.......",
  ],
  wheat: [
    "................",
    ".............12.",
    "...........123..",
    "..........1y3...",
    ".........123....",
    "........1y3.....",
    ".......123......",
    "......123.......",
    "......aa........",
    ".....a.a........",
    "....a..a........",
    "...a..a.........",
    "..a...a.........",
    ".a...a..........",
    ".....a..........",
  ],
  potato: [
    "................",
    "................",
    "................",
    "................",
    ".....11111......",
    "...11222221.....",
    "..12223222221...",
    "..122222232223..",
    "..222322222223..",
    "...22222232233..",
    "....223222333...",
    ".....3333333....",
  ],
  lump: [
    "................",
    "................",
    "................",
    ".....1111.......",
    "....1222211.....",
    "...122232222....",
    "..122222232222..",
    "..123222222223..",
    "...22222322233..",
    "...2232222333...",
    "....2223333.....",
    "......333.......",
  ],
  candle: [
    "................", "................",
    ".......y........",
    ".......k........",
    "......1223......", "......1223......", "......1223......", "......1223......",
    "......1223......", "......1223......", "......1223......", "......1223......",
    "......3333......",
  ],
  boat: [
    "................", "................", "................", "................", "................", "................", "................",
    "..1..........1..",
    "..12cccccccc21..",
    "...1222222221...",
    "....33333333....",
  ],
});

const DYES = {
  white: "#f9fffe", orange: "#f9801d", magenta: "#c74ebd", "light blue": "#3ab3da", yellow: "#fed83d", lime: "#80c71f",
  pink: "#f38baa", gray: "#474f52", "light gray": "#9d9d97", cyan: "#169c9c", purple: "#8932b8", blue: "#3c44aa",
  brown: "#835432", green: "#5e7c16", red: "#b02e26", black: "#1d1d21",
};
const shades = color => ({ 1: tint(color, 0.45), 2: color, 3: tint(color, -0.3), 4: tint(color, -0.55) });

// A block icon: a speckled face drawn as an inventory cube, or flat for things that hang on a wall.
function blockGen(color, seed = 1, paint = null, flat = false) {
  const pal = [tint(color, 0.1), color, tint(color, -0.08), tint(color, -0.16)].map(hex);
  const face = () => speckle(seed, 16, [], (r, x, y) => {
    const custom = paint && paint(x, y, r);
    if (custom) return hex(custom);
    if (flat && (x === 0 || y === 0)) return hex(tint(color, 0.25));
    if (flat && (x === 15 || y === 15)) return hex(tint(color, -0.35));
    return pal[(r() * pal.length) | 0];
  });
  return flat ? face : () => cube(face());
}

const TRADE_ICONS = {
  "Emerald": { t: "gem", m: "emerald" }, "Diamond": { t: "gem", m: "diamond" }, "Lapis Lazuli": { t: "gem", m: "water" },
  "Nether Quartz": { t: "gem", m: "string" }, "Flint": { t: "gem", m: "flint" }, "Coal": { t: "lump", m: "coal" },
  "Iron Ingot": { t: "ingot", m: "iron" }, "Gold Ingot": { t: "ingot", m: "gold" }, "Brick": { t: "ingot", c: shades("#b5583d") },
  "Lava Bucket": { t: "bucket", m: "iron", s: "fire" }, "Bucket of Cod": { t: "bucket", m: "iron", s: "water" },
  "Bell": { t: "bell", m: "gold" }, "Shield": "shield", "Shears": "shears", "Bow": "bow", "Crossbow": "crossbow",
  "Fishing Rod": "fishing_rod", "Book": "ui:book", "Book and Quill": "ui:book",
  "Raw Chicken": { t: "meat", m: "raw", s: "string" }, "Raw Rabbit": { t: "meat", m: "raw", s: "string" },
  "Raw Porkchop": { t: "meat", m: "raw", s: "string" }, "Raw Beef": { t: "meat", m: "raw", s: "string" },
  "Raw Mutton": { t: "meat", m: "raw", s: "string" }, "Cooked Chicken": { t: "meat", m: "cooked", s: "bread" },
  "Cooked Porkchop": { t: "meat", m: "cooked", s: "bread" }, "Rotten Flesh": { t: "meat", m: "rotten", s: "cooked" },
  "Bread": { t: "meat", m: "bread", s: "bread" }, "Saddle": { t: "meat", m: "cooked", s: "iron" },
  "Rabbit Stew": { t: "bowl", m: "wood", s: "cooked" }, "Suspicious Stew": { t: "bowl", m: "wood", s: "orange" },
  "Raw Cod": { t: "fish", m: "cod" }, "Cooked Cod": { t: "fish", m: "cooked" }, "Raw Salmon": { t: "fish", m: "red" },
  "Cooked Salmon": { t: "fish", m: "cooked" }, "Tropical Fish": { t: "fish", m: "orange" }, "Pufferfish": "b:pufferfish",
  "Paper": { t: "paper", m: "string", s: "stone" }, "Empty Map": { t: "paper", m: "map", s: "map" },
  "Village Map": { t: "paper", m: "map", s: "green" }, "Ocean Explorer Map": { t: "paper", m: "map", s: "water" },
  "Trial Explorer Map": { t: "paper", m: "map", s: "orange" }, "Woodland Explorer Map": { t: "paper", m: "map", s: "emerald" },
  "Banner": { t: "paper", m: "string", s: "red" }, "Globe Banner Pattern": { t: "paper", m: "map", s: "water" },
  "Wheat": { t: "wheat", m: "gold", s: "straw" }, "Carrot": { t: "carrot", m: "orange" }, "Golden Carrot": "b:golden_carrot",
  "Potato": { t: "potato", m: "potato" }, "Beetroot": { t: "orb", m: "beet" }, "Apple": { t: "orb", m: "red" },
  "Sweet Berries": { t: "orb", m: "red" }, "Cookie": { t: "orb", m: "cooked" }, "Pumpkin Pie": { t: "orb", m: "orange" },
  "Ender Pearl": { t: "orb", m: "teal" }, "Clay Ball": { t: "orb", m: "clay" }, "Ink Sac": { t: "orb", m: "ink" },
  "Compass": { t: "orb", m: "iron" }, "Clock": { t: "orb", m: "gold" }, "Glistering Melon Slice": "b:glistering_melon",
  "Rabbit's Foot": "b:rabbit_foot", "Nether Wart": "b:nether_wart", "Redstone Dust": "b:redstone",
  "Turtle Scute": { t: "crest", m: "turtle" }, "Glass Bottle": { t: "potion", c: shades("#dcecf5") },
  "Bottle o' Enchanting": { t: "potion", c: shades("#a8e04a") }, "Lantern": { t: "potion", c: shades("#ffb340") },
  "Campfire": { t: "flame", m: "fire" }, "String": { t: "web", m: "string" }, "Feather": { t: "feather", m: "string", s: "stone" },
  "Stick": { t: "breezerod", m: "wood" }, "Arrow": { t: "arrow", m: "iron", s: "wood" }, "Tipped Arrow": { t: "arrow", m: "purple", s: "wood" },
  "Tripwire Hook": { t: "lock", m: "iron" }, "Leather": { t: "membrane", m: "cooked" }, "Rabbit Hide": { t: "membrane", m: "hide" },
  "Boat": { t: "boat", m: "wood", s: "wood" }, "Red Candle": { t: "candle", m: "red" }, "Yellow Candle": { t: "candle", m: "gold" },
  "Glowstone": { gen: blockGen("#e9c46a", 3) }, "Pumpkin": { gen: blockGen("#e38a1d", 4) }, "Melon": { gen: blockGen("#7fa33a", 5) },
  "Dried Kelp Block": { gen: blockGen("#3b4a2a", 6) }, "Gravel": { gen: blockGen("#8a8380", 7) }, "Stone": "b:stone",
  "Granite": { gen: blockGen("#9f6b58", 8) }, "Andesite": { gen: blockGen("#8a8b8d", 9) }, "Diorite": { gen: blockGen("#cfcfd0", 10) },
  "Polished Granite": { gen: blockGen("#a8705c", 11) }, "Polished Andesite": { gen: blockGen("#868889", 12) },
  "Polished Diorite": { gen: blockGen("#c9c9ca", 13) }, "Chiseled Stone Bricks": { gen: blockGen("#7d7d7d", 14, (x, y) => (x % 8 === 7 || y % 8 === 7) && "#5a5a5a") },
  "Dripstone Block": { gen: blockGen("#86644f", 15) }, "Terracotta": { gen: blockGen("#9e5b3e", 16) },
  "Glazed Terracotta": { gen: blockGen("#3ab3da", 17, (x, y) => ((x >> 2) + (y >> 2)) % 2 === 0 && "#f9d77e") },
  "Block of Quartz": { gen: blockGen("#ebe5de", 18) }, "Quartz Pillar": { gen: blockGen("#ebe5de", 19, x => x % 5 === 2 && "#cfc7bd") },
  "Glass": { gen: blockGen("#dff3ff", 20, (x, y) => (x === y || x === y + 1) && x > 3 && x < 9 && "#ffffff") },
  "Glass Pane": { gen: blockGen("#dff3ff", 21, (x, y) => (x === y || x === y + 1) && x > 3 && x < 9 && "#ffffff") },
  "Bookshelf": { gen: blockGen("#9b7440", 22, (x, y) => y > 2 && y < 13 && y !== 7 && y !== 8 && x > 0 && x < 15 && ["#b02e26", "#3c44aa", "#5e7c16", "#835432"][(x >> 1) % 4]) },
  "Item Frame": { gen: blockGen("#9b7440", 23, (x, y) => x > 2 && x < 13 && y > 2 && y < 13 && "#b06a35", true) },
  "Painting": { gen: blockGen("#9b7440", 24, (x, y) => x > 1 && x < 14 && y > 1 && y < 14 && (y < 8 ? "#69a9ff" : "#5fbf2a"), true) },
  "Bed": { gen: blockGen("#b02e26", 25, (x, y) => y < 5 && "#f9fffe") },
  "Cake": { gen: blockGen("#e9c48a", 26, (x, y, r) => (y < 5 ? "#f9fffe" : y < 6 && r() < 0.4 && "#d42c2c")) },
};

const ARMOR_TPL = { Helmet: "helmet", Cap: "helmet", Chestplate: "chestplate", Tunic: "chestplate", "Horse Armor": "chestplate",
  Leggings: "leggings", Pants: "leggings", Boots: "boots", Axe: "axe", Shovel: "shovel", Pickaxe: "pickaxe", Hoe: "hoe", Sword: "sword" };
const ARMOR_MAT = { Iron: "iron", Chainmail: "stone", Diamond: "diamond", Leather: "cooked", Stone: "stone" };

function tradeSpec(name) {
  const known = TRADE_ICONS[name];
  if (typeof known === "string") return ICONS[known];
  if (known) return known;
  let m = name.match(/^(.+) (Wool|Carpet)$/);
  if (m) return { gen: blockGen(DYES[m[1].toLowerCase()] || DYES.white, 30) };
  if (name === "Wool" || name === "Carpet") return { gen: blockGen(DYES.white, 30) };
  m = name.match(/^(.+) Dye$/);
  if (m && DYES[m[1].toLowerCase()]) return { t: "dust", c: shades(DYES[m[1].toLowerCase()]) };
  m = name.match(/^(Iron|Chainmail|Diamond|Leather|Stone) (.+)$/);
  if (m && ARMOR_TPL[m[2]]) return { t: ARMOR_TPL[m[2]], m: ARMOR_MAT[m[1]], s: "wood" };
  return { gen: blockGen("#8b8b8b", 31) };
}

// Icon for a trade item; "Enchanted …" items get the glint.
function tradeIcon(name) {
  const glint = name.startsWith("Enchanted ");
  const base = glint ? name.slice("Enchanted ".length) : name;
  const key = "t:" + base;
  if (!ICONS[key]) ICONS[key] = tradeSpec(base);
  return { key, glint };
}

const VILLAGER_ICON = {
  armorer: "Iron Chestplate", butcher: "Raw Beef", cartographer: "Empty Map", cleric: "Bottle o' Enchanting",
  farmer: "Wheat", fisherman: "Fishing Rod", fletcher: "Arrow", leatherworker: "Leather Tunic", librarian: "Book",
  mason: "Brick", shepherd: "White Wool", toolsmith: "Iron Pickaxe", weaponsmith: "Iron Sword",
};
ICONS["ui:emerald"] = TRADE_ICONS.Emerald;
