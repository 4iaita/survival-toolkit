/* ---------- Fireworks: the rocket going off ----------
 * A rocket launched from the ground and its stars bursting, worked out tick by tick (20 a second) as the game does: the rocket's
 * flight (FireworkRocketEntity), each star's shape (FireworkParticles.Starter: a ball, a star, a creeper's face, a burst), and its sparks
 * (SparkParticle): slowing, falling a little, fading out over the second half of their life, turning to the fade color, leaving a trail and
 * twinkling. Java's and Bedrock's look the same. The sparks and the flash are the pack's (art/effects/firework_*). The pack hides the
 * rocket as it flies, so only its trail of white sparks shows.
 */
const FW_SPARK_FRAMES = 8;
// The star and creeper outlines, half of each (it's mirrored), in the game's units.
const FW_STAR_OUTLINE = [[0, 1], [0.3455, 0.309], [0.9511, 0.309], [0.3795918367346939, -0.12653061224489795], [0.6122448979591837, -0.8040816326530612], [0, -0.35918367346938773]];
const FW_CREEPER_OUTLINE = [[0, 0.2], [0.2, 0.2], [0.2, 0.6], [0.6, 0.6], [0.6, 0.2], [0.2, 0.2], [0.2, 0], [0.4, 0], [0.4, -0.6], [0.2, -0.6], [0.2, -0.4], [0, -0.4]];

