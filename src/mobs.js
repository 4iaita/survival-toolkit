/* ---------- Mob models ----------
 * The pack's mobs as 3D models, for the Mobs tab. MOB_MODELS and MOB_LOOKS (src/mob-models.js, written by
 * import_models.py) say how each mob looks with no name and with each name the pack checks for; build.py embeds
 * their textures as MOB_SKINS (art/mobs/). Drawn with the villager scene's renderer (src/villager.js).
 */

// An image's RGBA pixels just as the file has them. A 2D canvas multiplies colors by alpha as it stores them, which
// wrecks texels that are nearly see-through (the sheep's skin keeps its true colors at alpha 3, as a dye mask, and comes
// back mottled pink and green); WebGL hands them over untouched. The canvas is the fallback where there's no WebGL.
let pixelReader;
function filePixels(img) {
  const { width: w, height: h } = img;
  if (pixelReader === undefined) pixelReader = document.createElement("canvas").getContext("webgl");
  const gl = pixelReader;
  if (gl) {
    const texture = gl.createTexture(), buffer = gl.createFramebuffer();
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const ready = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE, px = new Uint8ClampedArray(w * h * 4);
    if (ready) gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(buffer);
    gl.deleteTexture(texture);
    if (ready) return px;
  }
  const ctx = Object.assign(document.createElement("canvas"), { width: w, height: h }).getContext("2d");
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, w, h).data;
}

// Decoded textures by MOB_SKINS name: { w, h, px } with px RGBA, or null when the pack lacks one.
const mobTextures = {};
function mobTexture(name) {
  if (!mobTextures[name]) mobTextures[name] = new Promise(done => {
    if (typeof MOB_SKINS === "undefined" || !MOB_SKINS[name]) return done(null);
    const img = new Image();
    img.onload = () => done({ w: img.width, h: img.height, px: filePixels(img) });
    img.onerror = () => done(null);
    img.src = MOB_SKINS[name];
  });
  return mobTextures[name];
}

// A layer's textures stacked bottom first, each stretched to the size of the first; dyes, a color name for each,
// where the game colors them itself (the tropical fish); blend, faint texels on top shade what's under them, as worn
// armor's cracks do, where otherwise only the solid ones count.
async function layerTexture(names, dyes, blend = false) {
  const [base, ...rest] = await Promise.all(names.map(mobTexture));
  if (!base || (!rest.length && !dyes)) return base;
  const dyeAt = i => (dyes && dyes[i] ? hex(DYES[dyes[i]]).map(c => c / 255) : [1, 1, 1]);
  const px = new Uint8ClampedArray(base.px), under = dyeAt(0);
  for (let k = 0; k < px.length; k += 4) for (let c = 0; c < 3; c++) px[k + c] *= under[c];
  rest.forEach((t, i) => {
    if (!t) return;
    const dye = dyeAt(i + 1);
    for (let y = 0; y < base.h; y++) for (let x = 0; x < base.w; x++) {
      const k = (Math.floor(y * t.h / base.h) * t.w + Math.floor(x * t.w / base.w)) * 4, at = (y * base.w + x) * 4;
      if (blend) {
        const a = t.px[k + 3] / 255;
        if (px[at + 3] >= 128) for (let c = 0; c < 3; c++) px[at + c] = px[at + c] * (1 - a) + t.px[k + c] * dye[c] * a;
        continue;
      }
      if (t.px[k + 3] < 128) continue;
      for (let c = 0; c < 3; c++) px[at + c] = t.px[k + c] * dye[c];
      px[at + 3] = t.px[k + 3];
    }
  });
  return { w: base.w, h: base.h, px };
}

// Whether a bone shows: the last of the layer's [pattern, shown] rules that matches its name wins (* matches
// anything); bones no rule matches show.
const patternCache = {};
// Bone names aren't case sensitive: the pack's animations pose "rightArm" on a model's "rightarm".
const boneMatches = (name, pattern) => (patternCache[pattern] || (patternCache[pattern] =
  new RegExp(`^${pattern.split("*").map(s => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`, "i"))).test(name);
function boneShown(name, rules) {
  let shown = true;
  for (const [pattern, on] of rules) if (boneMatches(name, pattern)) shown = on;
  return shown;
}

// The part of the texture a cube's face shows, as [u, v, width, height] in the model's texture units: from the
// usual box layout (a row of top and bottom over a row of right, front, left and back), or the face's own entry.
const FACE_UV = { right: "e", left: "w", top: "u", bottom: "d", front: "n", back: "s" };
function faceRect(uv, size, face) {
  if (!Array.isArray(uv)) return uv[FACE_UV[face]] || null;
  // The layout counts whole texels, as the game does: a cube 1.8 tall maps to 1 row of the skin, stretched to fit.
  const [u, v] = uv, [w, h, d] = size.map(n => Math.floor(n + 1e-6));
  switch (face) {
    case "right": return [u, v + d, d, h];
    case "front": return [u + d, v + d, w, h];
    case "left": return [u + d + w, v + d, d, h];
    case "back": return [u + 2 * d + w, v + d, w, h];
    case "top": return [u + d, v, w, d];
    default: return [u + d + w, v, w, d];
  }
}
// How far across and down its face a 0-1 spot in the box is, as seen from outside (skinTexel's layout).
function faceSpot(face, fx, fy, fz) {
  switch (face) {
    case "right": return [1 - fz, fy];
    case "front": return [fx, fy];
    case "left": return [fz, fy];
    case "back": return [1 - fx, fy];
    default: return [fx, 1 - fz];
  }
}

