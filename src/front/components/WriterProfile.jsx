import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import examplecover from "../assets/img/dragon_cover.jpg";
import pfp from "../assets/img/avatar2.png";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

const authHeader = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const WriterProfile = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const viewUserId = Number(params.get("user_id")) || me?.id;

  const [displayName, setDisplayName] = useState(me?.display_name || "User");
  const [owner, setOwner] = useState(null);

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);
  const [err, setErr] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  async function loadAll() {
    if (!viewUserId) { setLoading(false); return; }
    try {
      setErr(null);

      const resp = await fetch(`${API_BASE}/api/stories?author_id=${viewUserId}`, {
        headers: { Accept: "application/json" },
      });
      const ct = resp.headers.get("content-type") || "";
      if (!resp.ok) {
        const error = await resp.text().catch(()=> "");
        throw new Error(`HTTP ${resp.status} — ${error.slice(0,160)}`);
      }
      if (!ct.includes("application/json")) {
        const error = await resp.text().catch(()=> "");
        throw new Error(`JSON (${ct}). Start: ${error.slice(0,160)}`);
      }
      const raw = await resp.json();
      const list = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? raw?.results ?? []);
      if (!Array.isArray(list)) throw new Error("The response is not a list");
      setStories(list);

      const usersResp = await fetch(`${API_BASE}/api/user`, { headers: { Accept: "application/json" } });
      const ctu = usersResp.headers.get("content-type") || "";
      if (usersResp.ok && ctu.includes("application/json")) {
        const users = await usersResp.json();
        const ownerFound = Array.isArray(users) ? users.find(u => u.id === viewUserId) : null;
        if (ownerFound) {
          setOwner(ownerFound);
          if (ownerFound.display_name) setDisplayName(ownerFound.display_name);
        }
      }

      const [rfollowers, rfollowing] = await Promise.allSettled([
        fetch(`${API_BASE}/api/follows?following_id=${viewUserId}`, { headers: { Accept: "application/json" } }),
        fetch(`${API_BASE}/api/follows?follower_id=${viewUserId}`,  { headers: { Accept: "application/json" } }),
      ]);

      if (rfollowers.status === "fulfilled") {
        const r = rfollowers.value;
        const ctf = r.headers.get("content-type") || "";
        if (r.ok && ctf.includes("application/json")) {
          const arr = await r.json();
          setFollowersCount(Array.isArray(arr) ? arr.length : 0);
        }
      }
      if (rfollowing.status === "fulfilled") {
        const r = rfollowing.value;
        const ctf = r.headers.get("content-type") || "";
        if (r.ok && ctf.includes("application/json")) {
          const arr = await r.json();
          setFollowingCount(Array.isArray(arr) ? arr.length : 0);
        }
      }

      if (me?.id && me.id !== viewUserId) {
        const r = await fetch(`${API_BASE}/api/follows?follower_id=${me.id}&following_id=${viewUserId}`, {
          headers: { Accept: "application/json" },
        });
        const ctCheck = r.headers.get("content-type") || "";
        if (r.ok && ctCheck.includes("application/json")) {
          const arr = await r.json();
          setIsFollowing(Array.isArray(arr) && arr.length > 0);
        }
      } else {
        setIsFollowing(false);
      }

    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    function onStorage(e) {
      if (e.key === "user") {
        try {
          const u = JSON.parse(e.newValue || "null");
          if (u?.id === viewUserId) {
            setDisplayName(u.display_name || "User");
            setOwner(prev => prev ? { ...prev, ...u } : u);
          }
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [viewUserId, me?.id]);

  const isOwnProfile = me?.id && me.id === viewUserId;

  async function toggleFollow() {
    if (!me?.id) {
      setErr("Debes iniciar sesión para seguir usuarios.");
      return;
    }
    if (isOwnProfile) return;

    setLoadingFollow(true);
    setErr(null);
    try {
      if (isFollowing) {
        const r = await fetch(`${API_BASE}/api/follows?following_id=${viewUserId}`, {
          method: "DELETE",
          headers: { Accept: "application/json", ...authHeader() },
        });
        if (!r.ok) {
          const t = await r.text().catch(()=> "");
          throw new Error(`Unfollow failed: HTTP ${r.status} — ${t.slice(0,160)}`);
        }
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, (c ?? 0) - 1));
      } else {
        const r = await fetch(`${API_BASE}/api/follows`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeader() },
          body: JSON.stringify({ following_id: viewUserId }),
        });
        const ct = r.headers.get("content-type") || "";
        if (!r.ok) {
          const t = await r.text().catch(()=> "");
          throw new Error(`Follow failed: HTTP ${r.status} — ${t.slice(0,160)}`);
        }
        if (!ct.includes("application/json")) {
          const t = await r.text().catch(()=> "");
          throw new Error(`Follow failed: Non JSON response (${ct}). Start: ${t.slice(0,160)}`);
        }
        await r.json();
        setIsFollowing(true);
        setFollowersCount((c) => (c ?? 0) + 1);
      }
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoadingFollow(false);
    }
  }

  return (<>
    <div className="p-5 bg-body-tertiary">
      <div className="container-fluid d-flex flex-column align-items-center py-5">
        <div>
          <img
            src={pfp}
            className="profile-page rounded-circle"
            alt="avatar"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />
        </div>
        <div>
          <h1 className="mt-3">{displayName}</h1>
        </div>
        <div className="d-flex">
          <p className="text-secondary me-3">{loading ? "#" : stories.length} Stories</p>
          <p className="text-secondary me-3">{followersCount ?? "#"} Followers</p>
          <p className="text-secondary">{followingCount ?? "#"} Following</p>
        </div>
      </div>
    </div>

    <div className="container-fluid d-flex gap-3 bg-white py-2">
      <div><button className="btn btn-primary" type="button">About</button></div>
      <div>
        <Link to={`/following?user_id=${viewUserId}`} className="btn btn-primary">Following</Link>
      </div>

      <div className="ms-auto d-flex gap-2">
        {!isOwnProfile && (
          me?.id ? (
            <button
              className={`btn ${isFollowing ? "btn-outline-danger" : "btn-outline-success"}`}
              onClick={toggleFollow}
              disabled={loadingFollow}
            >
              {loadingFollow ? "Processing…" : (isFollowing ? "Unfollow" : "Follow")}
            </button>
          ) : (
            <Link to="/login" className="btn btn-outline-primary">Sign in to follow</Link>
          )
        )}
        {isOwnProfile && <Link to="/writerpage/edit" className="btn btn-primary">Edit Profile</Link>}
      </div>
    </div>

    <div className="container my-4">
      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row g-4">
        <aside className="col-12 col-lg-3">
          <div className="bg-white p-3 rounded shadow">
            <h5 className="mb-3">About</h5>

            <p className="mb-2">
              <strong>Description:</strong>{" "}
              {owner?.bio || ""}
            </p>
            <p className="mb-2">
              <strong>Location:</strong>{" "}
              {owner?.location || ""}
            </p>
            <p className="mb-0">
              <strong>Joined at:</strong>{" "}
              {owner?.created_at || "—"}
            </p>

            <hr className="my-3" />

            <h6 className="mb-2">Share Profile</h6>
            <div className="d-flex gap-3">
              <a href="#" aria-label="Twitter">
                <i className="fa-brands fa-twitter" style={{ fontSize: "30px" }}></i>
              </a>
              <a href="#" aria-label="Facebook">
                <i className="fa-brands fa-facebook" style={{ fontSize: "30px" }}></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fa-brands fa-instagram" style={{ fontSize: "30px" }}></i>
              </a>
              <a href="#" aria-label="Email">
                <i className="fa-solid fa-envelope" style={{ fontSize: "30px" }}></i>
              </a>
            </div>
          </div>
        </aside>

        <section className="col-12 col-lg-9">
          <div className="bg-white p-3 rounded shadow">
            <h1 className="mb-4">Stories</h1>

            {loading && <div className="text-center text-muted py-4">Loading....</div>}

            {!loading && stories.length === 0 && (
              <div className="text-center text-muted py-4">There are no published stories</div>
            )}

            <div className="d-flex flex-wrap gap-4">
              {!loading && stories.map((s) => {
                const cover = s.cover_url || examplecover;
                return (
                  <div key={s.id} className="d-flex bg-light rounded shadow-sm p-2" style={{ width: "350px" }}>
                    <div style={{ flex: "0 0 120px" }}>
                      <img src={cover} className="img-fluid rounded" alt={`${s.title} cover`} />
                    </div>
                    <div className="ps-2">
                      <h5 className="card-title mb-1">
                        <Link to={`/story/${s.id}`} className="text-decoration-none">{s.title}</Link>
                      </h5>
                      <p className="card-text small mb-1">{s.synopsis || "Sinopsis no disponible."}</p>
                      <small className="text-body-secondary d-block mb-1">
                        Last updated {s.updated_at_human || s.updated_at}
                      </small>
                      {Array.isArray(s.tags) && s.tags.map((t) => {
                        const tagId = t?.id ?? t?.slug ?? String(t);
                        const tagName = t?.name ?? String(t);
                        const tagSlug = t?.slug ?? encodeURIComponent(String(t));
                        return (
                          <Link key={tagId} to={`/tag/${tagSlug}`} className="me-2 small">
                            {tagName}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  </>);
};