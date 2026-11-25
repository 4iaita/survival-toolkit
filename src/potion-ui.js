/* ---------- Potions ---------- */
// The picked potion and its version (mod: base, long or strong; form: drink, splash, lingering or arrow), how many bottles the
// brewing plan makes, and which of the potion's sections shows (POTION_SECTIONS).
const brew = { potion: "swiftness", mod: "base", form: "drink", count: 3, order: "kind", section: "about", query: "" };
const BREW_KEY = "potions-v1";
try { Object.assign(brew, JSON.parse(localStorage.getItem(BREW_KEY) || "{}")); } catch (_) {}
if (!potionByKey(brew.potion)) brew.potion = "swiftness";
if (!["kind", "az"].includes(brew.order)) brew.order = "kind";

const ROMAN_FX = ["", "I", "II", "III", "IV", "V", "VI"];
const CAT_LABEL = { Helpful: "Helpful", Harmful: "Harmful", Trial: "Tricky Trials", Base: "Base bottles" };
const FORM_LABEL = { drink: "Drinkable", splash: "Splash", lingering: "Lingering", arrow: "Tipped arrow" };
const ALL_POTIONS = [...POTIONS, ...BASE_POTIONS];
const formsFor = p => Object.keys(FORM_LABEL).filter(f => f !== "arrow" || !p.base);
// What the sources and sections show as icons.
for (const [k, spec] of Object.entries({
  "ui:clock": L("clock"), "src:chest": C("chest_front", "chest_top", "chest_side"), "src:dispenser": C("dispenser_front_horizontal", "furnace_top", "furnace_side"),
  "src:spawner": C("trial_spawner"), "src:vault": C("vault"), "src:cauldron": ART_SITES["Cauldron"],
  "src:ancient": C("chest_front", "chest_top", "chest_side"), "src:end": C("end_bricks"), "src:igloo": C("snow"), "src:water": L("water_bucket"), "src:rod": L("fishing_rod"),
  "src:fletcher": C("fletching_table_front", "fletching_table_top", "fletching_table_side"),
  ...Object.fromEntries(["witch", "piglin", "stray", "bogged", "parched"].map(m => [`src:${m}`, L(`egg_${m}`)])), "src:trader": L("egg_wandering_trader"), "b:arrow": L("arrow"),
})) ICONS[k] = artReady(spec) ? spec : ICONS["ui:potion"];
for (const [name, file] of Object.entries(EFFECT_ICONS)) if (EFFECT_ART[file]) iconCache[`fx:${name}`] = EFFECT_ART[file];

const strongSuffix = p => (p.strongFx && p.strongFx.length === 1 ? ROMAN_FX[p.strongFx[0][1]] : "II");
const stateIcon = st => potionIcon(st.form, potionByKey(st.key).color);
function stateTitle(st) {
  let t = potionTitle(st.key, st.form);
  if (st.mod === "strong") t += " " + strongSuffix(potionByKey(st.key));
  if (st.mod === "long") t += " (extended)";
  return t;
}
// "Speed II (1:30)", the way the game's tooltip writes an effect.
const fxName = e => `${e.name}${e.level > 1 ? " " + ROMAN_FX[e.level] : ""}`;
const fxText = e => `${fxName(e)}${e.secs ? ` (${fmtTime(e.secs)})` : ""}`;
// An effect's icon; an instant one has none, so its potion stands for it.
const fxIcon = (e, p) => (iconCache[`fx:${e.name}`] ? `fx:${e.name}` : potionIcon("drink", p.color));
const countSlot = (name, n) => `<span class="slot">${iconImg(name)}${n > 1 ? `<span class="count">${n}</span>` : ""}</span>`;

const pickedPotion = () => potionByKey(brew.potion);
const pickedState = () => ({ key: brew.potion, mod: brew.mod, form: brew.form });
const pickedFx = (p = pickedPotion(), mod = brew.mod, form = brew.form) => potionEffects(p, mod, form, state.edition);
const potionShort = p => p.short || p.n;
const forEdition = v => byEdition(v, state.edition);
// Helpful, harmful or both, by its effects.
const potionKind = p => (p.base ? "None" : p.fx.every(([n]) => HARMFUL.has(n)) ? "Harmful" : p.fx.some(([n]) => HARMFUL.has(n)) ? "Mixed" : "Helpful");
const saveBrew = () => { try { localStorage.setItem(BREW_KEY, JSON.stringify(brew)); } catch (_) {} };

