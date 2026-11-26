/* ---------- Equipment ----------
 * Every item the enchantments go on (ITEMS in src/solver.js), in any material it comes in, put on the player on the stage
 * (src/player.js); each one's anvil plan is one of its sections (src/anvil-ui.js). The picked item is the plan's (state.item), so
 * both are always about the same one.
 */
// The material picked last (an item without it comes in diamond), which section each worn thing shows (sections: a slot ->
// a GEAR_SECTIONS key), what's put on (set: a slot -> an item, its material, its trim (a TRIMS key; on leather in Bedrock one of the
// COSTUMES is that costume) and the trim's material, its dye (leather's), whether it's enchanted (glint) and when it went on), who wears
// it (a PLAYER_SKINS key), the trim material picked last (trimMat) and the enchantments picked for the items that aren't the plan's now (plans).
const gear = { mat: "diamond", sections: {}, query: "", who: "steve", set: null, plans: {}, trimMat: "gold" };
const GEAR_KEY = "equipment-v2";
// The set used to start full, so one saved back then (equipment-v1) may be nobody's pick: it starts over, the rest is kept.
const savedGear = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } };
Object.assign(gear, savedGear(GEAR_KEY) || { ...savedGear("equipment-v1"), set: null });
if (!MATERIALS[gear.mat]) gear.mat = "diamond";
if (!PLAYER_SKINS[gear.who]) gear.who = "steve";
if (!gear.plans || typeof gear.plans !== "object") gear.plans = {};
if (!gear.sections || typeof gear.sections !== "object") gear.sections = {};
if (!TRIM_MATERIALS[gear.trimMat]) gear.trimMat = "gold";
const saveGear = () => { try { localStorage.setItem(GEAR_KEY, JSON.stringify(gear)); } catch (_) {} };

// Where things go: each slot, its name, and what an empty one puts on when it's picked.
const GEAR_SLOTS = [["head", "Head", "helmet"], ["chest", "Chest", "chestplate"], ["legs", "Legs", "leggings"], ["feet", "Feet", "boots"], ["main", "Main hand", "sword"], ["off", "Off hand", "shield"]];
const SLOT_OF = { helmet: "head", turtle_shell: "head", chestplate: "chest", elytra: "chest", leggings: "legs", boots: "feet", shield: "off" };
const slotOf = item => SLOT_OF[item.k] || "main";
const slotName = slot => GEAR_SLOTS.find(([s]) => s === slot)[1];
const gearItem = k => ITEMS.find(i => i.k === k);
const isArmor = item => ARMOR_PIECES.includes(item.k);
// What can be trimmed (all armor but the elytra), and dyed (leather armor).
const canTrim = item => isArmor(item) || item.k === "turtle_shell";
const canDye = (item, mat) => isArmor(item) && mat === "leather";
// An item's material if it's worn, or the one it would come in.
const isWorn = item => Boolean(gear.set[slotOf(item)] && gear.set[slotOf(item)].k === item.k);
const usualMat = (k, mat = gear.mat) => (!GEAR_MATS[k] ? null : GEAR_MATS[k].includes(mat) ? mat : "diamond");
const gearMat = item => (isWorn(item) ? gear.set[slotOf(item)].mat : usualMat(item.k));
// With nothing on, no item is picked: the tab shows the player alone until something's put on.
const nothingOn = () => !Object.keys(gear.set).length;
// A first set (nothing), or a saved one without what isn't there anymore.
if (!gear.set || typeof gear.set !== "object" || Array.isArray(gear.set)) gear.set = {};
for (const [slot, w] of Object.entries(gear.set)) {
  if (!w || !gearItem(w.k) || slotOf(gearItem(w.k)) !== slot || (w.mat || null) !== usualMat(w.k, w.mat)) {
    delete gear.set[slot];
    continue;
  }
  // A saved costume is its trim, so it stays one; one saved before trims had a material gets the usual.
  if (w.trim && !(TRIMS[w.trim] && canTrim(gearItem(w.k)))) delete w.trim;
  if (w.trim && !TRIM_MATERIALS[w.trimMat]) w.trimMat = gear.trimMat;
  if (!w.trim) delete w.trimMat;
  if (w.dye && !(DYES[w.dye] && canDye(gearItem(w.k), w.mat))) delete w.dye;
  if (w.glint !== true) delete w.glint;
}

// Icons: an item in each material, what it's made of, the empty slots' pictures, and the mobs it comes from (the other sources are potion-ui.js's).
const setIcon = (key, spec, fallback) => { ICONS[key] = artReady(spec) ? spec : ICONS[fallback]; };
for (const [k, mats] of Object.entries(GEAR_MATS)) for (const m of mats) setIcon(`g:${m}_${k}`, L(m === "diamond" && k === "spear" ? "spear" : `${m}_${k}`), k);
for (const [k, part] of Object.entries(GEAR_PARTS)) setIcon(`part:${k}`, part.icon, "ui:book");
for (const [slot, , k] of GEAR_SLOTS) setIcon(`slot:${slot}`, L(slot === "main" ? "slot_sword" : `slot_${k}`), k);
for (const k of Object.keys(TRIMS)) setIcon(`trim:${k}`, L(`${k}_armor_trim_smithing_template`), "ui:book");
for (const [k, m] of Object.entries(TRIM_MATERIALS)) setIcon(`tmat:${k}`, L(m.item), "ui:book");
setIcon("ui:crafting", C("crafting_table_front", "crafting_table_top", "crafting_table_side"), "ui:book");
for (const m of ["zombie", "skeleton", "drowned", "pillager", "vindicator", "piglin_brute", "wither_skeleton", "zombified_piglin"]) setIcon(`src:${m}`, L(`egg_${m}`), "ui:mob");

