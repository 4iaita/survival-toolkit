/* ---------- Decorated Pots ----------
 * A pot designer: each of a decorated pot's four sides plain brick or any pottery sherd. The pot stands on the armor stands' stage
 * (turning by dragging; a side is picked by clicking it, or with the buttons under it), and the sections under it say what the game
 * calls it, how the crafting grid lays out its sides, where each sherd is found and what else pots do. Laid out as the Banners tab is.
 */
// What the tab shows as icons.
for (const [k, spec] of Object.entries({
  "pot:brick": L("brick"), "pot:clay": L("clay_ball"), "pot:brush": L("brush"), "pot:sand": C("suspicious_sand"), "pot:gravel": C("suspicious_gravel"),
  ...Object.fromEntries(SHERDS.map(s => [`pot:sherd:${s.k}`, L(`${s.k}_pottery_sherd`)])),
  ...Object.fromEntries(POT_TRIAL_LOOT.map(([, , , pic, block]) => [`pot:find:${pic}`, block ? C(pic) : L(pic)])),
})) if (artReady(spec)) ICONS[k] = spec;
const potItemIcon = k => (k === "brick" ? "pot:brick" : ICONS[`pot:sherd:${k}`] ? `pot:sherd:${k}` : "pot:brick");

// The pot: what's on each side (brick, or a sherd's k), the side picked, which section shows and what the search has in it.
const pot = { sides: { back: "brick", left: "brick", right: "brick", front: "brick" }, side: "front", section: "about", query: "" };
const POT_KEY = "pots-v1";
try { Object.assign(pot, JSON.parse(localStorage.getItem(POT_KEY) || "{}")); } catch (_) {}
pot.sides = Object.fromEntries(POT_SIDES.map(s => [s, pot.sides && (pot.sides[s] === "brick" || sherd(pot.sides[s])) ? pot.sides[s] : "brick"]));
if (!POT_SIDES.includes(pot.side)) pot.side = "front";
if (typeof pot.query !== "string") pot.query = "";
const savePot = () => { try { localStorage.setItem(POT_KEY, JSON.stringify(pot)); } catch (_) {} };
const potEdition = () => (state.edition === "bedrock" ? "bedrock" : "java");

/* Names, as the game has them (the same in both editions) */
const itemName = k => (k === "brick" ? "Brick" : `${sherd(k).n} Pottery Sherd`);
const sideName = s => titled(s);
const potSherds = () => POT_SIDES.filter(s => pot.sides[s] !== "brick");
const potKey = sides => POT_SIDES.map(s => sides[s]).join(",");

/* The pack's textures (art/pots/, import_pots.py), decoded once */
const potArt = {};
const potArtReady = Promise.all(Object.entries(typeof POT_ART === "undefined" ? {} : POT_ART).map(([k, src]) => new Promise(done => {
  const img = new Image();
  img.onload = () => { potArt[k] = { w: img.width, h: img.height, px: filePixels(img) }; done(); };
  img.onerror = done;
  img.src = src;
})));
const potTexel = (tex, s, t) => {
  const n = ((t | 0) * tex.w + (s | 0)) * 4;
  return tex.px[n + 3] < 128 ? -1 : tex.px[n] << 16 | tex.px[n + 1] << 8 | tex.px[n + 2];
};

/* The model, the game's (Java's DecoratedPotRenderer, and the pack's own held pot): a body 14×16×14, a neck 6×1×6 on it and a lip 8×3×8
 * on that. Each side of the body is its sherd's pattern (or the plain side), 14×16 from columns 1 to 14, upright from outside; the rest is
 * decorated_pot_base, the neck and lip upside down as the game turns them, so the lip's top is the dark opening. Its front faces the camera
 * at rest (low z), its left is on the camera's left (low x). */
