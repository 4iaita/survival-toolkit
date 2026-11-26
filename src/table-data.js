/* ---------- The enchanting table ----------
 * What the table offers an item, worked out exactly as Java's code does it, summed over every outcome (no sampling).
 * The numbers are Java 26.3's (misode/mcmeta 26.3-data: data/minecraft/enchantment/*.json and the tags in_enchanting_table,
 * treasure and exclusive_set/*); the steps are Java's EnchantmentMenu and EnchantmentHelper, from memory of the code and
 * checked against the wiki's Enchanting table mechanics page. Bedrock's aren't in its files: it's drawn as Java's, with its
 * own items (enchantFrom in src/gear-data.js says what each edition's table gives).
 *
 * 1. The slots (EnchantmentMenu.slotsChanged, EnchantmentHelper.getEnchantmentCost), from the player's seed:
 *    base = nextInt(8) + 1 + shelves / 2 + nextInt(shelves + 1), shelves at most 15;
 *    top max(base / 3, 1), middle base * 2 / 3 + 1, bottom max(base, shelves * 2); a slot under its number (1, 2, 3) is empty.
 * 2. Its enchantments (selectEnchantment), from the seed + the slot:
 *    level + 1 + nextInt(e / 4 + 1) twice (e: enchantability), then times 1 + (nextFloat() + nextFloat() - 1) * 0.15, in floats,
 *    rounded. Each enchantment the item is primary for (a book: all) at the highest level whose cost range has it;
 *    one is picked by weight, then while nextInt(50) <= level another (not clashing with those picked) and level /= 2.
 *    A book loses one of them at random if it has more than one.
 */
// key: [weight, min cost at I, more each level, max cost at I, more each level]
const TABLE_ENCH = {
  protection: [10, 1, 11, 12, 11], fire_protection: [5, 10, 8, 18, 8], feather_falling: [5, 5, 6, 11, 6],
  blast_protection: [2, 5, 8, 13, 8], projectile_protection: [5, 3, 6, 9, 6], respiration: [2, 10, 10, 40, 10],
  aqua_affinity: [2, 1, 0, 41, 0], thorns: [1, 10, 20, 60, 20], depth_strider: [2, 10, 10, 25, 10],
  sharpness: [10, 1, 11, 21, 11], smite: [5, 5, 8, 25, 8], bane_of_arthropods: [5, 5, 8, 25, 8], knockback: [5, 5, 20, 55, 20],
  fire_aspect: [2, 10, 20, 60, 20], looting: [2, 15, 9, 65, 9], sweeping_edge: [2, 5, 9, 20, 9], efficiency: [10, 1, 10, 51, 10],
  silk_touch: [1, 15, 0, 65, 0], unbreaking: [5, 5, 8, 55, 8], fortune: [2, 15, 9, 65, 9], power: [10, 1, 10, 16, 10],
  punch: [2, 12, 20, 37, 20], flame: [2, 20, 0, 50, 0], infinity: [1, 20, 0, 50, 0], luck_of_the_sea: [2, 15, 9, 65, 9],
  lure: [2, 15, 9, 65, 9], loyalty: [5, 12, 7, 50, 0], impaling: [2, 1, 8, 21, 8], riptide: [2, 17, 7, 50, 0],
  channeling: [1, 25, 0, 50, 0], multishot: [2, 20, 0, 50, 0], quick_charge: [5, 12, 20, 50, 0], piercing: [10, 1, 10, 50, 0],
  density: [5, 5, 8, 25, 8], breach: [2, 15, 9, 65, 9], lunge: [5, 5, 8, 25, 8],
};
// Java's exclusive sets: two of one set never come together (the riptide set clashes only with riptide).
const TABLE_SETS = [
  ["protection", "blast_protection", "fire_protection", "projectile_protection"],
  ["sharpness", "smite", "bane_of_arthropods", "impaling", "density", "breach"],
  ["fortune", "silk_touch"], ["frost_walker", "depth_strider"], ["infinity", "mending"], ["multishot", "piercing"],
];
const tableClash = (a, b) => a === b || TABLE_SETS.some(s => s.includes(a) && s.includes(b))
  || (a === "riptide" && (b === "loyalty" || b === "channeling")) || (b === "riptide" && (a === "loyalty" || a === "channeling"));
