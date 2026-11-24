/* ---------- Armor stand props ---------- */
const stand = { prop: "white_wool" };
const STAND_KEY = "armor-stands-v1";
try { Object.assign(stand, JSON.parse(localStorage.getItem(STAND_KEY) || "{}")); } catch (_) {}
if (!PROP_LOOKS[stand.prop]) stand.prop = "white_wool";
const saveStand = () => { try { localStorage.setItem(STAND_KEY, JSON.stringify(stand)); } catch (_) {} };

// The picked prop on its stage, and every item as a slot showing its prop (drawn once each, a few at a time, the
// first time the tab is open; until then a slot shows the armor stand).
const propView = mobScene($("prop-art"), $("prop-tag"), { onTurn: () => $("prop-stage").classList.add("turned") });
$("prop-stage").style.setProperty("--ground", `url('${groundArt("plains")}')`);
const PROP_ITEMS = PROP_GROUPS.flatMap(g => g.items).filter(x => PROP_LOOKS[x.k]);
const propOf = k => PROP_ITEMS.find(x => x.k === k) || PROP_ITEMS[0];
// Which of its variants (PROP_VARIANTS) the picked prop shows, and which of its other row (PROP_ROWS).
let propVariant = 0, propRow = 0;
const PROP_PX = 72, propPictures = {};
const propSrc = k => propPictures[k] || icon("ui:armor_stand");
let drawingProps = false;
async function drawPropPictures() {
  if (drawingProps || $("view-armorstands").hidden || !packOn()) return;
  drawingProps = true;
  for (const x of PROP_ITEMS) {
    if (x.k in propPictures) continue;
    propPictures[x.k] = await propPicture(x.k, PROP_PX);
    for (const img of document.querySelectorAll(`img[data-prop="${x.k}"]`)) img.src = propSrc(x.k);
    await new Promise(done => setTimeout(done));
  }
}

function renderProps() {
  // The props come from the pack, which is Bedrock's: Java only gets a note saying so.
  for (const el of document.querySelectorAll("#view-armorstands [data-ed]")) el.hidden = el.dataset.ed !== state.edition;
  if (!packOn()) return;
  $("props").innerHTML = PROP_GROUPS.map(g => `
    <div>
      <div class="cat-label">${g.n}${g.what ? `<span class="cat-hint">${g.what}</span>` : ""}</div>
      <div class="slot-grid">${g.items.filter(x => PROP_LOOKS[x.k]).map(x =>
        `<button type="button" class="slot slot-btn" id="prop-${x.k}" data-prop="${x.k}" data-name="${esc(x.n)}" aria-label="${esc(x.n)}: ${esc(x.what)}" aria-pressed="${x.k === stand.prop}"><img class="ico" data-prop="${x.k}" src="${propSrc(x.k)}" alt="" width="36" height="36"></button>`).join("")}</div>
    </div>`).join("");
  showProp();
  drawPropPictures();
}
// squish: the prop is already there and changes variants, so it squishes instead of coming in.
function showProp(squish = false) {
  const p = propOf(stand.prop);
  $("prop-line").innerHTML = `<span class="name-chip code"><span class="src" aria-hidden="true"></span>§§</span>${ICONS[`held:${p.k}`] ? `<span>holding</span>${(p.icons || [p.k]).map(k => iconImg(`held:${k}`)).join("")}<span>` : "<span>holding "}<b>${esc(p.n)}</b>: ${esc(p.what)}</span>`;
  $("prop-art").setAttribute("aria-label", `${p.what.replace(/\.$/, "")}${PROP_VARIANTS[p.k] ? ` (${PROP_VARIANTS[p.k][propVariant]}${PROP_ROWS[p.k] ? `, ${PROP_ROWS[p.k].kinds[propRow].n.toLowerCase()} ${PROP_ROWS[p.k].what}` : ""})` : ""}, from an armor stand named §§ holding ${p.n}. Drag or use the arrow keys to turn it.`);
  const kinds = PROP_VARIANTS[p.k], row = PROP_ROWS[p.k];
  $("prop-variant-bar").hidden = !kinds;
  if (kinds) {
    $("prop-variant-label").textContent = `Variant: ${kinds[propVariant]}`;
    $("prop-variant-how").textContent = PROP_SWITCH[p.k] || "Change the stand’s pose to switch.";
    $("prop-variant-try").innerHTML = kinds.map((n, i) => `<button type="button" class="name-chip" data-variant="${i}" aria-pressed="${i === propVariant}">${n}</button>`).join("");
  }
  // A second choice that goes with each variant: a button in each color.
  $("prop-row-bar").hidden = !row;
  if (row) {
    $("prop-row-label").textContent = `${row.n}: ${row.kinds[propRow].n}`;
    $("prop-row-how").textContent = row.how;
    $("prop-row-try").innerHTML = row.kinds.map(({ n, swatch }, i) => `<button type="button" class="collar-swatch" data-kind="${i}" style="background:${swatch}" title="${n}" aria-label="${n}" aria-pressed="${i === propRow}"></button>`).join("");
  }
  propView.show(`prop:${p.k}`, row ? propRow * kinds.length + propVariant : propVariant, { squish });
}

$("props").addEventListener("click", e => {
  const b = e.target.closest("button[data-prop]");
  if (!b || b.dataset.prop === stand.prop) return;
  stand.prop = b.dataset.prop;
  // Another prop starts as it comes: its first variant, facing the way they all start (as another mob does).
  propVariant = propRow = 0;
  propView.turnBack();
  for (const x of $("props").querySelectorAll("button[data-prop]")) x.setAttribute("aria-pressed", x.dataset.prop === stand.prop);
  showProp();
  saveStand();
});
$("prop-variant-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-variant]");
  if (!b || Number(b.dataset.variant) === propVariant) return;
  propVariant = Number(b.dataset.variant);
  showProp(true);
  refocus(`#prop-variant-try button[data-variant="${propVariant}"]`);
});
$("prop-row-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-kind]");
  if (!b || Number(b.dataset.kind) === propRow) return;
  propRow = Number(b.dataset.kind);
  showProp(true);
  refocus(`#prop-row-try button[data-kind="${propRow}"]`);
});
window.addEventListener("hashchange", drawPropPictures);
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderProps(); });

renderProps();
