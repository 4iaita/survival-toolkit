/* ---------- Brewing data ----------
 * Durations are in seconds (0 = instant). A value of { java, bedrock } differs by edition.
 * path: [ingredient, resulting potion] pairs, starting from a water bottle.
 */
const BREW_ITEMS = {
  water_bottle: "Water Bottle",
  nether_wart: "Nether Wart",
  sugar: "Sugar",
  rabbit_foot: "Rabbit's Foot",
  glistering_melon: "Glistering Melon Slice",
  blaze_powder: "Blaze Powder",
  ghast_tear: "Ghast Tear",
  magma_cream: "Magma Cream",
  pufferfish: "Pufferfish",
  golden_carrot: "Golden Carrot",
  turtle_shell: "Turtle Shell",
  phantom_membrane: "Phantom Membrane",
  spider_eye: "Spider Eye",
  fermented_spider_eye: "Fermented Spider Eye",
  breeze_rod: "Breeze Rod",
  cobweb: "Cobweb",
  slime_block: "Slime Block",
  stone: "Stone",
  redstone: "Redstone Dust",
  glowstone: "Glowstone Dust",
  gunpowder: "Gunpowder",
  dragon_breath: "Dragon's Breath",
};

const WART = ["nether_wart", "awkward"];
const POTIONS = [
  { k: "swiftness", n: "Swiftness", cat: "Helpful", color: "#33ebff", fx: [["Speed", 1]], strongFx: [["Speed", 2]],
    path: [WART, ["sugar", "swiftness"]], dur: { base: 180, long: 480, strong: 90 } },
  { k: "leaping", n: "Leaping", cat: "Helpful", color: "#fdff84", fx: [["Jump Boost", 1]], strongFx: [["Jump Boost", 2]],
    path: [WART, ["rabbit_foot", "leaping"]], dur: { base: 180, long: 480, strong: 90 } },
  { k: "strength", n: "Strength", cat: "Helpful", color: "#ffc700", fx: [["Strength", 1]], strongFx: [["Strength", 2]],
    path: [WART, ["blaze_powder", "strength"]], dur: { base: 180, long: 480, strong: 90 } },
  { k: "healing", n: "Healing", cat: "Helpful", color: "#f82423", fx: [["Instant Health", 1]], strongFx: [["Instant Health", 2]],
    path: [WART, ["glistering_melon", "healing"]], dur: { base: 0, strong: 0 } },
  { k: "regeneration", n: "Regeneration", cat: "Helpful", color: "#cd5cab", fx: [["Regeneration", 1]], strongFx: [["Regeneration", 2]],
    path: [WART, ["ghast_tear", "regeneration"]], dur: { base: 45, long: { java: 90, bedrock: 120 }, strong: 22 } },
  { k: "fire_resistance", n: "Fire Resistance", cat: "Helpful", color: "#ff9900", fx: [["Fire Resistance", 1]],
    path: [WART, ["magma_cream", "fire_resistance"]], dur: { base: 180, long: 480 } },
  { k: "water_breathing", n: "Water Breathing", cat: "Helpful", color: "#98dac0", fx: [["Water Breathing", 1]],
    path: [WART, ["pufferfish", "water_breathing"]], dur: { base: 180, long: 480 } },
  { k: "night_vision", n: "Night Vision", cat: "Helpful", color: "#c2ff66", fx: [["Night Vision", 1]],
    path: [WART, ["golden_carrot", "night_vision"]], dur: { base: 180, long: 480 } },
  { k: "invisibility", n: "Invisibility", cat: "Helpful", color: "#f6f6f6", fx: [["Invisibility", 1]],
    path: [WART, ["golden_carrot", "night_vision"], ["fermented_spider_eye", "invisibility"]], dur: { base: 180, long: 480 } },
  { k: "slow_falling", n: "Slow Falling", cat: "Helpful", color: "#f3cfb9", fx: [["Slow Falling", 1]],
    path: [WART, ["phantom_membrane", "slow_falling"]], dur: { base: 90, long: 240 } },
  { k: "turtle_master", n: "the Turtle Master", short: "Turtle Master", cat: "Helpful", color: "#8e7ae8",
    fx: [["Slowness", 4], ["Resistance", 3]], strongFx: [["Slowness", 6], ["Resistance", 4]],
    path: [WART, ["turtle_shell", "turtle_master"]], dur: { base: 20, long: 40, strong: 20 } },
  { k: "slowness", n: "Slowness", cat: "Harmful", color: "#8bafe0", fx: [["Slowness", 1]], strongFx: [["Slowness", 4]],
    path: [WART, ["sugar", "swiftness"], ["fermented_spider_eye", "slowness"]], dur: { base: 90, long: 240, strong: 20 } },
  { k: "harming", n: "Harming", cat: "Harmful", color: "#a9656a", fx: [["Instant Damage", 1]], strongFx: [["Instant Damage", 2]],
    path: [WART, ["glistering_melon", "healing"], ["fermented_spider_eye", "harming"]], dur: { base: 0, strong: 0 } },
  { k: "poison", n: "Poison", cat: "Harmful", color: "#87a363", fx: [["Poison", 1]], strongFx: [["Poison", 2]],
    path: [WART, ["spider_eye", "poison"]], dur: { base: 45, long: { java: 90, bedrock: 120 }, strong: { java: 21, bedrock: 22 } } },
  { k: "weakness", n: "Weakness", cat: "Harmful", color: "#484d48", fx: [["Weakness", 1]],
    path: [["fermented_spider_eye", "weakness"]], dur: { base: 90, long: 240 } },
  { k: "wind_charging", n: "Wind Charging", cat: "Trial", color: "#bdc9ff", fx: [["Wind Charged", 1]],
    path: [WART, ["breeze_rod", "wind_charging"]], dur: { base: 180 } },
  { k: "weaving", n: "Weaving", cat: "Trial", color: "#78695a", fx: [["Weaving", 1]],
    path: [WART, ["cobweb", "weaving"]], dur: { base: 180 } },
  { k: "oozing", n: "Oozing", cat: "Trial", color: "#99ffa3", fx: [["Oozing", 1]],
    path: [WART, ["slime_block", "oozing"]], dur: { base: 180 } },
  { k: "infestation", n: "Infestation", cat: "Trial", color: "#8c9b8c", fx: [["Infested", 1]],
    path: [WART, ["stone", "infestation"]], dur: { base: 180 } },
];

