import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Mail, Lock, AlertCircle, X } from "lucide-react";

const ADMIN_EMAIL = 'aamanojkumar190@gmail.com';
const REGISTRY_KEY = 'nexa_infra_user_registry';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (!ok) return;
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      navigate("/admin/dashboard");
      return;
    }
    try {
      const registry = JSON.parse(localStorage.getItem(REGISTRY_KEY) || '{}');
      const entry = registry[email.toLowerCase()];
      if (entry?.role === 'CONTRACTOR') navigate("/contractor/dashboard");
      else navigate("/user/dashboard");
    } catch {
      navigate("/user/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <HardHat className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your NEXA INFRA account</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={clearError} className="shrink-0"><X className="h-4 w-4" /></button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Admin login: <span className="font-medium">{ADMIN_EMAIL}</span>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="font-medium text-secondary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
