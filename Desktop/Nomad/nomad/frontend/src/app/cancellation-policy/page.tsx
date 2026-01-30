import Link from "next/link";

export const metadata = {
  title: "Cancellation & Refund Policy | Nomad",
  description: "Nomad cancellation and refund policy for trip bookings.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="section py-12 max-w-3xl">
      <div className="mb-8">
        <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium">
          ← Home
        </Link>
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2">
          Cancellation & Refund Policy
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Please read this policy before booking. Refunds are processed according to the rules below.
        </p>
      </div>

      <div className="card p-6 md:p-8 space-y-6 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Overview
          </h2>
          <p>
            If you need to cancel a confirmed trip, the amount we can refund depends on how many days before the trip start date you cancel. We process refunds via the same payment method you used (e.g. UPI, card) through our payment partner.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Refund tiers
          </h2>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                1
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">Full refund</strong> — If you cancel at least <strong>7 days</strong> before the trip start date, you are eligible for a <strong>100% refund</strong> of the amount paid (excluding any non-refundable third-party charges, if applicable).
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-bold">
                2
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">Partial refund</strong> — If you cancel between <strong>3 and 6 days</strong> (inclusive) before the trip start date, you are eligible for a <strong>50% refund</strong> of the amount paid.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">
                3
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">No refund</strong> — If you cancel within <strong>3 days</strong> of the trip start date (i.e. less than 3 full days before), no refund is available.
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            How to request a refund
          </h2>
          <p>
            From your <Link href="/trips" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Trips</Link> or trip summary page, open the confirmed trip and use the &quot;Request refund&quot; option. You will see the estimated refund amount based on the policy above. After you submit, we will process the refund; it may take a few business days to reflect in your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Exceptions
          </h2>
          <p>
            In case of force majeure (e.g. natural disasters, government travel bans), we may offer full or partial refunds at our discretion. Contact support with your booking details if you believe your situation qualifies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Questions
          </h2>
          <p>
            For questions about a specific booking or refund, use the support option in the app or contact us with your trip and payment details.
          </p>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/trips" className="btn-primary">
          View my trips
        </Link>
        <Link href="/packages" className="btn-outline">
          Browse packages
        </Link>
      </div>
    </div>
  );
}
