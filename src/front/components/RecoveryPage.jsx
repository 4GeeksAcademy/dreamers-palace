import { Link } from "react-router-dom";
import loginlogo from "../assets/img/Logotipo Color.png"

export const Recovery = () => {
    return (
        <main className="d-flex flex-column justify-content-center align-items-center min-vh-90 mt-5">

  <img src={loginlogo} alt="Dreamers Palace" className="mb-4" style={{maxWidth: "300px", height: "auto"}}/>

  <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow">
          <div className="card-body">
            <h3 className="card-title text-center mb-4">Entry Permit Recovery</h3>
            <form>
                <div className="mb-3">
                 <label for="emailSelect" className="form-label">Select that which you need to recover</label>
                    <select className="form-select" id="emailSelect" required>
                        <option value="" disabled selected>Choose an option</option>
                        <option value="user1@example.com">Email</option>
                        <option value="user1@example.com">Password</option>
                    </select>
                </div>
              <div className="mb-3">
                <label for="password" className="form-label">Recovery Email</label>
                <input type="password" className="form-control" id="email" placeholder="Recovery@email.com" required />
                    <div className="d-grid mt-4">
                        <button type="submit" a href="Recovery Code" className="btn btn-primary">Send recovery code</button>
                        </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
    )
}