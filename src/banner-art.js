/* ---------- Banners: the banner being designed, and its pictures ----------
 * Apart from the tab (banner-ui.js) as the Equipment tab, which loads before it, puts the design on its shield (bannerShield in
 * src/player.js, the shield's icon in gear-ui.js).
 */
// The banner: its color (a DYES name), its layers ([pattern, dye], the first at the bottom), whether it's the ominous banner (which
// a loom can't make), the dye the next layer is added in, which section shows, what the search has in it, and whether it's shown as
// a banner or on a shield (view).
const bnr = { base: "white", layers: [], ominous: false, ink: "red", section: "about", query: "", view: "banner" };
const BANNER_KEY = "banners-v1";
try { Object.assign(bnr, JSON.parse(localStorage.getItem(BANNER_KEY) || "{}")); } catch (_) {}
if (!DYES[bnr.base]) bnr.base = "white";
if (!DYES[bnr.ink]) bnr.ink = "red";
if (bnr.view !== "shield") bnr.view = "banner";
const onShield = () => bnr.view === "shield";
bnr.layers = Array.isArray(bnr.layers) ? bnr.layers.filter(l => Array.isArray(l) && bannerPattern(l[0]) && DYES[l[1]]).slice(0, BANNER_MAX) : [];
if (bnr.ominous) bnr.layers = OMINOUS_LAYERS.map(l => [...l]);
const saveBanner = () => { try { localStorage.setItem(BANNER_KEY, JSON.stringify(bnr)); } catch (_) {} };
// The design as a key, for the pictures' caches and the shield's look on the Equipment tab: the edition, then the ominous banner, or
// its color and layers (dye ids, so no spaces); designOf reads one back.
const designKey = (b, edition) => (b.ominous ? `${edition}|ominous` : `${edition}|${dyeId(b.base)}|${b.layers.map(([k, c]) => `${k}:${dyeId(c)}`).join(",")}`);
function designOf(key) {
  const [edition, base, layers = ""] = key.split("|"), dye = c => c.replace("_", " ");
  const b = base === "ominous" ? { base: "white", layers: OMINOUS_LAYERS, ominous: true } : { base: dye(base), layers: layers ? layers.split(",").map(l => l.split(":")).map(([k, c]) => [k, dye(c)]) : [], ominous: false };
  return { edition, b };
}

const bnEdition = () => (state.edition === "bedrock" ? "bedrock" : "java");

/* Names, as the game's tooltips have them (the rest are banner-ui.js's) */
const patternName = k => { const p = bannerPattern(k); return (bnEdition() === "bedrock" && p.be) || p.n; };
const layerName = ([k, c]) => `${titled(c)} ${patternName(k)}`;
const bannerName = (b = bnr) => (b.ominous ? "Ominous Banner" : `${titled(b.base)} Banner`);
// A shield with a banner on it is named for the banner's color in both games ("item.minecraft.shield.red", "item.shield.red.name"),
// the ominous one too (a white banner): neither game has a name of its own for it.
const shieldName = (b = bnr) => `${titled(b.base)} Shield`;
// Bedrock's ominous banner is an item of its own, a picture with no layers.
const ownOminous = () => bnr.ominous && bnEdition() === "bedrock";

