import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

const authHeader = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const WriterProfileEdit = () => {
  const navigate = useNavigate();
  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const [createdAtHuman, setCreatedAtHuman] = useState("");
  const [updatedAtHuman, setUpdatedAtHuman] = useState("");

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem("token")) {
        navigate("/login");
        return;
      }
      setErr(null);
      setOk(null);
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/user/me`, {
          headers: { Accept: "application/json", ...authHeader() },
        });
        const ct = r.headers.get("content-type") || "";
        if (!r.ok) {
          const t = await r.text().catch(()=> "");
          throw new Error(`HTTP ${r.status} — ${t.slice(0,160)}`);
        }
        if (!ct.includes("application/json")) {
          const t = await r.text().catch(()=> "");
          throw new Error(`Non JSON response (${ct}). Start: ${t.slice(0,160)}`);
        }
        const u = await r.json();
        setDisplayName(u.display_name || "");
        setBio(u.bio || "");
        setLocation(u.location || "");

        setCreatedAtHuman(u.created_at_human || u.created_at || "");
        setUpdatedAtHuman(u.updated_at_human || u.updated_at || "");
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!displayName.trim()) {
      setErr("Display name is required");
      return;
    }

    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/user/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeader() },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio || "",
          location: location || "",
        }),
      });
      const ct = r.headers.get("content-type") || "";
      if (!r.ok) {
        const t = await r.text().catch(()=> "");
        throw new Error(`HTTP ${r.status} — ${t.slice(0,160)}`);
      }
      if (!ct.includes("application/json")) {
        const t = await r.text().catch(()=> "");
        throw new Error(`Non JSON response (${ct}). Start: ${t.slice(0,160)}`);
      }
      const updated = await r.json();

      const old = me ? { ...me } : {};
      const merged = { ...old, ...updated };
      localStorage.setItem("user", JSON.stringify(merged));

      setOk("Profile updated!");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="container my-4 text-center">Loading…</div>;
  }

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h3 className="mb-0">Edit Profile</h3>
                <Link to={`/writer?user_id=${me?.id || ""}`} className="btn btn-outline-secondary btn-sm">
                  Back to profile
                </Link>
              </div>

              {(createdAtHuman || updatedAtHuman) && (
                <div className="text-muted small mb-3">
                  Joined {createdAtHuman || "—"} • Last updated {updatedAtHuman || "—"}
                </div>
              )}

              {err && <div className="alert alert-danger">Error: {err}</div>}
              {ok && <div className="alert alert-success">{ok}</div>}

              <form onSubmit={onSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Display name</label>
                  <input
                    type="text"
                    className="form-control"
                    maxLength={80}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    maxLength={1000}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your readers about you…"
                  />
                  <div className="form-text">{bio.length}/1000</div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    maxLength={120}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>

                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <Link to={`/writer?user_id=${me?.id || ""}`} className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                </div>
              </form>

              <div className="form-text mt-3">
                Display name must be unique (≤ 80 chars).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};