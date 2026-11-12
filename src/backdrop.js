/* ---------- Biome backdrops ----------
 * Behind the villager scene, a flat view of the biome's countryside built from the pack's block textures:
 * far hills dotted with small trees, then a village building, trees and plants nearer by. Each layer fades
 * toward the horizon's haze, the far one more, so they read as distance. Foliage, grass and water take the
 * biome's tint the way the game colors them, and in snowy biomes everything wears a layer of snow.
 * The village, for the Mobs tab's iron golem and villager, is the middle of a plains village: its well, bell and lamp
 * post between houses, more roofs on the hills.
 * The forest, for the Mobs tab, is no village either: oaks and birches, with flowers and mushrooms underneath.
 * So is the mineshaft: a dark corridor of fence-post supports under plank beams, rails, a chest minecart, cobwebs and a
 * webbed-in spawner.
 * The cave and the nether, for the Mobs tab, aren't village biomes: a dark rock wall full of ore instead
 * of hills, a ceiling with stalactites or weeping vines, and lanterns or lava for light. Nor is the End: end stone
 * hills under the pack's End sky, with crystal-topped obsidian pillars, end city towers and chorus plants; and the
 * dragon's own island, a ring of great crystal-topped pillars round the unlit exit portal. And the ocean is seen from
 * underwater: sand hills and a far monument, kelp and coral nearby, sunlight slanting down from the surface, bubbles.
 * The lush cave is flooded too: a mossy wall and a ceiling hung with glow berries, dripleaves and azaleas below.
 * So is the deep cave the glow squid swims in: dark rock streaked with glow lichen, lit only by that and sea pickles.
 * And the tadpole's swamp water: murky green under lily pads floating on the surface, dim sunlight slanting down onto a
 * mud and clay bottom with seagrass.
 * The wolves' wild biomes, for the Mobs tab, have no villages either: the snowy taiga and the grove under snowy peaks,
 * the old growth taigas' giant spruces and pines over mossy boulders, a sparse jungle, a savanna plateau's high steps
 * and the wooded badlands' banded terracotta mesas with oaks on top. The panda's bamboo jungle has none either: thick
 * bamboo under jungle trees. Nor do the mooshroom's mushroom fields: huge mushrooms on mycelium.
 * So do the goat's jagged peaks: bare stone mountains, snow above the snow line, crags, ice and powder snow.
 * And the warm frog's mangrove swamp: mud and still water under mangroves standing on arching roots, propagules hanging
 * from their leaves.
 * The biomes some name tags' looks come from have backdrops too: the cherry grove's pink trees on a mountain meadow, the
 * pale garden's moss-hung pale oaks, the dappled forest's orange, red and gold trees, and the sulfur caves' yellow rock.
 */
// Spruce leaves keep one color everywhere; other tints come from BIOME_TINTS.
const SPRUCE_TINT = "#619961";

// A block in a prop: texture layers, each [texture, tint, columns] (columns [from, to) draws only that
// strip of the texture, for thin stalks); or a flat fill for doorways and windows.
// cap: false keeps snow off it (plants).
const blockTex = (name, tint, more = {}) => ({ layers: [[name, tint]], ...more });
const blockFill = color => ({ fill: color });
const plantTex = (name, tint) => blockTex(name, tint, { cap: false });
// Leaves; inside a crown their gaps show more leaves (backing, a darker shade of the tint), not the sky.
const leavesTex = (name, tint) => blockTex(name, tint, { backing: `rgb(${hex(tint).map(v => Math.round(v * 0.42)).join(",")})` });
const DOORWAY = blockFill("#21170f");

// A prop: rows of blocks, top row first, each letter a block from its legend and "." empty.
const prop = (rows, legend) => ({ rows, legend });

const oakTree = t => prop([
  ".LLL.",
  "LLLLL",
  "LLLLL",
  "..T..",
  "..T..",
], { L: leavesTex("leaves_oak", t.foliage), T: blockTex("log_oak") });
// A birch: taller and slimmer than an oak, its leaves a paler green whatever the biome, as in the game.
const birchTree = () => prop([
  ".LLL.",
  "LLLLL",
  "LLLLL",
  ".LLL.",
  "..T..",
  "..T..",
  "..T..",
], { L: leavesTex("leaves_birch", "#80a755"), T: blockTex("log_birch") });
const tallOak = t => prop([
  ".LLLL.",
  "LLLLLL",
  "LLLLLL",
  "LLLLLL",
  ".LTLL.",
  "..T...",
  "..T...",
  "..T...",
  "..T...",
], { L: leavesTex("leaves_oak", t.foliage), T: blockTex("log_oak") });
const spruceTree = () => prop([
  "..L..",
  ".LLL.",
  "..T..",
  ".LLL.",
  "LLLLL",
  "..T..",
  ".LLL.",
  "LLLLL",
  "..T..",
  "..T..",
], { L: leavesTex("leaves_spruce", SPRUCE_TINT), T: blockTex("log_spruce") });
const acaciaTree = t => prop([
  ".LLLLL.",
  "LLLLLLL",
  "..T....",
  "..T....",
  "...T...",
  "...T...",
], { L: leavesTex("leaves_acacia", t.foliage), T: blockTex("acacia_log") });
// A small jungle tree for the far canopy; tall ones lift their crowns above the rest.
const jungleTree = (t, trunk = 3) => prop([
  ".LLL.",
  "LLLLL",
  "LLLLL",
  ...Array(trunk).fill("..T.."),
], { L: leavesTex("leaves_jungle", t.foliage), T: blockTex("jungle_log") });
// A giant jungle tree: a two-wide trunk rising out of the top of the stage, its crown hung with vines.
const giantJungleTree = t => prop([
  "..LLLLLLLL..",
  ".LLLLLLLLLLL",
  "LLLLLLLLLLLL",
  "LLLLLLLLLLLL",
  "LVLLLTTLLLVL",
  ".V.VLTTL.V..",
  ".V.V.TT..V..",
  "...V.TT.....",
  ".....TT.....",
  ".....TT.....",
  ".....TT.....",
  ".....TT.....",
  ".....TT.....",
  ".....TT.....",
  ".....TT.....",
], { L: leavesTex("leaves_jungle", t.foliage), T: blockTex("jungle_log"), V: plantTex("vine", t.foliage) });
// A jungle bush: oak leaves round a stub of jungle log.
const jungleBush = t => prop([
  ".L.",
  "LTL",
], { L: leavesTex("leaves_oak", t.foliage), T: blockTex("jungle_log") });
// Bamboo: a thin stalk (the middle strip of its texture) under a tuft of leaves.
const bamboo = height => prop(["B", "B", ...Array(height - 2).fill("S")], {
  S: { layers: [["bamboo_stem", null, [6, 9]]], cap: false },
  B: { layers: [["bamboo_stem", null, [6, 9]], ["bamboo_leaf"]], cap: false },
});
// A bamboo jungle's stalk: big leaves at the top, small ones on the two segments below; and a shoot coming up.
const BAMBOO_STEM = ["bamboo_stem", null, [6, 9]];
const bambooStalk = height => prop(["B", "B", "s", "s", ...Array(height - 4).fill("S")], {
  S: { layers: [BAMBOO_STEM], cap: false },
  s: { layers: [BAMBOO_STEM, ["bamboo_small_leaf"]], cap: false },
  B: { layers: [BAMBOO_STEM, ["bamboo_leaf"]], cap: false },
});
// A clump of stalks side by side from left, one per height.
const bambooClump = (left, heights) => heights.map((h, i) => [bambooStalk(h), left + i]);
const largeFern = t => prop(["F", "f"], { F: plantTex("large_fern_top", t.grass), f: plantTex("large_fern_bottom", t.grass) });
const swampOak = t => prop([
  ".LLLLL.",
  "LLLLLLL",
  "LLLLLLL",
  "V..T..V",
  "V..T..V",
  "...T...",
], { L: leavesTex("leaves_oak", t.foliage), T: blockTex("log_oak"), V: plantTex("vine", t.foliage) });

// A mangrove, standing on arching roots (muddy where they meet the mud), propagules hanging under its leaves.
const mangroveTree = t => prop([
  "..LLLLL..",
  ".LLLLLLL.",
  "LLLLLLLLL",
  ".LLLTLLL.",
  ".p..T..p.",
  "....T....",
  "...RTR...",
  "..R.R.R..",
  ".M..M..M.",
], { L: leavesTex("mangrove_leaves", t.foliage), T: blockTex("mangrove_log"), R: blockTex("mangrove_roots"), M: blockTex("muddy_mangrove_roots"),
  p: plantTex("mangrove_propagule_hanging") });
// A small one, for the far hills.
const smallMangrove = t => prop([
  ".LLL.",
  "LLLLL",
  ".pTp.",
  ".RTR.",
  "R.R.R",
], { L: leavesTex("mangrove_leaves", t.foliage), T: blockTex("mangrove_log"), R: blockTex("mangrove_roots"), p: plantTex("mangrove_propagule_hanging") });

// The mushroom fields' huge mushrooms, as the game grows them: a red one's domed cap hangs down round its stem, a brown
// one's is a flat, wide plate.
const hugeRedMushroom = (stem = 2) => prop([".RRR.", "RRRRR", "RRRRR", "RRRRR", ...Array(stem).fill("..S..")],
  { R: blockTex("red_mushroom_block"), S: blockTex("mushroom_stem") });
