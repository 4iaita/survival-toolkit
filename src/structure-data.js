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
// adding that scene to BACKDROPS and changing its line here to the scene's name. Nothing is on a plug now.
const plug = biome => ({ biome, plug: true });
const STRUCTURE_SCENES = {
  overworld: "plains", nether: "nether", end: "end_city",
  trial_chambers: "trial_chamber",
  fortress: "nether_fortress",
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
  {
    k: "fortress", n: "Nether Fortress", dim: "nether", icon: "st:nether_bricks",
    say: "Nether brick bridges and halls strung out over the lava seas, home to blazes and wither skeletons.",
    loot: [
      { k: "chest", n: "Chests", block: "chest", table: "chests/nether_bridge",
        where: "In the corner of a turn in the indoor corridors: a fortress has up to 20 turns, and each has a chest 1 time in 3." },
    ],
    mobs: [
      { mob: "blaze", how: both("Anywhere in the fortress, 2 or 3 together, in light 11 or less; and from its blaze spawners, up to 2 a fortress, each on a fenced platform up three steps.",
        "Anywhere in the fortress, 1 or 2 together, in light 11 or less; and from its blaze spawners, up to 2 a fortress, each on a fenced platform up three steps."), chance: "36%" },
      { mob: "wither_skeleton", how: both("Anywhere in the fortress, 5 together, in light 7 or less.", "Anywhere in the fortress, 2 or 3 together, in light 7 or less."), chance: "29%" },
      { mob: "zombified_piglin", how: both("Anywhere in the fortress, 4 together, in light 11 or less.", "Anywhere in the fortress, alone, in light 11 or less."), chance: "18%" },
      { mob: "magma_cube", how: both("Anywhere in the fortress, 4 together.", "Anywhere in the fortress, 2 or 3 together."), chance: "11%" },
      { mob: "skeleton", how: both("Anywhere in the fortress, 5 together, in light 7 or less.", "Anywhere in the fortress, 2 or 3 together, in light 7 or less."), chance: "7%" },
    ],
    mobFacts: [
      ["The share", "Of the fortress’s spawns: each try picks one of these five by weight, whatever the biome it stands in."],
      ["Where", both("Anywhere inside one of its pieces, on any block; and on nether bricks (not slabs) anywhere within the outline of the whole fortress, so a floor of them built there spawns its mobs too.",
        "Only at the fortress’s own spawn spots, in lines 4 to 11 blocks apart across it, on any block a mob can stand on.")],
      ["Blaze spawners", "Blazes come within 4 blocks of the spawner, in light 11 or less: light 15 on every side of it stops them."],
      ["Faster", both("A fortress in a soul sand valley or a warped forest spawns its mobs much faster.", "")],
    ],
    where: {
      biomes: "Every Nether biome.",
      height: "At about Y 48 to 70, often with some of it over a lava sea. Netherrack can bury parts of it, leaving the inside clear.",
      often: both("The Nether is split into regions of 27 by 27 chunks (432 blocks square), each with a fortress or a bastion remnant, not within 4 chunks of the region’s south and east edges. 2 in 5 are fortresses, and every one in a basalt delta, where bastions don’t generate.",
        "The Nether is split into regions of 30 by 30 chunks (480 blocks square), each with a fortress or a bastion remnant, not within 4 chunks of the region’s south and east edges. 1 in 3 are fortresses, and every one in a basalt delta, where bastions don’t generate."),
      find: "Look across the lava seas for dark red brick bridges and walls; the fog hides anything more than about 12 chunks off, so be ready to go several hundred blocks each way. The four regions around the Nether’s middle (0, 0) each hold a fortress or a bastion: finding a bastion rules out a fortress in that region.",
      danger: "Wither skeletons’ Wither drains your health and can kill; they’re 2.4 blocks tall, so a gap 2 blocks high stops them. Blazes’ fireballs set you on fire (Fire Resistance stops them, not their punches). The bridges’ low walls don’t stop a fall: a blast or a hit can knock you into the lava, which burns everything you carry. Ghasts can spawn in the fortress itself.",
      about: both("A wither skeleton drops its skull 2.5% of the times you kill it, 1% more for each level of Looting: three make the Wither. A blaze drops a blaze rod half the times you kill it, more often with Looting: you need them to brew and for eyes of ender. Nether wart grows on soul sand at the foot of the big stairways, up to two gardens a fortress.",
        "A wither skeleton drops its skull 2.5% of the times you kill it, 2% more for each level of Looting: three make the Wither. A blaze drops a blaze rod half the times you kill it; Looting gives more at once, not more often. You need them to brew and for eyes of ender. Nether wart grows on soul sand at the foot of the big stairways, up to two gardens a fortress."),
    },
  },
];
const structureOf = k => STRUCTURES.find(s => s.k === k);

