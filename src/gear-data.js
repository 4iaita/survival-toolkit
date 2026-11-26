/* ---------- Equipment facts ----------
 * What the Equipment tab tells about each item besides its anvil plan (ITEMS, ENCH and CONFLICTS are in src/solver.js), from the
 * Minecraft Wiki. A text that differs by edition is { java, bedrock }; a source only one edition has says ed, and one that
 * gives only some materials says mats. Durability is Java's: Bedrock's is one more, except where BEDROCK_USES says.
 */
// A value that differs by edition.
const both = (java, bedrock) => ({ java, bedrock });

// The materials tools and weapons come in, weakest first, and armor's. uses: durability. ench: enchantability.
// speed: how many times faster than by hand it mines. mines: what a pickaxe of it can.
const TOOL_ORDER = ["wooden", "stone", "copper", "iron", "golden", "diamond", "netherite"];
const TOOL_TIERS = {
  wooden: { uses: 59, ench: 15, speed: 2, mines: "Stone, coal, quartz and nether gold" },
  stone: { uses: 131, ench: 5, speed: 4, mines: "Also iron, copper and lapis" },
  copper: { uses: 190, ench: 13, speed: 5, mines: "As stone does: iron, copper and lapis" },
  iron: { uses: 250, ench: 14, speed: 6, mines: "Also gold, diamond, emerald and redstone" },
  golden: { uses: 32, ench: 22, speed: 12, mines: "Only what wood does" },
  diamond: { uses: 1561, ench: 10, speed: 8, mines: "Everything, obsidian and ancient debris too" },
  netherite: { uses: 2031, ench: 15, speed: 9, mines: "Everything, as diamond does" },
};
// Attack damage (2 is a heart) and, in Java, hits a second, in TOOL_ORDER. A single rate is every material's.
const TOOL_HITS = {
  sword: { java: [4, 5, 5, 6, 4, 7, 8], bedrock: [5, 6, 6, 7, 5, 8, 9], rate: 1.6 },
  axe: { java: [7, 9, 9, 9, 7, 9, 10], bedrock: [4, 5, 5, 6, 4, 7, 8], rate: [0.8, 0.8, 0.8, 0.9, 1, 1, 1] },
  spear: { java: [1, 2, 2, 3, 1, 4, 5], bedrock: [2, 3, 3, 4, 2, 5, 6], rate: [1.54, 1.33, 1.18, 1.05, 1.05, 0.95, 0.87] },
  pickaxe: { java: [2, 3, 3, 4, 2, 5, 6], bedrock: [3, 4, 4, 5, 3, 6, 7], rate: 1.2 },
  shovel: { java: [2.5, 3.5, 3.5, 4.5, 2.5, 5.5, 6.5], bedrock: [2, 3, 3, 4, 2, 5, 6], rate: 1 },
  hoe: { java: [1, 1, 1, 1, 1, 1, 1], bedrock: [3, 4, 4, 5, 3, 6, 7], rate: [1, 2, 2, 3, 1, 4, 4] },
};
// A spear's charge: how hard it hits for the speed you come at, in TOOL_ORDER.
const SPEAR_CHARGE = [0.7, 0.82, 0.82, 0.95, 0.7, 1.075, 1.2];

// Armor: points and durability of the four pieces, in ARMOR_PIECES' order.
const ARMOR_PIECES = ["helmet", "chestplate", "leggings", "boots"];
const ARMOR_ORDER = ["leather", "copper", "chainmail", "iron", "golden", "diamond", "netherite"];
const ARMOR_TIERS = {
  leather: { ench: 15, points: [1, 3, 2, 1], uses: [55, 80, 75, 65], tough: 0 },
  copper: { ench: 8, points: [2, 4, 3, 1], uses: [121, 176, 165, 143], tough: 0 },
  chainmail: { ench: 12, points: [2, 5, 4, 1], uses: [165, 240, 225, 195], tough: 0 },
  iron: { ench: 9, points: [2, 6, 5, 2], uses: [165, 240, 225, 195], tough: 0 },
  golden: { ench: 25, points: [2, 5, 3, 1], uses: [77, 112, 105, 91], tough: 0 },
  diamond: { ench: 10, points: [3, 8, 6, 3], uses: [363, 528, 495, 429], tough: 2 },
  netherite: { ench: 15, points: [3, 8, 6, 3], uses: [407, 592, 555, 481], tough: 3 },
};
// The items that come in materials, and the order of theirs.
const GEAR_MATS = {
  ...Object.fromEntries(ARMOR_PIECES.map(k => [k, ARMOR_ORDER])),
  ...Object.fromEntries(Object.keys(TOOL_HITS).map(k => [k, TOOL_ORDER])),
};
// Leather armor has names of its own.
const GEAR_NAMES = { leather_helmet: "Leather Cap", leather_chestplate: "Leather Tunic", leather_leggings: "Leather Pants" };
// n: as a name starts; part: what it's made of and repaired with (GEAR_PARTS); tool, armor: what's special about it.
const MATERIALS = {
  wooden: { n: "Wooden", part: "planks", tool: "The first anyone makes. It burns as fuel, smelting one item." },
  stone: { n: "Stone", part: "stone", tool: "Cobblestone, cobbled deepslate and blackstone all work, mixed or not." },
  leather: { n: "Leather", part: "leather", armor: "Dyes to any color. Any piece keeps you from freezing in powder snow, and the boots let you walk on it." },
  copper: { n: "Copper", part: "copper", tool: "Between stone and iron: longer lasting than stone, and far better at taking enchantments.", armor: "Between leather and iron, and it takes enchantments worst of all armor." },
  chainmail: { n: "Chainmail", part: "iron", armor: "It can’t be crafted, only found or bought. Repaired with iron ingots." },
  iron: { n: "Iron", part: "iron", tool: "The usual choice until you have diamonds to spare.", armor: "The usual armor until you have diamonds to spare." },
  golden: { n: "Golden", part: "golden", tool: "Best at taking enchantments, but wears out soonest.", armor: "Piglins leave you alone while you wear any piece of it. It takes enchantments best, but wears out soon." },
  diamond: { n: "Diamond", part: "diamond", tool: "Lasts six times as long as iron.", armor: "Its toughness keeps it working against strong hits." },
  netherite: { n: "Netherite", part: "netherite", tool: "Diamond, upgraded. As an item it floats on lava and doesn’t burn.", armor: "Diamond, upgraded. Each piece also takes 10% off knockback, and as an item it floats on lava and doesn’t burn." },
};

