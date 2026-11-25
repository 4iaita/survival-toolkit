/* ---------- Equipment ----------
 * Every item the enchantments go on (ITEMS in src/solver.js), in any material it comes in; its anvil plan is one of its sections
 * (src/anvil-ui.js). The picked item is the plan's (state.item), so both are always about the same one.
 */
// The material picked (an item without it shows in diamond), the picker's order, and which section shows (GEAR_SECTIONS).
const gear = { mat: "diamond", order: "kind", section: "about", query: "" };
const GEAR_KEY = "equipment-v1";
try { Object.assign(gear, JSON.parse(localStorage.getItem(GEAR_KEY) || "{}")); } catch (_) {}
if (!MATERIALS[gear.mat]) gear.mat = "diamond";
if (!["kind", "az"].includes(gear.order)) gear.order = "kind";
const saveGear = () => { try { localStorage.setItem(GEAR_KEY, JSON.stringify(gear)); } catch (_) {} };

// Icons: an item in each material, what it's made of, and the mobs it comes from (the other sources are potion-ui.js's).
const setIcon = (key, spec, fallback) => { ICONS[key] = artReady(spec) ? spec : ICONS[fallback]; };
for (const [k, mats] of Object.entries(GEAR_MATS)) for (const m of mats) setIcon(`g:${m}_${k}`, L(m === "diamond" && k === "spear" ? "spear" : `${m}_${k}`), k);
for (const [k, part] of Object.entries(GEAR_PARTS)) setIcon(`part:${k}`, part.icon, "ui:book");
setIcon("ui:crafting", C("crafting_table_front", "crafting_table_top", "crafting_table_side"), "ui:book");
for (const m of ["zombie", "skeleton", "drowned", "pillager", "vindicator", "piglin_brute", "wither_skeleton", "zombified_piglin"]) setIcon(`src:${m}`, L(`egg_${m}`), "ui:mob");

const gearMat = item => (!GEAR_MATS[item.k] ? null : GEAR_MATS[item.k].includes(gear.mat) ? gear.mat : "diamond");
const gearName = (item, mat = gearMat(item)) => (!mat ? item.n : GEAR_NAMES[`${mat}_${item.k}`] || `${MATERIALS[mat].n} ${item.n}`);
const gearIcon = (item, mat = gearMat(item)) => (mat ? `g:${mat}_${item.k}` : item.k);
const isArmor = item => ARMOR_PIECES.includes(item.k);
// Durability in the edition picked, and enchantability (0: the enchanting table won't take it).
function gearUses(item, mat = gearMat(item)) {
  if (state.edition === "bedrock" && BEDROCK_USES[item.k]) return BEDROCK_USES[item.k];
  const uses = !mat ? GEAR_USES[item.k][0] : isArmor(item) ? ARMOR_TIERS[mat].uses[ARMOR_PIECES.indexOf(item.k)] : TOOL_TIERS[mat].uses;
  return uses + (state.edition === "bedrock" ? 1 : 0);
}
const gearEnch = (item, mat = gearMat(item)) => (!mat ? GEAR_USES[item.k][1] : (isArmor(item) ? ARMOR_TIERS : TOOL_TIERS)[mat].ench);
const enchWord = n => (n >= 20 ? "Very high" : n >= 14 ? "High" : n >= 9 ? "Average" : n > 1 ? "Low" : "The lowest");
// Attack damage and, in Java, hits a second, of a tool in a material.
const gearHit = (k, mat) => TOOL_HITS[k][state.edition][TOOL_ORDER.indexOf(mat)];
const gearRate = (k, mat) => [TOOL_HITS[k].rate].flat()[Array.isArray(TOOL_HITS[k].rate) ? TOOL_ORDER.indexOf(mat) : 0];
// Damage in hearts: 5 is "2½ hearts".
const inHearts = n => {
  const whole = Math.floor(n / 2), part = { 0: "", 0.25: "¼", 0.5: "½", 0.75: "¾" }[n / 2 - whole];
  return `${whole || ""}${part} heart${n > 2 ? "s" : ""}`;
};
const commas = n => n.toLocaleString("en-US");

