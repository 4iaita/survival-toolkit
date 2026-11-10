/* ---------- Villager trades ---------- */
const trade = { villager: "librarian", biome: "plains", query: "" };
const TRADE_KEY = "villager-trades-v1";
try { Object.assign(trade, JSON.parse(localStorage.getItem(TRADE_KEY) || "{}")); } catch (_) {}
if (!VILLAGERS.some(v => v.k === trade.villager)) trade.villager = "librarian";
if (!BIOMES.some(b => b.k === trade.biome)) trade.biome = "plains";
const saveTrade = () => { try { localStorage.setItem(TRADE_KEY, JSON.stringify(trade)); } catch (_) {} };

const villagerView = villagerScene($("villager-art"), $("villager-tag"), { onTurn: () => $("villager-stage").classList.add("turned") });
const backdrop = backdropView($("villager-backdrop"));
const currentVillager = () => VILLAGERS.find(v => v.k === trade.villager);
const currentBiome = () => BIOMES.find(b => b.k === trade.biome);
const villagerName = v => (state.edition === "bedrock" && v.bedrockName) || v.n;
const villagerIcon = v => tradeIcon(VILLAGER_ICON[v.k]).key;
// "One" sounds like "won": a one-horned goat.
const article = word => (/^[AEIOU]/i.test(word) && !/^one/i.test(word) ? "an" : "a");
const isEarn = t => t.gives.name === "Emerald";
const ENCH_NAMES = Object.values(ENCH).map(e => e.n.toLowerCase());
const SUGGESTIONS = ["Mending", "Bell", "Golden Carrot", "Ender Pearl", "Saddle", "Glass"];
const calmMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Amounts as a sentence says them: "20 Wheat", "Bell", "1 Emerald", "5–64 Emeralds".
const amount = it => (it.name === "Emerald"
  ? `${it.count} Emerald${it.count === "1" ? "" : "s"}`
  : `${it.count === "1" ? "" : it.count + " "}${it.name}`);
// A trade from the player's side: Sell 20 Wheat for 1 Emerald, or Buy 6 Bread for 1 Emerald.
function deal(t) {
  const [verb, goods, price] = isEarn(t)
    ? ["Sell", t.wants.map(amount).join(" + "), amount(t.gives)]
    : ["Buy", amount(t.gives), t.wants.map(amount).join(" + ")];
  return { verb, html: `<b>${esc(goods)}</b> for ${esc(price)}` };
}

// Each level is marked with the badge a villager wears on its belt at that level.
const LEVEL_BADGES = ["Stone", "Iron Ingot", "Gold Ingot", "Emerald", "Diamond"];
const levelBadge = (i, tag = "span", attrs = "") =>
  `<${tag} class="badge l${i}"${attrs}>${iconImg(tradeIcon(LEVEL_BADGES[i]).key)}${LEVELS[i]}</${tag}>`;

// Head-and-shoulders pictures of each villager in the current biome, drawn once per biome. Until a
// villager's is ready it keeps the one it showed last (or its item icon), so changing biome doesn't flash.
const BUST_PX = 96, busts = {}, shownBust = {};
const bustSrc = v => busts[`${trade.biome}/${v.k}`] || shownBust[v.k] || icon(villagerIcon(v));
const bustImg = (v, cls = "bust") =>
  `<img class="${cls}" data-bust="${v.k}" src="${bustSrc(v)}" alt="" width="${BUST_PX / 2}" height="${BUST_PX / 2}">`;
async function drawBusts() {
  const biome = trade.biome;
  for (const v of VILLAGERS) {
    const key = `${biome}/${v.k}`;
    if (!(key in busts)) {
      const skin = await villagerSkin(biome, v.k);
      busts[key] = skin && rgbaURL(villagerBust(skin, BUST_PX), BUST_PX, BUST_PX);
      await new Promise(done => setTimeout(done));
    }
    if (trade.biome !== biome) return;
    if (busts[key]) shownBust[v.k] = busts[key];
    for (const img of document.querySelectorAll(`img[data-bust="${v.k}"]`)) img.src = bustSrc(v);
  }
}

