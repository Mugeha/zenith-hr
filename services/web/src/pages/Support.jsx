import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

const CATEGORIES = ["IT", "HR", "Payroll"];

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("IT");

  const load = () => api.get("/tickets/me").then(setTickets);
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/tickets", { subject, category });
    setSubject("");
    load();
  };

  return (
    <AppShell>
      <h1>Help &amp; Support</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div className="zh-card">
          {tickets.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>No tickets yet.</p>}
          {tickets.map((t) => (
            <Link key={t.id} to={`/support/${t.id}`} style={{ display: "block", textDecoration: "none", color: "inherit", borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0" }}>
              <strong>{t.subject}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>
                {t.category} · {t.status}
              </p>
            </Link>
          ))}
        </div>

        <form onSubmit={submit} className="zh-card">
          <h3 style={{ marginTop: 0 }}>New ticket</h3>
          <label style={{ display: "block", marginBottom: 10 }}>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block", marginBottom: 14 }}>
            Subject
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} />
          </label>
          <button type="submit" className="zh-pill zh-pill--red">
            Open ticket
          </button>
        </form>
      </div>
    </AppShell>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "8px 12px",
  marginTop: 4,
  borderRadius: 8,
  border: "1px solid var(--zh-gray-100)",
};
