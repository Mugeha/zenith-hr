import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const TABS = ["Users", "Company", "Payroll", "Integrations", "Import", "Offer Letters", "Audit Log"];
const ROLES = ["EMPLOYEE", "MANAGER", "HR_ADMIN", "SUPER_ADMIN"];

export default function AdminConsole() {
  const [tab, setTab] = useState("Users");

  return (
    <AppShell>
      <h1>Admin Console</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`zh-pill ${tab === t ? "zh-pill--dark" : "zh-pill--ghost"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Users" && <UsersTab />}
      {tab === "Company" && <CompanyTab />}
      {tab === "Payroll" && <PayrollTab />}
      {tab === "Integrations" && <IntegrationsTab />}
      {tab === "Import" && <ImportTab />}
      {tab === "Offer Letters" && <OfferLettersTab />}
      {tab === "Audit Log" && <AuditLogTab />}
    </AppShell>
  );
}

function UsersTab() {
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const isSuperAdmin = me && me.role === "SUPER_ADMIN";

  const load = () => api.get(`/admin/users?q=${encodeURIComponent(q)}&pageSize=50`).then((r) => setUsers(r.users));
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const changeRole = async (id, role) => {
    await api.patch(`/admin/users/${id}/role`, { role });
    load();
  };

  return (
    <div className="zh-card">
      <input
        placeholder="Search users..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%", maxWidth: 320, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--zh-gray-100)", marginBottom: 16 }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--zh-gray-600)" }}>
            <th style={{ padding: "6px 0" }}>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderTop: "1px solid var(--zh-gray-100)" }}>
              <td style={{ padding: "8px 0" }}>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>{u.department}</td>
              <td>KES {u.salaryMonthly.toLocaleString()}</td>
              <td>
                {isSuperAdmin ? (
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 6 }}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  u.role
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompanyTab() {
  const [company, setCompany] = useState(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [message, setMessage] = useState("");

  const load = () => api.get("/admin/company").then((c) => {
    setCompany(c);
    setName(c.name);
  });
  useEffect(() => {
    load();
  }, []);

  const saveName = async (e) => {
    e.preventDefault();
    await api.patch("/admin/company", { name });
    load();
  };

  const saveLogo = async (e) => {
    e.preventDefault();
    setMessage("Fetching...");
    try {
      const res = await api.post("/admin/company/logo-from-url", { url: logoUrl });
      setMessage(`status=${res.status} content-type=${res.contentType || "(none)"}\n\n${res.preview}`);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!company) return null;

  return (
    <div className="zh-card" style={{ maxWidth: 480 }}>
      <form onSubmit={saveName} style={{ marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 10 }}>
          Company name
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </label>
        <button type="submit" className="zh-pill zh-pill--red">
          Save name
        </button>
      </form>

      <form onSubmit={saveLogo}>
        <label style={{ display: "block", marginBottom: 10 }}>
          Set logo from URL
          <input placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={inputStyle} />
        </label>
        <button type="submit" className="zh-pill zh-pill--dark">
          Fetch &amp; set logo
        </button>
        {message && (
          <pre style={{ marginTop: 10, fontSize: "0.8rem", color: "var(--zh-gray-600)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {message}
          </pre>
        )}
        {company.logoUrl && <img src={company.logoUrl} alt="Company logo" style={{ marginTop: 14, height: 60 }} />}
      </form>
    </div>
  );
}

function PayrollTab() {
  const [runs, setRuns] = useState([]);
  const [message, setMessage] = useState("");

  const load = () => api.get("/payroll/runs").then(setRuns);
  useEffect(() => {
    load();
  }, []);

  const trigger = async () => {
    setMessage("Running payroll...");
    try {
      const run = await api.post("/payroll/runs", {});
      setMessage(`Generated ${run.payslipCount} payslips for ${run.periodMonth}/${run.periodYear}.`);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="zh-card">
      <button className="zh-pill zh-pill--red" onClick={trigger}>
        Run payroll for current period
      </button>
      {message && <p style={{ marginTop: 10, fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>{message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginTop: 20 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--zh-gray-600)" }}>
            <th style={{ padding: "6px 0" }}>Period</th>
            <th>Payslips</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--zh-gray-100)" }}>
              <td style={{ padding: "8px 0" }}>
                {r.periodMonth}/{r.periodYear}
              </td>
              <td>{r._count.payslips}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IntegrationsTab() {
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [keyLabel, setKeyLabel] = useState("");
  const [webhookLabel, setWebhookLabel] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const load = () => {
    api.get("/admin/api-keys").then(setApiKeys);
    api.get("/admin/webhooks").then(setWebhooks);
  };
  useEffect(() => {
    load();
  }, []);

  const createKey = async (e) => {
    e.preventDefault();
    await api.post("/admin/api-keys", { label: keyLabel });
    setKeyLabel("");
    load();
  };

  const createWebhook = async (e) => {
    e.preventDefault();
    await api.post("/admin/webhooks", { label: webhookLabel, targetUrl: webhookUrl });
    setWebhookLabel("");
    setWebhookUrl("");
    load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="zh-card">
        <h3 style={{ marginTop: 0 }}>API Keys</h3>
        {apiKeys.map((k) => (
          <div key={k.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "8px 0", fontSize: "0.85rem" }}>
            <strong>{k.label}</strong>
            <p style={{ margin: "2px 0 0", fontFamily: "monospace", color: "var(--zh-gray-600)" }}>{k.keyValue}</p>
          </div>
        ))}
        <form onSubmit={createKey} style={{ marginTop: 12 }}>
          <input placeholder="Key label" value={keyLabel} onChange={(e) => setKeyLabel(e.target.value)} style={inputStyle} />
          <button type="submit" className="zh-pill zh-pill--ghost" style={{ marginTop: 8 }}>
            Generate key
          </button>
        </form>
      </div>

      <div className="zh-card">
        <h3 style={{ marginTop: 0 }}>Webhooks</h3>
        {webhooks.map((w) => (
          <div key={w.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "8px 0", fontSize: "0.85rem" }}>
            <strong>{w.label}</strong>
            <p style={{ margin: "2px 0 0", color: "var(--zh-gray-600)" }}>{w.targetUrl}</p>
          </div>
        ))}
        <form onSubmit={createWebhook} style={{ marginTop: 12 }}>
          <input placeholder="Webhook label" value={webhookLabel} onChange={(e) => setWebhookLabel(e.target.value)} style={inputStyle} />
          <input placeholder="https://..." value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} />
          <button type="submit" className="zh-pill zh-pill--ghost" style={{ marginTop: 8 }}>
            Add webhook
          </button>
        </form>
      </div>
    </div>
  );
}

function ImportTab() {
  const [csvFile, setCsvFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [result, setResult] = useState(null);

  const upload = async (kind, file) => {
    const form = new FormData();
    form.set("file", file);
    const res = await api.postForm(`/admin/import/${kind}`, form);
    setResult(res);
  };

  return (
    <div className="zh-card" style={{ maxWidth: 480 }}>
      <h3 style={{ marginTop: 0 }}>Bulk employee import</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>
        CSV columns: firstName, lastName, email, department, jobTitle, salaryMonthly. XML: repeated
        &lt;employee&gt; elements with the same fields.
      </p>
      <div style={{ marginBottom: 16 }}>
        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
        <button className="zh-pill zh-pill--ghost" style={{ marginLeft: 8 }} disabled={!csvFile} onClick={() => upload("csv", csvFile)}>
          Import CSV
        </button>
      </div>
      <div>
        <input type="file" accept=".xml" onChange={(e) => setXmlFile(e.target.files[0])} />
        <button className="zh-pill zh-pill--ghost" style={{ marginLeft: 8 }} disabled={!xmlFile} onClick={() => upload("xml", xmlFile)}>
          Import XML
        </button>
      </div>
      {result && (
        <p style={{ marginTop: 16, fontSize: "0.85rem" }}>
          Created {result.created} employees. {result.errors.length} errors.
        </p>
      )}
    </div>
  );
}

function OfferLettersTab() {
  const [template, setTemplate] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/offer-letters/default-template").then((r) => setTemplate(r.template));
  }, []);

  const preview = async () => {
    setError("");
    try {
      const res = await api.post("/admin/offer-letters/preview", { template, candidateName, roleTitle, startDate });
      setHtml(res.html);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="zh-card">
        <h3 style={{ marginTop: 0 }}>Offer letter template (EJS)</h3>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          style={{ width: "100%", minHeight: 220, fontFamily: "monospace", fontSize: "0.85rem", padding: 10, borderRadius: 8, border: "1px solid var(--zh-gray-100)" }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input placeholder="Candidate name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} style={inputStyle} />
          <input placeholder="Role title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} style={inputStyle} />
          <input placeholder="Start date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
        </div>
        <button className="zh-pill zh-pill--red" style={{ marginTop: 10 }} onClick={preview}>
          Render preview
        </button>
        {error && <p style={{ color: "var(--zh-red)", fontSize: "0.85rem" }}>{error}</p>}
      </div>
      <div className="zh-card">
        <h3 style={{ marginTop: 0 }}>Preview</h3>
        <div style={{ border: "1px solid var(--zh-gray-100)", borderRadius: 8, padding: 12 }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

function AuditLogTab() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get("/admin/audit-log?pageSize=50").then((r) => setEntries(r.entries));
  }, []);

  return (
    <div className="zh-card">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--zh-gray-600)" }}>
            <th style={{ padding: "6px 0" }}>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} style={{ borderTop: "1px solid var(--zh-gray-100)" }}>
              <td style={{ padding: "6px 0" }}>{new Date(e.createdAt).toLocaleString()}</td>
              <td>{e.user ? `${e.user.firstName} ${e.user.lastName}` : "—"}</td>
              <td>{e.action}</td>
              <td>{e.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
