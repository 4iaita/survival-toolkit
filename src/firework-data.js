/* ---------- Fireworks: what the tab knows ----------
 * From the games' own files: Java 26.3's from misode/mcmeta (the recipes firework_star, firework_star_fade, firework_rocket and
 * firework_rocket_simple, the item tags skulls and dyes, en_us.json, the star's item model) and Bedrock's from Mojang/bedrock-samples
 * (texts/en_US.lang). Neither game's loot tables or trades have a firework in them. Bedrock's firework recipes aren't in
 * bedrock-samples, and the explosion colors, heights, damage and the rest are in the games' code: those are from the Minecraft Wiki
 * (Firework Rocket, Firework Star, Dye, Crossbow, Elytra, Data component format).
 */

// The dyes in the game's own order (the creative inventory's), as DYES and BANNER_COLORS have them.
const FW_DYES = ["white", "light gray", "gray", "black", "brown", "red", "orange", "yellow", "lime", "green", "cyan", "light blue", "blue", "purple", "magenta", "pink"];
// The color each dye gives an explosion (the wiki's Dye page: "firework color", the same in both editions). Not the dye's own color.
const FW_COLORS = {
  white: "#f0f0f0", orange: "#eb8844", magenta: "#c354cd", "light blue": "#6689d3", yellow: "#decf2a", lime: "#41cd34",
  pink: "#d88198", gray: "#434343", "light gray": "#ababab", cyan: "#287697", purple: "#7b2fbe", blue: "#253192",
  brown: "#51301a", green: "#3b511a", red: "#b3312c", black: "#1e1b1b",
};
// A star with no color: the item model's default tint (Java's -7697782).
const FW_NO_COLOR = "#8a8a8a";

// The shapes, in Java's order (Bedrock numbers them the same, type.0 to type.4). k: Java's id; java and be: the tooltip's words (en_us.json,
// en_US.lang); item: what the star is crafted with for it (Java's recipe firework_star: its shapes); say: what it looks like.
const FW_SHAPES = [
  { k: "small_ball", java: "Small Ball", be: "Small ball explosion", item: null, say: "A small sphere of sparks. Every star is one, unless it gets something else." },
  { k: "large_ball", java: "Large Ball", be: "Large ball explosion", item: "fire_charge", say: "A sphere of sparks, about twice as big." },
  { k: "star", java: "Star-shaped", be: "Star-shaped explosion", item: "gold_nugget", say: "A five-pointed star of sparks." },
  { k: "creeper", java: "Creeper-shaped", be: "Creeper-shaped explosion", item: "head", say: "A creeper’s face of sparks." },
  { k: "burst", java: "Burst", be: "Burst explosion", item: "feather", say: "A spray of sparks shooting out every way." },
];
const fwShape = k => FW_SHAPES.find(s => s.k === k);

// What goes in a star, as the games name it. heads: Java's tag skulls (every head and skull).
const FW_ITEMS = {
  gunpowder: { n: "Gunpowder", icon: "fw:gunpowder" },
  paper: { n: "Paper", icon: "fw:paper" },
  fire_charge: { n: "Fire Charge", icon: "fw:fire_charge" },
  gold_nugget: { n: "Gold Nugget", icon: "fw:gold_nugget" },
  head: { n: "Creeper Head", icon: "fw:head", any: "or any other head or skull" },
  feather: { n: "Feather", icon: "fw:feather" },
  diamond: { n: "Diamond", icon: "fw:diamond" },
  glowstone_dust: { n: "Glowstone Dust", icon: "fw:glowstone_dust" },
};
const FW_HEADS = ["Creeper Head", "Zombie Head", "Skeleton Skull", "Wither Skeleton Skull", "Piglin Head", "Dragon Head", "Player Head"];

// The tooltips' words, by edition (en_us.json; en_US.lang). Color names are the same in both (Bedrock's key for light gray is "silver",
// its words "Light Gray").
const FW_WORDS = {
  java: { rocket: "Firework Rocket", star: "Firework Star", flight: "Flight Duration:", fade: "Fade to", trail: "Trail", twinkle: "Twinkle" },
  bedrock: { rocket: "Firework Rocket", star: "Firework Star", flight: "Flight Duration:", fade: "Fade to", trail: "Trail", twinkle: "Twinkle" },
};

// The crafting grid's 9 slots: a star is 1 gunpowder and up to 8 more (dyes, its shape's item, a diamond, glowstone dust); a rocket is
// 1 paper, 1 to 3 gunpowder and stars in the rest. A star's fade is a second craft: the star and up to 8 dyes.
const FW_SLOTS = 9, FW_MAX_FLIGHT = 3, FW_PER_CRAFT = 3;
const fwMaxStars = flight => FW_SLOTS - 1 - flight;

