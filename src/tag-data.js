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
// comes from (the cherry grove for a Cherry look). On the stage: night for a name whose difference only shows in the dark,
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
  copper_golem: [{ names: ["Robot", "Windup"], what: "A wind-up toy robot." }],
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
    { names: ["Bubblegum"], what: "A pink dolphin.", rare: "1 in 100 dolphins" },
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
    { names: ["Dapper", "Agent"], what: "A black suit and tie." },
    { names: ["Frankenstein", "Frank"], what: "A green Frankenstein’s monster." },
    { names: ["Claus"], what: "Dresses it as Santa Claus." },
    { names: ["Snowy", "Frosty"], kind: SNOWY },
  ],
  llama: [{ names: ["Baby", "Cria", "Kira"], kind: BABY }],
  mooshroom: [{ names: ["Baby", "Mooshling", "Mooshy"], kind: BABY }],
  mule: [{ names: ["Baby", "Foal"], kind: BABY }],
  nautilus: [
    { names: ["Baby", "Nautiling", "Whorl"], kind: BABY },
    { names: ["Armourless"], what: "Hides its armor.", needs: "Put armor on it first." },
    { names: ["Saddleless"], what: "Hides its saddle.", needs: "Put a saddle on it first." },
  ],
  ocelot: [{ names: ["Baby", "Oceling", "Spotty"], kind: BABY }],
  panda: [{ names: ["Baby", "Cub", "Bao"], kind: BABY }],
  parrot: [
    { names: ["Crow"], what: "Turns it into a black crow." },
    { names: ["Blue Jay"], more: ["BlueJay", "Bluejay"], what: "Turns it into a blue jay." },
    { names: ["Cardinal"], what: "Turns it into a red cardinal." },
    { names: ["Robin"], what: "Turns it into a robin." },
    { names: ["Turtle Dove"], more: ["TurtleDove", "Turtledove"], what: "Turns it into a turtle dove." },
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
    { names: ["Killer Bunny"], what: "The Killer Bunny’s white fur, with red eyes that glow in the dark. Only the look: it stays as harmless as any rabbit." },
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
  snow_golem: [{ names: ["Snowman", "Frosty"], what: "A classic snowman with a scarf and stick arms, and no pumpkin." }],
  spider: [{ names: ["Snowy", "Frosty"], kind: SNOWY, rare: "spiders in snowy biomes" }],
  squid: [{ names: ["Baby", "Squidling", "Inky"], kind: BABY }],
  strider: [{ names: ["Baby", "Stridling", "Sizzle"], kind: BABY }],
  trader_llama: [{ names: ["Baby", "Cria", "Spitty"], kind: BABY }, { names: ["Snowy", "Frosty"], kind: SNOWY }],
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
    { names: ["Skeleton", "Marrow"], what: "A skeleton wolf." },
    { names: ["Party", "Pawty"], what: "A party hat." },
    { names: ["Reindeer", "Reindog"], what: "Reindeer antlers and a red nose." },
  ],
  zoglin: [{ names: ["Baby", "Zoglet", "Zoggin"], kind: BABY }],
  zombie: [
    { names: ["Baby", "Rotty"], kind: BABY },
    { names: ["Brian", "Glare"], what: "Eyes that glow in the dark, so the stage shows night.", rare: "1 in 200 zombies" },
    { names: ["Zanta"], what: "A zombie Santa.", rare: "1 in 200 zombies in snowy biomes" },
    { names: ["Snowman"], what: "A snowman’s head with a top hat.", rare: "1 in 200 zombies in snowy biomes" },
    { names: ["Snowy", "Frosty"], kind: SNOWY },
  ],
  zombie_horse: [{ names: ["Baby", "Foal", "Rumble"], kind: BABY }],
  zombie_nautilus: [
    { names: ["Baby", "Nautiling", "Zombilus"], kind: BABY },
    { names: ["Armourless"], what: "Hides its armor.", needs: "Put armor on it first." },
    { names: ["Saddleless"], what: "Hides its saddle.", needs: "Put a saddle on it first." },
  ],
  zombie_villager: [{ names: ["Baby", "Zomblet", "Zillager"], kind: BABY }, { names: ["Snowy", "Frosty"], kind: SNOWY }],
  zombified_piglin: [{ names: ["Baby", "Piggly"], kind: BABY }],
};
// What the shared looks do.
const PACK_KINDS = {
  [BABY]: "Makes it look like a baby. Only the look changes: it’s still a grown mob, with a grown mob’s size, health and drops.",
  [SNOWY]: "Dusts it with snow, the way the pack shows it in snowy biomes.",
};
