/* ---------- Villager sprites ----------
 * The texture pack ships no villager skins (only empty placeholders), so villagers are original pixel art:
 * a 16×32 front view whose robe is colored by biome, with a biome hat and a profession outfit on top.
 * Template letters: s/S/z skin (light → dark), n/N nose, b brow, e/i eye white and iris,
 * 1-4 robe (light → dark), t/T trim. Outfit parts bring their own colors.
 */
const SKIN = { s: "#c39a7f", S: "#a77d62", z: "#875e45", n: "#b98b6f", N: "#7d523b", b: "#3a2a22", e: "#f2f2f2", i: "#3c8c3a" };

const VILLAGER_BODY = [
  "................",
  "................",
  "................",
  "....ssssssss....",
  "....ssssssss....",
  "....sssssssS....",
  "....sbbbbbbS....",
  "....seinnieS....",
  "....sSSnnSSS....",
  "....sssnnssS....",
  "....sssnnssS....",
  "....SssNNsSz....",
  "....zSSSSSSz....",
  "....tt2222tt....",
  "....1t2222t3....",
  "....12222223....",
  "....12222223....",
  "....12222223....",
  "....12222223....",
  "....12222223....",
  "....12222223....",
  "....12222223....",
  "....12223223....",
  "....12223223....",
  "....12232233....",
  "....12232233....",
  "....12232233....",
  "....tttttttT....",
  "....44434443....",
  "....44434443....",
  "....44434443....",
  "....33433343....",
];

// Arms folded across the chest, drawn over any apron.
const VILLAGER_ARMS = [
  ".111........333.",
  ".122........233.",
  ".122........233.",
  ".122........233.",
  ".122........233.",
  ".12111111111133.",
  ".1222ssssss3333.",
  ".1222SSSSSS3333.",
  ".13333333333344.",
];
const ARMS_Y = 13;

// An outfit part: rows drawn from row y down, "." is see-through.
const part = (y, c, rows) => ({ y, c, rows });

const APRON = [
  ".....a....a.....",
  ".....a....a.....",
  ".....a....a.....",
  ".....a....a.....",
  ".....a....a.....",
  ".....aaaaaa.....",
  ".....aaaaaa.....",
  ".....aaaaaa.....",
  ".....aaaaaa.....",
  ".....aaaaaA.....",
  ".....aaaaaA.....",
  ".....aaaaaA.....",
  ".....aaaaaA.....",
  ".....aaaaaA.....",
  ".....AAAAAA.....",
];
const apron = (a, A, marks = {}) => part(13, { a, A, ...marks }, APRON.map((row, y) => (marks.rows && marks.rows[y]) || row));

const BIOMES = [
  { k: "plains", n: "Plains", robe: ["#a5774f", "#8c613d", "#714c2e", "#51361f"], trim: ["#5d8a37", "#3f6524"],
    ground: "grass_block_top" },
  { k: "desert", n: "Desert", robe: ["#ead7a1", "#d6bd82", "#b79d62", "#86703f"], trim: ["#c8472d", "#8f2d1b"],
    ground: "sand",
    hat: part(1, { c: "#efe3c2", C: "#cdbd96", r: "#c8472d" }, [
      "................",
      ".....cccccc.....",
      "....cccccccc....",
      "....CccccccC....",
      "....rrrrrrrr....",
    ]) },
  { k: "savanna", n: "Savanna", robe: ["#d9823f", "#bf672c", "#9a4f1f", "#6a3412"], trim: ["#f1c63f", "#b98c1b"],
    ground: "coarse_dirt",
    hat: part(4, { o: "#b5322a", y: "#f1c63f" }, [
      "....oyoyoyoy....",
    ]) },
  { k: "snowy", n: "Snowy", robe: ["#eef3f7", "#d2dee8", "#a9bccb", "#748a9c"], trim: ["#3f63a3", "#284273"],
    ground: "snow",
    hat: part(1, { w: "#f6f6f6", W: "#cfd6dc", k: "#3f63a3" }, [
      "....wwwwwwww....",
      "...wwWwwwwWww...",
      "...kkkkkkkkkk...",
      "...w........w...",
      "...W........W...",
      "...w........w...",
      "...W........W...",
    ]) },
  { k: "taiga", n: "Taiga", robe: ["#81613f", "#684b2d", "#4f371f", "#352313"], trim: ["#d6cab0", "#a29475"],
    ground: "podzol_top",
    hat: part(1, { f: "#8b6a48", F: "#6a4e33" }, [
      "....ffffffff....",
      "...fFfffFfffF...",
      "...FFFFFFFFFF...",
    ]) },
  { k: "jungle", n: "Jungle", robe: ["#6fa64a", "#578a38", "#426d29", "#2b4b19"], trim: ["#b07b44", "#7d5429"],
    ground: "grass_block_top",
    hat: part(0, { g: "#5fb33a", G: "#3e8325" }, [
      ".....g...g......",
      "....gGg.gGg.g...",
      "...gGgggGgggGg..",
      "....gggggggg....",
    ]) },
  { k: "swamp", n: "Swamp", robe: ["#66724f", "#515c3d", "#3d462d", "#282e1d"], trim: ["#7f5390", "#59376b"],
    ground: "mud",
    hat: part(1, { m: "#4f7a2c", M: "#355a1c" }, [
      ".....mmmmmm.....",
      "....mMmmmMmm....",
      "...mmmmmmmmmm...",
      "...m.M....m.M...",
      "...M......M.....",
    ]) },
];

