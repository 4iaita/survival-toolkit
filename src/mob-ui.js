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
// a Cherry look) and a snowy village for snowy names, always by day. A name whose difference is a glow (night: glowing
// eyes) shows its glowing layers all the same, so they can be seen against the day.
function showOnStage() {
  const m = mobOf(mobTab.mob), t = currentTag(), variant = variantInfo();
  const look = t && t.look ? t.look : mobBaby && babyLook(m.k) > 0 ? babyLook(m.k) : 0;
  const tagEl = $("mob-tag");
  tagEl.textContent = t ? (t.names.includes(mobTab.say) ? mobTab.say : t.names[0]) : "";
  const biome = t && t.biome ? t.biome : t && t.kind === SNOWY ? "snowy" : (variant && variant.biome) || m.biome || "plains", night = Boolean(t && t.night) || glowsOnly(MOB_LOOKS[m.k], look);
  mobStage.dataset.biome = biome;
  mobStage.style.setProperty("--ground", `url('${groundArt(biome)}')`);
  mobBackdrop.show(biome);
  if (!t || !t.rainbow) wool.color = hex(DYES[MOB_WOOL[m.k] ? mobWool : "white"]);
  const collared = Boolean(moodInfo() && moodInfo().collar), armored = armorFits() && mobArmor.on && !nameHides("armor");
  const armor = armored ? { kind: m.k, type: mobArmor.type, dye: mobArmor.dye || null, crack: mobArmor.crack || null, glint: mobArmor.glint } : null;
  const marks = marksInfo(), armorName = armored && MOB_ARMOR[m.k].kinds ? `${ARMOR_NAMES[m.k][mobArmor.type].toLowerCase()} ` : "";
  collarTint.color = hex(DYES[mobCollar]);
  mobView.show(m.k, look, { flip: Boolean(t && t.flip), tint: collared ? collarTint : wool, clock: t && t.moving ? mobClock : null, night: false, glowing: m.glowing || night, stand: m.stand, swim: m.swim, zoom: (m.zoom || 1) * (MOB_SIZES[m.k] ? MOB_SIZES[m.k][mobSize].zoom : 1), sized: MOB_SIZES[m.k] ? mobSize : null, mood: mobMood === "calm" ? null : mobMood, armor, climate: (variant && variant.climate) || null, skins: (variant && variant.skins) || null, overlays: (marks && marks.over) || null, shown: shownParts(m.k, look), carpet: carpetWorn(m.k, look), dyes: tintsOf(m.k) }).then(ok => {
    if (ok !== false) tagEl.hidden = !t;
  });
  $("mob-art").setAttribute("aria-label", `${article(look && look === babyLook(m.k) && !t ? "baby" : wearWords(m.k, look)[0] || (variant && variant.say !== "" ? variant.say || variant.n : mobName(m)))} ${look && look === babyLook(m.k) && !t ? "baby " : ""}${wearWords(m.k, look).map(w => `${w} `).join("")}${variant && variant.say !== "" ? `${variant.say || variant.n.toLowerCase()} ` : ""}${mobName(m)}${marks && marks.over ? ` with ${marks.n.toLowerCase()} markings` : ""}${MOB_TINTS[m.k] ? ` (${MOB_TINTS[m.k].map((r, i) => `${r.n.toLowerCase()} ${tintsOf(m.k)[i]}`).join(", ")})` : ""}${MOB_SIZES[m.k] ? `, ${mobSize},` : ""}${t ? ` named ${t.names.includes(mobTab.say) ? mobTab.say : t.names[0]}` : " with no name"}${mobMood === "calm" ? "" : `, ${MOOD_NAMES[mobMood].toLowerCase()}`}${collared ? ` with a ${mobCollar} collar` : ""}${armored ? `, in ${mobArmor.glint ? "enchanted " : ""}${mobArmor.dye ? `${mobArmor.dye} ` : ""}${armorName}armor` : ""}${MOB_CHESTS[m.k] && mobChest && !babyShown(m.k, look) ? ", carrying a chest" : ""}${carpetWorn(m.k, look) ? `, wearing ${article(mobCarpet)} ${mobCarpet} carpet` : ""}. Drag or use the arrow keys to turn it.`);
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
  $("wool-bar").hidden = $("shear-bar").hidden = !wool;
  if (!wool) return;
  const shorn = mobShorn && !baby;
  $("wool-label").textContent = `Wool: ${titled(mobWool)}${wool.natural[mobWool] ? ` · ${wool.natural[mobWool]}` : " · Dyed"}`;
  $("wool-try").innerHTML = [...Object.keys(wool.natural), ...COLLAR_COLORS.filter(c => !wool.natural[c])].map(c => dyeSwatch("wool", c, c === mobWool)).join("");
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
  $("armor-try").innerHTML = chip("armor", "none", "None", !mobArmor.on) + Object.entries(ARMOR_NAMES[k]).map(([type, label]) => chip("armor", type, label, mobArmor.on && mobArmor.type === type)).join("");
  if (!on) return;
  $("armor-dye-label").textContent = `Armor color: ${mobArmor.dye ? titled(mobArmor.dye) : "Undyed"}`;
  $("armor-dye-try").innerHTML = chip("armor-dye", "", "Undyed", !mobArmor.dye) + COLLAR_COLORS.map(c => dyeSwatch("armor-dye", c, c === mobArmor.dye)).join("");
  $("armor-wear-try").innerHTML = ARMOR_WEAR.map(([w, label]) => chip("armor-wear", w, label, w === mobArmor.crack)).join("");
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
  renderMarks();
  renderTints();
  renderWear();
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
    mobMood = startMood(k);
    mobCollar = DEFAULT_COLLAR;
    mobArmor = NO_ARMOR;
    mobSize = startSize(k);
    mobVariant = mobMarks = "";
    mobSaddle = mobShorn = mobChest = false;
    mobCarpet = "";
    mobTints = {};
    mobWool = "white";
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