const POT_FACE = [["left", "right"], [null, null], ["front", "back"]];
// How far across a side something is, from its left as seen from outside.
const potAcross = (face, fx, fz) => (face === "front" ? fx : face === "back" ? 0.9999 - fx : face === "left" ? 0.9999 - fz : fz);
// The lip's and neck's sides in the base texture, each face's place along their row.
const POT_RING = { right: 0, front: 1, left: 2, back: 3 };
// lit: light of its own (as the banner's); pick: draw each side in a flat color of its own instead, unshaded, for finding which side a
// click is on. The side picked isn't marked on the pot (a lighter edge looked like a flaw in the texture): the buttons under it say.
function potBoxes(sides, { lit = 0, pick = false } = {}) {
  const base = potArt.base, g = GROUND;
  const flat = c => (c < 0 ? c : lit + c);
  const body = (axis, side, fx, fy, fz) => {
    if (axis === 1) return pick ? 0 : flat(potTexel(base, (side ? 14 : 0) + fx * 14, 13 + fz * 14));
    const face = POT_FACE[axis][side];
    if (pick) return (POT_SIDES.indexOf(face) + 1) * 40 << 16;
    const tex = potArt[sides[face]] || potArt.brick, s = Math.floor(potAcross(face, fx, fz) * 14), t = Math.floor(fy * 16);
    return flat(potTexel(tex, 1 + s, t));
  };
  const ring = (row, w, rows) => (axis, side, fx, fy, fz) => {
    if (pick) return 0;
    if (axis === 1) return flat(potTexel(base, (side ? 8 : 16) + fx * 8, fz * 8));
    const face = POT_FACE[axis][side];
    return flat(potTexel(base, POT_RING[face] * w + potAcross(face, fx, fz) * w, row + rows - 1 - Math.floor(fy * rows)));
  };
  return [
    { lo: [-7, g - 16, -7], hi: [7, g, 7], color: body, glow: pick },
    { lo: [-3, g - 17, -3], hi: [3, g - 16, 3], color: ring(11, 6, 1), glow: pick },
    { lo: [-4, g - 20, -4], hi: [4, g - 17, 4], color: ring(8, 8, 3), glow: pick },
  ];
}

// A side, flat (14×16), as a picture: for the picker, the buttons and the plan.
const potPics = new Map();
function potPic(k) {
  if (potPics.has(k)) return potPics.get(k);
  const tex = potArt[k];
  if (!tex) return "data:,";
  const cv = Object.assign(document.createElement("canvas"), { width: 14, height: 16 }), img = new ImageData(14, 16);
  for (let y = 0; y < 16; y++) img.data.set(tex.px.subarray((y * tex.w + 1) * 4, (y * tex.w + 15) * 4), y * 56);
  cv.getContext("2d").putImageData(img, 0, 0);
  const url = cv.toDataURL();
  potPics.set(k, url);
  return url;
}
const potImg = (k, cls = "pt-pic") => `<img class="${cls}" src="${potPic(k)}" alt="" width="14" height="16">`;

// The pot's icon, as the inventory shows a block, turned to show its front and left: an ICONS key ("pot:plain" while the textures load).
const POT_ICON = 64;
function potIcon(sides) {
  const k = `pot:${potKey(sides)}`;
  if (!potArt.base) return "pot:brick";
  if (!ICONS[k]) ICONS[k] = { gen: () => {
    const px = renderScene(potBoxes(sides, { lit: 170 * EMITS }), { yaw: Math.PI / 4 - 0.12, pitch: 0.5, scale: POT_ICON / 25, center: [0, GROUND - 10, 0], origin: [POT_ICON / 2, POT_ICON / 2], width: POT_ICON, height: POT_ICON });
    return Array.from({ length: POT_ICON * POT_ICON }, (_, i) => (px[i * 4 + 3] ? [px[i * 4], px[i * 4 + 1], px[i * 4 + 2]] : null));
  } };
  return k;
}
const PLAIN_POT = { back: "brick", left: "brick", right: "brick", front: "brick" };

/* The stage: the pot standing, turning by dragging or the arrow keys. A click (not a drag) on a side picks it; picking one with the
 * buttons turns the pot to show it, unless the reader asks for less motion. */