const hugeBrownMushroom = (stem = 4) => prop(["BBBBBBB", ...Array(stem).fill("...S...")],
  { B: blockTex("brown_mushroom_block"), S: blockTex("mushroom_stem") });
// One block of a plant, or a short stack (cacti).
const plant = (name, tint, height = 1) => prop(Array(height).fill("P"), { P: plantTex(name, tint) });
const block = (name, rows = ["B"]) => prop(rows, { B: blockTex(name) });

// A village house: roof, walls with windows and a door, framed by logs on a foundation.
const house = ({ roof, wall, frame, base, door, window = blockTex("glass") }) => prop([
  "..RRR..",
  ".RRRRR.",
  "RRRRRRR",
  "FGWDWGF",
  "FWWdWWF",
  "BBBBBBB",
], {
  R: blockTex(roof), W: blockTex(wall), F: blockTex(frame), B: blockTex(base), G: window,
  D: blockTex(`door_${door}_upper`), d: blockTex(`door_${door}_lower`),
});
const desertHouse = prop([
  "XSSSSSX",
  "OOOOOOO",
  "SHSSSHS",
  "SSSHSSS",
  "SSSHSSS",
], { S: blockTex("smooth_sandstone"), X: blockTex("chiseled_sandstone"), O: blockTex("orange_terracotta"), H: DOORWAY });
const pyramid = prop([
  "....S....",
  "...SOS...",
  "..SSSSS..",
  ".SSSOSSS.",
  "SSSSSSSSS",
], { S: blockTex("smooth_sandstone"), O: blockTex("orange_terracotta") });
const igloo = prop([
  "..SSS..",
  ".SSSSS.",
  "SSSSSSS",
  "SSSHSSS",
], { S: blockTex("snow"), H: DOORWAY });
// A jungle temple in three tiers of mossy cobblestone and stone bricks, overgrown with leaves and vines.
const jungleTemple = t => prop([
  "...LXL...",
  "...MHM...",
  "..MMMMMV.",
  ".VCMCMC..",
  "MMMMMMMMM",
  "MCSMHMSCM",
  "MSMMHMMSM",
], {
  M: blockTex("mossy_cobblestone"), C: blockTex("cobblestone"), S: blockTex("mossy_stone_bricks"), X: blockTex("chiseled_stone_bricks"),
  H: DOORWAY, L: leavesTex("leaves_jungle", t.foliage), V: plantTex("vine", t.foliage),
});
const witchHut = prop([
  "RRRRRRR",
  ".PPPPP.",
  ".PHPPP.",
  ".PPPPP.",
  ".T...T.",
  ".T...T.",
], { R: blockTex("planks_dark_oak"), P: blockTex("planks_spruce"), H: DOORWAY, T: blockTex("log_oak") });
const wheatFarm = prop([
  "wwwww",
  "fffff",
], { w: plantTex("wheat_crop"), f: blockTex("dirt") });
const pond = t => prop([
  ".l...l.l.",
  "~~~~~~~~~",
], { "~": blockTex("water", t.water), l: blockTex("lily_pad", null, { rows: [11, 16], cap: false }) });

// Each biome's scene: hills (top and fill blocks, height in blocks, trees at fractions of the width) and
// nearer props at offsets in blocks from the middle.
const grassyTop = t => ({ layers: [["dirt"], ["grass_side_overlay", t.grass]] });
const oreMound = (ore, rows) => prop(rows, { R: blockTex("stone"), T: blockTex("tuff"), O: blockTex(ore) });
const stalagmite = prop(["t", "f", "D"], { t: plantTex("dripstone_up_tip"), f: plantTex("dripstone_up_frustum"), D: blockTex("dripstone_block") });
const netherMound = (rows) => prop(rows, { N: blockTex("netherrack"), C: blockTex("crimson_nylium"), M: blockTex("magma"), G: blockTex("glowstone"), Q: blockTex("quartz_ore") });
const lavafall = prop(Array(20).fill("L"), { L: blockTex("lava") });
const monument = prop([
  "......PPPP......",
  "....PPPLLPPP....",
  "....PDDDDDDP....",
  "..PPPPPPPPPPPP..",
  "..PLDDLDDLDDLP..",
  "PPPPPPPPPPPPPPPP",
  "PDDP.DP..PD.PDDP",
  "PDDP.DP..PD.PDDP",
], { P: blockTex("prismarine_bricks"), D: blockTex("prismarine_dark"), L: blockTex("sea_lantern") });
const kelp = height => prop(["B", ...Array(height - 2).fill("K"), "K"], { B: plantTex("kelp_top"), K: plantTex("kelp") });
const bulbKelp = height => prop(["T", "B", ...Array(height - 2).fill("K")], { T: plantTex("kelp_bulb"), B: plantTex("kelp_top"), K: plantTex("kelp") });
const tallSeagrass = prop(["T", "B"], { T: plantTex("tall_seagrass_top"), B: plantTex("tall_seagrass_bottom") });
// A coral reef's clump: blocks of one color with plants and fans of it, or of another, growing on top.
const reef = (a, b, rows) => prop(rows, {
  A: blockTex(`coral_${a}`), B: blockTex(`coral_${b}`), p: plantTex(`coral_plant_${a}`), q: plantTex(`coral_plant_${b}`),
  f: plantTex(`coral_fan_${a}`), g: plantTex(`coral_fan_${b}`), s: plantTex("sea_pickle"),
});
// Rock with glow lichen growing over it.
const lichen = rock => ({ layers: [[rock], ["glow_lichen"]] });
const lichenMound = rows => prop(rows, { R: blockTex("stone"), D: blockTex("deepslate"), L: lichen("stone"), K: lichen("deepslate") });
const dripleaf = height => prop(["L", ...Array(height - 1).fill("S")], { L: plantTex("big_dripleaf_top"), S: plantTex("big_dripleaf_stem") });
const azaleaBush = prop([".AF.", "AFAA", "AAFA"], { A: blockTex("azalea_leaves"), F: blockTex("azalea_leaves_flowers") });
const mossMound = rows => prop(rows, { M: blockTex("moss_block"), C: blockTex("clay") });
// An obsidian pillar, how many blocks tall and wide, capped with bedrock and holding an end crystal (crystal, how high
// it sits); caged, with iron bars round the crystal.
const obsidianPillar = (height, width = 1, caged = false) => {
  const side = ".".repeat((width - 1) / 2), cap = `${side}B${side}`;
  const top = caged ? ["I".repeat(width), `I${".".repeat(width - 2)}I`, `I${cap.slice(1, -1)}I`] : [cap];
  return { ...prop([...top, ...Array(height).fill("O".repeat(width))],
    { B: blockTex("bedrock"), O: blockTex("obsidian"), I: plantTex("iron_bars") }), crystal: height + 1 };
};
// The exit portal before the dragon falls: an empty bedrock bowl round a pillar with torches, side on.
const exitPortal = prop(["....B....", "...TBT...", "....B....", "B...B...B", "BBBBBBBBB"], { B: blockTex("bedrock"), T: plantTex("torch") });
const endTower = prop(["..E..", ".PPP.", "PPPPP", ".IGI.", ".IEI.", "PPPPP", ".IGI.", ".IEI.", ".IEI.", ".EEE."],
  { P: blockTex("purpur_block"), I: blockTex("purpur_pillar"), E: blockTex("end_bricks"), G: DOORWAY });
const farTower = prop(["..E..", ".PPP.", "PPPPP", ".IGI.", ".IEI.", "PPPPP", ".IGI.", ".IEI.", ".IEI.", "PPPPP", ".IGI.", ".IEI.", ".IEI.", ".EEE."],
  { P: blockTex("purpur_block"), I: blockTex("purpur_pillar"), E: blockTex("end_bricks"), G: DOORWAY });
const chorus = prop(["F...", "C.F.", "C.C.", "CCC.", ".C.F", ".CCC", ".C.."], { C: plantTex("chorus_plant"), F: plantTex("chorus_flower") });
const smallChorus = prop(["F.", "CF", "CC", "C."], { C: plantTex("chorus_plant"), F: plantTex("chorus_flower") });
// A mineshaft's support: two posts under a beam, webs thick in its top corners, a torch on one post (torch, -1 left or 1 right).
const mineSupport = (width, height, torch = 0) => {
  const inside = width - 2, line = (left, right) => `L${left}${".".repeat(inside - left.length - right.length)}${right}L`;
  const rows = ["W".repeat(Math.ceil(inside / 3)), "W"];
  return prop(["P".repeat(width), ...Array.from({ length: height }, (_, i) => {
    if (i < 2) return line(rows[i], rows[i]);
    if (i === 3 && torch) return torch < 0 ? line("T", "") : line("", "T");
    return line("", "");
  })], { P: blockTex("oak_planks"), L: blockTex("log_oak"), W: plantTex("cobweb"), T: plantTex("torch") });
};
const spawnerCage = block("mob_spawner");
// A mineshaft as the game builds it: every few blocks a support of two oak fence posts under an oak plank beam, a torch
// on some, cobwebs strung in their corners; rails along the floor, a chest minecart standing on them, and a spawner
// netted round with webs, where cave spiders come from.
const FENCE = { layers: [["oak_planks", null, [6, 10]]] };
// The heart of a plains village: its well (cobblestone round the water, oak posts holding up a cobblestone roof), the
// meeting point's bell hanging from an oak frame, a lamp post (a lantern on an oak fence post), a composter and a barrel by
// a house, and a smaller house for the far hills.
const villageWell = prop(["CCCC", "F..F", "F..F", "CCCC"], { C: blockTex("cobblestone"), F: FENCE });
const bellFrame = prop(["PPP", "FbF", "F.F"], { P: blockTex("oak_planks"), F: FENCE, b: plantTex("bell") });
const lampPost = prop(["L", "F", "F", "F"], { L: plantTex("lantern"), F: FENCE });
const smallHouse = ({ roof, wall, frame, base }) => prop([".RRR.", "RRRRR", "FWGWF", "FWWWF", "BBBBB"], {
  R: blockTex(roof), W: blockTex(wall), F: blockTex(frame), B: blockTex(base), G: blockTex("glass") });
