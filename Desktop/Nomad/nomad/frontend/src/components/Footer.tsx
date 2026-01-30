"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="section py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-[var(--color-text)] opacity-90">
        <div>
          <p className="font-semibold opacity-100">NOMADS</p>
          <p>Smart Weekend Travel & Assistance</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-80 hover:opacity-100">
            <Link href="/cancellation-policy" className="hover:underline">Cancellation & Refund Policy</Link>
            <Link href="/faq" className="hover:underline">FAQ</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
        <p className="text-xs sm:text-right opacity-70">
          © 2026 NOMADS <br />
          Built for Tripfactory Internship Travelathon
        </p>
      </div>
    </footer>
  );
}
