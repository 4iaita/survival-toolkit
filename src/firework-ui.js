/* ---------- Fireworks ----------
 * A firework designer: the rocket's stars, each in up to eight dyes with a shape, a fade, a trail and a twinkle, and the rocket's flight
 * duration. The rocket and the picked star lie on the armor stands' stage as items, as the Potions tab's bottles do, and the sections under
 * it say what the game calls them, every craft they take and what else rockets do. Laid out as the Banners tab is.
 */
// The rocket: its stars (the first is the first in the grid), which one the designer beside the stage edits, its flight duration (1 to 3
// gunpowder), which section shows and what the search has in it.
// A new star has no color yet: it's made (shown on the stage, set off with the rocket) once it has one, as the game needs a dye for it.
const fwNewStar = () => ({ colors: [], fades: [], shape: "small_ball", trail: false, twinkle: false });
const fwMade = s => s.colors.length > 0;
const fw = { stars: [fwNewStar()], pick: 0, flight: 1, section: "about", query: "" };
const FIREWORK_KEY = "fireworks-v1";
try { Object.assign(fw, JSON.parse(localStorage.getItem(FIREWORK_KEY) || "{}")); } catch (_) {}
// Only as many dyes as the grid has room for beside the gunpowder and the rest.
const fwExtras = s => (s.shape !== "small_ball") + s.trail + s.twinkle;
const fwMaxDyes = s => FW_SLOTS - 1 - fwExtras(s);
fw.flight = [1, 2, 3].includes(fw.flight) ? fw.flight : 1;
fw.stars = (Array.isArray(fw.stars) ? fw.stars : []).filter(s => s && typeof s === "object").map(s => {
  const star = { shape: fwShape(s.shape) ? s.shape : "small_ball", trail: !!s.trail, twinkle: !!s.twinkle };
  star.colors = (Array.isArray(s.colors) ? s.colors : []).filter(c => FW_COLORS[c]).slice(0, fwMaxDyes(star));
  star.fades = (Array.isArray(s.fades) ? s.fades : []).filter(c => FW_COLORS[c]).slice(0, FW_SLOTS - 1);
  return star;
}).slice(0, fwMaxStars(fw.flight));
fw.pick = Math.max(0, Math.min(fw.stars.length - 1, Number(fw.pick) || 0));
const saveFirework = () => { try { localStorage.setItem(FIREWORK_KEY, JSON.stringify(fw)); } catch (_) {} };
const fwStar = () => fw.stars[fw.pick] || null;

// What the tab shows as icons.
for (const [k, spec] of Object.entries({
  "fw:rocket": L("firework_rocket"), "fw:gunpowder": L("gunpowder"), "fw:paper": L("paper"), "fw:fire_charge": L("fire_charge"),
  "fw:gold_nugget": L("gold_nugget"), "fw:head": C("creeper_head_front", "creeper_head_top", "creeper_head_side"), "fw:feather": L("feather"),
  "fw:diamond": L("diamond"), "fw:glowstone_dust": L("glowstone_dust"), "fw:crossbow": L("crossbow_firework"), "fw:elytra": L("elytra"),
  "fw:dispenser": C("dispenser_front_horizontal", "furnace_top", "furnace_side"), "fw:crafting": C("crafting_table_front", "crafting_table_top", "crafting_table_side"),
  ...Object.fromEntries(FW_DYES.map(c => [`fw:dye:${c}`, L(`${dyeId(c)}_dye`)])),
})) ICONS[k] = artReady(spec) ? spec : ICONS["ui:book"];
// A star's icon: the pack's gray ball, its middle colored as Java's item model colors it (the average of its colors).
function fwTint(s) {
  if (!s || !s.colors.length) return FW_NO_COLOR;
  const sum = [0, 0, 0];
  for (const c of s.colors) hex(FW_COLORS[c]).forEach((v, i) => { sum[i] += v; });
  return `#${sum.map(v => Math.floor(v / s.colors.length).toString(16).padStart(2, "0")).join("")}`;
}
function fwStarIcon(s) {
  const k = `fw:star:${fwTint(s)}`;
  if (!ICONS[k]) ICONS[k] = artReady(L("firework_star", "firework_star_overlay")) ? L("firework_star", ["firework_star_overlay", fwTint(s), "multiply"]) : ICONS["ui:book"];
  return k;
}

/* Names, as the game's tooltips have them */
const fwEd = () => (state.edition === "bedrock" ? "bedrock" : "java");
const fwWords = () => FW_WORDS[fwEd()];
const fwShapeName = k => (fwEd() === "bedrock" ? fwShape(k).be : fwShape(k).java);
const fwColorNames = cs => cs.map(titled).join(", ");
// A star in a few words: "Small Ball: Red, Blue".
const fwStarSay = s => `${fwShapeName(s.shape)}${s.colors.length ? `: ${fwColorNames(s.colors)}` : ""}`;
// What a star adds after its shape, line by line, as the game lists it.
const fwStarLines = s => [s.colors.length ? fwColorNames(s.colors) : "", s.fades.length ? `${fwWords().fade} ${fwColorNames(s.fades)}` : "",
  s.trail ? fwWords().trail : "", s.twinkle ? fwWords().twinkle : ""].filter(Boolean);
