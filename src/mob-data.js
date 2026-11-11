/* ---------- Mobs ---------- */
// Mobs on the Mobs tab, in groups like the creative inventory's. k is the MOB_LOOKS key and the spawn egg
// (egg_<k> in art/); bedrockName where Bedrock calls it something else; biome, the village biome its stage shows
// (a BIOMES key, forest, bamboo_jungle, mushroom_fields, mangrove_swamp, cave, mineshaft, nether, end, end_island, ocean, lush, flooded_cave or swamp_water; plains if not given); glowing, its glow on all the time, for a mob that lights
// itself; swim, floated in the middle of the water; zoom, drawn that many times the size that fits the stage, to scale
// with a bigger mob; stand, bone poses for the stage where the pack's resting pose hides something
// (bone -> { p: position, r: rotation }, as a look's pose).
// How far a mob's model is lifted to stand on the ground at all, or for one that flies.
const lift = y => ({ root: { p: [0, y, 0] } });
// A guardian beside an elder guardian, which is 2.35 times its size.
const ELDER_RATIO = 1 / 2.35;
// A panda sits all the way up now and then (MOB_ACTS), half as tall again as it stands: room for its head.
const PANDA_ROOM = 0.72;
// A polar bear rears up on its hind legs now and then (MOB_ACTS), twice as tall as it stands: room for its head.
const BEAR_ROOM = 0.65;
// The nautiluses' models are made facing the other way from the rest.
const TURNED_ROUND = { root: { r: [0, 180, 0] } };
// The dragon flies, and its proportions are the pack's own: everything at 0.9, the wings put back to full size, the thighs a little slimmer.
const DRAGON_STAND = {
  root: { p: [0, 115, 0], s: [0.9, 0.9, 0.9] }, rightWing: { s: [1.11, 1.11, 1.11] }, leftWing: { s: [1.11, 1.11, 1.11] },
  loqnofr: { s: [0.95, 0.95, 0.95] }, qjgfyeo: { s: [0.95, 0.95, 0.95] },
};
// What the moods are called on the stage: every mob starts calm (a pufferfish deflated) but those START_MOODS lists;
// MOB_MOODS says which others it has (the pufferfish's: half puffed and puffed up, as the game puffs it when something
// comes near).
// What sizes are called on the stage, for the mobs MOB_SIZES lists; every one starts at its biggest but those
// START_SIZES lists.
const SIZE_NAMES = { small: "Small", medium: "Medium", big: "Big" };
const DEFAULT_SIZE = "big";
// The salmon starts at medium, a salmon's usual size (small ones are half as big, large ones half as big again).
const START_SIZES = { salmon: "medium" };
// The pufferfish starts half puffed.
const START_MOODS = { pufferfish: "half" };
const MOOD_NAMES = { calm: "Calm", pet: "Pet", angry: "Angry", half: "Half Puffed", puffed: "Puffed Up" };
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
// The wolf's (import_wolf.py prints them): the pup's, the angry ones' and the Hellhound looks' change with it too.
const wolfSkins = v => Object.fromEntries(["", "_baby", "_hellhound_pup", "_hellhound", "_angry", "_angry_baby", "_angry_hellhound_pup", "_angry_hellhound"]
  .map(s => [`new_wolf${s}`, `new_wolf_${v}${s}`]));
const pandaSkins = v => ({ new_panda: `new_panda_${v}`, new_panda_baby: `new_panda_${v}_baby` });
// An angry bee's skins (import_bee.py prints them): the firefly and the moths have one angry skin, nectar or not.
const beeSkins = v => ({ new_bee: `new_bee_${v}`, new_bee_qween: `new_bee_${v}_qween`,
  ...Object.fromEntries(["firefly", "black_moth", "brown_moth", "green_moth", "pink_moth"].map(s => [`new_bee_${s}`, `new_bee_angry_${s}`])) });
