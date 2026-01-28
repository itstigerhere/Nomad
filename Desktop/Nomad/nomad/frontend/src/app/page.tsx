import dynamic from "next/dynamic";
import PackageCard from "@/components/PackageCard";
import Hero from "@/components/Hero";

const PlacesList = dynamic(() => import("@/components/PlacesList"), {
  ssr: false,
});

async function fetchHomepagePackages() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/packages/homepage`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const packages = await fetchHomepagePackages();

  return (
    <div>
      <Hero />

      {/* Nearby places */}
      <section className="section pb-14">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Nearby Attractions</h3>
          <p className="text-sm opacity-70">
            Places near you — explore and add to your tour.
          </p>
        </div>
        <PlacesList />
      </section>

      {/* Packages */}
      <section className="section pb-16">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">
            Featured Weekend Packages
          </h3>
          <p className="text-sm opacity-70">
            Choose a curated weekend package and enroll instantly.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {packages.map((p: any) => (
            <PackageCard key={p.id} pkg={p} />
          ))}

          {[
            {
              title: "Personalized Plans",
              desc: "Interest-based place selection and optimized routing.",
            },
            {
              title: "Travel Assistance",
              desc: "Pickup, vehicles, and driver allocation based on group size.",
            },
            {
              title: "Secure Payments",
              desc: "Integrated payments with instant confirmation.",
            },
          ].map((feature) => (
            <div key={feature.title} className="card p-6">
              <h4 className="text-lg font-semibold">{feature.title}</h4>
              <p className="mt-2 text-sm opacity-70">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-right">
          <a href="/packages" className="btn-outline">
            Explore more packages
          </a>
        </div>
      </section>
    </div>
  );
}