const PLAINS_HOUSE = { roof: "planks_dark_oak", wall: "oak_planks", frame: "log_oak", base: "cobblestone", door: "oak" };
// webs: how many rows down the top corners are strung with cobwebs (the top row that many blocks in from each post).
const mineFrame = (width, height, { torch = 0, webs = 0 } = {}) => {
  const inside = width - 2, row = (left, right) => `F${left}${".".repeat(inside - left.length - right.length)}${right}F`;
  return prop(["P".repeat(width), ...Array.from({ length: height }, (_, i) => {
    const web = "W".repeat(Math.max(0, Math.min(webs - i, Math.floor(inside / 2))));
    if (i === 2 && torch) return torch < 0 ? row("T", web) : row(web, "T");
    return row(web, web);
  })], { P: blockTex("oak_planks"), F: FENCE, W: plantTex("cobweb"), T: plantTex("torch") });
};
// Rails seen from the side: the iron rail on its sleepers.
const RAIL = { rects: [[0, 13, 4, 16, "#4f3a24"], [8, 13, 12, 16, "#4f3a24"], [0, 11, 16, 13, "#7d7d7d"], [0, 11, 16, 12, "#b0b0b0"]], cap: false };
const rails = length => prop(["R".repeat(length)], { R: RAIL });
// A chest minecart: the chest's lid and latch showing over the cart's iron sides, wheels on the rail.
const chestMinecart = prop(["CC", "MM"], {
  C: { layers: [["chest_front"]], rows: [1, 16], cap: false },
  M: { rects: [[0, 0, 16, 9, "#5e5e5e"], [0, 0, 16, 2, "#8a8a8a"], [0, 7, 16, 9, "#3c3c3c"], [2, 9, 6, 13, "#262626"], [10, 9, 14, 13, "#262626"], ...RAIL.rects], cap: false },
});
const webbedSpawner = prop(["WWW", "WSW"], { S: blockTex("mob_spawner"), W: plantTex("cobweb") });
// The cherry grove: cherry trees, their pink crowns hanging down at the edges, over a meadow high in the mountains.
const CHERRY = { L: blockTex("cherry_leaves", null, { backing: "#a3607f" }), T: blockTex("cherry_log") };
const cherryTree = (trunk = 3) => prop(["..LLLLL..", ".LLLLLLL.", "LLLLLLLLL", "LLLLTLLLL", "L.L.T.L.L", ...Array(trunk).fill("....T....")], CHERRY);
const smallCherry = () => prop([".LLL.", "LLLLL", "L.T.L", "..T.."], CHERRY);
// The pale garden: pale oaks (dark oaks' shape: a two-wide trunk under a broad crown) hung with pale moss, one with a
// creaking heart in its trunk; pale moss underfoot and eyeblossoms, shut by day.
const PALE = { L: blockTex("pale_oak_leaves", null, { backing: "#4a504b" }), T: blockTex("pale_oak_log"), H: blockTex("creaking_heart"),
  M: plantTex("pale_hanging_moss"), m: plantTex("pale_hanging_moss_tip") };
const paleOak = (trunk = 3, heart = false) => prop([".LLLLLL.", "LLLLLLLL", "LLLLLLLL", "LMLTTLML", "M.TT..m.", "m.TT....",
  ...Array.from({ length: trunk }, (_, i) => (heart && i === 0 ? "..TH...." : "..TT...."))], PALE);
const smallPaleOak = () => prop([".LLL.", "LLLLL", "LMTML", "m.T.m", "..T.."], PALE);
const paleMound = rows => prop(rows, { M: blockTex("pale_moss_block"), D: blockTex("dirt") });
// The dappled forest: oaks and birches turned orange, red and gold, as the pack's dappled looks are.
const DAPPLED = { orange: "#d2701d", red: "#b8381c", gold: "#d8ae2c" };
const autumnBirch = () => prop([".LLL.", "LLLLL", "LLLLL", ".LLL.", "..T..", "..T..", "..T.."], { L: leavesTex("leaves_birch", DAPPLED.gold), T: blockTex("log_birch") });
// The sulfur caves: tuff and sulfur, seamed with potent sulfur and calcite, sulfur spikes hanging and rising.
const sulfurMound = rows => prop(rows, { S: blockTex("sulfur"), P: blockTex("potent_sulfur"), T: blockTex("tuff"), C: blockTex("calcite") });
const sulfurSpike = (tall = 1) => prop(["t", ...Array(tall).fill("f"), "S"], { t: plantTex("sulfur_spike_up_tip"), f: plantTex("sulfur_spike_up_frustum"), S: blockTex("sulfur") });
// A giant spruce of the old growth spruce taiga: a two-wide trunk under a broad cone, rising out of the top of the stage.
const giantSpruce = () => prop([
  "...LL...",
  "..LLLL..",
  "...LL...",
  "..LLLL..",
  ".LLLLLL.",
  "..LTTL..",
  ".LLLLLL.",
  "LLLLLLLL",
  "..LTTL..",
  "LLLLLLLL",
  "LLLLLLLL",
  "...TT...",
  "...TT...",
  "...TT...",
  "...TT...",
], { L: leavesTex("leaves_spruce", SPRUCE_TINT), T: blockTex("log_spruce") });
// A giant pine of the old growth pine taiga: a tall bare two-wide trunk with a small crown at the very top.
const giantPine = () => prop([
  "..LL..",
  ".LLLL.",
  "LLLLLL",
  ".LTTL.",
  "LLTTLL",
  "..TT..",
  "..TT..",
  "..TT..",
  "..TT..",
  "..TT..",
  "..TT..",
  "..TT..",
  "..TT..",
], { L: leavesTex("leaves_spruce", SPRUCE_TINT), T: blockTex("log_spruce") });
// A small spruce for the far hills, where the full one would stand too tall.
const smallSpruce = () => prop(["..L..", ".LLL.", "LLLLL", ".LLL.", "LLLLL", "..T.."], { L: leavesTex("leaves_spruce", SPRUCE_TINT), T: blockTex("log_spruce") });
// The old growth taigas' mossy cobblestone boulders.
const boulder = rows => prop(rows, { M: blockTex("mossy_cobblestone"), C: blockTex("cobblestone") });
const tallGrass = t => prop(["T", "B"], { T: plantTex("tall_grass_top", t.grass), B: plantTex("tall_grass_bottom", t.grass) });
// A badlands mesa's bands of terracotta, top down; and a small mound of them nearby.
const TERRACOTTA_BANDS = ["terracotta", "orange_terracotta", "terracotta", "yellow_terracotta", "brown_terracotta", "terracotta",
  "white_terracotta", "orange_terracotta", "light_gray_terracotta", "red_terracotta", "terracotta", "orange_terracotta"].map(n => blockTex(n));
