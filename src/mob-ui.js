/* ---------- Mobs ---------- */
// The picked mob and, for its name tags section, name: the picked name's first spelling, which stands for all of them; say: the spelling on the stage's plate.
// section: which of the mob's sections shows (MOB_SECTIONS).
const mobTab = { mob: "rabbit", name: "", say: "", query: "", order: "az", section: "about" };
const MOB_KEY = "mobs-v1";
try { Object.assign(mobTab, JSON.parse(localStorage.getItem(MOB_KEY) || "{}")); } catch (_) {}
if (!MOBS.some(m => m.k === mobTab.mob)) Object.assign(mobTab, { mob: "rabbit", name: "", say: "" });
if (!["az", "dim", "behavior"].includes(mobTab.order)) mobTab.order = "az"; // the picker's order: A to Z, or by dimension or behavior
// The picked mob's sections, each a tab: [key, title, icon]. Taming, Riding and Trades only show for mobs that have them.
const MOB_SECTIONS = [["about", "Overview", "ui:mob"], ["tame", "Taming", "drop:Lead"], ["ride", "Riding", "drop:Saddle"],
  ["breed", "Breeding", "drop:Wheat"], ["trade", "Trades", "drop:Gold Ingot"], ["drops", "Drops", "drop:Bone"], ["tags", "Name tags", "ui:name_tag"]];
// The sections that only some mobs have, and where each says who has it.
const SOME_MOBS = { tame: MOB_TAMING, ride: MOB_RIDING, trade: MOB_TRADES };
const mobSections = k => MOB_SECTIONS.filter(([s]) => !SOME_MOBS[s] || SOME_MOBS[s][k]);
// The section showing: the one picked, or the overview for a mob without it (picking a mob that has it shows it again).
const shownSection = k => (mobSections(k).some(([s]) => s === mobTab.section) ? mobTab.section : "about");
if (!MOB_SECTIONS.some(([k]) => k === mobTab.section)) mobTab.section = "about";
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
// mob starts calm (or in its START_MOODS mood), and with the collar the game gives it; and at its biggest size (or its
// START_SIZES one).
const startMood = k => START_MOODS[k] || "calm", startSize = k => START_SIZES[k] || DEFAULT_SIZE;
let mobMood = startMood(mobTab.mob), mobCollar = DEFAULT_COLLAR, mobSize = startSize(mobTab.mob);
// Whether it's a baby, for a mob the game (or the pack) has babies of: its look is the pack's baby look (babyLook), unless a name
// gives it a look of its own. Grown to start with, like the mood.
let mobBaby = false;
const babyLook = k => (GAME_BABIES.has(k) || PACK_BABIES.has(k) ? (MOB_LOOKS[k] || []).findIndex((l, i) => i && l.names.some(n => n.toLowerCase() === "baby")) : -1);
const isBaby = () => {
  const t = currentTag();
  return (mobBaby && babyLook(mobTab.mob) > 0 && !(t && t.look)) || Boolean(t && t.names[0].toLowerCase() === "baby");
};
// Its variant, for a mob that comes in several (MOB_VARIANTS): the first to start with, like the mood.
let mobVariant = "";
// Its saddle, for a mob that can wear one (MOB_SADDLES), and its wool, for one that has some (MOB_WOOL): no saddle, and
// white wool, not sheared, to start with.
let mobSaddle = false, mobWool = "white", mobShorn = false;
const variantInfo = () => (MOB_VARIANTS[mobTab.mob] || []).find(v => v.k === mobVariant) || (MOB_VARIANTS[mobTab.mob] || [])[0] || null;
// The kinds it's picked in its other rows (MOB_ROWS), by row: a row not picked yet has its first.
let mobRows = {};
const rowsOf = k => MOB_ROWS[k] || [];
const rowKind = row => row.kinds.find(x => x.k === mobRows[row.k]) || row.kinds[0];
const rowKinds = k => rowsOf(k).map(rowKind);
// The textures the stage draws in place of the look's own: the variant's, then each row's over them.
function pickedSkins(k) {
  const out = { ...((variantInfo() || {}).skins || {}) };
  for (const kind of rowKinds(k)) {
    const skins = kind.skins || {};
    for (const [from, to] of Object.entries(out)) if (skins[to]) out[from] = skins[to];
    for (const [from, to] of Object.entries(skins)) if (!(from in out)) out[from] = to;
  }
  return Object.keys(out).length ? out : null;
}
// Its markings, for a mob that has some (MOB_MARKINGS), and its chest, for one that can carry one (MOB_CHESTS): none to
// start with.
let mobMarks = "", mobChest = false;
// Its carpet, for a mob that can wear one (MOB_CARPETS): a dye color, or "" for none, which it starts with.
let mobCarpet = "";
// The carpet the stage draws, if any: none on a baby.
const carpetWorn = (k, look) => (MOB_CARPETS[k] && mobCarpet && !babyShown(k, look) ? { layers: MOB_CARPETS[k].layers, texture: carpetTexture(mobCarpet) } : null);
// The dye colors the game picked for a mob it colors itself (MOB_TINTS), by row; a row not picked yet has its first.
let mobTints = {};
const tintsOf = k => (MOB_TINTS[k] ? MOB_TINTS[k].map(r => mobTints[r.k] || r.start) : null);
const marksInfo = () => (MOB_MARKINGS[mobTab.mob] || []).find(v => v.k === mobMarks) || (MOB_MARKINGS[mobTab.mob] || [])[0] || null;
// Its armor, for a mob that can wear any (in a mood that can, for one with moods): none to start with; type, which of
// MOB_ARMOR's kinds ("" for a mob with one kind); undyed, new and not enchanted when put on.
const NO_ARMOR = { on: false, type: "", dye: "", crack: "", glint: false };
let mobArmor = NO_ARMOR;
const moodsOf = k => (MOB_MOODS[k] ? ["calm", ...Object.keys(MOB_MOODS[k])] : []);
const moodInfo = () => (mobMood !== "calm" && MOB_MOODS[mobTab.mob] && MOB_MOODS[mobTab.mob][mobMood]) || null;
const moodStage = () => (MOOD_STAGE[mobTab.mob] && MOOD_STAGE[mobTab.mob][mobMood]) || {};
const collarTint = { color: hex(DYES[DEFAULT_COLLAR]) };
// The look the stage shows: a name's, else the baby look for a baby, else the plain one.
const shownLook = () => {
  const t = currentTag();
  return t && t.look ? t.look : mobBaby && babyLook(mobTab.mob) > 0 ? babyLook(mobTab.mob) : 0;
};
// The game doesn't put armor on a baby, nor (bare: their first names) on some named looks (the wolf's Hellhound).
const bareLook = (k, look) => Boolean(MOB_ARMOR[k] && MOB_ARMOR[k].bare && look > 0 && MOB_ARMOR[k].bare.includes(((MOB_LOOKS[k][look] || {}).names || [""])[0]));
const armorFits = () => Boolean(MOB_ARMOR[mobTab.mob]) && (MOB_MOODS[mobTab.mob] ? Boolean(moodInfo() && moodInfo().armor) : true) && !babyShown(mobTab.mob, shownLook()) && !bareLook(mobTab.mob, shownLook());
const armorPiece = (k, type) => MOB_ARMOR[k] && (MOB_ARMOR[k].kinds ? MOB_ARMOR[k].kinds[type] : MOB_ARMOR[k]);
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
// a Cherry look) and a snowy village for snowy names (at night for a mob that stands in a night), by day but for the
// nights (plains_night, swamp_night...: the phantom's and the undead's), where glowing layers show. A name whose difference is a glow (night: glowing eyes) shows its glowing
// layers all the same, so they can be seen against the day.
function showOnStage() {
  const m = mobOf(mobTab.mob), t = currentTag(), variant = variantInfo();
  const look = t && t.look ? t.look : mobBaby && babyLook(m.k) > 0 ? babyLook(m.k) : 0;
  const tagEl = $("mob-tag");
  tagEl.textContent = t ? (t.names.includes(mobTab.say) ? mobTab.say : t.names[0]) : "";
  const rowBiome = (rowKinds(m.k).find(x => x.biome) || {}).biome;
  const biome = t && t.biome ? t.biome : t && t.kind === SNOWY ? (/_night$/.test(m.biome || "") ? "snowy_night" : "snowy") : rowBiome || (variant && variant.biome) || m.biome || "plains", night = Boolean(t && t.night) || /_night$/.test(biome) || glowsOnly(MOB_LOOKS[m.k], look);
  mobStage.dataset.biome = biome;
  mobStage.style.setProperty("--ground", `url('${groundArt(biome)}')`);
  mobBackdrop.show(biome);
  if (!t || !t.rainbow) wool.color = hex(DYES[MOB_WOOL[m.k] ? mobWool : "white"]);
  const collared = Boolean(moodInfo() && moodInfo().collar), armored = armorFits() && mobArmor.on && !nameHides("armor");
  // A dye only colors armor that takes one (leather): picked on leather, it stays picked but doesn't color iron and the rest.
  const armorDye = armored && armorPiece(m.k, mobArmor.type).dyed ? mobArmor.dye : "";
  const armor = armored ? { kind: m.k, type: mobArmor.type, dye: armorDye || null, crack: mobArmor.crack || null, glint: mobArmor.glint } : null;
  const marks = marksInfo(), armorName = armored && MOB_ARMOR[m.k].kinds ? `${ARMOR_NAMES[m.k][mobArmor.type].toLowerCase()} ` : "";
  collarTint.color = hex(DYES[mobCollar]);
  mobView.show(m.k, look, { plays: MOB_WOOL[m.k] && mobShorn && !babyShown(m.k, look) ? MOB_WOOL[m.k].shornPlays || null : null, flip: Boolean(t && t.flip), tint: collared ? collarTint : wool, clock: (t && t.moving) || moodStage().moving ? mobClock : null, night: false, glowing: m.glowing || night || Boolean(moodStage().glowing), stand: m.stand, swim: m.swim, zoom: (m.zoom || 1) * (MOB_SIZES[m.k] ? MOB_SIZES[m.k][mobSize].zoom : 1), sized: MOB_SIZES[m.k] ? mobSize : null, mood: mobMood === "calm" ? null : mobMood, armor, climate: (variant && variant.climate) || null, skins: pickedSkins(m.k), overlays: (marks && marks.over) || null, shown: shownParts(m.k, look), carpet: carpetWorn(m.k, look), dyes: tintsOf(m.k) }).then(ok => {
    if (ok !== false) tagEl.hidden = !t;
  });
  $("mob-art").setAttribute("aria-label", `${article(look && look === babyLook(m.k) && !t ? "baby" : wearWords(m.k, look)[0] || (variant && variant.say !== "" ? variant.say || variant.n : mobName(m)))} ${look && look === babyLook(m.k) && !t ? "baby " : ""}${wearWords(m.k, look).map(w => `${w} `).join("")}${variant && variant.say !== "" ? `${variant.say || variant.n.toLowerCase()} ` : ""}${mobName(m)}${rowKinds(m.k).map(x => `, ${x.say || x.n.toLowerCase()}`).join("")}${marks && marks.over ? ` with ${marks.n.toLowerCase()} markings` : ""}${MOB_TINTS[m.k] ? ` (${MOB_TINTS[m.k].map((r, i) => `${r.n.toLowerCase()} ${tintsOf(m.k)[i]}`).join(", ")})` : ""}${MOB_SIZES[m.k] ? `, ${mobSize},` : ""}${t ? ` named ${t.names.includes(mobTab.say) ? mobTab.say : t.names[0]}` : " with no name"}${mobMood === "calm" ? "" : `, ${MOOD_NAMES[mobMood].toLowerCase()}`}${collared ? ` with a ${mobCollar} collar` : ""}${armored ? (ARMOR_LABELS[m.k] ? `, wearing ${article(armorName)} ${armorName}${ARMOR_LABELS[m.k].toLowerCase()}` : `, in ${mobArmor.glint ? "enchanted " : ""}${armorDye ? `${armorDye} ` : ""}${armorName}armor`) : ""}${MOB_CHESTS[m.k] && mobChest && !babyShown(m.k, look) ? ", carrying a chest" : ""}${carpetWorn(m.k, look) ? `, wearing ${article(mobCarpet)} ${mobCarpet} carpet` : ""}. Drag or use the arrow keys to turn it.`);
}