// A show: stars (the rocket's), its flight duration, and a seed for its randomness. step() moves it on a tick; done once it's all gone.
// extent is how far its sparks get from where it bursts, in blocks (up, down, and sideways every way), aim where it bursts and face the angle
// of its first creeper's face, all found by playing it through once with the same seed, so the stage can frame it.
function fireworkShow(stars, flight, seed, measuring = false) {
  const random = rng(seed), gauss = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const pick = list => list[Math.floor(random() * list.length)];
  const rgb = c => hex(FW_COLORS[c]).map(v => v / 255);
  const rocket = { x: 0, y: 0, z: 0, xd: gauss() * 0.001, yd: 0.05, zd: gauss() * 0.001, life: 0, lifetime: 10 * (flight + 1) + Math.floor(random() * 6) + Math.floor(random() * 7) };
  rocket.xo = rocket.x; rocket.yo = rocket.y; rocket.zo = rocket.z;
  const show = { rocket, sparks: [], flashes: [], burst: null, tick: 0, done: false };

  // A spark (SparkParticle): the game's particle size (0.1 to 0.2, three quarters of it), 48 to 59 ticks of life, slowed to 0.91 a tick and
  // pulled down 0.004. launch: one of the rocket's own trail, drawn on its way up.
  const spark = (x, y, z, xd, yd, zd, o = {}) => {
    const p = { x, y, z, xo: x, yo: y, zo: z, xd, yd, zd, age: 0, lifetime: 48 + Math.floor(random() * 12), size: 0.1 * (random() * 0.5 + 0.5) * 2 * 0.75,
      alpha: 0.99, color: [1, 1, 1], fade: null, trail: false, twinkle: false, launch: false, ...o };
    show.sparks.push(p);
    return p;
  };
  // A star's spark, its color picked from the star's colors and its fade from the fade's (Starter.createParticle).
  const starSpark = (s, xd, yd, zd) => spark(show.burst.x, show.burst.y, show.burst.z, xd, yd, zd, {
    color: rgb(pick(s.colors.length ? s.colors : ["white"])), fade: s.fades.length ? rgb(pick(s.fades)) : null, trail: s.trail, twinkle: s.twinkle });
  const ball = (s, speed, size) => {
    for (let i = -size; i <= size; i++) for (let j = -size; j <= size; j++) for (let k = -size; k <= size; k++) {
      const dx = k + (random() - random()) * 0.5, dy = j + (random() - random()) * 0.5, dz = i + (random() - random()) * 0.5;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) / speed + gauss() * 0.05;
      starSpark(s, dx / len, dy / len, dz / len);
      if (i !== -size && i !== size && j !== -size && j !== size) k += size * 2 - 1;
    }
  };
  const outline = (s, speed, coords, flat) => {
    starSpark(s, coords[0][0] * speed, coords[0][1] * speed, 0);
    const angle = random() * Math.PI, gap = flat ? 0.034 : 0.34;
    // The first creeper's face, to turn the view to it.
    if (flat && show.face === undefined) show.face = angle;
    for (let i = 0; i < 3; i++) {
      const a = angle + i * Math.PI * gap;
      let [px, py] = coords[0];
      for (let j = 1; j < coords.length; j++) {
        const [nx, ny] = coords[j];
        for (let t = 0.25; t <= 1; t += 0.25) {
          let ix = (px + (nx - px) * t) * speed;
          const iy = (py + (ny - py) * t) * speed, sz = ix * Math.sin(a);
          ix *= Math.cos(a);
          for (let side = -1; side <= 1; side += 2) starSpark(s, ix * side, iy, sz * side);
        }
        [px, py] = [nx, ny];
      }
    }
  };
  const burst = s => {
    const ox = gauss() * 0.05, oz = gauss() * 0.05, b = show.burst;
    for (let i = 0; i < 70; i++) starSpark(s, b.xd * 0.5 + gauss() * 0.15 + ox, b.yd * 0.5 + random() * 0.5, b.zd * 0.5 + gauss() * 0.15 + oz);
  };
  const explode = s => {
    ({ small_ball: () => ball(s, 0.25, 2), large_ball: () => ball(s, 0.5, 4), star: () => outline(s, 0.5, FW_STAR_OUTLINE, false),
      creeper: () => outline(s, 0.5, FW_CREEPER_OUTLINE, true), burst: () => burst(s) })[s.shape]();
    // The flash: a glow in the star's first color, 4 ticks long.
    show.flashes.push({ age: 0, color: rgb(s.colors[0] || "white") });
  };

  const moveSpark = p => {
    p.xo = p.x; p.yo = p.y; p.zo = p.z;
    if (p.age++ >= p.lifetime) return false;
    p.yd -= 0.004;
    p.x += p.xd; p.y += p.yd; p.z += p.zd;
    p.xd *= 0.91; p.yd *= 0.91; p.zd *= 0.91;
    if (p.age > p.lifetime / 2) {
      p.alpha = 1 - (p.age - p.lifetime / 2) / p.lifetime;
      if (p.fade) p.color = p.color.map((v, i) => v + (p.fade[i] - v) * 0.2);
    }
    // A trail: every other tick in the first half of its life, a still spark where it is, already half way through its own.
    if (p.trail && p.age < p.lifetime / 2 && (p.age + p.lifetime) % 2 === 0) {
      const t = spark(p.x, p.y, p.z, 0, 0, 0, { color: [...p.color], fade: p.fade, twinkle: p.twinkle });
      t.age = Math.floor(t.lifetime / 2);
    }
    return true;
  };

  show.step = () => {
    show.tick++;
    if (rocket.life <= rocket.lifetime) {
      rocket.xo = rocket.x; rocket.yo = rocket.y; rocket.zo = rocket.z;
      rocket.xd *= 1.15; rocket.zd *= 1.15; rocket.yd += 0.04;
      rocket.x += rocket.xd; rocket.y += rocket.yd; rocket.z += rocket.zd;
      rocket.life++;
      spark(rocket.x, rocket.y, rocket.z, gauss() * 0.05, -rocket.yd * 0.5, gauss() * 0.05, { launch: true });
      if (rocket.life > rocket.lifetime) show.burst = { x: rocket.x, y: rocket.y, z: rocket.z, xd: rocket.xd, yd: rocket.yd, zd: rocket.zd, age: 0 };
    } else if (show.burst) {
      // One star every other tick (Starter).
      if (show.burst.age % 2 === 0 && show.burst.age / 2 < stars.length) explode(stars[show.burst.age / 2]);
      show.burst.age++;
    }
    // Trails left this tick join after the others have moved, as the game adds new particles.
    const was = show.sparks;
    show.sparks = [];
    const kept = was.filter(moveSpark);
    show.sparks = kept.concat(show.sparks);
    show.flashes = show.flashes.filter(f => ++f.age < 4);
    show.done = rocket.life > rocket.lifetime && show.burst.age / 2 >= stars.length && !show.sparks.length && !show.flashes.length;
  };
  if (!measuring) {
    const trial = fireworkShow(stars, flight, seed, true), extent = { up: 1, down: 1, side: 1 };
    for (let n = 0; n < 2000 && !trial.done; n++) {
      trial.step();
      const b = trial.burst;
      if (b) for (const p of trial.sparks) if (!p.launch) {
        extent.up = Math.max(extent.up, p.y - b.y);
        extent.down = Math.max(extent.down, b.y - p.y);
        extent.side = Math.max(extent.side, Math.hypot(p.x - b.x, p.z - b.z));
      }
    }
    show.extent = extent;
    show.aim = trial.burst ? { x: trial.burst.x, y: trial.burst.y, z: trial.burst.z } : { x: 0, y: 1, z: 0 };
    show.face = trial.face;
  }
  return show;
}

// The spark frames and the flash, decoded once.
const fwParticleArt = {};
for (const k of ["firework_spark", "firework_flash"]) {
  if (typeof EFFECT_ART === "undefined" || !EFFECT_ART[k]) continue;
  const img = new Image();
  img.onload = () => { fwParticleArt[k] = { w: img.width, h: img.height, px: filePixels(img) }; };
  img.src = EFFECT_ART[k];
}

