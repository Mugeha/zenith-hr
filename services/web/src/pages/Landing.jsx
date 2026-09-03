import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const FEATURES = [
  { title: "Payroll & Payslips", desc: "Automated monthly runs, downloadable payslips, full history.", dark: true },
  { title: "Leave Management", desc: "Request, approve, and track balances in one place." },
  { title: "Expense Reimbursement", desc: "Submit receipts and follow approvals end to end." },
  { title: "Performance Reviews", desc: "Structured review cycles managers and employees both see.", dark: true },
  { title: "Org Directory", desc: "A living directory across every department." },
  { title: "Admin Console", desc: "Roles, integrations, imports, and an audit trail." },
];

export default function Landing() {
  return (
    <Layout>
      <section className="zh-container" style={{ paddingTop: 72, paddingBottom: 40, display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 480px" }}>
          <h1 style={{ fontSize: "3.2rem", lineHeight: 1.08, margin: 0 }}>
            HR &amp; payroll that feels <span className="zh-highlight">effortless</span>.
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--zh-gray-600)", maxWidth: 480, marginTop: 20 }}>
            Zenith HR brings payroll, leave, expenses, and performance into a single, modern
            workspace for growing teams.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
            <Link to="/signup" className="zh-pill zh-pill--red" style={{ padding: "14px 28px" }}>
              Request Demo
            </Link>
            <Link to="/login" className="zh-pill zh-pill--ghost" style={{ padding: "14px 28px" }}>
              Log In
            </Link>
          </div>
        </div>
        <div style={{ flex: "1 1 420px" }}>
          <div
            style={{
              transform: "rotate(-4deg)",
              borderRadius: "var(--zh-radius-lg)",
              boxShadow: "var(--zh-shadow)",
              background: "var(--zh-black)",
              padding: 18,
            }}
          >
            <div style={{ background: "var(--zh-white)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <strong>Payroll run: Sep 2026</strong>
                <span style={{ color: "var(--zh-red)", fontWeight: 700 }}>Completed</span>
              </div>
              {["Amina Okoro", "David Mwangi", "Grace Wanjiru"].map((name) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--zh-gray-100)" }}>
                  <span>{name}</span>
                  <span style={{ color: "var(--zh-gray-600)" }}>KES •••,•••</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="zh-container" style={{ padding: "60px 24px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: 32 }}>Everything HR needs, in one place</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className={`zh-card${f.dark ? " zh-card--dark" : ""}`}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: f.dark ? "rgba(249,57,67,0.2)" : "var(--zh-gray-50)",
                  color: "var(--zh-red)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                ●
              </div>
              <h3 style={{ margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ margin: 0, color: f.dark ? "var(--zh-gray-300)" : "var(--zh-gray-600)", fontSize: "0.95rem" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="zh-container" style={{ padding: "20px 24px 80px" }}>
        <div className="zh-card" style={{ background: "var(--zh-gray-50)", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px" }}>An Africahackon practice environment</h2>
          <p style={{ maxWidth: 620, margin: "0 auto 20px", color: "var(--zh-gray-600)" }}>
            Zenith HR is a fictional product built specifically for authorized security testing
            practice. See the full rules of engagement before you begin.
          </p>
          <Link to="/rules-of-engagement" className="zh-pill zh-pill--dark">
            Read the Rules of Engagement
          </Link>
        </div>
      </section>
    </Layout>
  );
}
