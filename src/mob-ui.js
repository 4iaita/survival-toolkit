/* ---------- Mobs ---------- */
// The picked mob and, for its name tags section, name: the picked name's first spelling, which stands for all of them; say: the spelling on the stage's plate.
const mobTab = { mob: "rabbit", name: "", say: "", query: "" };
const MOB_KEY = "mobs-v1";
try { Object.assign(mobTab, JSON.parse(localStorage.getItem(MOB_KEY) || "{}")); } catch (_) {}
if (!MOBS.some(m => m.k === mobTab.mob)) Object.assign(mobTab, { mob: "rabbit", name: "", say: "" });
const saveMobTab = () => { try { localStorage.setItem(MOB_KEY, JSON.stringify(mobTab)); } catch (_) {} };

for (const m of MOBS) {
  const spec = L(`egg_${m.k}`);
  if (artReady(spec)) ICONS[`mob:${m.k}`] = spec;
}
const mobOf = k => MOBS.find(m => m.k === k);
const mobName = m => (state.edition === "bedrock" && m.bedrockName) || m.n;
const mobIcon = m => (ICONS[`mob:${m.k}`] ? `mob:${m.k}` : "ui:name_tag");
const packOn = () => state.edition === "bedrock";

// Every name that does something to a mob: the game's own first, then the pack's. look is the MOB_LOOKS index the
// stage shows it with; flip and rainbow are the game's own effects.
function tagsFor(k) {
  const looks = MOB_LOOKS[k] || [];
  const lookOf = names => Math.max(0, looks.findIndex((l, i) => i && l.names.some(n => names.some(x => x.toLowerCase() === n.toLowerCase()))));
  const game = GAME_TAGS.filter(t => t.any || t.mob === k).map(t => ({ ...t, src: "game", look: t.look === "pack" ? lookOf(t.names) : 0, flip: t.look === "flip", rainbow: t.look === "rainbow" }));
  const pack = (PACK_TAGS[k] || []).map(t => ({ ...t, src: "pack", what: t.what || PACK_KINDS[t.kind], look: t.still ? 0 : lookOf(t.names) }));
  // A pack name the game already has (Toast) stays one name, with what the pack adds as a note.
  for (const t of game) {
    const same = pack.find(x => x.names.includes(t.names[0]));
    if (same) {
      t.pack = same.what;
      pack.splice(pack.indexOf(same), 1);
    }
  }
  return [...game, ...pack];
}
// The names the stage offers: the game's always, the pack's on Bedrock.
const shownTags = k => tagsFor(k).filter(t => t.src === "game" || packOn());
const currentTag = () => shownTags(mobTab.mob).find(t => t.names[0] === mobTab.name) || null;

// The picked mob's mood, for the mobs that have any, and its collar if the mood has one: they aren't remembered, so every
// mob starts calm, and with the collar the game gives it.
let mobMood = "calm", mobCollar = DEFAULT_COLLAR, mobSize = DEFAULT_SIZE;
// Whether it's a baby, for a mob the game has babies of: its look is the pack's baby look (babyLook), unless a name
// gives it a look of its own. Grown to start with, like the mood.
let mobBaby = false;
const babyLook = k => (GAME_BABIES.has(k) ? (MOB_LOOKS[k] || []).findIndex((l, i) => i && l.names.some(n => n.toLowerCase() === "baby")) : -1);
const isBaby = () => {
  const t = currentTag();
  return (mobBaby && babyLook(mobTab.mob) > 0 && !(t && t.look)) || Boolean(t && t.names[0].toLowerCase() === "baby");
};
// Its variant, for a mob that comes in several (MOB_VARIANTS): the first to start with, like the mood.
let mobVariant = "";
const variantInfo = () => (MOB_VARIANTS[mobTab.mob] || []).find(v => v.k === mobVariant) || (MOB_VARIANTS[mobTab.mob] || [])[0] || null;
// Its armor, in a mood that can wear any: none to start with, undyed, new and not enchanted when put on.
const NO_ARMOR = { on: false, dye: "", crack: "", glint: false };
let mobArmor = NO_ARMOR;
const moodsOf = k => (MOB_MOODS[k] ? ["calm", ...Object.keys(MOB_MOODS[k])] : []);
const moodInfo = () => (mobMood !== "calm" && MOB_MOODS[mobTab.mob] && MOB_MOODS[mobTab.mob][mobMood]) || null;
const collarTint = { color: hex(DYES[DEFAULT_COLLAR]) };
// The game doesn't put armor on a baby.
const armorFits = () => Boolean(moodInfo() && moodInfo().armor) && !isBaby();
const titled = name => name.replace(/(^| )\w/g, c => c.toUpperCase());

