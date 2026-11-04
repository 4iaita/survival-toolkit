/* ---------- Armor stand props ---------- */
// Armor stand props (Actions & Stuff): an armor stand named §§ shows the item in its hand as a decoration.
// k is the item's id (PROP_LOOKS key), n its name, what the decoration it becomes.
const PROP_GROUPS = [
  { n: "Plushies", what: "Wool turns into a plushie, a different one for each color.", items: [
    { k: "white_wool", n: "White Wool", what: "A sheep plushie." }, { k: "silver_wool", n: "Light Gray Wool", what: "A chicken plushie." },
    { k: "gray_wool", n: "Gray Wool", what: "A skeleton plushie." }, { k: "black_wool", n: "Black Wool", what: "A spider plushie." },
    { k: "brown_wool", n: "Brown Wool", what: "A cow plushie." }, { k: "red_wool", n: "Red Wool", what: "A mooshroom plushie." },
    { k: "orange_wool", n: "Orange Wool", what: "A frog plushie." }, { k: "yellow_wool", n: "Yellow Wool", what: "A bee plushie." },
    { k: "lime_wool", n: "Lime Wool", what: "A player plushie in a frog hat." }, { k: "green_wool", n: "Green Wool", what: "A creeper plushie." },
    { k: "cyan_wool", n: "Cyan Wool", what: "A zombie plushie." }, { k: "light_blue_wool", n: "Light Blue Wool", what: "A pufferfish plushie." },
    { k: "blue_wool", n: "Blue Wool", what: "A player plushie." }, { k: "purple_wool", n: "Purple Wool", what: "An enderman plushie." },
    { k: "magenta_wool", n: "Magenta Wool", what: "An axolotl plushie." }, { k: "pink_wool", n: "Pink Wool", what: "A pig plushie." },
    { k: "rabbit_foot", n: "Rabbit’s Foot", what: "A bunny plushie." }, { k: "dragon_breath", n: "Dragon’s Breath", what: "An ender dragon plushie." },
    { k: "sculk_vein", n: "Sculk Vein", what: "A warden plushie." }, { k: "dried_ghast", n: "Dried Ghast", what: "A ghastling sitting on a dried ghast." },
  ] },
  { n: "Couches", what: "Carpet turns into a couch in its color.", items: ["White", "Light Gray", "Gray", "Black", "Brown", "Red", "Orange", "Yellow", "Lime", "Green", "Cyan", "Light Blue", "Blue", "Purple", "Magenta", "Pink"]
    .map(c => ({ k: `${c.toLowerCase().replace(" ", "_")}_carpet`, n: `${c} Carpet`, what: `A ${c.toLowerCase()} couch.` })) },
  { n: "Presents", what: "Bundles turn into wrapped presents.", items: [
    { k: "bundle", n: "Bundle", what: "A wooden toy chest." },
    ...["White", "Light Gray", "Gray", "Black", "Brown", "Red", "Orange", "Yellow", "Lime", "Green", "Cyan", "Light Blue", "Blue", "Purple", "Magenta", "Pink"]
      .map(c => ({ k: `${c.toLowerCase().replace(" ", "_")}_bundle`, n: `${c} Bundle`, what: c === "Light Gray" ? "A stone box with a carved face." : `A ${c.toLowerCase()} present with a bow.` })),
  ] },
  { n: "Christmas", items: [
    { k: "spruce_sapling", n: "Spruce Sapling", what: "A decorated Christmas tree." }, { k: "spruce_leaves", n: "Spruce Leaves", what: "A Christmas wreath." },
    { k: "powder_snow_bucket", n: "Powder Snow Bucket", what: "A snow globe with a village inside." }, { k: "mangrove_boat", n: "Mangrove Boat", what: "Santa’s sleigh, full of presents." },
    { k: "cocoa_beans", n: "Cocoa Beans", what: "A gingerbread house." }, { k: "cookie", n: "Cookie", what: "A jar of cookies." },
    { k: "twisting_vines", n: "Twisting Vines", what: "A green candy cane." }, { k: "weeping_vines", n: "Weeping Vines", what: "A red candy cane." },
    { k: "sweet_berries", n: "Sweet Berries", what: "A potted holly plant." }, { k: "warped_fungus_on_a_stick", n: "Warped Fungus on a Stick", what: "A Christmas cracker hanging from a stick." },
    { k: "snow", n: "Snow Block", what: "A snowman with a broom." }, { k: "snowball", n: "Snowball", what: "A giant snowball." },
    { k: "snow_layer", n: "Snow", what: "A snowdrift." }, { k: "diamond_shovel", n: "Diamond Shovel", what: "A shovel stuck in the snow." },
    { k: "brick_block", n: "Bricks", what: "A brick chimney." },
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
