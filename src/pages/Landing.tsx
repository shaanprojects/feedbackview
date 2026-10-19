import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Star,
  CheckCircle,
  BarChart3,
  MessageCircle,
  TrendingUp,
  Zap,
  Plug,
  Shield,
  Mail,
  Link2,
  Search,
  Smartphone,
  Check,
  Plane,
  Package,
  User,
  Briefcase,
  Zap as ZapIcon,
  Menu,
  X,
  Utensils,
  Scissors,
  Stethoscope,
  Car,
  Wrench,
  Store,
  Sparkles,
  CheckCircle2,
  Rocket,
  Building2,
  Headphones,
  HeartHandshake,
  RefreshCw,
} from "lucide-react";
import dashboardBg from "@/assets/bg.png";

const features = [
  {
    icon: Zap,
    title: "Smart Review Routing",
    desc: "Automatically route 4 & 5-star ratings to your public Google Reviews, while intercepting lower ratings privately.",
  },
  {
    icon: Shield,
    title: "Private Complaint Interception",
    desc: "Unhappy customers submit private feedback with their contact details so you can resolve complaints before they hit Google.",
  },
  {
    icon: Smartphone,
    title: "Instant QR & NFC Tap",
    desc: "Customers simply scan with their phone camera on table stands, mirrors, or receipts. Zero app downloads needed.",
  },
  {
    icon: TrendingUp,
    title: "Google Maps SEO Surge",
    desc: "A consistent stream of verified 5-star Google reviews helps your business outrank local competitors on Google Maps.",
  },
  {
    icon: BarChart3,
    title: "Live Owner Dashboard",
    desc: "Monitor incoming Google reviews, sentiment trends, and private customer feedback tickets in one clean dashboard.",
  },
  {
    icon: MessageCircle,
    title: "Fast Customer Recovery",
    desc: "Direct contact info provided by unhappy customers allows managers to reach out and resolve issues within minutes.",
  },
];

const industries = [
  {
    icon: Utensils,
    iconColor: "text-amber-700 bg-amber-50 border-amber-200",
    name: "Food & Dining",
    sub: "Restaurants, cafes, bakeries & bars",
    desc: "Route happy diners straight to Google reviews while catching complaints privately before they hit Yelp.",
    spot: "Table tents & bill folders",
  },
  {
    icon: Scissors,
    iconColor: "text-rose-700 bg-rose-50 border-rose-200",
    name: "Salons & Spas",
    sub: "Barbers, stylists, nail bars & aesthetics",
    desc: "New clients pick stylists by star ratings. Capture glowing 5-star reviews in 10 seconds right from the chair.",
    spot: "Styling mirrors & checkout desk",
  },
  {
    icon: Stethoscope,
    iconColor: "text-teal-700 bg-teal-50 border-teal-200",
    name: "Clinics & Wellness",
    sub: "Dental, chiro, physio & medical practices",
    desc: "Handle patient concerns privately while encouraging satisfied patients to rank you #1 in local search.",
    spot: "Reception & appointment cards",
  },
  {
    icon: Wrench,
    iconColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    name: "Home Services & Trades",
    sub: "Plumbers, HVAC, electricians & cleaners",
    desc: "Homeowners never hire without reading reviews. Collect 5-star ratings right after completing the job.",
    spot: "Digital invoices & leave-behind cards",
  },
  {
    icon: Car,
    iconColor: "text-blue-700 bg-blue-50 border-blue-200",
    name: "Auto & Detailing",
    sub: "Mechanics, body shops, car wash & tire shops",
    desc: "Auto repair runs on trust. Turn customer relief into verified Google ratings right upon vehicle pickup.",
    spot: "Key tags & invoice footers",
  },
  {
    icon: Store,
    iconColor: "text-purple-700 bg-purple-50 border-purple-200",
    name: "Retail & Local Services",
    sub: "Boutiques, gyms, pet care & local shops",
    desc: "Convert everyday foot traffic into Google Maps dominance that beats out online and big-box competitors.",
    spot: "POS counter & shopping bags",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Bistro & Cafe Owner",
    icon: Briefcase,
    text: "True Repp helped us increase our Google rating from 3.4 to 4.8. Bad table experiences now reach me privately instead of ending up on Google!",
    rating: 5,
  },
  {
    name: "Elena Rostova",
    role: "Salon & Spa Founder",
    icon: User,
    text: "Clients scan our QR stand right at the styling chair. We collected over 180 verified five-star Google reviews in just 3 months.",
    rating: 5,
  },
  {
    name: "Dr. David Patel",
    role: "Dental Clinic Director",
    icon: Shield,
    text: "The private feedback route is a lifesaver. We resolve patient concerns immediately while happy patients boost our local search ranking.",
    rating: 5,
  },
  {
    name: "Marcus Vance",
    role: "HVAC & Plumbing Lead",
    icon: Wrench,
    text: "Technicians hand out our True Repp review card after every job. We now rank #1 on Google Maps for AC repair in our city.",
    rating: 5,
  },
  {
    name: "Carlos Mendez",
    role: "Auto Detailing & Garage Owner",
    icon: Check,
    text: "Customers love the 10-second 1-tap review when picking up their car. Our review count tripled without awkward begging.",
    rating: 5,
  },
  {
    name: "Ava Thompson",
    role: "Boutique Retail Owner",
    icon: Store,
    text: "Simple setup, zero hassle for customers. Having our QR on checkout bags turned casual shoppers into raving Google fans.",
    rating: 5,
  },
];

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: "29",
    desc: "Perfect for small businesses",
    features: [
      "Up to 10 locations",
      "Basic analytics",
      "Email support",
      "100 review requests/month",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "79",
    desc: "For growing businesses",
    features: [
      "Unlimited locations",
      "Advanced analytics",
      "Priority support",
      "Unlimited review requests",
      "AI Response Assistant",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    desc: "For large organizations",
    features: [
      "All Professional features",
      "Dedicated account manager",
      "Custom integrations",
      "API access",
      "White-label options",
    ],
  },
];

