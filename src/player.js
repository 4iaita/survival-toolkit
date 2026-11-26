/* ---------- The player ----------
 * Who stands on the Equipment tab's stage, in what's worn and held: a look made up as it's asked for (playerLook), drawn as a
 * mob's is (src/mobs.js). PLAYER_SKINS, PLAYER_STANCES, GEAR_MODELS and GEAR_WORN (src/player-models.js, written by
 * import_player.py) say who there is, how they stand by what's in hand, and what each thing looks like and where it goes.
 */
// A flat picture in the hand, as the game draws one: a plate a pixel thick, the picture on both sides, with a little cube for
// each pixel at an edge. It lies across x and z from at, 16 across whatever the picture's size, its thickness down.
function spriteCubes(tex, at) {
  const n = tex.w, unit = 16 / n, on = (x, y) => x >= 0 && x < n && y >= 0 && y < n && tex.px[(y * n + x) * 4 + 3] >= 128;
  const face = [0, n, n, -n], cubes = [[at[0], at[1] - 1, at[2], 16, 1, 16, { u: face, d: face }]];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!on(x, y) || (on(x - 1, y) && on(x + 1, y) && on(x, y - 1) && on(x, y + 1))) continue;
    const texel = [x, y, 1, 1];
    cubes.push([at[0] + x * unit, at[1] - 1, at[2] + y * unit, unit, 1, unit, { n: texel, s: texel, e: texel, w: texel }]);
  }
  return cubes;
}

// A model without the cubes its texture leaves clear (most of a skin's outer layer), which would be drawn for nothing: a MOB_MODELS key.
// least: the faintest texel that shows (1 where alpha is how much it glows: a trim).
async function drawnModel(key, texture, least = 128) {
  const id = `${key}/${texture}/drawn`, tex = MOB_MODELS[id] ? null : await mobTexture(texture);
  if (!tex) return id in MOB_MODELS ? id : key;
  const [tw, th, bones] = MOB_MODELS[key], kx = tex.w / tw, ky = tex.h / th;
  const shows = rect => {
    if (!rect) return false;
    const [u, v, w, h] = rect, across = [u, u + w].map(n => n * kx).sort((a, b) => a - b), down = [v, v + h].map(n => n * ky).sort((a, b) => a - b);
    for (let y = Math.max(0, Math.floor(down[0])); y < Math.min(tex.h, Math.ceil(down[1])); y++)
      for (let x = Math.max(0, Math.floor(across[0])); x < Math.min(tex.w, Math.ceil(across[1])); x++) if (tex.px[(y * tex.w + x) * 4 + 3] >= least) return true;
    return false;
  };
  MOB_MODELS[id] = [tw, th, bones.map(([name, parent, pivot, turn, cubes]) => [name, parent, pivot, turn, cubes.filter(([, , , w, h, d, uv]) => Object.keys(FACE_UV).some(face => shows(faceRect(uv, [w, h, d], face))))])];
  return id;
}

// Something worn or held (a GEAR_MODELS key) on a body's bones: all of those with nothing to draw, then its own, each measured
// from the pivot of the bone it hangs from. Kept by body and thing (and picture, for a flat one), as MOB_MODELS keys.
async function gearModel(body, key, texture) {
  const id = `${body}/${key}/${texture}`;
  if (MOB_MODELS[id]) return id;
  const [tw, th, gear] = GEAR_MODELS[key], bones = MOB_MODELS[`player_${body}`][2].map(([name, parent, pivot, turn]) => [name, parent, pivot, turn, []]);
  const base = bones.length, from = [], flat = gear.some(b => b[4] === "sprite") ? await mobTexture(texture) : null;
  if (gear.some(b => b[4] === "sprite") && !flat) return null;
  gear.forEach(([name, parent, pivot, turn, cubes], i) => {
    const on = typeof parent === "string" ? bones.findIndex(b => b[0] === parent) : base + parent;
    const at = from[i] = typeof parent === "string" ? bones[on][2] : from[parent], moved = p => p.map((v, k) => v + at[k]);
    bones.push([`${key}:${name}`, on, moved(pivot), turn, cubes === "sprite" ? spriteCubes(flat, moved(pivot))
      : cubes.map(([x, y, z, w, h, d, uv, extra]) => [...moved([x, y, z]), w, h, d, uv, extra && extra.pivot ? { ...extra, pivot: moved(extra.pivot) } : extra])]);
  });
  MOB_MODELS[id] = flat ? [flat.w, flat.h, bones] : [tw, th, bones];
  return id;
}