const mesa = rows => prop(rows, { T: blockTex("terracotta"), O: blockTex("orange_terracotta"), Y: blockTex("yellow_terracotta"), R: blockTex("red_sand") });
const snowDrift = rows => prop(rows, { S: blockTex("snow"), P: blockTex("powder_snow"), R: blockTex("stone") });
// A crag on a mountainside: stone, andesite, calcite and gravel, an emerald showing in one, packed ice in another.
const crag = rows => prop(rows, { S: blockTex("stone"), A: blockTex("andesite"), C: blockTex("calcite"), G: blockTex("gravel"), E: blockTex("emerald_ore"), I: blockTex("packed_ice") });
const BACKDROPS = {
  flooded_cave: () => ({
    mist: { far: 0.7, near: 0.06 },
    water: { wash: "rgba(16, 70, 140, .12)" },
    wall: { rock: ["deepslate", "deepslate", "stone", "deepslate", "tuff"], ores: [lichen("deepslate"), lichen("deepslate"), lichen("stone"), "lapis_ore", "diamond_ore", "copper_ore"] },
    ceiling: { rock: ["deepslate", "stone", "deepslate", "tuff"], drip: ["dripstone_down_frustum", "dripstone_down_middle", "dripstone_down_tip"] },
    near: [[lichenMound(["..K.", ".KDR", "KDDL"]), -22], [stalagmite, -17], [lichenMound(["L.", "DK"]), -14], [plant("sea_pickle"), -11], [stalagmite, -9], [lichenMound([".K", "LD"]), -7],
      [plant("sea_pickle"), 5], [lichenMound(["K.", "DL"]), 7], [stalagmite, 10], [lichenMound([".L.", "KDK"]), 12], [plant("sea_pickle"), 15], [stalagmite, 17], [lichenMound(["..KL", ".LDD", "KDDK"]), 19]],
    // Glow lichen and sea pickles cast a cold light through the water.
    lights: [-20, -13, -7, 8, 13, 20], lightColor: "90, 210, 255",
  }),
  lush: () => ({
    mist: { far: 0.8, near: 0.04 },
    water: { wash: "rgba(30, 130, 140, .1)" },
    // Glow berries light the water under the ceiling.
    lights: [[-15, 11], [-9, 11.5], [-2, 11], [6, 11.5], [13, 11]],
    wall: { rock: ["stone", "moss_block", "moss_block", "stone", "mossy_cobblestone"], ores: ["moss_block", "clay", "clay", "mossy_cobblestone", "coal_ore"] },
    ceiling: { rock: ["moss_block", "moss_block", "stone", "mossy_cobblestone"], drip: ["cave_vines_body", "cave_vines_berries", "cave_vines_tip"] },
    near: [[mossMound(["..M.", ".MMM", "MMCM"]), -23], [dripleaf(6), -18], [azaleaBush, -14], [dripleaf(5), -10], [dripleaf(3), -8], [plant("small_dripleaf_side"), -6],
      [mossMound(["M.", "MC"]), -5], [plant("small_dripleaf_side"), 5], [mossMound([".M", "CM"]), 6], [dripleaf(4), 8], [azaleaBush, 10], [plant("flowering_azalea_side"), 14], [dripleaf(6), 16], [mossMound(["..MM", ".MMM", "MCMM"]), 20]],
  }),
  // The tadpole's swamp water, seen from under a pond's lily pads: the swamp's murky green water (its tint) over mud.
  swamp_water: t => ({
    mist: { far: 0.72, near: 0.2 },
    water: { sun: true, shafts: 0.4, surface: t.water, pads: [0.03, 0.08, 0.21, 0.26, 0.4, 0.57, 0.62, 0.66, 0.8, 0.94], wash: "rgba(72, 90, 34, .22)" },
    hills: { top: blockTex("mud"), fill: blockTex("mud"), base: 2, rise: 3 },
    near: [[block("mud", ["..B", ".BB", "BBB"]), -24], [tallSeagrass, -21], [plant("seagrass"), -19], [block("clay", [".B.", "BBB"]), -17], [tallSeagrass, -15],
      [block("mud", [".B", "BB"]), -12], [tallSeagrass, -11], [plant("seagrass"), -10], [plant("seagrass"), -7], [plant("seagrass"), -3], [plant("seagrass"), 4],
      [tallSeagrass, 6], [block("mud", [".B", "BB"]), 8], [plant("seagrass"), 11], [tallSeagrass, 13], [plant("seagrass"), 14], [tallSeagrass, 16], [block("clay", ["..B", "BBB"]), 18],
      [plant("seagrass"), 21], [tallSeagrass, 23]],
    seed: 31,
  }),
  ocean: () => ({
    mist: { far: 0.62, near: 0.16 },
    water: { sun: true },
    hills: { top: blockTex("sand"), fill: blockTex("sand"), base: 2, rise: 4, landmarks: [[monument, 0.56]] },
    near: [[kelp(9), -24], [bulbKelp(12), -23], [reef("red", "yellow", [".pf.", "pABq", "AABB"]), -20], [kelp(11), -17], [bulbKelp(8), -16],
      [tallSeagrass, -14], [reef("pink", "blue", ["g..", "Bq.", "BAf"]), -12], [plant("seagrass"), -9], [bulbKelp(6), -8], [plant("seagrass"), -5],
      [plant("sea_pickle"), -3], [plant("seagrass"), 4], [reef("yellow", "pink", [".q", "fB"]), 6], [tallSeagrass, 9], [bulbKelp(7), 11], [kelp(10), 12],
      [reef("blue", "red", ["p.g.", "AABq", "AABB"]), 14], [bulbKelp(13), 18], [kelp(9), 19], [reef("red", "pink", ["fq", "AB"]), 21], [kelp(11), 24]],
  }),
  end: () => ({
    mist: { far: 0.6, near: 0.1 },
    // A pale violet glow low in the middle, so that the dark mobs that live here stand out against it.
    sky: { texture: "end_sky", tint: "#1e1634", glow: "150, 105, 215" },
    hills: { top: blockTex("end_stone"), fill: blockTex("end_stone"), base: 1, rise: 3,
      landmarks: [[obsidianPillar(13), 0.07], [farTower, 0.2], [obsidianPillar(19), 0.34], [obsidianPillar(10), 0.47], [obsidianPillar(16), 0.63], [farTower, 0.75], [obsidianPillar(21), 0.92]] },
    crystals: true,
    near: [[endTower, -21], [chorus, -13], [smallChorus, -8], [block("end_stone", [".B", "BB"]), -6], [smallChorus, 7], [chorus, 11], [block("end_stone", ["..B", ".BB", "BBB"]), 15], [endTower, 18]],
    // Chorus flowers give off a faint violet light.
    lights: [[-13, 6], [11, 6]], lightColor: "120, 70, 180",
  }),
  end_island: () => ({
    mist: { far: 0.55, near: 0.08 },
    sky: { texture: "end_sky", tint: "#1e1634", glow: "170, 95, 205" },
    hills: { top: blockTex("end_stone"), fill: blockTex("end_stone"), base: 1, rise: 2,
      landmarks: [[0.03, 15], [0.13, 22], [0.25, 18], [0.36, 25], [0.47, 16], [0.56, 24], [0.68, 19], [0.79, 26], [0.9, 17], [0.97, 21]].map(([at, height]) => [obsidianPillar(height), at]) },
    crystals: true,
    near: [[obsidianPillar(9, 3), -23], [obsidianPillar(6, 3, true), -17], [obsidianPillar(8, 3), -10], [exitPortal, -4.5], [block("end_stone", [".B", "BB"]), 5], [obsidianPillar(7, 3, true), 7], [obsidianPillar(10, 3), 14], [obsidianPillar(6, 3), 20]],
  }),
  nether: () => ({
    mist: { far: 0.5, near: 0.12 },
    wall: { rock: ["netherrack", "netherrack", "netherrack", "blackstone"], ores: ["quartz_ore", "quartz_ore", "nether_gold_ore", "glowstone"] },
    ceiling: { rock: ["netherrack", "netherrack", "blackstone", "glowstone"], drip: ["weeping_vines_base", "weeping_vines_base", "weeping_vines"] },
    near: [[lavafall, -18], [netherMound(["..C.", ".CNC", "CMNQ"]), -23], [plant("crimson_roots"), -8], [plant("crimson_fungus"), -6],
      [plant("crimson_fungus"), 6], [netherMound(["G.", "CC"]), 8], [lavafall, 14], [netherMound(["..CC", ".CNN", "CQMN"]), 16], [plant("crimson_roots"), 11]],
    lights: [-18, 14],
  }),
  // A mineshaft corridor, as dark as the game's: a support every few blocks, rails down the middle with a chest minecart
  // on them, and webs thickest round the spawner, where the cave spiders come from.
  mineshaft: () => ({
    mist: { far: 0.8, near: 0.22 },
    wall: { rock: ["stone", "stone", "andesite", "stone", "gravel", "stone", "tuff"], ores: ["coal_ore", "coal_ore", "coal_ore", "iron_ore", "andesite", "gravel"] },
    ceiling: { rock: ["stone", "andesite", "stone", "gravel", "stone"], drip: ["cobweb"], low: 12, shade: 0.45 },
    near: [[mineFrame(5, 10, { webs: 3 }), -28], [mineFrame(5, 10, { torch: 1, webs: 1 }), -20], [webbedSpawner, -15], [block("cobweb", ["B.", "BB"]), -17],
      [mineFrame(5, 10, { webs: 3 }), -11], [rails(64), -32], [plant("cobweb"), -5], [plant("cobweb"), 4],
      [mineFrame(5, 10, { torch: -1, webs: 2 }), 7], [chestMinecart, 13], [mineFrame(5, 10, { webs: 3 }), 16], [block("cobweb", [".B", "BB"]), 21],
      [mineFrame(5, 10, { torch: 1, webs: 1 }), 24]],
    // Only the torches light it, and the spawner's flames faintly.
    lights: [[-16.5, 7.5], [7.5, 7.5], [27.5, 7.5], [-14, 0.6]],
  }),
  cave: () => ({
    mist: { far: 0.62, near: 0.3 },
    wall: { rock: ["stone", "stone", "stone", "andesite", "tuff"], ores: ["coal_ore", "coal_ore", "iron_ore", "copper_ore", "redstone_ore", "gold_ore", "lapis_ore", "diamond_ore"] },
    ceiling: { rock: ["stone", "andesite", "stone", "cobblestone"], drip: ["dripstone_down_frustum", "dripstone_down_middle", "dripstone_down_tip"] },
    near: [[oreMound("iron_ore", ["..R.", ".ROR", "RRTR"]), -21], [plant("lantern"), -15], [stalagmite, -12], [oreMound("coal_ore", ["O.", "RR"]), -9],
      [stalagmite, 8], [oreMound("gold_ore", [".T.", "ROR"]), 10], [plant("lantern"), 14], [oreMound("diamond_ore", ["..RR", ".ROR", "TRRR"]), 17]],
    lights: [-15, 14],
  }),
  // The wolves' wild biomes, each the one its variant spawns in.
  snowy_taiga: t => ({
    hills: { top: blockTex("snowy_grass_side"), fill: blockTex("dirt"), base: 3, rise: 4, trees: [0.03, 0.12, 0.22, 0.34, 0.47, 0.58, 0.7, 0.81, 0.93].map(at => [spruceTree(), at]) },
    near: [[spruceTree(), -23], [spruceTree(), -17], [plant("fern", t.grass), -13], [spruceTree(), -11], [plant("berry_bush"), -7], [largeFern(t), -5],
      [plant("fern", t.grass), 4], [spruceTree(), 6], [plant("berry_bush"), 11], [spruceTree(), 13], [largeFern(t), 17], [spruceTree(), 19]],
    snowy: true, seed: 21,
  }),
  // Snowy peaks behind; a snowy spruce wood with drifts of powder snow on the slope below them.
  grove: () => ({
    hills: { top: blockTex("snow"), fill: blockTex("stone"), base: 6, rise: 9, trees: [0.05, 0.19, 0.4, 0.66, 0.88].map(at => [smallSpruce(), at]) },
    near: [[spruceTree(), -24], [snowDrift(["..S", "SPP"]), -19], [spruceTree(), -16], [spruceTree(), -10], [snowDrift(["S.", "PS"]), -6],
      [snowDrift([".S", "SP"]), 5], [spruceTree(), 8], [snowDrift(["..SR", "SPPS"]), 13], [spruceTree(), 18]],
    snowy: true, seed: 23,
  }),
  // The goat's jagged peaks: bare stone mountains (streaked with andesite and calcite) rising to sharp points behind,
  // snow above the snow line, and nearer
  // by crags of stone, andesite and calcite (an emerald in one), packed ice and drifts of powder snow, with no trees.
  peaks: () => ({
    mist: { far: 0.22, near: 0.1 },
    hills: { top: blockTex("stone"), fill: blockTex("stone"), bands: ["stone", "stone", "andesite", "stone", "stone", "stone", "calcite", "stone", "andesite"].map(b => blockTex(b)), snow: blockTex("snow"), snowline: 17, base: 2, rise: 2,
      peaks: [[0.02, 16, 1.6], [0.2, 24, 1.3], [0.42, 14, 1.8], [0.62, 21, 1.4], [0.83, 26, 1.2], [1.02, 15, 1.7]] },
    near: [[crag(["...S..", "..SAS.", ".SSCSA", "SASSES"]), -15], [snowDrift(["..S", "SPP"]), -10], [crag(["I", "I"]), -7],
      [snowDrift(["S.", "PS"]), -5], [crag(["C.", "SA"]), 4], [snowDrift([".S", "SP"]), 6], [crag(["..I", ".II"]), 8], [crag(["..SA.", ".ASSS", "SSCAS"]), 11]],
    snowy: true, seed: 41,
  }),
  pine_taiga: t => ({
    hills: { top: blockTex("podzol_side"), fill: blockTex("dirt"), base: 3, rise: 3, trees: [0.02, 0.1, 0.18, 0.27, 0.36, 0.45, 0.55, 0.64, 0.73, 0.82, 0.91].map(at => [smallSpruce(), at]) },
    near: [[giantPine(), -24], [boulder([".M.", "MCM"]), -18], [giantPine(), -14], [plant("fern", t.grass), -10], [largeFern(t), -7], [plant("mushroom_brown"), -4],
      [plant("dead_bush"), 3], [largeFern(t), 5], [giantPine(), 8], [plant("fern", t.grass), 13], [boulder(["M.", "MM"]), 15], [giantPine(), 19]],
    seed: 25,
  }),
  spruce_taiga: t => ({
    hills: { top: blockTex("podzol_side"), fill: blockTex("dirt"), base: 3, rise: 4, trees: [0.03, 0.15, 0.27, 0.39, 0.51, 0.63, 0.75, 0.87].map(at => [spruceTree(), at]) },
    near: [[giantSpruce(), -25], [boulder(["..M.", ".MMC", "MCMM"]), -17], [largeFern(t), -13], [giantSpruce(), -11], [plant("berry_bush"), -5],
      [plant("fern", t.grass), 4], [plant("berry_bush"), 6], [giantSpruce(), 8], [boulder([".M", "MC"]), 16], [largeFern(t), 18], [spruceTree(), 21]],
    seed: 27,
  }),
  // Jungle trees standing apart in open grass, with bushes and melons between them.
  sparse_jungle: t => ({
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 3, rise: 3, trees: [[jungleTree(t, 4), 0.08], [jungleTree(t, 3), 0.3], [jungleTree(t, 5), 0.55], [jungleTree(t, 3), 0.84]] },
    near: [[jungleTree(t, 6), -21], [jungleBush(t), -15], [plant("short_grass", t.grass), -12], [block("melon_side"), -9], [largeFern(t), -6],
      [plant("short_grass", t.grass), 4], [jungleBush(t), 6], [jungleTree(t, 5), 11], [tallGrass(t), 17], [jungleBush(t), 19], [plant("short_grass", t.grass), 22]],
    seed: 29,
  }),
  // High on the plateau: its stepped edge falls away behind, acacias dot the top.
  savanna_plateau: t => ({
    hills: { top: grassyTop(t), fill: blockTex("coarse_dirt"), base: 6, rise: 6, steps: 3, trees: [[acaciaTree(t), 0.1], [acaciaTree(t), 0.42], [acaciaTree(t), 0.78]] },
    near: [[acaciaTree(t), -21], [tallGrass(t), -14], [plant("short_grass", t.grass), -11], [plant("short_grass", t.grass), -7], [tallGrass(t), -5],
      [plant("short_grass", t.grass), 4], [tallGrass(t), 6], [acaciaTree(t), 10], [plant("short_grass", t.grass), 18], [tallGrass(t), 21]],
    seed: 31,
  }),
  // Banded terracotta mesas behind, oaks on their grassy tops; red sand, dead bushes and a cactus below.
  badlands: t => ({
    hills: { top: grassyTop(t), fill: blockTex("terracotta"), bands: TERRACOTTA_BANDS, base: 6, rise: 8, steps: 3, trees: [[oakTree(t), 0.14], [oakTree(t), 0.5], [oakTree(t), 0.83]] },
    near: [[mesa(["..TT", ".OOT", "YYOO", "RRRR"]), -24], [oakTree(t), -17], [plant("dead_bush"), -12], [plant("cactus_side", null, 2), -9], [mesa(["R.", "RR"]), -6],
      [plant("dead_bush"), 4], [mesa([".R", "RR"]), 6], [oakTree(t), 10], [plant("dead_bush"), 15], [mesa(["..T.", ".TOO", "OYYT", "RRRR"]), 19]],
    seed: 33,
  }),
  plains: t => ({
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 3, rise: 4, trees: [[oakTree(t), 0.06], [oakTree(t), 0.3], [oakTree(t), 0.55], [oakTree(t), 0.86]] },
    near: [[house({ roof: "planks_dark_oak", wall: "oak_planks", frame: "log_oak", base: "cobblestone", door: "oak" }), -14],
      [oakTree(t), -7], [plant("poppy"), -1], [wheatFarm, 2], [oakTree(t), 10], [block("hay_side", [".B", "BB"]), 8], [plant("dandelion"), 13]],
  }),
  // The middle of a plains village, the iron golem's and the villager's: houses either side, the well, the bell and a lamp
  // post, a farm and hay bales, with more roofs on the far hills.
  village: t => ({
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 3, rise: 3, trees: [[oakTree(t), 0.05], [oakTree(t), 0.48], [oakTree(t), 0.93]],
      landmarks: [[smallHouse(PLAINS_HOUSE), 0.2], [smallHouse(PLAINS_HOUSE), 0.33], [smallHouse(PLAINS_HOUSE), 0.66], [smallHouse(PLAINS_HOUSE), 0.8]] },
    near: [[house(PLAINS_HOUSE), -14], [lampPost, -7], [plant("poppy"), -5], [villageWell, 2], [bellFrame, 7], [block("composter_side"), 10],
      [block("hay_side", [".B", "BB"]), 11], [wheatFarm, 13]],
    seed: 9,
  }),
  desert: () => ({
    hills: { top: blockTex("sand"), fill: blockTex("sand"), base: 2, rise: 4, landmarks: [[pyramid, 0.72]] },
    near: [[desertHouse, -15], [plant("cactus_side", null, 3), -6], [plant("dead_bush"), -3], [plant("cactus_side", null, 2), 4],
      [plant("dead_bush"), 9], [block("smooth_sandstone", ["XSX", "SSS"]), 11]],
  }),
  savanna: t => ({
    hills: { top: grassyTop(t), fill: blockTex("coarse_dirt"), base: 3, rise: 5, steps: 2, trees: [[acaciaTree(t), 0.16], [acaciaTree(t), 0.62]] },
    near: [[house({ roof: "orange_terracotta", wall: "planks_acacia", frame: "acacia_log", base: "yellow_terracotta", door: "acacia" }), -15],
      [acaciaTree(t), -8], [plant("short_grass", t.grass), 0], [plant("short_grass", t.grass), 3], [acaciaTree(t), 8]],
  }),
  snowy: () => ({
    hills: { top: blockTex("snowy_grass_side"), fill: blockTex("dirt"), base: 3, rise: 4, trees: [[spruceTree(), 0.08], [spruceTree(), 0.3], [spruceTree(), 0.58], [spruceTree(), 0.9]] },
    near: [[igloo, -14], [spruceTree(), -7], [block("packed_ice", [".B", "BB"]), 2], [spruceTree(), 7], [spruceTree(), 12]],
  }),
  forest: t => ({
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 3, rise: 3, trees: [
      [oakTree(t), 0.01], [birchTree(), 0.08], [oakTree(t), 0.15], [oakTree(t), 0.22], [birchTree(), 0.29], [oakTree(t), 0.36], [birchTree(), 0.43], [oakTree(t), 0.5],
      [oakTree(t), 0.57], [birchTree(), 0.64], [oakTree(t), 0.71], [oakTree(t), 0.78], [birchTree(), 0.85], [oakTree(t), 0.92]] },
    near: [[tallOak(t), -24], [birchTree(), -18], [plant("fern", t.grass), -19], [oakTree(t), -14], [plant("short_grass", t.grass), -13], [plant("mushroom_brown"), -10], [plant("short_grass", t.grass), -9], [birchTree(), -8], [plant("oxeye_daisy"), -5],
      [plant("short_grass", t.grass), -3], [plant("poppy"), 3], [plant("short_grass", t.grass), 5], [plant("fern", t.grass), 6], [birchTree(), 7], [plant("mushroom_red"), 12], [oakTree(t), 13], [plant("short_grass", t.grass), 18], [birchTree(), 19], [plant("dandelion"), 18], [tallOak(t), 23]],
  }),
  taiga: t => ({
    hills: { top: blockTex("podzol_side"), fill: blockTex("dirt"), base: 3, rise: 4, trees: [0.04, 0.16, 0.3, 0.45, 0.6, 0.74, 0.88].map(at => [spruceTree(), at]) },
    near: [[house({ roof: "cobblestone", wall: "planks_spruce", frame: "log_spruce", base: "mossy_cobblestone", door: "spruce" }), -14],
      [spruceTree(), -7], [plant("berry_bush"), -1], [plant("fern", t.grass), 3], [spruceTree(), 7], [plant("berry_bush"), 13], [spruceTree(), 14]],
  }),
  // A dense canopy on low hills behind; giant trees frame the scene from above, one off to the left.
  jungle: t => ({
    hills: {
      top: grassyTop(t), fill: blockTex("dirt"), base: 2, rise: 2,
      trees: Array.from({ length: 16 }, (_, i) => [jungleTree(t, [5, 3, 7, 4][i % 4]), i / 15 - 0.03]),
    },
    near: [[giantJungleTree(t), -20], [giantJungleTree(t), 3], [jungleTemple(t), -14], [jungleBush(t), -5], [largeFern(t), -1],
      [jungleBush(t), 2], [block("melon_side"), 6], [bamboo(7), 11], [bamboo(9), 12], [largeFern(t), 13], [bamboo(6), 14]],
  }),
  // The panda's bamboo jungle: bamboo stands thick on the hills behind, a few jungle trees rising out of it. Nearer,
  // tall stalks crowd in from both sides under a giant jungle tree, with shoots, ferns and a melon at their feet, round
  // a clearing for the mob.
  bamboo_jungle: t => ({
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 2, rise: 2, trees: [
      ...Array.from({ length: 24 }, (_, i) => [jungleBush(t), i / 23 - 0.01]),
      ...Array.from({ length: 72 }, (_, i) => [bambooStalk([10, 13, 8, 12, 9, 14, 11, 7, 12][i % 9]), i / 71]),
      [jungleTree(t, 7), 0.16], [jungleTree(t, 9), 0.47], [jungleTree(t, 8), 0.8]] },
    near: [[giantJungleTree(t), -27], ...bambooClump(-22, [12, 16, 11, 15, 13]), [jungleBush(t), -18], ...bambooClump(-16, [14, 12, 15]),
      [largeFern(t), -13], [plant("bamboo_sapling"), -12], ...bambooClump(-11, [10, 13]), [plant("fern", t.grass), -9], ...bambooClump(-8, [8]),
      [plant("bamboo_sapling"), -7], [plant("short_grass", t.grass), -5], [plant("bamboo_sapling"), 4], [plant("fern", t.grass), 5],
      ...bambooClump(6, [9]), [plant("bamboo_sapling"), 7], ...bambooClump(8, [11, 13]), [block("melon_side"), 10], ...bambooClump(11, [14, 12, 15]),
      [largeFern(t), 14], ...bambooClump(15, [13, 16, 12]), [jungleBush(t), 18], ...bambooClump(20, [15, 12, 16, 14, 13])],
    seed: 35,
  }),
  // The mooshroom's mushroom fields: mycelium hills with no trees at all, only huge red and brown mushrooms, and small
  // ones underneath.
  mushroom_fields: () => ({
    hills: { top: blockTex("mycelium_side"), fill: blockTex("dirt"), base: 3, rise: 4, trees: [
      [hugeRedMushroom(2), 0.04], [hugeBrownMushroom(3), 0.17], [hugeRedMushroom(1), 0.33], [hugeBrownMushroom(4), 0.5],
      [hugeRedMushroom(3), 0.64], [hugeBrownMushroom(2), 0.78], [hugeRedMushroom(2), 0.91]] },
    near: [[hugeBrownMushroom(6), -26], [hugeRedMushroom(4), -17], [plant("mushroom_red"), -12], [plant("mushroom_brown"), -10],
      [plant("mushroom_brown"), -6], [plant("mushroom_red"), 5], [plant("mushroom_brown"), 8], [hugeRedMushroom(5), 10],
      [plant("mushroom_red"), 16], [hugeBrownMushroom(5), 18]],
    seed: 37,
  }),
  // The cherry grove: a meadow high in the mountains, cherry trees on the slopes behind and nearer by, saplings and grass.
  cherry_grove: t => ({
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 4, rise: 6, trees: [0.03, 0.15, 0.28, 0.41, 0.55, 0.69, 0.82, 0.94].map(at => [smallCherry(), at]) },
    near: [[cherryTree(4), -26], [plant("short_grass", t.grass), -17], [cherryTree(3), -16], [plant("cherry_sapling"), -9], [plant("short_grass", t.grass), -7],
      [plant("short_grass", t.grass), 4], [plant("cherry_sapling"), 6], [cherryTree(5), 9], [plant("short_grass", t.grass), 19], [cherryTree(3), 20]],
    seed: 39,
  }),
  // The pale garden: pale oaks thick on the hills, hung with pale moss; pale moss underfoot, eyeblossoms shut by day,
  // and a creaking heart in one trunk.
  pale_garden: () => ({
    mist: { far: 0.5, near: 0.16 },
    hills: { top: blockTex("pale_moss_block"), fill: blockTex("pale_moss_block"), base: 3, rise: 3, trees: Array.from({ length: 22 }, (_, i) => [smallPaleOak(), i / 21 - 0.02]) },
    near: [[paleOak(4), -28], [paleOak(5), -22], [plant("eyeblossom"), -19], [paleOak(3, true), -16], [smallPaleOak(), -10], [paleMound(["M.", "MM"]), -11],
      [plant("pale_moss_carpet_side"), -7], [plant("eyeblossom"), -5], [plant("eyeblossom"), 5], [plant("pale_moss_carpet_side"), 7], [smallPaleOak(), 7],
      [paleOak(5), 11], [plant("eyeblossom"), 18], [paleMound([".M", "MD"]), 19], [paleOak(3), 21], [paleOak(4), 26]],
    seed: 41,
  }),
  // The dappled forest: oaks gone orange and red and birches gone gold, bushes and firefly bushes beneath.
  dappled_forest: t => ({
    mist: { far: 0.3, near: 0.08 },
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 3, rise: 3, trees: Array.from({ length: 14 }, (_, i) => [
      i % 3 === 2 ? autumnBirch() : oakTree({ foliage: i % 3 ? DAPPLED.red : DAPPLED.orange }), i / 13 - 0.02]) },
    near: [[tallOak({ foliage: DAPPLED.orange }), -26], [autumnBirch(), -19], [plant("bush", DAPPLED.orange), -14], [oakTree({ foliage: DAPPLED.red }), -12],
      [plant("firefly_bush"), -7], [plant("short_grass", t.grass), -5], [plant("short_grass", t.grass), 4], [plant("bush", DAPPLED.red), 6],
      [autumnBirch(), 8], [plant("firefly_bush"), 13], [tallOak({ foliage: DAPPLED.red }), 15], [oakTree({ foliage: DAPPLED.orange }), 21]],
    seed: 43,
  }),
  // The sulfur caves: tuff and yellow sulfur seamed with potent sulfur and calcite, sulfur spikes hanging from the ceiling
  // and rising from the floor.
  sulfur_caves: () => ({
    mist: { far: 0.7, near: 0.22 },
    wall: { rock: ["tuff", "tuff", "tuff", "sulfur", "tuff", "tuff"], ores: ["potent_sulfur", "sulfur", "sulfur", "calcite"] },
    ceiling: { rock: ["tuff", "sulfur", "tuff", "calcite"], drip: ["sulfur_spike_down_frustum", "sulfur_spike_down_middle", "sulfur_spike_down_tip"] },
    near: [[sulfurMound(["..S.", ".SPS", "TSSC"]), -24], [sulfurSpike(2), -18], [sulfurMound(["P.", "SS"]), -15], [sulfurSpike(), -11], [sulfurSpike(), -7],
      [sulfurSpike(), 6], [sulfurMound([".S", "PS"]), 9], [sulfurSpike(2), 13], [sulfurMound(["..SC", ".PSS", "STSP"]), 17], [sulfurSpike(), 22]],
    lights: [-23, -15, 9, 18], lightColor: "255, 214, 80",
  }),
  mangrove_swamp: t => ({
    hills: { top: blockTex("mud"), fill: blockTex("mud"), base: 2, rise: 1, trees: [0.06, 0.24, 0.43, 0.62, 0.8, 0.95].map(at => [smallMangrove(t), at]) },
    near: [[mangroveTree(t), -21], [pond(t), -12], [mangroveTree(t), -6], [plant("lily_pad"), 2], [mangroveTree(t), 5], [pond(t), 13], [mangroveTree(t), 19]],
    seed: 27,
  }),
  swamp: t => ({
    hills: { top: grassyTop(t), fill: blockTex("mud"), base: 2, rise: 1, trees: [[swampOak(t), 0.2], [swampOak(t), 0.5], [swampOak(t), 0.82]] },
    near: [[witchHut, -14], [swampOak(t), -7], [swampOak(t), 2], [pond(t), 8], [plant("short_grass", t.grass), -2]],
  }),
};

