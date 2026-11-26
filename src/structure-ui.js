/* ---------- Structures tab ----------
 * A dimension, then a structure in it (and its kind), on its background; its loot container by container, its mobs and where it is.
 * The data is src/structure-data.js and src/structure-loot.js. Loads after the Mobs tab (pickMob) and the Potions tab (potionIcon).
 */
const st = { dim: "overworld", k: "", kind: "", section: "loot", box: "", query: "" };
const ST_KEY = "structures-v1";
try { Object.assign(st, JSON.parse(localStorage.getItem(ST_KEY)) || {}); } catch (_) {}
if (!STRUCTURE_DIMS.some(d => d.k === st.dim)) st.dim = "overworld";
if (st.k && !structureOf(st.k)) st.k = "";
const saveSt = () => { try { localStorage.setItem(ST_KEY, JSON.stringify(st)); } catch (_) {} };
const stEdition = () => (state.edition === "bedrock" ? "bedrock" : "java");
const stBackdrop = backdropView($("st-backdrop"));
const dimOf = k => STRUCTURE_DIMS.find(d => d.k === k);

// The structure picked, with its kind's own differences on it.
function shownStructure() {
  const s = st.k && structureOf(st.k);
  if (!s) return null;
  const kind = s.kinds && (s.kinds.find(x => x.k === st.kind) || s.kinds[0]);
  return kind ? { ...s, ...kind, k: s.k, n: s.n, kindKey: kind.k, kindName: kind.n } : s;
}

/* ---------- Loot ---------- */
const span2 = ([a, b], f = x => x) => (a === b ? `${f(a)}` : `${f(a)}–${f(b)}`);
const enchName = e => STRUCTURE_NAMES.ench[e] || titled(e.replace(/_/g, " "));
// What's done to a find, said plainly.
function kindSay(id, kind) {
  const say = [];
  for (const v of kind ? kind.split("+") : []) {
    const [k, rest = ""] = v.split(/:(.*)/);
    if (k === "worn") say.push("damaged");
    else if (k === "ench") say.push(rest === "treasure" ? "enchanted at random, treasure enchantments too" : rest ? `one of ${rest.split(",").map(enchName).join(", ")}, at any level` : id === "enchanted_book" ? "an enchantment at random" : "enchanted at random");
    else if (k === "lvl") say.push(`enchanted at level ${span2(rest.split("-"))}`);
    else if (k === "set") say.push(rest.split(",").map(x => { const [e, lv] = x.split(":"); return `${enchName(e)} ${span2(lv.split("-").map(Number), n => ROMAN[n] || n)}`; }).join(", "));
    else if (k === "omen") say.push(`Bad Omen ${span2(rest.split("-").map(n => +n + 1), n => ROMAN[n])}`);
    else if (k === "trim") { const [pat, mat] = rest.split("."); say.push(`${titled(pat)} trim in ${mat}`); }
    else if (k === "stew") say.push("its effect at random");
    else if (k === "horn") say.push("one of the first four sounds");
  }
  return say.join("; ");
}
function lootName(id, kind) {
  const p = lootPotion(kind);
  if (p) {
    const strong = /(^|\+)potion:strong_/.test(kind) ? (p === "slowness" ? " IV" : " II") : "";
    const eff = STRUCTURE_NAMES.effects[p] || titled(p.replace(/_/g, " "));
    return `${{ potion: "Potion of", splash_potion: "Splash Potion of", lingering_potion: "Lingering Potion of", tipped_arrow: "Arrow of" }[id] || "Potion of"} ${eff}${strong}`;
  }
  const camp = (kind.match(/(?:^|\+)camp:([a-z_]+)/) || [])[1];
  if (camp) return STRUCTURE_NAMES.camps[camp] || "Abandoned Camp Map";
  return STRUCTURE_NAMES.items[id] || titled(id.replace(/_/g, " "));
}
const shines = (id, kind) => LOOT_SHINES.has(id) || /(^|\+)(ench|lvl|set)/.test(kind);
const pct = p => (p >= 0.995 ? "100%" : p >= 0.001 ? `${(p * 100).toFixed(1)}%` : `${(p * 100).toPrecision(2)}%`);
const tablePath = t => (typeof t === "string" ? t : t[stEdition()]);

