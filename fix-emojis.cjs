const fs = require("fs");
const file = "src/features/auth/pages/GuestDashboard.tsx";
let c = fs.readFileSync(file, "utf8");

const fixes = [
  ["\u00f0\u009f\u0091\u008b", "\u{1F44B}"],
  ["\u00f0\u009f\u009a\u00aa", "\u{1F6AA}"],
  ["\u00f0\u009f\u0093\u008b", "\u{1F4CB}"],
  ["\u00f0\u009f\u0093\u0085", "\u{1F4C5}"],
  ["\u00e2\u009c\u0085", "\u2705"],
  ["\u00e2\u008c\u009b", "\u231B"],
  ["\u00f0\u009f\u0096\u008f\u00ef\u00b8\u008f", "\u{1F3D6}\uFE0F"],
  ["\u00f0\u009f\u0093\u008d", "\u{1F4CD}"],
  ["\u00e2\u0086\u0092", "\u2192"],
  ["\u00c2\u00b7", "\u00B7"],
  ["\u00f0\u009f\u00a0", "\u{1F3E0}"],
  ["\u00c2\u00a9", "\u00A9"],
  ["\u00e2\u008c\u008c", "\u274C"],
  ["\u00ef\u00bb\u00bf", ""],
];

for (const [bad, good] of fixes) c = c.split(bad).join(good);
fs.writeFileSync(file, c, "utf8");
console.log("Done!");
