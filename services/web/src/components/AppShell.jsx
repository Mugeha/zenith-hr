import { NavLink } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "../lib/AuthContext";

const BASE_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/directory", label: "Directory" },
  { to: "/documents", label: "Documents" },
  { to: "/payslips", label: "Payslips" },
  { to: "/leave", label: "Leave" },
  { to: "/expenses", label: "Expenses" },
  { to: "/reviews", label: "Reviews" },
  { to: "/support", label: "Support" },
];

const MANAGER_LINKS = [{ to: "/leave/team", label: "Team Leave" }, { to: "/expenses/approvals", label: "Expense Approvals" }];

const HR_LINKS = [
  { to: "/admin", label: "Admin Console" },
  { to: "/admin/reports", label: "Reports & Search" },
  { to: "/support/queue", label: "Support Queue" },
];

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 16px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "var(--zh-white)" : "var(--zh-black)",
  background: isActive ? "var(--zh-black)" : "transparent",
  fontWeight: 600,
  fontSize: "0.95rem",
  marginBottom: 4,
});

export default function AppShell({ children }) {
  const { user } = useAuth();
  const isHrStaff = user && (user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN");
  const links = [
    ...BASE_LINKS,
    ...(user && user.role !== "EMPLOYEE" ? MANAGER_LINKS : []),
    ...(isHrStaff ? HR_LINKS : []),
  ];

  return (
    <Layout>
      <div className="zh-container" style={{ display: "flex", gap: 32, padding: "40px 24px", alignItems: "flex-start" }}>
        <nav style={{ width: 220, flexShrink: 0 }}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} style={linkStyle}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </Layout>
  );
}
