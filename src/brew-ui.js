/* ---------- Brewing guide ---------- */
const brew = { potion: "swiftness", mod: "base", form: "drink", count: 3 };
const BREW_KEY = "brewing-guide-v1";
try { Object.assign(brew, JSON.parse(localStorage.getItem(BREW_KEY) || "{}")); } catch (_) {}
if (!potionByKey(brew.potion)) brew.potion = "swiftness";

const ROMAN_FX = ["", "I", "II", "III", "IV", "V", "VI"];
const CAT_LABEL = { Helpful: "Helpful", Harmful: "Harmful", Trial: "Tricky Trials" };
const FORM_LABEL = { drink: "Drinkable", splash: "Splash", lingering: "Lingering" };

const strongSuffix = p => (p.strongFx && p.strongFx.length === 1 ? ROMAN_FX[p.strongFx[0][1]] : "II");
const stateColor = st => (st.key === "water" || st.key === "awkward" ? WATER_COLOR : potionByKey(st.key).color);
const stateIcon = st => potionIcon(st.form, stateColor(st));
function stateTitle(st) {
  let t = potionTitle(st.key, st.form);
  if (st.mod === "strong") t += " " + strongSuffix(potionByKey(st.key));
  if (st.mod === "long") t += " (extended)";
  return t;
}
// "Speed II (1:30)", the way the game's tooltip writes an effect.
const fxText = e => `${e.name}${e.level > 1 ? " " + ROMAN_FX[e.level] : ""}${e.secs ? ` (${fmtTime(e.secs)})` : ""}`;
const countSlot = (name, n) => `<span class="slot">${iconImg(name)}${n > 1 ? `<span class="count">${n}</span>` : ""}</span>`;

function renderPotions() {
  const p = potionByKey(brew.potion);
  $("potions").innerHTML = Object.keys(CAT_LABEL).map(c => `
    <div>
      <div class="cat-label">${CAT_LABEL[c]}</div>
      <div class="slot-grid">${POTIONS.filter(x => x.cat === c).map(x =>
        `<button type="button" class="slot slot-btn" id="potion-${x.k}" data-potion="${x.k}" data-name="${esc(x.short || x.n)}" aria-label="${esc(potionTitle(x.k))}" aria-pressed="${x.k === p.k}">${iconImg(potionIcon(brew.form, x.color))}</button>`).join("")}
      </div>
    </div>`).join("");
  $("potion-name").textContent = potionTitle(p.k);
}

function renderChoices() {
  const p = potionByKey(brew.potion);
  const mods = modsFor(p);
  const modBtn = (mod, label, icon) => `<button type="button" class="mc-btn" data-mod="${mod}" aria-pressed="${brew.mod === mod}" ${mods.includes(mod) ? "" : "disabled"}>${icon ? iconImg(icon) : ""}${label}</button>`;
  $("brew-mod").innerHTML =
    modBtn("base", "Normal") +
    modBtn("long", "Extended", "b:redstone") +
    modBtn("strong", `Level ${strongSuffix(p)}`, "b:glowstone");
  const fx = potionEffects(p, brew.mod, "drink", state.edition);
  const missing = ["long", "strong"].filter(m => !mods.includes(m)).map(m => (m === "long" ? "extended" : "made stronger"));
  $("brew-mod-hint").textContent = fx.map(fxText).join(" + ") + (missing.length ? `. This potion can't be ${missing.join(" or ")}.` : ".");
  $("brew-form").innerHTML = Object.entries(FORM_LABEL).map(([form, label]) =>
    `<button type="button" class="mc-btn" data-form="${form}" aria-pressed="${brew.form === form}">${iconImg(potionIcon(form, p.color))}${label}</button>`).join("");
  $("brew-count").textContent = brew.count;
}

