import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../lib/AuthContext";

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px 14px",
  marginTop: 6,
  borderRadius: 10,
  border: "1px solid var(--zh-gray-100)",
  fontSize: "1rem",
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", department: "", jobTitle: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="zh-container" style={{ maxWidth: 480, padding: "72px 24px" }}>
        <h1>Create your account</h1>
        <p style={{ color: "var(--zh-gray-600)" }}>
          Every account created here is a synthetic demo identity inside the Zenith HR training
          environment. Do not use real personal details.
        </p>
        <form onSubmit={onSubmit} className="zh-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ flex: 1 }}>
              First name
              <input required value={form.firstName} onChange={update("firstName")} style={inputStyle} />
            </label>
            <label style={{ flex: 1 }}>
              Last name
              <input required value={form.lastName} onChange={update("lastName")} style={inputStyle} />
            </label>
          </div>
          <label>
            Work email
            <input type="email" required value={form.email} onChange={update("email")} style={inputStyle} />
          </label>
          <label>
            Password
            <input type="password" required minLength={8} value={form.password} onChange={update("password")} style={inputStyle} />
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ flex: 1 }}>
              Department
              <input value={form.department} onChange={update("department")} style={inputStyle} />
            </label>
            <label style={{ flex: 1 }}>
              Job title
              <input value={form.jobTitle} onChange={update("jobTitle")} style={inputStyle} />
            </label>
          </div>
          {error && <p style={{ color: "var(--zh-red)", margin: 0 }}>{error}</p>}
          <button type="submit" disabled={submitting} className="zh-pill zh-pill--red" style={{ marginTop: 6 }}>
            {submitting ? "Creating account..." : "Get Started"}
          </button>
        </form>
        <p style={{ marginTop: 20, fontSize: "0.9rem", color: "var(--zh-gray-600)" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </Layout>
  );
}