// What an item in a trade can turn out to be, or null: list, its kinds; cycle, whether its slot steps
// through them (enchanted things look the same whatever they carry, so they stay still); button, the label
// of the button that shows the list; note, a line above the list.
const inEdition = k => ENCH[k] && (!ENCH[k].only || ENCH[k].only === state.edition);
const enchantKind = k => ({ name: ENCH[k].n, short: ENCH[k].n, icon: `e:${k}` });
const GEAR = /^Enchanted (?:.+ )?(Helmet|Chestplate|Leggings|Boots|Sword|Axe|Pickaxe|Shovel|Bow|Crossbow|Fishing Rod)$/;
function kindsOf(it) {
  if (it.name === "Enchanted Book") {
    const list = Object.keys(ENCH).filter(k => !UNSOLD_BOOKS.includes(k) && inEdition(k))
      .map(k => ({ ...enchantKind(k), detail: ENCH[k].max > 1 ? `I–${ROMAN[ENCH[k].max]}` : "" }));
    return { list, cycle: false, button: `All ${list.length} enchantments`,
      note: "One enchantment, at any of its levels: anything but Soul Speed, Swift Sneak and Wind Burst." };
  }
  const gear = it.name.match(GEAR);
  if (gear) {
    const keys = [...TABLE_ENCHANTS[gear[1]], ...((state.edition === "bedrock" && BEDROCK_TABLE_EXTRA[gear[1]]) || [])];
    const list = keys.filter(inEdition).map(enchantKind);
    return { list, cycle: false, button: `${list.length} possible enchantments`,
      note: "Enchanted like an enchanting table at level 5 to 19: one or more of these, never Mending or another treasure enchantment." };
  }
  const kinds = KINDS[it.name];
  return kinds ? { list: kinds.list, cycle: true, button: `All ${kinds.list.length} ${kinds.noun}`, note: kinds.note } : null;
}
const kindHit = (k, q) => Boolean(q) && k.name.toLowerCase().includes(q);
// The kinds a slot steps through: the ones the search matches, if any; otherwise all of them, starting with
// the kind the villager's biome gives.
function cycleKinds(list, q) {
  const hits = list.filter(k => kindHit(k, q));
  if (hits.length) return hits;
  const first = Math.max(0, list.findIndex(k => k.biomes && k.biomes.includes(trade.biome)));
  return [...list.slice(first), ...list.slice(0, first)];
}

// A trade matches the search by any item name or kind (so an enchantment name finds the gear that can carry it).
function matches(t, q) {
  if (!q) return false;
  const items = [...t.wants, t.gives];
  if (items.some(it => it.name.toLowerCase().includes(q) || (kindsOf(it)?.list || []).some(k => kindHit(k, q)))) return true;
  return t.gives.name === "Enchanted Book" && ENCH_NAMES.some(n => n.includes(q));
}

// An item's slot. For an item that comes in several kinds, the slot steps through them (data-cycle: their
// icon keys); see the timer at the bottom.
function itemSlot(it, q) {
  const { key, glint } = tradeIcon(it.name);
  const count = /^\d+$/.test(it.count) && +it.count > 1 ? `<span class="count">${it.count}</span>` : "";
  const kinds = kindsOf(it);
  if (kinds && kinds.cycle) {
    const keys = cycleKinds(kinds.list, q).map(k => tradeIcon(k.name).key);
    return `<span class="slot sm" data-cycle="${esc(keys.join("|"))}">${iconImg(keys[cycleStep % keys.length])}${count}</span>`;
  }
  return glint
    ? `<span class="slot sm glint" style="--m:url('${icon(key)}')">${iconImg(key)}${count}</span>`
    : `<span class="slot sm">${iconImg(key)}${count}</span>`;
}

// One kind in a trade's list of kinds: its icon and name, the search's matches marked, and for boats the
// biomes that use it, noting the one the picked villager comes from.
function kindChip(k, q) {
  const here = Boolean(k.biomes) && k.biomes.includes(trade.biome);
  const detail = [k.detail, here && "this villager"].filter(Boolean).join(" · ");
  return `<span class="kind${kindHit(k, q) ? " hit" : ""}${here ? " here" : ""}">
    <span class="slot sm">${iconImg(k.icon || tradeIcon(k.name).key)}</span>
    <span class="kind-name">${esc(k.short)}${detail ? `<span class="kind-detail">${esc(detail)}</span>` : ""}</span>
  </span>`;
}

