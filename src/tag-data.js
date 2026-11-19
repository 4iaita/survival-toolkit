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
  { names: ["Johnny"], mob: "vindicator", look: "pack",
    what: "Makes it attack almost every mob nearby, not just players, villagers and iron golems. It leaves other illagers alone. It looks the same, but always having a target it holds its iron axe up, its brows lowered, and chops now and then.",
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
    { names: ["Goldie"], what: "A golden allay: gold all over, its wings too, with no blue glow round it.", rare: "1 in 10 allays" },
    { names: ["Ghost", "Wisp"], what: "A ghost: a white sheet with two dark eyes over its head and body, its arms poking out, and no wings." },
    { names: ["Elf", "Jingle"], what: "An elf: a green pointed hat with a jagged red brim and a gold bell on its tip, red and white striped sleeves and a green tunic." },
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
  camel_husk: [{ names: ["Baby", "Calf", "Camelo"], kind: BABY, rare: "1 in 20 camel husks" }],
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
    { names: ["Baby", "Twiggy", "Creakling"], kind: BABY, rare: "1 in 200 creakings" },
    { names: ["Spruce", "Twinkle"], what: "A Christmas tree: drooping spruce boughs cover it from head to foot, a gold star on top, and strings of red, green, blue and yellow lights that twinkle on and off all over it, its eyes glowing orange through the needles." },
  ],
  creeper: [
    { names: ["Baby", "Creeperling", "Boomlet"], kind: BABY, rare: "1 in 200 creepers" },
    { names: ["Skeleton"], what: "A skeleton creeper: a bony gray skull with the creeper’s face, a spine and ribs with sticks of TNT tucked inside them, and bony feet." },
    { names: ["Pig"], what: "A pink creeper with a pig’s face: a snout, small eyes and floppy ears, and its feet pink trotters." },
    { names: ["Snowy", "Frosty"], kind: SNOWY, rare: "creepers in snowy biomes" },
  ],
  dolphin: [
    { names: ["Baby", "Calf", "Flippy"], kind: BABY },
    { names: ["Bubblegum"], what: "A pink dolphin: rosy pink all over, its flippers paler.", rare: "1 in 100 dolphins" },
  ],
  donkey: [{ names: ["Baby", "Foal"], kind: BABY }],
  drowned: [{ names: ["Baby", "Splashy"], kind: BABY }, { names: ["Snowy", "Frosty"], kind: SNOWY, rare: "drowned in snowy biomes" }],
  enderman: [
    { names: ["Baby", "Enderchild", "Endie"], kind: BABY, rare: "1 in 200 endermen" },
    { names: ["Green", "Beanie"], what: "Green eyes instead of purple.", rare: "1 in 200 endermen" },
    { names: ["Nutcracker"], what: "A nutcracker soldier with a drum." },
    { names: ["Snowy", "Frosty"], kind: SNOWY },
  ],
  fox: [{ names: ["Baby", "Kit", "Foxie"], kind: BABY }],
  ghast: [{ names: ["Boo"], what: "Shrinks it to a little ghastling, drawn just as the pack draws its baby: a small white head with slitted, teary eyes and a tiny mouth over short tentacles." }],
  glow_squid: [{ names: ["Baby", "Glowling", "Twinkle"], kind: BABY }],
  goat: [{ names: ["Baby", "Kiddo"], kind: BABY }],
  happy_ghast: [
    { names: ["Creeper Balloon"], more: ["Creeper balloon"], what: "Turns it into a hot air balloon shaped like a creeper’s head, its seams stitched, over a narrower base with a burner’s vent in front. It hides its harness too." },
    { names: ["Enderman Balloon"], more: ["Enderman balloon"], what: "Turns it into a hot air balloon shaped like an enderman’s head, its purple eyes on black, its seams stitched, over a narrower base with a burner’s vent in front. It hides its harness too." },
    { names: ["Pig Balloon"], more: ["Pig balloon"], what: "Turns it into a hot air balloon shaped like a pig’s head, snout and all, its seams stitched, over a narrower base with a burner’s vent in front. It hides its harness too." },
    { names: ["Pumpkin Balloon"], more: ["Pumpkin balloon"], what: "Turns it into a hot air balloon shaped like a carved pumpkin, its stem and a curling leaf on top, its seams stitched, over a narrower base with a burner’s vent in front. It hides its harness too." },
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
    { names: ["Baby", "Sandy"], what: "A baby husk, its yellow eyes glowing all the while.", kind: BABY, night: true },
    { names: ["Mummy", "Dusty"], what: "A mummy wrapped in bandages, one yellow eye glowing through them.", rare: "3 in 100 husks", night: true },
  ],
  iron_golem: [
    { names: ["Dapper", "Agent"], what: "A secret agent: dark sunglasses and a black suit with gold buttons on its cuffs, a white shirt and a red tie." },
    { names: ["Frankenstein", "Frank"], what: "Frankenstein’s monster: a green face under flat black hair, an arrow stuck in its head, a ragged dark green coat over a purple shirt, dark trousers and green hands." },
    { names: ["Claus"], what: "Santa Claus: a red suit and hat trimmed with white fur, a white beard, a black belt with a gold buckle, and a sack of presents and a candy cane on its back. Now and then it takes a present out of the sack and holds it out.", biome: "snowy" },
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
  pillager: [
    { names: ["Krampus"], what: "Krampus, the horned Christmas demon: long black horns twisting up from its head, shaggy gray fur over its head and down its chin, long pointed ears, red eyes, and a red coat trimmed with tan fur." },
    { names: ["Snowy", "Frosty"], kind: SNOWY, what: "Dressed for the cold: a horned iron helmet hung with icicles, a dark hood wrapped round its face so only its eyes and its nose, red with cold, show, snow-crusted cream fur over its shoulders and back, a teal tunic and frosty boots.", rare: "pillagers in snowy biomes" },
  ],
  polar_bear: [{ names: ["Baby", "Cub", "Knut"], kind: BABY }],
  rabbit: [
    { names: ["Baby", "Bunny", "Thumper"], kind: BABY },
    { names: ["Killer Bunny"], what: "The Killer Bunny’s white fur, with red eyes that glow in the dark. Only the look: it stays as harmless as any rabbit.", night: true },
    { names: ["Toast"], what: "Draws the game’s Toast coat in the pack’s style, and takes “toast” in lower case too." },
  ],
  ravager: [{ names: ["Krampus"], what: "A beast for Krampus to ride: shaggy dark gray fur, long jagged black horns, red eyes, a brown leather saddle studded with gold and strapped on with a big gold buckle, and green and gold wraps trimmed with fur on its legs, over studded brown boots." }],
  sheep: [{ names: ["Baby", "Lamb", "Wooly"], kind: BABY }, snowyIn("sheep")],
  skeleton: [{ names: ["Snowy", "Frosty"], kind: SNOWY, rare: "skeletons in snowy biomes" }],
  skeleton_horse: [{ names: ["Baby", "Foal", "Rattle"], kind: BABY }],
  slime: [
    { names: ["RGB", "Rainbow", "Disco", "jeb_"], more: ["Rgb"], moving: true, what: "A see-through slime whose jelly and the cube inside it run through the colors of the rainbow, over and over." },
    { names: ["Snowman"], what: "A snowman’s head: a cube of snow with coal eyes, a carrot nose and a lump of coal below it. Named, one in two, picked at random, wears a black top hat with a red band; one that comes by itself never does.", biome: "snowy", rare: "1 in 200 slimes in snowy biomes" },
    { names: ["Snowy", "Frosty"], kind: SNOWY, what: "Its jelly an icy blue flecked with snowflakes, and frost on top of the green cube inside it.", rare: "slimes in snowy biomes" },
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
    { names: ["Villager32"], what: "A glitched villager in the magenta and black checks of a missing texture, wide-brimmed hat and all." },
    { names: ["Hoppity", "Bunny"], what: "An Easter bunny costume: white rabbit ears, a pink dress with a white apron and a red bow at the collar, white stockings and black shoes." },
    { names: ["Beekeeper"], what: "A beekeeper in a cream suit and a wide-brimmed cream hat, a slab of honeycomb in its folded arms and yellow boots." },
    { names: ["Ghost", "Boo"], what: "A bedsheet ghost costume, its eyes peeping out through two holes and its shoes poking out under the hem." },
    { names: ["Elf"], what: "A Christmas elf: a green hat with a jagged red and gold brim, pointed ears, a green tunic, red and white striped stockings and brown boots." },
    { names: ["Snowy"], kind: SNOWY, rare: "villagers in snowy biomes" },
  ],
  vindicator: [{ names: ["Clown", "Giggles"], what: "A creepy clown: a white painted face with blue streaks running down from its eyes, a red ball nose, big tufts of red hair at its sides, a ruff striped red and white round its neck, a suit red on one side and blue on the other with white buttons, and red and white striped trousers with ruffled cuffs." }],
  wandering_trader: [{ names: ["Snowy", "Frosty"], kind: SNOWY, what: "Dressed for the cold: snow on its hood and shoulders, a fur-trimmed coat, a pack on its back with snow on it, frosty boots and a nose pink with cold.", rare: "wandering traders in snowy biomes" }],
  warden: [
    { names: ["Jack", "Gourden"], night: true, what: "A jack o’lantern: a carved pumpkin head with a face glowing orange, a body of green vines and leaves with a carved pumpkin in its chest, a fire flickering inside it, and curling vines in place of its tendrils." },
    { names: ["Yeti"], what: "A yeti: shaggy pale blue fur from head to foot, curled tan ram’s horns, a dark blue face with white fangs, and a dark blue patch on its chest." },
    { names: ["William"], what: "Dressed up: a red bow tie at its neck and a dark red walking cane with a silver band in its hand." },
  ],
  witch: [
    { names: ["Emeralda"], what: "A green-skinned witch, in the usual purple robe and hat with its glowing green gem.", rare: "1 in 20 witches" },
    { names: ["Cackle", "Warty"], what: "A warty green witch dressed all in black: a wide black hat with a plum band and a silver buckle, a black robe, and green legs.", rare: "1 in 20 witches" },
    { names: ["Snowy", "Frosty"], kind: SNOWY, what: "Dressed for the cold: its hat crusted with snow and hung with icicles, its nose frosted blue, and a blue coat trimmed with white fur, a fur collar and frosty boots.", rare: "witches in snowy biomes" },
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
    { names: ["Brian", "Glare"], what: "Eyes that glow white in the dark, with a soft glow round them.", rare: "1 in 200 zombies", night: true },
    { names: ["Zanta", "Festive"], what: "A zombie Santa: a red hat trimmed with white fur, a white beard, a red coat with a gold belt buckle, torn at the hem, and red trousers over one black boot and one bare green foot. Named Festive, it’s this or the Snowman, picked at random.", rare: "1 in 200 zombies in snowy biomes", biome: "snowy" },
    { names: ["Snowman"], what: "A snowman’s head, with coal eyes and a carrot nose, and a black top hat with a red band (on half of those named Snowman; the ones that spawn as snowmen have none), over snow and icicles on its shoulders and arms and frost on its feet.", rare: "1 in 200 zombies in snowy biomes", biome: "snowy" },
    { names: ["Snowy", "Frosty"], kind: SNOWY, rare: "zombies in snowy biomes" },
  ],
  zombie_horse: [{ names: ["Baby", "Foal", "Rumble"], kind: BABY }],
  zombie_nautilus: [
    { names: ["Baby", "Nautiling", "Zombilus"], kind: BABY },
    { names: ["Armourless"], what: "Hides its armor. It still wears it, and is still protected by it.", needs: "Put armor on it first.", hides: "armor" },
    { names: ["Saddleless"], what: "Hides its saddle, so you seem to ride it bareback.", needs: "Put a saddle on it first. You still need the saddle to ride.", hides: "saddle" },
  ],
  zombie_villager: [
    { names: ["Baby", "Zomblet", "Zillager"], kind: BABY },
    { names: ["Snowy", "Frosty"], kind: SNOWY, what: "Frozen: its skin a colder, bluer green and its nose icy blue. A farmer, fisherman, shepherd, fletcher, librarian, armorer or butcher wears a snowy version of its outfit too.",
      rare: "zombie villagers in snowy biomes" },
  ],
  zombified_piglin: [{ names: ["Baby", "Piggly"], kind: BABY }],
};
// What the shared looks do.
const PACK_KINDS = {
  [BABY]: "Makes it look like a baby. Only the look changes: it’s still a grown mob, with a grown mob’s size, health and drops.",
  [SNOWY]: "Dusts it with snow, the way the pack shows it in snowy biomes.",
};
