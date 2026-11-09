/* ---------- Villager model ----------
 * The texture pack's villagers, drawn as the 3D model the game uses. A villager's skin is three layers on the
 * same 64×64 layout: a base skin, the outfit of its biome and the outfit of its profession. build.py embeds
 * them as SKINS (art/villager/, copied from the pack by import_textures.py).
 */
// ground: the top of the biome's ground block (grass takes the biome's grass color);
// skins: where the biome's villagers start among the pack's 12 base skins (darkest first).
const BIOMES = [
  { k: "plains", n: "Plains", ground: "grass_top", skins: 4 },
  { k: "desert", n: "Desert", ground: "sand", skins: 0 },
  { k: "savanna", n: "Savanna", ground: "grass_top", skins: 0 },
  { k: "snowy", n: "Snowy", ground: "snow", skins: 6 },
  { k: "taiga", n: "Taiga", ground: "podzol_top", skins: 6 },
  { k: "jungle", n: "Jungle", ground: "grass_top", skins: 4 },
  { k: "swamp", n: "Swamp", ground: "grass_top", skins: 4 },
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
    angles: [c.rotation[0] * RAD, c.rotation[1] * RAD, c.rotation[2] * RAD],
  },
}));

// Turn [x, y, z] by [x, y, z] angles as the game does: about X, then Y, then Z. unturn undoes it.
const rotX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const rotY = ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, z * Math.cos(a) - x * Math.sin(a)];
const rotZ = ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
const turn = (p, [ax, ay, az]) => rotZ(rotY(rotX(p, ax), ay), az);
const unturn = (p, [ax, ay, az]) => rotX(rotY(rotZ(p, -az), -ay), -ax);

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

// ---------- Scene renderer ----------
// A scene is boxes in game pixels: x right, y down with the ground at y = GROUND, z away from the camera
// at rest. A box has lo and hi corners, maybe a bone (pivot, move, angles, maybe scale) turning it, or bones: a
// chain of them, innermost first, as a model's bones nest; and color(axis, side, fx, fy, fz): its face's color at that
// 0-1 spot in the box as 0xRRGGBB, or -1 where the face is see-through. side 0 is the box's low face on that axis.
// A glowing box (glow) isn't shaded.
const GROUND = 24, LID_TOP = 24 - 29, BLINK = 2.02;
const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const NO_MOVE = [0, 0, 0], NO_SCALE = [1, 1, 1];
// Where a point of a box ends up once its bones (innermost first) have scaled and turned it about their pivots
// and moved it.
const placeBy = (chain, p) => chain.reduce((q, { pivot, move = NO_MOVE, angles, scale = NO_SCALE }) =>
  turn(q.map((v, i) => (v - pivot[i]) * scale[i]), angles).map((v, i) => v + pivot[i] + move[i]), p);

// An orthographic camera turned by yaw (radians) and looking down by pitch, scale pixels per game pixel,
// with the scene point center at the canvas point origin. project says where a scene point lands.
function camera({ yaw, pitch = 0.2, scale, center, origin }) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const right = [cy, 0, -sy], down = [-sp * sy, cp, -sp * cy], dir = [cp * sy, sp, cp * cy];
  const project = p => {
    const rel = p.map((v, i) => v - center[i]);
    return [origin[0] + dot(rel, right) * scale, origin[1] + dot(rel, down) * scale];
  };
  return { right, down, dir, scale, center, origin, project };
}

