import { Link } from "react-router-dom";
import loginlogo from "../assets/img/Logotipo Color.png"
export const Login = () =>{
    return (
        <main className="d-flex flex-column justify-content-center align-items-center min-vh-90 mt-5">

  <img src={loginlogo} alt="Dreamers Palace" className="mb-4" style={{maxWidth: "300px", height: "auto"}}/>

  <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow">
          <div className="card-body">
            <h3 className="card-title text-center mb-4">Entry Permit Verification</h3>
            <form>
              <div className="mb-3">
                <label for="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" placeholder="Example@mail.com" required />
              </div>
              <div className="mb-3">
                <label for="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" placeholder="Password" required />
              </div>
                <div className="mb-3 d-flex flex-column">
                  <a href="credentialRecovery.html" className="mb-2">¿Forgot your Password?</a>
                  <a href="register.html">¿You don't have an Entry Permit? Register</a>              
                 </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">Enter the Palace</button>
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