import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function SupportQueue() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get("/tickets/all").then(setTickets);
  }, []);

  return (
    <AppShell>
      <h1>Support Queue</h1>
      <div className="zh-card">
        {tickets.map((t) => (
          <Link key={t.id} to={`/support/${t.id}`} style={{ display: "flex", justifyContent: "space-between", textDecoration: "none", color: "inherit", borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0" }}>
            <div>
              <strong>{t.subject}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>
                {t.user.firstName} {t.user.lastName} · {t.category}
              </p>
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{t.status}</span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
