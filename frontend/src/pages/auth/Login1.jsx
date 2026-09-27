import PageIllustration from "../../components/common/PageIllustration.jsx";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../services/api.js";
import { getDashboardPathForUser, login } from "../../services/authApi.js";

const inputWrapClass =
  "flex min-h-12 items-center gap-3 rounded-xl border border-emerald-100 bg-white px-3 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100";
const inputClass = "min-w-0 flex-1 bg-transparent text-slate-900 text-sm font-semibold outline-none";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email, password);
      navigate(getDashboardPathForUser(data.user), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-emerald-50 px-4 py-10">
      <motion.div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto grid w-full max-w-md content-center gap-5"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center"
        >
          <Link to="/" className="inline-grid justify-items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="grid h-20 w-20 place-items-center rounded-2xl bg-white p-2 shadow-lg"
            >
              <img
                src="/jasshoreExpert.png"
                alt="Expert Coaching Center logo"
                className="h-full w-full object-contain"
              />
            </motion.div>

            <span>
              <strong className="block text-lg font-black text-emerald-950">
                EXPERT COACHING CENTER
              </strong>
              <small className="font-bold text-slate-500">Jashore, Bangladesh</small>
            </span>
          </Link>
        </motion.div>

        <div className="card border border-emerald-100 bg-white/95 shadow-2xl backdrop-blur">
          <div className="card-body gap-5">
            <PageIllustration kind="login" className="mx-auto !h-20 !w-32" />
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="grid gap-2"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                <ShieldCheck size={18} />
                <span>Secure Login</span>
              </div>

              <h2 className="text-3xl font-black text-emerald-950">Welcome Back</h2>
              <p className="font-medium text-slate-500">Sign in to continue to your account.</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error text-sm"
              >
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
              <label className="grid gap-1 text-sm font-black text-slate-700" htmlFor="login-email">
                Email Address
                <span className={inputWrapClass}>
                  <Mail size={18} className="text-emerald-700" />
                  <input
                    id="login-email"
                    className={inputClass}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </span>
              </label>

              <label className="grid gap-1 text-sm font-black text-slate-700" htmlFor="login-password">
                Password
                <span className={inputWrapClass}>
                  <LockKeyhole size={18} className="text-emerald-700" />
                  <input
                    id="login-password"
                    className={inputClass}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="btn btn-ghost btn-xs btn-square"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-2 font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="checkbox checkbox-success checkbox-sm"
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password" className="font-black text-emerald-700 hover:text-emerald-900">
                  Forgot password?
                </Link>
              </div>

              <motion.button
                whileHover={!isLoading ? { scale: 1.01 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isLoading}
                className="btn min-h-12 border-0 bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="divider text-xs font-black text-slate-400">NEW HERE?</div>

            <p className="text-center text-sm font-semibold text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-black text-emerald-700 hover:text-emerald-900">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link className="font-bold text-slate-600 hover:text-emerald-800" to="/">
            ← Back to website
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
