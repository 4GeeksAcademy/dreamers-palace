import { Link } from "react-router-dom"
import { useEffect, useState } from "react";
import examplecover from "../assets/img/dragon_cover.jpg"

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "")

export const Timeline = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/stories`, {
          headers: { Accept: "application/json" },
        });
        const ct = resp.headers.get("content-type")

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`HTTP ${resp.status} — ${text.slice(0,120)}`);
        }
        if (!ct.includes("application/json")) {
          const text = await resp.text();
          throw new Error(`Respuesta no-JSON (${ct}). Inicio: ${text.slice(0,120)}`);
        }

        const raw = await resp.json();
        const list =
          (Array.isArray(raw) && raw) ||
          raw?.stories ||
          raw?.data ||
          raw?.results ||
          raw?.items ||
          [];

        if (!Array.isArray(list)) throw new Error("La respuesta no es una lista.");
        setStories(list);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  
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
                <div className="text-center py-5">Cargando historias…</div>
              )}
              {err && (
                <div className="alert alert-danger" role="alert">
                  Error cargando historias: {err}
                </div>
              )}

              {!loading && !err && stories.length === 0 && (
                <div className="text-center text-muted py-5">
                  No hay historias publicadas todavía.
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
                              <Link to={`/story/${s.id}`} className="text-decoration-none">
                                {s.title}
                              </Link>
                            </h5>
                            <p className="card-text">
                              {s.synopsis || "Sinopsis no disponible."}
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
                            {Array.isArray(s.tags) &&
                              s.tags.map((t) => (
                                <Link
                                  key={t}
                                  to={`/tag/${encodeURIComponent(t)}`}
                                  className="me-2"
                                >
                                  {t}
                                </Link>
                              ))}
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