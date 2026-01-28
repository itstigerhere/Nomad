"use client";

import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl opacity-25"
                style={{ backgroundColor: "var(--color-brand)" }}
            />
            <div
                className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: "var(--color-brand)" }}
            />

            {/* Hero content */}
            <div className="section pt-24 pb-20 sm:pt-32 sm:pb-28 relative">
                <div className="grid gap-16 lg:grid-cols-2 items-center">
                    {/* LEFT */}
                    <div className="space-y-8">
                        <span className="badge">AI-assisted weekend travel</span>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                            Your weekend,
                            <br />
                            <span style={{ color: "var(--color-brand)" }}>
                                perfectly planned.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg opacity-70 max-w-xl">
                            NOMADS converts your location, interests, and time into an
                            optimized weekend plan — routes, pickups, and payments included.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/trip-planner" className="btn-primary">
                                Plan My Weekend
                            </Link>
                            <Link href="/map" className="btn-outline">
                                Explore Nearby
                            </Link>
                        </div>

                        {/* Trust metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-sm">
                            {[
                                { label: "Trips planned", value: "10k+" },
                                { label: "Cities", value: "40+" },
                                { label: "Savings", value: "32%" },
                                { label: "Pickup success", value: "99.2%" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl p-4"
                                    style={{ backgroundColor: "rgba(28,28,30,0.035)" }}
                                >
                                    <p className="text-lg font-semibold">{item.value}</p>
                                    <p className="text-xs opacity-60">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT – feature showcase */}
                    <div
                        className="relative rounded-3xl p-8 sm:p-10 overflow-hidden"
                        style={{ backgroundColor: "rgba(28,28,30,0.035)" }}
                    >
                        {/* subtle inner glow */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background:
                                    "radial-gradient(120% 80% at 100% 0%, rgba(97,194,162,0.12), transparent 60%)",
                            }}
                        />

                        <div className="relative grid gap-6">
                            <FeatureCard
                                title="Smart personalization"
                                meta="Bengaluru · Culture · Solo"
                                desc="Trips adapt automatically to your interests."
                            />

                            <FeatureCard
                                title="Optimized planning"
                                meta="6 places · 18 km · 1 day"
                                desc="Shortest routes with realistic schedules."
                            />

                            <FeatureCard
                                title="Execution handled"
                                meta="Pickup & payment ready"
                                desc="Vehicle, driver, and checkout prepared."
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function FeatureCard({
    title,
    meta,
    desc,
}: {
    title: string;
    meta: string;
    desc: string;
}) {
    return (
        <div
            className="rounded-2xl p-6 transition"
            style={{
                backgroundColor: "rgba(28,28,30,0.045)",
            }}
        >
            <p className="text-xs uppercase tracking-wide opacity-50 mb-2">
                {title}
            </p>

            <p className="font-semibold">{meta}</p>

            <p className="text-sm opacity-70 mt-1">
                {desc}
            </p>
        </div>
    );
}