// Armor trims: a smithing table puts one on any armor but the elytra (the turtle shell too), from a template and a material, in both
// editions. Each template's place, by the games' own loot tables (misode/mcmeta 26.3-data, Mojang's bedrock-samples): the
// chance a chest, mob or block has one. Each is copied with 7 diamonds and copy (what the template's made of), in the order the game lists them.
const TRIMS = {
  sentry: { n: "Sentry", from: "Pillager outposts: chests, 25%", copy: "cobblestone" },
  vex: { n: "Vex", from: "Woodland mansions: chests, 50%", copy: "cobblestone" },
  wild: { n: "Wild", from: "Jungle temples: chests, 33.3%", copy: "mossy cobblestone" },
  coast: { n: "Coast", from: "Shipwrecks: chests, 16.7%", copy: "cobblestone" },
  dune: { n: "Dune", from: "Desert pyramids: chests, 14.3%", copy: "sandstone" },
  wayfinder: { n: "Wayfinder", from: "Trail ruins: suspicious gravel, 8.3%", copy: "terracotta" },
  raiser: { n: "Raiser", from: "Trail ruins: suspicious gravel, 8.3%", copy: "terracotta" },
  shaper: { n: "Shaper", from: "Trail ruins: suspicious gravel, 8.3%", copy: "terracotta" },
  host: { n: "Host", from: "Trail ruins: suspicious gravel, 8.3%", copy: "terracotta" },
  ward: { n: "Ward", from: "Ancient cities: chests, 5%", copy: "cobbled deepslate" },
  silence: { n: "Silence", from: "Ancient cities: chests, 1.3%", copy: "cobbled deepslate" },
  tide: { n: "Tide", from: "Elder guardians, 20%", copy: "prismarine" },
  snout: { n: "Snout", from: "Bastion remnants: chests, 8.3%", copy: "blackstone" },
  rib: { n: "Rib", from: "Nether fortresses: chests, 6.7%", copy: "netherrack" },
  eye: { n: "Eye", from: "Strongholds: every library chest; 10% of altar chests", copy: "end stone" },
  spire: { n: "Spire", from: "End cities: chests, 6.7%", copy: "a purpur block" },
  flow: { n: "Flow", from: both("Trial chambers: ominous vaults, 30%", "Trial chambers: ominous vaults, 22.5%"), copy: "a breeze rod" },
  bolt: { n: "Bolt", from: both("Trial chambers: vaults, 25%", "Trial chambers: vaults, 6.3%"), copy: "a copper block" },
};
// What a trim can be made of (with: the item the smithing table takes), each in its own colors (TRIM_COLORS in src/player-models.js:
// its palette). On armor of the same material it's darker (own: that material).
const TRIM_MATERIALS = {
  quartz: { n: "Quartz", item: "quartz", with: "nether quartz" },
  iron: { n: "Iron", item: "iron_ingot", with: "an iron ingot", own: "iron" },
  netherite: { n: "Netherite", item: "netherite_ingot", with: "a netherite ingot", own: "netherite" },
  redstone: { n: "Redstone", item: "redstone", with: "redstone dust" },
  copper: { n: "Copper", item: "copper_ingot", with: "a copper ingot", own: "copper" },
  gold: { n: "Gold", item: "gold_ingot", with: "a gold ingot", own: "golden" },
  emerald: { n: "Emerald", item: "emerald", with: "an emerald" },
  diamond: { n: "Diamond", item: "diamond", with: "a diamond", own: "diamond" },
  lapis: { n: "Lapis", item: "lapis_lazuli", with: "lapis lazuli" },
  amethyst: { n: "Amethyst", item: "amethyst_shard", with: "an amethyst shard" },
  resin: { n: "Resin", item: "resin_brick", with: "a resin brick" },
};

// The pack's costumes: what leather armor with one of these trims on looks like there (texts/en_US.lang; it doesn’t name the hazmat
// suit, the last). Their templates are TRIMS'.
const COSTUMES = {
  host: { n: "Party Set", trim: "Host" },
  spire: { n: "Cherry Blossom Dress", trim: "Spire" },
  wild: { n: "Elf Attire", trim: "Wild" },
  bolt: { n: "Maid Uniform", trim: "Bolt" },
  tide: { n: "Pirate Outfit", trim: "Tide" },
  shaper: { n: "Rana Puffer Coat", trim: "Shaper" },
  snout: { n: "Santa Getup", trim: "Snout" },
  rib: { n: "Viking Armor", trim: "Rib" },
  eye: { n: "Wildflower Dress", trim: "Eye" },
  silence: { n: "Hazmat Suit", trim: "Silence" },
};

// Items without materials: durability and enchantability (none: the enchanting table won't take it).
const GEAR_USES = {
  turtle_shell: [275, 9], elytra: [432, 0], mace: [500, 15], trident: [250, 1], bow: [384, 1], crossbow: [465, 1], fishing_rod: [64, 1], shears: [238, 0],
  shield: [336, 0], flint_and_steel: [64, 0], brush: [64, 0], carrot_on_a_stick: [25, 0], warped_fungus_on_a_stick: [100, 0],
};
const BEDROCK_USES = { fishing_rod: 385 };

