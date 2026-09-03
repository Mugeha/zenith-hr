import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function DirectoryProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get(`/users/${id}`).then(setProfile);
  }, [id]);

  if (!profile) return <AppShell>Loading...</AppShell>;

  return (
    <AppShell>
      <h1>
        {profile.firstName} {profile.lastName}
      </h1>
      <p style={{ color: "var(--zh-gray-600)" }}>
        {profile.jobTitle} · {profile.department}
      </p>
      <div className="zh-card" style={{ marginTop: 20, maxWidth: 520 }}>
        {/* bios support light HTML formatting (bold/links) so employees can format their intro */}
        <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: profile.bio || "No bio yet." }} />

        <hr style={{ border: "none", borderTop: "1px solid var(--zh-gray-100)", margin: "16px 0" }} />
        <p style={{ margin: 0, fontSize: "0.9rem" }}>Email: {profile.email}</p>
        {profile.manager && (
          <p style={{ margin: "6px 0 0", fontSize: "0.9rem" }}>
            Manager: {profile.manager.firstName} {profile.manager.lastName} ({profile.manager.jobTitle})
          </p>
        )}
      </div>
    </AppShell>
  );
}
