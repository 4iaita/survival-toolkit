/* ---------- Potion facts ----------
 * What the Potions tab tells about each potion besides its brewing (src/brew-data.js), from the Minecraft Wiki. A text that
 * differs by edition is { java, bedrock }; a source that only one edition has says ed. Health is told in hearts.
 */
// Each effect: what it does at the levels potions give it.
const EFFECT_LEVELS = {
  "Speed": { 1: "Walk and sprint 20% faster", 2: "Walk and sprint 40% faster" },
  "Jump Boost": { 1: "Jump about 1¾ blocks high; falls hurt half a heart less", 2: "Jump 2½ blocks high; falls hurt 1 heart less" },
  "Strength": { 1: { java: "+1½ hearts of melee damage", bedrock: "30% more melee damage, and half a heart on top" },
    2: { java: "+3 hearts of melee damage", bedrock: "69% more melee damage, and a little over 1 heart on top" } },
  "Instant Health": { 1: "Heals 2 hearts at once", 2: "Heals 4 hearts at once" },
  "Regeneration": { 1: "Heals half a heart every 2.5 seconds", 2: "Heals half a heart every 1.25 seconds" },
  "Fire Resistance": { 1: "No damage from fire, lava, magma blocks or blaze fireballs" },
  "Water Breathing": { 1: "Air doesn’t run out underwater" },
  "Night Vision": { 1: "Dark places look nearly fully lit, and water is clear" },
  "Invisibility": { 1: "Your body can’t be seen, and mobs notice you from much nearer" },
  "Slow Falling": { 1: "Fall slowly and take no fall damage" },
  "Slowness": { 1: "Move 15% slower", 4: "Move 60% slower", 6: "Move 90% slower" },
  "Resistance": { 3: "Take 60% less damage", 4: "Take 80% less damage" },
  "Instant Damage": { 1: "Deals 3 hearts at once", 2: "Deals 6 hearts at once" },
  "Poison": { 1: "Deals half a heart every 1.25 seconds", 2: "Deals half a heart every 0.6 seconds" },
  "Weakness": { 1: { java: "−2 hearts of melee damage", bedrock: "About 20% less melee damage" } },
  "Wind Charged": { 1: "Lets out a burst of wind on death, like a thrown wind charge" },
  "Weaving": { 1: "Leaves 2–3 cobwebs around on death, and moves through cobwebs twice as fast" },
  "Oozing": { 1: "Splits into 2 medium slimes on death" },
  "Infested": { 1: "10% chance to spawn 1–2 silverfish each time it’s hurt" },
};
// The effects with an icon in the pack (art/effects/); instant ones have none in the game either.
const EFFECT_ICONS = {
  "Speed": "speed", "Jump Boost": "jump_boost", "Strength": "strength", "Regeneration": "regeneration", "Fire Resistance": "fire_resistance",
  "Water Breathing": "water_breathing", "Night Vision": "night_vision", "Invisibility": "invisibility", "Slow Falling": "slow_falling",
  "Slowness": "slowness", "Resistance": "resistance", "Poison": "poison", "Weakness": "weakness", "Wind Charged": "wind_charged",
  "Weaving": "weaving", "Oozing": "oozing", "Infested": "infested",
};
const NO_BOSSES = "The Wither and the ender dragon.";

