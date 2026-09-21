import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import SEO from "../../components/common/SEO.jsx";
import { getApiErrorMessage } from "../../services/api.js";
import { login } from "../../services/authApi.js";
import "./admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(form.email.trim(), form.password);
      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <SEO title="Admin Login" />
      <section className="admin-login-card">
        <Link className="admin-login-brand" to="/">
          <img src="/jasshoreExpert.png" alt="Expert Coaching Center logo" />
          <span><strong>EXPERT COACHING CENTER</strong><small>Backend Admin Panel</small></span>
        </Link>
        <div className="admin-login-heading">
          <ShieldCheck />
          <div><h1>Admin Login</h1><p>Sign in with your Django backend account.</p></div>
        </div>
        {error && <p className="admin-alert">{error}</p>}
        <form onSubmit={submit} className="admin-login-form">
          <label>Email Address<div><Mail size={18} /><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="expertjashore@gmail.com" /></div></label>
          <label>Password<div><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <button className="admin-login-submit" disabled={loading}>
            {loading ? "Signing in..." : "Login to Dashboard"}
          </button>
        </form>
        <p className="admin-login-note">Connected to the Django REST backend.</p>
      </section>
    </main>
  );
}