const businessOutcomes = [
  {
    icon: TrendingUp,
    stat: "+35%",
    statLabel: "More Local Walk-Ins",
    title: "Google Maps #1 Ranking",
    desc: "A steady flow of fresh 5-star reviews pushes your profile to the top 3 spots where 70% of local customers click.",
    tag: "Top Search Visibility",
  },
  {
    icon: Shield,
    stat: "$3,000+",
    statLabel: "Saved Per Bad Review",
    title: "Negative Review Shield",
    desc: "Intercepts 1 to 3-star ratings privately so you resolve customer complaints before they ever touch Google.",
    tag: "Zero Public Damage",
  },
  {
    icon: MessageCircle,
    stat: "88%",
    statLabel: "Customer Recovery",
    title: "Turn Complaints into Loyalty",
    desc: "Collects direct phone and email so management can follow up personally within minutes and win customers back.",
    tag: "Direct Contact Recovery",
  },
];

const userCommitments = [
  {
    icon: Headphones,
    badge: "< 15-Min Response",
    title: "Fast, Human Support for True Repp Users",
    desc: "No bots or runarounds. When business owners or managers need assistance with QR placement, staff scripts, or settings, our dedicated team is on standby.",
    highlight: "Live chat, email & priority WhatsApp for owners",
  },
  {
    icon: RefreshCw,
    badge: "Always Included",
    title: "Continuous Future Upgrades at Zero Cost",
    desc: "Your subscription gets better every month. We ship faster review flows, smarter AI reply tools, and new Google Maps integrations without charging upgrade fees.",
    highlight: "All future platform releases included automatically",
  },
  {
    icon: HeartHandshake,
    badge: "User-Driven Roadmap",
    title: "Your Feedback Directly Shapes the Software",
    desc: "We build around what business operators actually need. Over 80% of our product roadmap comes from ideas submitted by True Repp business users.",
    highlight: "Direct feature request portal in your dashboard",
  },
  {
    icon: Shield,
    badge: "99.9% Uptime",
    title: "Rock-Solid QR Speed & Reliability",
    desc: "When a customer scans your QR stand at checkout, it opens instantly. Our team maintains a high-speed global infrastructure so scans never lag or fail.",
    highlight: "Sub-second mobile loading on all smartphones",
  },
];

