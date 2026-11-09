/* ---------- Mobs ---------- */
// Mobs on the Mobs tab, in groups like the creative inventory's. k is the MOB_LOOKS key and the spawn egg
// (egg_<k> in art/); bedrockName where Bedrock calls it something else; biome, the village biome its stage shows
// (a BIOMES key, forest, bamboo_jungle, mushroom_fields, cave, mineshaft, nether, end, end_island, ocean, lush or flooded_cave; plains if not given); glowing, its glow on all the time, for a mob that lights
// itself; swim, floated in the middle of the water; zoom, drawn that many times the size that fits the stage, to scale
// with a bigger mob; stand, bone poses for the stage where the pack's resting pose hides something
// (bone -> { p: position, r: rotation }, as a look's pose).
// How far a mob's model is lifted to stand on the ground at all, or for one that flies.
const lift = y => ({ root: { p: [0, y, 0] } });
// A guardian beside an elder guardian, which is 2.35 times its size.
const ELDER_RATIO = 1 / 2.35;
// A panda sits all the way up now and then (MOB_ACTS), half as tall again as it stands: room for its head.
const PANDA_ROOM = 0.72;
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
// Variants a mob comes in: k, what it's called (n); where, the biome the game spawns it in, which the stage shows (biome);
// skins, the pack's skins it swaps for its own (skin -> skin); show, [bone pattern, shown] rules for parts it shows (a
// saddle); say, how the stage's description puts it ("" for nothing). The first is the one without any, which the mob
// starts as.
// climate, the MOB_CLIMATES looks to swap in (a name tag that only shows in one climate picks that variant).
// The wolf's are in art/mobs/ as wolf_<variant> (see import_models.py), with angry and baby skins of their own.
const wolfSkins = v => Object.fromEntries(["", "_angry", "_baby", "_angry_baby"].map(s => [`wolf${s}`, `wolf_${v}${s}`]));
const pandaSkins = v => ({ new_panda: `new_panda_${v}`, new_panda_baby: `new_panda_${v}_baby` });
// An angry bee's skins (import_bee.py prints them): the firefly and the moths have one angry skin, nectar or not.
const beeSkins = v => ({ new_bee: `new_bee_${v}`, new_bee_qween: `new_bee_${v}_qween`,
  ...Object.fromEntries(["firefly", "black_moth", "brown_moth", "green_moth", "pink_moth"].map(s => [`new_bee_${s}`, `new_bee_angry_${s}`])) });
const catSkins = v => Object.fromEntries(["", "_baby", "_halloween_2", "_witch_kitten_2"].map(s => [`new_cat${s}`, `new_cat_${v}${s}`]));
const MOB_VARIANTS = {
  // The chickens' climates: the warm one has its own skin, the cold one its own model and skin too (MOB_CLIMATES).
  chicken: [
    { k: "temperate", n: "Temperate", where: "Plains", biome: "plains" },
    { k: "warm", n: "Warm", where: "Desert", biome: "desert", climate: "warm" },
    { k: "cold", n: "Cold", where: "Snowy Plains", biome: "snowy", climate: "cold" },
  ],
  wolf: [
    { k: "pale", n: "Pale", where: "Taiga", biome: "taiga" },
    { k: "ashen", n: "Ashen", where: "Snowy Taiga", biome: "snowy_taiga" },
    { k: "black", n: "Black", where: "Old Growth Pine Taiga", biome: "pine_taiga" },
    { k: "chestnut", n: "Chestnut", where: "Old Growth Spruce Taiga", biome: "spruce_taiga" },
    { k: "rusty", n: "Rusty", where: "Sparse Jungle", biome: "sparse_jungle" },
    { k: "snowy", n: "Snowy", where: "Grove", biome: "grove" },
    { k: "spotted", n: "Spotted", where: "Savanna Plateau", biome: "savanna_plateau" },
    { k: "striped", n: "Striped", where: "Wooded Badlands", biome: "badlands" },
    { k: "woods", n: "Woods", where: "Forest", biome: "forest" },
  ].map((v, i) => (i ? { ...v, skins: wolfSkins(v.k) } : v)),
  // The panda's seven kinds (the pack's q.variant 0 to 6) share its model and differ in skin, the baby's too; where: what sets
  // each apart in the game (they're traits, not places, so every one shows in the bamboo jungle).
  panda: [
    { k: "normal", n: "Normal", where: "Bamboo Jungle and Jungle" },
    { k: "lazy", n: "Lazy", where: "Lies about and doesn’t move much" },
    { k: "worried", n: "Worried", where: "Afraid of thunderstorms" },
    { k: "playful", n: "Playful", where: "Rolls about and plays" },
    { k: "brown", n: "Brown", where: "Bamboo Jungle only" },
    { k: "weak", n: "Weak", where: "Sneezes a lot and has less health" },
    { k: "aggressive", n: "Aggressive", where: "Fights back when it’s hit" },
  ].map((v, i) => (i ? { ...v, skins: pandaSkins(v.k) } : v)),
  // The mooshroom's two kinds (the pack's q.variant 0 and 1) share its model, mushrooms and all, and differ in skin, the
  // calf's too.
  mooshroom: [
    { k: "red", n: "Red", where: "Mushroom Fields" },
    { k: "brown", n: "Brown", where: "A red one struck by lightning", skins: { new_mooshroom: "new_mooshroom_brown", new_mooshroom_baby: "new_mooshroom_brown_baby",
      new_mooshroom_halloween: "new_mooshroom_brown_halloween", new_mooshroom_zombified_calf: "new_mooshroom_brown_zombified_calf" } },
  ],
  // The cat's eleven kinds (the pack's q.variant 0 to 10) share its model and differ in skin, the kitten's and the
  // Halloween hat's too. All but the black one turn up in villages; the black one lives with the witch in a swamp hut,
  // so it comes last.
  cat: [
    { k: "white", n: "White", where: "Villages" },
    { k: "tuxedo", n: "Tuxedo", where: "Villages" },
    { k: "red", n: "Red", where: "Villages" },
    { k: "siamese", n: "Siamese", where: "Villages" },
    { k: "british_shorthair", n: "British Shorthair", where: "Villages" },
    { k: "calico", n: "Calico", where: "Villages" },
    { k: "persian", n: "Persian", where: "Villages" },
    { k: "ragdoll", n: "Ragdoll", where: "Villages" },
    { k: "tabby", n: "Tabby", where: "Villages" },
    { k: "jellie", n: "Jellie", where: "Villages" },
    { k: "black", n: "Black", where: "Swamp huts", biome: "swamp" },
  ].map((v, i) => (i ? { ...v, skins: catSkins(v.k) } : v)),
  // The bee's moods (the pack's skins for q.is_angry, with and without nectar): an angry bee's eyes turn red. A calm bee
  // with nectar looks like any other (its pollen specks are a layer the stage leaves out).
  bee: [
    { k: "calm", n: "Calm", say: "" },
    { k: "angry", n: "Angry", where: "After it’s hit, or its nest is", skins: beeSkins("angry") },
    { k: "angry_nectar", n: "Angry, with nectar", where: "Carrying pollen back to its nest", skins: beeSkins("angry_nectar") },
  ],
  // A camel with a saddle shows it as the pack's render controller does for q.is_saddled (its reins only with a rider).
  camel: [
    { k: "plain", n: "No saddle", say: "" },
    { k: "saddled", n: "Saddled", show: [["k255d6", true], ["3ja5d6", true]] },
  ],
};
// Mobs that have babies in the game itself, bred or born: the stage can show one as a baby, in the look the pack
// gives its babies (the one its Baby name shows). Other mobs only look like babies with that name.
const GAME_BABIES = new Set(["armadillo", "axolotl", "bee", "camel", "cat", "chicken", "cow", "dolphin", "donkey", "drowned", "fox", "goat",
  "hoglin", "horse", "husk", "llama", "mooshroom", "mule", "nautilus", "ocelot", "panda", "pig", "piglin", "polar_bear", "rabbit", "sheep",
  "sniffer", "strider", "trader_llama", "turtle", "villager", "wolf", "zoglin", "zombie", "zombie_villager", "zombified_piglin"]);