const mobStage = $("mob-stage");
// Each mob, and each variant of one, starts seen from the side, turned a little toward the reader.
const MOB_YAW = 0.6;
const mobView = mobScene($("mob-art"), $("mob-tag"), { onTurn: () => mobStage.classList.add("turned"), yaw: MOB_YAW });
const mobBackdrop = backdropView($("mob-backdrop"));

// jeb_'s wool fades from one dye color to the next, in the game's order; scrolling textures (the rainbow slime's)
// run on the clock.
const JEB_COLORS = ["white", "orange", "magenta", "light blue", "yellow", "lime", "pink", "gray", "light gray", "cyan", "purple", "blue", "brown", "green", "red", "black"];
const wool = { color: [255, 255, 255] }, mobClock = { t: 0 };
let jebStep = 0;

// The stage: the mob's own biome (its variant's, for one that has them), a name's own biome (biome: the cherry grove for
// a Cherry look), a snowy village for snowy names, and night for
// a name that only makes it glow.
function showOnStage() {
  const m = mobOf(mobTab.mob), t = currentTag(), variant = variantInfo();
  const look = t && t.look ? t.look : mobBaby && babyLook(m.k) > 0 ? babyLook(m.k) : 0;
  const tagEl = $("mob-tag");
  tagEl.textContent = t ? (t.names.includes(mobTab.say) ? mobTab.say : t.names[0]) : "";
  const biome = t && t.biome ? t.biome : t && t.kind === SNOWY ? "snowy" : (variant && variant.biome) || m.biome || "plains", night = Boolean(t && t.night) || glowsOnly(MOB_LOOKS[m.k], look);
  mobStage.dataset.biome = biome;
  mobStage.dataset.time = night ? "night" : "day";
  mobStage.style.setProperty("--ground", `url('${groundArt(biome)}')`);
  mobBackdrop.show(biome);
  if (!t || !t.rainbow) wool.color = [255, 255, 255];
  const collared = Boolean(moodInfo() && moodInfo().collar), armored = armorFits() && mobArmor.on;
  const armor = armored ? { kind: m.k, dye: mobArmor.dye || null, crack: mobArmor.crack || null, glint: mobArmor.glint } : null;
  collarTint.color = hex(DYES[mobCollar]);
  mobView.show(m.k, look, { flip: Boolean(t && t.flip), tint: collared ? collarTint : wool, clock: t && t.moving ? mobClock : null, night, glowing: m.glowing, stand: m.stand, swim: m.swim, zoom: (m.zoom || 1) * (MOB_SIZES[m.k] ? MOB_SIZES[m.k][mobSize].zoom : 1), sized: MOB_SIZES[m.k] ? mobSize : null, mood: mobMood === "calm" ? null : mobMood, armor, climate: (variant && variant.climate) || null, skins: (variant && variant.skins) || null, shown: variant && variant.show && !(look && look === babyLook(m.k)) ? variant.show : [] }).then(ok => {
    if (ok !== false) tagEl.hidden = !t;
  });
  $("mob-art").setAttribute("aria-label", `${article(look && look === babyLook(m.k) && !t ? "baby" : variant && variant.say !== "" ? variant.say || variant.n : mobName(m))} ${look && look === babyLook(m.k) && !t ? "baby " : ""}${variant && variant.say !== "" ? `${variant.say || variant.n.toLowerCase()} ` : ""}${mobName(m)}${MOB_SIZES[m.k] ? `, ${mobSize},` : ""}${t ? ` named ${t.names.includes(mobTab.say) ? mobTab.say : t.names[0]}` : " with no name"}${mobMood === "calm" ? "" : `, ${MOOD_NAMES[mobMood].toLowerCase()}`}${collared ? ` with a ${mobCollar} collar` : ""}${armored ? `, in ${mobArmor.glint ? "enchanted " : ""}${mobArmor.dye ? `${mobArmor.dye} ` : ""}armor` : ""}${night ? ", at night" : ""}. Drag or use the arrow keys to turn it.`);
}