// A worn thing as playerLook takes it: its GEAR_WORN key, then what's on it, each after a "+": "trim=<trim>.<a TRIM_COLORS palette>",
// "dye=<a DYES color>", "banner=<a designKey>" (the Banners tab's design, on a shield) and "glint" when it's enchanted.
function wornParts(look) {
  const [key, ...more] = look.split("+"), part = name => (more.find(m => m.startsWith(`${name}=`)) || "").slice(name.length + 1) || null;
  return { key, trim: part("trim"), dye: part("dye"), banner: part("banner"), glint: more.includes("glint") };
}
// A texture the page makes from one of the pack's, kept with the rest (mobTextures) under its own name, which it returns.
function madeTexture(name, from, make) {
  if (!mobTextures[name]) mobTextures[name] = mobTexture(from).then(t => (t ? make(t) : null));
  return name;
}
// A trim in its material's colors (see trims() in import_player.py): each gray of the game's key palette takes the color, and alpha
// (how much it glows), at its place in the material's palette. Leggings have their own where the pack's differs.
function trimTexture(trim, palette, legs) {
  const from = `player_trim_${trim}${legs && MOB_SKINS[`player_trim_${trim}_leggings`] ? "_leggings" : ""}`;
  return madeTexture(`${from}@${palette}`, from, t => {
    const colors = TRIM_COLORS.palettes[palette].map(c => [1, 3, 5, 7].map(i => parseInt(c.slice(i, i + 2), 16))), px = new Uint8ClampedArray(t.px.length);
    for (let k = 0; k < px.length; k += 4) if (t.px[k + 3]) px.set(colors[TRIM_COLORS.key.indexOf(t.px[k])] || [0, 0, 0, 0], k);
    return { w: t.w, h: t.h, px };
  });
}
// Leather in a dye: as import_player.py's leather_texture colors it undyed, its solid texels times the color, its faint ones as they are.
function dyedLeather(dye) {
  return madeTexture(`player_armor_leather@${dye}`, "player_armor_leather_dye", t => {
    const color = hex(DYES[dye]), px = new Uint8ClampedArray(t.px.length);
    for (let k = 0; k < px.length; k += 4) {
      const a = t.px[k + 3];
      for (let c = 0; c < 3; c++) px[k + c] = a > 127 ? Math.floor(t.px[k + c] * color[c] / 255) : t.px[k + c];
      px[k + 3] = a ? 255 : 0;
    }
    return { w: t.w, h: t.h, px };
  });
}

// The shield with a banner's design on it (src/banner-ui.js draws it: the pack's shield, the patterns over its front).
const bannerShield = design => madeTexture(`player_shield@${design}`, "player_shield", () => shieldOfDesign(design));

// The pack takes a mace in both hands even with a shield in the other, which brings the shield across the chest, and its edge out
// through the left shoulder pad's outer cube (the 6-wide shell round a 5-wide one): that cube is left out then, as the user asked;
// the inner one stays, behind the shield. A MOB_MODELS key.
function unshelled(id) {
  const out = `${id}/unshelled`;
  if (!MOB_MODELS[out]) {
    const [tw, th, bones] = MOB_MODELS[id], size = (c, n) => c[3] === n && c[4] === n && c[5] === n;
    MOB_MODELS[out] = [tw, th, bones.map(b => {
      const left = b[1] >= 0 && /:(leftarm|d62l96j2)$/.test(b[0]), shell = left && b[4].some(c => size(c, 5));
      return shell ? [...b.slice(0, 4), b[4].filter(c => !size(c, 6))] : b;
    })];
  }
  return out;
}

// A Morph whose head reaches out through a helmet's outer shell where the pack leaves it (Echo's hood, a 9-wide cube round its
// 8-wide head, shows through the gaps in every helmet's top): that cube is left out under a helmet, as the user asked. Morph ->
// [bone, the cube's width]. A MOB_MODELS key.
const UNDER_HELMET = { echo: ["egjh9headk4mdc", 9] };
function hooded(who, model) {
  if (!UNDER_HELMET[who] || !MOB_MODELS[model]) return model;
  const [bone, width] = UNDER_HELMET[who], out = `${model}/hooded`;
  if (!MOB_MODELS[out]) {
    const [tw, th, bones] = MOB_MODELS[model];
    MOB_MODELS[out] = [tw, th, bones.map(b => (b[0] === bone ? [...b.slice(0, 4), b[4].filter(c => c[3] !== width)] : b))];
  }
  return out;
}

