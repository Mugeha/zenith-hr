import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="zh-container" style={{ maxWidth: 420, padding: "72px 24px" }}>
        <h1>Log in</h1>
        <form onSubmit={onSubmit} className="zh-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>
          {error && <p style={{ color: "var(--zh-red)", margin: 0 }}>{error}</p>}
          <button type="submit" disabled={submitting} className="zh-pill zh-pill--red" style={{ marginTop: 6 }}>
            {submitting ? "Logging in..." : "Log In"}
          </button>
          <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>
            Forgot your password?
          </Link>
        </form>
        <p style={{ marginTop: 20, fontSize: "0.9rem", color: "var(--zh-gray-600)" }}>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </Layout>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px 14px",
  marginTop: 6,
  borderRadius: 10,
  border: "1px solid var(--zh-gray-100)",
  fontSize: "1rem",
};
