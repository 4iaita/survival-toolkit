/* ---------- Decorated Pots: what the tab knows ----------
 * From the games' own files (Java 26.3's from misode/mcmeta: the recipes decorated_pot and decorated_pot_simple, the tags
 * decorated_pot_ingredients, decorated_pot_sherds, breaks_decorated_pots and prevents_decorated_pot_shattering, the loot tables
 * archaeology/* and blocks/decorated_pot, the trial chambers' decor pool and pots, the trail ruins' processors, the item components and
 * en_us.json; Bedrock's from Mojang/bedrock-samples: the brushable blocks' loot tables, pots/trial_chambers/corridor and en_US.lang) and
 * the Minecraft Wiki (Decorated Pot, Pottery Sherd, Archaeology). The pot's textures are the pack's (import_pots.py, art/pots/).
 */

// The sides, in the order the game lists them (Java's tooltip, its pot_decorations component, the recipe's keys), and the crafting
// grid's slot (0 to 8, row by row) that puts its sherd there: Java's recipe crafting_decorated_pot names the four, its code places
// them (the top middle is the back, the bottom middle the front, the left and right as seen with the front nearest you).
const POT_SIDES = ["back", "left", "right", "front"];
const POT_SLOT = { back: 1, left: 3, right: 5, front: 7 };
const POT_SLOT_SAY = { back: "Top middle", left: "Middle left", right: "Middle right", front: "Bottom middle" };

// The archaeology sites: where, the block, the loot table in each edition, and how many suspicious blocks it has.
const POT_SITES = {
  desert_pyramid: { n: "Desert pyramid", block: "sand", java: "archaeology/desert_pyramid", bedrock: "desert_pyramid_brushable_block",
    where: "In a desert pyramid’s suspicious sand." },
  desert_well: { n: "Desert well", block: "sand", java: "archaeology/desert_well", bedrock: "desert_well_brushable_block",
    where: "In a desert well’s suspicious sand." },
  ocean_ruin_warm: { n: "Warm ocean ruins", block: "sand", java: "archaeology/ocean_ruin_warm", bedrock: "warm_ocean_ruins_brushable_block",
    where: "In the suspicious sand round warm (sandstone) ocean ruins." },
  ocean_ruin_cold: { n: "Cold ocean ruins", block: "gravel", java: "archaeology/ocean_ruin_cold", bedrock: "cold_ocean_ruins_brushable_block",
    where: "In the suspicious gravel round cold (stone brick) ocean ruins." },
  trail_ruins_rare: { n: "Trail ruins", block: "gravel", java: "archaeology/trail_ruins_rare", bedrock: "trail_ruins_brushable_block_rare",
    where: "In the rare suspicious gravel of trail ruins’ buildings: up to 3 in each, beside up to 6 of the common kind, which has no sherds." },
  trial_chambers: { n: "Trial chambers", block: "pot",
    where: "On the back of a decorated pot standing in a trial chamber: 1 pot in 13 has one of these three, the rest are plain. Break it to get it." },
};

// Every sherd, in the game's order (alphabetical, as the creative inventory and Bedrock's list have them). k: its id (the item is
// <k>_pottery_sherd, its pattern <k>_pottery_pattern, its name "<Name> Pottery Sherd" in both editions); say: what its picture shows;
// site: where it's found (POT_SITES); chance: for each suspicious block brushed there (the same in both editions' loot tables), or for
// each trial chamber decorated pot.
const SHERDS = [
  { k: "angler", n: "Angler", say: "A fishing rod with a fish on the hook", site: "ocean_ruin_warm", chance: "6.7%" },
  { k: "archer", n: "Archer", say: "A bow and arrow", site: "desert_pyramid", chance: "12.5%" },
  { k: "arms_up", n: "Arms Up", say: "Someone with their arms up", site: "desert_well", chance: "25%" },
  { k: "blade", n: "Blade", say: "A sword", site: "ocean_ruin_cold", chance: "6.7%" },
  { k: "brewer", n: "Brewer", say: "A potion", site: "desert_well", chance: "25%" },
  { k: "burn", n: "Burn", say: "A flame", site: "trail_ruins_rare", chance: "8.3%" },
  { k: "danger", n: "Danger", say: "A creeper", site: "trail_ruins_rare", chance: "8.3%" },
  { k: "explorer", n: "Explorer", say: "A map", site: "ocean_ruin_cold", chance: "6.7%" },
  { k: "flow", n: "Flow", say: "A spiral of wind", site: "trial_chambers", chance: "1 in 13" },
  { k: "friend", n: "Friend", say: "A friendly face", site: "trail_ruins_rare", chance: "8.3%" },
  { k: "guster", n: "Guster", say: "A breeze", site: "trial_chambers", chance: "1 in 13" },
  { k: "heart", n: "Heart", say: "A heart", site: "trail_ruins_rare", chance: "8.3%" },
  { k: "heartbreak", n: "Heartbreak", say: "A broken heart", site: "trail_ruins_rare", chance: "8.3%" },
  { k: "howl", n: "Howl", say: "A wolf howling", site: "trail_ruins_rare", chance: "8.3%" },
  { k: "miner", n: "Miner", say: "A pickaxe", site: "desert_pyramid", chance: "12.5%" },
  { k: "mourner", n: "Mourner", say: "A warden", site: "ocean_ruin_cold", chance: "6.7%" },
  { k: "plenty", n: "Plenty", say: "A chest", site: "ocean_ruin_cold", chance: "6.7%" },
  { k: "prize", n: "Prize", say: "A diamond", site: "desert_pyramid", chance: "12.5%" },
  { k: "scrape", n: "Scrape", say: "An axe", site: "trial_chambers", chance: "1 in 13" },
  { k: "sheaf", n: "Sheaf", say: "A sheaf of wheat", site: "trail_ruins_rare", chance: "8.3%" },
  { k: "shelter", n: "Shelter", say: "A tree", site: "ocean_ruin_warm", chance: "6.7%" },
  { k: "skull", n: "Skull", say: "A skull", site: "desert_pyramid", chance: "12.5%" },
  { k: "snort", n: "Snort", say: "A sniffer", site: "ocean_ruin_warm", chance: "6.7%" },
];
const sherd = k => SHERDS.find(s => s.k === k);
// What else each site's table has, so a reader knows what the rest of the brushing turns up (both editions' tables are the same).
const POT_SITE_OTHERS = {
  desert_pyramid: "Otherwise a diamond, an emerald, gunpowder or TNT (12.5% each).",
  desert_well: "Otherwise a brick, an emerald, a stick or a suspicious stew (12.5% each).",
  ocean_ruin_warm: "Otherwise coal, an emerald, wheat, a wooden hoe or a gold nugget (13.3% each), an iron axe or a sniffer egg (6.7% each).",
  ocean_ruin_cold: "Otherwise coal, an emerald, wheat, a wooden hoe or a gold nugget (13.3% each), or an iron axe (6.7%).",
  trail_ruins_rare: "Otherwise one of four armor trim templates (Host, Raiser, Shaper, Wayfinder) or the Relic music disc (8.3% each).",
  trial_chambers: "The pot holds a find of its own: an emerald, arrows, iron, a trial key or better.",
};