const TABLE_MAX_SHELVES = 15;

// The slot's level for each base, and how likely each is: { level: chance }, and empty (0) for none.
function tableSlot(shelves, slot) {
  const b = Math.min(shelves, TABLE_MAX_SHELVES), out = {}, each = 1 / (8 * (b + 1));
  for (let i = 0; i < 8; i++) for (let j = 0; j <= b; j++) {
    const base = i + 1 + (b >> 1) + j;
    let lv = [Math.max(Math.floor(base / 3), 1), Math.floor(base * 2 / 3) + 1, Math.max(base, b * 2)][slot];
    if (lv < slot + 1) lv = 0;
    out[lv] = (out[lv] || 0) + each;
  }
  return out;
}

// The ±15%: (u1 + u2 - 1) * 0.15 in floats, u1 and u2 each a multiple of 2^-24. Its result depends only on s, the two's sum in
// 2^-24ths (0 to 2^25 - 2), and grows with it; c(s) counts the pairs under s. So each rounded level's chance is exact.
const F24 = 2 ** 24, F015 = Math.fround(0.15);
const tableRound = (lv, s) => {
  const f = Math.fround(Math.fround(Math.fround(s / F24) - 1) * F015);
  return Math.max(1, Math.floor(Math.fround(lv + Math.fround(lv * f)) + 0.5));
};
const tablePairs = s => (s <= F24 ? s * (s + 1) / 2 : F24 * F24 - (2 * F24 - 1 - s) * (2 * F24 - s) / 2);
const tableSpread = {};
function tableJitter(lv) {
  if (tableSpread[lv]) return tableSpread[lv];
  const top = 2 * F24 - 1, out = {}, first = s => {
    let lo = 0, hi = top;
    while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (tableRound(lv, mid) >= s) hi = mid; else lo = mid + 1; }
    return lo;
  };
  const a = tableRound(lv, 0), z = tableRound(lv, top - 1);
  for (let v = a; v <= z; v++) {
    const n = tablePairs(v === z ? top : first(v + 1)) - tablePairs(v === a ? 0 : first(v));
    if (n) out[v] = n / (F24 * F24);
  }
  return (tableSpread[lv] = out);
}
// The enchanting level for a slot's level and an enchantability: { level: chance }.
function tablePower(lv, ench) {
  const q = Math.floor(ench / 4), out = {}, each = 1 / ((q + 1) * (q + 1));
  for (let i = 0; i <= q; i++) for (let j = 0; j <= q; j++) {
    for (const [v, p] of Object.entries(tableJitter(lv + 1 + i + j))) out[v] = (out[v] || 0) + p * each;
  }
  return out;
}

// Each candidate at an enchanting level: [key, level], or none when no level's range has it.
function tableLevel(k, power) {
  const [, a, da, b, db] = TABLE_ENCH[k];
  for (let l = ENCH[k].max; l >= 1; l--) if (power >= a + da * (l - 1) && power <= b + db * (l - 1)) return l;
  return 0;
}

