import { useState } from "react";
import { useAuth, type UserRole } from "../context/AuthContext";
import { X, ArrowRight, ShieldCheck, Mail, Lock, User, Phone, Car, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const { loginGoogle, loginEmail, signupEmail, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [role, setRole] = useState<UserRole>("RIDER");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage("");
    const res = await loginGoogle(role);
    setLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    if (mode === "login") {
      const res = await loginEmail(email, password, role);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      } else {
        onClose();
      }
    } else {
      const res = await signupEmail(
        fullName,
        email,
        password,
        phone,
        role
      );
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      } else {
        onClose();
      }
    }
    setLoading(false);
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    loginAsDemo(demoRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#121217] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-neutral-500 hover:text-black dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* CabGo Wordmark */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-sm shadow-md">
            <Car className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black tracking-tight text-black dark:text-white">
            Cab<span className="text-emerald-500">Go</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-black dark:text-white tracking-tight mb-1.5">
          {mode === "login" ? "Sign in to your account" : "Create your CabGo account"}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">
          Access your rides, earnings, and trip receipts with Supabase authentication.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role Selector: Rider vs Driver */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900/90 mb-5 border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setRole("RIDER")}
            className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              role === "RIDER"
                ? "bg-white dark:bg-neutral-800 text-black dark:text-emerald-400 shadow-sm border border-neutral-200/80 dark:border-neutral-700"
                : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Rider</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("DRIVER")}
            className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              role === "DRIVER"
                ? "bg-white dark:bg-neutral-800 text-black dark:text-emerald-400 shadow-sm border border-neutral-200/80 dark:border-neutral-700"
                : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Car className="h-4 w-4" />
            <span>Driver Partner</span>
          </button>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleAuth}
          className="w-full py-3.5 px-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-emerald-500/80 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-bold text-xs flex items-center justify-center gap-3 transition shadow-sm mb-4 disabled:opacity-50 text-neutral-900 dark:text-white"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-black dark:text-white font-bold">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <span className="relative bg-white dark:bg-[#121217] px-3 text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-bold">
            or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <>
              <div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-black dark:focus:border-emerald-500 text-xs font-semibold text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none transition"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (+91 98765 43210)"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-black dark:focus:border-emerald-500 text-xs font-semibold text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none transition"
                  required
                />
              </div>
            </>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-black dark:focus:border-emerald-500 text-xs font-semibold text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-black dark:focus:border-emerald-500 text-xs font-semibold text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 transition shadow-lg mt-2 disabled:opacity-50"
          >
            <span>{loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Shortcuts for instant testing */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 block mb-2">
            One-Click Testing Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("RIDER")}
              className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px] font-bold transition flex items-center justify-center gap-1.5"
            >
              <User className="h-3.5 w-3.5 text-emerald-500" />
              <span>Demo Rider (Alex)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("DRIVER")}
              className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px] font-bold transition flex items-center justify-center gap-1.5"
            >
              <Car className="h-3.5 w-3.5 text-emerald-500" />
              <span>Demo Driver (David)</span>
            </button>
          </div>
        </div>

        {/* Switch mode */}
        <div className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-bold text-black dark:text-emerald-400 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-bold text-black dark:text-emerald-400 hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