// A container's finds in the edition picked: one table, or one of several (pick) rolled by weight, so each find's chance is the
// weighted sum. [id, kind, least, most, chance, where].
function boxRows(box) {
  const parts = box.pick || [[box.table, 1]], total = parts.reduce((a, [, w]) => a + w, 0), out = new Map();
  for (const [t, w] of parts) {
    for (const [id, kind, lo, hi, p, where = ""] of STRUCTURE_LOOT[stEdition()][tablePath(t)] || []) {
      const key = `${id}|${kind}|${where}`, had = out.get(key);
      out.set(key, had ? [id, kind, Math.min(had[2], lo), Math.max(had[3], hi), had[4] + (p * w) / total, where] : [id, kind, lo, hi, (p * w) / total, where]);
    }
  }
  return [...out.values()];
}

const lootSlot = (id, kind) => {
  const key = lootIcon(id, kind);
  return shines(id, kind) ? `<span class="slot sm glint" style="--m:url('${icon(key)}')">${iconImg(key)}</span>` : plainSlot(key, "sm");
};
const lootRow = ([id, kind, lo, hi, p, where]) => {
  const sub = [kindSay(id, kind), where && `only in ${titled(where.replace(/_/g, " "))}`].filter(Boolean).join("; ");
  return `<li class="item-row${lootGroup(id) === "best" ? " st-best" : ""}">${lootSlot(id, kind)}<span class="item-name">${esc(lootName(id, kind))}${sub ? `<span class="sub">${esc(sub[0].toUpperCase() + sub.slice(1))}</span>` : ""}</span><span class="st-count">× ${span2([lo, hi])}</span><span class="item-chance">${pct(p)}</span></li>`;
};
function boxList(box) {
  const rows = boxRows(box).filter(r => r[1] !== "*").sort((a, b) => b[4] - a[4]);
  if (!rows.length) return '<p class="mob-lead">Nothing in this edition.</p>';
  return LOOT_GROUPS.map(([g, label]) => {
    const mine = rows.filter(r => lootGroup(r[0]) === g);
    return mine.length ? `<div class="cat-label potion-label${g === "best" ? " st-best-label" : ""}">${label}</div><ul class="item-list wide st-loot">${mine.map(lootRow).join("")}</ul>` : "";
  }).join("");
}

/* ---------- Sections ---------- */
const ST_SECTIONS = [["loot", "Loot"], ["mobs", "Mobs"], ["where", "Where it is"]];
const DIM_SECTIONS = [["structures", "Structures"], ["mobs", "Mobs"]];
const stSections = () => (st.k ? ST_SECTIONS : DIM_SECTIONS);
const stSectionIcon = k => ({ loot: "ui:logo", mobs: "ui:mob", where: "st:compass", structures: "st:map" }[k]);
const stHead = (k, note = "") => sectionHead("st-section-title", stSectionIcon(k), stSections().find(([s]) => s === k)[1], note);
const stFact = (label, text) => (text ? `<div class="fact-row"><dt>${label}</dt><dd>${esc(byEdition(text, stEdition()))}</dd></div>` : "");

function lootSection(s) {
  const boxes = s.loot || [];
  if (!boxes.length) return `${stHead("loot")}<p class="mob-lead">It has no containers of its own.</p>`;
  const box = boxes.find(b => b.k === st.box) || boxes[0];
  return `${stHead("loot", plural(boxes.length, "kind of container", "kinds of container"))}
    <div class="try-tags st-boxes" role="group" aria-label="Container">${boxes.map(b => `<button type="button" class="name-chip" data-box="${b.k}" aria-pressed="${b === box}">${iconImg(ST_BLOCKS[b.block])}${esc(b.n)}</button>`).join("")}</div>
    <div class="st-box">
      <div class="st-box-head">${plainSlot(ST_BLOCKS[box.block])}<div><h4>${esc(box.n)}</h4><p>${esc(byEdition(box.where, stEdition()))}</p></div></div>
      ${boxList(box)}
      <p class="st-note">The chance is that one ${box.pick ? "reward" : "container"} has at least one; × is how many come together.</p>
    </div>`;
}