// A texture, tinted as the game tints it, on a 16×16 canvas kept for reuse.
function textureCanvas(name, tint) {
  const cache = textureCanvas.cache || (textureCanvas.cache = {});
  const key = `${name}/${tint || ""}`;
  if (!(key in cache)) {
    const px = art(name) && (tint ? multiplied(art(name), tint) : art(name));
    let cv = null;
    if (px) {
      cv = Object.assign(document.createElement("canvas"), { width: 16, height: 16 });
      const img = cv.getContext("2d").createImageData(16, 16);
      px.forEach((p, i) => { if (p) img.data.set([...p, 255], i * 4); });
      cv.getContext("2d").putImageData(img, 0, 0);
    }
    cache[key] = cv;
  }
  return cache[key];
}

// Draw one block at (left, top), size pixels square; rows: [first, last) texel rows only.
function drawBlock(ctx, spec, left, top, size) {
  if (spec.fill) {
    ctx.fillStyle = spec.fill;
    ctx.fillRect(left, top, size, size);
    return;
  }
  const [from, to] = spec.rows || [0, 16];
  for (const [name, tint, [x0, x1] = [0, 16]] of spec.layers || []) {
    const tex = textureCanvas(name, tint);
    if (tex) ctx.drawImage(tex, x0, from, x1 - x0, to - from, left + (x0 / 16) * size, top + (from / 16) * size, ((x1 - x0) / 16) * size, ((to - from) / 16) * size);
  }
  // Flat-colored boxes over the layers, in texels: [x0, y0, x1, y1, color] (a rail seen from the side, a minecart).
  for (const [x0, y0, x1, y1, color] of spec.rects || []) {
    ctx.fillStyle = color;
    ctx.fillRect(left + (x0 / 16) * size, top + (y0 / 16) * size, ((x1 - x0) / 16) * size, ((y1 - y0) / 16) * size);
  }
}