/* Each dimension's own Mobs section: what spawns there in the open, from src/dimension-spawns.js (tools/dimension-spawns.py works it
 * out from Java 26.3's biomes and Bedrock 1.26.60's spawn rules). Mobs that only come from a structure are the structure's.
 *   DIM_GROUPS: each dimension's groups of biomes, a label each (the Overworld's by family, the user's choice); every biome of a dimension
 *     is in one. DIM_EVERYWHERE: the mobs listed once, over the groups, as found almost everywhere there.
 *   DIM_HOW: the line under a mob's name, by dimension, both(java, bedrock) where they differ; the page adds group sizes, where it isn't
 *     and Bedrock's height filters. From the spawn rules, the block tags (Java's *_spawnable_on) and the dimension types; what's in
 *     Java's code and not its data (heights, the ghast's 1 in 20, drowned, slimes) from the Minecraft Wiki.
 *   DIM_EXTRA: mobs that come another way (nests, hearts, riders, events), with where (biomes, or a group of their own: group) and how
 *     common in a word; ed when only one edition has the row.
 *   DIM_FACTS: rules for the whole dimension, under the list.
 */
const DIM_GROUPS = {
  overworld: [
    ["Plains", ["plains", "sunflower_plains"]],
    ["Forests", ["forest", "flower_forest", "birch_forest", "old_growth_birch_forest", "dark_forest", "dappled_forest", "pale_garden"]],
    ["Taigas", ["taiga", "snowy_taiga", "old_growth_pine_taiga", "old_growth_spruce_taiga"]],
    ["Jungles", ["jungle", "sparse_jungle", "bamboo_jungle"]],
    ["Savannas", ["savanna", "savanna_plateau", "windswept_savanna"]],
    ["Deserts and badlands", ["desert", "badlands", "eroded_badlands", "wooded_badlands"]],
    ["Snowy plains", ["snowy_plains", "ice_spikes"]],
    ["Mountains", ["meadow", "cherry_grove", "grove", "snowy_slopes", "jagged_peaks", "frozen_peaks", "stony_peaks", "windswept_hills", "windswept_gravelly_hills", "windswept_forest"]],
    ["Swamps", ["swamp", "mangrove_swamp"]],
    ["Oceans", ["ocean", "deep_ocean", "cold_ocean", "deep_cold_ocean", "frozen_ocean", "deep_frozen_ocean", "lukewarm_ocean", "deep_lukewarm_ocean", "warm_ocean"]],
    ["Rivers and beaches", ["river", "frozen_river", "beach", "snowy_beach", "stony_shore"]],
    ["Caves", ["lush_caves", "dripstone_caves", "sulfur_caves", "deep_dark"]],
    ["Mushroom fields", ["mushroom_fields"]],
  ],
  nether: [["Nether Wastes", ["nether_wastes"]], ["Crimson Forest", ["crimson_forest"]], ["Warped Forest", ["warped_forest"]],
    ["Soul Sand Valley", ["soul_sand_valley"]], ["Basalt Deltas", ["basalt_deltas"]]],
  end: [["The main island", ["the_end"]], ["The outer islands", ["end_highlands", "end_midlands", "end_barrens", "small_end_islands"]]],
};
const DIM_EVERYWHERE = {
  overworld: ["zombie", "zombie_villager", "skeleton", "creeper", "spider", "enderman", "witch", "slime", "bat", "glow_squid"],
  nether: ["strider"],
  end: [],
};
const ON_GRASS = both("On grass, in light 9 or more.", "On grass, in light 7 or more.");
const IN_DARK = "In the dark.";
const DIM_HOW = {
  overworld: {
    zombie: IN_DARK, skeleton: IN_DARK, creeper: IN_DARK, spider: IN_DARK, enderman: IN_DARK, witch: IN_DARK,
    zombie_villager: both("In the dark, on its own.", "In the dark: 1 in 20 of the zombies that spawn."),
    slime: both("In slime chunks (1 in 10) below Y 40, in any light; and in swamps at night between Y 51 and 69, most at full moon.",
      "In slime chunks below Y 40, in any light; and on the surface of swamps at night, most at full moon."),
    bat: both("In caves below sea level, in light 3 or less (7 around Halloween), on stone, deepslate or tuff.",
      "Underground, in light 4 or less, on stone, deepslate or tuff."),
    glow_squid: both("Underwater at Y 30 or lower, in complete darkness.", "Underwater."),
    sheep: ON_GRASS, pig: ON_GRASS, chicken: ON_GRASS, cow: ON_GRASS, horse: ON_GRASS, donkey: ON_GRASS, llama: ON_GRASS, panda: ON_GRASS,
    armadillo: both("On grass, red sand, coarse dirt or terracotta, in light 9 or more.", "On grass, red sand, coarse dirt or terracotta, in light 7 or more."),
    rabbit: both("On grass, snow or sand, in light 9 or more.", "On grass, snow or sand, in light 7 or more."),
    camel: both("On sand, in light 9 or more.", "On sand, red sand or sandstone, in light 7 or more."),
    parrot: both("On grass, leaves or logs, in light 9 or more.", "On grass, in light 7 or more."),
    ocelot: both("On grass or leaves at sea level or above. Counted with the monsters.", "On grass, in light 7 or more."),
    wolf: both("On grass, snow, coarse dirt or podzol, in light 9 or more.", "On grass (snow, coarse dirt or podzol where it’s cold), in light 7 or more."),
    fox: both("On grass, snow, podzol or coarse dirt, in light 9 or more.", "In light 7 or more."),
    goat: both("On grass, stone, snow, packed ice or gravel, in light 9 or more.", "On stone, snow, powder snow, packed ice or gravel, in light 7 or more."),
    polar_bear: both("On grass, or on ice in frozen oceans, in light 9 or more.", "In light 7 or more; on ice in frozen oceans."),
    mooshroom: both("On mycelium, in light 9 or more.", "In light 9 or more."),
    frog: both("On grass, mud or mangrove roots, in light 9 or more.", "In any light."),
    turtle: both("On sand less than 4 blocks above sea level, in light 9 or more.", "On sand, in light 7 or more."),
    squid: both("In water between Y 50 and 63.", "In water."),
    dolphin: both("In water between Y 50 and 63.", "In water."),
    nautilus: both("In ocean water.", "In water."),
    cod: both("In water between Y 50 and 63.", "In water."),
    salmon: both("In water between Y 50 and 63.", "In water."),
    pufferfish: both("In water between Y 50 and 63.", "In water."),
    tropicalfish: both("In water between Y 50 and 63; in lush caves at any height.", "In water."),
    axolotl: "In water over clay.",
    zombie_horse: both("In the dark, ridden by a zombie.", "In the dark, on grass, ridden by a zombie."),
    husk: both("In the dark, under the open sky.", "On the surface, in the dark."),
    parched: both("In the dark, under the open sky.", "On the surface, in the dark."),
    stray: both("In the dark, under the open sky.", "On the surface, in the dark; 1 in 5 comes as a plain skeleton."),
    bogged: both(IN_DARK, "On the surface, in the dark."),
    drowned: both("In water, in the dark: 1 in 15 of its tries in rivers, 1 in 40 elsewhere and only 5 blocks or more under sea level.", "In water, in the dark."),
    camel_husk: both("", "In the dark, on sand, with a husk riding it and a parched behind."),
    zombie_nautilus: both("", "In the dark, with a drowned riding it: the first of some groups of drowned."),
    sulfur_cube: both("", "In any light, on Peaceful too."),
    cave_spider: IN_DARK,
  },
  nether: {
    strider: both("On lava, in any light.", "On lava."),
    ghast: both("Wherever it fits, but only 1 in 20 of its tries succeeds.", "Wherever it fits; at most 2 near a player."),
    zombified_piglin: both("In light 11 or less, not on nether wart blocks.", "In light 11 or less, not on nether wart blocks or shroomlight."),
    piglin: both("Not on nether wart blocks.", "Not on nether wart blocks or shroomlight."),
    hoglin: both("Not on nether wart blocks.", "Not on nether wart blocks or shroomlight. Counted with the animals."),
    magma_cube: both("", "Not on nether wart blocks or shroomlight."),
    skeleton: both("", "Not on nether wart blocks or shroomlight."),
    enderman: "",
  },
  end: {
    enderman: both("Where no block light reaches.", "On the surface, in any light."),
  },
};
const DIM_EXTRA = {
  overworld: [
    { mob: "bee", biomes: DIM_BEES, how: "In bee nests on the trees, made with the world.", chance: "Nests" },
    { mob: "creaking", biomes: ["pale_garden"], how: "At night, from a creaking heart in a pale oak trunk. It crumbles at dawn.", chance: "Hearts" },
    { mob: "camel_husk", ed: "java", biomes: ["desert"], how: "1 in 10 husk groups has a husk riding one, with a parched behind.", chance: "Rare" },
    { mob: "zombie_nautilus", ed: "java", biomes: ["ocean", "deep_ocean", "cold_ocean", "deep_cold_ocean", "frozen_ocean", "deep_frozen_ocean", "lukewarm_ocean", "deep_lukewarm_ocean", "warm_ocean", "dripstone_caves"],
      how: "Half the drowned that spawn holding a trident ride one. In warm oceans it’s the coral kind.", chance: "Rare" },
    { mob: "phantom", group: "Now and then", how: MOB_INFO.phantom.spawn, chance: "Sleepless" },
    { mob: "pillager", group: "Now and then", how: both("Patrols of up to 5, a captain with a banner at the front, after the first 5 days, away from villages. Never in mushroom fields.",
      "Patrols of 2 to 5, a captain with a banner at the front: every 10 to 11 minutes a 1 in 5 chance, in the dark, 24 to 48 blocks off, away from villages. Never in mushroom fields."), chance: "Patrols" },
    { mob: "wandering_trader", group: "Now and then", how: MOB_INFO.wandering_trader.spawn, chance: "Now and then" },
    { mob: "trader_llama", group: "Now and then", how: MOB_INFO.trader_llama.spawn, chance: "With a trader" },
    { mob: "skeleton_horse", group: "Now and then", how: MOB_INFO.skeleton_horse.spawn, chance: "Storms" },
    { mob: "zombified_piglin", group: "Now and then", how: "Near nether portals: the portal’s blocks now and then let one through, on Normal and Hard.", chance: "Portals" },
  ],
  nether: [],
  end: [
    { mob: "ender_dragon", biomes: ["the_end"], how: MOB_INFO.ender_dragon.spawn, chance: "One" },
  ],
};
// The most of a mob that spawn together, where the game's code holds them to fewer than the biome's group size: Java's ghasts come one
// at a time (the Minecraft Wiki).
const DIM_MOST_AT_ONCE = { java: { ghast: 1 }, bedrock: {} };
const DIM_FACTS = {
  overworld: [
    ["Monsters", both("Where no block light reaches and the light from the sky is at most 0 to 7 (a new pick every try): at night, in storms, in caves.",
      "In light 7 or less: at night, in storms, in caves. None on Peaceful.")],
    ["Animals", both("Most are made with the world: a group in 1 in 10 new chunks (3 in 100 in badlands, 7 in 100 in snowy plains and ice spikes). After that they come back slowly.", "")],
    ["The share", "Of that biome’s spawns of the same kind: monsters with monsters, animals with animals, fish with fish, and so on. Where one mob’s share is a range, it differs between the group’s biomes."],
  ],
  nether: [
    ["Monsters", both("Skeletons and endermen in light 7 or less (a torch counts), zombified piglins in 11 or less, the rest in any light. None on Peaceful.", "In any light, but zombie pigmen only in 11 or less. Piglins and hoglins come on Peaceful too.")],
    ["Fewer at once", both("In soul sand valleys and warped forests every mob uses up some of the area’s room for spawning, so they stay sparse.", "")],
    ["The share", "Of that biome’s spawns of the same kind: monsters with monsters, animals with animals."],
  ],
  end: [
    ["Monsters", both("In any light, but not where a torch or other block lights the ground.", "In any light.")],
  ],
};

// The icons this tab uses for blocks.
const ST_ART = {
  "st:map": L("filled_map"), "st:nether_bricks": C("nether_brick"), "st:compass": L("compass"), "st:netherrack": C("netherrack"), "st:end_stone": C("end_stone"), "st:barrel": C("barrel_side", "barrel_top"),
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
  acacia_planks: ["planks_acacia"], obsidian: [], scaffolding: ["scaffolding_side", "scaffolding_top"], heavy_core: [],
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
