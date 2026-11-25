/* ---------- Equipment ----------
 * Every item the enchantments go on (ITEMS in src/solver.js), in any material it comes in, put on the player on the stage
 * (src/player.js); each one's anvil plan is one of its sections (src/anvil-ui.js). The picked item is the plan's (state.item), so
 * both are always about the same one.
 */
// The material picked last (an item without it comes in diamond), the picker's order, which section shows (GEAR_SECTIONS), what's
// put on (set: a slot -> an item, its material and its costume's trim), who wears it (a PLAYER_SKINS key) and the enchantments picked for the items
// that aren't the plan's now (plans).
const gear = { mat: "diamond", order: "kind", section: "about", query: "", who: "steve", set: null, plans: {} };
const GEAR_KEY = "equipment-v1";
try { Object.assign(gear, JSON.parse(localStorage.getItem(GEAR_KEY) || "{}")); } catch (_) {}
if (!MATERIALS[gear.mat]) gear.mat = "diamond";
if (!["kind", "az"].includes(gear.order)) gear.order = "kind";
if (!PLAYER_SKINS[gear.who]) gear.who = "steve";
if (!gear.plans || typeof gear.plans !== "object") gear.plans = {};
const saveGear = () => { try { localStorage.setItem(GEAR_KEY, JSON.stringify(gear)); } catch (_) {} };

// Where things go: each slot, its name, and what an empty one puts on when it's picked.
const GEAR_SLOTS = [["head", "Head", "helmet"], ["chest", "Chest", "chestplate"], ["legs", "Legs", "leggings"], ["feet", "Feet", "boots"], ["main", "Main hand", "sword"], ["off", "Off hand", "shield"]];
const SLOT_OF = { helmet: "head", turtle_shell: "head", chestplate: "chest", elytra: "chest", leggings: "legs", boots: "feet", shield: "off" };
const slotOf = item => SLOT_OF[item.k] || "main";
const slotName = slot => GEAR_SLOTS.find(([s]) => s === slot)[1];
const gearItem = k => ITEMS.find(i => i.k === k);
// An item's material if it's worn, or the one it would come in.
const isWorn = item => Boolean(gear.set[slotOf(item)] && gear.set[slotOf(item)].k === item.k);
const usualMat = (k, mat = gear.mat) => (!GEAR_MATS[k] ? null : GEAR_MATS[k].includes(mat) ? mat : "diamond");
const gearMat = item => (isWorn(item) ? gear.set[slotOf(item)].mat : usualMat(item.k));
// A first set, or a saved one without what isn't there anymore: armor all of a kind, and the picked item.
if (!gear.set || typeof gear.set !== "object" || Array.isArray(gear.set)) {
  gear.set = Object.fromEntries(ARMOR_PIECES.map(k => [SLOT_OF[k], { k, mat: usualMat(k) }]));
  gear.set[slotOf(currentItem())] = { k: state.item, mat: usualMat(state.item) };
}
for (const [slot, w] of Object.entries(gear.set)) {
  if (!w || !gearItem(w.k) || slotOf(gearItem(w.k)) !== slot || (w.mat || null) !== usualMat(w.k, w.mat)) delete gear.set[slot];
  else if (w.trim && !(COSTUMES[w.trim] && w.mat === "leather")) delete w.trim;
}

// Icons: an item in each material, what it's made of, the empty slots' pictures, and the mobs it comes from (the other sources are potion-ui.js's).
const setIcon = (key, spec, fallback) => { ICONS[key] = artReady(spec) ? spec : ICONS[fallback]; };
for (const [k, mats] of Object.entries(GEAR_MATS)) for (const m of mats) setIcon(`g:${m}_${k}`, L(m === "diamond" && k === "spear" ? "spear" : `${m}_${k}`), k);
for (const [k, part] of Object.entries(GEAR_PARTS)) setIcon(`part:${k}`, part.icon, "ui:book");
for (const [slot, , k] of GEAR_SLOTS) setIcon(`slot:${slot}`, L(slot === "main" ? "iron_sword" : `slot_${k}`), k);
for (const k of Object.keys(COSTUMES)) setIcon(`trim:${k}`, L(`${k}_armor_trim_smithing_template`), "ui:book");
setIcon("ui:crafting", C("crafting_table_front", "crafting_table_top", "crafting_table_side"), "ui:book");
for (const m of ["zombie", "skeleton", "drowned", "pillager", "vindicator", "piglin_brute", "wither_skeleton", "zombified_piglin"]) setIcon(`src:${m}`, L(`egg_${m}`), "ui:mob");