// good: what it's good for. about: what to know. wears: what a use costs. stats: for items without materials, the Overview's two
// boxes before durability and enchantability ([label, value, what it says under it]).
const GEAR_INFO = {
  helmet: {
    good: "The head. Respiration and Aqua Affinity only go on it, so it’s the one for water.",
    about: "It takes part of the hit of a falling anvil, wearing faster for it. Zombies and skeletons that wear one don’t burn in the sun.",
    wears: "1 for every 2 hearts of a hit, at least 1" },
  chestplate: {
    good: "The body: the most armor of the four pieces.",
    about: "Elytra go in the same place, so it’s one or the other. Thorns comes from the enchanting table only on this piece in Java; in Bedrock on all four.",
    wears: "1 for every 2 hearts of a hit, at least 1" },
  leggings: {
    good: "The legs: the second most armor. Swift Sneak only goes on these, for sneaking about an ancient city.",
    about: "The whole set counts: each armor point takes 4% off a hit, less off a strong one unless the armor is tough.",
    wears: "1 for every 2 hearts of a hit, at least 1" },
  boots: {
    good: "The feet. Feather Falling, Depth Strider, Frost Walker and Soul Speed only go on these.",
    about: "Soul Speed wears them as you walk on soul sand. Depth Strider and Frost Walker can’t be together.",
    wears: "1 for every 2 hearts of a hit, at least 1" },
  turtle_shell: {
    good: "Diving. Enchant it as any helmet.",
    about: "The extra air starts when your head goes under, and is there again once you’re up. It’s also what brews a Potion of the Turtle Master.",
    wears: "1 for every 2 hearts of a hit, at least 1",
    stats: [["Armor", "2", "As much as an iron helmet"], ["Extra air", "10 s", "Each time you dive"]] },
  elytra: {
    good: "Gliding, and flying with firework rockets.",
    about: "Jump in the air to open it. A rocket pushes you to over 33 blocks a second. Flying into a wall hurts. It can’t be enchanted at the table, only with books.",
    wears: "1 a second while gliding; rockets cost it nothing. At 1 left it stops working but doesn’t break",
    stats: [["Armor", "0", "Worn instead of a chestplate"], ["Glides for", "7:12", "Minutes, before it needs repair"]] },
  sword: {
    good: { java: "Fighting several mobs at once: a full swing on the ground sweeps everyone beside the target.", bedrock: "Fighting. With no cooldown in Bedrock, it hits as fast as you can click." },
    about: "Cuts cobwebs fifty times as fast as by hand, and bamboo at once. Looting only goes on swords and spears.",
    wears: "1 for each hit, 2 for each block" },
  axe: {
    good: { java: "Chopping wood, and the hardest single hit of the everyday weapons.", bedrock: "Chopping wood, and a fair weapon." },
    about: "Strips bark, and scrapes wax and rust off copper. Hitting a raised shield puts it out of use for 5 seconds.",
    wears: "2 for each hit, 1 for each block, stripped log or scraped copper" },
  mace: {
    good: "Dropping onto something from high up.",
    about: { java: "A smash is a hit after falling 1½ blocks or more: 4 more damage for each of the first 3 blocks, 2 for each of the next 5, then 1. It takes away your fall damage, throws back what’s around, and doesn’t work with Slow Falling or while gliding.",
      bedrock: "A smash is a hit after falling 1½ blocks or more: 4 more damage for each of the first 3 blocks, 2 for each of the next 5, then 1. It takes away your fall damage, throws back what’s around, and doesn’t work with Slow Falling." },
    wears: "1 for each hit",
    stats: [["Attack damage", "6", "3 hearts, before a smash"], ["Attack speed", { java: "0.6", bedrock: "Any" }, { java: "Hits a second", bedrock: "No cooldown" }]] },
  spear: {
    good: "Keeping a distance, and charging on horseback: it reaches 4½ blocks and goes through everyone in line.",
    about: "A jab is quick and weak. Hold it out to charge: the faster you and the target come together, the harder it hits. It can’t reach what’s closer than 2 blocks.",
    wears: "1 for each hit; 1 for a lunge" },
  trident: {
    good: "Fighting in water, up close or thrown.",
    about: { java: "Water doesn’t slow a thrown one. Without Loyalty it has to be fetched, and it’s gone after a minute. A drowned’s thrown trident can’t be picked up.",
      bedrock: "Water doesn’t slow a thrown one. Without Loyalty it has to be fetched. A drowned’s thrown trident can’t be picked up." },
    wears: "1 for each hit or throw",
    stats: [["Attack damage", "9", "4½ hearts; 8 thrown"], ["Attack speed", { java: "1.1", bedrock: "Any" }, { java: "Hits a second", bedrock: "No cooldown" }]] },
  bow: {
    good: "Fighting from afar. Infinity makes one arrow last.",
    about: "A fully drawn arrow can hit critically, for up to 11. Infinity and Mending can’t be together.",
    wears: "1 for each shot",
    stats: [["Damage", "6–11", "3 to 5½ hearts, fully drawn"], ["Draws in", "1 s", "Fully"]] },
  crossbow: {
    good: "A loaded shot kept ready, and firework rockets as ammunition.",
    about: "It keeps its arrow loaded as long as you like. Rockets go in the off hand, and do more damage with more stars. Piercing arrows go through shields.",
    wears: "1 for each arrow, 3 for a rocket; Multishot costs three times that",
    stats: [["Damage", { java: "7–11", bedrock: "9" }, { java: "3½ to 5½ hearts", bedrock: "4½ hearts" }], ["Loads in", "1.25 s", "0.5 s with Quick Charge III"]] },
  pickaxe: {
    good: "Stone, ores and metal blocks.",
    about: "What it can mine goes by its material: see Materials. Fortune gets more from ores, Silk Touch the ore itself.",
    wears: "1 for each block, 2 for each hit" },
  shovel: {
    good: "Dirt, sand, gravel, clay and snow.",
    about: "Use it on grass or dirt to make a path, or on a campfire to put it out.",
    wears: "1 for each block, path or campfire, 2 for each hit" },
  hoe: {
    good: "Farmland, and clearing leaves, hay, moss, sculk and wart blocks.",
    about: { java: "Its material doesn’t change how it tills or how hard it hits, only how fast it clears leaves and the like, and how long it lasts.", bedrock: "Its material doesn’t change how it tills, only how fast it clears leaves and the like, how hard it hits and how long it lasts." },
    wears: both("1 for each block or tilled dirt, 2 for each hit", "1 for each block or tilled dirt") },
  fishing_rod: {
    good: "Fish, and enchanted books and bows as treasure.",
    about: "Treasure comes only from open water. It also pulls mobs, and carrots or warped fungus on it make the sticks that steer pigs and striders.",
    wears: "1 for a catch, 3 for an item, 5 for a mob",
    stats: [["A bite takes", "5–30 s", "Lure: 5 s less a level"], ["Treasure", "5%", "Up to 11.3% with Luck of the Sea"]] },
  shears: {
    good: "Wool, leaves, vines, honeycomb and mushrooms from mooshrooms.",
    about: { java: "Cuts cobwebs, leaves and wool fast, and takes plants whole. It also takes gear off mobs, and carves a pumpkin.", bedrock: "Cuts cobwebs, leaves and wool fast, and takes plants whole. It also takes gear off mobs, and carves a pumpkin. In Bedrock it can have Silk Touch." },
    wears: "1 for each block cut or mob sheared",
    stats: [["Wool", "0.25 s", "1.2 s by hand"], ["Leaves", "0.05 s", "0.35 s by hand"]] },
  shield: {
    good: "Blocking hits, arrows and blasts from the front.",
    about: { java: "Works a quarter of a second after you raise it. An axe hit puts it out of use for 5 seconds, and Piercing arrows go through. Add a banner’s pattern by crafting the two together.",
      bedrock: "Works a quarter of a second after you raise it. An axe hit puts it out of use for 5 seconds, and Piercing arrows go through." },
    wears: "1 more than the damage it blocks, if that’s 1½ hearts or more",
    stats: [["Blocks", "Front", "Nothing from behind"], ["Out of use", "5 s", "After an axe hit"]] },
  flint_and_steel: {
    good: "Fire, nether portals and TNT.",
    about: "Also lights campfires and candles, and makes a creeper blow up at once.",
    wears: "1 for each use",
    stats: [["Lights", "Nether portals", "And fire on almost anything"], ["Sets off", "TNT, creepers", "At once"]] },
  brush: {
    good: "Pottery sherds and other finds in suspicious sand and gravel.",
    about: { java: "Brushing an armadillo gives a scute, at 16 durability: 4 scutes for a new brush. Stop brushing and the block slowly covers up again.", bedrock: "Brushing an armadillo gives a scute, at 16 durability: 4 scutes for a new brush, 5 if you use up the last. Stop brushing and the block slowly covers up again." },
    wears: "1 for each suspicious block, 16 for an armadillo",
    stats: [["One block takes", "4.8 s", "Of suspicious sand or gravel"], ["Armadillo", "1 scute", "For 16 durability"]] },
  carrot_on_a_stick: {
    good: "Steering a saddled pig, and speeding it up.",
    about: "Only the burst of speed wears it, not the ride. Used up, it turns back into a fishing rod. Pigs follow you while you hold it.",
    wears: { java: "7 for each burst of speed", bedrock: "2 for each burst of speed" },
    stats: [["Steers", "Pigs", "With a saddle on"], ["Burst", "×2.15", "Of the pig’s speed, at its peak"]] },
  warped_fungus_on_a_stick: {
    good: "Steering a saddled strider across lava, and speeding it up.",
    about: "Only the burst of speed wears it, not the ride. Used up, it turns back into a fishing rod. Striders follow you while you hold it.",
    wears: "1 for each burst of speed",
    stats: [["Steers", "Striders", "With a saddle on"], ["Burst", "7–49 s", "Of extra speed"]] },
};

