"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20">
      {/* Soft separator */}
      <div
        className="h-px w-full"
        style={{ backgroundColor: "var(--color-border)" }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid gap-6 sm:grid-cols-2 items-center">
          {/* Left */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">NOMADS</p>
            <p className="text-xs opacity-60 max-w-md">
              Smart, interest-driven weekend travel with optimized routes,
              pickup assistance, and seamless payments.
            </p>
          </div>

          {/* Right */}
          <div className="flex sm:justify-end">
            <p className="text-xs opacity-50 text-right">
              © 2026 NOMADS
              <br />
              Built for Tripfactory Internship Travelathon
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