/* The stage */
const potionStage = $("potion-stage");
const potionView = itemScene($("potion-art"), { onTurn: () => potionStage.classList.add("turned"), swirl: EFFECT_ART.swirl });
// Every potion has the armor stands' stage: its sky, clouds and ground.
potionStage.style.setProperty("--ground", `url('${groundArt("plains")}')`);
function showPotion() {
  const p = pickedPotion();
  potionView.show(stateIcon(pickedState()), p.base ? null : p.color);
  $("potion-art").setAttribute("aria-label", `${stateTitle(pickedState())}. Drag or use the arrow keys to turn it.`);
}

/* The version buttons, under the stage and in the Brewing section */
const modChips = p => modsFor(p).map(mod => `<button type="button" class="name-chip" data-mod="${mod}" aria-pressed="${mod === brew.mod}">${
  { base: "Normal", long: `${iconImg("b:redstone")}Extended`, strong: `${iconImg("b:glowstone")}Level ${strongSuffix(p)}` }[mod]}</button>`).join("");
const formChips = p => formsFor(p).map(form => `<button type="button" class="name-chip" data-form="${form}" aria-pressed="${form === brew.form}">${iconImg(potionIcon(form, p.color))}${FORM_LABEL[form]}</button>`).join("");
function renderVersions() {
  const p = pickedPotion();
  $("potion-mod-bar").hidden = modsFor(p).length < 2;
  $("potion-mod").innerHTML = modChips(p);
  $("potion-form").innerHTML = formChips(p);
}

function renderPotionPicker() {
  const slots = list => `<div class="slot-grid">${list.map(x =>
    `<button type="button" class="slot slot-btn" id="potion-${x.k}" data-potion="${x.k}" data-name="${esc(potionShort(x))}" aria-label="${esc(potionTitle(x.k))}" aria-pressed="${x.k === brew.potion}">${iconImg(potionIcon("drink", x.color))}</button>`).join("")}</div>`;
  $("potion-order").value = brew.order;
  $("potion-picker").innerHTML = brew.order === "az"
    ? slots([...ALL_POTIONS].sort((a, b) => potionShort(a).localeCompare(potionShort(b))))
    : Object.keys(CAT_LABEL).map(c => `
    <div>
      <div class="cat-label">${CAT_LABEL[c]}</div>
      ${slots(ALL_POTIONS.filter(x => x.cat === c))}
    </div>`).join("");
  $("potion-name").textContent = potionTitle(brew.potion);
}

/* The sections */
const POTION_SECTIONS = [["about", "Overview"], ["versions", "Versions"], ["brewing", "Brewing"], ["items", "Ingredients"], ["find", "Where to find"], ["arrow", "Tipped arrow"]];
const potionSections = p => POTION_SECTIONS.filter(([s]) => !p.base || !["arrow", "versions"].includes(s));
const shownPotionSection = p => (potionSections(p).some(([s]) => s === brew.section) ? brew.section : "about");
const sectionIcon = (s, p) => ({ about: potionIcon("drink", p.color), versions: "ui:clock", brewing: "site:Brewing Stand", items: "b:nether_wart", find: "src:chest", arrow: p.base ? "" : potionIcon("arrow", p.color) }[s]);
const potionHead = (s, p, note = "") => sectionHead("potion-section-title", sectionIcon(s, p), POTION_SECTIONS.find(([k]) => k === s)[1], note);
const potionFact = (label, text) => (text ? `<div class="fact-row"><dt>${label}</dt><dd>${esc(text)}</dd></div>` : "");
const sourceRow = x => `<li class="item-row"><span class="slot sm">${iconImg(x.icon)}</span>
  <span class="item-name">${esc(x.n)}<span class="sub">${esc(x.what)}</span></span>${x.chance ? `<span class="item-chance">${esc(forEdition(x.chance))}</span>` : ""}</li>`;