// One layer of a look as scene boxes. The model stands with its feet on the ground at at, size times its own
// size. Its bones turn about their pivots, then their parents', y flipped as VILLAGER_MODEL's is, and pose moves,
// turns and scales some more (bone -> { r, p, s }, as animations do); flip, a height, turns the whole mob upside
// down about it (Dinnerbone). The layer's flags say how its texture works:
// mask, its alpha is a dye mask (the sheep's wool: solid texels take tint.color, faint ones keep theirs); lit, its
// alpha is how much each texel glows, so faint ones show too (litBones, the same for those bones alone); sheer, its
// faint texels are see-through, which the scene can't blend, so they show in a fine checker, SHEER_FINE squares a texel
// (the breeze's wind); scroll, it slides by that much of its width and
// height a second, clock.t seconds in; glow, it shines in the dark, so it keeps its brightness and its faint texels
// show, while dim darkens the rest for night.
const SHEER_FINE = 4;
// The bones the pack's animations turn to face the camera, for the glow panels under them.
const GLOW_TURNS = /^fsdyhky\d*$/i;
// Enchanted things shimmer, flags.glint: the game draws its own moving texture over them, which isn't in the pack, so
// this is the same idea: violet bands sliding diagonally over the texels, GLINT_SPAN texels apart, GLINT_SPEED sweeps a
// second, added on top. glintAt: how many seconds in.
const GLINT_COLOR = [120, 60, 225], GLINT_SPAN = 26, GLINT_SPEED = 0.35;
function glintOf(px, py, t) {
  const band = (px * 0.7 + py) / GLINT_SPAN - t * GLINT_SPEED, wave = phase => {
    const f = ((phase % 1) + 1) % 1;
    return Math.max(0, 1 - Math.abs(f - 0.5) * 4);
  };
  return Math.min(1, 0.04 + 0.42 * wave(band) + 0.2 * wave(band * 2.3 + 0.37));
}
function modelBoxes(model, tex, rules, { size = 1, at = [0, 0, 0], pose = {}, flip = null, flags = {}, tint = null, clock = null, dim = 1, glintAt = 0 } = {}) {
  const [tw, th, bones] = model, kx = tex.w / tw, ky = tex.h / th;
  const scroll = flags.scroll, glow = Boolean(flags.glow), solid = glow ? 24 : flags.lit ? 1 : 128;
  const light = glow ? 1 : dim;
  const posed = Object.fromEntries(Object.entries(pose).map(([bone, p]) => [bone.toLowerCase(), p]));
  const toScene = ([x, y, z]) => [at[0] + x * size, GROUND - at[1] - y * size, at[2] + z * size];
  const angles = r => [r[0] * RAD, r[1] * RAD, r[2] * RAD];
  const chains = [];
  const chainOf = i => {
    if (!chains[i]) {
      const [name, parent, pivot, rotation] = bones[i], { r, p, s } = posed[name.toLowerCase()] || {};
      const turned = rotation || r ? [0, 1, 2].map(k => (rotation ? rotation[k] : 0) + (r ? r[k] : 0)) : null;
      const own = turned || p || s ? [{ pivot: toScene(pivot), angles: angles(turned || [0, 0, 0]),
        move: p ? [p[0] * size, -p[1] * size, p[2] * size] : NO_MOVE, scale: s || NO_SCALE }] : [];
      chains[i] = [...own, ...(parent >= 0 ? chainOf(parent) : [])];
    }
    return chains[i];
  };
  const upsideDown = flip === null ? [] : [{ pivot: [at[0], GROUND - at[1] - flip, at[2]], angles: [0, 0, Math.PI] }];
  const out = [];
  // A soft glow's planes are soft light, not parts: each becomes a sprite of its part of the texture.
  const sprite = flags.soft && (([rx, ry, rw, rh]) => {
    // A face drawn backwards shows the same light.
    const x = Math.min(rx, rx + rw), y = Math.min(ry, ry + rh), w = Math.abs(rw), h = Math.abs(rh);
    const sprites = tex.sprites || (tex.sprites = {}), key = `${x},${y},${w},${h}`;
    if (sprites[key]) return sprites[key];
    const cv = sprites[key] = Object.assign(document.createElement("canvas"), { width: Math.max(1, Math.round(w * kx)), height: Math.max(1, Math.round(h * ky)) });
    const img = cv.getContext("2d").createImageData(cv.width, cv.height);
    for (let py = 0; py < cv.height; py++) for (let px = 0; px < cv.width; px++) {
      const k = (Math.floor(y * ky + py) * tex.w + Math.floor(x * kx + px)) * 4;
      img.data.set(tex.px.subarray(k, k + 4), (py * cv.width + px) * 4);
    }
    cv.getContext("2d").putImageData(img, 0, 0);
    return cv;
  });
  bones.forEach(([name, parent, pivot, , cubes], i) => {
    // Closed eyelids: the game only shows these for the moment a mob blinks, or while it sleeps (when what it's doing
    // shows them by name). (Unless flags.openEyes: there the bone is the eye.)
    const eyesShut = name.toLowerCase() === "blink" && rules.some(([pattern, on]) => on && pattern.toLowerCase() === "blink");
    if (!boneShown(name, rules) || (name.toLowerCase() === "blink" && !flags.openEyes && !eyesShut)) return;
    // A bone scaled to nothing is hidden.
    if (chainOf(i).some(b => b.scale && b.scale.some(v => !v))) return;
    const least = (flags.litBones || []).some(pattern => boneMatches(name, pattern)) ? 1 : solid;
    const shell = (flags.shellBones || []).some(pattern => boneMatches(name, pattern));
    // The dye goes on a whole masked layer, or on the bones that take one of their own (a wolf's collar).
    const dye = flags.mask || (flags.dyeBones || []).some(pattern => boneMatches(name, pattern)) ? tint : null;
    for (const [x, y, z, w, h, d, uv, extra = {}] of cubes) {
      const g = (extra.inflate || 0) * size, top = toScene([x, y + h, z]);
      const lo = top.map(v => v - g), hi = [top[0] + w * size + g, top[1] + h * size + g, top[2] + d * size + g];
      const own = extra.rotation ? [{ pivot: toScene(extra.pivot), angles: angles(extra.rotation) }] : [];
      const mirror = extra.mirror && Array.isArray(uv), dims = [w, h, d];
      if (sprite) {
        const at = [0, 1, 2].map(k => (lo[k] + hi[k]) / 2);
        // A panel's light sits at its pivot, not out where the panel is held (a panel can face sideways: the camel husk's
        // eyes are on the sides of its head). An eye's light faces the way the panel is held out, away from the pivot.
        // Where the panel hangs from a bone the game turns for it (GLOW_TURNS), that bone's pivot is the one: a spider's
        // own bone pivots mid-head, but the one it hangs from is on the eyes.
        const sideways = w === 0, axis = sideways ? 0 : 2;
        let facing = null;
        if (flags.eyes || flags.halo) {
          const pivotAt = toScene(parent >= 0 && GLOW_TURNS.test(bones[parent][0]) ? bones[parent][2] : pivot)[axis];
          if (flags.eyes) facing = sideways ? [Math.sign(at[0] - pivotAt) || 1, 0, 0] : [0, 0, Math.sign(at[2] - pivotAt) || -1];
          at[axis] = pivotAt;
        }
        const rect = ["front", "right", "left"].map(face => faceRect(uv, dims, face)).find(r => r && r[2] && r[3]);
        if (rect) out.push({ soft: sprite(rect), span: Math.max(w, d) * size, tall: h * size, at, facing, bright: flags.bright === undefined ? 1 : flags.bright, bones: [...own, ...chainOf(i), ...upsideDown] });
        continue;
      }
      out.push({
        lo, hi, glow, shell, bones: [...own, ...chainOf(i), ...upsideDown],
        color(axis, side, fx, fy, fz) {
          let face = FACES[axis][side];
          if (mirror) {
            fx = 0.9999 - fx;
            if (axis === 0) face = FACES[0][1 - side];
          }
          const rect = faceRect(uv, dims, face);
          if (!rect) return -1;
          const [s, t] = faceSpot(face, fx, fy, fz);
          // A face drawn backwards (negative width or height) starts from the far edge of its texels.
          let u = rect[0] + s * rect[2] - (rect[2] < 0 ? 1e-4 : 0), v = rect[1] + t * rect[3] - (rect[3] < 0 ? 1e-4 : 0);
          if (scroll && clock) {
            u = (((u / tw + scroll[0] * clock.t) % 1) + 1) % 1 * tw;
            v = (((v / th + scroll[1] * clock.t) % 1) + 1) % 1 * th;
          }
          const px = Math.min(tex.w - 1, Math.max(0, Math.floor(u * kx))), py = Math.min(tex.h - 1, Math.max(0, Math.floor(v * ky)));
          const k = (py * tex.w + px) * 4, alpha = tex.px[k + 3];
          if (flags.sheer ? alpha === 0 || (alpha < 128 && (Math.floor(u * kx * SHEER_FINE) + Math.floor(v * ky * SHEER_FINE)) & 1) : dye ? alpha === 0 : alpha < least) return -1;
          const mul = dye && alpha >= 128 ? dye.color.map(c => c / 255 * light) : [light, light, light];
          if (flags.glint) {
            const shine = glintOf(px, py, glintAt);
            const lit = c => Math.min(255, Math.round(tex.px[k + c] * mul[c] + GLINT_COLOR[c] * shine));
            return lit(0) << 16 | lit(1) << 8 | lit(2);
          }
          return Math.round(tex.px[k] * mul[0]) << 16 | Math.round(tex.px[k + 1] * mul[1]) << 8 | Math.round(tex.px[k + 2] * mul[2]);
        },
      });
    }
  });
  return out;
}