// good: what it's good for. about: what to know. immune: what it doesn't work on. also: other ways to get the effect.
const POTION_INFO = {
  swiftness: {
    good: "Getting about on foot, and keeping your distance in a fight.",
    about: "It widens the field of view. Slimes and magma cubes with it jump farther.",
    also: "A beacon gives Speed I, or Speed II on a full pyramid.",
    immune: "The Wither and the ender dragon; flying mobs and shulkers aren’t sped up." },
  leaping: {
    good: "Climbing hills, and jumping a fence or a wall.",
    about: "The higher jump also softens falls a little.",
    also: "A beacon gives Jump Boost I, or II on a full pyramid. Suspicious stew made with a cornflower gives it for a few seconds.",
    immune: "The Wither and the ender dragon; flying mobs and shulkers don’t jump higher." },
  strength: {
    good: "Sword and axe fights, bosses above all.",
    about: { java: "Only melee hits count: bows, crossbows, tridents that are thrown and a spear’s charge don’t change.", bedrock: "Only melee hits count: bows, crossbows and thrown tridents don’t change. With Weakness too, Strength is worked out first." },
    also: "A beacon gives Strength I on a pyramid of 3 levels, II on a full one. A zombie villager being cured has it.",
    immune: NO_BOSSES },
  healing: {
    good: "A quick rescue in a fight, for you or (as a splash potion) for friends, villagers and pets. A splash of it hurts undead mobs.",
    about: "Undead mobs (zombies, skeletons, phantoms, the Wither and their kin) are hurt by it instead. It works at once, so it can’t be extended.",
    also: "Nothing else gives it: there’s no food or beacon for it.",
    immune: "The ender dragon." },
  regeneration: {
    good: "Long fights, drunk before they start. A full Regeneration I heals about 9 hearts.",
    about: "The level II one heals as much in half the time.",
    also: "Golden apples, a totem of undying, a beacon on a full pyramid (as its second power), a villager whose trade you unlock, and suspicious stew made with an oxeye daisy.",
    immune: "The ender dragon and all undead mobs." },
  fire_resistance: {
    good: "The Nether: swimming in lava, fighting blazes and gathering magma.",
    about: { java: "You still catch fire, it just doesn’t hurt. A ghast fireball’s blast and a blaze’s melee hit still do.", bedrock: "You don’t even catch fire. A ghast fireball’s blast and a blaze’s melee hit still hurt." },
    also: "An enchanted golden apple (5 minutes), a totem of undying, and suspicious stew made with an allium.",
    immune: "The Wither and the ender dragon; Nether mobs that don’t burn have no use for it." },
  water_breathing: {
    good: "Ocean monuments, shipwrecks and building underwater.",
    about: "It doesn’t help you see or mine underwater: add Night Vision, and Aqua Affinity on the helmet.",
    also: "A turtle shell worn as a helmet gives 10 seconds for each dive, and a conduit’s power does much the same nearby.",
    immune: "The Wither and the ender dragon; undead and water mobs don’t drown anyway." },
  night_vision: {
    good: "Caving, the Nether and seeing underwater.",
    about: "It only changes what you see: the dark is still dark, so mobs spawn in it.",
    also: "Suspicious stew made with a poppy or a torchflower gives it for 5 seconds.",
    immune: "All mobs: it does nothing for them." },
  invisibility: {
    good: "Walking past mobs, and surprising other players.",
    about: "Take your armor off: each piece, the item in your hand and the effect’s particles can still be seen. With no armor, mobs notice you from 7% of the usual distance; each piece worn adds to that, up to 70% with all four.",
    also: "Nothing else gives it to a player.",
    immune: "The Wither and the ender dragon. Wardens, cats and villagers notice you as ever." },
  slow_falling: {
    good: "The End: the dragon’s fling, shulkers and the edges of the islands. And building high up.",
    about: "Running jumps clear 5 blocks, not 4, and you don’t trample crops. Critical hits and a mace’s smash don’t work while you have it, and an ender pearl still hurts.",
    also: "Nothing else gives it.",
    immune: "The Wither and the ender dragon; flying mobs and shulkers don’t fall." },
  turtle_master: {
    good: "Holding your ground for a few seconds, as a tank with a shield would.",
    about: "Two effects at once, so you can hardly walk while you have it. Resistance doesn’t help against hunger or the void, and armor wears as usual.",
    also: "A beacon gives Resistance I or II, and an enchanted golden apple Resistance I. Nothing else gives both.",
    immune: NO_BOSSES },
  slowness: {
    good: "Thrown at mobs or players to keep them from reaching you, or from getting away.",
    about: "It slows walking, sprinting, sneaking and swimming, not jumping, falling or flying. The level II version of this potion gives Slowness IV.",
    also: "A stray’s arrows, and Bane of Arthropods on spiders, silverfish, endermites and bees.",
    immune: "The Wither and the ender dragon; flying mobs and shulkers." },
  harming: {
    good: "Damage that armor doesn’t lower. Splash it to hurt a group, or to heal undead ones.",
    about: "Only Resistance and Protection lower the damage. Undead mobs are healed by it instead. It works at once, so it can’t be extended.",
    also: "Nothing else gives it: there’s no food or beacon for it.",
    immune: { java: "The ender dragon, unless a player threw it. Witches take 85% less.", bedrock: "The ender dragon, unless a player threw it. Witches take 95% less." } },
  poison: {
    good: "Wearing a mob or player down to half a heart.",
    about: "It can’t kill: it stops at half a heart. Milk or a honey bottle ends it.",
    also: "Spider eyes, pufferfish and poisonous potatoes if you eat them; cave spiders, bees and the bogged’s arrows.",
    immune: "The ender dragon, spiders, cave spiders, nautiluses and all undead mobs." },
  weakness: {
    good: "Curing a zombie villager: splash it, then use a golden apple on it.",
    about: "It’s the only potion with an effect that starts from a plain water bottle. A hit weakened to nothing doesn’t connect at all.",
    also: "The parched’s arrows, and suspicious stew made with a tulip.",
    immune: { java: "The Wither, the ender dragon and the parched.", bedrock: NO_BOSSES } },
  wind_charging: {
    good: "Traps and pranks: what dies with it throws everyone near it.",
    about: "The burst does no damage by itself. It has no stronger or longer version.",
    also: "Nothing else gives it.",
    immune: "The Wither, the ender dragon and creakings tied to a heart." },
  weaving: {
    good: "Getting cobwebs: it’s the only renewable source of them. And walking through them faster.",
    about: "The cobwebs land on top of solid blocks in the 3×3×3 space around it. With mob griefing off, only players leave any.",
    also: "Nothing else gives it.",
    immune: "The Wither and the ender dragon. Spiders aren’t slowed by cobwebs anyway." },
  oozing: {
    good: "Slimeballs far from a swamp: kill mobs that have it.",
    about: { java: "No slimes come where 24 of them are already crowded together (the entity cramming limit).", bedrock: "The slimes are medium ones, so each splits again into small ones." },
    also: "Nothing else gives it.",
    immune: "Slimes, the Wither, the ender dragon and creakings tied to a heart." },
  infestation: {
    good: "Silverfish for a farm, or a nasty surprise in a fight.",
    about: "Any hit counts, even one that takes no health (a snowball on a snow golem).",
    also: "Nothing else gives it.",
    immune: "Silverfish, the Wither, the ender dragon and creakings tied to a heart." },
  water: {
    good: "The start of every potion. Used on dirt, coarse dirt or rooted dirt it makes mud.",
    about: { java: "Splashed, it puts out fire on the block it hits and the four beside it, and burning mobs too, and hurts endermen, blazes, striders and snow golems half a heart. The lingering one makes no cloud.",
      bedrock: "Splashed, it puts out fire on the block it hits and the four beside it, and burning mobs too, and hurts endermen, blazes, striders and snow golems half a heart. The lingering one leaves a cloud that puts out burning mobs." } },
  awkward: {
    good: "The start of every potion with an effect, except Weakness.",
    about: "It has no effect of its own." },
  mundane: {
    good: { java: "Nothing: it’s a dead end.", bedrock: "Only Weakness: brew it with a fermented spider eye." },
    about: "It’s what comes of putting redstone, sugar, a rabbit’s foot, a glistering melon slice, a spider eye, magma cream, blaze powder, a ghast tear, a breeze rod, stone, a cobweb or a slime block straight into a water bottle: the nether wart was forgotten." },
  thick: {
    good: { java: "Nothing: it’s a dead end.", bedrock: "Only Weakness: brew it with a fermented spider eye." },
    about: "It’s what comes of putting glowstone dust straight into a water bottle: the nether wart was forgotten." },
};

