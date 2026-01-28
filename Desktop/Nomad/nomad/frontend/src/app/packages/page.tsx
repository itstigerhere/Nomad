import React from "react";
import PackageCard from "@/components/PackageCard";

async function fetchPackages() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/packages/all`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch packages');
  return res.json();
}

export default async function PackagesPage() {
  const pkgs = await fetchPackages();
  return (
    <div className="section py-10 sm:py-12">
      <h2 className="text-2xl font-bold mb-6">All Packages</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pkgs.map((p: any) => (
          <PackageCard key={p.id} pkg={p} />
        ))}
      </div>
    </div>
  );
}