// A name that only shows on some of the mob's variants (climate: the climates it shows in, a MOB_VARIANTS climate or
// temperate) can only be tried on those: on the others its buttons are off, saying which variants it needs.
const climatesOf = t => (t && t.climate ? [].concat(t.climate) : null);
const variantClimate = v => (v && v.climate) || "temperate";
const fitsVariant = (t, v = variantInfo()) => !climatesOf(t) || !MOB_VARIANTS[mobTab.mob] || climatesOf(t).includes(variantClimate(v));
const fitVariants = t => (MOB_VARIANTS[mobTab.mob] || []).filter(v => fitsVariant(t, v));

// A name as a button that tries it on the mob: spelling say of the name t.
const nameChip = (t, say, pressed) => {
  const off = !fitsVariant(t), why = off ? ` title="${esc(`Only on a ${fitVariants(t).map(v => v.n.toLowerCase()).join(" or ")} ${mobName(mobOf(mobTab.mob)).toLowerCase()}`)}" disabled` : "";
  return `<button type="button" class="name-chip" data-tag="${esc(t.names[0])}" data-say="${esc(say)}" aria-pressed="${pressed}"${why}><span class="src ${t.src}" aria-hidden="true"></span>${esc(say)}</button>`;
};

function renderMobPicker() {
  $("mob-picker").innerHTML = MOB_GROUPS.map(g => `
    <div>
      <div class="cat-label">${g}</div>
      <div class="slot-grid">${MOBS.filter(m => m.g === g).map(m =>
        `<button type="button" class="slot slot-btn" id="mob-pick-${m.k}" data-mob="${m.k}" data-name="${esc(mobName(m))}" aria-label="${esc(mobName(m))}" aria-pressed="${m.k === mobTab.mob}">${iconImg(mobIcon(m))}</button>`).join("")}</div>
    </div>`).join("");
  $("mob-name").textContent = mobName(mobOf(mobTab.mob));
}

// The age buttons, for a mob the game has babies of. A name with a look of its own shows that look instead.
function renderAge() {
  const can = babyLook(mobTab.mob) > 0;
  $("age-bar").hidden = !can;
  $("age-try").innerHTML = can ? [[false, "Adult"], [true, "Baby"]].map(([b, label]) => `<button type="button" class="name-chip" data-baby="${b ? "on" : ""}" aria-pressed="${b === mobBaby}">${label}</button>`).join("") : "";
}

// The variant buttons, for a mob that comes in variants, and where the picked one lives.
function renderVariants() {
  const variants = MOB_VARIANTS[mobTab.mob], v = variantInfo();
  $("variant-bar").hidden = !variants;
  $("variant-label").textContent = v ? `Variant: ${v.n}${v.where ? ` · ${v.where}` : ""}` : "Variant";
  $("variant-try").innerHTML = variants ? variants.map(x => `<button type="button" class="name-chip" data-variant="${x.k}" title="${esc(x.where)}" aria-pressed="${x === v}">${x.n}</button>`).join("") : "";
}

// The size buttons, for a mob that comes in sizes.
function renderSizes() {
  const sizes = MOB_SIZES[mobTab.mob];
  $("size-bar").hidden = !sizes;
  $("size-try").innerHTML = sizes ? Object.keys(sizes).map(k => `<button type="button" class="name-chip" data-size="${k}" aria-pressed="${k === mobSize}">${SIZE_NAMES[k]}</button>`).join("") : "";
}

// A button in a dye's color, for what can be dyed.
const dyeSwatch = (attr, c, pressed) =>
  `<button type="button" class="collar-swatch" data-${attr}="${c}" style="background:${DYES[c]}" title="${titled(c)}" aria-label="${titled(c)}" aria-pressed="${pressed}"></button>`;

