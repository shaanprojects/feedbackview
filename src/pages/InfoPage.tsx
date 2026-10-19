import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import dashboardBg from "@/assets/bg.png";

type PageKey =
  | "features"
  | "pricing"
  | "success-stories"
  | "about"
  | "blog"
  | "contact"
  | "privacy"
  | "terms"
  | "security";

type InfoPageProps = {
  pageKey: PageKey;
};

type PageContent = {
  title: string;
  subtitle: string;
  points: string[];
};

const pageContentMap: Record<PageKey, PageContent> = {
  features: {
    title: "Features",
    subtitle:
      "Explore powerful tools to collect, manage, and convert customer feedback into growth.",
    points: [
      "Real-time analytics across ratings, sentiment, and response trends.",
      "QR code based feedback collection for fast in-person reviews.",
      "Smart response workflows for positive and negative feedback.",
      "Location-based performance tracking for multi-branch businesses.",
    ],
  },
  pricing: {
    title: "Pricing",
    subtitle:
      "Simple plans built for startups, growing teams, and enterprise operations.",
    points: [
      "Starter: great for small businesses getting started with feedback loops.",
      "Professional: unlimited requests, advanced insights, and priority support.",
      "Enterprise: custom integrations, API support, and account management.",
      "All plans include transparent billing and easy upgrades as you scale.",
    ],
  },
  "success-stories": {
    title: "Who Needs True Repp Most?",
    subtitle:
      "Built for local businesses where customer trust, Google Maps ranking, and ratings make or break revenue.",
    points: [
      "Restaurants & Cafes: 94% of diners check Google Maps before choosing where to eat. Catch service issues privately at tables before they hit Yelp.",
      "Salons, Spas & Beauty Studios: Clients trust personal appearance only to top-rated stylists. Capture positive reviews right at the styling chair.",
      "Dental & Healthcare Clinics: Patients research medical providers thoroughly. Resolve billing or wait-time confusion privately with leadership.",
      "Auto Repair & Mechanics: Win customer trust for high-ticket repairs by letting ecstatic drivers leave immediate 5-star Google reviews.",
      "Home Contractors (HVAC, Plumbing, Electrical): Homeowners check 4.5+ star ratings before letting technicians into their private homes.",
    ],
  },
  about: {
    title: "About",
    subtitle:
      "True Repp helps businesses build trust by turning customer voice into actionable insight.",
    points: [
      "Mission: make reputation growth simple for every business.",
      "Vision: every customer interaction should improve service quality.",
      "Values: transparency, speed, and customer-first execution.",
      "Focus: practical tools teams can use daily without complexity.",
    ],
  },
  blog: {
    title: "Blog",
    subtitle:
      "Actionable playbooks on feedback collection, online reputation, and customer experience.",
    points: [
      "How to get more 5-star reviews without being pushy.",
      "Best QR placement strategies for stores and restaurants.",
      "How to respond to negative feedback professionally.",
      "Using sentiment trends to prioritize service improvements.",
    ],
  },
  contact: {
    title: "Contact",
    subtitle:
      "Need help or a demo? Reach out and our team will guide your setup.",
    points: [
      "Support email: support@True Repp.com",
      "Sales email: sales@True Repp.com",
      "Response time: within 24 hours on business days.",
      "Onboarding support available for all paid plans.",
    ],
  },
  privacy: {
    title: "Privacy",
    subtitle:
      "Your data protection and responsible usage are core to how True Repp operates.",
    points: [
      "Data is encrypted in transit and at rest.",
      "Access controls restrict account and workspace permissions.",
      "Customer data is never sold to third parties.",
      "Users can request data export or deletion at any time.",
    ],
  },
  terms: {
    title: "Terms",
    subtitle:
      "Clear platform rules to keep usage safe, fair, and reliable for everyone.",
    points: [
      "Use the platform in compliance with applicable laws.",
      "Do not abuse review flows or manipulate public ratings.",
      "Service features may evolve with product improvements.",
      "Billing, cancellation, and refund terms are transparent.",
    ],
  },
  security: {
    title: "Security",
    subtitle:
      "Security practices designed to keep your reputation operations protected.",
    points: [
      "Role-based access for business members and admins.",
      "Audit-friendly event tracking across key actions.",
      "Continuous monitoring for suspicious activity.",
      "Regular updates and dependency patching.",
    ],
  },
};

export default function InfoPage({ pageKey }: InfoPageProps) {
  const content = pageContentMap[pageKey];

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat px-4 py-14 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.42), rgba(248, 250, 252, 0.56)), url(${dashboardBg})`,
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {content.title}
          </h1>
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="mb-8 text-base text-slate-600 sm:text-lg">
          {content.subtitle}
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ul className="space-y-4">
            {content.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-slate-700">
                <span className="mt-2 inline-block h-2 w-2 rounded-full bg-teal-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