const gearName = (item, mat = gearMat(item)) => (!mat ? item.n : GEAR_NAMES[`${mat}_${item.k}`] || `${MATERIALS[mat].n} ${item.n}`);
const gearIcon = (item, mat = gearMat(item)) => (mat ? `g:${mat}_${item.k}` : item.k);
// The costume a worn thing is in (a COSTUMES key): leather armor with its trim, the pack's, so only in Bedrock (in Java it's that trim).
const costumeOf = w => (w && w.trim && w.mat === "leather" && COSTUMES[w.trim] && packOn() ? w.trim : null);
// A worn thing's name, with its costume.
const wornName = w => `${gearName(gearItem(w.k), w.mat)}${costumeOf(w) ? ` (${COSTUMES[w.trim].n})` : ""}`;
// The palette its trim is drawn in (a TRIM_COLORS one): darker on armor of the trim's own material.
const trimPalette = w => `${w.trimMat}${TRIM_MATERIALS[w.trimMat].own === w.mat ? "_darker" : ""}`;
// What's on a worn thing, in words: its trim, dye and enchantment (a costume shows neither trim nor dye).
const wornWords = w => [
  w.trim && !costumeOf(w) ? `${TRIMS[w.trim].n} trim in ${TRIM_MATERIALS[w.trimMat].n.toLowerCase()}` : "",
  w.dye && !costumeOf(w) ? `dyed ${w.dye}` : "",
  w.glint ? "enchanted" : "",
].filter(Boolean);
const canDress = item => packOn() && !nothingOn() && isArmor(item) && gearMat(item) === "leather";
// Durability in the edition picked, and enchantability (0: the enchanting table won't take it).
function gearUses(item, mat = gearMat(item)) {
  if (state.edition === "bedrock" && BEDROCK_USES[item.k]) return BEDROCK_USES[item.k];
  const uses = !mat ? GEAR_USES[item.k][0] : isArmor(item) ? ARMOR_TIERS[mat].uses[ARMOR_PIECES.indexOf(item.k)] : TOOL_TIERS[mat].uses;
  return uses + (state.edition === "bedrock" ? 1 : 0);
}
const gearEnch = (item, mat = gearMat(item)) => (!mat ? GEAR_USES[item.k][1] : (isArmor(item) ? ARMOR_TIERS : TOOL_TIERS)[mat].ench);
const enchWord = n => (n >= 20 ? "Very high" : n >= 14 ? "High" : n >= 9 ? "Average" : n > 1 ? "Low" : "The lowest");
// Attack damage and, in Java, hits a second, of a tool in a material.
const gearHit = (k, mat) => TOOL_HITS[k][state.edition][TOOL_ORDER.indexOf(mat)];
const gearRate = (k, mat) => [TOOL_HITS[k].rate].flat()[Array.isArray(TOOL_HITS[k].rate) ? TOOL_ORDER.indexOf(mat) : 0];
// Damage in hearts: 5 is "2½ hearts".
const inHearts = n => {
  const whole = Math.floor(n / 2), part = { 0: "", 0.25: "¼", 0.5: "½", 0.75: "¾" }[n / 2 - whole];
  return `${whole || ""}${part} heart${n > 2 ? "s" : ""}`;
};
const commas = n => n.toLocaleString("en-US");

/* The stage: the player in the set, with a slot for each thing. */
const gearStage = $("gear-stage");
const GEAR_YAW = -0.35;
const gearView = mobScene($("gear-art"), $("gear-tag"), { onTurn: () => gearStage.classList.add("turned"), yaw: GEAR_YAW });
gearStage.style.setProperty("--ground", `url('${groundArt("plains")}')`);
// Who stands there: the pack's skins and Morphs are Bedrock's, so in Java it's Steve instead.
const shownSkin = () => (!PLAYER_SKINS[gear.who].pack || packOn() ? gear.who : "steve");
// A worn thing's GEAR_WORN key.
const wornKey = w => (w ? `${w.mat ? `${w.mat}_` : ""}${w.k}${costumeOf(w) ? `_${w.trim}` : ""}` : null);
// And as playerLook takes it (src/player.js): that key, with what's on it.
const wornLook = w => (w ? [wornKey(w), w.trim && !costumeOf(w) ? `trim=${w.trim}.${trimPalette(w)}` : "", w.dye && !costumeOf(w) ? `dye=${w.dye}` : "", w.glint ? "glint" : ""].filter(Boolean).join("+") : null);
// What of a worn thing goes on with it, as a full set's pieces take it: its trim, dye and enchantment.
const setLook = w => Object.fromEntries(["trim", "trimMat", "dye", "glint"].filter(k => w[k]).map(k => [k, w[k]]));
// A thing's picture, shimmering if it's enchanted (.glint in src/style.css): the picture in a span of its own that the shimmer fits
// (.icon-glint in src/gear.css), whatever size it's drawn at, as a slot button's own ::after is its name.
const shimmer = (w, pic) => (w && w.glint ? `<span class="glint icon-glint" style="--m:url('${icon(pic)}')">${iconImg(pic)}</span>` : iconImg(pic));
const wornNames = () => GEAR_SLOTS.filter(([slot]) => gear.set[slot]).map(([slot]) => [wornName(gear.set[slot]), ...wornWords(gear.set[slot])].join(", "));
let shownSet = null, gearShows = 0;
async function showGear() {
  const set = Object.fromEntries(GEAR_SLOTS.map(([slot]) => [slot, wornLook(gear.set[slot])])), mine = ++gearShows;
  // What's just been put on comes in as the game has it (nothing has at first: it was all on already). A new trim, dye or
  // enchantment on the same thing isn't put on again.
  const base = look => look && look.split("+")[0];
  const fresh = shownSet ? Object.keys(set).filter(slot => set[slot] && base(set[slot]) !== base(shownSet[slot])) : [];
  shownSet = set;
  const names = wornNames();
  $("gear-art").setAttribute("aria-label", `${PLAYER_SKINS[shownSkin()].n}${names.length ? ` with ${names.join(", ")}` : ", with nothing on"}. Drag or use the arrow keys to turn.`);
  const look = await playerLook(shownSkin(), set, fresh);
  if (look && mine === gearShows) gearView.show(look);
}