// A horse's coat (import_horse.py prints them): the foal's and the Wendigo looks' coats change with it.
const horseSkins = v => Object.fromEntries(["", "_baby", "_wendigo_foal", "_halloween"].map(s => [`new_horse${s}`, `new_horse_${v}${s}`]));
// A llama's coat (import_llama.py prints them): the baby's changes with it.
const llamaSkins = v => ({ new_llama: `new_llama_${v}`, new_llama_baby: `new_llama_${v}_baby` });
const traderLlamaSkins = v => ({ new_trader_llama: `new_trader_llama_${v}`, new_trader_llama_baby: `new_trader_llama_${v}_baby` });
const catSkins = v => Object.fromEntries(["", "_baby", "_halloween_2", "_witch_kitten_2"].map(s => [`new_cat${s}`, `new_cat_${v}${s}`]));
const MOB_VARIANTS = {
  // The chickens' climates: the warm one has its own skin, the cold one its own model and skin too (MOB_CLIMATES).
  chicken: [
    { k: "temperate", n: "Temperate", where: "Plains", biome: "plains" },
    { k: "warm", n: "Warm", where: "Desert", biome: "desert", climate: "warm" },
    { k: "cold", n: "Cold", where: "Snowy Plains", biome: "snowy", climate: "cold" },
  ],
  // The cows' climates, as the chickens': each has a model and skin of its own (MOB_CLIMATES), and a cold cow sneezes now and then.
  cow: [
    { k: "temperate", n: "Temperate", where: "Plains", biome: "plains" },
    { k: "warm", n: "Warm", where: "Savanna", biome: "savanna", climate: "warm" },
    { k: "cold", n: "Cold", where: "Taiga", biome: "taiga", climate: "cold" },
  ],
  // The pigs' climates: each has a skin of its own on the same model (MOB_CLIMATES).
  pig: [
    { k: "temperate", n: "Temperate", where: "Plains", biome: "plains" },
    { k: "warm", n: "Warm", where: "Savanna", biome: "savanna", climate: "warm" },
    { k: "cold", n: "Cold", where: "Taiga", biome: "taiga", climate: "cold" },
  ],
  // The horse's seven coats (the pack's q.variant 0 to 6), equally likely. Its markings are a row of their own (MOB_MARKINGS).
  horse: [
    { k: "white", n: "White" }, { k: "creamy", n: "Creamy" }, { k: "chestnut", n: "Chestnut" }, { k: "brown", n: "Brown" },
    { k: "black", n: "Black" }, { k: "gray", n: "Gray" }, { k: "dark_brown", n: "Dark Brown" },
  ].map((v, i) => ({ ...v, where: "1 in 7 horses", ...(i ? { skins: horseSkins(v.k) } : {}) })),
  // The llama's four coats (the pack's q.variant 0 to 3), equally likely. Its carpet is a row of its own (MOB_CARPETS).
  llama: [{ k: "creamy", n: "Creamy" }, { k: "white", n: "White" }, { k: "brown", n: "Brown" }, { k: "gray", n: "Gray" }]
    .map((v, i) => ({ ...v, where: "1 in 4 llamas", ...(i ? { skins: llamaSkins(v.k) } : {}) })),
  // The trader llama's are the llama's, under its trader's blanket.
  trader_llama: [{ k: "creamy", n: "Creamy" }, { k: "white", n: "White" }, { k: "brown", n: "Brown" }, { k: "gray", n: "Gray" }]
    .map((v, i) => ({ ...v, where: "1 in 4 trader llamas", ...(i ? { skins: traderLlamaSkins(v.k) } : {}) })),
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
  // The fox's two kinds (the pack's q.variant 0 and 1) share its model and differ in skin, the kit's too: the game makes
  // foxes in snowy biomes snow foxes. The Raccoon and Jimothy looks keep their own skins.
  fox: [
    { k: "red", n: "Red", where: "Taiga", biome: "taiga" },
    { k: "snow", n: "Snow", where: "Snowy Taiga and Grove", biome: "snowy_taiga", skins: { new_fox: "new_fox_snow", new_fox_baby: "new_fox_snow_baby" } },
  ],
  // The rabbit's six coats (the pack's q.variant 0 to 5) share its model and differ in skin, the baby's and the Cherry
  // look's too: the game gives rabbits in deserts the gold coat, in snowy biomes the white or black-and-white one, and
  // elsewhere the brown, black or salt-and-pepper one.
  rabbit: [
    { k: "brown", n: "Brown", where: "Most biomes" },
    { k: "white", n: "White", where: "Snowy biomes", biome: "snowy" },
    { k: "black", n: "Black", where: "Most biomes" },
    { k: "black_and_white", n: "Black and White", where: "Snowy biomes", biome: "snowy" },
    { k: "gold", n: "Gold", where: "Deserts", biome: "desert" },
    { k: "salt_and_pepper", n: "Salt and Pepper", where: "Most biomes" },
  ].map((v, i) => (i ? { ...v, skins: { new_rabbit: `new_rabbit_${v.k}`, new_rabbit_baby: `new_rabbit_${v.k}_baby` } } : v)),
  // The frog's three kinds (the pack's q.variant 0 to 2) share its model and differ in skin, the baby's, the Baby Imp's
  // and the Halloween imp's too: the game makes a frog the kind for the biome its tadpole grew up in. Frogs spawn in
  // swamps (temperate) and mangrove swamps (warm); cold ones only come from tadpoles grown in cold biomes.
  frog: [
    { k: "temperate", n: "Temperate", where: "Swamps", biome: "swamp" },
    { k: "cold", n: "Cold", where: "Grown from tadpoles in cold biomes", biome: "snowy" },
    { k: "warm", n: "Warm", where: "Mangrove swamps", biome: "mangrove_swamp" },
  ].map((v, i) => (i ? { ...v, skins: Object.fromEntries(["", "_baby", "_baby_imp", "_halloween"].map(s => [`new_frog${s}_1`, `new_frog_${v.k}${s}_1`])) } : v)),
  // The parrot's five colors (the pack's q.variant 0 to 4) share its model and differ in skin, the baby look's too. The
  // game gives a parrot one at random, all five equally likely, in jungles. The Crow, Blue Jay, Cardinal, Robin and
  // Turtle Dove looks keep their own feathers.
  parrot: [
    { k: "red", n: "Red" }, { k: "blue", n: "Blue" }, { k: "green", n: "Green" }, { k: "cyan", n: "Cyan" }, { k: "gray", n: "Gray" },
  ].map((v, i) => ({ ...v, where: "1 in 5 parrots", ...(i ? { skins: { new_parrot: `new_parrot_${v.k}` } } : {}) })),
  // The goat's horns: the pack gives each goat one of eight shapes at random (the first four 1 in 5 goats each, the
  // others 1 in 20), long ones to start with. A goat that rams a log, stone or ore drops a horn, one each time, and grows
  // none back (the Halloween goat's horns go the same way).
  goat: [
    ...[[2, "Long", "1 in 5 goats"], [1, "Straight", "1 in 5 goats"], [3, "Curled", "1 in 5 goats"], [4, "Stubby", "1 in 5 goats"],
      [5, "Hooked", "1 in 20 goats"], [6, "Long hook", "1 in 20 goats"], [7, "Bent hook", "1 in 20 goats"], [8, "Ram", "1 in 20 goats"]].map(([n, name, where], i) => ({
      k: `horns${n}`, n: name, where, ...(i ? { say: `${name.toLowerCase()}-horned` } : { say: "" }),
      show: [1, 2, 3, 4, 5, 6, 7, 8].map(s => [`*9gjf${s}`, s === n]) })),
    { k: "one_horn", n: "One horn", where: "After ramming a block once", say: "one-horned", show: [["ja89l_9gjf*", false]] },
    { k: "no_horns", n: "No horns", where: "After ramming a block twice", say: "hornless", show: [["ja89l_9gjf*", false], ["d67l_9gjf*", false]] },
  ],
  // The tropical fish's twelve patterns: six on each of its two shapes (the game's q.variant, small or large, and
  // q.mark_variant). The small shape's patterns are skins over its first, Kob; the large shape has models of its own
  // (MOB_CLIMATES' "large", picked as a climate is) and its patterns are skins over its first, Flopper. Each comes in any
  // body color and any pattern color (MOB_TINTS). They live in warm oceans (and lush caves).
  tropicalfish: [
    ...["Kob", "Sunstreak", "Snooper", "Dasher", "Brinely", "Spotty"].map((n, i) => ({ k: n.toLowerCase(), n, where: "Small shape",
      ...(i ? { skins: { new_tropicalfish_1: `new_tropicalfish_${n.toLowerCase()}` } } : {}) })),
    ...["Flopper", "Stripey", "Glitter", "Blockfish", "Betty", "Clayfish"].map((n, i) => ({ k: n.toLowerCase(), n, where: "Large shape", climate: "large",
      ...(i ? { skins: { new_tropicalfish_large_1: `new_tropicalfish_${n.toLowerCase()}` } } : {}) })),
  ],
};
// Mobs the game colors with dyes of its own picking, its textures white (the tropical fish's body and its pattern): a
// row of dye colors for each of the layer's textures, in order (a look's layers with dyes take them), with the one it
// starts with.
const MOB_TINTS = {
  tropicalfish: [{ k: "body", n: "Body", start: "orange" }, { k: "pattern", n: "Pattern", start: "white" }],
};
// Markings a mob's coat can have besides its variant: k, n and where as MOB_VARIANTS'; over, textures laid over the
// look's own (by its coat's texture: the foal's and the Wendigo looks' markings are their own), blended by their alpha
// (import_horse.py prints them). The first is none, which it starts with.
const horseMarks = m => Object.fromEntries(["", "_baby", "_wendigo_foal", "_halloween"].map(s => [`new_horse${s}`, `new_horse_marks_${m}${s}`]));
const MOB_MARKINGS = {
  // The horse's five (the pack's q.mark_variant 0 to 4), equally likely and with any coat. A reindeer has none.
  horse: [
    { k: "none", n: "None", where: "Plain: 1 in 5 horses" },
    { k: "white", n: "White", where: "White socks and a blaze: 1 in 5 horses" },
    { k: "white_field", n: "White Field", where: "Big white patches: 1 in 5 horses" },
    { k: "white_dots", n: "White Dots", where: "White spots: 1 in 5 horses" },
    { k: "black_dots", n: "Black Dots", where: "Dark smudges: 1 in 5 horses" },
  ].map((v, i) => (i ? { ...v, over: horseMarks(v.k) } : v)),
};
// Mobs that can wear a saddle: the [bone pattern, shown] rules a saddle on it shows, as the pack's render controllers do
// for q.is_saddled (the camel's reins only show with a rider; a pig's snowy, cherry or dappled cover makes way for it).
// The game doesn't saddle a baby.
const MOB_SADDLES = {
  camel: [["k255d6", true], ["3ja5d6", true]],
  pig: [["k255d6", true], ["klj2h*", true], ["3m4cd6*", true], ["2dh92l6klfg72f4qk255d6*", false]],
  // The horse's saddle, stirrups and bridle (its reins only show with a rider); a snowy horse's snow makes way for the saddle.
  horse: [["k255d6", true], ["klj2hj*", true], ["3m4cd6*", true], ["3ja5d6", true], ["f64ck255d6", true], ["alpha*NoFancyArmorSaddle*", false]],
  // The donkey's and mule's saddle, stirrups and bridle, as the horse's.
  donkey: [["k255d6", true], ["klj2hj*", true], ["3m4cd6*", true], ["3ja5d6", true]],
  mule: [["k255d6", true], ["klj2hj*", true], ["3m4cd6*", true], ["3ja5d6", true]],
  // The skeleton and zombie horses' saddle, stirrups and bridle, as the horse's (the game lets a player ride one too).
  skeleton_horse: [["k255d6", true], ["klj2hj*", true], ["3m4cd6*", true], ["3ja5d6", true]],
  zombie_horse: [["k255d6", true], ["klj2hj*", true], ["3m4cd6*", true], ["3ja5d6", true]],
};
// Mobs that can carry a chest: the [bone pattern, shown] rules a chest on it shows, as the pack's render controllers do for
// q.is_chested. The game doesn't give a baby one.
const MOB_CHESTS = {
  // A chest strapped to each side.
  donkey: [["496kld", true], ["496klj", true]],
  mule: [["496kld", true], ["496klj", true]],
  // A chest on each side.
  llama: [["496kl", true], ["klj2h", true]],
  trader_llama: [["496kl", true], ["klj2h", true]],
};
// Mobs that can wear a carpet, which the game says by v.DecorTextureIndex (the pack draws it as a model of its own):
// none: what the stage calls it without one; layers: the look's layer a carpet takes the place of, by its first
// texture, -> the model it's drawn on there (import_llama.py prints them). Each carpet's texture is
// new_llama_carpet_<dye>. The game doesn't put one on a baby.
const MOB_CARPETS = {
  llama: { none: "No carpet", layers: { new_llama_1: "new_llama_1" } },
  // A trader llama's carpet takes the place of its trader's blanket (on the Snowy look, of its snowy one), or of the
  // Halloween costume.
  trader_llama: { none: "Trader’s blanket", layers: { new_trader_llama_1_2: "new_llama_1", new_trader_llama_snowy_1: "new_trader_llama_snowy_1", new_trader_llama_halloween_1: "new_llama_1" } },
};
const carpetTexture = dye => `new_llama_carpet_${dye.replace(/ /g, "_")}`;
// What wearing armor (MOB_ARMOR) shows or hides besides the armor: a snowy horse's snow makes way for it.
const ARMOR_SHOWS = { horse: [["alpha*NoFancyArmor*", false]] };
// What each kind of a mob's armor (MOB_ARMOR's kinds) is called on the stage, in the game's order.
const ARMOR_NAMES = { wolf: { "": "Wolf Armor" }, horse: { leather: "Leather", iron: "Iron", golden: "Gold", diamond: "Diamond", copper: "Copper", netherite: "Netherite" } };
// The zombie horse wears the horse's armor, the same six kinds.
ARMOR_NAMES.zombie_horse = ARMOR_NAMES.horse;
// The sheep's wool: any dye color (it starts white), or sheared. natural: the colors sheep spawn with, and how often;
// shorn: the parts shearing takes off (its wool), and more for a look whose wool is a costume (the Halloween sheet hides
// the ears when it's off, as the pack has it). The game doesn't shear a lamb.
const MOB_WOOL = {
  sheep: {
    natural: { white: "81.8% of sheep", black: "5% of sheep", gray: "5% of sheep", "light gray": "5% of sheep", brown: "3% of sheep", pink: "0.16% of sheep" },
    shorn: [["oggd*", false]],
    shornLooks: { halloween: [["62j*", false]] },
  },
};
// Mobs that have babies in the game itself, bred or born: the stage can show one as a baby, in the look the pack
// gives its babies (the one its Baby name shows). Other mobs only look like babies with that name.
const GAME_BABIES = new Set(["armadillo", "axolotl", "bee", "camel", "cat", "chicken", "cow", "dolphin", "donkey", "drowned", "fox", "glow_squid", "goat",
  "hoglin", "horse", "husk", "llama", "mooshroom", "mule", "nautilus", "ocelot", "panda", "pig", "piglin", "polar_bear", "rabbit", "sheep",
  "sniffer", "squid", "strider", "trader_llama", "turtle", "villager", "wolf", "zoglin", "zombie", "zombie_villager", "zombified_piglin"]);
