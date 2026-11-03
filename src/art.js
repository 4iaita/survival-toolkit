/* ---------- Texture pack art ----------
 * build.py embeds the 16×16 PNGs from art/ (copied from the texture pack by import_textures.py) as ART: name → base64 RGBA.
 * Icons whose texture is missing keep the drawn templates.
 */
function art(name) {
  const cache = art.cache || (art.cache = {});
  if (!(name in cache)) {
    const b64 = typeof ART !== "undefined" && ART[name];
    let px = null;
    if (b64) {
      const bin = atob(b64);
      px = [];
      for (let i = 0; i < 256; i++) {
        px.push(bin.charCodeAt(i * 4 + 3) < 64 ? null : [0, 1, 2].map(k => bin.charCodeAt(i * 4 + k)));
      }
    }
    cache[name] = px;
  }
  return cache[name];
}
const hasArt = (...names) => names.every(n => art(n));

// Biome colors from the game's color maps, for the gray textures it tints: foliage, grass and (swamp) water.
const BIOME_TINTS = {
  plains: { foliage: "#77ab2f", grass: "#91bd59" },
  desert: { foliage: "#aea42a", grass: "#bfb755" },
  savanna: { foliage: "#aea42a", grass: "#bfb755" },
  snowy: { foliage: "#60a17b", grass: "#80b497" },
  taiga: { foliage: "#68a464", grass: "#86b783" },
  jungle: { foliage: "#30bb0b", grass: "#59c93c" },
  swamp: { foliage: "#6a7039", grass: "#6a7039", water: "#617b64" },
};

// Grass, leaves and water are gray in the pack; the game colors them by multiplying with the biome's tint.
const multiplied = (px, color) => {
  const c = hex(color);
  return px.map(p => p && p.map((v, k) => Math.round((v * c[k]) / 255)));
};

// Gray mask textures (tipped arrow heads, potion liquid) get colored the way the game does: brightness × tint.
function tinted(px, color) {
  const lum = p => (p[0] + p[1] + p[2]) / 3;
  const max = Math.max(...px.filter(Boolean).map(lum));
  const c = hex(color);
  return px.map(p => p && c.map(v => Math.round((v * lum(p)) / max)));
}

// Stack texture layers, each [name], [name, tint] or [name, tint, "multiply"]; later layers cover earlier ones.
function artLayers(layers) {
  const out = new Array(256).fill(null);
  for (const [name, color, mode] of layers) {
    const px = !color ? art(name) : mode === "multiply" ? multiplied(art(name), color) : tinted(art(name), color);
    px.forEach((p, i) => { if (p) out[i] = p; });
  }
  return out;
}

// The pack's potions come pre-colored, one texture per effect. The liquid is the part where the
// water and healing bottles differ; it is recolored from the healing bottle's shading.
function potionArt(bottle, color) {
  const water = art(bottle), heal = art(`${bottle}_heal`);
  const liquid = tinted(heal.map((p, i) => (p && water[i] && p.some((v, k) => v !== water[i][k]) ? p : null)), color);
  return water.map((p, i) => liquid[i] || p);
}

// Block models made of boxes (the anvil), in 16-unit block space, seen from the same angle as cube().
// Each pixel looks along the view ray and takes the nearest box face: top, left (+z) or right (+x);
// where that face's texel is see-through, the next box behind it shows instead.
// A box is [x0, y0, z0, x1, y1, z1], textured with art on the sides and top on the model's top face,
// or { b: [x0, …], faces: [right, top, left] } for model textures, each face [art name, du, dv, turn]:
// the texel offset that lines the face up with its corner of the texture, and turn swaps u and v on the top.
function boxModel({ boxes, art: side, top }, size = 32) {
  const out = new Array(size * size).fill(null), k = size / 16;
  const plain = [[side], [top], [side]];
  const models = boxes.map(box => ({ b: box.b || box, plain: !box.b, faces: (box.faces || plain).map(([n, du = 0, dv = 0, turn]) => [art(n), du, dv, turn]) }));
  const texel = (tex, u, v) => tex && tex[(Math.min(15, Math.floor(v)) & 15) * 16 + (Math.min(15, Math.floor(u)) & 15)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const a = 2 * ((x + 0.5) / k - 8), b = 4 * ((y + 0.5) / k - 8);
    const p = [(a + b) / 2, 0, (b - a) / 2];
    const hits = [];
    for (const m of models) {
      let enter = -Infinity, exit = Infinity, axis = -1;
      for (let i = 0; i < 3; i++) {
        enter = Math.max(enter, m.b[i] - p[i]);
        if (m.b[i + 3] - p[i] < exit) { exit = m.b[i + 3] - p[i]; axis = i; }
      }
      if (enter < exit) hits.push([exit, axis, m]);
    }
    hits.sort((h, g) => g[0] - h[0]);
    for (const [t, face, m] of hits) {
      const [X, Y, Z] = p.map(v => v + t);
      let [tex, du, dv, turn] = m.faces[face];
      // Plain boxes use the top texture only on the model's top face.
      if (m.plain && face === 1 && !(Y >= 16 && tex)) tex = m.faces[0][0];
      const px = face === 1 ? (turn ? texel(tex, Z + du, X + dv) : texel(tex, X + du, Z + dv))
        : face === 2 ? texel(tex, X + du, 16 - Y + dv) : texel(tex, 16 - Z + du, 16 - Y + dv);
      if (!px) continue;
      const f = [0.62, 1, 0.8][face];
      out[y * size + x] = px.map(c => Math.round(c * f));
      break;
    }
  }
  return out;
}

// Rod-shaped blocks (lightning rod) ship a model map: a 4×4 tip and a 2-wide shaft in the top-left corner.
// Stand them upright in the middle of the icon.
function uprightRod(name) {
  const tex = art(name), out = new Array(256).fill(null);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) out[(y + 1) * 16 + 6 + x] = tex[y * 16 + x];
  for (let y = 4; y < 15; y++) for (let x = 0; x < 2; x++) out[(y + 1) * 16 + 7 + x] = tex[y * 16 + x];
  return out;
}

// Every texture a spec needs, as [name] entries.
const artNeeds = spec => (spec.rod ? [[spec.rod]]
  : spec.boxes ? (spec.art ? [[spec.art], [spec.top]] : spec.boxes.flatMap(box => box.faces))
  : spec.cube ? spec.cube.flat() : spec.layers);

function artPixels(spec) {
  if (spec.rod) return uprightRod(spec.rod);
  if (spec.boxes) return boxModel(spec);
  if (!spec.cube) return artLayers(spec.layers);
  const [side, top = side, right = side] = spec.cube.map(artLayers);
  return cube(side, top, right, 32);
}

// Page backdrop: the pack's deepslate tiles, darkened so text stays readable, at 2× so the CSS size matches.
function artBackdrop(name, f = 0.55) {
  const tex = art(name);
  return tex && Array.from({ length: 1024 }, (_, i) => (tex[((i / 64) | 0) * 16 + ((i % 32) >> 1)] || [0, 0, 0]).map(v => Math.round(v * f)));
}
