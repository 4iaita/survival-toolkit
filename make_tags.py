"""Write src/tag-data-more.js: the name tags for the looks import_additions.py added to src/mob-models.js.

    python3 make_tags.py path/to/old/mob-models.js

The old file is src/mob-models.js from before import_additions.py ran (a looks past its end are new; ones before it with
more names have new spellings). Every new look becomes a row of PACK_TAGS (mob -> rows, see tag-data.js), and new
spellings go onto the rows that already have that look. Run again after changing the descriptions below; it rewrites the file.
"""
import json
import re
import sys

root = __import__("pathlib").Path(__file__).parent
MAX_SHOWN = 4  # names a row shows as buttons; the other spellings are listed as "also spelled"


def looks_of(path):
    text = open(path).read()
    a = text.index("const MOB_LOOKS = {")
    b = text.index("\n};", a)
    out = {}
    for line in text[a:b].split("\n"):
        m = re.match(r'  "([^"]+)": (.*?),?$', line)
        if m:
            out[m.group(1)] = json.loads(m.group(2))
    return out


def title(name):
    return " ".join(w[:1].upper() + w[1:] for w in name.split(" "))


def spellings(names):
    """Names as the pack checks them -> (shown, more): each distinct name once, in capitals; other capitalizations of it
    that aren't all lower case (which the game takes anyway) as the extra spellings."""
    order, seen = [], {}
    for n in names:
        key = n.lower()
        if key not in seen:
            seen[key] = []
            order.append(key)
        seen[key].append(n)
    shown = [title(k) for k in order]
    more = [v for k in order for v in seen[k] if v != title(k) and v != k]
    return shown, more