// How big the player is on the stage, whatever they wear, in scene units: the height of a helmet, and how far out a hand reaches.
const PLAYER_FRAME = Object.assign([[-11, GROUND - 34, -11], [11, GROUND, 11]], { radius: 19 });
const PLAYER_SLOTS = ["head", "chest", "legs", "feet", "main", "off"];
// Looks as they've been made up, by their keys (looksOf).
const playerLooks = {};
// Someone (a PLAYER_SKINS key) in a set: slot -> what's worn there (wornParts). fresh: the slots whose things were just put on, which the
// player takes in hand, or which pop on, as the game has it. Returns the key of the look (mobScene.show), or null while a picture is missing.
async function playerLook(who, set, fresh = []) {
  const key = `player:${who}/${PLAYER_SLOTS.map(s => set[s] || "").join("/")}`, on = Object.fromEntries(PLAYER_SLOTS.map(s => [s, set[s] ? wornParts(set[s]) : {}]));
  const skin = PLAYER_SKINS[who], body = skin.body, worn = slot => GEAR_WORN[on[slot].key], shows = slot => worn(slot) && !(skin.off || []).includes(slot);
  if (!playerLooks[key]) {
    const pose = { ...skin.pose };
    // What's under what's worn is hidden as the pack hides it (Rana's hat under a helmet), and some wear no armor at all in places.
    const rules = Object.entries(skin.hides || {}).flatMap(([slot, names]) => (shows(slot) ? names.map(n => [n, false]) : []));
    // A skin, with what the pack draws over its face (FACE in import_player.py), the lids shut away until it blinks.
    const layers = skin.layers ? skin.layers.map(([model, textures, own, flags]) => [shows("head") ? hooded(who, model) : model, textures, [...own, ...rules], flags]) : [[await drawnModel(`player_${body}`, skin.texture), [skin.texture], [], {}],
      ...(skin.face ? [[await drawnModel("player_face", skin.texture), [skin.texture], [["3dafc7246*", false]], {}]] : [])];
    const crossed = on.main.key === "mace" && on.off.key === "shield", padded = (slot, id) => (crossed && slot === "chest" ? unshelled(id) : id);
    for (const slot of PLAYER_SLOTS.filter(shows)) {
      // Leather in its dye, everything enchanted shimmering (flags.glint), and a trim drawn over the armor where they meet, glowing.
      const { trim, dye, banner, glint } = on[slot];
      for (const [model, texture, flags] of worn(slot).layers) {
        const tex = dye && texture === "player_armor_leather" ? dyedLeather(dye) : banner && texture === "player_shield" ? bannerShield(banner) : texture;
        const made = await gearModel(body, model, tex), id = made && await drawnModel(made, tex);
        if (!id) return null;
        layers.push([padded(slot, id), [tex], [], { ...flags, held: slot === "main" || slot === "off" ? 1 : 0, ...(glint ? { glint: 1 } : {}) }]);
        for (const [bone, p] of Object.entries(worn(slot).pose || {})) pose[`${model}:${bone}`] = p;
      }
      if (trim && worn(slot).trim) {
        const [pattern, palette] = trim.split("."), tex = trimTexture(pattern, palette, slot === "legs");
        const made = await gearModel(body, worn(slot).trim, tex), id = made && await drawnModel(made, tex, 1);
        if (!id) return null;
        layers.push([padded(slot, id), [tex], [], { lit: 1, over: 1 }]);
      }
    }
    playerLooks[key] = { names: [], scale: skin.scale || 1, layers, pose, acts: skin.acts || null, framed: PLAYER_FRAME };
  }
  // What plays once starts now, for what's just been put on; the rest of it is long over.
  const now = performance.now() / 1000, starting = (loops, on) => loops.map(l => (l.once && on && !calmMotion() ? { ...l, at: now } : l));
  const stance = (worn("main") && worn("main").stance) || "empty", off = `${stance}_off`;
  const moves = PLAYER_STANCES[set.off && PLAYER_STANCES[off] ? off : stance].flatMap(k => PLAYER_MOVES[k]);
  const pops = fresh.filter(slot => GEAR_POPS[slot] && shows(slot)).map(slot => ({ ...GEAR_POPS[slot],
    bones: Object.fromEntries([...worn(slot).layers.map(([model]) => model), ...(on[slot].trim && worn(slot).trim ? [worn(slot).trim] : [])]
      .flatMap(model => Object.entries(GEAR_POPS[slot].bones).map(([bone, ch]) => [`${model}:${bone}`, ch]))) }));
  playerLooks[key].motions = [...starting(moves, fresh.includes("main")), ...starting(pops, true), ...(skin.loops || [])];
  return key;
}

// Someone's picture, size pixels square, as a PNG data URL: head and shoulders, or all of someone small. null without a texture.
async function playerBust(who, size) {
  const key = await playerLook(who, {}), look = key && playerLooks[key], boxes = look && await lookBoxes(look, { size: look.scale });
  if (!boxes || !boxes.length) return null;
  const [lo, hi] = boxesBounds(boxes), tall = Math.min(17, hi[1] - lo[1]), px = renderScene(boxes, { yaw: -0.45, pitch: 0.15, scale: size / (tall + 1),
    center: [0, lo[1] + tall / 2, 0], origin: [size / 2, size / 2], width: size, height: size });
  return rgbaURL(px, size, size);
}
