const fs = require("fs");
const file = "C:/Users/HP/Desktop/airbnb-api/src/controllers/bookings.controller.ts";
let c = fs.readFileSync(file, "utf8");
console.log("Before:", c.includes("photos"));
c = c.split("listing: { select: { title: true, location: true } }").join(
  "listing: { select: { title: true, location: true, pricePerNight: true, photos: true } }"
);
fs.writeFileSync(file, c, "utf8");
console.log("After:", c.includes("photos"));
