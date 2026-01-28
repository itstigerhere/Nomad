"use client";

import Image from "next/image";
import Link from "next/link";
import TopNav from "@/components/TopNav";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/nomads_d_.svg"
              alt="NOMADS"
              width={160}
              height={48}
              priority
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Nav */}
          <TopNav />
        </div>
      </div>
    </header>
  );
}