// The scene-space box around boxes: [min corner, max corner].
function boxesBounds(boxes) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const m of boxes) {
    for (let c = 0; c < 8; c++) {
      const p = placeBy(m.bones || [], [c & 1 ? m.hi[0] : m.lo[0], c & 2 ? m.hi[1] : m.lo[1], c & 4 ? m.hi[2] : m.lo[2]]);
      p.forEach((v, i) => { lo[i] = Math.min(lo[i], v); hi[i] = Math.max(hi[i], v); });
    }
  }
  return [lo, hi];
}

// A mob's look as scene boxes, or null while a texture is missing. A look comes from MOB_LOOKS; flip turns it
// upside down, tint dyes a sheep's wool, clock runs scrolling textures and stand poses bones for the stage (as a look's
// pose does, see modelBoxes; a root bone's move lifts the whole mob and stays the same whatever the look's size, so a
// baby flies as high as its parent, while a part's move inside the model grows and shrinks with it)
// and moving is an animation's pose this moment (motionPose), which adds to those and scales with the look; showing
// is more [bone pattern, shown] rules from something the mob is doing (actPose); skins, textures to draw in place of the
// look's own (a variant's, MOB_VARIANTS); showParts, more [bone pattern, shown] rules from the variant (a camel's saddle).
// By day the layers that only glow in the dark are left out, unless the mob is glowing anyway (soft light always shows); at night they show and
// the rest is darker. Soft glows come apart from the boxes, as their soft list.
const NIGHT_DIM = 0.42;
async function lookBoxes(look, { flip = false, tint = null, clock = null, night = false, glowing = false, size = 1, height = 0, stand = null, moving = null, showing = [], armor = null, skins = null, showParts = [] } = {}) {
  // Armor is one more layer: { kind, a MOB_ARMOR key; dye, its color if any; crack, its wear if any; glint, if enchanted }.
  const piece = armor && MOB_ARMOR[armor.kind];
  const worn = piece ? [[piece.model, [armor.dye ? piece.dyed : piece.plain, ...(armor.crack ? [piece.cracks[armor.crack]] : [])], [], { blend: true, ...(armor.dye ? { dyes: [armor.dye] } : {}), ...(armor.glint ? { glint: 1 } : {}) }]] : [];
  const shown = [...look.layers.filter(([, , , flags = {}]) => night || glowing || !flags.glow || flags.soft), ...worn];
  const isRoot = bone => shown.some(([model]) => MOB_MODELS[model][2].some(([name, parent]) => parent < 0 && name.toLowerCase() === bone.toLowerCase()));
  const placed = stand && Object.fromEntries(Object.entries(stand).map(([bone, b]) => [bone, b.p && isRoot(bone) ? { ...b, p: b.p.map(v => v / size) } : b]));
  const layers = await Promise.all(shown.map(([, textures, , flags = {}]) => layerTexture(skins ? textures.map(n => skins[n] || n) : textures, flags.dyes, flags.blend)));
  if (!layers.length || layers.some(t => !t)) return null;
  const pose = { ...look.pose, ...placed };
  for (const [bone, m] of Object.entries(moving || {})) {
    const { r, p, s } = pose[bone] || {};
    pose[bone] = {
      r: r && m.r ? r.map((v, k) => v + m.r[k]) : m.r || r,
      p: p && m.p ? p.map((v, k) => v + m.p[k]) : m.p || p,
      s: s && m.s ? s.map((v, k) => v * m.s[k]) : m.s || s,
    };
  }
  const parts = shown.flatMap(([model, , rules, flags], i) =>
    modelBoxes(MOB_MODELS[model], layers[i], [...rules, ...showParts, ...showing], { size, pose, flip: flip ? height / 2 : null, flags, tint, clock, dim: night ? NIGHT_DIM : 1, glintAt: performance.now() / 1000 }));
  return Object.assign(parts.filter(p => !p.soft), { soft: parts.filter(p => p.soft) });
}
// Boxes moved down or up to stand on the ground: props hang from an armor stand's hand in their models.
function landed(boxes) {
  if (!boxes || !boxes.length) return boxes;
  const drop = [{ pivot: [0, 0, 0], angles: [0, 0, 0], move: [0, GROUND - boxesBounds(boxes)[1][1], 0] }];
  return boxes.map(m => ({ ...m, bones: [...(m.bones || []), ...drop] }));
}
// A mob's looks (MOB_LOOKS key), or a prop's one look ("prop:" and its item, a PROP_LOOKS key).
const looksOf = key => (key.startsWith("prop:") ? [PROP_LOOKS[key.slice(5)]].filter(Boolean) : MOB_LOOKS[key] || []);