// What one enchanting gives at an enchanting level, from the candidates (keys): each one's chance to be on it (got: key ->
// chance), the chance it's the slot's hint (hint), and how many come (count: n -> chance). A forward walk over the sets
// picked so far: sets that always clash are one unit (picking in it by weight), and a set is followed until its chance is
// under 1e-15 (lost: the chance not followed, at most about 1e-12 for a book).
// A book's candidates are every table enchantment of the edition: walking them takes seconds, so they're worked out once
// (tools/table-book.js writes TABLE_BOOK in src/table-book.js: by edition, then power, got and hint in tableBookKeys' order).
const tableBookKeys = edition => Object.keys(TABLE_ENCH).filter(k => !ENCH[k].only || ENCH[k].only === edition);
const tableMemo = new Map();
function tableResult(keys, power, book) {
  const id = `${keys.join()}|${power}|${book}`;
  if (tableMemo.has(id)) return tableMemo.get(id);
  const ed = book && typeof TABLE_BOOK !== "undefined" && ["java", "bedrock"].find(e => tableBookKeys(e).join() === keys.join());
  if (ed && TABLE_BOOK[ed][power]) {
    const [got, hint, count, lost] = TABLE_BOOK[ed][power], has = keys.map((k, i) => [k, i]).filter(([k, i]) => got[i]);
    const res = { levels: Object.fromEntries(has.map(([k]) => [k, tableLevel(k, power)])), got: Object.fromEntries(has.map(([k, i]) => [k, got[i]])),
      hint: Object.fromEntries(has.map(([k, i]) => [k, hint[i]])), count, lost };
    tableMemo.set(id, res);
    return res;
  }
  const avail = keys.map(k => [k, tableLevel(k, power)]).filter(([, l]) => l);
  // Units: a set whose every pair clashes becomes one; others stay apart.
  const units = [], seen = new Set();
  for (const [k] of avail) {
    if (seen.has(k)) continue;
    const group = [k];
    for (let i = 0; i < group.length; i++) for (const [o] of avail) if (!group.includes(o) && tableClash(group[i], o)) group.push(o);
    group.forEach(o => seen.add(o));
    if (group.every(a => group.every(b => tableClash(a, b)))) units.push({ keys: group });
    else group.forEach(o => units.push({ keys: [o] }));
  }
  for (const u of units) u.w = u.keys.reduce((n, k) => n + TABLE_ENCH[k][0], 0);
  const n = units.length, blocks = units.map((u, i) => units.reduce((m, v, j) => (j === i || u.keys.some(a => v.keys.some(b => tableClash(a, b))) ? m | (1 << j) : m), 0));
  const unitGot = new Float64Array(n), unitHint = new Float64Array(n), count = {};
  let lost = 0, layer = new Map([[0, 1]]);
  const end = (mask, p, size) => {
    const kept = book && size > 1 ? size - 1 : size;
    count[kept] = (count[kept] || 0) + p;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) {
      unitGot[i] += p * (book && size > 1 ? (size - 1) / size : 1);
      unitHint[i] += p / size;
    }
  };
  if (!n) count[0] = 1;
  for (let k = 0; n && layer.size; k++) {
    const next = new Map(), roll = k ? Math.min(1, (Math.floor(power / 2 ** (k - 1)) + 1) / 50) : 1;
    for (let [mask, p] of layer) {
      let blocked = 0, w = 0;
      for (let i = 0; i < n; i++) if (mask & (1 << i)) blocked |= blocks[i];
      for (let i = 0; i < n; i++) if (!(blocked & (1 << i))) w += units[i].w;
      if (!w) { end(mask, p, k); continue; }
      if (roll < 1) { end(mask, p * (1 - roll), k); p *= roll; }
      for (let i = 0; i < n; i++) if (!(blocked & (1 << i))) {
        const q = p * units[i].w / w, m = mask | (1 << i);
        if (q < 1e-15) lost += q;
        else next.set(m, (next.get(m) || 0) + q);
      }
    }
    layer = next;
  }
  const got = {}, hint = {};
  units.forEach((u, i) => u.keys.forEach(k => {
    const share = TABLE_ENCH[k][0] / u.w;
    got[k] = unitGot[i] * share;
    hint[k] = unitHint[i] * share;
  }));
  const res = { levels: Object.fromEntries(avail), got, hint, count, lost };
  tableMemo.set(id, res);
  return res;
}

// Everything a slot can give, over its levels: for each level it can show (level -> its chance, and what it gives at that level),
// summed over the enchanting levels. Each: got (key -> level -> chance), hint (the same, as the hint), count.
const tableSlotMemo = new Map();
function tableOffer(keys, ench, book, lv) {
  const id = `${keys.join()}|${ench}|${book}|${lv}`;
  if (tableSlotMemo.has(id)) return tableSlotMemo.get(id);
  const got = {}, hint = {}, count = {};
  let lost = 0;
  const add = (to, k, l, p) => { to[k] = to[k] || {}; to[k][l] = (to[k][l] || 0) + p; };
  for (const [power, p] of Object.entries(tablePower(lv, ench))) {
    const r = tableResult(keys, +power, book);
    for (const k of Object.keys(r.got)) { add(got, k, r.levels[k], p * r.got[k]); add(hint, k, r.levels[k], p * r.hint[k]); }
    for (const [c, q] of Object.entries(r.count)) count[c] = (count[c] || 0) + p * q;
    lost += p * r.lost;
  }
  const res = { got, hint, count, lost };
  tableSlotMemo.set(id, res);
  return res;
}
// A slot over all the levels it can show: { levels: level -> chance, empty: chance, got, hint, count } (got and the others
// over every try, empty included).
function tableSlotAll(keys, ench, book, shelves, slot) {
  const levels = tableSlot(shelves, slot), got = {}, hint = {}, count = {};
  for (const [lv, p] of Object.entries(levels)) {
    if (+lv === 0) { count[0] = (count[0] || 0) + p; continue; }
    const o = tableOffer(keys, ench, book, +lv);
    for (const [to, from] of [[got, o.got], [hint, o.hint]]) for (const [k, by] of Object.entries(from)) {
      to[k] = to[k] || {};
      for (const [l, q] of Object.entries(by)) to[k][l] = (to[k][l] || 0) + p * q;
    }
    for (const [c, q] of Object.entries(o.count)) count[c] = (count[c] || 0) + p * q;
  }
  return { levels, empty: levels[0] || 0, got, hint, count };
}

