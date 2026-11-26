/* ---------- Banners ----------
 * A banner designer: pick the banner's color, then add patterns in dyes, as a loom does, up to its 6 layers. The banner stands on
 * the armor stands' stage (turning, its flag swaying as the game's does), and the sections under it say what it's called, how to
 * make it in a loom step by step, where the banner patterns come from and what else banners do. Laid out as the Potions tab is.
 */
// The banner: its color (a DYES name), its layers ([pattern, dye], the first at the bottom), whether it's the ominous banner (which
// a loom can't make), the dye the next layer is added in, which section shows and what the search has in it.
const bnr = { base: "white", layers: [], ominous: false, ink: "red", section: "about", query: "" };
const BANNER_KEY = "banners-v1";
try { Object.assign(bnr, JSON.parse(localStorage.getItem(BANNER_KEY) || "{}")); } catch (_) {}
if (!DYES[bnr.base]) bnr.base = "white";
if (!DYES[bnr.ink]) bnr.ink = "red";
bnr.layers = Array.isArray(bnr.layers) ? bnr.layers.filter(l => Array.isArray(l) && bannerPattern(l[0]) && DYES[l[1]]).slice(0, BANNER_MAX) : [];
if (bnr.ominous) bnr.layers = OMINOUS_LAYERS.map(l => [...l]);
const saveBanner = () => { try { localStorage.setItem(BANNER_KEY, JSON.stringify(bnr)); } catch (_) {} };

// What the tab shows as icons.
for (const [k, spec] of Object.entries({
  "bn:bricks": C("brick_block"), "bn:vine": L("vine_carried"), "bn:daisy": L("flower_oxeye_daisy"), "bn:gapple": L("golden_apple"),
  "bn:paper": L("paper"), "bn:stick": L("stick"), "bn:map": L("filled_map"), "bn:pattern": L("banner_pattern"),
  ...Object.fromEntries(Object.keys(BANNER_ITEMS).map(k => [`bn:item:${k}`, L(`${k}_banner_pattern`)])),
  ...Object.fromEntries(BANNER_COLORS.flatMap(c => [[`bn:dye:${c}`, L(`${dyeId(c)}_dye`)], [`bn:wool:${c}`, C(`${dyeId(c)}_wool`)], [`bn:banner:${c}`, L(`banner_${dyeId(c)}`)]])),
})) if (artReady(spec)) ICONS[k] = spec;
const bnIcon = k => (ICONS[k] ? k : "bn:pattern");

/* Names, as the game's tooltips have them */
const bnEdition = () => (state.edition === "bedrock" ? "bedrock" : "java");
const patternName = k => { const p = bannerPattern(k); return (bnEdition() === "bedrock" && p.be) || p.n; };
const layerName = ([k, c]) => `${titled(c)} ${patternName(k)}`;
const bannerName = (b = bnr) => (b.ominous ? "Ominous Banner" : `${titled(b.base)} Banner`);
const patternItemName = k => `${BANNER_ITEMS[k].n} Banner Pattern`;
const bannerFull = () => bnr.ominous || bnr.layers.length >= BANNER_MAX;
// Bedrock's ominous banner is an item of its own, a picture with no layers.
const ownOminous = () => bnr.ominous && bnEdition() === "bedrock";
const lowerFirst = s => s[0].toLowerCase() + s.slice(1);

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
  const own = b.ominous && edition === "bedrock", key = own ? "ominous" : `${edition}|${b.base}|${b.layers.map(l => l.join(":")).join(",")}`;
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
// The flag's front, flat (20×40), as a picture: for the picker, the layers and the plan.
const bannerPics = new Map();
function bannerPic(b) {
  const tex = bannerTexture(b);
  if (!tex) return "data:,";
  if (bannerPics.has(tex)) return bannerPics.get(tex);
  const cv = Object.assign(document.createElement("canvas"), { width: 20, height: 40 }), img = new ImageData(20, 40);
  for (let y = 0; y < 40; y++) img.data.set(tex.px.subarray(((y + 1) * 64 + 1) * 4, ((y + 1) * 64 + 21) * 4), y * 80);
  cv.getContext("2d").putImageData(img, 0, 0);
  const url = cv.toDataURL();
  bannerPics.set(tex, url);
  return url;
}
const bannerImg = (b, cls = "bn-pic") => `<img class="${cls}" src="${bannerPic(b)}" alt="" width="20" height="40">`;
const bannerUpTo = n => ({ base: bnr.base, layers: bnr.layers.slice(0, n), ominous: bnr.ominous && n >= bnr.layers.length });

