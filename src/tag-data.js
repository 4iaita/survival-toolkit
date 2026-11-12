/* ---------- Name tags ---------- */
// Names built into the game, in both editions. They're case sensitive: "toast" does nothing.
// mob: the mob a name works on, or any: every mob. look: what the stage shows (flip: upside down; rainbow: the
// jeb_ sheep's wool; pack: the Actions & Stuff look of the same name).
const GAME_TAGS = [
  { names: ["Dinnerbone", "Grumm"], any: true, look: "flip",
    what: "Turns it upside down. Only the look changes: it moves and acts as before.",
    java: "Players whose username is Dinnerbone or Grumm show upside down too.",
    bedrock: "Players called Dinnerbone or Grumm show upside down too." },
  { names: ["jeb_"], mob: "sheep", look: "rainbow",
    what: "Its wool fades through all 16 dye colors, over and over. Shearing it still gives wool of its real color." },
  { names: ["Toast"], mob: "rabbit", look: "pack",
    what: "Gives it Toast’s black-and-white coat, added in memory of a player’s lost pet rabbit." },
  { names: ["Johnny"], mob: "vindicator",
    what: "Makes it attack almost every mob nearby, not just players, villagers and iron golems. It leaves other illagers alone, and looks the same.",
    java: "It spares ghasts too, and even attacks the ravager it’s riding." },
];