// Mobs the game has no babies of that the pack makes babies of all the same, 1 in 5 of them (with its setting for
// that): the stage can show them as babies too, in the pack's baby look.
const PACK_BABIES = new Set(["cod", "frog", "parrot", "salmon", "tropicalfish"]);
const MOB_GROUPS = ["Animals", "Water", "Village", "Monsters", "Nether", "End"];
const MOBS = [
  { k: "armadillo", n: "Armadillo", g: "Animals", biome: "savanna", stand: { body: { p: [0, 1, 0] } } }, { k: "bat", n: "Bat", g: "Animals", biome: "cave", stand: lift(15) }, { k: "bee", n: "Bee", g: "Animals", stand: { body: { p: [0, 18, 0] } } },
  { k: "camel", n: "Camel", g: "Animals", biome: "desert" }, { k: "cat", n: "Cat", g: "Animals" }, { k: "chicken", n: "Chicken", g: "Animals" },
  { k: "cow", n: "Cow", g: "Animals" }, { k: "donkey", n: "Donkey", g: "Animals" }, { k: "fox", n: "Fox", g: "Animals", biome: "taiga" }, { k: "frog", n: "Frog", g: "Animals", biome: "swamp" },
  { k: "goat", n: "Goat", g: "Animals", biome: "peaks" }, { k: "horse", n: "Horse", g: "Animals" }, { k: "llama", n: "Llama", g: "Animals", biome: "savanna_plateau" },
  { k: "mooshroom", n: "Mooshroom", g: "Animals", biome: "mushroom_fields" }, { k: "mule", n: "Mule", g: "Animals" }, { k: "ocelot", n: "Ocelot", g: "Animals", biome: "jungle" },
  { k: "panda", n: "Panda", g: "Animals", biome: "bamboo_jungle", zoom: PANDA_ROOM }, { k: "parrot", n: "Parrot", g: "Animals", biome: "jungle" }, { k: "pig", n: "Pig", g: "Animals" },
  { k: "polar_bear", n: "Polar Bear", g: "Animals", biome: "snowy", zoom: BEAR_ROOM }, { k: "rabbit", n: "Rabbit", g: "Animals" }, { k: "sheep", n: "Sheep", g: "Animals" },
  { k: "sniffer", n: "Sniffer", g: "Animals" }, { k: "trader_llama", n: "Trader Llama", g: "Animals" }, { k: "wolf", n: "Wolf", g: "Animals", biome: "taiga" },
  { k: "axolotl", n: "Axolotl", g: "Water", biome: "lush", swim: true }, { k: "cod", n: "Cod", g: "Water", biome: "ocean", swim: true }, { k: "dolphin", n: "Dolphin", g: "Water", biome: "ocean", swim: true }, { k: "glow_squid", n: "Glow Squid", g: "Water", biome: "flooded_cave", glowing: true, swim: true },
  { k: "nautilus", n: "Nautilus", g: "Water", biome: "ocean", stand: TURNED_ROUND, swim: true }, { k: "pufferfish", n: "Pufferfish", g: "Water", biome: "ocean", swim: true }, { k: "salmon", n: "Salmon", g: "Water", biome: "ocean", swim: true }, { k: "squid", n: "Squid", g: "Water", biome: "ocean", swim: true },
  { k: "tadpole", n: "Tadpole", g: "Water", biome: "swamp_water", swim: true }, { k: "tropicalfish", n: "Tropical Fish", g: "Water", biome: "ocean", swim: true }, { k: "turtle", n: "Turtle", g: "Water", biome: "ocean", swim: true },
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
