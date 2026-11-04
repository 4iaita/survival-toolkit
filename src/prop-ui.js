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
function showProp() {
  const p = propOf(stand.prop);
  $("prop-line").innerHTML = `<span class="name-chip code"><span class="src" aria-hidden="true"></span>§§</span><span>holding <b>${esc(p.n)}</b>: ${esc(p.what)}</span>`;
  $("prop-art").setAttribute("aria-label", `${p.what.replace(/\.$/, "")}, from an armor stand named §§ holding ${p.n}. Drag or use the arrow keys to turn it.`);
  propView.show(`prop:${p.k}`, 0);
}

$("props").addEventListener("click", e => {
  const b = e.target.closest("button[data-prop]");
  if (!b || b.dataset.prop === stand.prop) return;
  stand.prop = b.dataset.prop;
  for (const x of $("props").querySelectorAll("button[data-prop]")) x.setAttribute("aria-pressed", x.dataset.prop === stand.prop);
  showProp();
  saveStand();
});
window.addEventListener("hashchange", drawPropPictures);
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderProps(); });

renderProps();
