import AppShell from "../components/AppShell";
import { useAuth } from "../lib/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <AppShell>
      <h1>
        Welcome back, {user.firstName} <span className="zh-highlight">{user.lastName}</span>
      </h1>
      <p style={{ color: "var(--zh-gray-600)" }}>
        {user.jobTitle} · {user.department} · Role: {user.role}
      </p>
      {user.bio && (
        <div className="zh-card" style={{ marginTop: 24 }}>
          <p style={{ margin: 0 }}>{user.bio}</p>
        </div>
      )}
    </AppShell>
  );
}
