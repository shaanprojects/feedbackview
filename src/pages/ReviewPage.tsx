import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, Zap, CheckCircle, Globe } from "lucide-react";
import { siFacebook, siYelp } from "simple-icons/icons";

type PlatformVisual = {
  icon: JSX.Element;
  activeClass: string;
  idleClass: string;
  iconContainerClass: string;
};

type BrandSvgProps = {
  title: string;
  path: string;
  hex: string;
  fillOverride?: string;
  className?: string;
};

function BrandSvg({
  title,
  path,
  hex,
  fillOverride,
  className = "h-3.5 w-3.5",
}: BrandSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title}
    >
      <path d={path} fill={fillOverride ?? `#${hex}`} />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" role="img" aria-label="Google">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.196 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.958 3.042l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.958 3.042l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.147 35.091 26.671 36 24 36c-5.176 0-9.623-3.329-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-1.058 2.833-3.057 5.166-5.984 6.571l6.19 5.238C35.071 40.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function ReviewPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const [businessName, setBusinessName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [reviewLinks, setReviewLinks] = useState<
    { platform_name: string; url: string }[]
  >([]);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"rate" | "positive" | "negative">("rate");
  const [selectedReviewUrls, setSelectedReviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    const load = async () => {
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .maybeSingle();

      if (!biz) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setBusinessName(biz.name);

      const { data: links } = await supabase
        .from("review_links")
        .select("platform_name, url")
        .eq("business_id", businessId);

      setReviewLinks(links || []);
      setLoading(false);
    };

    void load();
  }, [businessId]);

  const handleRate = (nextRating: number) => {
    setRating(nextRating);
    setSubmitted(false);
    setMessage("");
    setSelectedReviewUrls([]);

    if (nextRating >= 4) {
      setStep("positive");
      return;
    }

    setStep("negative");
  };

  const toggleReviewLinkSelection = (url: string, checked: boolean) => {
    setSelectedReviewUrls((prev) => {
      if (checked) {
        return prev.includes(url) ? prev : [...prev, url];
      }
      return prev.filter((selectedUrl) => selectedUrl !== url);
    });
  };

  const copyReviewToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const fallbackTextArea = document.createElement("textarea");
    fallbackTextArea.value = text;
    fallbackTextArea.style.position = "fixed";
    fallbackTextArea.style.opacity = "0";
    document.body.appendChild(fallbackTextArea);
    fallbackTextArea.focus();
    fallbackTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(fallbackTextArea);
  };

  const getPlatformVisual = (platformName: string): PlatformVisual => {
    const normalized = platformName.toLowerCase();

    if (normalized.includes("google")) {
      return {
        icon: <GoogleLogo />,
        activeClass: "border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]",
        idleClass:
          "border-[#d2e3fc] bg-white text-[#1a73e8] hover:bg-[#f7faff]",
        iconContainerClass: "bg-white",
      };
    }

    if (normalized.includes("facebook")) {
      return {
        icon: (
          <BrandSvg
            title="Facebook"
            path={siFacebook.path}
            hex={siFacebook.hex}
            fillOverride="#ffffff"
            className="h-4 w-4"
          />
        ),
        activeClass: "border-[#1877f2] bg-[#e7f0ff] text-[#1877f2]",
        idleClass:
          "border-[#cfe2ff] bg-white text-[#1877f2] hover:bg-[#f5f9ff]",
        iconContainerClass: "bg-[#1877f2]",
      };
    }

    if (normalized.includes("yelp")) {
      return {
        icon: <BrandSvg title="Yelp" path={siYelp.path} hex={siYelp.hex} />,
        activeClass: "border-[#d32323] bg-[#ffefef] text-[#d32323]",
        idleClass:
          "border-[#f6cdcd] bg-white text-[#d32323] hover:bg-[#fff6f6]",
        iconContainerClass: "bg-white",
      };
    }

    return {
      icon: <Globe className="h-3.5 w-3.5" />,
      activeClass: "border-primary bg-primary/10 text-primary",
      idleClass: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      iconContainerClass: "bg-slate-700 text-white",
    };
  };

  const submitPositiveReview = async () => {
    const reviewText = message.trim();

    if (!reviewText) {
      toast.error("Please write your review before continuing.");
      return;
    }

    if (reviewLinks.length === 0) {
      toast.error("No review platform configured for this business yet.");
      return;
    }

    if (selectedReviewUrls.length === 0) {
      toast.error("Please select at least one review platform.");
      return;
    }

    try {
      await copyReviewToClipboard(reviewText);
    } catch {
      toast.error("Unable to copy your review text. Please copy it manually.");
      return;
    }

    let openedCount = 0;
    selectedReviewUrls.forEach((url) => {
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (popup) {
        openedCount += 1;
      }
    });

    if (openedCount === 0) {
      toast.error(
        "Your browser blocked new tabs. Please allow pop-ups and try again.",
      );
      return;
    }

    toast.success(
      openedCount === 1
        ? "Review copied. We opened the selected site. Paste your review there."
        : `Review copied. Opened ${openedCount} sites. Paste your review on each one.`,
    );
  };

  const submitFeedback = async () => {
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    const { error } = await supabase
      .from("feedback")
      .insert({ business_id: businessId!, rating, message: message.trim() });

    if (error) {
      toast.error("Failed to submit feedback");
    } else {
      setSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">Business not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{businessName}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "rate" && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">How was your experience?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleRate(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                    aria-label={`Set rating to ${s} stars`}
                  >
                    <Star
                      className={`h-10 w-10 ${
                        s <= (hoverRating || rating)
                          ? "text-warning fill-warning"
                          : "text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "positive" && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <p className="text-center text-foreground font-medium">
                Thanks for your positive rating.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Write your review, choose platforms, then submit. We will copy
                your text and open each selected site so you can paste it there.
              </p>

              <div
                className="flex justify-center gap-1"
                aria-label={`Selected rating: ${rating} out of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} aria-hidden="true">
                    <Star
                      className={`h-6 w-6 ${
                        s <= rating ? "text-warning fill-warning" : "text-muted"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <Textarea
                placeholder="Write your review"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Choose where to post
                </p>
                {reviewLinks.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    No review platform configured yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {reviewLinks.map((link) => {
                      const visual = getPlatformVisual(link.platform_name);
                      const isSelected = selectedReviewUrls.includes(link.url);

                      return (
                        <button
                          type="button"
                          key={`${link.platform_name}-${link.url}`}
                          onClick={() =>
                            toggleReviewLinkSelection(link.url, !isSelected)
                          }
                          className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                            isSelected ? visual.activeClass : visual.idleClass
                          }`}
                          aria-pressed={isSelected}
                        >
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${visual.iconContainerClass}`}
                            aria-hidden="true"
                          >
                            {visual.icon}
                          </span>
                          <span>{link.platform_name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={submitPositiveReview}
                disabled={reviewLinks.length === 0}
              >
                Submit
              </Button>
            </div>
          )}

          {step === "negative" && !submitted && (
            <div className="space-y-4">
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleRate(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                    aria-label={`Set rating to ${s} stars`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        s <= (hoverRating || rating)
                          ? "text-warning fill-warning"
                          : "text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-muted-foreground text-sm">
                We'd love to hear how we can improve. You can change your rating
                anytime.
              </p>
              <Textarea
                placeholder="Tell us about your experience..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button className="w-full" onClick={submitFeedback}>
                Submit Feedback
              </Button>
            </div>
          )}

          {submitted && (
            <div className="text-center space-y-2 py-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <p className="font-medium text-foreground">
                Thank you for your feedback!
              </p>
              <p className="text-sm text-muted-foreground">
                We appreciate you taking the time to help us improve.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
