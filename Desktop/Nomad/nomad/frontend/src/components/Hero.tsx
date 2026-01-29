"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsVisible(true);
        
        if (typeof window !== 'undefined') {
            const handleMouseMove = (e: MouseEvent) => {
                setMousePosition({ x: e.clientX, y: e.clientY });
            };
            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);
        }
    }, []);

    if (!mounted) {
        return <div style={{ minHeight: '90vh' }} />; // Placeholder during SSR
    }

    return (
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
            {/* Animated Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Animated gradient orbs */}
                <div
                    className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-[120px] animate-float"
                    style={{
                        background: "radial-gradient(circle at center, rgba(97,194,162,0.4), transparent 70%)",
                        animationDelay: "0s",
                    }}
                />
                <div
                    className="absolute top-1/4 right-1/4 h-[350px] w-[350px] rounded-full blur-[100px] animate-float-slow"
                    style={{
                        background: "radial-gradient(circle at center, rgba(79,108,255,0.25), transparent 70%)",
                        animationDelay: "2s",
                    }}
                />
                <div
                    className="absolute bottom-[-160px] right-[-120px] h-[520px] w-[520px] rounded-full blur-[140px] animate-float"
                    style={{
                        background: "radial-gradient(circle at center, rgba(97,194,162,0.3), transparent 70%)",
                        animationDelay: "4s",
                    }}
                />

                {/* Parallax mouse-following orb */}
                <div
                    className="absolute h-[300px] w-[300px] rounded-full blur-[90px] transition-all duration-[800ms] ease-out"
                    style={{
                        background: "radial-gradient(circle at center, rgba(97,194,162,0.2), transparent 70%)",
                        left: `${mousePosition.x * 0.05}px`,
                        top: `${mousePosition.y * 0.05}px`,
                    }}
                />

                {/* Animated grid pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(var(--color-text) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-text) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>

            {/* Hero content */}
            <div className="section pt-24 pb-20 sm:pt-32 sm:pb-28 relative w-full">
                <div className="grid gap-16 lg:grid-cols-2 items-center">
                    {/* LEFT */}
                    <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <span className="badge animate-slide-down" style={{ animationDelay: "0.2s" }}>
                            ✨ Trusted by 10,000+ Travelers
                        </span>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-slide-up">
                            Plan Your Perfect
                            <br />
                            <span 
                                className="bg-gradient-to-r from-[#61c2a2] via-[#4f6cff] to-[#61c2a2] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
                            >
                                Weekend Getaway
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg lg:text-xl opacity-70 max-w-xl animate-slide-up" style={{ animationDelay: "0.3s" }}>
                            Tell us your interests, and we'll create a 
                            <span className="font-semibold text-[var(--color-brand)]">custom weekend itinerary</span> — 
                            with the best places to visit, optimized routes, and hassle-free bookings. 
                            <span className="block mt-2 text-base opacity-90">🚗 Transport arranged  •  💳 Secure payments  •  ⚡ Instant booking</span>
                        </p>

                        <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                            <Link 
                                href="/trip-planner" 
                                className="btn-primary group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Planning - It's Free
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </Link>
                            <Link 
                                href="/map" 
                                className="btn-outline group"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Explore Nearby
                                </span>
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center gap-4 text-sm opacity-60 animate-fade-in" style={{ animationDelay: "0.45s" }}>
                            <span className="flex items-center gap-1">✓ No hidden charges</span>
                            <span className="flex items-center gap-1">✓ Instant confirmation</span>
                            <span className="flex items-center gap-1">✓ 24/7 support</span>
                        </div>

                        {/* Animated Trust metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                            {[
                                { label: "Happy travelers", value: "10k+", icon: "😊", delay: "0.5s" },
                                { label: "Cities covered", value: "40+", icon: "🌆", delay: "0.6s" },
                                { label: "Money saved", value: "₹5000", icon: "💰", delay: "0.7s" },
                                { label: "Rated excellent", value: "4.9/5", icon: "⭐", delay: "0.8s" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl p-4 backdrop-blur-sm border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in group cursor-pointer"
                                    style={{ 
                                        backgroundColor: "rgba(28,28,30,0.05)",
                                        animationDelay: item.delay,
                                    }}
                                >
                                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <p className="text-xl font-bold bg-gradient-to-br from-[var(--color-text)] to-[var(--color-brand)] bg-clip-text text-transparent">
                                        {item.value}
                                    </p>
                                    <p className="text-xs opacity-60">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT – Interactive feature showcase */}
                    <div
                        className={`relative rounded-3xl p-8 sm:p-10 overflow-hidden backdrop-blur-md border border-[var(--color-border)] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                        style={{ 
                            backgroundColor: "rgba(28,28,30,0.05)",
                        }}
                    >
                        {/* Animated inner glow */}
                        <div
                            className="absolute inset-0 pointer-events-none animate-pulse-slow"
                            style={{
                                background: "radial-gradient(120% 80% at 100% 0%, rgba(97,194,162,0.15), transparent 60%)",
                            }}
                        />

                        {/* Floating particles */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-1 bg-[var(--color-brand)] rounded-full animate-float-particle"
                                    style={{
                                        left: `${20 + i * 15}%`,
                                        top: `${10 + i * 20}%`,
                                        animationDelay: `${i * 0.8}s`,
                                        opacity: 0.3,
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative grid gap-6">
                            <FeatureCard
                                title="1. Tell us your interests"
                                meta="Culture • Food • Adventure • Nature"
                                desc="Share what you love to do, and we'll find the perfect places for you."
                                icon="💬"
                                delay="0.2s"
                            />

                            <FeatureCard
                                title="2. Get your custom plan"
                                meta="6 places · Optimized route · Full day"
                                desc="We'll create a smart itinerary that saves you time and maximizes fun."
                                icon="🗓️"
                                delay="0.4s"
                            />

                            <FeatureCard
                                title="3. Book everything instantly"
                                meta="Transport + Pickup + Secure payment"
                                desc="One-click booking for your entire trip. No hassle, just travel!"
                                icon="🎉"
                                delay="0.6s"
                            />
                        </div>

                        {/* Pulsing accent dots */}
                        <div className="absolute top-6 right-6 w-3 h-3 bg-[var(--color-brand)] rounded-full animate-ping" />
                        <div className="absolute bottom-6 left-6 w-2 h-2 bg-[var(--color-brand)] rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.05); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-40px, 40px); }
                }
                @keyframes float-particle {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.15; }
                    50% { opacity: 0.25; }
                }
                .animate-float { animation: float 20s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 25s ease-in-out infinite; }
                .animate-float-particle { animation: float-particle 8s ease-in-out infinite; }
                .animate-gradient { animation: gradient 5s ease infinite; }
                .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
                .animate-slide-down { animation: slide-down 0.6s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            `}</style>
        </section>
    );
}

function FeatureCard({
    title,
    meta,
    desc,
    icon,
    delay,
}: {
    title: string;
    meta: string;
    desc: string;
    icon: string;
    delay: string;
}) {
    return (
        <div
            className="rounded-2xl p-6 backdrop-blur-sm border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer animate-fade-in"
            style={{
                backgroundColor: "rgba(28,28,30,0.08)",
                animationDelay: delay,
            }}
        >
            <div className="flex items-start gap-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide opacity-50 mb-2 group-hover:opacity-70 transition-opacity">
                        {title}
                    </p>
                    <p className="font-semibold text-lg mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                        {meta}
                    </p>
                    <p className="text-sm opacity-70 group-hover:opacity-90 transition-opacity">
                        {desc}
                    </p>
                </div>
            </div>
        </div>
    );
}
