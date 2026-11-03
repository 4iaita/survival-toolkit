/* ---------- Villager trades ---------- */
const trade = { villager: "librarian", biome: "plains", query: "" };
const TRADE_KEY = "villager-trades-v1";
try { Object.assign(trade, JSON.parse(localStorage.getItem(TRADE_KEY) || "{}")); } catch (_) {}
if (!VILLAGERS.some(v => v.k === trade.villager)) trade.villager = "librarian";
if (!BIOMES.some(b => b.k === trade.biome)) trade.biome = "plains";

const currentVillager = () => VILLAGERS.find(v => v.k === trade.villager);
const villagerName = v => (state.edition === "bedrock" && v.bedrockName) || v.n;
const villagerIcon = v => tradeIcon(VILLAGER_ICON[v.k]).key;
const isEarn = t => t.gives.name === "Emerald";
const itemText = it => `${it.count === "1" ? "" : it.count + " "}${it.name}`;
const dealText = t => `${t.wants.map(itemText).join(" + ")} → ${itemText(t.gives)}`;
const ENCH_NAMES = Object.values(ENCH).map(e => e.n.toLowerCase());

// A trade matches the search by any item name; enchantment names match the librarian's random books.
function matches(t, q) {
  if (!q) return false;
  if ([...t.wants, t.gives].some(it => it.name.toLowerCase().includes(q))) return true;
  return t.gives.name === "Enchanted Book" && ENCH_NAMES.some(n => n.includes(q));
}

function itemSlot(it) {
  const { key, glint } = tradeIcon(it.name);
  const count = /^\d+$/.test(it.count) && +it.count > 1 ? `<span class="count">${it.count}</span>` : "";
  return glint
    ? `<span class="slot sm glint" style="--m:url('${icon(key)}')">${iconImg(key)}${count}</span>`
    : `<span class="slot sm">${iconImg(key)}${count}</span>`;
}

const tradeRow = (t, q) => `
  <li class="trade${matches(t, q) ? " hit" : ""}">
    <div class="trade-slots">${t.wants.map(itemSlot).join('<span class="op">+</span>')}${iconImg("ui:arrow")}${itemSlot(t.gives)}</div>
    <div class="trade-text"><span class="pill ${isEarn(t) ? "earn" : "buy"}">${isEarn(t) ? "Sell" : "Buy"}</span>${esc(dealText(t))}${t.note ? `<span class="sub">${esc(t.note[0].toUpperCase() + t.note.slice(1))}</span>` : ""}</div>
  </li>`;

function renderVillagers() {
  const v = currentVillager();
  $("villagers").innerHTML = VILLAGERS.map(x =>
    `<button type="button" class="slot slot-btn" id="villager-${x.k}" data-villager="${x.k}" data-name="${esc(villagerName(x))}" aria-label="${esc(villagerName(x))}" aria-pressed="${x.k === v.k}">${iconImg(villagerIcon(x))}</button>`).join("");
  $("villager-name").textContent = villagerName(v);
  $("villager-site").textContent = v.site;
  $("biomes").innerHTML = BIOMES.map(b =>
    `<button type="button" class="slot slot-btn biome" id="biome-${b.k}" data-biome="${b.k}" data-name="${b.n}" aria-label="${b.n}" aria-pressed="${b.k === trade.biome}">${iconImg(`biome:${b.k}`)}</button>`).join("");
  const biome = BIOMES.find(b => b.k === trade.biome);
  $("villager-art").src = villagerArt(biome.k, v.k);
  $("villager-art").alt = `${biome.n} ${villagerName(v)}`;
  const block = $("villager-block");
  block.hidden = !ICONS[`site:${v.site}`];
  if (!block.hidden) block.src = icon(`site:${v.site}`);
  block.alt = v.site;
  $("villager-stage").style.setProperty("--ground", `url('${groundArt(biome.k)}')`);
}

function renderTradeResult() {
  const v = currentVillager();
  const q = trade.query.trim().toLowerCase();
  const all = v.trades.flat();
  const offers = list => list.length <= 2 ? "Offers both"
    : state.edition === "java" ? `Offers 2 of these ${list.length} at random` : `Offers some of these ${list.length} at random`;
  $("trade-result").innerHTML = `
    <div class="res-top">
      <div class="res-title">${iconImg(villagerIcon(v))}<h2>${esc(villagerName(v))} · ${state.edition === "java" ? "Java" : "Bedrock"}</h2></div>
      <p class="compare">${esc(v.tip)}</p>
      <div class="mini">
        <span>Job site <b>${esc(v.site)}</b></span>
        <span>Trades <b>${all.length}</b></span>
        <span>Pay you emeralds <b>${all.filter(isEarn).length}</b></span>
      </div>
    </div>
    ${v.trades.map((list, i) => `
      <section class="lvl">
        <div class="lvl-head"><span class="badge l${i}">${LEVELS[i]}</span><span class="lvl-note">${list.length === 1 ? "One trade" : offers(list)}</span></div>
        <ul class="trades">${list.map(t => tradeRow(t, q)).join("")}</ul>
      </section>`).join("")}`;
}

function renderSearch() {
  const q = trade.query.trim().toLowerCase();
  const box = $("trade-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Matches from every villager show here as you type.</p>`;
    return;
  }
  const hits = [];
  for (const v of VILLAGERS) v.trades.forEach((list, i) => list.forEach(t => { if (matches(t, q)) hits.push({ v, i, t }); }));
  const enchNote = ENCH_NAMES.some(n => n.includes(q))
    ? `<p class="choice-hint">Enchantments come on random Enchanted Books from Librarians, so keep rerolling a novice Librarian’s lectern until the one you want shows up.</p>` : "";
  box.innerHTML = enchNote + (hits.length
    ? hits.slice(0, 25).map(h => `
        <button type="button" class="search-hit" data-villager="${h.v.k}">
          ${iconImg(villagerIcon(h.v))}
          <span><span class="who">${esc(villagerName(h.v))} · ${LEVELS[h.i]}</span><br><span class="deal">${esc(dealText(h.t))}</span></span>
        </button>`).join("") + (hits.length > 25 ? `<p class="choice-hint">And ${hits.length - 25} more. Type more of the name to narrow it down.</p>` : "")
    : `<p class="choice-hint">No villager trades anything called “${esc(trade.query.trim())}”.</p>`);
}

function renderTrades() {
  renderVillagers();
  renderTradeResult();
  renderSearch();
  try { localStorage.setItem(TRADE_KEY, JSON.stringify(trade)); } catch (_) {}
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
  try { localStorage.setItem(TRADE_KEY, JSON.stringify(trade)); } catch (_) {}
  refocus(`#biome-${trade.biome}`);
});
$("trade-results").addEventListener("click", e => {
  const b = e.target.closest("button[data-villager]");
  if (!b) return;
  trade.villager = b.dataset.villager;
  renderTrades();
  if (window.innerWidth < 880) $("trade-result").scrollIntoView({ block: "start" });
});
$("trade-search").addEventListener("input", e => {
  trade.query = e.target.value;
  renderTradeResult();
  renderSearch();
  try { localStorage.setItem(TRADE_KEY, JSON.stringify(trade)); } catch (_) {}
});
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderTrades(); });

$("trade-search").value = trade.query;
renderTrades();
