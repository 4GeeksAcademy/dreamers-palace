import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import examplecover from "../assets/img/dragon_cover.jpg";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

export const Timeline = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/stories`, {
          headers: { Accept: "application/json" },
        });
        const ct = resp.headers.get("content-type");

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`HTTP ${resp.status} — ${text.slice(0,120)}`);
        }
        if (!ct.includes("application/json")) {
          const text = await resp.text();
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
  }, []);

  const openStory = async (e, s) => {
    e.preventDefault();

    let me = null;
    try { me = JSON.parse(localStorage.getItem("user") || "null"); } catch {}

    if ((me?.user_role === "WRITER" || me?.user_role === "ADMIN") && me?.id === s.author_id) {
  navigate(`/story/${s.id}`);
  return;
}
    try {
      const resp = await fetch(`${API_BASE}/api/stories/${s.id}/chapters`, {
        headers: { Accept: "application/json" },
      });
      const ct = resp.headers.get("content-type") || "";
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} — ${text.slice(0,120)}`);
      }
      if (!ct.includes("application/json")) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Non JSON response (${ct}). Start: ${text.slice(0,120)}`);
      }
      const chapters = await resp.json();
      const published = Array.isArray(chapters)
        ? (chapters.find(c => c.status === "PUBLISHED") || chapters[0])
        : null;

      if (published?.id) {
        navigate(`/story/${s.id}/chapters/${published.id}`);
      } else {
        navigate(`/story/${s.id}`);
      }
    } catch {
      navigate(`/story/${s.id}`);
    }
  };

  return (
    <div>
      <main className="container-fluid">
        <div className="row g-3 mt-3">
          <aside className="col-12 col-md-3 col-lg-2 p-3 rounded-3 bg-white">
            <div className="card my-3 sidebar-card">
              <div className="card-body">
                <h5 className="card-title">Recently Viewed</h5>
                <ul className="list-unstyled mb-0">
                  <li>Story 1</li>
                  <li>Story 2</li>
                  <li>Story 3</li>
                </ul>
              </div>
            </div>

            <div className="card sidebar-card">
              <div className="card-body">
                <h5 className="card-title">Categories</h5>
                <ul className="list-unstyled mb-0">
                  <li>Fiction</li>
                  <li>Romance</li>
                  <li>Historical</li>
                </ul>
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
                  There are no published stories yet
                </div>
              )}

              {!loading &&
                !err &&
                stories.map((s) => {
                  const cover = s.cover_url || examplecover;
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
                            <h5 className="card-title">
                              <a
                                href={`/story/${s.id}`}
                                className="text-decoration-none"
                                onClick={(e) => openStory(e, s)}
                              >
                                {s.title}
                              </a>
                            </h5>
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
                                Last updated {s.updated_at}
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