/* The stage: the banner standing, as the game's model has it (the flag 20×40×1 hung from a bar, in front of the pole), turning by
 * dragging or the arrow keys. Its flag sways about its top as the game's does, over 5 seconds, unless the reader asks for less motion. */
const BANNER_CUBES = [
  { lo: [-10, -44, -2], size: [20, 40, 1], uv: [0, 0], flag: true },
  { lo: [-1, -42, -1], size: [2, 42, 2], uv: [44, 0] },
  { lo: [-10, -44, -1], size: [20, 2, 2], uv: [0, 42] },
];
const BANNER_LIT = 60 * EMITS, BANNER_YAW = 0.35, BANNER_FPS = 20, BANNER_MAX_SCALE = 6;
// How far the flag swings, by the time in seconds: the game's (-0.0125 + 0.01 cos) half turns, its sway taking 100 ticks.
const bannerSwing = t => (-0.0125 + 0.01 * Math.cos(2 * Math.PI * t / 5)) * Math.PI;
function bannerBoxes(tex, t) {
  return BANNER_CUBES.map(({ lo, size, uv, flag }) => ({
    lo: [lo[0], GROUND + lo[1], lo[2]], hi: [lo[0] + size[0], GROUND + lo[1] + size[1], lo[2] + size[2]],
    bone: flag ? { pivot: [0, GROUND - 44, -1.5], angles: [bannerSwing(t), 0, 0] } : undefined,
    color: (axis, side, fx, fy, fz) => {
      const n = skinTexel(uv, size, FACES[axis][side], fx, fy, fz);
      return tex.px[n + 3] < 128 ? -1 : BANNER_LIT + (tex.px[n] << 16 | tex.px[n + 1] << 8 | tex.px[n + 2]);
    },
  }));
}
function bannerScene(canvas, { onTurn = () => {} } = {}) {
  const ctx = canvas.getContext("2d");
  let tex = null, yaw = BANNER_YAW, frame = 0, dragX = null, last = 0, clock = 0;
  const draw = () => {
    frame = 0;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = dragX !== null ? 1 : Math.max(1, Math.min(2, Math.round(window.devicePixelRatio || 1)));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (!tex) return;
    const scale = Math.min(BANNER_MAX_SCALE, (h - MOB_FEET_UP - 18) / 46, (w - 40) / 26);
    const view = { yaw, pitch: STAGE_PITCH, scale: scale * dpr, center: [0, GROUND, 0], origin: [canvas.width / 2, canvas.height - MOB_FEET_UP * dpr] };
    const out = renderScene(bannerBoxes(tex, calmMotion() ? 0 : clock), { ...view, width: canvas.width, height: canvas.height, shadows: [[0, 0, 3]] });
    ctx.putImageData(new ImageData(out, canvas.width, canvas.height), 0, 0);
  };
  const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const step = now => {
    requestAnimationFrame(step);
    if (!canvas.clientWidth || document.hidden || !tex || calmMotion() || now - last < 1000 / BANNER_FPS - 2) return;
    clock += Math.min(0.1, (now - last) / 1000);
    last = now;
    redraw();
  };
  requestAnimationFrame(step);
  new ResizeObserver(redraw).observe(canvas);
  const turnBy = by => { yaw += by; onTurn(); redraw(); };
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
  return { show(t) { tex = t; redraw(); } };
}
const bannerStage = $("banner-stage");
const bannerView = bannerScene($("banner-art"), { onTurn: () => bannerStage.classList.add("turned") });
bannerStage.style.setProperty("--ground", `url('${groundArt("plains")}')`);
function showBanner() {
  bannerView.show(bannerTexture(bnr));
  $("banner-art").setAttribute("aria-label", `${bannerName()}${bnr.layers.length && !ownOminous() ? `: ${bnr.layers.map(layerName).join(", ")}` : ""}. Drag or use the arrow keys to turn it.`);
}

