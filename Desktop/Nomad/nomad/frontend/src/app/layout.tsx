import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TourCartProvider } from "@/context/TourCartContext";
import TourCartButton from "@/components/TourCartButton";

export const metadata: Metadata = {
  title: "NOMADS",
  description:
    "Plan weekend city trips with smart recommendations, assistance, and payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <TourCartProvider>
          <div className="min-h-screen flex flex-col">
            {/* Global header (fixed, with dark mode support) */}
            <Header />

            {/* Page content (with padding for fixed header) */}
            <main className="flex-1 pt-16 sm:pt-20">{children}</main>

            {/* Global footer */}
            <Footer />

            {/* Floating cart button */}
            <TourCartButton />
          </div>
        </TourCartProvider>
      </body>
    </html>
  );
}
