// Writes src/table-book.js: what the enchanting table gives a book at each enchanting level, in each edition (TABLE_BOOK, read
// by tableResult in src/table-data.js). Walking a book's 36 candidates takes seconds, too long for the page.
// Run it again after changing TABLE_ENCH, TABLE_SETS or ENCH: node tools/table-book.js
const path = require("path"), fs = require("fs"), src = path.join(__dirname, "..", "src");
global.ENCH = require(path.join(src, "solver.js")).ENCH;
global.both = (java, bedrock) => ({ java, bedrock });
const T = require(path.join(src, "table-data.js"));
const num = x => +x.toPrecision(10);
const out = {};
let worst = 0;
for (const ed of ["java", "bedrock"]) {
  const keys = T.tableBookKeys(ed);
  out[ed] = {};
  // A book's enchanting level: a slot's 1 to 30, plus 1 (its enchantability is 1), times 0.85 to 1.15.
  for (let power = 1; power <= 36; power++) {
    const r = T.tableResult(keys, power, true);
    worst = Math.max(worst, r.lost);
    out[ed][power] = [keys.map(k => num(r.got[k] || 0)), keys.map(k => num(r.hint[k] || 0)),
      Object.fromEntries(Object.entries(r.count).map(([c, p]) => [c, num(p)])), num(r.lost)];
  }
}
fs.writeFileSync(path.join(src, "table-book.js"), `/* Written by tools/table-book.js: what the enchanting table gives a book (see tableResult in src/table-data.js). */\nconst TABLE_BOOK = ${JSON.stringify(out)};\n`);
console.log(`src/table-book.js written; the most left out at any level: ${worst.toExponential(2)}`);
