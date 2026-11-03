/* ---------- Villager model ----------
 * The texture pack's villagers, drawn as the 3D model the game uses. A villager's skin is three layers on the
 * same 64×64 layout: a base skin, the outfit of its biome and the outfit of its profession. build.py embeds
 * them as SKINS (art/villager/, copied from the pack by import_textures.py).
 */
// skins: where the biome's villagers start among the pack's 12 base skins (darkest first).
const BIOMES = [
  { k: "plains", n: "Plains", ground: "grass_block_top", skins: 4 },
  { k: "desert", n: "Desert", ground: "sand", skins: 0 },
  { k: "savanna", n: "Savanna", ground: "coarse_dirt", skins: 0 },
  { k: "snowy", n: "Snowy", ground: "snow", skins: 6 },
  { k: "taiga", n: "Taiga", ground: "podzol_top", skins: 6 },
  { k: "jungle", n: "Jungle", ground: "grass_block_top", skins: 4 },
  { k: "swamp", n: "Swamp", ground: "mud", skins: 4 },
];

// The pack picks a villager's base skin as its biome's start plus the game's random skin id (0-5).
// Each profession keeps one skin id here, so a villager looks the same every visit but not like the rest.
const SKIN_ID = {
  armorer: 2, butcher: 4, cartographer: 1, cleric: 0, farmer: 3, fisherman: 5, fletcher: 2,
  leatherworker: 1, librarian: 4, mason: 3, shepherd: 5, toolsmith: 0, weaponsmith: 3,
};
const baseSkin = (biome, profession) => `skin_${BIOMES.find(b => b.k === biome).skins + (SKIN_ID[profession] || 0) + 1}`;

// The pack's villager model (geometry.oreville_ans.jneofov), in its own units: y up with the feet at 0,
// the villager facing -z. The face has parts of its own: eye whites behind holes in the head, pupils,
// eyelids and a brow in front of them.
// A cube is origin, size and texture offset; inflate grows it, mirror flips its texture, rotation
// (degrees) turns it about a pivot and position then moves it.
// The arms come in hanging down; the pack's idle animations fold them in front of the chest (ARMS_FOLDED).
// To blink, the pack stretches the eyelids (lid) down from their top edge to 2.02 times their height.
const ARMS_FOLDED = { rotation: [-42.97, 0, 0], pivot: [0, 22, 0], position: [0, -1, -1] };
const VILLAGER_CUBES = [
  { origin: [-4, 24, -4], size: [8, 10, 8], uv: [0, 0] },
  { origin: [-3.75, 26.75, -3.85], size: [3, 2.5, 0], uv: [0, 0] },
  { origin: [0.75, 26.75, -3.85], size: [3, 2.5, 0], uv: [0, 2] },
  { origin: [-2.025, 26.975, -3.975], size: [1.05, 1.05, 0], uv: [0, 4] },
  { origin: [0.975, 26.975, -3.975], size: [1.05, 1.05, 0], uv: [0, 5] },
  { origin: [-3.0375, 28, -4], size: [2.05, 1.025, 0], uv: [0, 6], lid: true },
  { origin: [0.975, 28, -4], size: [2.05, 1.025, 0], uv: [0, 7], lid: true },
  { origin: [-3.05, 28, -4.15], size: [6.1, 1, 1], uv: [24, 6] },
  { origin: [-1, 23, -6], size: [2, 4, 2], uv: [24, 0] },
  { origin: [-4, 24, -4], size: [8, 10, 8], uv: [32, 0], inflate: 0.5 },
  { origin: [-8, 16, -6], size: [16, 16, 1], uv: [30, 47], inflate: 0.1, rotation: [-90, 0, 0], pivot: [0, 24, 0] },
  { origin: [-4, 12, -3], size: [8, 12, 6], uv: [16, 20] },
  { origin: [-4, 6, -3], size: [8, 18, 6], uv: [0, 38], inflate: 0.5 },
  { origin: [-4, 16, -2], size: [8, 4, 4], uv: [40, 38], ...ARMS_FOLDED },
  { origin: [-8, 16, -2], size: [4, 8, 4], uv: [44, 22], ...ARMS_FOLDED },
  { origin: [4, 16, -2], size: [4, 8, 4], uv: [44, 22], mirror: true, ...ARMS_FOLDED },
  { origin: [0, 0, -2], size: [4, 12, 4], uv: [0, 22], mirror: true, rotation: [0, -5, -1], pivot: [2, 12, 0] },
  { origin: [-4, 0, -2], size: [4, 12, 4], uv: [0, 22], rotation: [0, 5, 0], pivot: [-2, 12, 0] },
];