const MOB_GROUPS = ["Animals", "Water", "Village", "Monsters", "Nether", "End"];
const MOBS = [
  { k: "armadillo", n: "Armadillo", g: "Animals", biome: "savanna", stand: { body: { p: [0, 1, 0] } } }, { k: "bat", n: "Bat", g: "Animals", biome: "cave", stand: lift(15) }, { k: "bee", n: "Bee", g: "Animals", stand: { body: { p: [0, 18, 0] } } },
  { k: "camel", n: "Camel", g: "Animals", biome: "desert" }, { k: "cat", n: "Cat", g: "Animals" }, { k: "chicken", n: "Chicken", g: "Animals" },
  { k: "cow", n: "Cow", g: "Animals" }, { k: "donkey", n: "Donkey", g: "Animals" }, { k: "fox", n: "Fox", g: "Animals" }, { k: "frog", n: "Frog", g: "Animals", biome: "swamp" },
  { k: "goat", n: "Goat", g: "Animals" }, { k: "horse", n: "Horse", g: "Animals" }, { k: "llama", n: "Llama", g: "Animals" },
  { k: "mooshroom", n: "Mooshroom", g: "Animals", biome: "mushroom_fields" }, { k: "mule", n: "Mule", g: "Animals" }, { k: "ocelot", n: "Ocelot", g: "Animals", biome: "jungle" },
  { k: "panda", n: "Panda", g: "Animals", biome: "bamboo_jungle", zoom: PANDA_ROOM }, { k: "parrot", n: "Parrot", g: "Animals" }, { k: "pig", n: "Pig", g: "Animals" },
  { k: "polar_bear", n: "Polar Bear", g: "Animals", biome: "snowy" }, { k: "rabbit", n: "Rabbit", g: "Animals" }, { k: "sheep", n: "Sheep", g: "Animals" },
  { k: "sniffer", n: "Sniffer", g: "Animals" }, { k: "trader_llama", n: "Trader Llama", g: "Animals" }, { k: "wolf", n: "Wolf", g: "Animals", biome: "taiga" },
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
  { k: "skeleton_horse", n: "Skeleton Horse", g: "Monsters" }, { k: "slime", n: "Slime", g: "Monsters", biome: "cave", zoom: 2.5 }, { k: "sulfur_cube", n: "Sulfur Cube", g: "Monsters", biome: "cave" }, { k: "spider", n: "Spider", g: "Monsters", biome: "cave", stand: lift(1.7) },
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
