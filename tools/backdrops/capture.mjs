// Screenshots of the Mobs tab's stage backgrounds, the mob hidden, one per background, numbered as the gallery numbers
// them (#1 savanna ... #43 end): in the order the mobs, their variants, rows and name tags first show each background, then
// those only the Structures tab shows.
//   node tools/backdrops/capture.mjs <out-dir> [biome,biome,...]
// With biomes, only those are captured (their numbers stay the same). Writes NN_<biome>.png and index.json (every
// background, in order, with the mobs, variants and names that show it). Needs Google Chrome; reads the built index.html,
// so run `python3 build.py` first.
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [out, only] = process.argv.slice(2);
if (!out) { console.error("usage: node tools/backdrops/capture.mjs <out-dir> [biome,biome,...]"); process.exit(1); }
const want = only ? new Set(only.split(",")) : null;
mkdirSync(out, { recursive: true });
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const page = `file://${join(root, "index.html")}#mobs`;
// A port and profile of its own each run, so a Chrome left over from another run can't answer with an old page.
const port = 9400 + Math.floor(Math.random() * 500), profile = mkdtempSync(join(tmpdir(), "backdrops-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--allow-file-access-from-files",
  "--window-size=1400,1000", "--force-device-scale-factor=1", "--use-angle=swiftshader", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Done: close Chrome, then (once it has let go of it) its profile.
const done = code => {
  const finish = () => { try { rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); };
  chrome.once("exit", finish);
  chrome.kill();
  setTimeout(finish, 3000);
};
try {
  let ws;
  for (let i = 0; i < 60 && !ws; i++) {
    try { const tab = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === "page"); if (tab) ws = new WebSocket(tab.webSocketDebuggerUrl); } catch {}
    if (!ws) await sleep(200);
  }
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const run = async expr => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return r.result.result.value;
  };
  await send("Page.enable");
  await send("Page.navigate", { url: page });
  await sleep(4000);
  // Bedrock, so the pack's name tags (and the backgrounds they bring) are on.
  await run(`(document.querySelector('#edition button[data-ed="bedrock"]') || { click() {} }).click(); location.hash = "mobs"; true`);
  await sleep(500);
  const configs = await run(`(() => {
    const out = [];
    for (const m of MOBS) {
      out.push({ mob: m.k, label: m.n });
      for (const v of MOB_VARIANTS[m.k] || []) if (v.biome) out.push({ mob: m.k, variant: v.k, label: m.n + " (" + v.n + ")" });
      for (const r of rowsOf(m.k)) for (const x of r.kinds) if (x.biome) out.push({ mob: m.k, row: r.k, kind: x.k, label: m.n + " (" + x.n + ")" });
      for (const t of shownTags(m.k)) if (t.biome || t.kind === SNOWY) out.push({ mob: m.k, tag: t.names[0], label: m.n + " named " + t.names[0] });
    }
    // Then the Structures tab's: shown on the Mobs tab's stage (the same size), with the structure's first mob (or its first kind's).
    for (const s of STRUCTURES) if (sceneOf(s.k)) out.push({ mob: (((s.mobs || (s.kinds && s.kinds.find(k => k.mobs) || {}).mobs || [])[0]) || {}).mob || MOBS[0].k, scene: sceneOf(s.k), label: "Structures: " + s.n });
    // And a kind's own (a village's), with the kind's first mob.
    for (const s of STRUCTURES) for (const k of s.kinds || []) { const sc = sceneOf(s.k + "/" + k.k); if (STRUCTURE_SCENES[s.k + "/" + k.k]) out.push({ mob: ((k.mobs || s.mobs || [])[0] || {}).mob || MOBS[0].k, scene: sc, label: "Structures: " + s.n + " (" + k.n + ")" }); }
    return out;
  })()`);
  const seen = {}, order = [], motions = {};
  for (const c of configs) {
    await run(`(() => { pickMob(${JSON.stringify(c.mob)}, ${JSON.stringify(c.tag || "")});
      ${c.variant ? `document.querySelector('button[data-variant="${c.variant}"]').click();` : ""}
      ${c.row ? `document.querySelector('button[data-row="${c.row}"][data-kind="${c.kind}"]').click();` : ""}
      ${c.scene ? `const st = document.getElementById("mob-stage"); st.dataset.biome = ${JSON.stringify(c.scene)};
        st.style.setProperty("--ground", "url('" + groundArt(${JSON.stringify(c.scene)}) + "')"); mobBackdrop.show(${JSON.stringify(c.scene)});` : ""}
      return true; })()`);
    const biome = await run(`document.getElementById("mob-stage").dataset.biome`);
    if (seen[biome]) { seen[biome].push(c.label); continue; }
    seen[biome] = [c.label];
    order.push(biome);
    motions[biome] = await run(`mobBackdrop.motion()`);
    if (want && !want.has(biome)) continue;
    await sleep(2500);
    // The mob (and any glow the pack draws behind it, .stage-light: the blaze's), its name tag and the hint hidden (SHOW_MOB=1 keeps the mob, to judge the scene round it); the clouds'
    // drift stopped at its start. What moves (.stage-motion) is left out too: the gallery draws it over the picture, moving.
    const hide = process.env.SHOW_MOB ? ".stage-hint,#mob-tag" : "#mob-art,.stage-light,.stage-motion,.stage-hint,#mob-tag";
    const box = await run(`(() => { const s = document.getElementById("mob-stage");
      for (const el of s.querySelectorAll(${JSON.stringify(hide)})) el.style.visibility = "hidden";
      for (const a of document.getAnimations()) a.pause(), a.currentTime = 0;
      const r = s.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })()`);
    await sleep(300);
    const shot = await send("Page.captureScreenshot", { format: "png", clip: { ...box, scale: 1 }, captureBeyondViewport: true });
    const file = join(out, `${String(order.length).padStart(2, "0")}_${biome}.png`);
    writeFileSync(file, Buffer.from(shot.result.data, "base64"));
    console.log(`#${order.length} ${biome} (${c.label}) -> ${file}`);
  }
  writeFileSync(join(out, "index.json"), JSON.stringify(order.map(b => ({ biome: b, mobs: seen[b], ...(motions[b] && { motion: motions[b] }) })), null, 1));
  done(0);
} catch (e) {
  console.error(e);
  done(1);
}