// Ray-cast a scene into RGBA pixels. Each pixel takes the nearest face that isn't see-through there,
// lit from the camera's upper left; where nothing is hit, shadows ([x, z, radius] on the ground) darken it.
function renderScene(boxes, { width, height, shadows = [], ...view }) {
  const { right, down, dir, scale, center, origin } = camera(view);
  const toWorld = ([a, b, c]) => [0, 1, 2].map(i => right[i] * a + down[i] * b + dir[i] * c);
  const light = toWorld([-0.45, -1, -0.75].map(v => v / Math.hypot(0.45, 1, 0.75)));
  const start = center.map((v, i) => v - dir[i] * 80);
  // The camera is orthographic, so in each box's own frame every ray has the same direction and a start
  // that moves by stepX and stepY per pixel. Faces keep one light level each: shade[axis][side].
  const prepared = boxes.map(m => {
    const { lo, hi } = m, chain = m.bones || (m.bone ? [m.bone] : []);
    // Into the box's own frame: undo the outermost turn first.
    let o = start, stepX = right, stepY = down, r = dir;
    for (let k = chain.length - 1; k >= 0; k--) {
      const { pivot, move = NO_MOVE, angles, scale = NO_SCALE } = chain[k];
      o = unturn(o.map((v, i) => v - pivot[i] - move[i]), angles).map((v, i) => v / scale[i] + pivot[i]);
      [stepX, stepY, r] = [stepX, stepY, r].map(v => unturn(v, angles).map((x, i) => x / scale[i]));
    }
    const shade = [0, 1, 2].map(axis => [-1, 1].map(side => {
      const n = chain.reduce((q, { angles }) => turn(q, angles), [0, 1, 2].map(i => (i === axis ? side : 0)));
      return 0.5 + 0.5 * Math.max(0, dot(n, light));
    }));
    // Where the box lands on screen, in game pixels from the center, so pixels outside it skip the box.
    const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(c => {
      const rel = placeBy(chain, [c & 1 ? hi[0] : lo[0], c & 2 ? hi[1] : lo[1], c & 4 ? hi[2] : lo[2]]).map((v, i) => v - center[i]);
      return [dot(rel, right), dot(rel, down)];
    });
    const span = k => [Math.min(...corners.map(c => c[k])), Math.max(...corners.map(c => c[k]))];
    return { lo, hi, color: m.color, glow: m.glow, o, stepX, stepY, r, shade, across: span(0), along: span(1) };
  });
  // Where each shadow lands on screen, the same way: [left, right, top, bottom] in game pixels from the center.
  const shadowSpans = shadows.map(([sx, sz, radius]) => {
    const corners = [-1, 1].flatMap(i => [-1, 1].map(k => {
      const rel = [sx + i * radius - center[0], GROUND - center[1], sz + k * radius - center[2]];
      return [dot(rel, right), dot(rel, down)];
    }));
    return [0, 1].flatMap(k => [Math.min(...corners.map(c => c[k])), Math.max(...corners.map(c => c[k]))]);
  });
  const out = new Uint8ClampedArray(width * height * 4), o = [0, 0, 0];
  for (let py = 0; py < height; py++) {
    const b = (py + 0.5 - origin[1]) / scale, row = prepared.filter(m => b >= m.along[0] && b <= m.along[1]);
    // Most of the canvas is empty, so each row only works out the pixels a box or shadow can reach.
    let first = Infinity, last = -Infinity;
    for (const m of row) { first = Math.min(first, m.across[0]); last = Math.max(last, m.across[1]); }
    for (const s of shadowSpans) if (b >= s[2] && b <= s[3]) { first = Math.min(first, s[0]); last = Math.max(last, s[1]); }
    if (first > last) continue;
    const from = Math.max(0, Math.floor(origin[0] + first * scale) - 1), to = Math.min(width, Math.ceil(origin[0] + last * scale) + 1);
    for (let px = from; px < to; px++) {
      const a = (px + 0.5 - origin[0]) / scale;
      let bestT = Infinity, bestColor = -1, bestShade = 0;
      for (const m of row) {
        if (a < m.across[0] || a > m.across[1]) continue;
        const r = m.r;
        for (let i = 0; i < 3; i++) o[i] = m.o[i] + m.stepX[i] * a + m.stepY[i] * b;
        let near = -Infinity, far = Infinity, axis = 0, backAxis = 0;
        for (let i = 0; i < 3; i++) {
          if (Math.abs(r[i]) < 1e-9) {
            if (o[i] < m.lo[i] || o[i] > m.hi[i]) far = -Infinity;
            continue;
          }
          const t1 = (m.lo[i] - o[i]) / r[i], t2 = (m.hi[i] - o[i]) / r[i];
          if (Math.min(t1, t2) > near) { near = Math.min(t1, t2); axis = i; }
          if (Math.max(t1, t2) < far) { far = Math.max(t1, t2); backAxis = i; }
        }
        if (near > far || near >= bestT) continue;
        const frac = (i, t) => (m.hi[i] > m.lo[i] ? Math.min(0.9999, Math.max(0, (o[i] + r[i] * t - m.lo[i]) / (m.hi[i] - m.lo[i]))) : 0);
        const side = r[axis] > 0 ? 0 : 1;
        const color = m.color(axis, side, frac(0, near), frac(1, near), frac(2, near));
        if (color >= 0) {
          bestT = near;
          bestColor = color;
          bestShade = m.glow ? 1 : m.shade[axis][side];
        } else if (far < bestT) {
          // Through a see-through texel, the inside of the box's far face shows: the game draws both sides.
          const backSide = r[backAxis] > 0 ? 1 : 0, back = m.color(backAxis, backSide, frac(0, far), frac(1, far), frac(2, far));
          if (back >= 0) {
            bestT = far;
            bestColor = back;
            bestShade = m.glow ? 1 : m.shade[backAxis][backSide];
          }
        }
      }
      const j = (py * width + px) * 4;
      if (bestColor >= 0) {
        out[j] = (bestColor >> 16) * bestShade;
        out[j + 1] = (bestColor >> 8 & 255) * bestShade;
        out[j + 2] = (bestColor & 255) * bestShade;
        out[j + 3] = 255;
      } else if (shadows.length) {
        const t = (GROUND - start[1] - right[1] * a - down[1] * b) / dir[1];
        const gx = start[0] + right[0] * a + down[0] * b + dir[0] * t, gz = start[2] + right[2] * a + down[2] * b + dir[2] * t;
        let dark = 0;
        for (const [sx, sz, radius] of shadows) dark = Math.max(dark, 1 - ((gx - sx) ** 2 + (gz - sz) ** 2) / radius ** 2);
        out[j + 3] = 90 * dark;
      }
    }
  }
  return out;
}