/* The stage */
const gearStage = $("gear-stage");
const gearView = itemScene($("gear-art"), { onTurn: () => gearStage.classList.add("turned") });
gearStage.style.setProperty("--ground", `url('${groundArt("plains")}')`);
function showGear() {
  const item = currentItem();
  gearView.show(gearIcon(item));
  $("gear-art").setAttribute("aria-label", `${gearName(item)}. Drag or use the arrow keys to turn it.`);
}

function renderMats() {
  const item = currentItem(), mats = GEAR_MATS[item.k];
  $("gear-mat-bar").hidden = !mats;
  $("gear-mat").innerHTML = (mats || []).map(m => `<button type="button" class="name-chip" data-mat="${m}" aria-pressed="${m === gearMat(item)}">${iconImg(gearIcon(item, m))}${MATERIALS[m].n}</button>`).join("");
}

function renderGearPicker() {
  const slots = list => `<div class="slot-grid">${list.map(i =>
    `<button type="button" class="slot slot-btn" id="item-${i.k}" data-item="${i.k}" data-name="${esc(i.n)}" aria-label="${esc(i.n)}" aria-pressed="${i.k === state.item}">${iconImg(gearIcon(i))}</button>`).join("")}</div>`;
  $("gear-order").value = gear.order;
  $("gear-picker").innerHTML = gear.order === "az"
    ? slots([...ITEMS].sort((a, b) => a.n.localeCompare(b.n)))
    : [...new Set(ITEMS.map(i => i.cat))].map(c => `
    <div>
      <div class="cat-label">${c}</div>
      ${slots(ITEMS.filter(i => i.cat === c))}
    </div>`).join("");
  $("gear-name").textContent = gearName(currentItem());
}

/* The sections */
const GEAR_SECTIONS = [["about", "Overview"], ["materials", "Materials"], ["enchants", "Enchantments"], ["anvil", "Anvil plan"], ["craft", "Crafting"], ["repair", "Repair"], ["find", "Where to find"]];
const gearSections = item => GEAR_SECTIONS.filter(([s]) => s !== "materials" || GEAR_MATS[item.k]);
const shownGearSection = item => (gearSections(item).some(([s]) => s === gear.section) ? gear.section : "about");
const gearSectionIcon = (s, item) => ({ about: gearIcon(item), materials: "part:iron", enchants: "ui:enchant", anvil: "ui:anvil", craft: "ui:crafting", repair: "site:Grindstone", find: "src:chest" }[s]);
const gearHead = (s, item, note = "") => sectionHead("gear-section-title", gearSectionIcon(s, item), GEAR_SECTIONS.find(([k]) => k === s)[1], note);
const gearRow = (slot, name, sub, end = "") => `<li class="item-row">${slot}<span class="item-name">${name}${sub ? `<span class="sub">${sub}</span>` : ""}</span>${end}</li>`;
const partRow = (k, count = 0) => gearRow(plainSlot(`part:${k}`, "sm"), esc(GEAR_PARTS[k].n), esc(GEAR_PARTS[k].from), count ? `<span class="item-count">${count}</span>` : "");

