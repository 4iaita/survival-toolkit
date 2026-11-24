/* ---------- Particles ----------
 * The pack's particles on the armor stand props' stage (the pack's particles folder, by the name in each comment). A look's
 * emits, [effect, seconds in], go on as long as the prop is there; an act's puffs, [seconds in, effect], are bursts.
 * Everything is in blocks from the stand's feet, y up, as the pack has it. Textures are MOB_SKINS particle_<texture>.
 */
const between = (a, b) => a + Math.random() * (b - a);
const anyWay = () => [between(-1, 1), 1, between(-1, 1)];
// A smooth curve through evenly spaced values, f (0-1) of the way along.
function curveAt(nodes, f) {
  const at = Math.min(0.9999, Math.max(0, f)) * (nodes.length - 1), i = Math.floor(at), m = at - i;
  const [p0, p1, p2, p3] = [-1, 0, 1, 2].map(k => nodes[Math.min(nodes.length - 1, Math.max(0, i + k))]);
  return 0.5 * (2 * p1 + (p2 - p0) * m + (2 * p0 - 5 * p1 + 4 * p2 - p3) * m * m + (3 * p1 - p0 - 3 * p2 + p3) * m * m * m);
}
// What's thrown up and falls back down: the sweets, the confetti, the leaves.
const THROWN = {
  at: () => [0, 10 / 16, 0], way: anyWay, speed: p => 4 + p.r4 * 3, life: () => between(0.8, 1.2), pull: p => [0, -15 - p.age * 10, 0],
  drag: p => 2 - p.r4 * 2, spin: p => (p.r2 > 0.5 ? 500 : -500), spinDrag: 1, lands: { drag: 20, bounce: 0.25, radius: 0.125 },
};
const EARTH = {
  texture: "z", sheet: [16, 16], uv: () => [0, 0, 1, 1], at: () => [0, 0.1, 0], life: () => between(0.75, 1.5), pull: p => [0, -15 - p.age * 10, 0],
  drag: p => 3 - p.r4 * 2, size: p => [(0.5 + p.r3) / 32, (0.5 + p.r3) / 32], lands: { drag: 3, bounce: 0, radius: 0.01 },
  // From #97623A to #7A4D33.
  tint: p => [0x97 - 0x1d * p.r4, 0x62 - 0x15 * p.r4, 0x3a - 7 * p.r4, 1],
};
// Snow falls from this high, drifting any way; its flakes flicker in size as the game draws them.
const snow = (from, life, nodes) => ({
  texture: "snow", sheet: [32, 32], uv: () => [8, 0, 4, 4], at: p => [between(-1.25, 1.25), from(p), between(-1.25, 1.25)], way: () => [0, -1, 0], speed: () => 1,
  life, pull: () => [between(-1, 1), 0, between(-1, 1)], size: p => { const s = between(0.75, 1) * curveAt(nodes, p.age / p.life) / 8; return [s, s]; },
});
// A flame: one at a time, its frames one under another over the 4 seconds it lasts; still, it shows where nothing moves.
const flame = (texture, sheet, frame, frames, y, size) => ({
  texture, sheet, count: () => 1, every: 4, still: true, upright: true, at: () => [0, y, 0], life: () => 4, size: () => size,
  uv: p => [0, Math.min(frames - 1, Math.floor(p.age / p.life * frames)) * frame[1], ...frame],
});
// count: how many at once (every so many seconds), or rate: how many a second, up to most at a time, for so many seconds (else
// all the time). A particle is born at at, going way at speed; pull and drag move it, spin turns it, lands is how it lands.
// size: its half width and height; uv: its part of the sheet; tint: its color and how solid it is; upright: it only turns to the
// reader about its own height.
const PARTICLES = {
  pumpkin_flame: flame("pumpkin_flame", [8, 384], [8, 12], 32, 1.5, [0.25, 0.375]), // cestwf
  candle_flame: flame("candle_flame", [12, 192], [4, 6], 32, 15 / 16 + 0.666 * 3 / 16, [0.666 / 8, 0.666 * 3 / 16]), // hwbujj
  sweets: { ...THROWN, texture: "sweets", sheet: [14, 2], count: () => between(10, 15), uv: p => [Math.floor(p.r4 * 7) * 2, 0, 2, 2], size: () => [1 / 16, 1 / 16] }, // sabqgy
  leaves: { ...THROWN, texture: "leaves", sheet: [8, 4], count: () => between(10, 15), uv: p => [5, Math.floor(p.r4 * 4), 1, 1], // fgaqsv
    size: p => { const s = (1 - Math.min(1, Math.max(0, (p.age / p.life - 0.95) / 0.05))) * 0.375; return [s, s]; } },
  confetti: { ...THROWN, texture: "confetti", sheet: [1, 1], count: () => between(3, 4), at: () => [0, 12 / 16, 0], uv: () => [0, 0, 1, 1], size: () => [1 / 32, 2 / 32], // fivuiy
    tint: p => [...(p.r1 < 0.325 ? [0xc9, 0x19, 0x19] : p.r1 < 0.655 ? [0xff, 0xb2, 0x09] : [0x23, 0xa9, 0x6d]), 1], lands: { drag: 20, bounce: 0.25, radius: 0.05 } },
  straw: { ...THROWN, texture: "straw", sheet: [1, 5], count: () => Math.pow(between(0, 2), 3), at: () => [0, 1.75, 0], way: () => [between(-1, 1), between(-0.25, 1), between(-1, 1)], // hvbtrt
    speed: p => 2 + p.r4 * 3, drag: p => 3 - p.r4 * 2, spin: p => (p.r2 > 0.5 ? 200 : -200), uv: p => [0, Math.floor(p.r3 * 5), 1, 1], size: () => [0.25, 0.25], lands: { drag: 3, bounce: 0, radius: 0.125 } },
  earth: { ...EARTH, count: () => 6, way: () => [between(-0.25, 0.25), 0.5, between(-0.25, 0.25)], speed: () => 5 }, // dsdrzi
  crumbs: { ...EARTH, count: () => 3, way: () => [between(-0.25, 0.25), 0.1, between(-0.25, 0.25)], speed: () => 2 }, // wvqbjj
  dust: { texture: "dust", sheet: [144, 32], count: () => 4, at: () => [0, 0, 0], way: () => [between(-1, 1), 0, between(-1, 1)], speed: () => 2, life: () => between(0.2, 0.6), drag: () => 4, // vtviky
    turned: () => Math.floor(between(1, 5)) * 90, size: () => [0.25, 0.25], uv: p => [Math.min(8, Math.floor(p.age / p.life * 9)) * 16, Math.round(p.r1) * 16, 16, 16], tint: () => [211, 197, 174, 0.451] },
  smoke: { texture: "smoke", sheet: [1, 12], rate: 4, most: 20, at: () => [0, 2, 0], way: () => [0, 1, 0], speed: () => between(0.5, 1), life: () => 5, pull: () => [0, 0.4, 0], // drnrvi
    size: p => { const s = 0.75 * Math.pow(Math.max(0, 1 - p.age / p.life), 0.08); return [s, s]; }, uv: p => [0, Math.floor(p.r2 * 12), 1, 1],
    tint: p => { const f = Math.min(1, Math.max(0, (p.age - 1) / 4)); return [255, 255, 255, 1 - f * f * (3 - 2 * f)]; } },
  globe_snow: { ...snow(() => 55 / 16, p => 0.333 + p.r4 * 0.666 * 4, [0, 0, 0.72, 0.92, 0.98, 0.99, 1, 1, 0.98, 0.9, 0.75, 0.4, 0, 0]), rate: 5, most: 200 }, // ajivwq
  globe_flurry: { ...snow(p => 17 / 16 + 0.333 + p.r4 * 0.666 * 50 / 16, p => 0.222 + p.r4 * 0.555 * 3.5, [1, 1, 1, 1, 1, 1, 1, 1, 0.98, 0.9, 0.75, 0.4, 0, 0]), rate: 50, most: 100, for: 1 }, // mxlnse
};