// A trade. id names it (villager, level, place) so a list of its kinds stays open while the page redraws.
const openKinds = new Set();
function tradeRow(t, q, id) {
  const { verb, html } = deal(t);
  const varying = [t.gives, ...t.wants].find(it => kindsOf(it));
  const kinds = varying ? kindsOf(varying) : null, open = Boolean(kinds) && openKinds.has(id);
  const more = kinds
    ? `<button type="button" class="kinds-btn" data-kinds="${id}" aria-expanded="${open}" aria-controls="kinds-${id}">${kinds.button}</button>` : "";
  const noteText = t.note ? esc(t.note[0].toUpperCase() + t.note.slice(1)) : kinds && !kinds.cycle ? "Random enchantments" : "";
  const note = noteText || more ? `<span class="sub">${noteText}${more}</span>` : "";
  const list = kinds ? `<div class="kinds" id="kinds-${id}"${open ? "" : " hidden"}>
    ${kinds.note ? `<p class="kinds-note">${esc(kinds.note)}</p>` : ""}${kinds.list.map(k => kindChip(k, q)).join("")}
  </div>` : "";
  return `
  <li class="trade${matches(t, q) ? " hit" : ""}">
    <div class="trade-slots">${t.wants.map(it => itemSlot(it, q)).join('<span class="op">+</span>')}${iconImg("ui:arrow")}${itemSlot(t.gives, q)}</div>
    <div class="trade-text"><span class="pill ${verb === "Sell" ? "earn" : "buy"}">${verb}</span>${html}${note}</div>
    ${list}
  </li>`;
}

// The villager panel: the scene, the biome hotbar, the profession picker and the job site.
function renderVillagers() {
  const v = currentVillager(), biome = currentBiome(), name = villagerName(v);
  $("villagers").innerHTML = VILLAGERS.map(x => `
    <button type="button" class="prof" id="villager-${x.k}" data-villager="${x.k}" aria-pressed="${x.k === v.k}">
      ${bustImg(x)}<span class="prof-name">${esc(villagerName(x))}<span class="prof-site">${esc(x.site)}</span></span>
    </button>`).join("");
  $("biomes").innerHTML = BIOMES.map(b =>
    `<button type="button" class="slot slot-btn" id="biome-${b.k}" data-biome="${b.k}" data-name="${b.n}" aria-label="${b.n}" aria-pressed="${b.k === biome.k}">${iconImg(`biome:${b.k}`)}</button>`).join("");
  $("biome-name").textContent = biome.n;
  $("villager-tag").textContent = name;
  villagerView.show(biome.k, v.k, v.site);
  $("villager-art").setAttribute("aria-label", `${name} from ${article(biome.n)} ${biome.n.toLowerCase()} village, next to its ${v.site}. Drag or use the arrow keys to turn them.`);
  const stage = $("villager-stage");
  stage.dataset.biome = biome.k;
  stage.style.setProperty("--ground", `url('${groundArt(biome.k)}')`);
  backdrop.show(biome.k);
  const site = ICONS[`site:${v.site}`] ? `site:${v.site}` : null;
  $("villager-site").innerHTML = `${site ? `<span class="slot sm">${iconImg(site)}</span>` : ""}
    <span>Job site: <b>${esc(v.site)}</b>. An unemployed villager that claims one becomes ${article(name)} ${esc(name)}.</span>`;
}

function renderTradeResult() {
  const v = currentVillager();
  const q = trade.query.trim().toLowerCase();
  const all = v.trades.flat(), earn = all.filter(isEarn).length;
  const offers = list => list.length === 1 ? "One trade" : list.length === 2 ? "Offers both"
    : state.edition === "java" ? `Offers 2 of these ${list.length} at random` : `Offers some of these ${list.length} at random`;
  $("trade-result").innerHTML = `
    <div class="res-top">
      <div class="res-title">${bustImg(v, "bust lg")}
        <div><h2>${esc(villagerName(v))}</h2><div class="res-sub">${state.edition === "java" ? "Java" : "Bedrock"} Edition trades</div></div>
      </div>
      <p class="compare">${esc(v.tip)}</p>
      <div class="mini">
        <span>Trades <b>${all.length}</b></span>
        <span>Pay you emeralds <b>${earn}</b></span>
        <span>Sell you goods <b>${all.length - earn}</b></span>
      </div>
      <div class="level-nav" role="group" aria-labelledby="level-nav-label">
        <span class="cat-label" id="level-nav-label">Jump to</span>${LEVELS.map((_, i) => levelBadge(i, "button", ` type="button" data-level="${i}"`)).join("")}
      </div>
    </div>
    ${v.trades.map((list, i) => `
      <section class="lvl" id="trade-level-${i}">
        <div class="lvl-head">${levelBadge(i, "h3")}<span class="lvl-note">${offers(list)}</span></div>
        <ul class="trades">${list.map((t, j) => tradeRow(t, q, `${v.k}-${i}-${j}`)).join("")}</ul>
      </section>`).join("")}`;
}