function renderSlots() {
  const button = ([slot, label, usual]) => {
    const w = gear.set[slot], item = w && gearItem(w.k), name = item ? wornName(w) : label;
    const pic = item ? gearIcon(item, w.mat) : `slot:${slot}`, said = item ? [name, ...wornWords(w)].join(", ") : "";
    return `<button type="button" class="slot slot-btn" id="gear-slot-${slot}" data-slot="${slot}" data-name="${esc(name)}" aria-label="${esc(item ? `${label}: ${said}` : `${label}: nothing. Puts on ${gearName(gearItem(usual), usualMat(usual)).toLowerCase()}`)}" aria-pressed="${Boolean(item && item.k === state.item)}">${shimmer(w, pic)}</button>`;
  };
  $("gear-armor").innerHTML = GEAR_SLOTS.slice(0, 4).map(button).join("");
  $("gear-hands").innerHTML = GEAR_SLOTS.slice(4).map(button).join("");
  // Under the stage: where the picked item goes, and putting it on or taking it off.
  $("gear-wear-bar").hidden = nothingOn();
  if (nothingOn()) return;
  const item = currentItem(), slot = slotOf(item), mat = gearMat(item), on = isWorn(item), other = gear.set[slot], trim = on ? costumeOf(other) : null;
  $("gear-wear-label").innerHTML = `${slotName(slot)}: <b>${esc(other ? wornName(other) : "empty")}</b>`;
  const chip = (act, text) => `<button type="button" class="name-chip" data-wear="${act}">${text}</button>`;
  // A full set is the picked piece's look on all four.
  const look = k => ({ ...setLook(on ? other : {}), k, mat });
  $("gear-wear").innerHTML = [
    on ? chip("off", slot === "main" || slot === "off" ? "Put it away" : "Take it off") : chip("on", `Put on the ${esc(gearName(item, mat).toLowerCase())}`),
    isArmor(item) && ARMOR_PIECES.some(k => wornLook(gear.set[SLOT_OF[k]]) !== wornLook(look(k))) ? chip("all", `Full ${esc(trim ? COSTUMES[trim].n : `${MATERIALS[mat].n.toLowerCase()} armor`)}`) : "",
    chip("none", "Take everything off"),
    // Everything worn enchanted at once, or none of it once all are.
    Object.keys(gear.set).length > 1 ? `<button type="button" class="name-chip" data-all="${Object.values(gear.set).every(x => x.glint) ? "" : "on"}">${Object.values(gear.set).every(x => x.glint) ? "Take every enchantment off" : "Enchant everything"}</button>` : "",
  ].join("");
}

// The skins, each as a picture of who it is, drawn the first time the tab is open.
const SKIN_PX = 72, skinPictures = {};
let drawingSkins = false;
async function drawSkins() {
  if (drawingSkins || $("view-equipment").hidden) return;
  drawingSkins = true;
  for (const who of Object.keys(PLAYER_SKINS)) {
    if (who in skinPictures || (PLAYER_SKINS[who].pack && !packOn())) continue;
    skinPictures[who] = await playerBust(who, SKIN_PX);
    for (const img of document.querySelectorAll(`img[data-skin="${who}"]`)) if (skinPictures[who]) img.src = skinPictures[who];
    await new Promise(done => setTimeout(done));
  }
  drawingSkins = false;
}
const skinName = who => { const { n, what } = PLAYER_SKINS[who]; return what ? `${n}: ${what}` : n; };
function renderSkins() {
  const on = shownSkin(), all = Object.keys(PLAYER_SKINS).filter(who => !PLAYER_SKINS[who].pack || packOn());
  const group = (label, list) => (list.length ? `
    <div role="group" aria-label="${label}">
      <div class="cat-label">${label}</div>
      <div class="slot-grid">${list.map(who => `<button type="button" class="slot slot-btn" id="skin-${who}" data-who="${who}" data-name="${esc(skinName(who))}" aria-label="${esc(skinName(who))}" aria-pressed="${who === on}"><img class="ico" data-skin="${who}" src="${skinPictures[who] || icon("ui:armor_stand")}" alt="" width="36" height="36"></button>`).join("")}</div>
    </div>` : "");
  const picker = group("Skins", all.filter(who => !PLAYER_SKINS[who].morph)) + group("Morphs", all.filter(who => PLAYER_SKINS[who].morph));
  const off = PLAYER_SKINS[on].off || [];
  const bare = off.length === 4 ? "armor" : off.map(slot => ({ head: "helmet", chest: "chestplate", legs: "leggings", feet: "boots" }[slot])).join(" or ");
  $("gear-skins").innerHTML = picker
    + (bare ? `<p class="choice-hint">${esc(PLAYER_SKINS[on].n)} shows no ${bare}, worn or not.</p>` : "");
  drawSkins();
}

function renderMats() {
  const item = currentItem(), mats = GEAR_MATS[item.k];
  $("gear-mat-bar").hidden = !mats || nothingOn();
  $("gear-mat").innerHTML = (mats || []).map(m => `<button type="button" class="name-chip" data-mat="${m}" aria-pressed="${m === gearMat(item)}">${iconImg(gearIcon(item, m))}${MATERIALS[m].n}</button>`).join("");
}

// The pack's costumes, for a piece of leather armor.
function renderCostumes() {
  const item = currentItem(), on = isWorn(item) ? costumeOf(gear.set[slotOf(item)]) : null;
  $("gear-costume-bar").hidden = !canDress(item);
  $("gear-costume").innerHTML = !canDress(item) ? "" : [["", "None"], ...Object.entries(COSTUMES).map(([k, c]) => [k, c.n])]
    .map(([k, n]) => `<button type="button" class="name-chip" data-trim="${k}" aria-pressed="${k === (on || "")}">${k ? iconImg(`trim:${k}`) : ""}${esc(n)}</button>`).join("");
}

// How the picked item looks: its trim and the trim's material (armor), its dye (leather) and whether it's enchanted (anything). Each
// is the worn one's; picking one puts the item on.
function renderLooks() {
  const item = currentItem(), mat = gearMat(item), w = (isWorn(item) && gear.set[slotOf(item)]) || {}, none = nothingOn();
  const chip = (attr, value, label, pressed, pic = "") => `<button type="button" class="name-chip" data-${attr}="${value}" aria-pressed="${pressed}">${pic ? iconImg(pic) : ""}${esc(label)}</button>`;
  const trims = !none && canTrim(item), dyes = !none && canDye(item, mat);
  $("gear-trim-bar").hidden = !trims;
  $("gear-trim-mat-row").hidden = !trims || !w.trim;
  $("gear-trim-label").textContent = `Trim: ${w.trim ? TRIMS[w.trim].n : "None"}`;
  $("gear-trim").innerHTML = !trims ? "" : chip("pattern", "", "None", !w.trim) + Object.entries(TRIMS).map(([k, t]) => chip("pattern", k, t.n, k === w.trim, `trim:${k}`)).join("");
  const tmat = w.trimMat || gear.trimMat;
  $("gear-trim-mat-label").textContent = `Trim material: ${TRIM_MATERIALS[tmat].n}`;
  $("gear-trim-mat").innerHTML = !trims || !w.trim ? "" : Object.entries(TRIM_MATERIALS).map(([k, m]) => chip("tmat", k, m.n, k === tmat, `tmat:${k}`)).join("");
  $("gear-dye-bar").hidden = !dyes;
  $("gear-dye-label").textContent = `Dye: ${w.dye ? titled(w.dye) : "Undyed"}`;
  $("gear-dye").innerHTML = !dyes ? "" : chip("dye", "", "Undyed", !w.dye) + COLLAR_COLORS.map(c => dyeSwatch("dye", c, c === w.dye)).join("");
  $("gear-glint-bar").hidden = none;
  $("gear-glint").innerHTML = none ? "" : chip("glint", "", "Not enchanted", !w.glint) + chip("glint", "on", "Enchanted", Boolean(w.glint));
}

