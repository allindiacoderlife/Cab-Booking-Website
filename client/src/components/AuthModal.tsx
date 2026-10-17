import { useState } from "react";
import { useAuth, type UserRole } from "../context/AuthContext";
import { X, ArrowRight, ShieldCheck, Mail, Lock, User, Phone, Car } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const { loginGoogle, loginEmail, signupEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [role, setRole] = useState<UserRole>("RIDER");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    await loginGoogle(role);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      await loginEmail(email || "rider@example.com", password || "pass123", role);
    } else {
      await signupEmail(
        fullName || "New Uber User",
        email || "new@example.com",
        password || "pass123",
        phone || "+91 98765 00000",
        role
      );
    }
    setLoading(false);
    onClose();
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    if (demoRole === "DRIVER") {
      loginEmail("david.chen@driver.uber.com", "pass", "DRIVER");
    } else {
      loginEmail("alex.morgan@rider.uber.com", "pass", "RIDER");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-black border border-neutral-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition text-neutral-500 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Uber Wordmark */}
        <div className="text-2xl font-black tracking-tighter mb-4 text-black">Uber</div>

        <h2 className="text-2xl font-black text-black tracking-tight mb-2">
          {mode === "login" ? "What's your phone number or email?" : "Sign up with Uber"}
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          Access your rides, earnings, and trip receipts with Supabase authentication.
        </p>

        {/* Role Selector: Rider vs Driver */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-100 mb-5">
          <button
            type="button"
            onClick={() => setRole("RIDER")}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              role === "RIDER" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Rider
          </button>
          <button
            type="button"
            onClick={() => setRole("DRIVER")}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              role === "DRIVER" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            Driver Partner
          </button>
        </div>

        {/* Continue with Google (Prominent Official Google Auth Button) */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleAuth}
          className="w-full py-3.5 px-4 rounded-xl border border-neutral-300 hover:border-black bg-white font-bold text-xs flex items-center justify-center gap-3 transition shadow-sm mb-4"
        >
          {/* Official Google 'G' icon */}
          <svg className="h-4 w-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
            or
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
                  className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-transparent focus:border-black text-xs font-semibold text-black placeholder-neutral-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (+91)"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-transparent focus:border-black text-xs font-semibold text-black placeholder-neutral-500 focus:outline-none"
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
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-transparent focus:border-black text-xs font-semibold text-black placeholder-neutral-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-transparent focus:border-black text-xs font-semibold text-black placeholder-neutral-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg mt-2"
          >
            <span>{mode === "login" ? "Continue" : "Create Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Shortcuts */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2">
            Instant Test Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("RIDER")}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold transition flex items-center justify-center gap-1"
            >
              <User className="h-3 w-3" /> Alex (Rider)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("DRIVER")}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold transition flex items-center justify-center gap-1"
            >
              <Car className="h-3 w-3" /> David (Driver)
            </button>
          </div>
        </div>

        {/* Switch mode */}
        <div className="mt-4 text-center text-xs text-neutral-500">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="font-bold text-black hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-bold text-black hover:underline"
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
