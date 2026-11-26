/* ---------- Enchanting table ----------
 * The Equipment tab's Enchanting table section: what the table offers an item in its material (or a book) with the bookshelves
 * picked, slot by slot, and how to get an enchantment from it (the maths is src/table-data.js). The tab (src/gear-ui.js) puts it on
 * the page as one of each worn thing's sections; its controls are heard on the tab's panel, as the anvil plan's are.
 */
// The bookshelves, whether a book is in the table instead, the slot looked at and the level it shows (0: any), and the
// enchantment wanted for each item ([key, level]).
const tbl = { shelves: 15, book: false, slot: 2, lv: 0, want: {} };
const TABLE_KEY = "table-v1";
try { const s = JSON.parse(localStorage.getItem(TABLE_KEY)); if (s && typeof s === "object") Object.assign(tbl, s); } catch (_) {}
tbl.shelves = Math.max(0, Math.min(TABLE_MAX_SHELVES, Math.round(+tbl.shelves) || 0));
if (![0, 1, 2].includes(tbl.slot)) tbl.slot = 2;
if (!Number.isInteger(tbl.lv)) tbl.lv = 0;
tbl.book = tbl.book === true;
if (!tbl.want || typeof tbl.want !== "object" || Array.isArray(tbl.want)) tbl.want = {};
const saveTable = () => { try { localStorage.setItem(TABLE_KEY, JSON.stringify(tbl)); } catch (_) {} };

const TABLE_SLOTS = ["Top", "Middle", "Bottom"];
// What the table gives the item, in the edition picked (none: it won't take it).
const tableKeys = item => enchantsFor(item, state.edition).filter(k => enchantFrom(item.k, k, state.edition) === "table");
const tableIn = (item, mat, book) => (book ? { keys: tableBookKeys(state.edition), ench: 1 } : { keys: tableKeys(item), ench: gearEnch(item, mat) });
const tablePct = p => (p <= 0 ? "0%" : p >= 1 - 5e-7 ? "100%" : p > 0.995 ? "over 99%" : p < 0.001 ? "under 0.1%" : p < 0.1 ? `${(p * 100).toFixed(1)}%` : `${Math.round(p * 100)}%`);
const tableOneIn = (p, one = "try", many = "tries") => (p >= 1 - 5e-7 ? `every ${one}` : p >= 0.5 ? `${Math.round(p * 100)}% of ${many}` : `about 1 ${one} in ${commas(Math.round(1 / p))}`);
// How many tries make it 90% sure.
const tableSure = p => (p >= 0.9 ? 1 : Math.ceil(Math.log(0.1) / Math.log(1 - p)));
const atLeast = (by, l) => Object.entries(by || {}).reduce((n, [lv, p]) => (+lv >= l ? n + p : n), 0);
const levelsOf = s => Object.keys(s.levels).map(Number).filter(Boolean);
const tableRange = ls => (!ls.length ? "–" : Math.min(...ls) === Math.max(...ls) ? `${ls[0]}` : `${Math.min(...ls)}–${Math.max(...ls)}`);

// The enchantment wanted on an item: the one picked, or the first the table gives it, at its highest level.
function tableWanted(item, mat = gearMat(item)) {
  const all = enchantsFor(item, state.edition), [k, l] = tbl.want[item.k] || [];
  if (all.includes(k)) return [k, Math.max(1, Math.min(ENCH[k].max, l || ENCH[k].max))];
  const first = tableKeys(item)[0] || all.find(o => !ENCH[o].curse) || all[0];
  // At the highest level the table gives it, when it does.
  const top = tableKeys(item).includes(first) ? tableTop(tableIn(item, mat, false), false, first) : 0;
  return [first, top || ENCH[first].max];
}