// A name that hides what the mob wears (hides: "saddle" or "armor", a nautilus named Saddleless or Armourless): the
// stage leaves it off, though it's still worn.
const nameHides = what => Boolean(currentTag() && currentTag().hides === what);
// Whether the stage shows a baby: the mob's baby look, or a name's baby look (a pig's Zombified Piglet, a camel's Baby
// Mummy), drawn smaller. A baby can't be saddled or sheared (the camel's baby looks have no saddle at all), and wears no
// variant's parts.
const babyShown = (k, look) => Boolean(look) && (look === babyLook(k) || ((MOB_LOOKS[k] || [])[look] || {}).scale < 1);
// The parts the stage shows or hides besides the look's own: its variant's (a goat's horns), a saddle, a chest, shorn wool
// and what armor makes way for (a snowy horse's snow).
function shownParts(k, look) {
  if (babyShown(k, look)) return [];
  const variant = variantInfo(), wool = MOB_WOOL[k], name = ((MOB_LOOKS[k] || [])[look] || { names: [] }).names[0];
  return [...((variant && variant.show) || []), ...(MOB_SADDLES[k] && mobSaddle && !nameHides("saddle") ? MOB_SADDLES[k] : []), ...(MOB_CHESTS[k] && mobChest ? MOB_CHESTS[k] : []),
    ...(wool && mobShorn ? [...wool.shorn, ...((wool.shornLooks || {})[name] || [])] : []), ...(armorFits() && mobArmor.on ? ARMOR_SHOWS[k] || [] : [])];
}
// How the stage's description puts what it wears: saddled, sheared, its wool's color (a white sheep is just a sheep).
const wearWords = (k, look) => (babyShown(k, look) ? [] : [MOB_SADDLES[k] && mobSaddle ? "saddled" : "", MOB_WOOL[k] && mobShorn ? "sheared" : ""])
  .concat(MOB_WOOL[k] && mobWool !== "white" ? [mobWool] : []).filter(Boolean);

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