// What a trial chamber's decorated pots hold (pots/trial_chambers/corridor, the same in both editions): [item, count, chance].
// The last is its picture in art/.
const POT_TRIAL_LOOT = [["Emerald", "1–3", "35.6%", "emerald"], ["Arrow", "2–8", "28.5%", "arrow"], ["Iron Ingot", "1–2", "28.5%", "iron_ingot"],
  ["Trial Key", "1", "2.8%", "trial_key"], ["Music Disc (Creator, Music Box)", "1", "1.4%", "music_disc_creator_music_box"], ["Diamond", "1–2", "1.4%", "diamond"],
  ["Block of Emerald", "1", "1.4%", "emerald_block", true], ["Block of Diamond", "1", "0.3%", "diamond_block", true]];

// How it's all done, by edition where it differs (both() is gear-data.js's).
const POT_FACTS = {
  craft: "Craft it from 4 pottery sherds or bricks, in any mix, laid out as a diamond round the middle of a crafting grid. The middle and the corners stay empty.",
  sides: "The top slot is the pot’s back, the bottom slot its front, and the middle left and right slots its left and right as you face its front: the grid is the pot seen from above with its front nearest you.",
  simple: "With 4 bricks it’s a plain pot. The recipe book has it as a recipe of its own, as 4 bricks in a diamond match both.",
  place: "A placed pot faces you: its front is the side turned to whoever placed it.",
  store: "It holds one stack of one kind of item: use an item on it to put it in (an unstackable item fills it on its own). It has no menu: hoppers, droppers and crafters can put items in, and only breaking it, or a hopper or hopper minecart under it, takes them out.",
  comparator: "A comparator reads how full it is.",
  wobble: both("It wobbles each time it’s used: a little lean when an item goes in, and a shake (\"Decorated Pot wobbles\") when it can’t take it, being full or holding another item, or when it’s used with an empty hand. Each sets off a vibration of frequency 11.",
    "It wobbles each time it’s used: when an item goes in, and when it can’t take it, being full or holding another item, or when it’s used with an empty hand. Each sets off a vibration of frequency 11."),
  break: "Broken with a sword, axe, pickaxe, shovel, hoe, mace or trident, it shatters: it drops its 4 sherds and bricks, not the pot. Broken by hand, or with a tool with Silk Touch, it drops itself, sherds and all. It breaks at once, and the tool loses no durability.",
  shatter: both("Arrows (tipped and spectral too), tridents, firework rockets, snowballs, eggs, fireballs, the wither’s skulls, wind charges, and an elytra flight boosted by a rocket shatter it as well. A shattered pot is marked cracked, so it drops its sherds whatever broke it.",
    "Arrows (tipped and spectral too), tridents, firework rockets, snowballs, eggs, fireballs, the wither’s skulls, wind charges, and an elytra flight boosted by a rocket shatter it as well."),
  inside: "Whatever it holds drops when it breaks, whichever way.",
  push: "A piston or an explosion breaks it, and it drops itself: it never shatters that way.",
  water: "It can be waterlogged, and doesn’t burn. Its top has no collision box, so things can be placed on it, but nothing grows in it: that’s a flower pot.",
  mobs: both("Mobs’ arrows and other projectiles don’t break it now; from 26.4 they will in adventure mode, unless the mob_griefing gamerule is off.", null),
  advance: both("“Respecting the Remnants”: brush a suspicious block to get a sherd. “Careful Restoration”: make a decorated pot from 4 sherds.",
    "Achievements: “Careful Restoration”, make a decorated pot from 4 sherds."),
  tooltip: "Under its name the game lists the 4 sides in gray, back, left, right then front, bricks as Brick. A plain pot lists nothing.",
  brick: "A brick is clay baked in a furnace. Bricks are also brushed out of desert wells (12.5%) and the common suspicious gravel of trail ruins (4.4%).",
  brush: "Craft a brush from a feather, a copper ingot and a stick. Brushing a suspicious block slowly uncovers what’s in it; if the block falls or is broken first, the find is lost. Each block uses 1 of the brush’s 64 durability.",
  rarity: "Sherds are uncommon (their names are yellow), stack to 64 and can’t be made: every one in the world was brushed out or broken off a pot.",
};
