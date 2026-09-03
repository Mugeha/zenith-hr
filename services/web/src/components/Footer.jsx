export default function Footer() {
  return (
    <footer style={{ background: "var(--zh-black)", color: "var(--zh-white)", marginTop: 80 }}>
      <div className="zh-container" style={{ padding: "48px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div style={{ maxWidth: 420 }}>
          <strong style={{ fontSize: "1.1rem" }}>Zenith HR</strong>
          <p style={{ color: "var(--zh-gray-300)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Zenith HR is a wholly fictional product built as an official Africahackon practice
            platform. It is not a real HR/payroll vendor and contains only synthetic,
            faker-generated demo data.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <img src="/africahackon-logo.png" alt="Africahackon" style={{ height: 48 }} />
        </div>
      </div>
      <div style={{ borderTop: "1px solid #1a201f", padding: "16px 24px", textAlign: "center", fontSize: "0.8rem", color: "var(--zh-gray-300)" }}>
        <a href="/rules-of-engagement" style={{ color: "var(--zh-red)" }}>
          Rules of Engagement
        </a>{" "}
        · Program contact: security@africahackon.example
      </div>
    </footer>
  );
}