// The mob picker's spawn eggs, A to Z by the edition's names, or split by the dimension each mob lives in or by its
// behavior (A to Z within each).
function renderMobPicker() {
  const slots = list => `<div class="slot-grid">${list.map(m =>
    `<button type="button" class="slot slot-btn" id="mob-pick-${m.k}" data-mob="${m.k}" data-name="${esc(mobName(m))}" aria-label="${esc(mobName(m))}" aria-pressed="${m.k === mobTab.mob}">${iconImg(mobIcon(m))}</button>`).join("")}</div>`;
  const sorted = [...MOBS].sort((a, b) => mobName(a).localeCompare(mobName(b)));
  $("mob-order").value = mobTab.order;
  const groups = { dim: [MOB_DIMS, mobDim], behavior: [MOB_BEHAVIORS, mobBehavior] }[mobTab.order];
  $("mob-picker").innerHTML = groups
    ? groups[0].map(([g, label]) => `
    <div>
      <div class="cat-label">${label}</div>
      ${slots(sorted.filter(m => groups[1](m) === g))}
    </div>`).join("")
    : slots(sorted);
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
  // A variant with a swatch (a color: the shulker's dyes) is a button in that color, as a dye's is.
  $("variant-try").innerHTML = variants ? variants.map(x => x.swatch
    ? `<button type="button" class="collar-swatch" data-variant="${x.k}" style="background:${x.swatch}" title="${esc(x.n)}" aria-label="${esc(x.n)}" aria-pressed="${x === v}"></button>`
    : `<button type="button" class="name-chip" data-variant="${x.k}" title="${esc(x.where)}" aria-pressed="${x === v}">${x.n}</button>`).join("") : "";
}

// A row of buttons for each of its other rows (MOB_ROWS), and what the picked kind is and where it's found.
function renderRows() {
  $("kind-rows").innerHTML = rowsOf(mobTab.mob).map(r => {
    const v = rowKind(r);
    return `
    <div class="try-bar">
      <span class="cat-label" id="row-label-${r.k}">${r.n}: ${v.n}${v.where ? ` · ${esc(v.where)}` : ""}</span>
      <div class="try-tags" role="group" aria-labelledby="row-label-${r.k}">${r.kinds.map(x =>
        `<button type="button" class="name-chip" data-row="${r.k}" data-kind="${x.k}" title="${esc(x.where)}" aria-pressed="${x === v}">${x.n}</button>`).join("")}</div>
    </div>`;
  }).join("");
}

// The markings buttons, for a mob whose coat has them, and what each looks like and how often.
function renderMarks() {
  const marks = MOB_MARKINGS[mobTab.mob], v = marksInfo();
  $("marks-bar").hidden = !marks;
  $("marks-label").textContent = v ? `Markings: ${v.n}${v.where ? ` · ${v.where}` : ""}` : "Markings";
  $("marks-try").innerHTML = marks ? marks.map(x => `<button type="button" class="name-chip" data-marks="${x.k}" title="${esc(x.where)}" aria-pressed="${x === v}">${x.n}</button>`).join("") : "";
}

// The color rows, for a mob the game colors with dyes of its own picking (the tropical fish's body and pattern).
function renderTints() {
  const rows = MOB_TINTS[mobTab.mob], picked = tintsOf(mobTab.mob);
  $("tint-bar").hidden = !rows;
  $("tint-rows").innerHTML = rows ? rows.map((r, i) => `
    <div class="collar-row">
      <span class="cat-label" id="tint-label-${r.k}">${r.n}: ${titled(picked[i])}</span>
      <div class="try-tags" role="group" aria-labelledby="tint-label-${r.k}">${COLLAR_COLORS.map(c =>
        `<button type="button" class="collar-swatch" data-tint="${r.k}" data-color="${c}" style="background:${DYES[c]}" title="${titled(c)}" aria-label="${titled(c)}" aria-pressed="${c === picked[i]}"></button>`).join("")}</div>
    </div>`).join("") : "";
}

// The saddle buttons, for a mob that can wear one, and for a sheep its wool's colors and, on a row of their own, whether
// it's sheared (a sheared sheep keeps its color on its head and a few tufts). A baby can have neither a saddle nor its
// wool sheared: those buttons are off for it.
function renderWear() {
  const k = mobTab.mob, baby = babyShown(k, shownLook());
  const chip = (attr, value, label, pressed, off) => `<button type="button" class="name-chip" data-${attr}="${value}" aria-pressed="${pressed}"${off ? ` disabled title="${esc(off)}"` : ""}>${label}</button>`;
  $("saddle-bar").hidden = !MOB_SADDLES[k];
  if (MOB_SADDLES[k]) $("saddle-try").innerHTML = chip("saddle", "", "No saddle", !mobSaddle || baby) + chip("saddle", "on", "Saddled", mobSaddle && !baby, baby && "The game doesn’t saddle a baby");
  $("chest-bar").hidden = !MOB_CHESTS[k];
  if (MOB_CHESTS[k]) $("chest-try").innerHTML = chip("chest", "", "No chest", !mobChest || baby) + chip("chest", "on", "Chest", mobChest && !baby, baby && "The game doesn’t give a baby a chest");
  const carpets = MOB_CARPETS[k];
  $("carpet-bar").hidden = !carpets;
  if (carpets) {
    const on = mobCarpet && !baby;
    $("carpet-label").textContent = `Carpet: ${on ? titled(mobCarpet) : carpets.none}`;
    $("carpet-try").innerHTML = chip("carpet", "", carpets.none, !on) + COLLAR_COLORS.map(c => baby
      ? `<button type="button" class="collar-swatch" data-carpet="${c}" style="background:${DYES[c]}" title="The game doesn’t put a carpet on a baby" aria-label="${titled(c)}" aria-pressed="false" disabled></button>`
      : dyeSwatch("carpet", c, c === mobCarpet)).join("");
  }
  const wool = MOB_WOOL[k];
  $("shear-bar").hidden = !wool;
  $("wool-bar").hidden = !(wool && wool.natural);
  if (!wool) return;
  const shorn = mobShorn && !baby;
  if (wool.natural) {
    $("wool-label").textContent = `Wool: ${titled(mobWool)}${wool.natural[mobWool] ? ` · ${wool.natural[mobWool]}` : " · Dyed"}`;
    $("wool-try").innerHTML = [...Object.keys(wool.natural), ...COLLAR_COLORS.filter(c => !wool.natural[c])].map(c => dyeSwatch("wool", c, c === mobWool)).join("");
  }
  $("shear-try").innerHTML = chip("shorn", "", "Not sheared", !shorn) + chip("shorn", "on", "Sheared", shorn, baby && "The game doesn’t shear a lamb");
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
  $("mood-label").textContent = (MOOD_ROWS[mobTab.mob] || { label: "Mood" }).label;
  $("mood-try").innerHTML = moods.map(k => `<button type="button" class="name-chip" data-mood="${k}" aria-pressed="${k === mobMood}">${moodName(mobTab.mob, k)}</button>`).join("");
  const collared = Boolean(moodInfo() && moodInfo().collar);
  $("collar-row").hidden = !collared;
  if (collared) {
    $("collar-label").textContent = `Collar: ${titled(mobCollar)}`;
    $("collar-try").innerHTML = COLLAR_COLORS.map(c => dyeSwatch("collar", c, c === mobCollar)).join("");
  }
  renderArmor();
}