// Where a show goes on a canvas w × h whose ground is at groundY: where it bursts (bx, by), no lower than half way up so the climb shows (a burst
// goes on up with half the rocket's speed, far at flight 3: its sparks are made smaller to fit over it, not the burst moved down), and px pixels
// a block, no more than most, small enough for all its sparks to fit. A small show bursts about two fifths of the way down.
function fireworkFrame(show, w, h, groundY, most, margin) {
  const { up, down, side } = show.extent, lowest = groundY / 2;
  const px = Math.min(most, (w / 2 - margin) / side, (lowest - margin) / up, (groundY - margin - lowest) / down);
  const by = Math.min(Math.max(margin + up * px, h * 0.42), lowest);
  return { px, bx: w / 2, by };
}

// Draws a show into RGBA pixels (w × h, over what's there), at partial of the way to its next tick. The burst's sparks are drawn true to
// scale (px pixels a block) round where it bursts (at bx, by on the canvas); the rocket's climb to there is squeezed, its drift sideways as
// much as its height, so it starts at the ground (groundY) and keeps its slant. yaw turns it about where it bursts; grow draws each spark
// that much bigger than the game's, or it's too small to see.
function drawFireworkShow(out, w, h, show, { partial, yaw, px, bx, by, groundY, grow }) {
  const sheet = fwParticleArt.firework_spark, flashArt = fwParticleArt.firework_flash;
  if (!sheet) return;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), aim = show.aim, climb = (groundY - by) / Math.max(1, aim.y);
  const place = (x, y, z, launch) => {
    const k = launch ? climb : px;
    return [bx + ((x - aim.x) * cy - (z - aim.z) * sy) * k, by - (y - aim.y) * k];
  };
  const burst = show.burst;
  // Blends a color over the canvas at a pixel, as solid as a.
  const blend = (i, r, g, b, a) => {
    const da = out[i + 3] / 255, oa = a + da * (1 - a);
    if (oa <= 0) return;
    out[i] = (r * a + out[i] * da * (1 - a)) / oa;
    out[i + 1] = (g * a + out[i + 1] * da * (1 - a)) / oa;
    out[i + 2] = (b * a + out[i + 2] * da * (1 - a)) / oa;
    out[i + 3] = oa * 255;
  };
  // The flash: the pack's glow, in the star's color, growing and fading over 4 ticks, 7.1 blocks out at its biggest.
  if (flashArt && burst) for (const f of show.flashes) {
    const t = f.age + partial, half = 7.1 * Math.sin((t - 1) * 0.25 * Math.PI) * px, alpha = 0.6 - (t - 1) * 0.25 * 0.5;
    if (half <= 0 || alpha <= 0) continue;
    const [cx, cyy] = place(burst.x, burst.y, burst.z, false);
    for (let y = Math.max(0, Math.floor(cyy - half)); y < Math.min(h, Math.ceil(cyy + half)); y++)
      for (let x = Math.max(0, Math.floor(cx - half)); x < Math.min(w, Math.ceil(cx + half)); x++) {
        const u = Math.floor((x - cx + half) / (2 * half) * flashArt.w), v = Math.floor((y - cyy + half) / (2 * half) * flashArt.h);
        const n = (v * flashArt.w + u) * 4, a = flashArt.px[n + 3] / 255 * alpha;
        if (a > 0.004) blend((y * w + x) * 4, flashArt.px[n] * f.color[0], flashArt.px[n + 1] * f.color[1], flashArt.px[n + 2] * f.color[2], a);
      }
  }
  for (const p of show.sparks) {
    // Twinkling ones show only every other 3 ticks, after the first third of their life.
    if (p.twinkle && p.age >= p.lifetime / 3 && Math.floor((p.age + p.lifetime) / 3) % 2 !== 0) continue;
    const frame = FW_SPARK_FRAMES - 1 - Math.floor(p.age * (FW_SPARK_FRAMES - 1) / p.lifetime);
    const [x, y] = place(p.xo + (p.x - p.xo) * partial, p.yo + (p.y - p.yo) * partial, p.zo + (p.z - p.zo) * partial, p.launch);
    const side = Math.max(2, Math.round(2 * p.size * px * grow)), x0 = Math.round(x - side / 2), y0 = Math.round(y - side / 2);
    for (let j = 0; j < side; j++) {
      const yy = y0 + j;
      if (yy < 0 || yy >= h) continue;
      const v = Math.floor(j * 8 / side);
      for (let i = 0; i < side; i++) {
        const xx = x0 + i;
        if (xx < 0 || xx >= w) continue;
        const n = (v * sheet.w + frame * 8 + Math.floor(i * 8 / side)) * 4, a = sheet.px[n + 3] / 255 * p.alpha;
        if (a > 0.004) blend((yy * w + xx) * 4, sheet.px[n] * p.color[0], sheet.px[n + 1] * p.color[1], sheet.px[n + 2] * p.color[2], a);
      }
    }
  }
}
