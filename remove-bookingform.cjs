const fs = require("fs");

// Delete the unused BookingForm component
fs.unlinkSync("src/features/bookings/components/BookingForm.tsx");
console.log("BookingForm.tsx deleted!");

// Make sure nothing imports it
const path = require("path");
function getAllTsx(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files = files.concat(getAllTsx(full));
    else if (f.endsWith(".tsx") || f.endsWith(".ts")) files.push(full);
  }
  return files;
}
let found = false;
for (const file of getAllTsx("src")) {
  const c = fs.readFileSync(file, "utf8");
  if (c.includes("BookingForm")) {
    console.log("Still imported in:", file);
    found = true;
  }
}
if (!found) console.log("No remaining imports. All clean!");