// Other ways to brew a potion than the plan's.
const BREW_ALT = {
  slowness: "Leaping works in place of Swiftness. An extended one stays extended, but a level II one can’t be corrupted.",
  harming: "Poison works in place of Healing.",
  invisibility: "Adding the fermented spider eye to an extended Night Vision gives an extended Invisibility.",
  weakness: { bedrock: "The fermented spider eye also works on an Awkward, Mundane or Thick Potion." },
  mundane: "Any of the ingredients in Good to know works in place of the redstone dust.",
};

// Where to get each brewing ingredient.
const INGREDIENT_FROM = {
  water_bottle: "Fill a glass bottle at any water",
  nether_wart: "Nether fortresses and bastions; grows on soul sand",
  sugar: "Craft from sugar cane or a honey bottle; witches",
  rabbit_foot: "Rabbits, 10% of the time",
  glistering_melon: "Craft from a melon slice and 8 gold nuggets",
  blaze_powder: "Craft from a blaze rod; blazes drop them",
  ghast_tear: "Ghasts drop 0–1",
  magma_cream: "Magma cubes, or craft from blaze powder and a slimeball",
  pufferfish: "Fishing, or pufferfish in warm oceans",
  golden_carrot: "Craft from a carrot and 8 gold nuggets; farmers sell it",
  turtle_shell: "Craft from 5 turtle scutes; baby turtles drop one as they grow up",
  phantom_membrane: "Phantoms; a cat’s morning gift",
  spider_eye: "Spiders, cave spiders and witches",
  fermented_spider_eye: "Craft from a spider eye, a brown mushroom and sugar",
  breeze_rod: "Breezes in trial chambers drop 1–2",
  cobweb: "Mineshafts and strongholds, cut with shears",
  slime_block: "Craft from 9 slimeballs",
  stone: "Smelt cobblestone",
  redstone: "Redstone ore deep underground; witches",
  glowstone: "Glowstone in the Nether; witches",
  gunpowder: "Creepers, ghasts and witches",
  dragon_breath: "A glass bottle used on the ender dragon’s breath",
};

