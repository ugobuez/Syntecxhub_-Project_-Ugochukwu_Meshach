/**
 * Login page.
 * Client-side validation + toast feedback, then JWT login via the API.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) =>
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));

  const validate = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) return "Please enter a valid email address";
    if (!formData.password) return "Password is required";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: formData.email.trim().toLowerCase(), password: formData.password });
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue tracking your finances"
      footerText="Don't have an account?"
      footerLinkTo="/signup"
      footerLinkLabel="Sign up"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input-field pl-10"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange("email")}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link
              to="/signup"
              className="mb-1.5 text-xs font-medium text-primary-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="input-field pl-10 pr-11"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          <LogIn size={16} />
          {submitting ? "Logging in…" : "Log In"}
        </button>
      </form>
    </AuthLayout>
  );
}
