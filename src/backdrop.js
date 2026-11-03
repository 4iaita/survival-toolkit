/* ---------- Biome backdrops ----------
 * Behind the villager scene, a flat view of the biome's countryside built from the pack's block textures:
 * far hills dotted with small trees, then a village building, trees and plants nearer by. Each layer fades
 * toward the horizon's haze, the far one more, so they read as distance. Foliage, grass and water take the
 * biome's tint the way the game colors them, and in snowy biomes everything wears a layer of snow.
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
const largeFern = t => prop(["F", "f"], { F: plantTex("large_fern_top", t.grass), f: plantTex("large_fern_bottom", t.grass) });
const swampOak = t => prop([
  ".LLLLL.",
  "LLLLLLL",
  "LLLLLLL",
  "V..T..V",
  "V..T..V",
  "...T...",
], { L: leavesTex("leaves_oak", t.foliage), T: blockTex("log_oak"), V: plantTex("vine", t.foliage) });

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
const BACKDROPS = {
  plains: t => ({
    hills: { top: grassyTop(t), fill: blockTex("dirt"), base: 3, rise: 4, trees: [[oakTree(t), 0.06], [oakTree(t), 0.3], [oakTree(t), 0.55], [oakTree(t), 0.86]] },
    near: [[house({ roof: "planks_dark_oak", wall: "oak_planks", frame: "log_oak", base: "cobblestone", door: "oak" }), -14],
      [oakTree(t), -7], [plant("poppy"), -1], [wheatFarm, 2], [oakTree(t), 10], [block("hay_side", [".B", "BB"]), 8], [plant("dandelion"), 13]],
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
  for (const [name, tint, [x0, x1] = [0, 16]] of spec.layers) {
    const tex = textureCanvas(name, tint);
    if (tex) ctx.drawImage(tex, x0, from, x1 - x0, to - from, left + (x0 / 16) * size, top + (from / 16) * size, ((x1 - x0) / 16) * size, ((to - from) / 16) * size);
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
function drawHills(ctx, hills, width, horizon, size, snowy, seed) {
  const random = rng(seed), phase = [random() * 6, random() * 6], cols = Math.ceil(width / size) + 1;
  const wave = c => (0.6 * Math.sin(c * 0.29 + phase[0]) + 0.4 * Math.sin(c * 0.71 + phase[1]) + 1) / 2;
  const heightAt = c => {
    const h = hills.base + hills.rise * wave(c);
    return hills.steps ? Math.round(h / hills.steps) * hills.steps : Math.round(h);
  };
  for (let c = 0; c < cols; c++) {
    const h = heightAt(c);
    for (let k = 0; k < h; k++) drawBlock(ctx, k === h - 1 ? hills.top : hills.fill, c * size, horizon - (k + 1) * size, size);
    if (snowy && hills.top.cap !== false) drawSnowCap(ctx, c * size, horizon - h * size, size);
  }
  for (const [p, at] of [...(hills.trees || []), ...(hills.landmarks || [])]) {
    const c = Math.round((at * width) / size), w = p.rows[0].length;
    const ground = Math.min(...Array.from({ length: w }, (_, i) => heightAt(c + i)));
    drawProp(ctx, p, c * size, horizon - ground * size, size, snowy);
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
    const t = BIOME_TINTS[biome], scene = BACKDROPS[biome](t), snowy = biome === "snowy";
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
    layer(lc => drawHills(lc, scene.hills, canvas.width, horizon, FAR * dpr, snowy, BIOMES.findIndex(b => b.k === biome) + 1), HAZE.far);
    layer(lc => {
      for (const [p, at] of scene.near) drawProp(lc, p, canvas.width / 2 + at * NEAR * dpr, horizon, NEAR * dpr, snowy);
    }, HAZE.near);
  };
  new ResizeObserver(draw).observe(canvas);
  return {
    show(biomeKey) {
      biome = biomeKey;
      draw();
    },
  };
}