// Each slot's chance to give k at level l or higher a try, and to show it as its hint; looking at all three hints once (they're
// drawn apart, so as good as independent).
function tableChance(what, book, shelves, k, l) {
  const slots = [0, 1, 2].map(i => tableSlotAll(what.keys, what.ench, book, shelves, i));
  const give = slots.map(s => atLeast(s.got[k], l)), hint = slots.map(s => atLeast(s.hint[k], l));
  const best = give.indexOf(Math.max(...give));
  return { give, hint, best, p: give[best], look: 1 - hint.reduce((n, h) => n * (1 - h), 1) };
}
// The bookshelves that give the best chance (the fewest of equals), and the highest level the table ever gives k.
function tableBestShelves(what, book, k, l) {
  let best = { shelves: 0, p: -1 };
  for (let n = 0; n <= TABLE_MAX_SHELVES; n++) {
    const { p } = tableChance(what, book, n, k, l);
    if (p > best.p * (1 + 1e-9)) best = { shelves: n, p };
  }
  return best;
}
function tableTop(what, book, k) {
  let top = 0;
  for (let lv = 1; lv <= 30; lv++) for (const l of Object.keys(tableOffer(what.keys, what.ench, book, lv).got[k] || {})) top = Math.max(top, +l);
  return top;
}

// One slot as a box to pick: the levels it shows, and what it costs.
const tableSlotBox = (i, s) => `<button type="button" class="mob-stat table-slot" data-tslot="${i}" aria-pressed="${i === tbl.slot}">
    <span class="stat-label">${TABLE_SLOTS[i]}</span><span class="stat-value">${tableRange(levelsOf(s))}</span>
    <span class="sub">${s.empty >= 1 - 5e-7 ? "Always empty here" : `Costs ${plural(i + 1, "level")} and ${i + 1} lapis${s.empty ? `. Empty ${tablePct(s.empty)} of the time` : ""}`}</span></button>`;

// What a slot gives: each enchantment at each level, the likeliest first, and how many come.
function tableOffers(what, book, s) {
  const lv = levelsOf(s).includes(tbl.lv) ? tbl.lv : 0;
  const o = lv ? tableOffer(what.keys, what.ench, book, lv) : s;
  const rows = Object.entries(o.got).map(([k, by]) => ({ k, by, p: Object.values(by).reduce((a, b) => a + b, 0) })).filter(r => r.p > 0).sort((a, b) => b.p - a.p);
  const count = o.count, n = c => count[c] || 0, more = Object.keys(count).filter(c => +c >= 3).reduce((a, c) => a + count[c], 0);
  const many = [[n(1), "one"], [n(2), "two"], [more, "three or more"], [n(0), "nothing"]].filter(([p]) => p > 0.0005).map(([p, w]) => `${w} ${tablePct(p)}`).join(", ");
  const chips = [[0, "Any level", 1], ...levelsOf(s).sort((a, b) => a - b).map(l => [l, `Level ${l}`, s.levels[l]])];
  return `<div class="cat-label gear-label">Its level</div>
    <div class="try-tags table-levels" role="group" aria-label="The level the ${TABLE_SLOTS[tbl.slot].toLowerCase()} slot shows">${chips.map(([l, label, p]) =>
      `<button type="button" class="name-chip" data-tlv="${l}" aria-pressed="${l === lv}"${l ? ` title="${tablePct(p)} of the time"` : ""}>${label}</button>`).join("")}</div>
    <p class="choice-hint">${lv ? `What comes when it shows level ${lv}, ${tablePct(s.levels[lv])} of the time with ${plural(tbl.shelves, "bookshelf", "bookshelves")}` : "What comes, over all the levels it shows"}${book ? ", once the book has lost one" : ""}.</p>
    ${rows.length ? `<ul class="item-list wide">${rows.map(({ k, by, p }) => gearRow(plainSlot(`e:${k}`, "sm"), `<span${ENCH[k].curse ? ' class="curse-name"' : ""}>${esc(ENCH[k].n)}</span>`,
      Object.keys(by).sort((a, b) => a - b).filter(l => by[l] > 0).map(l => `${ENCH[k].max > 1 ? ROMAN[l] : "I"} ${tablePct(by[l])}`).join(" · "),
      `<span class="item-count">${tablePct(p)}</span>`)).join("")}</ul>` : `<p class="mob-lead">Nothing: at ${lv ? `level ${lv}` : "these levels"} no enchantment fits.</p>`}
    ${many ? `<dl class="fact-list">${potionFact("How many", `${many[0].toUpperCase()}${many.slice(1)}.`)}</dl>` : ""}`;
}