function renderGearPicker() {
  const slots = list => `<div class="slot-grid">${list.map(i =>
    `<button type="button" class="slot slot-btn${isWorn(i) ? " worn" : ""}" id="item-${i.k}" data-item="${i.k}" data-name="${esc(i.n)}" aria-label="${esc(i.n)}" aria-pressed="${!nothingOn() && i.k === state.item}">${shimmer(isWorn(i) && gear.set[slotOf(i)], gearIcon(i))}</button>`).join("")}</div>`;
  $("gear-picker").innerHTML = [...new Set(ITEMS.map(i => i.cat))].map(c => `
    <div>
      <div class="cat-label">${c}</div>
      ${slots(ITEMS.filter(i => i.cat === c))}
    </div>`).join("");
  $("gear-name").textContent = nothingOn() ? "Nothing equipped" : gearName(currentItem());
}

/* The sections */
const GEAR_SECTIONS = [["about", "Overview"], ["materials", "Materials"], ["enchants", "Enchantments"], ["anvil", "Anvil plan"], ["craft", "Crafting"], ["repair", "Repair"], ["find", "Where to find"]];
const gearSections = item => GEAR_SECTIONS.filter(([s]) => s !== "materials" || GEAR_MATS[item.k]);
// Each worn thing shows a section of its own; the anvil plan only for the item it's about (state.item), as there's one.
const shownGearSection = (item, slot = slotOf(item)) => {
  const s = gear.sections[slot];
  return gearSections(item).some(([k]) => k === s) && (s !== "anvil" || item.k === state.item) ? s : "about";
};
const gearSectionIcon = (s, item) => ({ set: "ui:armor_stand", about: gearIcon(item), materials: "part:iron", enchants: "ui:enchant", anvil: "ui:anvil", craft: "ui:crafting", repair: "site:Grindstone", find: "src:chest" }[s]);
// The worn thing whose sections are being drawn (renderGearResult), so that each one's names are its own.
let drawingSlot = "main";
const gearHead = (s, item, note = "") => sectionHead(`gear-${drawingSlot}-title`, gearSectionIcon(s, item), GEAR_SECTIONS.find(([k]) => k === s)[1], note);
const gearRow = (slot, name, sub, end = "") => `<li class="item-row">${slot}<span class="item-name">${name}${sub ? `<span class="sub">${sub}</span>` : ""}</span>${end}</li>`;
const partRow = (k, count = 0) => gearRow(plainSlot(`part:${k}`, "sm"), esc(GEAR_PARTS[k].n), esc(GEAR_PARTS[k].from), count ? `<span class="item-count">${count}</span>` : "");

// Your set: what everything worn comes to, over each of them.
function gearSet() {
  const worn = GEAR_SLOTS.map(([slot, label]) => ({ slot, label, w: gear.set[slot], item: gear.set[slot] && gearItem(gear.set[slot].k) }));
  const statOf = ({ item, w }, label) => (item ? gearStats(item, w.mat).find(([l]) => l === label) : null);
  const sum = label => worn.filter(x => x.slot !== "main").reduce((n, x) => n + Number((statOf(x, label) || [0, 0])[1]), 0);
  const armor = sum("Armor"), tough = sum("Toughness"), steady = worn.filter(x => x.w && x.w.mat === "netherite" && isArmor(x.item)).length * 10;
  const main = worn.find(x => x.slot === "main"), hit = statOf(main, "Attack damage") || statOf(main, "Damage");
  const boxes = [
    ["Armor", `${armor}`, armor ? `Takes up to ${armor * 4}% off a hit` : "Takes nothing off a hit"],
    ["Toughness", `${tough}`, tough ? "Keeps it up against strong hits" : "Diamond and netherite have it"],
    ["Knockback", steady ? `−${steady}%` : "Full", steady ? "From your netherite armor" : "Netherite armor takes some off"],
    hit ? ["Attack damage", forEdition(hit[1]), gearName(main.item, main.w.mat)] : ["Attack damage", "1", main.item ? "As with a bare hand" : "With a bare hand"],
  ];
  const mats = [...new Set(worn.filter(x => x.item && isArmor(x.item)).map(x => x.w.mat))];
  return `<section class="mob-section gear-set" aria-labelledby="gear-set-title">${sectionHead("gear-set-title", "ui:armor_stand", "Your set", plural(Object.keys(gear.set).length, "piece"))}
    <div class="mob-stats">${boxes.map(statBox).join("")}</div>
    ${mats.length ? `<dl class="fact-list">${mats.map(m => potionFact(`${MATERIALS[m].n} armor`, MATERIALS[m].armor)).join("")}</dl>` : ""}</section>`;
}

// Overview: four boxes, then the facts.
function gearStats(item, mat) {
  const k = item.k, ench = gearEnch(item, mat);
  const last = [["Durability", commas(gearUses(item, mat)), ""], ["Enchantability", ench || "None", ench ? enchWord(ench) : "Only books, on an anvil"]];
  if (!mat) return [...GEAR_INFO[k].stats, ...last];
  if (isArmor(item)) {
    const t = ARMOR_TIERS[mat];
    return [["Armor", t.points[ARMOR_PIECES.indexOf(k)], `${t.points.reduce((a, b) => a + b)} in a full set`],
      ["Toughness", t.tough, t.tough ? `${4 * t.tough} in a full set` : "Diamond and netherite have it"], ...last];
  }
  const hit = ["Attack damage", gearHit(k, mat), inHearts(gearHit(k, mat))], rate = gearRate(k, mat);
  if (item.cat === "Tools") return [["Mining speed", `×${TOOL_TIERS[mat].speed}`, "Times the speed by hand"], hit, ...last];
  return [hit, state.edition === "java" ? ["Attack speed", rate, "Hits a second"]
    : k === "spear" ? ["Attack speed", `${+(1 / rate).toFixed(2)} s`, "Between jabs"] : ["Attack speed", "Any", "No cooldown"], ...last];
}
const statBox = ([label, value, sub]) => {
  const v = String(forEdition(value));
  return `<div class="mob-stat${v.length > 9 ? " text" : ""}"><span class="stat-label">${label}</span><span class="stat-value">${esc(v)}</span>${sub ? `<span class="sub">${esc(forEdition(sub))}</span>` : ""}</div>`;
};
// How leather is dyed, and washed.
const DYE_HOW = both("Dye it in a crafting grid, with one dye or several to mix their colors; a cauldron of water washes it out.",
  "Dye it in a cauldron of dyed water (dyes mixed in the water mix their colors); a cauldron of plain water washes it out.");
