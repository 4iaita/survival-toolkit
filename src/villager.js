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
// 0-1 spot in the box as 0xRRGGBB (plus how much it glows, EMITS), or -1 where the face is see-through. side 0 is the box's low face on that axis.
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
// How far back from the scene's center the rays start.
const CAMERA_BACK = 80;
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
// A texel's color can also say how much of its own light it gives off, 0 to 255, in units of EMITS above its 0xRRGGBB
// (a mob's emissive texels: glowing eyes): that much of it isn't shaded by the face it's on. A glowing box isn't shaded.
// A glass box (glass) is see-through: its texels' colors say how solid they are in those units instead, and it shows its
// near and far faces, blended over what's behind them. emitted: pixels to fill with just the texels that give off light
// (glass aside), the rest left clear (bloomOf). A culled box (culled) only shows the faces turned to the camera.
// A light beam (beam) is light added over what's behind it, its colors saying how much as glass does, and stops at the ground.
const EMITS = 0x1000000;
const shadeOf = (m, shade, color) => (m.glow ? 1 : shade + (1 - shade) * Math.floor(color / EMITS) / 255);
// What's seen through a doorway (a box's portal, its beyond: the boxes of the room behind it). Unlike the rest of the scene it's
// seen in perspective, from this far in front of the doorway at the height of its middle (a player's eyes), or a room would look
// like a corridor seen from far off and above.
const DOORWAY_EYE = 90;
function doorwayRoom(beyond, light) {
  // The boxes by the model they're of, each with where it lies, so that a ray only tries the ones it comes near.
  const groups = [...new Set(beyond.map(m => m.room))].map(of => {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    const all = beyond.filter(m => m.room === of).map(m => {
      const back = p => m.bones.reduceRight((q, { pivot, move = NO_MOVE, angles, scale = NO_SCALE }) =>
        unturn(q.map((v, i) => v - pivot[i] - move[i]), angles).map((v, i) => v / scale[i] + pivot[i]), p);
      const at = back([0, 0, 0]), [a, b, c] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(e => back(e).map((v, i) => v - at[i]));
      const shade = [0, 1, 2].map(axis => [-1, 1].map(side => {
        const n = m.bones.reduce((q, { angles }) => turn(q, angles), [0, 1, 2].map(i => (i === axis ? side : 0)));
        return m.glow ? 1 : 0.5 + 0.5 * Math.max(0, dot(n, light));
      }));
      for (let k = 0; k < 8; k++) placeBy(m.bones, [k & 1 ? m.hi[0] : m.lo[0], k & 2 ? m.hi[1] : m.lo[1], k & 4 ? m.hi[2] : m.lo[2]]).forEach((v, i) => {
        lo[i] = Math.min(lo[i], v - 0.01);
        hi[i] = Math.max(hi[i], v + 0.01);
      });
      return { m, lo: m.lo, hi: m.hi, at, a, b, c, shade };
    });
    return { lo, hi, all };
  });
  const o = [0, 0, 0], r = [0, 0, 0], spot = [0, 0, 0];
  // Whether a ray (from o, going r) meets a box: how far along it goes in and out (near, far), and by which faces' axes.
  let near = 0, far = 0, axis = 0, backAxis = 0;
  const meets = (lo, hi, o, r) => {
    near = -Infinity;
    far = Infinity;
    for (let i = 0; i < 3; i++) {
      const t1 = (lo[i] - o[i]) / (r[i] || 1e-12), t2 = (hi[i] - o[i]) / (r[i] || 1e-12), first = t1 < t2 ? t1 : t2, last = t1 < t2 ? t2 : t1;
      if (first > near) { near = first; axis = i; }
      if (last < far) { far = last; backAxis = i; }
    }
    return near <= far && far > 0;
  };
  // What a ray from a point meets first, as [its 0xRRGGBB, its light], or null.
  return (from, way) => {
    let best = Infinity, found = null;
    for (const group of groups) {
      if (!meets(group.lo, group.hi, from, way) || near >= best) continue;
      for (const { m, lo, hi, at, a, b, c, shade } of group.all) {
        for (let i = 0; i < 3; i++) {
          o[i] = at[i] + a[i] * from[0] + b[i] * from[1] + c[i] * from[2];
          r[i] = a[i] * way[0] + b[i] * way[1] + c[i] * way[2];
        }
        if (!meets(lo, hi, o, r)) continue;
        const t = m.inside ? far : near, on = m.inside ? backAxis : axis;
        if (t < 1e-6 || t >= best) continue;
        const side = m.inside === r[on] > 0 ? 1 : 0;
        for (let i = 0; i < 3; i++) spot[i] = hi[i] > lo[i] ? Math.min(0.9999, Math.max(0, (o[i] + r[i] * t - lo[i]) / (hi[i] - lo[i]))) : 0;
        const color = m.color(on, side, spot[0], spot[1], spot[2]);
        if (color < 0) continue;
        best = t;
        found = [color % EMITS, shade[on][m.inside ? 1 - side : side]];
      }
    }
    return found;
  };
}
function renderScene(boxes, { width, height, shadows = [], emitted = null, depth = null, ...view }) {
  const { right, down, dir, scale, center, origin } = camera(view);
  const toWorld = ([a, b, c]) => [0, 1, 2].map(i => right[i] * a + down[i] * b + dir[i] * c);
  const light = toWorld([-0.45, -1, -0.75].map(v => v / Math.hypot(0.45, 1, 0.75)));
  const start = center.map((v, i) => v - dir[i] * CAMERA_BACK);
  // The camera is orthographic, so in each box's own frame every ray has the same direction and a start
  // that moves by stepX and stepY per pixel. Faces keep one light level each: shade[axis][side].
  const prepared = boxes.map((m, order) => {
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
    // The faces turned to the camera and the ones turned from it, each a plane across one axis (i): how far along the ray it is, and
    // where along its other two axes (j, k), change evenly across a row of pixels.
    const facing = away => [0, 1, 2].filter(i => Math.abs(r[i]) >= 1e-9).map(i => {
      const [j, k] = [[1, 2], [0, 2], [0, 1]][i], ahead = (r[i] > 0) === away, side = ahead ? 1 : 0, dt = -stepX[i] / r[i];
      return { i, side, j, k, at: ahead ? Math.max(lo[i], hi[i]) : Math.min(lo[i], hi[i]), dt, dj: stepX[j] + r[j] * dt, dk: stepX[k] + r[k] * dt,
        loJ: Math.min(lo[j], hi[j]), hiJ: Math.max(lo[j], hi[j]), loK: Math.min(lo[k], hi[k]), hiK: Math.max(lo[k], hi[k]),
        // Lit as seen: from inside, the face looks inwards.
        lit: shade[i][m.inside ? 1 - side : side], painted: m.paint ? m.paint.face(i, side) : undefined };
    }).filter(f => f.hiJ > f.loJ && f.hiK > f.loK);
    // Where the box lands on screen, in game pixels from the center, so pixels outside it skip the box.
    const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(c => {
      const rel = placeBy(chain, [c & 1 ? hi[0] : lo[0], c & 2 ? hi[1] : lo[1], c & 4 ? hi[2] : lo[2]]).map((v, i) => v - center[i]);
      return [dot(rel, right), dot(rel, down), dot(rel, dir)];
    });
    const span = k => [Math.min(...corners.map(c => c[k])), Math.max(...corners.map(c => c[k]))];
    return { lo, hi, color: m.color, glow: m.glow, over: m.over, inside: m.inside, glass: m.glass, culled: m.culled, buried: m.buried, beam: m.beam,
      room: m.portal && doorwayRoom(m.beyond, light), eye: m.portal && placeBy(chain, lo.map((v, i) => (v + hi[i]) / 2)).map((v, i) => (i === 1 ? v : v - dir[i] / Math.hypot(dir[0], dir[2]) * DOORWAY_EYE)), o, stepX, stepY, r, shade, across: span(0), along: span(1),
      // Its place among the boxes, how far off its nearest corner is, and whether it's one a pixel's ray only has to find the nearest of.
      order, paint: m.paint, faces: facing(Boolean(m.inside)), backs: m.inside || m.culled ? [] : facing(true), cleared: false, nearest: Math.min(...corners.map(c => c[2])), plain: !m.glass && !m.beam && !m.portal,
      // Whether a ray goes along each axis at all.
      along0: Math.abs(r[0]) >= 1e-9, along1: Math.abs(r[1]) >= 1e-9, along2: Math.abs(r[2]) >= 1e-9 };
  });
  // Where each shadow lands on screen, the same way: [left, right, top, bottom] in game pixels from the center.
  const shadowSpans = shadows.map(([sx, sz, radius]) => {
    const corners = [-1, 1].flatMap(i => [-1, 1].map(k => {
      const rel = [sx + i * radius - center[0], GROUND - center[1], sz + k * radius - center[2]];
      return [dot(rel, right), dot(rel, down)];
    }));
    return [0, 1].flatMap(k => [Math.min(...corners.map(c => c[k])), Math.max(...corners.map(c => c[k]))]);
  });
  const out = new Uint8ClampedArray(width * height * 4);
  // A ray's start in a box's own frame, and how far along one of its axes (0 to 1) it is, so far on.
  let o0 = 0, o1 = 0, o2 = 0;
  const frac = (m, i, t) => {
    const lo = m.lo[i], size = m.hi[i] - lo;
    return size > 0 ? Math.min(0.9999, Math.max(0, ((i === 0 ? o0 : i === 1 ? o1 : o2) + m.r[i] * t - lo) / size)) : 0;
  };
  // How far along a box's axis from lo to hi something is, 0 to 1.
  const spot = (at, lo, hi) => {
    if (hi <= lo) return 0;
    const f = (at - lo) / (hi - lo);
    return f < 0 ? 0 : f > 0.9999 ? 0.9999 : f;
  };
  // A row none of whose boxes are see-through, face by face over the pixels each covers there, the nearest boxes first, so that most
  // of what's behind them needn't be colored; then, through see-through texels, the insides of the far faces of boxes that have some
  // (the game draws both sides). It comes out as the pixel by pixel way below has it, where two faces meet too: of those the first
  // box's shows, unless a later one goes over it (over, inside).
  const rowT = new Float64Array(width), rowColor = new Int32Array(width), rowShade = new Float64Array(width), rowEmits = new Uint8Array(width), rowOrder = new Int32Array(width), rowOver = new Uint8Array(width);
  const ROW_EDGE = 1e-7;
  const plainFace = (m, f, back, b, from, to) => {
    const { r, lo, hi, stepX, stepY, buried, glow, order, paint } = m, { i, j, k, side, at, dt, dj, dk, loJ, hiJ, loK, hiK, lit, painted } = f;
    const start0 = m.o[0] + stepY[0] * b, start1 = m.o[1] + stepY[1] * b, start2 = m.o[2] + stepY[2] * b;
    const t0 = (at - (i === 0 ? start0 : i === 1 ? start1 : start2)) / r[i], j0 = (j === 0 ? start0 : start1) + r[j] * t0, k0 = (k === 1 ? start1 : start2) + r[k] * t0;
    // The stretch of the row it covers: where it's within the face both ways.
    let left = -Infinity, rightmost = Infinity;
    if (Math.abs(dj) > 1e-12) {
      const a1 = (loJ - j0) / dj, a2 = (hiJ - j0) / dj;
      left = Math.min(a1, a2);
      rightmost = Math.max(a1, a2);
    } else if (j0 < loJ || j0 > hiJ) return;
    if (Math.abs(dk) > 1e-12) {
      const a1 = (loK - k0) / dk, a2 = (hiK - k0) / dk;
      left = Math.max(left, Math.min(a1, a2));
      rightmost = Math.min(rightmost, Math.max(a1, a2));
    } else if (k0 < loK || k0 > hiK) return;
    if (left > rightmost) return;
    const begin = Math.max(from, Math.ceil((left - ROW_EDGE) * scale + origin[0] - 0.5)), end = Math.min(to - 1, Math.floor((rightmost + ROW_EDGE) * scale + origin[0] - 0.5));
    if (begin > end) return;
    if (painted === null) {
      m.cleared = true;
      return;
    }
    const goesOver = !back && (m.over || m.inside) ? 1 : 0, [sx, sy, sz] = stepX, [rx, ry, rz] = r;
    for (let px = begin; px <= end; px++) {
      const a = (px + 0.5 - origin[0]) / scale, t = t0 + dt * a, bestT = rowT[px];
      if (t > bestT) continue;
      // Whether one this far off takes the pixel from what has it.
      if (t === bestT && (back ? order >= rowOrder[px] || rowOver[px] : order > rowOrder[px] ? !goesOver : rowOver[px])) continue;
      // What's in the ground (buried) only shows above it.
      if (buried && t > (GROUND - start[1] - right[1] * a - down[1] * b) / dir[1]) continue;
      const fx = spot(start0 + sx * a + rx * t, lo[0], hi[0]), fy = spot(start1 + sy * a + ry * t, lo[1], hi[1]), fz = spot(start2 + sz * a + rz * t, lo[2], hi[2]);
      let rgb = 0, emits = 0;
      if (painted) {
        let s = painted.across === 0 ? fx : fz, d = painted.down === 1 ? fy : fz;
        if (painted.acrossFlip) s = 0.9999 - s;
        if (painted.acrossMirror) s = 0.9999 - s;
        if (painted.acrossBack) s = 1 - s;
        if (painted.downFlip) d = 0.9999 - d;
        if (painted.downBack) d = 1 - d;
        if (painted.quarter) {
          const s0 = s;
          s = painted.quarter === 90 ? d : painted.quarter === 180 ? 1 - s : painted.quarter === 270 ? 1 - d : s;
          d = painted.quarter === 90 ? 1 - s0 : painted.quarter === 180 ? 1 - d : painted.quarter === 270 ? s0 : d;
        }
        const { tex } = paint;
        let tx = Math.floor((painted.u + s * painted.w) * paint.kx), ty = Math.floor((painted.v + d * painted.h) * paint.ky);
        tx = tx < 0 ? 0 : tx >= tex.w ? tex.w - 1 : tx;
        ty = ty < 0 ? 0 : ty >= tex.h ? tex.h - 1 : ty;
        const n = (ty * tex.w + tx) * 4, alpha = tex.px[n + 3];
        if (alpha < paint.least) {
          m.cleared = true;
          continue;
        }
        const bright = paint.emissive ? paint.light + (1 - paint.light) * (1 - alpha / 255) : paint.lit;
        if (paint.dyed && alpha >= 128) rgb = Math.round(tex.px[n] * (paint.dyed[0] * bright)) << 16 | Math.round(tex.px[n + 1] * (paint.dyed[1] * bright)) << 8 | Math.round(tex.px[n + 2] * (paint.dyed[2] * bright));
        else if (bright === 1) rgb = tex.px[n] << 16 | tex.px[n + 1] << 8 | tex.px[n + 2];
        else rgb = Math.round(tex.px[n] * bright) << 16 | Math.round(tex.px[n + 1] * bright) << 8 | Math.round(tex.px[n + 2] * bright);
        if (paint.emissive) emits = Math.round(255 * (1 - alpha / 255));
      } else {
        const color = m.color(i, side, fx, fy, fz);
        if (color < 0) {
          m.cleared = true;
          continue;
        }
        emits = color >= EMITS ? Math.floor(color / EMITS) : 0;
        rgb = color - emits * EMITS;
      }
      rowOrder[px] = order;
      rowOver[px] = goesOver;
      rowT[px] = t;
      rowColor[px] = rgb;
      rowEmits[px] = emits;
      rowShade[px] = glow ? 1 : lit + (1 - lit) * emits / 255;
    }
  };
  const plainRow = (row, py, b, from, to) => {
    rowT.fill(Infinity, from, to);
    rowColor.fill(-1, from, to);
    rowEmits.fill(0, from, to);
    rowOver.fill(0, from, to);
    for (const m of row) {
      m.cleared = false;
      for (const f of m.faces) plainFace(m, f, false, b, from, to);
    }
    for (const m of row) if (m.cleared) for (const f of m.backs) plainFace(m, f, true, b, from, to);
    for (let px = from; px < to; px++) {
      const j = (py * width + px) * 4, color = rowColor[px];
      if (depth) depth[py * width + px] = rowT[px];
      if (color >= 0) {
        const bright = rowShade[px];
        out[j] = (color >> 16) * bright;
        out[j + 1] = (color >> 8 & 255) * bright;
        out[j + 2] = (color & 255) * bright;
        out[j + 3] = 255;
        if (emitted && rowEmits[px]) {
          for (let k = 0; k < 3; k++) emitted[j + k] = out[j + k];
          emitted[j + 3] = rowEmits[px];
        }
      } else if (shadows.length) {
        const a = (px + 0.5 - origin[0]) / scale, groundT = (GROUND - start[1] - right[1] * a - down[1] * b) / dir[1];
        const gx = start[0] + right[0] * a + down[0] * b + dir[0] * groundT, gz = start[2] + right[2] * a + down[2] * b + dir[2] * groundT;
        let dark = 0;
        for (const [sx, sz, radius] of shadows) dark = Math.max(dark, 1 - ((gx - sx) ** 2 + (gz - sz) ** 2) / radius ** 2);
        out[j + 3] = 90 * dark;
      }
    }
  };
  const nearFirst = [...prepared].sort((m, n) => m.nearest - n.nearest);
  // The glass faces a pixel's ray meets: how far off, their colors and their light.
  const paneT = [], paneColor = [], paneShade = [], rayT = [], rayColor = [];
  for (let py = 0; py < height; py++) {
    const b = (py + 0.5 - origin[1]) / scale;
    const row = prepared.filter(m => b >= m.along[0] && b <= m.along[1]);
    // Most of the canvas is empty, so each row only works out the pixels a box or shadow can reach.
    let first = Infinity, last = -Infinity;
    for (const m of row) { first = Math.min(first, m.across[0]); last = Math.max(last, m.across[1]); }
    for (const s of shadowSpans) if (b >= s[2] && b <= s[3]) { first = Math.min(first, s[0]); last = Math.max(last, s[1]); }
    if (first > last) continue;
    const from = Math.max(0, Math.floor(origin[0] + first * scale) - 1), to = Math.min(width, Math.ceil(origin[0] + last * scale) + 1);
    if (row.every(m => m.plain)) {
      plainRow(nearFirst.filter(m => b >= m.along[0] && b <= m.along[1]), py, b, from, to);
      continue;
    }
    for (let px = from; px < to; px++) {
      const a = (px + 0.5 - origin[0]) / scale;
      let bestT = Infinity, bestColor = -1, bestShade = 0, bestEmits = 0, panes = 0, rays = 0;
      const groundT = (GROUND - start[1] - right[1] * a - down[1] * b) / dir[1];
      for (const m of row) {
        if (a < m.across[0] || a > m.across[1]) continue;
        const { r, lo, hi, stepX, stepY } = m;
        o0 = m.o[0] + stepX[0] * a + stepY[0] * b;
        o1 = m.o[1] + stepX[1] * a + stepY[1] * b;
        o2 = m.o[2] + stepX[2] * a + stepY[2] * b;
        let near = -Infinity, far = Infinity, axis = 0, backAxis = 0;
        if (m.along0) {
          const t1 = (lo[0] - o0) / r[0], t2 = (hi[0] - o0) / r[0];
          near = t1 < t2 ? t1 : t2;
          far = t1 < t2 ? t2 : t1;
        } else if (o0 < lo[0] || o0 > hi[0]) far = -Infinity;
        if (m.along1) {
          const t1 = (lo[1] - o1) / r[1], t2 = (hi[1] - o1) / r[1], first = t1 < t2 ? t1 : t2, last = t1 < t2 ? t2 : t1;
          if (first > near) { near = first; axis = 1; }
          if (last < far) { far = last; backAxis = 1; }
        } else if (o1 < lo[1] || o1 > hi[1]) far = -Infinity;
        if (m.along2) {
          const t1 = (lo[2] - o2) / r[2], t2 = (hi[2] - o2) / r[2], first = t1 < t2 ? t1 : t2, last = t1 < t2 ? t2 : t1;
          if (first > near) { near = first; axis = 2; }
          if (last < far) { far = last; backAxis = 2; }
        } else if (o2 < lo[2] || o2 > hi[2]) far = -Infinity;
        // Where two faces meet, the first box's shows, but an overlay's (over) shows over what's under it.
        if (near > far || (m.inside ? far : near) > bestT || (near === bestT && !m.over)) continue;
        // What's in the ground (buried) only shows above it.
        if (m.buried && near > groundT) continue;
        // A box drawn from inside only (inside: the game culls its outsides) shows its far faces.
        if (m.inside) {
          const backSide = r[backAxis] > 0 ? 1 : 0, back = far <= bestT ? m.color(backAxis, backSide, frac(m, 0, far), frac(m, 1, far), frac(m, 2, far)) : -1;
          // Lit as seen: from inside, the face looks inwards.
          if (back >= 0) {
            bestT = far;
            bestColor = back % EMITS;
            bestEmits = Math.floor(back / EMITS);
            bestShade = shadeOf(m, m.shade[backAxis][1 - backSide], back);
          }
          continue;
        }
        const side = r[axis] > 0 ? 0 : 1;
        if (m.room) {
          if (axis !== 2 || side) continue;
          const spot = [0, 1, 2].map(i => start[i] + right[i] * a + down[i] * b + dir[i] * near);
          const seen = m.room(spot, spot.map((v, i) => v - m.eye[i]));
          bestT = near;
          bestColor = seen ? seen[0] : 0;
          bestEmits = 0;
          bestShade = seen ? seen[1] : 1;
          continue;
        }
        if (m.beam) {
          for (let pass = 0; pass < 2; pass++) {
            const t = pass ? far : near, i = pass ? backAxis : axis;
            if (t > groundT) continue;
            const color = m.color(i, pass ? (r[backAxis] > 0 ? 1 : 0) : side, frac(m, 0, t), frac(m, 1, t), frac(m, 2, t));
            if (color < 0) continue;
            rayT[rays] = t;
            rayColor[rays++] = color;
          }
          continue;
        }
        if (m.glass) {
          for (let pass = 0; pass < (m.culled ? 1 : 2); pass++) {
            const t = pass ? far : near, i = pass ? backAxis : axis, on = pass ? (r[backAxis] > 0 ? 1 : 0) : side;
            const color = m.color(i, on, frac(m, 0, t), frac(m, 1, t), frac(m, 2, t));
            if (color < 0) continue;
            // Kept farthest first.
            let k = panes++;
            for (; k > 0 && paneT[k - 1] < t; k--) { paneT[k] = paneT[k - 1]; paneColor[k] = paneColor[k - 1]; paneShade[k] = paneShade[k - 1]; }
            paneT[k] = t; paneColor[k] = color; paneShade[k] = m.shade[i][on];
          }
          continue;
        }
        const color = m.color(axis, side, frac(m, 0, near), frac(m, 1, near), frac(m, 2, near));
        if (color >= 0) {
          bestT = near;
          bestColor = color % EMITS;
          bestEmits = Math.floor(color / EMITS);
          bestShade = shadeOf(m, m.shade[axis][side], color);
        } else if (far < bestT && !m.culled && !(m.buried && far > groundT)) {
          // Through a see-through texel, the inside of the box's far face shows: the game draws both sides.
          const backSide = r[backAxis] > 0 ? 1 : 0, back = m.color(backAxis, backSide, frac(m, 0, far), frac(m, 1, far), frac(m, 2, far));
          if (back >= 0) {
            bestT = far;
            bestColor = back % EMITS;
            bestEmits = Math.floor(back / EMITS);
            bestShade = shadeOf(m, m.shade[backAxis][backSide], back);
          }
        }
      }
      const j = (py * width + px) * 4;
      if (depth) depth[py * width + px] = bestT;
      if (bestColor >= 0) {
        out[j] = (bestColor >> 16) * bestShade;
        out[j + 1] = (bestColor >> 8 & 255) * bestShade;
        out[j + 2] = (bestColor & 255) * bestShade;
        out[j + 3] = 255;
        if (emitted && bestEmits) {
          for (let k = 0; k < 3; k++) emitted[j + k] = out[j + k];
          emitted[j + 3] = bestEmits;
        }
      } else if (shadows.length) {
        const gx = start[0] + right[0] * a + down[0] * b + dir[0] * groundT, gz = start[2] + right[2] * a + down[2] * b + dir[2] * groundT;
        let dark = 0;
        for (const [sx, sz, radius] of shadows) dark = Math.max(dark, 1 - ((gx - sx) ** 2 + (gz - sz) ** 2) / radius ** 2);
        out[j + 3] = 90 * dark;
      }
      // Glass in front of that.
      for (let k = 0; k < panes; k++) {
        if (paneT[k] >= bestT) continue;
        const rgb = paneColor[k] % EMITS, solid = Math.floor(paneColor[k] / EMITS) / 255, shade = paneShade[k] * solid;
        const under = (out[j + 3] / 255) * (1 - solid), alpha = solid + under;
        out[j] = ((rgb >> 16) * shade + out[j] * under) / alpha;
        out[j + 1] = ((rgb >> 8 & 255) * shade + out[j + 1] * under) / alpha;
        out[j + 2] = ((rgb & 255) * shade + out[j + 2] * under) / alpha;
        out[j + 3] = alpha * 255;
      }
      // And the light of beams. (Where nothing's drawn it can't be added to the backdrop: it covers it as far as it's bright.)
      for (let k = 0; k < rays; k++) {
        if (rayT[k] >= bestT) continue;
        const rgb = rayColor[k] % EMITS, bright = Math.floor(rayColor[k] / EMITS) / 255, was = out[j + 3] / 255, alpha = was + (1 - was) * bright;
        if (alpha <= 0) continue;
        out[j] = (out[j] * was + (rgb >> 16) * bright) / alpha;
        out[j + 1] = (out[j + 1] * was + (rgb >> 8 & 255) * bright) / alpha;
        out[j + 2] = (out[j + 2] * was + (rgb & 255) * bright) / alpha;
        out[j + 3] = alpha * 255;
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
const groundArt = night => {
  // A biome's night has its floor by day (the stage dims it).
  const biome = night.replace(/_night$/, "");
  // Only villages are BIOMES; the Mobs tab's cave, trial chamber, stronghold, deep dark, nether, End, ocean, lush pool and flooded caves, the tadpole's swamp water, the wolves' wild
  // badlands, the mooshroom's mushroom fields and the goat's peaks have floors of their own.
  const name = (BIOMES.find(b => b.k === biome) || { ground: { village: "grass_top", peaks: "snow",
    mushroom_fields: "mycelium_top", badlands: "red_sand", mineshaft: "stone", mansion: "planks_dark_oak", trial_chamber: "tuff_bricks", stronghold: "stone_bricks", deep_dark: "deepslate_tiles", plains: "grass_top", cherry_grove: "grass_top", pale_garden: "pale_moss_block", dappled_forest: "grass_top", sulfur_caves: "sulfur", nether: "netherrack", end_city: "end_stone", end_island: "end_stone", ocean: "sand", lush_pool: "clay", flooded_cave: "gravel", swamp_water: "mud" }[biome] || "stone" }).ground, tex = art(name);
  if (!tex) return icon(`biome:${biome}`);
  return paint(16, name === "grass_top" ? multiplied(tex, BIOME_TINTS[biome].grass) : tex);
};
