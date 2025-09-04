import examplecover from "../assets/img/dragon_cover.jpg";

export const Visitor = () => {
  const showWarning = () => {
    alert("Hey! If you'd like to access these features you should make an account");
  };

  return (
    <div className="container-fluid" style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      >
        <div
          onClick={showWarning}
          style={{
            width: "16.6667%", 
            height: "400px",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "auto", 
            cursor: "pointer",
            position: "sticky",
            top: 0,
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              color: "red",
              fontWeight: "bold",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            To access this feature you must login
          </div>
        </div>
      </div>

      <div className="row">
        <aside
          className="col-12 col-md-3 col-lg-2 p-3 rounded-3 bg-white"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          <div className="card my-3 sidebar-card">
            <div className="card-body">
              <h5 className="card-title">Recently Viewed</h5>
              <ul className="list-unstyled mb-0">
                <li>Story 1</li>
                <li>Story 2</li>
                <li>Story 3</li>
              </ul>
            </div>
          </div>

          <div className="card sidebar-card">
            <div className="card-body">
              <h5 className="card-title">Categories</h5>
              <ul className="list-unstyled mb-0">
                <li>Fiction</li>
                <li>Romance</li>
                <li>Historical</li>
              </ul>
            </div>
          </div>
        </aside>

        <section
          className="col-12 col-md-9 col-lg-10"
          style={{ paddingTop: "2rem", paddingBottom: "100px", position: "relative" }}
        >
          <div className="bg-white rounded-3 p-3">
            <div className="row g-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  className="col-12 col-md-6"
                  key={i}
                >
                  <div className="card h-100">
                    <div className="row g-0 h-100">
                      <div className="col-12 col-md-4">
                        <img
                          src={examplecover}
                          alt="Cover"
                          className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="col-12 col-md-8 d-flex flex-column">
                        <div className="card-body flex-grow-1">
                          <h5 className="card-title text-danger">Story Title</h5>
                          <p className="text-success mb-1">Genre</p>
                          <p className="card-text">Sinopsis</p>
                          <p className="card-text mb-1">0 comments</p>
                          <p className="card-text mb-2">0 views</p>
                          <p className="card-text">
                            <small className="text-body-secondary">Last updated today</small>
                          </p>
                          <a href="#" className="me-2">Tag1</a>
                          <a href="#" className="me-2">Tag2</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-4 text-danger fw-bold">
            To further access the site functions you must have an account
          </div>

          <div
            onClick={showWarning} 
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "30px", 
              backgroundColor: "transparent",
              cursor: "pointer",
              zIndex: 1000,
            }}
          />
        </section>
      </div>
    </div>
  );
};
