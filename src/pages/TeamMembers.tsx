import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import dashboardBg from "@/assets/bg.png";

type Business = {
  id: string;
  name: string;
  user_id: string;
  subscription_active: boolean;
};

type TeamMember = {
  id: string;
  business_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

type PlanId = "starter" | "professional" | "enterprise";

const TEAM_MEMBER_LIMITS: Record<PlanId, number> = {
  starter: 3,
  professional: 10,
  enterprise: 50,
};

const getPlanLimit = (rawPlan: string): { plan: PlanId; limit: number } => {
  if (rawPlan === "professional" || rawPlan === "enterprise") {
    return { plan: rawPlan, limit: TEAM_MEMBER_LIMITS[rawPlan] };
  }

  return { plan: "starter", limit: TEAM_MEMBER_LIMITS.starter };
};

export default function TeamMembers() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { memberId } = useParams<{ memberId?: string }>();

  const [business, setBusiness] = useState<Business | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const isAddMode = location.pathname.endsWith("/add");
  const isEditMode = Boolean(memberId);
  const isFormMode = isAddMode || isEditMode;

  const selectedPlanRaw = String(
    user?.user_metadata?.selectedPlan || "starter",
  );
  const { plan: selectedPlan, limit: teamMemberLimit } =
    getPlanLimit(selectedPlanRaw);
  const canAddMoreTeamMembers = teamMembers.length < teamMemberLimit;

  const editingMember = useMemo(() => {
    if (!memberId) return null;
    return teamMembers.find((member) => member.id === memberId) ?? null;
  }, [memberId, teamMembers]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!biz) {
        toast.error("Business account not found.");
        setIsLoading(false);
        navigate("/dashboard/configuration");
        return;
      }

      setBusiness(biz as Business);

      const { data: members } = await supabase
        .from("team_members")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: true });

      setTeamMembers((members as TeamMember[]) || []);
      setIsLoading(false);
    };

    void fetchData();
  }, [navigate, user]);

  useEffect(() => {
    if (!isEditMode) return;
    if (!editingMember) return;

    setFullName(editingMember.full_name);
    setEmail(editingMember.email);
    setRole(editingMember.role);
  }, [editingMember, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !memberId) return;
    if (isLoading) return;

    const exists = teamMembers.some((member) => member.id === memberId);
    if (!exists) {
      toast.error("Team member not found.");
      navigate("/dashboard/team-members");
    }
  }, [isEditMode, isLoading, memberId, navigate, teamMembers]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setRole("member");
  };

  const goToList = () => {
    navigate("/dashboard/team-members");
  };

  const handleSaveMember = async (event: FormEvent) => {
    event.preventDefault();

    if (!business) return;

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      toast.error("Name and email are required.");
      return;
    }

    if (isAddMode && !canAddMoreTeamMembers) {
      toast.error(
        `Team member limit reached for ${selectedPlan} plan (${teamMemberLimit}).`,
      );
      return;
    }

    setIsSaving(true);

    if (isEditMode && memberId) {
      const { data, error } = await supabase
        .from("team_members")
        .update({
          full_name: normalizedName,
          email: normalizedEmail,
          role,
        })
        .eq("id", memberId)
        .eq("business_id", business.id)
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        setIsSaving(false);
        return;
      }

      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? (data as TeamMember) : member,
        ),
      );
      toast.success("Team member updated.");
      setIsSaving(false);
      goToList();
      return;
    }

    const { data, error } = await supabase
      .from("team_members")
      .insert({
        business_id: business.id,
        full_name: normalizedName,
        email: normalizedEmail,
        role,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    setTeamMembers((prev) => [...prev, data as TeamMember]);
    toast.success("Team member added.");
    setIsSaving(false);
    resetForm();
    goToList();
  };

  const handleDeleteMember = async (id: string) => {
    if (!business) return;

    setIsDeletingId(id);
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id)
      .eq("business_id", business.id);

    if (error) {
      toast.error(error.message);
      setIsDeletingId(null);
      return;
    }

    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
    toast.success("Team member removed.");
    setIsDeletingId(null);
  };

  if (authLoading || isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-fixed bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.45), rgba(248, 250, 252, 0.62)), url(${dashboardBg})`,
        }}
      >
        <div className="rounded-2xl border border-white/85 bg-white/80 px-5 py-4 text-slate-600 shadow-sm backdrop-blur-md">
          <div className="animate-pulse">Loading team members...</div>
        </div>
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
      <main className="px-3 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="relative overflow-hidden rounded-3xl border-2 border-slate-400/80 bg-gradient-to-br from-white/90 to-slate-50/80 px-4 py-5 shadow-sm backdrop-blur-md sm:px-8 sm:py-6">
            <Button
              variant="outline"
              size="sm"
              className="mb-4 border-slate-300 bg-white/85"
              onClick={() => navigate("/dashboard/configuration")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>

            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-blue-700">
              Team Management
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              {isAddMode
                ? "Add Team Member"
                : isEditMode
                  ? "Edit Team Member"
                  : "Team Members"}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
              {business?.name} on {selectedPlan} plan: {teamMembers.length}/
              {teamMemberLimit} seats used
            </p>
            <div className="mt-4 h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-teal-600"
                style={{
                  width: `${Math.min(100, Math.round((teamMembers.length / teamMemberLimit) * 100))}%`,
                }}
              />
            </div>
          </section>

          {!isFormMode && (
            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Team Member List
                  </CardTitle>
                  <CardDescription>
                    Manage all members linked to your customer account
                  </CardDescription>
                </div>

                <Button
                  onClick={() => navigate("/dashboard/team-members/add")}
                  disabled={!canAddMoreTeamMembers}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Member
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                {!canAddMoreTeamMembers && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Seat limit reached for the {selectedPlan} plan. Upgrade to
                    add more members.
                  </div>
                )}

                {teamMembers.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
                    No team members yet.
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-300/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-slate-600">{member.email}</p>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Role: {member.role}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/dashboard/team-members/${member.id}/edit`,
                            )
                          }
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleDeleteMember(member.id)}
                          disabled={isDeletingId === member.id}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          {isDeletingId === member.id
                            ? "Removing..."
                            : "Remove"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {isFormMode && (
            <Card className="glass-card glass-card-hover border-2 border-slate-300/80">
              <CardHeader>
                <CardTitle>
                  {isEditMode ? "Edit Team Member" : "Add Team Member"}
                </CardTitle>
                <CardDescription>
                  {isEditMode
                    ? "Update team member details and role"
                    : "Create a new member for your customer account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSaveMember}>
                  <div className="space-y-2">
                    <Label htmlFor="team-full-name">Full Name</Label>
                    <Input
                      id="team-full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-email">Email</Label>
                    <Input
                      id="team-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@business.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-role">Role</Label>
                    <select
                      id="team-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white/85 px-3 py-2 text-sm"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {isAddMode && !canAddMoreTeamMembers && (
                    <p className="text-sm font-medium text-amber-700">
                      Seat limit reached for {selectedPlan} plan (
                      {teamMemberLimit}).
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={
                        isSaving || (isAddMode && !canAddMoreTeamMembers)
                      }
                    >
                      {isSaving
                        ? "Saving..."
                        : isEditMode
                          ? "Update Member"
                          : "Add Member"}
                    </Button>
                    <Button type="button" variant="outline" onClick={goToList}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
