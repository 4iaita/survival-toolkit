/* ---------- Banners: what the tab knows ----------
 * From the games' own files (Java 26.3's from misode/mcmeta, Bedrock's from Mojang/bedrock-samples: names, recipes, the loom's
 * patterns, the loot tables and the cartographer's trades) and the Minecraft Wiki (Banner, Banner/Patterns, Banner Pattern, Loom).
 * The patterns' pictures are art/banners/ (import_banner_patterns.py), kept by shape under Java's ids.
 */

// The dyes in the game's own order (the creative inventory's), as DYES calls them.
const BANNER_COLORS = ["white", "light gray", "gray", "black", "brown", "red", "orange", "yellow", "lime", "green", "cyan", "light blue", "blue", "purple", "magenta", "pink"];
const dyeId = c => c.replace(" ", "_");

// Every pattern a loom adds, in its order. k: Java's id (the shape); n: its name in the game, after the dye's ("Red Bordure"); be:
// Bedrock's name where it differs (its four diagonal halves have each other's names); say: what it is, in plain words; item: the
// banner pattern it needs (BANNER_ITEMS), else it needs only a dye. group: where the picker puts it.
const BANNER_PATTERNS = [
  { k: "square_bottom_left", n: "Base Dexter Canton", say: "Square in the bottom left corner", group: "corners" },
  { k: "square_bottom_right", n: "Base Sinister Canton", say: "Square in the bottom right corner", group: "corners" },
  { k: "square_top_left", n: "Chief Dexter Canton", say: "Square in the top left corner", group: "corners" },
  { k: "square_top_right", n: "Chief Sinister Canton", say: "Square in the top right corner", group: "corners" },
  { k: "stripe_bottom", n: "Base", be: "Base Fess", say: "Stripe along the bottom", group: "stripes" },
  { k: "stripe_top", n: "Chief", be: "Chief Fess", say: "Stripe along the top", group: "stripes" },
  { k: "stripe_left", n: "Pale Dexter", say: "Stripe down the left side", group: "stripes" },
  { k: "stripe_right", n: "Pale Sinister", say: "Stripe down the right side", group: "stripes" },
  { k: "stripe_center", n: "Pale", say: "Stripe down the middle", group: "stripes" },
  { k: "stripe_middle", n: "Fess", say: "Stripe across the middle", group: "stripes" },
  { k: "stripe_downright", n: "Bend", say: "Diagonal stripe from the top left", group: "stripes" },
  { k: "stripe_downleft", n: "Bend Sinister", say: "Diagonal stripe from the top right", group: "stripes" },
  { k: "small_stripes", n: "Paly", say: "Thin stripes down it", group: "stripes" },
  { k: "cross", n: "Saltire", say: "Diagonal cross", group: "shapes" },
  { k: "straight_cross", n: "Cross", say: "Upright cross", group: "shapes" },
  { k: "triangle_bottom", n: "Chevron", say: "Triangle rising from the bottom", group: "shapes" },
  { k: "triangle_top", n: "Inverted Chevron", say: "Triangle hanging from the top", group: "shapes" },
  { k: "triangles_bottom", n: "Base Indented", say: "Sawtooth along the bottom", group: "shapes" },
  { k: "triangles_top", n: "Chief Indented", say: "Sawtooth along the top", group: "shapes" },
  { k: "diagonal_left", n: "Per Bend Sinister", be: "Per Bend Inverted", say: "Top left half, cut diagonally", group: "halves" },
  { k: "diagonal_up_right", n: "Per Bend Sinister Inverted", be: "Per Bend", say: "Bottom right half, cut diagonally", group: "halves" },
  { k: "diagonal_up_left", n: "Per Bend Inverted", be: "Per Bend Sinister", say: "Bottom left half, cut diagonally", group: "halves" },
  { k: "diagonal_right", n: "Per Bend", be: "Per Bend Sinister Inverted", say: "Top right half, cut diagonally", group: "halves" },
  { k: "circle", n: "Roundel", say: "Circle in the middle", group: "shapes" },
  { k: "rhombus", n: "Lozenge", say: "Diamond in the middle", group: "shapes" },
  { k: "half_vertical", n: "Per Pale", say: "Left half", group: "halves" },
  { k: "half_horizontal", n: "Per Fess", say: "Top half", group: "halves" },
  { k: "half_vertical_right", n: "Per Pale Inverted", say: "Right half", group: "halves" },
  { k: "half_horizontal_bottom", n: "Per Fess Inverted", say: "Bottom half", group: "halves" },
  { k: "border", n: "Bordure", say: "Border all round", group: "shapes" },
  { k: "gradient", n: "Gradient", say: "Fades down from the top", group: "shapes" },
  { k: "gradient_up", n: "Base Gradient", say: "Fades up from the bottom", group: "shapes" },
  { k: "bricks", n: "Field Masoned", say: "Bricks all over", item: "field_masoned" },
  { k: "curly_border", n: "Bordure Indented", say: "Wavy border all round", item: "bordure_indented" },
  { k: "flower", n: "Flower Charge", say: "A flower", item: "flower" },
  { k: "creeper", n: "Creeper Charge", say: "A creeper’s face", item: "creeper" },
  { k: "skull", n: "Skull Charge", say: "A skull and crossbones", item: "skull" },
  { k: "mojang", n: "Thing", say: "Mojang’s old logo", item: "mojang" },
  { k: "globe", n: "Globe", say: "A globe", item: "globe" },
  { k: "piglin", n: "Snout", say: "A piglin’s snout", item: "piglin" },
  { k: "flow", n: "Flow", say: "A spiral", item: "flow" },
  { k: "guster", n: "Guster", say: "A breeze’s face", item: "guster" },
];
// The picker's groups of the patterns a dye alone adds.
const BANNER_GROUPS = [["stripes", "Stripes"], ["halves", "Halves and corners"], ["corners", null], ["shapes", "Shapes and borders"], ["item", "With a banner pattern"]];
// Its place in the art (art/banners/<edition>.png): "base" (the whole cloth) is first.
const BANNER_ROW = Object.fromEntries([["base", 0], ...BANNER_PATTERNS.map((p, i) => [p.k, i + 1])]);
const bannerPattern = k => BANNER_PATTERNS.find(p => p.k === k);