const HARMFUL = new Set(["Slowness", "Instant Damage", "Poison", "Weakness", "Wind Charged", "Weaving", "Oozing", "Infested"]);
const WATER_COLOR = "#385dc6";
const BOTTLES_PER_BATCH = 3;
const BREWS_PER_BLAZE = 20;
const BREW_SECONDS = 20;

const potionByKey = k => POTIONS.find(p => p.k === k);
const byEdition = (v, edition) => (v && typeof v === "object" ? v[edition] : v);
const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function potionTitle(key, form = "drink") {
  if (key === "water") return "Water Bottle";
  if (key === "awkward") return "Awkward Potion";
  const base = `Potion of ${potionByKey(key).n}`;
  return form === "splash" ? `Splash ${base}` : form === "lingering" ? `Lingering ${base}` : base;
}

// Which modifiers a potion accepts, in display order.
const modsFor = p => ["base", ...("long" in p.dur ? ["long"] : []), ...("strong" in p.dur ? ["strong"] : [])];

// Effects of the finished potion. Lingering clouds apply a quarter of the duration.
function potionEffects(p, mod, form, edition) {
  const fx = mod === "strong" && p.strongFx ? p.strongFx : p.fx;
  let secs = byEdition(p.dur[mod], edition) || 0;
  if (form === "lingering") secs = Math.floor(secs / 4);
  return fx.map(([name, level]) => ({ name, level, secs, bad: HARMFUL.has(name) }));
}

// Brewing steps for `count` bottles. Each step is one 20-second brew on a full stand of up to 3 bottles.
function brewPlan(p, { mod = "base", form = "drink", count = 3 } = {}) {
  const steps = [];
  let cur = { key: "water", mod: "base", form: "drink" };
  const add = (item, next) => { steps.push({ item, from: cur, to: next }); cur = next; };
  for (const [item, key] of p.path) add(item, { key, mod: "base", form: "drink" });
  if (mod === "long") add("redstone", { ...cur, mod: "long" });
  if (mod === "strong") add("glowstone", { ...cur, mod: "strong" });
  if (form !== "drink") add("gunpowder", { ...cur, form: "splash" });
  if (form === "lingering") add("dragon_breath", { ...cur, form: "lingering" });

  const batches = Math.ceil(count / BOTTLES_PER_BATCH);
  const brews = steps.length * batches;
  const items = new Map([["water_bottle", count]]);
  for (const s of steps) items.set(s.item, (items.get(s.item) || 0) + batches);
  return { steps, batches, brews, fuel: Math.ceil(brews / BREWS_PER_BLAZE), seconds: brews * BREW_SECONDS, items: [...items] };
}
