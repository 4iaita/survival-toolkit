/* ---------- Game data ---------- */
// m = cost per level when the enchantment comes from a book (the right slot is always a book here).
const ENCH = {
  protection:            { n: "Protection", max: 4, m: 1 },
  fire_protection:       { n: "Fire Protection", max: 4, m: 1 },
  blast_protection:      { n: "Blast Protection", max: 4, m: 2 },
  projectile_protection: { n: "Projectile Protection", max: 4, m: 1 },
  feather_falling:       { n: "Feather Falling", max: 4, m: 1 },
  respiration:           { n: "Respiration", max: 3, m: 2 },
  aqua_affinity:         { n: "Aqua Affinity", max: 1, m: 2 },
  thorns:                { n: "Thorns", max: 3, m: 4 },
  depth_strider:         { n: "Depth Strider", max: 3, m: 2 },
  frost_walker:          { n: "Frost Walker", max: 2, m: 2 },
  soul_speed:            { n: "Soul Speed", max: 3, m: 4 },
  swift_sneak:           { n: "Swift Sneak", max: 3, m: 4 },
  sharpness:             { n: "Sharpness", max: 5, m: 1 },
  smite:                 { n: "Smite", max: 5, m: 1 },
  bane_of_arthropods:    { n: "Bane of Arthropods", max: 5, m: 1 },
  knockback:             { n: "Knockback", max: 2, m: 1 },
  fire_aspect:           { n: "Fire Aspect", max: 2, m: 2 },
  looting:               { n: "Looting", max: 3, m: 2 },
  sweeping_edge:         { n: "Sweeping Edge", max: 3, m: 2, only: "java" },
  lunge:                 { n: "Lunge", max: 3, m: 1 },
  density:               { n: "Density", max: 5, m: 1 },
  breach:                { n: "Breach", max: 4, m: 2 },
  wind_burst:            { n: "Wind Burst", max: 3, m: 2 },
  efficiency:            { n: "Efficiency", max: 5, m: 1 },
  fortune:               { n: "Fortune", max: 3, m: 2 },
  silk_touch:            { n: "Silk Touch", max: 1, m: 4 },
  power:                 { n: "Power", max: 5, m: 1 },
  punch:                 { n: "Punch", max: 2, m: 2 },
  flame:                 { n: "Flame", max: 1, m: 2 },
  infinity:              { n: "Infinity", max: 1, m: 4 },
  multishot:             { n: "Multishot", max: 1, m: 2 },
  piercing:              { n: "Piercing", max: 4, m: 1 },
  quick_charge:          { n: "Quick Charge", max: 3, m: 1 },
  impaling:              { n: "Impaling", max: 5, m: 2, bedrockM: 1 },
  loyalty:               { n: "Loyalty", max: 3, m: 1 },
  riptide:               { n: "Riptide", max: 3, m: 2 },
  channeling:            { n: "Channeling", max: 1, m: 4 },
  luck_of_the_sea:       { n: "Luck of the Sea", max: 3, m: 2 },
  lure:                  { n: "Lure", max: 3, m: 2 },
  unbreaking:            { n: "Unbreaking", max: 3, m: 1 },
  mending:               { n: "Mending", max: 1, m: 2 },
  binding_curse:         { n: "Curse of Binding", max: 1, m: 4, curse: true },
  vanishing_curse:       { n: "Curse of Vanishing", max: 1, m: 4, curse: true },
};

// Pairs inside one group can't share an item. Riptide has two separate groups because Loyalty + Channeling is allowed.
const CONFLICTS = [
  ["protection", "fire_protection", "blast_protection", "projectile_protection"],
  ["sharpness", "smite", "bane_of_arthropods", "density", "breach"],
  ["fortune", "silk_touch"],
  ["depth_strider", "frost_walker"],
  ["infinity", "mending"],
  ["multishot", "piercing"],
  ["riptide", "loyalty"],
  ["riptide", "channeling"],
];

const PROT = ["protection", "fire_protection", "blast_protection", "projectile_protection"];
const DMG = ["sharpness", "smite", "bane_of_arthropods"];
const TOOL = ["efficiency", "fortune", "silk_touch"];
const END = ["unbreaking", "mending", "vanishing_curse"];
const HELMET = [...PROT, "respiration", "aqua_affinity", "thorns", "unbreaking", "mending", "binding_curse", "vanishing_curse"];