const gearName = (item, mat = gearMat(item)) => (!mat ? item.n : GEAR_NAMES[`${mat}_${item.k}`] || `${MATERIALS[mat].n} ${item.n}`);
const gearIcon = (item, mat = gearMat(item)) => (mat ? `g:${mat}_${item.k}` : item.k);
// The costume a worn thing is in (a COSTUMES key): the pack's, so only in Bedrock; the pick is kept meanwhile.
const costumeOf = w => (w && w.trim && packOn() ? w.trim : null);
// A worn thing's name, with its costume.
const wornName = w => `${gearName(gearItem(w.k), w.mat)}${costumeOf(w) ? ` (${COSTUMES[w.trim].n})` : ""}`;
const canDress = item => packOn() && isArmor(item) && gearMat(item) === "leather";
const isArmor = item => ARMOR_PIECES.includes(item.k);
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
// Who stands there: the pack's Morphs are Bedrock's, so in Java it's Steve instead.
const shownSkin = () => (!PLAYER_SKINS[gear.who].pack || packOn() ? gear.who : "steve");
// A worn thing's GEAR_WORN key.
const wornKey = w => (w ? `${w.mat ? `${w.mat}_` : ""}${w.k}${costumeOf(w) ? `_${w.trim}` : ""}` : null);
const wornNames = () => GEAR_SLOTS.filter(([slot]) => gear.set[slot]).map(([slot]) => wornName(gear.set[slot]));
let shownSet = null, gearShows = 0;
async function showGear() {
  const set = Object.fromEntries(GEAR_SLOTS.map(([slot]) => [slot, wornKey(gear.set[slot])])), mine = ++gearShows;
  // What's just been put on comes in as the game has it (nothing has at first: it was all on already).
  const fresh = shownSet ? Object.keys(set).filter(slot => set[slot] && set[slot] !== shownSet[slot]) : [];
  shownSet = set;
  const names = wornNames();
  $("gear-art").setAttribute("aria-label", `${PLAYER_SKINS[shownSkin()].n}${names.length ? ` with ${names.join(", ")}` : ", with nothing on"}. Drag or use the arrow keys to turn.`);
  const look = await playerLook(shownSkin(), set, fresh);
  if (look && mine === gearShows) gearView.show(look);
}