// The mood buttons, for a mob that has moods, and what its mood lets it wear.
function renderMoods() {
  const moods = moodsOf(mobTab.mob);
  $("mood-bar").hidden = !moods.length;
  $("mood-try").innerHTML = moods.map(k => `<button type="button" class="name-chip" data-mood="${k}" aria-pressed="${k === mobMood}">${MOOD_NAMES[k]}</button>`).join("");
  const collared = Boolean(moodInfo() && moodInfo().collar);
  $("collar-row").hidden = !collared;
  if (collared) {
    $("collar-label").textContent = `Collar: ${titled(mobCollar)}`;
    $("collar-try").innerHTML = COLLAR_COLORS.map(c => dyeSwatch("collar", c, c === mobCollar)).join("");
  }
  const fits = armorFits(), on = fits && mobArmor.on;
  $("armor-row").hidden = !fits;
  $("armor-dye-row").hidden = $("armor-wear-row").hidden = $("armor-glint-row").hidden = !on;
  if (!fits) return;
  const chip = (attr, value, label, pressed) => `<button type="button" class="name-chip" data-${attr}="${value}" aria-pressed="${pressed}">${label}</button>`;
  $("armor-try").innerHTML = chip("armor", "", "None", !mobArmor.on) + chip("armor", "on", "Wolf Armor", mobArmor.on);
  if (!on) return;
  $("armor-dye-label").textContent = `Armor color: ${mobArmor.dye ? titled(mobArmor.dye) : "Undyed"}`;
  $("armor-dye-try").innerHTML = chip("armor-dye", "", "Undyed", !mobArmor.dye) + COLLAR_COLORS.map(c => dyeSwatch("armor-dye", c, c === mobArmor.dye)).join("");
  $("armor-wear-try").innerHTML = ARMOR_WEAR.map(([k, label]) => chip("armor-wear", k, label, k === mobArmor.crack)).join("");
  $("armor-glint-try").innerHTML = chip("armor-glint", "", "Not enchanted", !mobArmor.glint) + chip("armor-glint", "on", "Enchanted", mobArmor.glint);
}

function renderTry() {
  const t = currentTag();
  $("tag-try").innerHTML = `<button type="button" class="name-chip none" data-tag="" data-say="" aria-pressed="${!t}">No name</button>` +
    // Every name offers every spelling, the game's (Dinnerbone and Grumm) and the pack's (Baby, Pup and Dylan).
    shownTags(mobTab.mob).flatMap(x => x.names.map(n =>
      nameChip(x, n, t === x || (Boolean(t) && t.names[0] === x.names[0] && (t.names.includes(mobTab.say) ? mobTab.say : t.names[0]) === n)))).join("");
}

// One name's row: every spelling, what it does and anything it needs.
function tagRow(t) {
  const on = currentTag() && currentTag().names[0] === t.names[0];
  const notes = [];
  if (t[state.edition]) notes.push(esc(t[state.edition]));
  if (t.needs) notes.push(`<b>Needs:</b> ${esc(t.needs)}`);
  if (t.rare) notes.push(`Without the name, ${esc(t.rare)} look like this, picked again each time one loads.`);
  if (t.pack && packOn()) notes.push(`With Actions &amp; Stuff: ${esc(t.pack)}`);
  if (t.more) notes.push(`Also spelled ${t.more.map(n => `“${esc(n)}”`).join(", ")}.`);
  if (t.any) notes.push("Works on every mob.");
  return `<li class="tag-row${on ? " on" : ""}">
    <div class="tag-names">${t.names.map(n => nameChip(t, n, on && (mobTab.say === n || (!t.names.includes(mobTab.say) && n === t.names[0])))).join("")}</div>
    <div class="tag-text">${esc(t.what)}${notes.map(n => `<span class="sub">${n}</span>`).join("")}</div>
  </li>`;
}

// A mob's name tags section: every name that does something to it, the game's first, then the pack's.
function tagSection(m) {
  const list = tagsFor(m.k), game = list.filter(t => t.src === "game"), pack = list.filter(t => t.src === "pack");
  const count = packOn() ? list.length : game.length;
  return `<section class="mob-section" aria-labelledby="tag-section-title">
    <div class="mob-section-head"><h3 id="tag-section-title">${iconImg("ui:name_tag")}Name tags</h3><span class="lvl-note">${count} name${count === 1 ? "" : "s"} that do${count === 1 ? "es" : ""} something</span></div>
    <section class="tag-group">
      <div class="tag-group-head"><h4><span class="src game" aria-hidden="true"></span>In the game</h4><span class="lvl-note">No packs needed</span></div>
      <ul class="tag-list">${game.map(tagRow).join("")}</ul>
    </section>
    ${packOn() ? `<section class="tag-group">
      <div class="tag-group-head"><h4><span class="src" aria-hidden="true"></span>With Actions &amp; Stuff</h4><span class="lvl-note">Resource pack</span></div>
      ${pack.length ? `<ul class="tag-list">${pack.map(tagRow).join("")}</ul>` : `<p class="tag-note">The pack has no names for this mob.</p>`}
    </section>` : ""}
  </section>`;
}

