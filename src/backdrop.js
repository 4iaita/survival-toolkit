/* ---------- Biome backdrops ----------
 * Behind the villager scene, a flat view of the biome's countryside built from the pack's block textures:
 * far hills dotted with small trees, then a village building, trees and plants nearer by. Each layer fades
 * toward the horizon's haze, the far one more, so they read as distance. Foliage, grass and water take the
 * biome's tint the way the game colors them, and in snowy biomes everything wears a layer of snow.
 * The village, for the Mobs tab's iron golem and villager, is the middle of a plains village: its well, bell and lamp
 * post between houses, more roofs on the hills.
 * So is the mineshaft: a cave full of cobwebs, a mineshaft's corridor cut across its far wall, its supports, torches,
 * rails and a chest minecart.
 * The cave and the nether, for the Mobs tab, aren't village biomes: a dark rock wall full of ore instead
 * of hills, a ceiling with stalactites or weeping vines, and lanterns or lava for light. Nor is the End: an end city
 * under the pack's End sky, its base floor close by, chorus trees beyond, far off a tower with a bridge out to an end
 * ship; and the dragon's own island, a ring of crystal-topped obsidian pillars. And the ocean is seen from
 * underwater: sand hills and a far monument, kelp and coral nearby, sunlight slanting down from the surface, bubbles.
 * So is a lush cave's pool, the axolotl's: under the water of one of its clay-lined pools, its clay bottom rising to mossy
 * banks, big dripleaves growing up through the water and small ones on the bottom, the glow berries above the surface
 * lighting it warm.
 * So is the deep cave the glow squid swims in: dark rock streaked with glow lichen, lit only by that and sea pickles.
 * And the tadpole's swamp water: murky green under lily pads floating on the surface, dim sunlight slanting down onto a
 * mud and clay bottom with seagrass.
 * The striped wolf's wooded badlands, for the Mobs tab, have no villages either: banded terracotta mesas with oaks on
 * top. Nor do the mooshroom's mushroom fields: huge mushrooms on mycelium. Nor do the goat's jagged peaks: stone
 * mountains under snow, bare on their steep faces.
 * And the inside of a woodland mansion, the vex's (evokers summon it, and they live in the mansions): a hall of dark oak
 * walls between dark oak log pillars under a beamed ceiling, a birch band along them, windows onto the dark forest
 * outside, bookshelves, a chest and a door, lit by torches on the pillars.
 * And a trial chamber, the breeze's: tuff brick walls, tuff pillars with lit copper bulbs, copper grates, trial spawners and
 * vaults. And a stronghold's portal room, the silverfish's: stone brick walls, cracked and mossy, iron doors and barred
 * windows, bookshelves, the end portal's frames on their steps and the silverfish spawner. And the deep dark, the
 * warden's: an ancient city's deepslate brick pillars and its portal's reinforced deepslate frame, overgrown with sculk,
 * sculk sensors and shriekers, lit by soul lanterns and candles.
 * The plains have a night too, for the phantom and the undead horses and zombie villagers that come out at night: the
 * same hills and house darkened and blue under stars and the moon, its windows lit. So do the swamp (the bogged's and
 * the witch's), the desert (the husk's, the parched's and the camel husk's), the snowy village (the stray's) and the
 * ocean (the drowned's and the zombie nautilus's, seen from underwater: dim moonlight from a dark surface).
 * The biomes some name tags' looks come from have backdrops too: the cherry grove's pink trees on a mountain meadow, the
 * pale garden's moss-hung pale oaks, the dappled forest's orange, red and gold trees, and the sulfur caves' layers of
 * yellow sulfur and red cinnabar in a green fog, sulfur spikes and an acid-green pool.
 */
// Spruce leaves keep one color everywhere; other tints come from BIOME_TINTS.
const SPRUCE_TINT = "#619961";

// A block in a prop: texture layers, each [texture, tint, columns] (columns [from, to) draws only that
// strip of the texture, for thin stalks); or a flat fill for doorways and windows.
// cap: false keeps snow off it (plants).
const blockTex = (name, tint, more = {}) => ({ layers: [[name, tint]], ...more });
const blockFill = color => ({ fill: color });
const plantTex = (name, tint) => blockTex(name, tint, { cap: false });
// A lantern standing on the block below, seen from the side, from its block texture as the game's model cuts it up: the
// body, the cap on it and the handle over that.
const lanternTex = name => ({ parts: [[name, [0, 2, 6, 9], [5, 9]], [name, [1, 0, 5, 2], [6, 7]], [name, [11, 1, 14, 3], [6.5, 5]]], cap: false });
// A lit candle standing on the block below, from its block texture as the game's model cuts it up: its body, the cap on
// it and the wick, with a small flame drawn over the wick (the game's is a particle, not in the texture).
const CANDLE = { parts: [["candle_lit", [0, 8, 2, 14], [7, 10]], ["candle_lit", [0, 6, 2, 8], [7, 8]], ["candle_lit", [0, 5, 1, 6], [8, 7]]],
  // The flame, a pixel wide and three tall over the wick: orange at its tip, pale yellow at its heart.
  rects: [[8, 4, 9, 5, "#ff9d2e"], [8, 5, 9, 7, "#ffe9a0"]], cap: false };
// Sea pickles, two in a cluster, from their block texture as the game's model cuts it up: each one's side, a frond on top.
const SEA_PICKLE = { parts: [["sea_pickle", [0, 10, 4, 16], [3, 10]], ["sea_pickle", [1, 0, 3, 5], [4, 5]],
  ["sea_pickle", [4, 9, 8, 16], [9, 9]], ["sea_pickle", [13, 0, 15, 5], [10, 4]]], cap: false };
// A bell hanging from the beam above on a short iron bar, from its block texture: the body and the wider rim under it.
const BELL = { parts: [["bell_body", [1, 0, 7, 7], [5, 3]], ["bell_body", [0, 7, 8, 9], [4, 10]]], rects: [[7, 0, 9, 3, "#3c3c3c"]], cap: false };
// Leaves; inside a crown their gaps show more leaves (backing, a darker shade of the tint), not the sky.
const leavesTex = (name, tint) => blockTex(name, tint, { backing: `rgb(${hex(tint).map(v => Math.round(v * 0.42)).join(",")})` });
// A doorway into a structure: the block it's cut into, darkened, the dim inside seen through it, with depth: its sides
// in shadow, deepest on the left, and under its top edge.
const DOORWAY_SIDES = [[0, 0, 3, 16, "rgba(0, 0, 0, .5)"], [3, 0, 5, 16, "rgba(0, 0, 0, .25)"], [13, 0, 16, 16, "rgba(0, 0, 0, .3)"],
  [11, 0, 13, 16, "rgba(0, 0, 0, .12)"]];
const DOORWAY_TOP = [[0, 0, 16, 3, "rgba(0, 0, 0, .55)"], [0, 3, 16, 5, "rgba(0, 0, 0, .25)"]];
const doorway = name => blockTex(name, "#5a5a5a", { shade: DOORWAY_SIDES, lintel: DOORWAY_TOP });
// An opening two or more blocks wide: its left block shaded only on its left side, its right block only on its right
// (side: "left" or "right"), so no shadow runs down its middle.
const doorwaySide = (name, side) => blockTex(name, "#5a5a5a", { shade: DOORWAY_SIDES.filter(([x0]) => (side === "left" ? x0 < 8 : x0 >= 8)), lintel: DOORWAY_TOP });
// The dim inside of a building, seen through its windows' glass and its doors' panes, not the world behind it. A
// house's is its back wall: its own planks, a shade darker, as a lit room seen through glass.
const INSIDE = "#2e241b", HOUSE_INSIDE = "#e3d3c0";
// The room's depth, seen through a window: the back wall darker under the ceiling and along the near side, the light
// falling on it from the far side.
const ROOM_SHADE = [[0, 0, 16, 3, "rgba(40, 24, 10, .62)"], [0, 3, 16, 5, "rgba(40, 24, 10, .32)"], [0, 5, 3, 16, "rgba(40, 24, 10, .5)"],
  [3, 5, 5, 16, "rgba(40, 24, 10, .24)"], [0, 13, 16, 16, "rgba(40, 24, 10, .25)"]];
const room = (wall, front) => ({ layers: [[wall, HOUSE_INSIDE], [front]], shade: ROOM_SHADE });

// A prop: rows of blocks, top row first, each letter a block from its legend and "." empty.
const prop = (rows, legend) => ({ rows, legend });

const oakTree = t => prop([
  ".LLL.",
  "LLLLL",
  "LLLLL",
  "..T..",
  "..T..",
], { L: leavesTex("leaves_oak", t.foliage), T: blockTex("log_oak") });
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
// More acacia shapes, as the game grows them, so the savanna isn't all one tree: a forked one, its trunk splitting into
// two branches, each under a flat crown of its own at a different height; and a tall one, its trunk leaning one way
// then straight up.
const ACACIA = t => ({ L: leavesTex("leaves_acacia", t.foliage), T: blockTex("acacia_log") });
const forkedAcacia = t => prop([
  ".LLL......",
  "LLLLL.LLL.",
  "..T..LLLLL",
  "..T....T..",
  "...T..T...",
  "....TT....",
  "....T.....",
], ACACIA(t));
const tallAcacia = t => prop([
  "..LLL..",
  "LLLLLLL",
  "....T..",
  "...T...",
  "..T....",
  "..T....",
  "..T....",
], ACACIA(t));
// A prop seen from the other side: its rows mirrored (an acacia whose trunk bends the other way).
const mirrored = ({ rows, legend }) => prop(rows.map(row => [...row].reverse().join("")), legend);
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
// Bamboo: a thin stalk (the middle strip of its texture) under a tuft of leaves.
const bamboo = height => prop(["B", "B", ...Array(height - 2).fill("S")], {
  S: { layers: [["bamboo_stem", null, [6, 9]]], cap: false },
  B: { layers: [["bamboo_stem", null, [6, 9]], ["bamboo_leaf"]], cap: false },
});
// Tall grass, two blocks high.
const tallGrass = t => prop(["T", "B"], { T: plantTex("tall_grass_top", t.grass), B: plantTex("tall_grass_bottom", t.grass) });
const largeFern = t => prop(["F", "f"], { F: plantTex("large_fern_top", t.grass), f: plantTex("large_fern_bottom", t.grass) });
// A swamp oak as the game grows them: a wide, flat crown on a short trunk, vines hanging long from its edges; and a small
// one for the far hills.
const swampOak = t => prop([
  ".LLLLLLL.",
  "LLLLLLLLL",
  "LLLLTLLLL",
  "V.V.T.V.V",
  "V...T...V",
  "....T...V",
  "....T....",
], { L: leavesTex("leaves_oak", t.foliage), T: blockTex("log_oak"), V: plantTex("vine", t.foliage) });
const smallSwampOak = t => prop([".LLL.", "LLLLL", "V.T.V", "..T.."], { L: leavesTex("leaves_oak", t.foliage), T: blockTex("log_oak"), V: plantTex("vine", t.foliage) });

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
// A window lit at night (LIT_WINDOW) lights its door's panes too.
const house = ({ roof, wall, frame, base, door, window = room(wall, "glass") }) => prop([
  "..RRR..",
  ".RRRRR.",
  "RRRRRRR",
  "FGWDWGF",
  "FWWdWWF",
  "BBBBBBB",
], {
  R: blockTex(roof), W: blockTex(wall), F: blockTex(frame), B: blockTex(base), G: window,
  ...Object.fromEntries([["D", "upper"], ["d", "lower"]].map(([k, half]) => [k, window.under
    ? blockTex(`door_${door}_${half}`, null, { under: window.under }) : { ...room(wall, `door_${door}_${half}`), shade: half === "upper" ? ROOM_SHADE.slice(0, 4) : ROOM_SHADE.slice(2) }])),
});
const desertHouse = prop([
  "XSSSSSX",
  "OOOOOOO",
  "SHSSSHS",
  "SSSHSSS",
  "SSSHSSS",
], { S: blockTex("smooth_sandstone"), X: blockTex("chiseled_sandstone"), O: blockTex("orange_terracotta"), H: doorway("smooth_sandstone") });
// A woodland mansion's hall, seen from inside, as the game builds them: walls of birch planks between pillars of dark oak
// logs, under a dark oak ceiling and beam, a dark oak rail along them and a cobblestone base; tall glass windows onto the
// dark forest outside; torches on the pillars; and along the wall bookshelves, a dark oak door, a chest and potted
// flowers.
// The window: the dark forest's leaves outside, through the glass.
const MANSION_WINDOW = { layers: [["leaves_oak", "#3d6b2c"], ["glass"]], under: "#1d2b18" };
// A flower in a pot, from their textures as the game cuts them up: the pot's side, the flower standing in it.
const potted = flower => ({ parts: [[flower, [0, 0, 16, 16], [0, -4]], ["flower_pot", [5, 10, 11, 16], [5, 10]]], cap: false });
const MANSION = {
  P: blockTex("planks_dark_oak"), L: blockTex("log_dark_oak"), B: blockTex("planks_birch"), W: MANSION_WINDOW, C: blockTex("cobblestone"),
  // A torch on a pillar.
  t: { layers: [["log_dark_oak"], ["torch"]] },
  K: blockTex("bookshelf"), H: { layers: [["chest_front"]] }, F: blockTex("planks_dark_oak"),
  D: blockTex("door_dark_oak_upper", null, { under: INSIDE }), d: blockTex("door_dark_oak_lower", null, { under: INSIDE }),
  a: potted("flower_allium"), r: potted("flower_tulip_red"),
};
const mansion = rows => prop(rows, MANSION);
// The hall's wall, nine blocks to a bay, floor to ceiling.
const MANSION_WALL = [
  "PPPPPPPPP",
  "LPPPPPPPP",
  "LBBBBBBBB",
  "LBBBWWBBB",
  "tBBBWWBBB",
  "LBBBWWBBB",
  "LBBBWWBBB",
  "LBBBWWBBB",
  "LBBBBBBBB",
  "LPPPPPPPP",
  "LBBBBBBBB",
  "LBBBBBBBB",
  "LBBBBBBBB",
  "LBBBBBBBB",
  "LBBBBBBBB",
  "CCCCCCCCC",
];
const igloo = prop([
  "..SSS..",
  ".SSSSS.",
  "SSSSSSS",
  "SSSHSSS",
], { S: blockTex("snow"), H: doorway("snow") });
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
  H: doorway("mossy_cobblestone"), L: leavesTex("leaves_jungle", t.foliage), V: plantTex("vine", t.foliage),
});
// The witch's hut: spruce walls under a dark oak roof, up on oak log stilts, its doorway opening onto a small balcony
// (a spruce slab, B) railed with an oak fence post (F).
const witchHut = prop([
  ".RRRRRRR",
  "..PPPPP.",
  "F.PHPPP.",
  "BBPPPPP.",
  "..T...T.",
  "..T...T.",
], { R: blockTex("planks_dark_oak"), P: blockTex("planks_spruce"), H: doorway("planks_spruce"), T: blockTex("log_oak"),
  B: blockTex("planks_spruce", null, { rows: [0, 8] }), F: { layers: [["oak_planks", null, [6, 10]]], cap: false } });