const POT_LIT = 60 * EMITS, POT_YAW = 0.45, POT_MAX_SCALE = 9;
// The camera's turn that shows each side, a little from its left.
const POT_SIDE_YAW = { front: 0, left: Math.PI / 2, back: Math.PI, right: -Math.PI / 2 };
function potScene(canvas, { onTurn = () => {}, onPick = () => {} } = {}) {
  const ctx = canvas.getContext("2d");
  let sides = null, yaw = POT_YAW, aim = null, frame = 0, drag = null;
  const viewOf = (w, h, dpr) => {
    const scale = Math.min(POT_MAX_SCALE, (h - MOB_FEET_UP - 18) / 24, (w - 40) / 22);
    return { yaw, pitch: STAGE_PITCH, scale: scale * dpr, center: [0, GROUND, 0], origin: [w * dpr / 2, (h - MOB_FEET_UP) * dpr] };
  };
  const draw = () => {
    frame = 0;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const moving = drag || aim !== null, dpr = moving ? 1 : Math.max(1, Math.min(2, Math.round(window.devicePixelRatio || 1)));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (!sides || !potArt.base) return;
    const out = renderScene(potBoxes(sides, { lit: POT_LIT }), { ...viewOf(w, h, dpr), width: canvas.width, height: canvas.height, shadows: [[0, 0, 8]] });
    ctx.putImageData(new ImageData(out, canvas.width, canvas.height), 0, 0);
  };
  const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
  // Turning to a side: a little of the way each frame.
  const ease = () => {
    if (aim === null) return;
    const by = aim - yaw;
    if (Math.abs(by) < 0.01) { yaw = aim; aim = null; }
    else yaw += by * 0.2;
    redraw();
    if (aim !== null) requestAnimationFrame(ease);
  };
  new ResizeObserver(redraw).observe(canvas);
  const turnBy = by => { aim = null; yaw += by; onTurn(); redraw(); };
  // Which side is at a point on the canvas (CSS pixels), drawn again in flat colors at that size.
  const sideAt = (x, y) => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!sides || !potArt.base) return null;
    const px = renderScene(potBoxes(sides, { pick: true }), { ...viewOf(w, h, 1), width: w, height: h });
    const n = (Math.floor(y) * w + Math.floor(x)) * 4;
    return px[n + 3] ? POT_SIDES[Math.round(px[n] / 40) - 1] || null : null;
  };
  canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, from: e.clientX, y: e.clientY, moved: false }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.from, e.clientY - drag.y) > 4) drag.moved = true;
    if (!drag.moved) return;
    const by = (e.clientX - drag.x) * 0.015;
    drag.x = e.clientX;
    turnBy(by);
  });
  canvas.addEventListener("pointerup", e => {
    const was = drag;
    drag = null;
    redraw();
    if (was && !was.moved) {
      const r = canvas.getBoundingClientRect(), side = sideAt(e.clientX - r.left, e.clientY - r.top);
      if (side) onPick(side);
    }
  });
  canvas.addEventListener("pointercancel", () => { drag = null; redraw(); });
  canvas.addEventListener("keydown", e => {
    const by = { ArrowLeft: -0.3, ArrowRight: 0.3 }[e.key];
    if (by === undefined) return;
    e.preventDefault();
    turnBy(by);
  });
  return {
    show(s) { sides = s; redraw(); },
    // Turn to show a side, the short way round.
    face(side) {
      const to = POT_SIDE_YAW[side] + POT_YAW, turns = Math.round((yaw - to) / (2 * Math.PI)), target = to + turns * 2 * Math.PI;
      onTurn();
      if (calmMotion()) { yaw = target; aim = null; redraw(); return; }
      const going = aim !== null;
      aim = target;
      if (!going) requestAnimationFrame(ease);
    },
    sideAt,
  };
}
const potStage = $("pot-stage");
const potView = potScene($("pot-art"), { onTurn: () => potStage.classList.add("turned"), onPick: side => pickPotSide(side, false) });
potStage.style.setProperty("--ground", `url('${groundArt("plains")}')`);
function showPot() {
  potView.show({ ...pot.sides });
  $("pot-art").setAttribute("aria-label", `Decorated Pot: ${POT_SIDES.map(s => `${s} ${itemName(pot.sides[s])}`).join(", ")}. The ${pot.side} is picked. Drag or use the arrow keys to turn it.`);
}

