/* ---------- Anvil plan ----------
 * The Equipment tab's Anvil plan section: the enchantment books you have, the options, and the cheapest order to use them in
 * (src/solver.js). The tab (src/gear-ui.js) puts the section on the page; renderEnchants and renderPlan fill it.
 */
function sanitizePicked() {
  const allowed = new Set(enchantsFor(currentItem(), state.edition));
  for (const k of Object.keys(state.picked)) if (!allowed.has(k)) delete state.picked[k];
}

// Whether the section's rules are open, kept across re-renders.
let anvilRulesOpen = false;
function anvilSection() {
  const option = (id, icon, label, control, cls = "") => `<label class="opt${cls}" for="${id}"><span class="slot sm">${iconImg(icon)}</span><span class="opt-label">${label}</span>${control}</label>`;
  const picker = (id, value, list) => `<select class="mc-select" id="${id}">${list.map(([v, text]) => `<option value="${v}"${String(value) === String(v) ? " selected" : ""}>${text}</option>`).join("")}</select>`;
  return `<p class="mob-lead">Pick the enchantment books you have. The planner finds the anvil order that costs the least XP, with no job over 39 levels.</p>
    <div class="panel-head anvil-head">
      <h4>Enchantments</h4>
      <div class="head-btns">
        <button type="button" class="mc-btn sm" id="btn-full">Full set</button>
        <button type="button" class="mc-btn sm" id="btn-clear">Clear</button>
      </div>
    </div>
    <div class="ench-list" id="enchants"></div>
    <div class="panel-head anvil-head"><h4>Options</h4></div>
    <div class="opts">
      ${option("opt-mode", "ui:orb", "Optimize for", picker("opt-mode", state.mode, [["xp", "Fewest XP points"], ["levels", "Fewest levels"]]))}
      ${option("opt-work", "ui:anvil", "Item’s previous anvil uses", picker("opt-work", state.itemUses, [[0, "0 (fresh item)"], ...[1, 2, 3, 4, 5].map(n => [n, `${n} (penalty ${penalty(n)})`])]))}
      ${option("opt-creative", "ui:command", "Creative mode (no 39-level limit)", `<input type="checkbox" class="mc-check" id="opt-creative"${state.creative ? " checked" : ""}>`, " opt-check")}
    </div>
    <div class="anvil-plan" id="anvil-plan" aria-live="polite"></div>
    <details class="rules tag-rules"${anvilRulesOpen ? " open" : ""}>
      <summary>How the cost is calculated</summary>
      <ul>
        <li>Each anvil job costs <code>left penalty + right penalty + enchantment cost</code>. The penalty is <code>2ⁿ − 1</code>, where n is how many times that item or book has been through an anvil. The result keeps the higher count plus one.</li>
        <li>Enchantment cost is the level of each enchantment on the right-hand book times its book multiplier, shown under each enchantment. Bedrock only charges for levels the left item gains, so with fresh books both editions charge the same here. Impaling is cheaper on Bedrock (1 per level instead of 2).</li>
        <li>In Survival, a job costing 40 levels or more is refused as “Too Expensive!”. The planner never suggests one unless Creative mode is on.</li>
        <li>XP points assume you pay each job right at that level, for example by leveling up between jobs. If you pay every job from one big pool of levels, only the total levels matter, so pick “Fewest levels”.</li>
        <li>Assumes one fresh book per enchantment (from the enchanting table, a librarian or loot) with no anvil uses yet. Enchantments already on the item can be left unchecked; set the item’s previous anvil uses instead.</li>
        <li>The search tries every possible merge order, so the plan shown is the true minimum, not a rule of thumb.</li>
        <li>Icons are original pixel art drawn for this page.</li>
      </ul>
    </details>`;
}

function renderEnchants() {
  $("enchants").innerHTML = enchantsFor(currentItem(), state.edition).map(k => {
    const e = ENCH[k];
    const on = k in state.picked;
    const lvl = state.picked[k] ?? e.max;
    const m = bookMultiplier(k, state.edition);
    const clash = Object.keys(state.picked).filter(o => conflicts(o, k));
    const levels = e.max > 1
      ? `<div class="levels" role="group" aria-label="${esc(e.n)} level">${Array.from({ length: e.max }, (_, i) => i + 1).map(l =>
          `<button type="button" data-lvl="${l}" data-ench="${k}" aria-pressed="${on && l === lvl}">${ROMAN[l]}</button>`).join("")}</div>`
      : "";
    // Its levels and what they cost each; one that clashes with a picked one says so instead.
    const blocked = !on && clash.length > 0;
    const row = blocked ? `<span class="warn">Conflicts with ${clash.map(c => ENCH[c].n).join(", ")}</span>` : `${levels}<span>${e.max > 1 ? `${m} per level` : "One level only"}</span>`;
    return `<div class="ench ${on ? "on" : ""} ${blocked ? "blocked" : ""}" data-ench="${k}" role="checkbox" aria-checked="${on}" tabindex="0">
      ${on ? glintSlot("e:" + k, "sm") : plainSlot("e:" + k, "sm")}
      <span class="ench-name${e.curse ? " curse-name" : ""}">${esc(e.n)}</span>
      <span class="ench-worth">${blocked ? "select to swap" : `book worth ${m * lvl}`}</span>
      <span class="ench-meta">${row}</span>
    </div>`;
  }).join("");
}