/* Under the stage: the banner's color, and its layers, each of which can be moved or taken off */
const bnBtn = (attr, i, label, text, off = false) => `<button type="button" class="mc-btn sm bn-btn" data-${attr}="${i}" aria-label="${label}"${off ? " disabled" : ""}>${text}</button>`;
function renderBannerLayers() {
  $("banner-base-label").textContent = `Banner: ${titled(bnr.base)}`;
  $("banner-base").innerHTML = BANNER_COLORS.map(c => dyeSwatch("base", c, c === bnr.base)).join("");
  const n = bnr.layers.length;
  $("banner-layers-label").textContent = ownOminous() ? "Layers: none" : bnr.ominous ? `Layers: ${n}, as the game has them` : `Layers: ${n} of ${BANNER_MAX}`;
  $("banner-layers").innerHTML = (ownOminous() ? `<p class="choice-hint">In Bedrock the ominous banner is an item of its own, drawn as one picture (this is the pack’s), with no layers.</p>` : n ? `<ol class="bn-layers">${bnr.layers.map((l, i) => `
    <li class="bn-layer">${bannerImg(bannerUpTo(i + 1), "bn-pic sm")}
      <span class="bn-layer-name">${esc(layerName(l))}<span class="sub">${i + 1}. ${esc(bannerPattern(l[0]).say)}</span></span>
      ${bnr.ominous ? "" : `<span class="bn-layer-acts">${bnBtn("up", i, `Move ${esc(layerName(l))} down a layer`, "▲", i === 0)}${bnBtn("down", i, `Move ${esc(layerName(l))} up a layer`, "▼", i === n - 1)}${bnBtn("drop", i, `Take ${esc(layerName(l))} off`, "✕")}</span>`}
    </li>`).join("")}</ol>` : `<p class="choice-hint">No patterns yet: pick a dye and a pattern beside the banner to add one.</p>`) +
    `<div class="try-tags bn-acts">
      ${n && !bnr.ominous ? `<button type="button" class="name-chip" data-act="wash">${iconImg("site:Cauldron")}Wash off the last</button>` : ""}
      ${n ? `<button type="button" class="name-chip" data-act="clear">${bnr.ominous ? "Start a new banner" : "Take every layer off"}</button>` : ""}
      ${bnr.ominous ? "" : `<button type="button" class="name-chip" data-act="ominous">${bannerImg({ base: "white", layers: OMINOUS_LAYERS, ominous: true }, "bn-pic xs")}The ominous banner</button>`}
    </div>`;
}

/* Beside the stage: the dye for the next layer, then every pattern in it, over the banner's color */
function renderBannerPicker() {
  $("banner-name").textContent = bannerName();
  const full = bannerFull(), why = bnr.ominous ? "The ominous banner can’t go in a loom" : `A loom adds ${BANNER_MAX} layers at most`;
  const tile = p => `<button type="button" class="bn-tile" id="bn-${p.k}" data-add="${p.k}" aria-label="Add ${esc(layerName([p.k, bnr.ink]))}" title="${esc(layerName([p.k, bnr.ink]))}${p.item ? ` (needs the ${esc(patternItemName(p.item))})` : ""}"${full ? ` disabled` : ""}>
      ${bannerImg({ base: bnr.base, layers: [[p.k, bnr.ink]] })}</button>`;
  const groups = BANNER_GROUPS.filter(([g]) => g !== "corners").map(([g, title]) => {
    const list = BANNER_PATTERNS.filter(p => (g === "item" ? p.item : p.group === g || (g === "halves" && p.group === "corners")));
    return `<div><div class="cat-label">${title}</div><div class="bn-tiles">${list.map(tile).join("")}</div></div>`;
  }).join("");
  $("banner-picker").innerHTML = `
    <div>
      <div class="cat-label" id="banner-ink-label">Dye: ${titled(bnr.ink)}</div>
      <div class="try-tags" role="group" aria-labelledby="banner-ink-label">${BANNER_COLORS.map(c => dyeSwatch("ink", c, c === bnr.ink)).join("")}</div>
    </div>
    ${full ? `<p class="tag-note bn-full">${why}. ${bnr.ominous ? "Start a new banner to make one of your own." : "Take a layer off to add another."}</p>` : ""}
    ${groups}`;
}

