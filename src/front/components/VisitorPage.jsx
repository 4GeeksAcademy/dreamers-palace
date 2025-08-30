import examplecover from "../assets/img/dragon_cover.jpg";

export const Visitor = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Lateral izquierdo */}
        <div className="col-1 d-flex align-items-center justify-content-center">
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              color: "red",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            To access this feature you must login
          </div>
        </div>

        {/* Contenido principal */}
        <div
          className="col-11"
          style={{ paddingTop: "2rem", paddingBottom: "100px" }}
        >
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="col" key={i}>
                <div className="card h-100 d-md-flex flex-md-row">
                  <div className="w-100 w-md-50">
                    <img
                      src={examplecover}
                      alt="Cover"
                      className="img-fluid h-100 object-fit-cover rounded-start"
                    />
                  </div>
                  <div className="w-100 w-md-50 p-3">
                    <h5 className="card-title text-danger">Story Title</h5>
                    <p className="text-success mb-1">Genre</p>
                    <p className="card-text">Sinopsis</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4 text-danger fw-bold">
            To further access the site functions you must have an account
          </div>

        </div>
      </div>
    </div>
  );
};