// The picked mob's page: its title, then a section for each thing to know about it.
function renderMobResult() {
  const m = mobOf(mobTab.mob);
  $("mob-result").innerHTML = `
    <div class="res-top">
      <div class="res-title"><span class="slot">${iconImg(mobIcon(m))}</span>
        <div><h2>${esc(mobName(m))}</h2><div class="res-sub">${esc(m.g)} · ${state.edition === "java" ? "Java" : "Bedrock"} Edition</div></div>
      </div>
    </div>
    ${tagSection(m)}`;
}

// Search: names (any spelling) and mobs, across every mob.
function renderTagSearch() {
  const q = mobTab.query.trim().toLowerCase(), box = $("tag-results");
  if (!q) {
    const pick = packOn() ? ["Toast", "jeb_", "Dinnerbone", "Goldie", "Elf", "Snowy", "Baby"] : ["Dinnerbone", "Grumm", "jeb_", "Toast", "Johnny"];
    box.innerHTML = `<p class="choice-hint">Matches from every mob show here as you type. Or try one of these:</p>
      <div class="suggest">${pick.map(s => `<button type="button" class="mc-btn sm" data-suggest="${s}">${s}</button>`).join("")}</div>`;
    return;
  }
  const hits = [];
  for (const m of MOBS) {
    const mobHit = mobName(m).toLowerCase().includes(q);
    for (const t of tagsFor(m.k)) {
      if (t.src === "pack" && !packOn()) continue;
      if (t.any && !mobHit && hits.some(h => h.t.any)) continue;
      if (mobHit || [...t.names, ...(t.more || [])].some(n => n.toLowerCase().includes(q))) hits.push({ m, t, anyMob: t.any && !mobHit });
    }
  }
  box.innerHTML = hits.length
    ? hits.slice(0, 30).map(({ m, t, anyMob }) => `
      <button type="button" class="search-hit" data-mob="${anyMob ? mobTab.mob : m.k}" data-tag="${esc(t.names[0])}">
        <span class="slot sm">${iconImg(mobIcon(m))}</span>
        <span><span class="who"><span class="name-chip"><span class="src ${t.src}" aria-hidden="true"></span>${esc(t.names[0])}</span>${anyMob ? "Any mob" : esc(mobName(m))}</span><span class="deal">${esc(t.what)}</span></span>
      </button>`).join("") + (hits.length > 30 ? `<p class="choice-hint">And ${hits.length - 30} more. Type more of the name to narrow it down.</p>` : "")
    : `<p class="choice-hint">No mob reacts to a name like “${esc(mobTab.query.trim())}”.</p>`;
}

// Text that only fits one edition: the pack is Bedrock's, so Java leaves it out.
function renderEditionText() {
  $("mob-intro").textContent = packOn()
    ? "Every mob and boss you can meet in survival. Pick one to see it up close and try name tags on it: a few names do something in the game itself, and many more change how it looks with the Actions & Stuff resource pack."
    : "Every mob and boss you can meet in survival. Pick one to see it up close and try name tags on it: a few names do something special.";
  $("tag-search").placeholder = packOn() ? "Toast, Elf, Snowy, Wolf…" : "Dinnerbone, Toast, Sheep…";
  for (const li of document.querySelectorAll("#view-mobs [data-ed]")) li.hidden = li.dataset.ed !== state.edition;
}

function renderMobs() {
  if (!currentTag() && mobTab.name) mobTab.name = "";
  renderEditionText();
  renderMobPicker();
  renderAge();
  renderVariants();
  renderSizes();
  renderMoods();
  renderTry();
  renderMobResult();
  renderTagSearch();
  showOnStage();
  saveMobTab();
}

// A name picked from the search, or kept from last time, that doesn't fit the mob's variant starts it on the first
// variant it fits (a cold chicken for Snowy).
function fitClimate() {
  const t = currentTag();
  if (t && !fitsVariant(t) && fitVariants(t).length) mobVariant = fitVariants(t)[0].k;
}

function pickMob(k, name) {
  if (k !== mobTab.mob) {
    mobMood = "calm";
    mobCollar = DEFAULT_COLLAR;
    mobArmor = NO_ARMOR;
    mobSize = DEFAULT_SIZE;
    mobVariant = "";
    mobBaby = false;
    mobView.turnBack();
  }
  mobTab.mob = k;
  mobTab.name = mobTab.say = name || "";
  fitClimate();
  renderMobs();
}
function pickTag(name, say = name) {
  mobTab.name = name;
  mobTab.say = say;
  renderMoods();
  renderTry();
  renderMobResult();
  showOnStage();
  saveMobTab();
}