// The armor buttons, for a mob that can wear armor (a wolf only as a pet): its kinds (a horse's leather, iron and so on),
// and for the one it wears, its dye (leather and wolf armor), wear and enchantment (wolf armor; horse armor can't be
// enchanted).
function renderArmor() {
  const k = mobTab.mob, fits = armorFits(), on = fits && mobArmor.on, piece = on && armorPiece(k, mobArmor.type);
  $("armor-bar").hidden = !fits;
  $("armor-dye-row").hidden = !(piece && piece.dyed);
  $("armor-wear-row").hidden = !(piece && piece.cracks);
  $("armor-glint-row").hidden = !(on && !MOB_ARMOR[k].kinds);
  if (!fits) return;
  const chip = (attr, value, label, pressed) => `<button type="button" class="name-chip" data-${attr}="${value}" aria-pressed="${pressed}">${label}</button>`;
  $("armor-label").textContent = ARMOR_LABELS[k] || "Armor";
  $("armor-try").innerHTML = chip("armor", "none", "None", !mobArmor.on) + Object.entries(ARMOR_NAMES[k]).map(([type, label]) => chip("armor", type, label, mobArmor.on && mobArmor.type === type)).join("");
  if (!on) return;
  $("armor-dye-label").textContent = `Armor color: ${mobArmor.dye ? titled(mobArmor.dye) : "Undyed"}`;
  $("armor-dye-try").innerHTML = chip("armor-dye", "", "Undyed", !mobArmor.dye) + COLLAR_COLORS.map(c => dyeSwatch("armor-dye", c, c === mobArmor.dye)).join("");
  $("armor-wear-try").innerHTML = ARMOR_WEAR.map(([w, label]) => chip("armor-wear", w, label, w === mobArmor.crack)).join("");
  $("armor-glint-try").innerHTML = chip("armor-glint", "", "Not enchanted", !mobArmor.glint) + chip("armor-glint", "on", "Enchanted", mobArmor.glint);
}

// The stage's name tag picker groups the names into sections, each a dropdown of its names. A name's section, by
// these rules in turn: the game's own; a baby look; the mob's own sections (TAG_GROUP_MOB, matched on the first
// spelling); hiding what it wears; a biome's look; Halloween (Halloween among its spellings, or a word of one: the
// Baby Gremlin with the Gremlin); Christmas; a rare look some spawn with; else a costume.
const TAG_GROUP_ORDER = ["Game", "Baby", "Biomes", "Rare", "Halloween", "Christmas", "Movie", "Queens", "Birds", "Bugs",
  "Sports", "Billiards", "Toys", "Floaties", "Costumes", "Size", "Gear"];
