"""Combine src/ into a single self-contained index.html."""
import pathlib

root = pathlib.Path(__file__).parent
read = lambda n: (root / "src" / n).read_text()

head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Anvil Order Planner</title>
<meta name="description" content="Find the cheapest Minecraft anvil order for your enchantments, Java and Bedrock.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Karla:wght@400;500;600;700;800&display=swap">
<style>
body { margin: 0; }
[hidden] { display: none !important; }
"""
out = (head + read("style.css") + "</style>\n</head>\n<body>\n" + read("body.html") +
       '\n<script id="solver">\n' + read("solver.js") + "</script>\n<script>\n" +
       read("icons.js") + "\n" + read("icons2.js") + "\n" + read("ui.js") + "</script>\n</body>\n</html>\n")
(root / "index.html").write_text(out)
print(f"index.html: {len(out)} bytes")
