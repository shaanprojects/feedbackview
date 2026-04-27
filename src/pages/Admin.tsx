import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  BarChart3,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Star,
  Users,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import dashboardBg from "@/assets/bg.png";

type Profile = Tables<"profiles">;
type Business = Tables<"businesses">;
type Feedback = Tables<"feedback">;

type ClientRow = {
  profile: Profile;
  business: Business | null;
  feedbackCount: number;
};

export default function Admin() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changingCreds, setChangingCreds] = useState(false);
  const [adminEmail, setAdminEmail] = useState(user?.email ?? "");
  const [adminPassword, setAdminPassword] = useState("");
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "clients" | "settings"
  >("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    setAdminEmail(user?.email ?? "");
  }, [user?.email]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const checkAndLoad = async () => {
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const [
        { data: allProfiles },
        { data: allBusinesses },
        { data: allFeedback },
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("businesses").select("*"),
        supabase
          .from("feedback")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      setProfiles(allProfiles ?? []);
      setBusinesses(allBusinesses ?? []);
      setFeedbacks(allFeedback ?? []);
      setLoading(false);
    };

    void checkAndLoad();
  }, [user]);

  const businessByUserId = useMemo(() => {
    const map = new Map<string, Business>();
    businesses.forEach((item) => {
      map.set(item.user_id, item);
    });
    return map;
  }, [businesses]);

  const feedbackCountByBusinessId = useMemo(() => {
    const map = new Map<string, number>();
    feedbacks.forEach((item) => {
      const current = map.get(item.business_id) ?? 0;
      map.set(item.business_id, current + 1);
    });
    return map;
  }, [feedbacks]);

  const clients = useMemo<ClientRow[]>(() => {
    return profiles
      .filter((profile) => !profile.is_admin)
      .map((profile) => {
        const business = businessByUserId.get(profile.id) ?? null;
        const feedbackCount = business
          ? (feedbackCountByBusinessId.get(business.id) ?? 0)
          : 0;

        return {
          profile,
          business,
          feedbackCount,
        };
      });
  }, [businessByUserId, feedbackCountByBusinessId, profiles]);

  const totalClients = clients.length;
  const activeClients = clients.filter(
    (client) => client.business?.subscription_active,
  ).length;
  const disabledClients = totalClients - activeClients;
  const feedbackTotal = feedbacks.length;
  const averageRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length
      : 0;
  const pageTitle =
    activeTab === "overview"
      ? "Admin Dashboard"
      : activeTab === "clients"
        ? "Client Management"
        : "Admin Settings";
  const pageDescription =
    activeTab === "overview"
      ? "Monitor all client accounts, subscription status, and feedback trends."
      : activeTab === "clients"
        ? "Enable or disable client access and monitor account health."
        : "Update admin login credentials for this secure portal.";

  const toggleClientStatus = async (
    businessId: string,
    nextStatus: boolean,
  ) => {
    setSavingStatusId(businessId);

    const { error } = await supabase
      .from("businesses")
      .update({ subscription_active: nextStatus })
      .eq("id", businessId);

    if (error) {
      toast.error(error.message);
      setSavingStatusId(null);
      return;
    }

    setBusinesses((prev) =>
      prev.map((item) =>
        item.id === businessId
          ? { ...item, subscription_active: nextStatus }
          : item,
      ),
    );

    toast.success(nextStatus ? "Account enabled." : "Account disabled.");
    setSavingStatusId(null);
  };

  const handleUpdateAdminCredentials = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedEmail = adminEmail.trim();
    if (!trimmedEmail) {
      toast.error("Admin username/email is required.");
      return;
    }

    const shouldUpdatePassword = adminPassword.trim().length > 0;
    if (shouldUpdatePassword && adminPassword.trim().length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    setChangingCreds(true);

    const updates: { email?: string; password?: string } = {
      email: trimmedEmail,
    };

    if (shouldUpdatePassword) {
      updates.password = adminPassword.trim();
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      toast.error(error.message);
      setChangingCreds(false);
      return;
    }

    setAdminPassword("");
    toast.success(
      shouldUpdatePassword
        ? "Admin username/password updated."
        : "Admin username updated.",
    );
    setChangingCreds(false);
  };

  if (authLoading || loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-fixed bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.45), rgba(248, 250, 252, 0.62)), url(${dashboardBg})`,
        }}
      >
        <div className="rounded-2xl border border-white/85 bg-white/80 px-5 py-4 text-slate-600 shadow-sm backdrop-blur-md">
          <div className="animate-pulse">Loading admin portal...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-fixed bg-cover bg-center bg-no-repeat px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.45), rgba(248, 250, 252, 0.62)), url(${dashboardBg})`,
        }}
      >
        <Card className="w-full max-w-md border border-white/90 bg-white/85 text-center shadow-xl backdrop-blur-md">
          <CardContent className="py-10 space-y-4">
            <p className="text-destructive font-medium">
              Access denied. Super admin credentials required.
            </p>
            <Button onClick={() => navigate("/admin/login")}>
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-x-clip bg-fixed bg-cover bg-center bg-no-repeat text-slate-950"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.42), rgba(248, 250, 252, 0.56)), url(${dashboardBg})`,
      }}
    >
      <header className="sticky inset-x-0 top-0 z-30 bg-transparent px-3 pt-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[1.7rem] border border-slate-300/80 bg-slate-100/90 px-3 py-3 shadow-sm backdrop-blur-md sm:rounded-[2rem] sm:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-7 w-7 text-slate-900" />
              <p className="text-base font-bold tracking-tight text-slate-900 sm:text-2xl">
                FeedbackView Admin
              </p>
            </div>

            <div className="ml-auto flex w-full items-center gap-2 sm:w-auto sm:flex-row sm:items-center">
              <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-xl border border-slate-300/80 bg-white/75 p-1 backdrop-blur-sm sm:w-auto sm:flex-none">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-3.5 ${
                    activeTab === "overview"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white hover:text-teal-700"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("clients")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-3.5 ${
                    activeTab === "clients"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white hover:text-teal-700"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Clients</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-3.5 ${
                    activeTab === "settings"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white hover:text-teal-700"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </span>
                </button>
              </nav>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white/85"
              onClick={async () => {
                await signOut();
                navigate("/admin/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="px-3 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">
          <section className="relative overflow-hidden rounded-3xl border-2 border-slate-400/80 bg-gradient-to-br from-white/90 to-slate-50/80 px-4 py-5 shadow-sm backdrop-blur-md sm:px-8 sm:py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-blue-700">
              FeedbackView
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-5xl">
              {pageTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
              {pageDescription}
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Total Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalClients}</p>
              </CardContent>
            </Card>

            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" /> Active
                  Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{activeClients}</p>
              </CardContent>
            </Card>

            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-600" /> Disabled Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{disabledClients}</p>
              </CardContent>
            </Card>

            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Avg Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {feedbackTotal > 0 ? averageRating.toFixed(1) : "--"}
                </p>
              </CardContent>
            </Card>
          </div>

          {(activeTab === "overview" || activeTab === "clients") && (
            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader>
                <CardTitle>Client Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No client records found.
                    </p>
                  )}

                  {clients.map((client) => {
                    const business = client.business;
                    const enabled = Boolean(business?.subscription_active);

                    return (
                      <div
                        key={client.profile.id}
                        className="rounded-lg border border-slate-300/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold break-all">
                            {client.profile.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {business
                              ? business.name
                              : "Business not configured"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Feedback entries: {client.feedbackCount}
                          </p>
                        </div>

                        {business ? (
                          <Button
                            variant={enabled ? "destructive" : "default"}
                            onClick={() =>
                              void toggleClientStatus(business.id, !enabled)
                            }
                            disabled={savingStatusId === business.id}
                          >
                            {savingStatusId === business.id
                              ? "Saving..."
                              : enabled
                                ? "Disable Account"
                                : "Enable Account"}
                          </Button>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No account status available
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {(activeTab === "overview" || activeTab === "clients") && (
            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Recent
                  Feedback ({feedbacks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="rounded-lg border border-slate-300/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm space-y-1"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${s <= fb.rating ? "text-warning fill-warning" : "text-muted"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {fb.message && <p className="text-sm">{fb.message}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(activeTab === "overview" || activeTab === "settings") && (
            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader>
                <CardTitle>Admin Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={handleUpdateAdminCredentials}
                >
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">
                      Admin Username (Email)
                    </Label>
                    <Input
                      id="admin-username"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-new-password">New Password</Label>
                    <Input
                      id="admin-new-password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <Button type="submit" disabled={changingCreds}>
                    {changingCreds ? "Updating..." : "Update Admin Credentials"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