// The banner pattern items. icon: its art; made: its shapeless recipe, with paper (the same in both editions), or from: where it's
// found, with its chance (the same in both editions: the loot tables and trades match). rarity as the game colors its name.
const BANNER_ITEMS = {
  field_masoned: { n: "Field Masoned", made: ["Bricks", "bn:bricks"], rarity: "Common" },
  bordure_indented: { n: "Bordure Indented", made: ["Vines", "bn:vine"], rarity: "Common" },
  flower: { n: "Flower Charge", made: ["Oxeye Daisy", "bn:daisy"], rarity: "Common" },
  creeper: { n: "Creeper Charge", made: ["Creeper Head", "drop:Creeper Head"], rarity: "Uncommon", note: "A creeper drops its head when a charged creeper’s explosion kills it." },
  skull: { n: "Skull Charge", made: ["Wither Skeleton Skull", "drop:Wither Skeleton Skull"], rarity: "Rare", note: "Wither skeletons drop their skull now and then (2.5%, more with Looting)." },
  mojang: { n: "Thing", made: ["Enchanted Golden Apple", "bn:gapple"], rarity: "Rare", note: "The apple can’t be crafted: it’s found in chests (ruined portals, mineshafts, ancient cities and more)." },
  globe: { n: "Globe", from: [["ui:emerald", "Master cartographer", "Master cartographers sell it for 8 emeralds."]], rarity: "Common" },
  piglin: { n: "Snout", from: [["src:chest", "Bastion remnant", "In a bastion remnant’s plain chests (not the treasure room’s, the bridge’s or the stables’).", "10.1%"]], rarity: "Uncommon" },
  flow: { n: "Flow", from: [["src:vault", "Ominous vault", "In trial chambers’ ominous vaults, opened with an ominous trial key.", "15%"]], rarity: "Rare" },
  guster: { n: "Guster", from: [["src:vault", "Vault", "In trial chambers’ vaults, opened with a trial key.", "4.2%"]], rarity: "Rare" },
};