// "key@bedrock" means the enchantment is only allowed on that item in that edition.
const ITEMS = [
  { k: "helmet", n: "Helmet", cat: "Armor", e: HELMET },
  { k: "chestplate", n: "Chestplate", cat: "Armor", e: [...PROT, "thorns", "unbreaking", "mending", "binding_curse", "vanishing_curse"] },
  { k: "leggings", n: "Leggings", cat: "Armor", e: [...PROT, "swift_sneak", "thorns", "unbreaking", "mending", "binding_curse", "vanishing_curse"] },
  { k: "boots", n: "Boots", cat: "Armor", e: [...PROT, "feather_falling", "depth_strider", "frost_walker", "soul_speed", "thorns", "unbreaking", "mending", "binding_curse", "vanishing_curse"] },
  { k: "turtle_shell", n: "Turtle Shell", cat: "Armor", e: HELMET },
  { k: "elytra", n: "Elytra", cat: "Armor", e: ["unbreaking", "mending", "binding_curse", "vanishing_curse"] },
  { k: "sword", n: "Sword", cat: "Weapons", e: [...DMG, "knockback", "fire_aspect", "looting", "sweeping_edge", ...END] },
  { k: "axe", n: "Axe", cat: "Weapons", e: [...DMG, ...TOOL, ...END] },
  { k: "mace", n: "Mace", cat: "Weapons", e: ["density", "breach", "smite", "bane_of_arthropods", "wind_burst", "fire_aspect", ...END] },
  { k: "spear", n: "Spear", cat: "Weapons", e: [...DMG, "knockback", "fire_aspect", "looting", "lunge", ...END] },
  { k: "trident", n: "Trident", cat: "Weapons", e: ["impaling", "loyalty", "channeling", "riptide", ...END] },
  { k: "bow", n: "Bow", cat: "Weapons", e: ["power", "punch", "flame", "infinity", ...END] },
  { k: "crossbow", n: "Crossbow", cat: "Weapons", e: ["multishot", "piercing", "quick_charge", ...END] },
  { k: "pickaxe", n: "Pickaxe", cat: "Tools", e: [...TOOL, ...END] },
  { k: "shovel", n: "Shovel", cat: "Tools", e: [...TOOL, ...END] },
  { k: "hoe", n: "Hoe", cat: "Tools", e: [...TOOL, ...END] },
  { k: "fishing_rod", n: "Fishing Rod", cat: "Tools", e: ["luck_of_the_sea", "lure", ...END] },
  { k: "shears", n: "Shears", cat: "Tools", e: ["efficiency", "silk_touch@bedrock", ...END] },
  { k: "shield", n: "Shield", cat: "Other", e: END },
  { k: "flint_and_steel", n: "Flint and Steel", cat: "Other", e: END },
  { k: "brush", n: "Brush", cat: "Other", e: END },
  { k: "carrot_on_a_stick", n: "Carrot on a Stick", cat: "Other", e: END },
  { k: "warped_fungus_on_a_stick", n: "Warped Fungus on a Stick", cat: "Other", e: END },
];

const MAX_COST = 39;

function enchantsFor(item, edition) {
  return item.e.flatMap(raw => {
    const [key, ed] = raw.split("@");
    if (ed && ed !== edition) return [];
    if (ENCH[key].only && ENCH[key].only !== edition) return [];
    return [key];
  });
}

function bookMultiplier(key, edition) {
  const e = ENCH[key];
  return edition === "bedrock" && e.bedrockM ? e.bedrockM : e.m;
}

function conflicts(a, b) {
  return a !== b && CONFLICTS.some(g => g.includes(a) && g.includes(b));
}

const penalty = uses => (1 << uses) - 1;

// Total experience points needed to reach a level from zero.
function xpForLevel(l) {
  if (l <= 16) return l * l + 6 * l;
  if (l <= 31) return 2.5 * l * l - 40.5 * l + 360;
  return 4.5 * l * l - 162.5 * l + 2220;
}

/* ---------- Solver ----------
 * Leaf 0 is the item, leaves 1..n are books. dp over (subset, anvil uses of the result):
 * best total cost to combine that subset into one item/book. The item must always sit in the
 * left slot, so any subset holding it splits into (left: has item, right: books only).
 * Ties on the primary goal break on the secondary goal, then on fewer anvil uses.
 */