// What gear is made and repaired with: its icon, name and where it comes from.
const GEAR_PARTS = {
  planks: { icon: C("oak_planks"), n: "Any Planks", from: "4 from each log" },
  stone: { icon: C("cobblestone"), n: "Cobblestone", from: "Or cobbled deepslate or blackstone" },
  leather: { icon: L("leather"), n: "Leather", from: "Cows, horses, llamas, hoglins and their kin; or 4 rabbit hides" },
  copper: { icon: L("copper_ingot"), n: "Copper Ingot", from: "Smelt raw copper" },
  iron: { icon: L("iron_ingot"), n: "Iron Ingot", from: "Smelt raw iron; iron golems; chests" },
  golden: { icon: L("gold_ingot"), n: "Gold Ingot", from: "Smelt raw gold; 9 gold nuggets; chests" },
  diamond: { icon: L("diamond"), n: "Diamond", from: "Diamond ore, most of it deep down; chests" },
  netherite: { icon: L("netherite_ingot"), n: "Netherite Ingot", from: "4 netherite scraps (smelt ancient debris) and 4 gold ingots" },
  template: { icon: L("netherite_upgrade"), n: "Netherite Upgrade", from: "Bastion remnant chests, every one in a treasure room. Copy it with 7 diamonds and netherrack" },
  stick: { icon: L("stick"), n: "Stick", from: "4 from 2 planks" },
  string: { icon: L("string"), n: "String", from: "Spiders, cobwebs, piglins and cats’ gifts" },
  feather: { icon: L("feather"), n: "Feather", from: "Chickens and parrots" },
  flint: { icon: L("flint"), n: "Flint", from: "Gravel, 1 in 10 (more with Fortune)" },
  hook: { icon: L("tripwire_hook"), n: "Tripwire Hook", from: "2 from an iron ingot, a stick and a plank" },
  core: { icon: { boxes: [{ b: [4, 0, 4, 12, 8, 12], faces: [["heavy_core", -4], ["heavy_core", -4, -4], ["heavy_core", -4]] }], zoom: 1.6, shift: 4 }, n: "Heavy Core", from: "Ominous vaults in trial chambers, 7.5%" },
  breeze_rod: { icon: L("breeze_rod"), n: "Breeze Rod", from: "Breezes, in trial chambers" },
  scute: { icon: L("scute"), n: "Turtle Scute", from: "A baby turtle drops one when it grows up" },
  membrane: { icon: L("phantom_membrane"), n: "Phantom Membrane", from: "Phantoms, after three nights without sleep" },
  rod: { icon: L("fishing_rod"), n: "Fishing Rod", from: "A worn one will do; its enchantments are lost" },
  carrot: { icon: L("carrot"), n: "Carrot", from: "Village farms, zombies and chests" },
  fungus: { icon: L("warped_fungus_carried"), n: "Warped Fungus", from: "Warped forests" },
};
// Recipes, rows of a crafting grid; m is the material. loose: the places don't matter.
const GEAR_RECIPES = {
  helmet: { rows: ["mmm", "m m"] }, chestplate: { rows: ["m m", "mmm", "mmm"] }, leggings: { rows: ["mmm", "m m", "m m"] }, boots: { rows: ["m m", "m m"] },
  turtle_shell: { rows: ["sss", "s s"], key: { s: "scute" } },
  sword: { rows: [" m ", " m ", " / "] }, axe: { rows: ["mm ", "m/ ", " / "] }, pickaxe: { rows: ["mmm", " / ", " / "] },
  shovel: { rows: [" m ", " / ", " / "] }, hoe: { rows: ["mm ", " / ", " / "] }, spear: { rows: ["  m", " / ", "/  "] },
  mace: { rows: [" c ", " b "], key: { c: "core", b: "breeze_rod" } },
  bow: { rows: [" /t", "/ t", " /t"], key: { t: "string" } },
  crossbow: { rows: ["/i/", "tht", " / "], key: { i: "iron", t: "string", h: "hook" } },
  fishing_rod: { rows: ["  /", " /t", "/ t"], key: { t: "string" } },
  shears: { rows: [" i", "i "], key: { i: "iron" } },
  shield: { rows: ["pip", "ppp", " p "], key: { p: "planks", i: "iron" } },
  flint_and_steel: { rows: ["if"], key: { i: "iron", f: "flint" }, loose: true },
  brush: { rows: [" f ", " o ", " / "], key: { f: "feather", o: "copper" } },
  carrot_on_a_stick: { rows: ["r ", " a"], key: { r: "rod", a: "carrot" } },
  warped_fungus_on_a_stick: { rows: ["r ", " w"], key: { r: "rod", w: "fungus" } },
};
const NO_RECIPE = {
  trident: "A trident can’t be crafted: it comes from drowned and trial chambers.",
  elytra: "Elytra can’t be crafted: each end ship has one.",
  chainmail: "Chainmail can’t be crafted: it comes from villagers, mobs and chests.",
};
// What mends an item without materials on an anvil; those not here have nothing but another of their kind.
const GEAR_MENDS = { turtle_shell: "scute", elytra: "membrane", mace: "breeze_rod", shield: "planks" };