/* Under the stage: the four sides, and what to do to the whole pot */
function renderPotSides() {
  $("pot-sides-label").textContent = `Side: ${sideName(pot.side)}`;
  $("pot-sides").innerHTML = POT_SIDES.map(s => `<button type="button" class="name-chip" data-side="${s}" aria-pressed="${s === pot.side}" title="${esc(itemName(pot.sides[s]))}">${potImg(pot.sides[s], "pt-pic xs")}${sideName(s)}</button>`).join("");
  const n = potSherds().length, same = POT_SIDES.every(s => pot.sides[s] === pot.sides[pot.side]);
  $("pot-acts-label").textContent = `Pot: ${n ? plural(n, "sherd") : "plain"}`;
  $("pot-acts").innerHTML = `
    ${same ? "" : `<button type="button" class="name-chip" data-act="all">${potImg(pot.sides[pot.side], "pt-pic xs")}The ${pot.side}’s on every side</button>`}
    ${n ? `<button type="button" class="name-chip" data-act="plain">${potImg("brick", "pt-pic xs")}All bricks</button>` : ""}
    ${n ? "" : `<button type="button" class="name-chip" data-act="random">${iconImg("pot:brush")}Any 4 sherds</button>`}`;
}

/* Beside the stage: what can go on the side picked, each as it looks on the pot */
function renderPotPicker() {
  $("pot-name").textContent = "Decorated Pot";
  const on = pot.sides[pot.side];
  const tile = k => `<button type="button" class="pt-tile" id="pt-${k}" data-put="${k}" aria-pressed="${k === on}" aria-label="Put ${esc(itemName(k))} on the ${pot.side}" title="${esc(itemName(k))}${k === "brick" ? "" : `: ${esc(sherd(k).say.toLowerCase())}`}">${potImg(k)}</button>`;
  $("pot-picker").innerHTML = `
    <p class="choice-hint">On the ${pot.side}: <b>${esc(itemName(on))}</b>. Pick what goes there, or another side under the pot.</p>
    <div>
      <div class="cat-label">Plain</div>
      <div class="pt-tiles">${tile("brick")}</div>
    </div>
    <div>
      <div class="cat-label">Pottery sherds</div>
      <div class="pt-tiles">${SHERDS.map(s => tile(s.k)).join("")}</div>
    </div>`;
}

/* The sections */
const POT_SECTIONS = [["about", "Overview"], ["craft", "Crafting plan"], ["sherds", "Sherds"], ["uses", "Good to know"]];
const potSectionIcon = s => ({ about: potIcon(pot.sides), craft: "ui:crafting", sherds: "pot:brush", uses: potIcon(PLAIN_POT) }[s]);
const potHead = (s, note = "") => sectionHead("pot-section-title", potSectionIcon(s), POT_SECTIONS.find(([k]) => k === s)[1], note);
const ptFact = (label, text) => (text ? `<div class="fact-row"><dt>${label}</dt><dd>${esc(text)}</dd></div>` : "");
const ptForEdition = v => byEdition(v, state.edition);
const potSlot = (sides = pot.sides) => plainSlot(potIcon(sides));
// The game's tooltip: its name, then (unless it's all bricks) the four sides in gray, back, left, right, front.
function potTooltip() {
  const plain = !potSherds().length;
  return `<div class="mc-tooltip">${potSlot()}<div>
      <div class="tname plain">Decorated Pot</div>
      ${plain ? "" : `<ul><li class="pt-tip-side">&nbsp;</li>${POT_SIDES.map(s => `<li class="pt-tip-side">${esc(itemName(pot.sides[s]))}</li>`).join("")}</ul>`}
      <div class="foot">${plain ? "All bricks: it lists nothing" : "Back, left, right, then front"}</div>
    </div></div>`;
}
// What it takes: each sherd and how many, and the bricks.
function potNeeds() {
  const count = {};
  for (const s of POT_SIDES) count[pot.sides[s]] = (count[pot.sides[s]] || 0) + 1;
  return [...SHERDS.filter(s => count[s.k]).map(s => [s.k, count[s.k]]), ...(count.brick ? [["brick", count.brick]] : [])];
}