// The swamp's ground, a block high at the same distance as its water: grass (G) with pools of gray-green water (~) cut
// into it, and what grows on it (rows over it): lily pads on the water (l), blue orchids (o), sugar cane (c), a firefly
// bush (f), short grass (g), brown and red mushrooms (b, r).
const swampGround = (t, rows) => prop(rows, { "~": blockTex("water", t.water), G: grassyTop(t), l: blockTex("lily_pad", null, { squash: [12, 16], cap: false }),
  o: plantTex("flower_blue_orchid"), c: plantTex("reeds", t.grass), f: plantTex("firefly_bush"), g: plantTex("short_grass", t.grass),
  b: plantTex("mushroom_brown"), r: plantTex("mushroom_red") });
// A prop lifted a block, to stand on the swamp's ground.
const lifted = ({ rows, legend }) => prop([...rows, ".".repeat(rows[0].length)], legend);
const wheatFarm = prop([
  "wwwww",
  "fffff",
], { w: plantTex("wheat_crop"), f: blockTex("dirt") });

// Each biome's scene: hills (top and fill blocks, height in blocks, trees at fractions of the width) and
// nearer props at offsets in blocks from the middle.
const grassyTop = t => ({ layers: [["dirt"], ["grass_side_overlay", t.grass]] });
// tone: shades it (a color), where it should be as dark as the wall behind it.
const oreMound = (ore, rows, tone) => {
  const more = tone ? { shade: [[0, 0, 16, 16, tone]] } : {};
  return prop(rows, { R: blockTex("stone", null, more), T: blockTex("tuff", null, more), O: blockTex(ore, null, more) });
};
// The cave's wall is 62% haze (the mineshaft's 50%) and what stands near 30%: this much more of it makes the two the same.
const CAVE_TONE = "rgba(13, 13, 19, .457)", MINE_TONE = "rgba(13, 13, 19, .286)";
// A tunnel leading off from a cave: a stepped opening in the rock, its stone darker the further in, black at its heart,
// a seam of coal in its side in the same shade.
const caveTunnel = prop([
  "..aaa..",
  ".aabaa.",
  "aabcbaa",
  "abcccoa",
  "abcccba",
], { a: blockTex("stone", "#6b6b6b"), b: blockTex("stone", "#363636"), o: blockTex("coal_ore", "#363636"), c: blockFill("#0b0b0d") });
const stalagmite = prop(["t", "f", "D"], { t: plantTex("dripstone_up_tip"), f: plantTex("dripstone_up_frustum"), D: blockTex("dripstone_block") });
// The nether wastes: netherrack (N) with blobs of magma (M), blackstone (B), nether quartz (Q) and nether gold ore (O) in it,
// fire burning on it (F), soul sand (S) and gravel (g) at the lava's shore, lava (L).
const netherMound = rows => prop(rows, { N: blockTex("netherrack"), M: blockTex("magma"), B: blockTex("blackstone"), Q: blockTex("quartz_ore"),
  O: blockTex("nether_gold_ore"), F: plantTex("fire"), S: blockTex("soul_sand"), g: blockTex("gravel"), L: blockTex("lava") });
// A nether fortress's bridge far off over the lava sea, the blaze's home: a walkway of nether bricks railed with nether brick
// fences, on arches between pillars that go down into the lava.
const fortressBridge = prop([
  "f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.",
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "bbb....bbbb....bbbb....bbbb....bbb",
  "cc......cc......cc......cc......cc",
  "dd......dd......dd......dd......dd",
  "ee......ee......ee......ee......ee",
  "ff......ff......ff......ff......ff",
  "gg......gg......gg......gg......gg",
  "hh......hh......hh......hh......hh",
  "ii......ii......ii......ii......ii",
  "jj......jj......jj......jj......jj",
], { f: { layers: [["nether_brick", null, [5, 11]]] }, ...Object.fromEntries([..."abcdefghij"].map(k => [k, blockTex("nether_brick")])) });
// flows: it runs down (see drawLava).
const lavafall = prop(Array(20).fill("L"), { L: blockTex("lava", null, { flows: true }) });
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
  f: plantTex(`coral_fan_${a}`), g: plantTex(`coral_fan_${b}`),
});
// Rock with glow lichen growing over it.
const lichen = rock => ({ layers: [[rock], ["glow_lichen"]] });
const lichenMound = rows => prop(rows, { R: blockTex("stone"), D: blockTex("deepslate"), L: lichen("stone"), K: lichen("deepslate") });
// A big dripleaf, how many blocks tall, seen from the side as the game's model draws it: its stem, and on top its leaf,
// a broad plate seen a little from below (its top texture squeezed into three rows), the curve of its underside under
// that (the leaf's side texture), on the stem's last bit.
const dripleaf = height => prop(["L", ...Array(height - 1).fill("S")], {
  L: { parts: [["big_dripleaf_top", [0, 0, 16, 16], [0, 1, 16, 3]], ["big_dripleaf_side2", [0, 1, 16, 4], [0, 4]], ["big_dripleaf_stem", [0, 7, 16, 16], [0, 7]]], cap: false },
  S: plantTex("big_dripleaf_stem") });
// A small dripleaf, two blocks tall: its stem, and its three leaves at the top, each a flat plate seen edge on (its leaf,
// the top texture's corner, squeezed into two rows), one at the tip and one out to each side.
const smallDripleaf = prop(["T", "B"], {
  T: { layers: [["small_dripleaf_stem_top"]], parts: [["small_dripleaf_top", [0, 0, 8, 8], [1, 3, 7, 2]], ["small_dripleaf_top", [0, 0, 8, 8], [8, 6, 7, 2]], ["small_dripleaf_top", [0, 0, 8, 8], [4, 0, 8, 2]]], cap: false },
  B: plantTex("small_dripleaf_stem_bottom") });
// A lush pool's bank: clay (C) with moss (M) over it.
const poolBank = rows => prop(rows, { M: blockTex("moss_block"), C: blockTex("clay") });
// An obsidian pillar, how many blocks tall and wide, capped with bedrock and holding an end crystal (crystal, how high
// it sits); caged, with iron bars round the crystal.
const obsidianPillar = (height, width = 1, caged = false) => {
  const side = ".".repeat((width - 1) / 2), cap = `${side}B${side}`;
  const top = caged ? ["I".repeat(width), `I${".".repeat(width - 2)}I`, `I${cap.slice(1, -1)}I`] : [cap];
  return { ...prop([...top, ...Array(height).fill("O".repeat(width))],
    { B: blockTex("bedrock"), O: blockTex("obsidian"), I: plantTex("iron_bars") }), crystal: height + 1 };
};
// An end city, side on, as the game builds its pieces: purpur blocks (P), shaded where a tower's face is set back (Q),
// purpur pillars (I) at the corners, walls of end stone bricks (E) with gaps in them (D one block wide, X and Y the left and right of a wider one), their sides and tops
// in shadow, roofs and
// ledges jutting out in purpur stairs (h, their lower half), end rods (R) standing on the roofs, magenta glass (G) in
// the ship's windows, and the city's banners (B, b), magenta with a black chevron; on the ship's bow the ender dragon's
// head (K, J, k, j).
const END_CITY = {
  P: blockTex("purpur_block"), Q: blockTex("purpur_block", "#a998b4"), I: blockTex("purpur_pillar"), E: blockTex("end_bricks"),
  h: blockTex("purpur_block", null, { rows: [8, 16] }), D: doorway("end_bricks"), X: doorwaySide("end_bricks", "left"), Y: doorwaySide("end_bricks", "right"), G: { layers: [["magenta_glass"]], under: "#2a1534" },
  R: { parts: [["end_rod", [0, 0, 2, 15], [7, 1]], ["end_rod", [2, 2, 6, 3], [6, 15]]], cap: false },
  B: { rects: [[4, 0, 12, 16, "#b23aa9"], [4, 10, 6, 12, "#1d1a20"], [10, 10, 12, 12, "#1d1a20"], [6, 12, 10, 14, "#1d1a20"]], cap: false },
  b: { rects: [[4, 0, 12, 12, "#b23aa9"], [4, 2, 6, 4, "#1d1a20"], [10, 2, 12, 4, "#1d1a20"], [6, 4, 10, 6, "#1d1a20"]], cap: false },
  // The head two blocks by two, side on, cut from the dragon's own skin: the top of its head with the ridges on it and
  // its glowing purple eye (K), under it the rest of its head (J); its snout in front, the nostril near the tip (k), and
  // the lower jaw (j).
  K: { parts: [["dragon_head_side", [0, 0, 16, 13], [0, 3]]], rects: [[3, 0, 5, 3, "#2b2530"], [9, 0, 11, 3, "#2b2530"], [8, 8, 13, 11, "#d65cf5"], [13, 8, 15, 11, "#f0b8ff"]], cap: false },
  J: { layers: [["dragon_head_side"]], cap: false },
  k: { parts: [["dragon_snout_side", [0, 0, 16, 8], [0, 8]]], rects: [[12, 9, 14, 11, "#0b090d"]], cap: false },
  j: { parts: [["dragon_snout_side", [0, 8, 16, 14], [0, 0]]], cap: false },
};
// A tower's shaft, plain purpur, rows tall: its corners stand out and its middle is set back, a block jutting from it now
// and then.
const shaftRows = (rows, bumps = []) => Array.from({ length: rows }, (_, r) => (bumps.includes(r) ? "PPQPQPP" : "PPQQQPP"));
// The city's base floor close by, its tower rising out of it: a purpur floor jutting out under walls of end stone bricks
// between purpur pillars, with gaps in them high up and the doorway between; the base roof over them, its rim at the
// ends, end rods on it; out of the middle the tower's shaft, up out of sight.
const endCityBase = prop([
  ...shaftRows(8, [3]).map(row => `...${row}...`),
  "R..PPQQQPP..R",
  "PP.PPQQQPP.PP",
  "hPPPPPPPPPPPh",
  ".IEXYEEEXYEI.",
  ".IEXYEEEXYEI.",
  ".IEXYEEEXYEI.",
  ".IEEEEDEEEEI.",
  ".IEEEEDEEEEI.",
  "hPPPPPPPPPPPh",
], END_CITY);
// Far off, a whole city on its island: its base floor, a tower's shaft rising from it to the tower's top room, walls of
// purpur with bands of end stone bricks, banners hanging from under it and its great roof jutting out; from the shaft a
// bridge, its deck between low walls on a support, out to the end ship hanging in the void, its stern to the city: the
// stern castle with its windows, its hull, the mast and crow's nest, and the dragon head on its bow.
const END_SHIP = [
    "........IIIII.........",
    "........I.I.I.........",
    "........IIIII.........",
    "..........I...........",
    "..........I...........",
    "..........I...........",
    "..........I.........Kk",
    "PPPPP.....I........PJj",
    "PGPGP.....I.......PP..",
    "PPPPPPPPPPPPPPPPPPP...",
    ".PPGPPPPPPPPPPPPPP....",
    "..PPPPPPPPPPPPPPP.....",
    "....PPPPPPPPPPPP......",
];
const farEndCity = (() => {
  const w = 41, tower = [
    "hPPPPPPPPPPPPPh",
    ".hPPPPPPPPPPPh.",
    "..IPPPPPPPPPI..",
    "..IPEEEPEEEPI..",
    "..IPEEEPEEEPI..",
    "..IPPPPPPPPPI..",
    ".hPPPPPPPPPPPh.",
    ".B.B.PPQPP.B.B.",
    ".b.b.PPQPP.b.b.",
    ...Array.from({ length: 10 }, (_, r) => (r === 4 ? ".....PQPQP....." : ".....PQQQP.....")),
    "..PPPPPPPPPPP..",
    "..hPPPPPPPPPh..",
    "..IEXYEEEXYEI..",
    "..IEXYEEEXYEI..",
    "..IEEEEDEEEEI..",
    "..IEEEEDEEEEI..",
    "..hPPPPPPPPPh..",
  ];
  const rows = tower.map(row => row + ".".repeat(w - row.length));
  const put = (piece, left, bottom) => piece.forEach((line, r) => {
    const y = rows.length - bottom - piece.length + r;
    rows[y] = [...rows[y]].map((ch, c) => (c >= left && c < left + line.length && line[c - left] !== "." ? line[c - left] : ch)).join("");
  });
  put(["PPPPP", "PPPPP", "..I..", "..I..", "..I.."], 10, 10);
  put(END_SHIP, 15, 11);
  return prop(rows, END_CITY);
})();
// Grown chorus trees, each its own shape: a stem branching out and up, flowers on the tips. Their stems stand in the
// bottom row.
const CHORUS = { C: plantTex("chorus_plant"), F: plantTex("chorus_flower") };
const chorusTrees = [
  ["..F...", "F.C.F.", "C.C.C.", "CCCCC.", "..C..F", "..CCCC", "F.C...", "CCC...", "..C...", "..C..."],
  [".F..F", ".C..C", "FCCCC", "C.C..", "CCC.F", "..CCC", "..C..", "..C.."],
  ["...F...", "F..C..F", "C..C..C", "CCCCCCC", "...C...", "F..C...", "CCCC...", "...C...", "...C...", "...C...", "...C..."],
  ["F.F", "CCC", ".C.", ".CF", ".C.", "FC.", "CC.", ".C."],
].map(rows => prop(rows, CHORUS));
// An oak fence post: a narrow strip of oak planks up the middle of the block.
const FENCE = { layers: [["oak_planks", null, [6, 10]]] };
// The heart of a plains village: its well (cobblestone round the water, oak posts holding up a cobblestone roof), the
// meeting point's bell hanging from an oak frame, a lamp post (a lantern on an oak fence post), a composter and a barrel by
// a house, and a smaller house for the far hills.
const villageWell = prop(["CCCC", "F..F", "F..F", "CCCC"], { C: blockTex("cobblestone"), F: FENCE });
const bellFrame = prop(["PPP", "FbF", "F.F"], { P: blockTex("oak_planks"), F: FENCE, b: BELL });
const lampPost = prop(["L", "F", "F", "F"], { L: lanternTex("lantern_block"), F: FENCE });
const smallHouse = ({ roof, wall, frame, base }) => prop([".RRR.", "RRRRR", "FWGWF", "FWWWF", "BBBBB"], {
  R: blockTex(roof), W: blockTex(wall), F: blockTex(frame), B: blockTex(base), G: room(wall, "glass") });
