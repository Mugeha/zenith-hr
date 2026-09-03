import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      setSearchParams(q ? { q } : {}, { replace: true });
      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.users);
      setTotal(res.total);
      setLoading(false);
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <AppShell>
      <h1>Directory</h1>
      <input
        placeholder="Search by name or title..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%", maxWidth: 360, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--zh-gray-100)", marginBottom: 20 }}
      />
      <p style={{ color: "var(--zh-gray-600)", fontSize: "0.9rem" }}>{loading ? "Searching..." : `${total} people`}</p>
      {!loading && total === 0 && q && (
        <p
          style={{ color: "var(--zh-gray-600)" }}
          dangerouslySetInnerHTML={{ __html: `No results for "${q}". Try a different name, title, or department.` }}
        />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {users.map((u) => (
          <Link key={u.id} to={`/directory/${u.id}`} className="zh-card" style={{ textDecoration: "none", color: "inherit" }}>
            <strong>
              {u.firstName} {u.lastName}
            </strong>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>{u.jobTitle}</p>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--zh-red)" }}>{u.department}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