// Overview: four boxes, what the picked version's effects do, then the facts.
function potionAbout(p) {
  const info = POTION_INFO[p.k], fx = pickedFx(), main = p.path.length ? p.path[p.path.length - 1][0] : "water_bottle", kind = potionKind(p);
  const stat = (label, value, sub, text = true) => `<div class="mob-stat${text ? " text" : ""}"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="sub">${sub}</span>` : ""}</div>`;
  const lasts = !fx.length ? "–" : fx[0].secs ? fmtTime(fx[0].secs) : "Instant";
  const version = [brew.mod === "long" ? "Extended" : brew.mod === "strong" ? `Level ${strongSuffix(p)}` : "", FORM_LABEL[brew.form].toLowerCase()].filter(Boolean).join(", ");
  const from = main === "water_bottle" ? "At any water" : p.path.length > 1 ? `Added to ${potionTitle(p.path[p.path.length - 2][1]).replace(/^Potion of /, "")}` : "Added to a Water Bottle";
  return `${potionHead("about", p)}
    <div class="mob-stats">
      ${stat("Lasts", lasts, version[0].toUpperCase() + version.slice(1), false)}
      ${stat("Kind", kind, { Helpful: "Good for whoever gets it", Harmful: "Bad for whoever gets it", Mixed: "Good and bad at once", None: "No effect" }[kind], false)}
      ${stat("Made with", main === "water_bottle" ? "Glass Bottle" : esc(BREW_ITEMS[main]), esc(from))}
      ${stat("Comes", p.base ? "One way" : modsFor(p).map(m => ({ base: "Normal", long: "Extended", strong: `Level ${strongSuffix(p)}` })[m]).map(x => `<span class="dim">${x}</span>`).join(""), "")}
    </div>
    ${fx.length ? `<div class="cat-label potion-label">${fx.length > 1 ? "Effects" : "Effect"}</div>
    <ul class="item-list fx-list">${fx.map(e => `<li class="item-row"><span class="slot sm">${iconImg(fxIcon(e, p))}</span>
      <span class="item-name"><span class="${e.bad ? "fx-bad" : "fx-good"}">${esc(fxText(e))}</span><span class="sub">${esc(forEdition(EFFECT_LEVELS[e.name][e.level]))}</span></span></li>`).join("")}</ul>` : ""}
    <dl class="fact-list">
      ${potionFact("Good for", forEdition(info.good))}
      ${potionFact("Good to know", forEdition(info.about))}
      ${potionFact("No effect on", forEdition(info.immune))}
      ${potionFact("Also from", info.also)}
    </dl>`;
}

// Versions: how long it lasts in each strength and bottle. Each is a button that picks it.
function potionVersions(p) {
  const mods = modsFor(p), forms = formsFor(p);
  const cell = (mod, form) => {
    const fx = pickedFx(p, mod, form), on = mod === brew.mod && form === brew.form;
    return `<td><button type="button" class="ver-btn" data-mod="${mod}" data-form="${form}" aria-pressed="${on}" aria-label="${esc(stateTitle({ key: p.k, mod, form }))}: ${fx[0].secs ? fmtTime(fx[0].secs) : "instant"}">${iconImg(potionIcon(form, p.color))}<span>${fx[0].secs ? fmtTime(fx[0].secs) : "Instant"}</span></button></td>`;
  };
  const label = { base: "Normal", long: "Extended", strong: `Level ${strongSuffix(p)}` };
  const missing = ["long", "strong"].filter(m => !mods.includes(m)).map(m => (m === "long" ? "extended" : "made stronger"));
  return `${potionHead("versions", p, `${plural(mods.length * forms.length, "version")}`)}
    <table class="ver-table">
      <thead><tr><td></td>${forms.map(f => `<th scope="col">${FORM_LABEL[f]}</th>`).join("")}</tr></thead>
      <tbody>${mods.map(m => `<tr><th scope="row">${label[m]}<span class="sub">${pickedFx(p, m, "drink").map(e => esc(fxName(e))).join("<br>")}</span></th>${forms.map(f => cell(m, f)).join("")}</tr>`).join("")}</tbody>
    </table>
    ${missing.length ? `<p class="tag-note potion-note">This potion can’t be ${missing.join(" or ")}.</p>` : ""}
    <dl class="fact-list">${forms.map(f => potionFact(FORM_FACTS[f].n, FORM_FACTS[f].text)).join("")}</dl>`;
}

// Brewing: the plan for the picked version. Whether its rules are open is kept across re-renders.
let brewRulesOpen = false;
function potionBrewing(p) {
  const plan = brewPlan(p, brew), arrows = brew.form === "arrow", fx = pickedFx();
  const perBatch = Math.min(brew.count, BOTTLES_PER_BATCH), final = pickedState(), alt = forEdition(BREW_ALT[p.k]);
  const controls = `<div class="choices brew-choices">
      ${modsFor(p).length > 1 ? `<div><div class="cat-label">Strength</div><div class="try-tags" role="group" aria-label="Strength">${modChips(p)}</div></div>` : ""}
      <div><div class="cat-label">Bottle</div><div class="try-tags" role="group" aria-label="Bottle">${formChips(p)}</div></div>
      <div><div class="cat-label">${arrows ? "How many lingering potions" : "How many bottles"}</div>
        <div class="stepper">
          <button type="button" class="mc-btn sm" id="brew-less" aria-label="Fewer bottles"${brew.count <= 1 ? " disabled" : ""}>−</button>
          <output id="brew-count" aria-live="polite">${brew.count}</output>
          <button type="button" class="mc-btn sm" id="brew-more" aria-label="More bottles"${brew.count >= 64 ? " disabled" : ""}>+</button>
        </div>
        <div class="choice-hint">${arrows ? "Each tips 8 arrows. " : ""}A brewing stand holds 3 bottles, so ingredients are counted per batch of 3.</div>
      </div>
    </div>`;
  const need = plan.items.map(([item, n]) =>
    `<div class="need-item">${countSlot("b:" + item, n)}<span>${esc(BREW_ITEMS[item])}<span class="sub">× ${n}</span></span></div>`).join("") +
    (arrows ? `<div class="need-item">${countSlot("b:arrow", brew.count * 8)}<span>Arrow<span class="sub">× ${brew.count * 8}</span></span></div>` : "") +
    (plan.fuel ? `<div class="need-item">${countSlot("b:blaze_powder", plan.fuel)}<span>Blaze Powder<span class="sub">× ${plan.fuel} as fuel</span></span></div>` : "");
  const steps = plan.steps.map((s, i) => `
    <li class="step">
      <div class="step-top">
        <span class="step-no">Step ${i + 1}</span>
        <span class="cost">Brewing time: 20 s</span>
      </div>
      <div class="brew-row">
        ${plainSlot("b:" + s.item)}<span class="op">+</span>${countSlot(stateIcon(s.from), perBatch)}${iconImg("ui:arrow")}${countSlot(stateIcon(s.to), perBatch)}
      </div>
      <div class="what">
        <div><span class="lbl">Top slot:</span> ${esc(BREW_ITEMS[s.item])}</div>
        <div><span class="lbl">Bottles:</span> ${esc(stateTitle(s.from))} <span class="sub">→</span> ${esc(stateTitle(s.to))}</div>
      </div>
    </li>`).join("") + (arrows ? `
    <li class="step">
      <div class="step-top"><span class="step-no">Last step</span><span class="cost">Crafting table</span></div>
      <div class="brew-row">${countSlot("b:arrow", 8)}<span class="op">+</span>${plainSlot(stateIcon(plan.final))}${iconImg("ui:arrow")}${countSlot(stateIcon(final), 8)}</div>
      <div class="what"><div><span class="lbl">Craft:</span> 8 arrows around a lingering potion, ${brew.count === 1 ? "once" : `${brew.count} times`}</div></div>
    </li>` : "");
  const foot = { drink: "Drink it.", splash: "Thrown. Gives the same duration as drinking it.", lingering: "Thrown as a cloud that gives a quarter of the potion’s duration.", arrow: "Shot from a bow or crossbow. Gives an eighth of the potion’s duration." }[brew.form];
  return `${potionHead("brewing", p, `${state.edition === "java" ? "Java" : "Bedrock"} Edition`)}
    ${controls}
    ${plan.steps.length ? `<div class="stats">
      <div class="stat"><div class="k">Brewing time</div><div class="v">${fmtTime(plan.seconds)}<small>min</small></div></div>
      <div class="stat"><div class="k">Blaze powder</div><div class="v">${plan.fuel}<small>fuel</small></div></div>
    </div>
    <div class="mini">
      <span>Bottles <b>${brew.count}</b></span>
      <span>Batches <b>${plan.batches}</b></span>
      <span>Steps per batch <b>${plan.steps.length}</b></span>
    </div>
    <p class="compare">${plan.batches > 1 ? `Run the steps below once for each of the <b>${plan.batches}</b> batches. Time is for a single brewing stand.` : "Time is for a single brewing stand."}</p>`
    : `<p class="mob-lead">No brewing needed: use a glass bottle on any water.</p>`}
    <div class="need">${need}</div>
    ${steps ? `<ol class="steps">${steps}</ol>` : ""}
    <div class="final">
      <div class="mc-tooltip">
        ${plainSlot(stateIcon(final))}
        <div>
          <div class="tname plain">${esc(potionTitle(final.key, final.form))}</div>
          <ul>${fx.length ? fx.map(e => `<li class="${e.bad ? "bad" : "good"}">${esc(fxText(e))}</li>`).join("") : "<li>No Effects</li>"}</ul>
          <div class="foot">${foot}</div>
        </div>
      </div>
    </div>
    ${alt ? `<dl class="fact-list">${potionFact("Another way", alt)}</dl>` : ""}
    <details class="rules tag-rules"${brewRulesOpen ? " open" : ""}>
      <summary>How brewing works</summary>
      <ul>${BREW_RULES.filter(([ed]) => !ed || ed === state.edition).map(([, text]) => `<li>${text}</li>`).join("")}</ul>
    </details>`;
}

// Ingredients: what the picked version takes, each with where it comes from.
function potionItems(p) {
  const plan = brewPlan(p, { ...brew, count: BOTTLES_PER_BATCH }), items = plan.items.map(([k]) => k);
  const row = (icon, name, from) => `<li class="item-row"><span class="slot sm">${iconImg(icon)}</span><span class="item-name">${esc(name)}<span class="sub">${esc(from)}</span></span></li>`;
  return `${potionHead("items", p, esc(stateTitle(pickedState())))}
    <ul class="item-list wide">${items.map(k => row("b:" + k, BREW_ITEMS[k], INGREDIENT_FROM[k])).join("")}${brew.form === "arrow" ? row("b:arrow", "Arrow", "Craft from flint, a stick and a feather; skeletons; fletchers sell them") : ""}${
    plan.fuel && !items.includes("blaze_powder") ? row("b:blaze_powder", "Blaze Powder", `Fuel for the stand. ${INGREDIENT_FROM.blaze_powder}`) : ""}</ul>
    <p class="tag-note potion-note">For one batch you need one of each, and up to 3 water bottles.${plan.fuel && items.includes("blaze_powder") ? " The brewing stand takes one more blaze powder as fuel." : ""}</p>`;
}

// Where to find: the places and mobs that have it ready-made.
function potionFind(p) {
  const list = (POTION_SOURCES[p.k] || []).filter(x => !x.ed || x.ed === state.edition), thrown = WITCH_THROWS[p.k];
  return `${potionHead("find", p, list.length ? plural(list.length, "place") : "Only by brewing")}
    ${list.length ? `<ul class="item-list wide">${list.map(sourceRow).join("")}</ul>` : `<p class="mob-lead">It isn’t found anywhere ready-made: brew it.</p>`}
    ${thrown ? `<dl class="fact-list">${potionFact("Witches", thrown)}</dl>` : ""}`;
}

// Tipped arrow: what each version does, how to make it and where it's found.
function potionArrow(p) {
  const arrow = potionIcon("arrow", p.color), list = [...(ARROW_SOURCES[p.k] || []),
    ...(state.edition === "java" || !FLETCHER_SKIPS.has(p.k) ? [{ icon: "src:fletcher", n: "Master fletcher", what: "May sell 5 for 2 emeralds and 5 arrows" }] : [])];
  const grid = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => plainSlot(i === 4 ? potionIcon("lingering", p.color) : "b:arrow", "sm")).join("");
  return `${potionHead("arrow", p, esc(potionTitle(p.k, "arrow")))}
    <div class="arrow-craft"><div class="craft-grid">${grid}</div>${iconImg("ui:arrow")}${countSlot(arrow, 8)}</div>
    <p class="mob-lead">Craft 8 arrows around a lingering potion. An extended or stronger one gives arrows of that kind.</p>
    <div class="cat-label potion-label">Effect</div>
    <ul class="item-list wide">${modsFor(p).map(m => `<li class="item-row"><span class="slot sm">${iconImg(arrow)}</span>
      <span class="item-name">${{ base: "Normal", long: "Extended", strong: `Level ${strongSuffix(p)}` }[m]}<span class="sub">${pickedFx(p, m, "arrow").map(e => esc(fxText(e))).join(", ")}</span></span></li>`).join("")}</ul>
    <div class="cat-label potion-label">Found ready-made</div>
    ${list.length ? `<ul class="item-list wide">${list.map(sourceRow).join("")}</ul>` : `<p class="mob-lead">Nowhere: craft it.</p>`}
    <dl class="fact-list">
      ${state.edition === "bedrock" ? potionFact("Cauldron", "Pour the potion into a cauldron and use arrows on it, with no lingering potion needed: three bottles tip up to 64 arrows.") : ""}
      ${potionFact("Good to know", `${FORM_FACTS.arrow.text} They stack to 64.`)}
    </dl>`;
}

function renderPotionResult() {
  const p = pickedPotion(), on = shownPotionSection(p);
  const body = { about: potionAbout, versions: potionVersions, brewing: potionBrewing, items: potionItems, find: potionFind, arrow: potionArrow }[on](p);
  $("potion-result").innerHTML = `
    <div class="res-top">
      <div class="res-title"><span class="slot">${iconImg(stateIcon(pickedState()))}</span>
        <div><h2>${esc(stateTitle(pickedState()))}</h2><div class="res-sub">${state.edition === "java" ? "Java" : "Bedrock"} Edition</div></div>
      </div>
    </div>
    <div class="mob-tabs" role="tablist" aria-label="${esc(potionTitle(p.k))}">
      ${potionSections(p).map(([k, title]) => `<button type="button" class="mob-tab" role="tab" id="potion-tab-${k}" data-section="${k}"
        aria-selected="${k === on}" aria-controls="potion-section" tabindex="${k === on ? 0 : -1}">${iconImg(sectionIcon(k, p))}${title}</button>`).join("")}
    </div>
    <section class="mob-section" id="potion-section" role="tabpanel" aria-labelledby="potion-tab-${on}">${body}</section>`;
}

// Search: potions by name, effect or ingredient.
function renderPotionSearch() {
  const q = brew.query.trim().toLowerCase(), box = $("potion-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type part of a potion’s name, an effect or an ingredient, then pick it from the list.</p>`;
    return;
  }
  const has = s => s.toLowerCase().includes(q);
  const hits = ALL_POTIONS.map(p => ({ p, name: has(potionTitle(p.k)), fx: p.fx.find(([n]) => has(n)), item: p.path.find(([k]) => has(BREW_ITEMS[k])) }))
    .filter(x => x.name || x.fx || x.item).sort((a, b) => Boolean(b.name || b.fx) - Boolean(a.name || a.fx));
  box.innerHTML = hits.length
    ? hits.map(({ p, name, fx, item }) => `
      <button type="button" class="search-hit" data-potion="${p.k}"${p.k === brew.potion ? ' aria-current="true"' : ""}>
        <span class="slot sm">${iconImg(potionIcon("drink", p.color))}</span>
        <span><span class="who">${esc(potionShort(p))}</span><span class="deal">${esc(name || fx || !item ? (p.fx.length ? p.fx.map(([n]) => n).join(" and ") : "No effect") : `Brewed with ${BREW_ITEMS[item[0]].toLowerCase()}`)} · ${CAT_LABEL[p.cat]}</span></span>
      </button>`).join("")
    : `<p class="choice-hint">No potion has anything like “${esc(brew.query.trim())}”.</p>`;
}

