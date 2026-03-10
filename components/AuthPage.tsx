import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface AuthPageProps {
  defaultMode?: "login" | "signup";
  onBack?: () => void;
}

type AuthView = "login" | "signup" | "forgot-password";

function LumoLogoSmall() {
  return (
    <motion.div
      animate={{ 
        boxShadow: [
          "0 0 15px 0px hsl(20 100% 65% / 0.3)",
          "0 0 25px 5px hsl(20 100% 65% / 0.4)",
          "0 0 15px 0px hsl(20 100% 65% / 0.3)"
        ]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-8 h-8 rounded-full bg-background/20 backdrop-blur-sm"
      />
    </motion.div>
  );
}

export default function AuthPage({ defaultMode = "login", onBack }: AuthPageProps) {
  const [view, setView] = useState<AuthView>(defaultMode === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back! 🎉");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: name.trim() },
        },
      });
      if (error) throw error;
      toast.success("Account created! Check your email to verify 📧");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent! Check your inbox 📧");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google sign-in error");
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (view === "login") handleLogin();
    else if (view === "signup") handleSignup();
    else handleForgotPassword();
  };

  const bgOverlays = (
    <>
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(4 100% 68%), transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, hsl(36 100% 60%), transparent 70%)" }} />
    </>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden max-w-lg mx-auto">
      {bgOverlays}

      {onBack && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="absolute top-6 left-6 z-20 w-10 h-10 rounded-xl bg-secondary/80 border border-border/30 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      )}

      <motion.div
        key={view}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LumoLogoSmall />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">Lumo</h1>
          <p className="text-muted-foreground text-sm">
            {view === "login" && "Welcome back! 👋"}
            {view === "signup" && "Join the connection revolution ❤️"}
            {view === "forgot-password" && "Reset your password 🔑"}
          </p>
        </div>

        {view !== "forgot-password" && (
          <>
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="secondary"
              className="w-full h-13 rounded-xl mb-4 text-base border border-border/30"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px bg-border flex-1" />
            </div>
          </>
        )}

        <div className="glass rounded-2xl p-6 space-y-4">
          {view === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="rounded-xl bg-secondary border-0 h-12 pl-10"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-xl bg-secondary border-0 h-12 pl-10"
            />
          </div>

          {view !== "forgot-password" && (
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="rounded-xl bg-secondary border-0 h-12 pl-10 pr-10"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {view === "login" && (
            <button
              onClick={() => setView("forgot-password")}
              className="text-xs text-primary hover:underline block ml-auto"
            >
              Forgot password?
            </button>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-13 text-base gradient-primary border-0 rounded-xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : view === "login" ? (
              "Login"
            ) : view === "signup" ? (
              "Create Account"
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4 space-y-1">
          {view === "login" && (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setView("signup")} className="text-primary font-medium hover:underline">
                Sign up
              </button>
            </p>
          )}
          {view === "signup" && (
            <p>
              Already have an account?{" "}
              <button onClick={() => setView("login")} className="text-primary font-medium hover:underline">
                Log in
              </button>
            </p>
          )}
          {view === "forgot-password" && (
            <p>
              Remember your password?{" "}
              <button onClick={() => setView("login")} className="text-primary font-medium hover:underline">
                Back to login
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
