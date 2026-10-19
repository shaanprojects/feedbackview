import { ClipboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  HelpCircle,
  LayoutDashboard,
  Link,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Quote,
  Settings,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dashboardBg from "@/assets/bg.png";
import { GoogleLogo } from "@/components/GoogleLogo";

type Business = {
  id: string;
  name: string;
  user_id: string;
  subscription_active: boolean;
};

type Feedback = {
  id: string;
  business_id: string;
  rating: number;
  message: string | null;
  created_at: string;
};

type ReviewLink = {
  id: string;
  business_id: string;
  platform_name: string;
  url: string;
};

type TeamMember = {
  id: string;
  business_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

const extractPlaceId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. If it's already a write review link, extract placeid
  if (trimmed.includes("search.google.com/local/writereview")) {
    const match = trimmed.match(/placeid=([a-zA-Z0-9_\-]+)/i);
    return match ? match[1] : null;
  }

  // 2. If it's a maps link with place_id or placeid query param
  const urlParamMatch = trimmed.match(/(?:place_id|placeid)[:=]([a-zA-Z0-9_\-]+)/i);
  if (urlParamMatch && urlParamMatch[1]) {
    return urlParamMatch[1];
  }

  // 3. If prefixed with "Place ID: ChIJ..." or "Place ID ChIJ..." or "placeid: ..."
  const labelMatch = trimmed.match(/^(?:place[\s_-]*id[\s:=]+)([a-zA-Z0-9_\-]+)$/i);
  if (labelMatch && labelMatch[1]) {
    return labelMatch[1];
  }

  // 4. Raw Place ID: alphanumeric string without web protocols or domains
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.includes("/") &&
    !trimmed.includes(".com") &&
    !trimmed.includes(".net") &&
    !trimmed.includes(".org") &&
    !trimmed.includes(".io") &&
    /^[a-zA-Z0-9_\-]{8,}$/.test(trimmed)
  ) {
    return trimmed;
  }

  return null;
};