// By flight duration (the gunpowder in it): how long it flies (10 × (flight + 1) + 0 to 5 + 0 to 6 ticks), how high it gets launched by
// hand, how far a dispenser sends it, how long it boosts an elytra, and how far a crossbow shoots it (straight, at 32 blocks a second).
const FW_FLIGHT = {
  1: { ticks: [20, 31], high: [8, 20], dispenser: [9, 10], boost: 1.5, crossbow: [32, 49.6] },
  2: { ticks: [30, 41], high: [18, 34], dispenser: [14, 15], boost: 2, crossbow: [48, 65.6] },
  3: { ticks: [40, 51], high: [32, 52], dispenser: [19, 20], boost: 2.5, crossbow: [64, 81.6] },
};
// The explosion's damage at its middle, by how many stars: 7 for one, 2 more for each other; less further off, nothing past 5 blocks
// or behind a solid block. A crossbow's rocket that hits: 4 + stars to 4 + 2 × stars.
const fwBlast = n => (n ? 5 + 2 * n : 0);
const fwCrossbow = n => (n ? [4 + n, 4 + 2 * n] : [0, 0]);

// What else the tab says, by edition where they differ (both() is gear-data.js's).
const FW_FACTS = {
  star: both("Craft 1 gunpowder with 1 to 8 dyes. Add one of a fire charge, a gold nugget, a head or a feather for its shape, a diamond for a trail and glowstone dust to make it twinkle: everything has to fit in the 9 slots. The order doesn’t matter. Two of the same dye count twice: the colors are picked from at random as it bursts.",
    "Craft 1 gunpowder with 1 to 8 dyes. Add one of a fire charge, a gold nugget, a head or a feather for its shape, a diamond for a trail and glowstone dust to make it twinkle: everything has to fit in the 9 slots. The order doesn’t matter. Two of the same dye count twice: the colors are picked from at random as it bursts. Bone meal, lapis lazuli, cocoa beans or an ink sac make a white, blue, brown or black star too, but only on their own with the gunpowder: nothing else can go with them, and they can’t add a fade."),
  fade: "Craft the star again with 1 to 8 dyes to make its sparks fade to those colors. Doing it again replaces the fade, it doesn’t add to it.",
  rocket: "Craft 1 paper with 1 to 3 gunpowder for its flight duration, and firework stars in the slots left: up to 7 with 1 gunpowder. One craft makes 3 rockets, each with every star. A rocket with no stars flies and doesn’t explode.",
  stack: "Rockets and stars stack to 64, but only with ones that are just the same.",
  heads: "Any head or skull makes a creeper-shaped star, not only a creeper’s.",
  obtain: both("Only by crafting. In Creative there’s a rocket of each flight duration with no stars, and a star with no color.",
    "Only by crafting. In Creative there are 16 rockets, small balls in each color with flight duration 1, one with no stars, and a star in each of the 16 colors."),
  height: "Launched from the ground, a rocket flies 10 × (its gunpowder + 1) ticks and up to 11 more at random, then explodes.",
  damage: "Its stars hurt everything within 5 blocks that isn’t behind a solid block: up to 7 health for one star at its middle, 2 more for each other star, less further off. Other ingredients don’t change it. It doesn’t break item frames, paintings or end crystals, but does break armor stands and decorated pots.",
  elytra: both("Use one while gliding with an elytra to fly forward at about 33.5 blocks a second, longer the more gunpowder it has. It doesn’t use the elytra’s durability. One with stars explodes on you when it ends and hurts you as its stars would. Under water it boosts for a moment only.",
    "Use one while gliding with an elytra to fly forward at about 33.5 blocks a second, longer the more gunpowder it has. It doesn’t use the elytra’s durability. One with stars explodes on you when it ends and hurts you as its stars would."),
  leash: "Using a rocket to boost lets go of every mob on a lead.",
  crossbow: both("Load a crossbow with a rocket held in the other hand. It flies straight at 32 blocks a second and explodes when it hits a mob or a block, or at the end of its flight; only one with stars does damage. Each shot costs the crossbow 3 durability, 9 with Multishot, which shoots three. Piercing does nothing for rockets.",
    "Load a crossbow with a rocket held in the other hand. It flies straight at 32 blocks a second; only one with stars does damage. It goes through a mob it hits and explodes at the end of its flight, so aim it to end where the mob is. Each shot costs the crossbow 3 durability, 9 with Multishot, which shoots three. Piercing does nothing for rockets."),
  dispenser: "A dispenser shoots a rocket the way it faces, in any of the six directions, and it flies straight as from a crossbow.",
  water: "Water pushes rockets: launched or shot in flowing water, they go off diagonally.",
  raid: "After a raid is won, villagers celebrate for 30 seconds, now and then launching a rocket in a random color if nothing’s over them. A mob it hits goes after the villager.",
  portal: "A rocket that flies into a nether portal goes through and explodes on the other side.",
  plate: "A rocket launched by hand onto a wooden pressure plate presses it; a stone one it doesn’t.",
  sounds: "The large ball has a bigger bang. Twinkling stars crackle after they burst.",
  command: both(null, "Bedrock’s /give can’t add stars or a flight duration: craft it."),
};