const faqs = [
  {
    q: "Is True Repp suitable for a brand new business starting with zero reviews?",
    a: "Yes! In fact, new ventures and grand openings benefit the most. Early customer trust is everything. True Repp helps you collect your first 20–50 verified 5-star Google reviews in your opening weeks, while catching initial operational hiccups privately before anyone posts a public 1-star review.",
  },
  {
    q: "How does True Repp help established businesses with existing reviews?",
    a: "For established businesses, True Repp acts as an essential reputation shield. A single bad review can drop your average from 4.8 to 4.4 and hurt your Google Maps ranking. True Repp intercepts disgruntled customers privately and maintains a steady daily stream of 5-star reviews to keep you ranked #1 in your city.",
  },
  {
    q: "How does True Repp protect my business from negative reviews?",
    a: "When a customer rates 1, 2, or 3 stars, True Repp directs them to a private feedback form with optional contact details so you can fix the issue immediately. Only 4 and 5-star happy customers are guided to leave a public Google review.",
  },
  {
    q: "Do customers need to download an app?",
    a: "No app needed. Customers simply scan the QR code with their smartphone camera or tap a review link, and your mobile-optimized True Repp page opens in seconds.",
  },
  {
    q: "How does Google review submission work?",
    a: "When a customer rates 4 or 5 stars, True Repp opens your Google Maps review page with 1 tap, utilizing their existing Google login for a fast, authentic submission.",
  },
  {
    q: "Where should I place my True Repp QR code?",
    a: "Place your custom QR code on dining tables, check folders, styling mirrors, reception desks, service counters, digital invoices, or takeaway bags.",
  },
  {
    q: "Can I manage multiple business branches?",
    a: "Yes. True Repp supports multi-location businesses, allowing you to generate distinct QR codes and track reviews separately for each branch.",
  },
  {
    q: "Can customers leave their contact details on private feedback?",
    a: "Yes. For 1-3 star feedback, customers can optionally provide their name, phone number, and email so management can reach out and resolve issues personally.",
  },
  {
    q: "Is there any contract or hidden fee?",
    a: "No long-term contracts and no hidden fees. You can upgrade, downgrade, or cancel your subscription anytime.",
  },
  {
    q: "How fast can I get set up?",
    a: "Setup takes under 2 minutes. Enter your business name, paste your Google review link, and your custom QR code is ready to print.",
  },
];

const featureFlowLaneStyles = [
  { bar: "bg-[#f5d9be]", dot: "bg-[#c3895d]" },
  { bar: "bg-[#d8c5f4]", dot: "bg-[#8065ba]" },
  { bar: "bg-[#bbcff8]", dot: "bg-[#5f7bc8]" },
];

const systemFlowItems = [
  {
    title: "5-Star Rating",
    detail: "Customer routed straight to Google Maps review",
    status: "google",
  },
  {
    title: "2-Star Rating",
    detail: "Intercepted & sent to private owner form",
    status: "private",
  },
  {
    title: "Table QR Scan",
    detail: "Customer opened mobile review page in 2s",
    status: "google",
  },
  {
    title: "Customer Recovery",
    detail: "Manager received phone & issue details",
    status: "private",
  },
  {
    title: "Google Maps Lift",
    detail: "Business ranking boosted in local pack",
    status: "google",
  },
  {
    title: "Verified Feedback",
    detail: "Live review sync active across locations",
    status: "google",
  },
];