# What a name does, said for the look. Each takes the lower-case name.
SEASONAL = {
    "halloween": "A Halloween costume.",
    "festive": "A Christmas outfit.",
    "easter": "An Easter look.",
}
# Looks better said in words of their own: (mob, the lower-case name) -> what it does.
WHAT = {
    ("armadillo", "pumpkin pup"): "A baby armadillo with a carved pumpkin for a shell.",
    ("armadillo", "halloween"): "A carved pumpkin for a shell.",
    ("bee", "firefly"): "A firefly: a dark brown beetle with long antennae and a red and orange striped belly.",
    ("axolotl", "baby gremlin"): "A baby gremlin: a purple critter with big pointed ears, sharp teeth and orange eyes.",
    ("axolotl", "pirate"): "A pirate: a gold-trimmed tricorn hat with a red feather, an eyepatch, and a wooden peg leg in place of a back leg.",
    ("axolotl", "halloween"): "A gremlin: a purple critter with big pointed ears, sharp teeth and orange eyes.",
    ("bee", "black moth"): "A black moth.",
    ("bee", "brown moth"): "A brown moth.",
    ("bee", "green moth"): "A green moth.",
    ("bee", "pink moth"): "A pink moth.",
    ("camel", "baby mummy"): "A baby camel wrapped in bandages like a mummy.",
    ("camel", "halloween"): "Wrapped in bandages like a mummy.",
    ("cat", "witch kitten"): "A kitten in a witch’s hat.",
    ("cat", "halloween"): "A witch’s hat.",
    ("cave_spider", "halloween"): "A dark teal spider with green bands on its legs and a big bone-white skull, with lime green eyes, for a back.",
    ("chicken", "halloween"): "A zombie chicken, rotting.",
    ("chicken", "baby zombified"): "A zombie chick, rotting.",
    ("chicken", "skeleton"): "A skeleton chicken, all bones.",
    ("chicken", "baby skeleton"): "A skeleton chick, all bones.",
    ("chicken", "peep"): "The old-style chick: a little yellow hen with a big head, half a hen’s size, that moves like one.",
    ("chicken", "egg head"): "A chick still in its eggshell. Now and then it pops the top of the shell to peek out, then shuts it again.",
    ("chicken", "chickzilla"): "A giant chick, sixteen times a chicken’s size, stomping slowly on the spot.",
    ("chicken", "chickle"): "A green chicken like a sea pickle.",
    ("chicken", "turkey"): "A turkey with its tail fanned out.",
    ("chicken", "rooster"): "A rooster with a tall green tail.",
    ("chicken", "duck"): "A white duck.",
    ("chicken", "cherry"): "A cherry blossom on its comb.",
    ("chicken", "villager"): "Dressed as a villager, with a villager’s big nose and eyes that move about and blink.",
    ("chicken", "dappled"): "Orange leaves on its head and tail.",
    ("cow", "zombified calf"): "A zombie calf, rotting.",
    ("cow", "cherry"): "A crown of cherry blossoms.",
    ("cow", "strawberry"): "A pink strawberry cow with pale spots.",
    ("cow", "halloween"): "A zombie cow, rotting, its ribs showing.",
    ("cow", "dappled"): "Orange leaves on its head.",
    ("mooshroom", "zombified calf"): "A zombie mooshroom calf, rotting, its eyes glowing faintly.",
    ("mooshroom", "halloween"): "A zombie mooshroom, rotting, its eyes glowing faintly.",
    ("ocelot", "witch kitten"): "A baby ocelot in a witch’s hat.",
    ("ocelot", "halloween"): "A witch’s hat.",
    ("panda", "freddy"): "A brown bear in a little top hat and bow tie.",
    ("panda", "grizzly"): "A brown grizzly bear.",
    ("pig", "zombified piglet"): "A zombie piglet, its pink flesh rotting green at the edges, with bare bone showing on its side and legs.",
    ("pig", "baby skeleton"): "A piglet’s skeleton: a bony skull and ribcage on bare bone legs.",
    ("pig", "cherry"): "A wreath of pink cherry blossoms and leaves round its head, and a leafy twig poking out beside its snout.",
    ("pig", "dappled"): "Orange leaves on its head.",
    ("pig", "halloween"): "A zombie pig, its pink flesh rotting green at the edges, with bare bone showing on its head, ribs and legs.",
    ("pig", "skeleton"): "A pig’s skeleton: a bony skull and ribcage on bare bone legs.",
    ("spider", "cherry"): "Pink cherry blossoms and green leaves grow over its back and legs.",
    ("spider", "sulfur"): "A dull olive spider with pale yellow markings on its back and leg tips, and pale yellow eyes that glow orange.",
    ("spider", "dappled"): "Orange and red leaves on its back and head.",
    ("spider", "pale"): "Pale gray legs under a dark brown body, and orange eyes that glow.",
    ("spider", "halloween"): "A dark purple spider with magenta bands on its legs and a big bone-white skull, with pink eyes, for a back.",
}
# Looks that only show in one climate (the pack checks the mob's climate too): (mob, the lower-case name) -> that
# climate, which the stage switches to, and what the row says it needs.
CLIMATE = {
    ("chicken", "cherry"): "temperate", ("chicken", "dappled"): "cold", ("cow", "strawberry"): "temperate", ("cow", "dappled"): "cold",
    ("cow", "cherry"): ["temperate", "warm"], ("pig", "muddy"): "temperate",
}
NEEDS = {"temperate": "Only temperate {mob}s, the usual kind.", "cold": "Only cold {mob}s, the kind from snowy biomes.",
         ("temperate", "warm"): "Not on cold {mob}s: their woolly heads hide the crown."}
# Looks the pack gives a mob by itself, without the name, in the biomes they belong to (with its biome looks setting on):
# (mob, the lower-case name) -> which of them, for the row's rare.
RARE = {
    ("pig", "cherry"): "pigs in cherry groves", ("pig", "dappled"): "pigs in dappled forests",
    ("spider", "cherry"): "spiders in cherry groves", ("spider", "sulfur"): "spiders in sulfur caves",
    ("spider", "dappled"): "spiders in dappled forests", ("spider", "pale"): "spiders in pale gardens",
}
BIOME_LOOKS = {"cherry": "cherry grove", "dappled": "dappled", "pale": "pale", "sulfur": "sulfur", "blossom": "blossom", "poplar": "poplar"}