// Where it's found ready-made. Villagers' and the wandering trader's sales are added from their trades.
const chest = (n, what, chance, more) => ({ icon: "src:chest", n, what, chance, ...more });
// What several things have: iron gear a Bedrock raid's mobs drop, and the gear in trial chambers' vaults.
const RAID_GEAR = { icon: "src:pillager", n: "Raids", what: "Pillagers and vindicators, worn, half of them enchanted", chance: "4.2%", mats: ["iron"], ed: "bedrock" };
const VAULT_GEAR = [
  { icon: "src:vault", n: "Trial chambers", what: "Vaults, enchanted", chance: both("7%", "1.7%"), mats: ["iron"] },
  { icon: "src:vault", n: "Trial chambers", what: both("Ominous vaults, enchanted; 3.5% in plain ones", "Ominous vaults, enchanted; 0.9% in plain ones"), chance: "8.3%", mats: ["diamond"] },
];
const ARMOR_FOUND = k => [
  chest("Village", "Tannery chests", "31.8%", { mats: ["leather"] }),
  chest("Shipwreck", "Supply chests, enchanted", "20.8%", { mats: ["leather"] }),
  ...(k === "chestplate" ? [
    chest("Buried treasure", "Chests", "16.7%", { mats: ["leather"] }),
    chest("Ocean ruins", "Small ruins’ chests; 4.3% in big ones", "8.3%", { mats: ["leather"] }),
    chest("Abandoned camp", "Common chests", "19%", { mats: ["copper"] }),
    chest("Woodland mansion", "Chests", both("17.6%", "17.3%"), { mats: ["chainmail"] }),
    ...VAULT_GEAR,
    chest("Nether fortress", "Chests", "17.9%", { mats: ["golden"] }),
    chest("Woodland mansion", "Chests", both("9.1%", "8.9%"), { mats: ["diamond"] }),
  ] : []),
  ...(k === "helmet" ? [
    chest("Village", "Armorer’s chests", "31.8%", { mats: ["iron"] }),
    chest("Ocean ruins", "Small ruins’ chests; 4.3% in big ones", "8.3%", { mats: ["golden"] }),
  ] : []),
  ...(k === "leggings" || k === "boots" ? [
    chest("Abandoned camp", "Common chests", "19%", { mats: ["copper"] }),
    chest("Abandoned camp", "Secret chests", "12.5%", { mats: ["iron"] }),
  ] : []),
  ...(k === "leggings" ? [
    chest("Ancient city", "Chests, enchanted", "23.7%", { mats: ["iron"] }),
    chest("Ancient city", "Chests, enchanted", "16.5%", { mats: ["diamond"] }),
  ] : []),
  ...(k === "boots" ? [{ icon: "src:rod", n: "Fishing", what: "Junk, badly worn", chance: both("0.9%", "1%"), mats: ["leather"] },
    { icon: "src:piglin", n: "Piglin bartering", what: "With Soul Speed, any level", chance: "1.7%", mats: ["iron"] }] : []),
  chest("Village", "Weaponsmith’s chests", "22.9%", { mats: ["iron"] }),
  chest("Stronghold", "Altar chests", both("11.9%", "11.5%"), { mats: ["iron"] }),
  ...(k === "helmet" || k === "chestplate" ? [{ icon: "src:chest", n: "Taiga village", what: "On the armor stands of its armory", mats: ["iron"], ed: "java" }] : []),
  RAID_GEAR,
  chest("Bastion remnant", k === "boots" ? "Most chests, and as likely again with Soul Speed" : "Most chests", both("9.8%", "10.2%"), { mats: ["golden"] }),
  chest("Bastion remnant", "Bridge chests, enchanted", "11.2%", { mats: ["golden"] }),
  chest("Ruined portal", "Chests, enchanted", "20.5%", { mats: ["golden"] }),
  chest("Bastion remnant", "Treasure chests", both("12.8%", "14%"), { mats: ["diamond"] }),
  chest("Bastion remnant", "Treasure chests, worn and enchanted", both("15.2%", "16.6%"), { mats: ["diamond"] }),
  chest("End city", "Chests, enchanted", "12.7%", { mats: ["iron", "diamond"] }),
  { icon: "src:piglin", n: "Piglins", what: "If one wears it, usually badly worn", chance: "8.5%", mats: ["golden"] },
  { icon: "src:zombie", n: "Zombies, skeletons and their kin", what: "If one wears it, usually badly worn", chance: "8.5%", mats: ["leather", "copper", "chainmail", "iron", "golden", "diamond"] },
];
const GEAR_FOUND = {
  ...Object.fromEntries(ARMOR_PIECES.map(k => [k, ARMOR_FOUND(k)])),
  sword: [
    chest("Abandoned camp", "Common chests", "19%", { mats: ["copper"] }),
    chest("Village", "Weaponsmith’s chests", "22.9%", { mats: ["iron"] }),
    chest("Buried treasure", "Chests", "16.7%", { mats: ["iron"] }),
    chest("Stronghold", "Altar chests", both("11.9%", "11.5%"), { mats: ["iron"] }),
    chest("Bastion remnant", "Most chests, worn and enchanted", both("19%", "53.2%"), { mats: ["iron"] }),
    chest("Nether fortress", "Chests", "17.9%", { mats: ["golden"] }),
    chest("Ruined portal", "Chests, enchanted", "20.5%", { mats: ["golden"] }),
    chest("Bastion remnant", both("Bridge chests; 9.8% in most others", "Bridge chests; 10.2% in most others"), "11.2%", { mats: ["golden"] }),
    chest("Bastion remnant", "Treasure chests", both("15.2%", "16.6%"), { mats: ["diamond"] }),
    chest("Bastion remnant", "Treasure chests, worn and enchanted", both("15.2%", "16.6%"), { mats: ["diamond"] }),
    chest("End city", "Chests, enchanted", "12.7%", { mats: ["iron", "diamond"] }),
    { icon: "src:wither_skeleton", n: "Wither skeletons", what: "They all hold one", chance: "8.5%", mats: ["stone"] },
    { icon: "src:zombified_piglin", n: "Piglins and zombified piglins", what: "If it holds one", chance: "8.5%", mats: ["golden"] },
    { icon: "src:zombie", n: "Zombies and husks", what: "If it holds one", chance: "8.5%", mats: ["iron"] },
    RAID_GEAR,
  ],
  axe: [
    chest("Bonus chest", "If the world has one", "75%", { mats: ["wooden"] }),
    chest("Trial chambers", "Entrance chests", "55.1%", { mats: ["wooden"] }),
    chest("Abandoned camp", "Barrels", "33.3%", { mats: ["wooden"] }),
    chest("Ocean ruins", "Small ruins’ chests", "28.5%", { mats: ["stone"] }),
    chest("Bonus chest", "If the world has one", "25%", { mats: ["stone"] }),
    chest("Trial chambers", "Corridor chests, worn", "19.6%", { mats: ["stone"] }),
    chest("Igloo", "Chests", "14.7%", { mats: ["stone"] }),
    chest("Abandoned camp", "Common chests", "19%", { mats: ["copper"] }),
    chest("Abandoned camp", "Secret chests", "12.5%", { mats: ["iron"] }),
    chest("Trial chambers", "Corridor chests, worn and enchanted", "10.2%", { mats: ["iron"] }),
    ...VAULT_GEAR,
    { icon: "src:chest", n: "Ocean ruins", what: "Brushed out of suspicious sand or gravel", chance: "6.7%", mats: ["iron"] },
    chest("Bastion remnant", "Hoglin stable chests, enchanted", "22.8%", { mats: ["golden"] }),
    chest("Trial chambers", "Intersection barrels, worn", "22.3%", { mats: ["golden"] }),
    chest("Ruined portal", "Chests, enchanted", "20.5%", { mats: ["golden"] }),
    chest("Bastion remnant", both("Bridge chests, enchanted; 9.8% in most others", "Bridge chests, enchanted; 10.2% in most others"), "11.2%", { mats: ["golden"] }),
    chest("Trial chambers", "Intersection chests, worn", "11.2%", { mats: ["diamond"] }),
    chest("Trial chambers", "Intersection barrels, worn and enchanted", "5.9%", { mats: ["diamond"] }),
    { icon: "src:vindicator", n: "Vindicators", what: "They all hold one", chance: "8.5%", mats: ["iron"] },
    { icon: "src:piglin_brute", n: "Piglin brutes", what: "They all hold one", chance: "8.5%", mats: ["golden"] },
    RAID_GEAR,
  ],
  spear: [
    chest("Ocean ruins", "Small ruins’ chests; 26.3% in big ones", "28.5%", { mats: ["stone"] }),
    chest("Village", "Weaponsmith’s chests", "30.6%", { mats: ["copper"] }),
    chest("Abandoned camp", "Common chests", "19%", { mats: ["copper"] }),
    chest("Village", "Weaponsmith’s chests", "22.9%", { mats: ["iron"] }),
    chest("Buried treasure", "Chests", "16.7%", { mats: ["iron"] }),
    chest("Abandoned camp", "Secret chests", "12.5%", { mats: ["iron"] }),
    chest("Bastion remnant", "Treasure chests", both("15.2%", "16.6%"), { mats: ["diamond"] }),
    chest("Bastion remnant", "Treasure chests, worn and enchanted", both("15.2%", "16.6%"), { mats: ["diamond"] }),
    chest("End city", "Chests, enchanted", "12.7%", { mats: ["diamond"] }),
    { icon: "src:zombie", n: "Zombies, husks and riders", what: "If it holds one", chance: "8.5%", mats: ["iron"] },
    { icon: "src:piglin", n: "Piglins and zombified piglins", what: "If it holds one", chance: "8.5%", mats: ["golden"] },
  ],
  pickaxe: [
    chest("Bonus chest", "If the world has one", "75%", { mats: ["wooden"] }),
    chest("Trial chambers", "Supply chests, worn; 19.6% in corridors", "37.3%", { mats: ["stone"] }),
    chest("Bonus chest", "If the world has one", "25%", { mats: ["stone"] }),
    chest("Village", "Toolsmith’s chests", "41.2%", { mats: ["iron"] }),
    chest("Village", "Weaponsmith’s chests", "22.9%", { mats: ["iron"] }),
    chest("Stronghold", "Altar chests", both("11.9%", "11.5%"), { mats: ["iron"] }),
    chest("Mineshaft", "Chest minecarts", "7%", { mats: ["iron"] }),
    chest("Stronghold", "Storeroom chests", both("4%", "3.2%"), { mats: ["iron"] }),
    chest("Trial chambers", "Intersection barrels, worn", "22.3%", { mats: ["golden"] }),
    chest("Ruined portal", "Chests, enchanted", "20.5%", { mats: ["golden"] }),
    chest("Bastion remnant", "Hoglin stable chests, worn and enchanted", both("12%", "13.6%"), { mats: ["diamond"] }),
    chest("Trial chambers", "Intersection chests, worn; 5.9% in barrels", "11.2%", { mats: ["diamond"] }),
    chest("Bastion remnant", "Most chests, enchanted", "6.7%", { mats: ["diamond"] }),
    chest("End city", "Chests, enchanted", "12.7%", { mats: ["iron", "diamond"] }),
    RAID_GEAR,
  ],
  shovel: [
    chest("Village", "Toolsmith’s chests", "41.2%", { mats: ["iron"] }),
    chest("Ruined portal", "Chests, enchanted", "20.5%", { mats: ["golden"] }),
    chest("Bastion remnant", "Hoglin stable chests, worn and enchanted", both("15%", "17%"), { mats: ["diamond"] }),
    chest("Bastion remnant", "Most chests", "6.7%", { mats: ["diamond"] }),
    chest("End city", "Chests, enchanted", "12.7%", { mats: ["iron", "diamond"] }),
    { icon: "src:chest", n: "Ancient city", what: "In the furnace at its center", mats: ["wooden"] },
    { icon: "src:zombie", n: "Zombies and husks", what: "If it holds one", chance: "8.5%", mats: ["iron"] },
    RAID_GEAR,
  ],
  hoe: [
    { icon: "src:chest", n: "Ocean ruins", what: "Brushed out of suspicious sand or gravel", chance: "13.3%", mats: ["wooden"] },
    { icon: "src:chest", n: "Trail ruins", what: "Brushed out of suspicious gravel", chance: "4.4%", mats: ["wooden"] },
    chest("Ruined portal", "Chests, enchanted", "20.5%", { mats: ["golden"] }),
    chest("Woodland mansion", "Chests", both("25.5%", "25.1%"), { mats: ["diamond"] }),
    chest("Ancient city", "Chests, worn and enchanted", "16.5%", { mats: ["diamond"] }),
  ],
  elytra: [{ icon: "src:end", n: "End ship", what: "In an item frame in the treasure room, with a shulker on guard", chance: "Always" }],
  trident: [
    { icon: "src:drowned", n: "Drowned", what: { java: "If it holds one, as 1 in 16 do; 1% more a level of Looting", bedrock: "If it holds one; 1% more a level of Looting" }, chance: both("8.5%", "25%") },
    { icon: "src:vault", n: "Trial chambers", what: "Vaults", chance: "2.1%" },
  ],
  bow: [
    chest("Abandoned camp", "Common chests", "19%"),
    { icon: "src:vault", n: "Trial chambers", what: "Vaults, enchanted", chance: both("10.4%", "2.6%") },
    { icon: "src:skeleton", n: "Skeletons, strays, bogged and parched", what: "Badly worn, sometimes enchanted", chance: "8.5%" },
    { icon: "src:rod", n: "Fishing", what: "Treasure, worn and enchanted", chance: "0.8%" },
  ],
  crossbow: [
    chest("Pillager outpost", "Chests", "50%"),
    { icon: "src:vault", n: "Trial chambers", what: "Vaults, enchanted; 11% in ominous ones", chance: both("7%", "1.7%") },
    chest("Bastion remnant", "Bridge chests, worn and enchanted", "11.2%"),
    chest("Bastion remnant", "Most chests; 6.7% for a worn, enchanted one", both("9.8%", "10.2%")),
    { icon: "src:pillager", n: "Pillagers", what: "Badly worn, rarely enchanted", chance: "8.5%" },
    { icon: "src:piglin", n: "Piglins", what: "If it holds one", chance: "8.5%" },
  ],
  shield: [{ icon: "src:vault", n: "Trial chambers", what: "Vaults, worn", chance: both("10.4%", "2.6%") }],
  fishing_rod: [
    chest("Ocean ruins", "Small ruins’ chests, enchanted; 21.7% in big ones", "41.7%"),
    chest("Abandoned camp", "Barrels; 27.5% in common chests", "33.3%"),
    { icon: "src:drowned", n: "Drowned", what: "If it holds one, worn", chance: both("8.5%", "25%") },
    { icon: "src:rod", n: "Fishing", what: "Treasure, worn and enchanted; 0.2% as junk", chance: "0.8%" },
  ],
  shears: [chest("Abandoned camp", "Common chests", "19%"), chest("Village", "Shepherd’s chests", "12.3%")],
  flint_and_steel: [chest("Ruined portal", "Chests", "46.4%"), chest("Abandoned camp", "Common chests", "27.5%"), chest("Nether fortress", "Chests", "17.9%")],
  warped_fungus_on_a_stick: [{ icon: "src:zombified_piglin", n: "Zombified piglins", what: "The ones riding a strider", chance: both("8.5%", "25%") }],
};