// "How do I get it?": the enchantment wanted, where it can come from, and how many tries it takes.
function tableGet(item, mat) {
  const [k, l] = tableWanted(item, mat), e = ENCH[k], from = enchantFrom(item.k, k, state.edition), name = gearName(item, mat), lower = name.toLowerCase();
  const id = `table-${drawingSlot}`, all = enchantsFor(item, state.edition), want = `${esc(levelText(k, l))}`;
  const pick = `<div class="opts table-want">
      <label class="opt" for="${id}-want"><span class="slot sm">${iconImg(`e:${k}`)}</span><span class="opt-label">Enchantment</span>
        <select class="mc-select" id="${id}-want" data-twant="k">${all.map(o => `<option value="${o}"${o === k ? " selected" : ""}>${esc(ENCH[o].n)}</option>`).join("")}</select></label>
      ${e.max > 1 ? `<label class="opt" for="${id}-wantlv"><span class="slot sm">${iconImg("ui:orb")}</span><span class="opt-label">At least</span>
        <select class="mc-select" id="${id}-wantlv" data-twant="l">${Array.from({ length: e.max }, (_, i) => i + 1).map(n => `<option value="${n}"${n === l ? " selected" : ""}>${ROMAN[n]}</option>`).join("")}</select></label>` : ""}
    </div>`;
  const anvil = `<button type="button" class="mc-btn sm table-anvil" data-tanvil="${k}" data-tl="${l}">${iconImg("ui:anvil")}Plan it on the anvil</button>`;
  const shelves = plural(tbl.shelves, "bookshelf", "bookshelves");
  // A book's chances, for comparing or as the only way.
  const bookIn = tableIn(item, mat, true), bc = tableChance(bookIn, true, tbl.shelves, k, l), bookTop = tableTop(bookIn, true, k);
  const bookCost = l * bookMultiplier(k, state.edition);
  const bookLine = () => (bc.p > 0
    ? `In a book: ${tablePct(bc.p)} a try in the ${TABLE_SLOTS[bc.best].toLowerCase()} slot, ${tableOneIn(bc.p)}; a slot’s hint shows it ${tableOneIn(bc.look, "look", "looks")}. On a fresh ${lower} an anvil then puts it on for ${plural(bookCost, "level")}.`
    : bookTop >= l ? `Not with ${shelves}: with ${plural(bookBest().shelves, "bookshelf", "bookshelves")} a book gets it ${tableOneIn(bookBest().p)}.`
      : bookTop ? `A book gets it at ${ROMAN[bookTop]} at most; two books of ${ROMAN[bookTop]} make ${ROMAN[bookTop + 1]} on an anvil.`
        : `No book gets it from the table.`);
  const bookBest = () => tableBestShelves(bookIn, true, k, l);
  let body;
  if (from === "treasure") {
    body = `<p class="mob-lead"><b>Never from the enchanting table:</b> ${esc(e.n)} is a treasure enchantment. ${esc(TREASURE[k])}. Put the book on with an anvil.</p>${anvil}`;
  } else if (from === "book") {
    const why = NO_TABLE.has(item.k) ? `The enchanting table won’t take a ${esc(lower)}` : `The enchanting table never gives a ${esc(lower)} ${esc(e.n)}`;
    body = `<p class="mob-lead"><b>${why}</b>, but a book can get it, and an anvil puts it on.</p>
      <dl class="fact-list">${potionFact("A book", bookLine())}</dl>${anvil}`;
  } else {
    const what = tableIn(item, mat, false), c = tableChance(what, false, tbl.shelves, k, l), top = tableTop(what, false, k);
    if (top < l) {
      body = `<p class="mob-lead"><b>The table gives a ${esc(lower)} ${esc(e.n)} ${top ? `up to ${ROMAN[top]}` : "at no level"}</b>, never ${ROMAN[l]}. Two of the same level make the next one on an anvil.</p>
        <dl class="fact-list">${potionFact("A book", bookLine())}</dl>${anvil}`;
    } else if (!c.p) {
      const b = tableBestShelves(what, false, k, l);
      body = `<p class="mob-lead"><b>Not with ${shelves}.</b> With ${plural(b.shelves, "bookshelf", "bookshelves")} it comes ${tableOneIn(b.p)} in the best slot.</p>`;
    } else {
      const b = tableBestShelves(what, false, k, l), better = b.shelves !== tbl.shelves && b.p > c.p * 1.1 && b.p - c.p > 0.005;
      const boxes = [["Best slot", TABLE_SLOTS[c.best], `Needs its level; costs ${plural(c.best + 1, "level")} and ${c.best + 1} lapis`],
        ["Each try", tablePct(c.p), c.p < 0.5 ? tableOneIn(c.p) : "Taking that slot"],
        ["90% sure in", `${tableSure(c.p)}`, tableSure(c.p) === 1 ? "try" : "tries, each a new item"],
        ["By the hints", tablePct(c.look), c.look ? `Shown ${tableOneIn(c.look, "look", "looks")}` : "Never shown"]];
      body = `<div class="mob-stats">${boxes.map(statBox).join("")}</div>
        <dl class="fact-list">
          ${potionFact("Each try", `Taking the ${TABLE_SLOTS[c.best].toLowerCase()} slot gives ${levelText(k, l)}${l < e.max ? " or better" : ""} ${tablePct(c.p)} of the time${c.p < 1 ? ", with whatever else comes; the item is spent either way" : ""}. Top ${tablePct(c.give[0])}, middle ${tablePct(c.give[1])}, bottom ${tablePct(c.give[2])}.`)}
          ${c.look ? potionFact("By the hints", `Put the ${lower} in and look at the three hints: one shows ${levelText(k, l)}${l < e.max ? " or better" : ""} ${tableOneIn(c.look, "look", "looks")}, and that slot then gives it for sure. If none does, enchant a book in the top slot (1 level, 1 lapis) for new offers.`) : ""}
          ${better ? potionFact("Bookshelves", `With ${plural(b.shelves, "bookshelf", "bookshelves")} it’s ${tablePct(b.p)} a try.`) : ""}
          ${potionFact("A book", bookLine())}
        </dl>
        ${bc.p > c.p ? `<p class="mob-lead">A book gets it more often: enchant books, then put the one you want on.</p>${anvil}` : ""}`;
    }
  }
  return `<div class="cat-label gear-label">How do I get…</div>${pick}${body}`;
}