// Overview: four boxes, then the facts.
function gearStats(item, mat) {
  const k = item.k, ench = gearEnch(item, mat);
  const last = [["Durability", commas(gearUses(item, mat)), ""], ["Enchantability", ench || "None", ench ? enchWord(ench) : "Only books, on an anvil"]];
  if (!mat) return [...GEAR_INFO[k].stats, ...last];
  if (isArmor(item)) {
    const t = ARMOR_TIERS[mat];
    return [["Armor", t.points[ARMOR_PIECES.indexOf(k)], `${t.points.reduce((a, b) => a + b)} in a full set`],
      ["Toughness", t.tough, t.tough ? `${4 * t.tough} in a full set` : "Diamond and netherite have it"], ...last];
  }
  const hit = ["Attack damage", gearHit(k, mat), inHearts(gearHit(k, mat))], rate = gearRate(k, mat);
  if (item.cat === "Tools") return [["Mining speed", `×${TOOL_TIERS[mat].speed}`, "Times the speed by hand"], hit, ...last];
  return [hit, state.edition === "java" ? ["Attack speed", rate, "Hits a second"]
    : k === "spear" ? ["Attack speed", `${+(1 / rate).toFixed(2)} s`, "Between jabs"] : ["Attack speed", "Any", "No cooldown"], ...last];
}
function gearAbout(item, mat) {
  const info = GEAR_INFO[item.k];
  const stat = ([label, value, sub]) => {
    const v = String(forEdition(value));
    return `<div class="mob-stat${v.length > 9 ? " text" : ""}"><span class="stat-label">${label}</span><span class="stat-value">${esc(v)}</span>${sub ? `<span class="sub">${esc(forEdition(sub))}</span>` : ""}</div>`;
  };
  return `${gearHead("about", item)}
    <div class="mob-stats">${gearStats(item, mat).map(stat).join("")}</div>
    <dl class="fact-list">
      ${potionFact("Good for", forEdition(info.good))}
      ${mat ? potionFact(MATERIALS[mat].n, MATERIALS[mat][isArmor(item) ? "armor" : "tool"]) : ""}
      ${item.k === "pickaxe" ? potionFact("Mines", TOOL_TIERS[mat].mines) : ""}
      ${item.k === "axe" ? potionFact("Mining speed", `${TOOL_TIERS[mat].speed} times as fast as by hand`) : ""}
      ${item.k === "spear" ? potionFact("Charge", `The damage grows with your speed toward the target, times ${SPEAR_CHARGE[TOOL_ORDER.indexOf(mat)]}${state.edition === "java" ? ". Under 4.6 blocks a second it does none" : ""}`) : ""}
      ${potionFact("Good to know", forEdition(info.about))}
      ${potionFact("Wears", forEdition(info.wears))}
    </dl>`;
}