// A prop drawn on its own, size pixels square, as a PNG data URL, or null without its textures.
async function propPicture(item, size) {
  const boxes = await lookBoxes(PROP_LOOKS[item]);
  if (!boxes || !boxes.length) return null;
  const [lo, hi] = boxesBounds(boxes), mid = lo.map((v, i) => (v + hi[i]) / 2);
  const span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
  const px = renderScene(boxes, { yaw: 0.6, pitch: 0.3, scale: size * 0.66 / span, center: mid, origin: [size / 2, size / 2], width: size, height: size });
  return rgbaURL(px, size, size);
}

// Whether a look is a mob's own look but for what glows: then only the dark shows the difference.
const glowLayers = (look, glow) => JSON.stringify(look.layers.filter(l => Boolean((l[3] || {}).glow) === glow));
const glowsOnly = (looks, i) => i > 0 && glowLayers(looks[i], false) === glowLayers(looks[0], false) && glowLayers(looks[i], true) !== glowLayers(looks[0], true);

// Layer an animation's bones onto a pose (turns and moves add, scales multiply), weight times as strong. frameAt says
// where in a channel's frames this moment is, and how far on to the next.
function layerBones(pose, bones, frameAt, weight = 1) {
  for (const [bone, channels] of Object.entries(bones)) {
    const out = pose[bone] || (pose[bone] = {});
    for (const [ch, frames] of Object.entries(channels)) {
      const [a, b, mix] = frameAt(frames);
      out[ch] = a.map((v, k) => {
        const now = v + (b[k] - v) * mix, was = out[ch] && out[ch][k];
        return ch === "s" ? (1 + (now - 1) * weight) * (was === undefined ? 1 : was) : now * weight + (was || 0);
      });
    }
  }
}
// A mob's animation t seconds in, as bone poses: its loops layered, each between its nearest two frames, weight times
// as strong.
function motionPose(loops, t, weight = 1) {
  const pose = {};
  for (const { length, bones } of loops) {
    layerBones(pose, bones, frames => {
      const at = ((t % length) / length) * frames.length, i = Math.floor(at);
      return [frames[i], frames[(i + 1) % frames.length], at - i];
    }, weight);
  }
  return pose;
}
// Something a mob is doing, t seconds in, layered onto a pose; says which bones it shows or hides. As in the game, one
// part blends into the next that follows on from it over ACT_BLEND seconds: the one ending held at its last frame,
// fading out, as the next fades in. An act that eases (its ease, in seconds) fades in at its start and out at its end
// (a walk, starting and stopping).
const ACT_BLEND = 0.24;
function actPose(pose, act, t) {
  const showing = [], follows = (a, b) => Math.abs(a - b) < 1e-3;
  const edge = act.ease ? Math.max(0, Math.min(1, t / act.ease, (act.length - t) / act.ease)) : 1;
  for (const part of act.parts) {
    const going = t >= part.to && t - part.to < ACT_BLEND && act.parts.some(q => follows(q.from, part.to));
    if ((t < part.from || t >= part.to) && !going) continue;
    if (!going) showing.push(...part.show);
    const coming = !going && t - part.from < ACT_BLEND && act.parts.some(q => q !== part && follows(q.to, part.from));
    const weight = going ? 1 - (t - part.to) / ACT_BLEND : coming ? (t - part.from) / ACT_BLEND : 1;
    const through = going ? 1 : (t - part.from) / (part.to - part.from);
    layerBones(pose, part.bones, frames => {
      const at = through * (frames.length - 1), i = Math.floor(at);
      return [frames[i], frames[Math.min(i + 1, frames.length - 1)], at - i];
    }, weight * edge);
  }
  return showing;
}

