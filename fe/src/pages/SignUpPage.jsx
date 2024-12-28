import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCaptchaStore } from "../store/useCaptchaStore";
import { Eye, EyeOff, Loader2, Lock, MessageSquare, User, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    captchaValue: "",
  });

  const { signup, isSigningUp } = useAuthStore();
  const { captcha, fetchCaptcha, isLoading } = useCaptchaStore();

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const validateForm = () => {
    if (!formData.username.trim()) return toast.error("Username is required");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 3) return toast.error("Password must be at least 3 characters");
    if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");
    if (!formData.captchaValue) return toast.error("CAPTCHA is required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      const signupSuccess = await signup({
        username: formData.username,
        password: formData.password,
        captchaId: captcha.id,
        captchaValue: formData.captchaValue,
      });

      if (!signupSuccess) {
        // Clear form data and refresh CAPTCHA on failure
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          captchaValue: "",
        });
        fetchCaptcha();
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 sm:mt-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="anjaymabar"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">CAPTCHA</span>
              </label>
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <div className="w-[200px] h-[50px] bg-base-200 animate-pulse"></div>
                ) : (
                  <div className="bg-white" dangerouslySetInnerHTML={{ __html: captcha.svg }} />
                )}
                <button type="button" onClick={fetchCaptcha} className="btn btn-square btn-sm" disabled={isLoading}>
                  <RefreshCw className="size-4" />
                </button>
              </div>
              <input
                type="text"
                className="input input-bordered w-full mt-2"
                placeholder="Enter CAPTCHA"
                value={formData.captchaValue}
                onChange={(e) => setFormData({ ...formData, captchaValue: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
            <p className="text-base-content/60">
              About the <Link to="https://github.com/Schutz3">dev</Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}
      <AuthImagePattern
        title="Register for free"
        subtitle="Register today and forget about spammy emails and advertisements."
      />
    </div>
  );
};

export default SignUpPage;