/* ---------- Armor stand props ---------- */
// Armor stand props (Actions & Stuff): an armor stand named §§ shows the item in its hand as a decoration.
// k is the item's id (PROP_LOOKS key), n its name, what the decoration it becomes.
const PROP_GROUPS = [
  { n: "Plushies", what: "Wool turns into a plushie, a different one for each color.", items: [
    { k: "white_wool", n: "White Wool", what: "A sheep plushie." }, { k: "silver_wool", n: "Light Gray Wool", what: "A chicken plushie." },
    { k: "gray_wool", n: "Gray Wool", what: "A skeleton plushie." }, { k: "black_wool", n: "Black Wool", what: "A spider plushie. Its eyes glow." },
    { k: "brown_wool", n: "Brown Wool", what: "A cow plushie." }, { k: "red_wool", n: "Red Wool", what: "A mooshroom plushie." },
    { k: "orange_wool", n: "Orange Wool", what: "A frog plushie." }, { k: "yellow_wool", n: "Yellow Wool", what: "A bee plushie." },
    { k: "lime_wool", n: "Lime Wool", what: "A player plushie in a frog hat." }, { k: "green_wool", n: "Green Wool", what: "A creeper plushie." },
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
    { k: "sweet_berries", n: "Sweet Berries", what: "A potted holly bush with a red bow." }, { k: "warped_fungus_on_a_stick", n: "Warped Fungus on a Stick", what: "A strider piñata hanging from a rope. Punch the stand to whack it." },
    { k: "snow", n: "Snow Block", what: "A snowman with a broom." }, { k: "snowball", n: "Snowball", what: "A small snow globe with a snowman inside. Punch the stand to shake it." },
    { k: "snow_layer", n: "Snow", what: "A layer of snow that drapes over the block under it." }, { k: "diamond_shovel", n: "Diamond Shovel", what: "A shovel stuck in a pile of snow." },
    { k: "brick_block", n: "Bricks", what: "A brick chimney. Smoke rises from it." },
  ] },
  { n: "Halloween", items: [
    { k: "lit_pumpkin", n: "Jack o’Lantern", what: "A big carved jack o’lantern." }, { k: "pumpkin", n: "Pumpkin", what: "A pile of pumpkins and gourds." },
    { k: "sugar", n: "Sugar", what: "A trick-or-treat bucket full of candy." }, { k: "skeleton_skull", n: "Skeleton Skull", what: "A skull with a candle on top." },
    { k: "bone_meal", n: "Bone Meal", what: "A skeleton lying in pieces." }, { k: "chiseled_stone_bricks", n: "Chiseled Stone Bricks", what: "A grave, with a zombie climbing out." },
    { k: "mangrove_door", n: "Mangrove Door", what: "A coffin." }, { k: "pointed_dripstone", n: "Pointed Dripstone", what: "A stone gargoyle." },
    { k: "wheat", n: "Wheat", what: "A scarecrow." }, { k: "ender_eye", n: "Eye of Ender", what: "A framed portrait of an enderman." },
    { k: "trapped_chest", n: "Trapped Chest", what: "A jack-in-the-box." }, { k: "leaf_litter", n: "Leaf Litter", what: "A rake in a pile of leaves." },
  ] },
  { n: "Around the house", items: [
    { k: "cake", n: "Cake", what: "A birthday cake with candles." }, { k: "furnace", n: "Furnace", what: "A kitchen stove." },
    { k: "cartography_table", n: "Cartography Table", what: "A globe." }, { k: "lava_bucket", n: "Lava Bucket", what: "A lava lamp." },
    { k: "soul_lantern", n: "Soul Lantern", what: "A street lamp." }, { k: "red_candle", n: "Red Candle", what: "A lamp with red shades." },
    { k: "white_candle", n: "White Candle", what: "A candle beside a little autumn tree." }, { k: "rail", n: "Rail", what: "A toy train set." },
    { k: "feather", n: "Feather", what: "A heap of cushions." }, { k: "carrot_on_a_stick", n: "Carrot on a Stick", what: "A piñata hanging from a stick." },
    { k: "heartbreak_pottery_sherd", n: "Heartbreak Pottery Sherd", what: "A smashed pot." }, { k: "creeper_head", n: "Creeper Head", what: "A creeper on a stand." },
  ] },
  { n: "Outdoors", items: [
    { k: "water_bucket", n: "Water Bucket", what: "A birdbath." }, { k: "campfire", n: "Campfire", what: "An iron fire pit." },
    { k: "soul_campfire", n: "Soul Campfire", what: "An iron fire pit for soul fire." }, { k: "torch", n: "Torch", what: "A stone fire bowl." },
    { k: "soul_torch", n: "Soul Torch", what: "A stone fire bowl for soul fire." }, { k: "copper_torch", n: "Copper Torch", what: "A stone fire bowl for copper fire." },
    { k: "brown_mushroom", n: "Brown Mushroom", what: "A giant brown mushroom." }, { k: "red_mushroom", n: "Red Mushroom", what: "A giant red mushroom." },
    { k: "crimson_fungus", n: "Crimson Fungus", what: "A crimson fungus tree." }, { k: "warped_fungus", n: "Warped Fungus", what: "A warped fungus tree." },
    { k: "moss_carpet", n: "Moss Carpet", what: "Hanging moss." }, { k: "pale_moss_carpet", n: "Pale Moss Carpet", what: "Hanging pale moss." },
    { k: "cobblestone", n: "Cobblestone", what: "A pile of rubble." }, { k: "mossy_cobblestone", n: "Mossy Cobblestone", what: "A pile of mossy rubble." },
    { k: "stone_bricks", n: "Stone Bricks", what: "A stack of stone blocks." }, { k: "redstone_torch", n: "Redstone Torch", what: "A heap of redstone." },
    { k: "carrot", n: "Carrot", what: "A bunch of carrots." }, { k: "pufferfish", n: "Pufferfish", what: "Fishing rods in a stand." },
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
  bundle: L("bundle"), ...Object.fromEntries(Object.keys(DYES).map(c => `${c.replace(" ", "_")}_bundle`).map(k => [k, L(k)])),
  rabbit_foot: L("rabbit_foot"), dragon_breath: L("dragon_breath"), sculk_vein: L("sculk_vein"), dried_ghast: DRIED_GHAST,
  // The pack gives some blocks an inventory texture of their own (blocks.json's carried_textures). A layer of snow is two
  // pixels thick.
  spruce_sapling: L("sapling_spruce_carried"), spruce_leaves: LEAVES, powder_snow_bucket: L("bucket_powder_snow"), mangrove_boat: L("mangrove_boat"),
  cocoa_beans: L("cocoa_beans"), cookie: L("cookie"), twisting_vines: L("twisting_vines_carried"), weeping_vines: L("weeping_vines_carried"), sweet_berries: L("sweet_berries"),
  warped_fungus_on_a_stick: L("warped_fungus_on_a_stick"), snow: C("snow"), snowball: L("snowball"), diamond_shovel: L("diamond_shovel"), brick_block: C("brick_block"),
  snow_layer: { shift: 3, boxes: [{ b: [0, 0, 0, 16, 2, 16], faces: [["snow"], ["snow"], ["snow"]] }] },
};
for (const [k, spec] of Object.entries(PROP_ICONS)) if (artReady(spec)) ICONS[`held:${k}`] = spec;
// The versions an item's prop comes in (PROP_LOOKS' look and its variants, in order), one for each of the stand's poses in turn.
const CLIMATE_KINDS = ["Temperate", "Cold", "Warm"];
const PROP_VARIANTS = {
  blue_wool: ["Squid", "Glow Squid"], dried_ghast: ["Happy Ghast", "Dried Ghast"],
  silver_wool: CLIMATE_KINDS, black_wool: ["Spider", "Cave Spider"], brown_wool: CLIMATE_KINDS, red_wool: ["Red", "Brown"], orange_wool: CLIMATE_KINDS,
  ...Object.fromEntries(Object.keys(DYES).map(c => [`${c.replace(" ", "_")}_carpet`, ["Rug", "Canopy"]])),
  magenta_wool: ["Lucy", "Blue", "Wild", "Cyan", "Gold"], pink_wool: CLIMATE_KINDS,
  rabbit_foot: ["Brown", "Black", "Gold", "White", "Black and White", "Killer Bunny"],
  twisting_vines: ["Small", "Big"], weeping_vines: ["Small", "Big"],
};
// How to switch, where it isn't by changing the stand's pose.
const PROP_SWITCH = Object.fromEntries(["twisting_vines", "weeping_vines"].map(k => [k, "Place the stand diagonally for the big one."]));
