/* ---------- Texture pack art ----------
 * build.py embeds the 16×16 PNGs from art/ (Pixel Perfection CE, CC BY-SA 4.0) as ART: name → base64 RGBA.
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

// Gray mask textures (potion liquid, leather, grass) get colored the way the game does: brightness × tint.
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

const artPixels = spec => (spec.cube ? cube(artLayers(spec.cube[0]), artLayers(spec.cube[1] || spec.cube[0])) : artLayers(spec.layers));
