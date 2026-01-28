import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
        <div className="min-h-screen flex flex-col">
          {/* Global header (transparent, hero-aware) */}
          <Header />

          {/* Page content (Hero handles its own top spacing) */}
          <main className="flex-1">{children}</main>

          {/* Global footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
