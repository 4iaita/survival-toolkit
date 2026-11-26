/* ---------- Structures tab: what's in each dimension ----------
 * Loot comes from src/structure-loot.js (tools/structure-loot.py works it out from Java 26.3's and Bedrock 1.26.60's loot tables);
 * which containers a structure has, and in which rooms, from Java's structure pieces (misode/mcmeta 26.3-data: structure/*.nbt, walked from
 * each structure's start pool through its template pools); where it generates from Java's worldgen (structure, structure_set and the
 * has_structure biome tags); its mobs from Java's trial_spawner and structure spawn_overrides; trades from Java's villager_trade and
 * Bedrock's trading files. What neither edition's files say is from the Minecraft Wiki.
 */

const STRUCTURE_DIMS = [
  { k: "overworld", n: "Overworld", icon: "ui:grass" },
  { k: "nether", n: "The Nether", icon: "st:netherrack" },
  { k: "end", n: "The End", icon: "st:end_stone" },
];

// Which background each dimension and structure (or kind of one) stands on: a scene of the Mobs tab's (BACKDROPS in
// src/backdrop.js). plug(...) marks one that hasn't a scene of its own yet and borrows another; giving it its own scene is
// adding that scene to BACKDROPS and changing its line here to the scene's name.
const plug = biome => ({ biome, plug: true });
const STRUCTURE_SCENES = {
  overworld: "plains", nether: "nether", end: "end_island",
  trial_chambers: "trial_chamber",
};
const sceneOf = k => { const s = STRUCTURE_SCENES[k]; return s ? (typeof s === "string" ? s : s.biome) : null; };

// The containers' blocks, as icons.
const ST_BLOCKS = {
  chest: "ui:logo", barrel: "st:barrel", vault: "st:vault", ominous_vault: "st:vault", dispenser: "st:dispenser", pot: "ui:pot",
  spawner: "st:trial_spawner", ominous_spawner: "st:trial_spawner",
};

/* Each structure: its containers (loot), its mobs, and where it is.
 *   loot: { k, n, block, where, table } or pick: [[table, weight], ...] when one of several tables is rolled (a spawner's key or
 *     its food); table can be { java, bedrock } where the editions' paths differ.
 *   mobs: { mob (MOBS' key), how, chance (how many of these structures have it) }.
 *   where: facts for the Where it is section; both(java, bedrock) where the editions differ.
 */
