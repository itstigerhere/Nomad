import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";

const PackageEnrollSection = dynamic(() => import("@/components/PackageEnrollSection"), { ssr: false });
const TrackPackageView = dynamic(() => import("@/components/TrackPackageView"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

async function fetchPackage(id: string) {
  const res = await fetch(`${API_BASE}/api/packages/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch package");
  return res.json();
}

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const pkg = await fetchPackage(params.id);
  if (!pkg) return notFound();

  return (
    <div className="section py-12">
      <TrackPackageView packageId={pkg.id} />
      <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/packages">Packages</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white">{pkg.name}</span>
      </nav>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{pkg.name}</h1>
            {pkg.sponsored && (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-500 text-white">Sponsored</span>
            )}
          </div>
          <p className="text-slate-600 mt-2">{pkg.description}</p>
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold">Places in this package</h3>
            {pkg.places.map((place: any) => (
              <div key={place.id} className="card p-4 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{place.name}</h4>
                    <div className="text-sm text-slate-500">{place.city} • Rating: {place.rating ?? 'N/A'}</div>
                  </div>
                </div>
                <p className="text-sm mt-2">Activities: Visit, Explore local cuisine, Photo stops</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <PackageEnrollSection packageId={pkg.id} price={pkg.price} />
          <div className="card p-4">
            <h4 className="font-semibold">Average Rating</h4>
            <div className="text-xl">{pkg.averageRating?.toFixed(1) ?? "N/A"}</div>
          </div>
          <div className="card p-4">
            <h4 className="font-semibold mb-2">What to pack</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Valid ID</li>
              <li>• Comfortable shoes</li>
              <li>• Sun protection (hat, sunscreen)</li>
              <li>• Water bottle</li>
              <li>• Camera / phone</li>
              <li>• Cash / cards for local buys</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
