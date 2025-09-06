import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChapterCommentForm } from "./ChapterCommentForm";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "");

export const ChapterReader = () => {
  const { id, chapterId } = useParams();
  const storyId = useMemo(() => Number(id), [id]);
  const chapId = useMemo(() => Number(chapterId), [chapterId]);

  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapter, setChapter] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!storyId || !chapId) {
      setErr("Invalid route: missing story or chapter ID.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const sResp = await fetch(`${API_BASE}/api/stories/${storyId}`, {
          headers: { Accept: "application/json" },
        });
        const sCt = sResp.headers.get("content-type") || "";
        if (!sResp.ok) {
          const text = await sResp.text().catch(() => "");
          throw new Error(`HTTP ${sResp.status} — ${text.slice(0, 160)}`);
        }
        if (!sCt.includes("application/json")) {
          const text = await sResp.text().catch(() => "");
          throw new Error(`Non JSON response (${sCt}). Start: ${text.slice(0, 160)}`);
        }
        const sData = await sResp.json();
        setStory(sData);

        const cResp = await fetch(`${API_BASE}/api/stories/${storyId}/chapters`, {
          headers: { Accept: "application/json" },
        });
        const cCt = cResp.headers.get("content-type") || "";
        if (!cResp.ok) {
          const text = await cResp.text().catch(() => "");
          throw new Error(`HTTP ${cResp.status} — ${text.slice(0, 160)}`);
        }
        if (!cCt.includes("application/json")) {
          const text = await cResp.text().catch(() => "");
          throw new Error(`Non JSON response (${cCt}). Start: ${text.slice(0, 160)}`);
        }
        const raw = await cResp.json();
        const list = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? raw?.results ?? []);
        const activeOnly = list.filter(c => !c.deleted_at);
        if (!Array.isArray(list)) throw new Error("The response is not a list");

        const sorted = [...list].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
        setChapters(sorted);

        const found = sorted.find(ch => Number(ch.id) === chapId);
        setChapter(found || null);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [storyId, chapId]);

  const { prevChapter, nextChapter } = useMemo(() => {
    if (!chapter || !Array.isArray(chapters) || chapters.length === 0) {
      return { prevChapter: null, nextChapter: null };
    }
    const idx = chapters.findIndex(c => Number(c.id) === chapId);
    return {
      prevChapter: idx > 0 ? chapters[idx - 1] : null,
      nextChapter: idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null,
    };
  }, [chapter, chapters, chapId]);

  return (
    <div className="container-xxl my-4">
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              {loading && (
                <div className="text-center py-5">Loading chapter</div>
              )}

              {err && (
                <div className="alert alert-danger" role="alert">
                  Error loading chapter: {err}
                </div>
              )}

              {!loading && !err && !chapter && (
                <div className="text-center text-muted py-5">
                  Chapter not found.
                </div>
              )}

              {!loading && !err && chapter && (
                <>
                  <div className="mb-3">
                    <Link to={`/story/${storyId}`} className="text-decoration-none">
                      ← Back to story
                    </Link>
                  </div>

                  <h1 className="h3 mb-1">
                    {chapter.title || `Chapter ${chapter.number ?? ""}`}
                  </h1>
                  <div className="text-muted mb-3">
                    {story?.title ? (
                      <>From: <Link to={`/story/${storyId}`} className="text-decoration-none">{story.title}</Link></>
                    ) : (
                      <>Story</>
                    )}
                  </div>

                  <article style={{ whiteSpace: "pre-wrap" }}>
                    {chapter.content || "No content."}
                  </article>

                  <hr className="my-4" />

                  <div className="d-flex justify-content-between">
                    <div>
                      {prevChapter && (
                        <Link
                          to={`/story/${storyId}/chapters/${prevChapter.id}`}
                          className="btn btn-outline-secondary"
                        >
                          ← Previous
                        </Link>
                      )}
                    </div>
                    <div>
                      {nextChapter && (
                        <Link
                          to={`/story/${storyId}/chapters/${nextChapter.id}`}
                          className="btn btn-primary"
                        >
                          Next →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Comentarios por capítulo */}
                  <div className="card shadow-sm mt-4">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Comments</h5>
                      {/* 👇 Asegúrate de pasar storyId y chapterId */}
                      <ChapterCommentForm storyId={storyId} chapterId={chapId} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Chapters</h5>

              {loading && (
                <div className="text-muted">Loading chapters…</div>
              )}

              {!loading && !err && chapters.length === 0 && (
                <div className="text-muted">There are no chapters yet</div>
              )}

              {!loading && !err && chapters.length > 0 && (
                <ol className="list-group list-group-numbered">
                  {chapters.map((c) => {
                    const active = Number(c.id) === chapId;
                    return (
                      <li
                        key={c.id}
                        className={`list-group-item d-flex justify-content-between align-items-start ${active ? "active" : ""}`}
                        aria-current={active ? "true" : undefined}
                      >
                        <div className="ms-2 me-auto">
                          <div className={`fw-semibold ${active ? "text-white" : ""}`}>
                            <Link
                              to={`/story/${storyId}/chapters/${c.id}`}
                              className={`text-decoration-none ${active ? "text-white" : ""}`}
                            >
                              {c.title || `Chapter ${c.number ?? ""}`}
                            </Link>
                          </div>
                          {!active && (
                            <small className="text-muted">
                              {c.number != null ? `#${c.number}` : ""}
                            </small>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};