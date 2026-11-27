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
  overworld: "plains", nether: "nether", end: "end",
  trial_chambers: "trial_chamber",
  fortress: "nether_fortress",
  bastion_remnant: "bastion_remnant",
  end_city: "end_city",
  ancient_city: "deep_dark",
  stronghold: "stronghold",
  mineshaft: "mineshaft",
  woodland_mansion: "mansion",
  ocean_monument: "ocean",
  pillager_outpost: "pillager_outpost",
};
const sceneOf = k => { const s = STRUCTURE_SCENES[k]; return s ? (typeof s === "string" ? s : s.biome) : null; };

// The containers' blocks, as icons.
const ST_BLOCKS = {
  chest: "ui:logo", barrel: "st:barrel", vault: "st:vault", ominous_vault: "st:vault", dispenser: "st:dispenser", pot: "ui:pot",
  spawner: "st:trial_spawner", ominous_spawner: "st:trial_spawner",
  chest_minecart: "st:chest_minecart", rail: "st:rail",
  gold_block: "st:gold_block", wet_sponge: "st:wet_sponge", prismarine_bricks: "st:prismarine_bricks", elder_guardian: "mob:elder_guardian",
  item_frame: "st:item_frame", dragon_head: "st:dragon_head", diamond_block: "st:diamond_block", brewing_stand: "st:brewing_stand", furnace: "st:furnace",
};

/* Each structure: its containers (loot), its mobs, and where it is.
 *   loot: { k, n, block, where, table } or pick: [[table, weight], ...] when one of several tables is rolled (a spawner's key or
 *     its food); table can be { java, bedrock } where the editions' paths differ. rows: what's always in it, as a table's rows
 *     ([id, kind, least, most, chance]), for what's placed with the structure and not rolled (the end ship's elytra); note: the line
 *     under its list, if not the chance's.
 *   lootFacts: [label, text] under the containers: what else can be had there (blocks of gold).
 *   mobs: { mob (MOBS' key), how, chance (how many of these structures have it, or how many it has), ed (only in that edition) }.
 *   kinds: a structure made as one of several kinds (the bastion's four), each { k, n, icon, say } with its own loot, lootFacts, mobs
 *     and mobFacts where they differ: picked in the Structures section's dropdown, and laid over the structure's own.
 *   where: facts for the Where it is section; both(java, bedrock) where the editions differ.
 */
