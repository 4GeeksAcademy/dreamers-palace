import { Link } from "react-router-dom"
import examplecover from "../assets/img/dragon_cover.jpg"

export const Timeline = () => {
  return (
    <div>
      <main className="container-fluid">
        <div className="row g-3 mt-3">
          <aside className="col-12 col-md-3 col-lg-2 p-3 rounded-3 bg-white">
            <div className="card my-3 sidebar-card">
              <div className="card-body">
                <h5 className="card-title">Recently Viewed</h5>
                <ul className="list-unstyle mb-0">
                  <li>Story 1</li>
                  <li>Story 2</li>
                  <li>Story 3</li>
                </ul>
              </div>
            </div>

            <div className="card sidebar-card">
              <div className="card-body">
                <h5 className="card-title">Categories</h5>
                <ul className="card-list mb-0">
                  <li>Fiction</li>
                  <li>Romance</li>
                  <li>Historical</li>
                </ul>
              </div>
            </div>
          </aside>

          <section className="col-12 col-md-9 col-lg-10">
            <div className="bg-white rounded-3 p-3">
              <div className="card mb-4 mx-auto" style={{ maxWidth: "720px" }}>
                <div className="row g-0">
                  <div className="col-12 col-md-4">
                    <img
                      src={examplecover}
                      className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                      alt="cover"
                    />
                  </div>
                  <div className="col-12 col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">Dragon Story</h5>
                      <p className="card-text">Sinopsis 150 - 200 characters</p>
                      <p className="card-text mb-1">#Comments</p>
                      <p className="card-text mb-2">#Views</p>
                      <p className="card-text">
                        <small className="text-body-secondary">
                          Last updated 3 mins ago
                        </small>
                      </p>
                      <a href="#" className="me-2">Fantasy</a>
                      <a href="#">Medieval</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mb-4 mx-auto" style={{ maxWidth: "720px" }}>
                <div className="row g-0">
                  <div className="col-12 col-md-4">
                    <img
                      src={examplecover}
                      className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                      alt="cover"
                    />
                  </div>
                  <div className="col-12 col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">Dragon Story</h5>
                      <p className="card-text">Sinopsis 150 - 200 characters</p>
                      <p className="card-text mb-1">#Comments</p>
                      <p className="card-text mb-2">#Views</p>
                      <p className="card-text">
                        <small className="text-body-secondary">
                          Last updated 3 mins ago
                        </small>
                      </p>
                      <a href="#" className="me-2">Fantasy</a>
                      <a href="#">Medieval</a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};