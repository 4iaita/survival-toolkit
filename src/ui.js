/* ---------- UI ----------
 * What every tab uses: the edition, the saved choices of the Equipment tab's item and anvil plan (state), and how slots are drawn.
 */
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

// Slots: enchanted things get the moving glint, masked to the icon's shape.
const plainSlot = (name, cls = "") => `<span class="slot ${cls}">${iconImg(name)}</span>`;
const glintSlot = (name, cls = "") => `<span class="slot glint ${cls}" style="--m:url('${icon(name)}')">${iconImg(name)}</span>`;
const levelText = (k, l) => `${esc(ENCH[k].n)}${ENCH[k].max > 1 ? " " + ROMAN[l] : ""}`;

function renderEdition() {
  for (const b of $("edition").querySelectorAll("button")) b.setAttribute("aria-pressed", b.dataset.ed === state.edition);
}

const refocus = sel => document.querySelector(sel)?.focus();

$("edition").addEventListener("click", e => {
  const b = e.target.closest("button[data-ed]");
  if (!b) return;
  state.edition = b.dataset.ed;
  renderEdition();
  refocus(`#ed-${state.edition}`);
});
try {
  const tile = artBackdrop("deepslate_tiles");
  document.body.style.setProperty("--stone", `url(${tile ? paint(32, tile) : stoneTile()})`);
} catch (_) {}
document.querySelectorAll("img[data-icon]").forEach(im => { im.src = icon(im.dataset.icon); });
load();
renderEdition();
