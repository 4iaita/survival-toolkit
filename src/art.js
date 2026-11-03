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

// Gray mask textures (tipped arrow heads, potion liquid) get colored the way the game does: brightness × tint.
function tinted(px, color) {
  const lum = p => (p[0] + p[1] + p[2]) / 3;
  const max = Math.max(...px.filter(Boolean).map(lum));
  const c = hex(color);
  return px.map(p => p && c.map(v => Math.round((v * lum(p)) / max)));
}

// Stack texture layers, each [name] or [name, tint]; later layers cover earlier ones.
function artLayers(layers) {
  const out = new Array(256).fill(null);
  for (const [name, color] of layers) {
    const px = color ? tinted(art(name), color) : art(name);
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

// Drawn template silhouette filled with a texture; template shades 1-4 light or darken it.
function artShape(t, name) {
  const base = fromTemplate({ t }), tex = art(name), rows = TPL[t];
  const shade = { 1: 1.3, 2: 1, 3: 0.75, 4: 0.55 };
  return base.map((p, i) => {
    const f = shade[(rows[(i / 16) | 0] || "")[i % 16]];
    return f && tex[i] ? tex[i].map(v => Math.min(255, Math.round(v * f))) : p;
  });
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
const artNeeds = spec => (spec.rod ? [[spec.rod]] : spec.shape ? [[spec.art]] : spec.cube ? spec.cube.flat() : spec.layers);

function artPixels(spec) {
  if (spec.rod) return uprightRod(spec.rod);
  if (spec.shape) return artShape(spec.shape, spec.art);
  if (!spec.cube) return artLayers(spec.layers);
  const [side, top = side, right = side] = spec.cube.map(artLayers);
  return cube(side, top, right, 32);
}

// Page backdrop: the pack's deepslate tiles, darkened so text stays readable, at 2× so the CSS size matches.
function artBackdrop(name, f = 0.55) {
  const tex = art(name);
  return tex && Array.from({ length: 1024 }, (_, i) => (tex[((i / 64) | 0) * 16 + ((i % 32) >> 1)] || [0, 0, 0]).map(v => Math.round(v * f)));
}