const STRUCTURES = [
  {
    k: "trial_chambers", n: "Trial Chambers", dim: "overworld", icon: "st:trial_spawner",
    say: "Tuff and copper halls deep underground, full of trial spawners that reward a beaten trial with keys for its vaults.",
    loot: [
      { k: "vault", n: "Vault", block: "vault", table: "chests/trial_chambers/reward",
        where: "In the reward spots about the chambers. A trial key opens it, once for each player, and it gives 2 to 5 stacks." },
      { k: "ominous_vault", n: "Ominous vault", block: "ominous_vault", table: "chests/trial_chambers/reward_ominous",
        where: "Beside the vaults. An ominous trial key opens it, once for each player." },
      { k: "reward_chest", n: "Reward chests", block: "chest", table: "chests/trial_chambers/reward",
        where: "A vault’s loot in a plain chest: one hidden in a room off an entrance corridor, and one at the dead end of a collapsed hallway." },
      { k: "spawner", n: "Trial spawner", block: "spawner", pick: [["spawners/trial_chamber/key", 1], ["spawners/trial_chamber/consumables", 1]],
        where: "What it gives each player once its mobs are beaten: a trial key, or else food or a potion. A key comes for every player." },
      { k: "ominous_spawner", n: "Ominous trial spawner", block: "ominous_spawner", pick: [["spawners/ominous/trial_chamber/key", 3], ["spawners/ominous/trial_chamber/consumables", 7]],
        where: "The same once it’s ominous: an ominous trial key for every player, or else food or a potion." },
      { k: "ominous_drops", n: "Ominous spawner’s drops", block: "ominous_spawner", table: "spawners/trial_chamber/items_to_drop_when_ominous",
        where: "What an ominous trial spawner drops on you or its mobs every 8 seconds while it fights. They shatter or fly; they aren’t kept." },
      { k: "supply", n: "Supply chests", block: "chest", table: "chests/trial_chambers/supply", where: "In the supply room." },
      { k: "entrance", n: "Entrance chests", block: "chest", table: "chests/trial_chambers/entrance", where: "Along the entrance corridors." },
      { k: "intersection", n: "Intersection chests", block: "chest", table: "chests/trial_chambers/intersection", where: "At a corridor’s end." },
      { k: "intersection_barrel", n: "Intersection barrels", block: "barrel", table: "chests/trial_chambers/intersection_barrel", where: "In the intersections." },
      { k: "corridor", n: "Corridor barrels", block: "barrel", table: "chests/trial_chambers/corridor", where: "Standing about the corridors: 2 in 45 of their decorations." },
      { k: "pot", n: "Decorated pots", block: "pot", table: "pots/trial_chambers/corridor",
        where: "Standing about the corridors, one find in each. 1 in 13 has a Flow, Guster or Scrape sherd on its back." },
      { k: "chamber_dispenser", n: "Chamber dispensers", block: "dispenser", table: "dispensers/trial_chambers/chamber", where: "In the chambers’ walls and floors, fired by a button or a plate." },
      { k: "arrow_dispenser", n: "Arrow traps", block: "dispenser", table: "dispensers/trial_chambers/corridor", where: "Dispensers on tripwires in the corridors." },
    ],
    mobs: [
      { mob: "breeze", how: "Its own trial spawner in the chambers: 2 breezes, 1 more for each player more.", chance: "Every one" },
      { mob: "zombie", how: "Melee trial spawners, one of three mobs picked for the whole structure.", chance: "1 in 3" },
      { mob: "husk", how: "Melee trial spawners.", chance: "1 in 3" },
      { mob: "spider", how: "Melee trial spawners.", chance: "1 in 3" },
      { mob: "zombie", baby: true, how: "Small melee trial spawners: baby zombies. One of four mobs picked for the whole structure.", chance: "1 in 4" },
      { mob: "cave_spider", how: "Small melee trial spawners.", chance: "1 in 4" },
      { mob: "silverfish", how: "Small melee trial spawners.", chance: "1 in 4" },
      { mob: "slime", how: "Small melee trial spawners: small slimes, now and then a middle-sized one.", chance: "1 in 4" },
      { mob: "skeleton", how: "Ranged and slow ranged trial spawners, both the same mob, picked for the whole structure.", chance: "1 in 3" },
      { mob: "stray", how: "Ranged and slow ranged trial spawners.", chance: "1 in 3" },
      { mob: "bogged", how: "Ranged and slow ranged trial spawners.", chance: "1 in 3" },
    ],
    mobFacts: [
      ["No other mobs", "Nothing spawns there on its own: every mob comes out of a trial spawner."],
      ["Trial spawners", "A spawner wakes when a player comes within 14 blocks in sight of it. It sends 6 mobs, 2 more for each player more, up to 3 at a time, then gives its reward and sleeps 30 minutes."],
      ["Ominous", "A player with Bad Omen turns it into Trial Omen near a spawner (15 minutes for each level), and an ominous spawner sends more mobs, armored and armed, while it drops potions and arrows on you."],
      ["Their gear", both("An ominous spawner’s zombies, husks and skeletons wear a chainmail, iron or diamond helmet and chestplate with copper trims and Protection IV. They don’t drop them.", "An ominous spawner’s zombies, husks and skeletons wear a chainmail, iron or diamond helmet and chestplate with copper trims and Protection IV.")],
    ],
    where: {
      biomes: "Every Overworld biome but the deep dark.",
      height: "Underground: its first room is at Y −40 to −20, most of it a little higher.",
      often: "One in every 34 by 34 chunks (544 blocks square), at least 12 chunks from the next. They’re in the same places in both editions.",
      find: "A Trial Chambers map: 2 in 3 journeyman cartographers sell one for 12 emeralds and a compass. An abandoned camp’s secret chest can have one too. Underground, look for tuff and copper.",
      danger: "Breezes knock you back and off ledges, and turn your arrows aside. Arrow traps wait on tripwires in the corridors. In an ominous trial lingering potions and arrows fall on you every 8 seconds.",
    },
  },
];
const structureOf = k => STRUCTURES.find(s => s.k === k);

// The icons this tab uses for blocks.
const ST_ART = {
  "st:map": L("filled_map"), "st:compass": L("compass"), "st:netherrack": C("netherrack"), "st:end_stone": C("end_stone"), "st:barrel": C("barrel_side", "barrel_top"),
  "st:vault": C("vault"), "st:trial_spawner": C("trial_spawner"), "st:dispenser": C("dispenser_front_horizontal", "furnace_top", "furnace_side"),
};
for (const [k, spec] of Object.entries(ST_ART)) if (artReady(spec)) ICONS[k] = spec;

/* What the loot rows are: each item's group and how it's named. */
// Groups, the best first.
const LOOT_GROUPS = [["best", "Best finds"], ["gear", "Gear"], ["books", "Enchanted books"], ["food", "Food and potions"], ["materials", "Materials"], ["blocks", "Blocks"], ["other", "Everything else"]];
// The rare and best things: what a player would go there for.
const LOOT_BEST = new Set(["enchanted_golden_apple", "heavy_core", "trident", "elytra", "heart_of_the_sea", "diamond_block", "emerald_block",
  "netherite_ingot", "netherite_scrap", "ancient_debris", "netherite_upgrade_smithing_template", "saddle", "name_tag", "diamond_horse_armor",
  "golden_apple", "flow_banner_pattern", "guster_banner_pattern", "piglin_banner_pattern", "ominous_trial_key", "trial_key", "totem_of_undying",
  "echo_shard", "sniffer_egg", "music_disc_pigstep", "music_disc_otherside", "music_disc_relic", "music_disc_precipice", "music_disc_creator",
  "music_disc_creator_music_box", "music_disc_13", "music_disc_cat", "music_disc_bounce", "disc_fragment_5", "goat_horn", "dragon_egg",
  "lodestone", "spyglass"]);