function solve(books, { itemUses = 0, cap = true, mode = "levels" } = {}) {
  const leaves = [{ val: 0, uses: itemUses }, ...books.map(b => ({ val: b.val, uses: 0 }))];
  const N = leaves.length;
  const FULL = (1 << N) - 1;
  const W = N + itemUses + 1;
  const size = (FULL + 1) * W;
  const p1 = new Float64Array(size).fill(Infinity);
  const p2 = new Float64Array(size).fill(Infinity);
  const lvA = new Float64Array(size);
  const xpA = new Float64Array(size);
  const pick = new Int32Array(size).fill(-1);
  const pwA = new Int8Array(size);
  const pwB = new Int8Array(size);

  const val = new Int32Array(FULL + 1);
  for (let m = 1; m <= FULL; m++) {
    const low = m & -m;
    val[m] = val[m ^ low] + leaves[31 - Math.clz32(low)].val;
  }
  for (let i = 0; i < N; i++) {
    const at = (1 << i) * W + leaves[i].uses;
    p1[at] = 0; p2[at] = 0; lvA[at] = 0; xpA[at] = 0;
  }

  for (let mask = 1; mask <= FULL; mask++) {
    if ((mask & (mask - 1)) === 0) continue;
    const hasItem = mask & 1;
    for (let a = (mask - 1) & mask; a > 0; a = (a - 1) & mask) {
      if (hasItem && !(a & 1)) continue;
      const b = mask ^ a;
      for (let wa = 0; wa < W; wa++) {
        const ia = a * W + wa;
        if (p1[ia] === Infinity) continue;
        for (let wb = 0; wb < W; wb++) {
          const ib = b * W + wb;
          if (p1[ib] === Infinity) continue;
          const w = Math.max(wa, wb) + 1;
          if (w >= W) continue;
          const cost = penalty(wa) + penalty(wb) + val[b];
          if (cap && cost > MAX_COST) continue;
          const lv = lvA[ia] + lvA[ib] + cost;
          const xp = xpA[ia] + xpA[ib] + xpForLevel(cost);
          const q1 = mode === "xp" ? xp : lv;
          const q2 = mode === "xp" ? lv : xp;
          const it = mask * W + w;
          if (q1 < p1[it] || (q1 === p1[it] && q2 < p2[it])) {
            p1[it] = q1; p2[it] = q2; lvA[it] = lv; xpA[it] = xp;
            pick[it] = a; pwA[it] = wa; pwB[it] = wb;
          }
        }
      }
    }
  }

  let bestW = -1;
  for (let w = 0; w < W; w++) {
    const it = FULL * W + w;
    if (p1[it] === Infinity) continue;
    const bt = FULL * W + bestW;
    if (bestW < 0 || p1[it] < p1[bt] || (p1[it] === p1[bt] && p2[it] < p2[bt])) bestW = w;
  }
  if (bestW < 0) return null;

  const build = (mask, w) => {
    const it = mask * W + w;
    if ((mask & (mask - 1)) === 0) {
      const i = 31 - Math.clz32(mask);
      return { leaf: i, mask, uses: w };
    }
    const a = pick[it], b = mask ^ a;
    const left = build(a, pwA[it]), right = build(b, pwB[it]);
    return {
      mask, uses: w, left, right,
      cost: penalty(pwA[it]) + penalty(pwB[it]) + val[b],
      parts: { leftPen: penalty(pwA[it]), rightPen: penalty(pwB[it]), ench: val[b] },
    };
  };
  const tree = build(FULL, bestW);
  return { tree, levels: lvA[FULL * W + bestW], xp: xpA[FULL * W + bestW], uses: bestW };
}

// One book at a time onto the item, in the order given: what most players do.
function naive(books, itemUses = 0) {
  let uses = itemUses, levels = 0, worst = 0;
  for (const b of books) {
    const cost = penalty(uses) + b.val;
    levels += cost; worst = Math.max(worst, cost); uses++;
  }
  return { levels, worst };
}

// Flatten the tree into anvil jobs, shallow merges first so books get paired before they hit the item.
function toSteps(tree) {
  const steps = [];
  const height = n => n.leaf !== undefined ? 0 : 1 + Math.max(height(n.left), height(n.right));
  const walk = n => {
    if (n.leaf !== undefined) return;
    walk(n.left); walk(n.right);
    steps.push({ node: n, h: height(n) });
  };
  walk(tree);
  steps.sort((x, y) => x.h - y.h);
  steps.forEach((s, i) => { s.node.step = i + 1; });
  return steps.map(s => s.node);
}

if (typeof module !== "undefined") module.exports = { ENCH, ITEMS, solve, naive, toSteps, enchantsFor, bookMultiplier, conflicts, xpForLevel, penalty };
