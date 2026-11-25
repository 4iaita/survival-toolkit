/* ---------- What moves in a backdrop ----------
 * Drawn on a canvas of its own over the still backdrop (see backdropView), from a plain description of what moves there
 * (motion) and the seconds gone by. Nothing here uses the rest of the page: the backgrounds gallery
 * (tools/backdrops/gallery.py) runs this same file over its pictures.
 */
// A number from 0 to 1 for each set of whole numbers, always the same one.
function motionNoise(...ns) {
  let h = 2166136261;
  for (const n of ns) h = Math.imul(h ^ (n + 1), 16777619), h ^= h >>> 13;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
// Columns of little bubbles rising to either side of the mob in the middle, swaying a little, and popping under the surface
// or the cave's roof. In CSS pixels: floor, where they start; roof, how far down the water's top comes in each 16px column.
const BUBBLE_COLUMNS = [0.06, 0.17, 0.27, 0.74, 0.85, 0.95], BUBBLES_EACH = 5, BUBBLE_POP = 0.22;
function drawBubbles(ctx, { width, floor, roof }, seconds, scale) {
  const box = (x, y, w, h) => ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.round(w * scale), Math.round(h * scale));
  const u = 2; // a bubble's own pixel
  BUBBLE_COLUMNS.forEach((at, c) => {
    for (let i = 0; i < BUBBLES_EACH; i++) {
      // Each bubble goes round and round, a little different every time (trip), with a wait at the bottom now and then.
      const speed = 20 + 9 * motionNoise(c, i, 1), time = floor / speed + 1.5;
      const clock = seconds + time * ((i + motionNoise(c, i, 2) * 0.7) / BUBBLES_EACH) + c * 37, trip = Math.floor(clock / time), age = clock - trip * time;
      const roll = n => motionNoise(c, i, trip, n);
      if (roll(3) < 0.22) continue;
      const r = (roll(4) < 0.5 ? 1 : 2) * u, middle = (at + (roll(5) - 0.5) * 0.06) * width;
      const x = Math.round(middle + Math.sin(age * (1 + roll(6)) + roll(7) * 6.3) * 4), y = Math.round(floor - r - u - speed * age);
      const left = middle - 4 - u, right = middle + 4 + 2 * r + u;
      let top = 0;
      for (let k = Math.max(0, Math.floor(left / 16)); k <= Math.floor(right / 16) && k < roof.length; k++) top = Math.max(top, roof[k]);
      // How long ago its top met the roof.
      const popped = (top + r - (floor - r - u - speed * age)) / speed;
      if (popped > BUBBLE_POP) continue;
      ctx.fillStyle = `rgba(225, 248, 255, ${(0.75 * Math.min(1, age / 0.5)).toFixed(3)})`;
      if (popped > 0) {
        // It pops: drops flying apart.
        const d = r + u * (popped < BUBBLE_POP / 2 ? 0 : 1), py = top + r;
        for (const [sx, sy] of [[-1, 0], [1, 0], [0, 1], [-0.75, 0.75], [0.75, 0.75]]) box(x + r - u / 2 + sx * d, py + sy * d, u, u);
        continue;
      }
      box(x, y - r, 2 * r, u);
      box(x, y + r, 2 * r, u);
      box(x - u, y, u, r);
      box(x + 2 * r, y, u, r);
    }
  });
}
// The gas of a sulfur pool: specks of white bubbles rising out of the potent sulfur through the water and fading in the air
// over it. Each vent is a block wide: x, its left edge; from and to, where the gas starts and is gone (in CSS pixels).
function drawGas(ctx, vents, seconds, scale) {
  vents.forEach((vent, v) => {
    const rise = vent.from - vent.to, each = Math.round(rise / 5);
    for (let i = 0; i < each; i++) {
      const speed = 7 + 6 * motionNoise(v, i, 11), time = rise / speed;
      const clock = seconds + time * ((i + motionNoise(v, i, 12) * 0.7) / each) + v * 41, trip = Math.floor(clock / time), f = clock / time - trip;
      const roll = n => motionNoise(v, i, trip, n);
      const size = roll(13) < 0.6 ? 2 : 1, middle = 1 + size / 2 + roll(14) * (14 - size);
      const x = Math.round(vent.x + middle - size / 2 + Math.sin(clock * (1 + roll(15)) + roll(16) * 6.3)), y = Math.round(vent.from - size - f * rise);
      // Comes up out of the sulfur, thins out over the last of its way.
      const alpha = (0.6 + 0.25 * roll(17)) * Math.min(1, f / 0.12, (1 - f) / 0.3);
      ctx.fillStyle = `rgba(216, 226, 206, ${alpha.toFixed(3)})`;
      ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.round(size * scale), Math.round(size * scale));
    }
  });
}
// A motion's pictures (data URLs), loading; kept for as long as the motion is.
const motionPictures = new WeakMap();
function picturesOf(motion, names) {
  if (!motionPictures.has(motion)) motionPictures.set(motion, Object.fromEntries(names.map(n => [n, Object.assign(new Image(), { src: motion[n] })])));
  return motionPictures.get(motion);
}
const loaded = pic => Object.values(pic).every(p => p.complete && p.naturalWidth);
// Moving blocks put into the scene: cells draws them, then the scene's haze and light are put over them and whatever stands in
// front is cut out (see movingCells in backdrop.js), and see-through texels stay so. bare: no haze or light over them. On canvases of its own, then all onto ctx.
const motionLayers = [];
function drawInScene(ctx, { base, gain }, cells, bare = false) {
  const { width, height } = ctx.canvas;
  const [blocks, shape] = [0, 1].map(i => {
    const cv = motionLayers[i] || (motionLayers[i] = document.createElement("canvas")), lc = cv.getContext("2d");
    if (cv.width !== width || cv.height !== height) Object.assign(cv, { width, height });
    lc.globalCompositeOperation = "copy";
    lc.imageSmoothingEnabled = false;
    if (i === 0) {
      lc.clearRect(0, 0, width, height);
      lc.globalCompositeOperation = "source-over";
      cells(lc);
    } else lc.drawImage(motionLayers[0], 0, 0);
    lc.globalAlpha = 1;
    return lc;
  });
  for (const [how, picture] of [...(bare ? [] : [["multiply", gain], ["lighter", base]]), ["destination-in", gain], ["destination-in", shape.canvas]]) {
    blocks.globalCompositeOperation = how;
    blocks.drawImage(picture, 0, 0, width, height);
  }
  ctx.drawImage(blocks.canvas, 0, 0);
}
// Fires, with the pack's own animation, a frame each tick; each fire starts somewhere else in it.
function drawFire(ctx, fire, seconds, scale) {
  const pic = picturesOf(fire, ["base", "gain", "frames"]);
  if (!loaded(pic)) return false;
  const count = pic.frames.naturalHeight / 16, tick = Math.floor(seconds * 20);
  drawInScene(ctx, pic, lc => fire.cells.forEach(({ x, y, size }, i) => {
    lc.drawImage(pic.frames, 0, ((tick + i * 5) % count) * 16, 16, 16, x * scale, y * scale, size * scale, size * scale);
  }));
  return true;
}
// Sculk, its spots glimmering as the pack has it: the same frames in five timings (its variations, [ticks a frame, the frames]),
// each block in one of them by where it is, each frame fading into the next.
// Its spots shine through the cave's dark too: the sheet's bright texels alone, each with a soft edge round it (SCULK_GLOW: how
// strongly they're added).
const SCULK_GLOW = 0.6;
// shine: how bright a texel is (r, g, b), 0 to 1.
function glowSheet(image, shines) {
  const cv = Object.assign(document.createElement("canvas"), { width: image.naturalWidth, height: image.naturalHeight }), lc = cv.getContext("2d");
  lc.drawImage(image, 0, 0);
  const from = lc.getImageData(0, 0, cv.width, cv.height), to = lc.createImageData(cv.width, cv.height);
  // How bright the texel dx, dy away is, 0 to 1, the frame going on round its edges as the blocks do side by side.
  const at = (x, y, frame) => (frame * 16 + ((y + 16) % 16)) * 16 * 4 + ((x + 16) % 16) * 4;
  const shine = i => Math.min(1, Math.max(0, shines(from.data[i], from.data[i + 1], from.data[i + 2])));
  for (let frame = 0; frame < cv.height / 16; frame++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const o = at(x, y, frame);
    for (const [dx, dy, part] of [[0, 0, 1], [1, 0, 0.3], [-1, 0, 0.3], [0, 1, 0.3], [0, -1, 0.3], [1, 1, 0.14], [1, -1, 0.14], [-1, 1, 0.14], [-1, -1, 0.14]]) {
      const i = at(x + dx, y + dy, frame), s = shine(i) * part;
      for (let k = 0; k < 3; k++) to.data[o + k] = Math.min(255, to.data[o + k] + from.data[i + k] * s);
    }
    to.data[o + 3] = 255;
  }
  lc.putImageData(to, 0, 0);
  return cv;
}
const SCULK_TIMINGS = [[20, [0, 1, 2, 3]], [23, [2, 3, 0, 1]], [25, [3, 0, 1, 2]], [27, [1, 2, 3, 0]], [21, [0, 1, 2, 3]]];
function drawSculk(ctx, sculk, seconds, scale) {
  const pic = picturesOf(sculk, ["base", "gain", "frames"]);
  if (!loaded(pic)) return false;
  const now = SCULK_TIMINGS.map(([ticks, frames]) => {
    const at = ((seconds * 20) / ticks) % frames.length, i = Math.floor(at);
    return [[frames[i], 1], [frames[(i + 1) % frames.length], at - i]];
  });
  const blocks = sheet => lc => {
    for (const { x, y, size } of sculk.cells) {
      for (const [frame, alpha] of now[Math.floor(motionNoise(Math.round(x / size), Math.round(y / size), 71) * 5)]) {
        lc.globalAlpha = alpha;
        lc.drawImage(sheet, 0, frame * 16, 16, 16, x * scale, y * scale, size * scale, size * scale);
      }
    }
  };
  drawInScene(ctx, pic, blocks(pic.frames));
  if (!motionPictures.has(pic)) motionPictures.set(pic, glowSheet(pic.frames, (r, g, b) => (Math.max(g, b) - 80) / 120));
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = SCULK_GLOW;
  drawInScene(ctx, pic, blocks(motionPictures.get(pic)), true);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  return true;
}
// What's brighter in each frame of a sheet than in its first: an ore's glint alone.
function brighter(image) {
  const cv = Object.assign(document.createElement("canvas"), { width: image.naturalWidth, height: image.naturalHeight }), lc = cv.getContext("2d");
  lc.drawImage(image, 0, 0);
  const data = lc.getImageData(0, 0, cv.width, cv.height), d = data.data, frame = cv.width * 16 * 4, first = d.slice(0, frame);
  for (let i = 0; i < d.length; i += 4) {
    const more = [0, 1, 2].map(k => Math.max(0, d[i + k] - first[(i % frame) + k]));
    more.forEach((v, k) => { d[i + k] = v; });
    d[i + 3] = d[i + 3] && Math.max(...more) > 0 ? 255 : 0;
  }
  lc.putImageData(data, 0, 0);
  return cv;
}
// Blocks that play their texture's frames (see SHEETS in backdrop.js), and what shines of them.
function drawSheets(ctx, motion, seconds, scale) {
  const names = Object.keys(motion.sheets);
  if (!motionPictures.has(motion)) motionPictures.set(motion, { base: Object.assign(new Image(), { src: motion.base }), gain: Object.assign(new Image(), { src: motion.gain }),
    ...Object.fromEntries(names.map(n => [n, Object.assign(new Image(), { src: motion.sheets[n].picture })])) });
  const pic = motionPictures.get(motion);
  if (!loaded(pic)) return false;
  // An ore's own texels, by how far from gray they are.
  if (!motionPictures.has(pic)) motionPictures.set(pic, { bright: Object.fromEntries(names.map(n => [n, brighter(pic[n])])),
    ores: Object.fromEntries(names.map(n => [n, motion.sheets[n].shine && glowSheet(pic[n], (r, g, b) => (Math.max(r, g, b) - Math.min(r, g, b) - 30) / 110)])) });
  const { bright, ores } = motionPictures.get(pic);
  // The frame a block is at, the next one, and how far into it it has faded.
  const now = ({ name, x, y }) => {
    const { ticks, every, frames = Array.from({ length: pic[name].naturalHeight / 16 }, (_, i) => i) } = motion.sheets[name];
    const spot = motionNoise(Math.round(x), Math.round(y), 81);
    let at = (seconds * 20) / ticks;
    if (every) at = (((seconds + every * spot) % every) * 20) / ticks;
    else at %= frames.length;
    const i = Math.floor(at);
    return [[frames[i] ?? 0, 1], [i < frames.length ? frames[(i + 1) % frames.length] : 0, at - i]];
  };
  // how: which of a sheet's strengths it's drawn at (glow, shine).
  const blocks = (pictures, how) => lc => {
    for (const cell of motion.cells) {
      const { x, y, size, part, name } = cell, texel = (size * scale) / 16;
      const strength = (how ? motion.sheets[name][how] || 0 : 1) * (how === "shine" ? 0.8 + 0.2 * Math.sin(seconds * 1.6 + 6.3 * motionNoise(Math.round(x), Math.round(y), 82)) : 1);
      // Light is added up, so a frame and the next share it out; solid blocks have the next drawn over.
      lc.globalCompositeOperation = how ? "lighter" : "source-over";
      const [[frame0], [frame1, fade]] = now(cell);
      for (const [frame, alpha] of [[frame0, how ? 1 - fade : 1], [frame1, fade]]) {
        lc.globalAlpha = alpha * strength;
        if (!lc.globalAlpha || !pictures[name]) continue;
        const [x0, y0, x1, y1, px, py, w, h] = part || [0, 0, 16, 16, 0, 0, 16, 16];
        lc.drawImage(pictures[name], x0, frame * 16 + y0, x1 - x0, y1 - y0, Math.round(x * scale + px * texel), Math.round(y * scale + py * texel), w * texel, h * texel);
      }
    }
    lc.globalAlpha = 1;
    lc.globalCompositeOperation = "source-over";
  };
  drawInScene(ctx, pic, blocks(pic));
  ctx.globalCompositeOperation = "lighter";
  drawInScene(ctx, pic, blocks(ores, "shine"), true);
  drawInScene(ctx, pic, blocks(bright, "glow"), true);
  ctx.globalCompositeOperation = "source-over";
  return true;
}
// Water dripping off the tips of dripstones, [x, y] each: a drop swells at the tip, falls and splashes on the floor.
function drawDrips(ctx, { tips, floor }, seconds, scale) {
  const box = (x, y, w, h) => ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.round(w * scale), Math.round(h * scale));
  tips.forEach(([x, y], i) => {
    // Neighbors start well apart in time (the golden ratio spreads them evenly).
    const every = 8 + 3 * motionNoise(i, 91), clock = seconds + every * ((i * 0.618) % 1), age = clock % every, swell = 1.8, pull = 330;
    const fall = Math.sqrt((2 * (floor - y)) / pull), t = age - swell;
    ctx.fillStyle = "rgba(110, 180, 240, .9)";
    if (t < 0) {
      const grown = age / swell;
      box(x - 1, y, 2, 1 + Math.floor(grown * 2.99));
    } else if (t < fall) {
      box(x - 1, y + (pull * t * t) / 2, 2, 4);
    } else if (t < fall + 0.4) {
      // Droplets thrown up where it lands.
      const s = (t - fall) / 0.4;
      ctx.fillStyle = `rgba(140, 200, 245, ${(0.9 * (1 - s * s)).toFixed(3)})`;
      for (const [way, high] of [[-7, 5], [-3, 8], [3, 7], [7, 4]]) box(x - 1 + way * s, floor - 2 - high * 4 * s * (1 - s), 2, 2);
    }
  });
}
// A scene's lights (a lantern's, torches'), a little more than the still picture's, waxing and waning, each in its own time.
function drawLight(ctx, lights, seconds, scale) {
  lights.forEach(({ x, y, r, color, strength }, i) => {
    const wave = 0.5 + 0.28 * Math.sin(seconds * 1.96 + i * 2.1) + 0.14 * Math.sin(seconds * 5.1 + i * 4.7) + 0.08 * Math.sin(seconds * 11.3 + i);
    const glow = ctx.createRadialGradient(x * scale, y * scale, 0, x * scale, y * scale, r * scale);
    glow.addColorStop(0, `rgba(${color}, ${(strength * 0.5 * wave).toFixed(3)})`);
    glow.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect((x - r) * scale, (y - r) * scale, 2 * r * scale, 2 * r * scale);
  });
}
// Mist lying low among the far trees: two banks of it sliding past each other, in steps like the blocky clouds. front is what
// stands before it, cut out.
const MIST_BANKS = [{ seed: 111, up: 30, speed: 5, alpha: 0.6 }, { seed: 112, up: 8, speed: -3.2, alpha: 0.7 }], MIST_CELL = [8, 4], MIST_SIZE = [64, 12];
// One bank, a texel a cell: smooth noise that goes on round its sides, thinning to nothing up and down.
const mistBanks = {};
function mistBank(seed) {
  if (mistBanks[seed]) return mistBanks[seed];
  const [cols, rows] = MIST_SIZE, cv = Object.assign(document.createElement("canvas"), { width: cols, height: rows }), lc = cv.getContext("2d");
  const ease = f => f * f * (3 - 2 * f);
  const noise = (x, y, across) => {
    const step = cols / across, gx = Math.floor(x / step), gy = Math.floor(y / 4), fx = ease(x / step - gx), fy = ease(y / 4 - gy);
    const at = (a, b) => motionNoise(a % across, b, seed, across);
    return (at(gx, gy) * (1 - fx) + at(gx + 1, gy) * fx) * (1 - fy) + (at(gx, gy + 1) * (1 - fx) + at(gx + 1, gy + 1) * fx) * fy;
  };
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const thick = Math.sin((Math.PI * (y + 0.5)) / rows), n = 0.7 * noise(x, y, 8) + 0.3 * noise(x, y, 16);
    lc.fillStyle = `rgba(232, 240, 248, ${(Math.round(Math.max(0, Math.min(1, (n - 0.3) * 2)) * thick * 6) / 6).toFixed(3)})`;
    lc.fillRect(x, y, 1, 1);
  }
  return (mistBanks[seed] = cv);
}
function drawMist(ctx, mist, seconds, scale) {
  const pic = picturesOf(mist, ["front"]);
  if (!loaded(pic)) return false;
  const { width, height } = ctx.canvas, [cols, rows] = MIST_SIZE, across = cols * MIST_CELL[0], tall = rows * MIST_CELL[1];
  const cv = motionLayers[2] || (motionLayers[2] = document.createElement("canvas")), lc = cv.getContext("2d");
  if (cv.width !== width || cv.height !== height) Object.assign(cv, { width, height });
  lc.clearRect(0, 0, width, height);
  lc.imageSmoothingEnabled = false;
  for (const { seed, up, speed, alpha } of MIST_BANKS) {
    const moved = (((seconds * speed) % across) + across) % across;
    lc.globalAlpha = alpha;
    for (let x = moved - across; x < mist.width; x += across) lc.drawImage(mistBank(seed), Math.round(x * scale), Math.round((mist.floor - up - tall) * scale), Math.round(across * scale), Math.round(tall * scale));
  }
  lc.globalAlpha = 1;
  lc.globalCompositeOperation = "destination-out";
  lc.drawImage(pic.front, 0, 0, width, height);
  lc.globalCompositeOperation = "source-over";
  ctx.drawImage(cv, 0, 0);
  return true;
}
// Powder snow blowing softly off the far peaks, off each crest now and then, carried to the right, up a little and then down as
// it thins out.
const DRIFT_FLAKES = 26, DRIFT_LIFE = 3.6;
function drawSpindrift(ctx, { crests }, seconds, scale) {
  ctx.fillStyle = "#fff";
  crests.forEach((crest, p) => {
    for (let i = 0; i < DRIFT_FLAKES; i++) {
      const clock = seconds + DRIFT_LIFE * ((i * 0.618) % 1), trip = Math.floor(clock / DRIFT_LIFE), age = clock - trip * DRIFT_LIFE, roll = n => motionNoise(p, i, trip, n);
      // How hard it blows there as this one leaves: a few seconds' breath, then a rest.
      const left = trip * DRIFT_LIFE - DRIFT_LIFE * ((i * 0.618) % 1), breath = Math.sin(left * 0.62 + p * 2.4);
      if (roll(121) > breath * 1.6 + 0.35) continue;
      const [x0, y0] = crest[Math.floor(roll(122) * crest.length)], speed = 12 + 13 * roll(123), f = age / DRIFT_LIFE;
      const x = x0 + (roll(124) - 0.5) * 8 + speed * age, y = y0 - 2 - (10 + 10 * roll(125)) * f * (1 - f) * 2 + 14 * f * f * roll(126) + Math.sin(age * 2 + roll(127) * 6.3) * 1.5;
      ctx.globalAlpha = 0.9 * Math.min(1, age / 0.3) * (1 - f) ** 0.7;
      const side = Math.round((roll(128) < 0.45 ? 2 : 1) * (f < 0.6 ? 1 : 0.6) * scale);
      ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.max(1, side), Math.max(1, side));
    }
  });
  ctx.globalAlpha = 1;
}
// Spores mycelium gives off, as in the game: gray specks rising slowly off the ground, wavering, and fading; smaller and fewer off
// the far hills (tops: how high they are, a column every 8 pixels).
const SPORES = ["#c9c2d0", "#a79fae", "#5f5866"];
function drawSpores(ctx, { width, floor, tops }, seconds, scale) {
  const some = Math.round(width / 15);
  for (let i = 0; i < Math.round(some * 1.5); i++) {
    const near = i < some, life = 3 + 2 * motionNoise(i, 131);
    const clock = seconds + life * ((i * 0.618) % 1), trip = Math.floor(clock / life), age = clock - trip * life, f = age / life, roll = n => motionNoise(i, trip, n);
    const x = roll(132) * width + Math.sin(age * (1 + roll(133)) + roll(134) * 6.3) * (near ? 3 : 1.5);
    const from = near ? floor : tops[Math.min(tops.length - 1, Math.max(0, Math.floor(x / 8)))];
    const y = from - 2 - (near ? 12 + 26 * roll(135) : 6 + 10 * roll(135)) * f;
    ctx.globalAlpha = 0.95 * Math.min(1, f / 0.15, (1 - f) / 0.4);
    ctx.fillStyle = SPORES[Math.floor(roll(136) * SPORES.length)];
    const side = Math.round((near ? 2 : 1) * scale);
    ctx.fillRect(Math.round(x * scale), Math.round(y * scale), side, side);
  }
  ctx.globalAlpha = 1;
}
// Plants swaying, a row of texels at a time, each pushed further the higher it is; a breath of wind runs through them from the left.
function drawSway(ctx, sway, seconds, scale) {
  const names = Object.keys(sway.pictures);
  if (!motionPictures.has(sway)) motionPictures.set(sway, Object.fromEntries([["base", sway.base], ["gain", sway.gain], ...names.map(n => [n, sway.pictures[n]])].map(([n, src]) => [n, Object.assign(new Image(), { src })])));
  const pic = motionPictures.get(sway);
  if (!loaded(pic)) return false;
  drawInScene(ctx, pic, lc => {
    for (const { name, x, y, size } of sway.cells) {
      const texel = (size * scale) / 16, at = x * 0.045;
      const lean = 1.5 * Math.sin(seconds * 1.7 - at) + 0.8 * Math.sin(seconds * 2.9 - at * 1.7 + 1);
      for (let row = 0; row < 16; row++) {
        const push = Math.round(lean * (1 - row / 15) ** 1.4 * texel);
        lc.drawImage(pic[name], 0, row, 16, 1, Math.round(x * scale) + push, Math.round(y * scale + row * texel), size * scale, Math.ceil(texel));
      }
    }
  });
  return true;
}
// Spawners' flames: the pack's flame, a few about each block, rising a little, shrinking and gone; a warm glow under them
// that flickers. at: the blocks' left edges and tops.
function drawSpawners(ctx, spawners, seconds, scale) {
  const pic = picturesOf(spawners, ["flame"]);
  if (!loaded(pic)) return false;
  ctx.imageSmoothingEnabled = false;
  spawners.at.forEach(([x, y], s) => {
    const r = 22 * (0.9 + 0.1 * Math.sin(seconds * 7 + s * 2) * Math.sin(seconds * 3.1)), glow = ctx.createRadialGradient((x + 8) * scale, (y + 4) * scale, 0, (x + 8) * scale, (y + 4) * scale, r * scale);
    glow.addColorStop(0, "rgba(255, 170, 70, .3)");
    glow.addColorStop(1, "rgba(255, 170, 70, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect((x + 8 - r) * scale, (y + 4 - r) * scale, 2 * r * scale, 2 * r * scale);
    for (let i = 0; i < 4; i++) {
      const life = 1.1 + 0.6 * motionNoise(s, i, 141), clock = seconds + life * motionNoise(s, i, 142), trip = Math.floor(clock / life), f = clock / life - trip, roll = n => motionNoise(s, i, trip, n);
      if (roll(143) < 0.25) continue;
      const side = Math.round(8 * (0.75 + 0.25 * roll(144)) * Math.sqrt(1 - f * f) * scale);
      const px = x - 3 + 22 * roll(145), py = y + 9 - 14 * roll(146) - 9 * f;
      ctx.globalAlpha = Math.min(1, f / 0.1);
      if (side > 0) ctx.drawImage(pic.flame, Math.round(px * scale - side / 2), Math.round(py * scale - side / 2), side, side);
    }
  });
  ctx.globalAlpha = 1;
  return true;
}
// Torches' flames: the pack's flame at each one's tip, always there, growing and shrinking and turning over, and now and then a
// small one rising off it. at: the blocks' left edges and tops (a torch's tip is at 8, 6 in its block).
function drawTorches(ctx, torches, seconds, scale) {
  const pic = picturesOf(torches, ["flame"]);
  if (!loaded(pic)) return false;
  ctx.imageSmoothingEnabled = false;
  const flame = (x, bottom, side, over) => {
    ctx.save();
    ctx.translate(Math.round(x * scale), Math.round(bottom * scale));
    if (over) ctx.scale(-1, 1);
    ctx.drawImage(pic.flame, -Math.round((side * scale) / 2), -Math.round(side * scale), Math.round(side * scale), Math.round(side * scale));
    ctx.restore();
  };
  torches.at.forEach(([x, y], i) => {
    const t = seconds + i * 1.7, wave = 0.5 + 0.3 * Math.sin(t * 6.1) + 0.2 * Math.sin(t * 10.7 + 1);
    flame(x + 8, y + 8, 6.5 + 2 * wave, Math.floor(t * 4) % 2 === 1);
    const every = 1.6, trip = Math.floor(t / every), f = t / every - trip, roll = n => motionNoise(i, trip, n);
    if (roll(161) < 0.6) {
      ctx.globalAlpha = 1 - f;
      flame(x + 8 + (roll(162) - 0.5) * 3, y + 4 - 9 * f, 4.5 * (1 - 0.6 * f), roll(163) < 0.5);
      ctx.globalAlpha = 1;
    }
  });
  return true;
}
// End crystals: a small pink cube, bobbing, and the glow round it, stronger and wider and then less, each in its own time.
// crystals: [middle, bottom, a block's size].
function drawCrystals(ctx, crystals, seconds, scale) {
  crystals.forEach(([x, bottom, size], i) => {
    const t = seconds + i * 2.3, pulse = 0.5 + 0.5 * Math.sin(t * 1.9), lift = size * 0.2 * (0.5 + 0.5 * Math.sin(t * 1.25 + i));
    const px = x * scale, py = (bottom - 0.7 * size - lift) * scale, r = size * (2.35 + 0.65 * pulse) * scale;
    ctx.globalCompositeOperation = "lighter";
    const glow = ctx.createRadialGradient(px, py, 0, px, py, r);
    glow.addColorStop(0, `rgba(255, 150, 235, ${0.8 + 0.2 * pulse})`);
    glow.addColorStop(0.3, `rgba(225, 90, 225, ${0.28 + 0.24 * pulse})`);
    glow.addColorStop(1, "rgba(200, 80, 220, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(px - r, py - r, 2 * r, 2 * r);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#f7c9f4";
    ctx.fillRect(Math.round((x - size * 0.28) * scale), Math.round((bottom - size * 0.9 - lift) * scale), Math.round(size * 0.56 * scale), Math.round(size * 0.56 * scale));
  });
}
// End rods' specks, as the game has them: white ones leaving the rod all along it, drifting slowly off any way, growing yellow and
// fading. at: the blocks' left edges and tops (the rod is in their middle).
function drawRods(ctx, { at }, seconds, scale) {
  at.forEach(([x, y], s) => {
    for (let i = 0; i < 14; i++) {
      const life = 2.4 + 1.4 * motionNoise(s, i, 171), clock = seconds + life * ((i * 0.618) % 1), trip = Math.floor(clock / life), f = clock / life - trip, roll = n => motionNoise(s, i, trip, n);
      const way = roll(172) * 6.3, far = (8 + 14 * roll(173)) * (1 - (1 - f) ** 1.6);
      const px = x + 8 + Math.cos(way) * far, py = y + 2 + 11 * roll(174) + Math.sin(way) * far * 0.8 + 5 * f * f;
      ctx.globalAlpha = 0.95 * Math.min(1, f / 0.12, (1 - f) / 0.45);
      ctx.fillStyle = f < 0.4 ? "#ffffff" : f < 0.7 ? "#fff6d8" : "#eed9a4";
      const side = Math.round((roll(175) < 0.5 && f < 0.6 ? 2 : 1.5) * scale);
      ctx.fillRect(Math.round(px * scale), Math.round(py * scale), side, side);
    }
  });
  ctx.globalAlpha = 1;
}
// Vaults' sparks: blue specks rising slowly round the block and over it, twinkling.
function drawVaults(ctx, { at }, seconds, scale) {
  at.forEach(([x, y], s) => {
    for (let i = 0; i < 9; i++) {
      const life = 1.8 + 1.2 * motionNoise(s, i, 151), clock = seconds + life * ((i * 0.618) % 1), trip = Math.floor(clock / life), f = clock / life - trip, roll = n => motionNoise(s, i, trip, n);
      const px = x - 3 + 22 * roll(152) + Math.sin(f * 5 + roll(153) * 6.3) * 1.5, py = y + 14 - 10 * roll(154) - 16 * f, side = Math.round((roll(155) < 0.5 ? 2 : 1.5) * scale);
      ctx.globalAlpha = Math.min(1, f / 0.2, (1 - f) / 0.35) * (0.75 + 0.25 * Math.sin(seconds * 9 + i * 2));
      ctx.fillStyle = roll(156) < 0.5 ? "#b8ecff" : "#58b8f5";
      ctx.fillRect(Math.round(px * scale), Math.round(py * scale), side, side);
    }
  });
  ctx.globalAlpha = 1;
}
// Grains of sand hanging in calm air: small, few, drifting slowly and bobbing, each coming and going; more of them near the ground.
// Its colors: at night darker, but still light enough to see on the dark hills; the badlands' red.
const SAND = { day: ["#fff4d2", "#d9b25f", "#c39748"], night: ["#cfc5a8", "#b4955a", "#a5834a"], red: ["#ffd8a6", "#e0802f", "#a24c18"] }, SAND_ROUND = 11;
function drawSand(ctx, { width, floor, color }, seconds, scale) {
  const colors = SAND[color];
  for (let i = 0; i < Math.round(width / 16); i++) {
    const clock = seconds + SAND_ROUND * ((i * 0.618) % 1), trip = Math.floor(clock / SAND_ROUND), age = clock - trip * SAND_ROUND, roll = n => motionNoise(i, trip, n);
    const x = roll(101) * (width + 60) - 60 + age * (6 + 8 * roll(102)), up = roll(103);
    const y = floor - 5 - up * up * 130 + Math.sin(age * (0.6 + 0.5 * roll(104)) + roll(105) * 6.3) * 4 - age * 0.8;
    ctx.globalAlpha = 0.85 * Math.min(1, age / 2, (SAND_ROUND - age) / 2);
    ctx.fillStyle = colors[Math.floor(roll(106) * colors.length)];
    const side = Math.round((roll(107) < 0.4 ? 1 : 2) * scale);
    ctx.fillRect(Math.round(x * scale), Math.round(y * scale), side, side);
  }
  ctx.globalAlpha = 1;
}
// Lava, with the pack's own animations: still lava changes frame every 28 ticks and flowing lava every 20, each frame fading
// into the next. A flowing frame is the one before it a texel further down; that's taken out, and the whole texture run
// down instead, steadily and a little faster (LAVA_FALL texels a second), so it can be seen falling. False while its
// pictures load.
const LAVA_FALL = 4, LAVA_STILL = 28 / 20, LAVA_FLOW = 1;
function drawLava(ctx, lava, seconds, scale) {
  const pic = picturesOf(lava, ["base", "gain", "still", "flow", "pop"]);
  if (!loaded(pic)) return false;
  const now = (count, each) => {
    const at = (seconds / each) % count, i = Math.floor(at);
    return [[i, 1], [(i + 1) % count, at - i]];
  };
  const still = now(pic.still.naturalHeight / 16, LAVA_STILL), flow = now(pic.flow.naturalHeight / 32, LAVA_FLOW);
  drawInScene(ctx, pic, lc => { for (const { x, y, size, flows } of lava.cells) {
    const step = (size * scale) / 16, fallen = Math.round(seconds * LAVA_FALL * step) / step;
    for (const [i, alpha] of flows ? flow : still) {
      if (!alpha) continue;
      lc.globalAlpha = alpha;
      // A flowing frame repeats every 16 texels, in a picture 32 square.
      if (flows) lc.drawImage(pic.flow, 0, i * 32 + ((((i - fallen) % 16) + 16) % 16), 16, 16, x * scale, y * scale, size * scale, size * scale);
      else lc.drawImage(pic.still, 0, i * 16, 16, 16, x * scale, y * scale, size * scale, size * scale);
    }
  } });
  ctx.imageSmoothingEnabled = false;
  // Sparks spat out of the surface now and then, the pack's particle: up, over and back down, shrinking as they go.
  lava.pops.forEach(({ x, y, size }, c) => {
    const near = size >= 16, every = near ? 5 : 20, unit = size / 16;
    const clock = seconds + every * motionNoise(c, 21), trip = Math.floor(clock / every), roll = n => motionNoise(c, trip, n);
    const rise = (9 + 17 * roll(22)) * unit, pull = 75 * unit, flight = 2 * Math.sqrt((2 * rise) / pull);
    const age = clock - trip * every - roll(23) * (every - flight);
    if (age < 0 || age > flight) return;
    const f = age / flight, across = Math.round(8 * unit * (0.75 + 0.5 * roll(26)) * Math.sqrt(1 - f * f) * scale);
    const px = x + (0.2 + 0.6 * roll(24)) * size + (roll(25) - 0.5) * 16 * unit * age, py = y - rise * 4 * f * (1 - f);
    ctx.globalAlpha = near ? 1 : 0.9;
    if (across > 0) ctx.drawImage(pic.pop, Math.round(px * scale - across / 2), Math.round(py * scale - across / 2), across, across);
  });
  ctx.globalAlpha = 1;
  return true;
}
// A light snowfall: the pack's three flakes (its weather texture), two CSS pixels a texel, the bigger ones near and the specks
// further off, slower and fainter; drifting a little as they fall and gone at the ground (floor). Bluish at night.
const FLAKES = [[[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], [[1, 1]]];
function drawSnow(ctx, { width, floor, night }, seconds, scale) {
  for (let i = 0; i < Math.round(width / 16); i++) {
    const near = i % 2 === 0, speed = (near ? 20 : 13) + 5 * motionNoise(i, 31), rise = floor + 6, time = rise / speed;
    const clock = seconds + time * motionNoise(i, 32), trip = Math.floor(clock / time), age = clock - trip * time;
    const roll = n => motionNoise(i, trip, n);
    const y = speed * age - 4, x = roll(33) * (width + 40) - 4 * age + Math.sin(age * (0.7 + 0.6 * roll(34)) + roll(35) * 6.3) * (near ? 6 : 4);
    ctx.fillStyle = `rgba(${night ? "196, 208, 236" : "255, 255, 255"}, ${((near ? 0.95 : 0.75) * Math.min(1, Math.max(0, (floor - y) / 10))).toFixed(3)})`;
    const flake = FLAKES[near ? (roll(36) < 0.5 ? 0 : 1) : 2], left = Math.round(x * scale), top = Math.round(y * scale), px = Math.round((near ? 2 : 1.5) * scale);
    for (const [a, b] of flake) ctx.fillRect(left + a * px, top + b * px, px, px);
  }
}
// Stars twinkling at night, [x, y, how big, how bright]: each in a time of its own, dimming and coming back, most of them a
// little and a few nearly out, then shining steadily a while.
function drawStars(ctx, stars, seconds, scale) {
  stars.forEach(([x, y, side, bright], i) => {
    const time = 2.5 + 4 * motionNoise(i, 41), deep = motionNoise(i, 42) < 0.3 ? 0.9 : 0.55;
    const dip = Math.max(0, Math.sin((2 * Math.PI * seconds) / time)) ** 2;
    ctx.fillStyle = `rgba(235, 240, 255, ${(bright * (1 - deep * dip)).toFixed(3)})`;
    ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.round(side * scale), Math.round(side * scale));
  });
}
// A leaf sheet's picture, tinted and washed over (the haze, the night) once it has loaded.
function leafPicture(sheet, washes, image) {
  const cv = Object.assign(document.createElement("canvas"), { width: image.naturalWidth, height: image.naturalHeight }), lc = cv.getContext("2d");
  lc.drawImage(image, 0, 0);
  const wash = (how, color, alpha) => {
    lc.globalCompositeOperation = how;
    lc.globalAlpha = alpha;
    lc.fillStyle = color;
    lc.fillRect(0, 0, cv.width, cv.height);
  };
  if (sheet.tint) {
    wash("multiply", sheet.tint, 1);
    lc.globalCompositeOperation = "destination-in";
    lc.drawImage(image, 0, 0);
  }
  // petal: mostly one color, only a little of the leaf's shades left (the sheet is too gray and blue for cherry pink).
  if (sheet.petal) wash("source-atop", sheet.petal, 0.72);
  for (const [color, alpha] of washes) wash("source-atop", color, alpha);
  return cv;
}
// Leaves falling from the crowns: slowly, faster and swaying wider as they go (as the pack's particles do), turning over a
// quarter at a time; they lie on the ground a moment and fade. Each goes round and round, from another crown every time.
const LEAF_ROUND = 15, LEAF_LIES = 2.2;
function drawLeaves(ctx, leaves, seconds, scale) {
  const { many, floor, from, sheets, washes } = leaves;
  if (!motionPictures.has(leaves)) motionPictures.set(leaves, sheets.map(s => Object.assign(new Image(), { src: s.picture })));
  const images = motionPictures.get(leaves);
  if (images.some(p => p instanceof Image)) {
    if (!loaded(images)) return false;
    images.forEach((p, i) => { images[i] = leafPicture(sheets[i], washes, p); });
  }
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < many; i++) {
    const clock = seconds + LEAF_ROUND * (i + motionNoise(i, 51)) / many, trip = Math.floor(clock / LEAF_ROUND), roll = n => motionNoise(i, trip, n);
    const [left, top, sheet] = from[Math.floor(roll(52) * from.length)], picture = images[sheet];
    // Pulled down at 0.3 blocks a second, from a slow start: how long it takes to the ground.
    const pull = 2.4, start = 4, drop = Math.max(0, floor - 3 - top), fall = (Math.sqrt(start * start + 4 * pull * drop) - start) / (2 * pull);
    const age = clock - trip * LEAF_ROUND - roll(53) * Math.max(0, LEAF_ROUND - fall - LEAF_LIES);
    if (age < 0 || age > fall + LEAF_LIES) continue;
    const t = Math.min(age, fall), way = roll(54) < 0.5 ? -1 : 1, sway = Math.min(14, 2 + 2 * t);
    const x = left + (0.1 + 0.8 * roll(55)) * 16 + way * 2.5 * t + sway * (Math.sin(t * (1 + 0.7 * roll(56)) + roll(57) * 6.3) - Math.sin(roll(57) * 6.3));
    const y = top + start * t + pull * t * t;
    const turn = Math.floor(roll(58) * 4 + t * (0.5 + 0.6 * roll(59))) % 4;
    ctx.globalAlpha = Math.min(1, age / 0.4, (fall + LEAF_LIES - age) / 0.8);
    ctx.setTransform(1, 0, 0, 1, Math.round(x * scale), Math.round(y * scale));
    ctx.rotate((turn * Math.PI) / 2);
    // One of the sheet's leaves; the poplars', which fill their whole 7 texels, a little smaller.
    const rows = picture.height / 7, side = 7 * Math.max(1, Math.floor((rows > 1 ? 1.5 : 1) * scale));
    ctx.drawImage(picture, Math.floor(roll(60) * (picture.width / 7)) * 7, Math.floor(roll(61) * rows) * 7, 7, 7, -side / 2, -side / 2, side, side);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  return true;
}
// A backdrop's motion at a moment; scale is the canvas's pixels for each CSS pixel. False if it's still to load.
function drawMotion(ctx, motion, seconds, scale) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let drawn = !motion.lava || drawLava(ctx, motion.lava, seconds, scale);
  if (motion.sculk) drawn = drawSculk(ctx, motion.sculk, seconds, scale) && drawn;
  if (motion.sheets) drawn = drawSheets(ctx, motion.sheets, seconds, scale) && drawn;
  if (motion.light) drawLight(ctx, motion.light, seconds, scale);
  if (motion.drips) drawDrips(ctx, motion.drips, seconds, scale);
  if (motion.mist) drawn = drawMist(ctx, motion.mist, seconds, scale) && drawn;
  if (motion.sway) drawn = drawSway(ctx, motion.sway, seconds, scale) && drawn;
  if (motion.spawners) drawn = drawSpawners(ctx, motion.spawners, seconds, scale) && drawn;
  if (motion.torches) drawn = drawTorches(ctx, motion.torches, seconds, scale) && drawn;
  if (motion.crystals) drawCrystals(ctx, motion.crystals, seconds, scale);
  if (motion.rods) drawRods(ctx, motion.rods, seconds, scale);
  if (motion.vaults) drawVaults(ctx, motion.vaults, seconds, scale);
  if (motion.leaves) drawn = drawLeaves(ctx, motion.leaves, seconds, scale) && drawn;
  if (motion.fire) drawn = drawFire(ctx, motion.fire, seconds, scale) && drawn;
  if (motion.bubbles) drawBubbles(ctx, motion.bubbles, seconds, scale);
  if (motion.stars) drawStars(ctx, motion.stars, seconds, scale);
  if (motion.spindrift) drawSpindrift(ctx, motion.spindrift, seconds, scale);
  if (motion.spores) drawSpores(ctx, motion.spores, seconds, scale);
  if (motion.sand) drawSand(ctx, motion.sand, seconds, scale);
  if (motion.snow) drawSnow(ctx, motion.snow, seconds, scale);
  if (motion.gas) drawGas(ctx, motion.gas, seconds, scale);
  return drawn;
}