// Materials: how it compares in each. Each is a button that picks it.
function gearMaterials(item, mat) {
  const k = item.k, java = state.edition === "java", mats = GEAR_MATS[k], i = ARMOR_PIECES.indexOf(k);
  const cols = [
    ...(i >= 0 ? [["Armor", m => ARMOR_TIERS[m].points[i]], ["Toughness", m => ARMOR_TIERS[m].tough || "–"]] : []),
    ...(i < 0 && item.cat === "Tools" ? [["Speed", m => `×${TOOL_TIERS[m].speed}`]] : []),
    ...(i < 0 ? [["Damage", m => gearHit(k, m)]] : []),
    ...(i < 0 && java && item.cat !== "Tools" ? [["Hits / s", m => gearRate(k, m)]] : []),
    ...(k === "axe" ? [["Mining", m => `×${TOOL_TIERS[m].speed}`]] : []),
    ["Durability", m => commas(gearUses(item, m))], ["Enchanting", m => gearEnch(item, m)],
  ];
  return `${gearHead("materials", item, plural(mats.length, "material"))}
    <table class="mat-table">
      <thead><tr><td></td>${cols.map(([c]) => `<th scope="col">${c}</th>`).join("")}</tr></thead>
      <tbody>${mats.map(m => `<tr${m === mat ? ' class="on"' : ""}><th scope="row"><button type="button" class="mat-btn" data-mat="${m}" aria-pressed="${m === mat}">${iconImg(gearIcon(item, m))}<span>${MATERIALS[m].n}${
        k === "pickaxe" ? `<span class="sub">${esc(TOOL_TIERS[m].mines)}</span>` : ""}</span></button></th>${cols.map(([, v]) => `<td>${v(m)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    <dl class="fact-list">${mats.map(m => potionFact(MATERIALS[m].n, MATERIALS[m][i >= 0 ? "armor" : "tool"])).join("")}</dl>`;
}

// Enchantments: all that go on it, by where they come from.
function gearEnchants(item) {
  const keys = enchantsFor(item, state.edition);
  const groups = [["table", "From the enchanting table"], ["book", "Only with a book, on an anvil"], ["treasure", "Treasure: never from the enchanting table"]]
    .map(([from, label]) => ({ label, list: keys.filter(k => enchantFrom(item.k, k, state.edition) === from) })).filter(g => g.list.length);
  const row = k => {
    const e = ENCH[k], not = keys.filter(o => conflicts(o, k)).map(o => ENCH[o].n);
    return gearRow(plainSlot(`e:${k}`, "sm"), `<span${e.curse ? ' class="curse-name"' : ""}>${esc(e.n)}</span>`,
      `${esc(forEdition(ENCH_DOES[k]))}.${not.length ? ` Not with ${esc(not.join(", "))}.` : ""}${TREASURE[k] ? ` <b>${esc(TREASURE[k])}</b>` : ""}`,
      `<span class="item-count">${e.max > 1 ? `I–${ROMAN[e.max]}` : "I"}</span>`);
  };
  return `${gearHead("enchants", item, plural(keys.length, "enchantment"))}
    ${groups.map(g => `<div class="cat-label gear-label">${g.label}</div><ul class="item-list wide">${g.list.map(row).join("")}</ul>`).join("")}`;
}

// Crafting: its recipe, or the smithing table's upgrade, and what goes in.
function gearCraft(item, mat) {
  const none = NO_RECIPE[mat === "chainmail" ? mat : item.k], out = plainSlot(gearIcon(item, mat));
  if (none) return `${gearHead("craft", item, "Can’t be crafted")}<p class="mob-lead">${none}</p>`;
  if (mat === "netherite") {
    return `${gearHead("craft", item, "Smithing table")}
      <div class="smith-row">${plainSlot("part:template")}<span class="op">+</span>${plainSlot(gearIcon(item, "diamond"))}<span class="op">+</span>${plainSlot("part:netherite")}${iconImg("ui:arrow")}${out}</div>
      <p class="mob-lead">Upgrade the diamond one on a smithing table. It keeps its enchantments, its name and how worn it is.</p>
      <div class="cat-label gear-label">You need</div>
      <ul class="item-list wide">${partRow("template", 1)}${gearRow(plainSlot(gearIcon(item, "diamond"), "sm"), esc(gearName(item, "diamond")), "Crafted, or found", '<span class="item-count">1</span>')}${partRow("netherite", 1)}</ul>`;
  }
  const { rows, key = {}, loose } = GEAR_RECIPES[item.k], part = c => (c === "/" ? "stick" : c === "m" ? MATERIALS[mat].part : key[c]);
  const cells = [0, 1, 2].flatMap(y => [0, 1, 2].map(x => ((rows[y] || "")[x] || " ").trim())), counts = {};
  for (const c of cells) if (c) counts[part(c)] = (counts[part(c)] || 0) + 1;
  return `${gearHead("craft", item, "Crafting table")}
    <div class="arrow-craft"><div class="craft-grid">${cells.map(c => (c ? plainSlot(`part:${part(c)}`, "sm") : '<span class="slot sm"></span>')).join("")}</div>${iconImg("ui:arrow")}${out}</div>
    ${loose ? `<p class="mob-lead">Anywhere in the grid: the places don’t matter.</p>` : ""}
    <div class="cat-label gear-label">You need</div>
    <ul class="item-list wide">${Object.entries(counts).map(([k, n]) => partRow(k, n)).join("")}</ul>`;
}

// Repair: each way to mend it, with how much it gives back.
function gearRepair(item, mat) {
  const full = gearUses(item, mat), unit = mat ? MATERIALS[mat].part : GEAR_MENDS[item.k];
  const share = part => commas(Math.floor(full * part));
  return `${gearHead("repair", item, `Durability ${commas(full)}`)}
    <ul class="item-list wide">
      ${unit ? gearRow(plainSlot(`part:${unit}`, "sm"), esc(GEAR_PARTS[unit].n), "On an anvil: 1 level each, plus the item’s penalty. Four mend it whole", `<span class="item-count">+${share(MEND_UNIT)}</span>`) : ""}
      ${gearRow(plainSlot(gearIcon(item, mat), "sm"), "A second one, on an anvil", `2 levels, plus both penalties. Adds what it has left and ${share(MEND_SAME)} more. Its enchantments come along, for their own cost`)}
      ${gearRow(plainSlot("site:Grindstone", "sm"), "Two worn ones, in a grindstone", `Free. Adds up what both have left and ${share(MEND_GRID)} more. Enchantments are lost (curses stay) for some XP back, and the anvil penalty with them`)}
      ${gearRow(plainSlot("ui:crafting", "sm"), "Two worn ones, in a crafting grid", "Free. The same, with no XP back")}
      ${gearRow(glintSlot("e:mending", "sm"), "Mending", `The XP you pick up, 2 durability a point: ${commas(Math.ceil(full / 2))} points from worn out to new`)}
    </ul>
    <dl class="fact-list">
      ${unit ? "" : potionFact("On an anvil", "No material mends it: only another one does.")}
      ${potionFact("Penalty", "A new item has none. After each anvil job it’s 1, 3, 7, 15, then 31 levels. A job of 40 levels or more is refused.")}
      ${potionFact("The anvil", "Each job has a 12% chance of damaging it, so it lasts about 25.")}
    </dl>`;
}

// Where to find: the places and mobs that have it ready-made, and who sells it.
function gearSales(name) {
  const sold = (t, icon, who) => ([name, `Enchanted ${name}`].includes(t.gives.name)
    ? [{ icon, n: who, what: `${t.wants.map(amount).join(" + ")}${t.gives.name === name ? (t.note ? `, ${t.note}` : "") : ", enchanted"}` }] : []);
  return [...VILLAGERS.flatMap(v => v.trades.flatMap((list, i) => list.flatMap(t => sold(t, `site:${v.site}`, `${villagerName(v)}, ${LEVELS[i].toLowerCase()}`)))),
    ...MOB_TRADES.wandering_trader.pools.flatMap(p => p.trades.map(parseTrade).flatMap(t => sold({ ...t, note: "" }, "src:trader", "Wandering trader")))];
}
function gearFind(item, mat) {
  // Places first, the likeliest first, then the mobs.
  const place = x => ["src:chest", "src:vault", "src:end"].includes(x.icon), likely = x => parseFloat(forEdition(x.chance)) || 0;
  const found = (GEAR_FOUND[item.k] || []).filter(x => (!x.ed || x.ed === state.edition) && (!x.mats || x.mats.includes(mat)))
    .sort((a, b) => place(b) - place(a) || likely(b) - likely(a));
  const sales = gearSales(gearName(item, mat)), n = found.length + sales.length;
  const list = (label, rows) => (rows.length ? `<div class="cat-label gear-label">${label}</div><ul class="item-list wide">${rows.map(x => sourceRow({ ...x, what: forEdition(x.what) })).join("")}</ul>` : "");
  const none = mat === "netherite" ? "Nothing has it ready-made: upgrade the diamond one." : "It isn’t found anywhere ready-made: craft it.";
  return `${gearHead("find", item, n ? plural(n, "place") : mat === "netherite" ? "Only by upgrading" : "Only by crafting")}
    ${n ? list("Found", found) + list("Sold by", sales) : `<p class="mob-lead gear-none">${esc(none)}</p>`}`;
}

function renderGearResult() {
  const item = currentItem(), mat = gearMat(item), on = shownGearSection(item), name = gearName(item);
  const body = { about: gearAbout, materials: gearMaterials, enchants: gearEnchants, craft: gearCraft, repair: gearRepair, find: gearFind,
    anvil: () => `${gearHead("anvil", item, `${state.edition === "java" ? "Java" : "Bedrock"} Edition`)}${anvilSection()}` }[on](item, mat);
  $("gear-result").innerHTML = `
    <div class="res-top">
      <div class="res-title"><span class="slot">${iconImg(gearIcon(item))}</span>
        <div><h2>${esc(name)}</h2><div class="res-sub">${state.edition === "java" ? "Java" : "Bedrock"} Edition</div></div>
      </div>
    </div>
    <div class="mob-tabs" role="tablist" aria-label="${esc(name)}">
      ${gearSections(item).map(([k, title]) => `<button type="button" class="mob-tab" role="tab" id="gear-tab-${k}" data-section="${k}"
        aria-selected="${k === on}" aria-controls="gear-section" tabindex="${k === on ? 0 : -1}">${iconImg(gearSectionIcon(k, item))}${title}</button>`).join("")}
    </div>
    <section class="mob-section" id="gear-section" role="tabpanel" aria-labelledby="gear-tab-${on}">${body}</section>`;
  if (on === "anvil") renderAnvil();
}

// Search: items by name (with a material or without), or by an enchantment that goes on them.
function renderGearSearch() {
  const q = gear.query.trim().toLowerCase(), box = $("gear-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type part of an item’s name, a material or an enchantment, then pick it from the list.</p>`;
    return;
  }
  const has = s => s.toLowerCase().includes(q);
  const hits = ITEMS.flatMap(item => {
    const mat = gearMat(item), mats = GEAR_MATS[item.k] || [], ench = enchantsFor(item, state.edition).find(k => has(ENCH[k].n));
    const note = mats.length ? plural(mats.length, "material") : item.cat;
    if (has(item.n) || has(gearName(item))) return [{ item, mat, rank: 0, why: `${item.cat} · ${note}` }];
    const named = mats.filter(m => has(gearName(item, m)));
    if (named.length) return named.map(m => ({ item, mat: m, rank: 1, why: item.cat }));
    return ench ? [{ item, mat, rank: 2, why: `Can have ${ENCH[ench].n}` }] : [];
  }).sort((a, b) => a.rank - b.rank);
  box.innerHTML = hits.length
    ? hits.map(({ item, mat, why }) => `
      <button type="button" class="search-hit" data-item="${item.k}" data-mat="${mat || ""}"${item.k === state.item && mat === gearMat(item) ? ' aria-current="true"' : ""}>
        <span class="slot sm">${iconImg(gearIcon(item, mat))}</span>
        <span><span class="who">${esc(gearName(item, mat))}</span><span class="deal">${esc(why)}</span></span>
      </button>`).join("")
    : `<p class="choice-hint">No equipment has anything like “${esc(gear.query.trim())}”.</p>`;
}

function renderGear() {
  sanitizePicked();
  renderGearPicker();
  renderMats();
  renderGearResult();
  renderGearSearch();
  showGear();
  save();
  saveGear();
}

// Picks an item, in a material if one is given; another item starts its plan over with a full set.
function pickGear(k, mat) {
  if (!ITEMS.some(i => i.k === k)) return;
  if (mat && MATERIALS[mat]) gear.mat = mat;
  if (k !== state.item) {
    gearView.turnBack();
    state.item = k;
    state.picked = fullSet(currentItem(), state.edition);
  }
  renderGear();
}
$("gear-picker").addEventListener("click", e => {
  const b = e.target.closest("button[data-item]");
  if (!b || b.dataset.item === state.item) return;
  pickGear(b.dataset.item);
  refocus(`#item-${state.item}`);
});
$("gear-results").addEventListener("click", e => {
  const b = e.target.closest("button[data-item]");
  if (!b) return;
  pickGear(b.dataset.item, b.dataset.mat);
  refocus(`#gear-results button[data-item="${state.item}"][data-mat="${b.dataset.mat}"]`);
});
$("gear-order").addEventListener("change", e => { gear.order = e.target.value; renderGearPicker(); saveGear(); });
$("gear-search").addEventListener("input", e => { gear.query = e.target.value; renderGearSearch(); saveGear(); });
// The material buttons, under the stage and in the Materials table.
for (const id of ["gear-mat", "gear-result"]) $(id).addEventListener("click", e => {
  const b = e.target.closest("button[data-mat]");
  if (!b) return;
  pickGear(state.item, b.dataset.mat);
  refocus(`#${id} button[data-mat="${b.dataset.mat}"]`);
});
const pickGearSection = k => {
  gear.section = k;
  renderGearResult();
  saveGear();
  refocus(`#gear-tab-${k}`);
};
$("gear-result").addEventListener("click", e => {
  const tab = e.target.closest("button[data-section]");
  if (tab) pickGearSection(tab.dataset.section);
});
$("gear-result").addEventListener("keydown", e => {
  if (!e.target.closest("[role=tab]")) return;
  const list = gearSections(currentItem()), i = list.findIndex(([k]) => k === shownGearSection(currentItem())), n = list.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickGearSection(list[to % n][0]);
});
$("gear-result").addEventListener("toggle", e => { if (e.target.matches(".tag-rules")) anvilRulesOpen = e.target.open; }, true);
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderGear(); });

$("gear-search").value = gear.query;
renderGear();

// The Anvil Planner is a section of this tab: an old bookmark of it (#anvil) opens that.
function openAnvil() {
  if (location.hash !== "#anvil") return;
  history.replaceState(null, "", "#equipment");
  showView();
  gear.section = "anvil";
  renderGearResult();
  saveGear();
}
window.addEventListener("hashchange", openAnvil);
openAnvil();