// Where a potion turns up ready-made: the place or mob (n) with its icon, what's there and how likely; form is the bottle
// when it isn't the drinkable one, and ed the edition if only one has it.
const WITCH = { icon: "src:witch", n: "Witch", what: "Dropped if killed while drinking it" };
const CAMP = { icon: "src:chest", n: "Abandoned camp", what: "1 in its secret chest", chance: "36%" };
const DISPENSER = [["splash", "Splash, 2–5 in a chamber’s dispenser"], ["lingering", "Lingering, 2–5 in a chamber’s dispenser"]]
  .map(([form, what]) => ({ icon: "src:dispenser", n: "Trial chambers", form, what, chance: "3.4%" }));
const HUT = chance => ({ icon: "src:cauldron", n: "Swamp hut", what: "1–3 bottles in its cauldron", chance, ed: "bedrock" });
const SUPPLY = { icon: "src:chest", n: "Trial chambers", what: "2 in a supply chest", chance: "20.4%" };
const SPAWNER = { icon: "src:spawner", n: "Trial spawner", what: "1 as a reward", chance: "5%" };
const OMINOUS = { icon: "src:spawner", n: "Ominous trial spawner", what: "1 thrown during the fight", chance: "7%" };
const POTION_SOURCES = {
  swiftness: [WITCH, CAMP, SPAWNER, HUT("15%")],
  leaping: [CAMP],
  strength: [SUPPLY, OMINOUS],
  healing: [{ icon: "src:end", n: "End city ship", what: "2 Healing II on its brewing stand", chance: "Always" }, WITCH, CAMP,
    DISPENSER[1], HUT("25%")],
  regeneration: [{ icon: "src:ancient", n: "Ancient city", what: "1–3 in a chest", chance: "36%" }, SUPPLY, SPAWNER, OMINOUS],
  fire_resistance: [WITCH, { icon: "src:piglin", n: "Piglin", what: "Bartered for a gold ingot", chance: "1.7%" },
    { icon: "src:piglin", n: "Piglin", form: "splash", what: "Splash, bartered for a gold ingot", chance: "1.7%" }, HUT("5%")],
  water_breathing: [{ icon: "src:chest", n: "Buried treasure", what: "1 in the chest", chance: "66.7%" }, WITCH, HUT("10%")],
  night_vision: [CAMP],
  invisibility: [{ icon: "src:trader", n: "Wandering trader", what: "Sells an extended one (8:00) for 5 emeralds", chance: "13%" },
    { icon: "src:trader", n: "Wandering trader", what: "Dropped if killed while drinking it" }],
  slowness: [...DISPENSER, HUT("10%")],
  poison: [...DISPENSER, HUT("25%")],
  weakness: [{ icon: "src:igloo", n: "Igloo", form: "splash", what: "1 splash potion on the basement’s brewing stand", chance: "Always" }, ...DISPENSER, HUT("10%")],
  water: [{ icon: "src:water", n: "Any water", what: "Use a glass bottle on it", chance: "Always" },
    { icon: "src:piglin", n: "Piglin", what: "Bartered for a gold ingot", chance: "2.1%" }, { icon: "src:rod", n: "Fishing", what: "Now and then, as junk" }],
};
// Witches throw these as splash potions, with when.
const WITCH_THROWS = {
  slowness: "Witches throw it at you from 8 blocks or more.", poison: "Witches throw it at you while you have 4 hearts or more.",
  weakness: "Witches throw it at you now and then from under 3 blocks.", harming: "Witches throw it at you when nothing else fits.",
  healing: "In raids, witches throw it at hurt illagers.", regeneration: "In raids, witches throw it at illagers and ravagers.",
};
// The arrows found ready-made.
const drops = (icon, n) => ({ icon, n, what: "0–1, if a player kills it", chance: "50%" });
const ARROW_SOURCES = {
  slowness: [drops("src:stray", "Stray"), { icon: "src:chest", n: "Trial chambers", what: "4–8 in a supply chest", chance: "20.4%" },
    { icon: "src:vault", n: "Ominous vault", what: "4–12 of Slowness IV", chance: "37.5%" }],
  poison: [drops("src:bogged", "Bogged"), { icon: "src:chest", n: "Trial chambers", what: "4–8 in a supply chest", chance: "20.4%" },
    { icon: "src:vault", n: "Vault", what: "2–8", chance: { java: "31%", bedrock: "37.8%" } }],
  weakness: [drops("src:parched", "Parched")],
};
// Bedrock's fletchers don't sell arrows of these.
const FLETCHER_SKIPS = new Set(["slow_falling", "wind_charging", "weaving", "oozing", "infestation"]);