const BIOME_LOOKS = new Set(["Snowy", "Cherry", "Blossom", "Dappled", "Poplar", "Sulfur", "Pale"]);
const XMAS_WORDS = new Set(["Festive", "Elf", "Reindeer", "Rudolph", "Snowman", "Krampus", "Claus", "Zanta", "Nutcracker", "Spruce"]);
const TAG_GROUP_MOB = {
  bee: [[/Moth|Firefly/, "Bugs"], [/^(Queen|Qween)$/, "Queens"]],
  chicken: [[/^(Chicken Jockey|Lava Chicken)$/, "Movie"], [/^(Turkey|Rooster|Duck|Peep)$/, "Birds"]],
  parrot: [[/./, "Birds"]],
  sulfur_cube: [[/Billiards/, "Billiards"], [/Floaty/, "Floaties"], [/^§/, "Size"], [/Beach|Plastic|Die|Bomb|Cheese/, "Toys"], [/./, "Sports"]],
};
// How a name shows in its section: by a spelling other than the section's (Gremlin, not Halloween, in Halloween).
const groupSay = (t, g) => t.names.find(n => n !== g && n !== "Halloween" && n !== "Festive") || t.names[0];
const tagWords = t => t.names.flatMap(n => n.split(" "));
function tagGroup(t, k) {
  if (t.src === "game") return "Game";
  if (t.kind === BABY) return "Baby";
  const own = (TAG_GROUP_MOB[k] || []).find(([re]) => re.test(t.names[0]));
  if (own) return own[1];
  if (t.hides) return "Gear";
  if (t.kind === SNOWY || BIOME_LOOKS.has(t.names[0])) return "Biomes";
  const spooky = new Set(tagsFor(k).filter(x => x.names.includes("Halloween")).flatMap(tagWords).filter(w => w !== "Halloween" && w !== "Baby"));
  if (t.names.includes("Halloween") || t.names[0] === "Trick Or Treat" || tagWords(t).some(w => spooky.has(w))) return "Halloween";
  if (tagWords(t).some(w => XMAS_WORDS.has(w))) return "Christmas";
  if (t.rare) return "Rare";
  return "Costumes";
}
// Which section's dropdown is open, if any.
let tagGroupOpen = "";
function renderTry() {
  const t = currentTag(), groups = new Map();
  for (const x of shownTags(mobTab.mob)) {
    const g = tagGroup(x, mobTab.mob);
    groups.set(g, [...(groups.get(g) || []), x]);
  }
  const order = [...groups.keys()].sort((a, b) => TAG_GROUP_ORDER.indexOf(a) - TAG_GROUP_ORDER.indexOf(b));
  if (!groups.has(tagGroupOpen)) tagGroupOpen = "";
  const picked = t && tagGroup(t, mobTab.mob), plate = t && (t.names.includes(mobTab.say) ? mobTab.say : t.names[0]);
  const say = t && (plate === picked ? groupSay(t, picked) : plate);
  $("tag-try").innerHTML = `<button type="button" class="name-chip none" data-tag="" data-say="" aria-pressed="${!t}">No name</button>` +
    order.map(g => `<button type="button" class="name-chip tag-group-btn${g === picked ? " picked" : ""}" data-tag-group="${g}" aria-expanded="${g === tagGroupOpen}"${g === tagGroupOpen ? ` aria-controls="tag-try-panel"` : ""}>` +
      `<span class="src${g === "Game" ? " game" : ""}" aria-hidden="true"></span>${g}${g === picked ? `<span class="pick">${esc(say)}</span>` : ""}<span class="caret" aria-hidden="true"></span></button>`).join("") +
    // The open section's names, each by one spelling (the Name tags section below lists every spelling), the picked
    // one by the spelling on the plate.
    (tagGroupOpen ? `<div class="tag-group-panel" id="tag-try-panel" role="group" aria-label="${tagGroupOpen} names">${groups.get(tagGroupOpen).map(x => {
      const on = Boolean(t) && t.names[0] === x.names[0];
      return nameChip(x, on ? plate : groupSay(x, tagGroupOpen), on);
    }).join("")}</div>` : "");
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

// How name tags work, under a mob's names: the game's rules, then the pack's on Bedrock. Whether it's open is kept
// across re-renders (picking a name redraws the section).
const TAG_RULES = [
  ["", "Craft a name tag from paper and an iron, gold or copper nugget, or find one in dungeon and mineshaft chests, while fishing, or for sale from a wandering trader."],
  ["", "Rename it in an anvil, which costs 1 level, then use it on the mob. The tag is used up, and a named mob no longer despawns (wandering traders still do)."],
  ["", "The game’s own names are case sensitive: Toast works, toast doesn’t."],
  ["bedrock", "Actions &amp; Stuff takes its names with a capital first letter or all in lower case."],
  ["bedrock", "Actions &amp; Stuff is a resource pack, so its names only change looks. A mob that looks like a baby is still grown up, with a grown mob’s health, size and drops."],
  ["bedrock", "The pack also gives some looks to a few mobs at random. It picks again each time the mob loads, so name it to keep the look."],
  ["bedrock", "The pack’s names here are from Actions &amp; Stuff 1.9, read from the pack itself."],
];
let tagRulesOpen = false;
const tagRules = () => `<details class="rules tag-rules"${tagRulesOpen ? " open" : ""}>
    <summary>How name tags work</summary>
    <ul>${TAG_RULES.filter(([ed]) => !ed || ed === state.edition).map(([, text]) => `<li>${text}</li>`).join("")}</ul>
  </details>`;

// A mob's name tags section: every name that does something to it, the game's first, then the pack's.
function tagSection(m) {
  const list = tagsFor(m.k), game = list.filter(t => t.src === "game"), pack = list.filter(t => t.src === "pack");
  const count = packOn() ? list.length : game.length;
  return `<div class="mob-section-head"><h3 id="tag-section-title">${iconImg("ui:name_tag")}Name tags</h3><span class="lvl-note">${count} name${count === 1 ? "" : "s"} that do${count === 1 ? "es" : ""} something</span></div>
    <section class="tag-group">
      <div class="tag-group-head"><h4><span class="src game" aria-hidden="true"></span>In the game</h4><span class="lvl-note">No packs needed</span></div>
      <ul class="tag-list">${game.map(tagRow).join("")}</ul>
    </section>
    ${packOn() ? `<section class="tag-group">
      <div class="tag-group-head"><h4><span class="src" aria-hidden="true"></span>With Actions &amp; Stuff</h4><span class="lvl-note">Resource pack</span></div>
      ${pack.length ? `<ul class="tag-list">${pack.map(tagRow).join("")}</ul>` : `<p class="tag-note">The pack has no names for this mob.</p>`}
    </section>` : ""}
    ${tagRules()}`;
}

// A mob's facts for the edition picked: Bedrock's own where it differs.
const mobInfo = k => ({ ...MOB_INFO[k], ...(state.edition === "bedrock" && MOB_INFO[k].bedrock) });
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const sectionHead = (id, icon, title, note = "") =>
  `<div class="mob-section-head"><h3 id="${id}">${iconImg(icon)}${title}</h3>${note ? `<span class="lvl-note">${note}</span>` : ""}</div>`;
// An item with its picture: a slot, or an empty one for something without a texture (a mob's head).
// A drop that differs each time (INFO_CYCLES) shows its examples in turn; the slot's title names the one showing.
function infoSlot(name) {
  if (INFO_GLINT.has(name) && infoIcon(name)) {
    const key = infoIcon(name);
    return `<span class="slot sm glint" style="--m:url('${icon(key)}')">${iconImg(key)}</span>`;
  }
  const cycle = (INFO_CYCLES[name] || []).filter(infoIcon);
  if (cycle.length) {
    return `<span class="slot sm" title="For example: ${esc(cycle[0])}" data-examples="${esc(cycle.join("|"))}" data-at="0">${iconImg(infoIcon(cycle[0]))}</span>`;
  }
  return `<span class="slot sm">${infoIcon(name) ? iconImg(infoIcon(name)) : ""}</span>`;
}

// Overview: health, attack, behavior and home, then where it spawns, taming and what's special.
function aboutSection(m) {
  const info = mobInfo(m.k);
  const hearts = typeof info.hp === "number" ? `${info.hp / 2} ${info.hp === 2 ? "heart" : "hearts"}` : "";
  const attack = info.attack === undefined ? "None"
    : typeof info.attack === "number" ? `${info.attack}`
    : typeof info.attack === "object" ? `${info.attack.normal}` : esc(info.attack);
  const attackSub = info.attack && typeof info.attack === "object" ? `Easy ${info.attack.easy} · Hard ${info.attack.hard}` : info.attack === undefined ? "Never hurts you" : "";
  const stat = (label, value, sub, cls = "") => `<div class="mob-stat${cls}"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="sub">${sub}</span>` : ""}</div>`;
  const behavior = MOB_BEHAVIORS.find(([k]) => k === mobBehavior(m))[1];
  // Every dimension it's found in (its own, if MOB_DIMENSIONS doesn't say more), and where.
  const where = MOB_DIMENSIONS[m.k] || {}, dimNote = where.note;
  const dims = (where.dims || [mobDim(m)]).map(d => MOB_DIMS.find(([k]) => k === d)[1]);
  const typedAttack = typeof info.attack === "string";
  const row = (label, text) => (text ? `<div class="fact-row"><dt>${label}</dt><dd>${esc(text)}</dd></div>` : "");
  return `${sectionHead("mob-section-title", "ui:mob", "Overview")}
    <div class="mob-stats">
      ${stat("Health", typeof info.hp === "number" ? `${info.hp}` : esc(info.hp), hearts, typeof info.hp === "number" ? "" : " text")}
      ${stat("Attack", attack, attackSub || (typeof info.attack === "object" ? "On Normal" : ""), typedAttack ? " text" : "")}
      ${stat("Behavior", behavior, { passive: "Never attacks", neutral: "Attacks when provoked", aggressive: "Attacks on sight" }[mobBehavior(m)])}
      ${stat(dims.length > 1 ? "Dimensions" : "Dimension", dims.join(", "), "", dims.length > 1 ? " text" : "")}
    </div>
    <dl class="fact-list">
      ${row("Spawns", info.spawn)}
      ${row("Dimensions", dimNote && `${dimNote}.`)}
      ${row("Good to know", info.about)}
    </dl>`;
}

// A list of items with their pictures, under a label when it has one.
const itemList = (items, label) => `${label ? `<div class="cat-label">${esc(label)}</div>` : ""}
  <ul class="item-list">${items.map(f => `<li class="item-row">${infoSlot(f)}<span class="item-name">${esc(f)}</span></li>`).join("")}</ul>`;

// Taming: what tames it (or helps), how, and what a tamed one does.
function tameSection(m) {
  const t = MOB_TAMING[m.k], byRiding = t.label === BY_RIDING;
  const note = !t.items ? "Tamed already" : byRiding ? "Tamed by riding it" : `Tamed with ${plural(t.items.length, "item")}`;
  return `${sectionHead("mob-section-title", "drop:Lead", "Taming", note)}
    ${t.items ? itemList(t.items, t.label) : ""}
    <dl class="fact-list">
      <div class="fact-row"><dt>How</dt><dd>${esc(t.how)}</dd></div>
      ${t.after ? `<div class="fact-row"><dt>Once tamed</dt><dd>${esc(t.after)}</dd></div>` : ""}
    </dl>`;
}

// Riding: what it takes to ride and steer it, and how it rides.
function rideSection(m) {
  const r = MOB_RIDING[m.k];
  return `${sectionHead("mob-section-title", "drop:Saddle", "Riding", r.needs ? `Needs ${r.needs.map(n => n.toLowerCase()).join(" and ")}` : "Nothing needed")}
    ${r.needs ? itemList(r.needs) : ""}
    <p class="mob-lead">${esc(r.how)}</p>`;
}

// A job site block with its picture.
const jobSite = (site, text) => `<div class="job-site"><span class="slot sm">${ICONS[`site:${site}`] ? iconImg(`site:${site}`) : ""}</span><span>${text}</span></div>`;

// The villager's trades: the picked profession's, level by level, drawn as on the Villager Trades tab, under its job
// site block. The kind its village gives (a boat's wood) is marked by the biome picked on the stage.
function jobTradeSection(m) {
  const job = (variantInfo() || {}).k, v = VILLAGERS.find(x => x.k === job);
  const how = tradeHow(MOB_TRADES[m.k]);
  // A button for each job (the stage's Variant buttons, with each one's job site block).
  const jobs = `<div class="job-picker" role="group" aria-label="Job">${MOB_VARIANTS[m.k].map(x => {
    const site = (VILLAGERS.find(w => w.k === x.k) || {}).site;
    return `<button type="button" class="name-chip job-chip" data-job="${x.k}" aria-pressed="${x.k === job}"${site ? ` title="Job site: ${esc(site)}"` : ""}>${site && ICONS[`site:${site}`] ? iconImg(`site:${site}`) : ""}${esc(x.n)}</button>`;
  }).join("")}</div>`;
  const biome = { snow: "snowy" }[rowKind(rowsOf(m.k)[0]).k] || rowKind(rowsOf(m.k)[0]).k;
  if (!v) {
    const why = job === "nitwit" ? "A nitwit never takes a job, so it never trades."
      : "An unemployed villager doesn't trade until it takes a job: put a job site block near it.";
    return `${sectionHead("mob-section-title", "ui:emerald", "Trades", "No trades")}
      ${jobs}
      <p class="mob-lead">${why} Pick a job above to see its trades.</p>
      ${how}`;
  }
  const all = v.trades.flat(), earn = all.filter(isEarn).length;
  const offers = list => list.length === 1 ? "One trade" : list.length === 2 ? "Offers both"
    : state.edition === "java" ? `Offers 2 of these ${list.length} at random` : `Offers some of these ${list.length} at random`;
  return `${sectionHead("mob-section-title", "ui:emerald", "Trades", `${esc(villagerName(v))} · ${plural(all.length, "trade")}, ${earn} paying emeralds`)}
    ${jobs}
    ${jobSite(v.site, `Job site: <b>${esc(v.site)}</b>. An unemployed villager that claims one becomes ${article(villagerName(v))} ${esc(villagerName(v))}.`)}
    <p class="mob-lead">${esc(v.tip)}</p>
    ${v.trades.map((list, i) => `
      <section class="lvl">
        <div class="lvl-head">${levelBadge(i, "h4")}<span class="lvl-note">${offers(list)}</span></div>
        <ul class="trades">${list.map((t, j) => tradeRow(t, "", `mob-${v.k}-${i}-${j}`, biome)).join("")}</ul>
      </section>`).join("")}
    ${how}`;
}

// The "How it works" row under a mob's trades.
const tradeHow = t => `<dl class="fact-list"><div class="fact-row"><dt>How it works</dt><dd><ul class="fact-points">${t.how.map(h => `<li>${esc(h)}</li>`).join("")}</ul></dd></div></dl>`;

// The wandering trader's trades: each pool it picks from, its trades drawn as on the Villager Trades tab.
function poolTradeSection(m) {
  // A trade of any wood (or color, tree, coral) is that many trades to pick from.
  const count = list => list.reduce((sum, x) => sum + (EACH_KIND.has(x.gives.name) ? KINDS[x.gives.name].list.length : 1), 0);
  const t = MOB_TRADES[m.k], pools = t.pools.map(pool => ({ ...pool, list: pool.trades.map(parseTrade) }));
  pools.forEach(pool => { pool.count = count(pool.list); });
  const offers = pools.reduce((sum, pool) => sum + pool.picks, 0), all = pools.reduce((sum, pool) => sum + pool.count, 0);
  return `${sectionHead("mob-section-title", t.icon, "Trades", `${offers} offers, picked from ${all} trades`)}
    ${pools.map((pool, i) => `
      <section class="lvl">
        <div class="lvl-head"><h4 class="pool-name">${esc(pool.n)}</h4><span class="lvl-note">Offers ${pool.picks} of these ${pool.count} at random</span></div>
        <ul class="trades">${pool.list.map((x, j) => tradeRow(x, "", `mob-${m.k}-${i}-${j}`)).join("")}</ul>
      </section>`).join("")}
    ${tradeHow(t)}`;
}

// Trades: what to give it, then everything it can give back, most likely first, with each one's chance.
function tradeSection(m) {
  if (MOB_TRADES[m.k].byJob) return jobTradeSection(m);
  if (MOB_TRADES[m.k].pools) return poolTradeSection(m);
  const t = MOB_TRADES[m.k], table = t.table.filter(([, , , , ed]) => !ed || ed === state.edition);
  const total = table.reduce((sum, [, , w]) => sum + w, 0);
  const pct = w => { const v = (100 * w) / total; return `${v < 10 ? v.toFixed(1) : Math.round(v)}%`; };
  return `${sectionHead("mob-section-title", t.icon, "Trades", `Barters ${plural(table.length, "item")} for a ${t.gives.toLowerCase()}`)}
    ${itemList([t.gives], "Give it")}
    <div class="cat-label trade-label">Get one of these</div>
    <ul class="item-list">${[...table].sort((a, b) => b[2] - a[2]).map(([item, count, w, note]) => `<li class="item-row">${infoSlot(item)}
      <span class="item-name">${esc(item)}${note ? `<span class="sub">${esc(note)}</span>` : ""}</span>
      <span class="item-count">${esc(count)}</span><span class="item-chance">${pct(w)}</span></li>`).join("")}</ul>
    <dl class="fact-list"><div class="fact-row"><dt>How it works</dt><dd><ul class="fact-points">${t.how.map(h => `<li>${esc(h)}</li>`).join("")}</ul></dd></div></dl>`;
}

// Breeding: what to feed it, or how more of it come about when it can't be bred.
function breedSection(m) {
  const { breed } = mobInfo(m.k);
  if (!breed.food) {
    return `${sectionHead("mob-section-title", "drop:Wheat", "Breeding", "Can't be bred")}
      <p class="mob-lead">${esc(breed.no)}</p>`;
  }
  const fed = m.k !== "villager";
  return `${sectionHead("mob-section-title", "drop:Wheat", "Breeding", `Bred with ${plural(breed.food.length, "item")}`)}
    ${itemList(breed.food)}
    ${breed.how ? `<p class="mob-lead">${esc(breed.how)}</p>` : ""}
    ${fed ? `<p class="tag-note">Feed two grown ones and they make a baby. They can breed again after 5 minutes, and a baby grows up in 20, sooner if you feed it.</p>` : ""}`;
}

// Drops: every item, how many and when, then the experience.
function dropsSection(m) {
  const { drops, xp } = mobInfo(m.k);
  return `${sectionHead("mob-section-title", "drop:Bone", "Drops", drops.length ? plural(drops.length, "item") : "No items")}
    ${drops.length ? `<ul class="item-list">${drops.map(([item, count, when]) => `<li class="item-row">${infoSlot(item)}
      <span class="item-name">${esc(item)}${when ? `<span class="sub">${esc(when)}</span>` : ""}</span>
      <span class="item-count">${esc(count)}</span></li>`).join("")}</ul>` : `<p class="mob-lead">It drops no items.</p>`}
    <div class="xp-row"><span class="xp-orb" aria-hidden="true"></span><span>Experience</span><b>${esc(xp)}</b></div>
    ${drops.length ? `<p class="tag-note">Looting raises most counts by one a level.${GAME_BABIES.has(m.k) && mobBehavior(m) !== "aggressive" ? " Babies drop nothing." : ""}</p>` : ""}`;
}

// The picked mob's page: its title, a tab for each section, and the section picked.
function renderMobResult() {
  const m = mobOf(mobTab.mob), on = shownSection(m.k);
  const body = { about: aboutSection, tame: tameSection, ride: rideSection, breed: breedSection, trade: tradeSection, drops: dropsSection, tags: tagSection }[on](m);
  $("mob-result").innerHTML = `
    <div class="res-top">
      <div class="res-title"><span class="slot">${iconImg(mobIcon(m))}</span>
        <div><h2>${esc(mobName(m))}</h2><div class="res-sub">${state.edition === "java" ? "Java" : "Bedrock"} Edition</div></div>
      </div>
    </div>
    <div class="mob-tabs" role="tablist" aria-label="${esc(mobName(m))}">
      ${mobSections(m.k).map(([k, title, ico]) => [k, title, k === "trade" ? MOB_TRADES[m.k].icon : ico]).map(([k, title, ico]) => `<button type="button" class="mob-tab" role="tab" id="mob-tab-${k}" data-section="${k}"
        aria-selected="${k === on}" aria-controls="mob-section" tabindex="${k === on ? 0 : -1}">${iconImg(ico)}${title}</button>`).join("")}
    </div>
    <section class="mob-section" id="mob-section" role="tabpanel" aria-labelledby="mob-tab-${on}">${body}</section>`;
}

// Search: mobs by name, either edition's (Zombie Pigman finds the zombified piglin), each with how it behaves and where.
function renderMobSearch() {
  const q = mobTab.query.trim().toLowerCase(), box = $("mob-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type part of a mob’s name, then pick it from the list.</p>`;
    return;
  }
  const hits = MOBS.filter(m => [m.n, m.bedrockName].some(n => n && n.toLowerCase().includes(q)))
    .sort((a, b) => mobName(a).localeCompare(mobName(b)));
  const label = (list, k) => list.find(([x]) => x === k)[1];
  box.innerHTML = hits.length
    ? hits.map(m => `
      <button type="button" class="search-hit" data-mob="${m.k}"${m.k === mobTab.mob ? ' aria-current="true"' : ""}>
        <span class="slot sm">${iconImg(mobIcon(m))}</span>
        <span><span class="who">${esc(mobName(m))}</span><span class="deal">${label(MOB_BEHAVIORS, mobBehavior(m))} · ${label(MOB_DIMS, mobDim(m))}</span></span>
      </button>`).join("")
    : `<p class="choice-hint">No mob is called anything like “${esc(mobTab.query.trim())}”.</p>`;
}

