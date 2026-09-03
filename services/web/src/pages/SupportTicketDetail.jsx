import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function SupportTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user && (user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN");
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");

  const load = () => api.get(`/tickets/${id}`).then(setTicket);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    await api.post(`/tickets/${id}/comments`, { body: comment });
    setComment("");
    load();
  };

  const setStatus = async (status) => {
    await api.patch(`/tickets/${id}/status`, { status });
    load();
  };

  if (!ticket) return <AppShell>Loading...</AppShell>;

  return (
    <AppShell>
      <h1>{ticket.subject}</h1>
      <p style={{ color: "var(--zh-gray-600)" }}>
        {ticket.category} · Status: <strong>{ticket.status}</strong>
      </p>

      {isStaff && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {STATUSES.map((s) => (
            <button key={s} className="zh-pill zh-pill--ghost" onClick={() => setStatus(s)} disabled={s === ticket.status}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="zh-card" style={{ marginBottom: 20 }}>
        {ticket.comments.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>No comments yet.</p>}
        {ticket.comments.map((c) => (
          <div key={c.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "10px 0" }}>
            <strong style={{ fontSize: "0.85rem" }}>
              {c.author.firstName} {c.author.lastName}
            </strong>
            <p style={{ margin: "4px 0 0" }}>{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submitComment} className="zh-card" style={{ maxWidth: 480 }}>
        <textarea
          required
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: "100%", minHeight: 70, padding: 10, borderRadius: 8, border: "1px solid var(--zh-gray-100)" }}
        />
        <button type="submit" className="zh-pill zh-pill--red" style={{ marginTop: 10 }}>
          Post comment
        </button>
      </form>
    </AppShell>
  );
}
