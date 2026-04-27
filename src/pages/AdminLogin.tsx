import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import dashboardBg from "@/assets/bg.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.is_admin) {
        navigate("/admin", { replace: true });
      }
    };

    void checkAdmin();
  }, [authLoading, navigate, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const sessionUser = data.user;
      if (!sessionUser) {
        toast.error("Could not establish admin session.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (profileError || !profile?.is_admin) {
        await supabase.auth.signOut();
        toast.error("Access denied. Admin credentials required.");
        return;
      }

      toast.success("Super admin login successful.");
      navigate("/admin", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-fixed bg-cover bg-center bg-no-repeat px-4 py-16"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.45), rgba(248, 250, 252, 0.62)), url(${dashboardBg})`,
      }}
    >
      <Link
        to="/"
        className="absolute left-4 top-5 inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/85 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white sm:left-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md border border-white/90 bg-white/90 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mb-3 inline-flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">
              Super Admin
            </span>
          </div>
          <CardTitle>Admin Portal Login</CardTitle>
          <CardDescription>
            Use dedicated admin credentials to manage client accounts and
            reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Username (Email)</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 inline-flex items-center text-slate-500 transition-colors hover:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700"
            >
              {loading ? "Signing in..." : "Sign In to Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