// The villager as scene boxes standing at at, colored from its skin; blink closes its eyes.
function villagerBoxes(skin, { blink = false, at = [0, 0, 0] } = {}) {
  const shift = p => p.map((v, i) => v + at[i]);
  return VILLAGER_MODEL.map(m => {
    const [x, y, z, w, h, d] = m.box, g = m.grow || 0, size = [w, h, d];
    const lo = [x - g, y - g, z - g], hi = [x + w + g, y + h + g, z + d + g];
    if (blink && m.lid) [lo[1], hi[1]] = [lo[1], hi[1]].map(v => LID_TOP + (v - LID_TOP) * BLINK);
    return {
      lo: shift(lo), hi: shift(hi), bone: m.bone && { ...m.bone, pivot: shift(m.bone.pivot) },
      color(axis, side, fx, fy, fz) {
        let face = FACES[axis][side];
        if (m.mirror) {
          fx = 0.9999 - fx;
          if (axis === 0) face = FACES[0][1 - side];
        }
        const k = skinTexel(m.uv, size, face, fx, fy, fz);
        return skin[k + 3] < 128 ? -1 : skin[k] << 16 | skin[k + 1] << 8 | skin[k + 2];
      },
    };
  });
}

// A head-and-shoulders view of a villager, size pixels square.
const villagerBust = (skin, size, yaw = 0.45) => renderScene(villagerBoxes(skin), {
  width: size, height: size, scale: size / 17.5, yaw, pitch: 0.12, center: [0, -4.4, 0], origin: [size / 2, size / 2],
});

