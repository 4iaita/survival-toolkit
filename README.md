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
- `trade-data.js`: villager trades by profession and level
- `icons.js` … `icons4.js`: original 16×16 pixel-art icons, drawn from text templates
- `ui.js`, `brew-ui.js`, `trade-ui.js`: the three tools and the tool tabs
- `body.html`, `brew.html`, `trade.html` and the matching `.css` files: the page

After editing, rebuild the page and the site icons:

```bash
python3 build.py
```

Icons are original pixel art in a Minecraft style, not Mojang textures. Not an official Minecraft product.
