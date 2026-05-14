const fs = require("fs");
const file = "src/features/listings/pages/ListingsPage.tsx";
let c = fs.readFileSync(file, "utf8");

// Filter to only show listings with photos
c = c.replace(
  "    if (savedOnly) result = result.filter(l => isSaved(l.id));",
  `    if (savedOnly) result = result.filter(l => isSaved(l.id));
    result = result.filter(l => l.photos && l.photos.length > 0);`
);

// Fix broken emojis in empty state
c = c.replace(
  '<p style={{ fontSize:"48px", marginBottom:"16px" }}>ðŸ"</p>',
  '<p style={{ fontSize:"48px", marginBottom:"16px" }}>&#128269;</p>'
);

// Fix category emojis
c = c.replace(
  `const CATEGORIES = [
  { value: "All",       label: "All",       icon: "🏠" },
  { value: "HOUSE",     label: "House",     icon: "🏠 " },
  { value: "VILLA",     label: "Villa",     icon: "🏖️" },
  { value: "CABIN",     label: "Cabin",     icon: "🏕️" },
  { value: "APARTMENT", label: "Apartment", icon: "🏠" },
];`,
  `const CATEGORIES = [
  { value: "All",       label: "All" },
  { value: "HOUSE",     label: "House" },
  { value: "VILLA",     label: "Villa" },
  { value: "CABIN",     label: "Cabin" },
  { value: "APARTMENT", label: "Apartment" },
];`
);

// Remove icon from category button render
c = c.replace(
  `            <span>{cat.icon}</span> {cat.label}`,
  `            {cat.label}`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done!");