function renderSlots() {
  const button = ([slot, label, usual]) => {
    const w = gear.set[slot], item = w && gearItem(w.k), name = item ? wornName(w) : label;
    return `<button type="button" class="slot slot-btn${item ? "" : slot === "main" ? " hand-empty" : ""}" id="gear-slot-${slot}" data-slot="${slot}" data-name="${esc(name)}" aria-label="${esc(item ? `${label}: ${name}` : `${label}: nothing. Puts on ${gearName(gearItem(usual), usualMat(usual)).toLowerCase()}`)}" aria-pressed="${Boolean(item && item.k === state.item)}">${iconImg(item ? gearIcon(item, w.mat) : `slot:${slot}`)}</button>`;
  };
  $("gear-armor").innerHTML = GEAR_SLOTS.slice(0, 4).map(button).join("");
  $("gear-hands").innerHTML = GEAR_SLOTS.slice(4).map(button).join("");
  // Under the stage: where the picked item goes, and putting it on or taking it off.
  const item = currentItem(), slot = slotOf(item), mat = gearMat(item), on = isWorn(item), other = gear.set[slot], trim = on ? costumeOf(other) : null;
  $("gear-wear-label").innerHTML = `${slotName(slot)}: <b>${esc(other ? wornName(other) : "empty")}</b>`;
  const chip = (act, text) => `<button type="button" class="name-chip" data-wear="${act}">${text}</button>`;
  $("gear-wear").innerHTML = [
    on ? chip("off", slot === "main" || slot === "off" ? "Put it away" : "Take it off") : chip("on", `Put on the ${esc(gearName(item, mat).toLowerCase())}`),
    isArmor(item) && ARMOR_PIECES.some(k => wornKey(gear.set[SLOT_OF[k]]) !== wornKey({ k, mat, trim })) ? chip("all", `Full ${esc(trim ? COSTUMES[trim].n : `${MATERIALS[mat].n.toLowerCase()} armor`)}`) : "",
    Object.keys(gear.set).length ? chip("none", "Take everything off") : "",
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
  const on = shownSkin(), all = Object.keys(PLAYER_SKINS);
  const group = (label, list) => (list.length ? `
    <div role="group" aria-label="${label}">
      <div class="cat-label">${label}</div>
      <div class="slot-grid">${list.map(who => `<button type="button" class="slot slot-btn" id="skin-${who}" data-who="${who}" data-name="${esc(skinName(who))}" aria-label="${esc(skinName(who))}" aria-pressed="${who === on}"><img class="ico" data-skin="${who}" src="${skinPictures[who] || icon("ui:armor_stand")}" alt="" width="36" height="36"></button>`).join("")}</div>
    </div>` : "");
  const picker = group("Skins", all.filter(who => !PLAYER_SKINS[who].pack)) + group("Morphs", all.filter(who => PLAYER_SKINS[who].pack && packOn()));
  const off = PLAYER_SKINS[on].off || [];
  const bare = off.length === 4 ? "armor" : off.map(slot => ({ head: "helmet", chest: "chestplate", legs: "leggings", feet: "boots" }[slot])).join(" or ");
  $("gear-skins").innerHTML = picker
    + (bare ? `<p class="choice-hint">${esc(PLAYER_SKINS[on].n)} shows no ${bare}, worn or not.</p>` : "");
  drawSkins();
}

function renderMats() {
  const item = currentItem(), mats = GEAR_MATS[item.k];
  $("gear-mat-bar").hidden = !mats;
  $("gear-mat").innerHTML = (mats || []).map(m => `<button type="button" class="name-chip" data-mat="${m}" aria-pressed="${m === gearMat(item)}">${iconImg(gearIcon(item, m))}${MATERIALS[m].n}</button>`).join("");
}

// The pack's costumes, for a piece of leather armor.
function renderCostumes() {
  const item = currentItem(), on = isWorn(item) ? costumeOf(gear.set[slotOf(item)]) : null;
  $("gear-costume-bar").hidden = !canDress(item);
  $("gear-costume").innerHTML = !canDress(item) ? "" : [["", "None"], ...Object.entries(COSTUMES).map(([k, c]) => [k, c.n])]
    .map(([k, n]) => `<button type="button" class="name-chip" data-trim="${k}" aria-pressed="${k === (on || "")}">${k ? iconImg(`trim:${k}`) : ""}${esc(n)}</button>`).join("");
}

function renderGearPicker() {
  const slots = list => `<div class="slot-grid">${list.map(i =>
    `<button type="button" class="slot slot-btn${isWorn(i) ? " worn" : ""}" id="item-${i.k}" data-item="${i.k}" data-name="${esc(i.n)}" aria-label="${esc(i.n)}" aria-pressed="${i.k === state.item}">${iconImg(gearIcon(i))}</button>`).join("")}</div>`;
  $("gear-order").value = gear.order;
  $("gear-picker").innerHTML = gear.order === "az"
    ? slots([...ITEMS].sort((a, b) => a.n.localeCompare(b.n)))
    : [...new Set(ITEMS.map(i => i.cat))].map(c => `
    <div>
      <div class="cat-label">${c}</div>
      ${slots(ITEMS.filter(i => i.cat === c))}
    </div>`).join("");
  $("gear-name").textContent = gearName(currentItem());
}

/* The sections */
const GEAR_SECTIONS = [["set", "Your set"], ["about", "Overview"], ["materials", "Materials"], ["enchants", "Enchantments"], ["anvil", "Anvil plan"], ["craft", "Crafting"], ["repair", "Repair"], ["find", "Where to find"]];
const gearSections = item => GEAR_SECTIONS.filter(([s]) => s !== "materials" || GEAR_MATS[item.k]);
const shownGearSection = item => (gearSections(item).some(([s]) => s === gear.section) ? gear.section : "about");
const gearSectionIcon = (s, item) => ({ set: "ui:armor_stand", about: gearIcon(item), materials: "part:iron", enchants: "ui:enchant", anvil: "ui:anvil", craft: "ui:crafting", repair: "site:Grindstone", find: "src:chest" }[s]);
const gearHead = (s, item, note = "") => sectionHead("gear-section-title", gearSectionIcon(s, item), GEAR_SECTIONS.find(([k]) => k === s)[1], note);
const gearRow = (slot, name, sub, end = "") => `<li class="item-row">${slot}<span class="item-name">${name}${sub ? `<span class="sub">${sub}</span>` : ""}</span>${end}</li>`;
const partRow = (k, count = 0) => gearRow(plainSlot(`part:${k}`, "sm"), esc(GEAR_PARTS[k].n), esc(GEAR_PARTS[k].from), count ? `<span class="item-count">${count}</span>` : "");

// Your set: what it comes to, then each slot, which opens what's in it.
function gearSet(picked) {
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
  const row = ({ slot, label, w, item }) => `
    <button type="button" class="search-hit" data-slot="${slot}"${item && item.k === state.item ? ' aria-current="true"' : ""}>
      <span class="slot sm">${iconImg(item ? gearIcon(item, w.mat) : `slot:${slot}`)}</span>
      <span><span class="who">${esc(item ? wornName(w) : "Nothing")}</span><span class="deal">${esc(item ? `${label} · ${gearStats(item, w.mat).map(([l, v]) => `${l} ${String(forEdition(v)).toLowerCase()}`).join(" · ")}` : label)}</span></span>
    </button>`;
  const mats = [...new Set(worn.filter(x => x.item && isArmor(x.item)).map(x => x.w.mat))];
  return `${gearHead("set", picked, plural(Object.keys(gear.set).length, "piece"))}
    <div class="mob-stats">${boxes.map(statBox).join("")}</div>
    <div class="cat-label gear-label">What’s in it</div>
    <div class="set-list">${worn.map(row).join("")}</div>
    ${mats.length ? `<dl class="fact-list">${mats.map(m => potionFact(`${MATERIALS[m].n} armor`, MATERIALS[m].armor)).join("")}</dl>` : ""}`;
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
function costumeFact(item) {
  if (!canDress(item)) return "";
  const c = COSTUMES[isWorn(item) && costumeOf(gear.set[slotOf(item)])];
  return c ? potionFact("Costume", `${c.n}: leather armor with the ${c.trim} trim, put on at a smithing table, with Actions & Stuff. Its template: ${c.from}. The trim’s material and the dye don’t show.`)
    : potionFact("Costumes", "With Actions & Stuff, leather armor with some trims turns into a costume, piece by piece. Try them on under the stage.");
}
function gearAbout(item, mat) {
  const info = GEAR_INFO[item.k];
  return `${gearHead("about", item)}
    <div class="mob-stats">${gearStats(item, mat).map(statBox).join("")}</div>
    <dl class="fact-list">
      ${potionFact("Good for", forEdition(info.good))}
      ${mat ? potionFact(MATERIALS[mat].n, MATERIALS[mat][isArmor(item) ? "armor" : "tool"]) : ""}
      ${costumeFact(item)}
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
  const item = currentItem(), mat = gearMat(item), on = shownGearSection(item), name = gearName(item);
  const body = { set: gearSet, about: gearAbout, materials: gearMaterials, enchants: gearEnchants, craft: gearCraft, repair: gearRepair, find: gearFind,
    anvil: () => `${gearHead("anvil", item, `${state.edition === "java" ? "Java" : "Bedrock"} Edition`)}${anvilSection()}` }[on](item, mat);
  $("gear-result").innerHTML = `
    <div class="res-top">
      <div class="res-title"><span class="slot">${iconImg(gearIcon(item))}</span>
        <div><h2>${esc(name)}</h2><div class="res-sub">${slotName(slotOf(item))}${isWorn(item) ? "" : ", not worn"} · ${state.edition === "java" ? "Java" : "Bedrock"} Edition</div></div>
      </div>
    </div>
    <div class="mob-tabs" role="tablist" aria-label="${esc(name)}">
      ${gearSections(item).map(([k, title]) => `<button type="button" class="mob-tab" role="tab" id="gear-tab-${k}" data-section="${k}"
        aria-selected="${k === on}" aria-controls="gear-section" tabindex="${k === on ? 0 : -1}">${iconImg(gearSectionIcon(k, item))}${title}</button>`).join("")}
    </div>
    <section class="mob-section" id="gear-section" role="tabpanel" aria-labelledby="gear-tab-${on}">${body}</section>`;
  if (on === "anvil") renderAnvil();
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
    if (named.length) return named.map(m => ({ item, mat: m, rank: 1, why: item.cat }));
    return ench ? [{ item, mat, rank: 2, why: `Can have ${ENCH[ench].n}` }] : [];
  }).sort((a, b) => a.rank - b.rank);
  box.innerHTML = hits.length
    ? hits.map(({ item, mat, trim, why }) => `
      <button type="button" class="search-hit" data-item="${item.k}" data-mat="${mat || ""}"${trim ? ` data-trim="${trim}"` : ""}${item.k === state.item && mat === gearMat(item) && (!trim || (isWorn(item) && costumeOf(gear.set[slotOf(item)]) === trim)) ? ' aria-current="true"' : ""}>
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
// Picks an item, in a material if one is given, and puts it on; leather armor in a costume if one is ("": in none). One that's on
// already in leather keeps the costume it's in.
function pickGear(k, mat, trim) {
  const item = gearItem(k);
  if (!item) return;
  if (mat && MATERIALS[mat]) gear.mat = mat;
  const now = gear.set[slotOf(item)], w = { k, mat: mat ? usualMat(k, mat) : gearMat(item) };
  const dress = trim === undefined ? now && now.k === k && now.trim : trim;
  if (dress && w.mat === "leather") w.trim = dress;
  gear.set[slotOf(item)] = w;
  openGear(k);
  renderGear();
}
// A slot on the stage, or its row in the set: what's in it, or for an empty one what usually goes there.
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
    const { mat, trim } = { mat: gearMat(item), trim: isWorn(item) && gear.set[slot].trim };
    for (const k of ARMOR_PIECES) gear.set[SLOT_OF[k]] = { k, mat, ...(trim ? { trim } : {}) };
  }
  if (act === "none") gear.set = {};
  renderGear();
  refocus("#gear-wear button");
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
  pickGear(b.dataset.item, b.dataset.mat, b.dataset.trim);
  refocus(`#gear-results button[data-item="${state.item}"][data-mat="${b.dataset.mat}"]${b.dataset.trim ? `[data-trim="${b.dataset.trim}"]` : ""}`);
});
$("gear-order").addEventListener("change", e => { gear.order = e.target.value; renderGearPicker(); saveGear(); });
$("gear-search").addEventListener("input", e => { gear.query = e.target.value; renderGearSearch(); saveGear(); });
// The material buttons, under the stage and in the Materials table.
for (const id of ["gear-mat", "gear-result"]) $(id).addEventListener("click", e => {
  const b = e.target.closest("button[data-mat]");
  if (!b) return;
  pickGear(state.item, b.dataset.mat);
  refocus(`#${id} button[data-mat="${b.dataset.mat}"]`);
});
$("gear-costume").addEventListener("click", e => {
  const b = e.target.closest("button[data-trim]");
  if (!b) return;
  pickGear(state.item, "leather", b.dataset.trim);
  refocus(`#gear-costume button[data-trim="${b.dataset.trim}"]`);
});
const pickGearSection = k => {
  gear.section = k;
  renderGearResult();
  saveGear();
  refocus(`#gear-tab-${k}`);
};
$("gear-result").addEventListener("click", e => {
  const tab = e.target.closest("button[data-section]"), row = e.target.closest("button[data-slot]");
  if (tab) pickGearSection(tab.dataset.section);
  // A row of the set opens the piece itself.
  if (row) {
    gear.section = "about";
    pickSlot(row.dataset.slot);
    refocus("#gear-tab-about");
  }
});
$("gear-result").addEventListener("keydown", e => {
  if (!e.target.closest("[role=tab]")) return;
  const list = gearSections(currentItem()), i = list.findIndex(([k]) => k === shownGearSection(currentItem())), n = list.length;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  pickGearSection(list[to % n][0]);
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
  gear.section = "anvil";
  renderGearResult();
  saveGear();
}
window.addEventListener("hashchange", openAnvil);
openAnvil();
