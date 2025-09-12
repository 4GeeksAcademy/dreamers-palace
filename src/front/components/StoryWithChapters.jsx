import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import examplecover from "../assets/img/dragon_cover.jpg";

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

export const StoryWithChapters = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [deleting, setDeleting] = useState(new Set());

  // ---- Edición de historia ----
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSynopsis, setEditSynopsis] = useState("");
  const [editStatus, setEditStatus] = useState("DRAFT");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editErr, setEditErr] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  // -----------------------------
  const [deletingStory, setDeletingStory] = useState(false);

  const isOwnerOrAdmin = !!(me && story && (me.id === story.author_id || me.user_role === "ADMIN"));

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const s = await jsonFetch(`/api/stories/${id}`, { signal: abort.signal });
        setStory(s);

        const ch = await jsonFetch(`/api/stories/${id}/chapters`, { signal: abort.signal });
        if (!Array.isArray(ch)) throw new Error("Answer is not a list");
        setChapters(ch);
      } catch (e) {
        if (e.name === "AbortError") return;
        setErr(String(e.message || e));
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    })();

    return () => abort.abort();
  }, [id]);

  useEffect(() => {
    if (!isEditing) return;
    let ignore = false;
    (async () => {
      try {
        setLoadingCats(true);
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
        if (!ignore) setCategories(Array.isArray(arr) ? arr : []);
      } catch {
        if (!ignore) setCategories([]);
      } finally {
        if (!ignore) setLoadingCats(false);
      }
    })();
    return () => { ignore = true; };
  }, [isEditing]);

  function beginEdit() {
    if (!story) return;
    setEditTitle(story.title || "");
    setEditSynopsis(story.synopsis || "");
    setEditStatus(story.status || "DRAFT");
    setEditCategoryId(story.category?.id ?? "");
    setEditErr(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditErr(null);
  }

  async function saveEdit(e) {
    e.preventDefault();
    setEditErr(null);

    const title = editTitle.trim();
    const synopsis = editSynopsis.trim();
    if (!title) {
      setEditErr("Title is required");
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        title,
        synopsis,
        status: editStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        category_id: editCategoryId === "" ? null : Number(editCategoryId),
      };

      const r = await fetch(`${API_BASE}/api/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      const ct = r.headers.get("content-type") || "";
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        if (r.status === 401) throw new Error("Unauthorized. Please sign in.");
        throw new Error(`HTTP ${r.status} — ${t.slice(0,160)}`);
      }
      if (!ct.includes("application/json")) {
        const t = await r.text().catch(() => "");
        throw new Error(`Non JSON response (${ct}). Start: ${t.slice(0,160)}`);
      }
      const updated = await r.json();
      setStory(updated);
      setIsEditing(false);
    } catch (e) {
      setEditErr(String(e.message || e));
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteChapter(chapterId) {
    if (!isOwnerOrAdmin) return;
    setErr(null);

    const confirmMsg = "Do you really want to delete this chapter?";
    if (!window.confirm(confirmMsg)) return;

    setDeleting(prev => {
      const ns = new Set(prev);
      ns.add(chapterId);
      return ns;
    });

    try {
      const resp = await fetch(`${API_BASE}/api/stories/${id}/chapters/${chapterId}`, {
        method: "DELETE",
        headers: { Accept: "application/json", ...authHeader() },
      });
      if (resp.status !== 204) {
        const text = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} — ${text.slice(0,120)}`);
      }
      setChapters(prev => prev.filter(c => c.id !== chapterId));
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setDeleting(prev => {
        const ns = new Set(prev);
        ns.delete(chapterId);
        return ns;
      });
    }
  }

  function openFirstReadableChapter() {
    const published = chapters.find(c => c.status === "PUBLISHED") || chapters[0];
    if (published?.id) {
      navigate(`/story/${id}/chapters/${published.id}`);
    }
  }

  async function handleDeleteStory() {
    if (!isOwnerOrAdmin || !story) return;
    const ok = window.confirm("Do you really want to delete this story? This will unpublish it and hide it from readers.");
    if (!ok) return;

    setDeletingStory(true);
    setErr(null);
    try {
      const r = await fetch(`${API_BASE}/api/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeader() },
        body: JSON.stringify({ status: "DELETED" }),
      });
      const ct = r.headers.get("content-type") || "";
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`HTTP ${r.status} — ${t.slice(0,160)}`);
      }
      if (!ct.includes("application/json")) {
        const t = await r.text().catch(() => "");
        throw new Error(`Non JSON response (${ct}). Start: ${t.slice(0,160)}`);
      }
      await r.json();
      navigate("/timeline");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setDeletingStory(false);
    }
  }

  const visibleChapters = chapters.filter(c => !c.deleted_at);
  const cover = story?.cover_url || examplecover;

  return (
    <div className="container-xxl my-4">
      {loading && <div className="text-center py-4">Loading…</div>}
      {err && <div className="alert alert-danger">Error: {err}</div>}

      {!loading && story && (
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm mb-3">
              <div className="row g-0">
                <div className="col-12 col-md-4">
                  <img
                    src={cover}
                    className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                    alt={`${story.title} cover`}
                  />
                </div>
                <div className="col-12 col-md-8">
                  <div className="card-body">

                    {!isEditing ? (
                      <>
                        <div className="d-flex align-items-start justify-content-between">
                          <div>
                            <h2 className="mb-1">{story.title}</h2>
                          </div>

                          <div className="d-flex gap-2">
                            {!isOwnerOrAdmin && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={openFirstReadableChapter}
                              >
                                Read
                              </button>
                            )}
                            {isOwnerOrAdmin && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={beginEdit}
                                >
                                  Edit story
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={handleDeleteStory}
                                  disabled={deletingStory}
                                >
                                  {deletingStory ? "Deleting…" : "Delete story"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="mt-3 mb-2">{story.synopsis || "Synopsis unavailable."}</p>
                        <div className="small text-secondary">
                          Last updated {story.updated_at_human || story.updated_at}
                        </div>

                        {Array.isArray(story.tags) && story.tags.length > 0 && (
                          <div className="mt-2">
                            {story.tags.map(t => {
                              const tagId = t?.id ?? t?.slug ?? String(t);
                              const tagName = t?.name ?? String(t);
                              const tagSlug = t?.slug ?? encodeURIComponent(String(t));
                              return (
                                <Link key={tagId} to={`/tag/${tagSlug}`} className="me-2 badge text-bg-light">
                                  {tagName}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <form onSubmit={saveEdit}>
                        <h5 className="mb-3">Edit story</h5>
                        {editErr && <div className="alert alert-danger py-2">{editErr}</div>}

                        <div className="mb-3">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Synopsis</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            value={editSynopsis}
                            onChange={(e) => setEditSynopsis(e.target.value)}
                          />
                        </div>

                        <div className="row g-3">
                          <div className="col-12 col-md-6">
                            <label className="form-label">Status</label>
                            <select
                              className="form-select"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT")}
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="PUBLISHED">Published</option>
                            </select>
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label">Category</label>
                            <select
                              className="form-select"
                              value={editCategoryId}
                              onChange={(e) => setEditCategoryId(e.target.value)}
                              disabled={loadingCats}
                            >
                              <option value="">No category</option>
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-primary btn-sm" type="submit" disabled={savingEdit}>
                            {savingEdit ? "Saving…" : "Save changes"}
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={cancelEdit} disabled={savingEdit}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="mb-0">Chapters</h4>
                  {isOwnerOrAdmin && (
                    <Link to={`/story/${id}/chapters/new`} className="btn btn-primary btn-sm">
                      + Add Chapter
                    </Link>
                  )}
                </div>

                {visibleChapters.length === 0 && (
                  <div className="text-center text-muted py-4">No chapters yet.</div>
                )}

                <div className="list-group">
                  {visibleChapters.map((c) => {
                    const pending = deleting.has(c.id);
                    const canView = isOwnerOrAdmin || c.status === "PUBLISHED";
                    return (
                      <div key={c.id} className="list-group-item d-flex justify-content-between align-items-start">
                        <div className="me-3">
                          <div className="fw-semibold">
                            {canView ? (
                              <Link to={`/story/${id}/chapters/${c.id}`} className="text-decoration-none">
                                {c.number}. {c.title}
                              </Link>
                            ) : (
                              <span className="text-secondary">{c.number}. {c.title}</span>
                            )}
                          </div>
                          <div className="small text-secondary">
                            Status: {c.status} • Updated {c.updated_at_human || c.updated_at}
                          </div>
                        </div>

                        <div className="btn-group">
                          <Link
                            to={`/story/${id}/chapters/${c.id}`}
                            className={`btn btn-sm ${canView ? "btn-outline-primary" : "btn-outline-secondary disabled"}`}
                            aria-disabled={!canView}
                            onClick={(e) => { if (!canView) e.preventDefault(); }}
                          >
                            View
                          </Link>

                          {isOwnerOrAdmin && (
                            <>
                              <Link
                                to={`/story/${id}/chapters/${c.id}/edit`}
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Edit
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteChapter(c.id)}
                                disabled={pending}
                              >
                                {pending ? "Deleting…" : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="text-uppercase text-muted mb-2">About the story</h6>
                <div className="small">
                  <div><strong>Status:</strong> {story.status}</div>
                  {story.category?.name && (
                    <div><strong>Category:</strong> {story.category.name}</div>
                  )}
                  <div><strong>Created:</strong> {story.created_at_human || story.created_at}</div>
                  <div><strong>Updated:</strong> {story.updated_at_human || story.updated_at}</div>
                  {story.published_at && (
                    <div><strong>Published:</strong> {story.published_at_human || story.published_at}</div>
                  )}
                  {story.deleted_at && (
                    <div><strong>Deleted:</strong> {story.deleted_at_human || story.deleted_at}</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};