// What's on it, or could be: its costume or trim, its dye and its enchantment.
function lookFacts(item, mat) {
  const w = (isWorn(item) && gear.set[slotOf(item)]) || {}, c = canDress(item) && COSTUMES[costumeOf(w)], out = [];
  if (c) out.push(potionFact("Costume", `${c.n}: leather armor with the ${c.trim} trim, with Actions & Stuff. Its template: ${forEdition(TRIMS[w.trim].from)}. The trim’s material and the dye don’t show.`));
  else if (canDress(item)) out.push(potionFact("Costumes", "With Actions & Stuff, leather armor with some trims turns into a costume, piece by piece. Try them on under the stage."));
  if (canTrim(item) && w.trim && !c) {
    const t = TRIMS[w.trim], m = TRIM_MATERIALS[w.trimMat];
    out.push(potionFact("Trim", `${t.n}, in ${m.n.toLowerCase()}${m.own === mat ? " (darker on armor of its own material)" : ""}. A smithing table puts it on, from its template and ${m.with}; it only changes how it looks, and Actions & Stuff makes it glow. The template: ${forEdition(t.from)}. Copy it with 7 diamonds and ${t.copy}, which makes two.`));
  } else if (canTrim(item) && !c) out.push(potionFact("Trims", "A smithing table puts a trim on any armor but the elytra, from a template (18 patterns, each found in a place of its own) and a material (11 colors). It only changes how it looks. Try them on under the stage."));
  if (canDye(item, mat)) out.push(potionFact("Dye", `${w.dye ? `${titled(w.dye)}.` : "Undyed, it’s brown."} ${forEdition(DYE_HOW)}`));
  if (w.glint) out.push(potionFact("Enchanted", "Everything enchanted shimmers. What can go on it is under Enchantments, and the cheapest order to put it on under Anvil plan."));
  return out.join("");
}
function gearAbout(item, mat) {
  const info = GEAR_INFO[item.k];
  return `${gearHead("about", item)}
    <div class="mob-stats">${gearStats(item, mat).map(statBox).join("")}</div>
    <dl class="fact-list">
      ${potionFact("Good for", forEdition(info.good))}
      ${mat ? potionFact(MATERIALS[mat].n, MATERIALS[mat][isArmor(item) ? "armor" : "tool"]) : ""}
      ${lookFacts(item, mat)}
      ${item.k === "pickaxe" ? potionFact("Mines", TOOL_TIERS[mat].mines) : ""}
      ${item.k === "axe" ? potionFact("Mining speed", `${TOOL_TIERS[mat].speed} times as fast as by hand`) : ""}
      ${item.k === "spear" ? potionFact("Charge", `The damage grows with your speed toward the target, times ${SPEAR_CHARGE[TOOL_ORDER.indexOf(mat)]}${state.edition === "java" ? ". Under 4.6 blocks a second it does none" : ""}`) : ""}
      ${potionFact("Good to know", forEdition(info.about))}
      ${potionFact("Wears", forEdition(info.wears))}
    </dl>`;
}

