import { Link } from "react-router-dom";

export const StoryCreation = () => {
    return (
        <div className="container-xxl my-4">
            <div className="row g-3">
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-12 col-md-8">
                                    <label className="form-label">Story title</label>
                                    <input type="text" id="storyTitle" className="form-control form-control-lg" placeholder="Give your story a title…" />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label">Category</label>
                                    <select id="category" className="form-select">
                                        <option>Fantasy</option>
                                        <option>Romance</option>
                                        <option>Adventure</option>
                                        <option>Historical</option>
                                        <option>Horror</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="form-label">Tags</label>
                                <div className="d-flex flex-wrap gap-2 mb-2" id="tagsList"></div>
                                <input type="text" id="tagInput" className="form-control" placeholder="Type a tag and press Enter" />
                            </div>
                            <div className="mt-3">
                                <label className="form-label">Cover</label>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <input className="form-control" type="file" id="coverInput" accept="image/*" />
                                        <div className="form-text">Recommended 512×800px (portrait).</div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <img id="coverPreview" className="cover-preview d-none" alt="Cover preview" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-4 right-rail">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h6 className="mb-3">Story settings</h6>
                            <div className="mb-3">
                                <label className="form-label">Visibility</label>
                                <select className="form-select" id="visibility">
                                    <option>Public</option>
                                    <option>Private</option>
                                    <option>Unlisted</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Language</label>
                                <select className="form-select">
                                    <option>English</option>
                                    <option selected>Spanish</option>
                                    <option>Portuguese</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Synopsis</label>
                                <textarea className="form-control" rows="4" placeholder="A short summary…"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}