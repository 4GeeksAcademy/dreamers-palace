import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import avatarpfp from "../assets/img/avatar2.png";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "")


const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const WriterFollowing = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const userId = Number(params.get("user_id")) || me?.id;
  const isOwnProfile = me?.id === userId;

  const [profileName, setProfileName] = useState(me?.display_name || "User");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [unfollowPending, setUnfollowPending] = useState(new Set());

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    (async () => {
      try {
        const followResp = await fetch(`${API_BASE}/api/follows?follower_id=${userId}`, {
          headers: { Accept: "application/json" },
        });
        const ctFollows = followResp.headers.get("content-type") || "";
        if (!followResp.ok) {
          const txt = await followResp.text().catch(() => "");
          throw new Error(`HTTP ${followResp.status} — ${txt.slice(0,160)}`);
        }
        if (!ctFollows.includes("application/json")) {
          const txt = await followResp.text().catch(() => "");
          throw new Error(`Respuesta no-JSON (${ctFollows}). Inicio: ${txt.slice(0,160)}`);
        }
        const follows = await followResp.json();
        const targetIds = new Set(
          Array.isArray(follows) ? follows.map(f => f.following_id).filter(Boolean) : []
        );

        const usersResp = await fetch(`${API_BASE}/api/user`, {
          headers: { Accept: "application/json" },
        });
        const ctUsers = usersResp.headers.get("content-type") || "";
        if (!usersResp.ok || !ctUsers.includes("application/json")) {
          const txt = await usersResp.text().catch(() => "");
          throw new Error(`No se pudo cargar usuarios — ${txt.slice(0,160)}`);
        }
        const users = await usersResp.json();
        const owner = Array.isArray(users) && users.find(u => u.id === userId);
        if (owner?.display_name) setProfileName(owner.display_name);

        const list = Array.isArray(users) ? users.filter(u => targetIds.has(u.id)) : [];
        setFollowingUsers(list);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function handleUnfollow(targetId) {
    setErr(null);
    if (!me?.id) { setErr("You need to login"); return; }

    setUnfollowPending(prev => {
      const ns = new Set(prev);
      ns.add(targetId);
      return ns;
    });

    try {
      const resp = await fetch(`${API_BASE}/api/follows?following_id=${targetId}`, {
        method: "DELETE",
        headers: { Accept: "application/json", ...authHeader() },
      });
      if (resp.status !== 204) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Unfollow failed (HTTP ${resp.status}) — ${text.slice(0,160)}`);
      }
      setFollowingUsers(prev => prev.filter(u => u.id !== targetId));
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setUnfollowPending(prev => {
        const ns = new Set(prev);
        ns.delete(targetId);
        return ns;
      });
    }
  }

  return (
    <div>
      <div className="p-5 bg-body-tertiary">
        <div className="container-fluid d-flex flex-column align-items-center py-5">
          <div>
            <img
              src={avatarpfp}
              className="profile-page rounded-circle"
              alt="avatar"
              style={{width: "120px", height: "120px", objectFit: "cover"}}
            />
          </div>
          <div>
            <h1 className="mt-3">{profileName}</h1>
          </div>
          <div className="d-flex">
            <p className="text-secondary me-2">Following</p>
          </div>
        </div>
      </div>

      <div className="container-fluid d-flex gap-3 bg-white py-2">
        <div>
          <button className="btn btn-primary" type="button">About</button>
        </div>
        <div>
          <button className="btn btn-primary">Following</button>
        </div>
        <div className="ms-auto">
          <Link className="btn btn-primary" to="/writerpage">Edit Profile</Link>
        </div>
      </div>

      <div className="container my-4 p-3 bg-white rounded shadow">
        <h1 className="mb-4">Following</h1>

        {err && <div className="alert alert-danger">{err}</div>}
        {loading && <div className="text-center text-muted py-4">Cargando…</div>}

        {!loading && followingUsers.length === 0 && (
          <div className="text-center text-muted py-4">No estás siguiendo a nadie aún.</div>
        )}

        <div className="row g-4">
          {!loading && followingUsers.map(u => {
            const pending = unfollowPending.has(u.id);
            return (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={u.id}>
                <div className="card h-100 text-center">
                  <img
                    src={avatarpfp}
                    className="rounded-circle mx-auto d-block mt-3"
                    style={{width: "80px", height:"80px", objectFit:"cover"}}
                    alt={u.display_name}
                  />
                  <div className="card-body d-flex flex-column align-items-center">
                    <h5 className="card-title mb-1">{u.display_name}</h5>
                    <p className="card-text text-secondary">{u.email}</p>

                    {isOwnProfile ? (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleUnfollow(u.id)}
                        disabled={pending}
                      >
                        {pending ? "Unfollowing…" : "Unfollow"}
                      </button>
                    ) : (
                      <button className="btn btn-primary" disabled>Following</button>
                    )}
                  </div>
                  <div className="card-footer d-flex justify-content-center gap-3">
                    <p className="mb-0">#Works</p>
                    <p className="mb-0">#Followers</p>
                    <p className="mb-0">#Following</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};