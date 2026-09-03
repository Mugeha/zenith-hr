import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function AdminReports() {
  const [filters, setFilters] = useState({ q: "", department: "", minSalary: "", maxSalary: "" });
  const [employees, setEmployees] = useState([]);
  const [reportTitle, setReportTitle] = useState("Zenith HR Employee Report");
  const [savedLabel, setSavedLabel] = useState("");
  const [saved, setSaved] = useState([]);

  const queryString = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    return params.toString();
  };

  const search = () => api.get(`/admin/reports/employees/search?${queryString()}`).then(setEmployees);
  const loadSaved = () => api.get("/admin/reports/saved").then(setSaved);

  useEffect(() => {
    search();
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = async () => {
    if (!savedLabel) return;
    await api.post("/admin/reports/saved", { label: savedLabel, filters });
    setSavedLabel("");
    loadSaved();
  };

  const loadConfig = async (id) => {
    const cfg = await api.get(`/admin/reports/saved/${id}`);
    setFilters({ q: "", department: "", minSalary: "", maxSalary: "", ...cfg.filters });
  };

  const exportPdf = async () => {
    const res = await fetch(`/api/admin/reports/employees/pdf?${queryString()}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: reportTitle }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <AppShell>
      <h1>Reports &amp; Search</h1>
      <div className="zh-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <input placeholder="Search name/email" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} style={inputStyle} />
          <input placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} style={inputStyle} />
          <input placeholder="Min salary" value={filters.minSalary} onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })} style={inputStyle} />
          <input placeholder="Max salary" value={filters.maxSalary} onChange={(e) => setFilters({ ...filters, maxSalary: e.target.value })} style={inputStyle} />
          <button className="zh-pill zh-pill--dark" onClick={search}>
            Search
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <a className="zh-pill zh-pill--ghost" href={`/api/admin/reports/employees/csv?${queryString()}`}>
            Export CSV
          </a>
          <input placeholder="Report title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} style={{ ...inputStyle, width: 220 }} />
          <button className="zh-pill zh-pill--ghost" onClick={exportPdf}>
            Export PDF
          </button>
          <input placeholder="Save filters as..." value={savedLabel} onChange={(e) => setSavedLabel(e.target.value)} style={{ ...inputStyle, width: 180 }} />
          <button className="zh-pill zh-pill--ghost" onClick={saveConfig}>
            Save filters
          </button>
        </div>

        {saved.length > 0 && (
          <div style={{ marginTop: 12, fontSize: "0.85rem" }}>
            Saved:{" "}
            {saved.map((s) => (
              <button key={s.id} onClick={() => loadConfig(s.id)} style={{ marginRight: 8, background: "none", border: "none", color: "var(--zh-red)", cursor: "pointer" }}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="zh-card">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--zh-gray-600)" }}>
              <th style={{ padding: "6px 0" }}>Name</th>
              <th>Department</th>
              <th>Title</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} style={{ borderTop: "1px solid var(--zh-gray-100)" }}>
                <td style={{ padding: "8px 0" }}>
                  {e.firstName} {e.lastName}
                </td>
                <td>{e.department}</td>
                <td>{e.jobTitle}</td>
                <td>KES {e.salaryMonthly.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

const inputStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--zh-gray-100)",
};
