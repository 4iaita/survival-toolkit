/* ---------- Tool tabs ---------- */
const VIEWS = ["equipment", "potions", "banners", "fireworks", "pots", "trading", "mobs", "structures", "armorstands"];
function showView() {
  const current = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "equipment";
  for (const v of VIEWS) {
    $("view-" + v).hidden = v !== current;
    if (v === current) $("tab-" + v).setAttribute("aria-current", "page");
    else $("tab-" + v).removeAttribute("aria-current");
  }
}
window.addEventListener("hashchange", showView);

const SPLASHES = ["Never Too Expensive!", "Now with potions!", "Brew responsibly!", "Also try nether wart!", "XP well spent!", "Mind the blaze powder!", "Hrmm!", "Emeralds welcome!"];
$("splash").textContent = SPLASHES[Math.floor(Math.random() * SPLASHES.length)];

showView();