// The renderer works with y pointing down from the neck, as the texture layout does: flip the cubes over.
// Flipping y turns the sense of Y rotations around; X keeps the pack's sign (the hat brim lies flat).
const flipY = ([x, y, z]) => [x, -y, z];
const RAD = Math.PI / 180;
const VILLAGER_MODEL = VILLAGER_CUBES.map(c => ({
  box: [c.origin[0], 24 - c.origin[1] - c.size[1], c.origin[2], ...c.size],
  uv: c.uv, grow: c.inflate, mirror: c.mirror, lid: c.lid,
  bone: c.rotation && {
    pivot: [c.pivot[0], 24 - c.pivot[1], c.pivot[2]], move: flipY(c.position || [0, 0, 0]),
    angles: [c.rotation[0] * RAD, -c.rotation[1] * RAD, c.rotation[2] * RAD],
  },
}));

// Turn [x, y, z] by [x, y, z] angles: about Z, then Y, then X. unturn undoes it.
const rotX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const rotY = ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, z * Math.cos(a) - x * Math.sin(a)];
const rotZ = ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
const turn = (p, [ax, ay, az]) => rotX(rotY(rotZ(p, az), ay), ax);
const unturn = (p, [ax, ay, az]) => rotZ(rotY(rotX(p, -ax), -ay), -az);

// Where a box face lands on the skin, as the texel's byte offset, from the face's own 0-1 position
// (fx, fy, fz) in the box. The usual box layout: top and bottom in the first row, then right, front,
// left and back.
function skinTexel([u, v], [w, h, d], face, fx, fy, fz) {
  const at = (s, t) => ((t | 0) * 64 + (s | 0)) * 4;
  switch (face) {
    case "front": return at(u + d + fx * w, v + d + fy * h);
    case "back": return at(u + 2 * d + w + (1 - fx) * w, v + d + fy * h);
    case "right": return at(u + (1 - fz) * d, v + d + fy * h);
    case "left": return at(u + d + w + fz * d, v + d + fy * h);
    case "top": return at(u + d + fx * w, v + (1 - fz) * d);
    default: return at(u + d + w + fx * w, v + (1 - fz) * d);
  }
}
const FACES = [["right", "left"], ["top", "bottom"], ["front", "back"]];

