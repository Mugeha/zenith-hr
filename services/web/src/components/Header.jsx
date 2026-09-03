import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const NAV_LINKS = [
  { to: "/#product", label: "Product" },
  { to: "/#modules", label: "Modules" },
  { to: "/rules-of-engagement", label: "Rules of Engagement" },
  { to: "/support", label: "Support" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{ borderBottom: "1px solid var(--zh-gray-100)" }}>
      <div
        className="zh-container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--zh-black)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--zh-red)",
              fontWeight: 800,
            }}
          >
            Z
          </span>
          <strong style={{ fontSize: "1.15rem", color: "var(--zh-black)" }}>Zenith HR</strong>
        </Link>

        <nav style={{ display: "flex", gap: 28 }}>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.to} style={{ textDecoration: "none", color: "var(--zh-black)", fontSize: "0.95rem" }}>
              {link.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <>
              <Link to="/dashboard" className="zh-pill zh-pill--ghost">
                Dashboard
              </Link>
              <button
                className="zh-pill zh-pill--dark"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="zh-pill zh-pill--ghost">
                Log In
              </Link>
              <Link to="/signup" className="zh-pill zh-pill--dark">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
