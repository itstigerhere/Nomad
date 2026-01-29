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
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased min-h-screen">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-16 sm:pt-20">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
