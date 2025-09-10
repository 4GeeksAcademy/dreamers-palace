import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import navbarlogo from "../assets/img/Isotipo Color (1).png";

function readUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}

export const Navbar = () => {
  const [user, setUser] = useState(readUser());
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setUser(readUser());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-md glass" data-bs-theme="light">
      <div className="container-fluid">
        <Link to="/timeline" className="navbar-brand d-flex align-items-center">
          <img src={navbarlogo} alt="Logo" style={{ height: "56px" }} />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-md-0"></ul>

          <div className="d-flex align-items-center gap-2">

            {user ? (
              <>
                <Link to="/story/new" className="btn btn-primary btn-sm">
                  + Create story
                </Link>

                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary btn-sm dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    {user.display_name || "Account"}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/writerpage">My profile</Link></li>
                    <li><Link className="dropdown-item" to="/timeline">Timeline</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={onLogout}>Logout</button></li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary btn-sm">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};