const mobKey = k => (MOBS.some(m => m.k === k) ? k : null);
const stMobName = r => (r.baby ? `Baby ${mobName(mobOf(r.mob))}` : mobName(mobOf(r.mob)));
const mobRow = r => `<li><button type="button" class="item-row st-mob" data-mob="${r.mob}"${r.baby ? ' data-baby="on"' : ""} title="Open the ${esc(stMobName(r))} in the Mobs tab">
    ${plainSlot(mobIcon(mobOf(r.mob)), "sm")}<span class="item-name">${esc(stMobName(r))}<span class="sub">${esc(byEdition(r.how, stEdition()))}</span></span>${r.chance ? `<span class="item-chance">${esc(r.chance)}</span>` : ""}</button></li>`;
function mobsSection(s) {
  const mobs = (s.mobs || []).filter(r => mobKey(r.mob));
  return `${stHead("mobs", mobs.length ? plural(new Set(mobs.map(r => r.mob + (r.baby ? "b" : ""))).size, "mob") : "")}
    ${mobs.length ? `<ul class="item-list wide st-mobs st-one">${mobs.map(mobRow).join("")}</ul>` : '<p class="mob-lead">No mobs of its own.</p>'}
    ${s.mobFacts ? `<dl class="fact-list">${s.mobFacts.map(([l, t]) => stFact(l, t)).join("")}</dl>` : ""}`;
}

function whereSection(s) {
  const w = s.where || {};
  return `${stHead("where")}
    <dl class="fact-list">
      ${stFact("Biomes", w.biomes)}
      ${stFact("Height", w.height)}
      ${stFact("How often", w.often)}
      ${stFact("Finding one", w.find)}
      ${stFact("Watch out", w.danger)}
      ${stFact("Good to know", w.about)}
    </dl>`;
}

// A dimension on its own: its structures, then its mobs.
function structuresSection() {
  const list = STRUCTURES.filter(s => s.dim === st.dim);
  return `${stHead("structures", plural(list.length, "structure"))}
    ${list.length ? `<ul class="item-list wide st-mobs">${list.map(s => `<li><button type="button" class="item-row st-mob" data-pick="${s.k}">${plainSlot(s.icon, "sm")}<span class="item-name">${esc(s.n)}<span class="sub">${esc(s.say)}</span></span></button></li>`).join("")}</ul>` : '<p class="mob-lead">Coming soon.</p>'}`;
}
function dimMobsSection() {
  return `${stHead("mobs")}<p class="mob-lead">Coming soon.</p>`;
}

function renderStResult() {
  const s = shownStructure(), d = dimOf(st.dim), secs = stSections();
  const on = secs.some(([k]) => k === st.section) ? st.section : secs[0][0];
  const body = s ? { loot: lootSection, mobs: mobsSection, where: whereSection }[on](s) : { structures: structuresSection, mobs: dimMobsSection }[on]();
  $("st-result").innerHTML = `
    <div class="res-top">
      <div class="res-title">${plainSlot(s ? s.icon : d.icon)}
        <div><h2>${esc(s ? s.n : d.n)}</h2><div class="res-sub">${esc(s ? [s.kindName, d.n].filter(Boolean).join(" · ") : "A dimension")}</div></div>
      </div>
    </div>
    ${s && s.say ? `<p class="mob-lead st-say">${esc(s.say)}</p>` : ""}
    <div class="mob-tabs" role="tablist" aria-label="${esc(s ? s.n : d.n)}">
      ${secs.map(([k, title]) => `<button type="button" class="mob-tab" role="tab" id="st-tab-${k}" data-section="${k}"
        aria-selected="${k === on}" aria-controls="st-section" tabindex="${k === on ? 0 : -1}">${iconImg(stSectionIcon(k))}${title}</button>`).join("")}
    </div>
    <section class="mob-section" id="st-section" role="tabpanel" aria-labelledby="st-tab-${on}">${body}</section>`;
}

