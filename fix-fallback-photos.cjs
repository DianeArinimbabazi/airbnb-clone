const fs = require("fs");
const file = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  `  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos.map((p: { url: string }) => p.url)
    : [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800",
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
        "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800",
      ];`,
  `  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos.map((p: { url: string }) => p.url)
    : [];`
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed:", c.includes("const photos = listing.photos && listing.photos.length > 0"));