// Ray-cast the model into RGBA pixels: an orthographic camera turned by yaw (radians) and looking down
// by pitch, scale pixels per game unit, with the model point center at anchor (a fraction of the height).
// Each pixel takes the nearest face whose texel isn't see-through, lit from the camera's upper left.
const LID_TOP = 24 - 29, BLINK = 2.02;
const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
function villagerRender(skin, { width, height, scale, yaw, pitch = 0.2, center = [0, 7, 0], anchor = 0.52, blink = false }) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const right = [cy, 0, -sy], down = [-sp * sy, cp, -sp * cy], dir = [cp * sy, sp, cp * cy];
  const toWorld = ([a, b, c]) => [0, 1, 2].map(i => right[i] * a + down[i] * b + dir[i] * c);
  const light = toWorld([-0.45, -1, -0.75].map(v => v / Math.hypot(0.45, 1, 0.75)));
  const start = center.map((v, i) => v - dir[i] * 60);
  // The camera is orthographic, so in each box's own frame every ray has the same direction and a start
  // that moves by stepX and stepY per pixel. Faces keep one light level each: shade[axis][side].
  const boxes = VILLAGER_MODEL.map(m => {
    const [x, y, z, w, h, d] = m.box, g = m.grow || 0;
    const lo = [x - g, y - g, z - g], hi = [x + w + g, y + h + g, z + d + g];
    if (blink && m.lid) [lo[1], hi[1]] = [lo[1], hi[1]].map(v => LID_TOP + (v - LID_TOP) * BLINK);
    let o = start, stepX = right, stepY = down, r = dir;
    if (m.bone) {
      const { pivot, move, angles } = m.bone;
      o = unturn(start.map((v, i) => v - pivot[i] - move[i]), angles).map((v, i) => v + pivot[i]);
      [stepX, stepY, r] = [right, down, dir].map(v => unturn(v, angles));
    }
    const shade = [0, 1, 2].map(axis => [-1, 1].map(side => {
      let n = [0, 0, 0];
      n[axis] = side;
      if (m.bone) n = turn(n, m.bone.angles);
      return 0.5 + 0.5 * Math.max(0, dot(n, light));
    }));
    // Where the box lands on screen, in game units from the center, so pixels outside it skip the box.
    const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(c => {
      let p = [c & 1 ? hi[0] : lo[0], c & 2 ? hi[1] : lo[1], c & 4 ? hi[2] : lo[2]];
      if (m.bone) p = turn(p.map((v, i) => v - m.bone.pivot[i]), m.bone.angles).map((v, i) => v + m.bone.pivot[i] + m.bone.move[i]);
      const rel = p.map((v, i) => v - center[i]);
      return [dot(rel, right), dot(rel, down)];
    });
    const span = k => [Math.min(...corners.map(c => c[k])), Math.max(...corners.map(c => c[k]))];
    return { ...m, lo, hi, size: [w, h, d], o, stepX, stepY, r, shade, across: span(0), along: span(1) };
  });
  const out = new Uint8ClampedArray(width * height * 4), o = [0, 0, 0];
  for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) {
    const a = (px + 0.5 - width / 2) / scale, b = (py + 0.5 - height * anchor) / scale;
    let bestT = Infinity, bestK = -1, bestShade = 0;
    for (const m of boxes) {
      if (a < m.across[0] || a > m.across[1] || b < m.along[0] || b > m.along[1]) continue;
      const r = m.r;
      for (let i = 0; i < 3; i++) o[i] = m.o[i] + m.stepX[i] * a + m.stepY[i] * b;
      let near = -Infinity, far = Infinity, axis = 0;
      for (let i = 0; i < 3; i++) {
        if (Math.abs(r[i]) < 1e-9) {
          if (o[i] < m.lo[i] || o[i] > m.hi[i]) far = -Infinity;
          continue;
        }
        const t1 = (m.lo[i] - o[i]) / r[i], t2 = (m.hi[i] - o[i]) / r[i];
        if (Math.min(t1, t2) > near) { near = Math.min(t1, t2); axis = i; }
        far = Math.min(far, Math.max(t1, t2));
      }
      if (near > far || near >= bestT) continue;
      const frac = i => (m.hi[i] > m.lo[i] ? Math.min(0.9999, Math.max(0, (o[i] + r[i] * near - m.lo[i]) / (m.hi[i] - m.lo[i]))) : 0);
      let fx = frac(0), face = FACES[axis][r[axis] > 0 ? 0 : 1];
      if (m.mirror) {
        fx = 0.9999 - fx;
        if (axis === 0) face = FACES[0][r[0] > 0 ? 1 : 0];
      }
      const k = skinTexel(m.uv, m.size, face, fx, frac(1), frac(2));
      if (skin[k + 3] < 128) continue;
      bestT = near;
      bestK = k;
      bestShade = m.shade[axis][r[axis] > 0 ? 0 : 1];
    }
    if (bestK < 0) continue;
    const j = (py * width + px) * 4;
    for (let c = 0; c < 3; c++) out[j + c] = skin[bestK + c] * bestShade;
    out[j + 3] = 255;
  }
  return out;
}

// A head-and-shoulders view of a villager, size pixels square.
const villagerBust = (skin, size, yaw = 0.45) =>
  villagerRender(skin, { width: size, height: size, scale: size / 17.5, yaw, pitch: 0.12, center: [0, -4.4, 0], anchor: 0.5 });