// Materials: how it compares in each. Each is a button that picks it.
function gearMaterials(item, mat) {
  const k = item.k, java = state.edition === "java", mats = GEAR_MATS[k], i = ARMOR_PIECES.indexOf(k);
  const cols = [
    ...(i >= 0 ? [["Armor", m => ARMOR_TIERS[m].points[i]], ["Toughness", m => ARMOR_TIERS[m].tough || "–"]] : []),
    ...(i < 0 && item.cat === "Tools" ? [["Speed", m => `×${TOOL_TIERS[m].speed}`]] : []),
    ...(i < 0 ? [["Damage", m => gearHit(k, m)]] : []),
    ...(i < 0 && java && item.cat !== "Tools" ? [["Hits / s", m => gearRate(k, m)]] : []),
    ...(k === "axe" ? [["Mining", m => `×${TOOL_TIERS[m].speed}`]] : []),
    ["Durability", m => commas(gearUses(item, m))], ["Enchanting", m => gearEnch(item, m)],
  ];
  return `${gearHead("materials", item, plural(mats.length, "material"))}
    <table class="mat-table">
      <thead><tr><td></td>${cols.map(([c]) => `<th scope="col">${c}</th>`).join("")}</tr></thead>
      <tbody>${mats.map(m => `<tr${m === mat ? ' class="on"' : ""}><th scope="row"><button type="button" class="mat-btn" data-mat="${m}" aria-pressed="${m === mat}">${iconImg(gearIcon(item, m))}<span>${MATERIALS[m].n}${
        k === "pickaxe" ? `<span class="sub">${esc(TOOL_TIERS[m].mines)}</span>` : ""}</span></button></th>${cols.map(([, v]) => `<td>${v(m)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    <dl class="fact-list">${mats.map(m => potionFact(MATERIALS[m].n, MATERIALS[m][i >= 0 ? "armor" : "tool"])).join("")}</dl>`;
}

// Enchantments: all that go on it, by where they come from.
function gearEnchants(item) {
  const keys = enchantsFor(item, state.edition);
  const groups = [["table", "From the enchanting table"], ["book", "Only with a book, on an anvil"], ["treasure", "Treasure: never from the enchanting table"]]
    .map(([from, label]) => ({ label, list: keys.filter(k => enchantFrom(item.k, k, state.edition) === from) })).filter(g => g.list.length);
  const row = k => {
    const e = ENCH[k], not = keys.filter(o => conflicts(o, k)).map(o => ENCH[o].n);
    return gearRow(plainSlot(`e:${k}`, "sm"), `<span${e.curse ? ' class="curse-name"' : ""}>${esc(e.n)}</span>`,
      `${esc(forEdition(ENCH_DOES[k]))}.${not.length ? ` Not with ${esc(not.join(", "))}.` : ""}${TREASURE[k] ? ` <b>${esc(TREASURE[k])}</b>` : ""}`,
      `<span class="item-count">${e.max > 1 ? `I–${ROMAN[e.max]}` : "I"}</span>`);
  };
  return `${gearHead("enchants", item, plural(keys.length, "enchantment"))}
    ${groups.map(g => `<div class="cat-label gear-label">${g.label}</div><ul class="item-list wide">${g.list.map(row).join("")}</ul>`).join("")}`;
}

// Crafting: its recipe, or the smithing table's upgrade, and what goes in.
function gearCraft(item, mat) {
  const none = NO_RECIPE[mat === "chainmail" ? mat : item.k], out = plainSlot(gearIcon(item, mat));
  if (none) return `${gearHead("craft", item, "Can’t be crafted")}<p class="mob-lead">${none}</p>`;
  if (mat === "netherite") {
    return `${gearHead("craft", item, "Smithing table")}
      <div class="smith-row">${plainSlot("part:template")}<span class="op">+</span>${plainSlot(gearIcon(item, "diamond"))}<span class="op">+</span>${plainSlot("part:netherite")}${iconImg("ui:arrow")}${out}</div>
      <p class="mob-lead">Upgrade the diamond one on a smithing table. It keeps its enchantments, its name and how worn it is.</p>
      <div class="cat-label gear-label">You need</div>
      <ul class="item-list wide">${partRow("template", 1)}${gearRow(plainSlot(gearIcon(item, "diamond"), "sm"), esc(gearName(item, "diamond")), "Crafted, or found", '<span class="item-count">1</span>')}${partRow("netherite", 1)}</ul>`;
  }
  const { rows, key = {}, loose } = GEAR_RECIPES[item.k], part = c => (c === "/" ? "stick" : c === "m" ? MATERIALS[mat].part : key[c]);
  const cells = [0, 1, 2].flatMap(y => [0, 1, 2].map(x => ((rows[y] || "")[x] || " ").trim())), counts = {};
  for (const c of cells) if (c) counts[part(c)] = (counts[part(c)] || 0) + 1;
  return `${gearHead("craft", item, "Crafting table")}
    <div class="arrow-craft"><div class="craft-grid">${cells.map(c => (c ? plainSlot(`part:${part(c)}`, "sm") : '<span class="slot sm"></span>')).join("")}</div>${iconImg("ui:arrow")}${out}</div>
    ${loose ? `<p class="mob-lead">Anywhere in the grid: the places don’t matter.</p>` : ""}
    <div class="cat-label gear-label">You need</div>
    <ul class="item-list wide">${Object.entries(counts).map(([k, n]) => partRow(k, n)).join("")}</ul>`;
}

// Repair: each way to mend it, with how much it gives back.
function gearRepair(item, mat) {
  const full = gearUses(item, mat), unit = mat ? MATERIALS[mat].part : GEAR_MENDS[item.k];
  const share = part => commas(Math.floor(full * part));
  return `${gearHead("repair", item, `Durability ${commas(full)}`)}
    <ul class="item-list wide">
      ${unit ? gearRow(plainSlot(`part:${unit}`, "sm"), esc(GEAR_PARTS[unit].n), "On an anvil: 1 level each, plus the item’s penalty. Four mend it whole", `<span class="item-count">+${share(MEND_UNIT)}</span>`) : ""}
      ${gearRow(plainSlot(gearIcon(item, mat), "sm"), "A second one, on an anvil", `2 levels, plus both penalties. Adds what it has left and ${share(MEND_SAME)} more. Its enchantments come along, for their own cost`)}
      ${gearRow(plainSlot("site:Grindstone", "sm"), "Two worn ones, in a grindstone", `Free. Adds up what both have left and ${share(MEND_GRID)} more. Enchantments are lost (curses stay) for some XP back, and the anvil penalty with them`)}
      ${gearRow(plainSlot("ui:crafting", "sm"), "Two worn ones, in a crafting grid", "Free. The same, with no XP back")}
      ${gearRow(glintSlot("e:mending", "sm"), "Mending", `The XP you pick up, 2 durability a point: ${commas(Math.ceil(full / 2))} points from worn out to new`)}
    </ul>
    <dl class="fact-list">
      ${unit ? "" : potionFact("On an anvil", "No material mends it: only another one does.")}
      ${potionFact("Penalty", "A new item has none. After each anvil job it’s 1, 3, 7, 15, then 31 levels. A job of 40 levels or more is refused.")}
      ${potionFact("The anvil", "Each job has a 12% chance of damaging it, so it lasts about 25.")}
    </dl>`;
}

// Where to find: the places and mobs that have it ready-made, and who sells it.
function gearSales(name) {
  const sold = (t, icon, who) => ([name, `Enchanted ${name}`].includes(t.gives.name)
    ? [{ icon, n: who, what: `${t.wants.map(amount).join(" + ")}${t.gives.name === name ? (t.note ? `, ${t.note}` : "") : ", enchanted"}` }] : []);
  return [...VILLAGERS.flatMap(v => v.trades.flatMap((list, i) => list.flatMap(t => sold(t, `site:${v.site}`, `${villagerName(v)}, ${LEVELS[i].toLowerCase()}`)))),
    ...MOB_TRADES.wandering_trader.pools.flatMap(p => p.trades.map(parseTrade).flatMap(t => sold({ ...t, note: "" }, "src:trader", "Wandering trader")))];
}
function gearFind(item, mat) {
  // Places first, the likeliest first, then the mobs.
  const place = x => ["src:chest", "src:vault", "src:end"].includes(x.icon), likely = x => parseFloat(forEdition(x.chance)) || 0;
  const found = (GEAR_FOUND[item.k] || []).filter(x => (!x.ed || x.ed === state.edition) && (!x.mats || x.mats.includes(mat)))
    .sort((a, b) => place(b) - place(a) || likely(b) - likely(a));
  const sales = gearSales(gearName(item, mat)), n = found.length + sales.length;
  const list = (label, rows) => (rows.length ? `<div class="cat-label gear-label">${label}</div><ul class="item-list wide">${rows.map(x => sourceRow({ ...x, what: forEdition(x.what) })).join("")}</ul>` : "");
  const none = mat === "netherite" ? "Nothing has it ready-made: upgrade the diamond one." : "It isn’t found anywhere ready-made: craft it.";
  return `${gearHead("find", item, n ? plural(n, "place") : mat === "netherite" ? "Only by upgrading" : "Only by crafting")}
    ${n ? list("Found", found) + list("Sold by", sales) : `<p class="mob-lead gear-none">${esc(none)}</p>`}`;
}

function renderGearResult() {
  if (nothingOn()) {
    $("gear-result").innerHTML = `<div class="mob-section"><p class="mob-lead">Nothing equipped. Pick a piece of equipment, or a slot on the stage, to put it on.</p></div>`;
    return;
  }
  // What's on, the last put on first (then in the slots' order).
  const worn = GEAR_SLOTS.map(([slot], i) => ({ slot, i, w: gear.set[slot] })).filter(x => x.w).sort((a, b) => (b.w.on || 0) - (a.w.on || 0) || a.i - b.i);
  const edition = `${state.edition === "java" ? "Java" : "Bedrock"} Edition`;
  const block = ({ slot, w }) => {
    const item = gearItem(w.k), mat = w.mat, on = shownGearSection(item, slot), name = wornName(w);
    drawingSlot = slot;
    const body = { about: gearAbout, materials: gearMaterials, enchants: gearEnchants, craft: gearCraft, repair: gearRepair, find: gearFind,
      anvil: () => `${gearHead("anvil", item, edition)}${anvilSection()}` }[on](item, mat);
    return `
    <article class="gear-block" data-block="${slot}" aria-labelledby="gear-${slot}-name"${item.k === state.item ? ' aria-current="true"' : ""}>
      <div class="res-top">
        <div class="res-title"><span class="slot">${shimmer(w, gearIcon(item, mat))}</span>
          <div><h2 id="gear-${slot}-name">${esc(name)}</h2><div class="res-sub">${[slotName(slot), ...wornWords(w).map(x => x[0].toUpperCase() + x.slice(1)), edition].map(esc).join(" · ")}</div></div>
        </div>
      </div>
      <div class="mob-tabs" role="tablist" aria-label="${esc(name)}">
        ${gearSections(item).map(([k, title]) => `<button type="button" class="mob-tab" role="tab" id="gear-${slot}-tab-${k}" data-section="${k}"
          aria-selected="${k === on}" aria-controls="gear-${slot}-section" tabindex="${k === on ? 0 : -1}">${iconImg(gearSectionIcon(k, item))}${title}</button>`).join("")}
      </div>
      <section class="mob-section" id="gear-${slot}-section" role="tabpanel" aria-labelledby="gear-${slot}-tab-${on}">${body}</section>
    </article>`;
  };
  // In two groups, each the last put on first: what's worn, and what's in the hands.
  const group = (label, slots) => {
    const list = worn.filter(x => slots.includes(x.slot));
    return list.length ? `<div class="gear-group" role="group" aria-label="${label}"><h3 class="gear-group-head">${label}</h3>${list.map(block).join("")}</div>` : "";
  };
  $("gear-result").innerHTML = gearSet() + group("Armor", ["head", "chest", "legs", "feet"]) + group("Weapons and tools", ["main", "off"]);
  if (worn.some(({ slot, w }) => w.k === state.item && shownGearSection(gearItem(w.k), slot) === "anvil")) renderAnvil();
}

// Search: items by name (with a material or without), or by an enchantment that goes on them.
function renderGearSearch() {
  const q = gear.query.trim().toLowerCase(), box = $("gear-results");
  if (!q) {
    box.innerHTML = `<p class="choice-hint">Type part of an item’s name, a material or an enchantment, then pick it from the list.</p>`;
    return;
  }
  const has = s => s.toLowerCase().includes(q);
  const hits = ITEMS.flatMap(item => {
    const mat = gearMat(item), mats = GEAR_MATS[item.k] || [], ench = enchantsFor(item, state.edition).find(k => has(ENCH[k].n));
    const note = mats.length ? plural(mats.length, "material") : item.cat;
    if (has(item.n) || has(gearName(item))) return [{ item, mat, rank: 0, why: `${item.cat} · ${note}` }];
    const named = mats.filter(m => has(gearName(item, m)));
    const dressed = packOn() && isArmor(item) ? Object.keys(COSTUMES).filter(t => has(COSTUMES[t].n)) : [];
    if (dressed.length) return dressed.map(t => ({ item, mat: "leather", trim: t, rank: 1, why: `${COSTUMES[t].n} · ${item.cat}` }));
    const trimmed = canTrim(item) ? Object.keys(TRIMS).filter(t => has(`${TRIMS[t].n} trim`)) : [];
    if (trimmed.length) return trimmed.map(t => ({ item, mat, trim: t, rank: 1, why: `${TRIMS[t].n} trim · ${item.cat}` }));
    if (named.length) return named.map(m => ({ item, mat: m, rank: 1, why: item.cat }));
    return ench ? [{ item, mat, rank: 2, why: `Can have ${ENCH[ench].n}` }] : [];
  }).sort((a, b) => a.rank - b.rank);
  box.innerHTML = hits.length
    ? hits.map(({ item, mat, trim, why }) => `
      <button type="button" class="search-hit" data-item="${item.k}" data-mat="${mat || ""}"${trim ? ` data-trim="${trim}"` : ""}${!nothingOn() && item.k === state.item && mat === gearMat(item) && (!trim || (isWorn(item) && gear.set[slotOf(item)].trim === trim)) ? ' aria-current="true"' : ""}>
        <span class="slot sm">${iconImg(gearIcon(item, mat))}</span>
        <span><span class="who">${esc(gearName(item, mat))}</span><span class="deal">${esc(why)}</span></span>
      </button>`).join("")
    : `<p class="choice-hint">No equipment has anything like “${esc(gear.query.trim())}”.</p>`;
}

function renderGear() {
  sanitizePicked();
  renderGearPicker();
  renderSlots();
  renderMats();
  renderCostumes();
  renderLooks();
  renderSkins();
  renderGearResult();
  renderGearSearch();
  showGear();
  save();
  saveGear();
}

// Shows an item in the sections, whether it's worn or not. Each keeps the enchantments picked for it (in each edition, as not all
// are in both); one's first plan is a full set.
function openGear(k) {
  if (k === state.item) return;
  gear.plans[`${state.edition}:${state.item}`] = state.picked;
  state.item = k;
  state.picked = { ...(gear.plans[`${state.edition}:${k}`] || {}) };
  if (!Object.keys(state.picked).length) state.picked = fullSet(currentItem(), state.edition);
}
// Picks an item, in a material if one is given, and puts it on, with what's changed of its look (look: trim, trimMat, dye, glint; ""
// or false takes it off). One that's on already keeps the rest of its look, but a dye on what isn't leather.
function pickGear(k, mat, look = {}) {
  const item = gearItem(k);
  if (!item) return;
  if (mat && MATERIALS[mat]) gear.mat = mat;
  if (look.trimMat) gear.trimMat = look.trimMat;
  const now = gear.set[slotOf(item)], same = now && now.k === k ? now : null;
  const w = { k, mat: mat ? usualMat(k, mat) : gearMat(item), on: same ? same.on : Date.now() }, next = { ...(same ? setLook(same) : {}), ...look };
  if (next.trim && canTrim(item)) Object.assign(w, { trim: next.trim, trimMat: next.trimMat || gear.trimMat });
  if (next.dye && canDye(item, w.mat)) w.dye = next.dye;
  if (next.glint) w.glint = true;
  gear.set[slotOf(item)] = w;
  openGear(k);
  renderGear();
}
// A slot on the stage: what's in it, or for an empty one what usually goes there.
function pickSlot(slot) {
  if (!gear.set[slot]) return pickGear(GEAR_SLOTS.find(([s]) => s === slot)[2]);
  openGear(gear.set[slot].k);
  renderGear();
}
$("gear-picker").addEventListener("click", e => {
  const b = e.target.closest("button[data-item]");
  if (!b || (b.dataset.item === state.item && isWorn(currentItem()))) return;
  pickGear(b.dataset.item);
  refocus(`#item-${state.item}`);
});
gearStage.addEventListener("click", e => {
  const b = e.target.closest("button[data-slot]");
  if (!b) return;
  pickSlot(b.dataset.slot);
  refocus(`#gear-slot-${b.dataset.slot}`);
});
$("gear-wear").addEventListener("click", e => {
  const b = e.target.closest("button[data-wear]");
  if (!b) return;
  const item = currentItem(), slot = slotOf(item), act = b.dataset.wear;
  if (act === "on") return pickGear(item.k), refocus("#gear-wear button");
  if (act === "off") delete gear.set[slot];
  if (act === "all") {
    const mat = gearMat(item), look = setLook(isWorn(item) ? gear.set[slot] : {});
    const at = Date.now(), was = k => gear.set[SLOT_OF[k]];
    for (const k of ARMOR_PIECES) gear.set[SLOT_OF[k]] = { k, mat, ...look, on: was(k) && was(k).k === k ? was(k).on : at };
  }
  if (act === "none") gear.set = {};
  renderGear();
  refocus(nothingOn() ? `#gear-slot-${slot}` : "#gear-wear button");
});
$("gear-skins").addEventListener("click", e => {
  const b = e.target.closest("button[data-who]");
  if (!b || b.dataset.who === shownSkin()) return;
  gear.who = b.dataset.who;
  renderSkins();
  showGear();
  saveGear();
  refocus(`#skin-${gear.who}`);
});
$("gear-results").addEventListener("click", e => {
  const b = e.target.closest("button[data-item]");
  if (!b) return;
  pickGear(b.dataset.item, b.dataset.mat, b.dataset.trim ? { trim: b.dataset.trim } : {});
  refocus(`#gear-results button[data-item="${state.item}"][data-mat="${b.dataset.mat}"]${b.dataset.trim ? `[data-trim="${b.dataset.trim}"]` : ""}`);
});
$("gear-search").addEventListener("input", e => { gear.query = e.target.value; renderGearSearch(); saveGear(); });
// The material buttons, under the stage and in the Materials table.
for (const id of ["gear-mat", "gear-result"]) $(id).addEventListener("click", e => {
  const b = e.target.closest("button[data-mat]"), block = e.target.closest("[data-block]");
  if (!b) return;
  pickGear(block ? gear.set[block.dataset.block].k : state.item, b.dataset.mat);
  refocus(block ? `#gear-${block.dataset.block}-section button[data-mat="${b.dataset.mat}"]` : `#${id} button[data-mat="${b.dataset.mat}"]`);
});
// A costume is its trim; None takes off a costume's, not another trim.
$("gear-costume").addEventListener("click", e => {
  const b = e.target.closest("button[data-trim]");
  if (!b || (!b.dataset.trim && !(isWorn(currentItem()) && costumeOf(gear.set[slotOf(currentItem())])))) return;
  pickGear(state.item, "leather", { trim: b.dataset.trim });
  refocus(`#gear-costume button[data-trim="${b.dataset.trim}"]`);
});
// The picked item's look: its trim, the trim's material, its dye and its enchantment.
for (const [id, attr, change] of [["gear-trim", "pattern", v => ({ trim: v })], ["gear-trim-mat", "tmat", v => ({ trimMat: v })],
  ["gear-dye", "dye", v => ({ dye: v })], ["gear-glint", "glint", v => ({ glint: Boolean(v) })]]) $(id).addEventListener("click", e => {
  const b = e.target.closest(`button[data-${attr}]`);
  if (!b) return;
  pickGear(state.item, null, change(b.dataset[attr]));
  refocus(`#${id} button[data-${attr}="${b.dataset[attr]}"]`);
});
// Everything worn enchanted, or none of it.
$("gear-wear").addEventListener("click", e => {
  const b = e.target.closest("button[data-all]");
  if (!b) return;
  for (const w of Object.values(gear.set)) {
    if (b.dataset.all) w.glint = true;
    else delete w.glint;
  }
  renderGear();
  refocus("#gear-wear button[data-all]");
});
// A section of something worn: that's the item picked now.
const pickGearSection = (slot, k) => {
  gear.sections[slot] = k;
  openGear(gear.set[slot].k);
  renderGear();
  refocus(`#gear-${slot}-tab-${k}`);
};
$("gear-result").addEventListener("click", e => {
  const tab = e.target.closest("button[data-section]");
  if (tab) pickGearSection(tab.closest("[data-block]").dataset.block, tab.dataset.section);
});
$("gear-result").addEventListener("keydown", e => {
  const tab = e.target.closest("[role=tab]");
  if (!tab) return;
  const slot = tab.closest("[data-block]").dataset.block, item = gearItem(gear.set[slot].k);
  const list = gearSections(item), i = list.findIndex(([k]) => k === shownGearSection(item, slot)), n = list.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickGearSection(slot, list[to % n][0]);
});
$("gear-result").addEventListener("toggle", e => { if (e.target.matches(".tag-rules")) anvilRulesOpen = e.target.open; }, true);
$("edition").addEventListener("click", e => { if (e.target.closest("button[data-ed]")) renderGear(); });

$("gear-search").value = gear.query;
gearView.turnBack();
renderGear();
window.addEventListener("hashchange", drawSkins);

// The Anvil Planner is a section of this tab: an old bookmark of it (#anvil) opens that.
function openAnvil() {
  if (location.hash !== "#anvil") return;
  history.replaceState(null, "", "#equipment");
  showView();
  gear.sections[slotOf(currentItem())] = "anvil";
  if (!isWorn(currentItem())) return pickGear(state.item);
  renderGear();
}
window.addEventListener("hashchange", openAnvil);
openAnvil();