def describe(mob, names):
    main = names[0].lower()
    if (mob, main) in WHAT:
        return WHAT[mob, main]
    if mob == "sulfur_cube" and main != "baby":
        return f"Holds {article(main)} {title(main)} inside its body."
    if main.startswith("baby "):
        return f"A baby {title(main[5:])}."
    if main in SEASONAL:
        return SEASONAL[main]
    if main in BIOME_LOOKS:
        return f"The {BIOME_LOOKS[main]} look."
    return f"The {title(main)} look."


def article(word):
    return "an" if word[:1] in "aeiou" else "a"


def js(v):
    return json.dumps(v, ensure_ascii=False)


def main():
    old = looks_of(sys.argv[1])
    new = looks_of(root / "src" / "mob-models.js")
    rows, more_names = {}, {}
    for mob, looks in sorted(new.items()):
        before = old.get(mob, [])
        for i, look in enumerate(looks):
            if i < len(before):
                fresh = [n for n in look["names"] if n.lower() not in {x.lower() for x in before[i]["names"]}]
                if fresh and before[i]["names"]:
                    more_names.setdefault(mob, []).append({"after": title(before[i]["names"][0]), "names": fresh})
                continue
            if not look["names"]:
                continue
            shown, extra = spellings(look["names"])
            baby = shown[0] == "Baby"
            row = {"names": shown[:MAX_SHOWN]}
            hidden = shown[MAX_SHOWN:] + extra
            if hidden:
                row["more"] = hidden
            if baby and shown[0] == "Baby":
                row["kind"] = "BABY"
            else:
                row["what"] = describe(mob, look["names"])
                if (mob, look["names"][0].lower()) in RARE:
                    row["rare"] = RARE[mob, look["names"][0].lower()]
                climate = CLIMATE.get((mob, look["names"][0].lower()))
                if climate:
                    row["needs"] = NEEDS[tuple(climate) if isinstance(climate, list) else climate].format(mob=mob)
                    row["climate"] = climate
            rows.setdefault(mob, []).append(row)

    lines = ["// Generated by make_tags.py from the looks import_additions.py added: the name tags the updated pack has that",
             "// tag-data.js doesn't (see there for what the fields mean). The rows are added to PACK_TAGS, and the new spellings",
             "// of names a row already has go onto that row.", "const PACK_TAGS_MORE = {"]
    for mob, rs in sorted(rows.items()):
        lines.append(f"  {mob}: [")
        for r in rs:
            kind = r.pop("kind", None)
            body = ", ".join(f"{k}: {js(v)}" for k, v in r.items())
            lines.append(f"    {{ {body}{', kind: BABY' if kind else ''} }},")
        lines.append("  ],")
    lines += ["};", "// New spellings for names a row has already: mob -> [{ after: the row's first name, names }].", "const PACK_SPELLINGS_MORE = {"]
    for mob, items in sorted(more_names.items()):
        lines.append(f"  {mob}: {js(items)},")
    lines += ["};",
              "for (const [mob, rs] of Object.entries(PACK_TAGS_MORE)) PACK_TAGS[mob] = [...(PACK_TAGS[mob] || []), ...rs];",
              "for (const [mob, items] of Object.entries(PACK_SPELLINGS_MORE)) {",
              "  for (const { after, names } of items) {",
              "    const row = (PACK_TAGS[mob] || []).find(r => r.names.some(n => n.toLowerCase() === after.toLowerCase()));",
              "    if (!row) continue;",
              "    const have = new Set([...row.names, ...(row.more || [])].map(n => n.toLowerCase()));",
              "    const fresh = [...new Set(names.map(n => n[0].toUpperCase() + n.slice(1)))].filter(n => !have.has(n.toLowerCase()));",
              "    const room = Math.max(0, 4 - row.names.length);",
              "    row.names = [...row.names, ...fresh.slice(0, room)];",
              "    row.more = [...(row.more || []), ...fresh.slice(room)];",
              "  }",
              "}", ""]
    (root / "src" / "tag-data-more.js").write_text("\n".join(lines))
    print(f"{sum(len(v) for v in rows.values())} new rows for {len(rows)} mobs; {sum(len(v) for v in more_names.values())} rows with new spellings")


if __name__ == "__main__":
    main()