const LOOT_FOOD = new Set(["apple", "baked_potato", "beef", "beetroot", "beetroot_soup", "bread", "cake", "carrot", "cod", "cooked_beef",
  "cooked_chicken", "cooked_cod", "cooked_porkchop", "cooked_salmon", "egg", "glow_berries", "golden_carrot", "honey_bottle", "melon_slice",
  "milk_bucket", "mutton", "poisonous_potato", "porkchop", "potato", "pumpkin_pie", "salmon", "spider_eye", "suspicious_stew",
  "sweet_berries", "wheat", "rotten_flesh", "potion", "splash_potion", "lingering_potion", "ominous_bottle", "experience_bottle", "glistering_melon_slice"]);
const LOOT_MATERIALS = new Set(["amethyst_shard", "blaze_rod", "bone", "bone_meal", "clay_ball", "coal", "copper_ingot", "diamond", "emerald",
  "ender_pearl", "feather", "flint", "gold_ingot", "gold_nugget", "gunpowder", "honeycomb", "ink_sac", "iron_ingot", "iron_nugget", "lapis_lazuli",
  "leather", "magma_cream", "nether_wart", "paper", "prismarine_crystals", "quartz", "rabbit_hide", "redstone", "resin_clump", "stick", "string",
  "wheat_seeds", "beetroot_seeds", "melon_seeds", "pumpkin_seeds", "wind_charge", "breeze_rod", "fire_charge", "snowball", "glowstone_dust",
  "brick", "book", "glass_bottle", "bowl"]);
const LOOT_GEAR = /(_sword|_axe|_pickaxe|_shovel|_hoe|_spear|_helmet|_chestplate|_leggings|_boots|_horse_armor|_nautilus_armor)$|^(bow|crossbow|shield|fishing_rod|shears|flint_and_steel|arrow|tipped_arrow|spectral_arrow|compass|clock|bucket|water_bucket|lead|mace|brush|bundle)$/;
function lootGroup(id, kind) {
  if (LOOT_BEST.has(id) || /_smithing_template$|_pottery_sherd$|^music_disc_/.test(id)) return "best";
  if (id === "enchanted_book") return "books";
  if (/_map$|^map$/.test(id)) return "other";
  if (LOOT_GEAR.test(id)) return "gear";
  if (LOOT_FOOD.has(id)) return "food";
  if (LOOT_MATERIALS.has(id) || /_dye$|_ingot$/.test(id)) return "materials";
  return LOOT_CUBES[id] ? "blocks" : "other";
}
// Blocks drawn as cubes: [side, top] textures, if not the block's own name for both.
const LOOT_CUBES = {
  tuff: [], moss_block: [], diamond_block: [], emerald_block: [], iron_block: [], gold_block: [], bamboo_planks: [], oak_planks: [],
  acacia_planks: ["planks_acacia"], scaffolding: ["scaffolding_side", "scaffolding_top"], heavy_core: [],
};
// Items whose picture is called otherwise in art/.
const LOOT_ART = { crossbow: "crossbow_standby", enchanted_golden_apple: "golden_apple", buried_trial_chambers_map: "trial_explorer_map" };
const LOOT_SHINES = new Set(["enchanted_book", "enchanted_golden_apple", "experience_bottle"]);
// Potions' colors (the Potions tab's), by their potion id without strong_ or long_.
const lootPotion = v => (v.match(/(?:^|\+)potion:(?:strong_|long_)?([a-z_]+)/) || [])[1];
function lootIcon(id, kind) {
  const p = lootPotion(kind), known = p && POTIONS.find(x => x.k === p);
  if (known) return potionIcon({ potion: "drink", splash_potion: "splash", lingering_potion: "lingering", tipped_arrow: "arrow" }[id] || "drink", known.color);
  if (id === "tipped_arrow") return potionIcon("arrow", "#7a8f7a");
  if (id === "shield" && ICONS.shield) return "shield";
  const key = `st:${id}`;
  if (!ICONS[key]) {
    const cube = LOOT_CUBES[id], spec = cube ? C(cube[0] || id, cube[1] || cube[0] || id) : L(LOOT_ART[id] || id);
    ICONS[key] = artReady(spec) ? spec : ICONS["ui:book"];
  }
  return key;
}