/* The sections */
const BANNER_SECTIONS = [["about", "Overview"], ["loom", "Loom plan"], ["items", "Banner patterns"], ["uses", "Good to know"]];
const bannerSectionIcon = s => ({ about: bnIcon(`bn:banner:${bnr.base}`), loom: "site:Loom", items: "bn:pattern", uses: "shield" }[s]);
const bannerHead = (s, note = "") => sectionHead("banner-section-title", bannerSectionIcon(s), BANNER_SECTIONS.find(([k]) => k === s)[1], note);
const bnFact = (label, text) => (text ? `<div class="fact-row"><dt>${label}</dt><dd>${esc(text)}</dd></div>` : "");
const bnForEdition = v => byEdition(v, state.edition);
const bnSlot = b => `<span class="slot bn-slot">${bannerImg(b, "bn-pic sm")}</span>`;
// What the layers need: each dye and how many, and each banner pattern.
const bannerDyes = () => BANNER_COLORS.map(c => [c, bnr.layers.filter(l => l[1] === c).length]).filter(([, n]) => n);
const bannerItemsUsed = () => [...new Set(bnr.layers.map(([k]) => bannerPattern(k).item).filter(Boolean))];
// The game's tooltip: its name, then its layers (Java lists the first 6 only).
function bannerTooltip() {
  const shown = ownOminous() ? [] : bnEdition() === "java" ? bnr.layers.slice(0, 6) : bnr.layers;
  return `<div class="mc-tooltip">${bnSlot(bnr)}<div>
      <div class="tname ${bnr.ominous ? "bn-uncommon" : "plain"}">${esc(bannerName())}</div>
      <ul>${shown.map(l => `<li class="bn-tip-layer">${esc(layerName(l))}</li>`).join("")}${shown.length < bnr.layers.length ? `<li class="bn-tip-layer">…</li>` : ""}</ul>
      <div class="foot">${ownOminous() ? "An item of its own, with no layers" : bnr.layers.length ? `${plural(bnr.layers.length, "layer")}, the first at the bottom` : "No patterns"}</div>
    </div></div>`;
}
// Java's command for it; Bedrock's /give can't add patterns.
const bannerCommand = () => `/give @s ${dyeId(bnr.base)}_banner[banner_patterns=[${bnr.layers.map(([k, c]) => `{pattern:"${k}",color:"${dyeId(c)}"}`).join(",")}]]`;

