"use client";

import { useTourCart } from "@/context/TourCartContext";
import { useState } from "react";
import Link from "next/link";

function getPlaceImage(placeName: string): string {
  const name = placeName.toLowerCase();
  
  // Bengaluru places
  if (name.includes('palace') || name.includes('bangalore palace')) return '/palace.jpeg';
  if (name.includes('iskcon')) return '/iskon.jpeg';
  if (name.includes('ulsoor') || name.includes('lake')) return '/lake.jpeg';
  if (name.includes('cubbon') || name.includes('park')) return '/cprk.jpeg';
  if (name.includes('lalbagh') || name.includes('botanical')) return '/lal.jpeg';
  if (name.includes('food street') || name.includes('vv puram')) return '/street.jpeg';
  
  // Delhi places
  if (name.includes('india gate')) return '/india-gate-1.jpg.jpeg';
  if (name.includes('qutub') || name.includes('minar')) return '/qutub-minar-delhi-1.jpg.jpeg';
  if (name.includes('chandni chowk')) return '/chandni-chowk-by-night.webp';
  if (name.includes('lodhi') || name.includes('garden')) return '/Lodhi_Gardens_on_a_sunny_day.jpg.jpeg';
  if (name.includes('temple') && name.includes('lotus')) return '/main-temple-building.jpg.jpeg';
  
  // Use Unsplash for dynamic images based on place name
  const searchQuery = encodeURIComponent(placeName);
  return `https://source.unsplash.com/400x300/?${searchQuery},landmark,india`;
}

export default function TourCartButton() {
  const { cart, removeFromCart, clearCart, cartCount } = useTourCart();
  const [isOpen, setIsOpen] = useState(false);

  if (cartCount === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[var(--color-brand)] text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        aria-label="Open tour cart"
      >
        <div className="relative">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        </div>
      </button>

      {/* Cart Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md shadow-2xl z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>My Tour Cart</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-text)' }}
                  aria-label="Close cart"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                {cartCount} {cartCount === 1 ? "place" : "places"} selected
                {cart.length > 0 && cart[0].city && (
                  <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(97, 194, 162, 0.1)', color: '#61c2a2' }}>
                    {cart[0].city}
                  </span>
                )}
              </p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--color-text)', opacity: 0.6 }}>Your tour cart is empty</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--color-text)', opacity: 0.4 }}>Add places from the Nearby Attractions section</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((place) => (
                    <div key={place.id} className="p-4 flex gap-4 rounded-xl" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <img
                        src={getPlaceImage(place.name)}
                        alt={place.name}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/sample.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{place.name}</h3>
                        {place.city && (
                          <p className="text-xs" style={{ color: 'var(--color-text)', opacity: 0.6 }}>{place.city}</p>
                        )}
                        {place.category && (
                          <span className="inline-block text-xs px-2 py-1 rounded mt-1" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-text)' }}>
                            {place.category}
                          </span>
                        )}
                        {place.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs" style={{ color: 'var(--color-text)', opacity: 0.7 }}>{place.rating}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(place.id)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0 transition-colors"
                        aria-label="Remove from cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {cart.length > 0 && (
              <div className="p-6 space-y-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <Link
                  href="/trip-planner"
                  className="btn-primary w-full block text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Create Trip with These Places
                </Link>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your cart?")) {
                      clearCart();
                    }
                  }}
                  className="btn-outline w-full"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
