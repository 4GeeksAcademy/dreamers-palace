import { Link } from "react-router-dom";

export const ChapterCreation = () => {
    return (
        <div className="container my-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="mb-4">New Chapter</h2>
          <form>
            <div className="mb-3">
              <label for="chapterTitle" className="form-label">Chapter Title</label>
              <input
                type="text"
                className="form-control"
                id="chapterTitle"
                placeholder="Enter your chapter title"
                required
              />
            </div>
            <div className="mb-3">
              <label for="chapterBody" className="form-label">Chapter Body</label>
              <textarea
                className="form-control"
                id="chapterBody"
                rows="10"
                placeholder="Start writing your story..."
                required
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </div>
    )
}