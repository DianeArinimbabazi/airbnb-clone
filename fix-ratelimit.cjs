const fs = require("fs");
const file = "C:/Users/HP/Desktop/airbnb-api/src/middlewares/rateLimiter.ts";
let c = fs.readFileSync(file, "utf8");
c = c.replace("max: 100,", "max: 2000,");
c = c.replace("max: 20,", "max: 500,");
fs.writeFileSync(file, c, "utf8");
console.log("Done!", c);
