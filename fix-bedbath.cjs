const fs = require("fs");
const file = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  `  const extra = listing as unknown as Record<string, unknown>;
  const bedrooms  = String(extra.bedrooms  ?? "-");
  const bathrooms = String(extra.bathrooms ?? "-");`,
  `  const bedrooms  = String((listing as any).bedrooms  ?? "-");
  const bathrooms = String((listing as any).bathrooms ?? "-");`
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed:", c.includes('(listing as any).bedrooms'));