if (typeof module !== "undefined") module.exports = { TABLE_ENCH, tableBookKeys, tableSlot, tableJitter, tablePower, tableResult, tableOffer, tableSlotAll, tableLevel };

// How the table works, for the section's last part ([label, text], a text that differs by edition both(java, bedrock)). The
// bookshelves' rules: Java's tags enchantment_power_provider (bookshelf) and enchantment_power_transmitter (#replaceable); Bedrock's
// from the wiki. The rest is from Java's code and data; where Bedrock's isn't known, it's shown as Java's.
const TABLE_FACTS = [
  ["Making one", "4 obsidian, 2 diamonds and a book, on a crafting table."],
  ["Bookshelves", both(
    "Up to 15 raise the slots’ levels. Each stands two blocks from the table, level with it or a block higher, anywhere round it: 32 places, and more than 15 add nothing. The block halfway between, at the bookshelf’s height, must be air or as thin: grass, a snow layer, water, fire. A torch or a carpet there cuts that bookshelf off. Chiseled bookshelves don’t count.",
    "Up to 15 raise the slots’ levels. Each stands two blocks from the table, level with it or a block higher, anywhere round it: 32 places, and more than 15 add nothing. The two blocks halfway between, level with the table and the one above, must both be air: a torch, a carpet or a snow layer there cuts that bookshelf off. Chiseled bookshelves don’t count.")],
  ["Levels and lapis", "A slot needs at least the level it shows, but costs only 1, 2 or 3 levels, top to bottom, and as much lapis lazuli. A slot whose level would be under its own number stays empty: with few bookshelves the bottom one sometimes does."],
  ["Enchantability", "What picks the enchantments is the slot’s level, plus 1 and two random bonuses of up to a quarter of the item’s enchantability each, then moved up to 15% either way. Gold armor’s 25 can take a level 30 slot to 49; a book’s 1 takes it to 36 at most."],
  ["More than one", "After the first enchantment, another comes with a chance of (that level + 1) in 50, the level halving each time, and never one that clashes with one it has. A book then loses one of them at random."],
  ["The offers", "They come from a number of your own, the seed, which changes only when you enchant something. Taking the item out and putting it back, or going to another table with as many bookshelves, shows the same offers, and another item of the same enchantability the same levels."],
  ["Rerolling", "To see new offers, enchant something cheap: a book in the top slot costs 1 level and 1 lapis, and you keep the enchanted book."],
  ["Hints", "Hovering over a slot shows one of the enchantments it gives, at its level. Whatever else comes with it isn’t shown. A book’s hint is never the one it loses."],
  ["What goes in", "An item that can be enchanted and isn’t yet, or a book; a damaged one is fine. The elytra, shield, shears, brush, flint and steel and the sticks don’t go in: they only take books, on an anvil."],
  ["Never from it", "Mending, Frost Walker, Soul Speed, Swift Sneak, Wind Burst and the two curses: they’re treasure, found, fished or traded."],
  // Only the edition picked: in Bedrock the table gives all of these, so there's nothing to say.
  ["Only from books", both("The table never gives an axe Sharpness, Smite or Bane of Arthropods, armor but the chestplate Thorns, or the mace Smite, Bane of Arthropods or Fire Aspect: those go on from books, on an anvil.", "")],
];
