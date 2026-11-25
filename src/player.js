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
async function drawnModel(key, texture) {
  const id = `${key}/${texture}/drawn`, tex = MOB_MODELS[id] ? null : await mobTexture(texture);
  if (!tex) return id in MOB_MODELS ? id : key;
  const [tw, th, bones] = MOB_MODELS[key], kx = tex.w / tw, ky = tex.h / th;
  const shows = rect => {
    if (!rect) return false;
    const [u, v, w, h] = rect, across = [u, u + w].map(n => n * kx).sort((a, b) => a - b), down = [v, v + h].map(n => n * ky).sort((a, b) => a - b);
    for (let y = Math.max(0, Math.floor(down[0])); y < Math.min(tex.h, Math.ceil(down[1])); y++)
      for (let x = Math.max(0, Math.floor(across[0])); x < Math.min(tex.w, Math.ceil(across[1])); x++) if (tex.px[(y * tex.w + x) * 4 + 3] >= 128) return true;
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

// How big the player is on the stage, whatever they wear, in scene units: the height of a helmet, and how far out a hand reaches.
const PLAYER_FRAME = Object.assign([[-11, GROUND - 34, -11], [11, GROUND, 11]], { radius: 19 });
const PLAYER_SLOTS = ["head", "chest", "legs", "feet", "main", "off"];
// Looks as they've been made up, by their keys (looksOf).
const playerLooks = {};
// Someone (a PLAYER_SKINS key) in a set: slot -> a GEAR_WORN key. fresh: the slots whose things were just put on, which the player
// takes in hand, or which pop on, as the game has it. Returns the key of the look (mobScene.show), or null while a picture is missing.
async function playerLook(who, set, fresh = []) {
  const key = `player:${who}/${PLAYER_SLOTS.map(s => set[s] || "").join("/")}`;
  const skin = PLAYER_SKINS[who], body = skin.body, shows = slot => GEAR_WORN[set[slot]] && !(skin.off || []).includes(slot);
  if (!playerLooks[key]) {
    const pose = { ...skin.pose };
    // What's under what's worn is hidden as the pack hides it (Rana's hat under a helmet), and some wear no armor at all in places.
    const rules = Object.entries(skin.hides || {}).flatMap(([slot, names]) => (shows(slot) ? names.map(n => [n, false]) : []));
    // A skin, with what the pack draws over its face (FACE in import_player.py), the lids shut away until it blinks.
    const layers = skin.layers ? skin.layers.map(([model, textures, own, flags]) => [model, textures, [...own, ...rules], flags]) : [[await drawnModel(`player_${body}`, skin.texture), [skin.texture], [], {}],
      ...(skin.face ? [[await drawnModel("player_face", skin.texture), [skin.texture], [["3dafc7246*", false]], {}]] : [])];
    for (const slot of PLAYER_SLOTS.filter(shows)) {
      for (const [model, texture, flags] of GEAR_WORN[set[slot]].layers) {
        const made = await gearModel(body, model, texture), id = made && await drawnModel(made, texture);
        if (!id) return null;
        layers.push([id, [texture], [], { ...flags, held: slot === "main" || slot === "off" ? 1 : 0 }]);
        for (const [bone, p] of Object.entries(GEAR_WORN[set[slot]].pose || {})) pose[`${model}:${bone}`] = p;
      }
    }
    playerLooks[key] = { names: [], scale: skin.scale || 1, layers, pose, acts: skin.acts || null, framed: PLAYER_FRAME };
  }
  // What plays once starts now, for what's just been put on; the rest of it is long over.
  const now = performance.now() / 1000, starting = (loops, on) => loops.map(l => (l.once && on && !calmMotion() ? { ...l, at: now } : l));
  const stance = (GEAR_WORN[set.main] && GEAR_WORN[set.main].stance) || "empty", off = `${stance}_off`;
  const moves = PLAYER_STANCES[set.off && PLAYER_STANCES[off] ? off : stance].flatMap(k => PLAYER_MOVES[k]);
  const pops = fresh.filter(slot => GEAR_POPS[slot] && shows(slot)).map(slot => ({ ...GEAR_POPS[slot],
    bones: Object.fromEntries(GEAR_WORN[set[slot]].layers.flatMap(([model]) => Object.entries(GEAR_POPS[slot].bones).map(([bone, ch]) => [`${model}:${bone}`, ch]))) }));
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