const PLAINS_HOUSE = { roof: "planks_dark_oak", wall: "oak_planks", frame: "log_oak", base: "cobblestone", door: "oak" };
// Rails seen from the side: the iron rail on its sleepers.
const RAIL = { rects: [[0, 13, 4, 16, "#4f3a24"], [8, 13, 12, 16, "#4f3a24"], [0, 11, 16, 13, "#7d7d7d"], [0, 11, 16, 12, "#b0b0b0"]], cap: false };
// A chest minecart, one block long: the whole chest, lid and latch, riding on the cart's iron sides, wheels on the rail.
const chestMinecart = prop(["C", "M"], {
  C: { layers: [["chest_front"]], rows: [1, 16], cap: false },
  M: { rects: [[0, 0, 16, 9, "#5e5e5e"], [0, 0, 16, 2, "#8a8a8a"], [0, 7, 16, 9, "#3c3c3c"], [2, 9, 6, 13, "#262626"], [10, 9, 14, 13, "#262626"], ...RAIL.rects], cap: false },
});
// A mineshaft corridor cut through the far wall of a cave, seen from the side, three blocks high, rows top first; drawn
// as two props in the same place. Its back wall (mineBack): the cave's own stone (a, b, d), andesite (A, B, D) and
// gravel (g), darkened, in a shadow that fades smoothly from under the roof to the floor, and side corridors going back
// into the rock (archDepth). What's in it (mineCorridor): every four blocks a support seen end on, an oak plank
// beam (P) on oak fence posts (F); torches (t) beside some, cobwebs (W) strung under the roof by the beams, a rail line
// (R) along its floor, broken here and there, a chest minecart (C over M) standing on it; at each side corridor's
// mouth, its support face on and further back, so dimmer (beam Q, posts f, posts behind the rail g).
const MINE_ROCK = { a: "stone", b: "stone", d: "stone", A: "andesite", B: "andesite", D: "andesite", g: "gravel" };
// The shadow over one row of it (0 at the top), in two-texel strips: deepest under the roof, gone by the floor.
const mineShade = row => Array.from({ length: 8 }, (_, i) => {
  const y = row * 16 + i * 2 + 1, alpha = 0.6 * Math.pow(1 - y / 48, 1.4);
  return [0, i * 2, 16, i * 2 + 2, `rgba(6, 5, 4, ${alpha.toFixed(3)})`];
});
// A side corridor seen down its length through the mouth of a support (arches: the left column of each, three wide):
// inside the posts and under the beam, rings of shadow, each smaller and darker, closing in toward its far end, and
// a dim support further back framing the second ring. In texels, over the whole prop; returns each block's share.
const archDepth = (left, rows) => {
  const x0 = left * 16 + 10, x1 = (left + 2) * 16 + 6, y0 = 16, y1 = rows * 16, boxes = [];
  for (let i = 1; i <= 4; i++) boxes.push([x0 + 3 * i, y0 + 2 * i, x1 - 3 * i, y1 - 2 * i, "rgba(6, 5, 4, .3)"]);
  const [fx0, fy0, fx1, fy1] = [x0 + 6, y0 + 4, x1 - 6, y1 - 4], wood = "rgba(64, 46, 28, .85)";
  boxes.push([fx0, fy0, fx0 + 2, fy1, wood], [fx1 - 2, fy0, fx1, fy1, wood], [fx0, fy0, fx1, fy0 + 2, wood]);
  // Each block's share of the boxes, in its own texels.
  return (r, c) => boxes.flatMap(([bx0, by0, bx1, by1, color]) => {
    const cx0 = Math.max(bx0, c * 16), cx1 = Math.min(bx1, c * 16 + 16), cy0 = Math.max(by0, r * 16), cy1 = Math.min(by1, r * 16 + 16);
    return cx0 < cx1 && cy0 < cy1 ? [[cx0 - c * 16, cy0 - r * 16, cx1 - c * 16, cy1 - r * 16, color]] : [];
  });
};
// Each letter in each row gets its own block, its texture under that row's shadow (and, in a side corridor's mouth,
// that block's own one: archDepth).
const mineBack = (rows, arches = []) => {
  const depth = arches.map(left => archDepth(left, rows.length));
  let next = 0x100;
  const legend = {}, keys = {}, out = rows.map((row, r) => [...row].map((ch, c) => {
    const rects = depth.flatMap(share => share(r, c));
    const id = rects.length ? `${r},${c}` : `${ch}${r}`;
    if (!keys[id]) {
      keys[id] = String.fromCharCode(next++);
      legend[keys[id]] = blockTex(MINE_ROCK[ch], "#a0a0a0", { shade: [...mineShade(r), ...rects] });
    }
    return keys[id];
  }).join(""));
  return prop(out, legend);
};
const FAR_FENCE = { layers: [["oak_planks", "#7a7a7a", [6, 10]]] };
const MINE_BITS = { P: blockTex("oak_planks"), F: FENCE, t: plantTex("torch"), W: plantTex("cobweb"), R: RAIL, C: chestMinecart.legend.C, M: chestMinecart.legend.M,
  Q: blockTex("oak_planks", "#7a7a7a"), f: FAR_FENCE, g: { ...FAR_FENCE, rects: RAIL.rects } };
const mineCorridor = rows => prop(rows, MINE_BITS);
// The cherry grove: cherry trees, their pink crowns hanging down at the edges, over a meadow high in the mountains.
const CHERRY = { L: blockTex("cherry_leaves", null, { backing: "#a3607f" }), T: blockTex("cherry_log") };
const cherryTree = (trunk = 3) => prop(["..LLLLL..", ".LLLLLLL.", "LLLLLLLLL", "LLLLTLLLL", "L.L.T.L.L", ...Array(trunk).fill("....T....")], CHERRY);
const smallCherry = () => prop([".LLL.", "LLLLL", "L.T.L", "..T.."], CHERRY);
// More cherry shapes, so the grove isn't all one tree: a narrow, tall one; a forked one, its trunk splitting into two
// crowns of different heights, as the game's cherries branch; and far ones, tall and medium.
const tallCherry = (trunk = 4) => prop(["..LLL..", ".LLLLL.", "LLLLLLL", "LLLLLLL", "LLLTLLL", ".L.T.L.", ...Array(trunk).fill("...T...")], CHERRY);
const forkedCherry = (trunk = 2) => prop([
  ".LLLLL...LLLL.",
  "LLLLLLL.LLLLLL",
  "LLLLLLL.LLLLLL",
  "L.LTL.L.L.TL.L",
  "...T......T...",
  "....T....T....",
  ".....T..T.....",
  "......TT......",
  ...Array(trunk).fill("......T.......")], CHERRY);
const tallFarCherry = () => prop([".LLL.", "LLLLL", "LLLLL", "L.T.L", "..T..", "..T..", "..T..", "..T.."], CHERRY);
const midCherry = () => prop(["..LLL..", ".LLLLL.", "LLLLLLL", "L.LTL.L", "...T...", "...T..."], CHERRY);
// The pale garden: pale oaks (dark oaks' shape: a two-wide trunk under a broad crown) hung with pale moss, one with a
// creaking heart in its trunk; pale moss underfoot and eyeblossoms, shut by day and open at night.
const PALE = { L: blockTex("pale_oak_leaves", null, { backing: "#4a504b" }), T: blockTex("pale_oak_log"), H: blockTex("creaking_heart"),
  M: plantTex("pale_hanging_moss"), m: plantTex("pale_hanging_moss_tip") };
const paleOak = (trunk = 3, heart = false) => prop([".LLLLLL.", "LLLLLLLL", "LLLLLLLL", "LMLTTLML", "M.TT..m.", "m.TT....",
  ...Array.from({ length: trunk }, (_, i) => (heart && i === 0 ? "..TH...." : "..TT...."))], PALE);
const smallPaleOak = () => prop([".LLL.", "LLLLL", "LMTML", "m.T.m", "..T.."], PALE);
const paleMound = rows => prop(rows, { M: blockTex("pale_moss_block"), D: blockTex("dirt") });
// The dappled forest: oaks and birches turned orange, red and gold, as the pack's dappled looks are.
const DAPPLED = { orange: "#d2701d", red: "#b8381c", gold: "#d8ae2c" };
const autumnBirch = () => prop([".LLL.", "LLLLL", "LLLLL", ".LLL.", "..T..", "..T..", "..T.."], { L: leavesTex("leaves_birch", DAPPLED.gold), T: blockTex("log_birch") });
// The sulfur caves: sulfur (S) and cinnabar (C) with deepslate (D) between them.
const sulfurMound = rows => prop(rows, { S: blockTex("sulfur"), C: blockTex("cinnabar"), D: blockTex("deepslate") });
// A sulfur spike, how many blocks tall, as the game stacks one like dripstone: its base, middles, the frustum and the
// tip; standing on a block of sulfur (they only grow on sulfur) unless on: false (in a cluster, the block is drawn apart).
const sulfurSpike = (tall, on = true) => prop(["t", ...(tall > 1 ? ["f"] : []), ...Array(Math.max(0, tall - 3)).fill("m"), ...(tall > 2 ? ["b"] : []), ...(on ? ["S"] : [])], {
  t: plantTex("sulfur_spike_up_tip"), f: plantTex("sulfur_spike_up_frustum"), m: plantTex("sulfur_spike_up_middle"), b: plantTex("sulfur_spike_up_base"), S: blockTex("sulfur") });
// A patch of sulfur spikes as the game grows them, side by side on a sulfur mound, each its own height (heights, one
// per column; 0 for none). base: the mound's rows under them, top first.
const spikePatch = (heights, base) => {
  const top = Math.max(...heights);
  // The piece at level k (1 the lowest) of a spike h blocks tall: its tip, the frustum under it, its base, middles between.
  const piece = (h, k) => (k === h ? "t" : k === h - 1 ? "f" : k === 1 && h > 2 ? "b" : "m");
  const rows = Array.from({ length: top }, (_, r) => heights.map(h => (h >= top - r ? piece(h, top - r) : ".")).join(""));
  return prop([...rows, ...base], { S: blockTex("sulfur"), C: blockTex("cinnabar"), D: blockTex("deepslate"),
    t: plantTex("sulfur_spike_up_tip"), f: plantTex("sulfur_spike_up_frustum"), m: plantTex("sulfur_spike_up_middle"), b: plantTex("sulfur_spike_up_base") });
};
// A sulfur pool, as the game makes them: acid-green water (~) in a basin of sulfur (S), potent sulfur (P) on its floor
// giving off its noxious gas (w), white bubbles rising out of the water (g, the block over it they rise into, not drawn
// itself: they move, drawn by backdrop-motion.js). gas: where, as [column, blocks up it starts, blocks up it ends].
const SULFUR_WATER = "#34bf89";
const sulfurPool = rows => ({
  ...prop(rows, { S: blockTex("sulfur"), C: blockTex("cinnabar"), P: blockTex("potent_sulfur"), w: blockTex("potent_sulfur"),
    "~": { layers: [["water", SULFUR_WATER]], rows: [2, 16], cap: false } }),
  gas: [...rows[0]].flatMap((ch, c) => (ch === "g" ? [[c, rows[rows.length - 1][c] === "w" ? 0 : 1, rows.length]] : [])),
});
// A badlands mesa's bands of terracotta, top down.
const TERRACOTTA_BANDS = ["terracotta", "orange_terracotta", "terracotta", "yellow_terracotta", "brown_terracotta", "terracotta",
  "white_terracotta", "orange_terracotta", "light_gray_terracotta", "red_terracotta", "terracotta", "orange_terracotta"].map(n => blockTex(n));