function bannerAbout() {
  const dyes = bannerDyes(), items = bannerItemsUsed(), n = bnr.layers.length;
  const stat = (label, value, sub) => `<div class="mob-stat text"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="sub">${sub}</span>` : ""}</div>`;
  return `${bannerHead("about", bnEdition() === "java" ? "Java Edition" : "Bedrock Edition")}
    <div class="mob-stats">
      ${stat("Layers", ownOminous() ? "–" : bnr.ominous ? `${n}` : `${n} of ${BANNER_MAX}`, ownOminous() ? "An item of its own" : bnr.ominous ? "More than a loom adds" : n >= BANNER_MAX ? "Full" : `Room for ${BANNER_MAX - n} more`)}
      ${stat("Dyes", bnr.ominous ? "–" : `${n}`, bnr.ominous ? "Not made with dyes" : dyes.length ? esc(dyes.map(([c, k]) => `${k} ${titled(c)}`).join(", ")) : "None yet")}
      ${stat("Banner patterns", bnr.ominous ? "–" : `${items.length}`, items.length ? esc(items.map(k => BANNER_ITEMS[k].n).join(", ")) : "None needed")}
      ${stat("Made in", bnr.ominous ? "No block" : "A loom", bnr.ominous ? "Carried by raid captains" : `${plural(n + 1, "step")}, with crafting the banner`)}
    </div>
    <div class="cat-label potion-label">How the game shows it</div>
    ${bannerTooltip()}
    ${bnEdition() === "java" && !bnr.ominous ? `<div class="cat-label potion-label">Command</div>
      <div class="bn-command"><code id="banner-command">${esc(bannerCommand())}</code><button type="button" class="mc-btn sm" id="banner-copy">Copy</button></div>` : ""}
    <dl class="fact-list">
      ${bnr.ominous ? bnFact("Ominous banner", bnForEdition(BANNER_FACTS.ominous)) : ""}
      ${bnFact("Layers", bnForEdition(BANNER_FACTS.limit))}
      ${bnFact("Took a wrong one?", BANNER_FACTS.wash)}
      ${bnEdition() === "bedrock" && !bnr.ominous ? bnFact("Command", "Bedrock’s /give can’t add patterns: make it in a loom.") : ""}
    </dl>`;
}

// Loom plan: what it takes, then each layer as the loom adds it.
let bannerRulesOpen = false;
function bannerLoom() {
  if (bnr.ominous) return `${bannerHead("loom")}<p class="mob-lead">The ominous banner can’t be made: ${esc(bnForEdition(BANNER_FACTS.ominous))}</p>`;
  const need = (icon, name, n, sub) => `<div class="need-item">${countSlot(icon, n)}<span>${esc(name)}<span class="sub">${sub}</span></span></div>`;
  const items = bannerItemsUsed();
  const steps = [`
    <li class="step">
      <div class="step-top"><span class="step-no">Step 1</span><span class="cost">Crafting table</span></div>
      <div class="brew-row">${countSlot(bnIcon(`bn:wool:${bnr.base}`), 6)}<span class="op">+</span>${plainSlot("bn:stick")}${iconImg("ui:arrow")}${bnSlot(bannerUpTo(0))}</div>
      <div class="what"><div><span class="lbl">Craft:</span> 6 ${esc(titled(bnr.base))} Wool in two rows with a stick under the middle</div></div>
    </li>`, ...bnr.layers.map((l, i) => {
    const item = bannerPattern(l[0]).item;
    return `
    <li class="step">
      <div class="step-top"><span class="step-no">Step ${i + 2}</span><span class="cost">Loom</span></div>
      <div class="brew-row">${bnSlot(bannerUpTo(i))}<span class="op">+</span>${plainSlot(bnIcon(`bn:dye:${l[1]}`))}${item ? `<span class="op">+</span>${plainSlot(bnIcon(`bn:item:${item}`))}` : ""}${iconImg("ui:arrow")}${bnSlot(bannerUpTo(i + 1))}</div>
      <div class="what">
        <div><span class="lbl">Pattern:</span> ${esc(patternName(l[0]))} <span class="sub">(${esc(lowerFirst(bannerPattern(l[0]).say))})</span></div>
        <div><span class="lbl">Dye:</span> ${esc(titled(l[1]))} Dye</div>
        ${item ? `<div><span class="lbl">Banner pattern:</span> ${esc(patternItemName(item))} <span class="sub">(kept)</span></div>` : ""}
      </div>
    </li>`;
  })].join("");
  return `${bannerHead("loom", plural(bnr.layers.length + 1, "step"))}
    <div class="need">
      ${need(bnIcon(`bn:wool:${bnr.base}`), `${titled(bnr.base)} Wool`, 6, "× 6, for the banner")}
      ${need("bn:stick", "Stick", 1, "× 1")}
      ${bannerDyes().map(([c, n]) => need(bnIcon(`bn:dye:${c}`), `${titled(c)} Dye`, n, `× ${n}, one a layer`)).join("")}
      ${items.map(k => need(bnIcon(`bn:item:${k}`), patternItemName(k), 1, "Not used up")).join("")}
    </div>
    <ol class="steps bn-steps">${steps}</ol>
    <div class="final">${bannerTooltip()}</div>
    <details class="rules tag-rules"${bannerRulesOpen ? " open" : ""}>
      <summary>How the loom works</summary>
      <ul>${[BANNER_FACTS.banner, BANNER_FACTS.loom, bnForEdition(BANNER_FACTS.how), bnForEdition(BANNER_FACTS.limit), BANNER_FACTS.wash].map(t => `<li>${esc(t)}</li>`).join("")}</ul>
    </details>`;
}

// Banner patterns: the ten items, how each is made or found; the banner's own first.
function bannerItems() {
  const used = bannerItemsUsed(), keys = [...used, ...Object.keys(BANNER_ITEMS).filter(k => !used.includes(k))];
  const pattern = k => BANNER_PATTERNS.find(p => p.item === k);
  const row = k => {
    const it = BANNER_ITEMS[k], p = pattern(k), how = it.made ? `Craft from Paper and ${it.made[0]}.${it.note ? ` ${it.note}` : ""}` : it.from.map(([, , what]) => what).join(" ");
    const chance = it.from ? it.from.map(f => f[3]).filter(Boolean).join(", ") : "";
    return `<li class="item-row${used.includes(k) ? " bn-used" : ""}">${plainSlot(bnIcon(`bn:item:${k}`), "sm")}
      <span class="item-name">${esc(patternItemName(k))}<span class="sub">Adds the ${esc(patternName(p.k))} (${esc(lowerFirst(p.say))}). ${esc(how)}</span></span>
      ${it.made ? `<span class="bn-recipe">${plainSlot("bn:paper", "sm")}<span class="op">+</span>${(it.made[1] === "bn:gapple" ? glintSlot : plainSlot)(bnIcon(it.made[1]), "sm")}</span>` : chance ? `<span class="item-chance">${chance}</span>` : `<span class="bn-recipe">${plainSlot("ui:emerald", "sm")}</span>`}</li>`;
  };
  return `${bannerHead("items", used.length ? `${used.length} in this banner` : "None in this banner")}
    <p class="mob-lead">Ten patterns need a banner pattern in the loom as well as a dye. It isn’t used up, and doesn’t stack.</p>
    <ul class="item-list wide">${keys.map(row).join("")}</ul>
    <p class="tag-note potion-note">Chances are for each chest or vault, the same in both editions. ${state.edition === "java" ? "Field Masoned and Bordure Indented have needed one since 1.21.2." : ""}</p>`;
}

// Good to know: what else a banner does.
function bannerUses() {
  return `${bannerHead("uses")}
    <dl class="fact-list">
      ${bnFact("Copies", bnForEdition(BANNER_FACTS.copy))}
      ${bnFact("Shields", BANNER_FACTS.shield)}
      ${bnFact("Washing", BANNER_FACTS.wash)}
      ${bnFact("Maps", bnForEdition(BANNER_FACTS.map))}
      ${bnFact("Placing", bnForEdition(BANNER_FACTS.place))}
      ${bnFact("Buying", BANNER_FACTS.buy)}
      ${bnFact("Ominous banner", bnForEdition(BANNER_FACTS.ominous))}
    </dl>
    ${bnr.ominous ? "" : `<div class="try-tags bn-acts"><button type="button" class="name-chip" data-act="ominous">${bannerImg({ base: "white", layers: OMINOUS_LAYERS, ominous: true }, "bn-pic xs")}Show the ominous banner</button></div>`}`;
}

function renderBannerResult() {
  const on = BANNER_SECTIONS.some(([k]) => k === bnr.section) ? bnr.section : "about";
  const body = { about: bannerAbout, loom: bannerLoom, items: bannerItems, uses: bannerUses }[on]();
  $("banner-result").innerHTML = `
    <div class="res-top">
      <div class="res-title">${bnSlot(bnr)}
        <div><h2>${esc(bannerName())}</h2><div class="res-sub">${ownOminous() ? "Carried by raid captains" : bnr.layers.length ? esc(bnr.layers.map(layerName).join(" · ")) : "No patterns yet"}</div></div>
      </div>
    </div>
    <div class="mob-tabs" role="tablist" aria-label="Banner">
      ${BANNER_SECTIONS.map(([k, title]) => `<button type="button" class="mob-tab" role="tab" id="banner-tab-${k}" data-section="${k}"
        aria-selected="${k === on}" aria-controls="banner-section" tabindex="${k === on ? 0 : -1}">${iconImg(bannerSectionIcon(k))}${title}</button>`).join("")}
    </div>
    <section class="mob-section" id="banner-section" role="tabpanel" aria-labelledby="banner-tab-${on}">${body}</section>`;
}

// Search: patterns by either edition's name or by what they look like; picking one adds it.
function renderBannerSearch() {
  const q = bnr.query.trim().toLowerCase(), box = $("banner-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type a pattern’s name in either edition, or what it looks like (“stripe”, “corner”, “border”), then pick it to add it in the dye picked.</p>`;
    return;
  }
  const hits = BANNER_PATTERNS.filter(p => [p.n, p.be, p.say, p.item && patternItemName(p.item)].some(s => s && s.toLowerCase().includes(q)));
  box.innerHTML = hits.length
    ? hits.map(p => `
      <button type="button" class="search-hit" data-add="${p.k}"${bannerFull() ? " disabled" : ""}>
        <span class="slot sm">${bannerImg({ base: bnr.base, layers: [[p.k, bnr.ink]] }, "bn-pic sm")}</span>
        <span><span class="who">${esc(patternName(p.k))}</span><span class="deal">${esc(p.say)}${p.be && p.be !== patternName(p.k) ? ` · ${bnEdition() === "java" ? "Bedrock" : "Java"}: ${esc(bnEdition() === "java" ? p.be : p.n)}` : ""}${p.item ? ` · Needs the ${esc(patternItemName(p.item))}` : ""}</span></span>
      </button>`).join("")
    : `<p class="choice-hint">No pattern is called anything like “${esc(bnr.query.trim())}”.</p>`;
}