/* ---------- Beside the stage, and under it ---------- */
function renderStPicker() {
  const s = shownStructure();
  $("st-name").textContent = s ? s.n : dimOf(st.dim).n;
  $("st-dims").innerHTML = STRUCTURE_DIMS.map(d => `<button type="button" class="name-chip" data-dim="${d.k}" aria-pressed="${d.k === st.dim && !st.k}">${iconImg(d.icon)}${esc(d.n)}</button>`).join("");
  const list = STRUCTURES.filter(x => x.dim === st.dim);
  $("st-picker").innerHTML = list.length
    ? `<div><div class="cat-label">Structures</div><div class="st-list">${list.map(x => `<button type="button" class="st-tile" id="st-pick-${x.k}" data-pick="${x.k}" aria-pressed="${x.k === st.k}">${iconImg(x.icon)}<span>${esc(x.n)}</span></button>`).join("")}</div></div>`
    : `<p class="choice-hint">Its structures are coming soon.</p>`;
  const kinds = s && structureOf(s.k).kinds;
  $("st-kind-bar").hidden = !kinds;
  if (kinds) {
    $("st-kind-label").textContent = `Kind: ${s.kindName}`;
    $("st-kinds").innerHTML = kinds.map(x => `<button type="button" class="name-chip" data-kind="${x.k}" aria-pressed="${x.k === s.kindKey}">${x.icon ? iconImg(x.icon) : ""}${esc(x.n)}</button>`).join("");
  }
}

function showStStage() {
  const s = shownStructure();
  const biome = (s && (sceneOf(`${s.k}/${s.kindKey}`) || sceneOf(s.k))) || sceneOf(st.dim);
  const stage = $("st-stage");
  stage.dataset.biome = biome;
  stage.style.setProperty("--ground", `url('${groundArt(biome)}')`);
  stBackdrop.show(biome);
}

/* ---------- Search: an item, everywhere it's found, best chance first; or a mob ---------- */
function stSearchHits(q) {
  const hits = [];
  for (const s of STRUCTURES) {
    for (const kind of s.kinds || [null]) {
      const shown = kind ? { ...s, ...kind } : s;
      for (const box of shown.loot || []) {
        const rows = boxRows(box), any = new Map(rows.filter(r => r[1] === "*").map(r => [r[0], r]));
        const byId = new Map();
        for (const r of rows) {
          if (r[1] === "*") continue;
          const base = (STRUCTURE_NAMES.items[r[0]] || r[0]).toLowerCase(), full = lootName(r[0], r[1]).toLowerCase();
          if (base.includes(q)) byId.set(r[0], any.get(r[0]) || r);
          else if (full.includes(q) && !byId.has(r[0])) byId.set(`${r[0]}|${r[1]}`, r);
        }
        for (const r of byId.values()) hits.push({ item: r, s, kind, box, p: r[4] });
      }
      for (const m of shown.mobs || []) {
        if (mobKey(m.mob) && stMobName(m).toLowerCase().includes(q)) hits.push({ mob: m, s, kind, p: m.chance === "Every one" ? 1 : 0.5 });
      }
    }
  }
  return hits.sort((a, b) => b.p - a.p);
}
function renderStSearch() {
  const q = st.query.trim().toLowerCase(), box = $("st-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type an item (“saddle”, “trident”, “enchanted golden apple”) or a mob (“breeze”), and see every structure that has it, best chance first.</p>`;
    return;
  }
  const hits = stSearchHits(q).slice(0, 60);
  box.innerHTML = hits.length
    ? hits.map(h => h.item
      ? `<button type="button" class="search-hit" data-pick="${h.s.k}" data-kind="${h.kind ? h.kind.k : ""}" data-box="${h.box.k}">
          ${lootSlot(h.item[1] === "*" ? h.item[0] : h.item[0], h.item[1] === "*" ? "" : h.item[1])}
          <span><span class="who">${esc(h.item[1] === "*" ? STRUCTURE_NAMES.items[h.item[0]] : lootName(h.item[0], h.item[1]))}</span><span class="deal">${esc([h.s.n, h.kind && h.kind.n, h.box.n].filter(Boolean).join(" · "))}: ${pct(h.p)}${h.item[5] ? `, only in ${esc(titled(h.item[5].replace(/_/g, " ")))}` : ""}</span></span>
        </button>`
      : `<button type="button" class="search-hit" data-pick="${h.s.k}" data-kind="${h.kind ? h.kind.k : ""}" data-section="mobs">
          ${plainSlot(mobIcon(mobOf(h.mob.mob)), "sm")}
          <span><span class="who">${esc(stMobName(h.mob))}</span><span class="deal">${esc([h.s.n, h.kind && h.kind.n].filter(Boolean).join(" · "))}${h.mob.chance ? `: ${esc(h.mob.chance)}` : ""}</span></span>
        </button>`).join("")
    : `<p class="choice-hint">No structure has anything like “${esc(st.query.trim())}”.</p>`;
}