const fwSame = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// The stars, each with how many of it the rocket has, in the order they first come (Java's tooltip shows the same ones once since 1.21.5).
function fwGroups() {
  const groups = [];
  for (const s of fw.stars) {
    const g = groups.find(x => fwSame(x.star, s));
    if (g) g.n++;
    else groups.push({ star: s, n: 1 });
  }
  return groups;
}

/* The stage: the rocket and its stars as items lying in the world, each bobbing and turning on its own, as itemScene draws one. The rocket
 * stands apart on the left (FW_ROCKET_GAP), the stars on the right: in a line, or two once there are more than FW_ONE_ROW (the first half
 * further back and higher, so they show over the rest, with the rocket half way up beside them).
 * A star with no color yet shows as it is, plain gray.
 * Launched, the rocket goes off instead (firework-show.js), then they come back. With less motion it's shown still, once it has burst. */
// FW_APART: from one item's middle to the next's, in texels.
// FW_BACK and FW_LIFT: how far back and up the back row is, in texels.
const FW_APART = 22, FW_ROCKET_GAP = 32, FW_ONE_ROW = 2, FW_BACK = 24, FW_LIFT = 12, FW_GROW = 2, FW_STILL_AT = 12;
function fireworkScene(canvas, { onTurn = () => {} } = {}) {
  const ctx = canvas.getContext("2d");
  let items = [], yaw = ITEM_YAW, frame = 0, dragX = null, last = 0, clock = 0, show = null, started = 0, onEnd = () => {}, fixed = null;
  // The show at a moment: ticks since it was launched.
  const drawShow = (W, H, dpr, ticks) => {
    while (show.tick < Math.floor(ticks) && !show.done) show.step();
    const out = new Uint8ClampedArray(W * H * 4);
    const groundY = H - MOB_FEET_UP * dpr, frame = fireworkFrame(show, W, H, groundY, Math.min(H / dpr * 0.06, W / dpr * 0.07) * dpr, 8 * dpr);
    // Turned to face the first creeper's face, if it has one, as well as the way the reader turned the stage.
    drawFireworkShow(out, W, H, show, { partial: ticks - Math.floor(ticks), yaw: yaw - ITEM_YAW - (show.face || 0), ...frame, groundY, grow: FW_GROW });
    ctx.putImageData(new ImageData(out, W, H), 0, 0);
  };
  const draw = () => {
    frame = 0;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = dragX !== null ? 1 : Math.max(1, Math.min(2, Math.round(window.devicePixelRatio || 1)));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (show) {
      const ticks = fixed !== null ? fixed : calmMotion() ? show.rocket.lifetime + 1 + FW_STILL_AT : (clock - started) * 20;
      drawShow(canvas.width, canvas.height, dpr, ticks);
      if (show.done && !calmMotion() && fixed === null) { show = null; onEnd(); redraw(); }
      return;
    }
    if (!items.length) return;
    const n = items.length - 1, rows = n > FW_ONE_ROW ? 2 : 1, perRow = Math.ceil(n / rows), grid = n ? FW_ROCKET_GAP + (perRow - 1) * FW_APART : 0;
    const t = calmMotion() ? 0 : clock, span = grid + 18, raised = rows > 1 ? FW_LIFT + FW_BACK * Math.sin(STAGE_PITCH) : 0;
    const scale = Math.min(ITEM_MAX_SCALE, (h - MOB_FEET_UP - 24) / (16 + ITEM_UP + 2 * ITEM_BOB + raised), (w - 40) / span);
    const view = { yaw: 0, pitch: STAGE_PITCH, scale: scale * dpr, center: [0, GROUND, 0], origin: [canvas.width / 2, canvas.height - MOB_FEET_UP * dpr] };
    const boxes = [], shadows = [];
    items.forEach((px, i) => {
      // The rocket (the first), then the stars, each line in the middle of the stars' side.
      const k = i - 1, row = i ? Math.floor(k / perRow) : 0, inRow = row < rows - 1 ? perRow : n - perRow * (rows - 1), back = i > 0 && rows > 1 && row === 0;
      const x = -grid / 2 + (i ? FW_ROCKET_GAP + (k % perRow + (perRow - inRow) / 2) * FW_APART : 0), z = back ? FW_BACK : 0, phase = i * 1.7;
      const bob = (1 + Math.sin(t * 1.8 + phase)) * ITEM_BOB, up = ITEM_UP + (back ? FW_LIFT : !i && rows > 1 ? FW_LIFT / 2 : 0) + bob;
      const turned = yaw + (dragX === null ? Math.sin(t * 0.9 + phase) * ITEM_SWAY : 0);
      const bone = { pivot: [x, GROUND, z], angles: [0, turned, 0] };
      for (const b of itemBoxes(px, up)) boxes.push({ ...b, lo: [b.lo[0] + x, b.lo[1], b.lo[2] + z], hi: [b.hi[0] + x, b.hi[1], b.hi[2] + z], bone });
      // The back row's shadows would fall behind the stage's strip of ground, in the sky: it has none.
      if (!back) shadows.push([x, z, 5.5 - bob * 0.4]);
    });
    const out = renderScene(boxes, { ...view, width: canvas.width, height: canvas.height, shadows });
    ctx.putImageData(new ImageData(out, canvas.width, canvas.height), 0, 0);
  };
  const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const step = now => {
    requestAnimationFrame(step);
    if (!canvas.clientWidth || document.hidden || (!items.length && !show) || calmMotion() || now - last < 1000 / ITEM_FPS - 2) return;
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
  // names: the icons to show, left to right (each a 16×16 picture).
  return {
    show(names) { items = names.map(n => artPixels(ICONS[n])).filter(px => px.length === 256); redraw(); },
    // Sets the rocket off: its stars and flight duration; ended hears when it's over (or, with less motion, never: it's shown still).
    launch(stars, flight, ended = () => {}) { show = fireworkShow(stars, flight, Math.floor(Math.random() * 1e9)); started = clock; onEnd = ended; fixed = null; redraw(); },
    stop() { show = null; fixed = null; redraw(); },
    get going() { return !!show; },
    // For checking: the show of these stars at so many ticks, drawn now and kept still.
    frameAt(stars, flight, seed, ticks) { show = fireworkShow(stars, flight, seed); fixed = ticks; redraw(); },
  };
}
const fireworkStage = $("firework-stage");
const fireworkView = fireworkScene($("firework-art"), { onTurn: () => fireworkStage.classList.add("turned") });
fireworkStage.style.setProperty("--ground", `url('${groundArt("plains")}')`);
function showFirework() {
  if (fireworkView.going) fireworkView.stop();
  fireworkView.show(["fw:rocket", ...fw.stars.map(fwStarIcon)]);
  const say = (s, i) => `star ${i + 1}: ${fwMade(s) ? fwStarSay(s) : "no color yet"}`;
  $("firework-art").setAttribute("aria-label", `${fwWords().rocket}, flight duration ${fw.flight}${fw.stars.length ? `, and ${fw.stars.map(say).join("; ")}` : ", with no stars"}. Drag or use the arrow keys to turn ${fw.stars.length ? "them" : "it"}.`);
}

/* Under the stage: the flight duration, and the rocket's stars, each of which can be picked, copied or taken off */
function renderFireworkRocket() {
  const most = fwMaxStars(fw.flight), n = fw.stars.length;
  $("firework-flight-label").textContent = `Flight duration: ${fw.flight}`;
  $("firework-flight").innerHTML = [1, 2, 3].map(f => `<button type="button" class="name-chip" data-flight="${f}" aria-pressed="${f === fw.flight}"${n > fwMaxStars(f) ? ` disabled title="Only ${fwMaxStars(f)} stars fit with ${f} gunpowder"` : ""}>${iconImg("fw:gunpowder")}${f} gunpowder</button>`).join("");
  $("firework-stars-label").textContent = `Stars: ${n} of ${most}`;
  $("firework-stars").innerHTML = (n ? `<ol class="fw-stars">${fw.stars.map((s, i) => `
    <li class="fw-star${i === fw.pick ? " on" : ""}">
      <button type="button" class="fw-star-pick" data-pick="${i}" aria-pressed="${i === fw.pick}" aria-label="Star ${i + 1}: ${esc(fwStarSay(s))}${i === fw.pick ? " (picked)" : ""}">${iconImg(fwStarIcon(s))}
        <span class="fw-star-name">${i + 1}. ${esc(fwShapeName(s.shape))}<span class="sub">${fwMade(s) ? esc(fwStarLines(s).join(" · ")) : "No color yet: pick a dye to make it"}</span></span></button>
      <span class="fw-star-acts">${bnBtn("copy", i, `Add another star like star ${i + 1}`, "⧉", n >= most)}${bnBtn("drop", i, `Take star ${i + 1} off`, "✕")}</span>
    </li>`).join("")}</ol>` : `<p class="choice-hint">No stars: the rocket only flies. Add a star to make it explode.</p>`) +
    `<div class="try-tags fw-acts">
      <button type="button" class="name-chip" data-act="launch" aria-pressed="${fireworkView.going}">${iconImg("fw:rocket")}${fireworkView.going ? "Stop" : "Launch it"}</button>
      <button type="button" class="name-chip" data-act="add"${n >= most ? " disabled" : ""}>${iconImg(fwStarIcon(fwNewStar()))}Add a star</button>
      ${n ? `<button type="button" class="name-chip" data-act="clear">Take every star off</button>` : ""}
    </div>
    ${n >= most ? `<p class="tag-note fw-limit">${n} stars ${fw.flight > 1 ? `and ${fw.flight} gunpowder ` : ""}fill the crafting grid with the paper and gunpowder.</p>` : ""}`;
}

/* Beside the stage: the picked star's colors, fade, shape, trail and twinkle */
function renderFireworkPicker() {
  const s = fwStar();
  $("firework-name").textContent = s ? `Star ${fw.pick + 1} of ${fw.stars.length}` : fwWords().rocket;
  if (!s) {
    $("firework-picker").innerHTML = `<p class="mob-lead">The rocket has no stars. Add one to design it: its colors, shape, fade, trail and twinkle.</p>
      <div class="try-tags"><button type="button" class="name-chip" data-act="add">${iconImg(fwStarIcon(fwNewStar()))}Add a star</button></div>`;
    return;
  }
  const most = fwMaxDyes(s), full = s.colors.length >= most;
  const dyes = (list, attr, label, max, hint) => `
    <div>
      <div class="cat-label" id="fw-${attr}-label">${label}: ${list.length ? `${list.length} of ${max}` : "none"}</div>
      <div class="try-tags" role="group" aria-labelledby="fw-${attr}-label">${FW_DYES.map(c => dyeSwatch(attr, c, list.includes(c))).join("")}</div>
      <div class="fw-picked">${list.length ? list.map((c, i) => `<button type="button" class="name-chip fw-dye" data-un${attr}="${i}" aria-label="Take ${titled(c)} off the ${attr === "color" ? "colors" : "fade"}"><i style="background:${FW_COLORS[c]}"></i>${titled(c)} ✕</button>`).join("") : `<span class="choice-hint">${hint}</span>`}</div>
    </div>`;
  const shape = x => `<button type="button" class="name-chip" data-shape="${x.k}" aria-pressed="${x.k === s.shape}"${x.k !== s.shape && x.k !== "small_ball" && s.shape === "small_ball" && full ? " disabled" : ""}>${iconImg(x.item ? FW_ITEMS[x.item].icon : fwStarIcon(s))}${esc(fwShapeName(x.k))}</button>`;
  const extra = (k, item, name) => `<button type="button" class="name-chip" data-extra="${k}" aria-pressed="${s[k]}"${!s[k] && full ? " disabled" : ""}>${iconImg(FW_ITEMS[item].icon)}${name}</button>`;
  $("firework-picker").innerHTML = `
    ${dyes(s.colors, "color", "Colors", most, "Pick a dye: a star needs at least one.")}
    ${full ? `<p class="tag-note fw-limit">${most < 8 ? `With its ${plural(fwExtras(s), "other ingredient")}, ${most} dyes fill the grid.` : "8 dyes and the gunpowder fill the grid."}</p>` : ""}
    ${dyes(s.fades, "fade", "Fade to", FW_SLOTS - 1, "None: pick dyes to make its sparks fade to them.")}
    <div>
      <div class="cat-label" id="fw-shape-label">Shape: ${esc(fwShapeName(s.shape))}</div>
      <div class="try-tags" role="group" aria-labelledby="fw-shape-label">${FW_SHAPES.map(shape).join("")}</div>
    </div>
    <div>
      <div class="cat-label" id="fw-extra-label">Effects</div>
      <div class="try-tags" role="group" aria-labelledby="fw-extra-label">${extra("trail", "diamond", esc(fwWords().trail))}${extra("twinkle", "glowstone_dust", esc(fwWords().twinkle))}</div>
    </div>`;
}

/* The sections */
const FIREWORK_SECTIONS = [["about", "Overview"], ["craft", "Crafting plan"], ["uses", "Good to know"]];
const fireworkSectionIcon = s => ({ about: "fw:rocket", craft: "fw:crafting", uses: "fw:elytra" }[s]);
const fireworkHead = (s, note = "") => sectionHead("firework-section-title", fireworkSectionIcon(s), FIREWORK_SECTIONS.find(([k]) => k === s)[1], note);
const fwFact = (label, text) => (text ? `<div class="fact-row"><dt>${label}</dt><dd>${esc(text)}</dd></div>` : "");
const fwForEdition = v => byEdition(v, state.edition);
const fwSeconds = ticks => `${+(ticks / 20).toFixed(2)}`;

// The games' tooltips. A star: its shape, then what it adds. A rocket: its flight duration, then each star, what it adds set in under it
// (Java lists stars that are the same once, "Small Ball x 2", since 1.21.5).
const fwTip = (cls, text) => `<li class="fw-line ${cls}">${esc(text)}</li>`;
function fwStarTooltip(s) {
  return `<div class="mc-tooltip"><span class="slot">${iconImg(fwStarIcon(s))}</span><div>
      <div class="tname plain">${esc(fwWords().star)}</div>
      <ul>${fwTip("", fwShapeName(s.shape))}${fwStarLines(s).map(l => fwTip("", l)).join("")}</ul>
    </div></div>`;
}
function fwRocketTooltip() {
  const groups = fwEd() === "java" ? fwGroups() : fw.stars.map(star => ({ star, n: 1 }));
  return `<div class="mc-tooltip"><span class="slot">${iconImg("fw:rocket")}</span><div>
      <div class="tname plain">${esc(fwWords().rocket)}</div>
      <ul>${fwTip("", `${fwWords().flight} ${fw.flight}`)}${groups.map(({ star, n }) => fwTip("", n > 1 ? `${fwShapeName(star.shape)} x ${n}` : fwShapeName(star.shape)) +
        fwStarLines(star).map(l => fwTip("fw-sub", l)).join("")).join("")}</ul>
      <div class="foot">${fw.stars.length ? plural(fw.stars.length, "star") : "No stars: it doesn’t explode"}</div>
    </div></div>`;
}

function fireworkAbout() {
  const n = fw.stars.length, f = FW_FLIGHT[fw.flight], [lo, hi] = fwCrossbow(n);
  const stat = (label, value, sub) => `<div class="mob-stat text"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="sub">${sub}</span>` : ""}</div>`;
  return `${fireworkHead("about", fwEd() === "java" ? "Java Edition" : "Bedrock Edition")}
    <div class="mob-stats">
      ${stat("Flies", `${f.high[0]}–${f.high[1]} blocks`, `Up, launched by hand: ${fwSeconds(f.ticks[0])} to ${fwSeconds(f.ticks[1])} seconds`)}
      ${stat("Stars", `${n} of ${fwMaxStars(fw.flight)}`, n ? esc(fwGroups().map(g => `${g.n > 1 ? `${g.n} × ` : ""}${fwShapeName(g.star.shape)}`).join(", ")) : "It doesn’t explode")}
      ${stat("Damage", n ? `Up to ${fwBlast(n)}` : "None", n ? `Health, within 5 blocks; ${lo} to ${hi} from a crossbow` : "With no stars it can’t hurt")}
      ${stat("Makes", `${FW_PER_CRAFT} rockets`, `In ${plural(fwSteps(), "step")}, with the stars`)}
    </div>
    <div class="cat-label potion-label">How the game shows it</div>
    ${fwRocketTooltip()}
    ${fw.stars.map((x, i) => `<div class="cat-label potion-label">Star ${i + 1}</div>${fwStarTooltip(x)}`).join("")}
    <dl class="fact-list">
      ${fwFact("Flight duration", FW_FACTS.height)}
      ${fwFact("Stacking", FW_FACTS.stack)}
    </dl>`;
}

// Crafting plan: what it takes, then each star (and its fade), then the rocket, each in its grid.
let fireworkRulesOpen = false;
const fwGrid = cells => `<div class="craft-grid">${[...cells, ...Array(FW_SLOTS).fill(null)].slice(0, FW_SLOTS).map(c => (c ? plainSlot(c, "sm") : '<span class="slot sm"></span>')).join("")}</div>`;
const fwStarCells = s => ["fw:gunpowder", ...s.colors.map(c => `fw:dye:${c}`), ...(fwShape(s.shape).item ? [FW_ITEMS[fwShape(s.shape).item].icon] : []),
  ...(s.trail ? ["fw:diamond"] : []), ...(s.twinkle ? ["fw:glowstone_dust"] : [])];
// Everything it takes: [icon, name, how many, what for].
function fwNeeds() {
  const n = fw.stars.length, need = [["fw:paper", "Paper", 1, "For the rocket"], ["fw:gunpowder", "Gunpowder", fw.flight + n, n ? `${fw.flight} for the rocket, 1 for each star` : "For the rocket"]];
  for (const c of FW_DYES) {
    const k = fw.stars.reduce((t, s) => t + s.colors.filter(x => x === c).length + s.fades.filter(x => x === c).length, 0);
    if (k) need.push([`fw:dye:${c}`, `${titled(c)} Dye`, k, "For the stars’ colors and fades"]);
  }
  for (const item of ["fire_charge", "gold_nugget", "head", "feather"]) {
    const k = fw.stars.filter(s => fwShape(s.shape).item === item).length;
    if (k) need.push([FW_ITEMS[item].icon, FW_ITEMS[item].n, k, item === "head" ? "Or any other head or skull, used up" : `For the ${fwShapeName(FW_SHAPES.find(x => x.item === item).k)}`]);
  }
  for (const [k, item] of [["trail", "diamond"], ["twinkle", "glowstone_dust"]]) {
    const c = fw.stars.filter(s => s[k]).length;
    if (c) need.push([FW_ITEMS[item].icon, FW_ITEMS[item].n, c, `For the ${fwWords()[k].toLowerCase()}`]);
  }
  return need;
}
// How many steps the plan has: each kind of star, its fade, then the rocket.
const fwSteps = () => fwGroups().reduce((n, g) => n + 1 + (g.star.fades.length ? 1 : 0), 1);
function fireworkCraft() {
  const groups = fwGroups(), steps = [];
  const step = (where, grid, out, what) => `
    <li class="step">
      <div class="step-top"><span class="step-no">Step ${steps.length + 1}</span><span class="cost">${where}</span></div>
      <div class="fw-craft">${grid}${iconImg("ui:arrow")}${out}</div>
      <div class="what">${what}</div>
    </li>`;
  const which = g => (groups.length > 1 || fw.stars.length > 1 ? ` ${fw.stars.indexOf(g.star) + 1}${g.n > 1 ? ` (and ${plural(g.n - 1, "more like it", "more like it")})` : ""}` : "");
  for (const g of groups) {
    const s = g.star, item = fwShape(s.shape).item, plain = { ...s, fades: [] };
    steps.push(step("Crafting table", fwGrid(fwStarCells(s)), countSlot(fwStarIcon(plain), g.n), `
      <div><span class="lbl">Star${which(g)}:</span> ${esc(fwStarSay(s))}</div>
      <div><span class="lbl">Craft:</span> 1 Gunpowder, ${s.colors.length ? esc(s.colors.map(c => `${titled(c)} Dye`).join(", ")) : "<b>a dye at least</b>"}${item ? `, ${esc(FW_ITEMS[item].n)}${item === "head" ? " <span class=\"sub\">(or any head)</span>" : ""}` : ""}${s.trail ? ", Diamond" : ""}${s.twinkle ? ", Glowstone Dust" : ""}</div>
      ${g.n > 1 ? `<div><span class="lbl">Times:</span> ${g.n}, one star each</div>` : ""}`));
    if (s.fades.length) {
      steps.push(step("Crafting table", fwGrid([fwStarIcon(plain), ...s.fades.map(c => `fw:dye:${c}`)]), countSlot(fwStarIcon(s), g.n), `
        <div><span class="lbl">Fade:</span> the star and ${esc(s.fades.map(c => `${titled(c)} Dye`).join(", "))}</div>
        ${g.n > 1 ? `<div><span class="lbl">Times:</span> ${g.n}</div>` : ""}`));
    }
  }
  steps.push(step("Crafting table", fwGrid(["fw:paper", ...Array(fw.flight).fill("fw:gunpowder"), ...fw.stars.map(fwStarIcon)]), countSlot("fw:rocket", FW_PER_CRAFT), `
    <div><span class="lbl">Rocket:</span> 1 Paper, ${plural(fw.flight, "Gunpowder", "Gunpowder")}${fw.stars.length ? ` and ${fw.stars.length === 1 ? "the star" : `the ${fw.stars.length} stars`}` : ""}</div>
    <div><span class="lbl">Makes:</span> ${FW_PER_CRAFT} rockets, each with ${fw.stars.length ? "every star" : "no stars"}</div>`));
  const need = (icon, name, n, sub) => `<div class="need-item">${countSlot(icon, n)}<span>${esc(name)}<span class="sub">× ${n}, ${esc(sub.toLowerCase())}</span></span></div>`;
  return `${fireworkHead("craft", plural(steps.length, "step"))}
    <div class="need">${fwNeeds().map(n => need(...n)).join("")}</div>
    ${fw.stars.some(s => !s.colors.length) ? `<p class="tag-note potion-note">A star with no dye can’t be crafted: give every star a color.</p>` : ""}
    <ol class="steps bn-steps fw-steps">${steps.join("")}</ol>
    <div class="final">${fwRocketTooltip()}</div>
    <details class="rules tag-rules"${fireworkRulesOpen ? " open" : ""}>
      <summary>How the crafting works</summary>
      <ul>${[fwForEdition(FW_FACTS.star), FW_FACTS.heads, FW_FACTS.fade, FW_FACTS.rocket, FW_FACTS.stack].map(t => `<li>${esc(t)}</li>`).join("")}</ul>
    </details>`;
}

// Good to know: how far each flight duration goes, what the stars do, and the rest.
function fireworkUses() {
  const n = fw.stars.length;
  const flights = [1, 2, 3].map(k => {
    const f = FW_FLIGHT[k];
    return `<tr${k === fw.flight ? ' class="on"' : ""}><td>${k}</td><td>${f.high[0]}–${f.high[1]}</td><td>${f.dispenser[0]}–${f.dispenser[1]}</td><td>${f.crossbow[0]}–${f.crossbow[1]}</td><td>about ${f.boost} s</td></tr>`;
  }).join("");
  const blasts = [1, 2, 3, 4, 5, 6, 7].map(k => `<tr${k === n ? ' class="on"' : ""}><td>${k}</td><td>${fwBlast(k)}</td><td>${fwCrossbow(k).join("–")}</td></tr>`).join("");
  return `${fireworkHead("uses")}
    <div class="cat-label potion-label">By flight duration (distances in blocks)</div>
    <table class="fw-table">
      <thead><tr><th scope="col">Gunpowder</th><th scope="col">Up</th><th scope="col">Dispenser</th><th scope="col">Crossbow</th><th scope="col">Elytra boost</th></tr></thead>
      <tbody>${flights}</tbody>
    </table>
    <div class="cat-label potion-label">Damage by stars, in health</div>
    <table class="fw-table">
      <thead><tr><th scope="col">Stars</th><th scope="col">Explosion, at most</th><th scope="col">Crossbow hit</th></tr></thead>
      <tbody>${blasts}</tbody>
    </table>
    <dl class="fact-list">
      ${fwFact("Explosion", FW_FACTS.damage)}
      ${fwFact("Elytra", fwForEdition(FW_FACTS.elytra))}
      ${fwFact("Leads", FW_FACTS.leash)}
      ${fwFact("Crossbows", fwForEdition(FW_FACTS.crossbow))}
      ${fwFact("Dispensers", FW_FACTS.dispenser)}
      ${fwFact("Water", FW_FACTS.water)}
      ${fwFact("Raids", FW_FACTS.raid)}
      ${fwFact("Nether portals", FW_FACTS.portal)}
      ${fwFact("Pressure plates", FW_FACTS.plate)}
      ${fwFact("Sounds", FW_FACTS.sounds)}
      ${fwFact("Getting them", fwForEdition(FW_FACTS.obtain))}
    </dl>
    <p class="tag-note potion-note">Heights, distances and damage vary a little each time; these are the wiki’s ranges.</p>`;
}

function renderFireworkResult() {
  const on = FIREWORK_SECTIONS.some(([k]) => k === fw.section) ? fw.section : "about";
  const body = { about: fireworkAbout, craft: fireworkCraft, uses: fireworkUses }[on]();
  $("firework-result").innerHTML = `
    <div class="res-top">
      <div class="res-title"><span class="slot">${iconImg("fw:rocket")}</span>
        <div><h2>${esc(fwWords().rocket)}</h2><div class="res-sub">${esc(`${fwWords().flight} ${fw.flight}`)} · ${fw.stars.length ? esc(fwGroups().map(g => `${g.n > 1 ? `${g.n} × ` : ""}${fwStarSay(g.star)}`).join(" · ")) : "No stars"}</div></div>
      </div>
    </div>
    <div class="mob-tabs" role="tablist" aria-label="Firework">
      ${FIREWORK_SECTIONS.map(([k, title]) => `<button type="button" class="mob-tab" role="tab" id="firework-tab-${k}" data-section="${k}"
        aria-selected="${k === on}" aria-controls="firework-section" tabindex="${k === on ? 0 : -1}">${iconImg(fireworkSectionIcon(k))}${title}</button>`).join("")}
    </div>
    <section class="mob-section" id="firework-section" role="tabpanel" aria-labelledby="firework-tab-${on}">${body}</section>`;
}

// Search: shapes (by either edition's name or what makes them), the trail and twinkle, and colors for the picked star.
function fwHits(q) {
  const has = (...words) => words.some(w => w && w.toLowerCase().includes(q));
  const hits = [];
  for (const x of FW_SHAPES) {
    const item = x.item && FW_ITEMS[x.item];
    if (has(x.java, x.be, x.k.replace("_", " "), item && item.n, x.item === "head" && FW_HEADS.join(" "), x.item === "head" && "skull"))
      hits.push({ act: "shape", v: x.k, icon: item ? item.icon : "fw:gunpowder", name: fwShapeName(x.k), say: `${x.say}${item ? ` Made with ${x.item === "head" ? "a head" : `a ${item.n.toLowerCase()}`}.` : ""}` });
  }
  for (const [k, item, say] of [["trail", "diamond", "Its sparks leave trails. Made with a diamond."], ["twinkle", "glowstone_dust", "Its sparks twinkle and crackle. Made with glowstone dust."]])
    if (has(k, FW_WORDS.java[k], item.replace("_", " "), k === "twinkle" && "flicker")) hits.push({ act: "extra", v: k, icon: FW_ITEMS[item].icon, name: fwWords()[k], say });
  for (const c of FW_DYES) if (has(c, `${c} dye`)) {
    hits.push({ act: "color", v: c, icon: `fw:dye:${c}`, name: `${titled(c)}`, say: "Add it to the star’s colors" });
    hits.push({ act: "fade", v: c, icon: `fw:dye:${c}`, name: `${fwWords().fade} ${titled(c)}`, say: "Add it to the star’s fade" });
  }
  if (has("fade")) for (const c of FW_DYES) if (!hits.some(h => h.act === "fade" && h.v === c)) hits.push({ act: "fade", v: c, icon: `fw:dye:${c}`, name: `${fwWords().fade} ${titled(c)}`, say: "Add it to the star’s fade" });
  return hits;
}
function renderFireworkSearch() {
  const q = fw.query.trim().toLowerCase(), box = $("firework-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type a shape in either edition’s words, what makes it (“feather”, “head”), “trail”, “twinkle” or a color, then pick it to add it to the picked star.</p>`;
    return;
  }
  const hits = fwHits(q);
  box.innerHTML = hits.length
    ? hits.map(h => `
      <button type="button" class="search-hit" data-act="${h.act}" data-v="${h.v}"${fwCanApply(h.act, h.v) ? "" : " disabled"}>
        <span class="slot sm">${iconImg(h.icon)}</span>
        <span><span class="who">${esc(h.name)}</span><span class="deal">${esc(h.say)}</span></span>
      </button>`).join("")
    : `<p class="choice-hint">No shape, effect or color is called anything like “${esc(fw.query.trim())}”.</p>`;
}

