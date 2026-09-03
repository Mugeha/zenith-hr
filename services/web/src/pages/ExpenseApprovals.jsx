import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function ExpenseApprovals() {
  const [expenses, setExpenses] = useState([]);

  const load = () => api.get("/expenses/approvals").then(setExpenses);
  useEffect(() => {
    load();
  }, []);

  const decide = async (id, decision) => {
    await api.patch(`/expenses/${id}/decision`, { decision });
    load();
  };

  return (
    <AppShell>
      <h1>Expense Approvals</h1>
      <div className="zh-card">
        {expenses.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>Nothing pending.</p>}
        {expenses.map((ex) => (
          <div key={ex.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>
                {ex.user.firstName} {ex.user.lastName}
              </strong>{" "}
              <span style={{ color: "var(--zh-gray-600)", fontSize: "0.85rem" }}>({ex.user.department})</span>
              <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
                {ex.description} ({ex.currency} {ex.amount.toLocaleString()})
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="zh-pill zh-pill--red" onClick={() => decide(ex.id, "APPROVED")}>
                Approve
              </button>
              <button className="zh-pill zh-pill--ghost" onClick={() => decide(ex.id, "REJECTED")}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
