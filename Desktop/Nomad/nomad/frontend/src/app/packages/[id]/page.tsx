import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

const EnrollButton = dynamic(() => import("@/components/EnrollButton"), { ssr: false });

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

  const availableSeats = pkg.availableSeats ?? (pkg.maxCapacity ?? 20);
  const maxCapacity = pkg.maxCapacity ?? 20;
  const seatsPercentage = (availableSeats / maxCapacity) * 100;
  const isLowAvailability = seatsPercentage <= 30;
  const isCritical = seatsPercentage <= 15;

  return (
    <div className="section py-12">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{pkg.name}</h1>
              <p className="text-slate-600 mt-2">{pkg.description}</p>
            </div>
            {isLowAvailability && (
              <span 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-pulse ml-4"
                style={{ 
                  background: isCritical ? '#ef4444' : '#f59e0b',
                  color: 'white'
                }}
              >
                {isCritical ? '🔥' : '⚡'} Only {availableSeats} Seats Left!
              </span>
            )}
          </div>
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
          {/* Seat Availability Card */}
          <div className="card p-4" style={{
            border: isLowAvailability ? `2px solid ${isCritical ? '#ef4444' : '#f59e0b'}` : undefined,
            background: isLowAvailability ? `${isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)'}` : undefined
          }}>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>👥</span> Seat Availability
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">Available Seats</span>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: isLowAvailability ? (isCritical ? '#ef4444' : '#f59e0b') : '#61c2a2' }}
                >
                  {availableSeats}/{maxCapacity}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${Math.max(5, seatsPercentage)}%`,
                    background: isCritical 
                      ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                      : isLowAvailability
                        ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(90deg, #61c2a2 0%, #4ade80 100%)'
                  }}
                />
              </div>
              <div className="text-xs text-center opacity-70">
                {pkg.enrolledCount ?? 0} people already enrolled
              </div>
              {isLowAvailability && (
                <div className="mt-3 p-3 rounded-lg" style={{ 
                  background: isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                }}>
                  <p className="text-xs font-medium" style={{ color: isCritical ? '#dc2626' : '#d97706' }}>
                    {isCritical ? '⚠️ Critical: ' : '⚡ Hurry: '}
                    Book now before seats run out!
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card p-4">
            <div className="text-2xl font-bold">₹{pkg.price}</div>
            {/* EnrollButton will POST to enroll and redirect to payment */}
            <div className="mt-4">
              <EnrollButton packageId={pkg.id} amount={pkg.price} />
            </div>
          </div>
          <div className="card p-4">
            <h4 className="font-semibold">Average Rating</h4>
            <div className="text-xl">{pkg.averageRating?.toFixed(1) ?? 'N/A'}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
