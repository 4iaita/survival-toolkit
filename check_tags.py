"""Check a mob's name tags against the Actions & Stuff pack: every name the pack checks for it is on the page, and
each row says what it does.

    python3 check_tags.py path/to/unpacked/pack path/to/textures mob[,mob...]

For each mob it lists the names the pack checks (in its entity scripts, render controllers and animation
controllers) that no row of src/tag-data.js or src/tag-data-more.js has, and the rows whose description is still
make_tags.py's placeholder ("The X look.", "A baby X.", "A Halloween costume."). It needs node, to read the page's
tag tables.
"""
import json
import re
import subprocess
import sys

pack_arg, textures_arg, mobs_arg = sys.argv[1:4]
sys.argv = ["import_models.py", pack_arg, textures_arg]

import import_additions as ia  # noqa: E402

im = ia.im
READ_TAGS = """
const fs = require("fs"), vm = require("vm"), ctx = {};
vm.createContext(ctx);
vm.runInContext(["src/tag-data.js", "src/tag-data-more.js"].map(f => fs.readFileSync(f, "utf8")).join("\\n").replace(/^const (\\w+) =/gm, "var $1 ="), ctx);
const rows = {};
for (const [mob, rs] of Object.entries(ctx.PACK_TAGS)) rows[mob] = rs.map(r => ({ names: [...r.names, ...(r.more || [])], what: r.what || null, kind: r.kind || null }));
process.stdout.write(JSON.stringify({ rows, game: ctx.GAME_TAGS.map(t => ({ names: t.names, mob: t.any ? "*" : t.mob })) }));
"""
PLACEHOLDER = re.compile(r"^(The .+ look\.|A baby [A-Z].*\.|A Halloween costume\.|A Christmas outfit\.|An Easter look\.)$")


def names_in(text):
    out = set()
    for m in re.finditer(r"is_name_any\(([^)]*)\)", text):
        out |= set(re.findall(r"'([^']*)'", m.group(1)))
    for m in re.finditer(r"get_name\s*==\s*'([^']*)'|'([^']*)'\s*==\s*q\.get_name", text):
        out |= {x for x in m.groups() if x}
    return {n for n in out if n and n.lower() not in ia.HIDDEN_NAMES and "\\u00a7" not in n and "§" not in n}


def main():
    ents, rcs, *_ = im.read_pack()
    controllers = {}
    for top in (im.pack, im.pack / "subpacks" / im.SUBPACK):
        folder = top / "animation_controllers"
        for f in sorted(folder.glob("*.json")) if folder.is_dir() else []:
            controllers.update(json.loads(f.read_text(encoding="utf-8")).get("animation_controllers", {}))
    page = json.loads(subprocess.run(["node", "-e", READ_TAGS], capture_output=True, text=True, check=True, cwd=im.root).stdout)
    by_mob = {im.MOB_KEYS.get(k.split(":")[1], k.split(":")[1]): d for k, d in ents.items() if k.startswith("minecraft:")}
    clean = True
    for mob in mobs_arg.split(","):
        d = by_mob.get(mob)
        if d is None:
            # Not an entity of the pack's (the tadpole): it checks no names, so the page should have no pack rows for it.
            rows = page["rows"].get(mob, [])
            print(f"{mob}: not in the pack, {len(rows)} rows on the page")
            clean = clean and not rows
            continue
        texts = [json.dumps(d, ensure_ascii=False)]
        for r in d.get("render_controllers", []):
            texts.append(json.dumps(rcs.get(r if isinstance(r, str) else next(iter(r)), {}), ensure_ascii=False))
        texts += [json.dumps(controllers[v], ensure_ascii=False) for v in d.get("animations", {}).values() if v in controllers]
        checked = {n for t in texts for n in names_in(t)}
        rows = page["rows"].get(mob, [])
        shown = {n.lower() for r in rows for n in r["names"]} | {n.lower() for g in page["game"] if g["mob"] in (mob, "*") for n in g["names"]}
        missing = sorted({n for n in checked if n.lower() not in shown}, key=str.lower)
        vague = [r["names"][0] for r in rows if not r["kind"] and (not r["what"] or PLACEHOLDER.match(r["what"]))]
        print(f"{mob}: {len({n.lower() for n in checked})} names in the pack, {len(rows)} rows on the page")
        if missing:
            print("  names the page doesn't have:", ", ".join(missing))
        if vague:
            print("  rows with placeholder descriptions:", ", ".join(vague))
        clean = clean and not missing and not vague
    print("all good" if clean else "fix the above")


if __name__ == "__main__":
    main()