// A layer of snow on a block whose top is open.
function drawSnowCap(ctx, left, top, size) {
  const snow = textureCanvas("snow");
  if (snow) ctx.drawImage(snow, 0, 0, 16, 3, left, top - (3 / 16) * size, size, (3 / 16) * size);
}

// Draw a prop standing on bottom, its left edge at left.
function drawProp(ctx, { rows, legend }, left, bottom, size, snowy) {
  const filled = (r, c) => Boolean(legend[(rows[r] || "")[c]]);
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    const spec = legend[ch];
    if (!spec) return;
    const x = left + c * size, y = bottom - (rows.length - r) * size;
    if (spec.backing && filled(r - 1, c) && filled(r + 1, c) && filled(r, c - 1) && filled(r, c + 1)) {
      ctx.fillStyle = spec.backing;
      ctx.fillRect(x, y, size, size);
    }
    drawBlock(ctx, spec, x, y, size);
    if (snowy && spec.cap !== false && !legend[(rows[r - 1] || "")[c]]) drawSnowCap(ctx, x, y, size);
  }));
}

// Hills along the horizon: a column of blocks every size pixels, rising and falling smoothly (in steps
// for plateaus), with trees and landmarks standing on top.
// How tall the hills are at each column, and where their landmarks stand: [prop, left edge, ground under it].
// Mountains (peaks: [where across, 0 to 1; how many blocks tall; how many blocks they fall a column]) rise to points
// over the rolling hills, their slopes a block more or less here and there so they look jagged. cols: how many columns
// wide the hills are.
function hillHeights(hills, seed, cols) {
  const random = rng(seed), phase = [random() * 6, random() * 6], rough = Array.from({ length: 256 }, () => Math.floor(random() * 3) - 1);
  const wave = c => (0.6 * Math.sin(c * 0.29 + phase[0]) + 0.4 * Math.sin(c * 0.71 + phase[1]) + 1) / 2;
  return c => {
    let h = hills.base + hills.rise * wave(c);
    for (const [at, tall, fall] of hills.peaks || []) {
      const from = Math.abs(c - at * cols);
      h = Math.max(h, tall - from * fall + (from > 0.5 ? rough[c & 255] : 0));
    }
    return hills.steps ? Math.round(h / hills.steps) * hills.steps : Math.round(h);
  };
}
function hillSpots(hills, width, horizon, size, seed) {
  const heightAt = hillHeights(hills, seed, width / size);
  return [...(hills.trees || []), ...(hills.landmarks || [])].map(([p, at]) => {
    const c = Math.round((at * width) / size), w = p.rows[0].length;
    return [p, c * size, horizon - Math.min(...Array.from({ length: w }, (_, i) => heightAt(c + i))) * size];
  });
}
function drawHills(ctx, hills, width, horizon, size, snowy, seed) {
  const heightAt = hillHeights(hills, seed, width / size), cols = Math.ceil(width / size) + 1;
  for (let c = 0; c < cols; c++) {
    const h = heightAt(c);
    // Bands (a mesa's) run level across the hills, counted down from the highest top. Above the snow line (a mountain's)
    // they're all snow.
    const top = hills.base + hills.rise;
    for (let k = 0; k < h; k++) drawBlock(ctx, hills.snowline && k >= hills.snowline + (c % 3 === 0 ? 1 : 0) ? hills.snow : k === h - 1 ? hills.top : hills.bands ? hills.bands[(((top - k) % hills.bands.length) + hills.bands.length) % hills.bands.length] : hills.fill, c * size, horizon - (k + 1) * size, size);
    if (snowy && hills.top.cap !== false) drawSnowCap(ctx, c * size, horizon - h * size, size);
  }
  for (const [p, left, ground] of hillSpots(hills, width, horizon, size, seed)) drawProp(ctx, p, left, ground, size, snowy);
}

