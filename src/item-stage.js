/* ---------- Item stage ----------
 * An item as the game shows one lying in the world: its picture a pixel thick, hovering over the ground and turning, with
 * the swirls of its effect rising from it. Drawn with the villager scene's renderer.
 */
// An item's picture (icons' 16×16 pixels, null where it's clear) as scene boxes standing in the middle of the scene, its lowest pixel
// up over the ground: a flat box for its front and back, and a little box for each pixel at an edge.
// It's lit more evenly than a mob is (ITEM_LIT, as light of its own), or its picture's colors would look dull.
const ITEM_LIT = 170 * EMITS;
function itemBoxes(px, up) {
  const rows = [...Array(16).keys()].filter(y => px.slice(y * 16, y * 16 + 16).some(Boolean));
  if (!rows.length) return [];
  const bottom = rows[rows.length - 1] + 1, top = GROUND - up - bottom;
  const color = (x, y) => { const p = x >= 0 && x < 16 && y >= 0 && y < 16 ? px[y * 16 + x] : null; return p ? ITEM_LIT + (p[0] << 16 | p[1] << 8 | p[2]) : -1; };
  const boxes = [{ lo: [-8, top, -0.5], hi: [8, top + 16, 0.5], color: (axis, side, fx, fy) => (axis === 2 ? color(Math.floor(fx * 16), Math.floor(fy * 16)) : -1) }];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const c = color(x, y);
    if (c < 0 || [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => color(x + dx, y + dy) >= 0)) continue;
    boxes.push({ lo: [x - 8, top + y, -0.5], hi: [x - 7, top + y + 1, 0.5], color: () => c });
  }
  return boxes;
}

// The scene on a canvas. It bobs and sways a little on its own, unless the reader asks for less motion, and turns by
// dragging sideways or with the arrow keys (onTurn hears the first turn). swirl is the swirl frames' picture.
const ITEM_FPS = 30, ITEM_MAX_SCALE = 9, ITEM_UP = 5, ITEM_BOB = 1.2, ITEM_SWAY = 0.4, ITEM_YAW = 0.2, SWIRLS = 9, SWIRL_SECONDS = 1.6;
function itemScene(canvas, { onTurn = () => {}, swirl: swirlSrc } = {}) {
  const ctx = canvas.getContext("2d"), swirls = new Image(), tintedSwirls = {};
  let px = null, model = null, tall = 16, color = null, yaw = ITEM_YAW, frame = 0, dragX = null, last = 0, clock = 0;
  if (swirlSrc) {
    swirls.onload = () => redraw();
    swirls.src = swirlSrc;
  }
  // The swirl frames (white in the pack) in the effect's color.
  const swirlsIn = c => {
    if (tintedSwirls[c] || !swirls.complete || !swirls.width) return tintedSwirls[c];
    const cv = Object.assign(document.createElement("canvas"), { width: swirls.width, height: swirls.height }), g = cv.getContext("2d");
    g.drawImage(swirls, 0, 0);
    g.globalCompositeOperation = "multiply";
    g.fillStyle = c;
    g.fillRect(0, 0, cv.width, cv.height);
    g.globalCompositeOperation = "destination-in";
    g.drawImage(swirls, 0, 0);
    return (tintedSwirls[c] = cv);
  };
  // A number from 0 to 1 that's always the same for the same one.
  const chance = n => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };
  const draw = () => {
    frame = 0;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = dragX !== null ? 1 : Math.max(1, Math.min(2, Math.round(window.devicePixelRatio || 1)));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (!px && !model) return;
    const still = calmMotion(), t = still ? 0 : clock;
    const up = ITEM_UP + (1 + Math.sin(t * 1.8)) * ITEM_BOB, turned = yaw + (dragX === null ? Math.sin(t * 0.9) * ITEM_SWAY : 0);
    const scale = Math.min(ITEM_MAX_SCALE * 16 / tall, (h - MOB_FEET_UP - 24) / (tall + ITEM_UP + 2 * ITEM_BOB), (w - 40) / 18);
    const view = { yaw: turned, pitch: STAGE_PITCH, scale: scale * dpr, center: [0, GROUND, 0], origin: [canvas.width / 2, canvas.height - MOB_FEET_UP * dpr] };
    const out = renderScene(model ? model(up, ITEM_LIT) : itemBoxes(px, up), { ...view, width: canvas.width, height: canvas.height, shadows: [[0, 0, 5.5 - (up - ITEM_UP) * 0.4]] });
    ctx.putImageData(new ImageData(out, canvas.width, canvas.height), 0, 0);
    const sheet = color && !still && swirlsIn(color);
    if (!sheet) return;
    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i < SWIRLS; i++) {
      const at = t / SWIRL_SECONDS + i / SWIRLS, age = at - Math.floor(at), seed = i + Math.floor(at) * SWIRLS;
      const x = (chance(seed) - 0.5) * 22, y = 3 + chance(seed + 0.5) * 12 + age * 7, side = (4 + chance(seed + 0.25) * 2) * 0.5 * scale * dpr;
      const n = sheet.width / 8, f = Math.min(n - 1, Math.floor((1 - age) * n));
      ctx.globalAlpha = Math.min(1, age * 6, (1 - age) * 3) * 0.85;
      ctx.drawImage(sheet, f * 8, 0, 8, 8, Math.round(canvas.width / 2 + x * scale * dpr - side / 2), Math.round(canvas.height - (MOB_FEET_UP + y * scale) * dpr - side / 2), Math.round(side), Math.round(side));
    }
    ctx.globalAlpha = 1;
  };
  const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const step = now => {
    requestAnimationFrame(step);
    if (!canvas.clientWidth || document.hidden || !(px || model) || calmMotion() || now - last < 1000 / ITEM_FPS - 2) return;
    clock += Math.min(0.1, (now - last) / 1000);
    last = now;
    redraw();
  };
  requestAnimationFrame(step);
  new ResizeObserver(redraw).observe(canvas);
  const turnBy = by => {
    yaw += by;
    onTurn();
    redraw();
  };
  canvas.addEventListener("pointerdown", e => { dragX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => {
    if (dragX === null) return;
    const by = (e.clientX - dragX) * 0.015;
    dragX = e.clientX;
    turnBy(by);
  });
  for (const type of ["pointerup", "pointercancel"]) canvas.addEventListener(type, () => { dragX = null; redraw(); });
  canvas.addEventListener("keydown", e => {
    const by = { ArrowLeft: -0.3, ArrowRight: 0.3 }[e.key];
    if (by === undefined) return;
    e.preventDefault();
    turnBy(by);
  });
  return {
    // name: the item's icon (its picture must be 16×16, or it has a model: the shield); swirl: the color of the swirls round it, or none.
    show(name, swirl = null) {
      const spec = ICONS[name];
      model = spec.model || null;
      tall = spec.tall || 16;
      const pixels = model ? [] : spec.gen ? spec.gen() : spec.layers ? artPixels(spec) : fromTemplate(spec);
      px = pixels.length === 256 ? pixels : null;
      color = swirl;
      redraw();
    },
    turnBack() { yaw = ITEM_YAW; redraw(); },
  };
}