// Text that only fits one edition: the pack is Bedrock's, so Java leaves it out.
function renderEditionText() {
  $("mob-intro").textContent = packOn()
    ? "Every mob and boss you can meet in survival. Pick one to see it up close, read where it spawns, how to breed it and what it drops, and try name tags on it: a few names do something in the game itself, and many more change how it looks with the Actions & Stuff resource pack."
    : "Every mob and boss you can meet in survival. Pick one to see it up close, read where it spawns, how to breed it and what it drops, and try name tags on it: a few names do something special.";
}

function renderMobs() {
  if (!currentTag() && mobTab.name) mobTab.name = "";
  renderEditionText();
  renderMobPicker();
  renderAge();
  renderVariants();
  renderRows();
  renderMarks();
  renderTints();
  renderWear();
  renderSizes();
  renderMoods();
  renderTry();
  renderMobResult();
  renderMobSearch();
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
    mobMood = startMood(k);
    mobCollar = DEFAULT_COLLAR;
    mobArmor = NO_ARMOR;
    mobSize = startSize(k);
    mobVariant = mobMarks = "";
    mobRows = {};
    mobSaddle = mobShorn = mobChest = false;
    mobCarpet = "";
    mobTints = {};
    mobWool = "white";
    mobBaby = false;
    tagGroupOpen = ""; // a new mob starts on No name, its name sections closed
    mobView.turnBack();
  }
  mobTab.mob = k;
  mobTab.name = mobTab.say = name || "";
  if (name) mobTab.section = "tags";
  fitClimate();
  renderMobs();
}
function pickTag(name, say = name) {
  mobTab.name = name;
  mobTab.say = say;
  renderMoods();
  renderWear();
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
$("mob-order").addEventListener("change", e => {
  mobTab.order = e.target.value;
  renderMobPicker();
  saveMobTab();
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
  renderWear();
  renderMoods();
  showOnStage();
  refocus(`#age-try button[data-baby="${b.dataset.baby}"]`);
});
// Pick a variant: from the stage's Variant buttons, or (a villager's job) the Trades tab's job buttons, which stay in
// step as both redraw.
function pickVariant(k) {
  if (k === (variantInfo() || {}).k) return false;
  mobVariant = k;
  // A name that doesn't show on this variant goes.
  if (currentTag() && !fitsVariant(currentTag())) mobTab.name = mobTab.say = "";
  mobView.turnBack();
  renderVariants();
  renderTry();
  renderMobResult();
  showOnStage();
  saveMobTab();
  return true;
}
$("variant-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-variant]");
  if (b && pickVariant(b.dataset.variant)) refocus(`#variant-try button[data-variant="${mobVariant}"]`);
});
$("kind-rows").addEventListener("click", e => {
  const b = e.target.closest("button[data-row]");
  const row = b && rowsOf(mobTab.mob).find(r => r.k === b.dataset.row);
  if (!row || b.dataset.kind === rowKind(row).k) return;
  mobRows = { ...mobRows, [row.k]: b.dataset.kind };
  renderRows();
  renderMobResult();
  showOnStage();
  refocus(`#kind-rows button[data-row="${row.k}"][data-kind="${b.dataset.kind}"]`);
});
$("marks-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-marks]");
  if (!b || b.dataset.marks === (marksInfo() || {}).k) return;
  mobMarks = b.dataset.marks;
  renderMarks();
  showOnStage();
  refocus(`#marks-try button[data-marks="${mobMarks}"]`);
});
$("tint-rows").addEventListener("click", e => {
  const b = e.target.closest("button[data-tint]");
  if (!b || b.dataset.color === tintsOf(mobTab.mob)[MOB_TINTS[mobTab.mob].findIndex(r => r.k === b.dataset.tint)]) return;
  mobTints = { ...mobTints, [b.dataset.tint]: b.dataset.color };
  renderTints();
  showOnStage();
  refocus(`#tint-rows button[data-tint="${b.dataset.tint}"][data-color="${b.dataset.color}"]`);
});
$("chest-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-chest]");
  if (!b || b.disabled || Boolean(b.dataset.chest) === mobChest) return;
  mobChest = Boolean(b.dataset.chest);
  renderWear();
  showOnStage();
  refocus(`#chest-try button[data-chest="${b.dataset.chest}"]`);
});
$("saddle-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-saddle]");
  if (!b || b.disabled || Boolean(b.dataset.saddle) === mobSaddle) return;
  mobSaddle = Boolean(b.dataset.saddle);
  renderWear();
  showOnStage();
  refocus(`#saddle-try button[data-saddle="${b.dataset.saddle}"]`);
});
$("carpet-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-carpet]");
  if (!b || b.disabled || b.dataset.carpet === mobCarpet) return;
  mobCarpet = b.dataset.carpet;
  renderWear();
  showOnStage();
  refocus(`#carpet-try button[data-carpet="${CSS.escape(mobCarpet)}"]`);
});
$("wool-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-wool]");
  if (!b || b.dataset.wool === mobWool) return;
  mobWool = b.dataset.wool;
  renderWear();
  showOnStage();
  refocus(`#wool-try button[data-wool="${CSS.escape(mobWool)}"]`);
});
$("shear-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-shorn]");
  if (!b || b.disabled || Boolean(b.dataset.shorn) === mobShorn) return;
  mobShorn = Boolean(b.dataset.shorn);
  renderWear();
  showOnStage();
  refocus(`#shear-try button[data-shorn="${b.dataset.shorn}"]`);
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
  renderArmor();
  showOnStage();
  refocus(`#${id} button[data-${attr}="${CSS.escape(b.getAttribute(`data-${attr}`))}"]`);
});
armorButton("armor-try", "armor", v => (v === "none" ? { on: false } : { on: true, type: v }));
armorButton("armor-dye-try", "armor-dye", v => ({ dye: v }));
armorButton("armor-wear-try", "armor-wear", v => ({ crack: v }));
armorButton("armor-glint-try", "armor-glint", v => ({ glint: Boolean(v) }));
for (const id of ["tag-try", "mob-result"]) $(id).addEventListener("click", e => {
  const b = e.target.closest("button[data-tag]");
  if (!b || b.disabled) return;
  pickTag(b.dataset.tag, b.dataset.say);
  refocus(`#${id} button[data-say="${CSS.escape(b.dataset.say || "")}"][data-tag="${CSS.escape(b.dataset.tag)}"]`);
});
// A name tag section's button opens its dropdown, closing any other; again, or Escape, closes it.
const toggleTagGroup = g => {
  tagGroupOpen = tagGroupOpen === g ? "" : g;
  renderTry();
  refocus(`#tag-try button[data-tag-group="${CSS.escape(g)}"]`);
};
$("tag-try").addEventListener("click", e => {
  const b = e.target.closest("button[data-tag-group]");
  if (b) toggleTagGroup(b.dataset.tagGroup);
});
$("tag-try").addEventListener("keydown", e => {
  if (e.key === "Escape" && tagGroupOpen) toggleTagGroup(tagGroupOpen);
});
// The section tabs: a click picks one; the arrow keys, Home and End move along them.
const pickSection = k => {
  mobTab.section = k;
  renderMobResult();
  saveMobTab();
  refocus(`#mob-tab-${k}`);
};
$("mob-result").addEventListener("click", e => {
  const b = e.target.closest("button[data-section]");
  if (b) pickSection(b.dataset.section);
  const job = e.target.closest("button[data-job]");
  if (job && pickVariant(job.dataset.job)) refocus(`#mob-result button[data-job="${mobVariant}"]`);
  const more = e.target.closest("button[data-kinds]");
  if (!more) return;
  const id = more.dataset.kinds, open = !openKinds.has(id);
  if (open) openKinds.add(id);
  else openKinds.delete(id);
  more.setAttribute("aria-expanded", open);
  $(`kinds-${id}`).hidden = !open;
});
$("mob-result").addEventListener("keydown", e => {
  if (!e.target.closest("[role=tab]")) return;
  const list = mobSections(mobTab.mob), i = list.findIndex(([k]) => k === shownSection(mobTab.mob)), n = list.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickSection(list[to % n][0]);
});
$("mob-results").addEventListener("click", e => {
  const b = e.target.closest("button[data-mob]");
  if (b) pickMob(b.dataset.mob, "");
});
$("mob-search").addEventListener("input", e => { mobTab.query = e.target.value; renderMobSearch(); saveMobTab(); });
// The name tag rules remember being opened (toggle doesn't bubble, so it's caught on the way down).
$("mob-result").addEventListener("toggle", e => { if (e.target.matches(".tag-rules")) tagRulesOpen = e.target.open; }, true);
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderMobs(); });