// Effects an act shows while it plays (its effects: [kind, from, to]): each that's on t seconds in, as [kind, seconds
// since it started].
const actEffects = (act, t) => (act.effects || []).filter(([, from, to]) => t >= from && t < to).map(([kind, from]) => [kind, t - from]);

// The pack's particle textures (MOB_SKINS particle_<kind>), as images once they've loaded.
const particleImages = {};
function particleImage(kind) {
  if (!(kind in particleImages)) {
    particleImages[kind] = null;
    if (typeof MOB_SKINS !== "undefined" && MOB_SKINS[`particle_${kind}`]) {
      const img = new Image();
      img.onload = () => { particleImages[kind] = img; };
      img.src = MOB_SKINS[`particle_${kind}`];
    }
  }
  return particleImages[kind];
}

// A sleeping mob's Zs, as the pack's particle has them (oreville_ans:pupoyec_wrciiur): every 7.74 seconds, for 2.74 of
// them, one rises every half second (five at most), swirling round as it goes up from half a block over the mob to
// about 1.6, for 2.75 seconds, a little bigger at first, see-through (65%) and fading at the end. Each is [x, y, z] in
// blocks from the mob's feet, its size in blocks, its turn in degrees and how solid it is.
function sleepZs(age) {
  const out = [], cycle = 7.74, life = 2.75;
  const grow = f => { const nodes = [0.5, 1.4, 1, 1, 1, 1, 1, 1, 1], at = Math.min(0.9999, f) * (nodes.length - 1), i = Math.floor(at); return nodes[i] + (nodes[i + 1] - nodes[i]) * (at - i); };
  for (let start = Math.floor((age - life) / cycle) * cycle; start <= age; start += cycle) {
    for (let k = 0; k < 5; k++) {
      const born = start + k * 0.5, t = age - born;
      if (born < 0 || t < 0 || t >= life) continue;
      const turn = t * 200 * RAD, f = t / life, random = Math.abs((Math.sin(born * 12.9898) * 43758.5453) % 1);
      out.push({ at: [-0.2 * Math.sin(turn), t * 0.4 + 0.5, 0.2 * Math.cos(turn)], size: (random * 0.08 + 0.04) * grow(f),
        spin: Math.cos(turn) * -20, alpha: f < 0.8 ? 0.65 : (0.65 * (1 - f)) / 0.2 });
    }
  }
  return out;
}