function potAbout() {
  const n = potSherds().length;
  const stat = (label, value, sub) => `<div class="mob-stat text"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="sub">${sub}</span>` : ""}</div>`;
  const kinds = new Set(potSherds().map(s => pot.sides[s])).size;
  return `${potHead("about", potEdition() === "java" ? "Java Edition" : "Bedrock Edition")}
    <div class="mob-stats">
      ${stat("Sherds", `${n} of 4`, n ? `${plural(kinds, "kind")}` : "A plain pot")}
      ${stat("Bricks", `${4 - n}`, 4 - n ? "Plain sides" : "None")}
      ${stat("Made in", "A crafting table", "1 step")}
      ${stat("Holds", "1 stack", "Of one kind of item")}
    </div>
    <div class="cat-label potion-label">How the game shows it</div>
    ${potTooltip()}
    <dl class="fact-list">
      ${ptFact("The list", POT_FACTS.tooltip)}
      ${ptFact("Its sides", POT_FACTS.sides)}
      ${ptFact("Placed", POT_FACTS.place)}
    </dl>`;
}

// Crafting plan: what it takes, the grid, and which slot is which side.
function potCraft() {
  const need = (k, n) => `<div class="need-item">${countSlot(potItemIcon(k), n)}<span>${esc(itemName(k))}<span class="sub">× ${n}, ${k === "brick" ? (n === 4 ? "every side" : `for the plain side${n > 1 ? "s" : ""}`) : `for the ${POT_SIDES.filter(s => pot.sides[s] === k).join(" and ")}`}</span></span></div>`;
  const cells = Array(9).fill(null);
  for (const s of POT_SIDES) cells[POT_SLOT[s]] = s;
  const grid = `<div class="craft-grid pt-grid">${cells.map(s => (s ? `<span class="slot sm${s === pot.side ? " pt-on" : ""}" title="${sideName(s)}: ${esc(itemName(pot.sides[s]))}">${iconImg(potItemIcon(pot.sides[s]))}</span>` : '<span class="slot sm"></span>')).join("")}</div>`;
  const rows = POT_SIDES.map(s => `<tr${s === pot.side ? ' class="on"' : ""}><td>${POT_SLOT_SAY[s]}</td><td>${potImg(pot.sides[s], "pt-pic sm")}${sideName(s)}</td><td>${esc(itemName(pot.sides[s]))}</td></tr>`).join("");
  return `${potHead("craft", "1 step")}
    <div class="need">${potNeeds().map(([k, n]) => need(k, n)).join("")}</div>
    <ol class="steps bn-steps pt-steps">
      <li class="step">
        <div class="step-top"><span class="step-no">Step 1</span><span class="cost">Crafting table</span></div>
        <div class="pt-craft">${grid}${iconImg("ui:arrow")}${potSlot()}</div>
        <div class="what">
          <div><span class="lbl">Craft:</span> ${potSherds().length ? "the 4 in a diamond, each in its side’s slot" : "4 bricks in a diamond"}</div>
          <div><span class="lbl">Makes:</span> a Decorated Pot</div>
        </div>
      </li>
    </ol>
    <div class="cat-label potion-label">Which slot is which side</div>
    <table class="pt-table">
      <thead><tr><th>Grid slot</th><th>Side</th><th>On it</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <dl class="fact-list">
      ${ptFact("The grid", POT_FACTS.sides)}
      ${ptFact("Placed", POT_FACTS.place)}
      ${ptFact("Recipe", POT_FACTS.craft)}
      ${ptFact("All bricks", POT_FACTS.simple)}
    </dl>
    <div class="final">${potTooltip()}</div>`;
}

// Sherds: every one, where it's found and how likely; the pot's own first.
function potSherdList() {
  const used = SHERDS.filter(s => potSherds().some(side => pot.sides[side] === s.k)), keys = [...used, ...SHERDS.filter(s => !used.includes(s))];
  const row = s => {
    const site = POT_SITES[s.site], on = POT_SIDES.filter(side => pot.sides[side] === s.k);
    const block = site.block === "sand" ? "Suspicious sand" : site.block === "gravel" ? "Suspicious gravel" : "A decorated pot";
    return `<li class="item-row${on.length ? " pt-used" : ""}">${plainSlot(potItemIcon(s.k), "sm")}
      <span class="item-name">${esc(itemName(s.k))}${on.length ? ` <span class="sub">On the ${esc(on.join(" and "))}</span>` : ""}<span class="sub">${esc(s.say)}. ${esc(site.n)}: ${esc(block.toLowerCase())}.</span></span>
      <span class="item-chance">${esc(s.chance)}</span></li>`;
  };
  const sites = Object.entries(POT_SITES).map(([k, site]) => {
    const list = SHERDS.filter(s => s.site === k).map(s => s.n).join(", ");
    return ptFact(site.n, `${list}. ${site.where} ${POT_SITE_OTHERS[k]}`);
  }).join("");
  return `${potHead("sherds", used.length ? `${used.length} on this pot` : "None on this pot")}
    <p class="mob-lead">23 sherds, each with its own picture. Twenty are brushed out of suspicious sand and gravel; three only come off the decorated pots in trial chambers.</p>
    <ul class="item-list wide">${keys.map(row).join("")}</ul>
    <p class="tag-note potion-note">Chances are for each suspicious block brushed (or each trial chamber pot), from both editions’ loot tables: they’re the same.</p>
    <div class="cat-label potion-label">Where they’re found</div>
    <dl class="fact-list">${sites}
      ${ptFact("Brushing", POT_FACTS.brush)}
      ${ptFact("Sherds", POT_FACTS.rarity)}
      ${ptFact("Bricks", POT_FACTS.brick)}
      ${ptFact("Advancements", ptForEdition(POT_FACTS.advance))}
    </dl>`;
}

// Good to know: what else a pot does.
function potUses() {
  return `${potHead("uses")}
    <dl class="fact-list">
      ${ptFact("Storing", POT_FACTS.store)}
      ${ptFact("Comparators", POT_FACTS.comparator)}
      ${ptFact("Wobbling", ptForEdition(POT_FACTS.wobble))}
      ${ptFact("Breaking", POT_FACTS.break)}
      ${ptFact("Shattering", ptForEdition(POT_FACTS.shatter))}
      ${ptFact("What’s inside", POT_FACTS.inside)}
      ${ptFact("Pistons and explosions", POT_FACTS.push)}
      ${ptFact("Placing", POT_FACTS.water)}
      ${ptFact("Mobs", ptForEdition(POT_FACTS.mobs))}
    </dl>
    <div class="cat-label potion-label">In trial chambers</div>
    <p class="mob-lead">Decorated pots stand about trial chambers, each holding one find (pots/trial_chambers/corridor, the same in both editions). 1 in 13 has a Flow, Guster or Scrape sherd on its back.</p>
    <ul class="item-list wide">${POT_TRIAL_LOOT.map(([n, count, chance, pic]) => `<li class="item-row">${ICONS[`pot:find:${pic}`] ? plainSlot(`pot:find:${pic}`, "sm") : '<span class="slot sm"></span>'}<span class="item-name">${esc(n)}<span class="sub">× ${count}</span></span><span class="item-chance">${chance}</span></li>`).join("")}</ul>`;
}

function renderPotResult() {
  const on = POT_SECTIONS.some(([k]) => k === pot.section) ? pot.section : "about";
  const body = { about: potAbout, craft: potCraft, sherds: potSherdList, uses: potUses }[on]();
  const n = potSherds().length;
  $("pot-result").innerHTML = `
    <div class="res-top">
      <div class="res-title">${potSlot()}
        <div><h2>Decorated Pot</h2><div class="res-sub">${n ? esc(POT_SIDES.map(s => `${sideName(s)}: ${pot.sides[s] === "brick" ? "Brick" : sherd(pot.sides[s]).n}`).join(" · ")) : "Plain: 4 bricks"}</div></div>
      </div>
    </div>
    <div class="mob-tabs" role="tablist" aria-label="Decorated pot">
      ${POT_SECTIONS.map(([k, title]) => `<button type="button" class="mob-tab" role="tab" id="pot-tab-${k}" data-section="${k}"
        aria-selected="${k === on}" aria-controls="pot-section" tabindex="${k === on ? 0 : -1}">${iconImg(potSectionIcon(k))}${title}</button>`).join("")}
    </div>
    <section class="mob-section" id="pot-section" role="tabpanel" aria-labelledby="pot-tab-${on}">${body}</section>`;
}

// Search: sherds by name, by what they show or by where they're found; picking one puts it on the side picked.
function renderPotSearch() {
  const q = pot.query.trim().toLowerCase(), box = $("pot-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type a sherd’s name, what it shows (“creeper”, “bow”) or where it’s found (“desert”, “trail ruins”, “gravel”), then pick it to put it on the ${pot.side}.</p>`;
    return;
  }
  const where = s => { const site = POT_SITES[s.site]; return [site.n, site.where, site.block === "pot" ? "decorated pot" : `suspicious ${site.block}`]; };
  const hits = [...SHERDS.filter(s => [itemName(s.k), s.say, ...where(s)].some(t => t.toLowerCase().includes(q))).map(s => s.k),
    ...(["brick", "plain", "clay"].some(t => t.includes(q) || q.includes(t)) ? ["brick"] : [])];
  box.innerHTML = hits.length
    ? hits.map(k => `
      <button type="button" class="search-hit" data-put="${k}">
        <span class="slot sm">${potImg(k, "pt-pic sm")}</span>
        <span><span class="who">${esc(itemName(k))}</span><span class="deal">${k === "brick" ? "The plain side" : `${esc(sherd(k).say)} · ${esc(POT_SITES[sherd(k).site].n)}, ${esc(sherd(k).chance)}`}</span></span>
      </button>`).join("")
    : `<p class="choice-hint">No sherd is called, shows or is found anywhere like “${esc(pot.query.trim())}”.</p>`;
}

