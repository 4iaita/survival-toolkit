/* ---------- UI ---------- */
const ROMAN = ["", "I", "II", "III", "IV", "V"];
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const state = {
  edition: "java",
  item: "sword",
  picked: {},          // key -> level, per current item
  mode: "xp",
  itemUses: 0,
  creative: false,
};

function fullSet(item, edition) {
  const out = {};
  for (const k of enchantsFor(item, edition)) {
    const e = ENCH[k];
    if (e.curse) continue;
    if (Object.keys(out).some(o => conflicts(o, k))) continue;
    out[k] = e.max;
  }
  return out;
}

const currentItem = () => ITEMS.find(i => i.k === state.item);
// v2: the default goal changed to XP points, so older saved choices are dropped once.
const STORE_KEY = "anvil-planner-v2";

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (s && ITEMS.some(i => i.k === s.item)) Object.assign(state, s);
  } catch (_) {}
  if (!Object.keys(state.picked).length) state.picked = fullSet(currentItem(), state.edition);
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) {}
}

function sanitizePicked() {
  const allowed = new Set(enchantsFor(currentItem(), state.edition));
  for (const k of Object.keys(state.picked)) if (!allowed.has(k)) delete state.picked[k];
}

// Slots: enchanted things get the moving glint, masked to the icon's shape.
const plainSlot = (name, cls = "") => `<span class="slot ${cls}">${iconImg(name)}</span>`;
const glintSlot = (name, cls = "") => `<span class="slot glint ${cls}" style="--m:url('${icon(name)}')">${iconImg(name)}</span>`;
const levelText = (k, l) => `${esc(ENCH[k].n)}${ENCH[k].max > 1 ? " " + ROMAN[l] : ""}`;

function renderEdition() {
  for (const b of $("edition").querySelectorAll("button")) b.setAttribute("aria-pressed", b.dataset.ed === state.edition);
}

function renderItems() {
  const cats = [...new Set(ITEMS.map(i => i.cat))];
  $("items").innerHTML = cats.map(c => `
    <div>
      <div class="cat-label">${c}</div>
      <div class="slot-grid">${ITEMS.filter(i => i.cat === c).map(i =>
        `<button type="button" class="slot slot-btn" id="item-${i.k}" data-item="${i.k}" data-name="${esc(i.n)}" aria-label="${esc(i.n)}" aria-pressed="${i.k === state.item}">${iconImg(i.k)}</button>`).join("")}
      </div>
    </div>`).join("");
  $("item-name").textContent = currentItem().n;
}

function renderEnchants() {
  const item = currentItem();
  $("ench-title").textContent = `Enchantments for ${item.n}`;
  $("enchants").innerHTML = enchantsFor(item, state.edition).map(k => {
    const e = ENCH[k];
    const on = k in state.picked;
    const lvl = state.picked[k] ?? e.max;
    const m = bookMultiplier(k, state.edition);
    const clash = Object.keys(state.picked).filter(o => conflicts(o, k));
    const levels = e.max > 1
      ? `<div class="levels" role="group" aria-label="${esc(e.n)} level">${Array.from({ length: e.max }, (_, i) => i + 1).map(l =>
          `<button type="button" data-lvl="${l}" data-ench="${k}" aria-pressed="${on && l === lvl}">${ROMAN[l]}</button>`).join("")}</div>`
      : "";
    const meta = !on && clash.length
      ? `<span class="warn">Conflicts with ${clash.map(c => ENCH[c].n).join(", ")}. Selecting swaps it.</span>`
      : `${m} level${m > 1 ? "s" : ""} per enchantment level · book worth ${m * lvl}`;
    return `<div class="ench ${on ? "on" : ""} ${!on && clash.length ? "blocked" : ""}" data-ench="${k}" role="checkbox" aria-checked="${on}" tabindex="0">
      ${on ? glintSlot("e:" + k, "sm") : plainSlot("e:" + k, "sm")}
      <span class="ench-name">${esc(e.n)}${e.curse ? `<span class="curse">curse</span>` : ""}</span>
      ${levels}
      <span class="ench-meta">${meta}</span>
    </div>`;
  }).join("");
}

