const fs = require("fs");
const path = require("path");

function getAllTsxFiles(dir) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files.push(...getAllTsxFiles(full));
    else if (f.endsWith(".tsx") || f.endsWith(".ts")) files.push(full);
  }
  return files;
}

const files = getAllTsxFiles("src");
let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // Remove all emoji unicode ranges from string literals
  content = content.replace(/("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)/gs, (match) => {
    // Remove emoji characters
    return match
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "") // surrogate pairs (emojis)
      .replace(/[\u2600-\u27BF]/g, "")                 // misc symbols
      .replace(/[\u2B00-\u2BFF]/g, "")                 // misc symbols
      .replace(/[\uFE00-\uFE0F]/g, "")                 // variation selectors
      .replace(/\uFEFF/g, "");                          // BOM
  });

  // Fix broken UTF-8 sequences (garbled emojis)
  const replacements = [
    ["\u00c2\u00b7", "\u00B7"],   // Â· -> ·
    ["\u00c2\u00a9", "\u00A9"],   // Â© -> ©
    ["\u00e2\u0086\u0092", "->"], // â†' -> ->
    ["\u00ef\u00bb\u00bf", ""],   // BOM
  ];
  for (const [bad, good] of replacements) {
    content = content.split(bad).join(good);
  }

  // Remove any remaining garbled sequences like ðŸ... Ã°...
  content = content.replace(/[\u00c3-\u00c4][\u00b0-\u00bf][\u00c2-\u00bf]{2}/g, "");
  content = content.replace(/\u00c3\u00a2[\u0080-\u00bf]{2}/g, "");

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    totalFixed++;
    console.log("Fixed:", file);
  }
}

console.log("Done! Fixed " + totalFixed + " files.");