// What the Actions & Stuff pack (Bedrock) does with names, by mob, from its entity scripts. names: the spellings
// it checks, in capitals (it also takes all lower case; a few take more, listed in more). kind marks the looks
// most mobs share (BABY, SNOWY); rare: which mobs get the look without the name, picked again each time one loads;
// needs: what has to be true first; climate: the climate (a MOB_VARIANTS climate, or temperate) or climates the look
// shows in, the only variants the name can be tried on; biome: the backdrop the stage shows behind it, the biome the look
// comes from (the cherry grove for a Cherry look); hides: what it hides that the mob wears ("saddle" or "armor"), which
// the stage then leaves off. On the stage: night for a name whose difference only shows in the dark (its glow is shown by day),
// moving for a texture that runs, still for a dance it can't show.
const BABY = "baby", SNOWY = "snowy";
const snowyIn = mobs => ({ names: ["Snowy", "Frosty"], kind: SNOWY, rare: `15% of ${mobs} in snowy biomes` });
const PACK_TAGS = {
  allay: [
    { names: ["Goldie"], what: "A golden allay.", rare: "1 in 10 allays" },
    { names: ["Ghost", "Wisp"], what: "A white ghost allay." },
    { names: ["Elf", "Jingle"], what: "An elf hat and collar for Christmas." },
  ],
  armadillo: [{ names: ["Baby", "Pup", "Dylan"], kind: BABY }],
  axolotl: [{ names: ["Baby", "Lottie"], kind: BABY }],
  bat: [{ names: ["Vampire", "Batula"], what: "A vampire bat with red eyes." }],
  bee: [
    { names: ["Baby", "Smol", "Bumble"], kind: BABY },
    { names: ["Queen"], what: "A queen bee, with a big abdomen behind its body and a longer stinger.", rare: "1 in 200 bees" },
    { names: ["Qween", "Crown"], what: "A queen bee wearing a golden crown." },
  ],
  camel: [{ names: ["Baby", "Calf", "Camelo"], kind: BABY }],
  camel_husk: [{ names: ["Baby", "Calf", "Camelo"], kind: BABY }],
  cat: [
    { names: ["Baby", "Kitten", "Kitty"], kind: BABY },
    { names: ["Party", "Purrty"], what: "A party hat." },
    { names: ["Elf", "Jingle"], what: "An elf hat for Christmas." },
    { names: ["OIIA OIIA", "OIIA"], more: ["Oiia Oiia", "Oiia oiia", "Oiia"], what: "Spins on the spot like the OIIA OIIA cat meme, bobbing up and down." },
  ],
  chicken: [
    { names: ["Baby", "Chick"], kind: BABY },
    { names: ["Chicken Jockey"], more: ["Chicken jockey", "chicken Jockey", "CHICKEN JOCKEY"], what: "A baby zombie rides it, as in the movie’s “Chicken jockey!”, but the chicken stays a chicken." },
    { names: ["Cooked", "Nugget"], what: "A plucked, roasted chicken." },
    { names: ["Lava Chicken"], more: ["lava Chicken", "Lava chicken"], what: "A blazing lava chicken, as in Steve’s song from the movie." },
    { ...snowyIn("cold chickens"), needs: "Only cold chickens, the kind from snowy biomes.", climate: "cold" },
  ],
  copper_golem: [{ names: ["Robot", "Windup"], what: "A wind-up tin toy robot: blue, with square red and yellow eyes, gray arms, red feet, a red knob on a stalk for a rod, a yellow button on its chest and a gold wind-up key in its back. It rusts as it oxidizes." }],
  cow: [
    { names: ["Baby", "Calf", "Mr Mooch"], more: ["mr Mooch", "Mr mooch"], kind: BABY },
    { ...snowyIn("cold cows"), needs: "Only cold cows, the kind from snowy biomes.", climate: "cold" },
  ],
  creaking: [
    { names: ["Baby", "Twiggy", "Creakling"], kind: BABY },
    { names: ["Spruce", "Twinkle"], what: "A spruce Christmas tree." },
  ],
  creeper: [
    { names: ["Baby", "Creeperling", "Boomlet"], kind: BABY },
    { names: ["Skeleton"], what: "A skeleton creeper, all bones." },
    { names: ["Pig"], what: "A pink creeper with a pig’s face." },
    { names: ["Snowy", "Frosty"], kind: SNOWY },
  ],
  dolphin: [
    { names: ["Baby", "Calf", "Flippy"], kind: BABY },
    { names: ["Bubblegum"], what: "A pink dolphin: rosy pink all over, its flippers paler.", rare: "1 in 100 dolphins" },
  ],
  donkey: [{ names: ["Baby", "Foal"], kind: BABY }],
  drowned: [{ names: ["Baby", "Splashy"], kind: BABY }, { names: ["Snowy", "Frosty"], kind: SNOWY }],
  enderman: [
    { names: ["Baby", "Enderchild", "Endie"], kind: BABY, rare: "1 in 200 endermen" },
    { names: ["Green", "Beanie"], what: "Green eyes instead of purple.", rare: "1 in 200 endermen" },
    { names: ["Nutcracker"], what: "A nutcracker soldier with a drum." },
    { names: ["Snowy", "Frosty"], kind: SNOWY },
  ],
  fox: [{ names: ["Baby", "Kit", "Foxie"], kind: BABY }],
  ghast: [{ names: ["Boo"], what: "Shrinks it to a little ghastling." }],
  glow_squid: [{ names: ["Baby", "Glowling", "Twinkle"], kind: BABY }],
  goat: [{ names: ["Baby", "Kiddo"], kind: BABY }],
  happy_ghast: [
    { names: ["Creeper Balloon"], more: ["Creeper balloon"], what: "Turns it into a hot air balloon shaped like a creeper’s head." },
    { names: ["Enderman Balloon"], more: ["Enderman balloon"], what: "Turns it into a hot air balloon shaped like an enderman’s head." },
    { names: ["Pig Balloon"], more: ["Pig balloon"], what: "Turns it into a hot air balloon shaped like a pig’s head." },
    { names: ["Pumpkin Balloon"], more: ["Pumpkin balloon"], what: "Turns it into a hot air balloon shaped like a carved pumpkin." },
    { names: ["Saddleless"], what: "Hides its harness, so you seem to ride it bareback.", needs: "Put a harness on it first. You still need the harness to ride." },
  ],
  hoglin: [{ names: ["Baby", "Hoglet", "Hoggin"], kind: BABY }],
  horse: [
    { names: ["Baby", "Foal"], kind: BABY },
    { names: ["Reindeer"], what: "A reindeer: tan with pale spots, dark legs and antlers. Santa’s other reindeer’s names do the same." },
    { names: ["Rudolph"], what: "Rudolph, the red-nosed reindeer: a reindeer whose red nose glows in the dark. Named Festive, it’s this or a plain reindeer, picked at random.", night: true },
    snowyIn("horses"),
  ],
  husk: [
    { names: ["Baby", "Sandy"], kind: BABY },
    { names: ["Mummy", "Dusty"], what: "A mummy wrapped in bandages.", rare: "3 in 100 husks" },
  ],
  iron_golem: [
    { names: ["Dapper", "Agent"], what: "A secret agent: dark sunglasses and a black suit with gold buttons on its cuffs, a white shirt and a red tie." },
    { names: ["Frankenstein", "Frank"], what: "Frankenstein’s monster: a green face under flat black hair, an arrow stuck in its head, a ragged dark green coat over a purple shirt, dark trousers and green hands." },
    { names: ["Claus"], what: "Santa Claus: a red suit and hat trimmed with white fur, a white beard, a black belt with a gold buckle, and a sack of presents and a candy cane on its back. Now and then it takes a present out of the sack and holds it out." },
    { names: ["Snowy", "Frosty"], kind: SNOWY, rare: "iron golems in snowy biomes" },
  ],
  llama: [{ names: ["Baby", "Cria", "Kira"], kind: BABY }],
  mooshroom: [{ names: ["Baby", "Mooshling", "Mooshy"], kind: BABY }],
  mule: [{ names: ["Baby", "Foal"], kind: BABY }],
  nautilus: [
    { names: ["Baby", "Nautiling", "Whorl"], kind: BABY },
    { names: ["Armourless"], what: "Hides its armor. It still wears it, and is still protected by it.", needs: "Put armor on it first.", hides: "armor" },
    { names: ["Saddleless"], what: "Hides its saddle, so you seem to ride it bareback.", needs: "Put a saddle on it first. You still need the saddle to ride.", hides: "saddle" },
  ],
  ocelot: [{ names: ["Baby", "Oceling", "Spotty"], kind: BABY }],
  panda: [{ names: ["Baby", "Cub", "Bao"], kind: BABY }],
  parrot: [
    { names: ["Crow"], what: "A black crow, crouched low: dark slate feathers all over, a gray beak and pale yellow eyes with a soft orange glow round them in the dark.", night: true },
    { names: ["Blue Jay"], more: ["blue Jay", "Blue jay", "BlueJay", "blueJay"], what: "A blue jay: a bright blue crest, back and wings with white patches, a pale gray breast, a black band across its face and a long blue tail." },
    { names: ["Cardinal"], what: "A red cardinal: red all over, its wings darker, with a pointed crest, a black mask round a stubby orange beak and a long thin tail." },
    { names: ["Robin"], what: "A robin: a brown head, back and wings, an orange face and breast over a pale gray belly, a thin dark beak and a long thin tail." },
    { names: ["Turtle Dove"], more: ["turtle Dove", "Turtle dove", "TurtleDove", "turtleDove"], what: "A turtle dove: pale brown, with a gray patch on the side of its neck, wings checked in dark brown and orange, a pinkish beak and a long thin tail." },
  ],
  pig: [
    { names: ["Baby", "Piglet", "Lil Chop"], more: ["lil Chop", "Lil chop"], kind: BABY },
    { names: ["Muddy", "Mudster", "Mucky"], what: "Splattered with mud. 3 in 10 muddy pigs also have a red rose growing from a patch of mud on top of the head, as the stage shows.", rare: "1 in 10 temperate pigs", needs: "Only temperate pigs, the usual kind.", climate: "temperate" },
    snowyIn("cold pigs"),
  ],
  piglin: [{ names: ["Baby", "Piglet"], kind: BABY }],
  pillager: [{ names: ["Krampus"], what: "Krampus, the horned Christmas demon." }, { names: ["Snowy", "Frosty"], kind: SNOWY }],
  polar_bear: [{ names: ["Baby", "Cub", "Knut"], kind: BABY }],
  rabbit: [
    { names: ["Baby", "Bunny", "Thumper"], kind: BABY },
    { names: ["Killer Bunny"], what: "The Killer Bunny’s white fur, with red eyes that glow in the dark. Only the look: it stays as harmless as any rabbit.", night: true },
    { names: ["Toast"], what: "Draws the game’s Toast coat in the pack’s style, and takes “toast” in lower case too." },
  ],
  ravager: [{ names: ["Krampus"], what: "A horned, chained beast for Krampus to ride." }],
  sheep: [{ names: ["Baby", "Lamb", "Wooly"], kind: BABY }, snowyIn("sheep")],
  skeleton: [{ names: ["Snowy", "Frosty"], kind: SNOWY }],
  skeleton_horse: [{ names: ["Baby", "Foal", "Rattle"], kind: BABY }],
  slime: [
    { names: ["RGB", "Rainbow", "Disco", "jeb_"], more: ["Rgb"], moving: true, what: "A see-through slime that runs through the colors of the rainbow." },
    { names: ["Snowman"], what: "A snowman’s head with a top hat and a carrot nose.", rare: "1 in 200 slimes in snowy biomes" },
    { names: ["Snowy", "Frosty"], kind: SNOWY },
  ],
  sniffer: [{ names: ["Baby", "Hatchling", "Snifflet"], kind: BABY }],
  snow_golem: [{ names: ["Snowman", "Frosty"], what: "A classic snowman: no pumpkin, a coal face with a wide smile, and a red and green checked scarf round its neck, one end hanging down its front." }],
  spider: [{ names: ["Snowy", "Frosty"], kind: SNOWY, rare: "spiders in snowy biomes" }],
  squid: [{ names: ["Baby", "Squidling", "Inky"], kind: BABY }],
  strider: [{ names: ["Baby", "Stridling", "Sizzle"], kind: BABY }],
  trader_llama: [
    { names: ["Baby", "Cria", "Spitty"], kind: BABY },
    { names: ["Snowy", "Frosty"], kind: SNOWY, what: "A winter trader’s blanket: trimmed in cream wool, with a pale blue snowflake on top, and a cream cap between its ears.",
      rare: "trader llamas in snowy biomes" },
  ],
  turtle: [{ names: ["Baby", "Hatchling", "Bubbles"], kind: BABY }],
  villager: [
    { names: ["Baby", "Child", "Nosey"], kind: BABY },
    { names: ["Villager32"], what: "A glitched villager in the magenta and black checks of a missing texture." },
    { names: ["Hoppity", "Bunny"], what: "A pink bunny costume, for Easter." },
    { names: ["Beekeeper"], what: "A beekeeper’s hat and veil." },
    { names: ["Ghost", "Boo"], what: "A bedsheet ghost costume." },
    { names: ["Elf"], what: "Dresses it as a Christmas elf." },
    { names: ["Snowy", "Frozen"], kind: SNOWY },
  ],
  vindicator: [{ names: ["Clown", "Giggles"], what: "A creepy clown." }],
  wandering_trader: [{ names: ["Snowy", "Frosty"], kind: SNOWY }],
  warden: [
    { names: ["Jack", "Gourden"], what: "A jack o’lantern warden, with a carved pumpkin head and vines." },
    { names: ["Yeti"], what: "A shaggy white yeti." },
    { names: ["William"], what: "A red bow tie and a walking cane." },
  ],
  witch: [
    { names: ["Emeralda"], what: "A green-skinned witch.", rare: "1 in 20 witches" },
    { names: ["Cackle", "Warty"], what: "A warty green witch in a tall black hat.", rare: "1 in 20 witches" },
    { names: ["Snowy", "Frosty"], kind: SNOWY },
  ],
  wolf: [
    { names: ["Baby", "Puppy"], kind: BABY },
    { names: ["Skeleton", "Marrow"], what: "A wolf’s skeleton: a bony skull with dark eye sockets, a ribcage and a long bony tail, on bare bone legs." },
    { names: ["Party", "Pawty"], what: "A pink and purple party hat with a gold tuft on top, and a gold party horn in its mouth." },
    { names: ["Reindeer", "Reindog"], what: "Brown reindeer antlers between its ears and a big red nose." },
  ],
  zoglin: [{ names: ["Baby", "Zoglet", "Zoggin"], kind: BABY }],
  zombie: [
    { names: ["Baby", "Rotty"], kind: BABY },
    { names: ["Brian", "Glare"], what: "Eyes that glow in the dark.", rare: "1 in 200 zombies" },
    { names: ["Zanta"], what: "A zombie Santa.", rare: "1 in 200 zombies in snowy biomes" },
    { names: ["Snowman"], what: "A snowman’s head with a top hat.", rare: "1 in 200 zombies in snowy biomes" },
    { names: ["Snowy", "Frosty"], kind: SNOWY },
  ],
  zombie_horse: [{ names: ["Baby", "Foal", "Rumble"], kind: BABY }],
  zombie_nautilus: [
    { names: ["Baby", "Nautiling", "Zombilus"], kind: BABY },
    { names: ["Armourless"], what: "Hides its armor. It still wears it, and is still protected by it.", needs: "Put armor on it first.", hides: "armor" },
    { names: ["Saddleless"], what: "Hides its saddle, so you seem to ride it bareback.", needs: "Put a saddle on it first. You still need the saddle to ride.", hides: "saddle" },
  ],
  zombie_villager: [{ names: ["Baby", "Zomblet", "Zillager"], kind: BABY }, { names: ["Snowy", "Frosty"], kind: SNOWY }],
  zombified_piglin: [{ names: ["Baby", "Piggly"], kind: BABY }],
};
// What the shared looks do.
const PACK_KINDS = {
  [BABY]: "Makes it look like a baby. Only the look changes: it’s still a grown mob, with a grown mob’s size, health and drops.",
  [SNOWY]: "Dusts it with snow, the way the pack shows it in snowy biomes.",
};
