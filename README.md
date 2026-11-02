# Anvil Order Planner

Pick your Minecraft edition (Java or Bedrock), an item and the enchantments you want. The planner finds the anvil order that costs the fewest XP points (or levels), without any job hitting "Too Expensive!".

It searches every possible merge order, so the plan is the true minimum, not a rule of thumb.

## Run it

Open `index.html` in a browser. There is no build step needed to use it.

## Edit it

The source lives in `src/`:

- `solver.js`: enchantment data and the merge-order search
- `icons.js`, `icons2.js`: original 16×16 pixel-art icons, drawn from text templates
- `ui.js`, `body.html`, `style.css`: the page

After editing, rebuild the single-file page:

```bash
python3 build.py
```

Icons are original pixel art in a Minecraft style, not Mojang textures. Not an official Minecraft product.
