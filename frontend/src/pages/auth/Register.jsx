import PageIllustration from "../../components/common/PageIllustration.jsx";

import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";


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
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-8 sm:px-6 lg:px-10">
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-white"
        aria-hidden="true"
      >
        <div className="h-full w-full bg-gradient-to-br from-emerald-50 via-white to-amber-50" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-2xl place-items-center">
        <motion.section
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div className="w-full">
            {/* Logo + SVG moved to the right-side registration column */}
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55, ease: "easeOut" }}
              className="mb-5 flex flex-col items-center gap-3"
            >
              <Link
                to="/"
                className="inline-flex flex-col items-center gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.06, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="grid h-20 w-20 place-items-center rounded-2xl bg-white/80 p-2 shadow-lg backdrop-blur-sm"
                >
                  <img
                    src="/jasshoreExpert.png"
                    alt="Jashore Expert logo"
                    className="h-full w-full object-contain"
                  />
                </motion.div>

                <span className="text-center">
                  <strong className="block text-lg font-black text-emerald-950">
                    EXPERT COACHING CENTER
                  </strong>
                  <small className="font-bold text-slate-500">
                    Jashore, Bangladesh
                  </small>
                </span>
              </Link>

              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className="flex w-full justify-center"
              >
                <PageIllustration kind="join" className="!h-20 !w-32" />
              </motion.div>
            </motion.div>

            {/* Transparent registration card */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="card border-0 bg-transparent shadow-none backdrop-blur-0"
            >
              <div className="card-body gap-5 p-0 sm:p-2 lg:p-0">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, duration: 0.48 }}
                  className="grid gap-2"
                >
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50/90 px-3 py-1 text-sm font-black text-emerald-700 backdrop-blur-sm">
                    <UserPlus size={18} />
                    <span>Create Account</span>
                  </div>

                  <h2 className="text-3xl font-black text-emerald-950">
                    Join Our Community
                  </h2>
                  <p className="font-medium text-slate-500">
                    Create your account to access our services.
                  </p>
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

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-success text-sm"
                  >
                    <span>{success}</span>
                  </motion.div>
                )}

                <motion.form
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        delayChildren: 0.28,
                        staggerChildren: 0.055,
                      },
                    },
                  }}
                  onSubmit={handleSubmit}
                  className="grid gap-4"
                >
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className="grid gap-4 sm:grid-cols-2"
                  >
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
                  </motion.div>

                  <motion.label
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className={labelClass}
                  >
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
                  </motion.label>

                  <motion.label
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className={labelClass}
                  >
                    Account Type
                    <select
                      className="select select-bordered w-full border-emerald-100 bg-white/90 font-semibold shadow-sm backdrop-blur-sm"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="student">Student</option>
                      <option value="parent">Parent / Guardian</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </motion.label>

                  <motion.label
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className={labelClass}
                  >
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
                  </motion.label>

                  <motion.label
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className={labelClass}
                  >
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
                  </motion.label>

                  <motion.label
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className="flex gap-3 text-sm font-semibold text-slate-600"
                  >
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
                      <Link
                        to="/terms"
                        className="font-black text-emerald-700 hover:text-emerald-900"
                      >
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy-policy"
                        className="font-black text-emerald-700 hover:text-emerald-900"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </motion.label>

                  <motion.button
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    whileHover={!isLoading ? { scale: 1.01 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isLoading}
                    className="btn min-h-12 border-0 bg-emerald-700 text-white shadow-lg hover:bg-emerald-800"
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
                </motion.form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.72 }}
                  className="divider text-xs font-black text-slate-400"
                >
                  ALREADY REGISTERED?
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.78 }}
                  className="text-center text-sm font-semibold text-slate-600"
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-black text-emerald-700 hover:text-emerald-900"
                  >
                    Sign in
                  </Link>
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.84 }}
                  className="flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-500"
                >
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Secure registration
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Privacy protected
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <Link
                    className="font-bold text-slate-600 hover:text-emerald-800"
                    to="/"
                  >
                    ← Back to website
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