const CITY_SHIP = 0.533;
const CITY_CENTRE_2 = 1 / 3;
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
    // How many of each: from Java's pieces (tools/structure-pieces.py --counts ancient_city builds 2000 cities as JigsawPlacement does,
    // round its city_anchor at Y -27); the chests' loot from each edition's own tables. Its three city centres are as likely, and only
    // the second has the hidden chest and furnace (CITY_CENTRE_2): what's in them is placed with it, not rolled.
    k: "ancient_city", n: "Ancient City", dim: "overworld", icon: "st:reinforced_deepslate",
    say: "A sunken city of deepslate deep in the deep dark, round a great frame of reinforced deepslate, where sculk shriekers call the warden.",
    loot: [
      { k: "chest", n: "Chests", block: "chest", table: "chests/ancient_city",
        where: "About 22 a city (10 to 39), in the buildings along its walls: 1 in each small chamber (about 11 of them a city), 2 in each barracks (about 3 of them), 1 or 2 up each tall ruined tower (about 4 of them), and 3 in a sauna (1 city in 4 has one)." },
      { k: "ice_box", n: "Ice box chest", block: "chest", table: "chests/ancient_city_ice_box",
        where: "In the ice box, a room of packed and blue ice: about half the cities (54%) have one, a few have more." },
      { k: "hidden_chest", n: "Hidden chest", block: "chest", rows: [["golden_apple", "", 1, 1, CITY_CENTRE_2]],
        where: "In the hidden rooms under the city centre’s frame, behind a piston door, in 1 of its 3 kinds of city centre.",
        note: "The chance is that a city has it: one golden apple, not enchanted, the same in every one." },
      { k: "furnace", n: "Hidden furnace", block: "furnace", rows: [["wooden_shovel", "", 1, 1, CITY_CENTRE_2], ["deepslate", "", 24, 24, CITY_CENTRE_2]],
        where: "In the same hidden rooms as the hidden chest: a wooden shovel in its fuel slot and 24 deepslate it has smelted, as if someone had lived there.",
        note: "The chance is that a city has it. Taking the deepslate out gives the experience of smelting it." },
    ],
    lootFacts: [
      ["The frame", "56 blocks of reinforced deepslate in the city centre, shaped like a portal: found nowhere else. It drops nothing when mined, so it can’t be taken in Survival."],
      ["Blocks to take", "About 140 soul lanterns and 170 candles, 4 skeleton skulls, packed and blue ice in the ice box, and the sculk: sculk, sculk sensors, sculk catalysts and sculk shriekers keep themselves only with Silk Touch (else experience). Shriekers mined, even with Silk Touch, can’t summon wardens again."],
      ["Redstone", "Under the frame, behind a piston door that a sculk sensor opens, are hidden rooms with redstone lamps and a lectern."],
    ],
    mobs: [
      { mob: "warden", how: "Summoned by the city’s sculk shriekers: the fourth time you set them off it digs out of the ground beside the shrieker, and every time after. It digs back down after a minute of quiet.", chance: "Summoned" },
      { mob: "glow_squid", ed: "bedrock", how: "In the city’s water, below Y 30: the deep dark’s only spawn.", chance: "Spawns" },
    ],
    mobFacts: [
      ["No spawns", both("Nothing spawns inside the city: it stops every kind of spawning in its whole box, and the deep dark round it has no spawns either. Its only mob is the warden.",
        "Nothing spawns in the deep dark but glow squid in water, so the city’s only monster is the warden.")],
      ["Shriekers", "About 16 sculk patches a city (5 to 29), each with 1 to 3 sculk shriekers where there’s floor beside it, and a sculk catalyst half the time. Every shrieker made with the world can summon wardens, here and in the rest of the deep dark; one a player places or a catalyst grows can’t."],
      ["Warnings", "Stepping on a shrieker, even sneaking, or a sculk sensor within 8 blocks hearing you sets it off: it shrieks 4.5 seconds, players within 40 blocks get 12 seconds of Darkness, and your warning level goes up by 1, at most once every 10 seconds. At the fourth a warden comes, within a few blocks of the shrieker, unless another is within 24 blocks. The level goes down by 1 every 10 minutes. None come on Peaceful."],
      ["The warden", "500 health, and no knockback moves it. Its punch does 30 on Normal (16 Easy, 45 Hard) and disables a shield for 5 seconds; out of reach it fires a sonic boom, 10 on Normal (6 Easy, 15 Hard), through walls, armor, shields and Protection, up to 14 blocks away (20 up or down). Every 6 seconds it gives players within 20 blocks 13 seconds of Darkness."],
      ["How it finds you", both("It’s blind: it hears vibrations within 15 blocks and sniffs the air every 5 to 10 seconds, smelling you even while you sneak. Sneaking makes no vibrations, nor does walking on wool or carpet; an arrow or snowball landing elsewhere draws it there. Bumping into it angers it a little, hitting it at once.",
        "It’s blind: it hears vibrations within 15 blocks and sniffs the air every 5 to 10 seconds, smelling you even while you sneak. Sneaking makes no vibrations, nor does walking on wool or carpet; an arrow or snowball landing elsewhere draws it there. Bumping into it angers it at once, as hitting it does.")],
    ],
    where: {
      biomes: "Only the deep dark, the cave biome deep under mountains and hills: the city’s middle has to be in it at Y −27.",
      height: "Its floor is at Y −51, and the city centre rises to about Y −21. It spreads up to 116 blocks each way from its middle, so a big one is about 230 blocks across.",
      often: "The Overworld is split into regions of 24 by 24 chunks (384 blocks square), each with one try at a city in its first 16 by 16 chunks, so two are at least 8 chunks apart. The try fails where its middle isn’t in the deep dark, so most regions have none.",
      find: "Go down to about Y −51 under mountains: the deep dark is darker than the caves round it, with sculk spreading over the deepslate. An abandoned camp’s secret chest has an Ancient City map 1 time in 7. No compass leads to one: a recovery compass only points to where you last died.",
      danger: "The warden: ordinary gear can’t beat it, and its sonic boom goes through walls and shields. Sneak everywhere, walk on wool or carpet, and step round the shriekers: the fourth warning brings it. Sculk sensors along the paths hear you and set off shriekers within 8 blocks; a wool block between them stops that. Throw a snowball or an arrow to draw it away, and if it comes, leave; it digs back down after a minute of quiet.",
      about: "Swift Sneak: found nowhere else, on books in 1 chest in 4. Echo shards (3 chests in 10), also only here: eight and a compass make a recovery compass. Disc fragments 5, also only here: nine make Music Disc 5. Enchanted golden apples, diamond leggings and hoes enchanted at levels 30 to 50, and Music Disc Otherside (also in dungeons and stronghold corridors). And the Ward and Silence armor trims; Silence is the rarest template.",
    },
  },
  {
    // How many of each: from Java's StrongholdPieces (tools/structure-pieces.py --stronghold builds 5000 strongholds as it does); the
    // chests' loot from each edition's own tables. Bedrock's layout isn't in its files: it's shown as Java's, but for its prison cells
    // (no iron doors, from the Minecraft Wiki).
    k: "stronghold", n: "Stronghold", dim: "overworld", icon: "st:end_portal_frame",
    say: "A buried maze of stone bricks: corridors, libraries and prison cells round the only end portal in the Overworld, which an eye of ender leads you to.",
    loot: [
      { k: "library", n: "Library chests", block: "chest", table: "chests/stronghold_library",
        where: "In the libraries: one on the floor among the middle shelves, and in a tall library a second up on its gallery. About 2 libraries a stronghold (97% have 2), 6 in 7 of them tall: so about 3.6 library chests (72% have 4)." },
      { k: "corridor", n: "Corridor chests", block: "chest", table: "chests/stronghold_corridor",
        where: "In the chest corridors, one in each, on a step of stone brick slabs: about 4 a stronghold (19 in 20 have 4)." },
      { k: "crossing", n: "Storeroom chests", block: "chest", table: "chests/stronghold_crossing",
        where: "In a room crossing made as a storeroom, up on its wooden gallery by a ladder. 1 room crossing in 5 is one, of about 6 a stronghold: so about 1 a stronghold (0 to 5), and 3 strongholds in 10 have none." },
    ],
    lootFacts: [
      ["The end portal", "12 end portal frames round a pool of lava, up stone brick stairs with the silverfish spawner on them. Each frame already has an eye of ender 1 time in 10. The frames can’t be mined in Survival, and an eye can’t be taken back out."],
      ["Enchanted books", "Enchanted at level 30, the enchanting table’s best; they can be Mending, Frost Walker or a curse too."],
      ["Blocks to take", both("About 440 bookshelves and 57 cobwebs in the libraries (Silk Touch keeps a bookshelf, else it gives 3 books; shears or Silk Touch keep a cobweb, a sword gives string), about 330 iron bars, 27 oak doors, 37 iron doors (10 of them in the prison cells) with 55 stone buttons, and ladders and torches.",
        "About 440 bookshelves and 57 cobwebs in the libraries (Silk Touch keeps a bookshelf, else it gives 3 books; shears or Silk Touch keep a cobweb, a sword gives string), about 330 iron bars, 27 oak doors and 27 iron doors with 55 stone buttons (the prison cells have none), and ladders and torches.")],
      ["Infested stone bricks", "About 1,000 of its walls’ stone bricks, 1 in 20, hide a silverfish: mined, it comes out, unless with Silk Touch, which gives a plain stone brick. Of the rest, 3 in 10 are mossy and 1 in 5 cracked."],
    ],
    mobs: [
      { mob: "silverfish", how: "From the spawner on the portal room’s stairs, and out of the infested stone bricks in its walls when they’re mined: about 1,000 a stronghold.", chance: "Spawner" },
      { mob: "zombie", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 5 of its monster spawns, 2 to 4 together."), chance: "Common" },
      { mob: "skeleton", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 6 of its monster spawns, 1 or 2 together."), chance: "Common" },
      { mob: "creeper", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 5 of its monster spawns, alone."), chance: "Common" },
      { mob: "spider", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 5 of its monster spawns, alone."), chance: "Common" },
      { mob: "slime", how: both("Only where the stronghold is in a slime chunk (1 in 10), below Y 40, in any light.", "Only where the stronghold is in a slime chunk, below Y 40, in any light."), chance: "Slime chunks" },
      { mob: "enderman", how: both("In the dark, as in the biome round it: 1 in 50 of its monster spawns, 1 to 4 together.", "In the dark, as in the biome round it: 1 in 50 of its monster spawns, 1 or 2 together."), chance: "Rare" },
      { mob: "zombie_villager", how: both("In the dark, as in the biome round it: 1 in 100 of its monster spawns, alone.", "In the dark: 1 in 20 of the zombies that spawn."), chance: "Rare" },
      { mob: "witch", how: "In the dark, as in the biome round it: 1 in 100 of its monster spawns, alone.", chance: "Rare" },
      { mob: "drowned", how: "In water, in the dark, where the stronghold is in dripstone caves: 1 in 6 of their monster spawns.", chance: "Dripstone caves" },
    ],
    mobFacts: [
      ["No spawns of its own", "The stronghold doesn’t change what spawns: the biome round it, often a cave biome at that depth, spawns its monsters in the dark on its floors, as in any cave. In the deep dark nothing does. Bats don’t spawn on stone bricks, only in caves cutting through."],
      ["The spawner", "One, on the stairs up to the end portal: up to 4 silverfish at a time every 10 to 40 seconds while you’re within 16 blocks, until 6 are round it. Light doesn’t stop silverfish: break it with a pickaxe to stop it."],
      ["Calling for help", "A silverfish hurt without being killed calls others out of the infested blocks round it, and one can crawl into a stone or stone brick block and hide there, infesting it."],
    ],
    where: {
      biomes: both("Any Overworld biome, even under the sea. Where its ring puts it, it’s moved up to 112 blocks to a biome it prefers: any but oceans, rivers, beaches, swamps, the dappled forest and the deep dark.",
        "Any Overworld biome, deep underground; three are made under the meeting points of villages."),
      height: "Underground. It’s about 32 blocks high (23 to 43) and 130 across (95 to 175). Its top, nearly always the spiral staircase where it starts, is at Y 52 at most and usually between Y −10 and 32; its lowest rooms can reach the bedrock. The portal room’s floor is usually between Y −25 and 17.",
      often: both("128 in a world, no more, in 8 rings round 0, 0, spread evenly round each ring: 3 at 1,280 to 2,816 blocks out, 6 at 4,352 to 5,888, then 10, 15, 21, 28 and 36 in rings about 3,000 blocks further out each, and the last 9 at 22,784 to 24,320.",
        "No limit: they’re scattered through the world, none within 160 blocks of 0, 0. And 3 more are made under the meeting points of villages, at least 453 blocks from 0, 0, most of them near that."),
      find: both("Throw an eye of ender (an ender pearl and blaze powder): it flies about 12 blocks toward the nearest stronghold’s spiral staircase, rising while that’s further off and dropping once you’re near. 1 in 5 shatters; pick up the rest. To save eyes, throw two far apart and draw their lines: they cross over it. The first ring’s three are a third of a turn apart, 1,280 to 2,816 blocks from 0, 0. Dig down to the staircase; the portal room is usually 25 to 45 blocks from it, at least six rooms in.",
        "Throw an eye of ender (an ender pearl and blaze powder): it flies about 12 blocks toward the nearest stronghold’s spiral staircase, rising while that’s further off and dropping once you’re near. 1 in 5 shatters; pick up the rest. To save eyes, throw two far apart and draw their lines: they cross over it. Three are under villages’ meeting points not far from 0, 0. Dig down to the staircase; the portal room is usually 25 to 45 blocks from it, at least six rooms in."),
      danger: "Silverfish: the spawner on the portal room’s stairs, and the infested stone bricks, which let one out when mined: mine its walls with Silk Touch, or not at all. Getting lost: about 150 rooms over 130 blocks, on several levels; mark your way. Lava in the portal room, by its stairs and under the portal. Caves and mineshafts cut through it, bringing their monsters, cave spiders from a mineshaft’s spawners, and lava. And the portal: go in only ready to fight the ender dragon, as the way back is killing it, or dying.",
      about: both("The End: the only end portal in the Overworld, its 12 frames waiting for eyes of ender. Each already has one 1 time in 10: about 1.2 a stronghold; 28% have none, 38% one, 23% two, 11% three or more, and all 12, the portal open, one in a trillion. The Eye armor trim: in every library chest (about 3.6 a stronghold) and 1 corridor chest in 10, and nowhere else. Enchanted books at level 30, in 2 library chests in 3. Ender pearls in 1 corridor chest in 4. About 440 bookshelves for an enchanting table. And Music Disc Otherside (also in dungeons and ancient cities).",
        "The End: the only end portal in the Overworld, its 12 frames waiting for eyes of ender. Each already has one 1 time in 10: about 1.2 a stronghold; 28% have none, 38% one, 23% two, 11% three or more, and all 12, the portal open, one in a trillion. The Eye armor trim: in every library chest (about 3.6 a stronghold) and 1 corridor chest in 10, and nowhere else. Enchanted books at level 30, in nearly 3 library chests in 4. Ender pearls in 1 corridor chest in 4. About 440 bookshelves for an enchanting table. And Music Disc Otherside (also in dungeons and ancient cities)."),
    },
  },
  {
    // How many of each: from Java's MineshaftPieces (tools/structure-pieces.py --mineshaft builds 5000 mineshafts as it does, as if in
    // solid stone); the chest minecarts' loot from each edition's own table (the same but for the order). The badlands kind (Java's
    // mineshaft_mesa, Bedrock's surface_mineshaft biomes) has the same pieces, loot and spawners, so it's told in facts, not as a kind
    // (the user's choice). Bedrock's layout isn't in its files: it's shown as Java's.
    k: "mineshaft", n: "Mineshaft", dim: "overworld", icon: "st:rail",
    say: "Abandoned tunnels propped up with wooden supports, branching for 150 blocks underground, with rails, chest minecarts, and cobwebs hiding cave spider spawners.",
    loot: [
      { k: "minecart", n: "Chest minecarts", block: "chest_minecart", table: "chests/abandoned_mineshaft",
        where: "About 5 a mineshaft (1 to 10 in 9 mineshafts in 10; 1 in 40 has none), along the corridors: beside each support, 1 time in 100 on either side, each on a rail of its own. In sulfur caves a Music Disc Bounce takes some of its rails’ and torches’ rolls: there rails come in 70% of them, torches 58%, powered rails 23%." },
      { k: "corridors", n: "Along the corridors", block: "rail",
        rows: [["rail", "", 126, 495, 0.999], ["torch", "", 7, 32, 0.999], ["cobweb", "", 94, 472, 0.999], ["oak_fence", "", 464, 1592, 0.999], ["oak_planks", "", 476, 1752, 0.999]],
        where: "About 1,240 blocks of corridor a mineshaft, in about 90 corridors, 25 crossings and 10 stairs round the room it starts from. 1 corridor in 3 has rails, along 7 in 10 of its middle blocks. Every 5 blocks a support of two fences and a beam of planks, now and then with a torch on it; a pillar of planks in each corner of a crossing; and cobwebs round the supports and filling the spider corridors.",
        note: "Placed with it, not rolled: × is how many a mineshaft has, 9 in 10 between these, and the chance is that one has any. Fewer where caves or the open air cut through it. In the badlands they’re dark oak fences and planks." },
    ],
    lootFacts: [
      ["Cave spider spawners", "About 2.6 a mineshaft (0 to 12; 9 in 10 have one), one in each spider corridor. A spawner can’t be taken, even with Silk Touch: mined with a pickaxe it gives 15 to 43 experience."],
      ["String", "A sword breaks a cobweb into 1 string; shears keep the cobweb. About 260 cobwebs a mineshaft."],
      ["Over caves", "Where a corridor crosses a cave or a ravine its floor is filled with planks, held up by logs down to the ground or iron chains from the roof."],
      ["The badlands kind", "Built of dark oak: dark oak fences, planks and logs where any other mineshaft has oak. Its loot, rails and spawners are the same."],
    ],
    mobs: [
      { mob: "cave_spider", how: both("From the spawners in its spider corridors, in complete darkness: up to 4 at a time every 10 to 40 seconds while you’re within 16 blocks, until 6 are round it. And where it’s in sulfur caves, in the dark, alone: 1 in 16 of their monster spawns.",
        "From the spawners in its spider corridors, in complete darkness: up to 4 at a time every 10 to 40 seconds while you’re within 16 blocks, until 6 are round it. And where it’s in sulfur caves, in the dark, alone: 1 in 22 of their monster spawns."), chance: "Spawners" },
      { mob: "zombie", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 5 of its monster spawns, 2 to 4 together."), chance: "Common" },
      { mob: "skeleton", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 6 of its monster spawns, 1 or 2 together."), chance: "Common" },
      { mob: "creeper", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 5 of its monster spawns, alone."), chance: "Common" },
      { mob: "spider", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4. Not in sulfur caves.", "In the dark, as in the biome round it: 1 in 5 of its monster spawns, alone. Not in sulfur caves."), chance: "Common" },
      { mob: "bat", how: both("In its dark corridors below sea level, as in any cave: in light 3 or less (7 around Halloween), on stone, deepslate or tuff.", "In its dark corridors, as in any cave: in light 4 or less, on stone, deepslate or tuff."), chance: "Caves" },
      { mob: "slime", how: both("Only where the mineshaft is in a slime chunk (1 in 10), below Y 40, in any light.", "Only where the mineshaft is in a slime chunk, below Y 40, in any light."), chance: "Slime chunks" },
      { mob: "sulfur_cube", how: both("Where it’s in sulfur caves, in the dark: about 1 in 3 of their monster spawns, 2 to 4 together.", "Where it’s in sulfur caves, in any light, on Peaceful too: about 1 in 3 of their monster spawns, 2 to 4 together."), chance: "Sulfur caves" },
      { mob: "enderman", how: both("In the dark, as in the biome round it: 1 in 50 of its monster spawns, 1 to 4 together.", "In the dark, as in the biome round it: 1 in 50 of its monster spawns, 1 or 2 together."), chance: "Rare" },
      { mob: "zombie_villager", how: both("In the dark, as in the biome round it: 1 in 100 of its monster spawns, alone.", "In the dark: 1 in 20 of the zombies that spawn."), chance: "Rare" },
      { mob: "witch", how: "In the dark, as in the biome round it: 1 in 100 of its monster spawns, alone.", chance: "Rare" },
      { mob: "drowned", how: "In water, in the dark, where the mineshaft is in dripstone caves: 1 in 6 of their monster spawns.", chance: "Dripstone caves" },
    ],
    mobFacts: [
      ["No spawns of its own", "The mineshaft doesn’t change what spawns: the biome round it, often a cave biome at that depth, spawns its monsters in the dark of its corridors, as in any cave. Where it reaches the deep dark nothing does."],
      ["Spider corridors", "1 corridor in 35 (1 in 23 of those without rails): 3 in 5 of its lower blocks are cobwebs, about 44, and a cave spider spawner sits in the middle of its floor. Its spiders only spawn in complete darkness, so one torch beside it stops it; or break it with a pickaxe."],
      ["Cave spiders", "Their bite poisons you on Normal (7 seconds) and Hard (15 seconds), down to half a heart; not on Easy. They fit through gaps a block wide and half a block high, and climb walls."],
    ],
    where: {
      biomes: "Every Overworld biome but the deep dark: the biome at Y 50 in the chunk where it starts must be one, so a cave biome there counts, and it runs on under oceans, rivers and mountains. In the badlands, eroded badlands and wooded badlands it’s the badlands kind, of dark oak.",
      height: "Underground: its top is at Y 52 at most, usually between Y −17 and 29, and its lowest corridors can reach Y −62. It’s about 22 blocks high (14 to 31) and 150 across (110 to 180), and the room it starts from is usually between Y −29 and 17. The badlands kind is moved up instead: its middle anywhere from sea level (Y 63) up to the ground there, so it’s often half in the open, its corridors sticking out of the hillsides.",
      often: "Each chunk has a 4 in 1,000 chance of one starting in it: about one for every 16 by 16 chunks (256 blocks square). Nothing keeps them apart, so two can start side by side and run into each other, and they cut through caves, strongholds and other structures.",
      find: "Explore caves and ravines: look for wooden fences and planks in their walls, rails and cobwebs; ravines often cut through one. In the badlands look for dark oak supports sticking out of the hills. An abandoned camp’s secret chest has a Buried Mineshaft Map 1 time in 7, which leads to one (never a badlands one). No eye or compass leads to one.",
      danger: "Cave spiders: their spawners hide in cobwebs, which slow you to a crawl, and their poison takes you down to half a heart. Cut the webs with a sword or shears, then light up or break the spawner. Caves and ravines cut through it, so floors end over long drops, with lava and water from the caves below. Getting lost: about 90 corridors over 150 blocks, on several levels; mark your way. And the biome’s monsters in its dark corridors.",
      about: "Name tags: in 42% of its chest minecarts, so 5 mineshafts in 6 have one: the best place to find them. Golden apples (28% of the minecarts) and enchanted golden apples (1.4%, so about 1 mineshaft in 15). Rails: about 300 on its tracks to take with any tool, and powered, detector and activator rails in its minecarts. String: about 260 cobwebs, a string each with a sword. Music Disc Bounce, only in mineshafts in sulfur caves, in 42% of their minecarts. And about 1,000 fences and 1,000 planks.",
    },
  },
  {
    // How many of each: from Java's WoodlandMansionPieces (tools/structure-pieces.py --mansion builds 5000 mansions as it does, and with
    // src/structure-loot.js gives the chance a mansion's chests hold each find) and the data markers and chests in its room templates; the
    // chests' loot from each edition's own table. Bedrock's layout isn't in its files: it's shown as Java's.
    k: "woodland_mansion", n: "Woodland Mansion", dim: "overworld", icon: "st:dark_oak_log",
    say: "A huge house of dark oak and cobblestone in the dark forest, three floors of rooms and secret rooms, held by vindicators and evokers, the only illagers that drop a totem of undying.",
    loot: [
      { k: "chest", n: "Chests", block: "chest", table: "chests/woodland_mansion",
        where: "About 4 a mansion (1 to 8 in 9 mansions in 10; 98% have one), each in a room of its own kind: the checkerboard room (over its door), the gray banner room (behind its altar), the end of the wood arch hallway, the top of the winding stairway, the lofts of the bedroom with a loft and the arena room, and the secret rooms: two up in the attic room, one in the X room and one in the clean chest room." },
      { k: "placed", n: "Filled chests", block: "chest",
        rows: [["allium", "", 8, 8, 0.648], ["iron_axe", "set:efficiency:1-1", 1, 1, 0.394], ["dark_oak_sapling", "", 28, 28, 0.391], ["ender_pearl", "", 2, 2, 0.063]],
        where: "Chests that come filled, the same in every one: 8 alliums in the allium room’s, an iron axe with Efficiency I in the tree-chopping room’s, 28 dark oak saplings in the sapling farm’s, and 2 ender pearls in the fake End portal room’s trapped chest, between two TNT.",
        note: "Placed with it, not rolled: the chance is that a mansion has one; × is how many in its chest. The trapped chest sets off the TNT when opened." },
      { k: "secret", n: "Secret rooms", block: "diamond_block",
        rows: [["diamond_block", "", 1, 1, 0.177], ["obsidian", "", 19, 110, 0.177], ["glass", "", 99, 99, 0.037], ["cobweb", "", 95, 95, 0.141], ["tnt", "", 2, 2, 0.063]],
        where: "Rooms with no door, walled in among the others: 7 mansions in 10 have one or more. The obsidian room (15% of mansions) hides a block of diamond in obsidian, the lava room (4%) one under lava in a case of glass and obsidian; the spider room (14%) is full of cobwebs round a spider spawner; the X room (14%) has a chest among cobblestone walls, the clean chest room (7%) a chest between torches; the fake End portal room (6%) a trapped chest of ender pearls between two TNT, over lava and among infested cobblestone; the birch pillar room (15%) nothing. On the upper floors, the attic room (36%) has a hidden loft with two chests. The 1 by 1 rooms can be on any floor, the clean chest and fake End portal rooms only on the first.",
        note: "Built with it, not rolled: the chance is that a mansion has them; × is how many in one room. Obsidian needs a diamond pickaxe." },
    ],
    lootFacts: [
      ["Empty chests", "About 42 empty chests a mansion, to take for storage: shelves of 42 single chests in the small storage room (39% of mansions) and 13 double chests in the large one (58%), and one in the mushroom farm."],
      ["Blocks to take", "Dark oak: about 17,000 planks, 2,600 logs, 1,900 stairs and 400 fences in its walls and roofs. About 3,800 cobblestone (and more in the foundation), 9,400 birch planks in its floors, 1,600 red and 1,300 white carpet along its corridors, 670 glass panes, 230 bookshelves (in its libraries), 145 torches, and about 130 white wool and 180 light gray wool in its statues and beds."],
      ["Its beds", "Wool and carpet, made to look like beds: there's no real bed in a mansion to sleep in or set your spawn."],
      ["Statues", "Wool statues of a cat, a chicken and an illager’s head; the big illager statue room (57% of mansions) has a block of lapis lazuli inside the head."],
      ["Rooms", "About 34 rooms a mansion: 13 on each of the first two floors (9 to 20) and 7 on the smaller third (1 to 15), with farms, jails, libraries, bedrooms, dining rooms and storage rooms, each kind on its own floor. A staircase room on the second floor leads up to the third."],
    ],
    mobs: [
      { mob: "vindicator", how: "Placed as it’s made, about 16 (8 to 25 in 9 mansions in 10): one or more in most rooms with a door, the jails, farms, storage rooms and forge among them, three in the triple bed bedroom, and two with each evoker. They never despawn, and none come back once killed.", chance: "About 16" },
      { mob: "evoker", how: "Placed as it’s made, about 3 (0 to 11; 1 mansion in 40 has none), on the upper floors: one in each ritual room, large dining room, conference room and map room, each with two vindicators. They never despawn, and none come back once killed.", chance: "About 3" },
      { mob: "vex", how: "Summoned by the evokers, 3 at a time, every 17 seconds while fewer than 8 are within 16 blocks of it. They fly through walls, and start dying 30 to 119 seconds after.", chance: "Summoned" },
      { mob: "allay", how: "Held in the large jail’s four cells: each cell half the times has 1 to 3. 57% of mansions have a large jail and 55% some allays, about 6 where they do.", chance: "55%" },
      { mob: "spider", how: both("From the spawner in the spider room (1 mansion in 7): up to 4 at a time every 10 to 40 seconds while you’re within 16 blocks, until 6 are round it. And in the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.",
        "From the spawner in the spider room (1 mansion in 7): up to 4 at a time every 10 to 40 seconds while you’re within 16 blocks, until 6 are round it. And in the dark, as in the biome round it: 1 in 5 of its monster spawns, alone."), chance: "Common" },
      { mob: "zombie", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 5 of its monster spawns, 2 to 4 together."), chance: "Common" },
      { mob: "skeleton", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 6 of its monster spawns, 1 or 2 together."), chance: "Common" },
      { mob: "creeper", how: both("In the dark, as in the biome round it: about 1 in 5 of its monster spawns, in groups of 4.", "In the dark, as in the biome round it: 1 in 5 of its monster spawns, alone."), chance: "Common" },
      { mob: "silverfish", how: "Out of the fake End portal room’s 24 infested cobblestone (1 mansion in 16), when its trap goes off, or when they’re mined without Silk Touch.", chance: "6%" },
      { mob: "enderman", how: both("In the dark, as in the biome round it: 1 in 50 of its monster spawns, 1 to 4 together.", "In the dark, as in the biome round it: 1 in 50 of its monster spawns, 1 or 2 together."), chance: "Rare" },
      { mob: "zombie_villager", how: both("In the dark, as in the biome round it: 1 in 100 of its monster spawns, alone.", "In the dark: 1 in 20 of the zombies that spawn."), chance: "Rare" },
      { mob: "witch", how: "In the dark, as in the biome round it: 1 in 100 of its monster spawns, alone.", chance: "Rare" },
    ],
    mobFacts: [
      ["What it’s made with", "Its vindicators, evokers and allays come with it and stay: they never despawn, even far from you. No illager spawns there again: once they’re killed, it’s only the dark forest’s or pale garden’s monsters, in its dark rooms and corridors."],
      ["Totems of undying", both("Every evoker drops one however it dies, and a mansion has about 3: nearly every one has at least one. The only other evokers are in raids. It also drops 0 to 1 emerald when you kill it (Looting adds up to 1 more), and 10 experience.",
        "Every evoker drops one however it dies, and a mansion has about 3: nearly every one has at least one. The only other evokers are in raids. It also drops 0 to 1 emerald (Looting adds up to 1 more) and 10 experience however it dies.")],
      ["Evokers’ fangs", both("Fangs snap up out of the floor: a line of 16 toward you, or two rings round the evoker when you’re within 3 blocks, 6 damage on Normal (4 Easy, 9 Hard). It casts every 5 seconds.",
        "Fangs snap up out of the floor: a line of 16 toward you, or two rings round the evoker when you’re within 3 blocks, 6 damage on every difficulty. It casts every 5 seconds.")],
      ["Vindicators", "Each carries an iron axe: 13 damage on Normal (7.5 Easy, 19.5 Hard), and it drops it 8.5% of the times you kill it. They go for players, villagers and iron golems on sight."],
      ["Illusioners", "None: no mansion has one, in either edition. Java’s illusioner only comes from commands, and Bedrock hasn’t one."],
    ],
    where: {
      biomes: both("Dark forests and pale gardens.", "Dark forests and pale gardens. Its rules also allow lush caves, dripstone caves and sulfur caves under them, but it rarely ends up there."),
      height: "On the surface, only where the land is at Y 60 or more round its middle. Three floors, the first 8 blocks high and the second 11, and a third about 2 in 5 their size over part of them (every mansion has one); its roofs reach about 32 blocks over the ground. Cobblestone fills under the first floor down to the land. It’s about 9 rooms by 7, 8 blocks each: some 70 by 56 blocks.",
      often: "The Overworld is split into regions of 80 by 80 chunks (1,280 blocks square), each with one try at a mansion in its first 60 by 60 chunks, most often near their middle, so two are at least 20 chunks apart. The try fails where it isn’t a dark forest or pale garden, so most regions have none: they’re often thousands of blocks apart.",
      find: "A Woodland Explorer Map leads to the nearest mansion: every master cartographer sells one, for 14 emeralds and a compass, up to 12 times before restocking. An abandoned camp’s secret chest has one 1 time in 7. Otherwise look over dark forests for its dark oak roofs and cobblestone walls, bigger than anything round them.",
      danger: "Evokers: their fangs bite up from the floor and their vexes fly through walls; kill the evoker and the vexes waste away. Vindicators hit hard with their axes, two beside each evoker. Getting lost: about 34 rooms on three floors, along corridors that look alike; mark your way. The secret rooms: the fake End portal room’s trapped chest sets off TNT and lets out silverfish, the spider room’s spawner sits in cobwebs, and the lava room’s diamond is under lava. And the biome’s monsters in its dark rooms.",
      about: both("Totems of undying: one from every evoker, about 3 a mansion; the only other source is raids. The Vex armor trim: found nowhere else, in half its chests, so 88% of mansions have one. Allays in the large jail’s cells (55% of mansions). Enchanted golden apples (1 mansion in 7), diamond hoes and chestplates, Music Discs 13 and Cat, and enchanted books (54% of mansions). Dark oak: about 17,000 planks and 2,600 logs, white and red carpet, wool, about 42 empty chests, and now and then a block of diamond in a secret room (1 mansion in 6).",
        "Totems of undying: one from every evoker, about 3 a mansion; the only other source is raids. The Vex armor trim: found nowhere else, in half its chests, so 88% of mansions have one. Allays in the large jail’s cells (55% of mansions). Enchanted golden apples (1 mansion in 7), diamond hoes and chestplates, Music Discs 13 and Cat, and enchanted books with treasure enchantments (59% of mansions). Dark oak: about 17,000 planks and 2,600 logs, white and red carpet, wool, about 42 empty chests, and now and then a block of diamond in a secret room (1 mansion in 6)."),
    },
  },
  {
    // How many of each: from Java's OceanMonumentPieces (tools/structure-pieces.py --monument builds 5000 monuments as it does, and with
    // both editions' files gives the elder guardians' drops). Its blocks are placed with it, not rolled: boxes of rows, × how many a
    // monument has (9 in 10 of those with any between these). Bedrock's layout isn't in its files: it's shown as Java's. Guardians'
    // spawning is Java's spawn_overrides and its code (Guardian.checkGuardianSpawnRules); Bedrock's is in its code, shown as Java's.
    k: "ocean_monument", n: "Ocean Monument", dim: "overworld", icon: "st:prismarine_bricks",
    say: "A great temple of prismarine on the floor of the deep ocean, lit by sea lanterns, held by guardians and three elder guardians, with eight blocks of gold at its heart and rooms of wet sponges.",
    loot: [
      { k: "gold", n: "Gold blocks", block: "gold_block", rows: [["gold_block", "", 8, 8, 1]],
        where: "In the core room, the treasure room at the back of the building, two rooms wide and two floors high: 8 blocks of gold, 2 by 2 by 2, inside a block of dark prismarine with sea lanterns at its corners. Every monument has one; it’s one of four places along the back, so it can open onto the corridor round the building.",
        note: "Built with it, not rolled: the chance is that a monument has them; × is how many. Mine the dark prismarine round them with a pickaxe." },
      { k: "sponges", n: "Sponge rooms", block: "wet_sponge", rows: [["wet_sponge", "", 25, 121, 0.766]],
        where: "Small rooms on the second or third floor, entered only through a hole in the floor, their ceilings hung with wet sponges: about 30 in a room (23 to 37 in 9 rooms in 10). 77% of monuments have one or more, about 2 where they do (1 to 4); 23% have none.",
        note: "Built with it, not rolled: × is how many wet sponges a monument has, 9 in 10 of those with any between these; the chance is that it has any. Anything mines them, fastest with a hoe." },
      { k: "elders", n: "Elder guardians", block: "elder_guardian",
        rows: [["wet_sponge", "", 3, 3, 1], ["prismarine_shard", "", 1, 6, 0.963], ["cod", "", 1, 6, 0.8805], ["prismarine_crystals", "", 1, 3, 0.7037],
          ["tide_armor_trim_smithing_template", "", 1, 3, 0.488], ["salmon", "", 1, 3, 0.0186], ["pufferfish", "", 1, 3, 0.0097], ["tropical_fish", "", 1, 3, 0.0015]],
        where: "What the monument’s three elder guardians drop between them, killed by a player without Looting: each a wet sponge, 0 to 2 prismarine shards, a raw cod (1 in 2) or prismarine crystals (1 in 3), a Tide armor trim template 1 time in 5, and 1 time in 40 a fish as if fished.",
        note: "The chance is that the three together drop at least one; × is how many. The wet sponges come only from a player’s kill (the template from any); Looting adds shards, cod and crystals. They never come back." },
      { k: "blocks", n: "Its blocks", block: "prismarine_bricks",
        rows: [["prismarine", "", 6491, 6889, 0.999], ["prismarine_bricks", "", 6004, 6322, 0.999], ["dark_prismarine", "", 207, 447, 0.999], ["sea_lantern", "", 106, 140, 0.999]],
        where: "What it’s built of: prismarine in its floors, roofs and walls, prismarine bricks in its trims and pillars, dark prismarine in its dark rooms and round the gold, and about 120 sea lanterns lighting its rooms, wings, entrance and roof.",
        note: "Built with it, not rolled: × is how many a monument has, 9 in 10 between these. Under it are its pillars (368 more prismarine bricks a block of their height). All need a pickaxe." },
    ],
    lootFacts: [
      ["No chests", "A monument has no chest or container of any kind: its riches are the gold, the sponges and the elder guardians’ drops."],
      ["Sea lanterns", "Mined without Silk Touch a sea lantern breaks into 2 or 3 prismarine crystals (Fortune gives more, up to 5). Five crystals and four shards make a new one."],
      ["Wet sponges", "Dry one in a furnace (it leaves a bucket of water in an empty bucket in the fuel slot), or place it in the Nether, where it dries at once. A dry sponge soaks up the water round it, up to 65 blocks within 7: the way to drain the monument."],
      ["The pillars", "23 pillars of prismarine bricks, 4 by 4 each, hold it up from the sea floor: round its edge, but for the entrance."],
      ["Rooms", "About 27 rooms a monument round its entrance, on three floors: small ones of three designs (with sea lanterns in their corners, in four pillars, or dark), double ones two rooms long or high (about 10), the core room, and the sponge rooms. Over them all the penthouse, and on each side of the entrance a wing, one of two designs each."],
    ],
    mobs: [
      { mob: "elder_guardian", how: "Placed as it’s made: one in each wing and one in the penthouse at the top. They never despawn, and none come back once killed.", chance: "3" },
      { mob: "guardian", how: both("Every monster that spawns in the monument’s box (58 by 58 blocks, Y 39 to 61) is a guardian, 2 to 4 together: in water over water, in any light, not on Peaceful; where the sky shows through the water, only 1 try in 20. Nowhere else.",
        "Every monster that spawns in the monument’s box (58 by 58 blocks, from its base to its roof) is a guardian, 2 to 4 together: in water over water, in any light, not on Peaceful; where the sky shows through the water, only 1 try in 20. Nowhere else."), chance: "2–4" },
      { mob: "drowned", how: both("In the ocean round it, in the dark: not in the monument’s box, where guardians take their place.", "In the ocean round it, in light 7 or less, 2 to 4 together; now and then one rides a zombie nautilus."), chance: "Round it" },
      { mob: "squid", how: both("In its water and round it, as in any deep ocean: between Y 50 and 63, 1 to 4 together.", "In its water and round it, as in any deep ocean: 2 to 4 together."), chance: "Common" },
      { mob: "cod", how: both("In its water and round it, in the deep ocean, deep cold and deep lukewarm oceans: between Y 50 and 63, 3 to 6 together.", "In its water and round it, in every deep ocean: between Y 0 and 64, 4 to 7 together."), chance: "Common" },
      { mob: "salmon", how: both("In its water and round it, in the deep cold and deep frozen oceans: between Y 50 and 63, 1 to 5 together.", "In its water and round it, in every deep ocean: between Y 0 and 64, 3 to 5 together."), chance: both("Cold seas", "Common") },
      { mob: "nautilus", how: both("In its water and round it, in every deep ocean: alone.", "In its water and round it, in every deep ocean: between Y 38 and 58, alone."), chance: "Common" },
      { mob: "dolphin", how: both("Round it, in the deep ocean and deep lukewarm ocean: between Y 50 and 63, 1 or 2 together.", "Round it, in the deep ocean and deep lukewarm ocean: between Y 0 and 64, 3 to 5 together."), chance: "Round it" },
      { mob: "tropicalfish", how: both("In the deep lukewarm ocean: between Y 50 and 63, 8 together.", "In the deep lukewarm ocean: between Y 0 and 64, 1 to 5 together."), chance: "Warm seas" },
      { mob: "pufferfish", how: both("In the deep lukewarm ocean: between Y 50 and 63, 1 to 3 together.", "In the deep lukewarm ocean: between Y 0 and 64, 3 to 5 together."), chance: "Warm seas" },
    ],
    mobFacts: [
      ["Guardians only", both("Inside its box guardians take the place of every other monster, and no glow squid or axolotls spawn there; fish, squid, dolphins and nautiluses do, as in the ocean round it.",
        "Inside its box guardians take the place of every other monster; fish, squid, dolphins and nautiluses spawn there as in the ocean round it.")],
      ["Mining Fatigue", "Every minute each elder guardian gives every player within 50 blocks Mining Fatigue III for 5 minutes, even through walls, with its ghost flashing before your eyes: you can barely mine, and you swing slower. It isn’t given again while you have more than a minute of it left. Milk clears it; killing all three ends it."],
      ["The elder guardian", `${MOB_INFO.elder_guardian.hp} health. Its laser charges for 3 seconds, then hits: ${MOB_INFO.elder_guardian.attack.replace("Laser: ", "")}. It never swims away, as guardians do, and it’s 10 experience.`],
      ["Guardians", `${MOB_INFO.guardian.hp} health. Their laser charges for 4 seconds while they keep their distance, then hits: ${MOB_INFO.guardian.attack.replace("Laser: ", "")}. Out of sight, it breaks off. Their spikes hurt whatever hits them while they’re out. Out of water they flop about.`],
      ["Their drops", "Elder guardian: a wet sponge (killed by a player), 0 to 2 prismarine shards, a raw cod (1 in 2) or prismarine crystals (1 in 3), a Tide armor trim template 1 time in 5, and 1 time in 40 a fish as if fished (killed by a player). Guardian: 0 to 2 prismarine shards, a raw cod or prismarine crystals (2 in 5 each), and the same 1 in 40 fish."],
    ],
    where: {
      biomes: both("Deep oceans: the deep ocean, deep cold, deep frozen and deep lukewarm oceans. Its middle must be in one, and everything within 29 blocks of it ocean or river.",
        "Deep oceans, the deep warm ocean too: everything within 16 blocks of its middle must be deep ocean, and within 29 blocks ocean or river."),
      height: both("On the sea floor, its base at Y 39 and its roof’s top at Y 60, just under the surface. 58 by 58 blocks and 22 high, on pillars down to the floor; where the floor is higher it’s cut away, and the water round it is cleared down to it.",
        "On the sea floor, its roof’s top always at Y 56. 58 by 58 blocks and 22 high, on pillars down to the floor; where the floor is higher it’s cut away, and the water round it is cleared down to it."),
      often: "The Overworld is split into regions of 32 by 32 chunks (512 blocks square), each with one try at a monument in its first 27 by 27 chunks, most often near their middle, so two are at least 5 chunks apart. The try fails where the ocean isn’t deep and wide enough, so only regions of open deep ocean have one: there, about one every 512 blocks.",
      find: "An Ocean Monument Map leads to the nearest monument: 2 in 3 journeyman cartographers sell one, for 13 emeralds and a compass, up to 12 times before restocking. No chest has one. Otherwise sail over deep ocean, the darkest water, and look down for the glow of sea lanterns.",
      danger: "Mining Fatigue III from the elder guardians, every minute within 50 blocks, so you can hardly break anything until they’re dead. Guardians’ lasers from across the water, and their spikes when you hit them. Drowning: bring Water Breathing, a turtle shell, Respiration and Aqua Affinity, or a conduit. Getting lost in its dark, alike rooms on three floors. And drowned in the ocean round it.",
      about: "Wet sponges: the only place they’re found, in its sponge rooms (77% of monuments, about 44 each) and from its three elder guardians, one each. The Tide armor trim: only from elder guardians, 1 time in 5 each, so half the monuments (49%) give one; seven diamonds and a block of prismarine copy it. 8 blocks of gold, 72 ingots. About 6,700 prismarine, 6,200 prismarine bricks, 320 dark prismarine and 120 sea lanterns to build with. And a guardian farm: once the elders are dead, guardians spawn all through its box in any light, for prismarine shards, crystals, cod and experience.",
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
  {
    k: "bastion_remnant", n: "Bastion Remnant", dim: "nether", icon: "st:blackstone",
    say: "Ruined blackstone castles of the piglins, guarded by piglin brutes and full of gold. Each is one of four kinds, picked as it’s made.",
    // Each kind's containers and mobs: how many, from Java's structure pieces (tools/structure-pieces.py builds each kind 2000 times as
    // Java's jigsaw placement does); the chests' loot from each edition's own tables.
    kinds: [
      {
        k: "housing", n: "Housing units", icon: "st:polished_blackstone_bricks",
        say: "A walled courtyard with blocks of piglin housing stacked round its middle. 1 in 4 bastions is this kind.",
        loot: [
          { k: "chest", n: "Chests", block: "chest", table: "chests/bastion_other",
            where: "About 10 a bastion (6 to 17): one in the courtyard’s middle, 2 in the outer walls, 3 to 6 up the ramparts, and up to 8 in the housing blocks." },
        ],
        lootFacts: [
          ["Blocks of gold", "About 19 a bastion, set in its walls and floors, and a few on their own in the housing blocks."],
        ],
        mobs: [
          { mob: "piglin", how: "Placed as it’s made, about 21 (11 to 31): about 11 with golden swords and 10 with crossbows.", chance: "About 21" },
          { mob: "piglin_brute", how: "Placed as it’s made, about 8 (1 to 15). They never respawn.", chance: "About 8" },
        ],
      },
      {
        k: "stables", n: "Hoglin stables", icon: "st:cracked_polished_blackstone_bricks",
        say: "Stairways down into stables where the piglins keep hoglins, inside walls and ramparts. 1 in 4 bastions is this kind.",
        loot: [
          { k: "stable_chest", n: "Stable chests", block: "chest", table: "chests/bastion_hoglin_stable",
            where: "About 3 a bastion (0 to 9), in some of the stables down the stairways." },
          { k: "chest", n: "Chests", block: "chest", table: "chests/bastion_other",
            where: "About 8 a bastion (4 to 12): 1 to 3 in the walls, the rest up the ramparts." },
        ],
        lootFacts: [
          ["Blocks of gold", "About 16 a bastion, most in one of its side walls (12) and up its ramparts."],
        ],
        mobs: [
          { mob: "hoglin", how: "Placed as it’s made, about 8 (1 to 14), in the stables. The bastion’s piglins don’t hunt them.", chance: "About 8" },
          { mob: "piglin", how: "Placed as it’s made, about 23 (8 to 42): about 12 with golden swords and 11 with crossbows.", chance: "About 23" },
          { mob: "piglin_brute", how: "Placed as it’s made, about 8 (1 to 17). They never respawn.", chance: "About 8" },
        ],
      },
      {
        k: "treasure", n: "Treasure room", icon: "st:gilded_blackstone",
        say: "A great hall round a lava basin, with a platform of gold blocks and the treasure chest in its middle. 1 in 4 bastions is this kind.",
        loot: [
          { k: "treasure_chest", n: "Treasure chest", block: "chest", table: "chests/bastion_treasure",
            where: "On the gold platform in the middle of the lava basin: one, or two in about 1 bastion in 4. Every one has a Netherite Upgrade." },
          { k: "chest", n: "Chests", block: "chest", table: "chests/bastion_other",
            where: "About 6 a bastion (4 to 10): 4 up the ramparts by the entrance, the rest in the hall’s walls round the basin." },
        ],
        lootFacts: [
          ["Blocks of gold", "About 27 a bastion: 12 to 19 in the platform under the treasure chest, the rest in the entrance and the walls."],
          ["Magma cube spawner", "One, at the bottom of the lava basin, by the platform."],
        ],
        mobs: [
          { mob: "piglin_brute", how: "Placed as it’s made, about 16 (8 to 23), more than in any other kind. They never respawn.", chance: "About 16" },
          { mob: "piglin", how: "Placed as it’s made, about 21 (11 to 30): about 11 with golden swords and 10 with crossbows.", chance: "About 21" },
          { mob: "magma_cube", how: "From the spawner at the bottom of the lava basin, while a player is within 16 blocks: up to 4 at a time every 10 to 40 seconds, until there are 6 round it.", chance: "Spawner" },
        ],
      },
      {
        k: "bridge", n: "Bridge", icon: "st:chiseled_polished_blackstone",
        say: "A big gatehouse with lava falls, walls and ramparts, and a long bridge leading out from it. 1 in 4 bastions is this kind.",
        loot: [
          { k: "bridge_chest", n: "Bridge chest", block: "chest", table: "chests/bastion_bridge",
            where: "Just one, in the gatehouse. It always has a lodestone." },
          { k: "chest", n: "Chests", block: "chest", table: "chests/bastion_other",
            where: "About 4 a bastion (2 to 6), up the ramparts." },
        ],
        lootFacts: [
          ["Blocks of gold", "About 22 a bastion, most along the bridge (16)."],
        ],
        mobs: [
          { mob: "piglin", how: "Placed as it’s made, about 24 (15 to 32): about 12 with golden swords and 12 with crossbows, most of them in the gatehouse.", chance: "About 24" },
          { mob: "piglin_brute", how: "Placed as it’s made, about 6 (0 to 15). They never respawn.", chance: "About 6" },
          { mob: "hoglin", how: "Placed as it’s made, 0 to 2 in the gatehouse: 9 bridges in 10 have one.", chance: "0–2" },
        ],
      },
    ],
    mobFacts: [
      ["What it’s made with", "Its piglins, brutes and hoglins come with it and stay: they never despawn, even far from you, and the piglins don’t hunt its hoglins. Those killed don’t come back."],
      ["Afterwards", "A bastion has no spawns of its own: the biome it stands in goes on spawning inside it, so in a crimson forest hoglins and piglins come back, in a nether wastes zombified piglins, ghasts and piglins, in a soul sand valley skeletons and ghasts, in a warped forest endermen (the Nether’s Mobs section has them all)."],
      ["Guarding the gold", both("Opening or breaking a chest, barrel or shulker box, or breaking a block of gold, gilded blackstone or gold ore, turns every piglin within 16 blocks that sees you on you, gold armor or not.",
        "Breaking a chest, barrel or shulker box, a block of gold, gilded blackstone or gold ore turns every piglin within 16 blocks on you, gold armor or not.")],
      ["Piglin brutes", "Always hostile, whatever gold you wear, and they hit hard with golden axes. They don’t barter, and they ignore gold on the ground."],
    ],
    where: {
      biomes: "Nether wastes, crimson forests, warped forests and soul sand valleys: every Nether biome but the basalt deltas.",
      height: "Built up from Y 32, just over the lava sea, whatever the ground there: often half buried in netherrack, now and then standing in the open over the lava. The treasure room reaches up to about Y 80.",
      often: both("The Nether is split into regions of 27 by 27 chunks (432 blocks square), each with a fortress or a bastion remnant, not within 4 chunks of the region’s south and east edges. 3 in 5 are bastions, but not in a basalt delta, where a fortress is made instead. Each of the four kinds is as likely.",
        "The Nether is split into regions of 30 by 30 chunks (480 blocks square), each with a fortress or a bastion remnant, not within 4 chunks of the region’s south and east edges. 2 in 3 are bastions, but not in a basalt delta, where a fortress is made instead. Each of the four kinds is as likely."),
      find: "Look for the big black walls of blackstone; they stand out against the netherrack, though the fog hides anything more than about 12 chunks off. The four regions around the Nether’s middle (0, 0) each hold a fortress or a bastion: finding a fortress rules out a bastion in that region. Wear a piece of gold armor so its piglins leave you alone.",
      danger: both("Piglin brutes attack on sight and hit hard. Opening a chest or breaking gold turns the piglins on you, gold armor or not, and their crossbows reach far. Hoglins in the stables knock you into the air. The treasure room’s walkways run over its lava basin, and lava falls pour out of the gatehouse’s walls.",
        "Piglin brutes attack on sight and hit hard. Breaking a chest or gold turns the piglins on you, gold armor or not, and their crossbows reach far. Hoglins in the stables knock you into the air. The treasure room’s walkways run over its lava basin, and lava falls pour out of the gatehouse’s walls."),
      about: "Gold: about 16 to 27 blocks of gold a bastion, gilded blackstone, and gold in its chests. Netherite: every treasure chest has a Netherite Upgrade (any other chest 1 in 10), the only place it’s found, and a duplicate takes 7 diamonds; and ancient debris, netherite scrap and now and then an ingot. Lodestones: one in every bridge chest. Pigstep: found nowhere else, in 1 in 18 of its plain chests. And the Snout banner pattern and armor trim.",
    },
  },
  {
    // CITY_SHIP: how many cities have an end ship (Java's EndCityPieces, 20,000 built): what's always in a ship is shown as the chance a city has it.
    k: "end_city", n: "End City", dim: "end", icon: "st:purpur_block",
    say: "Towers and houses of purpur on the End’s outer islands, guarded by shulkers, with loot chests at the top, and now and then an end ship moored beside it with an elytra.",
    // How many of each: from Java's EndCityPieces (tools/structure-pieces.py --end-city builds 20,000 cities as it does) and the data
    // markers in its templates; the chests' loot from each edition's own table.
    loot: [
      { k: "chest", n: "Chests", block: "chest", table: "chests/end_city_treasure",
        where: "About 3 a city (0 to 14), in two kinds of rooms: 2 at the top of each fat tower, the widest kind, which 3 cities in 5 have, up a little climb; and 1 in the top floor of a house of three floors, beside an ender chest. 1 city in 5 has none of these." },
      { k: "ship_chest", n: "Ship chests", block: "chest", table: "chests/end_city_treasure",
        where: "2 in the ship’s hold, either side of the elytra. About half the cities have a ship (53%), and never more than one." },
      { k: "elytra", n: "Elytra", block: "item_frame", rows: [["elytra", "", 1, 1, CITY_SHIP]],
        where: "In an item frame on the wall of the ship’s hold, between its two chests: one in every ship, so in about half the cities. It’s found nowhere else.",
        note: "The chance is that a city has it: every ship does, undamaged and unenchanted. Take it out of the frame or break the frame." },
      { k: "dragon_head", n: "Dragon head", block: "dragon_head", rows: [["dragon_head", "", 1, 1, CITY_SHIP]],
        where: "On the ship’s bow, at the far end from the city. The only dragon head in the game: the dragon doesn’t drop one.",
        note: "The chance is that a city has it: every ship does. Mine it with anything to take it." },
      { k: "brewing_stand", n: "Brewing stand", block: "brewing_stand", rows: [["potion", "potion:strong_healing", 2, 2, CITY_SHIP]],
        where: "On a table at the ship’s stern, with two potions in it and no blaze powder.",
        note: "The chance is that a city has them: every ship does. The brewing stand itself can be mined and kept." },
    ],
    lootFacts: [
      ["With a ship", "Cities that have one are bigger on the whole: about 5 chests and 32 shulkers with the ship’s, where a city without has about 2 chests and 15 shulkers."],
      ["Ender chests", "One beside the chest in each three-floor house, about 1 a city: it holds your own ender chest’s things, and needs Silk Touch to keep (else 8 obsidian)."],
      ["Blocks", "Purpur blocks and pillars, end stone bricks, end rods and magenta stained glass: easy to mine for building, as nothing guards them but the shulkers."],
    ],
    mobs: [
      { mob: "shulker", how: "Placed as it’s made, about 24 a city (3 to 96; half have 7 to 35), on the walls, floors and roofs: 2 in each house’s ground floor, 4 up each fat tower, 1 on each tower’s top, and 3 on the ship. They never respawn.", chance: "About 24" },
      { mob: "enderman", how: both("The End’s own spawns go on round and inside it: groups of 4, where no block light reaches.", "The End’s own spawns go on round and inside it: groups of 4, on the surface, in any light."), chance: "Spawns" },
    ],
    mobFacts: [
      ["No spawns of its own", "Its shulkers come with it and stay: they never despawn, even on Peaceful, and none come back once killed. After that only the End’s own mobs spawn there, endermen."],
      ["Shulkers", both("Hidden as purpur blocks in the walls, they open and fire bullets that follow you: 4 damage and Levitation for 10 seconds. Shut, they have 20 armor and arrows bounce off; hit them when they peek out. A shield stops the bullet.",
        "Hidden as purpur blocks in the walls, they open and fire bullets that follow you: 4 damage and Levitation for 10 seconds. Shut, they have 20 armor and arrows bounce off; hit them when they peek out. A shield stops the damage but not the Levitation.")],
      ["More shulkers", both("A shulker hit by a shulker bullet while it’s open (its own included) and over half its health can teleport away and leave a new shulker where it was: less often the more shulkers are within 8 blocks, never with 6 or more. That’s how shells are farmed.",
        "A shulker hit by a shulker bullet while it’s open and over half its health can teleport away and leave a new shulker where it was: less often the more shulkers are within 8 blocks, never with 6 or more. One killed by a shulker bullet always leaves a new one. That’s how shells are farmed.")],
      ["Shulker shells", both("Half of those you kill drop one, a sixteenth more for each level of Looting.", "Half of those you kill drop one; each level of Looting can add one more.")],
    ],
    where: {
      biomes: both("End highlands and end midlands: the big islands of the outer End, about 1,000 blocks out and further. Never on the main island, the small islands or the barrens.",
        "The End, which in Bedrock is one biome all over: on the big islands of the outer End, about 1,000 blocks out and further, never on the main island."),
      height: "Only where the land reaches Y 60 or more at all four corners of a square 5 blocks wide where it starts, so on the high middles of the big islands. Its towers rise about 80 blocks over that (up to about 140), and its bridges reach out about 90 blocks.",
      often: "The End is split into regions of 20 by 20 chunks (320 blocks square), each with one try at a city in its first 9 by 9 chunks, most often in their middle, so two are at least 11 chunks apart. The try fails where the biome or the land isn’t right, so many regions have none.",
      find: "Kill the ender dragon: a gateway opens on the edge of the main island, 96 blocks from its middle (another each time it’s killed, up to 20). Throw an ender pearl into it to be sent about 1,000 blocks out to the outer islands. From there look for tall purple purpur towers and end rods; fly with an elytra once you have one, or bridge between the islands.",
      danger: "Shulker bullets lift you for 10 seconds, then you fall: off a tower or a bridge that can kill you, and below the islands is the void, which takes you and everything you carry. Drink milk to end Levitation, and carry a Slow Falling potion. Endermen are everywhere: don’t look at them, or fight them under a roof two blocks high, which they can’t get under.",
      about: "Elytra: the only place they’re found, one in each ship, so search cities for a ship. Shulker shells from the shulkers: two and a chest make a shulker box. The dragon head, also only on the ships. Diamond and iron gear enchanted at levels 20 to 39, diamonds, the Spire armor trim (1 chest in 15), and the ship’s two Potions of Healing II.",
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
    // Not spawns: the shulker is placed with the end cities (Java's has_structure/end_city: the highlands and midlands), and the
    // endermite comes out of a thrown ender pearl, wherever it lands.
    { mob: "shulker", biomes: ["end_highlands", "end_midlands"], how: "Only in end cities, placed as they’re made, on their walls, floors and roofs. They never respawn.", chance: "End cities" },
    { mob: "endermite", group: "Now and then", how: "Out of a thrown ender pearl where it lands, 1 time in 20, unless monsters are off.", chance: "Pearls" },
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
  "st:blackstone": C("blackstone", "blackstone_top"), "st:gilded_blackstone": C("gilded_blackstone"), "st:polished_blackstone_bricks": C("polished_blackstone_bricks"),
  "st:cracked_polished_blackstone_bricks": C("cracked_polished_blackstone_bricks"), "st:chiseled_polished_blackstone": C("chiseled_polished_blackstone"),
  "st:purpur_block": C("purpur_block"), "st:item_frame": L("item_frame"), "st:brewing_stand": L("brewing_stand"), "st:dragon_head": C("dragon_head_side"),
  "st:prismarine_bricks": C("prismarine_bricks"), "st:gold_block": C("gold_block"), "st:wet_sponge": C("wet_sponge"),
  "st:reinforced_deepslate": C("reinforced_deepslate"), "st:dark_oak_log": C("log_dark_oak", "log_dark_oak_top"), "st:diamond_block": C("diamond_block"), "st:chest_minecart": L("chest_minecart"), "st:rail": L("rail_carried"), "st:furnace": C("furnace_front", "furnace_top", "furnace_side"),
  // The end portal frame: 13 texels tall, its sides' top 3 rows clear.
  "st:end_portal_frame": { boxes: [{ b: [0, 0, 0, 16, 13, 16], faces: [["end_portal_frame"], ["end_portal_frame_top"], ["end_portal_frame"]] }] },
};
for (const [k, spec] of Object.entries(ST_ART)) if (artReady(spec)) ICONS[k] = spec;

// The dragon head as the game draws it: the dragon's own head (the pack's new_ender_dragon model, the same boxes as Java's
// DragonHeadModel): its upper head, snout, closed jaw, nostrils and the two scales on top, in the dragon's texture (256 wide), turned as
// the inventory turns a head (its face to the lower left, as the page's other heads). Until the texture is decoded (dragonHeadTex, set by src/structure-ui.js) it's the plain cube of its scales.
// Each box: lo, hi (game pixels, y down, its foot on the ground, its face toward the camera), uv; the nostrils' and scales' mirroring is left out.
const DRAGON_HEAD_CUBES = [
  { lo: [-8, -16, -1], hi: [8, 0, 15], uv: [112, 30] }, { lo: [-6, -9, -15], hi: [6, -4, 1], uv: [176, 44] }, { lo: [-6, -4, -15], hi: [6, 0, 1], uv: [176, 65] },
  { lo: [-5, -11, -13], hi: [-3, -9, -9], uv: [112, 0] }, { lo: [3, -11, -13], hi: [5, -9, -9], uv: [112, 0] },
  { lo: [-5, -20, 5], hi: [-3, -16, 11], uv: [0, 0] }, { lo: [3, -20, 5], hi: [5, -16, 11], uv: [0, 0] },
];
// A box face's texel in a texture of any width, laid out as skinTexel lays out a box: [s, t].
function boxTexelAt([u, v], [w, h, d], face, fx, fy, fz) {
  [fx, fy, fz] = [fx, fy, fz].map(f => Math.min(f, 0.999));
  return { front: [u + d + fx * w, v + d + fy * h], back: [u + 2 * d + w + (1 - fx) * w, v + d + fy * h], right: [u + (1 - fz) * d, v + d + fy * h],
    left: [u + d + w + fz * d, v + d + fy * h], top: [u + d + fx * w, v + (1 - fz) * d], bottom: [u + d + w + fx * w, v + (1 - fz) * d] }[face].map(Math.floor);
}
let dragonHeadTex = null;
const DRAGON_HEAD_ICON = 64;
function dragonHeadIcon(tex) {
  const lit = 170 * EMITS;
  const boxes = DRAGON_HEAD_CUBES.map(({ lo, hi, uv }) => {
    const size = hi.map((x, i) => x - lo[i]), at = ([x, y, z]) => [x, y + GROUND, z];
    return { lo: at(lo), hi: at(hi), color: (axis, side, fx, fy, fz) => {
      const [s, t] = boxTexelAt(uv, size, FACES[axis][side], fx, fy, fz), i = (t * tex.w + s) * 4;
      // Its eyes and mouth are the texture's glowing texels (alpha 3, as the dragon's lit layer has them): drawn in full light.
      const a = tex.px[i + 3], rgb = tex.px[i] << 16 | tex.px[i + 1] << 8 | tex.px[i + 2];
      return !a ? -1 : a < 255 ? rgb + 255 * EMITS : lit + rgb;
    } };
  });
  const px = renderScene(boxes, { yaw: 0.12 - Math.PI / 4, pitch: 0.5, scale: DRAGON_HEAD_ICON / 34, center: [0, GROUND - 10, 0], origin: [DRAGON_HEAD_ICON / 2, DRAGON_HEAD_ICON / 2], width: DRAGON_HEAD_ICON, height: DRAGON_HEAD_ICON });
  return Array.from({ length: DRAGON_HEAD_ICON * DRAGON_HEAD_ICON }, (_, i) => (px[i * 4 + 3] ? [px[i * 4], px[i * 4 + 1], px[i * 4 + 2]] : null));
}
if (ICONS["st:dragon_head"]) { const plain = ICONS["st:dragon_head"]; ICONS["st:dragon_head"] = { gen: () => (dragonHeadTex ? dragonHeadIcon(dragonHeadTex) : artPixels(plain)) }; }

/* What the loot rows are: each item's group and how it's named. */
// Groups, the best first.
const LOOT_GROUPS = [["best", "Best finds"], ["gear", "Gear"], ["books", "Enchanted books"], ["food", "Food and potions"], ["materials", "Materials"], ["blocks", "Blocks"], ["other", "Everything else"]];
// The rare and best things: what a player would go there for.
const LOOT_BEST = new Set(["enchanted_golden_apple", "wet_sponge", "heavy_core", "trident", "elytra", "heart_of_the_sea", "diamond_block", "emerald_block",
  "netherite_ingot", "netherite_scrap", "ancient_debris", "netherite_upgrade_smithing_template", "saddle", "name_tag", "diamond_horse_armor",
  "golden_apple", "flow_banner_pattern", "guster_banner_pattern", "piglin_banner_pattern", "ominous_trial_key", "trial_key", "totem_of_undying",
  "echo_shard", "sniffer_egg", "music_disc_pigstep", "music_disc_otherside", "music_disc_relic", "music_disc_precipice", "music_disc_creator",
  "music_disc_creator_music_box", "music_disc_13", "music_disc_cat", "music_disc_bounce", "disc_fragment_5", "goat_horn", "dragon_egg",
  "lodestone", "spyglass", "dragon_head"]);
const LOOT_FOOD = new Set(["apple", "baked_potato", "beef", "beetroot", "beetroot_soup", "bread", "cake", "carrot", "cod", "cooked_beef",
  "cooked_chicken", "cooked_cod", "cooked_porkchop", "cooked_salmon", "egg", "glow_berries", "golden_carrot", "honey_bottle", "melon_slice",
  "milk_bucket", "mutton", "poisonous_potato", "porkchop", "potato", "pumpkin_pie", "salmon", "spider_eye", "suspicious_stew",
  "sweet_berries", "wheat", "rotten_flesh", "pufferfish", "tropical_fish", "potion", "splash_potion", "lingering_potion", "ominous_bottle", "experience_bottle", "glistering_melon_slice"]);
const LOOT_MATERIALS = new Set(["amethyst_shard", "blaze_rod", "bone", "bone_meal", "clay_ball", "coal", "copper_ingot", "diamond", "emerald",
  "ender_pearl", "feather", "flint", "gold_ingot", "gold_nugget", "gunpowder", "honeycomb", "ink_sac", "iron_ingot", "iron_nugget", "lapis_lazuli",
  "leather", "magma_cream", "nether_wart", "paper", "prismarine_crystals", "prismarine_shard", "quartz", "rabbit_hide", "redstone", "resin_clump", "stick", "string",
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
  return LOOT_CUBES[id] || LOOT_BLOCKS.has(id) || LOOT_MODELS[id] ? "blocks" : "other";
}
// Blocks drawn as their item's picture, not as cubes.
const LOOT_BLOCKS = new Set(["rail", "powered_rail", "detector_rail", "activator_rail", "torch", "cobweb"]);
// Blocks drawn as their own model: the fence as the inventory shows it (two posts and two bars).
const LOOT_MODELS = {
  oak_fence: { boxes: [[6, 0, 0, 10, 16, 4], [6, 0, 12, 10, 16, 16], [7, 12, 4, 9, 15, 12], [7, 6, 4, 9, 9, 12]].map(b => ({ b, faces: [["oak_planks"], ["oak_planks"], ["oak_planks"]] })) },
};
// Blocks drawn as cubes: [side, top] textures, if not the block's own name for both.
const LOOT_CUBES = {
  tuff: [], moss_block: [], diamond_block: [], emerald_block: [], iron_block: [], gold_block: [], bamboo_planks: [], oak_planks: [],
  acacia_planks: ["planks_acacia"], obsidian: [], scaffolding: ["scaffolding_side", "scaffolding_top"], heavy_core: [],
  gilded_blackstone: [], crying_obsidian: [], lodestone: ["lodestone_side", "lodestone_top"], ancient_debris: ["ancient_debris_side", "ancient_debris_top"],
  bone_block: ["bone_block_side", "bone_block_top"], soul_sand: [], crimson_nylium: ["crimson_nylium_side", "crimson_nylium_top"], glowstone: [],
  deepslate: [], sculk: [], sculk_catalyst: [], packed_ice: [], glass: [], tnt: ["tnt_side", "tnt_top"],
  prismarine: ["prismarine_rough"], prismarine_bricks: [], dark_prismarine: ["prismarine_dark"], sea_lantern: [], wet_sponge: [],
};
// Items whose picture is called otherwise in art/.
const LOOT_ART = { crossbow: "crossbow_standby", enchanted_golden_apple: "golden_apple", buried_trial_chambers_map: "trial_explorer_map",
  netherite_upgrade_smithing_template: "netherite_upgrade", diamond_spear: "spear", iron_chain: "chain", soul_torch: "soul_torch_carried",
  rail: "rail_carried", powered_rail: "powered_rail_carried", detector_rail: "detector_rail_carried", activator_rail: "activator_rail_carried",
  buried_mineshaft_map: "mineshaft_explorer_map", allium: "flower_allium", dark_oak_sapling: "sapling_dark_oak" };
// What's placed with a structure and isn't in any loot table (a box's rows), named as Java's en_us.json names it.
Object.assign(STRUCTURE_NAMES.items, { elytra: "Elytra", dragon_head: "Dragon Head", wooden_shovel: "Wooden Shovel", deepslate: "Deepslate", oak_fence: "Oak Fence",
  allium: "Allium", glass: "Glass", prismarine: "Prismarine", prismarine_bricks: "Prismarine Bricks", dark_prismarine: "Dark Prismarine",
  sea_lantern: "Sea Lantern", wet_sponge: "Wet Sponge", prismarine_shard: "Prismarine Shard", pufferfish: "Pufferfish", tropical_fish: "Tropical Fish",
  tide_armor_trim_smithing_template: "Tide Armor Trim Template" });
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
    const cube = LOOT_CUBES[id], spec = LOOT_MODELS[id] || (cube ? C(cube[0] || id, cube[1] || cube[0] || id) : L(LOOT_ART[id] || id));
    ICONS[key] = artReady(spec) ? spec : ICONS["ui:book"];
  }
  return key;
}