function renderBrewResult() {
  const p = potionByKey(brew.potion);
  const plan = brewPlan(p, brew);
  const final = plan.steps[plan.steps.length - 1].to;
  const fx = potionEffects(p, brew.mod, brew.form, state.edition);
  const perBatch = Math.min(brew.count, BOTTLES_PER_BATCH);

  const need = plan.items.map(([item, n]) =>
    `<div class="need-item">${countSlot("b:" + item, n)}<span>${esc(BREW_ITEMS[item])}<span class="sub">× ${n}</span></span></div>`).join("") +
    `<div class="need-item">${countSlot("b:blaze_powder", plan.fuel)}<span>Blaze Powder<span class="sub">× ${plan.fuel} as fuel</span></span></div>`;

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
    </li>`).join("");

  const foot = brew.form === "lingering" ? "Thrown as a cloud that gives a quarter of the potion’s duration."
    : brew.form === "splash" ? "Thrown. Gives the same duration as drinking it." : "Drink it.";
  $("brew-result").innerHTML = `
    <div class="res-top">
      <div class="res-title">${iconImg(stateIcon(final))}<h2>Brewing plan · ${state.edition === "java" ? "Java" : "Bedrock"}</h2></div>
      <div class="stats">
        <div class="stat"><div class="k">Brewing time</div><div class="v">${fmtTime(plan.seconds)}<small>min</small></div></div>
        <div class="stat"><div class="k">Blaze powder</div><div class="v">${plan.fuel}<small>fuel</small></div></div>
      </div>
      <div class="mini">
        <span>Bottles <b>${brew.count}</b></span>
        <span>Batches <b>${plan.batches}</b></span>
        <span>Steps per batch <b>${plan.steps.length}</b></span>
      </div>
      <p class="compare">${plan.batches > 1 ? `Run the steps below once for each of the <b>${plan.batches}</b> batches. Time is for a single brewing stand.` : "Time is for a single brewing stand."}</p>
      <div class="need">${need}</div>
    </div>
    <ol class="steps">${steps}</ol>
    <div class="final">
      <div class="mc-tooltip">
        ${plainSlot(stateIcon(final))}
        <div>
          <div class="tname plain">${esc(potionTitle(final.key, final.form))}</div>
          <ul>${fx.map(e => `<li class="${e.bad ? "bad" : "good"}">${esc(fxText(e))}</li>`).join("")}</ul>
          <div class="foot">${foot}</div>
        </div>
      </div>
    </div>`;
}

function renderBrew() {
  if (!modsFor(potionByKey(brew.potion)).includes(brew.mod)) brew.mod = "base";
  renderPotions();
  renderChoices();
  renderBrewResult();
  try { localStorage.setItem(BREW_KEY, JSON.stringify(brew)); } catch (_) {}
}

$("potions").addEventListener("click", e => {
  const b = e.target.closest("button[data-potion]");
  if (!b) return;
  brew.potion = b.dataset.potion;
  renderBrew();
  refocus(`#potion-${brew.potion}`);
});
$("brew-mod").addEventListener("click", e => {
  const b = e.target.closest("button[data-mod]:not([disabled])");
  if (!b) return;
  brew.mod = b.dataset.mod;
  renderBrew();
  refocus(`#brew-mod [data-mod="${brew.mod}"]`);
});
$("brew-form").addEventListener("click", e => {
  const b = e.target.closest("button[data-form]");
  if (!b) return;
  brew.form = b.dataset.form;
  renderBrew();
  refocus(`#brew-form [data-form="${brew.form}"]`);
});
$("brew-less").addEventListener("click", () => { brew.count = Math.max(1, brew.count - 1); renderBrew(); });
$("brew-more").addEventListener("click", () => { brew.count = Math.min(64, brew.count + 1); renderBrew(); });
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderBrew(); });

/* ---------- Tool tabs ---------- */
const VIEWS = ["anvil", "brewing", "trading", "mobs", "armorstands"];
function showView() {
  const current = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "anvil";
  for (const v of VIEWS) {
    $("view-" + v).hidden = v !== current;
    if (v === current) $("tab-" + v).setAttribute("aria-current", "page");
    else $("tab-" + v).removeAttribute("aria-current");
  }
}
window.addEventListener("hashchange", showView);

const SPLASHES = ["Never Too Expensive!", "Now with potions!", "Brew responsibly!", "Also try nether wart!", "XP well spent!", "Mind the blaze powder!", "Hrmm!", "Emeralds welcome!"];
$("splash").textContent = SPLASHES[Math.floor(Math.random() * SPLASHES.length)];

renderBrew();
showView();
