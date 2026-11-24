/* ---------- Armor stand props ---------- */
// Armor stand props (Actions & Stuff): an armor stand named §§ shows the item in its hand as a decoration.
// k is the item's id (PROP_LOOKS key), n its name, what the decoration it becomes; worn, if the stand wears it instead of holding it; yaw, how it's turned to start with, if not as they all are; icons, where more than one item becomes the
// same one, all their ids (the line under the stage shows each).
const PROP_GROUPS = [
  { n: "Plushies", what: "Wool turns into a plushie, a different one for each color.", items: [
    { k: "white_wool", n: "White Wool", what: "A sheep plushie." }, { k: "silver_wool", n: "Light Gray Wool", what: "A chicken plushie." },
    { k: "gray_wool", n: "Gray Wool", what: "A skeleton plushie." }, { k: "black_wool", n: "Black Wool", what: "A spider plushie. Its eyes glow." },
    { k: "brown_wool", n: "Brown Wool", what: "A cow plushie." }, { k: "red_wool", n: "Red Wool", what: "A mooshroom plushie." },
    { k: "orange_wool", n: "Orange Wool", what: "A frog plushie." }, { k: "yellow_wool", n: "Yellow Wool", what: "A bee plushie." },
    { k: "lime_wool", n: "Lime Wool", what: "A plushie of Rana, a girl in a frog hat." }, { k: "green_wool", n: "Green Wool", what: "A creeper plushie." },
    { k: "cyan_wool", n: "Cyan Wool", what: "A zombie plushie." }, { k: "light_blue_wool", n: "Light Blue Wool", what: "A pufferfish plushie." },
    { k: "blue_wool", n: "Blue Wool", what: "A reversible squid plushie. The glow squid glows." }, { k: "purple_wool", n: "Purple Wool", what: "An enderman plushie. Its eyes glow." },
    { k: "magenta_wool", n: "Magenta Wool", what: "An axolotl plushie." }, { k: "pink_wool", n: "Pink Wool", what: "A pig plushie." },
    { k: "rabbit_foot", n: "Rabbit’s Foot", what: "A bunny plushie." }, { k: "dragon_breath", n: "Dragon’s Breath", what: "An ender dragon plushie. Its eyes glow." },
    { k: "sculk_vein", n: "Sculk Vein", what: "A warden plushie. Its horns glow." }, { k: "dried_ghast", n: "Dried Ghast", what: "A reversible ghast plushie." },
  ] },
  { n: "Rugs and Canopies", what: "Carpet turns into a rug, or a market stall canopy that drapes over the block under it.", items: Object.entries({
    "White": "a striped rug", "Light Gray": "a checkered rug", "Gray": "a rug with a key pattern", "Black": "a rug with a diamond pattern", "Brown": "a plaid rug",
    "Red": "a red rug with a gold border", "Orange": "a zigzag rug", "Yellow": "a rug with a diamond pattern", "Lime": "a checkered rug", "Green": "a rug with an ornate pattern",
    "Cyan": "a floral rug", "Light Blue": "a striped rug", "Blue": "a rug with a pattern of squares", "Purple": "a rug with a pattern of swirls", "Magenta": "an ornate rug with a flower", "Pink": "a gingham rug",
  }).map(([c, rug]) => ({ k: `${c.toLowerCase().replace(" ", "_")}_carpet`, n: `${c} Carpet`, what: `A${rug.slice(1)}, or ${/^[AEIOU]/.test(c) ? "an" : "a"} ${c.toLowerCase()}${c === "White" ? "" : " and white"} canopy.` })) },
  { n: "Presents", what: "Bundles turn into presents with a toy inside. Punch the stand to open one.", items: [
    { k: "bundle", n: "Bundle", what: "A sack of gold coins." },
    ...Object.entries({
      "White": "A checkered present with a creaking toy inside.", "Light Gray": "A stone box with a carved face and a dried ghast toy inside.",
      "Gray": "A sooty gray present with lumps of coal inside.", "Black": "A black and gray present with a panda toy inside.",
      "Brown": "A cardboard box with a cat toy packed in foam inside. The cat’s eyes glow.", "Red": "A red present with snowflakes on it and a snow golem toy inside.",
      "Orange": "A black present with flames on it and a strider toy inside.", "Yellow": "A bee-striped present with a bee toy inside.",
      "Lime": "A creeper present with a TNT toy inside. Its fuse glows.", "Green": "A green plaid present with an iron golem toy dressed as Santa inside. Its eyes glow.",
      "Cyan": "A cyan present with oranges on it and fruit inside: a pineapple, oranges and kiwis.", "Light Blue": "A white and light blue present with a wolf toy inside.",
      "Blue": "A blue and gold present with a copper golem robot inside. Its lights glow.", "Purple": "A purple and green striped present with an enderman toy holding a grass block inside. Its eyes glow.",
      "Magenta": "A flowery magenta present with a pig toy inside, an allium on its head.", "Pink": "A pink present with hearts on it and a teddy bear inside.",
    }).map(([c, what]) => ({ k: `${c.toLowerCase().replace(" ", "_")}_bundle`, n: `${c} Bundle`, what })),
  ] },
  { n: "Christmas", items: [
    { k: "spruce_sapling", n: "Spruce Sapling", what: "A decorated Christmas tree with presents around it. Its lights and star glow." }, { k: "spruce_leaves", n: "Spruce Leaves", what: "A Christmas wreath with a red bow." },
    { k: "powder_snow_bucket", n: "Powder Snow Bucket", what: "A large snow globe with a cabin and an iron golem Santa inside. Punch the stand to shake it. The windows and the golem’s eyes glow." },
    { k: "mangrove_boat", n: "Mangrove Boat", what: "A red and gold sleigh with a sack of presents." },
    { k: "cocoa_beans", n: "Cocoa Beans", what: "A gingerbread house. Punch the stand three times to knock, and a gingerbread man steps out and waves. Its windows light up at night." }, { k: "cookie", n: "Cookie", what: "A jar of cookies." },
    { k: "twisting_vines", n: "Twisting Vines", what: "A green candy cane." }, { k: "weeping_vines", n: "Weeping Vines", what: "A red candy cane." },
    { k: "sweet_berries", n: "Sweet Berries", what: "A potted holly bush with a red bow." }, { k: "white_candle", n: "White Candle", what: "Three festive candles with holly round them. Their flames glow." },
    { k: "snow", n: "Snow Block", what: "A snowman with a broom." }, { k: "snowball", n: "Snowball", what: "A small snow globe with a snowman inside. Punch the stand to shake it." },
    { k: "snow_layer", n: "Snow", what: "A layer of snow that drapes over the block under it." }, { k: "diamond_shovel", n: "Diamond Shovel", what: "A shovel stuck in a pile of snow." },
    { k: "brick_block", n: "Bricks", what: "A brick chimney. Smoke rises from it." },
    { k: "leather_boots", n: "Leather Boots", worn: 1, what: "A Christmas stocking hung on a nail, if the boots are dyed. Most have a toy and gifts in them, some of which glow." },
  ] },
  { n: "Halloween", items: [
    { k: "lit_pumpkin", n: "Jack o’Lantern", what: "A giant jack o’lantern lit by a candle inside. Punch the stand to pop its lid up." }, { k: "pumpkin", n: "Pumpkin", what: "A pumpkin patch with an orange, a red, a green and a white pumpkin." },
    { k: "sugar", n: "Sugar", what: "A pumpkin trick-or-treat bucket full of sweets. Punch the stand to send sweets flying." }, { k: "skeleton_skull", n: "Skeleton Skull", what: "A skull with a candle burning on top. Its flame glows." },
    { k: "bone_meal", n: "Bone Meal", what: "The remains of a skeleton." }, { k: "chiseled_stone_bricks", n: "Chiseled Stone Bricks", what: "A zombie’s tombstone. Come close at night and the zombie climbs out of its grave." },
    { k: "mangrove_door", n: "Mangrove Door", what: "A vampire’s coffin. Punch the stand to wake the vampire. Its eyes glow." }, { k: "pointed_dripstone", n: "Pointed Dripstone", what: "A stone gargoyle. Its eyes glow." },
    { k: "wheat", n: "Wheat", what: "A scarecrow with a pumpkin head. It wakes up at night, its eyes glowing." }, { k: "ender_eye", n: "Eye of Ender", what: "A portrait of an enderman, its glowing eyes following you. Punch the stand, or stay close, and it jumps out at you." },
    { k: "trapped_chest", n: "Trapped Chest", what: "A jack-in-the-box with a creeper in a jester’s hat. Come close, or punch the stand, and it springs out." }, { k: "leaf_litter", n: "Leaf Litter", what: "A pile of autumn leaves with a rake. Punch the stand for a puff of leaves." },
  ] },
  { n: "Around the house", items: [
    { k: "cake", n: "Cake", what: "A two-tier birthday cake with nine candles. Their flames glow." }, { k: "furnace", n: "Furnace", what: "A brick fireplace with a log fire burning in it." },
    { k: "cartography_table", n: "Cartography Table", what: "A desk globe. Punch the stand to spin it." }, { k: "lava_bucket", n: "Lava Bucket", what: "A lava lamp. It glows." },
    { k: "soul_lantern", n: "Soul Lantern", what: "A gothic street lamp with a soul flame in it. The flame glows." },
    { k: "red_candle", n: "Red Candle", what: "A candelabra with a skull on it and three red candles. Its flames and the skull’s eyes glow." },
    { k: "rail", n: "Rail", what: "A toy train that goes round its track with a villager, a creeper and a zombie on board. The signal glows." },
    { k: "feather", n: "Feather", what: "A pillow fort with a teddy bear inside. Its string lights glow." },
    { k: "carrot_on_a_stick", n: "Carrot on a Stick", what: "A llama piñata hanging from a rope. Punch the stand to whack it." },
    { k: "warped_fungus_on_a_stick", n: "Warped Fungus on a Stick", what: "A strider piñata hanging from a rope. Punch the stand to whack it." },
    { k: "heartbreak_pottery_sherd", n: "Heartbreak Pottery Sherd", what: "A broken pot, half sunk in the ground." },
    { k: "creeper_head", n: "Creeper Head", what: "A creeper anatomy statue: one half its skin, the other its skeleton with TNT inside." },
  ] },
  { n: "Outdoors", items: [
    { k: "water_bucket", n: "Water Bucket", what: "An ornate stone birdbath." },
    { k: "campfire", n: "Campfire or Soul Campfire", icons: ["campfire", "soul_campfire"], what: "A campfire in a ring of stones: burning, just put out, burnt out or not lit yet." },
    { k: "torch", n: "Torch", what: "A stone fire pillar or an iron brazier, with a fire burning in it." }, { k: "soul_torch", n: "Soul Torch", what: "A stone fire pillar or an iron brazier, with soul fire burning in it." },
    { k: "copper_torch", n: "Copper Torch", what: "A stone fire pillar with no fire in it." },
    { k: "brown_mushroom", n: "Brown Mushroom", what: "A little brown mushroom, or four of them. Punch the stand to make them wobble and flash. Fireflies drift round them at night." },
    { k: "red_mushroom", n: "Red Mushroom", what: "A little red mushroom, or three of them. Punch the stand to make them wobble." },
    { k: "crimson_fungus", n: "Crimson Fungus", what: "A little crimson fungus, or three of them. Their spots glow." }, { k: "warped_fungus", n: "Warped Fungus", what: "A little warped fungus, or three of them. Their spots glow." },
    { k: "moss_carpet", n: "Moss Carpet", what: "A layer of moss that drapes over the block under it." }, { k: "pale_moss_carpet", n: "Pale Moss Carpet", what: "A layer of pale moss that drapes over the block under it." },
    { k: "cobblestone", n: "Cobblestone", what: "A small cluster of cobbles." }, { k: "mossy_cobblestone", n: "Mossy Cobblestone", what: "A small cluster of mossy cobbles." },
    { k: "stone_bricks", n: "Stone Bricks", what: "A small pile of stone bricks." }, { k: "redstone_torch", n: "Redstone Torch", what: "A small pile of redstone blocks." },
    { k: "carrot", n: "Carrot", what: "A pair of carrots, one lying over the other." },
    { k: "pufferfish", n: "Pufferfish", what: "Three party balloons shaped like mobs. Punch the stand to make them sway. The glow squid glows, and so do the enderman’s and the piglin’s eyes." },
  ] },
];
// The items' own icons, for the line under the stage: the same drawing the rest of the site uses (a section's are added
// once its props have been checked against the pack).
// Leaves: a see-through block, its far sides showing through the gaps.
const LEAVES = { boxes: [[0, 0, 0, 16, 16, 16], [0, 0, 0, 0.1, 16, 16], [0, 0, 0, 16, 0.1, 16], [0, 0, 0, 16, 16, 0.1]].map(b => ({ b, faces: [["leaves_spruce_carried"], ["leaves_spruce_carried"], ["leaves_spruce_carried"]] })) };
const PROP_ICONS = {
  ...Object.fromEntries(Object.keys(DYES).map(c => c.replace(" ", "_")).map(c => [`${c === "light_gray" ? "silver" : c}_wool`, C_(`${c}_wool`, `${c}_wool`)])),
  // A carpet's texture is its wool's: a slab a pixel thick, raised to the middle of the icon.
  ...Object.fromEntries(Object.keys(DYES).map(c => c.replace(" ", "_")).map(c => [`${c}_carpet`, { shift: 3.5, boxes: [{ b: [0, 0, 0, 16, 1, 16], faces: [[`${c}_wool`], [`${c}_wool`], [`${c}_wool`]] }] }])),
  // Stairs: a slab with half a block on the back left of it.
  ...Object.fromEntries(Object.keys(DYES).map(c => c.replace(" ", "_")).map(c => [`${c}_wool_stairs`, { boxes: [[0, 0, 0, 16, 8, 16], [0, 8, 0, 8, 16, 16]].map(b => ({ b, faces: [[`${c}_wool`], [`${c}_wool`], [`${c}_wool`]] })) }])),
  bundle: L("bundle"), ...Object.fromEntries(Object.keys(DYES).map(c => `${c.replace(" ", "_")}_bundle`).map(k => [k, L(k)])),
  rabbit_foot: L("rabbit_foot"), dragon_breath: L("dragon_breath"), sculk_vein: L("sculk_vein"), dried_ghast: DRIED_GHAST,
  // The pack gives some blocks an inventory texture of their own (blocks.json's carried_textures). A layer of snow is two
  // pixels thick.
  spruce_sapling: L("sapling_spruce_carried"), spruce_leaves: LEAVES, powder_snow_bucket: L("bucket_powder_snow"), mangrove_boat: L("mangrove_boat"),
  cocoa_beans: L("cocoa_beans"), cookie: L("cookie"), twisting_vines: L("twisting_vines_carried"), weeping_vines: L("weeping_vines_carried"), sweet_berries: L("sweet_berries"),
  warped_fungus_on_a_stick: L("warped_fungus_on_a_stick"), snow: C("snow"), snowball: L("snowball"), diamond_shovel: L("diamond_shovel"), brick_block: C("brick_block"),
  snow_layer: { shift: 3, boxes: [{ b: [0, 0, 0, 16, 2, 16], faces: [["snow"], ["snow"], ["snow"]] }] },
  lit_pumpkin: C("pumpkin_face_on", "pumpkin_top", "pumpkin_side"), pumpkin: C("pumpkin_side", "pumpkin_top"), sugar: L("sugar"), bone_meal: L("bone_meal"),
  skeleton_skull: C("skeleton_skull_front", "skeleton_skull_top", "skeleton_skull_side"), chiseled_stone_bricks: C("chiseled_stone_bricks"),
  mangrove_door: L("mangrove_door"), pointed_dripstone: L("dripstone_carried"), wheat: L("wheat"), ender_eye: L("ender_eye"),
  trapped_chest: C("trapped_chest_front", "chest_top", "chest_side"), leaf_litter: L("leaf_litter"),
  cake: L("cake"), furnace: C("furnace_front", "furnace_top", "furnace_side"), cartography_table: C("cartography_table_front", "cartography_table_top", "cartography_table_side"),
  lava_bucket: L("lava_bucket"), soul_lantern: L("soul_lantern"), red_candle: L("red_candle"), white_candle: L("white_candle"), orange_candle: L("orange_candle"),
  rail: L("rail_carried"), feather: L("feather"), carrot_on_a_stick: L("carrot_on_a_stick"), heartbreak_pottery_sherd: L("heartbreak_pottery_sherd"),
  creeper_head: C("creeper_head_front", "creeper_head_top", "creeper_head_side"), bamboo: L("bamboo"), rose_bush: L("rose_bush_carried"),
  beehive: C("beehive_front", "beehive_top", "beehive_side"), spyglass: L("spyglass"), leather: L("leather"), web: L("web_carried"),
  copper_bulb: C("copper_bulb"), copper_lantern: L("copper_lantern"), leather_boots: L("leather_boots"),
  water_bucket: L("water_bucket"), campfire: L("campfire"), soul_campfire: L("soul_campfire"), ...Object.fromEntries(["torch", "soul_torch", "copper_torch", "redstone_torch", "crimson_fungus", "warped_fungus"].map(k => [k, L(`${k}_carried`)])),
  brown_mushroom: L("mushroom_brown_carried"), red_mushroom: L("mushroom_red_carried"), cobblestone: C("cobblestone"), mossy_cobblestone: C("mossy_cobblestone"), stone_bricks: C("stone_bricks"),
  ...Object.fromEntries(["moss", "pale_moss"].map(k => [`${k}_carpet`, { shift: 3.5, boxes: [{ b: [0, 0, 0, 16, 1, 16], faces: [[`${k}_block`], [`${k}_block`], [`${k}_block`]] }] }])),
  carrot: L("carrot"), pufferfish: L("pufferfish"), spruce_boat: L("boat_spruce"), stick: L("stick"), target: C("target_side", "target_top"), glow_frame: L("glow_item_frame"),
  ...Object.fromEntries(["pale_oak_trapdoor", "spruce_trapdoor"].map(k => [k, { shift: 2.5, boxes: [{ b: [0, 0, 0, 16, 3, 16], faces: [[k], [k], [k]] }] }])),
  spruce_fence: { boxes: [[6, 0, 0, 10, 16, 4], [6, 0, 12, 10, 16, 16], [7, 12, 4, 9, 15, 12], [7, 6, 4, 9, 9, 12]].map(b => ({ b, faces: [["planks_spruce"], ["planks_spruce"], ["planks_spruce"]] })) },
};
for (const [k, spec] of Object.entries(PROP_ICONS)) if (artReady(spec)) ICONS[`held:${k}`] = spec;
// A banner is a model in the game, with no picture of its own: the one the Villager Trades tab draws.
ICONS["held:banner"] = tradeSpec("White Banner");
// The versions an item's prop comes in (PROP_LOOKS' look and its variants, in order), one for each of the stand's poses in turn.
const CLIMATE_KINDS = ["Temperate", "Cold", "Warm"];
const PROP_VARIANTS = {
  blue_wool: ["Squid", "Glow Squid"], dried_ghast: ["Happy Ghast", "Dried Ghast"],
  silver_wool: CLIMATE_KINDS, black_wool: ["Spider", "Cave Spider"], brown_wool: CLIMATE_KINDS, red_wool: ["Red", "Brown"], orange_wool: CLIMATE_KINDS,
  ...Object.fromEntries(Object.keys(DYES).map(c => [`${c.replace(" ", "_")}_carpet`, ["Rug", "Canopy"]])),
  magenta_wool: ["Lucy", "Blue", "Wild", "Cyan", "Gold"], pink_wool: CLIMATE_KINDS,
  rabbit_foot: ["Brown", "Black", "Gold", "White", "Black and White", "Killer Bunny"],
  twisting_vines: ["Small", "Big"], weeping_vines: ["Small", "Big"],
  banner: ["Standing", "On a Wall", "Flagpole", "Flag"], leather: ["Standing", "On a Wall"], web: ["Basketball", "Soccer", "Volleyball"],
  copper_bulb: ["Blank", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "–", "="],
  copper_lantern: ["White, High", "White, Low", "Rainbow, High", "Rainbow, Low"],
  campfire: ["Lit", "Put Out", "Burnt Out", "Unlit"], torch: ["Pillar", "Brazier"], soul_torch: ["Pillar", "Brazier"],
  ...Object.fromEntries(["brown_mushroom", "red_mushroom", "crimson_fungus", "warped_fungus"].map(k => [k, ["One", "Cluster"]])),
  pufferfish: ["Monsters", "Cave", "Hive", "Aquatic", "Nether"],
  pale_oak_trapdoor: ["Big", "Small", "Big, Fast", "Small, Fast", "Big, Flat", "Small, Flat", "Big, Flat, Fast", "Small, Flat, Fast"],
  spruce_boat: ["Whole", "Open Front", "Open Back", "Tipped Up"], spruce_fence: ["Short", "Medium", "Long"],
  stick: ["Stacked", "Pair", "Single", "Leaning Trio", "Leaning Pair", "Leaning", "Tumbled Trio", "Tumbled Pair", "Upright", "Stacked Across", "Heap"],
  glow_frame: ["Opens Near, Framed", "Opens Near", "Shuts Near, Framed", "Shuts Near", "Open, Framed", "Open", "Slit, Framed", "Slit"],
};
// Another choice that goes with every variant: n its name, how to make it, kinds (a button in each color; is, what that one
// shows, as the pack calls it), what it picks. A look for each of its kinds' variants, in turn.
const PROP_ROWS = {
  // The 16 dyes, and the eight mixes of two: the boots' colors (the pack goes by the exact color), in import_stockings.py's order.
  leather_boots: { n: "Boots", how: "Dye the stand’s leather boots to switch. Two names are two dyes mixed on the same pair.", what: "boots", kinds: [
    ...Object.entries({ red: "Classic Stocking", black: "Penguin", blue: "Vibe Cat", brown: "Cowboy", cyan: "Electronics", gray: "Redstoner", green: "Classic Stocking",
      "light blue": "Steampunk Inventor", "light gray": "Chess and Games Controller", lime: "Robot", magenta: "Enderman", orange: "Flame", pink: "Rana", purple: "Bee Lover",
      white: "Kitty Cat", yellow: "Flint" }).map(([c, is]) => ({ n: c.replace(/\b./g, x => x.toUpperCase()), swatch: DYES[c], is })),
    ...[["Brown and Black", "#503829", "Mustache Man"], ["Gray and Lime", "#638b38", "Alien"], ["Green and Black", "#3d4c1b", "Musical Knight"], ["Green and Brown", "#706824", "Woodland Critter"],
      ["Green and Yellow", "#aeaa29", "Dinosaur"], ["Magenta and Black", "#72356f", "Coding Error"], ["Orange and Yellow", "#fbac2d", "Lion"], ["Red and Magenta", "#bb3e71", "Wizard"]].map(([n, swatch, is]) => ({ n, swatch, is })),
  ] },
  banner: { n: "Boots", how: "Dye the stand’s leather boots to switch.", what: "boots", kinds: ["black", "blue", "brown", "cyan", "gray", "green", "light blue", "light gray", "lime", "magenta", "orange", "pink", "purple", "red", "white", "yellow"]
    .map(c => ({ n: c.replace(/\b./g, x => x.toUpperCase()), swatch: DYES[c] })) },
};
// How to switch, where it isn't by changing the stand's pose.
const PROP_SWITCH = Object.fromEntries(["twisting_vines", "weeping_vines"].map(k => [k, "Place the stand diagonally for the big one."]));
for (const k of ["brown_mushroom", "red_mushroom", "crimson_fungus", "warped_fungus"]) PROP_SWITCH[k] = "Place the stand diagonally for a cluster.";
