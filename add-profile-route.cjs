const fs = require("fs");

// Add route to App.tsx
let app = fs.readFileSync("src/App.tsx", "utf8");
app = app.replace(
  `const ModerationQueue   = lazy(() => import("./features/admin/pages/ModerationQueue").then(m => ({ default: m.ModerationQueue ?? m.default })));`,
  `const ModerationQueue   = lazy(() => import("./features/admin/pages/ModerationQueue").then(m => ({ default: m.ModerationQueue ?? m.default })));
const ProfilePage       = lazy(() => import("./features/auth/pages/ProfilePage").then(m => ({ default: m.ProfilePage ?? m.default })));`
);
app = app.replace(
  `          <Route path="/dashboard"        element={<DashboardRedirect />} />`,
  `          <Route path="/profile"          element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/dashboard"        element={<DashboardRedirect />} />`
);
fs.writeFileSync("src/App.tsx", app, "utf8");
console.log("Route added!");

// Add Profile link to Navbar dropdown
let nav = fs.readFileSync("src/shared/components/Navbar.tsx", "utf8");
nav = nav.replace(
  `                  <button onClick={() => { logout(); setMenuOpen(false); navigate("/"); }} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit", borderRadius: "8px" }}>Sign out</button>`,
  `                  <button onClick={() => { setMenuOpen(false); navigate("/profile"); }} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit", borderRadius: "8px" }}>Profile</button>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate("/"); }} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit", borderRadius: "8px" }}>Sign out</button>`
);
fs.writeFileSync("src/shared/components/Navbar.tsx", nav, "utf8");
console.log("Navbar updated!");
