"use client";

export default function Footer() {
  return (
    <footer className="mt-20" style={{ backgroundColor: "var(--color-bg)" }}>
      <div
        className="h-px w-full"
        style={{ backgroundColor: "var(--color-border)" }}
      />

      <div className="section py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm" style={{ color: "var(--color-text)", opacity: 0.7 }}>
        <div>
          <p className="font-semibold" style={{ color: "var(--color-text)", opacity: 1 }}>NOMADS</p>
          <p>Smart Weekend Travel & Assistance</p>
        </div>

        <p className="text-xs sm:text-right opacity-70">
          © 2026 NOMADS <br />
          Built for Tripfactory Internship Travelathon
        </p>
      </div>
    </footer>
  );
}
