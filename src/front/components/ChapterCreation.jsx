import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const ct = resp.headers.get("content-type") || "";
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    if (resp.status === 401) throw new Error("Unauthorized, please log in");
    throw new Error(`HTTP ${resp.status} — ${text.slice(0, 160)}`);
  }
  if (!ct.includes("application/json")) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Non JSON Response(${ct}). Start: ${text.slice(0, 160)}`);
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

  const [activeTab, setActiveTab] = useState("edit");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const textareaRef = useRef(null);

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

  const insertAroundSelection = (before, after = "", placeholder = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const hasSelection = start !== end;
    const selected = content.slice(start, end);
    const inner = hasSelection ? selected : placeholder;
    const next = content.slice(0, start) + before + inner + after + content.slice(end);
    setContent(next);

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + inner.length + (hasSelection ? 0 : 0);
      el.setSelectionRange(cursor, cursor);
    });
  };

  const insertPrefixOnLine = (prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    const before = content.slice(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    const next =
      content.slice(0, lineStart) +
      prefix +
      content.slice(lineStart);

    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const delta = prefix.length;
      el.setSelectionRange(start + delta, end + delta);
    });
  };

  const onBold = () => insertAroundSelection("**", "**", "bold text");
  const onItalic = () => insertAroundSelection("*", "*", "italic text");
  const onStrike = () => insertAroundSelection("~~", "~~", "strikethrough");
  const onCodeInline = () => insertAroundSelection("`", "`", "code");
  const onCodeBlock = () => insertAroundSelection("\n```\n", "\n```\n", "code block");
  const onQuote = () => insertPrefixOnLine("> ");
  const onH1 = () => insertPrefixOnLine("# ");
  const onH2 = () => insertPrefixOnLine("## ");
  const onH3 = () => insertPrefixOnLine("### ");
  const onUl = () => insertPrefixOnLine("- ");
  const onOl = () => insertPrefixOnLine("1. ");
  const onLink = () => insertAroundSelection("[", "](https://)", "link text");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!storyId) return setErr("Invalid Route: missing story ID.");
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
          {loading && <div className="text-muted">Loading…</div>}

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

              <ul className="nav nav-tabs mt-4">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "edit" ? "active" : ""}`}
                    onClick={() => setActiveTab("edit")}
                  >
                    Edit
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "preview" ? "active" : ""}`}
                    onClick={() => setActiveTab("preview")}
                  >
                    Preview
                  </button>
                </li>
              </ul>

              {activeTab === "edit" && (
                <div className="d-flex flex-wrap gap-2 mt-3 mb-2">
                  <button type="button" className="btn btn-sm btn-light" onClick={onBold}><strong>B</strong></button>
                  <button type="button" className="btn btn-sm btn-light" onClick={onItalic}><em>I</em></button>
                  <button type="button" className="btn btn-sm btn-light" onClick={onStrike}><span style={{textDecoration:"line-through"}}>S</span></button>
                  <span className="vr" />
                  <button type="button" className="btn btn-sm btn-light" onClick={onH1}>H1</button>
                  <button type="button" className="btn btn-sm btn-light" onClick={onH2}>H2</button>
                  <button type="button" className="btn btn-sm btn-light" onClick={onH3}>H3</button>
                  <span className="vr" />
                  <button type="button" className="btn btn-sm btn-light" onClick={onUl}>• List</button>
                  <button type="button" className="btn btn-sm btn-light" onClick={onOl}>1. List</button>
                  <span className="vr" />
                  <button type="button" className="btn btn-sm btn-light" onClick={onQuote}>&gt; Quote</button>
                  <button type="button" className="btn btn-sm btn-light" onClick={onLink}>Link</button>
                  <button type="button" className="btn btn-sm btn-light" onClick={onCodeInline}>`code`</button>
                  <button type="button" className="btn btn-sm btn-light" onClick={onCodeBlock}>``` code</button>
                </div>
              )}

              {activeTab === "edit" ? (
                <div className="mb-3">
                  <label htmlFor="chapterBody" className="form-label">Chapter Body</label>
                  <textarea
                    ref={textareaRef}
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
              ) : (
                <div className="mb-3 mt-3">
                  <div className="border rounded p-3 bg-light" style={{ minHeight: 200 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || "*Nothing to preview…*"}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

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