// The part of a box that shows, as its [lo, hi] corners, sampling each face's texture so that see-through parts (a
// fin's empty plane) don't count; or null if none of it does.
function visiblePart(m) {
  const first = [1, 1, 1], last = [0, 0, 0], STEPS = 8;
  for (let axis = 0; axis < 3; axis++) for (const side of [0, 1]) for (let i = 0; i <= STEPS; i++) for (let j = 0; j <= STEPS; j++) {
    const a = (axis + 1) % 3, b = (axis + 2) % 3, spot = [];
    spot[axis] = side ? 0.9999 : 0;
    spot[a] = Math.min(0.9999, i / STEPS);
    spot[b] = Math.min(0.9999, j / STEPS);
    if (m.color(axis, side, spot[0], spot[1], spot[2]) < 0) continue;
    spot.forEach((v, k) => { first[k] = Math.min(first[k], v); last[k] = Math.max(last[k], v); });
  }
  if (first[0] > last[0]) return null;
  const at = f => m.lo.map((v, k) => v + (m.hi[k] - v) * f[k]);
  return [at(first), at(last)];
}

// How solid a see-through shell is: the slime's texture says 161 of 255. Lays a shell's pixels over a scene's, in place.
const SHELL_ALPHA = 161 / 255;
function overShell(px, shell) {
  for (let i = 0; i < px.length; i += 4) {
    if (!shell[i + 3]) continue;
    const under = (px[i + 3] / 255) * (1 - SHELL_ALPHA), alpha = SHELL_ALPHA + under;
    for (let c = 0; c < 3; c++) px[i + c] = (shell[i + c] * SHELL_ALPHA + px[i + c] * under) / alpha;
    px[i + 3] = alpha * 255;
  }
}