// How each kind of bottle is used, under the table of versions.
const FORM_FACTS = {
  drink: { n: "Drinkable", text: "Takes 1.6 seconds to drink and gives the glass bottle back. Drinking another one starts its time over; it doesn’t add up." },
  splash: { n: "Splash", text: "Thrown. Everything within 4 blocks of where it breaks gets it: the farther off, the shorter (or, for Healing and Harming, the weaker)." },
  lingering: { n: "Lingering", text: "Thrown. Leaves a cloud 3 blocks wide each way that shrinks away over 30 seconds, sooner with each one it touches. Effects last a quarter as long; Healing and Harming are half as strong." },
  arrow: { n: "Tipped arrow", text: "Gives the effect to what it hits, for an eighth of the time. Infinity doesn’t save tipped arrows." },
};
const BREW_RULES = [
  ["", "Each step puts one ingredient in the top slot and brews up to three bottles below it. A step takes 20 seconds and uses one charge of fuel; one blaze powder gives 20 charges."],
  ["", "Craft a brewing stand from a blaze rod and 3 cobblestone (blackstone or cobbled deepslate works too), or find one in a village church, an igloo’s basement or an end city ship."],
  ["", "Most potions start as an Awkward Potion: water bottles brewed with nether wart. Weakness is the exception and starts straight from water bottles."],
  ["", "Redstone Dust makes the effect last longer. Glowstone Dust makes it stronger but shorter. A potion takes one or the other, not both."],
  ["", "A Fermented Spider Eye corrupts a potion into another one, such as Swiftness into Slowness or Night Vision into Invisibility."],
  ["", "Gunpowder turns a potion into a splash potion with the same duration. Dragon’s Breath turns a splash potion into a lingering one, whose cloud gives a quarter of the duration."],
  ["bedrock", "On Bedrock, extended Regeneration and Poison last 2:00 instead of Java’s 1:30, and Poison II lasts 0:22 instead of 0:21."],
];
