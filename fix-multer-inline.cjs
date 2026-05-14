const fs = require("fs");
const file = "src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");

// Replace upload.single with multer({ storage: multer.memoryStorage() }).single inline
c = c.replace(
  `router.post("/:id/avatar", authenticate, upload.single("avatar"), uploadAvatar);`,
  `router.post("/:id/avatar", authenticate, multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).single("avatar"), uploadAvatar);`
);

// Remove the separate const upload = line if it exists
c = c.replace(
  `const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });\n\n`,
  ""
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed!");
