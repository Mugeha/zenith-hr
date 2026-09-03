import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

const STATUS_COLOR = { PENDING: "var(--zh-gray-600)", APPROVED: "#1a8a4a", REJECTED: "var(--zh-red)" };

export default function Leave() {
  const [data, setData] = useState({ requests: [], balance: null });
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });

  const load = () => api.get("/leave/me").then(setData);
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/leave", form);
    setForm({ startDate: "", endDate: "", reason: "" });
    load();
  };

  return (
    <AppShell>
      <h1>Leave</h1>
      {data.balance && (
        <p style={{ color: "var(--zh-gray-600)" }}>
          {data.balance.annualDays - data.balance.usedDays} of {data.balance.annualDays} days remaining this year
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div className="zh-card">
          {data.requests.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>No leave requests yet.</p>}
          {data.requests.map((r) => (
            <div key={r.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>
                  {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "var(--zh-gray-600)" }}>{r.reason}</p>
              </div>
              <span style={{ color: STATUS_COLOR[r.status], fontWeight: 700, fontSize: "0.85rem" }}>{r.status}</span>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="zh-card">
          <h3 style={{ marginTop: 0 }}>Request leave</h3>
          <label style={{ display: "block", marginBottom: 10 }}>
            Start date
            <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
          </label>
          <label style={{ display: "block", marginBottom: 10 }}>
            End date
            <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={inputStyle} />
          </label>
          <label style={{ display: "block", marginBottom: 10 }}>
            Reason
            <textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ ...inputStyle, minHeight: 70 }} />
          </label>
          <button type="submit" className="zh-pill zh-pill--red">
            Submit request
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