// What the game's ominous banner is: a white banner with these eight layers (Java's raid captains carry it; Bedrock has it as an
// item of its own, drawn from the pack's banner_pattern_illager, which looks the same in the game but not in the pack).
const OMINOUS_LAYERS = [["rhombus", "cyan"], ["stripe_bottom", "light gray"], ["stripe_center", "gray"], ["border", "light gray"],
  ["stripe_middle", "black"], ["half_horizontal", "light gray"], ["circle", "light gray"], ["border", "black"]];

// The most layers a loom adds.
const BANNER_MAX = 6;

// How it's all done, by edition where it differs (both() is gear-data.js's).
const BANNER_FACTS = {
  banner: "Craft one from 6 wool of one color and a stick, as a sign is laid out. Its color is the wool’s, and can’t be changed after. They stack to 16.",
  loom: "Craft a loom from 2 string over 2 planks. It’s a shepherd’s job site block.",
  how: both("Put the banner in the loom, a dye beside it and, for some patterns, a banner pattern. Pick a pattern, then take the banner: the dye is used up, the banner pattern isn’t. Each pattern is a layer over the ones before.",
    "Put the banner in the loom, a dye beside it and, for some patterns, a banner pattern. Pick a pattern, then take the banner: the dye is used up, the banner pattern isn’t. Each pattern is a layer over the ones before. Most patterns can also be added in a crafting table, with the dye laid out in the pattern’s shape; a loom takes only one dye."),
  limit: both("A loom adds up to 6 layers. With commands a banner can have more (16 show), but the tooltip lists only the first 6.",
    "A loom adds up to 6 layers, and that’s the most a banner can have: commands can’t add more."),
  wash: "Use the banner on a cauldron with water in it to wash off its last layer.",
  copy: both("Craft a banner with patterns and a blank banner of the same color to copy it. The one with patterns stays.",
    "Craft a banner with patterns and a blank banner of the same color to copy it; the one with patterns must be left of or above the blank one. It stays."),
  map: both("Use a map on a placed banner to mark it on the map in the banner’s color, with its name if it has one. Use it again to take the mark off.", null),
  ominous: both("Raid captains carry it, and it’s found at pillager outposts. It’s a white banner with 8 layers, more than a loom adds: it can’t be copied until 2 are washed off in a cauldron, and the loom adds no more until 3 are.",
    "Raid captains carry it, and it’s found at pillager outposts. It’s an item of its own: it can’t go in a loom or be copied."),
  place: both("Place it standing (in 16 directions) or on a wall. It doesn’t burn.", "Place it standing (in 16 directions) or on a wall. It doesn’t burn, and it can be under water."),
  buy: "An expert shepherd may sell banners for 3 emeralds; cartographers sell some too.",
};

// A banner on a shield. From the games' files: Java's recipe (shield_decoration: any banner, onto a shield), both editions' shield
// recipes and names ("<Color> Shield", from the banner's color), and their shield pattern textures (Java's entity/shield/, Bedrock's
// entity/shield_patterns/, with an ominous one of its own). From the Minecraft Wiki (Shield): which shields take one, what's kept, washing
// and repairs. How Java's ominous banner goes on is from its recipe and the banner's components (it's a white banner with 8 layers).
const SHIELD_FACTS = {
  shield: "Craft a shield from 6 planks of any wood and an iron ingot: planks, ingot, planks over a row of 3 planks, and one plank under the middle.",
  apply: "Craft the shield with a banner of any color, both anywhere in the grid: the shield takes the banner’s color and patterns, and the banner is used up. The shield keeps its durability and enchantments.",
  only: "Only a shield without patterns takes a banner. Unlike a banner’s, a shield’s patterns can’t be changed or washed off in a cauldron.",
  repair: "An anvil keeps the patterns and the enchantments. Two shields crafted together come out plain; a grindstone keeps the top shield’s patterns.",
  look: "The shield draws the patterns at half a banner’s size, 10 by 20, inside its rim, from pictures of its own: the same shapes, a little coarser.",
  name: "It’s named for the banner’s color: a red banner makes a Red Shield, whatever its patterns.",
  ominous: both("The ominous banner goes on as any white banner does, as its 8 layers: it makes a White Shield.",
    "The ominous banner goes on as a picture of its own, the game’s ominous shield (this is the pack’s, which draws the whole shield)."),
};