function renderResult() {
  const item = currentItem();
  const books = Object.entries(state.picked).map(([key, level]) => ({
    key, level, val: level * bookMultiplier(key, state.edition),
  }));
  const el = $("result");

  if (!books.length) {
    el.innerHTML = `<div class="empty">${iconImg("ui:book")}<p>Select at least one enchantment to see the cheapest anvil order for your ${esc(item.n.toLowerCase())}.</p></div>`;
    return;
  }

  const opts = { itemUses: state.itemUses, mode: state.mode };
  let res = solve(books, { ...opts, cap: !state.creative });
  let overLimit = false;
  if (!res) { res = solve(books, { ...opts, cap: false }); overLimit = true; }

  const steps = toSteps(res.tree);
  const priciest = Math.max(...steps.map(s => s.cost));
  const nv = naive(books, state.itemUses);
  const saved = nv.levels - res.levels;
  let compare;
  if (books.length === 1) compare = `One book, one anvil job.`;
  else if (saved > 0) compare = `Adding the books one at a time would cost <b>${nv.levels} levels</b>${nv.worst > MAX_COST ? `, and would hit “Too Expensive!” at ${nv.worst}` : ""}. This order saves <b>${saved}</b>.`;
  else compare = nv.worst > MAX_COST && !overLimit
    ? `Adding the books one at a time costs the same in total but would hit “Too Expensive!” at ${nv.worst}.`
    : `Adding the books one at a time costs the same here.`;

  const contents = node => books.filter((_, i) => node.mask & (1 << (i + 1)));
  const slotFor = node => {
    const isItem = node.mask & 1;
    const name = isItem ? item.k : "ui:book";
    return !isItem || node.leaf === undefined || state.itemUses ? glintSlot(name) : plainSlot(name);
  };
  const describe = node => {
    if (node.mask & 1) {
      const sub = node.leaf === 0
        ? (state.itemUses ? `${state.itemUses} previous anvil use${state.itemUses > 1 ? "s" : ""}` : "no enchantments yet")
        : `from step ${node.step}`;
      return `${esc(item.n)} <span class="sub">(${sub})</span>`;
    }
    const sub = node.leaf !== undefined ? "fresh" : `from step ${node.step}`;
    return `Book <span class="sub">(${sub})</span><div class="tips">${contents(node).map(b =>
      `<span class="tip ${ENCH[b.key].curse ? "curse" : ""}">${levelText(b.key, b.level)}</span>`).join("")}</div>`;
  };

  const stepHtml = steps.map(s => `
    <li class="step">
      <div class="step-top">
        <span class="step-no">Step ${s.step}</span>
        <span class="cost ${s.cost > MAX_COST ? "bad" : ""}">${s.cost > MAX_COST && !state.creative ? `Too Expensive! (${s.cost})` : `Enchantment Cost: ${s.cost}`}</span>
      </div>
      <div class="anvil-row">
        ${slotFor(s.left)}<span class="op">+</span>${slotFor(s.right)}${iconImg("ui:arrow")}${slotFor(s)}
      </div>
      <div class="what">
        <div><span class="lbl">Left:</span> ${describe(s.left)}</div>
        <div><span class="lbl">Right:</span> ${describe(s.right)}</div>
      </div>
      <div class="breakdown">Enchantments ${s.parts.ench} + left penalty ${s.parts.leftPen} + right penalty ${s.parts.rightPen}</div>
    </li>`).join("");

  const goal = mode => state.mode === mode ? `<span class="goal">Goal</span>` : "";
  const nextPen = penalty(res.uses);
  el.innerHTML = `
    <div class="res-top">
      <div class="res-title">${iconImg("ui:anvil")}<h2>Anvil plan · ${state.edition === "java" ? "Java" : "Bedrock"} ${esc(item.n)}</h2></div>
      <div class="stats">
        <div class="stat"><div class="k">Total cost ${goal("levels")}</div><div class="v">${res.levels}<small>levels</small></div></div>
        <div class="stat"><div class="k">XP points ${goal("xp")}</div><div class="v">${Math.round(res.xp).toLocaleString()}<small>points</small></div></div>
      </div>
      <div class="mini">
        <span>Anvil jobs <b>${steps.length}</b></span>
        <span>Priciest job <b>${priciest}</b> levels</span>
      </div>
      <p class="compare">${compare}</p>
      ${overLimit ? `<div class="banner">Every possible order has a job of 40+ levels, so this can't be done in Survival. Drop an enchantment, use an item with fewer previous anvil uses, or switch to Creative.</div>` : ""}
    </div>
    <ol class="steps">${stepHtml}</ol>
    <div class="final">
      <div class="mc-tooltip">
        ${glintSlot(item.k)}
        <div>
          <div class="tname">${esc(item.n)}</div>
          <ul>${books.map(b => `<li class="${ENCH[b.key].curse ? "curse" : ""}">${levelText(b.key, b.level)}</li>`).join("")}</ul>
          <div class="foot">Anvil uses: ${res.uses}. The next anvil job on it adds a penalty of ${nextPen} level${nextPen === 1 ? "" : "s"}.</div>
        </div>
      </div>
    </div>`;
}

function render() {
  sanitizePicked();
  renderEdition();
  renderItems();
  renderEnchants();
  renderResult();
  $("opt-mode").value = state.mode;
  $("opt-work").value = String(state.itemUses);
  $("opt-creative").checked = state.creative;
  save();
}

function toggleEnchant(k) {
  if (k in state.picked) { delete state.picked[k]; return; }
  for (const o of Object.keys(state.picked)) if (conflicts(o, k)) delete state.picked[o];
  state.picked[k] = ENCH[k].max;
}
const refocus = sel => document.querySelector(sel)?.focus();

$("edition").addEventListener("click", e => {
  const b = e.target.closest("button[data-ed]");
  if (!b) return;
  state.edition = b.dataset.ed;
  render();
  refocus(`#ed-${state.edition}`);
});
$("items").addEventListener("click", e => {
  const b = e.target.closest("button[data-item]");
  if (!b || b.dataset.item === state.item) return;
  state.item = b.dataset.item;
  state.picked = fullSet(currentItem(), state.edition);
  render();
  refocus(`#item-${state.item}`);
});
$("enchants").addEventListener("click", e => {
  const lv = e.target.closest("button[data-lvl]");
  if (lv) {
    state.picked[lv.dataset.ench] = +lv.dataset.lvl;
    for (const o of Object.keys(state.picked)) if (conflicts(o, lv.dataset.ench)) delete state.picked[o];
    render();
    return;
  }
  const row = e.target.closest(".ench");
  if (!row) return;
  toggleEnchant(row.dataset.ench);
  render();
  refocus(`.ench[data-ench="${row.dataset.ench}"]`);
});
$("enchants").addEventListener("keydown", e => {
  const row = e.target.closest(".ench");
  if (!row || e.target !== row || (e.key !== " " && e.key !== "Enter")) return;
  e.preventDefault();
  toggleEnchant(row.dataset.ench);
  render();
  refocus(`.ench[data-ench="${row.dataset.ench}"]`);
});
$("btn-full").addEventListener("click", () => { state.picked = fullSet(currentItem(), state.edition); render(); });
$("btn-clear").addEventListener("click", () => { state.picked = {}; render(); });
$("opt-mode").addEventListener("change", e => { state.mode = e.target.value; render(); });
$("opt-work").addEventListener("change", e => { state.itemUses = +e.target.value; render(); });
$("opt-creative").addEventListener("change", e => { state.creative = e.target.checked; render(); });

try {
  const tile = artBackdrop("deepslate_tiles");
  document.body.style.setProperty("--stone", `url(${tile ? paint(32, tile) : stoneTile()})`);
} catch (_) {}
document.querySelectorAll("img[data-icon]").forEach(im => { im.src = icon(im.dataset.icon); });
load();
render();
