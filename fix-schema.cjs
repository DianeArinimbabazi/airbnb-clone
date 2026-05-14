const fs = require("fs");
const file = "C:/Users/HP/Desktop/airbnb-api/prisma/schema.prisma";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  "  amenities     String",
  "  amenities     String\n  bedrooms      Int     @default(1)\n  bathrooms     Int     @default(1)"
);

fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("bedrooms"));