function tableSection(item, mat) {
  const takes = tableKeys(item).length > 0, book = tbl.book || !takes, what = tableIn(item, mat, book), name = gearName(item, mat);
  const slots = [0, 1, 2].map(i => tableSlotAll(what.keys, what.ench, book, tbl.shelves, i)), s = slots[tbl.slot];
  const lead = takes ? `What the enchanting table offers ${book ? "a book" : `your ${esc(name.toLowerCase())}`} with ${plural(tbl.shelves, "bookshelf", "bookshelves")} round it, worked out exactly as the game does it.`
    : `The enchanting table won’t take a ${esc(name.toLowerCase())}: it gets its enchantments from books, on an anvil. Here’s what the table offers a book.`;
  return `${gearHead("table", item, `${state.edition === "java" ? "Java" : "Bedrock"} Edition`)}
    <p class="mob-lead">${lead}</p>
    <div class="choices table-choices">
      <div><div class="cat-label">Bookshelves</div>
        <div class="stepper">
          <button type="button" class="mc-btn sm" data-tshelf="-1" aria-label="Fewer bookshelves"${tbl.shelves <= 0 ? " disabled" : ""}>−</button>
          <output aria-live="polite">${tbl.shelves}</output>
          <button type="button" class="mc-btn sm" data-tshelf="1" aria-label="More bookshelves"${tbl.shelves >= TABLE_MAX_SHELVES ? " disabled" : ""}>+</button>
        </div>
        <div class="choice-hint">Up to 15 count.</div>
      </div>
      ${takes ? `<div><div class="cat-label">In the table</div><div class="try-tags" role="group" aria-label="In the table">
        <button type="button" class="name-chip" data-tbook="0" aria-pressed="${!book}">${iconImg(gearIcon(item, mat))}${esc(name)}</button>
        <button type="button" class="name-chip" data-tbook="1" aria-pressed="${book}">${iconImg("ui:book")}Book</button></div>
        <div class="choice-hint">Enchantability ${what.ench}${book ? ": a book can get every enchantment the table gives" : ""}.</div></div>` : ""}
    </div>
    <div class="cat-label gear-label">The slots</div>
    <div class="mob-stats table-slots" role="group" aria-label="The slots">${slots.map((x, i) => tableSlotBox(i, x)).join("")}</div>
    ${s.empty >= 1 - 5e-7 ? `<p class="mob-lead">This slot is always empty with ${plural(tbl.shelves, "bookshelf", "bookshelves")}.</p>` : tableOffers(what, book, s)}
    ${tableGet(item, mat)}
    <div class="cat-label gear-label">How the table works</div>
    <dl class="fact-list">${TABLE_FACTS.map(([label, text]) => potionFact(label, forEdition(text))).join("")}</dl>`;
}

