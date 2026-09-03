import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function Payslips() {
  const [payslips, setPayslips] = useState([]);
  const [bank, setBank] = useState({ bankName: "", bankAccountNo: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/payroll/payslips").then(setPayslips);
    api.get("/payroll/bank-details").then(setBank);
  }, []);

  const saveBank = async (e) => {
    e.preventDefault();
    await api.patch("/payroll/bank-details", bank);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <h1>Payslips</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div className="zh-card">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>
                <th style={{ padding: "6px 0" }}>Period</th>
                <th>Gross</th>
                <th>Net</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--zh-gray-100)" }}>
                  <td style={{ padding: "10px 0" }}>
                    {p.periodMonth}/{p.periodYear}
                  </td>
                  <td>KES {p.grossPay.toLocaleString()}</td>
                  <td>
                    <strong>KES {p.netPay.toLocaleString()}</strong>
                  </td>
                  <td>
                    <a href={`/api/payroll/payslips/${p.id}/pdf`} target="_blank" rel="noreferrer" className="zh-pill zh-pill--ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
                      View PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={saveBank} className="zh-card">
          <h3 style={{ marginTop: 0 }}>Bank details</h3>
          <label style={{ display: "block", marginBottom: 10 }}>
            Bank name
            <input
              value={bank.bankName}
              onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "block", marginBottom: 10 }}>
            Account number
            <input
              value={bank.bankAccountNo}
              onChange={(e) => setBank({ ...bank, bankAccountNo: e.target.value })}
              style={inputStyle}
            />
          </label>
          <button type="submit" className="zh-pill zh-pill--red">
            Save
          </button>
          {saved && <span style={{ marginLeft: 10, color: "var(--zh-gray-600)", fontSize: "0.85rem" }}>Saved</span>}
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