// Decoded skin layers (RGBA, 64×64) by SKINS name; null when the pack lacks one.
const skinLayers = {};
function skinLayer(name) {
  if (!skinLayers[name]) skinLayers[name] = new Promise(done => {
    if (typeof SKINS === "undefined" || !SKINS[name]) return done(null);
    const img = new Image();
    img.onload = () => {
      const ctx = Object.assign(document.createElement("canvas"), { width: 64, height: 64 }).getContext("2d");
      ctx.drawImage(img, 0, 0);
      done(ctx.getImageData(0, 0, 64, 64).data);
    };
    img.onerror = () => done(null);
    img.src = SKINS[name];
  });
  return skinLayers[name];
}

// A villager's skin: its base skin with the biome and profession outfits on top. null without a base skin.
async function villagerSkin(biome, profession) {
  const names = [baseSkin(biome, profession), `biome_${biome}`, `profession_${profession}`];
  const [base, ...outfits] = await Promise.all(names.map(skinLayer));
  if (!base) return null;
  const out = new Uint8ClampedArray(base);
  for (const layer of outfits) if (layer) {
    for (let i = 0; i < out.length; i += 4) if (layer[i + 3] >= 128) out.set(layer.subarray(i, i + 4), i);
  }
  return out;
}

// RGBA pixels as a PNG data URL.
function rgbaURL(px, width, height) {
  const cv = Object.assign(document.createElement("canvas"), { width, height });
  cv.getContext("2d").putImageData(new ImageData(px, width, height), 0, 0);
  return cv.toDataURL();
}

// A canvas showing one villager, turned by dragging sideways or with the arrow keys; onTurn hears the
// first turn. Its CSS size is VIEW_W × VIEW_H at VIEW_SCALE pixels per game unit. It draws at the screen's
// pixel density, but at 1× while dragging so turning stays smooth. Every few seconds the villager blinks,
// unless the reader asks for less motion.
const VIEW_W = 140, VIEW_H = 200, VIEW_SCALE = 5;
function villagerViewer(canvas, { onTurn = () => {} } = {}) {
  const ctx = canvas.getContext("2d");
  let skin = null, yaw = 0.55, wanted = "", frame = 0, dragX = null, blink = false;
  const draw = () => {
    frame = 0;
    const dpr = dragX !== null ? 1 : Math.max(1, Math.min(3, Math.round(window.devicePixelRatio || 1)));
    canvas.width = VIEW_W * dpr;
    canvas.height = VIEW_H * dpr;
    if (!skin) return;
    const px = villagerRender(skin, { width: canvas.width, height: canvas.height, scale: VIEW_SCALE * dpr, yaw, blink });
    ctx.putImageData(new ImageData(px, canvas.width, canvas.height), 0, 0);
  };
  const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const turnBy = step => {
    yaw += step;
    onTurn();
    redraw();
  };
  canvas.addEventListener("pointerdown", e => { dragX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => {
    if (dragX === null) return;
    const step = (e.clientX - dragX) * 0.015;
    dragX = e.clientX;
    turnBy(step);
  });
  for (const type of ["pointerup", "pointercancel"]) canvas.addEventListener(type, () => { dragX = null; redraw(); });
  canvas.addEventListener("keydown", e => {
    const step = { ArrowLeft: -0.3, ArrowRight: 0.3 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    turnBy(step);
  });
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  const blinkLater = () => setTimeout(() => {
    if (skin && !calm.matches && !document.hidden && canvas.offsetParent && dragX === null) {
      blink = true;
      redraw();
      setTimeout(() => { blink = false; redraw(); }, 140);
    }
    blinkLater();
  }, 2500 + Math.random() * 4000);
  blinkLater();
  return {
    show(biome, profession) {
      const key = wanted = `${biome}/${profession}`;
      villagerSkin(biome, profession).then(s => {
        if (wanted !== key) return;
        skin = s;
        canvas.hidden = !s;
        redraw();
      });
    },
  };
}

// The biome's ground texture, tiled under the villager.
const groundArt = biome => {
  const tex = art(BIOMES.find(b => b.k === biome).ground);
  return tex ? paint(16, tex) : icon(`biome:${biome}`);
};