const generateGoogleReviewUrl = (placeId: string): string => {
  return `https://search.google.com/local/writereview?placeid=${placeId.trim()}`;
};

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();

  type DashboardTab = "dashboard" | "analytics" | "configuration" | "profile";

  const [business, setBusiness] = useState<Business | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reviewLinks, setReviewLinks] = useState<ReviewLink[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [showPlatformSetupGuide, setShowPlatformSetupGuide] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [monthlyGoalConfig, setMonthlyGoalConfig] = useState(30);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showBusinessQr, setShowBusinessQr] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [feedbackDeleteDialogOpen, setFeedbackDeleteDialogOpen] =
    useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, navigate, user]);

  useEffect(() => {
    const validSections: DashboardTab[] = [
      "dashboard",
      "analytics",
      "configuration",
      "profile",
    ];

    if (!section) {
      setActiveTab("dashboard");
      return;
    }

    if (validSections.includes(section as DashboardTab)) {
      setActiveTab(section as DashboardTab);
      return;
    }

    navigate("/dashboard", { replace: true });
  }, [navigate, section]);

  const isInitialLoadDone = useRef(false);

  useEffect(() => {
    if (user?.id) {
      if (!isInitialLoadDone.current) {
        isInitialLoadDone.current = true;
        fetchData(true);
      } else {
        fetchData(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const metadata = user.user_metadata ?? {};
    setProfileFirstName((metadata.firstName as string) ?? "");
    setProfileLastName((metadata.lastName as string) ?? "");
  }, [user?.id]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const fetchData = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (biz) {
        setBusiness(biz as Business);
        setBusinessName((biz as Business).name);

        const [{ data: fb }, { data: links }] = await Promise.all([
          supabase
            .from("feedback")
            .select("*")
            .eq("business_id", biz.id)
            .order("created_at", { ascending: false }),
          supabase.from("review_links").select("*").eq("business_id", biz.id),
        ]);

        const { data: members } = await supabase
          .from("team_members")
          .select("*")
          .eq("business_id", biz.id)
          .order("created_at", { ascending: true });

        setFeedbacks((fb as Feedback[]) || []);
        setReviewLinks((links as ReviewLink[]) || []);
        setTeamMembers((members as TeamMember[]) || []);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const reviewUrl = business
    ? `${window.location.origin}/review/${business.id}`
    : "";
  const selectedPlan = String(user?.user_metadata?.selectedPlan || "starter");
  const teamMemberLimit =
    selectedPlan === "enterprise"
      ? 50
      : selectedPlan === "professional"
        ? 10
        : 3;
  const monthlyGoalStorageKey = business
    ? `truerep_monthly_goal_${business.id}`
    : user
      ? `truerep_monthly_goal_${user.id}`
      : "truerep_monthly_goal";
  const totalFeedback = feedbacks.length;
  const averageRating = totalFeedback
    ? feedbacks.reduce((sum, item) => sum + item.rating, 0) / totalFeedback
    : 0;
  const averageRatingText = totalFeedback ? averageRating.toFixed(1) : "--";
  const feedbackThisMonth = feedbacks.filter((item) => {
    const date = new Date(item.created_at);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;
  const activeLinks = reviewLinks.length;
  const latestFeedback = useMemo(() => feedbacks, [feedbacks]);
  const feedbackPerPage = 3;
  const feedbackPageCount = Math.max(
    1,
    Math.ceil(latestFeedback.length / feedbackPerPage),
  );
  const paginatedFeedback = latestFeedback.slice(
    (feedbackPage - 1) * feedbackPerPage,
    feedbackPage * feedbackPerPage,
  );

  useEffect(() => {
    setFeedbackPage(1);
  }, [latestFeedback.length]);

  useEffect(() => {
    if (feedbackPage > feedbackPageCount) {
      setFeedbackPage(feedbackPageCount);
    }
  }, [feedbackPage, feedbackPageCount]);

  useEffect(() => {
    setSelectedFeedbackIds((prev) =>
      prev.filter((id) =>
        latestFeedback.some((feedback) => feedback.id === id),
      ),
    );
  }, [latestFeedback]);

  const selectedOnCurrentPageCount = paginatedFeedback.filter((feedback) =>
    selectedFeedbackIds.includes(feedback.id),
  ).length;
  const allCurrentPageSelected =
    paginatedFeedback.length > 0 &&
    paginatedFeedback.every((feedback) =>
      selectedFeedbackIds.includes(feedback.id),
    );

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  const previousMonthFeedback = feedbacks.filter((item) => {
    const date = new Date(item.created_at);
    return date >= previousMonthStart && date <= previousMonthEnd;
  }).length;

  const feedbackDeltaPercent =
    previousMonthFeedback === 0
      ? feedbackThisMonth > 0
        ? 100
        : 0
      : Math.round(
          ((feedbackThisMonth - previousMonthFeedback) /
            previousMonthFeedback) *
            100,
        );

  const recommendedMonthlyGoal = Math.max(15, activeLinks * 10 || 15);
  const monthlyGoal = Math.max(1, monthlyGoalConfig);
  const monthlyProgress = Math.min(
    100,
    Math.round((feedbackThisMonth / Math.max(1, monthlyGoal)) * 100),
  );

  useEffect(() => {
    const storedValue = window.localStorage.getItem(monthlyGoalStorageKey);

    if (storedValue) {
      const parsed = Number(storedValue);
      if (Number.isFinite(parsed) && parsed > 0) {
        setMonthlyGoalConfig(parsed);
        return;
      }
    }

    const metadataGoal = Number(user?.user_metadata?.monthly_review_goal);
    if (Number.isFinite(metadataGoal) && metadataGoal > 0) {
      setMonthlyGoalConfig(metadataGoal);
      return;
    }

    setMonthlyGoalConfig(recommendedMonthlyGoal);
  }, [monthlyGoalStorageKey, recommendedMonthlyGoal, user?.user_metadata]);

  const dateRangeLabel = `${currentMonthStart.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })} - ${now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })}, ${now.getFullYear()}`;

  const pageTitle =
    activeTab === "dashboard"
      ? "Dashboard"
      : activeTab === "analytics"
        ? "Analytics"
        : activeTab === "profile"
          ? "Profile Settings"
          : "Configuration";

  const pageDescription =
    activeTab === "dashboard"
      ? `Growth overview for ${business?.name || "your business"}`
      : activeTab === "analytics"
        ? "Usage and engagement data from your current account"
        : activeTab === "profile"
          ? "Manage your profile details and monthly review goal"
          : "Manage business profile, links, and review collection assets";

  const trendData = useMemo(() => {
    const currentWeekStart = new Date();
    const dayOffset = (currentWeekStart.getDay() + 6) % 7;
    currentWeekStart.setDate(currentWeekStart.getDate() - dayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Show the last 8 completed weeks so the trend timeline does not shift with partial-week data.
    const fullWeekBoundary = new Date(currentWeekStart);

    return Array.from({ length: 8 }, (_, idx) => {
      const weekStart = new Date(fullWeekBoundary);
      weekStart.setDate(fullWeekBoundary.getDate() - (8 - idx) * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekCount = feedbacks.filter((fb) => {
        const fbDate = new Date(fb.created_at);
        return fbDate >= weekStart && fbDate < weekEnd;
      }).length;

      return {
        week: weekStart.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        range: `${weekStart.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })} - ${new Date(weekEnd.getTime() - 1).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })}`,
        count: weekCount,
      };
    });
  }, [feedbacks]);

  const trendRangeLabel =
    trendData.length > 0
      ? `${trendData[0].week} - ${trendData[trendData.length - 1].range
          .split(" - ")
          .at(-1)}`
      : "No data";

  const handleTabChange = (nextTab: DashboardTab) => {
    setActiveTab(nextTab);
    if (nextTab === "dashboard") {
      navigate("/dashboard");
      return;
    }
    navigate(`/dashboard/${nextTab}`);
  };

  const copyLink = () => {
    if (!reviewUrl) return;
    navigator.clipboard.writeText(reviewUrl);
    setCopiedLink(true);
    toast.success("Review link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage.trim()) {
      toast.error("Please enter your support request.");
      return;
    }

    setIsSubmittingHelp(true);
    setTimeout(() => {
      setIsSubmittingHelp(false);
      setHelpModalOpen(false);
      setHelpMessage("");
      toast.success(
        "Support request sent! An admin will review your message and help you.",
      );
    }, 500);
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement("a");
      link.download = "review-qr-code.png";
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const updateBusinessName = async () => {
    if (!business || !businessName.trim()) return;
    await supabase
      .from("businesses")
      .update({ name: businessName.trim() })
      .eq("id", business.id);
    setBusiness({ ...business, name: businessName.trim() });
    toast.success("Business name updated!");
  };

  const saveProfileSettings = async () => {
    if (!user) return;

    setIsSavingProfile(true);
    const mergedMetadata = {
      ...(user.user_metadata ?? {}),
      firstName: profileFirstName.trim(),
      lastName: profileLastName.trim(),
    };

    const { error } = await supabase.auth.updateUser({
      data: mergedMetadata,
      ...(profilePassword.trim() ? { password: profilePassword.trim() } : {}),
    });

    if (error) {
      toast.error(error.message);
      setIsSavingProfile(false);
      return;
    }

    setProfilePassword("");
    toast.success("Profile settings updated.");
    setIsSavingProfile(false);
  };

  const saveMonthlyGoal = async () => {
    if (!user) return;

    const nextGoal = Math.max(1, Math.round(monthlyGoalConfig));
    setIsSavingGoal(true);
    window.localStorage.setItem(monthlyGoalStorageKey, String(nextGoal));

    const { error } = await supabase.auth.updateUser({
      data: {
        ...(user.user_metadata ?? {}),
        monthly_review_goal: nextGoal,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsSavingGoal(false);
      return;
    }

    setMonthlyGoalConfig(nextGoal);
    toast.success("Monthly review goal updated.");
    setIsSavingGoal(false);
  };

  const handleUrlPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const placeId = extractPlaceId(pastedText);
    if (placeId) {
      e.preventDefault();
      const generatedUrl = generateGoogleReviewUrl(placeId);
      setNewUrl(generatedUrl);
      if (!newPlatform.trim()) {
        setNewPlatform("Google");
      }
      toast.success("Google review link generated from Place ID!");
    }
  };

  const handleUrlChange = (value: string) => {
    const placeId = extractPlaceId(value);
    if (
      placeId &&
      (value.toLowerCase().includes("place") ||
        value.startsWith("ChI") ||
        value.length >= 25)
    ) {
      const generatedUrl = generateGoogleReviewUrl(placeId);
      if (value !== generatedUrl) {
        setNewUrl(generatedUrl);
        if (!newPlatform.trim()) {
          setNewPlatform("Google");
        }
        return;
      }
    }
    setNewUrl(value);
  };

  const addReviewLink = async () => {
    if (!business) return;

    const trimmedUrl = newUrl.trim();
    let platformName = newPlatform.trim();

    if (!trimmedUrl) {
      toast.error("Please enter a platform URL or Google Place ID.");
      return;
    }

    let finalUrl = trimmedUrl;
    const placeId = extractPlaceId(trimmedUrl);
    if (
      placeId &&
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://")
    ) {
      finalUrl = generateGoogleReviewUrl(placeId);
      if (!platformName) {
        platformName = "Google";
      }
    }

    if (!platformName) {
      toast.error("Please enter a platform name (e.g. Google).");
      return;
    }

    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    const { data, error } = await supabase
      .from("review_links")
      .insert({
        business_id: business.id,
        platform_name: platformName,
        url: finalUrl,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add review link");
      return;
    }

    if (data) {
      setReviewLinks([...reviewLinks, data as ReviewLink]);
      setNewPlatform("");
      setNewUrl("");
      toast.success("Review link added!");
    }
  };

  const deleteReviewLink = async (id: string) => {
    await supabase.from("review_links").delete().eq("id", id);
    setReviewLinks(reviewLinks.filter((l) => l.id !== id));
    toast.success("Link removed");
  };

  const deleteFeedback = async (ids: string[]) => {
    if (!business || ids.length === 0) return;

    setIsDeletingFeedback(true);
    const { error } = await supabase
      .from("feedback")
      .delete()
      .eq("business_id", business.id)
      .in("id", ids);

    if (error) {
      toast.error("Failed to delete feedback");
      setIsDeletingFeedback(false);
      return;
    }

    setFeedbacks((prev) =>
      prev.filter((feedback) => !ids.includes(feedback.id)),
    );
    setSelectedFeedbackIds((prev) => prev.filter((id) => !ids.includes(id)));
    toast.success(ids.length === 1 ? "Comment deleted" : "Comments deleted");
    setIsDeletingFeedback(false);
  };

  const toggleFeedbackSelection = (feedbackId: string, checked: boolean) => {
    setSelectedFeedbackIds((prev) => {
      if (checked) {
        return prev.includes(feedbackId) ? prev : [...prev, feedbackId];
      }

      return prev.filter((id) => id !== feedbackId);
    });
  };

  const toggleCurrentPageSelection = (checked: boolean) => {
    const pageIds = paginatedFeedback.map((feedback) => feedback.id);

    if (checked) {
      setSelectedFeedbackIds((prev) => [
        ...prev,
        ...pageIds.filter((id) => !prev.includes(id)),
      ]);
      return;
    }

    setSelectedFeedbackIds((prev) =>
      prev.filter((id) => !pageIds.includes(id)),
    );
  };

  const requestFeedbackDelete = (ids: string[]) => {
    if (ids.length === 0 || isDeletingFeedback) return;
    setPendingDeleteIds(ids);
    setFeedbackDeleteDialogOpen(true);
  };

  const confirmFeedbackDelete = async () => {
    if (pendingDeleteIds.length === 0) return;
    await deleteFeedback(pendingDeleteIds);
    setFeedbackDeleteDialogOpen(false);
    setPendingDeleteIds([]);
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
          <div className="animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (business && !business.subscription_active) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-fixed bg-cover bg-center bg-no-repeat px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.45), rgba(248, 250, 252, 0.62)), url(${dashboardBg})`,
        }}
      >
        <Card className="w-full max-w-md border border-white/90 bg-white/85 text-center shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle>Subscription Inactive</CardTitle>
            <CardDescription>
              Please activate your subscription to access the dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-fixed bg-cover bg-center bg-no-repeat text-slate-950"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.42), rgba(248, 250, 252, 0.56)), url(${dashboardBg})`,
      }}
    >
      {/* Mobile backdrop for slider navigation */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Slider / Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r-2 border-black bg-white shadow-xl backdrop-blur-xl transition-all duration-300 ease-in-out lg:static lg:shadow-none shrink-0 overflow-x-hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-16" : "w-64"}`}
      >
        {/* Sidebar Brand Header - Clean Homepage Style */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <BookmarkIcon className="h-6 w-6 shrink-0 text-teal-600" />
            {!sidebarCollapsed && (
              <span className="truncate text-lg font-bold tracking-tight text-slate-900">
                TrueRep
              </span>
            )}
          </div>

          <div className="flex items-center">
            {/* Mobile close */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Desktop slider collapse toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:flex"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Current Plan Card */}
        {!sidebarCollapsed ? (
          <div className="px-3 pt-3.5 pb-1">
            <div
              onClick={() => {
                handleTabChange("configuration");
                setTimeout(() => {
                  const el = document.getElementById("review-platforms-card");
                  el?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="group rounded-xl border border-slate-200/90 bg-slate-50/70 px-3 py-2.5 hover:bg-white hover:border-teal-300 hover:shadow-xs cursor-pointer transition-all active:scale-[0.99]"
              title="Click to manage subscription and review platforms"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-600">
                    Current Plan: <span className="font-bold text-teal-700 capitalize">{selectedPlan || "Starter"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-teal-600 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex shrink-0 justify-center">
            <div
              onClick={() => {
                handleTabChange("configuration");
                setTimeout(() => {
                  const el = document.getElementById("review-platforms-card");
                  el?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200 cursor-pointer hover:scale-105 transition-transform"
              title={`Current Plan: ${selectedPlan} (Active) - Click to manage`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        )}

        {/* Navigation Items (Scrollable Middle) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {!sidebarCollapsed && (
            <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </p>
          )}
          <nav className="space-y-1">
            {[
              { id: "dashboard" as DashboardTab, label: "Dashboard", icon: LayoutDashboard },
              { id: "analytics" as DashboardTab, label: "Analytics", icon: BarChart3 },
              { id: "configuration" as DashboardTab, label: "Settings", icon: Settings },
              { id: "profile" as DashboardTab, label: "Profile", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabChange(tab.id);
                    setMobileNavOpen(false);
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    sidebarCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "h-10"
                  } ${
                    isActive
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout - Integrated Clean Row with Person Icon */}
        <div className="border-t border-slate-100 p-2 sm:p-3 shrink-0 bg-white">
          <div
            className={`flex items-center rounded-xl transition-colors ${
              sidebarCollapsed
                ? "flex-col items-center gap-2 p-1"
                : "flex-row items-center gap-2.5 p-1.5 hover:bg-slate-50"
            }`}
          >
            {/* Circular profile person icon */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs cursor-pointer hover:bg-slate-200 transition-colors"
              title={
                sidebarCollapsed
                  ? `${profileFirstName ? `${profileFirstName} ${profileLastName}` : user?.email || "Profile"}`
                  : undefined
              }
              onClick={() => handleTabChange("profile")}
            >
              <User className="h-4.5 w-4.5 text-slate-600" />
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900 leading-tight">
                  {profileFirstName
                    ? `${profileFirstName} ${profileLastName}`
                    : user?.email?.split("@")[0]}
                </p>
                <p className="truncate text-[11px] text-slate-400 mt-0.5 font-medium">
                  {user?.email}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                signOut();
                navigate("/auth");
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Full height with independent vertical scroll */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-y-auto overflow-x-hidden">
        {/* Sleek Content Topbar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b-2 border-black bg-white/85 px-3 sm:px-4 lg:px-6 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm sm:text-base font-bold capitalize text-slate-900 tracking-tight truncate">
                {activeTab === "configuration" ? "Settings" : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Clean, dedicated Copy Link Button */}
            {reviewUrl && (
              <Button
                size="sm"
                onClick={copyLink}
                className="h-9 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-semibold px-2.5 sm:px-3.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
                title="Copy customer review link"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-teal-100" />
                    <span>Copy<span className="hidden sm:inline"> Link</span></span>
                  </>
                )}
              </Button>
            )}

            {/* Need Help Button - Responsive icon on mobile, icon+text on desktop */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHelpModalOpen(true)}
              className="h-9 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-2.5 sm:px-3 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 active:scale-[0.98]"
              title="Need Help?"
            >
              <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Need Help?</span>
            </Button>

            <div className="h-4.5 w-px bg-slate-200/90 mx-0.5 hidden sm:block" />

            {/* Profile Avatar Quick Dropdown Menu */}
            <div className="relative shrink-0" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-100/90 text-slate-800 font-bold text-xs shadow-2xs transition hover:bg-slate-200 hover:border-slate-300 active:scale-95"
                aria-label="Open profile menu"
                title={user?.email || "Profile"}
              >
                {profileFirstName
                  ? profileFirstName.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || "U"}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md z-50">
                  <div className="mb-2.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs font-medium text-slate-600">
                    <p className="font-bold text-slate-900 truncate">
                      {businessName || "My Business"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1.5 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700 border border-teal-200/60">
                      {selectedPlan} Plan
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-300 bg-white px-3 text-slate-900 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                    onClick={() => {
                      signOut();
                      navigate("/auth");
                    }}
                  >
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
          <div className="w-full">
            <section className="relative overflow-hidden rounded-3xl border-2 border-slate-400/80 bg-gradient-to-br from-white/90 to-slate-50/80 px-4 py-5 shadow-sm backdrop-blur-md sm:px-8 sm:py-6">
              <div className={`relative grid gap-6 lg:gap-8 ${activeTab === "dashboard" ? "lg:grid-cols-[1.15fr_1.1fr_0.95fr]" : "lg:grid-cols-[1.15fr_1fr]"} lg:items-start`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-blue-700">
                    TrueRep
                  </p>
                  <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-5xl">
                    {pageTitle}
                  </h1>
                  <p className="mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
                    {pageDescription}
                  </p>
                  <div className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
                    <span className="h-2 w-2 rounded-full bg-teal-600" />
                    <span className="truncate">{dateRangeLabel}</span>
                  </div>

                  <div className="mt-4 max-w-xl rounded-xl border border-slate-300/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Monthly Goal</span>
                      <span>
                        {feedbackThisMonth} / {monthlyGoal}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-teal-600 to-blue-600"
                        style={{ width: `${monthlyProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3 lg:self-start">
                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex min-h-[164px] w-full flex-col items-center justify-center rounded-2xl border-2 border-slate-300 bg-white/90 p-4 text-center shadow-sm backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Total
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {totalFeedback}
                      </p>
                    </div>
                    <div className="flex min-h-[164px] w-full flex-col items-center justify-center rounded-2xl border-2 border-slate-800 bg-gradient-to-br from-teal-600 to-blue-600 p-4 text-center text-white shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-100">
                        This Month
                      </p>
                      <p className="mt-2 text-3xl font-bold">
                        {feedbackThisMonth}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-300/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Average Rating
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {averageRatingText}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-300/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Monthly Trend
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {feedbackDeltaPercent > 0 ? "+" : ""}
                        {feedbackDeltaPercent}%
                      </p>
                    </div>
                  </div>
                </div>

                {activeTab === "dashboard" && (
                  <div className="w-full flex flex-col justify-between rounded-2xl border border-slate-300/90 bg-white/90 p-5 shadow-sm backdrop-blur-sm space-y-4 lg:self-start">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <p className="text-sm font-bold text-slate-900">
                        {showBusinessQr ? "Business QR" : "Business Info"}
                      </p>
                    </div>

                    {!showBusinessQr ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Name
                          </p>
                          <p className="truncate text-base font-bold text-slate-900">
                            {business?.name || "Not Set"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Status
                          </p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              business?.subscription_active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {business?.subscription_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Links
                          </p>
                          <p className="text-base font-bold text-slate-900">
                            {activeLinks}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Feedback
                          </p>
                          <p className="text-base font-bold text-slate-900">
                            {totalFeedback}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-3">
                          {reviewUrl ? (
                            <QRCodeSVG id="qr-code" value={reviewUrl} size={112} />
                          ) : (
                            <p className="text-xs font-medium text-slate-500">
                              No review link yet
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                          onClick={downloadQR}
                          disabled={!reviewUrl}
                        >
                          <Download className="mr-1 h-4 w-4" /> Download QR
                        </Button>
                      </div>
                    )}

                    <div className="pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                        onClick={() => setShowBusinessQr((prev) => !prev)}
                      >
                        {showBusinessQr ? "Show Info" : "Show QR"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Card className="rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/60 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100/80 shadow-xs">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <CardTitle className="text-lg font-bold text-slate-800">
                              Latest Feedback
                            </CardTitle>
                            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200/70">
                              {feedbacks.length} {feedbacks.length === 1 ? "response" : "responses"}
                            </span>
                          </div>
                          <CardDescription className="text-xs text-slate-500 mt-0.5">
                            Most recent customer reviews and private ratings
                          </CardDescription>
                        </div>
                      </div>

                      {latestFeedback.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                          {selectedFeedbackIds.length > 0 ? (
                            <div className="flex items-center gap-2 rounded-xl bg-rose-50/70 border border-rose-200/80 p-1 pl-3 shadow-xs">
                              <span className="text-xs font-semibold text-rose-700">
                                {selectedFeedbackIds.length} selected
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedFeedbackIds([])}
                                className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900"
                              >
                                Clear
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  requestFeedbackDelete(selectedFeedbackIds)
                                }
                                disabled={isDeletingFeedback}
                                className="h-7 gap-1.5 px-3 text-xs bg-rose-600 hover:bg-rose-700 font-medium"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete ({selectedFeedbackIds.length})
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-xs hover:border-slate-300 transition-colors">
                              <Checkbox
                                id="select-page-feedback"
                                checked={
                                  allCurrentPageSelected
                                    ? true
                                    : selectedOnCurrentPageCount > 0
                                      ? "indeterminate"
                                      : false
                                }
                                onCheckedChange={(checked) =>
                                  toggleCurrentPageSelection(checked === true)
                                }
                                disabled={isDeletingFeedback}
                              />
                              <Label
                                htmlFor="select-page-feedback"
                                className="cursor-pointer text-xs font-medium text-slate-600 select-none"
                              >
                                Select page
                              </Label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {latestFeedback.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 shadow-xs mb-3">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <h4 className="text-base font-semibold text-slate-800">
                          No feedback received yet
                        </h4>
                        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                          When your customers submit private reviews via your custom link or QR code, their feedback will show up right here.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3.5">
                          {paginatedFeedback.map((fb) => {
                            const isSelected = selectedFeedbackIds.includes(fb.id);
                            const ratingBadge =
                              fb.rating >= 5
                                ? {
                                    label: "Excellent",
                                    className:
                                      "bg-emerald-50 text-emerald-700 border-emerald-200/80",
                                  }
                                : fb.rating >= 4
                                  ? {
                                      label: "Good",
                                      className:
                                        "bg-teal-50 text-teal-700 border-teal-200/80",
                                    }
                                  : fb.rating >= 3
                                    ? {
                                        label: "Neutral",
                                        className:
                                          "bg-amber-50 text-amber-700 border-amber-200/80",
                                      }
                                    : {
                                        label: "Needs Attention",
                                        className:
                                          "bg-rose-50 text-rose-700 border-rose-200/80",
                                      };

                            return (
                              <article
                                key={fb.id}
                                className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                                  isSelected
                                    ? "border-teal-500/80 bg-teal-50/20 shadow-xs"
                                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md"
                                }`}
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  {/* Left: Checkbox + Avatar + Rating info */}
                                  <div className="flex items-start gap-3">
                                    <div className="pt-1.5">
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) =>
                                          toggleFeedbackSelection(
                                            fb.id,
                                            checked === true,
                                          )
                                        }
                                        disabled={isDeletingFeedback}
                                        aria-label="Select feedback"
                                      />
                                    </div>

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200/80 border border-slate-200 text-slate-600 shadow-2xs">
                                      <User className="h-5 w-5 text-slate-500" />
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-800">
                                          Customer Response
                                        </span>
                                        <span
                                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${ratingBadge.className}`}
                                        >
                                          {ratingBadge.label}
                                        </span>
                                      </div>

                                      {/* Stars & numeric rating */}
                                      <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((value) => (
                                            <Star
                                              key={value}
                                              className={`h-4 w-4 ${
                                                value <= fb.rating
                                                  ? "fill-amber-400 text-amber-400"
                                                  : "text-slate-200"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">
                                          {fb.rating}.0
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Date & Delete button */}
                                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-7 sm:pl-0">
                                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>
                                        {new Date(fb.created_at).toLocaleDateString(
                                          "en-US",
                                          {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          },
                                        )}
                                      </span>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg text-slate-400 opacity-70 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                      onClick={() =>
                                        requestFeedbackDelete([fb.id])
                                      }
                                      disabled={isDeletingFeedback}
                                      aria-label="Delete comment"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Message */}
                                <div className="mt-3 pl-8 sm:pl-13">
                                  {fb.message ? (
                                    <div className="relative rounded-lg bg-slate-50/90 border border-slate-100 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
                                      <Quote className="absolute -top-2 left-2.5 h-3.5 w-3.5 text-slate-300 fill-slate-200" />
                                      <p className="pl-2">{fb.message}</p>
                                    </div>
                                  ) : (
                                    <p className="text-xs italic text-slate-400">
                                      No written feedback provided.
                                    </p>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>

                        {feedbackPageCount > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-medium">
                              Showing{" "}
                              <span className="font-semibold text-slate-700">
                                {(feedbackPage - 1) * feedbackPerPage + 1}-
                                {Math.min(
                                  feedbackPage * feedbackPerPage,
                                  latestFeedback.length,
                                )}
                              </span>{" "}
                              of{" "}
                              <span className="font-semibold text-slate-700">
                                {latestFeedback.length}
                              </span>{" "}
                              responses
                            </p>

                            <Pagination className="mx-0 w-auto justify-end">
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    href="#"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      setFeedbackPage((prev) =>
                                        Math.max(1, prev - 1),
                                      );
                                    }}
                                    className={
                                      feedbackPage === 1
                                        ? "pointer-events-none opacity-40 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }
                                  />
                                </PaginationItem>

                                {Array.from(
                                  { length: feedbackPageCount },
                                  (_, idx) => {
                                    const page = idx + 1;
                                    return (
                                      <PaginationItem key={page}>
                                        <PaginationLink
                                          href="#"
                                          isActive={page === feedbackPage}
                                          onClick={(event) => {
                                            event.preventDefault();
                                            setFeedbackPage(page);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          {page}
                                        </PaginationLink>
                                      </PaginationItem>
                                    );
                                  },
                                )}

                                <PaginationItem>
                                  <PaginationNext
                                    href="#"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      setFeedbackPage((prev) =>
                                        Math.min(feedbackPageCount, prev + 1),
                                      );
                                    }}
                                    className={
                                      feedbackPage === feedbackPageCount
                                        ? "pointer-events-none opacity-40 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card
                  onClick={() => {
                    handleTabChange("configuration");
                    setTimeout(() => {
                      const el = document.getElementById("review-platforms-card");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="glass-card glass-card-hover cursor-pointer border border-slate-200/90 hover:border-teal-300 hover:shadow-md transition-all group"
                  title="Click to manage review platforms in Settings"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                        <Link className="h-5 w-5 text-teal-600" />
                        Review Platform Links
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Manage your review destinations
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-slate-200 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-xs font-semibold shadow-2xs gap-1.5 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTabChange("configuration");
                        setTimeout(() => {
                          const el = document.getElementById("review-platforms-card");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}
                    >
                      <span>Configure in Settings</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {reviewLinks.length === 0 ? (
                      <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 transition group-hover:bg-teal-50/40 group-hover:border-teal-300">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-200 mb-2.5 group-hover:scale-105 transition-transform">
                          <Plus className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-teal-800 transition-colors">
                          No review links configured yet
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Click this card to connect Google, Trustpilot, or custom review destinations in Settings
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {reviewLinks.map((link) => (
                          <div
                            key={link.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white/85 p-3.5 transition hover:bg-slate-50 hover:border-slate-300"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900">
                                {link.platform_name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-500 font-mono">
                                {link.url}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteReviewLink(link.id);
                              }}
                              className="ml-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete link"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.7fr]">
                <Card className="glass-card glass-card-hover">
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Rating</CardTitle>
                    <CardDescription>
                      Your average private feedback score
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-7">
                    <div className="relative h-36 w-36">
                      <svg
                        className="h-full w-full -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#1D4ED8"
                          strokeWidth="8"
                          strokeDasharray={`${(averageRating / 5) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-slate-900">
                          {averageRatingText}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">
                      Based on {totalFeedback} submitted responses
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card glass-card-hover">
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">Feedback Trend</CardTitle>
                      <CardDescription>
                        Feedback activity across the last 8 completed weeks (
                        {trendRangeLabel})
                      </CardDescription>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                          Total
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {totalFeedback}
                        </p>
                      </div>
                      <div className="rounded-lg border border-teal-200 bg-teal-50 px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                          Month
                        </p>
                        <p className="text-sm font-bold text-teal-700">
                          {feedbackThisMonth}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                          Links
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {activeLinks}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={230}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="week"
                          stroke="#334155"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis stroke="#334155" style={{ fontSize: "12px" }} />
                        <Tooltip
                          labelFormatter={(value, payload) => {
                            const item = payload?.[0]?.payload as
                              | { range?: string }
                              | undefined;
                            return item?.range ?? String(value);
                          }}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #CBD5E1",
                            borderRadius: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#1D4ED8"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-base">Team Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-blue-700 sm:text-5xl">
                      {teamMembers.length}
                    </p>
                    <p className="text-lg text-gray-400">/ {teamMemberLimit}</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        Usage
                      </span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-bold text-blue-700">
                        {Math.min(
                          100,
                          Math.round(
                            (teamMembers.length / teamMemberLimit) * 100,
                          ),
                        )}
                        %
                      </span>
                    </div>
                    <div className="metric-track">
                      <div
                        className="metric-fill bg-blue-600"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (teamMembers.length / teamMemberLimit) * 100,
                            ),
                          )}%`,
                        }}
                      >
                        <span className="metric-knob" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-600">
                    Seats currently used on {selectedPlan} plan
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-base">Active Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-4xl font-bold text-blue-700 sm:text-5xl">
                    {activeLinks}
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        Platforms
                      </span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-bold text-blue-700">
                        {Math.min(100, activeLinks * 20)}%
                      </span>
                    </div>
                    <div className="metric-track">
                      <div
                        className="metric-fill bg-blue-600"
                        style={{ width: `${Math.min(100, activeLinks * 20)}%` }}
                      >
                        <span className="metric-knob" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-600">
                    Connected review platforms
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-base">Reviews Collected</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-4xl font-bold text-blue-700 sm:text-5xl">
                    {totalFeedback}
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        Progress
                      </span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-bold text-blue-700">
                        {Math.min(100, totalFeedback * 10)}%
                      </span>
                    </div>
                    <div className="metric-track">
                      <div
                        className="metric-fill bg-blue-600"
                        style={{
                          width: `${Math.min(100, totalFeedback * 10)}%`,
                        }}
                      >
                        <span className="metric-knob" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-600">
                    Total feedback entries
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover lg:col-span-3">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200/90 bg-white/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Team
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {teamMembers.length} Member
                      {teamMembers.length === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Plan limit: {teamMemberLimit} seats
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/90 bg-white/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Integrations
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {activeLinks} Active
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Review platforms connected
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/90 bg-white/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Feedback
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {feedbackThisMonth} This Month
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Private review activity
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

          {activeTab === "configuration" && (
            <div className="grid grid-cols-1 gap-6">
              <Card id="review-platforms-card" className="glass-card glass-card-hover scroll-mt-20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Link className="h-5 w-5 text-blue-600" />
                        Review Platforms
                      </CardTitle>
                      <CardDescription>
                        Manage destinations for positive reviews
                      </CardDescription>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPlatformSetupGuide((prev) => !prev)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                    >
                      How to setup
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showPlatformSetupGuide && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-slate-700">
                      <p className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                        <GoogleLogo className="h-4 w-4" />
                        How to setup Google review link
                      </p>
                      <ol className="list-decimal space-y-1.5 pl-5">
                        <li>
                          Open Google's Place ID Finder:{" "}
                          <a
                            href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block max-w-full break-words font-medium text-blue-700 underline"
                          >
                            https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
                          </a>
                        </li>
                        <li>Search your shop name or location in the map search.</li>
                        <li>
                          Copy the <strong>Place ID</strong> (e.g.,{" "}
                          <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs text-blue-900">
                            ChIJN1t_tDeuEmsRUsoyG83frY4
                          </code>
                          ).
                        </li>
                        <li>
                          Paste the copied Place ID directly into the <strong>Platform URL</strong> field below — our system will automatically generate your official Google review link!
                        </li>
                      </ol>
                    </div>
                  )}

                  <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
                    {reviewLinks.length === 0 && (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500">
                        No platform links yet
                      </div>
                    )}
                    {reviewLinks.map((item) => {
                      const isGoogle =
                        item.platform_name.toLowerCase().includes("google") ||
                        item.url.includes("google.com");

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-white/85 px-3 py-2.5 transition hover:bg-white shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white shadow-2xs">
                              {isGoogle ? (
                                <GoogleLogo className="h-4 w-4" />
                              ) : (
                                <Link className="h-4 w-4 text-slate-500" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.platform_name}
                                </p>
                                {isGoogle && (
                                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                                    Official
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-gray-500">
                                {item.url}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReviewLink(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <Label>Add New Platform</Label>
                      <button
                        type="button"
                        onClick={() => setNewPlatform("Google")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                      >
                        <GoogleLogo className="h-3 w-3" />
                        Set to Google
                      </button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-[1fr_1.4fr_auto]">
                      <div className="relative">
                        <Input
                          placeholder="Platform name (e.g. Google)"
                          value={newPlatform}
                          onChange={(e) => setNewPlatform(e.target.value)}
                          className={`border-slate-200 bg-white/85 ${
                            newPlatform.toLowerCase().includes("google") ? "pl-9" : ""
                          }`}
                        />
                        {newPlatform.toLowerCase().includes("google") && (
                          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                            <GoogleLogo className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder="Paste Place ID (e.g. ChIJ...) or Platform URL"
                        value={newUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onPaste={handleUrlPaste}
                        className="border-slate-200 bg-white/85"
                      />
                      <Button
                        onClick={addReviewLink}
                        className="whitespace-nowrap"
                      >
                        <Plus className="mr-1 h-4 w-4" /> Add
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      💡 Tip: Paste your copied Google Place ID directly — the full review link is generated automatically.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle>Business Settings</CardTitle>
                  <CardDescription>
                    Manage business details and public review link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your Business Name"
                        className="border-slate-200 bg-white/85"
                      />
                      <Button
                        onClick={updateBusinessName}
                        className="whitespace-nowrap"
                      >
                        Save Name
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Review Link</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={reviewUrl}
                        readOnly
                        className="border-slate-200 bg-white/85"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyLink}
                        className="self-start sm:self-auto"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Team Management</CardTitle>
                      <CardDescription>
                        Manage team members in dedicated list, add, and edit
                        screens
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/dashboard/team-members")}
                    >
                      Open Full Team Screens
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-xl border border-slate-200/90 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        Plan: {selectedPlan}
                      </p>
                      <p className="text-sm text-slate-600">
                        Seats used: {teamMembers.length}/{teamMemberLimit}
                      </p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-teal-600"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (teamMembers.length / teamMemberLimit) * 100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Use the dedicated Team Members module for all add, edit, and
                    remove actions. Limits are enforced based on your current
                    subscription plan.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your account profile and login security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.email ?? ""}
                      readOnly
                      className="border-slate-200 bg-slate-100"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={profileFirstName}
                        onChange={(e) => setProfileFirstName(e.target.value)}
                        placeholder="First name"
                        className="border-slate-200 bg-white/85"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={profileLastName}
                        onChange={(e) => setProfileLastName(e.target.value)}
                        placeholder="Last name"
                        className="border-slate-200 bg-white/85"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input
                        type={showProfilePassword ? "text" : "password"}
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="border-slate-200 bg-white/85 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProfilePassword((prev) => !prev)}
                        className="absolute inset-y-0 right-2 inline-flex items-center text-slate-500 transition-colors hover:text-slate-800"
                        aria-label={
                          showProfilePassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showProfilePassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={saveProfileSettings}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle>Monthly Review Goal</CardTitle>
                  <CardDescription>
                    Add or edit your monthly target for collected feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Monthly Goal Target</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={monthlyGoalConfig}
                      onChange={(e) =>
                        setMonthlyGoalConfig(
                          Math.max(1, Number(e.target.value || 1)),
                        )
                      }
                      className="border-slate-200 bg-white/85"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-300/80 bg-white/80 px-4 py-3 text-sm text-slate-700">
                    Current progress: {feedbackThisMonth} of {monthlyGoal} this
                    month ({monthlyProgress}%)
                  </div>

                  <div className="rounded-xl border border-slate-300/80 bg-white/80 px-4 py-3 text-sm text-slate-700">
                    Recommended baseline based on active channels:{" "}
                    {recommendedMonthlyGoal}
                  </div>

                  <Button onClick={saveMonthlyGoal} disabled={isSavingGoal}>
                    {isSavingGoal ? "Saving..." : "Save Monthly Goal"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      </div>

      <AlertDialog
        open={feedbackDeleteDialogOpen}
        onOpenChange={(open) => {
          setFeedbackDeleteDialogOpen(open);
          if (!open) {
            setPendingDeleteIds([]);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDeleteIds.length > 1
                ? "Delete selected comments?"
                : "Delete this comment?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteIds.length > 1
                ? `This will permanently remove ${pendingDeleteIds.length} comments from Latest Feedback.`
                : "This will permanently remove the selected comment from Latest Feedback."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingFeedback}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFeedbackDelete}
              disabled={isDeletingFeedback}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeletingFeedback ? "Deleting..." : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Support / Need Help Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl">
          <DialogHeader className="space-y-1.5 pr-6 text-left">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200/80 shadow-2xs">
                <HelpCircle className="h-6 w-6" />
              </span>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                  Need Help & Support?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Send a message directly to our admin team. We are here to help you.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleHelpSubmit} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Logged-in Email (Auto-filled)
              </Label>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="h-10 bg-slate-50 border-slate-200 text-slate-800 font-medium cursor-not-allowed text-sm rounded-xl"
              />
              <p className="text-[11px] text-slate-400">
                Admin response will be sent to this email address.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="help-message"
                className="text-xs font-semibold text-slate-700"
              >
                Enter your support request or question
              </Label>
              <Textarea
                id="help-message"
                rows={4}
                required
                placeholder="Enter your support request, question, or anything you need help with. Our admin team will help you..."
                value={helpMessage}
                onChange={(e) => setHelpMessage(e.target.value)}
                className="resize-none rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setHelpModalOpen(false)}
                className="h-10 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingHelp || !helpMessage.trim()}
                className="h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {isSubmittingHelp ? "Submitting..." : "Submit to Admin"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookmarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5 2h14a1 1 0 0 1 1 1v19l-8-5-8 5V3a1 1 0 0 1 1-1z" />
    </svg>
  );
}