export default function Landing() {
  const [isNavCompact, setIsNavCompact] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsNavCompact((prev) => {
        if (y > 80) return true;
        if (y < 20) return false;
        return prev;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealElements.forEach((element) => element.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const delay = Number(element.dataset.delay || 0);

            window.setTimeout(() => {
              element.classList.add("is-revealed");
            }, delay);

            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-fixed bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.42), rgba(248, 250, 252, 0.56)), url(${dashboardBg})`,
      }}
    >
      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto rounded-[2.2rem] border border-slate-300/80 bg-slate-100/90 px-4 shadow-sm backdrop-blur-md transition-[max-width,padding] duration-300 ease-out sm:px-6 ${
            isNavCompact ? "max-w-5xl py-2.5" : "max-w-7xl py-3"
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <BookmarkIcon className="h-6 w-6 text-slate-900" />
              <span className="text-xl font-bold text-slate-900 sm:text-2xl">
                True Repp
              </span>
            </div>

            <button
              type="button"
              className="ml-auto inline-flex items-center justify-center rounded-xl border border-slate-300/80 bg-white/80 p-2 text-slate-700 md:hidden"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
              <a
                href="#features"
                className="text-base font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-base font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                Pricing
              </a>
              <a
                href="#industries"
                className="text-base font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                Who Needs This?
              </a>
              <a
                href="#impact"
                className="text-base font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                Why True Repp
              </a>
            </div>

            <div className="ml-auto hidden items-center gap-2 sm:gap-3 md:flex">
              <Link
                to="/auth"
                className="hidden text-base font-semibold text-slate-700 transition-colors hover:text-slate-950 sm:inline"
              >
                Login
              </Link>
              <Link to="/auth?mode=signup">
                <Button
                  size="sm"
                  className="rounded-2xl border-2 border-white bg-[#238f93] px-7 py-2 text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(15,23,42,0.55)] transition-all hover:bg-[#1e7e82] sm:px-9"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>

          {isMobileNavOpen && (
            <div className="mt-3 space-y-3 border-t border-slate-300/80 pt-3 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="#features"
                  className="rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="#industries"
                  className="rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  Who Needs This?
                </a>
                <a
                  href="#impact"
                  className="rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  Why True Repp
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/auth?mode=signup"
                  className="flex-1"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-slate-300 bg-white/85"
                  >
                    Login
                  </Button>
                </Link>
                <Link
                  to="/auth"
                  className="flex-1"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <Button
                    size="sm"
                    className="w-full rounded-xl bg-[#238f93] text-white hover:bg-[#1e7e82]"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pb-12 pt-28 sm:px-6 lg:px-8 md:pb-20 md:pt-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            className="space-y-8 reveal-on-scroll"
            data-reveal
            data-delay="60"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 mb-4 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                For New Ventures, Startups & Established Brands
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Get More 5-Star Google Reviews.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  Filter Out Negative Ones.
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're opening a brand new venture or scaling an existing business — True Repp uses smart QR codes to route 4 & 5-star ratings directly to Google Maps, while intercepting customer complaints privately so you can fix issues before they harm your reputation.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4">
              <Link to="/auth?mode=signup">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 text-base transition-transform duration-300 hover:-translate-y-0.5 shadow-md font-bold"
                >
                  Start Getting 5-Star Reviews
                </Button>
              </Link>
            </div>

            {/* Trust Badge */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Built for new startups, growing ventures & multi-location businesses worldwide
              </p>
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 text-teal-600" />
                <Star className="w-5 h-5 text-teal-600" />
                <Briefcase className="w-5 h-5 text-teal-600" />
                <Smartphone className="w-5 h-5 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Right - Dashboard Mockup with Custom Illustration */}
          <div
            className="relative reveal-on-scroll motion-float-soft"
            data-reveal
            data-delay="180"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Window Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs text-gray-500 ml-4">
                  Review Overview Dashboard
                </span>
              </div>

              {/* Dashboard Content */}
              <div className="p-8 space-y-6">
                {/* Top Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Rating Circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-3">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray="212"
                          strokeDashoffset="32"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#0284c7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-teal-600">
                          4.7
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Overall Rating
                    </p>
                  </div>

                  {/* Reviews Growth */}
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-teal-600 mb-1">
                      +28%
                    </div>
                    <p className="text-xs text-gray-600 font-semibold text-center">
                      Reviews Growth
                    </p>
                    <p className="text-xs text-gray-500 mt-2">This month</p>
                  </div>

                  {/* Sentiment Gauge */}
                  <div className="flex flex-col items-center">
                    <div className="flex gap-1 mb-4">
                      <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Sentiment Mix
                    </p>
                  </div>
                </div>

                {/* Reviews Feed */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <p className="text-xs font-bold text-gray-900 uppercase">
                    Recent Reviews
                  </p>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Excellent service & quick response
                      </p>
                      <p className="text-xs text-gray-600">
                        Google My Business • 2 hours ago
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Amazing experience, highly recommend
                      </p>
                      <p className="text-xs text-gray-600">
                        Google Maps • 5 hours ago
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  to="/auth"
                  className="block w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-bold py-3 rounded-lg hover:shadow-lg transition-all text-center"
                >
                  → View Full Dashboard
                </Link>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-teal-200 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Built For Every Business Stage */}
      <section className="border-t border-slate-200/80 bg-white/70 py-12 sm:py-16 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 reveal-on-scroll" data-reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 mb-2.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              Tailored For Every Stage
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Built For New Starters, Growing Ventures & Established Brands
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Whether you need your very first review to gain customer trust, or you are defending hundreds of existing ratings across multiple locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stage 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md hover:border-teal-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 border border-teal-200">
                    Day 1 To Launch
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  New Business Starters
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                  Zero reviews is the biggest obstacle to winning initial walk-ins. True Repp accelerates your first 20–50 verified 5-star Google reviews within weeks of your grand opening, while catching early staff and service hiccups privately.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Instant Google Maps credibility</span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="rounded-2xl border-2 border-teal-500/80 bg-gradient-to-b from-teal-50/40 via-white to-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 rounded-full bg-teal-600 text-white px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-xs">
                Most Popular
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                    Scaling Up
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Growing Local Ventures
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                  Turn your existing daily foot traffic into a review engine. Consistently gain 5-star reviews to surpass local neighborhood competitors and rank in the coveted Google Maps "Top 3 Local Pack" where 70% of walk-ins originate.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Outrank competitors in local search</span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md hover:border-teal-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200">
                    Established & Multi-Branch
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Established Businesses
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                  Protecting an established 4.8-star rating is mission critical. True Repp acts as an active reputation shield, intercepting disgruntled clients with direct owner contact while standardizing QR review collection across multiple branches.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Defend rating & manage branches</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 reveal-on-scroll" data-reveal>
            <p className="text-teal-600 font-semibold text-sm uppercase mb-2 tracking-wide">
              Smart Reputation System
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to dominate Google reviews
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Effortless QR scanning, automated Google routing, and private issue resolution—built for local business growth.
            </p>
          </div>
          <div
            className="relative hidden lg:block reveal-on-scroll"
            data-reveal
            data-delay="80"
          >
            <div className="relative overflow-hidden rounded-[2.1rem] border border-slate-200/80 bg-gradient-to-br from-[#eff7f5] via-[#edf4fb] to-[#eef7ff] p-8 shadow-[0_24px_65px_rgba(15,23,42,0.08)]">
              <div className="pointer-events-none absolute -left-16 top-10 h-52 w-52 rounded-full bg-[#b6e7df]/40 blur-3xl" />
              <div className="pointer-events-none absolute -right-12 bottom-8 h-48 w-48 rounded-full bg-[#c7dafd]/40 blur-3xl" />
              <div className="pointer-events-none absolute inset-6 rounded-[1.5rem] border border-white/80" />
              <div className="pointer-events-none absolute inset-y-10 left-[24%] border-l border-dashed border-slate-300/80" />
              <div className="pointer-events-none absolute inset-y-10 left-[32%] border-l border-dashed border-slate-300/80" />
              <div className="pointer-events-none absolute inset-y-10 left-[40%] border-l border-dashed border-slate-300/80" />

              <div className="relative min-h-[370px]">
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 1200 370"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 666 94 C 732 92, 760 120, 794 146 C 826 169, 845 176, 888 172"
                    stroke="#98a2b3"
                    strokeWidth="2"
                    strokeDasharray="3 7"
                  />
                  <path
                    d="M 666 174 C 732 172, 760 187, 794 197 C 826 206, 845 205, 888 200"
                    stroke="#98a2b3"
                    strokeWidth="2"
                    strokeDasharray="3 7"
                  />
                  <path
                    d="M 666 254 C 732 255, 760 246, 794 226 C 826 207, 845 201, 888 204"
                    stroke="#98a2b3"
                    strokeWidth="2"
                    strokeDasharray="3 7"
                  />
                </svg>

                {features.slice(0, 3).map((feature, index) => {
                  const laneStyle =
                    featureFlowLaneStyles[index] || featureFlowLaneStyles[0];
                  const topPosition = 88 + index * 80;

                  return (
                    <div
                      key={feature.title}
                      className={`absolute left-5 flex h-[44px] w-[57%] -translate-y-1/2 items-center justify-between rounded-full ${laneStyle.bar} px-4 shadow-sm ring-1 ring-black/5`}
                      style={{ top: `${topPosition}px` }}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`h-5 w-5 shrink-0 rounded-full ${laneStyle.dot} border border-white/80`}
                        />
                        <span className="truncate text-sm font-medium text-slate-800">
                          {feature.title}
                        </span>
                      </div>
                      <span className="pl-4 text-sm font-semibold text-slate-500">
                        +
                      </span>
                    </div>
                  );
                })}

                <article className="absolute right-5 top-1/2 flex min-h-[360px] w-[36%] -translate-y-1/2 flex-col rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_36px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Live Routing
                    </h3>
                    <span className="text-[11px] text-teal-600 font-bold">ACTIVE</span>
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                      TR
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Reputation Engine
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Smart review filter active
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {systemFlowItems.map((item, index) => (
                      <div key={item.title} className="flex items-start gap-2">
                        <span
                          className={`mt-[5px] inline-block h-1.5 w-1.5 rounded-full ${
                            item.status === "google"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <p className="line-clamp-1 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {item.title}:
                          </span>{" "}
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="mb-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Positive Reviews Channeled</span>
                      <span className="font-bold text-teal-700">96%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-600"
                        style={{ width: "96%" }}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p className="font-bold text-emerald-600">+142</p>
                        <p className="text-slate-500">5★ Google</p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p className="font-bold text-amber-600">18</p>
                        <p className="text-slate-500">Private Solved</p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p className="font-bold text-teal-600">0</p>
                        <p className="text-slate-500">Public Bad</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Link to="/auth?mode=signup" className="flex-1">
                        <button className="w-full rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-black transition-colors">
                          Activate System
                        </button>
                      </Link>
                      <a href="#how-it-works" className="flex-1">
                        <button className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          See Process
                        </button>
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div
            className="grid gap-4 sm:grid-cols-2 lg:hidden reveal-on-scroll"
            data-reveal
            data-delay="80"
          >
            {features.map((f, i) => (
              <article
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 p-3 ring-1 ring-teal-200/70">
                    <f.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-gray-400">
                    {`0${i + 1}`}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {f.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-gray-200/70 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-100 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-100 rounded-full opacity-10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 reveal-on-scroll" data-reveal>
            <p className="text-teal-600 font-semibold text-sm uppercase mb-2 tracking-wide">
              Simple Process
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How True Repp Works in 4 Steps
            </h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  num: "1",
                  icon: Link2,
                  title: "Place Your QR Code",
                  desc: "Print your custom QR code on table stands, styling mirrors, or bills.",
                },
                {
                  num: "2",
                  icon: Smartphone,
                  title: "Customer Scans in Seconds",
                  desc: "Customers scan with any phone camera—no app download required.",
                },
                {
                  num: "3",
                  icon: Shield,
                  title: "Smart Review Routing",
                  desc: "4–5★ ratings go directly to Google. 1–3★ complaints go to your private inbox.",
                },
                {
                  num: "4",
                  icon: TrendingUp,
                  title: "Watch Your Rating Climb",
                  desc: "Gain authentic 5-star Google reviews while solving customer issues privately.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="relative group reveal-on-scroll"
                  data-reveal
                  data-delay={100 + i * 80}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-28 h-28 bg-gradient-to-br from-white/45 to-white/20 backdrop-blur-sm border-3 border-teal-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                        <step.icon className="w-12 h-12 text-teal-600" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/80 backdrop-blur-sm border-3 border-teal-600 rounded-full flex items-center justify-center font-bold text-teal-600 shadow-md">
                        {step.num}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who Needs True Repp Most? (Industries & Use Cases) */}
      <section
        id="industries"
        className="border-t border-gray-200/70 bg-gradient-to-b from-slate-50/70 to-white py-14 sm:py-18"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 reveal-on-scroll" data-reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 mb-2.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              For New Starters & Existing Ventures
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Who Needs True Repp Most?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              From day-one startups establishing instant credibility to existing businesses defending their hard-earned rating — True Repp fits any business model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {industries.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                  data-reveal
                  data-delay={40 + i * 30}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 truncate">
                          {item.sub}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-500">
                      📍 QR spot: <strong className="text-slate-800">{item.spot}</strong>
                    </span>
                    <span className="font-bold text-teal-700 shrink-0 flex items-center gap-1">
                      1-Tap Review <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 inline" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link to="/auth?mode=signup">
              <Button
                size="lg"
                className="rounded-2xl bg-slate-900 text-white hover:bg-black px-7 py-2.5 text-sm font-bold shadow-sm transition-all hover:scale-105"
              >
                Start Collecting 5-Star Reviews
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-gray-200/70 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal-on-scroll" data-reveal>
            <p className="text-teal-600 font-semibold text-sm uppercase mb-2">
              Simple Pricing
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Plans that grow with you
            </h2>
            <p className="text-gray-600 text-lg">
              Flexible monthly plans with transparent pricing and no hidden
              fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <div
                key={plan.id}
                className={`rounded-xl overflow-hidden transition-all reveal-on-scroll ${plan.popular ? "ring-2 ring-teal-600 md:scale-105 md:shadow-2xl" : "border border-gray-200 shadow-md"} ${plan.popular ? "bg-gradient-to-br from-teal-50 to-blue-50" : "bg-white"}`}
                data-reveal
                data-delay={90 + i * 90}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-bold px-4 py-2 text-center">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-600 text-sm">/month</span>
                    )}
                  </div>
                  <Link
                    to={`/auth?mode=signup&plan=${plan.id}`}
                    className="block mb-8"
                  >
                    <Button
                      className={`w-full ${plan.popular ? "bg-teal-600 hover:bg-teal-700" : "border border-gray-300"}`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
                  </Link>
                  <div className="space-y-4">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How True Repp Pays For Itself in 30 Days */}
      <section
        id="impact"
        className="border-t border-gray-200/70 bg-gradient-to-b from-slate-50/60 to-white py-14 sm:py-18"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12 text-center reveal-on-scroll" data-reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 mb-2.5 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-teal-600" />
              Measurable Business ROI
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              How True Repp Pays For Itself in 30 Days
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              Real financial impact you can measure in more local walk-ins, higher rankings, and protected revenue.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {businessOutcomes.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                  data-reveal
                  data-delay={50 + i * 40}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900 tracking-tight block">
                          {item.stat}
                        </span>
                        <span className="text-[10px] font-semibold text-teal-700 block -mt-0.5">
                          {item.statLabel}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">
                      Outcome
                    </span>
                    <span className="font-bold text-teal-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {item.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simple 1-Line Financial Math Bar */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-900 p-5 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-semibold text-slate-200">
                💰 <strong className="text-white">The Math is Simple:</strong> Gaining just 1 extra customer a week or preventing 1 bad review pays for an entire year of True Repp.
              </p>
            </div>
            <Link to="/auth?mode=signup" className="shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                className="w-full sm:w-auto rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 px-6 py-2 text-xs font-bold transition-all hover:scale-105"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Behind True Repp: Team, Support & User Commitment */}
      <section className="border-t border-gray-200/70 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12 text-center reveal-on-scroll" data-reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 mb-2.5 shadow-2xs">
              <HeartHandshake className="h-3.5 w-3.5 text-teal-600" />
              Our Team & User Commitment
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              We Stand Behind Every True Repp User
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Software is only half the equation. Our dedicated team works directly with True Repp users (business owners & managers) with fast human support, continuous zero-cost upgrades, and deep respect for your feedback.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {userCommitments.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                  data-reveal
                  data-delay={40 + i * 40}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{item.highlight}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Differentiating Customer vs True Repp User - Upgraded Aesthetic */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
            {/* Header Banner */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50/80 via-slate-50/60 to-white px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-1.5 shadow-2xs">
                    <Sparkles className="h-3 w-3 text-teal-600" />
                    A Core Distinction We Live By
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    Frictionless for Customers. Dedicated Support for You.
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm sm:text-right">
                  Two distinct experiences engineered with purpose.
                </p>
              </div>
            </div>

            {/* Split Comparison Cards */}
            <div className="p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Column 1: For Your In-Store Customers */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Audience: In-Store Guest
                          </span>
                          <h4 className="text-base font-bold text-gray-900">
                            For Your Customers (Reviewers)
                          </h4>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        10-Sec Flow
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                      Zero barriers between your guest leaving a rating and reaching the right destination.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 text-xs text-gray-700">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span><strong>Zero App Downloads:</strong> Works directly via camera scan on any phone in under 10 seconds.</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-gray-700">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span><strong>Safe Private Channel:</strong> 1–3 star ratings direct to private feedback, protecting public stars.</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-gray-700">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span><strong>Direct Google Maps Tap:</strong> 4–5 star ratings open your Google listing with their account logged in.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/70 text-[11px] text-slate-500 font-medium">
                    🎯 Result: Higher review volume without awkward begging at checkout.
                  </div>
                </div>

                {/* Column 2: For You (The True Repp Business User) */}
                <div className="rounded-2xl border-2 border-teal-300 bg-gradient-to-b from-teal-50/50 via-white to-white p-6 flex flex-col justify-between shadow-2xs relative">
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                      VIP True Repp User
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-2xs">
                        <HeartHandshake className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                          Audience: Business Subscriber
                        </span>
                        <h4 className="text-base font-bold text-gray-900">
                          For You (True Repp Business User)
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                      We treat you as a long-term partner with dedicated backing, human support, and constant software evolution.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 text-xs text-gray-700">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span><strong>Fast Human Support:</strong> Direct WhatsApp & live chat assistance with response times under 15 minutes.</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-gray-700">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span><strong>Free Lifetime Upgrades:</strong> AI reply features, new Google integrations & speed upgrades included free.</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-gray-700">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span><strong>Your Feedback Shapes Features:</strong> Directly vote on and request new capabilities built for your industry.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-teal-100 text-[11px] text-teal-800 font-semibold">
                    🤝 Promise: We treat your business like our own—you are never just an account number.
                  </div>
                </div>
              </div>

              {/* Bottom Integrated Action Bar */}
              <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-900 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-bold text-white">
                    Ready to partner with a software team that actually listens?
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Start protecting and growing your Google star rating in less than 2 minutes.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                  <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                    <Button
                      size="sm"
                      className="w-full sm:w-auto rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 px-6 py-2.5 text-xs font-bold transition-all hover:scale-105 shadow-sm"
                    >
                      Partner With True Repp
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200/70 bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal-on-scroll" data-reveal>
            <p className="text-teal-600 font-semibold text-sm uppercase mb-2">
              Have Questions?
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group border border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer reveal-on-scroll"
                data-reveal
                data-delay={70 + i * 55}
              >
                <summary className="flex justify-between items-center font-semibold text-gray-900 list-none">
                  {faq.q}
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 sm:py-20 reveal-on-scroll" data-reveal>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-bold text-gray-900 mb-4 sm:mb-6">
            Ready to dominate Google reviews in your city?
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Start collecting authentic 5-star ratings and catching private complaints today. Set up in under 2 minutes.
          </p>
          <div className="flex justify-center">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-teal-600 text-white hover:bg-teal-700 px-9 py-3 text-base font-bold shadow-md transition-all hover:scale-105"
              >
                Get Started With True Repp
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-slate-200/70 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-300/70 bg-slate-100/95 px-6 py-8 shadow-sm sm:px-10 sm:py-10">
            <div className="grid gap-10 md:grid-cols-[1.3fr_0.9fr_0.9fr]">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <BookmarkIcon className="h-7 w-7 text-slate-900" />
                  <span className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    True Repp
                  </span>
                </div>
                <p className="max-w-sm text-xl leading-relaxed text-slate-700 sm:text-2xl">
                  Manage your online reputation with ease.
                </p>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">
                  Product
                </h4>
                <ul className="space-y-3 text-2xl text-slate-700 sm:text-[2rem]">
                  <li>
                    <Link
                      to="/features"
                      className="transition-colors hover:text-slate-950"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/pricing"
                      className="transition-colors hover:text-slate-950"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/success-stories"
                      className="transition-colors hover:text-slate-950"
                    >
                      Who Needs This?
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blog"
                      className="transition-colors hover:text-slate-950"
                    >
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">
                  Information
                </h4>
                <ul className="space-y-3 text-2xl text-slate-700 sm:text-[2rem]">
                  <li>
                    <Link
                      to="/contact"
                      className="transition-colors hover:text-slate-950"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/privacy"
                      className="transition-colors hover:text-slate-950"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="transition-colors hover:text-slate-950"
                    >
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/security"
                      className="transition-colors hover:text-slate-950"
                    >
                      Security
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="my-8 border-t border-slate-300/80" />

            <div className="flex flex-col gap-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} True Repp. All rights reserved.
              </p>
              <p>Built for modern businesses.</p>
            </div>
          </div>
        </div>
      </footer>
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
