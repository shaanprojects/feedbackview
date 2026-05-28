import { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
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
import { ArrowLeft, CreditCard, Eye, EyeOff, Zap } from "lucide-react";
import dashboardBg from "@/assets/bg.png";

type PlanId = "starter" | "professional" | "enterprise";
type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

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

const detectCardBrand = (digits: string): CardBrand => {
  if (!digits) {
    return "unknown";
  }

  const firstTwo = Number(digits.slice(0, 2));
  const firstThree = Number(digits.slice(0, 3));
  const firstFour = Number(digits.slice(0, 4));

  if (digits.startsWith("4")) {
    return "visa";
  }

  if (
    (firstTwo >= 51 && firstTwo <= 55) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "mastercard";
  }

  if (digits.startsWith("34") || digits.startsWith("37")) {
    return "amex";
  }

  if (
    digits.startsWith("6011") ||
    digits.startsWith("65") ||
    (firstThree >= 644 && firstThree <= 649)
  ) {
    return "discover";
  }

  return "unknown";
};

const formatCardNumber = (digits: string, brand: CardBrand) => {
  if (brand === "amex") {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }

  return (
    digits
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(" ") ?? ""
  );
};

const getCardBrandLabel = (brand: CardBrand) => {
  if (brand === "visa") return "VISA";
  if (brand === "mastercard") return "Mastercard";
  if (brand === "amex") return "AmEx";
  if (brand === "discover") return "Discover";
  return "Card";
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const cardDigits = useMemo(() => cardNumber.replace(/\D/g, ""), [cardNumber]);
  const cardBrand = useMemo(() => detectCardBrand(cardDigits), [cardDigits]);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  };

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

  const handleCardNumberChange = (value: string) => {
    const nextDigits = value.replace(/\D/g, "");
    const nextBrand = detectCardBrand(nextDigits);
    const maxDigits = nextBrand === "amex" ? 15 : 16;
    const trimmed = nextDigits.slice(0, maxDigits);
    setCardNumber(formatCardNumber(trimmed, nextBrand));
  };

  const handleExpirationChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    if (digits.length <= 2) {
      setExpiration(digits);
      return;
    }

    setExpiration(`${digits.slice(0, 2)}/${digits.slice(2)}`);
  };

  const validateSignupFields = () => {
    if (!selectedPlan) {
      toast.error("Please select a subscription plan before signing up.");
      return false;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !stateCode.trim() ||
      !zipCode.trim()
    ) {
      toast.error("Please complete all required profile and address fields.");
      return false;
    }


    if (!country.trim()) {
      toast.error("Please enter your country.");
      return false;
    }

    if (cardBrand === "unknown") {
      toast.error("Please enter a valid Visa, Mastercard, Discover, or AmEx.");
      return false;
    }

    const expectedCardLength = cardBrand === "amex" ? 15 : 16;
    if (cardDigits.length !== expectedCardLength) {
      toast.error("Please enter a complete credit card number.");
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiration.trim())) {
      toast.error("Expiration must be in MM/YY or MM/YYYY format.");
      return false;
    }

    const [monthRaw, yearRaw] = expiration.split("/");
    const month = Number(monthRaw);
    let year = Number(yearRaw);
    if (yearRaw.length === 2) {
      year += 2000;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      year < currentYear ||
      (year === currentYear && month < currentMonth)
    ) {
      toast.error("Credit card expiration date must be in the future.");
      return false;
    }

    const cvvPattern = cardBrand === "amex" ? /^\d{4}$/ : /^\d{3}$/;
    if (!cvvPattern.test(cvv.trim())) {
      toast.error(
        cardBrand === "amex"
          ? "AmEx CVV must be 4 digits."
          : "CVV must be 3 digits.",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isLogin && !validateSignupFields()) {
      return;
    }

    if (!recaptchaSiteKey) {
      toast.error("Captcha is not configured. Add VITE_RECAPTCHA_SITE_KEY.");
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the captcha challenge.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password, captchaToken);
        if (error) {
          toast.error(error.message);
        } else {
          navigate("/dashboard");
        }
      } else {
        const [expMonth, expYear] = expiration.split("/");
        const signupData = {
          selectedPlan,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          address: {
            line1: addressLine1.trim(),
            line2: addressLine2.trim(),
            city: city.trim(),
            state: stateCode.trim().toUpperCase(),
            zip: zipCode.trim(),
            country,
          },
          paymentSummary: {
            brand: cardBrand,
            last4: cardDigits.slice(-4),
            expirationMonth: expMonth,
            expirationYear: expYear,
          },
        };

        const { error } = await signUp(
          email,
          password,
          captchaToken,
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
      resetCaptcha();
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Address
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        placeholder="e.g. Tamil Nadu"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input
                        id="zip"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="e.g. 600083"
                        required={!isLogin}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. United States"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">
                      Payment Information
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      <CreditCard className="h-3.5 w-3.5" />
                      {getCardBrandLabel(cardBrand)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Credit Card Number</Label>
                    <Input
                      id="cardNumber"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      required={!isLogin}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiration">Expiration (MM/YY)</Label>
                      <Input
                        id="expiration"
                        inputMode="numeric"
                        value={expiration}
                        onChange={(e) => handleExpirationChange(e.target.value)}
                        placeholder="MM/YY"
                        required={!isLogin}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        inputMode="numeric"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder={
                          cardBrand === "amex" ? "4 digits" : "3 digits"
                        }
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Security Check</Label>
              {recaptchaSiteKey ? (
                <div className="flex justify-center md:justify-start">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={recaptchaSiteKey}
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)}
                    onErrored={() => {
                      setCaptchaToken(null);
                      toast.error("Captcha verification failed. Please try again.");
                    }}
                  />
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  Captcha not configured. Set VITE_RECAPTCHA_SITE_KEY to enable
                  authentication.
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700"
              disabled={loading || !captchaToken || !recaptchaSiteKey}
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Sign Up & Subscribe"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                resetCaptcha();
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
