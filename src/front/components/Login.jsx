import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginlogo from "../assets/img/Logotipo Color.png"

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "")

export const Login = () =>{
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false) 
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async(e) => {
    e.preventDefault()
    setErr(null)

    const user_email = email.trim().toLowerCase();
    const user_password = password;

    if (!user_email || !user_password){
      return setErr("All fields are required")
    }

    setSubmitting(true)
    try {
      const login = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Accept: "application/json"}, 
        body: JSON.stringify({email: user_email, password: user_password})
      })
      if (!login.ok) {
        const error = await login.text()
        throw new Error (`Login failed (HTTP ${login.status}) - ${error.slice(0,160)}`)
      }

      const data = await login.json()
      if (!data.access_token) throw new Error ("No access token returned by login")
      
      localStorage.setItem("token", data.access_token)
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user))
      
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/timeline")
    } catch (e) {
      setErr(String(e.message || e))
    } finally {
      setSubmitting(false)
    }
  }

return (
    <main className="d-flex flex-column justify-content-center align-items-center min-vh-90 mt-5">
      <img src={loginlogo} alt="Dreamers Palace" className="mb-4" style={{maxWidth: "300px", height: "auto"}}/>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body">
                <h3 className="card-title text-center mb-4">Entry Permit Verification</h3>

                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={onSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      required
                      inputMode="email"
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={()=>setShowPassword(v=>!v)}
                      >
                        {showPassword ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 d-flex flex-column">
                    <Link to="/recovery" className="mb-2">¿Forgot your Password?</Link>
                    <Link to="/register">¿You don't have an Entry Permit? Register</Link>
                  </div>

                  <div className="d-grid">
                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                      {submitting ? "Signing in…" : "Enter the Palace"}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};