// Profession outfits: a hat (which hides the biome hat), something on the face, an apron, or a robe color.
const OUTFITS = {
  farmer: { hat: part(1, { y: "#e9c95a", Y: "#c29b32", r: "#a13a2a" }, [
    ".....yyyyyy.....",
    "....yyyYyyyy....",
    "....rrrrrrrr....",
    "..yyyyyyyyyyyy..",
  ]) },
  fisherman: { hat: part(1, { h: "#c7a76a", H: "#9a7c45" }, [
    "....hhhhhhhh....",
    "....hhhhhhhH....",
    "...hhhhhhhhhH...",
    "...HHHHHHHHHH...",
  ]) },
  shepherd: { hat: part(1, { h: "#7a5534", H: "#563a22" }, [
    ".....hhhhhh.....",
    ".....hhhhhH.....",
    "....HHHHHHHH....",
    "..hhhhhhhhhhhH..",
  ]) },
  fletcher: { hat: part(0, { h: "#5f8a3a", H: "#426528", r: "#d24a3a", R: "#962c21" }, [
    "............r...",
    ".....hhhhhh.rR..",
    ".....hhhhhHrR...",
    "....hhhhhhhh....",
    "...hHHHHHHHHh...",
  ]) },
  librarian: { hat: part(0, { h: "#8b2b2b", H: "#5e1a1a", g: "#e8d9a8" }, [
    "....hhhhhhhh....",
    "....hggggggh....",
    "....hhhhhhhh....",
    "....HHHHHHHH....",
  ]) },
  cleric: { robe: ["#a464c2", "#874aa5", "#683583", "#45215a"], trim: ["#e8c24c", "#ad8722"] },
  cartographer: { face: part(6, { o: "#e8c24c" }, [
    "........oooo....",
    "........o..o....",
    "........oooo....",
    "...........o....",
    "...........o....",
  ]) },
  armorer: {
    face: part(5, { m: "#5a5a5a", v: "#1b1b1b" }, [
      "....mmmmmmmm....",
      "....mmmmmmmm....",
      "....vvvvvvvv....",
      "....mmmmmmmm....",
    ]),
    apron: apron("#4d4d4d", "#363636") },
  weaponsmith: {
    face: part(6, { k: "#1d1d1d" }, [
      "....kkkkkkkk....",
      ".....kk.........",
    ]),
    apron: apron("#2c2c2c", "#1b1b1b") },
  toolsmith: { apron: apron("#3a3a3a", "#262626", { rows: { 9: ".....aaYaaA.....", 10: ".....aaYaaA....." }, Y: "#b9b9b9" }) },
  butcher: {
    face: part(5, { r: "#b5322a" }, ["....rrrrrrrr...."]),
    apron: apron("#ececec", "#c4c4c4", { rows: { 10: ".....aaraaA.....", 12: ".....araaaA....." }, r: "#b5322a" }) },
  leatherworker: { apron: apron("#9b6436", "#744822", { rows: { 9: ".....alalaA.....", 13: ".....alalaA....." }, l: "#cf9a62" }) },
  mason: { apron: apron("#a8a8a8", "#828282") },
};

// A villager as 18×34 pixels: the figure with a dark outline around it, as in the item icons.
function villagerPixels(biomeKey, profession) {
  const biome = BIOMES.find(b => b.k === biomeKey) || BIOMES[0], outfit = OUTFITS[profession] || {};
  const robe = outfit.robe || biome.robe, trim = outfit.trim || biome.trim;
  const pal = { ...SKIN, 1: robe[0], 2: robe[1], 3: robe[2], 4: robe[3], t: trim[0], T: trim[1] };
  const W = 18, H = 34, px = new Array(W * H).fill(null);
  const draw = (rows, colors, top) => rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== ".") px[(top + y + 1) * W + x + 1] = hex(colors[ch] || "#ff00ff");
  }));
  draw(VILLAGER_BODY, pal, 0);
  if (outfit.apron) draw(outfit.apron.rows, outfit.apron.c, outfit.apron.y);
  draw(VILLAGER_ARMS, pal, ARMS_Y);
  for (const p of [outfit.face, outfit.hat || biome.hat]) if (p) draw(p.rows, p.c, p.y);
  return px.map((p, i) => {
    if (p) return p;
    const x = i % W, y = (i / W) | 0;
    const n = [x > 0 && i - 1, x < W - 1 && i + 1, y > 0 && i - W, y < H - 1 && i + W].find(j => j !== false && px[j]);
    return n === undefined ? null : px[n].map(v => Math.round(v * 0.3));
  });
}

const villagerCache = {};
const villagerArt = (biome, profession) =>
  villagerCache[biome + profession] || (villagerCache[biome + profession] = paint(18, villagerPixels(biome, profession), 34));

// The biome's ground texture, tiled under the villager.
const groundArt = biome => {
  const tex = art(BIOMES.find(b => b.k === biome).ground);
  return tex ? paint(16, tex) : icon(`biome:${biome}`);
};