$("mob-picker").addEventListener("click", e => {
  const b = e.target.closest("button[data-mob]");
  if (!b || b.dataset.mob === mobTab.mob) return;
  pickMob(b.dataset.mob);
  refocus(`#mob-pick-${mobTab.mob}`);
});
$("mood-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-mood]");
  if (!b || b.dataset.mood === mobMood) return;
  mobMood = b.dataset.mood;
  renderMoods();
  showOnStage();
  refocus(`#mood-try button[data-mood="${mobMood}"]`);
});
$("age-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-baby]");
  if (!b || Boolean(b.dataset.baby) === mobBaby) return;
  mobBaby = Boolean(b.dataset.baby);
  renderAge();
  renderMoods();
  showOnStage();
  refocus(`#age-try button[data-baby="${b.dataset.baby}"]`);
});
$("variant-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-variant]");
  if (!b || b.dataset.variant === (variantInfo() || {}).k) return;
  mobVariant = b.dataset.variant;
  // A name that doesn't show on this variant goes.
  if (currentTag() && !fitsVariant(currentTag())) mobTab.name = mobTab.say = "";
  mobView.turnBack();
  renderVariants();
  renderTry();
  renderMobResult();
  showOnStage();
  saveMobTab();
  refocus(`#variant-try button[data-variant="${mobVariant}"]`);
});
$("size-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-size]");
  if (!b || b.dataset.size === mobSize) return;
  mobSize = b.dataset.size;
  renderSizes();
  showOnStage();
  refocus(`#size-try button[data-size="${mobSize}"]`);
});
$("collar-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-collar]");
  if (!b || b.dataset.collar === mobCollar) return;
  mobCollar = b.dataset.collar;
  renderMoods();
  showOnStage();
  refocus(`#collar-try button[data-collar="${mobCollar}"]`);
});
// A click on one of armor's buttons: value says what it changes.
const armorButton = (id, attr, change) => $(id).addEventListener("click", e => {
  const b = e.target.closest(`button[data-${attr}]`);
  if (!b) return;
  mobArmor = { ...mobArmor, ...change(b.dataset[attr.replace(/-(\w)/, (_, c) => c.toUpperCase())]) };
  renderMoods();
  showOnStage();
  refocus(`#${id} button[data-${attr}="${CSS.escape(b.getAttribute(`data-${attr}`))}"]`);
});
armorButton("armor-try", "armor", v => ({ on: Boolean(v) }));
armorButton("armor-dye-try", "armor-dye", v => ({ dye: v }));
armorButton("armor-wear-try", "armor-wear", v => ({ crack: v }));
armorButton("armor-glint-try", "armor-glint", v => ({ glint: Boolean(v) }));
for (const id of ["tag-try", "mob-result"]) $(id).addEventListener("click", e => {
  const b = e.target.closest("button[data-tag]");
  if (!b || b.disabled) return;
  pickTag(b.dataset.tag, b.dataset.say);
  refocus(`#${id} button[data-say="${CSS.escape(b.dataset.say || "")}"][data-tag="${CSS.escape(b.dataset.tag)}"]`);
});
$("tag-results").addEventListener("click", e => {
  const s = e.target.closest("button[data-suggest]");
  if (s) {
    $("tag-search").value = s.dataset.suggest;
    mobTab.query = s.dataset.suggest;
    renderTagSearch();
    saveMobTab();
    return;
  }
  const b = e.target.closest("button[data-mob]");
  if (b) pickMob(b.dataset.mob, b.dataset.tag);
});
$("tag-search").addEventListener("input", e => { mobTab.query = e.target.value; renderTagSearch(); saveMobTab(); });
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderMobs(); });

// The jeb_ sheep's wool fades through the dye colors and scrolling textures run while they're on the stage, unless
// the reader asks for less motion.
setInterval(() => {
  const t = currentTag(), rainbow = t && t.rainbow;
  if (!t || (!rainbow && !t.moving) || calmMotion() || document.hidden || $("view-mobs").hidden) return;
  if (rainbow) {
    jebStep = (jebStep + 1) % (JEB_COLORS.length * 6);
    const i = Math.floor(jebStep / 6), f = (jebStep % 6) / 6;
    const [a, b] = [JEB_COLORS[i], JEB_COLORS[(i + 1) % JEB_COLORS.length]].map(c => hex(DYES[c]));
    wool.color = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  }
  mobClock.t += 0.16;
  mobView.redraw();
}, 160);

$("tag-search").value = mobTab.query;
fitClimate();
renderMobs();
