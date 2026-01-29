import PackageCard from "@/components/PackageCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

async function fetchPackages() {
  const res = await fetch(`${API_BASE}/api/packages/all`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch packages");
  return res.json();
}

export default async function PackagesPage() {
  const pkgs = await fetchPackages();
  return (
    <div className="section py-12">
      <h2 className="text-2xl font-bold mb-6">All Packages</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {pkgs.map((p: any) => (
          <PackageCard key={p.id} pkg={p} />
        ))}
      </div>
    </div>
  );
}
