import { useState } from "react";
import { Sparkles, Eye, EyeOff, Loader2, User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const { error, loading, login, signup, setError } = useAuth();

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setName(""); setEmail(""); setPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === "signup" && !name.trim()) return;

    let ok = false;
    if (mode === "login") {
      ok = await login(email, password);
    } else {
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      ok = await signup(name, email, password);
    }
    if (ok) onSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* Brand header */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Luffy AI</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your BCA Co-Pilot — Powered by Gemini</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-border">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 py-3.5 text-sm font-medium transition-colors relative",
                  mode === m
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "login" ? "Sign In" : "Create Account"}
                {mode === m && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="px-6 py-7">

            {/* Welcome copy */}
            <div className="mb-6">
              <h2 className="text-base font-semibold text-foreground">
                {mode === "login" ? "Welcome back, Sir." : "Create your account"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {mode === "login"
                  ? "Sign in to continue your BCA journey."
                  : "Join Luffy AI — completely free."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name — signup only */}
              {mode === "signup" && (
                <InputField
                  label="Full Name"
                  type="text"
                  placeholder="Eg. Rahul Sharma"
                  value={name}
                  onChange={setName}
                  icon={<User className="w-4 h-4" />}
                  autoComplete="name"
                />
              )}

              <InputField
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={setEmail}
                icon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              {/* Password with show/hide */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-foreground">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder={mode === "signup" ? "Min. 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    className="w-full bg-background/60 border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <span className="shrink-0">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all shadow-lg shadow-primary/20 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Switch mode hint */}
            <p className="text-center text-[12px] text-muted-foreground">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-primary hover:underline font-medium"
              >
                {mode === "login" ? "Sign up free" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-5 mt-5">
          <TrustBadge icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Saved locally" />
          <TrustBadge icon={<Sparkles className="w-3.5 h-3.5" />} label="Gemini powered" />
          <TrustBadge icon={<User className="w-3.5 h-3.5" />} label="BCA focused" />
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Crafted by <span className="text-primary font-medium">Abhay Sir & Dipanshu Sir</span>
        </p>
      </div>
    </div>
  );
}

function InputField({
  label, type, placeholder, value, onChange, icon, autoComplete,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-foreground">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          className="w-full bg-background/60 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
        />
      </div>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="text-primary/70">{icon}</span>
      {label}
    </div>
  );
}