function renderStructures() {
  renderStPicker();
  renderStResult();
  renderStSearch();
  showStStage();
  saveSt();
}

/* ---------- What the buttons do ---------- */
function pickStructure(k, { kind = "", box = "", section = "" } = {}) {
  const s = structureOf(k);
  if (!s) return;
  if (k !== st.k) { st.box = ""; st.kind = ""; }
  st.k = k;
  st.dim = s.dim;
  if (kind) st.kind = kind;
  if (box) { st.box = box; st.section = "loot"; }
  if (section) st.section = section;
  if (!ST_SECTIONS.some(([x]) => x === st.section)) st.section = "loot";
  renderStructures();
}
$("st-dims").addEventListener("click", e => {
  const b = e.target.closest("button[data-dim]");
  if (!b) return;
  st.dim = b.dataset.dim;
  st.k = st.kind = st.box = "";
  if (!DIM_SECTIONS.some(([x]) => x === st.section)) st.section = "structures";
  renderStructures();
  refocus(`#st-dims button[data-dim="${st.dim}"]`);
});
$("st-picker").addEventListener("click", e => {
  const b = e.target.closest("button[data-pick]");
  if (!b) return;
  pickStructure(b.dataset.pick);
  refocus(`#st-pick-${st.k}`);
});
$("st-kinds").addEventListener("click", e => {
  const b = e.target.closest("button[data-kind]");
  if (!b) return;
  st.kind = b.dataset.kind;
  st.box = "";
  renderStructures();
  refocus(`#st-kinds button[data-kind="${st.kind}"]`);
});
$("st-results").addEventListener("click", e => {
  const b = e.target.closest("button[data-pick]");
  if (b) pickStructure(b.dataset.pick, { kind: b.dataset.kind, box: b.dataset.box, section: b.dataset.section });
});
const pickStSection = k => {
  st.section = k;
  renderStResult();
  saveSt();
  refocus(`#st-tab-${k}`);
};
$("st-result").addEventListener("click", e => {
  const tab = e.target.closest("button[data-section]");
  if (tab) return pickStSection(tab.dataset.section);
  const box = e.target.closest("button[data-box]");
  if (box) {
    st.box = box.dataset.box;
    renderStResult();
    saveSt();
    return refocus(`#st-section button[data-box="${st.box}"]`);
  }
  const s = e.target.closest("button[data-pick]");
  if (s) return pickStructure(s.dataset.pick);
  const m = e.target.closest("button[data-mob]");
  if (m) {
    location.hash = "#mobs";
    showView();
    pickMob(m.dataset.mob, "");
    if (m.dataset.baby) document.querySelector('#age-try button[data-baby="on"]')?.click();
    window.scrollTo(0, 0);
  }
});
$("st-result").addEventListener("keydown", e => {
  if (!e.target.closest("[role=tab]")) return;
  const secs = stSections(), i = secs.findIndex(([k]) => k === st.section), n = secs.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickStSection(secs[to % n][0]);
});
$("st-search").addEventListener("input", e => { st.query = e.target.value; renderStSearch(); saveSt(); });
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderStructures(); });

$("st-search").value = st.query;
renderStructures();
