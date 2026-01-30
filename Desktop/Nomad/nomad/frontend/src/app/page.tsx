"use client";
import PackageCard from "@/components/PackageCard";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PlacesList = dynamic(() => import("@/components/PlacesList"), { ssr: false });

async function fetchHomepagePackages() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/packages/homepage`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default function HomePage() {
  const [packages, setPackages] = useState<any[]>([]);
  useEffect(() => {
    fetchHomepagePackages().then(setPackages);
  }, []);
  return (
    <div>
      <section className="section py-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="badge">Weekend Travel, Reimagined</span>
            <h2 className="text-4xl font-bold leading-tight">
              Plan smart city getaways with personalized itineraries, pickup support, and seamless payments.
            </h2>
            <p className="opacity-70 text-lg">
              NOMAD helps you discover nearby places that match your interests, build efficient day plans, and
              arrange travel assistance—all in one platform.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <a className="btn-primary" href="/trip-planner">Start Planning</a>
              <a className="btn-outline" href="/map">View Map</a>
            </div>
          </div>
          <div className="card p-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Today’s Highlights</h3>
                <span className="badge">City Smart Picks</span>
              </div>
              <div className="grid gap-3">
                {["Cultural Walk", "Food Trail", "Nature Escape"].map((item) => (
                  <div key={item} className="p-4 border border-[var(--color-border)] rounded-xl" style={{backgroundColor: 'rgba(97, 194, 162, 0.05)'}}>
                    <p className="font-semibold">{item}</p>
                    <p className="text-sm opacity-60">Curated for weekend travelers</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm opacity-70">
                <span>Pickup assistance</span>
                <span>Real-time route planning</span>
                <span>Secure payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section pb-16">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Nearby Attractions</h3>
          <p className="text-sm text-slate-600">Places near you — tap Explore to see details and location on the map.</p>
        </div>
        <PlacesList />
      </section>

      <section className="section pb-16">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold">Featured Weekend Packages</h3>
            <a href="/packages" className="btn-outline shrink-0">Explore more packages</a>
          </div>
          <p className="text-sm opacity-70 mt-1">Choose a curated weekend package and enroll instantly.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p: any) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
          {[
            { title: "Personalized Plans", desc: "Interest-based place selection and optimized routing." },
            { title: "Travel Assistance", desc: "Pickup, vehicles, and driver allocation based on group size." },
            { title: "Secure Payments", desc: "Razorpay integration with instant confirmation." }
          ].map((feature) => (
            <div key={feature.title} className="card p-6">
              <h4 className="font-semibold text-lg">{feature.title}</h4>
              <p className="text-sm opacity-70 mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