function renderFirework() {
  renderFireworkRocket();
  renderFireworkPicker();
  renderFireworkResult();
  renderFireworkSearch();
  showFirework();
  saveFirework();
}

/* What the buttons do. Each change is to the picked star; one is added first if there's none. */
function fwCanApply(act, v) {
  const s = fwStar() || fwNewStar();
  if (!fwStar() && fw.stars.length >= fwMaxStars(fw.flight)) return false;
  if (act === "color") return s.colors.length < fwMaxDyes(s);
  if (act === "fade") return s.fades.length < FW_SLOTS - 1;
  if (act === "extra") return s[v] || s.colors.length < fwMaxDyes(s);
  if (act === "shape") return v === s.shape || v === "small_ball" || s.shape !== "small_ball" || s.colors.length < fwMaxDyes(s);
  return true;
}
function fwApply(act, v) {
  if (!fwCanApply(act, v)) return;
  if (!fwStar()) { fw.stars.push(fwNewStar()); fw.pick = fw.stars.length - 1; }
  const s = fwStar();
  if (act === "color") s.colors.push(v);
  if (act === "fade") s.fades.push(v);
  if (act === "shape") s.shape = v;
  if (act === "extra") s[v] = !s[v];
  renderFirework();
}
function fireworkAct(act) {
  if (act === "launch") {
    if (fireworkView.going) fireworkView.stop();
    else fireworkView.launch(fw.stars.filter(fwMade).map(s => JSON.parse(JSON.stringify(s))), fw.flight, renderFireworkRocket);
    renderFireworkRocket();
    const made = fw.stars.filter(fwMade);
    $("firework-art").setAttribute("aria-label", fireworkView.going ? `The ${fwWords().rocket.toLowerCase()} going off${made.length ? `: ${made.map(fwStarSay).join("; ")}` : ", with no colored stars to burst"}.` : $("firework-art").getAttribute("aria-label"));
    return;
  }
  if (act === "add" && fw.stars.length < fwMaxStars(fw.flight)) {
    fw.stars.push(fwNewStar());
    fw.pick = fw.stars.length - 1;
  }
  if (act === "clear") { fw.stars = []; fw.pick = 0; }
  renderFirework();
}
$("firework-picker").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  const d = b.dataset;
  if (d.act) return fireworkAct(d.act), refocus("#firework-picker button[data-color]");
  const s = fwStar();
  if (!s) return;
  if (d.color) fwApply("color", d.color);
  if (d.fade) fwApply("fade", d.fade);
  if (d.uncolor !== undefined) { s.colors.splice(Number(d.uncolor), 1); renderFirework(); }
  if (d.unfade !== undefined) { s.fades.splice(Number(d.unfade), 1); renderFirework(); }
  if (d.shape) fwApply("shape", d.shape);
  if (d.extra) fwApply("extra", d.extra);
  const sel = d.color ? `[data-color="${d.color}"]` : d.fade ? `[data-fade="${d.fade}"]` : d.shape ? `[data-shape="${d.shape}"]` : d.extra ? `[data-extra="${d.extra}"]`
    : d.uncolor !== undefined ? (s.colors.length ? `[data-uncolor="${Math.min(Number(d.uncolor), s.colors.length - 1)}"]` : "[data-color]")
    : (s.fades.length ? `[data-unfade="${Math.min(Number(d.unfade), s.fades.length - 1)}"]` : "[data-fade]");
  refocus(`#firework-picker button${sel}`);
});
$("firework-flight").addEventListener("click", e => {
  const b = e.target.closest("button[data-flight]");
  if (!b || b.disabled) return;
  fw.flight = Number(b.dataset.flight);
  renderFirework();
  refocus(`#firework-flight button[data-flight="${fw.flight}"]`);
});
$("firework-stars").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  const d = b.dataset;
  if (d.act) return fireworkAct(d.act), refocus(d.act === "launch" ? '#firework-stars button[data-act="launch"]' : fw.stars.length ? `#firework-stars button[data-pick="${fw.pick}"]` : "#firework-stars button[data-act]");
  if (d.pick !== undefined) fw.pick = Number(d.pick);
  if (d.copy !== undefined && fw.stars.length < fwMaxStars(fw.flight)) {
    fw.stars.splice(Number(d.copy) + 1, 0, JSON.parse(JSON.stringify(fw.stars[Number(d.copy)])));
    fw.pick = Number(d.copy) + 1;
  }
  if (d.drop !== undefined) {
    fw.stars.splice(Number(d.drop), 1);
    fw.pick = Math.max(0, Math.min(fw.stars.length - 1, fw.pick > Number(d.drop) ? fw.pick - 1 : fw.pick));
  }
  renderFirework();
  refocus(fw.stars.length ? `#firework-stars button[data-pick="${fw.pick}"]` : "#firework-stars button[data-act]");
});
const pickFireworkSection = k => {
  fw.section = k;
  renderFireworkResult();
  saveFirework();
  refocus(`#firework-tab-${k}`);
};
$("firework-result").addEventListener("click", e => {
  const tab = e.target.closest("button[data-section]");
  if (tab) pickFireworkSection(tab.dataset.section);
});
$("firework-result").addEventListener("keydown", e => {
  if (!e.target.closest("[role=tab]")) return;
  const i = FIREWORK_SECTIONS.findIndex(([k]) => k === fw.section), n = FIREWORK_SECTIONS.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickFireworkSection(FIREWORK_SECTIONS[to % n][0]);
});
$("firework-result").addEventListener("toggle", e => { if (e.target.matches(".tag-rules")) fireworkRulesOpen = e.target.open; }, true);
$("firework-results").addEventListener("click", e => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  fwApply(b.dataset.act, b.dataset.v);
  refocus(`#firework-results button[data-act="${b.dataset.act}"][data-v="${b.dataset.v}"]`);
});
$("firework-search").addEventListener("input", e => { fw.query = e.target.value; renderFireworkSearch(); saveFirework(); });
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderFirework(); });

$("firework-search").value = fw.query;
renderFirework();
