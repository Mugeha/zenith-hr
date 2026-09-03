import { useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/password-reset/request", { email });
      setResult(res);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <section className="zh-container" style={{ maxWidth: 420, padding: "72px 24px" }}>
        <h1>Reset password</h1>
        <form onSubmit={onSubmit} className="zh-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ display: "block", width: "100%", padding: "10px 14px", marginTop: 6, borderRadius: 10, border: "1px solid var(--zh-gray-100)" }}
            />
          </label>
          {error && <p style={{ color: "var(--zh-red)", margin: 0 }}>{error}</p>}
          <button type="submit" className="zh-pill zh-pill--red">
            Send reset link
          </button>
        </form>
        {result && (
          <p style={{ marginTop: 16, fontSize: "0.9rem", color: "var(--zh-gray-600)" }}>
            {result.resetToken ? `Demo reset token: ${result.resetToken}` : result.message}
          </p>
        )}
      </section>
    </Layout>
  );
}