function renderBanner() {
  renderBannerLayers();
  renderBannerPicker();
  renderBannerResult();
  renderBannerSearch();
  showBanner();
  saveBanner();
}

/* What the buttons do */
function addLayer(k) {
  if (bannerFull() || !bannerPattern(k)) return;
  bnr.layers.push([k, bnr.ink]);
  renderBanner();
}
$("banner-picker").addEventListener("click", e => {
  const ink = e.target.closest("button[data-ink]"), add = e.target.closest("button[data-add]");
  if (ink) {
    bnr.ink = ink.dataset.ink;
    renderBanner();
    refocus(`#banner-picker button[data-ink="${bnr.ink}"]`);
  }
  if (add) {
    addLayer(add.dataset.add);
    refocus(bannerFull() ? "#banner-picker button[data-ink]" : `#bn-${add.dataset.add}`);
  }
});
$("banner-results").addEventListener("click", e => {
  const add = e.target.closest("button[data-add]");
  if (!add) return;
  addLayer(add.dataset.add);
  refocus(`#banner-results button[data-add="${add.dataset.add}"]`);
});
$("banner-base").addEventListener("click", e => {
  const b = e.target.closest("button[data-base]");
  if (!b) return;
  bnr.base = b.dataset.base;
  if (bnr.ominous) { bnr.ominous = false; bnr.layers = []; }
  renderBanner();
  refocus(`#banner-base button[data-base="${bnr.base}"]`);
});
function bannerAct(act) {
  if (act === "wash") bnr.layers.pop();
  if (act === "clear") { bnr.layers = []; bnr.ominous = false; }
  if (act === "ominous") { bnr.base = "white"; bnr.layers = OMINOUS_LAYERS.map(l => [...l]); bnr.ominous = true; }
  renderBanner();
}
$("banner-layers").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b || bnr.ominous && !b.dataset.act) return;
  const i = Number(b.dataset.up ?? b.dataset.down ?? b.dataset.drop), L_ = bnr.layers;
  if (b.dataset.act) return bannerAct(b.dataset.act), refocus(`#banner-layers button[data-act]`);
  if (b.dataset.up !== undefined && i > 0) [L_[i - 1], L_[i]] = [L_[i], L_[i - 1]];
  if (b.dataset.down !== undefined && i < L_.length - 1) [L_[i + 1], L_[i]] = [L_[i], L_[i + 1]];
  if (b.dataset.drop !== undefined) L_.splice(i, 1);
  renderBanner();
  const to = b.dataset.up !== undefined ? i - 1 : b.dataset.down !== undefined ? i + 1 : Math.min(i, L_.length - 1);
  refocus(to >= 0 && L_.length ? `#banner-layers button[data-drop="${to}"]` : "#banner-base button[aria-pressed=true]");
});
const pickBannerSection = k => {
  bnr.section = k;
  renderBannerResult();
  saveBanner();
  refocus(`#banner-tab-${k}`);
};
$("banner-result").addEventListener("click", e => {
  const tab = e.target.closest("button[data-section]"), act = e.target.closest("button[data-act]");
  if (tab) pickBannerSection(tab.dataset.section);
  if (act) bannerAct(act.dataset.act);
  if (e.target.closest("#banner-copy")) {
    const done = () => { const b = $("banner-copy"); if (b) b.textContent = "Copied"; };
    if (navigator.clipboard) navigator.clipboard.writeText(bannerCommand()).then(done, () => {});
  }
});
$("banner-result").addEventListener("keydown", e => {
  if (!e.target.closest("[role=tab]")) return;
  const i = BANNER_SECTIONS.findIndex(([k]) => k === bnr.section), n = BANNER_SECTIONS.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickBannerSection(BANNER_SECTIONS[to % n][0]);
});
$("banner-result").addEventListener("toggle", e => { if (e.target.matches(".tag-rules")) bannerRulesOpen = e.target.open; }, true);
$("banner-search").addEventListener("input", e => { bnr.query = e.target.value; renderBannerSearch(); saveBanner(); });
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderBanner(); });

$("banner-search").value = bnr.query;
bannerArtReady.then(renderBanner);
