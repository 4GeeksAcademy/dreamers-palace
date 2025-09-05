import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

const authHeader = () => {
  const jwttoken = localStorage.getItem("token");
  return jwttoken ? { Authorization: `Bearer ${jwttoken}` } : {};
};

async function jsonFetch(path, opts = {}) {
  const { method = "GET", headers = {}, body, signal } = opts;
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Accept: "application/json", ...headers },
    body,
    signal,
  });

  const chapter_creation = resp.headers.get("content-type") || "";
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    if (resp.status === 401) throw new Error("Unauthorized, please log in");
    throw new Error(`HTTP ${resp.status} — ${text.slice(0, 160)}`);
  }
  if (!chapter_creation.includes("application/json")) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Non JSON Response(${chapter_creation}). Start: ${text.slice(0, 160)}`);
  }
  return resp.json();
}

async function createChapter(storyId, payload, { signal } = {}) {
  return jsonFetch(`/api/stories/${storyId}/chapters`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
    signal,
  });
}

export const ChapterCreation = () => {
  const { id } = useParams(); 
  const storyId = Number(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!storyId) { setLoading(false); return; }
      try {
        const list = await jsonFetch(`/api/stories/${storyId}/chapters`);
        const nums = Array.isArray(list) ? list.map(c => Number(c.number) || 0) : [];
        const next = (nums.length ? Math.max(...nums) : 0) + 1;
        if (!ignore) setNumber(String(next));
      } catch (e) {
        if (!ignore) setErr(String(e.message || e));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [storyId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!storyId) return setErr("invalid Route: missing story ID.");
    const chapterTitle = title.trim();
    const chapterBody = content.trim();
    const chapterNumber = Number(number);

    if (!chapterTitle || !chapterBody || !chapterNumber) {
      return setErr("All fields are mandatory.");
    }
    if (chapterNumber < 1 || !Number.isInteger(chapterNumber)) {
      return setErr("Chapter number must be a positive integer.");
    }
    if (chapterBody.length > 600) {
      return setErr("Content exceeds 600 characters.");
    }

    setSubmitting(true);
    try {
      await createChapter(storyId, {
        title: chapterTitle,
        number: chapterNumber,
        content: chapterBody,
        status,
      });
      navigate(`/story/${storyId}`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">New Chapter</h2>
            <Link to={`/story/${storyId}`} className="btn btn-outline-secondary btn-sm">
              Back to story
            </Link>
          </div>

          {err && <div className="alert alert-danger">{err}</div>}
          {loading && <div className="text-muted">Cargando…</div>}

          {!loading && (
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="chapterTitle" className="form-label">Chapter Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="chapterTitle"
                  placeholder="Enter your chapter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="chapterNumber" className="form-label">Chapter Number</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className="form-control"
                    id="chapterNumber"
                    placeholder="1"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="chapterStatus" className="form-label">Status</label>
                  <select
                    id="chapterStatus"
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT")}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>

              <div className="mb-3 mt-3">
                <label htmlFor="chapterBody" className="form-label">Chapter Body</label>
                <textarea
                  className="form-control"
                  id="chapterBody"
                  rows={10}
                  placeholder="Start writing your story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={600}
                  required
                />
                <div className="form-text">{content.length}/600</div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Creating…" : "Create Chapter"}
                </button>
                <Link to={`/story/${storyId}`} className="btn btn-outline-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};