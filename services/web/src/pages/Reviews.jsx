import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export default function Reviews() {
  const { user } = useAuth();
  const isManager = user && user.role !== "EMPLOYEE";
  const [received, setReceived] = useState([]);
  const [written, setWritten] = useState([]);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ revieweeId: "", cycle: "2026-H2", content: "", rating: 4 });

  const load = () => {
    api.get("/reviews/received").then(setReceived);
    if (isManager) {
      api.get("/reviews/written").then(setWritten);
      api.get("/users?managerId=me&pageSize=50").then((res) => setReports(res.users));
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManager]);

  const acknowledge = async (id) => {
    await api.patch(`/reviews/${id}/acknowledge`, {});
    load();
  };

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/reviews", form);
    setForm({ ...form, revieweeId: "", content: "" });
    load();
  };

  return (
    <AppShell>
      <h1>Performance Reviews</h1>

      <h3>Reviews you've received</h3>
      <div className="zh-card" style={{ marginBottom: 24 }}>
        {received.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>No reviews yet.</p>}
        {received.map((r) => (
          <div key={r.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0" }}>
            <strong>
              {r.cycle} (Rating {r.rating}/5)
            </strong>
            <p style={{ margin: "4px 0" }}>{r.content}</p>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--zh-gray-600)" }}>
              By {r.reviewer.firstName} {r.reviewer.lastName}
            </p>
            {!r.acknowledged ? (
              <button className="zh-pill zh-pill--ghost" style={{ marginTop: 8 }} onClick={() => acknowledge(r.id)}>
                Acknowledge
              </button>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "var(--zh-gray-600)" }}>Acknowledged</span>
            )}
          </div>
        ))}
      </div>

      {isManager && (
        <>
          <h3>Reviews you've written</h3>
          <div className="zh-card" style={{ marginBottom: 24 }}>
            {written.length === 0 && <p style={{ color: "var(--zh-gray-600)" }}>None yet.</p>}
            {written.map((r) => (
              <div key={r.id} style={{ borderTop: "1px solid var(--zh-gray-100)", padding: "12px 0" }}>
                <strong>
                  {r.reviewee.firstName} {r.reviewee.lastName} ({r.cycle})
                </strong>
                <p style={{ margin: "4px 0" }}>{r.content}</p>
              </div>
            ))}
          </div>

          <h3>Write a review</h3>
          <form onSubmit={submit} className="zh-card" style={{ maxWidth: 480 }}>
            <label style={{ display: "block", marginBottom: 10 }}>
              Employee
              <select required value={form.revieweeId} onChange={(e) => setForm({ ...form, revieweeId: e.target.value })} style={inputStyle}>
                <option value="">Select...</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.firstName} {r.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "block", marginBottom: 10 }}>
              Cycle
              <input required value={form.cycle} onChange={(e) => setForm({ ...form, cycle: e.target.value })} style={inputStyle} />
            </label>
            <label style={{ display: "block", marginBottom: 10 }}>
              Rating (1-5)
              <input type="number" min={1} max={5} required value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={inputStyle} />
            </label>
            <label style={{ display: "block", marginBottom: 14 }}>
              Comments
              <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} />
            </label>
            <button type="submit" className="zh-pill zh-pill--red">
              Submit review
            </button>
          </form>
        </>
      )}
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
