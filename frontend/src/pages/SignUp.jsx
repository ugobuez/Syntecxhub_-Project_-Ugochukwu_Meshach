/**
 * Sign Up page.
 * Collects name, email, password and an optional profile image (multipart).
 * Client-side validation + toast feedback, then auto-login on success.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Lock, Image as ImageIcon, UserPlus, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // must match the backend multer limit

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) =>
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));

  /** Validates and previews the selected profile image. */
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file)); // local preview only
  };

  const validate = () => {
    if (!formData.name.trim()) return "Name is required";
    if (formData.name.trim().length > 60) return "Name cannot exceed 60 characters";
    if (!formData.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) return "Please enter a valid email address";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
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
      // Backend expects multipart/form-data when an image is provided
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim().toLowerCase());
      payload.append("password", formData.password);
      if (profileImage) payload.append("image", profileImage);

      await register(payload);
      toast.success("Account created — welcome aboard!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking income and expenses in minutes"
      footerText="Already have an account?"
      footerLinkTo="/login"
      footerLinkLabel="Log in"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Profile image picker */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={22} className="text-gray-300" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Profile picture</p>
            <p className="text-xs text-gray-400">Optional · JPG, PNG or WEBP, max 5 MB</p>
            <label
              htmlFor="profile-image"
              className="mt-1 inline-block cursor-pointer rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-100"
            >
              Choose image
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <div className="relative">
            <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="input-field pl-10"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange("name")}
              maxLength={60}
            />
          </div>
        </div>

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

        {/* Password + confirm */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="input-field pl-10 pr-11"
                placeholder="Min. 8 characters"
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
          <div>
            <label htmlFor="confirm-password" className="form-label">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="input-field pl-10"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          <UserPlus size={16} />
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}
