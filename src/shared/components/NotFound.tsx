import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "100px 24px" }}>
      <p style={{ fontSize: "64px" }}>404</p>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#222", margin: "16px 0 8px" }}>Page not found</h1>
      <p style={{ color: "#717171", marginBottom: "32px" }}>The page you are looking for does not exist.</p>
      <Link to="/" style={{ background: "#FF385C", color: "#fff", padding: "14px 32px", borderRadius: "10px", fontWeight: 700, textDecoration: "none", fontSize: "15px" }}>
        Back to Home
      </Link>
    </div>
  );
}
export default NotFound;