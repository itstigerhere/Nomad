"use client";
import PackageCard from "@/components/PackageCard";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/authApi";

const PlacesList = dynamic(() => import("@/components/PlacesList"), { ssr: false });

async function fetchHomepagePackages() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/packages/homepage`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    fetchMe().then(setUser).catch(() => setUser(null));
    fetchHomepagePackages().then(setPackages);
  }, []);
  
  return (
    <div>
      {/* Enhanced Hero Section */}
      <section className="hero-section relative overflow-hidden py-20 sm:py-24 lg:py-28">
        {/* Animated Background Elements */}
        <div className="hero-bg-gradient"></div>
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
        
        <div className="section relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 hero-content">
              <div className="space-y-4">
                <span className="badge inline-flex items-center gap-2 animate-fade-in">
                  ✨ Trusted by 10,000+ Weekend Travelers
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight animate-slide-up">
                  Your Dream<br />
                  <span className="hero-gradient-text">Weekend Escape</span><br />
                  Made Effortless
                </h1>
                <p className="text-lg sm:text-xl opacity-80 animate-slide-up-delay">
                  Just tell us what you love — we handle everything from personalized routes to pickup arrangements. 
                  Start your adventure in just 3 simple steps.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-sm animate-slide-up-delay-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-brand)] bg-opacity-10">
                    <span>⭐</span>
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: 'var(--color-brand)' }}>4.9/5 Rating</div>
                    <div className="text-xs opacity-60">From 2,000+ reviews</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-brand)] bg-opacity-10">
                    <span>💰</span>
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: 'var(--color-brand)' }}>₹5000 Saved</div>
                    <div className="text-xs opacity-60">Average per trip</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-brand)] bg-opacity-10">
                    <span>🔒</span>
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: 'var(--color-brand)' }}>100% Secure</div>
                    <div className="text-xs opacity-60">Razorpay protected</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 items-center animate-slide-up-delay-3">
                <a className="btn-primary px-8 py-4 text-lg font-semibold hover-lift" href="/trip-planner">
                  Start Planning - It's Free →
                </a>
                <a className="btn-outline px-8 py-4 text-lg hover-lift" href="/map">
                  Explore Nearby
                </a>
                {user && (
                  <div className="ml-4 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ border: '2px solid var(--color-brand)' }}>
                      <img
                        src={user.profilePhotoUrl ? user.profilePhotoUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=4f6cff&color=fff&rounded=true&size=40`}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{user.email.split("@")[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card - How It Works */}
            <div className="card p-8 sm:p-10 hero-card backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">How It Works</h3>
                  <span className="badge">3 Easy Steps</span>
                </div>
                
                <div className="space-y-5">
                  {[
                    { 
                      num: "1", 
                      icon: "💭",
                      title: "Tell Us Your Interests", 
                      desc: "Museums, food, nature? We'll find places you'll love",
                      color: "rgba(79, 108, 255, 0.1)"
                    },
                    { 
                      num: "2", 
                      icon: "🗺️",
                      title: "Get Your Perfect Plan", 
                      desc: "AI creates optimized routes with timing and details",
                      color: "rgba(97, 194, 162, 0.1)"
                    },
                    { 
                      num: "3", 
                      icon: "🚗",
                      title: "Book & Enjoy", 
                      desc: "Secure payment, pickup arranged, memories made",
                      color: "rgba(255, 107, 107, 0.1)"
                    }
                  ].map((step, idx) => (
                    <div 
                      key={step.num} 
                      className="flex gap-4 p-4 rounded-xl border border-[var(--color-border)] hover-lift transition-all duration-300"
                      style={{ 
                        backgroundColor: step.color,
                        animationDelay: `${idx * 0.1}s`
                      }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold" 
                           style={{ background: 'var(--color-brand)', color: 'white' }}>
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{step.icon}</span>
                          <h4 className="font-bold text-lg">{step.title}</h4>
                        </div>
                        <p className="text-sm opacity-70">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold text-2xl" style={{ color: 'var(--color-brand)' }}>40+</div>
                      <div className="opacity-60">Cities</div>
                    </div>
                    <div>
                      <div className="font-bold text-2xl" style={{ color: 'var(--color-brand)' }}>500+</div>
                      <div className="opacity-60">Places</div>
                    </div>
                    <div>
                      <div className="font-bold text-2xl" style={{ color: 'var(--color-brand)' }}>24/7</div>
                      <div className="opacity-60">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-section {
            position: relative;
            background: linear-gradient(135deg, rgba(79, 108, 255, 0.03) 0%, rgba(97, 194, 162, 0.03) 100%);
          }

          .hero-bg-gradient {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 30% 50%, rgba(79, 108, 255, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 70% 50%, rgba(97, 194, 162, 0.08) 0%, transparent 50%);
            animation: rotate 20s linear infinite;
            pointer-events: none;
          }

          .hero-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.4;
            pointer-events: none;
          }

          .hero-orb-1 {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(79, 108, 255, 0.3) 0%, transparent 70%);
            top: 10%;
            left: 10%;
            animation: float 8s ease-in-out infinite;
          }

          .hero-orb-2 {
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, rgba(97, 194, 162, 0.3) 0%, transparent 70%);
            bottom: 20%;
            right: 15%;
            animation: float 10s ease-in-out infinite reverse;
          }

          .hero-orb-3 {
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255, 107, 107, 0.2) 0%, transparent 70%);
            top: 50%;
            right: 30%;
            animation: float 12s ease-in-out infinite;
          }

          .hero-gradient-text {
            background: linear-gradient(135deg, var(--color-brand) 0%, #61c2a2 50%, var(--color-brand) 100%);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient 4s ease infinite;
          }

          .hero-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(0px) translateX(20px); }
            75% { transform: translateY(20px) translateX(10px); }
          }

          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }

          .animate-slide-up {
            animation: slideUp 0.8s ease-out 0.2s forwards;
            opacity: 0;
          }

          .animate-slide-up-delay {
            animation: slideUp 0.8s ease-out 0.4s forwards;
            opacity: 0;
          }

          .animate-slide-up-delay-2 {
            animation: slideUp 0.8s ease-out 0.6s forwards;
            opacity: 0;
          }

          .animate-slide-up-delay-3 {
            animation: slideUp 0.8s ease-out 0.8s forwards;
            opacity: 0;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>
      {/* Nearby Attractions Section */}
      <section className="section py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-brand)] to-transparent opacity-20"></div>
        
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <span className="badge mb-4">🗺️ Discover Local Gems</span>
          <h3 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Nearby <span style={{ color: 'var(--color-brand)' }}>Attractions</span>
          </h3>
          <p className="text-lg opacity-70">
            Handpicked places near you — explore, plan, and add to your perfect weekend tour
          </p>
        </div>
        
        <div className="places-list-container">
          <PlacesList />
        </div>

        <style jsx>{`
          .places-list-container {
            animation: fadeInScale 0.8s ease-out forwards;
          }

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </section>

      {/* Featured Weekend Packages Section */}
      <section className="section py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(79,108,255,0.02)] to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className="badge mb-4">🎯 Curated Experiences</span>
            <h3 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              Featured <span style={{ color: 'var(--color-brand)' }}>Weekend Packages</span>
            </h3>
            <p className="text-lg opacity-70">
              Pre-planned itineraries with everything included — just pick and book your adventure
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {packages.map((p: any, idx: number) => (
              <div 
                key={p.id} 
                className="package-card-wrapper"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <PackageCard pkg={p} />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                title: "🎨 Personalized Plans", 
                desc: "AI-powered recommendations based on your interests, preferences, and travel style",
                gradient: "linear-gradient(135deg, rgba(79, 108, 255, 0.1) 0%, rgba(79, 108, 255, 0.05) 100%)"
              },
              { 
                title: "🚗 Travel Assistance", 
                desc: "Complete pickup coordination, vehicle allocation, and driver management for groups",
                gradient: "linear-gradient(135deg, rgba(97, 194, 162, 0.1) 0%, rgba(97, 194, 162, 0.05) 100%)"
              },
              { 
                title: "🔒 Secure Payments", 
                desc: "Razorpay-powered checkout with instant booking confirmation and refund protection",
                gradient: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%)"
              }
            ].map((feature, idx) => (
              <div 
                key={feature.title} 
                className="feature-card card p-6 hover-lift"
                style={{ 
                  background: feature.gradient,
                  animationDelay: `${(packages.length + idx) * 0.1}s`
                }}
              >
                <h4 className="font-bold text-xl mb-3" style={{ color: 'var(--color-text)' }}>
                  {feature.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a 
              href="/packages" 
              className="btn-outline px-8 py-4 text-lg inline-flex items-center gap-2 hover-lift"
            >
              Explore All Packages
              <span>→</span>
            </a>
          </div>
        </div>

        <style jsx>{`
          .package-card-wrapper,
          .feature-card {
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
          }

          .feature-card {
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
          }

          .feature-card:hover {
            border-color: var(--color-brand);
            transform: translateY(-8px);
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>
    </div>
  );
}