// The stage scene for a mob: the mob's model at the size that fits the canvas, a name tag (tag, an element over
// the canvas) over its head, turned by dragging sideways or with the arrow keys (onTurn hears the first turn).
// Like the villager's scene, it draws at the screen's pixel density, but at 1× while dragging.
// A mob with an animation (MOB_MOTIONS) plays it at MOTION_FPS while it's on screen, or holds its first moment if the
// reader asks for less motion. One with an act (MOB_ACTS) stops for it every so often, its usual animation fading out
// over ACT_FADE seconds and back afterwards; one with a list of acts does one of them at random each time (by their
// weight: 1 unless an act says), as often as the first one says. If frames keep taking too long to draw (SLOW_FRAMES in a row), the rest draw at 1×.
// show's swim floats the mob in the middle of the water above the ground strip, whatever its size: the middle of where
// it lands on the canvas as it moves, from this side, however it's turned. zoom draws a mob that many times the size
// that would fit, to scale with a bigger one.
const MOB_MAX_SCALE = 8, MOB_FEET_UP = 26, MOB_TAG_ROOM = 44, MOB_MARGIN = 28, SWIM_MARGIN = 12, MOTION_FPS = 20, SLOW_FRAME_MS = 30, SLOW_FRAMES = 5, ACT_FADE = 0.25;
// How many moments of an animation to look at for how far it reaches.
const MOTION_SAMPLES = 12;
// yaw: how it's turned to start with, and after a reset (turnBack).
function mobScene(canvas, tag, { onTurn = () => {}, yaw: startYaw = 0.6 } = {}) {
  const ctx = canvas.getContext("2d");
  let boxes = null, rest = null, fit = null, zoomed = 1, swims = false, yaw = startYaw, frame = 0, dragX = null, wanted = "";
  let effects = [], lookScale = 1, motion = null, acts = null, act = null, actStart = 0, nextAct = 0, rebuild = null, playing = false, busy = false, lastStep = 0, slowFrames = 0, coarse = false;
  const draw = () => {
    frame = 0;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = dragX !== null || coarse ? 1 : Math.max(1, Math.min(3, Math.round(window.devicePixelRatio || 1)));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (!boxes) return;
    // Fit the mob's usual size (a baby keeps its parent's scale, so it looks small): its height, seen a little
    // from above, under the name tag or in the water; and its widest turn across the canvas.
    const pitch = 0.2, [lo, hi] = fit, radius = fit.radius;
    const tall = (swims ? hi[1] - lo[1] : GROUND - lo[1]) * Math.cos(pitch) + 2 * radius * Math.sin(pitch);
    const room = swims ? h - GROUND_STRIP - 2 * SWIM_MARGIN : h - MOB_FEET_UP - MOB_TAG_ROOM;
    const scale = zoomed * Math.min(MOB_MAX_SCALE, (w - 2 * MOB_MARGIN) / (2 * radius), room / tall);
    // Stay centered on the space the mob's animation fills, so it doesn't shift the view.
    const [blo, bhi] = rest, mid = [(blo[0] + bhi[0]) / 2, GROUND, (blo[2] + bhi[2]) / 2];
    const view = { yaw, pitch, scale: scale * dpr, center: mid, origin: [canvas.width / 2, canvas.height - MOB_FEET_UP * dpr] };
    const shadow = Math.max(3, Math.min(bhi[0] - blo[0], bhi[2] - blo[2]) * 0.45);
    // A swimmer slides to the middle of the canvas and rises (or sinks) to the middle of the water; its shadow stays on
    // the ground below it.
    let rise = 0;
    if (swims) {
      const spots = rest.spots.map(camera(view).project), across = spots.map(p => p[0]), down = spots.map(p => p[1]);
      view.origin[0] += (canvas.width - Math.min(...across) - Math.max(...across)) / 2;
      rise = ((Math.min(...down) + Math.max(...down)) / 2 - ((h - GROUND_STRIP) / 2) * dpr) / (scale * dpr * Math.cos(pitch));
    }
    const float = { pivot: NO_MOVE, angles: NO_MOVE, move: [0, -rise, 0] };
    const placed = rise ? boxes.map(m => ({ ...m, bones: [...m.bones, float] })) : boxes;
    const scene = { ...view, width: canvas.width, height: canvas.height };
    const px = renderScene(placed.filter(m => !m.shell), { ...scene, shadows: [[mid[0], mid[2], shadow]] });
    // See-through shells (a slime's jelly) go on top of what's inside them.
    const shells = placed.filter(m => m.shell);
    if (shells.length) overShell(px, renderScene(shells, scene));
    ctx.putImageData(new ImageData(px, canvas.width, canvas.height), 0, 0);
    // Soft glows add their light over the rest, smooth and always facing the camera.
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    for (const { soft, span, tall, at, bones, facing, bright } of boxes.soft || []) {
      const placed = [...bones, float], spot = placeBy(placed, at), [gx, gy] = camera(view).project(spot), sw = span * scale * dpr, sh = tall * scale * dpr;
      // Eyes fade out as the face turns away: full from the front and most of the side, gone from behind.
      if (facing) {
        const ahead = placeBy(placed, at.map((v, k) => v + facing[k])).map((v, k) => v - spot[k]);
        ctx.globalAlpha = bright * Math.min(1, Math.max(0, (0.2 - dot(ahead, camera(view).dir)) / 0.4));
      } else ctx.globalAlpha = bright;
      ctx.drawImage(soft, gx - sw / 2, gy - sh / 2, sw, sh);
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = "source-over";
    // A sleeping mob's Zs float up from it (16 of its pixels to a block, at its look's size).
    for (const [kind, age] of effects) {
      const img = kind === "z" && particleImage(kind);
      if (!img) continue;
      for (const { at, size, spin, alpha } of sleepZs(age)) {
        const block = 16 * lookScale, [gx, gy] = camera(view).project([at[0] * block, GROUND - at[1] * block - rise, at[2] * block]);
        const side = size * block * scale * dpr;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.imageSmoothingEnabled = false;
        ctx.translate(gx, gy);
        ctx.rotate(spin * RAD);
        ctx.drawImage(img, -side / 2, -side / 2, side, side);
        ctx.restore();
      }
    }
    const [x, y] = camera(view).project([mid[0], blo[1] - 2 - rise, mid[2]]);
    tag.style.left = `${x / dpr}px`;
    tag.style.top = `${Math.max(MOB_TAG_ROOM - 8, y / dpr)}px`;
  };
  const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const play = async now => {
    if (!motion) {
      playing = false;
      return;
    }
    requestAnimationFrame(play);
    if (busy || now - lastStep < 1000 / MOTION_FPS - 2 || !canvas.clientWidth || calmMotion()) return;
    lastStep = now;
    busy = true;
    // Time for its act? The first comes sooner, so it isn't missed.
    const between = () => acts[0].every[0] + Math.random() * (acts[0].every[1] - acts[0].every[0]);
    if (acts && !nextAct) nextAct = now + (between() * 1000) / 2;
    if (acts && !actStart && now >= nextAct) {
      actStart = now;
      let roll = Math.random() * acts.reduce((sum, a) => sum + (a.weight || 1), 0);
      act = acts.find(a => (roll -= a.weight || 1) < 0) || acts[acts.length - 1];
    }
    const into = actStart ? (now - actStart) / 1000 : 0;
    if (actStart && into >= act.length) {
      actStart = 0;
      nextAct = now + between() * 1000;
    }
    const acting = Boolean(actStart), usual = acting && !act.keep ? Math.min(1, Math.max(0, 1 - into / ACT_FADE, (into - act.length + ACT_FADE) / ACT_FADE)) : 1;
    const moving = motionPose(motion, now / 1000, usual), showing = acting ? actPose(moving, act, into) : [];
    effects = acting ? actEffects(act, into) : [];
    const key = wanted, next = await rebuild(moving, showing);
    busy = false;
    if (key !== wanted || !next) return;
    boxes = next;
    const started = performance.now();
    draw();
    slowFrames = performance.now() - started > SLOW_FRAME_MS ? slowFrames + 1 : 0;
    if (slowFrames >= SLOW_FRAMES) coarse = true;
  };
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
  const fits = {};
  return {
    // Show a mob (or prop, see looksOf) in one of its looks; resolves once it's drawn, or false if it can't be.
    async show(mob, lookIndex = 0, { flip = false, tint = null, clock = null, night = false, glowing = false, stand = null, swim = false, zoom = 1, mood = null, armor = null, sized = null, climate = null, skins = null, shown = [] } = {}) {
      // A mood (MOB_MOODS) has looks and animations of its own, in place of the mob's usual ones; so can a size (MOB_SIZES); a climate (MOB_CLIMATES) has the few looks that differ there (their layers, over the usual look), and maybe acts of its own.
      const mooded = (mood && MOB_MOODS[mob] && MOB_MOODS[mob][mood]) || null, ofSize = (sized && MOB_SIZES[mob] && MOB_SIZES[mob][sized] && MOB_SIZES[mob][sized].looks) || null;
      const climated = (climate && MOB_CLIMATES[mob] && MOB_CLIMATES[mob][climate]) || null, ofClimate = (climated && climated.looks) || null;
      const key = wanted = `${mob}/${lookIndex}/${flip}/${night}/${mood}/${sized}/${climate}/${JSON.stringify(skins)}/${JSON.stringify(shown)}`, looks = ofSize || (mooded ? mooded.looks : ofClimate ? looksOf(mob).map((l, i) => (ofClimate[i] ? { ...l, ...ofClimate[i] } : l)) : looksOf(mob)), look = looks[lookIndex] || looks[0];
      const ground = mob.startsWith("prop:") ? landed : b => b;
      if (!look) return false;
      const fitOf = ([lo, hi]) => {
        const cx = (lo[0] + hi[0]) / 2, cz = (lo[2] + hi[2]) / 2;
        return Object.assign([lo, hi], { radius: Math.max(4, Math.hypot(hi[0] - cx, hi[2] - cz)) });
      };
      // A look can have animations of its own (motions: the OIIA cat spins), in place of the mob's loops and acts; or play
      // another of the mob's sets (plays: a chick's, in MOB_MOTIONS and MOB_ACTS as "<mob>:<set>").
      const setKey = look.plays ? `${mob}:${look.plays}` : null;
      const loops = look.motions || (setKey && MOB_MOTIONS[setKey]) || (mooded ? mooded.motions : MOB_MOTIONS[mob] || null);
      const nextAct_ = look.motions ? null : setKey ? MOB_ACTS[setKey] || null : mooded ? mooded.act : (climated && climated.act) || MOB_ACTS[mob] || null;
      // A look's boxes as it starts, and the space it moves through as it animates: its bounds and, for a swimmer, the
      // corners of what shows of its boxes at each moment (spots).
      const reachOf = async (shape, options) => {
        const longest = loops ? Math.max(...loops.map(l => l.length)) : 0;
        const moments = loops ? Array.from({ length: MOTION_SAMPLES }, (_, i) => motionPose(loops, (i / MOTION_SAMPLES) * longest)) : [null];
        const all = [];
        for (const moving of moments) all.push(ground(await lookBoxes(shape, { ...options, moving })));
        if (!all[0] || !all[0].length) return { boxes: all[0], bounds: null };
        const each = all.map(boxesBounds);
        const bounds = [each.reduce((a, b) => a.map((v, k) => Math.min(v, b[0][k])), each[0][0]), each.reduce((a, b) => a.map((v, k) => Math.max(v, b[1][k])), each[0][1])];
        const spots = !swim ? [] : all.flatMap(some => some.flatMap(m => {
          const part = visiblePart(m);
          return part ? [0, 1, 2, 3, 4, 5, 6, 7].map(c => placeBy(m.bones, [part[c & 1][0], part[(c >> 1) & 1][1], part[(c >> 2) & 1][2]])) : [];
        }));
        return { boxes: all[0], bounds, spots };
      };
      if (!fits[mob]) {
        const base = await reachOf(looks[0], { stand });
        if (base.bounds) fits[mob] = fitOf(base.bounds);
      }
      const f = fits[mob];
      const options = { flip, tint, clock, night, glowing, stand, armor, skins, showParts: shown, size: look.scale, height: f ? (2 * GROUND - f[0][1] - f[1][1]) * look.scale : 0 };
      const reach = f ? await reachOf(look, options) : { boxes: null, bounds: null }, next = reach.boxes;
      if (wanted !== key) return false;
      boxes = next;
      rest = reach.bounds && Object.assign(reach.bounds, { spots: reach.spots });
      swims = swim;
      rebuild = (moving, showing) => lookBoxes(look, { ...options, moving, showing });
      const nextActs = nextAct_ ? [].concat(nextAct_) : null;
      const sameActs = acts === nextActs || (acts && nextActs && acts.length === nextActs.length && acts.every((a, i) => a === nextActs[i]));
      if (!sameActs) {
        acts = nextActs;
        act = null;
        actStart = nextAct = 0;
      }
      motion = next && loops;
      coarse = false;
      slowFrames = 0;
      if (motion && !playing) {
        playing = true;
        requestAnimationFrame(play);
      }
      zoomed = zoom;
      lookScale = look.scale || 1;
      effects = [];
      // A look bigger than the mob's usual one (a balloon, a rider) gets room of its own.
      const own = reach.bounds ? fitOf(reach.bounds) : f;
      fit = f && Object.assign([f[0].map((v, i) => Math.min(v, own[0][i])), f[1]], { radius: Math.max(f.radius, own.radius) });
      tag.hidden = !next || !tag.textContent;
      redraw();
      return Boolean(next);
    },
    redraw,
    // Turn it back to how it started (the next mob drawn shows that way).
    turnBack() {
      yaw = startYaw;
      redraw();
    },
  };
}