// A stage's particles: what's emitting, and what's in the air. onLoad hears when a texture has come.
function particleStage(onLoad) {
  let emitters = [], bits = [], textures = {}, floor = 0;
  const born = kind => {
    const def = PARTICLES[kind], p = { kind, def, age: 0, r1: Math.random(), r2: Math.random(), r3: Math.random(), r4: Math.random() };
    p.life = def.life(p);
    p.at = def.at(p);
    const way = def.way ? def.way(p) : NO_MOVE, far = Math.hypot(...way) || 1, speed = def.speed ? def.speed(p) : 0;
    p.v = way.map(v => v / far * speed);
    p.turn = def.turned ? def.turned(p) : 0;
    p.spin = def.spin ? def.spin(p) : 0;
    bits.push(p);
  };
  const load = kind => {
    const name = PARTICLES[kind].texture;
    if (name in textures) return;
    textures[name] = null;
    mobTexture(`particle_${name}`).then(tex => {
      textures[name] = tex;
      onLoad();
    });
  };
  const start = (kind, wait = 0) => {
    load(kind);
    emitters.push({ kind, wait, age: 0, owed: 0 });
  };
  return {
    start,
    // Another prop: its own particles (emits), none of the last one's; still, only those that show where nothing moves. ground:
    // how far over the stand's feet the ground is (it was moved down by that to land).
    reset(emits, { still = false, ground = 0 } = {}) {
      emitters = [];
      bits = [];
      floor = ground;
      for (const [kind, wait = 0] of emits) {
        if (!still) start(kind, wait);
        else if (PARTICLES[kind].still) {
          load(kind);
          born(kind);
        }
      }
    },
    get busy() { return emitters.length > 0 || bits.length > 0; },
    step(dt) {
      for (const e of emitters) {
        if (e.wait > 0) {
          e.wait -= dt;
          continue;
        }
        const def = PARTICLES[e.kind];
        if (def.count) {
          if (e.age === 0) for (let n = Math.round(def.count()); n > 0; n--) born(e.kind);
          e.age += dt;
          if (!def.every) e.done = true;
          else if (e.age >= def.every) e.age = 0;
          continue;
        }
        e.age += dt;
        e.owed += dt * def.rate;
        const there = bits.filter(p => p.kind === e.kind).length;
        for (let room = Math.min(Math.floor(e.owed), def.most - there); room > 0; room--) born(e.kind);
        e.owed %= 1;
        if (def.for && e.age >= def.for) e.done = true;
      }
      emitters = emitters.filter(e => !e.done);
      for (const p of bits) {
        const { def } = p;
        p.age += dt;
        // In steps short enough for how fast the quickest slow down.
        for (let left = dt; left > 1e-6; left -= 0.0125) {
          const h = Math.min(0.0125, left), pull = def.pull ? def.pull(p) : NO_MOVE, drag = def.drag ? Math.max(0, 1 - def.drag(p) * h) : 1;
          for (let k = 0; k < 3; k++) {
            p.v[k] = (p.v[k] + pull[k] * h) * drag;
            p.at[k] += p.v[k] * h;
          }
          p.spin *= Math.max(0, 1 - (def.spinDrag || 0) * h);
          p.turn += p.spin * h;
          if (def.lands && p.at[1] < floor + def.lands.radius && p.v[1] < 0) {
            p.at[1] = floor + def.lands.radius;
            p.v[1] *= -def.lands.bounce;
            const along = Math.hypot(p.v[0], p.v[2]), slow = along ? Math.max(0, along - def.lands.drag * h) / along : 0;
            p.v[0] *= slow;
            p.v[2] *= slow;
            if (!slow) p.spin = 0;
          }
        }
      }
      bits = bits.filter(p => p.age < p.life);
    },
    // Draw them over a scene's pixels (px, as renderScene's), where nothing in it (depth) is nearer. drop: how far down the
    // prop, and so the stand's feet, was moved to land.
    draw(px, depth, { width, height, ...view }, drop) {
      const cam = camera(view), { scale, center, dir, pitch } = { ...cam, pitch: view.pitch };
      const spots = bits.map(p => {
        const spot = [p.at[0] * 16, GROUND - p.at[1] * 16 + drop, p.at[2] * 16];
        return { p, on: cam.project(spot), t: dot(spot.map((v, k) => v - center[k]), dir) + CAMERA_BACK };
      }).sort((a, b) => b.t - a.t);
      for (const { p, on: [gx, gy], t } of spots) {
        const tex = textures[p.def.texture];
        if (!tex) continue;
        const [sx, sy] = p.def.size(p), hw = sx * 16 * scale, hh = sy * 16 * scale * (p.def.upright ? Math.cos(pitch) : 1);
        if (hw <= 0 || hh <= 0) continue;
        const [u, v, uw, vh] = p.def.uv(p), kx = tex.w / p.def.sheet[0], ky = tex.h / p.def.sheet[1], [r, g, b, a] = p.def.tint ? p.def.tint(p) : [255, 255, 255, 1];
        const c = Math.cos(p.turn * RAD), s = Math.sin(p.turn * RAD), bw = Math.abs(hw * c) + Math.abs(hh * s), bh = Math.abs(hw * s) + Math.abs(hh * c);
        const x1 = Math.min(width - 1, Math.ceil(gx + bw)), y1 = Math.min(height - 1, Math.ceil(gy + bh));
        for (let y = Math.max(0, Math.floor(gy - bh)); y <= y1; y++) for (let x = Math.max(0, Math.floor(gx - bw)); x <= x1; x++) {
          const dx = x + 0.5 - gx, dy = y + 0.5 - gy, fx = (dx * c + dy * s) / hw / 2 + 0.5, fy = (dy * c - dx * s) / hh / 2 + 0.5;
          if (fx < 0 || fx >= 1 || fy < 0 || fy >= 1 || depth[y * width + x] < t) continue;
          const k = (Math.min(tex.h - 1, Math.floor((v + fy * vh) * ky)) * tex.w + Math.min(tex.w - 1, Math.floor((u + fx * uw) * kx))) * 4;
          const solid = tex.px[k + 3] / 255 * a;
          if (solid <= 0) continue;
          const j = (y * width + x) * 4, under = (px[j + 3] / 255) * (1 - solid), alpha = solid + under;
          px[j] = (tex.px[k] * r / 255 * solid + px[j] * under) / alpha;
          px[j + 1] = (tex.px[k + 1] * g / 255 * solid + px[j + 1] * under) / alpha;
          px[j + 2] = (tex.px[k + 2] * b / 255 * solid + px[j + 2] * under) / alpha;
          px[j + 3] = alpha * 255;
        }
      }
    },
  };
}
