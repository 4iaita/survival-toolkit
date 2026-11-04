/* ---------- Mobs ---------- */
// Mobs on the Mobs tab, in groups like the creative inventory's. k is the MOB_LOOKS key and the spawn egg
// (egg_<k> in art/); bedrockName where Bedrock calls it something else; biome, the village biome its stage shows
// (a BIOMES key, forest, cave, mineshaft, nether, end, end_island, ocean, lush or flooded_cave; plains if not given); glowing, its glow on all the time, for a mob that lights
// itself; swim, floated in the middle of the water; zoom, drawn that many times the size that fits the stage, to scale
// with a bigger mob; stand, bone poses for the stage where the pack's resting pose hides something
// (bone -> { p: position, r: rotation }, as a look's pose).
// How far a mob's model is lifted to stand on the ground at all, or for one that flies.
const lift = y => ({ root: { p: [0, y, 0] } });
// A guardian beside an elder guardian, which is 2.35 times its size.
const ELDER_RATIO = 1 / 2.35;
// The nautiluses' models are made facing the other way from the rest.
const TURNED_ROUND = { root: { r: [0, 180, 0] } };
// The dragon flies, and its proportions are the pack's own: everything at 0.9, the wings put back to full size, the thighs a little slimmer.
const DRAGON_STAND = {
  root: { p: [0, 115, 0], s: [0.9, 0.9, 0.9] }, rightWing: { s: [1.11, 1.11, 1.11] }, leftWing: { s: [1.11, 1.11, 1.11] },
  loqnofr: { s: [0.95, 0.95, 0.95] }, qjgfyeo: { s: [0.95, 0.95, 0.95] },
};
// What the moods are called on the stage: every mob starts calm; MOB_MOODS says which others it has.
// What sizes are called on the stage, for the mobs MOB_SIZES lists; every one starts at its biggest.
const SIZE_NAMES = { small: "Small", medium: "Medium", big: "Big" };
const DEFAULT_SIZE = "big";
const MOOD_NAMES = { calm: "Calm", pet: "Pet", angry: "Angry" };
// What a pet's collar comes in, as the dyes are called in DYES; red is what the game starts it with.
const COLLAR_COLORS = ["red", "orange", "yellow", "lime", "green", "cyan", "light blue", "blue", "purple", "magenta", "pink", "white", "light gray", "gray", "black", "brown"];
const DEFAULT_COLLAR = "red";
// What armor's wear is called, least first: the keys of MOB_ARMOR's cracks, after none at all.
const ARMOR_WEAR = [["", "New"], ["low", "Slightly cracked"], ["medium", "Cracked"], ["high", "Badly cracked"]];
const MOB_GROUPS = ["Animals", "Water", "Village", "Monsters", "Nether", "End"];
const MOBS = [
  { k: "armadillo", n: "Armadillo", g: "Animals", biome: "savanna", stand: { body: { p: [0, 1, 0] } } }, { k: "bat", n: "Bat", g: "Animals", biome: "cave", stand: lift(15) }, { k: "bee", n: "Bee", g: "Animals", stand: { body: { p: [0, 18, 0] } } },
  { k: "camel", n: "Camel", g: "Animals", biome: "desert" }, { k: "cat", n: "Cat", g: "Animals" }, { k: "chicken", n: "Chicken", g: "Animals" },
  { k: "cow", n: "Cow", g: "Animals" }, { k: "donkey", n: "Donkey", g: "Animals" }, { k: "fox", n: "Fox", g: "Animals" }, { k: "frog", n: "Frog", g: "Animals", biome: "swamp" },
  { k: "goat", n: "Goat", g: "Animals" }, { k: "horse", n: "Horse", g: "Animals" }, { k: "llama", n: "Llama", g: "Animals" },
  { k: "mooshroom", n: "Mooshroom", g: "Animals" }, { k: "mule", n: "Mule", g: "Animals" }, { k: "ocelot", n: "Ocelot", g: "Animals", biome: "jungle" },
  { k: "panda", n: "Panda", g: "Animals", biome: "jungle" }, { k: "parrot", n: "Parrot", g: "Animals" }, { k: "pig", n: "Pig", g: "Animals" },
  { k: "polar_bear", n: "Polar Bear", g: "Animals", biome: "snowy" }, { k: "rabbit", n: "Rabbit", g: "Animals" }, { k: "sheep", n: "Sheep", g: "Animals" },
  { k: "sniffer", n: "Sniffer", g: "Animals" }, { k: "trader_llama", n: "Trader Llama", g: "Animals" }, { k: "wolf", n: "Wolf", g: "Animals", biome: "forest" },
  { k: "axolotl", n: "Axolotl", g: "Water", biome: "lush", swim: true }, { k: "cod", n: "Cod", g: "Water", biome: "ocean", swim: true }, { k: "dolphin", n: "Dolphin", g: "Water", biome: "ocean", swim: true }, { k: "glow_squid", n: "Glow Squid", g: "Water", biome: "flooded_cave", glowing: true, swim: true },
  { k: "nautilus", n: "Nautilus", g: "Water", biome: "ocean", stand: TURNED_ROUND, swim: true }, { k: "pufferfish", n: "Pufferfish", g: "Water", biome: "ocean", swim: true }, { k: "salmon", n: "Salmon", g: "Water", biome: "ocean", swim: true }, { k: "squid", n: "Squid", g: "Water", biome: "ocean", swim: true },
  { k: "tadpole", n: "Tadpole", g: "Water", biome: "ocean", swim: true }, { k: "tropicalfish", n: "Tropical Fish", g: "Water", biome: "ocean", swim: true }, { k: "turtle", n: "Turtle", g: "Water", biome: "ocean", swim: true },
  { k: "allay", n: "Allay", g: "Village" }, { k: "copper_golem", n: "Copper Golem", g: "Village" }, { k: "iron_golem", n: "Iron Golem", g: "Village" },
  { k: "snow_golem", n: "Snow Golem", g: "Village" }, { k: "villager", n: "Villager", g: "Village" },
  { k: "wandering_trader", n: "Wandering Trader", g: "Village" },
  { k: "bogged", n: "Bogged", g: "Monsters", biome: "swamp" }, { k: "breeze", n: "Breeze", g: "Monsters", biome: "cave" }, { k: "camel_husk", n: "Camel Husk", g: "Monsters" },
  { k: "cave_spider", n: "Cave Spider", g: "Monsters", biome: "mineshaft", stand: lift(1.7) }, { k: "creaking", n: "Creaking", g: "Monsters" }, { k: "creeper", n: "Creeper", g: "Monsters", biome: "cave" },
  { k: "drowned", n: "Drowned", g: "Monsters", biome: "ocean", stand: lift(0.3) }, { k: "elder_guardian", n: "Elder Guardian", g: "Monsters", biome: "ocean", swim: true },
  { k: "evoker", n: "Evoker", g: "Monsters" }, { k: "guardian", n: "Guardian", g: "Monsters", biome: "ocean", swim: true, zoom: ELDER_RATIO },
  { k: "husk", n: "Husk", g: "Monsters" }, { k: "parched", n: "Parched", g: "Monsters", biome: "desert" }, { k: "phantom", n: "Phantom", g: "Monsters", stand: { body: { p: [0, 22, 0] } } },
  { k: "pillager", n: "Pillager", g: "Monsters" }, { k: "ravager", n: "Ravager", g: "Monsters" },
  { k: "silverfish", n: "Silverfish", g: "Monsters", biome: "cave" }, { k: "skeleton", n: "Skeleton", g: "Monsters", biome: "cave" },
  { k: "skeleton_horse", n: "Skeleton Horse", g: "Monsters" }, { k: "slime", n: "Slime", g: "Monsters", biome: "cave", zoom: 2.5 }, { k: "spider", n: "Spider", g: "Monsters", biome: "cave", stand: lift(1.7) },
  { k: "stray", n: "Stray", g: "Monsters", biome: "snowy" }, { k: "vex", n: "Vex", g: "Monsters", stand: { root: { p: [0, 10, 0] } } }, { k: "vindicator", n: "Vindicator", g: "Monsters" }, { k: "warden", n: "Warden", g: "Monsters", biome: "cave" }, { k: "witch", n: "Witch", g: "Monsters" },
  { k: "zombie", n: "Zombie", g: "Monsters", biome: "cave" }, { k: "zombie_horse", n: "Zombie Horse", g: "Monsters" },
  { k: "zombie_nautilus", n: "Zombie Nautilus", g: "Monsters", biome: "ocean", stand: TURNED_ROUND, swim: true }, { k: "zombie_villager", n: "Zombie Villager", g: "Monsters", biome: "cave" },
  { k: "blaze", n: "Blaze", g: "Nether", biome: "nether", stand: { root: { p: [0, 14, 0] } } }, { k: "ghast", n: "Ghast", g: "Nether", biome: "nether", stand: { root: { p: [0, 15, 0] } } }, { k: "happy_ghast", n: "Happy Ghast", g: "Nether", stand: { root: { p: [0, 33, 0] } } }, { k: "hoglin", n: "Hoglin", g: "Nether", biome: "nether" },
  { k: "magma_cube", n: "Magma Cube", g: "Nether", biome: "nether", zoom: 2.5 }, { k: "piglin", n: "Piglin", g: "Nether", biome: "nether" }, { k: "piglin_brute", n: "Piglin Brute", g: "Nether", biome: "nether" },
  { k: "strider", n: "Strider", g: "Nether", biome: "nether" }, { k: "wither_skeleton", n: "Wither Skeleton", g: "Nether", biome: "nether", glowing: true }, { k: "zoglin", n: "Zoglin", g: "Nether", biome: "nether" },
  { k: "zombified_piglin", n: "Zombified Piglin", bedrockName: "Zombie Pigman", g: "Nether", biome: "nether" }, { k: "wither", n: "Wither", g: "Nether", biome: "nether", stand: lift(8) },
  { k: "ender_dragon", n: "Ender Dragon", g: "End", biome: "end_island", stand: DRAGON_STAND, zoom: 1.5 }, { k: "enderman", n: "Enderman", g: "End", biome: "end", glowing: true },
  { k: "endermite", n: "Endermite", g: "End", biome: "end" }, { k: "shulker", n: "Shulker", g: "End", biome: "end", stand: { ocbqbhz: { p: [0, 7, 0] } } },
];
