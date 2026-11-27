/* ---------- Structures tab ----------
 * A dimension, then a structure in it (and its kind), on its background; its loot container by container, its mobs and where it is.
 * The structures are picked in the Structures section only (the user's wish: no second list beside the stage), one a line; one made
 * in kinds (the bastion) is a dropdown there, its kinds under it, and the section stays among the tabs once a structure is picked.
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
const ST_SECTIONS = [["structures", "Structures"], ["loot", "Loot"], ["mobs", "Mobs"], ["where", "Where it is"]];
const DIM_SECTIONS = [["structures", "Structures"], ["mobs", "Mobs"]];
const stSections = () => (st.k ? ST_SECTIONS : DIM_SECTIONS);
const stSectionIcon = k => ({ loot: "ui:logo", mobs: "ui:mob", where: "st:compass", structures: "st:map" }[k]);
const stHead = (k, note = "") => sectionHead("st-section-title", stSectionIcon(k), stSections().find(([s]) => s === k)[1], note);
// A fact only one edition has is both(text, "") or both("", text): no row in the other.
const stFact = (label, text) => { const t = byEdition(text, stEdition()); return t ? `<div class="fact-row"><dt>${label}</dt><dd>${esc(t)}</dd></div>` : ""; };

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
    </div>
    ${s.lootFacts ? `<dl class="fact-list">${s.lootFacts.map(([l, t]) => stFact(l, t)).join("")}</dl>` : ""}`;
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

// The dimension's structures, one a line; one made in kinds is a dropdown (open while it's the one picked, or once opened), its kinds
// the lines under it that pick it.
const stOpen = new Set();
let stClosed = "";
const stLine = (attrs, ico, name, say, pressed) => `<button type="button" class="item-row st-mob" ${attrs} aria-pressed="${pressed}">${plainSlot(ico, "sm")}<span class="item-name">${esc(name)}<span class="sub">${esc(say)}</span></span></button>`;
function structuresSection() {
  const list = STRUCTURES.filter(s => s.dim === st.dim), shown = shownStructure();
  const line = s => {
    if (!s.kinds) return `<li>${stLine(`data-pick="${s.k}"`, s.icon, s.n, s.say, s.k === st.k)}</li>`;
    const open = stOpen.has(s.k) || (s.k === st.k && stClosed !== s.k);
    return `<li><button type="button" class="item-row st-mob st-drop" id="st-drop-${s.k}" data-open="${s.k}" aria-expanded="${open}" aria-controls="st-kinds-${s.k}">${plainSlot(s.icon, "sm")}<span class="item-name">${esc(s.n)}<span class="sub">${esc(s.say)}</span></span></button>
      ${open ? `<ul class="item-list wide st-mobs st-kinds-list" id="st-kinds-${s.k}" aria-label="Kinds of ${esc(s.n)}">${s.kinds.map(x => `<li>${stLine(`data-pick="${s.k}" data-kind="${x.k}"`, x.icon || s.icon, x.n, x.say, s.k === st.k && shown.kindKey === x.k)}</li>`).join("")}</ul>` : ""}</li>`;
  };
  return `${stHead("structures", plural(list.length, "structure"))}
    ${list.length ? `<ul class="item-list wide st-mobs st-one st-structs">${list.map(line).join("")}</ul>` : '<p class="mob-lead">Coming soon.</p>'}`;
}

/* ---------- A dimension's own mobs ---------- */
// What spawns in the open, by group of biomes (DIM_GROUPS), from src/dimension-spawns.js and the lines in DIM_HOW.
const DIM_MOB_KEYS = { tropical_fish: "tropicalfish" };
const DIM_EVERYWHERE_LABEL = { overworld: "Almost everywhere", nether: "In every biome" };
const DIM_KIND_ORDER = { creature: 0, animal: 0, water_creature: 1, water: 1, water_ambient: 1, water_animal: 1, axolotls: 1, underground_water_creature: 1, ambient: 2, monster: 3 };
// A biome's spawns in the edition picked: mob -> { kind, w, share, lo, hi, h }. Bedrock's zombies are split by their permute_type
// (1 in 20 a zombie villager), and the first of a group of drowned that spawns riding brings a zombie nautilus.
const biomeCache = {};
function biomeSpawns(ed, b) {
  const key = `${ed}/${b}`;
  if (biomeCache[key]) return biomeCache[key];
  const rows = [];
  for (const [kind, mob, w, lo, hi, o = {}] of DIM_SPAWNS[ed][b] || []) {
    let left = w;
    for (const [m, pw] of o.p || []) { rows.push({ kind, mob: m, w: (w * pw) / 100, lo: 1, hi: 1 }); left -= (w * pw) / 100; }
    const most = DIM_MOST_AT_ONCE[ed][mob] || hi;
    rows.push({ kind, mob, w: left, lo: Math.min(lo, most), hi: Math.min(hi, most), h: o.h });
    if (o.ride === "as_rider") rows.push({ kind, mob: "zombie_nautilus", w, lo: 1, hi: 1, h: o.h, rides: true });
  }
  const total = {};
  for (const r of rows) if (!r.rides) total[r.kind] = (total[r.kind] || 0) + r.w;
  const out = new Map();
  for (const r of rows) {
    const k = DIM_MOB_KEYS[r.mob] || r.mob, had = out.get(k), share = r.w / total[r.kind];
    out.set(k, had ? { ...had, w: had.w + r.w, share: had.share + share, lo: Math.min(had.lo, r.lo), hi: Math.max(had.hi, r.hi),
      h: had.h && r.h ? [Math.min(had.h[0], r.h[0]), Math.max(had.h[1], r.h[1])] : had.h || r.h } : { ...r, mob: k, share });
  }
  return (biomeCache[key] = out);
}
const dimBiomes = dim => DIM_GROUPS[dim].flatMap(([, bs]) => bs);
const sharePct = p => { const v = p * 100; return v >= 10 ? `${Math.round(v)}` : v >= 1 ? `${+v.toFixed(1)}` : `${+v.toPrecision(1)}`; };
const shareSpan = shares => { const a = sharePct(Math.min(...shares)), b = sharePct(Math.max(...shares)); return a === b ? `${a}%` : `${a}–${b}%`; };
const groupSize = (lo, hi) => (hi === 1 ? "Alone" : lo === hi ? `Groups of ${lo}` : `${lo}–${hi} together`);
const andList = (xs, and = "and") => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${and} ${xs[xs.length - 1]}`);
const biomeName = b => DIM_BIOME_NAMES[b].toLowerCase();
// Biomes by name, a whole group by its label, in lower case for a sentence.
function placeNames(dim, biomes, and = "and") {
  const set = new Set(biomes), out = [];
  for (const [label, bs] of DIM_GROUPS[dim]) {
    if (bs.length > 1 && bs.every(b => set.has(b))) out.push(label.toLowerCase());
    else for (const b of bs) if (set.has(b)) out.push(biomeName(b));
  }
  return andList(out, and);
}
// One mob across some biomes: where it is, its shares there, its group sizes and Bedrock's heights.
function spread(ed, biomes, mob) {
  const at = biomes.map(b => [b, biomeSpawns(ed, b).get(mob)]).filter(([, r]) => r);
  if (!at.length) return null;
  const hs = at.map(([, r]) => r.h).filter(Boolean);
  return { in: at.map(([b]) => b), shares: at.map(([, r]) => r.share), sizes: at.map(([, r]) => [r.lo, r.hi]), lo: Math.min(...at.map(([, r]) => r.lo)), hi: Math.max(...at.map(([, r]) => r.hi)),
    h: hs.length ? [Math.min(...hs.map(h => h[0])), Math.max(...hs.map(h => h[1]))] : null, kind: at[0][1].kind };
}
const mostOf = xs => { const n = new Map(); xs.forEach(x => n.set(x, (n.get(x) || 0) + 1)); return [...n].sort((a, b) => b[1] - a[1])[0][0]; };
// Where in a group a mob is, when not in all of it: the shorter of "Only in" and "Not in".
function whereIn(dim, biomes, here) {
  if (here.length === biomes.length) return "";
  const not = biomes.filter(b => !here.includes(b));
  return not.length < here.length ? `Not in ${placeNames(dim, not, "or")}` : `Only in ${placeNames(dim, here)}`;
}
const dimHow = (dim, mob) => byEdition((DIM_HOW[dim] || {})[mob], stEdition()) || "";
const sayY = h => (h ? `At Y ${h[0]} to ${h[1]}.` : "");
const sentence = parts => parts.filter(Boolean).map(x => (/[.!?]$/.test(x) ? x : `${x}.`)).join(" ");

// The section's groups, each { label, biomes, rows: [{ mob, how, chance }], note }, for the edition picked.
const layoutCache = {};
function dimLayout(dim) {
  const ed = stEdition(), key = `${dim}/${ed}`;
  if (layoutCache[key]) return layoutCache[key];
  const all = dimBiomes(dim), every = DIM_EVERYWHERE[dim] || [], groups = [];
  const extras = (DIM_EXTRA[dim] || []).filter(x => !x.ed || x.ed === ed);
  const everyRows = every.map(mob => {
    const s = spread(ed, all, mob);
    if (!s) return null;
    // The share most of its biomes give it, and where it's far from that.
    const usual = +mostOf(s.shares.map(p => p.toFixed(4))), size = mostOf(s.sizes.map(x => x.join("-"))).split("-").map(Number);
    const fewer = s.in.filter((b, i) => s.shares[i] < usual * 0.6), more = s.in.filter((b, i) => s.shares[i] > usual * 1.6);
    const missing = all.filter(b => !s.in.includes(b));
    return { mob, chance: `${sharePct(usual)}%`, how: sentence([dimHow(dim, mob), ed === "bedrock" && sayY(s.h), groupSize(...size),
      missing.length && `Not in ${placeNames(dim, missing, "or")}`, fewer.length && `Fewer in ${placeNames(dim, fewer)}`, more.length && `More in ${placeNames(dim, more)}`]) };
  }).filter(Boolean);
  if (everyRows.length) groups.push({ label: DIM_EVERYWHERE_LABEL[dim], rows: everyRows });
  for (const [label, biomes] of DIM_GROUPS[dim]) {
    const mobs = new Set(biomes.flatMap(b => [...biomeSpawns(ed, b).keys()]).filter(m => !every.includes(m)));
    const rows = [...mobs].map(mob => ({ mob, s: spread(ed, biomes, mob) })).sort((a, b) =>
      DIM_KIND_ORDER[a.s.kind] - DIM_KIND_ORDER[b.s.kind] || Math.max(...b.s.shares) - Math.max(...a.s.shares)).map(({ mob, s }) => ({
      mob, chance: shareSpan(s.shares), how: sentence([dimHow(dim, mob), ed === "bedrock" && sayY(s.h), groupSize(s.lo, s.hi),
        whereIn(dim, biomes, s.in)]) }));
    for (const x of extras.filter(x => x.biomes && x.biomes.some(b => biomes.includes(b)))) {
      const inHere = x.biomes.filter(b => biomes.includes(b));
      rows.push({ mob: x.mob, chance: x.chance, how: sentence([byEdition(x.how, ed), whereIn(dim, biomes, inHere)]) });
    }
    const monsters = biomes.some(b => [...biomeSpawns(ed, b).values()].some(r => r.kind === "monster"));
    const none = biomes.every(b => !biomeSpawns(ed, b).size);
    groups.push({ label, biomes, rows, note: none ? "Nothing spawns here on its own." : !monsters && dim === "overworld" ? "No monsters spawn here." : "" });
  }
  const own = [...new Set(extras.filter(x => x.group).map(x => x.group))];
  for (const label of own) groups.push({ label, rows: extras.filter(x => x.group === label).map(x => ({ mob: x.mob, chance: x.chance, how: byEdition(x.how, ed) })) });
  for (const g of groups) g.rows = g.rows.filter(r => mobKey(r.mob));
  return (layoutCache[key] = groups);
}

function dimMobsSection() {
  const groups = dimLayout(st.dim), n = new Set(groups.flatMap(g => g.rows.map(r => r.mob))).size;
  const biomeLine = g => {
    if (!g.biomes || (g.biomes.length === 1 && biomeName(g.biomes[0]) === g.label.toLowerCase())) return "";
    const t = andList(g.biomes.map(biomeName));
    return `<p class="st-biomes">${esc(t[0].toUpperCase() + t.slice(1))}</p>`;
  };
  return `${stHead("mobs", plural(n, "mob"))}
    ${groups.map(g => `<div class="cat-label potion-label st-group">${esc(g.label)}</div>${biomeLine(g)}
      ${g.rows.length ? `<ul class="item-list wide st-mobs st-one">${g.rows.map(mobRow).join("")}</ul>` : ""}
      ${g.note ? `<p class="st-note st-group-note">${esc(g.note)}</p>` : !g.rows.length ? '<p class="st-note st-group-note">Nothing else of its own.</p>' : ""}`).join("")}
    <dl class="fact-list">${(DIM_FACTS[st.dim] || []).map(([l, t]) => stFact(l, t)).join("")}</dl>`;
}

function renderStResult() {
  const s = shownStructure(), d = dimOf(st.dim), secs = stSections();
  const on = secs.some(([k]) => k === st.section) ? st.section : secs[0][0];
  const body = s ? { structures: structuresSection, loot: lootSection, mobs: mobsSection, where: whereSection }[on](s) : { structures: structuresSection, mobs: dimMobsSection }[on]();
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
  // Each dimension's own mobs: where they spawn in the open.
  for (const d of STRUCTURE_DIMS) {
    const where = new Map();
    for (const g of dimLayout(d.k)) for (const r of g.rows) if (!where.has(r.mob) || !where.get(r.mob).includes(g.label)) where.set(r.mob, [...(where.get(r.mob) || []), g.label]);
    for (const [mob, labels] of where) if (mobName(mobOf(mob)).toLowerCase().includes(q)) hits.push({ dimMob: mob, dim: d, labels, p: 0.9 });
  }
  return hits.sort((a, b) => b.p - a.p);
}
function renderStSearch() {
  const q = st.query.trim().toLowerCase(), box = $("st-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type an item (“saddle”, “trident”, “enchanted golden apple”) or a mob (“breeze”, “strider”), and see every structure and dimension that has it.</p>`;
    return;
  }
  const hits = stSearchHits(q).slice(0, 60);
  box.innerHTML = hits.length
    ? hits.map(h => h.dimMob
      ? `<button type="button" class="search-hit" data-dim="${h.dim.k}" data-section="mobs">
          ${plainSlot(mobIcon(mobOf(h.dimMob)), "sm")}
          <span><span class="who">${esc(mobName(mobOf(h.dimMob)))}</span><span class="deal">${esc(h.dim.n)}: ${esc(h.labels.slice(0, 3).join(", "))}${h.labels.length > 3 ? "…" : ""}</span></span>
        </button>`
      : h.item
      ? `<button type="button" class="search-hit" data-pick="${h.s.k}" data-kind="${h.kind ? h.kind.k : ""}" data-box="${h.box.k}">
          ${lootSlot(h.item[1] === "*" ? h.item[0] : h.item[0], h.item[1] === "*" ? "" : h.item[1])}
          <span><span class="who">${esc(h.item[1] === "*" ? STRUCTURE_NAMES.items[h.item[0]] : lootName(h.item[0], h.item[1]))}</span><span class="deal">${esc([h.s.n, h.kind && h.kind.n, h.box.n].filter(Boolean).join(" · "))}: ${pct(h.p)}${h.item[5] ? `, only in ${esc(titled(h.item[5].replace(/_/g, " ")))}` : ""}</span></span>
        </button>`
      : `<button type="button" class="search-hit" data-pick="${h.s.k}" data-kind="${h.kind ? h.kind.k : ""}" data-section="mobs">
          ${plainSlot(mobIcon(mobOf(h.mob.mob)), "sm")}
          <span><span class="who">${esc(stMobName(h.mob))}</span><span class="deal">${esc([h.s.n, h.kind && h.kind.n].filter(Boolean).join(" · "))}${h.mob.chance ? `: ${esc(h.mob.chance)}` : ""}</span></span>
        </button>`).join("")
    : `<p class="choice-hint">Nothing has anything like “${esc(st.query.trim())}”.</p>`;
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
  if (kind && kind !== st.kind) st.box = "";
  st.k = k;
  st.dim = s.dim;
  stClosed = "";
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
$("st-results").addEventListener("click", e => {
  const d = e.target.closest("button[data-dim]");
  if (d) {
    st.dim = d.dataset.dim;
    st.k = st.kind = st.box = "";
    st.section = "mobs";
    renderStructures();
    return refocus(`#st-tab-mobs`);
  }
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
  const drop = e.target.closest("button[data-open]");
  if (drop) {
    const k = drop.dataset.open;
    // Open while it's the one picked: closing it then only hides its kinds.
    if (drop.getAttribute("aria-expanded") === "true") { stOpen.delete(k); if (k === st.k) stClosed = k; } else { stOpen.add(k); stClosed = ""; }
    renderStResult();
    return refocus(`#st-drop-${k}`);
  }
  const box = e.target.closest("button[data-box]");
  if (box) {
    st.box = box.dataset.box;
    renderStResult();
    saveSt();
    return refocus(`#st-section button[data-box="${st.box}"]`);
  }
  const s = e.target.closest("button[data-pick]");
  if (s) {
    const kind = s.dataset.kind || "";
    pickStructure(s.dataset.pick, { kind, section: "loot" });
    return refocus(kind ? `#st-section button[data-kind="${kind}"]` : `#st-section button[data-pick="${s.dataset.pick}"]`);
  }
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
