import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

const authHeader = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
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
    throw new Error(`HTTP ${resp.status} — ${text.slice(0,120)}`);
  }
  if (!ct.includes("application/json")) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Non JSON response (${ct}). Start: ${text.slice(0,120)}`);
  }
  return resp.json();
}

export const ChapterEdit = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();

  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [storyTitle, setStoryTitle] = useState("");

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        // 1) Cargar historia (pública)
        const story = await jsonFetch(`/api/stories/${id}`, { signal: abort.signal });
        setStoryTitle(story?.title || "");

        // 2) Verificar permisos: autor o admin
        const isOwnerOrAdmin =
          !!me && (me.id === story.author_id || me.user_role === "ADMIN");

        if (!isOwnerOrAdmin) {
          // Redirigir a lector (o al primer capítulo publicado si existe)
          try {
            const chs = await jsonFetch(`/api/stories/${id}/chapters`, { signal: abort.signal });
            const published = Array.isArray(chs)
              ? (chs.find(c => c.status === "PUBLISHED") || chs[0])
              : null;
            if (published?.id) {
              navigate(`/story/${id}/chapters/${published.id}`, { replace: true });
              return;
            }
          } catch { /* ignore */ }
          navigate(`/story/${id}`, { replace: true });
          return;
        }

        // 3) Cargar capítulo con Authorization (puede estar en DRAFT)
        const ch = await jsonFetch(`/api/stories/${id}/chapters/${chapterId}`, {
          headers: { ...authHeader() },
          signal: abort.signal,
        });
        setTitle(ch.title || "");
        setNumber(String(ch.number ?? ""));
        setContent(ch.content || "");
        setStatus(ch.status || "DRAFT");
      } catch (e) {
        if (e.name !== "AbortError") setErr(String(e.message || e));
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    })();

    return () => abort.abort();
  }, [id, chapterId, me]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);

    const n = Number(number);
    if (!title.trim()) return setErr("Title is required");
    if (!Number.isFinite(n) || n < 1) return setErr("Number must be a positive integer");
    if (!content.trim()) return setErr("Content is required");

    setSaving(true);
    try {
      const updated = await jsonFetch(`/api/stories/${id}/chapters/${chapterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          title: title.trim(),
          number: n,
          content: content.trim(),
          status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        }),
      });

      navigate(`/story/${id}/chapters/${updated.id}`);
    } catch (e) {
      setErr(`Error updating chapter: ${String(e.message || e)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-xxl my-4">
      {loading && <div className="text-center py-4">Loading…</div>}
      {err && <div className="alert alert-danger">Error: {err}</div>}

      {!loading && (
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="mb-1">Edit Chapter</h3>
                      <div className="text-muted small">
                        Story:{" "}
                        <Link to={`/story/${id}`} className="link-secondary">
                          {storyTitle || `#${id}`}
                        </Link>
                      </div>
                    </div>
                    <div className="btn-group">
                      <Link to={`/story/${id}`} className="btn btn-sm btn-outline-secondary">
                        Back to story
                      </Link>
                      <Link to={`/story/${id}/chapters/${chapterId}`} className="btn btn-sm btn-outline-primary">
                        View chapter
                      </Link>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Chapter title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Number</label>
                      <input
                        type="number"
                        min={1}
                        className="form-control"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT")}
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label">Content</label>
                    <textarea
                      className="form-control"
                      rows={12}
                      placeholder="Write your chapter content…"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                    <Link to={`/story/${id}`} className="btn btn-outline-secondary">
                      Cancel
                    </Link>
                  </div>

                  <div className="form-text mt-2">
                    Changing status to <em>Published</em> will make the chapter publicly readable.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};