function renderSearch() {
  const q = trade.query.trim().toLowerCase();
  const box = $("trade-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Matches from every villager show here as you type. Or try one of these:</p>
      <div class="suggest">${SUGGESTIONS.map(s => `<button type="button" class="mc-btn sm" data-suggest="${s}">${s}</button>`).join("")}</div>`;
    return;
  }
  const hits = [];
  for (const v of VILLAGERS) v.trades.forEach((list, i) => list.forEach(t => { if (matches(t, q)) hits.push({ v, i, t }); }));
  const enchNote = ENCH_NAMES.some(n => n.includes(q))
    ? `<p class="choice-hint">Enchantments come on random Enchanted Books from Librarians, so keep rerolling a novice Librarian’s lectern until the one you want shows up.</p>` : "";
  box.innerHTML = enchNote + (hits.length
    ? hits.slice(0, 25).map(h => {
      const { verb, html } = deal(h.t);
      return `
        <button type="button" class="search-hit" data-villager="${h.v.k}" data-level="${h.i}">
          ${bustImg(h.v)}
          <span><span class="who">${esc(villagerName(h.v))}<span class="lvl-note">${LEVELS[h.i]}</span></span><span class="deal">${verb} ${html}</span></span>
        </button>`;
    }).join("") + (hits.length > 25 ? `<p class="choice-hint">And ${hits.length - 25} more. Type more of the name to narrow it down.</p>` : "")
    : `<p class="choice-hint">No villager trades anything called “${esc(trade.query.trim())}”.</p>`);
}

function renderTrades() {
  renderVillagers();
  renderTradeResult();
  renderSearch();
  saveTrade();
}

// Scroll a level's trades into view and flash them.
function showLevel(i) {
  const lvl = $(`trade-level-${i}`);
  if (!lvl) return;
  lvl.scrollIntoView({ block: "start", behavior: calmMotion() ? "auto" : "smooth" });
  lvl.classList.remove("flash");
  void lvl.offsetWidth;
  lvl.classList.add("flash");
}

function setQuery(text) {
  trade.query = text;
  renderTradeResult();
  renderSearch();
  saveTrade();
}

$("villagers").addEventListener("click", e => {
  const b = e.target.closest("button[data-villager]");
  if (!b) return;
  trade.villager = b.dataset.villager;
  renderTrades();
  refocus(`#villager-${trade.villager}`);
});
$("biomes").addEventListener("click", e => {
  const b = e.target.closest("button[data-biome]");
  if (!b) return;
  trade.biome = b.dataset.biome;
  renderVillagers();
  drawBusts();
  saveTrade();
  refocus(`#biome-${trade.biome}`);
});
$("trade-result").addEventListener("click", e => {
  const b = e.target.closest("button[data-level]");
  if (b) return showLevel(+b.dataset.level);
  const more = e.target.closest("button[data-kinds]");
  if (!more) return;
  const id = more.dataset.kinds, open = !openKinds.has(id);
  if (open) openKinds.add(id);
  else openKinds.delete(id);
  more.setAttribute("aria-expanded", open);
  $(`kinds-${id}`).hidden = !open;
});
$("trade-results").addEventListener("click", e => {
  const s = e.target.closest("button[data-suggest]");
  if (s) {
    $("trade-search").value = s.dataset.suggest;
    setQuery(s.dataset.suggest);
    return;
  }
  const b = e.target.closest("button[data-villager]");
  if (!b) return;
  trade.villager = b.dataset.villager;
  renderTrades();
  showLevel(+b.dataset.level);
});
$("trade-search").addEventListener("input", e => setQuery(e.target.value));
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderTrades(); });

// Slots of items that come in several kinds step through them together, unless the reader asks for less motion.
const CYCLE_MS = 1400;
let cycleStep = 0;
setInterval(() => {
  if (calmMotion() || document.hidden || $("view-trading").hidden) return;
  cycleStep++;
  for (const slot of $("trade-result").querySelectorAll("[data-cycle]")) {
    const keys = slot.dataset.cycle.split("|");
    slot.querySelector("img").src = icon(keys[cycleStep % keys.length]);
  }
}, CYCLE_MS);

$("trade-search").value = trade.query;
renderTrades();
drawBusts();
