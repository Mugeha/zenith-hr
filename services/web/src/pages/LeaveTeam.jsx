import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function LeaveTeam() {
  const [requests, setRequests] = useState([]);

  const load = () => api.get("/leave/team").then(setRequests);
  useEffect(() => {
    load();
  }, []);

  const decide = async (id, decision) => {
    await api.patch(`/leave/${id}/decision`, { decision });
    load();
  };

  return (
    <AppShell>
      <h1>Team Leave Requests</h1>
      <div className="zh-card">
        {requests.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>Nothing to review.</p>}
        {requests.map((r) => (
          <div key={r.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>
                {r.user.firstName} {r.user.lastName}
              </strong>{" "}
              <span style={{ color: "var(--zh-gray-600)", fontSize: "0.85rem" }}>({r.user.department})</span>
              <p
                style={{ margin: "4px 0 0", fontSize: "0.9rem" }}
                dangerouslySetInnerHTML={{
                  __html: `${new Date(r.startDate).toLocaleDateString()} – ${new Date(r.endDate).toLocaleDateString()}: ${r.reason}`,
                }}
              />

            </div>
            {r.status === "PENDING" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="zh-pill zh-pill--red" onClick={() => decide(r.id, "APPROVED")}>
                  Approve
                </button>
                <button className="zh-pill zh-pill--ghost" onClick={() => decide(r.id, "REJECTED")}>
                  Reject
                </button>
              </div>
            ) : (
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{r.status}</span>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
