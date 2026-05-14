const fs = require("fs");
const file = "src/features/ai/AIRecommendations.tsx";
let c = fs.readFileSync(file, "utf8");
// Fix: use rec.id as the listing ID, not rec.listingId
c = c.replace(
  "const rawRecs: Rec[] = r?.data?.recommendations ?? r?.recommendations ?? [];",
  "const rawRecs: Rec[] = (r?.data?.recommendations ?? r?.recommendations ?? []).map((rec: any) => ({ ...rec, listingId: rec.listingId || rec.id }));"
);
fs.writeFileSync(file, c, "utf8");
console.log("Done!");
