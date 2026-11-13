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
    ("chicken", "halloween"): "A zombie chicken, rotting, one eye glowing white in the dark.",
    ("chicken", "baby zombified"): "A zombie chick, rotting, one eye glowing white in the dark.",
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
    ("cow", "zombified calf"): "A zombie calf, rotting, one eye glowing white in the dark.",
    ("cow", "cherry"): "A crown of cherry blossoms.",
    ("cow", "strawberry"): "A pink strawberry cow with pale spots.",
    ("cow", "halloween"): "A zombie cow, rotting, its ribs showing and its eyes glowing white in the dark.",
    ("cow", "dappled"): "Orange leaves on its head.",
    ("fox", "raccoon"): "A raccoon: gray fur with a black mask round its eyes, black ears, a white snout with a black nose and a long tail ringed in black and pale gray.",
    ("fox", "jimothy"): "A chubby little raccoon: one round gray body with its black-masked face on the front, stubby legs, small ears and a short striped tail.",
    ("frog", "baby imp"): "A baby imp: a little devil frog with big pointed ears and eyes that glow in the dark. It’s red, olive or gray as the frog is temperate, cold or warm, and its eyes glow yellow, or lime green on a warm one.",
    ("frog", "rana"): "A child crouching like a frog in a green frog hood, with the frog’s big eyes on top and a red and orange band round its rim, red hair and teal eyes.",
    ("frog", "rhadora"): "A child crouching like a frog in a white frog hood striped with orange, with the frog’s big eyes on top, dark purple hair and purple sleeves.",
    ("frog", "sapo"): "A child crouching like a frog in an orange frog hood with a yellow band, with the frog’s big eyes on top, green hair, and green and yellow legs.",
    ("frog", "halloween"): "An imp: a devil frog with big pointed bat ears, two pale tusks and eyes that glow in the dark. It’s red, olive or gray as the frog is temperate, cold or warm, and its eyes glow yellow, or lime green on a warm one.",
    ("turtle", "halloween"): "Nessie, the Loch Ness monster: a dark teal sea serpent with a humped back of three ridged bumps, a long neck and a long tail curling up from either end lined with spines, four flippers and lime green eyes that glow in the dark.",
    ("wolf", "hellhound pup"): "A hellhound pup: a little demon hound with spiky ears, a spiky tail and eyes that glow in the dark. Its colors follow the wolf’s variant: crimson on a pale wolf, gray on an ashen one, black, purple on a chestnut one, red on a rusty one, icy cyan on a snowy one, mossy green on a spotted one, bone white on a striped one and brown on a woods one, its eyes glowing orange, red, purple, cyan or lime green to match.",
    ("wolf", "hellhound"): "A hellhound: a hulking demon hound with spiky ears and fangs, ragged spines down its back and tail and eyes that glow in the dark. Its colors follow the wolf’s variant: crimson on a pale wolf, gray on an ashen one, black, purple on a chestnut one, red on a rusty one, icy cyan on a snowy one, mossy green on a spotted one, bone white on a striped one and brown on a woods one, its eyes glowing orange, red, purple, cyan or lime green to match. Named Halloween, it’s this or a skeleton wolf (1 in 10), picked at random.",
    ("pufferfish", "baby"): "Keeps it small and deflated: it never puffs up, even when something comes near.",
    ("goat", "evil kiddo"): "A baby demon goat: black, with two little horns, red inside its ears, a red forked devil’s tail and pale eyes that glow in the dark.",
    ("goat", "halloween"): "A demon goat: shaggy and black, with big curling red horns, a red forked devil’s tail and pale eyes, its horns and eyes glowing in the dark.",
    ("horse", "wendigo foal"): "A baby wendigo: a bare deer skull with little antlers for a head, the bones of its back and legs showing through a ragged hide the color of its coat, and eyes that glow in the dark (red, white, orange, purple or teal, by its coat).",
    ("wandering_trader", "halloween"): "A fortune teller: a purple robe with orange trim and a fringed hem, a red scarf hanging down its back, green boots, and an orange headband with a feather and a gold charm on it, the charm’s green eye and its own eyes glowing in the dark.",
    ("camel_husk", "halloween"): "An executioner’s beast: a shaggy red-brown hide, an iron collar round its neck and iron cuffs on its legs, a gray band over its back, spikes sticking out of its head and hump, and yellow eyes that glow in the dark.",
    ("camel_husk", "executioner calf"): "A baby executioner’s beast: a shaggy red-brown hide, an iron collar and iron cuffs on its legs, spikes sticking out of its head and hump, and yellow eyes that glow in the dark.",
    ("husk", "halloween"): "An executioner: a red-brown hood over its head with iron spikes sticking out of it and a single eyehole, its yellow eye glowing in the dark, a ragged collar over ragged brown clothes, iron cuffs on its wrists and an iron shackle on one ankle. It goes with the camel husk’s Executioner look, the beast it rides.",
    ("husk", "baby executioner"): "A baby executioner: a red-brown hood over its big head with iron spikes sticking out of it and a single eyehole, its yellow eye glowing in the dark, a ragged collar over ragged brown clothes and an iron shackle on one ankle.",
    ("parched", "halloween"): "An executioner: a red-brown hood with iron spikes sticking out of it and two yellow eyes glowing in the dark from under it, a ragged red-brown robe and a ragged belt over its bones, and iron cuffs on its wrists and ankles. It goes with the camel husk’s Executioner look, the beast it rides.",
    ("parched", "baby executioner"): "A baby executioner: a big red-brown hood with iron spikes sticking out of it and two yellow eyes glowing in the dark from under it, long ragged sleeves curling at the ends, and iron cuffs on its ankles.",
    ("parched", "baby"): "A baby parched with a big head, its yellow eyes glowing in the dark.",
    ("trader_llama", "halloween"): "A fortune teller’s costume: a purple robe with orange trim and tassels, rolled red and green rugs on its back, a purple headscarf, a green eye charm at its throat, a green orb that glows in the dark hanging at one side and a little purple creature, its magenta eyes glowing too, clinging to the other.",
    ("horse", "halloween"): "A wendigo: a bare deer skull with wide branching antlers on a bony neck, ribs and spine showing through a ragged hide the color of its coat, bone legs, and eyes that glow in the dark (red, white, orange, purple or teal, by its coat).",
    ("nautilus", "sea monster nautiling"): "A baby sea monster: a dark purple shell striped with crimson and hooked with spines, a black face with two glowing red eyes, and tentacles curled at the tips.",
    ("nautilus", "halloween"): "A sea monster: a dark purple shell striped with crimson and hooked with spines, a black face with two glowing red eyes, and long tentacles curled at the tips.",
    ("zombie_nautilus", "sea monster nautiling"): "A baby zombie sea monster: a dark teal shell striped with green and hooked with spines, a black face with two glowing lime green eyes, and tentacles curled at the tips.",
    ("zombie_nautilus", "halloween"): "A zombie sea monster: a dark teal shell striped with green and hooked with spines, a black face with two glowing lime green eyes, and long tentacles curled at the tips.",
    ("iron_golem", "cherry"): "Pink cherry blossoms grow among the vines over its body, arms and legs, in place of its poppies.",
    ("iron_golem", "butler"): "A butler’s black waistcoat and trousers, a white cravat and white spats. The pack draws no cracks on it, however hurt it is.",
    ("iron_golem", "dappled"): "Orange and red autumn leaves grow over its body, arms and legs in place of its vines and poppies, with one on its head.",
    ("snow_golem", "baby"): "A small snowman, its head on a single ball of snow, with a coal face and no pumpkin.",
    ("copper_golem", "maid"): "A maid’s outfit: a black dress with a white apron tied in a big bow at the back and a white frilled headband, its copper head and glowing eyes showing. The copper oxidizes with its stage.",
    ("copper_golem", "halloween"): "A voodoo doll: a stitched brown burlap body, one black and one red button for eyes, and pins stuck in its head.",
    ("mooshroom", "zombified calf"): "A zombie mooshroom calf, rotting, its eyes glowing faintly.",
    ("mooshroom", "halloween"): "A zombie mooshroom, rotting, its eyes glowing faintly.",
    ("ocelot", "witch kitten"): "A baby ocelot in a witch’s hat.",
    ("ocelot", "halloween"): "A witch’s hat.",
    ("panda", "freddy"): "A brown bear in a little top hat and bow tie.",
    ("panda", "grizzly"): "A brown grizzly bear.",
    ("pig", "zombified piglet"): "A zombie piglet, its pink flesh rotting green at the edges, with bare bone showing on its side and legs, and one eye glowing white in the dark.",
    ("pig", "baby skeleton"): "A piglet’s skeleton: a bony skull and ribcage on bare bone legs.",
    ("pig", "cherry"): "A wreath of pink cherry blossoms and leaves round its head, and a leafy twig poking out beside its snout.",
    ("pig", "dappled"): "Orange leaves on its head.",
    ("pig", "halloween"): "A zombie pig, its pink flesh rotting green at the edges, with bare bone showing on its head, ribs and legs, and one eye glowing white in the dark.",
    ("pig", "skeleton"): "A pig’s skeleton: a bony skull and ribcage on bare bone legs.",
    ("rabbit", "easter"): "A chocolate bunny with a red ribbon tied round its neck, its back half still wrapped in gold foil.",
    ("rabbit", "punk"): "A punk: a white rabbit in a black jacket bristling with silver studs, with red-tipped ears, a gold safety pin through one of them, black round its eyes and a red tail.",
    ("rabbit", "cherry"): "A pink cherry blossom on its head, by one ear, over its own coat.",
    ("sheep", "ghost lamb"): "A lamb dressed as a ghost: a pale gray sheet over its head and body, with black eye holes and white eyes that glow in the dark.",
    ("sheep", "cherry"): "Pink cherry blossoms dotted over its wool.",
    ("sheep", "dappled"): "Orange leaves on its head and back.",
    ("sheep", "halloween"): "Dressed as a ghost: a tattered pale gray sheet over its head and body, with black eye holes and white eyes that glow in the dark.",
    ("sniffer", "snowy"): "Snow heaped on its back and head, its moss frosted a pale blue-green, and frost on its feet.",
    ("sniffer", "cherry"): "Its moss a lighter green, covered in pink cherry blossoms, over magenta fur.",
    ("sniffer", "dappled"): "Its moss turned orange, like autumn leaves.",
    ("spider", "cherry"): "Pink cherry blossoms and green leaves grow over its back and legs.",
    ("spider", "sulfur"): "A dull olive spider with pale yellow markings on its back and leg tips, and pale yellow eyes that glow orange.",
    ("spider", "dappled"): "Orange and red leaves on its back and head.",
    ("spider", "pale"): "Pale gray legs under a dark brown body, and orange eyes that glow.",
    ("spider", "halloween"): "A dark purple spider with magenta bands on its legs and a big bone-white skull, with pink eyes, for a back.",
    ("zombie", "baby frankenstein"): "Frankenstein’s monster as a baby: green, in a purple coat over a pale ragged shirt, dark ragged trousers and brown boots. Half of them, picked at random, have flat black hair and bolts in the sides of the head, the rest a stitched-up head with its pink brain showing.",
    ("zombie", "halloween"): "Frankenstein’s monster: green, in a purple coat over a pale ragged shirt, dark ragged trousers and brown boots. Its head is one of five, picked at random (and its arms and legs vary too): flat black hair, or a stitched-up skull with its pink brain showing, some with bolts in the sides.",
    ("zombie", "cherry"): "Pink cherry blossoms: a crown of them round its head and more on top, a garland across its chest and more on its arms, a strand of them trailing from one.",
    ("zombie", "sulfur"): "Crusted with yellow sulfur on its head, shoulders, shirt and one foot, the crust glowing faintly in the dark.",
    ("zombie", "dappled"): "Orange, red and yellow autumn leaves on its head and shoulders, and a shelf fungus growing from a mossy patch on one leg. About 3 in 10 have a bare twig sticking out of the head, and 1 in 200 wear a carved pumpkin with a jack-o’-lantern face.",
    ("zombie", "pale"): "Faded: a dark, mossy gray-green head with glowing orange eyes, a washed-out teal shirt and ragged gray trousers.",
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
    ("rabbit", "cherry"): "rabbits in cherry groves",
    ("sheep", "cherry"): "sheep in cherry groves", ("sheep", "dappled"): "sheep in dappled forests",
    ("sniffer", "snowy"): "sniffers in snowy biomes", ("sniffer", "cherry"): "sniffers in cherry groves",
    ("sniffer", "dappled"): "sniffers in dappled forests",
    ("spider", "cherry"): "spiders in cherry groves", ("spider", "sulfur"): "spiders in sulfur caves",
    ("spider", "dappled"): "spiders in dappled forests", ("spider", "pale"): "spiders in pale gardens",
    # The pack also makes some mobs babies by itself (v.tocraa, with its seasonal mob variants off, as they start): 1 in
    # 200 guardians (not elder guardians), spiders and cave spiders.
    ("guardian", "baby"): "1 in 200 guardians", ("spider", "baby"): "1 in 200 spiders",
    ("cave_spider", "baby"): "1 in 200 cave spiders",
    # And 1 in 20 golems (iron, snow and copper).
    ("iron_golem", "baby"): "1 in 20 iron golems", ("snow_golem", "baby"): "1 in 20 snow golems", ("copper_golem", "baby"): "1 in 20 copper golems",
    # And 1 in 20 allays.
    ("allay", "baby"): "1 in 20 allays",
    # And 1 in 200 parched and vexes.
    ("parched", "baby"): "1 in 200 parched", ("vex", "baby"): "1 in 200 vexes",
    ("zombie", "cherry"): "zombies in cherry groves", ("zombie", "sulfur"): "zombies in sulfur caves",
    ("zombie", "dappled"): "zombies in dappled forests", ("zombie", "pale"): "zombies in pale gardens",
    ("iron_golem", "cherry"): "iron golems in cherry groves", ("iron_golem", "dappled"): "iron golems in dappled forests",
}
# The biomes those looks come from, which the stage shows behind a mob with that name: (mob, the lower-case name) -> a
# backdrop (src/backdrop.js).
BIOME = {
    **{(mob, "cherry"): "cherry_grove" for mob in ("chicken", "cow", "pig", "rabbit", "sheep", "sniffer", "spider")},
    **{(mob, "dappled"): "dappled_forest" for mob in ("chicken", "cow", "pig", "sheep", "sniffer", "spider")},
    ("spider", "pale"): "pale_garden", ("spider", "sulfur"): "sulfur_caves", ("sniffer", "snowy"): "snowy",
    ("iron_golem", "cherry"): "cherry_grove", ("iron_golem", "dappled"): "dappled_forest",
    ("zombie", "cherry"): "cherry_grove", ("zombie", "sulfur"): "sulfur_caves", ("zombie", "dappled"): "dappled_forest", ("zombie", "pale"): "pale_garden",
}
# Looks whose eyes glow (faint texels under an emissive material), which the stage shows at night: (mob, the lower-case
# name).
NIGHT = {("chicken", "halloween"), ("chicken", "baby zombified"), ("cow", "zombified calf"), ("cow", "halloween"),
         ("mooshroom", "zombified calf"), ("mooshroom", "halloween"), ("pig", "zombified piglet"), ("pig", "halloween"),
         ("sheep", "ghost lamb"), ("sheep", "halloween"), ("goat", "evil kiddo"), ("goat", "halloween"),
         ("frog", "baby imp"), ("frog", "halloween"), ("turtle", "halloween"),
         ("wolf", "hellhound pup"), ("wolf", "hellhound"),
         ("horse", "wendigo foal"), ("horse", "halloween"), ("trader_llama", "halloween"), ("wandering_trader", "halloween"), ("camel_husk", "halloween"), ("camel_husk", "executioner calf"), ("husk", "halloween"), ("husk", "baby executioner"), ("parched", "halloween"), ("parched", "baby executioner"), ("parched", "baby"),
         ("nautilus", "sea monster nautiling"), ("nautilus", "halloween"),
         ("zombie_nautilus", "sea monster nautiling"), ("zombie_nautilus", "halloween"),
         ("zombie", "sulfur"), ("zombie", "pale")}
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
                # A baby name that does something else on this mob (the pufferfish's keep it deflated) says so.
                if (mob, "baby") in WHAT:
                    row["what"] = WHAT[mob, "baby"]
                if (mob, "baby") in RARE:
                    row["rare"] = RARE[mob, "baby"]
                if (mob, "baby") in NIGHT:
                    row["night"] = True
            else:
                row["what"] = describe(mob, look["names"])
                if (mob, look["names"][0].lower()) in NIGHT:
                    row["night"] = True
                if (mob, look["names"][0].lower()) in BIOME:
                    row["biome"] = BIOME[mob, look["names"][0].lower()]
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
            kind, rare = r.pop("kind", None), r.pop("rare", None)
            body = ", ".join(f"{k}: {js(v)}" for k, v in r.items())
            lines.append(f"    {{ {body}{', kind: BABY' if kind else ''}{f', rare: {js(rare)}' if rare else ''} }},")
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