function renderPlan() {
  const item = currentItem(), itemName = gearName(item), itemIcon = gearIcon(item);
  const books = Object.entries(state.picked).map(([key, level]) => ({
    key, level, val: level * bookMultiplier(key, state.edition),
  }));
  const el = $("anvil-plan");

  if (!books.length) {
    el.innerHTML = `<div class="empty">${iconImg("ui:book")}<p>Select at least one enchantment to see the cheapest anvil order for your ${esc(itemName.toLowerCase())}.</p></div>`;
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
    const name = isItem ? itemIcon : "ui:book";
    return !isItem || node.leaf === undefined || state.itemUses ? glintSlot(name) : plainSlot(name);
  };
  const describe = node => {
    if (node.mask & 1) {
      const sub = node.leaf === 0
        ? (state.itemUses ? `${state.itemUses} previous anvil use${state.itemUses > 1 ? "s" : ""}` : "no enchantments yet")
        : `from step ${node.step}`;
      return `${esc(itemName)} <span class="sub">(${sub})</span>`;
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
      <div class="step-body">
        <div class="anvil-row">
          ${slotFor(s.left)}<span class="op">+</span>${slotFor(s.right)}${iconImg("ui:arrow")}${slotFor(s)}
        </div>
        <div class="what">
          <div><span class="lbl">Left:</span> ${describe(s.left)}</div>
          <div><span class="lbl">Right:</span> ${describe(s.right)}</div>
        </div>
      </div>
      <div class="breakdown">Enchantments ${s.parts.ench} + left penalty ${s.parts.leftPen} + right penalty ${s.parts.rightPen}</div>
    </li>`).join("");

  const goal = mode => state.mode === mode ? `<span class="goal">Goal</span>` : "";
  const nextPen = penalty(res.uses);
  el.innerHTML = `
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
    <ol class="steps">${stepHtml}</ol>
    <div class="final">
      <div class="mc-tooltip">
        ${glintSlot(itemIcon)}
        <div>
          <div class="tname">${esc(itemName)}</div>
          <ul>${books.map(b => `<li class="${ENCH[b.key].curse ? "curse" : ""}">${levelText(b.key, b.level)}</li>`).join("")}</ul>
          <div class="foot">Anvil uses: ${res.uses}. The next anvil job on it adds a penalty of ${nextPen} level${nextPen === 1 ? "" : "s"}.</div>
        </div>
      </div>
    </div>`;
}

function renderAnvil() {
  renderEnchants();
  renderPlan();
  save();
}

function toggleEnchant(k) {
  if (k in state.picked) { delete state.picked[k]; return; }
  for (const o of Object.keys(state.picked)) if (conflicts(o, k)) delete state.picked[o];
  state.picked[k] = ENCH[k].max;
}
// The section is drawn anew with the tab, so its controls are heard on the tab's panel.
$("gear-result").addEventListener("click", e => {
  const all = e.target.closest("#btn-full, #btn-clear"), lv = e.target.closest("button[data-lvl]"), row = e.target.closest(".ench");
  if (all) {
    state.picked = all.id === "btn-full" ? fullSet(currentItem(), state.edition) : {};
    renderAnvil();
  } else if (lv) {
    state.picked[lv.dataset.ench] = +lv.dataset.lvl;
    for (const o of Object.keys(state.picked)) if (conflicts(o, lv.dataset.ench)) delete state.picked[o];
    renderAnvil();
    refocus(`.levels button[data-ench="${lv.dataset.ench}"][data-lvl="${lv.dataset.lvl}"]`);
  } else if (row) {
    toggleEnchant(row.dataset.ench);
    renderAnvil();
    refocus(`.ench[data-ench="${row.dataset.ench}"]`);
  }
});
$("gear-result").addEventListener("keydown", e => {
  const row = e.target.closest(".ench");
  if (!row || e.target !== row || (e.key !== " " && e.key !== "Enter")) return;
  e.preventDefault();
  toggleEnchant(row.dataset.ench);
  renderAnvil();
  refocus(`.ench[data-ench="${row.dataset.ench}"]`);
});
$("gear-result").addEventListener("change", e => {
  const set = { "opt-mode": () => { state.mode = e.target.value; }, "opt-work": () => { state.itemUses = +e.target.value; }, "opt-creative": () => { state.creative = e.target.checked; } }[e.target.id];
  if (!set) return;
  set();
  renderPlan();
  save();
});
