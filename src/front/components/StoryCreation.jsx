import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    throw new Error(`Non JSON response (${ct}). Inicio: ${text.slice(0, 160)}`);
  }
  return resp.json();
}

async function createStory(payload, { signal } = {}) {
  return jsonFetch(`/api/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
    signal,
  });
}

async function publishStory(storyId, { signal } = {}) {
  return jsonFetch(`/api/stories/${storyId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ status: "PUBLISHED" }),
    signal,
  });
}

export const StoryCreation = () => {
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [visibility, setVisibility] = useState("draft");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const [image, setImage] = useState(null)

  const uploadImageToCloudinary = async (evt) => {
    
    evt.preventDefault()
    const imageForm = new FormData()
    imageForm.append("file",image)
    imageForm.append("upload_preset", "Dreamers Palace") 

    const resp = await fetch('https://api.cloudinary.com/v1_1/dkcyznoxl/image/upload', {
      method: 'POST',
      body: imageForm
    })
    const data = await resp.json()
        if (data.secure_url) {
          setImageUrl(data.secure_url); // Guarda la URL subida
          console.log("Uploaded image URL:", data.secure_url);
  }
};

  useEffect(() => {
    (async () => {
      try {
        const data = await jsonFetch(`/api/categories`);
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
      } catch (e) {
        setErr(prev => prev || String(e.message || e));
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    const storytitle = title.trim();
    const storysynopsis = synopsis.trim();
    const category_id = categoryId ? Number(categoryId) : undefined;
    const tags =
      tagsInput
        .split(",")
        .map(t => t.trim())
        .filter(Boolean); 

    if (!storytitle) return setErr("Title is required");
    if (storysynopsis.length > 200) return setErr("Synopsis cannot exceed 200 characters");

    setSubmitting(true);
    try {
      const created = await createStory({
        title: storytitle,
        synopsis: storysynopsis,
        category_id,
        tags,
      });

      if (visibility === "published") {
        await publishStory(created.id);
      }
      navigate(`/story/${created.id}`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <div className="container-xxl my-4">
      
      <div>
                  <label htmlFor="exampleFormControlTextarea1" className="form-label">
                    Insert Image
                  </label>
                  <input type="file" onChange={ evt => setImage(evt.target.files[0])} />
                    {
                      image &&
                      <img src={URL.createObjectURL(image)} alt="" style={{ maxHeight: '250px' , maxWidth: '250px' }} />
                    }
                    {
                      image &&
                      <button onClick={() =>setImage(null)}>Clear Image </button>
                    }
                    {
                      image &&
                      <button onClick={(evt) => uploadImageToCloudinary(evt)}>
                        Upload Image
                      </button>
                    }
                </div>

      <form onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body">
                {err && <div className="alert alert-danger mb-3">{err}</div>}
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Story title</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Give your story a title…"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value=""> None </option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Visibility</label>
                    <select
                      className="form-select"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value === "published" ? "published" : "draft")}
                    >
                      <option value="published">Public</option>
                      <option value="draft">Private (Draft)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label">Synopsis</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="A short summary… (máx 200)"
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    maxLength={200}
                    required
                  />
                  <div className="form-text">{synopsis.length}/200</div>
                </div>

                <div className="mt-3">
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. fantasy, medieval, dragons"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                  <div className="form-text">
                    Separa con comas. Ej: <em>fantasy, medieval, dragons</em>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4 right-rail">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-grid">
                  <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "Creando…" : "Crear historia"}
                  </button>
                </div>
                <div className="form-text mt-2">
                  You can choose to publish the story or keep it as a draft.
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};