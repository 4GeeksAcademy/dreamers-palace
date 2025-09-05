import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import examplecover from "../assets/img/dragon_cover.jpg";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function jsonFetch(path, opts = {}) {
  const { method = "GET", headers = {}, body, signal } = opts;
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Accept: "application/json", ...headers },
    body,
    signal,
  });

  const ct = resp.headers.get("content-type") || "";
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    if (resp.status === 401) throw new Error("No autorizado. Inicia sesión.");
    throw new Error(`HTTP ${resp.status} — ${text.slice(0, 160)}`);
  }
  if (!ct.includes("application/json")) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Respuesta no-JSON (${ct}). Inicio: ${text.slice(0, 160)}`);
  }
  return resp.json();
}

export const StoryWithChapters = () => {
  const { id } = useParams();
  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [chTitle, setChTitle] = useState("");
  const [chNumber, setChNumber] = useState(1);
  const [chContent, setChContent] = useState("");
  const [chStatus, setChStatus] = useState("DRAFT");
  const [saving, setSaving] = useState(false);

  const isAuthor = me?.id && story?.author_id === me.id;

  useEffect(() => {
    if (!id) {
      setErr("Invalid route: missing story ID.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [s, c] = await Promise.all([
          jsonFetch(`/api/stories/${id}`),
          jsonFetch(`/api/stories/${id}/chapters`),
        ]);
        setStory(s);
        setChapters(Array.isArray(c) ? c : []);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const next = (chapters[chapters.length - 1]?.number ?? 0) + 1;
    setChNumber(next);
  }, [chapters]);

  const onCreateChapter = async (e) => {
    e.preventDefault();
    setErr(null);

    const title = chTitle.trim();
    const content = chContent.trim();
    const number = Number(chNumber);

    if (!title || !content || !number) {
      setErr("All fields are mandatory");
      return;
    }

    try {
      setSaving(true);
      const created = await jsonFetch(`/api/stories/${id}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          title,
          number,
          content,
          status: chStatus,
        }),
      });
      setChapters((prev) => [...prev, created].sort((a, b) => a.number - b.number));
      setChTitle("");
      setChContent("");
      setShowForm(false);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-xxl my-4">
      {loading && <div className="text-center text-muted py-4">Cargando…</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      {!loading && story && (
        <div className="row g-3">
          <div className="col-12">
            <div className="card shadow-sm mb-3">
              <div className="row g-0">
                <div className="col-12 col-md-4">
                  <img
                    src={story.cover_url || examplecover}
                    className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                    alt={`${story.title} cover`}
                    style={{ maxHeight: 260 }}
                  />
                </div>
                <div className="col-12 col-md-8">
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <h3 className="card-title mb-2 me-auto">{story.title}</h3>
                      {isAuthor && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setShowForm((v) => !v)}
                        >
                          {showForm ? "Cancelar" : "Nuevo capítulo"}
                        </button>
                      )}
                    </div>

                    <p className="card-text">{story.synopsis || "Synopsis unavailable"}</p>

                    <div className="mb-2">
                      {story.category?.name && (
                        <span className="badge text-bg-secondary me-2">
                          {story.category.name}
                        </span>
                      )}
                      {Array.isArray(story.tags) &&
                        story.tags.map((t) => {
                          const tagKey = t?.id ?? t?.slug ?? t?.name ?? Math.random();
                          const tagName = t?.name ?? String(t);
                          const tagSlug = t?.slug ?? encodeURIComponent(tagName);
                          return (
                            <Link
                              key={tagKey}
                              to={`/tag/${tagSlug}`}
                              className="badge text-bg-light border me-2 text-decoration-none"
                            >
                              {tagName}
                            </Link>
                          );
                        })}
                    </div>

                    <small className="text-body-secondary d-block">
                      Last updated {story.updated_at}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isAuthor && showForm && (
            <div className="col-12">
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <h5 className="mb-3">New Chapter</h5>
                  <form onSubmit={onCreateChapter} className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={chTitle}
                        onChange={(e) => setChTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6 col-md-2">
                      <label className="form-label">Number</label>
                      <input
                        type="number"
                        className="form-control"
                        value={chNumber}
                        min={1}
                        onChange={(e) => setChNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6 col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={chStatus}
                        onChange={(e) =>
                          setChStatus(e.target.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT")
                        }
                      >
                        <option value="DRAFT">Draft (private)</option>
                        <option value="PUBLISHED">Published (public)</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Content</label>
                      <textarea
                        className="form-control"
                        rows="6"
                        placeholder="Empieza a escribir tu capítulo…"
                        value={chContent}
                        onChange={(e) => setChContent(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12 d-flex gap-2">
                      <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving ? "Guardando…" : "Crear capítulo"}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="mb-3">Chapters</h5>

                {chapters.length === 0 ? (
                  <div className="text-muted">There are no chapters.</div>
                ) : (
                  <div className="list-group">
                    {chapters
                      .slice()
                      .sort((a, b) => a.number - b.number)
                      .map((ch) => (
                        <div
                          key={ch.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="fw-semibold">
                              {ch.number}. {ch.title}
                            </div>
                            <small className="text-body-secondary">
                              {ch.status} • Last updated {ch.updated_at}
                            </small>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};