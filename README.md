# Survival Toolkit

Planners for the fiddly parts of Minecraft survival, for Java and Bedrock:

- **Anvil Planner**: pick an item and the enchantments you want. It finds the anvil order that costs the fewest XP points (or levels), without any job hitting "Too Expensive!". It searches every possible merge order, so the plan is the true minimum, not a rule of thumb.
- **Brewing Guide**: pick a potion, how strong it should be and the bottle type. It lists every brewing step, what goes into the stand, and how many ingredients and blaze powder you need.
- **Villager Trades**: pick a villager to see everything it buys and sells at each level, or search for an item (or an enchantment like Mending) to find who trades it.

## Run it

Open `index.html` in a browser. There is no build step needed to use it.

## Edit it

The source lives in `src/`:

- `solver.js`: enchantment data and the anvil merge-order search
- `brew-data.js`: potion recipes and durations
- `trade-data.js`: villager trades by profession and level, the kinds an item can come in (colors, tipped arrows, boat woods) and the enchantments villager gear can carry
- `icons.js` … `icons4.js`: original 16×16 pixel-art icons, drawn from text templates (used where the texture pack has no match)
- `art.js`, `icons5.js`: texture pack icons and which item uses which texture, including job site blocks and village biomes
- `villager.js`: the villager scene: the pack's villager model and skins for each biome and profession, beside its job site block as a 3D block model, turned together by dragging
- `backdrop.js`: each biome's countryside behind the villager scene (hills, trees, a village building and plants), built from block textures
- `ui.js`, `brew-ui.js`, `trade-ui.js`: the three tools and the tool tabs
- `body.html`, `brew.html`, `trade.html` and the matching `.css` files: the page

After editing, rebuild the page and the site icons:

```bash
python3 build.py
```

## Credits

Item and block textures in `art/` come from my own texture pack (Bedrock layout, kept next to this project in `../textures`). Every icon uses them: items, blocks (arranged into isometric icons), enchantments, villagers (skins in `art/villager/`, drawn on the 3D villager model), the page backdrop and the site icon (the chest). The page recolors potion liquid and tipped arrow heads for each effect. Only what the pack doesn’t have (the shield, banner and the arrow between trade slots) uses original pixel art drawn from templates in `src/`.

To pick up changes to the pack, copy its textures into `art/` and rebuild:

```bash
python3 import_textures.py ../textures
python3 build.py
```

The name map from pack files to icons is in `import_textures.py`.
