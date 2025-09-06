import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

const authHeader = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const ChapterCommentForm = ({ storyId, chapterId }) => {
  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const [comments, setComments] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadAll() {
      setErr(null);
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/stories/${storyId}/chapters/${chapterId}/comments`, {
          headers: { Accept: "application/json" },
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
        const arr = await r.json();
        if (!Array.isArray(arr)) throw new Error("The response is not a list");
        if (alive) setComments(arr);

        try {
          const ru = await fetch(`${API_BASE}/api/user`, { headers: { Accept: "application/json" } });
          const ctu = ru.headers.get("content-type") || "";
          if (ru.ok && ctu.includes("application/json")) {
            const users = await ru.json();
            if (Array.isArray(users)) {
              const map = {};
              users.forEach(u => { map[u.id] = u; });
              if (alive) setUsersById(map);
            }
          }
        } catch {
        }
      } catch (e) {
        if (alive) setErr(String(e.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAll();
    return () => { alive = false; };
  }, [storyId, chapterId]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);

    const msg = text.trim();
    if (!msg) return setErr("Comment cannot be empty");
    if (msg.length > 280) return setErr("Comment cannot exceed 280 characters");

    if (!me?.id || !localStorage.getItem("token")) {
      return setErr("You must be logged in to comment.");
    }

    setPosting(true);
    try {
      const r = await fetch(`${API_BASE}/api/stories/${storyId}/chapters/${chapterId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({ text: msg }),
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

      const created = await r.json();
      setComments(prev => [created, ...prev]);
      setText("");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      {!me?.id ? (
        <div className="alert alert-info">
          You must <Link to="/login" className="alert-link">sign in</Link> to leave a comment.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mb-3">
          {err && <div className="alert alert-danger mb-3">Error: {err}</div>}

          <label className="form-label">Add a comment</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Be kind and keep it under 280 characters…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            disabled={posting}
            required
          />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">{text.length}/280</small>
            <button className="btn btn-primary" type="submit" disabled={posting}>
              {posting ? "Posting…" : "Post comment"}
            </button>
          </div>
        </form>
      )}

      <hr />

      {loading && <div className="text-muted">Loading comments…</div>}

      {!loading && comments.length === 0 && (
        <div className="text-muted">No comments yet</div>
      )}

      {!loading && comments.length > 0 && (
        <ul className="list-group">
          {comments.map((c) => {
            const author = usersById[c.user_id];
            const name = author?.display_name || `User #${c.user_id}`;
            return (
              <li key={c.id} className="list-group-item">
                <div className="d-flex justify-content-between">
                  <strong>{name}</strong>
                  <small className="text-muted">{c.created_at}</small>
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{c.text}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};