// A wooded badlands mesa nearby, heights: each column's height in blocks, left to right. Its bands of terracotta run level
// (counted up from the floor, the far hills' bands in the same order), tops of grass and coarse dirt on its high columns,
// bare terracotta on the low steps.
const MESA_TOP = 8;
const bandedMesa = (t, heights) => {
  const tall = Math.max(...heights), letters = "abcdefghijklmnopqrstuvwxyz", legend = { G: grassyTop(t), C: blockTex("coarse_dirt") };
  TERRACOTTA_BANDS.forEach((spec, i) => (legend[letters[i]] = spec));
  const band = k => letters[(((MESA_TOP - k) % TERRACOTTA_BANDS.length) + TERRACOTTA_BANDS.length) % TERRACOTTA_BANDS.length];
  return prop(Array.from({ length: tall }, (_, r) => heights.map((h, c) => {
    const k = tall - 1 - r;
    if (k >= h) return ".";
    return k === h - 1 && h >= MESA_TOP ? (c % 3 === 1 ? "C" : "G") : band(k);
  }).join("")), legend);
};
// A mountainside's stone (S), andesite here and there (A), coal (C), iron (I) and an emerald (E) showing, under a layer of
// snow blocks (N).
const crag = rows => prop(rows, { S: blockTex("stone"), A: blockTex("andesite"), C: blockTex("coal_ore"), I: blockTex("iron_ore"), E: blockTex("emerald_ore"), N: blockTex("snow") });
// A trial chamber, the breeze's, as the game builds them: rooms of tuff bricks, with polished tuff and chiseled tuff in
// bands and pillars, trimmed with waxed copper gone teal (oxidized) and some still orange, lit by copper bulbs in the
// walls; copper grate walkways on ledges overhead, dispensers in the walls, oxidized copper doors, and on the floor
// trial spawners on pedestals, vaults and decorated pots.
// A copper grate is see-through: the wall behind it, in its shadow.
const grate = name => ({ layers: [["tuff_bricks", "#6e6e6e"], [name]] });
const TRIAL = {
  T: blockTex("tuff_bricks"), P: blockTex("polished_tuff"), X: blockTex("chiseled_tuff"), K: blockTex("chiseled_tuff_bricks"),
  B: blockTex("copper_bulb_lit"), b: blockTex("oxidized_copper_bulb_lit"),
  o: blockTex("oxidized_cut_copper"), g: grate("oxidized_copper_grate"),
  H: blockTex("chiseled_copper"), h: blockTex("oxidized_chiseled_copper"), S: blockTex("trial_spawner"), V: blockTex("vault"),
  D: blockTex("oxidized_copper_door_top", null, { under: INSIDE }), d: blockTex("oxidized_copper_door_bottom", null, { under: INSIDE }),
  N: blockTex("dispenser_front_horizontal"),
  // A decorated pot: its body, a little narrower than a block, and its neck.
  Q: { parts: [["decorated_pot_side", [1, 3, 15, 16], [1, 3]]], rects: [[4, 1, 12, 3, "#7e3c24"], [5, 0, 11, 1, "#9a4f2e"]], cap: false },
};
const trial = rows => prop(rows, TRIAL);
// The chamber's back wall, ten blocks to a bay, floor to ceiling: a polished tuff ceiling on a beam of oxidized cut
// copper; tuff brick walls between polished tuff pillars capped with chiseled tuff bricks, a copper bulb lit in each,
// and a panel of chiseled tuff; a walkway of oxidized copper grates on a copper ledge across it; below that, more
// bulbs and dispensers in the wall, a band of chiseled tuff and a polished tuff baseboard.
const TRIAL_WALL = [
  "PPPPPPPPPP",
  "oooooooooo",
  "KTTTTTTTTT",
  "PTTTTTTTTT",
  "BTTXXXXTTT",
  "PTTTTTTTTT",
  "PTTTTTTTTT",
  "Kggggggggg",
  "Hooooooooo",
  "PTTTTTTTTT",
  "PTTTTNTTTT",
  "bTTTTTTTTT",
  "PTTTTTTTTT",
  "PTTTTTTTTT",
  "KXXXXXXXXX",
  "PPPPPPPPPP",
];
// A stronghold's portal room, the silverfish's, as the game builds it: walls of stone bricks, plain, mossy and cracked,
// with rows of iron bars set in them, and an iron-bar grate for its entrance; stone brick stairs up to a platform with
// the ring of end portal frames on it (an eye of ender in one) over lava, the silverfish spawner on the stairs, and lava
// in the floor. No torches: the lava is its only light.
// A stone brick stair seen side on, rising to the right (or the left): a half block, and a quarter on it at the back.
const brickStair = right => ({ parts: [["stone_bricks", [0, 8, 16, 16], [0, 8]], ["stone_bricks", right ? [8, 0, 16, 8] : [0, 0, 8, 8], right ? [8, 0] : [0, 0]]], cap: false });
// An opening in the wall with iron bars across it, the dark beyond.
const BARS = { layers: [["iron_bars"]], under: "#0b0b0e" };
const STRONGHOLD = {
  S: blockTex("stone_bricks"), M: blockTex("mossy_stone_bricks"), C: blockTex("cracked_stone_bricks"),
  I: BARS, F: plantTex("end_portal_frame"),
  // A frame with an eye of ender in it: the eye's side over the frame's top.
  E: { parts: [["end_portal_frame", [0, 3, 16, 16], [0, 3]], ["endframe_eye", [4, 0, 12, 3], [4, 0]]], cap: false },
  Z: blockTex("mob_spawner"), a: brickStair(true), b: brickStair(false),
  // Lava in the floor, a shallow pool, and its stone brick rim.
  L: blockTex("lava", null, { rows: [8, 16], cap: false, glow: true }), l: blockTex("stone_bricks", null, { rows: [8, 16], cap: false }),
};
// The entrance: an iron-bar grate in the wall, shaded as dark as the wall it's in (far from the lava's light).
const strongholdEntrance = prop(["SXS", "SIS", "SIS"], { S: blockTex("stone_bricks", "#7c7c80"), X: blockTex("chiseled_stone_bricks", "#7c7c80"), I: BARS });
// The portal room's wall, twelve blocks to a stretch, floor to ceiling: stone bricks, a row of iron bars in it.
const STRONGHOLD_WALL = [
  "SSMSSCSSSMSS",
  "SCSSMSSSCSSM",
  "MSSSSSMSSSSS",
  "SSCSSSSSMSCS",
  "SSSMSSCSSSSS",
  "SMSSSCSSSMSS",
  "SIISSIISSIIS",
  "SIISSIISSIIS",
  "MSSSCSSMSSSC",
  "SSCSSSMSSCSS",
  "SMSSSSSSSSMS",
  "SSSCSMSSSSSS",
  "CSSSSSSCSMSS",
  "SSMSSSSSSSSC",
  "SSSSCSSMSSSS",
  "SCSSSSSSSCSS",
];
// The portal's platform, fifteen blocks wide: its frames on top, stairs up both sides, the spawner on the stairs in
// front, lava in the floor either side.
const portalPlatform = [
  ".....FFEFF.....",
  "....aSMSCSb....",
  "...aSCSSSMSb...",
  "lLaSSSSZSSSSbLl",
];
const stronghold = rows => prop(rows, STRONGHOLD);
// The deep dark, the warden's, at the heart of an ancient city as the game builds them: the city's portal, an empty frame
// of reinforced deepslate set in a great structure of deepslate bricks and tiles that rises in horns at its corners,
// overgrown with sculk, on steps of polished deepslate; pillars of polished basalt and chiseled deepslate; soul lanterns
// on them and on blocks of chiseled deepslate; and on the floor sculk, sensors, shriekers and a candle. All of it in a cave of
// deepslate and sculk, dark but for the soul lanterns.
const DEEP_DARK = {
  D: blockTex("deepslate_bricks"), C: blockTex("cracked_deepslate_bricks"), X: blockTex("chiseled_deepslate"), P: blockTex("polished_deepslate"),
  T: blockTex("deepslate_tiles"), R: blockTex("reinforced_deepslate"), K: blockTex("sculk"),
  B: blockTex("polished_basalt_side"), S: plantTex("sculk_sensor"), H: plantTex("sculk_shrieker"), L: lanternTex("soul_lantern_block"),
  c: CANDLE,
};
const deepDark = rows => prop(rows, DEEP_DARK);
// The city's portal, seventeen blocks wide.
const ancientPortal = deepDark([
  "T...............T",
  "TT.............TK",
  "KTT...........TTD",
  "DDTTTTTKTTTTTTTDD",
  "DDDRRRRRRRRRRRDDK",
  "DDCR.........RDDD",
  "DXDR.........RDXD",
  "KDDR.........RCDD",
  "DDDR.........RDDD",
  "DDKR.........RDDD",
  "PPPRRRRRRRRRRRPPP",
  "PPPPPPPPPPPPPPPPP",
]);
// A pillar of polished basalt between chiseled deepslate, a soul lantern on top.
const basaltPillar = deepDark(["L", "X", "B", "B", "B", "B", "B", "X"]);
// A plains window lit from inside, for the night.
const LIT_WINDOW = { layers: [["glass"]], under: "#e9b65a" };
const BACKDROPS = {
  flooded_cave: () => ({
    mist: { far: 0.7, near: 0.06 },
    water: { wash: "rgba(16, 70, 140, .12)" },
    wall: { rock: ["deepslate", "deepslate", "stone", "deepslate", "tuff"], ores: [lichen("deepslate"), lichen("deepslate"), lichen("stone"), "lapis_ore", "diamond_ore", "copper_ore"] },
    ceiling: { rock: ["deepslate", "stone", "deepslate", "tuff"], drip: ["dripstone_down_frustum", "dripstone_down_middle", "dripstone_down_tip"] },
    near: [[lichenMound(["..K.", ".KDR", "KDDL"]), -22], [stalagmite, -17], [lichenMound(["L.", "DK"]), -14], [prop(["P"], { P: SEA_PICKLE }), -11], [stalagmite, -9], [lichenMound([".K", "LD"]), -7],
      [prop(["P"], { P: SEA_PICKLE }), 5], [lichenMound(["K.", "DL"]), 7], [stalagmite, 10], [lichenMound([".L.", "KDK"]), 12], [prop(["P"], { P: SEA_PICKLE }), 15], [stalagmite, 17], [lichenMound(["..KL", ".LDD", "KDDK"]), 19]],
    // Glow lichen and sea pickles cast a cold light through the water.
    lights: [-20, -13, -7, 8, 13, 20], lightColor: "90, 210, 255",
  }),
  // Under the water of a lush cave's pool, the axolotl's (they spawn in its water, over clay), as the game builds them:
  // a shallow pool lined with clay in the cave's moss floor, its far side rising to mossy banks; big dripleaves growing up
  // through the water from the clay and small ones on the bottom; the cave's glow berries hanging above the surface light
  // the water warm from above.
  lush_pool: () => ({
    mist: { far: 0.62, near: 0.2 },
    water: { sun: true, shafts: 0.22, surface: "#4a7fbf", wash: "rgba(24, 110, 120, .1)" },
    hills: { top: [blockTex("moss_block"), blockTex("moss_block"), blockTex("clay")], fill: blockTex("clay"), ores: [["stone", "moss_block", "clay"], 0.1], base: 2, rise: 6 },
    near: [[poolBank(["MMM..", "CCMM.", "CCCMM", "CCCCC"]), -24], [dripleaf(6), -19], [poolBank(["MM..", "CMM.", "CCCM"]), -17], [dripleaf(7), -12], [smallDripleaf, -10],
      [dripleaf(4), -8], [smallDripleaf, -6], [smallDripleaf, 5], [dripleaf(5), 7], [smallDripleaf, 9], [dripleaf(8), 11], [poolBank(["..MM", ".MMC", "MCCC"]), 13],
      [dripleaf(6), 18], [poolBank(["..MMM", ".MMCC", "MMCCC", "CCCCC"]), 20]],
    // The glow berries above the surface.
    lights: [[-14, 16], [-5, 16.5], [4, 16], [13, 16.5]], lightColor: "255, 196, 110", lightSize: 5, lightStrength: 0.3,
    seed: 23,
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
      [prop(["P"], { P: SEA_PICKLE }), -3], [plant("seagrass"), 4], [reef("yellow", "pink", [".q", "fB"]), 6], [tallSeagrass, 9], [bulbKelp(7), 11], [kelp(10), 12],
      [reef("blue", "red", ["p.g.", "AABq", "AABB"]), 14], [bulbKelp(13), 18], [kelp(9), 19], [reef("red", "pink", ["fq", "AB"]), 21], [kelp(11), 24]],
  }),
  // An end city, the enderman's, endermite's and shulker's, on one of the outer islands as the game builds them: the
  // city's base floor close by, its tower rising out of sight; chorus trees on the flat end stone beyond; further off on
  // the left, more of the city, a tower with a bridge out to the end ship hanging in the void; under the End's sky.
  end_city: () => ({
    moves: ["rods", "light"],
    mist: { far: 0.5, near: 0.08 },
    // A pale violet glow low in the middle, so that the dark mobs that live here stand out against it.
    sky: { texture: "end_sky", tint: "#1e1634", glow: "150, 105, 215" },
    hills: { top: blockTex("end_stone"), fill: blockTex("end_stone"), base: 1, rise: 0,
      trees: [[chorusTrees[0], 0.37], [chorusTrees[2], 0.64]] },
    distant: [[farEndCity, 0.01, 1]],
    near: [[endCityBase, 9]],
    // The end rods on the tower's roof give off a pale light.
    lights: [[9, 8.5], [21, 8.5]], lightColor: "235, 215, 255", lightSize: 3, lightStrength: 0.3,
  }),
  // The dragon's arena, the middle of the End's main island: a ring of obsidian pillars round it, wider the taller they
  // are, bedrock on top and an end crystal on each, two of the shortest caged in iron bars. Two close by at the sides, the
  // far side of the ring across the island behind.
  end_island: () => ({
    mist: { far: 0.5, near: 0.06 },
    sky: { texture: "end_sky", tint: "#1e1634", glow: "170, 95, 205" },
    hills: { top: blockTex("end_stone"), fill: blockTex("end_stone"), base: 1, rise: 2,
      landmarks: [[obsidianPillar(14, 3, true), 0.2], [obsidianPillar(21, 3), 0.33], [obsidianPillar(27, 5), 0.47], [obsidianPillar(17, 3), 0.62], [obsidianPillar(24, 5), 0.74]] },
    crystals: true,
    near: [[obsidianPillar(12, 3, true), -15], [obsidianPillar(30, 5), 11]],
  }),
  // The nether wastes, as the game builds them: a vast cavern of netherrack, glowstone hanging from its ceiling in blobs; far
  // off, netherrack cliffs either side of a lava sea, a nether fortress's bridge across it on pillars (the blaze's home);
  // nearer, netherrack with quartz, gold ore, magma and blackstone in it, fires burning on it, mushrooms, and a lavafall
  // pouring into the lava at a shore of soul sand and gravel.
  nether: () => ({
    moves: ["lava", "fire"],
    mist: { far: 0.32, near: 0.08 },
    hills: { top: blockTex("netherrack"), fill: blockTex("netherrack"), base: 2, rise: 0, liquid: [2, blockTex("lava"), [blockTex("magma"), 0.3]],
      ores: [["quartz_ore", "nether_gold_ore", "magma", "blackstone", "blackstone"], 0.05],
      // The cliffs either side come up to the bridge's walkway, so it spans the sea from one to the other.
      profile: [[0.1, 17], [0.17, 15], [0.24, 12], [0.785, 2], [0.85, 12], [0.92, 16], [1, 19]],
      landmarks: [[fortressBridge, 0.24]] },
    ceiling: { rock: ["netherrack", "netherrack", "netherrack", "blackstone"], drip: [], hang: 0,
      // Two blobs of glowstone, one each side, each its own shape.
      blobs: [[-12, ["GGGG", "GGG.", ".GG.", "..G."], "glowstone"], [8, ["GGG", "GGG", "GG.", ".G.", ".G."], "glowstone"]] },
    near: [[netherMound(["..F.", ".QNF", "NNMO", "NBNN"]), -16], [plant("fire"), -9], [plant("mushroom_brown"), -6],
      [plant("mushroom_red"), 4], [netherMound(["F.", "NO"]), 7], [netherMound([".....", "SgLLL"]), 11], [lavafall, 14]],
    lights: [[-14, 3.5], [-9, 0.5], [8, 1.5], [14, 6], [13, 0.5]], lightSize: 4,
  }),
  // A cave a mineshaft runs through, the cave spider's: the cave's rock wall, its ceiling with dripstone and nearby
  // stalagmites, ore and cobwebs (the spiders' work); in the far wall, the mineshaft's corridor cut right across, lit
  // by its torches, its supports every four blocks, cobwebs, rails and a chest minecart.
  mineshaft: () => ({
    moves: ["torches", "light"], drips: [0.14, 0.86],
    mist: { far: 0.5, near: 0.3 },
    wall: { rock: ["stone", "stone", "stone", "andesite", "tuff"], ores: ["coal_ore", "coal_ore", "iron_ore", "copper_ore", "andesite", "gravel"],
      props: [[mineBack([
        "aaaaaaaAaAaaaaaaaaaaaaaaaaaaAAaaAaaA",
        "BbbBBbbbbbbbbBBbbBbbbbbbbbbbbbBbbbbB",
        "dDdddgdddDDddDdddddddDdgDdDgdddddddD",
      ], [12, 28]), -18, 6], [mineCorridor([
        "...P..WP...PQQQPW..P...PW..PQQQP...P",
        "...F..tF..CFf.fF...F..tF..tFf.fF...F",
        "RRRFRRRFRRMFg.fFRRRFRRRFRR.FgRgFR.RF",
      ]), -18, 6]] },
    ceiling: { rock: ["stone", "andesite", "stone", "cobblestone"], drip: ["dripstone_down_frustum", "dripstone_down_middle", "dripstone_down_tip"] },
    near: [[oreMound("iron_ore", ["..R.", ".ROR", "RRTR"], MINE_TONE), -22], [stalagmite, -17], [plant("cobweb"), -15], [oreMound("coal_ore", [".R", "OR"], MINE_TONE), -12], [plant("cobweb"), -10],
      [plant("cobweb"), 7], [stalagmite, 9], [oreMound("coal_ore", [".T.", "ROR"], MINE_TONE), 11], [plant("cobweb"), 14], [oreMound("copper_ore", ["..R", ".RO", "TRR"], MINE_TONE), 17]],
    // The corridor's torches.
    lights: [[-12, 7.5], [4, 7.5], [8, 7.5]], lightSize: 4, lightStrength: 0.3,
  }),
  cave: () => ({
    moves: ["gold_ore", "diamond_ore", "lapis_ore", "redstone_ore", "lantern_block", "light"],
    // Two of the dripstones drip, the nearest to these places across.
    drips: [0.29, 0.77],
    mist: { far: 0.62, near: 0.3 },
    wall: { rock: ["stone", "stone", "stone", "andesite", "tuff"], ores: ["coal_ore", "coal_ore", "iron_ore", "copper_ore", "redstone_ore", "gold_ore", "lapis_ore", "diamond_ore"] },
    ceiling: { rock: ["stone", "andesite", "stone", "cobblestone"], drip: ["dripstone_down_frustum", "dripstone_down_middle", "dripstone_down_tip"] },
    near: [[oreMound("iron_ore", ["..R.", ".ROR", "RRTR"], CAVE_TONE), -21], [caveTunnel, -14], [prop(["L"], { L: lanternTex("lantern_block") }), -15],
      [stalagmite, 8], [oreMound("gold_ore", [".T.", "ROR"], CAVE_TONE), 10], [oreMound("diamond_ore", ["..RR", ".ROR", "TRRR"], CAVE_TONE), 17]],
    lights: [-15],
  }),
  // The goat's jagged peaks, as the game builds them: mountains of stone under one layer of snow blocks, rising to sharp,
  // jagged points behind, stone and its ores showing on their steep faces; nearer, the mountain's stepped flanks either
  // side, snow on each step, coal, iron and an emerald in the stone; no trees, nothing growing, a clear cold sky.
  peaks: () => ({
    mist: { far: 0.4, near: 0.06 },
    hills: { top: blockTex("snow"), fill: blockTex("stone"), snowDepth: 5, jag: 3, base: 3, rise: 2,
      ores: [["coal_ore", "coal_ore", "iron_ore", "andesite", "andesite", "emerald_ore"], 0.035],
      peaks: [[0.02, 20, 1.7], [0.15, 25, 1.8], [0.3, 30, 2], [0.52, 19, 1.7], [0.63, 15, 1.9], [0.74, 27, 1.5], [0.98, 21, 1.6]] },
    // Low crags, the snow on them one sheet: each column's reaches down beside the next lower one's.
    near: [[crag([
      "NN.......",
      "SNN......",
      "SSNN.....",
      "ASSNNN...",
      "SSASSNN..",
      "SSSCISNN.",
      "SAASSSSNN",
    ]), -19], [crag([
      ".......NN",
      ".....NNNS",
      "....NNSSA",
      "..NNNSSCS",
      ".NNSASISS",
      "NNSSSAASS",
    ]), 10]],
    moves: ["spindrift"],
    snowy: true, seed: 41,
  }),
  // The wooded badlands, the striped wolf's: flat-topped mesas of level terracotta bands behind, small oaks on their grass
  // and coarse dirt tops, the lower mesas bare; nearer, a mesa's stepped cliffs either side, and red sand between them with
  // dead bushes and a cactus.
  badlands: t => ({
    moves: ["sand"], sandColor: "red",
    hills: { top: [grassyTop(t), grassyTop(t), blockTex("coarse_dirt")], fill: blockTex("terracotta"), bands: TERRACOTTA_BANDS, base: 6, rise: 9, bareBelow: 12,
      profile: [[0.2, 15], [0.26, 13], [0.33, 8], [0.42, 6], [0.46, 9], [0.56, 12], [0.6, 9], [0.7, 7], [0.75, 13], [1, 16]],
      trees: [[oakTree(t), 0.15], [oakTree(t), 0.48], [oakTree(t), 0.8], [oakTree(t), 0.91]] },
    near: [[bandedMesa(t, [10, 10, 10, 10, 7, 7, 4, 2]), -18], [plant("dead_bush"), -9], [plant("cactus_side", null, 2), -6],
      [plant("dead_bush"), 5], [plant("dead_bush"), 8], [bandedMesa(t, [2, 4, 4, 7, 7, 10, 10]), 10]],
    seed: 33,
  }),
  plains: t => ({
    leaves: 5,
    // Low, gently rolling hills, as flat as plains are, oaks dotted on them.
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 2, rise: 2, trees: [[oakTree(t), 0.5], [oakTree(t), 0.7]] },
    // Grass and the plains' wildflowers round the house and between the oaks: dandelions, poppies, oxeye daisies,
    // azure bluets, cornflowers and tulips.
    near: [[house({ roof: "planks_dark_oak", wall: "oak_planks", frame: "log_oak", base: "cobblestone", door: "oak" }), -14],
      [oakTree(t), -7], [plant("short_grass", t.grass), -2], [plant("poppy"), -1], [plant("short_grass", t.grass), 1], [tallGrass(t), 2],
      [plant("oxeye_daisy"), 3], [plant("short_grass", t.grass), 4], [plant("flower_houstonia"), 5], [tallGrass(t), 6], [plant("dandelion"), 7],
      [plant("short_grass", t.grass), 8], [oakTree(t), 10], [plant("cornflower"), 9], [plant("flower_tulip_white"), 13], [plant("short_grass", t.grass), 14],
      [plant("flower_tulip_orange"), 15]],
  }),
  // The middle of a plains village, the iron golem's and the villager's: houses either side, the well, the bell and a lamp
  // post, a farm and hay bales, with more roofs on the far hills.
  village: t => ({
    moves: ["wheat_crop"],
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 3, rise: 3, trees: [[oakTree(t), 0.432], [oakTree(t), 0.93]],
      landmarks: [[smallHouse(PLAINS_HOUSE), 0.33], [smallHouse(PLAINS_HOUSE), 0.66], [smallHouse(PLAINS_HOUSE), 0.8]] },
    near: [[house(PLAINS_HOUSE), -14], [lampPost, -7], [plant("poppy"), -5], [villageWell, 2], [bellFrame, 7], [block("composter_side"), 10],
      [block("hay_side", [".B", "BB"]), 11], [wheatFarm, 13]],
    seed: 9,
  }),
  desert: () => ({
    moves: ["sand"],
    hills: { top: blockTex("sand"), fill: blockTex("sand"), base: 2, rise: 4 },
    near: [[desertHouse, -15], [plant("cactus_side", null, 3), -6], [plant("dead_bush"), -3],
      [plant("dead_bush"), 9], [plant("cactus_side", null, 2), 14]],
  }),
  savanna: t => ({
    leaves: 5,
    hills: { top: grassyTop(t), fill: blockTex("coarse_dirt"), base: 3, rise: 5, steps: 2, trees: [[mirrored(acaciaTree(t)), 0.5]] },
    // Acacias of different shapes: a tall one by the house, a forked one the other side.
    near: [[house({ roof: "orange_terracotta", wall: "planks_acacia", frame: "acacia_log", base: "yellow_terracotta", door: "acacia" }), -15],
      [tallAcacia(t), -8], [plant("short_grass", t.grass), 0], [plant("short_grass", t.grass), 3], [forkedAcacia(t), 4]],
  }),
  snowy: () => ({
    moves: ["snow"],
    hills: { top: blockTex("snowy_grass_side"), fill: blockTex("dirt"), base: 3, rise: 4, trees: [[spruceTree(), 0.08], [spruceTree(), 0.3], [spruceTree(), 0.58], [spruceTree(), 0.9]] },
    near: [[igloo, -14], [spruceTree(), -7], [spruceTree(), 7], [spruceTree(), 12]],
  }),
  // Inside a woodland mansion, the vex's: a hall of bays between log pillars, bookshelves along the wall, a chest, a
  // door, and torches on the pillars for light.
  mansion: () => ({
    moves: ["torches", "light"],
    mist: { far: 0.12, near: 0.04 },
    wall: { pattern: MANSION_WALL, legend: MANSION, dim: "rgba(22, 12, 4, .45)" },
    nearDim: "rgba(22, 12, 4, .3)",
    // Bookshelves with a potted allium on them, a dark oak door, a chest, and a red tulip on a dark oak table.
    near: [[mansion([".a.", "KKK", "KKK"]), -12], [mansion(["PPP", "PDP", "PdP"]), -8],
      [mansion(["H"]), 6], [mansion(["r", "F"]), 8], [mansion(["a.", "KK", "KK", "KK"]), 10]],
    // The torches on the pillars, nine blocks apart.
    lights: [-13, -4, 5, 14].map(at => [at, 11.5]),
  }),
  // A trial chamber, the breeze's (it only spawns from their trial spawners): pillars with copper bulbs, grates,
  // spawners and vaults, under a tuff brick ceiling, lit by the bulbs.
  trial_chamber: () => ({
    moves: ["spawners", "vaults"],
    mist: { far: 0.2, near: 0.06 },
    wall: { pattern: TRIAL_WALL, legend: TRIAL, dim: "rgba(20, 13, 8, .42)" },
    nearDim: "rgba(20, 13, 8, .32)",
    // An oxidized copper double door in a copper frame; a trial spawner on a pedestal and a vault by it; decorated
    // pots; and a second spawner on a taller pedestal.
    near: [[trial(["KhhK", "PDDP", "PddP"]), -15], [trial([".S.", "oHo", "PPP"]), -10], [trial(["V"]), -6],
      [trial(["QQ"]), 4], [trial(["S", "h", "X", "P"]), 8], [trial(["Q"]), 11], [trial(["oVo"]), 13]],
    // Warm light round the wall's bulbs, five blocks apart, high and low.
    lights: [-15, -5, 5, 15].flatMap(at => [[at, 11.5], [at, 4.5]]),
    lightColor: "255, 196, 128",
  }),
  // A stronghold's portal room, the silverfish's: its stone brick wall with a row of iron bars, the entrance grate, and the
  // portal's platform with the spawner on its stairs and lava at its foot, the lava its only light.
  stronghold: () => ({
    moves: ["lava", "light", "spawners"],
    mist: { far: 0.15, near: 0.04 },
    wall: { pattern: STRONGHOLD_WALL, legend: STRONGHOLD, dim: "rgba(8, 8, 12, .55)" },
    nearDim: "rgba(8, 8, 12, .12)",
    // The portal on its platform between two entrances, iron-bar grates in the wall either side, all of it even about
    // the middle (the platform, an odd fifteen blocks wide, half a block off the grid so it's centered like the wall's
    // windows).
    near: [[strongholdEntrance, -15], [stronghold(portalPlatform), -7.5], [strongholdEntrance, 12]],
    // Only the lava gives light.
    lights: [[-6.5, 0.3], [5.5, 0.3]],
    lightColor: "255, 140, 50", lightSize: 2.5, lightStrength: 0.3,
  }),
  // The deep dark, the warden's (it comes out of the ground there, summoned by shriekers): an ancient city's pillars and
  // the frame of its portal in the deepslate, sculk spread over it all, lit by soul lanterns.
  deep_dark: () => ({
    moves: ["sculk"],
    mist: { far: 0.3, near: 0.05 },
    wall: { rock: ["deepslate", "deepslate", "deepslate", "sculk", "deepslate", "deepslate_tiles"], ores: ["sculk", "sculk", "sculk_catalyst"], alone: ["sculk_catalyst"], dim: "rgba(4, 8, 10, .55)" },
    ceiling: { rock: ["deepslate", "sculk", "deepslate", "deepslate"], drip: [], shade: 0.55 },
    nearDim: "rgba(4, 8, 10, .3)",
    near: [[basaltPillar, -15], [deepDark(["L", "X"]), -13], [deepDark(["H", "K"]), -11], [deepDark(["KK"]), -10],
      [ancientPortal, -8], [deepDark(["c", "X"]), 10], [deepDark(["S", "K"]), 12], [deepDark(["L", "X"]), 13], [basaltPillar, 15]],
    // Soul lanterns' cold light: on the pillars, and hanging.
    lights: [[-15, 7.5], [-13, 1.5], [13, 1.5], [15, 7.5]],
    lightColor: "110, 215, 230",
  }),
  // The plains at night, the phantom's (it comes out over any biome at night) and the night's undead: the plains'
  // hills and house, darkened and blue under stars and the moon, the house's windows lit.
  plains_night: t => {
    const scene = BACKDROPS.plains(t);
    return { ...scene, night: NIGHTS.default.night,
      near: [[house({ ...PLAINS_HOUSE, window: LIT_WINDOW }), -14], ...scene.near.slice(1)], lights: [[-13, 2.5], [-9, 2.5]], lightColor: "255, 190, 100" };
  },
  taiga: t => ({
    moves: ["mist"],
    hills: { top: blockTex("podzol_side"), fill: blockTex("dirt"), base: 3, rise: 4, trees: [0.04, 0.16, 0.3, 0.45, 0.6, 0.74, 0.88].map(at => [spruceTree(), at]) },
    near: [[house({ roof: "cobblestone", wall: "planks_spruce", frame: "log_spruce", base: "mossy_cobblestone", door: "spruce" }), -14],
      [spruceTree(), -7], [plant("berry_bush"), -1], [plant("fern", t.grass), 3], [spruceTree(), 7], [plant("berry_bush"), 13], [spruceTree(), 14]],
  }),
  // A dense canopy on low hills behind; giant trees frame the scene from above, one off to the left.
  jungle: t => ({
    leaves: 7,
    hills: {
      top: grassyTop(t), fill: blockTex("dirt"), base: 2, rise: 2,
      trees: Array.from({ length: 16 }, (_, i) => [jungleTree(t, [5, 3, 7, 4][i % 4]), i / 15 - 0.03]),
    },
    near: [[giantJungleTree(t), -20], [giantJungleTree(t), 3], [jungleTemple(t), -14], [largeFern(t), -1],
      [block("melon_side"), 6], [bamboo(7), 11], [bamboo(9), 12], [largeFern(t), 13], [bamboo(6), 14]],
  }),
  // The mooshroom's mushroom fields: mycelium hills with no trees at all, only huge red and brown mushrooms, and small
  // ones underneath.
  mushroom_fields: () => ({
    moves: ["spores"],
    hills: { top: blockTex("mycelium_side"), fill: blockTex("dirt"), base: 3, rise: 4, trees: [
      [hugeBrownMushroom(3), 0.17], [hugeRedMushroom(1), 0.33], [hugeBrownMushroom(4), 0.5],
      [hugeRedMushroom(3), 0.64], [hugeBrownMushroom(2), 0.78]] },
    near: [[hugeBrownMushroom(6), -26], [hugeRedMushroom(4), -17], [plant("mushroom_red"), -12], [plant("mushroom_brown"), -10],
      [plant("mushroom_brown"), -6], [plant("mushroom_red"), 5], [plant("mushroom_brown"), 8], [hugeRedMushroom(5), 10],
      [plant("mushroom_red"), 16], [hugeBrownMushroom(5), 18]],
    seed: 37,
  }),
  // The cherry grove: a meadow high in the mountains, cherry trees on the slopes behind and nearer by, saplings and grass.
  cherry_grove: t => ({
    leaves: 24,
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 4, rise: 6, trees: [[smallCherry(), 0.41], [tallFarCherry(), 0.55], [midCherry(), 0.65]] },
    near: [[tallCherry(5), -26], [plant("short_grass", t.grass), -17], [forkedCherry(2), -18], [plant("cherry_sapling"), -9], [plant("short_grass", t.grass), -7],
      [plant("short_grass", t.grass), 4], [plant("cherry_sapling"), 6], [cherryTree(3), 9], [plant("short_grass", t.grass), 19], [tallCherry(3), 18]],
    seed: 39,
  }),
  // The pale garden: pale oaks thick on the hills, hung with pale moss; pale moss underfoot, eyeblossoms shut by day
  // (open at night: blossom), and a creaking heart in one trunk.
  pale_garden: (t, open = false) => {
    const blossom = () => plant(open ? "eyeblossom_open" : "eyeblossom");
    const blossoms = [-19, 12, 18];
    return {
      leaves: 12,
      mist: { far: 0.5, near: 0.16 },
      hills: { top: blockTex("pale_moss_block"), fill: blockTex("pale_moss_block"), base: 3, rise: 3, trees: Array.from({ length: 22 }, (_, i) => [smallPaleOak(), i / 21 - 0.02]) },
      near: [[paleOak(4), -28], [paleOak(5), -22], [blossom(), blossoms[0]], [paleOak(3, true), -16], [smallPaleOak(), -10], [paleMound(["M.", "MM"]), -11],
        [plant("pale_moss_carpet_side"), -7], [blossom(), blossoms[1]], [plant("pale_moss_carpet_side"), 7], [smallPaleOak(), 7],
        [paleOak(5), 11], [blossom(), blossoms[2]], [paleMound([".M", "MD"]), 19], [paleOak(3), 21], [paleOak(4), 26]],
      seed: 41,
      // Open, their orange eyes glow over the night's shade.
      glows: open ? blossoms.map(at => [plant("eyeblossom_eyes"), at]) : [],
    };
  },
  // The pale garden at night, the creaking's: the same garden darkened under stars and the moon, its eyeblossoms open.
  pale_garden_night: t => ({ ...BACKDROPS.pale_garden(t, true), night: NIGHTS.default.night }),
  // The dappled forest: oaks gone orange and red and birches gone gold, bushes and firefly bushes beneath.
  dappled_forest: t => ({
    leaves: 16,
    mist: { far: 0.3, near: 0.08 },
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 3, rise: 3, trees: Array.from({ length: 14 }, (_, i) => [
      i % 3 === 2 ? autumnBirch() : oakTree({ foliage: i % 3 ? DAPPLED.red : DAPPLED.orange }), i / 13 - 0.02]) },
    near: [[tallOak({ foliage: DAPPLED.orange }), -26], [autumnBirch(), -19], [plant("bush", DAPPLED.orange), -14], [oakTree({ foliage: DAPPLED.red }), -12],
      [plant("firefly_bush"), -7], [plant("short_grass", t.grass), -5], [plant("short_grass", t.grass), 4], [plant("bush", DAPPLED.red), 6],
      [autumnBirch(), 8], [plant("firefly_bush"), 13], [tallOak({ foliage: DAPPLED.red }), 15], [oakTree({ foliage: DAPPLED.orange }), 21]],
    seed: 43,
  }),
  // The sulfur caves, as the game builds them: rock in layers of yellow sulfur and red cinnabar, about as much of each,
  // with seams of deepslate and stone between and a few ores; sulfur spikes hanging from the ceiling and growing in
  // patches on the sulfur floor; a sulfur pool, its acid-green water over potent sulfur bubbling with gas; all in the
  // biome's green fog.
  sulfur_caves: () => ({
    mist: { far: 0.42, near: 0.14 },
    wall: { strata: ["sulfur", "sulfur", "sulfur", "deepslate", "cinnabar", "cinnabar", "cinnabar", "stone", "sulfur", "sulfur", "cinnabar", "cinnabar", "deepslate"],
      ores: ["coal_ore", "iron_ore", "redstone_ore", "gold_ore", lichen("deepslate")], oreRate: 90, dim: "rgba(12, 16, 4, .3)" },
    ceiling: { rock: ["sulfur", "sulfur", "cinnabar", "deepslate"], drip: ["sulfur_spike_down_base", "sulfur_spike_down_middle", "sulfur_spike_down_frustum", "sulfur_spike_down_tip"], hang: 0.3 },
    near: [[sulfurMound(["..CC", ".SCC", "SSDC"]), -24], [spikePatch([2, 4, 0, 3], ["SSSS"]), -20], [sulfurMound(["S", "S"]), -16], [sulfurPool(["..g.g.", "S~~~~S", "SPwPPS"]), -15],
      [spikePatch([1, 3, 2], ["SSS"]), -9], [sulfurSpike(1), 5], [spikePatch([2, 5, 3], ["SSS"]), 6], [sulfurPool(["..g..", "S~~~S", "SPwPS"]), 9],
      [spikePatch([3, 1, 4], ["SSS"]), 14], [sulfurMound(["C..", "CS.", "DSS"]), 17], [sulfurMound(["..C", "CCC"]), 20]],
  }),
  // The swamp, the witch's and the black cat's, as the game builds it: flat and low, flooded in pools of gray-green water
  // with lily pads; the witch's hut up on its stilts over one; swamp oaks hung with vines, small ones on the flat land
  // behind; blue orchids (only swamps grow them), mushrooms, a firefly bush and sugar cane on the shore.
  // The swamp, the witch's and the black cat's, as the game builds it: flat and low, flooded in pools of gray-green water
  // with lily pads between grassy banks; the witch's hut on its stilts over one, sugar cane on the shore beside it;
  // swamp oaks hung with vines, small ones on the flat land behind; blue orchids (only swamps grow them), mushrooms and a
  // firefly bush.
  // The swamp, the witch's and the black cat's, as the game builds it: flat and low, its ground a block high with pools of
  // gray-green water and lily pads in it; the witch's hut on its stilts in one, sugar cane on the shore beside it; a swamp
  // oak hung with vines and a small one; blue orchids (only swamps grow them), mushrooms and a
  // firefly bush.
  swamp: t => ({
    leaves: 5, leavesLand: 1,
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 2, rise: 0 },
    // A small swamp oak on the left, at the same scale as everything else on the ground; the hut over the middle of its pool.
    near: [[lifted(smallSwampOak(t)), -16], [swampGround(t, [
      ".............c..................",
      ".............c..................",
      "...o...l..l..cofg.b..r...o.l..l.",
      "GGGG~~~~~~~~~GGGGGGGGGGGGG~~~~~G",
    ]), -16], [witchHut, -12], [lifted(swampOak(t)), 3]],
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

// What's drawn in place of some textures, by name (null for none), while a scene's moving parts are left out or looked for
// (see movingCells): each gives the picture to draw, or nothing.
let standIns = null;
// Draw one block at (left, top), size pixels square; rows: [first, last) texel rows only.
function shadeBlock(ctx, rects, left, top, size) {
  for (const [x0, y0, x1, y1, color] of rects || []) {
    ctx.fillStyle = color;
    ctx.fillRect(left + (x0 / 16) * size, top + (y0 / 16) * size, ((x1 - x0) / 16) * size, ((y1 - y0) / 16) * size);
  }
}
function drawBlock(ctx, spec, left, top, size) {
  if (spec.fill) {
    ctx.fillStyle = spec.fill;
    ctx.fillRect(left, top, size, size);
    return;
  }
  const [from, to] = spec.rows || [0, 16];
  // under: a color filled in behind the layers (the dark outside seen through a window's glass).
  if (spec.under) {
    ctx.fillStyle = spec.under;
    ctx.fillRect(left, top, size, size);
  }
  (spec.layers || []).forEach(([name, tint, [x0, x1] = [0, 16]], i) => {
    const tex = standIns && standIns[name] ? standIns[name](left, top, size, Boolean(spec.flows), tint, null, from) : textureCanvas(name, tint);
    // squash: the whole texture drawn into those rows (a lily pad lying flat, seen edge on).
    if (tex && spec.squash) ctx.drawImage(tex, x0, 0, x1 - x0, 16, left + (x0 / 16) * size, top + (spec.squash[0] / 16) * size, ((x1 - x0) / 16) * size, ((spec.squash[1] - spec.squash[0]) / 16) * size);
    else if (tex) ctx.drawImage(tex, x0, from, x1 - x0, to - from, left + (x0 / 16) * size, top + (from / 16) * size, ((x1 - x0) / 16) * size, ((to - from) / 16) * size);
    // shade: see-through boxes over the first layer, under the rest, in texels (the shadows of a room's back wall, seen
    // through a window's glass; a doorway's sides).
    if (i === 0) shadeBlock(ctx, spec.shade, left, top, size);
  });
  // parts: pieces of a texture, each [name, [x0, y0, x1, y1] in the texture, [x, y] where it goes in the block], in
  // texels (a lantern's body, cap and handle, cut from its block texture).
  // [x, y, w, h]: drawn that size instead, squeezed (a small dripleaf's leaf, seen edge on).
  for (const [name, [x0, y0, x1, y1], [x, y, w = x1 - x0, h = y1 - y0]] of spec.parts || []) {
    const tex = standIns && standIns[name] ? standIns[name](left, top, size, false, null, [x0, y0, x1, y1, x, y, w, h]) : textureCanvas(name);
    if (tex) ctx.drawImage(tex, x0, y0, x1 - x0, y1 - y0, Math.round(left + (x / 16) * size), Math.round(top + (y / 16) * size), (w / 16) * size, (h / 16) * size);
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
    // lintel: shadows only on the top block of an opening (one that the same opening doesn't go on above).
    if (spec.lintel && legend[(rows[r - 1] || "")[c]] !== spec) shadeBlock(ctx, spec.lintel, x, y, size);
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
    // profile: a skyline drawn by hand, not by the waves: [up to this fraction of the width, height in blocks], in order.
    if (hills.profile) return (hills.profile.find(([until]) => c / cols < until) || hills.profile[hills.profile.length - 1])[1];
    let h = hills.base + hills.rise * wave(c);
    for (const [at, tall, fall] of hills.peaks || []) {
      const from = Math.abs(c - at * cols);
      // jag: how many columns wide each of those bumps is (1 if not given); wider ones make steps, not one-block spikes.
      h = Math.max(h, tall - from * fall + (from > 0.5 ? rough[Math.floor(c / (hills.jag || 1)) & 255] : 0));
    }
    return hills.steps ? Math.round(h / hills.steps) * hills.steps : Math.round(h);
  };
}
function hillSpots(hills, width, horizon, size, seed) {
  const heightAt = hillHeights(hills, seed, width / size);
  // A landmark (a far house) stands on the lowest ground under it (drawHills levels the rest to it). A tree stands on top
  // of the highest ground under its trunk (its bottom row), never in it, its crown over lower ground either side; given
  // on, on the ground under that column of it.
  const tree = new Set(hills.trees || []);
  return [...(hills.trees || []), ...(hills.landmarks || [])].map(entry => {
    const [p, at, { on } = {}] = entry, c = Math.round((at * width) / size), w = p.rows[0].length;
    const under = on !== undefined ? [on] : tree.has(entry) ? [...p.rows[p.rows.length - 1]].flatMap((ch, i) => (p.legend[ch] ? [i] : [])) : null;
    const ground = under ? Math.max(...under.map(i => heightAt(c + i))) : Math.min(...Array.from({ length: w }, (_, i) => heightAt(c + i)));
    return [p, c * size, horizon - ground * size];
  });
}
function drawHills(ctx, hills, width, horizon, size, snowy, seed) {
  const hillAt = hillHeights(hills, seed, width / size), cols = Math.ceil(width / size) + 1;
  // The ground under a landmark (a far house) is leveled to where it stands, grass on top under it, not a higher column's
  // dirt showing below its base.
  const level = {};
  for (const [p, at] of hills.landmarks || []) {
    const c = Math.round((at * width) / size), w = p.rows[0].length;
    const h = Math.min(...Array.from({ length: w }, (_, i) => hillAt(c + i)));
    for (let i = 0; i < w; i++) level[c + i] = h;
  }
  const heightAt = c => level[c] ?? hillAt(c);
  for (let c = 0; c < cols; c++) {
    const h = heightAt(c);
    // Bands (a mesa's) run level across the hills, counted down from the highest top. Above the snow line (a mountain's)
    // they're all snow.
    const top = hills.base + hills.rise;
    // top: one block, or several mixed along the tops (a wooded badlands' grass and coarse dirt), the same every time;
    // bareBelow: tops lower than that many blocks are bare, no top block, just their band (the badlands' low mesas).
    const cap = Array.isArray(hills.top) ? hills.top[((c * 7919) >> 3) % hills.top.length] : hills.top;
    const band = k => (hills.bands ? hills.bands[(((top - k) % hills.bands.length) + hills.bands.length) % hills.bands.length] : hills.fill);
    // snowDepth: how deep the top (snow) lies where the slope is gentle, thinning to one block where it's steep (a
    // mountain's steep faces show their stone); the slope taken over five columns, and the stone under the snow kept
    // to the lowest ground nearby, so its edge runs smooth, no lone column of stone sticking up into the snow.
    const slope = Math.abs(heightAt(c - 2) - heightAt(c + 2)) / 4;
    const deep = hills.snowDepth ? Math.max(1, Math.round(hills.snowDepth - 2.5 * Math.max(0, slope - 0.5))) : 1;
    const stoneTop = hills.snowDepth ? Math.min(h - 1, Math.min(...[-2, -1, 0, 1, 2].map(d => heightAt(c + d))) - deep) : h - deep;
    // ores: blocks of ore here and there in the fill ([names], how often), where it shows (a mountain's exposed ores).
    const fill = k => {
      if (hills.ores && hills.ores[0].length) {
        const hash = Math.abs(Math.sin(c * 12.9898 + k * 78.233) * 43758.5453) % 1;
        if (hash < hills.ores[1]) return blockTex(hills.ores[0][Math.floor((hash / hills.ores[1]) * hills.ores[0].length)]);
      }
      return band(k);
    };
    // liquid: [level, block, under]: columns no higher than level have that on top (the nether's lava sea); under,
    // [block, how often]: that block now and then in the bed right under it (magma under the lava).
    if (hills.liquid && h <= hills.liquid[0]) {
      const [, , [bed, often] = []] = hills.liquid, onBed = (Math.abs(Math.sin(c * 91.7 + 3.1) * 43758.5453) % 1) < (often || 0);
      for (let k = 0; k < h - 1; k++) drawBlock(ctx, onBed && k === h - 2 ? bed : fill(k), c * size, horizon - (k + 1) * size, size);
      drawBlock(ctx, hills.liquid[1], c * size, horizon - h * size, size);
      continue;
    }
    for (let k = 0; k < h; k++) drawBlock(ctx, hills.snowline && k >= hills.snowline + (c % 3 === 0 ? 1 : 0) ? hills.snow : k >= stoneTop && !(h < hills.bareBelow) ? cap : fill(k), c * size, horizon - (k + 1) * size, size);
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

// A rock wall filling the canvas, with drifts of other rock and ore here and there in small clusters.
// A wall built to a plan, not of random rock: pattern, rows of blocks top first, each letter a block from legend,
// repeated across, its last row standing on the floor (horizon) and its first row carried up to the top.
// dim: a color washed over it all (a dim room, its far wall in shadow).
function drawPatternWall(ctx, { pattern, legend, dim }, width, horizon, size) {
  const w = pattern[0].length, cols = Math.ceil(width / size) + 2, mid = Math.floor(width / 2 / size);
  for (let k = 0; horizon - k * size > -size; k++) {
    const row = pattern[Math.max(0, pattern.length - 1 - k)], y = horizon - (k + 1) * size;
    for (let c = -1; c < cols; c++) {
      const spec = legend[row[(((c - mid + Math.floor(w / 2)) % w) + w) % w]];
      if (spec) drawBlock(ctx, spec, c * size + (width / 2 - mid * size), y, size);
    }
  }
  if (dim) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = dim;
    ctx.fillRect(0, 0, width, horizon);
    ctx.globalCompositeOperation = "source-over";
  }
}
// alone: ores that come one block at a time, never in a pair (the deep dark's sculk catalysts).
// strata: rock in level layers instead (top first, repeated down), each a block or two higher or lower across the wall
// as the layers wave (the sulfur caves' sulfur and cinnabar). oreRate: one block of ore in that many (34 if not given).
function drawWall(ctx, { rock, strata, ores, dim, alone = [], oreRate = 34 }, width, height, size, seed) {
  const random = rng(seed), cols = Math.ceil(width / size), rows = Math.ceil(height / size), ore = {};
  for (let i = Math.round((cols * rows) / oreRate); i > 0; i--) {
    const c = Math.floor(random() * cols), r = Math.floor(random() * rows), name = ores[Math.floor(random() * ores.length)];
    ore[`${c},${r}`] = name;
    if (random() < 0.6) {
      const below = `${c + (random() < 0.5 ? 1 : 0)},${r + 1}`;
      if (!alone.includes(name)) ore[below] = name;
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const drift = (Math.sin(c * 0.37 + r * 0.21) + Math.sin(r * 0.53 - c * 0.13) + 2) / 4;
    const wave = Math.round(1.2 * Math.sin(c * 0.21 + 1) + 0.8 * Math.sin(c * 0.57));
    const name = ore[`${c},${r}`] || (strata ? strata[(((r + wave) % strata.length) + strata.length) % strata.length] : rock[Math.min(rock.length - 1, Math.floor(drift * rock.length))]);
    drawBlock(ctx, typeof name === "string" ? blockTex(name) : name, c * size, r * size, size);
  }
  // dim: a color washed over it all (a cave hardly lit).
  if (dim) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = dim;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }
}

// The ceiling: rock hanging from the top edge to an uneven depth, with stalactites under it. low: how many blocks above
// the floor it comes down to, not just its top rows;
// shade: how much darker it is.
// hang: how often a column has something hanging from it (.24 if not given). blobs: shapes hung from it in chosen
// places instead, [at (blocks from the middle), rows top first, block]: each column of the shape hangs from the rock
// right above it (the nether's glowstone).
// Gives how many blocks down it comes in each column, with what hangs there (and, in its tips, where the dripstones end, [column, blocks down]).
function drawCeiling(ctx, { rock, drip, low, shade = 0, hang: often = 0.24, blobs = [] }, width, size, seed, horizon) {
  const random = rng(seed), roof = low ? Math.max(0, Math.floor(horizon / size - low)) : 0, depths = [], reach = [];
  reach.tips = [];
  for (let c = 0; c < Math.ceil(width / size); c++) {
    const depth = roof + 1 + Math.round(2 * ((Math.sin(c * 0.43 + seed) + Math.sin(c * 0.97) + 2) / 4)) - (low ? 1 : 0);
    depths[c] = reach[c] = depth;
    for (let k = 0; k < depth; k++) drawBlock(ctx, blockTex(rock[Math.floor(random() * rock.length)]), c * size, k * size, size);
    // shade: how much darker the rock is (a mineshaft's roof, out of the torchlight).
    if (shade) {
      ctx.fillStyle = `rgba(0, 0, 0, ${shade})`;
      ctx.fillRect(c * size, 0, size, depth * size);
    }
    if (random() < often) {
      const hang = random() < 0.4 ? drip : drip.slice(-2);
      hang.forEach((name, k) => drawBlock(ctx, blockTex(name), c * size, (depth + k) * size, size));
      reach[c] += hang.length;
      if (hang.length && hang[hang.length - 1].startsWith("dripstone")) reach.tips.push([c, reach[c]]);
    }
  }
  for (const [at, rows, name] of blobs) {
    const left = Math.round(width / 2 / size + at);
    rows.forEach((row, r) => [...row].forEach((ch, j) => {
      if (ch !== "." && depths[left + j] !== undefined) drawBlock(ctx, blockTex(name), (left + j) * size, (depths[left + j] + r) * size, size);
    }));
  }
  return reach;
}

// Night over a scene: what's drawn so far shaded (shade), then stars and a full moon (at moon across the sky) behind it.
// Some of the stars twinkle: those go in twinkling, [x, y, how big, how bright], and aren't drawn here. Only stars with nothing
// in front of them do, as they're drawn over the picture.
function drawNight(ctx, { shade, moon = 0.75, stars = true }, width, horizon, size, seed, twinkling) {
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, horizon + size);
  ctx.globalCompositeOperation = "destination-over";
  if (!stars) {
    ctx.globalCompositeOperation = "source-over";
    return;
  }
  const random = rng(seed), px = Math.max(1, Math.round(size / 8));
  // The moon: a pale square, a few gray craters on it, and a soft halo round it.
  const m = 2 * size, mx = Math.round(width * moon), my = Math.round(horizon * 0.18);
  ctx.fillStyle = "#7d8496";
  for (const [x, y, w, h] of [[3, 3, 3, 2], [9, 5, 4, 3], [5, 10, 3, 3], [11, 11, 2, 2], [2, 7, 2, 2]]) ctx.fillRect(mx + (x * m) / 16, my + (y * m) / 16, (w * m) / 16, (h * m) / 16);
  ctx.fillStyle = "#e9ecdc";
  ctx.fillRect(mx, my, m, m);
  const ahead = ctx.getImageData(0, 0, width, Math.ceil(horizon)).data, open = (x, y) => x < width && !ahead[(y * width + x) * 4 + 3];
  const halo = ctx.createRadialGradient(mx + m / 2, my + m / 2, m / 2, mx + m / 2, my + m / 2, 3 * m);
  halo.addColorStop(0, "rgba(220, 228, 255, .28)");
  halo.addColorStop(1, "rgba(220, 228, 255, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(mx - 3 * m, my - 3 * m, 7 * m, 7 * m);
  // Stars: square pixels of one or two sizes, some brighter.
  for (let i = Math.round((width * horizon) / (size * size * 1.6)); i > 0; i--) {
    const x = Math.floor(random() * width), y = Math.floor(random() * horizon * 0.85), big = random() < 0.15;
    const bright = 0.35 + random() * 0.6, side = big ? 2 * px : px;
    let clear = i % 2 === 0;
    for (let dy = 0; clear && dy < side; dy++) for (let dx = 0; clear && dx < side; dx++) clear = open(x + dx, y + dy);
    if (clear) {
      twinkling.push([x, y, side, bright]);
      continue;
    }
    ctx.fillStyle = `rgba(235, 240, 255, ${bright.toFixed(2)})`;
    ctx.fillRect(x, y, side, side);
  }
  ctx.globalCompositeOperation = "source-over";
}

// The other biomes' nights (desert_night...): what changes from the biome by day. Above water, everything darkened and
// blue under stars and the moon (the swamp's a murkier green-gray); underwater, the ocean's, no sky to see but dim
// moonlight slanting down from a dark surface.
const NIGHTS = {
  default: { night: { shade: "rgba(12, 20, 48, .45)", moon: 0.78 } },
  swamp: { night: { shade: "rgba(10, 22, 30, .5)", moon: 0.7 } },
  snowy: { night: { shade: "rgba(14, 24, 60, .38)", moon: 0.74 } },
  ocean: { night: { shade: "rgba(4, 12, 36, .52)", stars: false }, water: { sun: true, shafts: 0.4, surface: "#3f6290" } },
};

// The blocks of a scene drawn from a texture that moves (its lava, its fires; or several, in a list: each cell has its name), for backdrop-motion.js: where they are
// (cells, in CSS pixels), and how the scene lies over them. That's found by painting the scene with them black, then dark
// gray: where the two differ they show (nothing stands in front); the black one is what the haze and the light add (base),
// and the difference is how much comes through them (gain).
function movingCells(paint, names, width, height, dpr) {
  const cells = [], LEVEL = 64;
  const shot = (level, found) => {
    const flat = Object.assign(document.createElement("canvas"), { width: 16, height: 16 }), fc = flat.getContext("2d");
    fc.fillStyle = `rgb(${level}, ${level}, ${level})`;
    fc.fillRect(0, 0, 16, 16);
    const cv = Object.assign(document.createElement("canvas"), { width, height }), ctx = cv.getContext("2d");
    // from: the block's first row of texels, if it isn't all there (lava in a floor).
    const spot = name => (left, top, size, flows, tint, part, from) => {
      if (found && left < width && left + size > 0 && top < height && top + size > 0) found.push({ x: left / dpr, y: top / dpr, size: size / dpr, ...(flows && { flows }), ...(part && { part }), ...(from && { from }), ...(Array.isArray(names) && { name }) });
      return flat;
    };
    paint(ctx, Object.fromEntries([].concat(names).map(name => [name, spot(name)])));
    return ctx.getImageData(0, 0, width, height);
  };
  const base = shot(0, cells), gain = shot(LEVEL);
  for (let i = 0; i < gain.data.length; i += 4) {
    const parts = [0, 1, 2].map(k => gain.data[i + k] - base.data[i + k]);
    if (Math.max(...parts) > 4) parts.forEach((d, k) => { gain.data[i + k] = Math.min(255, Math.max(0, Math.round((d * 255) / LEVEL))); });
    else base.data[i + 3] = gain.data[i + 3] = 0;
  }
  const url = data => {
    const cv = Object.assign(document.createElement("canvas"), { width, height });
    cv.getContext("2d").putImageData(data, 0, 0);
    return cv.toDataURL();
  };
  const shows = (x, y) => gain.data[(Math.floor(y * dpr) * width + Math.floor(x * dpr)) * 4 + 3] > 0;
  return { shows, parts: { cells, base: url(base), gain: url(gain) } };
}
// Lava that moves, and where it spits sparks (pops: each block of its surface that shows, not under the lavafall).
function lavaMotion(paint, width, height, dpr) {
  const { parts, shows } = movingCells(paint, "lava", width, height, dpr);
  const pops = parts.cells.filter(c => !c.flows && c.x >= 0 && (c.x + c.size) * dpr <= width && shows(c.x + c.size / 2, c.y + ((c.from || 0) / 16) * c.size + 1) && !parts.cells.some(o => o !== c && o.x === c.x && o.y <= c.y && o.y + o.size >= c.y)).map(({ x, y, size, from = 0 }) => ({ x, y: y + (from / 16) * size, size }));
  return { ...parts, pops, still: ART_FRAMES.lava_still, flow: ART_FRAMES.lava_flow, pop: ART_FRAMES.lava_pop };
}
// See-through blocks that move, left out of the still picture (they'd show through the moving ones' gaps): fires, plants that sway.
const LEFT_OUT = ["fire", "wheat_crop"], SWAYS = ["wheat_crop"];
// Plants that sway in the wind, their tops the most.
const swayMotion = (paint, names, width, height, dpr) => ({ ...movingCells(paint, names, width, height, dpr).parts, pictures: Object.fromEntries(names.map(name => [name, textureCanvas(name).toDataURL()])) });
const fireMotion = (paint, width, height, dpr) => ({ ...movingCells(paint, "fire", width, height, dpr).parts, frames: ART_FRAMES.fire });

// Blocks that play their texture's frames (art/frames/): ticks, how long each stays before it fades into the next; frames, their
// order if not simply one after another; every: not over and over but once in that many seconds (an ore's glint); glow: how
// strongly what's brighter than the first frame shines through the scene's dimness; shine: how strongly its ore itself does,
// slowly stronger and weaker.
const SHEETS = {
  gold_ore: { ticks: 3, every: 5, glow: 0.9, shine: 0.4 }, diamond_ore: { ticks: 3, every: 5, glow: 0.9, shine: 0.4 }, lapis_ore: { ticks: 3, every: 5, glow: 0.9, shine: 0.6 },
  redstone_ore: { ticks: 6, glow: 0.9, shine: 0.4 },
  lantern_block: { ticks: 16, frames: [0, 1, 2, 1], glow: 0.5 },
};
function sheetMotion(paint, names, width, height, dpr) {
  const { parts } = movingCells(paint, names, width, height, dpr);
  return { ...parts, sheets: Object.fromEntries(names.map(name => [name, { picture: ART_FRAMES[name], ...SHEETS[name] }])) };
}
// Sculk that glimmers.
const sculkMotion = (paint, width, height, dpr) => ({ ...movingCells(paint, "sculk", width, height, dpr).parts, frames: ART_FRAMES.sculk });

// The leaves that fall from a tree's crown: the pack's particles (art/frames/, 7x7 texels each), by its leaves' block and tint.
// The dappled forest's are its poplar leaves, by their colors; the cherry's, which the pack has none of, the tinted leaves in pink.
function leafSheet(name, tint) {
  const dappled = name !== "leaves_jungle" && Object.keys(DAPPLED).find(k => DAPPLED[k] === tint);
  if (name === "pale_oak_leaves") return ["leaf_pale_oak"];
  return dappled ? [`leaf_${dappled}`] : ["leaf_tinted", name === "cherry_leaves" ? "petal" : tint];
}
const CHERRY_PETAL = "#f9a9cf";
const LEAF_BLOCKS = ["leaves_oak", "leaves_birch", "leaves_acacia", "leaves_jungle", "cherry_leaves", "pale_oak_leaves"];
// Leaves falling in a scene, for backdrop-motion.js: many, how many at once at most; from, the undersides of the crowns
// nearby (blocks: those a paint found, in canvas pixels) as [left, bottom, sheet]; and the sheets, tinted, hazed and darkened
// as the crowns are.
function leafMotion(blocks, many, floor, dpr, washes) {
  const sheets = [], at = (x, y) => blocks.some(b => Math.abs(b.left - x) < 1 && Math.abs(b.top - y) < 1);
  const from = blocks.filter(b => b.size === NEAR * dpr && !at(b.left, b.top + b.size)).map(b => {
    const key = leafSheet(b.name, b.tint).join("/");
    if (!sheets.includes(key)) sheets.push(key);
    return [b.left / dpr, (b.top + b.size) / dpr, sheets.indexOf(key)];
  });
  return from.length ? { many, floor, from, washes, sheets: sheets.map(key => {
    const [name, tint] = key.split("/");
    return { picture: ART_FRAMES[name], ...(tint && (tint === "petal" ? { petal: CHERRY_PETAL } : { tint })) };
  }) } : null;
}

// The backdrop canvas for a stage: far hills at FAR and the nearer props at NEAR CSS pixels per block,
// standing on the top edge of the stage's ground strip (GROUND_STRIP pixels tall). It redraws when the
// stage changes size.
const FAR = 8, NEAR = 16, GROUND_STRIP = 48, HAZE = { far: 0.38, near: 0.18 };
function backdropView(canvas) {
  let biome = null, drawnBiome = null;
  // What moves (backdrop-motion.js), on a canvas of its own over the still picture; still itself for those who'd rather
  // nothing moved, and stopped while there's nothing to show or no one to see it.
  const moving = Object.assign(document.createElement("canvas"), { className: "stage-backdrop stage-motion", ariaHidden: "true" });
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motion = null, frame = 0;
  const step = now => {
    frame = 0;
    if (!motion || !moving.clientWidth) return;
    const drawn = drawMotion(moving.getContext("2d"), motion, calm.matches ? 0 : now / 1000, moving.width / motion.width);
    if (!calm.matches || !drawn) frame = requestAnimationFrame(step);
  };
  const move = () => { if (!frame) frame = requestAnimationFrame(step); };
  const setMotion = (next, dpr) => {
    motion = next;
    if (!motion) return moving.remove();
    moving.width = motion.width * dpr;
    moving.height = motion.height * dpr;
    if (!moving.isConnected) canvas.after(moving);
    move();
  };
  calm.addEventListener("change", move);
  const draw = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || !biome) return;
    drawnBiome = biome;
    const dpr = Math.max(1, Math.min(3, Math.round(window.devicePixelRatio || 1)));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    // A biome's night (swamp_night): its own scene if it has one (the plains', its windows lit), else the biome's under NIGHTS.
    const base = biome.replace(/_night$/, ""), t = BIOME_TINTS[base];
    const scene = BACKDROPS[biome] ? BACKDROPS[biome](t) : { ...BACKDROPS[base](t), ...(base === biome ? {} : NIGHTS[base] || NIGHTS.default) };
    const snowy = base === "snowy" || Boolean(scene.snowy), mist = scene.mist || HAZE;
    // The hills' shape: a village biome's by its place in BIOMES, a scene's own seed otherwise.
    const seed = scene.seed || BIOMES.findIndex(b => b.k === base) + 1;
    let roof = null, twinkling = [];
    const haze = getComputedStyle(canvas).getPropertyValue("--haze").trim() || "#bcd5ff";
    const horizon = (h - GROUND_STRIP + 2) * dpr;
    // The whole still picture.
    const paintScene = ctx => {
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
      // distant: things further off than the far hills, at half their size and deeper in the haze, [prop, across (0 to 1),
      // how many of their blocks up] (the end ship hanging in the void).
      if (scene.distant) layer(lc => scene.distant.forEach(([p, at, up]) => drawProp(lc, p, at * canvas.width, horizon - up * (FAR / 2) * dpr, (FAR / 2) * dpr, false)), mist.distant ?? 0.68);
      layer(lc => (scene.wall ? (scene.wall.pattern ? drawPatternWall(lc, scene.wall, canvas.width, horizon, NEAR * dpr) : drawWall(lc, scene.wall, canvas.width, canvas.height, NEAR * dpr, 7),
        // props: things in the wall itself, [prop, left edge, how many blocks up its bottom is] (the mineshaft's corridor).
        (scene.wall.props || []).forEach(([p, at, up]) => drawProp(lc, p, canvas.width / 2 + at * NEAR * dpr, horizon - up * NEAR * dpr, NEAR * dpr, false)))
        : drawHills(lc, scene.hills, canvas.width, horizon, FAR * dpr, snowy, seed)), mist.far);
      if (scene.water && scene.water.sun) drawSunShafts(ctx, canvas.width, canvas.height, (NEAR * dpr) / 2, 11, scene.water.shafts);
      layer(lc => {
        if (scene.ceiling) roof = drawCeiling(lc, scene.ceiling, canvas.width, NEAR * dpr, 5, horizon);
        for (const [p, at] of scene.near) drawProp(lc, p, canvas.width / 2 + at * NEAR * dpr, horizon, NEAR * dpr, snowy);
        // nearDim: the room's dimness on what stands in it too (a little less than on its far wall), so blocks of the
        // wall's own stone in front of it don't stand out lighter.
        if (scene.nearDim) {
          lc.globalCompositeOperation = "source-atop";
          lc.fillStyle = scene.nearDim;
          lc.fillRect(0, 0, canvas.width, canvas.height);
          lc.globalCompositeOperation = "source-over";
        }
      }, mist.near);
      // At night everything drawn so far is darkened and turned blue, and stars and the moon come out behind it.
      if (scene.night) drawNight(ctx, scene.night, canvas.width, horizon, NEAR * dpr, 17, (twinkling = []));
      // What glows in the dark (an open eyeblossom's eyes): drawn again over the night's shade, in a soft glow of its own.
      for (const [p, at] of scene.glows || []) {
        const left = canvas.width / 2 + at * NEAR * dpr, x = left + 0.5 * NEAR * dpr, y = horizon - 0.75 * NEAR * dpr, r = 1.2 * NEAR * dpr;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, "rgba(255, 150, 40, .45)");
        glow.addColorStop(1, "rgba(255, 150, 40, 0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = glow;
        ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
        ctx.globalCompositeOperation = "source-over";
        drawProp(ctx, p, left, horizon, NEAR * dpr, snowy);
      }
      if (scene.water) {
        if (scene.water.sun) drawSurface(ctx, canvas.width, NEAR * dpr, scene.water.surface, scene.water.pads);
        if (scene.water.wash) {
          ctx.fillStyle = scene.water.wash;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      // Warm light round each lantern, up that many blocks if it isn't on the ground.
      for (const light of scene.lights || []) {
        const [at, up = 0.6] = [].concat(light);
        // lightSize: how many blocks a light reaches (6 if not given); lightStrength: how bright at its heart (.34).
        const x = canvas.width / 2 + (at + 0.5) * NEAR * dpr, y = horizon - up * NEAR * dpr, r = (scene.lightSize || 6) * NEAR * dpr;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
        const color = scene.lightColor || "255, 176, 84";
        glow.addColorStop(0, `rgba(${color}, ${scene.lightStrength ?? 0.34})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = glow;
        ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
        ctx.globalCompositeOperation = "source-over";
      }
    };
    // moves: what of the scene moves, on the canvas over it; what's LEFT_OUT isn't in the still picture. also: more stand-ins.
    const moves = scene.moves || [];
    const paint = (ctx, also) => {
      standIns = { ...Object.fromEntries(LEFT_OUT.filter(name => moves.includes(name)).map(name => [name, () => null])), ...also };
      try { paintScene(ctx); } finally { standIns = null; }
    };
    // The crowns leaves fall from, and trial spawners and vaults, found as they're painted.
    const crowns = [], watched = [...(scene.leaves ? LEAF_BLOCKS : []), ...(moves.includes("spawners") ? ["trial_spawner", "mob_spawner"] : []), ...(moves.includes("vaults") ? ["vault"] : []), ...(moves.includes("torches") ? ["torch"] : []), ...(moves.includes("rods") ? ["end_rod"] : [])], found = name => (left, top, size, flows, tint) => {
      if (left > -size && left < canvas.width) crowns.push({ name, left, top, size, tint });
      return textureCanvas(name, tint);
    };
    paint(canvas.getContext("2d"), Object.fromEntries(watched.map(name => [name, found(name)])));
    // Underwater, bubbles rise to the surface (a block deep), or to the roof of a flooded cave.
    const columns = Math.ceil(w / NEAR), bubbles = scene.water && { width: w, floor: h - GROUND_STRIP, roof: Array.from({ length: columns }, (_, c) => (roof ? roof[c] || 0 : 1) * NEAR) };
    // And gas rises out of the sulfur pools.
    const gas = scene.near.flatMap(([p, at]) => (p.gas || []).map(([c, from, to]) => ({ x: w / 2 + (at + c) * NEAR, from: horizon / dpr - from * NEAR, to: horizon / dpr - to * NEAR })));
    // And the nether's lava churns, runs down and spits, and its fires burn.
    const lava = moves.includes("lava") && lavaMotion(paint, canvas.width, canvas.height, dpr), fire = moves.includes("fire") && fireMotion(paint, canvas.width, canvas.height, dpr);
    // And the deep dark's sculk glimmers.
    const sculk = moves.includes("sculk") && sculkMotion(paint, canvas.width, canvas.height, dpr);
    // Blocks that play their frames: ores that glint, lanterns that flicker.
    const played = moves.filter(name => SHEETS[name]), sheets = played.length > 0 && sheetMotion(paint, played, canvas.width, canvas.height, dpr);
    // Water drips off the dripstones' tips (their last block is 11 texels long), and the lights wax and wane.
    const tips = scene.drips && roof ? roof.tips.map(([c, down]) => [(c + 0.5) * NEAR, (down - 1) * NEAR + 11]) : [];
    const drips = tips.length > 0 && { floor: h - GROUND_STRIP, tips: scene.drips.map(at => tips.reduce((best, tip) => (Math.abs(tip[0] - at * w) < Math.abs(best[0] - at * w) ? tip : best))) };
    const light = moves.includes("light") && (scene.lights || []).map(l => [].concat(l)).map(([at, up = 0.6]) => ({ x: w / 2 + (at + 0.5) * NEAR, y: horizon / dpr - up * NEAR, r: (scene.lightSize || 6) * NEAR, color: scene.lightColor || "255, 176, 84", strength: scene.lightStrength ?? 0.34 }));
    // Mist lies among the far trees, behind what stands near (front: those props alone, to keep it off them).
    let mistMoves = false;
    if (moves.includes("mist")) {
      const front = Object.assign(document.createElement("canvas"), { width: canvas.width, height: canvas.height }), fc = front.getContext("2d");
      fc.imageSmoothingEnabled = false;
      for (const [p, at] of scene.near) drawProp(fc, p, canvas.width / 2 + at * NEAR * dpr, horizon, NEAR * dpr, snowy);
      mistMoves = { width: w, floor: h - GROUND_STRIP, front: front.toDataURL() };
    }
    // Snow blows off the far peaks: their crests, a few columns round each top (in CSS pixels).
    let spindrift = false;
    if (moves.includes("spindrift")) {
      const cols = w / FAR, hillAt = hillHeights(scene.hills, seed, cols);
      spindrift = { crests: scene.hills.peaks.filter(([, tall]) => tall >= 19).map(([at]) => {
        const around = Array.from({ length: 7 }, (_, k) => Math.round(at * cols) + k - 3), top = around.reduce((a, b) => (hillAt(b) > hillAt(a) ? b : a));
        return [top - 1, top, top + 1, top + 2].map(c => [(c + 0.5) * FAR, horizon / dpr - hillAt(c) * FAR]);
      }) };
    }
    // Mycelium gives off spores: the ground, and the far hills' tops (in CSS pixels, one for each column).
    let spores = false;
    if (moves.includes("spores")) {
      const cols = Math.ceil(w / FAR), hillAt = hillHeights(scene.hills, seed, w / FAR);
      spores = { width: w, floor: h - GROUND_STRIP, tops: Array.from({ length: cols }, (_, c) => horizon / dpr - hillAt(c) * FAR) };
    }
    // Flames flicker about spawners, and sparks rise round vaults (their left edges and tops).
    const placed = name => crowns.filter(b => b.name === name).map(b => [b.left / dpr, b.top / dpr]);
    const spawners = moves.includes("spawners") && { at: [...placed("trial_spawner"), ...placed("mob_spawner")], flame: ART_FRAMES.flame }, vaults = moves.includes("vaults") && { at: placed("vault") };
    // Torches burn.
    const torches = moves.includes("torches") && { at: placed("torch"), flame: ART_FRAMES.flame };
    // Specks drift off the end rods (a rod is drawn in parts, found once each).
    const rods = moves.includes("rods") && { at: placed("end_rod").filter(([x, y], i, all) => all.findIndex(o => o[0] === x && o[1] === y) === i) };
    // End crystals, [middle, bottom, a block's size] (in CSS pixels): they aren't in the still picture.
    const crystals = scene.crystals && [...crystalsOf(hillSpots(scene.hills, canvas.width, horizon, FAR * dpr, seed), FAR * dpr).map(c => [...c, FAR * dpr]),
      ...crystalsOf(scene.near.map(([p, at]) => [p, canvas.width / 2 + at * NEAR * dpr, horizon]), NEAR * dpr).map(c => [...c, NEAR * dpr])].map(c => c.map(v => v / dpr));
    const swaying = moves.filter(name => SWAYS.includes(name)), sway = swaying.length > 0 && swayMotion(paint, swaying, canvas.width, canvas.height, dpr);
    // Grains of sand hang in the desert's and the badlands' air.
    const sand = moves.includes("sand") && { width: w, floor: h - GROUND_STRIP, color: scene.night ? "night" : scene.sandColor || "day" };
    // And a little snow falls.
    const snow = moves.includes("snow") && { width: w, floor: h - GROUND_STRIP, ...(scene.night && { night: true }) };
    // And leaves fall (leaves: how many, leavesLand: how many blocks over the floor the ground is).
    const leaves = scene.leaves && leafMotion(crowns, scene.leaves, h - GROUND_STRIP - (scene.leavesLand || 0) * NEAR, dpr, [[haze, mist.near], ...(scene.night ? [[scene.night.shade, 1]] : [])]);
    // And stars twinkle at night.
    const stars = twinkling.length > 0 && twinkling.map(([x, y, side, bright]) => [x / dpr, y / dpr, side / dpr, Number(bright.toFixed(2))]);
    setMotion(bubbles || gas.length || lava || fire || snow || stars || leaves || sculk || sheets || drips || light || sand || mistMoves || spindrift || spores || sway || spawners || vaults || torches || crystals || rods ? { width: w, height: h, ...(bubbles && { bubbles }), ...(gas.length && { gas }), ...(lava && { lava }), ...(fire && { fire }), ...(snow && { snow }), ...(stars && { stars }), ...(leaves && { leaves }), ...(sculk && { sculk }), ...(sheets && { sheets }), ...(drips && { drips }), ...(light && { light }), ...(sand && { sand }), ...(mistMoves && { mist: mistMoves }), ...(spindrift && { spindrift }), ...(spores && { spores }), ...(sway && { sway }), ...(spawners && { spawners }), ...(vaults && { vaults }), ...(torches && { torches }), ...(crystals && { crystals }), ...(rods && { rods }) } : null, dpr);
  };
  new ResizeObserver(draw).observe(canvas);
  return {
    // Drawn again only if it's another biome (what moves takes a while to work out), or wasn't drawn yet: a new size has its
    // own redraw.
    show(biomeKey) {
      if (biomeKey === biome && drawnBiome === biome) return;
      biome = biomeKey;
      draw();
    },
    motion: () => motion,
  };
}