function renderPot() {
  renderPotSides();
  renderPotPicker();
  renderPotResult();
  renderPotSearch();
  showPot();
  savePot();
}

/* What the buttons do */
function pickPotSide(side, turn = true) {
  pot.side = side;
  if (turn) potView.face(side);
  renderPot();
}
function putOnPot(k) {
  pot.sides[pot.side] = k;
  renderPot();
}
$("pot-sides").addEventListener("click", e => {
  const b = e.target.closest("button[data-side]");
  if (!b) return;
  pickPotSide(b.dataset.side);
  refocus(`#pot-sides button[data-side="${pot.side}"]`);
});
$("pot-acts").addEventListener("click", e => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const on = pot.sides[pot.side];
  if (b.dataset.act === "all") for (const s of POT_SIDES) pot.sides[s] = on;
  if (b.dataset.act === "plain") for (const s of POT_SIDES) pot.sides[s] = "brick";
  if (b.dataset.act === "random") for (const s of POT_SIDES) pot.sides[s] = SHERDS[Math.floor(Math.random() * SHERDS.length)].k;
  renderPot();
  refocus(`#pot-sides button[data-side="${pot.side}"]`);
});
$("pot-picker").addEventListener("click", e => {
  const b = e.target.closest("button[data-put]");
  if (!b) return;
  putOnPot(b.dataset.put);
  refocus(`#pt-${b.dataset.put}`);
});
$("pot-results").addEventListener("click", e => {
  const b = e.target.closest("button[data-put]");
  if (!b) return;
  putOnPot(b.dataset.put);
  refocus(`#pot-results button[data-put="${b.dataset.put}"]`);
});
const pickPotSection = k => {
  pot.section = k;
  renderPotResult();
  savePot();
  refocus(`#pot-tab-${k}`);
};
$("pot-result").addEventListener("click", e => {
  const tab = e.target.closest("button[data-section]");
  if (tab) pickPotSection(tab.dataset.section);
});
$("pot-result").addEventListener("keydown", e => {
  if (!e.target.closest("[role=tab]")) return;
  const i = POT_SECTIONS.findIndex(([k]) => k === pot.section), n = POT_SECTIONS.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickPotSection(POT_SECTIONS[to % n][0]);
});
$("pot-search").addEventListener("input", e => { pot.query = e.target.value; renderPotSearch(); savePot(); });
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderPot(); });

$("pot-search").value = pot.query;
// The tab's button starts with the plain side (ui:pot) and gets the pot itself once its textures are in.
potArtReady.then(() => {
  const tab = document.querySelector("#tab-pots img");
  if (tab) tab.src = icon(potIcon(PLAIN_POT));
  renderPot();
});