/* Enchantments */
// Never from the enchanting table, with where they do come from.
const TREASURE = {
  frost_walker: "Librarians, fishing and chests", mending: "Librarians, fishing and chests",
  binding_curse: "Librarians, fishing and chests", vanishing_curse: "Librarians, fishing and chests",
  soul_speed: "Piglin bartering and bastion remnant chests", swift_sneak: "Ancient city chests", wind_burst: "Ominous vaults in trial chambers",
};
// Items the enchanting table doesn't take, and what Java's table doesn't give an item though a book can (Bedrock's gives these).
const NO_TABLE = new Set(Object.keys(GEAR_USES).filter(k => !GEAR_USES[k][1]));
const BOOK_ONLY_JAVA = {
  axe: ["sharpness", "smite", "bane_of_arthropods"], mace: ["smite", "bane_of_arthropods", "fire_aspect"],
  helmet: ["thorns"], leggings: ["thorns"], boots: ["thorns"], turtle_shell: ["thorns"],
};
const enchantFrom = (item, key, edition) => (TREASURE[key] ? "treasure"
  : NO_TABLE.has(item) || (edition === "java" && (BOOK_ONLY_JAVA[item] || []).includes(key)) ? "book" : "table");
// What each does.
const ENCH_DOES = {
  protection: "Takes 4% a level off almost any hit: 16% at IV, and up to 64% with all four pieces",
  fire_protection: "Takes 8% a level off fire and lava damage, and you burn for less time",
  blast_protection: "Takes 8% a level off explosions, and their push",
  projectile_protection: "Takes 8% a level off arrows, tridents and fireballs",
  feather_falling: "Takes 12% a level off fall damage: 48% at IV",
  respiration: "Air lasts about 16 seconds longer a level: over a minute at III",
  aqua_affinity: "Mine underwater as fast as on land",
  thorns: "15% chance a level to hurt whoever hits you, by ½ to 2½ hearts. Wears the armor faster",
  depth_strider: "Walk underwater faster: at III as fast as on land",
  frost_walker: "Freezes water as you walk, 3 blocks round you at I and 4 at II. Magma blocks and campfires don’t hurt",
  soul_speed: "Walk 41%, 51% or 62% faster on soul sand and soul soil, wearing the boots a little",
  swift_sneak: "Sneak at 45%, 60% or 75% of your walking speed, instead of 30%",
  sharpness: { java: "½ heart more at I and ¼ more each level after: 1½ at V", bedrock: "½ heart more at I, up to 3 hearts at V" },
  smite: { java: "1¼ hearts more a level on undead mobs: 6¼ at V", bedrock: "1 heart more at I on undead mobs, up to 6 at V" },
  bane_of_arthropods: { java: "1¼ hearts more a level on spiders, bees, silverfish and endermites: 6¼ at V. Slows them too", bedrock: "1 heart more at I on spiders, bees, silverfish and endermites, up to 6 at V. Slows them too" },
  knockback: "Pushes what you hit farther back",
  fire_aspect: "Sets what you hit on fire, for twice as long at II. Their meat drops cooked",
  looting: "Up to 1 more of each common drop a level, and rare drops 1% likelier",
  sweeping_edge: "A sweep does 50%, 67% or 75% of the sword’s damage to everyone it catches",
  lunge: "A jab throws you forward, farther each level, for 1 to 3 hunger points",
  density: "A smash does ¼ heart more a level for each block you fell",
  breach: "The target’s armor counts 15% less a level: 60% at IV",
  wind_burst: "A smash throws you back up, about 8 blocks a level",
  efficiency: "Mines faster: a little at I, by far more at V",
  fortune: "More from ores and some plants: about 2.2 times as much ore at III",
  silk_touch: "Blocks drop themselves: ore, stone, glass, ice, bookshelves",
  power: "Arrows hit 50% harder at I and 25% more each level after: 150% at V",
  punch: "Arrows push farther back",
  flame: "Arrows set fire to what they hit, campfires and TNT too",
  infinity: "Plain arrows aren’t used up: keep one. Tipped and spectral ones are",
  multishot: "Shoots three at once for the price of one",
  piercing: "Arrows go through 1 more mob a level and past shields, and can be picked up again",
  quick_charge: "Loads ¼ second faster a level: half a second at III",
  impaling: { java: "1¼ hearts more a level on water animals: 6¼ at V. Drowned don’t count", bedrock: "1 heart more at I on anything in water or rain, up to 6 at V" },
  loyalty: "A thrown trident comes back, sooner each level",
  riptide: "In water or rain a throw takes you along: 9, 15 or 21 blocks. It can’t be thrown otherwise",
  channeling: "In a thunderstorm, a thrown hit calls lightning down on a mob under the open sky",
  luck_of_the_sea: "Treasure 7%, 9% or 11% of the time, instead of 5%",
  lure: "Fish bite 5 seconds sooner a level",
  unbreaking: "Often doesn’t wear: 50%, 67% or 75% of the time, and for armor 20%, 27% or 30%",
  mending: "Experience you pick up repairs it instead, 2 durability a point",
  binding_curse: "Once on, it can’t be taken off until it breaks or you die",
  vanishing_curse: "It’s gone if you die with it",
};

// How much the repairs give back, in shares of the full durability.
const MEND_UNIT = 0.25, MEND_SAME = 0.12, MEND_GRID = 0.05;
