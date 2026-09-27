import PageIllustration from "../../components/common/PageIllustration.jsx";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { WarpFieldBackground } from "../../shaders/warp-field/WarpFieldBackground";
import "../../shaders/threeui.css";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../services/api.js";
import { register } from "../../services/authApi.js";

const inputWrapClass =
  "flex min-h-12 items-center gap-3 rounded-xl border border-emerald-100 bg-white px-3 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100";
const inputClass = "min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none";
const labelClass = "grid gap-1 text-sm font-black text-slate-700";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password,
      });
      setSuccess("Account created. Please sign in.");
      setTimeout(() => navigate("/login"), 700);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to create account."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-white px-4 py-10">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-white" aria-hidden="true">
        <WarpFieldBackground
          className="h-full w-full opacity-[0.16]"
          variant="letters"
          speed={15.0}
          streakOpacity={0.60}
          tileOpacity={0.90}
          fov={75}
          hue={0}
          saturation={1.00}
          brightness={1.00}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto grid w-full max-w-2xl content-center gap-5"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center"
        >
          <Link to="/" className="inline-grid justify-items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.06, rotate: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="grid h-20 w-20 place-items-center rounded-2xl bg-white p-2 shadow-lg"
            >
              <img
                src="/jasshoreExpert.png"
                alt="Jashore Expert logo"
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
            <PageIllustration kind="join" className="mx-auto !h-20 !w-32" />
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="grid gap-2"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                <UserPlus size={18} />
                <span>Create Account</span>
              </div>

              <h2 className="text-3xl font-black text-emerald-950">Join Our Community</h2>
              <p className="font-medium text-slate-500">Create your account to access our services.</p>
            </motion.div>

            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success text-sm">
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Full Name
                  <span className={inputWrapClass}>
                    <User size={17} className="text-emerald-700" />
                    <input
                      className={inputClass}
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </span>
                </label>

                <label className={labelClass}>
                  Phone
                  <span className={inputWrapClass}>
                    <Phone size={17} className="text-emerald-700" />
                    <input
                      className={inputClass}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </span>
                </label>
              </div>

              <label className={labelClass}>
                Email Address
                <span className={inputWrapClass}>
                  <Mail size={17} className="text-emerald-700" />
                  <input
                    className={inputClass}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </span>
              </label>

              <label className={labelClass}>
                Account Type
                <select
                  className="select select-bordered w-full border-emerald-100 font-semibold"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="parent">Parent / Guardian</option>
                  <option value="teacher">Teacher</option>
                </select>
              </label>

              <label className={labelClass}>
                Password
                <span className={inputWrapClass}>
                  <LockKeyhole size={17} className="text-emerald-700" />
                  <input
                    className={inputClass}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <label className={labelClass}>
                Confirm Password
                <span className={inputWrapClass}>
                  <LockKeyhole size={17} className="text-emerald-700" />
                  <input
                    className={inputClass}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <label className="flex gap-3 text-sm font-semibold text-slate-600">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  className="checkbox checkbox-success checkbox-sm mt-0.5"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="font-black text-emerald-700 hover:text-emerald-900">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="font-black text-emerald-700 hover:text-emerald-900">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="divider text-xs font-black text-slate-400">ALREADY REGISTERED?</div>

            <p className="text-center text-sm font-semibold text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-black text-emerald-700 hover:text-emerald-900">
                Sign in
              </Link>
            </p>

            <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Secure registration
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Privacy protected
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link className="font-bold text-slate-600 hover:text-emerald-800" to="/">
            ← Back to website
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