// Cycling drop slots step to their next example every second and a half, unless the reader asks for less motion
// (then they keep the first). So do the villager's trade slots of items that come in several kinds (data-cycle: their
// icon keys, as on the Villager Trades tab).
let mobCycleStep = 0;
setInterval(() => {
  if (calmMotion() || document.hidden || $("view-mobs").hidden) return;
  mobCycleStep++;
  for (const slot of document.querySelectorAll("#mob-result [data-cycle]")) {
    const keys = slot.dataset.cycle.split("|");
    slot.querySelector("img").src = icon(keys[mobCycleStep % keys.length]);
  }
  for (const slot of document.querySelectorAll("#mob-result [data-examples]")) {
    const list = slot.dataset.examples.split("|"), at = (Number(slot.dataset.at) + 1) % list.length;
    slot.dataset.at = at;
    slot.title = `For example: ${list[at]}`;
    slot.querySelector("img").src = icon(infoIcon(list[at]));
  }
}, 1500);

// The jeb_ sheep's wool fades through the dye colors and scrolling textures (a name's or a mood's) run while they're on the stage, unless
// the reader asks for less motion.
setInterval(() => {
  const t = currentTag(), rainbow = t && t.rainbow;
  if ((!rainbow && !(t && t.moving) && !moodStage().moving) || calmMotion() || document.hidden || $("view-mobs").hidden) return;
  if (rainbow) {
    jebStep = (jebStep + 1) % (JEB_COLORS.length * 6);
    const i = Math.floor(jebStep / 6), f = (jebStep % 6) / 6;
    const [a, b] = [JEB_COLORS[i], JEB_COLORS[(i + 1) % JEB_COLORS.length]].map(c => hex(DYES[c]));
    wool.color = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  }
  mobClock.t += 0.16;
  mobView.redraw();
}, 160);

$("mob-search").value = mobTab.query;
fitClimate();
renderMobs();

// The Villager Trades tab now opens here: #trading (its tab's link, or an old bookmark) becomes the Mobs tab with the
// villager picked and its Trades tab open. A villager picked from another mob starts on the job last seen on the
// Villager Trades tab.
function openVillagerTrades() {
  if (location.hash !== "#trading") return;
  if (mobTab.mob !== "villager") {
    pickMob("villager", "");
    pickVariant(trade.villager);
  }
  mobTab.section = "trade";
  renderMobResult();
  saveMobTab();
  history.replaceState(null, "", "#mobs");
  showView();
  $("mob-result").scrollIntoView({ block: "start" });
}
window.addEventListener("hashchange", openVillagerTrades);
openVillagerTrades();
