import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Zap } from "lucide-react";
import dashboardBg from "@/assets/bg.png";

type PlanId = "starter" | "professional" | "enterprise";

const signupPlans: Array<{
  id: PlanId;
  name: string;
  price: string;
  description: string;
}> = [
  {
    id: "starter",
    name: "Starter",
    price: "$29/month",
    description: "Perfect for small businesses getting started.",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$79/month",
    description: "Best for growing teams with advanced needs.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "Custom package for larger organizations.",
  },
];

const isPlanId = (value: string): value is PlanId =>
  signupPlans.some((plan) => plan.id === value);

const getPlanFromQuery = (value: string | null): PlanId | "" => {
  if (!value) {
    return "";
  }

  const normalized = value.toLowerCase();
  return isPlanId(normalized) ? normalized : "";
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const authMode = searchParams.get("mode");
  const selectedPlanFromQuery = useMemo(
    () => getPlanFromQuery(searchParams.get("plan")),
    [searchParams],
  );
  const [isLogin, setIsLogin] = useState(() => authMode !== "signup");
  const [selectedPlan, setSelectedPlan] = useState<PlanId | "">(
    selectedPlanFromQuery,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authMode === "signup") {
      setIsLogin(false);
      return;
    }

    if (authMode === "signin") {
      setIsLogin(true);
    }
  }, [authMode]);

  useEffect(() => {
    if (selectedPlanFromQuery) {
      setSelectedPlan(selectedPlanFromQuery);
    }
  }, [selectedPlanFromQuery]);

  const validateSignupFields = () => {
    if (!selectedPlan) {
      toast.error("Please select a subscription plan before signing up.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isLogin && !validateSignupFields()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          navigate("/dashboard");
        }
      } else {
        const signupData = {
          selectedPlan,
        };

        const { error } = await signUp(
          email,
          password,
          signupData,
        );

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created successfully");
          setIsLogin(true);
        }
      }
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

      <Card
        className={`w-full ${isLogin ? "max-w-md" : "max-w-2xl"} border border-white/90 bg-white/88 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl`}
      >
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              FeedbackView
            </span>
          </div>
          <CardTitle className="text-xl">
            {isLogin ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to manage your reviews"
              : "Start collecting customer feedback"}
          </CardDescription>
          <p className="mt-2 text-xs text-slate-500">
            {
              "Create account -> get QR code -> collect feedback -> grow faster."
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">User Name (Email)</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

            {!isLogin && (
              <>
                <div className="space-y-3">
                  <Label>Select Subscription Plan</Label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {signupPlans.map((plan) => {
                      const isSelected = selectedPlan === plan.id;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`rounded-xl border p-3 text-left transition ${isSelected ? "border-teal-600 bg-teal-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                        >
                          <div className="text-sm font-semibold text-slate-900">
                            {plan.name}
                          </div>
                          <div className="text-xs text-teal-700">
                            {plan.price}
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            {plan.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
