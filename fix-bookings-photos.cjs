const fs = require("fs");
const file = "C:/Users/HP/Desktop/airbnb-api/src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");
c = c.replace(
  "include: { listing: { select: { title: true, location: true } } },",
  "include: { listing: { select: { title: true, location: true, pricePerNight: true, photos: true } } },"
);
fs.writeFileSync(file, c, "utf8");
console.log("Done!");