// Its controls, on the tab's panel (the section is drawn anew with it).
const redrawTable = sel => {
  saveTable();
  renderGearResult();
  if (sel) refocus(sel);
};
$("gear-result").addEventListener("click", e => {
  const block = e.target.closest("[data-block]"), at = block ? `[data-block="${block.dataset.block}"] ` : "";
  const shelf = e.target.closest("button[data-tshelf]"), book = e.target.closest("button[data-tbook]"), slot = e.target.closest("button[data-tslot]");
  const lv = e.target.closest("button[data-tlv]"), anvil = e.target.closest("button[data-tanvil]");
  if (shelf) {
    tbl.shelves = Math.max(0, Math.min(TABLE_MAX_SHELVES, tbl.shelves + +shelf.dataset.tshelf));
    redrawTable(`${at}button[data-tshelf="${shelf.dataset.tshelf}"]:not(:disabled), ${at}.stepper button:not(:disabled)`);
  } else if (book) {
    tbl.book = book.dataset.tbook === "1";
    redrawTable(`${at}button[data-tbook="${book.dataset.tbook}"]`);
  } else if (slot) {
    tbl.slot = +slot.dataset.tslot;
    tbl.lv = 0;
    redrawTable(`${at}button[data-tslot="${slot.dataset.tslot}"]`);
  } else if (lv) {
    tbl.lv = +lv.dataset.tlv;
    redrawTable(`${at}button[data-tlv="${lv.dataset.tlv}"]`);
  } else if (anvil && block) {
    // Puts the wanted enchantment in the item's anvil plan (instead of what clashes with it) and opens the plan.
    const k = anvil.dataset.tanvil, s = block.dataset.block;
    gear.sections[s] = "anvil";
    openGear(gear.set[s].k);
    for (const o of Object.keys(state.picked)) if (conflicts(o, k)) delete state.picked[o];
    state.picked[k] = +anvil.dataset.tl;
    renderGear();
    refocus(`#gear-${s}-tab-anvil`);
  }
});
$("gear-result").addEventListener("change", e => {
  const sel = e.target.closest("select[data-twant]"), block = e.target.closest("[data-block]");
  if (!sel || !block) return;
  const item = gearItem(gear.set[block.dataset.block].k), [k, l] = tableWanted(item);
  tbl.want[item.k] = sel.dataset.twant === "k" ? [sel.value, ENCH[sel.value].max] : [k, +sel.value];
  redrawTable(`[data-block="${block.dataset.block}"] select[data-twant="${sel.dataset.twant}"]`);
});