// ---------- Job site blocks ----------
// Block models the way Minecraft writes them: parts from/to in the block's 16ths (x east, y up, z south),
// each face a texture, or [texture, [u1, v1, u2, v2]] where the spot the part's position gives won't do.
// The block's north face, its front, turns toward the villager.
const sides = (side, top = side, front = side, bottom = top) => ({ north: front, south: side, east: side, west: side, up: top, down: bottom });
const part = (from, to, faces, rotation) => ({ from, to, faces, rotation });
const solid = (front, top, side) => [part([0, 0, 0], [16, 16, 16], sides(side, top, front))];
// Open-topped blocks: four walls two thick round a floor.
const tub = (side, top, floor, floorFrom, floorTo) => [
  part([0, 0, 0], [16, 16, 2], sides(side, top)), part([0, 0, 14], [16, 16, 16], sides(side, top)),
  part([0, 0, 2], [2, 16, 14], sides(side, top)), part([14, 0, 2], [16, 16, 14], sides(side, top)),
  part([2, floorFrom, 2], [14, floorTo, 14], { up: floor }),
];
const PIVOT = { east: ["grindstone_pivot", [0, 0, 6, 6]], west: ["grindstone_pivot", [0, 0, 6, 6]], north: ["grindstone_pivot", [6, 0, 8, 6]], south: ["grindstone_pivot", [6, 0, 8, 6]], up: ["grindstone_pivot", [8, 0, 10, 6]], down: ["grindstone_pivot", [8, 0, 10, 6]] };
const RIM = ["grindstone_round", [0, 0, 8, 12]], WHEEL = ["grindstone_side", [0, 0, 12, 12]];
const SAW = ["stonecutter_saw", [1, 9, 15, 16]];
const SITE_MODELS = {
  "Barrel": solid("barrel_side", "barrel_top", "barrel_side"),
  "Blast Furnace": solid("blast_furnace_front", "blast_furnace_top", "blast_furnace_side"),
  "Brewing Stand": [
    part([7, 0, 7], [9, 14, 9], sides(["brewing_stand_block", [7, 2, 9, 16]])),
    part([9, 0, 5], [15, 2, 11], sides("brewing_stand_base")),
    part([2, 0, 1], [8, 2, 7], sides("brewing_stand_base")),
    part([2, 0, 9], [8, 2, 15], sides("brewing_stand_base")),
    part([0, 0, 8], [16, 16, 8], { north: "brewing_stand_block", south: "brewing_stand_block" }),
    part([8, 0, 0], [8, 16, 16], { east: "brewing_stand_block", west: "brewing_stand_block" }),
  ],
  "Cartography Table": solid("cartography_table_front", "cartography_table_top", "cartography_table_side"),
  "Cauldron": tub("cauldron_side", "cauldron_top", "cauldron_inner", 3, 4),
  "Composter": tub("composter_side", "composter_top", "composter_bottom", 0, 2),
  "Fletching Table": solid("fletching_table_front", "fletching_table_top", "fletching_table_side"),
  "Grindstone": [
    part([4, 4, 2], [12, 16, 14], { east: WHEEL, west: WHEEL, north: RIM, south: RIM, up: RIM, down: RIM }),
    part([2, 7, 5], [4, 13, 11], PIVOT), part([12, 7, 5], [14, 13, 11], PIVOT),
    part([2, 0, 6], [4, 7, 10], PIVOT), part([12, 0, 6], [14, 7, 10], PIVOT),
  ],
  "Lectern": [
    part([0, 0, 0], [16, 2, 16], sides("lectern_sides", "lectern_top")),
    part([4, 2, 4], [12, 15, 12], sides("lectern_sides", "lectern_top", ["lectern_front", [0, 1, 8, 14]])),
    part([0, 12, 1], [16, 16, 15], sides("lectern_sides", "lectern_base"), { axis: "x", angle: -22.5, origin: [8, 14, 8] }),
  ],
  "Loom": solid("loom_front", "loom_top", "loom_side"),
  "Smithing Table": solid("smithing_table_front", "smithing_table_top", "smithing_table_side"),
  "Smoker": solid("smoker_front", "smoker_top", "smoker_side"),
  "Stonecutter": [
    part([0, 0, 0], [16, 9, 16], sides("stonecutter_side", "stonecutter_top")),
    part([1, 9, 8], [15, 16, 8], { north: SAW, south: SAW }),
  ],
};

// Block textures as 0xRRGGBB per texel, -1 where see-through; null when the pack lacks one.
function packedArt(name) {
  const cache = packedArt.cache || (packedArt.cache = {});
  if (!(name in cache)) {
    const px = art(name);
    cache[name] = px && Int32Array.from(px, p => (p ? p[0] << 16 | p[1] << 8 | p[2] : -1));
  }
  return cache[name];
}

// The spot on its texture each face of a part shows unless told otherwise, as Minecraft works it out.
const autoUV = ([x1, y1, z1], [x2, y2, z2]) => ({
  north: [16 - x2, 16 - y2, 16 - x1, 16 - y1], south: [x1, 16 - y2, x2, 16 - y1],
  west: [z1, 16 - y2, z2, 16 - y1], east: [16 - z2, 16 - y2, 16 - z1, 16 - y1],
  up: [x1, z1, x2, z2], down: [x1, 16 - z2, x2, 16 - z1],
});
// Scene faces by axis and side, as block faces. The block stands turned so its north (front) faces -x,
// toward the villager: block z runs along scene x, block x along scene z, and block y up the scene.
const BLOCK_FACES = [["north", "south"], ["up", "down"], ["west", "east"]];

