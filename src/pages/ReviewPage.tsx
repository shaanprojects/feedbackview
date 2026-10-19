import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Globe,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Star,
} from "lucide-react";
import { siFacebook, siYelp } from "simple-icons/icons";
import { GoogleLogo } from "@/components/GoogleLogo";
import reviewBg from "@/assets/review-bg.jpg";

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
  className = "h-4 w-4",
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

export default function ReviewPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const [businessName, setBusinessName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [reviewLinks, setReviewLinks] = useState<
    { platform_name: string; url: string }[]
  >([]);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"rate" | "positive" | "negative">("rate");
  const [selectedReviewUrls, setSelectedReviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlatformName = useMemo(() => {
    if (selectedReviewUrls.length === 0 || reviewLinks.length === 0) {
      return reviewLinks[0]?.platform_name || "Google";
    }
    const found = reviewLinks.find((l) => l.url === selectedReviewUrls[0]);
    return found?.platform_name || "Google";
  }, [selectedReviewUrls, reviewLinks]);

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

      const loadedLinks = links || [];
      setReviewLinks(loadedLinks);
      if (loadedLinks.length > 0) {
        const googleLink = loadedLinks.find((l) =>
          l.platform_name.toLowerCase().includes("google"),
        );
        setSelectedReviewUrls([googleLink ? googleLink.url : loadedLinks[0].url]);
      }
      setLoading(false);
    };

    void load();
  }, [businessId]);

  const handleRate = (nextRating: number) => {
    setRating(nextRating);
    setSubmitted(false);
    setMessage("");
    setContactInfo("");

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

  const getPlatformVisual = (platformName: string): PlatformVisual => {
    const normalized = platformName.toLowerCase();

    if (normalized.includes("google")) {
      return {
        icon: <GoogleLogo className="h-4 w-4" />,
        activeClass:
          "border-[#1a73e8] bg-[#f8fbff] text-[#1a73e8] ring-1 ring-[#1a73e8]/30",
        idleClass:
          "border-[#ECEAE5] bg-white text-[#222222] hover:border-stone-400 hover:bg-[#FAF9F5]",
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
            className="h-3.5 w-3.5"
          />
        ),
        activeClass:
          "border-[#1877f2] bg-[#f5f9ff] text-[#1877f2] ring-1 ring-[#1877f2]/30",
        idleClass:
          "border-[#ECEAE5] bg-white text-[#222222] hover:border-stone-400 hover:bg-[#FAF9F5]",
        iconContainerClass: "bg-[#1877f2]",
      };
    }

    if (normalized.includes("yelp")) {
      return {
        icon: (
          <BrandSvg
            title="Yelp"
            path={siYelp.path}
            hex={siYelp.hex}
            className="h-3.5 w-3.5"
          />
        ),
        activeClass:
          "border-[#d32323] bg-[#fff8f8] text-[#d32323] ring-1 ring-[#d32323]/30",
        idleClass:
          "border-[#ECEAE5] bg-white text-[#222222] hover:border-stone-400 hover:bg-[#FAF9F5]",
        iconContainerClass: "bg-white",
      };
    }

    return {
      icon: <Globe className="h-4 w-4" />,
      activeClass: "border-[#111111] bg-[#FAF9F5] text-[#111111]",
      idleClass: "border-[#ECEAE5] bg-white text-[#222222] hover:bg-[#FAF9F5]",
      iconContainerClass: "bg-[#111111] text-white",
    };
  };

  const submitPositiveReview = () => {
    if (reviewLinks.length === 0) {
      toast.error("No review platform configured for this business yet.");
      return;
    }

    const targetUrls =
      selectedReviewUrls.length > 0
        ? selectedReviewUrls
        : [reviewLinks[0].url];

    let openedCount = 0;
    targetUrls.forEach((url) => {
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (popup) {
        openedCount += 1;
      }
    });

    if (openedCount === 0) {
      toast.error(
        "Your browser blocked the review page popup. Please allow popups and try again.",
      );
      return;
    }

    setSubmitted(true);
    toast.success("Opening review platform. Thank you for your support!");
  };

  const submitFeedback = async () => {
    if (!message.trim()) {
      toast.error("Please enter a few words about your experience.");
      return;
    }

    setIsSubmitting(true);
    const finalMessage = contactInfo.trim()
      ? `${message.trim()}\n\nContact: ${contactInfo.trim()}`
      : message.trim();

    const { error } = await supabase
      .from("feedback")
      .insert({ business_id: businessId!, rating, message: finalMessage });

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 font-sans"
        style={{
          backgroundImage: `linear-gradient(rgba(17, 17, 19, 0.45), rgba(17, 17, 19, 0.55)), url(${reviewBg})`,
        }}
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-md border border-white/40">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#111111] border-t-transparent" />
          <p className="text-sm font-semibold text-[#111111]">
            Loading survey...
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 font-sans"
        style={{
          backgroundImage: `linear-gradient(rgba(17, 17, 19, 0.45), rgba(17, 17, 19, 0.55)), url(${reviewBg})`,
        }}
      >
        <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF9F5] text-[#111111] border border-[#ECEAE5]">
            <Globe className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-[#111111] tracking-tight">
            Business Not Found
          </h2>
          <p className="mt-2 text-sm text-[#666666] leading-relaxed">
            This review link appears to be invalid or has expired. Please check
            the QR code or link provided.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between bg-cover bg-center bg-fixed bg-no-repeat px-4 py-10 sm:py-16 font-sans selection:bg-[#F1EAFA] selection:text-[#7C3AED]"
      style={{
        backgroundImage: `linear-gradient(rgba(17, 17, 19, 0.46), rgba(17, 17, 19, 0.58)), url(${reviewBg})`,
      }}
    >
      <div className="w-full max-w-xl my-auto">
        {/* Main Card with Kit-style architecture */}
        <div className="relative rounded-3xl border-[2mm] border-transparent bg-clip-padding ring-[2mm] ring-white bg-white/95 p-7 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-md">
          {/* SCREEN 1: INITIAL STAR RATING SCREEN */}
          {step === "rate" && !submitted && (
            <div className="text-center">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-1.5 rounded-md bg-[#F1EAFA] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#7C3AED]">
                Customer Review
              </div>

              {/* Bold Editorial Business Title */}
              <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-[#111111]">
                {businessName}
              </h1>

              {/* Subtitle with user's exact wording: "service" instead of "team" */}
              <p className="mt-3 text-base text-[#555555] font-normal max-w-md mx-auto leading-relaxed">
                Thank you for visiting! How was your experience with our{" "}
                <strong className="font-semibold text-[#111111]">service</strong>{" "}
                today?
              </p>

              {/* Interactive Star Rating */}
              <div className="mt-8 mb-3">
                <div className="flex justify-center items-center gap-2.5 sm:gap-4 py-2">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const isFilled = s <= (hoverRating || rating);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleRate(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="group relative transform transition-all duration-150 hover:scale-120 active:scale-95 focus:outline-none"
                        aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-11 w-11 sm:h-13 sm:w-13 transition-all duration-150 ${
                            isFilled
                              ? "fill-[#F59E0B] text-[#F59E0B] drop-shadow-sm"
                              : "text-[#DCDAD4] fill-[#FAF9F5] hover:text-[#FBBF24]"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Rating sentiment label */}
                <div className="mt-3 h-8 flex items-center justify-center">
                  {hoverRating > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all animate-in fade-in zoom-in-95 duration-150 bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                      {hoverRating === 5 && "⭐ Outstanding! Loved everything! 🎉"}
                      {hoverRating === 4 && "⭐ Great service! Very happy 😊"}
                      {hoverRating === 3 && "⭐ It was okay / average 🙂"}
                      {hoverRating === 2 && "⭐ Could be better 😐"}
                      {hoverRating === 1 && "⭐ Not satisfied / poor 😞"}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#888888]">
                      Tap a star to share your rating
                    </span>
                  )}
                </div>
              </div>

              {/* Kit-style Stat & Proof Cards */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#F0EFEA] pt-6">
                <div className="rounded-2xl border border-[#ECEAE5] bg-[#FAF9F5] p-3 text-center transition-all hover:border-stone-300">
                  <div className="text-lg sm:text-xl font-black text-[#111111]">
                    &lt;30s
                  </div>
                  <div className="text-[11px] font-medium text-[#777777] mt-0.5">
                    Quick & simple
                  </div>
                </div>

                <div className="rounded-2xl border border-[#ECEAE5] bg-[#FAF9F5] p-3 text-center transition-all hover:border-stone-300">
                  <div className="text-lg sm:text-xl font-black text-[#111111]">
                    100%
                  </div>
                  <div className="text-[11px] font-medium text-[#777777] mt-0.5">
                    Direct feedback
                  </div>
                </div>

                <div className="rounded-2xl border border-[#ECEAE5] bg-[#FAF9F5] p-3 text-center transition-all hover:border-stone-300">
                  <div className="text-lg sm:text-xl font-black text-[#111111]">
                    5-Star
                  </div>
                  <div className="text-[11px] font-medium text-[#777777] mt-0.5">
                    Quality service
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: POSITIVE EXPERIENCE (RATING >= 4) */}
          {step === "positive" && !submitted && (
            <div className="space-y-6">
              {/* Top Row: Status badge on left, Rating on right */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                  ❤️ Thank You So Much
                </div>

                <div className="flex items-center gap-1 rounded-full bg-[#FFFBEB] px-3 py-1 text-xs font-bold text-[#B45309] border border-[#FDE68A]">
                  <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{rating}.0 Rating</span>
                </div>
              </div>

              {/* Editorial Header */}
              <div className="space-y-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  Thank you! We're so glad you enjoyed our service 🎉
                </h2>
                <p className="text-sm text-[#555555] leading-relaxed">
                  It was truly a pleasure serving you! As a small local business, every
                  5-star review helps us keep doing what we love. Take 10 seconds to share
                  your support on Google — it means the world to us! ✨
                </p>
              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full h-12 rounded-2xl bg-[#111111] text-white hover:bg-black font-bold text-sm tracking-wide shadow-sm gap-2.5 transition-all cursor-pointer"
                  onClick={submitPositiveReview}
                  disabled={reviewLinks.length === 0}
                >
                  <GoogleLogo className="h-4 w-4 shrink-0" />
                  <span>Leave Review on Google</span>
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </Button>

                <p className="text-center text-[11px] text-[#888888]">
                  Tap to open Google directly and share your 5-star experience.
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 3: NEGATIVE / PRIVATE FEEDBACK (RATING <= 3) */}
          {step === "negative" && !submitted && (
            <div className="space-y-6">
              {/* Top navigation row */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("rate")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#666666] hover:text-[#111111] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Change rating</span>
                </button>

                <div className="flex items-center gap-1 rounded-full bg-[#F7F5F0] px-3 py-1 text-xs font-bold text-[#444444] border border-[#ECEAE5]">
                  <Star className="h-3.5 w-3.5 fill-[#777777] text-[#777777]" />
                  <span>{rating}.0 Rating</span>
                </div>
              </div>

              {/* Editorial Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-[#FEF2F2] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
                  Private Feedback
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  Help us improve our service
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Your satisfaction is our priority. Please let our leadership
                  know what happened so we can make things right.
                </p>
              </div>

              {/* Private Feedback Textarea */}
              <div className="space-y-1.5">
                <Textarea
                  placeholder="Tell us what went wrong and how we can improve..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="rounded-2xl border-[#ECEAE5] bg-[#FAF9F5]/50 text-sm font-normal text-[#111111] placeholder:text-[#999999] focus:border-[#111111] focus:bg-white focus:ring-0 leading-relaxed"
                />
              </div>

              {/* Optional Contact Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#555555] flex items-center justify-between">
                  <span>Your email or phone</span>
                  <span className="text-[11px] text-[#888888] font-normal">Optional</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. name@example.com or (555) 000-0000"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="h-11 rounded-2xl border-[#ECEAE5] bg-[#FAF9F5]/50 text-sm font-normal text-[#111111] placeholder:text-[#999999] focus:border-[#111111] focus:bg-white focus:ring-0"
                />
              </div>

              {/* Confidentiality Notice */}
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#FAF9F5] p-3.5 border border-[#ECEAE5] text-xs text-[#555555]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#111111] mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[#111111] font-bold">
                    100% Private & Direct:
                  </strong>{" "}
                  This note is delivered directly to management so we can
                  rectify the issue and improve our service.
                </p>
              </div>

              {/* Submit Feedback Button */}
              <Button
                className="w-full h-12 rounded-2xl bg-[#111111] hover:bg-black text-white font-bold text-sm tracking-wide shadow-sm"
                onClick={submitFeedback}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Submit Private Feedback"}
              </Button>
            </div>
          )}

          {/* SCREEN 4: THANK YOU / SUBMISSION COMPLETE */}
          {submitted && (
            <div className="text-center space-y-4 py-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-[#ECFDF5] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                Submission Received
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
                Thank you so much! 🎉
              </h2>

              <p className="text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
                Your feedback has been received. We truly appreciate you taking
                the time to help <span className="font-semibold text-[#111111]">{businessName}</span> deliver
                the best service possible.
              </p>

              <div className="pt-6 border-t border-[#F0EFEA]">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("rate");
                    setSubmitted(false);
                    setRating(0);
                    setMessage("");
                    setContactInfo("");
                  }}
                  className="rounded-xl border-[#ECEAE5] text-xs font-bold text-[#444444] hover:bg-[#FAF9F5]"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  <span>Submit another response</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Minimal Editorial Footer */}
        <div className="mt-8 text-center text-xs text-white/90 drop-shadow-sm">
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <span className="text-white/80">Powered by</span>
            <span className="font-bold text-white">TrueRep</span>
          </div>
          <p className="text-[11px] text-white/70 mt-0.5">
            Helping local businesses deliver 5-star service
          </p>
        </div>
      </div>
    </div>
  );
}
