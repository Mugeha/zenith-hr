import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [label, setLabel] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get("/documents/me").then(setDocuments);
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    const form = new FormData();
    form.set("label", label || file.name);
    form.set("file", file);
    try {
      await api.postForm("/documents", form);
      setLabel("");
      setFile(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <h1>Document Center</h1>
      <p style={{ color: "var(--zh-gray-600)" }}>Contracts, ID uploads, and other personal documents.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div className="zh-card">
          {documents.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>No documents uploaded yet.</p>}
          {documents.map((d) => (
            <div key={d.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
              <span>{d.label}</span>
              <a className="zh-pill zh-pill--ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }} href={`/api/documents/download?file=${encodeURIComponent(d.storagePath)}`} target="_blank" rel="noreferrer">
                View
              </a>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="zh-card">
          <h3 style={{ marginTop: 0 }}>Upload document</h3>
          <label style={{ display: "block", marginBottom: 10 }}>
            Label
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. National ID" style={inputStyle} />
          </label>
          <label style={{ display: "block", marginBottom: 14 }}>
            File
            <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: "block", marginTop: 4 }} />
          </label>
          <button type="submit" disabled={submitting} className="zh-pill zh-pill--red">
            {submitting ? "Uploading..." : "Upload"}
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
