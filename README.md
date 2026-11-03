# Survival Toolkit

Planners for the fiddly parts of Minecraft survival, for Java and Bedrock:

- **Anvil Planner**: pick an item and the enchantments you want. It finds the anvil order that costs the fewest XP points (or levels), without any job hitting "Too Expensive!". It searches every possible merge order, so the plan is the true minimum, not a rule of thumb.
- **Brewing Guide**: pick a potion, how strong it should be and the bottle type. It lists every brewing step, what goes into the stand, and how many ingredients and blaze powder you need.

## Run it

Open `index.html` in a browser. There is no build step needed to use it.

## Edit it

The source lives in `src/`:

- `solver.js`: enchantment data and the anvil merge-order search
- `brew-data.js`: potion recipes and durations
- `icons.js`, `icons2.js`, `icons3.js`: original 16×16 pixel-art icons, drawn from text templates
- `ui.js`, `brew-ui.js`: the two tools and the tool tabs
- `body.html`, `brew.html`, `style.css`, `brew.css`: the page

After editing, rebuild the page and the site icons:

```bash
python3 build.py
```

Icons are original pixel art in a Minecraft style, not Mojang textures. Not an official Minecraft product.