function renderBrew() {
  const p = pickedPotion();
  if (!modsFor(p).includes(brew.mod)) brew.mod = "base";
  if (!formsFor(p).includes(brew.form)) brew.form = "drink";
  renderPotionPicker();
  renderVersions();
  renderPotionResult();
  renderPotionSearch();
  showPotion();
  saveBrew();
}

function pickPotion(k) {
  if (!potionByKey(k)) return;
  if (k !== brew.potion) potionView.turnBack();
  brew.potion = k;
  renderBrew();
}
$("potion-picker").addEventListener("click", e => {
  const b = e.target.closest("button[data-potion]");
  if (!b) return;
  pickPotion(b.dataset.potion);
  refocus(`#potion-${brew.potion}`);
});
$("potion-results").addEventListener("click", e => {
  const b = e.target.closest("button[data-potion]");
  if (!b) return;
  pickPotion(b.dataset.potion);
  refocus(`#potion-results button[data-potion="${brew.potion}"]`);
});
$("potion-order").addEventListener("change", e => { brew.order = e.target.value; renderPotionPicker(); saveBrew(); });
$("potion-search").addEventListener("input", e => { brew.query = e.target.value; renderPotionSearch(); saveBrew(); });
// The version buttons, wherever they are (the stage's, the Versions table's, which pick both at once, and the plan's).
for (const id of ["potion-mod", "potion-form", "potion-result"]) $(id).addEventListener("click", e => {
  const b = e.target.closest("button[data-mod], button[data-form]");
  if (!b) return;
  if (b.dataset.mod) brew.mod = b.dataset.mod;
  if (b.dataset.form) brew.form = b.dataset.form;
  renderBrew();
  refocus(`#${id} button${b.dataset.mod ? `[data-mod="${brew.mod}"]` : ":not([data-mod])"}${b.dataset.form ? `[data-form="${brew.form}"]` : ":not([data-form])"}`);
});
const pickPotionSection = k => {
  brew.section = k;
  renderPotionResult();
  saveBrew();
  refocus(`#potion-tab-${k}`);
};
$("potion-result").addEventListener("click", e => {
  const tab = e.target.closest("button[data-section]"), step = e.target.closest("#brew-less, #brew-more");
  if (tab) pickPotionSection(tab.dataset.section);
  if (!step) return;
  brew.count = Math.min(64, Math.max(1, brew.count + (step.id === "brew-more" ? 1 : -1)));
  renderPotionResult();
  saveBrew();
  refocus(`#${step.id}`);
});
$("potion-result").addEventListener("keydown", e => {
  if (!e.target.closest("[role=tab]")) return;
  const list = potionSections(pickedPotion()), i = list.findIndex(([k]) => k === shownPotionSection(pickedPotion())), n = list.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickPotionSection(list[to % n][0]);
});
$("potion-result").addEventListener("toggle", e => { if (e.target.matches(".tag-rules")) brewRulesOpen = e.target.open; }, true);
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderBrew(); });

$("potion-search").value = brew.query;
renderBrew();

// The Brewing Guide is a section of this tab: an old bookmark of it (#brewing) opens that.
function openBrewing() {
  if (location.hash !== "#brewing") return;
  history.replaceState(null, "", "#potions");
  showView();
  brew.section = "brewing";
  renderPotionResult();
  saveBrew();
}
window.addEventListener("hashchange", openBrewing);
openBrewing();