// A block model as scene boxes, the middle of its bottom at at (x, height above the ground, z).
function blockBoxes(parts, at) {
  const place = ([x, y, z]) => [at[0] + z - 8, GROUND - at[1] - y, at[2] + x - 8];
  return parts.map(({ from, to, faces, rotation }) => {
    const [a, b] = [place(from), place(to)], uvs = autoUV(from, to);
    const look = BLOCK_FACES.map(pair => pair.map(name => {
      const face = faces[name];
      if (!face) return null;
      const [tex, uv = uvs[name]] = typeof face === "string" ? [face] : face;
      return packedArt(tex) && { tex: packedArt(tex), uv };
    }));
    let bone;
    if (rotation) {
      // A turn about the block's x, y or z axis is one about the scene's z, -y or x axis.
      const angle = rotation.angle * RAD;
      const angles = { x: [0, 0, angle], y: [0, -angle, 0], z: [angle, 0, 0] }[rotation.axis];
      bone = { pivot: place(rotation.origin), move: [0, 0, 0], angles };
    }
    return {
      lo: [0, 1, 2].map(i => Math.min(a[i], b[i])), hi: [0, 1, 2].map(i => Math.max(a[i], b[i])), bone,
      color(axis, side, fx, fy, fz) {
        const face = look[axis][side];
        if (!face) return -1;
        // How far across (s) and down (t) the face's texture spot the point is, as seen from outside.
        let s, t;
        switch (axis * 2 + side) {
          case 0: s = 1 - fz; t = fy; break; // north
          case 1: s = fz; t = fy; break; // south
          case 2: s = fz; t = fx; break; // up
          case 3: s = fz; t = 1 - fx; break; // down
          case 4: s = fx; t = fy; break; // west
          default: s = 1 - fx; t = fy; // east
        }
        const [u1, v1, u2, v2] = face.uv;
        const u = Math.min(15, Math.max(0, Math.floor(u1 + s * (u2 - u1)))), v = Math.min(15, Math.max(0, Math.floor(v1 + t * (v2 - v1))));
        return face.tex[v * 16 + u];
      },
    };
  });
}

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

// The stage scene on a canvas: the villager with its job site block beside it, turned together by
// dragging sideways or with the arrow keys (onTurn hears the first turn). tag, an element over the canvas,
// follows the villager's head. The scene fills the canvas at VIEW_SCALE CSS pixels per game pixel and draws
// at the screen's pixel density, but at 1× while dragging so turning stays smooth. Every few seconds the
// villager blinks, unless the reader asks for less motion.
const VIEW_SCALE = 5, SITE_AT = [33, 0, 7], FEET_UP = 26;
function villagerScene(canvas, tag, { onTurn = () => {} } = {}) {
  const ctx = canvas.getContext("2d");
  let skin = null, site = null, yaw = 0.55, wanted = "", frame = 0, dragX = null, blink = false;
  const draw = () => {
    frame = 0;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = dragX !== null ? 1 : Math.max(1, Math.min(3, Math.round(window.devicePixelRatio || 1)));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (!skin) return;
    // The camera looks at the ground halfway between the villager and its block.
    const block = SITE_MODELS[site] ? blockBoxes(SITE_MODELS[site], SITE_AT) : [], mid = block.length ? 0.5 : 0;
    const view = {
      yaw, scale: VIEW_SCALE * dpr, center: [SITE_AT[0] * mid, GROUND, SITE_AT[2] * mid],
      origin: [canvas.width / 2, canvas.height - FEET_UP * dpr],
    };
    const px = renderScene([...villagerBoxes(skin, { blink }), ...block], { ...view, width: canvas.width, height: canvas.height, shadows: [[0, 0, 7]] });
    ctx.putImageData(new ImageData(px, canvas.width, canvas.height), 0, 0);
    const [x, y] = camera(view).project([0, -12.5, 0]);
    tag.style.left = `${x / dpr}px`;
    tag.style.top = `${y / dpr}px`;
  };
  const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
  new ResizeObserver(redraw).observe(canvas);
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
    show(biome, profession, jobSite) {
      const key = wanted = `${biome}/${profession}`;
      villagerSkin(biome, profession).then(s => {
        if (wanted !== key) return;
        skin = s;
        site = jobSite;
        tag.hidden = !s;
        redraw();
      });
    },
  };
}

// The biome's ground texture, tiled under the villager.
const groundArt = biome => {
  // Only villages are BIOMES; the Mobs tab's cave, nether, End, ocean, lush and flooded caves, the wolves' wild
  // biomes, the panda's bamboo jungle and the mooshroom's mushroom fields have floors of their own.
  const name = (BIOMES.find(b => b.k === biome) || { ground: { forest: "grass_top", snowy_taiga: "snow", grove: "snow", pine_taiga: "podzol_top",
    spruce_taiga: "podzol_top", sparse_jungle: "grass_top", bamboo_jungle: "grass_top", mushroom_fields: "mycelium_top", savanna_plateau: "grass_top", badlands: "coarse_dirt", mineshaft: "gravel", nether: "netherrack", end: "end_stone", end_island: "end_stone", ocean: "sand", lush: "moss_block", flooded_cave: "gravel" }[biome] || "stone" }).ground, tex = art(name);
  if (!tex) return icon(`biome:${biome}`);
  return paint(16, name === "grass_top" ? multiplied(tex, BIOME_TINTS[biome].grass) : tex);
};
