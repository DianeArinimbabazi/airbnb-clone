const fs = require("fs");
const file = "src/features/auth/pages/ProfilePage.tsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace(
  'mutationFn: () => api.put("/auth/change-password", { currentPassword, newPassword }),',
  'mutationFn: () => api.post("/auth/change-password", { currentPassword, newPassword }),'
);
fs.writeFileSync(file, c, "utf8");
console.log("Fixed:", c.includes('api.post("/auth/change-password"'));
