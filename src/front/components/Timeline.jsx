import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import examplecover from "../assets/img/dragon_cover.jpg";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

const authHeader = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const Timeline = () => {
  const [stories, setStories] = useState([]);
  const [authorsById, setAuthorsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catErr, setCatErr] = useState(null);

  const [recent, setRecent] = useState([]); 
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentErr, setRecentErr] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categorySlug = (params.get("category_slug") || "").trim().toLowerCase();

  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setErr(null);
        setLoading(true);

        const qParam = categorySlug ? `?category_slug=${encodeURIComponent(categorySlug)}` : "";
        const resp = await fetch(`${API_BASE}/api/stories${qParam}`, {
          headers: { Accept: "application/json" },
        });
        const ct = resp.headers.get("content-type") || "";

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          throw new Error(`HTTP ${resp.status} — ${text.slice(0,120)}`);
        }
        if (!ct.includes("application/json")) {
          const text = await resp.text().catch(() => "");
          throw new Error(`Non JSON response(${ct}). Start: ${text.slice(0,120)}`);
        }

        const raw = await resp.json();
        const list =
          (Array.isArray(raw) && raw) ||
          raw?.stories ||
          raw?.data ||
          raw?.results ||
          raw?.items ||
          [];

        if (!Array.isArray(list)) throw new Error("Answer is not a list");
        setStories(list);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    };

    load();

    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/user`, {
          headers: { Accept: "application/json" },
        });
        const ct = r.headers.get("content-type") || "";
        if (r.ok && ct.includes("application/json")) {
          const arr = await r.json();
          const map = {};
          if (Array.isArray(arr)) {
            arr.forEach(u => { map[u.id] = u; });
          }
          setAuthorsById(map);
        }
      } catch {}
    })();
  }, [categorySlug]);

  useEffect(() => {
    (async () => {
      try {
        setCatErr(null);
        setCatLoading(true);
        const r = await fetch(`${API_BASE}/api/categories`, { headers: { Accept: "application/json" } });
        const ct = r.headers.get("content-type") || "";
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} — ${t.slice(0,120)}`);
        }
        if (!ct.includes("application/json")) {
          const t = await r.text().catch(() => "");
          throw new Error(`Non JSON response (${ct}). Start: ${t.slice(0,120)}`);
        }
        const arr = await r.json();
        if (!Array.isArray(arr)) throw new Error("Categories response is not a list");
        setCategories(arr);
      } catch (e) {
        setCatErr(String(e.message || e));
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setRecentErr(null);
        setRecentLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
          setRecent([]);
          return;
        }

        const r = await fetch(`${API_BASE}/api/user/me/recent-stories`, {
          headers: { Accept: "application/json", ...authHeader() },
        });
        const ct = r.headers.get("content-type") || "";
        if (!r.ok) {
          if (r.status === 401) { setRecent([]); return; }
          const t = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} — ${t.slice(0,120)}`);
        }
        if (!ct.includes("application/json")) {
          const t = await r.text().catch(() => "");
          throw new Error(`Non JSON response (${ct}). Start: ${t.slice(0,120)}`);
        }
        const arr = await r.json();
        if (!Array.isArray(arr)) throw new Error("Recent response is not a list");
        if (arr.length === 0) { setRecent([]); return; }

        const ids = [...new Set(arr.map(x => x.story_id).filter(Boolean))];
        const detailPairs = await Promise.all(ids.map(async (sid) => {
          try {
            const rs = await fetch(`${API_BASE}/api/stories/${sid}`, { headers: { Accept: "application/json" } });
            const cts = rs.headers.get("content-type") || "";
            if (!rs.ok || !cts.includes("application/json")) return [sid, null];
            return [sid, await rs.json()];
          } catch { return [sid, null]; }
        }));

        const byId = {};
        detailPairs.forEach(([sid, story]) => { byId[sid] = story; });

        const merged = arr
          .map(v => {
            const story = byId[v.story_id];
            return story ? { story, view_count: v.view_count } : null;
          })
          .filter(Boolean);

        setRecent(merged);
      } catch (e) {
        setRecentErr(String(e.message || e));
      } finally {
        setRecentLoading(false);
      }
    })();
  }, []);

  const openStory = (e, s) => {
    e.preventDefault();
    navigate(`/story/${s.id}`);
  };

  return (
    <div>
      <main className="container-fluid">
        <div className="row g-3 mt-3">
          <aside className="col-12 col-md-3 col-lg-2 p-3 rounded-3 bg-white">
            <div className="card my-3 sidebar-card">
              <div className="card-body">
                <h5 className="card-title">Recently Viewed</h5>
                {recentLoading && <div className="text-muted small">Loading…</div>}
                {recentErr && <div className="text-danger small">Error: {recentErr}</div>}
                {!recentLoading && recent.length === 0 && (
                  <div className="text-muted small">No recent activity</div>
                )}
                {!recentLoading && recent.length > 0 && (
                  <ul className="list-unstyled mb-0">
                    {recent.slice(0, 5).map(({ story }) => (
                      <li key={story.id}>
                        <a
                          href={`/story/${story.id}`}
                          className="link-secondary text-decoration-none"
                          onClick={(e) => openStory(e, story)}
                        >
                          {story.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="card sidebar-card">
              <div className="card-body">
                <h5 className="card-title">Categories</h5>
                {catLoading && <div className="text-muted small">Loading…</div>}
                {catErr && <div className="text-danger small">Error: {catErr}</div>}
                {!catLoading && !catErr && categories.length === 0 && (
                  <div className="text-muted small">No categories</div>
                )}
                {!catLoading && !catErr && categories.length > 0 && (
                  <ul className="list-unstyled mb-0">
                    {categories.map(c => (
                      <li key={c.id}>
                        <Link
                          to={`/timeline?category_slug=${encodeURIComponent(c.slug)}`}
                          className={`text-decoration-none ${categorySlug === c.slug ? "fw-semibold" : "link-secondary"}`}
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>

          <section className="col-12 col-md-9 col-lg-10">
            <div className="bg-white rounded-3 p-3">
              {loading && (
                <div className="text-center py-5">Loading stories</div>
              )}
              {err && (
                <div className="alert alert-danger" role="alert">
                  Error loading stories {err}
                </div>
              )}

              {!loading && !err && stories.length === 0 && (
                <div className="text-center text-muted py-5">
                  There are no published stories {categorySlug ? "for this category" : "yet"}
                </div>
              )}

              {!loading &&
                !err &&
                stories.map((s) => {
                  const cover = s.cover_url || examplecover;
                  const author = authorsById[s.author_id];
                  const authorName = author?.display_name || "Unknown author";
                  return (
                    <div
                      className="card mb-4 mx-auto"
                      style={{ maxWidth: "720px" }}
                      key={s.id}
                    >
                      <div className="row g-0">
                        <div className="col-12 col-md-4">
                          <img
                            src={cover}
                            className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                            alt={`${s.title} cover`}
                          />
                        </div>
                        <div className="col-12 col-md-8">
                          <div className="card-body">
                            <h5 className="card-title mb-1">
                              <a
                                href={`/story/${s.id}`}
                                className="text-decoration-none"
                                onClick={(e) => openStory(e, s)}
                              >
                                {s.title}
                              </a>
                            </h5>

                            <div className="text-muted small mb-2">
                              by{" "}
                              <Link
                                to={`/writer?user_id=${s.author_id}`}
                                className="link-secondary"
                              >
                                {authorName}
                              </Link>
                            </div>

                            <p className="card-text">
                              {s.synopsis || "Synopsis unavailable."}
                            </p>
                            <p className="card-text mb-1">
                              {s.comments_count ?? 0} comments
                            </p>
                            <p className="card-text mb-2">
                              {s.views_count ?? 0} views
                            </p>
                            <p className="card-text">
                              <small className="text-body-secondary">
                                Last updated {s.updated_at_human || s.updated_at}
                              </small>
                            </p>
                            {Array.isArray(s.tags) && s.tags.map((t) => {
                              const tagId = t?.id ?? t?.slug ?? String(t);
                              const tagName = t?.name ?? String(t);
                              const tagSlug = t?.slug ?? encodeURIComponent(String(t));
                              return (
                                <Link key={tagId} to={`/tag/${tagSlug}`} className="me-2">
                                  {tagName}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};