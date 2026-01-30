import Link from "next/link";

export const metadata = {
  title: "FAQ | Nomad",
  description: "Frequently asked questions about booking, refunds, Pro, and referrals.",
};

const FAQ = [
  {
    q: "How do I book a trip?",
    a: "Choose a package from the Packages page, click Enroll, pick your travel date (optional), and complete payment via Razorpay. You'll get a confirmation email and can view your trip under Trips.",
  },
  {
    q: "What is the cancellation and refund policy?",
    a: "Full refund if you cancel at least 7 days before the trip start date; 50% refund if you cancel 3–6 days before; no refund within 3 days. Request a refund from your trip summary page. See our Cancellation & Refund Policy for details.",
  },
  {
    q: "What is Pro membership?",
    a: "Pro members don't pay convenience fees on bookings and get priority support and other perks. Pro can be activated by our team for promotions or loyalty. You can also refer friends—rewards may include Pro benefits.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your referral link from Profile or Invite friends. When someone signs up using your link and completes their first paid booking, you may receive a reward (e.g. credit or Pro). They get a great trip; you get something back.",
  },
  {
    q: "Can I use a promo code?",
    a: "Yes. At the payment step, enter your promo code (e.g. WELCOME10) if you have one. The discount is applied before convenience fee. Pro users still get no convenience fee.",
  },
  {
    q: "How do I get pickup assistance?",
    a: "From your confirmed trip page you can request pickup assistance. We'll assign a vehicle and driver based on your group size. You'll get details via email/SMS.",
  },
  {
    q: "Who do I contact for support?",
    a: "Use the Contact page to send us a message. For trip-specific issues, include your trip ID from the Trips or trip summary page.",
  },
];

export default function FAQPage() {
  return (
    <div className="section py-12 max-w-3xl">
      <div className="mb-8">
        <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium">
          ← Home
        </Link>
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2">
          Frequently asked questions
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Quick answers about booking, refunds, Pro, and more.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ.map((item, i) => (
          <div key={i} className="card p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-2">{item.q}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/cancellation-policy" className="btn-outline">
          Cancellation policy
        </Link>
        <Link href="/contact" className="btn-primary">
          Contact us
        </Link>
      </div>
    </div>
  );
}