// A sky of one tiled texture, each tile flipped its own way so the pattern doesn't show.
function drawSky(ctx, { texture, tint, glow }, width, height, size, seed) {
  const cv = textureCanvas(texture, tint), random = rng(seed);
  if (!cv) return;
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < height; y += size) for (let x = 0; x < width; x += size) {
    const fx = random() < 0.5 ? -1 : 1, fy = random() < 0.5 ? -1 : 1;
    ctx.setTransform(fx, 0, 0, fy, x + size / 2, y + size / 2);
    ctx.drawImage(cv, -size / 2, -size / 2, size, size);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!glow) return;
  const x = width / 2, y = height * 0.58, r = Math.max(width * 0.42, height * 0.8);
  const light = ctx.createRadialGradient(x, y, 0, x, y, r);
  light.addColorStop(0, `rgba(${glow}, .62)`);
  light.addColorStop(0.45, `rgba(${glow}, .24)`);
  light.addColorStop(1, `rgba(${glow}, 0)`);
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
}

// Where a stand of pillars' crystals sit, as [middle, bottom]: each pillar in spots, as [prop, left edge, ground].
const crystalsOf = (spots, size) => spots.filter(([p]) => p.crystal).map(([p, left, ground]) => [left + (p.rows[0].length * size) / 2, ground - p.crystal * size]);
// End crystals: a small pink cube, each with the glow round it.
function drawCrystals(ctx, crystals, size) {
  ctx.globalCompositeOperation = "lighter";
  for (const [x, bottom] of crystals) {
    const y = bottom - 0.7 * size, r = 2.6 * size;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, "rgba(255, 150, 235, .85)");
    glow.addColorStop(0.3, "rgba(225, 90, 225, .28)");
    glow.addColorStop(1, "rgba(200, 80, 220, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#f7c9f4";
  for (const [x, bottom] of crystals) ctx.fillRect(x - size * 0.28, bottom - size * 0.9, size * 0.56, size * 0.56);
}
// Sunlight slanting down from the surface in soft bands that fade with depth, drawn in steps like the blocks; strength
// dims them (a swamp's murky water lets less through).
function drawSunShafts(ctx, width, height, step, seed, strength = 1) {
  const random = rng(seed), bottom = height * 0.82;
  for (let i = 0; i < 6; i++) {
    const start = (i / 6 + random() * 0.1) * width * 1.15 - width * 0.2, wide = (2 + Math.round(random() * 3)) * step * 2;
    for (let y = 0; y < bottom; y += step) {
      ctx.fillStyle = `rgba(190, 235, 255, ${(0.2 * strength * (1 - y / bottom)).toFixed(3)})`;
      ctx.fillRect(Math.round((start + y * 0.34) / step) * step, y, wide, step);
    }
  }
}

// The surface seen from below: rippling water across the top edge (tinted as the biome's water, a swamp's murky green),
// and lily pads floating on it (at fractions of the width), dark against the light from above: seen from below at a
// shallow angle, each is the whole pad squashed flat along the underside of the surface.
function drawSurface(ctx, width, size, tint = "#a8e4ff", pads = []) {
  ctx.globalAlpha = 0.5;
  for (let c = 0; c < Math.ceil(width / size); c++) drawBlock(ctx, blockTex("water", tint), c * size, 0, size);
  const pad = textureCanvas("lily_pad", "#244f1f"), thick = Math.max(2, Math.round(size / 4));
  ctx.globalAlpha = 0.95;
  ctx.imageSmoothingEnabled = false;
  for (const at of pad ? pads : []) ctx.drawImage(pad, Math.round((at * width) / size) * size, size - thick, size, thick);
  ctx.globalAlpha = 1;
}

// Columns of little bubbles on their way up, to either side of the mob in the middle.
function drawBubbles(ctx, width, height, size, seed) {
  const random = rng(seed), px = size / 8;
  for (const at of [0.06, 0.17, 0.27, 0.74, 0.85, 0.95]) {
    let x = (at + (random() - 0.5) * 0.05) * width, y = height * (0.4 + random() * 0.35);
    for (let n = 2 + Math.floor(random() * 4); n > 0; n--) {
      const r = (1 + Math.floor(random() * 2)) * px, sx = Math.round(x / px) * px, sy = Math.round(y / px) * px;
      ctx.fillStyle = "rgba(225, 248, 255, .75)";
      ctx.fillRect(sx, sy - r, r * 2, px);
      ctx.fillRect(sx, sy + r, r * 2, px);
      ctx.fillRect(sx - px, sy, px, r);
      ctx.fillRect(sx + r * 2, sy, px, r);
      y -= (3 + random() * 5) * px * 2;
      x += (random() - 0.5) * px * 6;
    }
  }
}

// A rock wall filling the canvas, with drifts of other rock and ore here and there in small clusters.
function drawWall(ctx, { rock, ores }, width, height, size, seed) {
  const random = rng(seed), cols = Math.ceil(width / size), rows = Math.ceil(height / size), ore = {};
  for (let i = Math.round((cols * rows) / 34); i > 0; i--) {
    const c = Math.floor(random() * cols), r = Math.floor(random() * rows), name = ores[Math.floor(random() * ores.length)];
    ore[`${c},${r}`] = name;
    if (random() < 0.6) ore[`${c + (random() < 0.5 ? 1 : 0)},${r + 1}`] = name;
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const drift = (Math.sin(c * 0.37 + r * 0.21) + Math.sin(r * 0.53 - c * 0.13) + 2) / 4;
    const name = ore[`${c},${r}`] || rock[Math.min(rock.length - 1, Math.floor(drift * rock.length))];
    drawBlock(ctx, typeof name === "string" ? blockTex(name) : name, c * size, r * size, size);
  }
}

// The ceiling: rock hanging from the top edge to an uneven depth, with stalactites under it. low: how many blocks above
// the floor it comes down to (a mineshaft's tunnel, its roof resting on the supports' beams), not just its top rows;
// shade: how much darker it is.
function drawCeiling(ctx, { rock, drip, low, shade = 0 }, width, size, seed, horizon) {
  const random = rng(seed), roof = low ? Math.max(0, Math.floor(horizon / size - low)) : 0;
  for (let c = 0; c < Math.ceil(width / size); c++) {
    const depth = roof + 1 + Math.round(2 * ((Math.sin(c * 0.43 + seed) + Math.sin(c * 0.97) + 2) / 4)) - (low ? 1 : 0);
    for (let k = 0; k < depth; k++) drawBlock(ctx, blockTex(rock[Math.floor(random() * rock.length)]), c * size, k * size, size);
    // shade: how much darker the rock is (a mineshaft's roof, out of the torchlight).
    if (shade) {
      ctx.fillStyle = `rgba(0, 0, 0, ${shade})`;
      ctx.fillRect(c * size, 0, size, depth * size);
    }
    if (random() < 0.24) {
      const hang = random() < 0.4 ? drip : drip.slice(-2);
      hang.forEach((name, k) => drawBlock(ctx, blockTex(name), c * size, (depth + k) * size, size));
    }
  }
}

// The backdrop canvas for a stage: far hills at FAR and the nearer props at NEAR CSS pixels per block,
// standing on the top edge of the stage's ground strip (GROUND_STRIP pixels tall). It redraws when the
// stage changes size.
const FAR = 8, NEAR = 16, GROUND_STRIP = 48, HAZE = { far: 0.38, near: 0.18 };
function backdropView(canvas) {
  let biome = null;
  const draw = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || !biome) return;
    const dpr = Math.max(1, Math.min(3, Math.round(window.devicePixelRatio || 1)));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    const t = BIOME_TINTS[biome], scene = BACKDROPS[biome](t), snowy = biome === "snowy" || Boolean(scene.snowy), mist = scene.mist || HAZE;
    // The hills' shape: a village biome's by its place in BIOMES, a scene's own seed otherwise.
    const seed = scene.seed || BIOMES.findIndex(b => b.k === biome) + 1;
    const haze = getComputedStyle(canvas).getPropertyValue("--haze").trim() || "#bcd5ff";
    const horizon = (h - GROUND_STRIP + 2) * dpr;
    // Each layer is drawn on its own canvas, then washed with the haze where it has pixels.
    const layer = (paint, mist) => {
      const cv = Object.assign(document.createElement("canvas"), { width: canvas.width, height: canvas.height });
      const lc = cv.getContext("2d");
      lc.imageSmoothingEnabled = false;
      paint(lc);
      lc.globalCompositeOperation = "source-atop";
      lc.globalAlpha = mist;
      lc.fillStyle = haze;
      lc.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(cv, 0, 0);
    };
    if (scene.sky) drawSky(ctx, scene.sky, canvas.width, canvas.height, 2 * NEAR * dpr, 13);
    layer(lc => (scene.wall ? drawWall(lc, scene.wall, canvas.width, canvas.height, NEAR * dpr, 7)
      : drawHills(lc, scene.hills, canvas.width, horizon, FAR * dpr, snowy, seed)), mist.far);
    if (scene.crystals) drawCrystals(ctx, crystalsOf(hillSpots(scene.hills, canvas.width, horizon, FAR * dpr, seed), FAR * dpr), FAR * dpr);
    if (scene.water && scene.water.sun) drawSunShafts(ctx, canvas.width, canvas.height, (NEAR * dpr) / 2, 11, scene.water.shafts);
    layer(lc => {
      if (scene.ceiling) drawCeiling(lc, scene.ceiling, canvas.width, NEAR * dpr, 5, horizon);
      for (const [p, at] of scene.near) drawProp(lc, p, canvas.width / 2 + at * NEAR * dpr, horizon, NEAR * dpr, snowy);
    }, mist.near);
    if (scene.crystals) drawCrystals(ctx, crystalsOf(scene.near.map(([p, at]) => [p, canvas.width / 2 + at * NEAR * dpr, horizon]), NEAR * dpr), NEAR * dpr);
    if (scene.water) {
      if (scene.water.sun) drawSurface(ctx, canvas.width, NEAR * dpr, scene.water.surface, scene.water.pads);
      if (scene.water.wash) {
        ctx.fillStyle = scene.water.wash;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      drawBubbles(ctx, canvas.width, canvas.height, NEAR * dpr, 3);
    }
    // Warm light round each lantern, up that many blocks if it isn't on the ground.
    for (const light of scene.lights || []) {
      const [at, up = 0.6] = [].concat(light);
      const x = canvas.width / 2 + (at + 0.5) * NEAR * dpr, y = horizon - up * NEAR * dpr, r = 6 * NEAR * dpr;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      const color = scene.lightColor || "255, 176, 84";
      glow.addColorStop(0, `rgba(${color}, .34)`);
      glow.addColorStop(1, `rgba(${color}, 0)`);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = glow;
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      ctx.globalCompositeOperation = "source-over";
    }
  };
  new ResizeObserver(draw).observe(canvas);
  return {
    show(biomeKey) {
      biome = biomeKey;
      draw();
    },
  };
}
