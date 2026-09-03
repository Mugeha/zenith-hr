import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

const STATUS_COLOR = { PENDING: "var(--zh-gray-600)", APPROVED: "#1a8a4a", REJECTED: "var(--zh-red)", REIMBURSED: "#1a8a4a" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get("/expenses/me").then(setExpenses);
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData();
    form.set("amount", amount);
    form.set("description", description);
    if (receipt) form.set("receipt", receipt);
    try {
      await api.postForm("/expenses", form);
      setAmount("");
      setDescription("");
      setReceipt(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <h1>Expenses</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div className="zh-card">
          {expenses.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>No expenses submitted yet.</p>}
          {expenses.map((ex) => (
            <div key={ex.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{ex.description}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>
                  {ex.currency} {ex.amount.toLocaleString()}
                </p>
              </div>
              <span style={{ color: STATUS_COLOR[ex.status], fontWeight: 700, fontSize: "0.85rem" }}>{ex.status}</span>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="zh-card">
          <h3 style={{ marginTop: 0 }}>Submit expense</h3>
          <label style={{ display: "block", marginBottom: 10 }}>
            Amount (KES)
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "block", marginBottom: 10 }}>
            Description
            <input required value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "block", marginBottom: 14 }}>
            Receipt (PDF/JPG/PNG)
            <input type="file" onChange={(e) => setReceipt(e.target.files[0])} style={{ display: "block", marginTop: 4 }} />
          </label>
          <button type="submit" disabled={submitting} className="zh-pill zh-pill--red">
            {submitting ? "Submitting..." : "Submit"}
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