/* The pictures: the pack's cloth (and ominous banner) and each edition's patterns, decoded once */
const bannerArt = {};
const bannerArtReady = Promise.all(Object.entries(typeof BANNER_ART === "undefined" ? {} : BANNER_ART).map(([k, src]) => new Promise(done => {
  const img = new Image();
  img.onload = () => { bannerArt[k] = { w: img.width, h: img.height, px: filePixels(img) }; done(); };
  img.onerror = done;
  img.src = src;
})));
// The flag's part of the texture, as import_banner_patterns.py keeps each pattern (BOX).
const BANNER_BOX = [44, 42];
const dyeRgb = c => [1, 3, 5].map(i => parseInt(DYES[c].slice(i, i + 2), 16));
// The banner's texture (64×64, the pack's layout): each texel of the flag takes the base's color, then each layer's dye as solid as
// the pattern is there, all shaded by the pack's cloth (white with its weave); the pole and the bar are the pack's. Bedrock's ominous
// banner is the pack's own picture of it.
const bannerTextures = new Map();
function bannerTexture(b, edition = bnEdition()) {
  const own = b.ominous && edition === "bedrock", key = designKey(b, edition);
  if (bannerTextures.has(key)) return bannerTextures.get(key);
  const cloth = bannerArt[own ? "ominous" : "cloth"], masks = bannerArt[edition];
  if (!cloth || (!own && !masks)) return null;
  const px = Uint8ClampedArray.from(cloth.px), [bw, bh] = BANNER_BOX;
  if (!own) {
    const layers = [["base", b.base], ...b.layers].map(([k, c]) => [BANNER_ROW[k] * bh, dyeRgb(c)]);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      if (!masks.px[(y * bw + x) * 4]) continue;
      let r = 0, g = 0, bl = 0;
      for (const [row, [dr, dg, db]] of layers) {
        const a = masks.px[((row + y) * bw + x) * 4] / 255;
        if (!a) continue;
        r += (dr - r) * a;
        g += (dg - g) * a;
        bl += (db - bl) * a;
      }
      const n = (y * 64 + x) * 4;
      px[n] = r * px[n] / 255;
      px[n + 1] = g * px[n + 1] / 255;
      px[n + 2] = bl * px[n + 2] / 255;
    }
  }
  const tex = { w: 64, h: 64, px };
  if (bannerTextures.size > 400) bannerTextures.clear();
  bannerTextures.set(key, tex);
  return tex;
}
// The shield with the banner on it (64×64, the pack's shield): over the pattern area (the plate's front inside its rim, 10×20), the
// base's dye, then each layer's as solid as its pattern is there, each times the pattern's own gray, as the game draws it (the pack has
// no cloth for a shield). Each edition draws its own patterns (art/banners/shield_<edition>.png). Bedrock's ominous banner goes on as
// a picture of its own, which the pack redraws as a whole shield.
const SHIELD_AREA = [2, 2, 10, 20];
const shieldTextures = new Map();
function shieldTexture(b, edition = bnEdition()) {
  const own = b.ominous && edition === "bedrock", key = designKey(b, edition);
  if (shieldTextures.has(key)) return shieldTextures.get(key);
  const plain = bannerArt[own ? "shield_ominous" : "shield"], masks = bannerArt[`shield_${edition}`];
  if (!plain || (!own && !masks)) return null;
  const px = Uint8ClampedArray.from(plain.px), [ax, ay, aw, ah] = SHIELD_AREA;
  if (!own) {
    const layers = [["base", b.base], ...b.layers].map(([k, c]) => [BANNER_ROW[k] * ah, dyeRgb(c)]);
    for (let y = 0; y < ah; y++) for (let x = 0; x < aw; x++) {
      const n = ((ay + y) * 64 + ax + x) * 4, rgb = [px[n], px[n + 1], px[n + 2]];
      for (const [row, dye] of layers) {
        const m = ((row + y) * aw + x) * 4, a = masks.px[m + 3] / 255, gray = masks.px[m] / 255;
        if (a) for (let c = 0; c < 3; c++) rgb[c] += (dye[c] * gray - rgb[c]) * a;
      }
      px.set(rgb, n);
    }
  }
  const tex = { w: 64, h: 64, px };
  if (shieldTextures.size > 400) shieldTextures.clear();
  shieldTextures.set(key, tex);
  return tex;
}
// The shield with a design on it (a designKey), once the pictures are in: the Equipment tab's player's (bannerShield in src/player.js).
function shieldOfDesign(key) {
  return bannerArtReady.then(() => { const { edition, b } = designOf(key); return shieldTexture(b, edition); });
}

// The shield standing on its bottom edge, the game's model (SHIELD_CUBES: the plate, its handle behind), its front to the reader.
function shieldModel(tex, lit) {
  return SHIELD_CUBES.map(({ lo, hi, uv }) => {
    const size = hi.map((v, i) => v - lo[i]);
    return { lo: [lo[0], GROUND - 22 + lo[1], lo[2]], hi: [hi[0], GROUND - 22 + hi[1], hi[2]], color: (axis, side, fx, fy, fz) => {
      const n = skinTexel(uv, size, FACES[axis][side], fx, fy, fz);
      return tex.px[n + 3] < 128 ? -1 : lit + (tex.px[n] << 16 | tex.px[n + 1] << 8 | tex.px[n + 2]);
    } };
  });
}
// The shield's icon with a design on it (a designKey), as ICONS.shield's is drawn: an ICONS key, the plain shield's until the pictures are in.
function shieldIconOf(key) {
  const { edition, b } = designOf(key), tex = shieldTexture(b, edition), k = `shield:${key}`;
  if (!tex || !ICONS.shield) return "shield";
  if (!ICONS[k]) ICONS[k] = { gen: () => shieldIcon(shieldModel(tex, shieldIconLit())) };
  return k;
}
