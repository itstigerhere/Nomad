"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Trip {
  tripRequestId: number;
  status: string;
  estimatedCost: number;
  city?: string;
  weekendType?: string;
  interest?: string;
  travelMode?: string;
  plans?: any[];
}

function getTripName(trip: Trip): string {
  const city = trip.city || 'Unknown';
  const type = trip.weekendType === 'TWO_DAY' ? 'Weekend' : 'Day';
  const interest = trip.interest ? ` - ${trip.interest.charAt(0) + trip.interest.slice(1).toLowerCase()}` : '';
  return `${city} ${type} Trip${interest}`;
}

function getTripIcon(trip: Trip): string {
  // Return emoji based on interest type
  if (trip.interest === 'CULTURE') return '🏛️';
  if (trip.interest === 'FOOD') return '🍽️';
  if (trip.interest === 'NATURE') return '🌳';
  if (trip.interest === 'ADVENTURE') return '🏔️';
  if (trip.interest === 'NIGHTLIFE') return '🎉';
  if (trip.interest === 'SHOPPING') return '🛍️';
  if (trip.interest === 'RELAXATION') return '🧘';
  return '✈️';
}

function getTripImage(trip: Trip): string {
  // Get trip image based on city and interest
  const city = trip.city?.toLowerCase();
  const interest = trip.interest?.toLowerCase();
  
  // City-based images
  if (city === 'bengaluru' || city === 'bangalore') {
    if (interest === 'culture') return '/palace.jpeg';
    if (interest === 'nature') return '/lal.jpeg';
    if (interest === 'relaxation') return '/lake.jpeg';
    if (interest === 'food') return '/street.jpeg';
    return '/blr.jpeg'; // Default Bengaluru image
  }
  
  if (city === 'mumbai') {
    return '/mum.jpeg';
  }
  
  if (city === 'delhi') {
    if (interest === 'culture') return '/india-gate-1.jpg.jpeg';
    if (interest === 'nightlife') return '/chandni-chowk-by-night.webp';
    if (interest === 'nature') return '/Lodhi_Gardens_on_a_sunny_day.jpg.jpeg';
    return '/del.jpeg'; // Default Delhi image
  }
  
  // Default fallback
  return '/sample.jpg';
}

const TripsPage: React.FC = () => {
  const [enrolledTrips, setEnrolledTrips] = useState<Trip[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('nomad_token');
      const res = await fetch("http://localhost:8080/api/trips/me", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Failed to fetch trips");
      const data = await res.json();
      
      // Sort trips by tripRequestId (descending) - most recent first
      const sortedData = [...data].sort((a: Trip, b: Trip) => b.tripRequestId - a.tripRequestId);
      
      setEnrolledTrips(sortedData.filter((t: Trip) => t.status === "PLANNED" || t.status === "IN_PROGRESS" || t.status === "ENROLLED" || t.status === "REQUESTED" || t.status === "PAYMENT_PENDING"));
      setPastTrips(sortedData.filter((t: Trip) => t.status === "COMPLETED"));
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(tripId: number, status: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow cancellation for REQUESTED and PAYMENT_PENDING trips
    if (status !== 'REQUESTED' && status !== 'PAYMENT_PENDING') {
      alert('Only unpaid trips can be cancelled. For paid trips, please contact support.');
      return;
    }
    
    if (!confirm('Are you sure you want to cancel this trip? This action cannot be undone.')) {
      return;
    }

    setDeletingId(tripId);
    try {
      const token = localStorage.getItem('nomad_token');
      const res = await fetch(`http://localhost:8080/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to cancel trip' }));
        throw new Error(error.message || "Failed to cancel trip");
      }
      
      // Refresh trips list
      await fetchTrips();
    } catch (err: any) {
      alert(err.message || "Failed to cancel trip");
    } finally {
      setDeletingId(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PLANNED':
      case 'ENROLLED':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a', border: '#22c55e' };
      case 'REQUESTED':
      case 'PAYMENT_PENDING':
        return { bg: 'rgba(251, 191, 36, 0.1)', text: '#d97706', border: '#fbbf24' };
      case 'IN_PROGRESS':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', border: '#3b82f6' };
      case 'COMPLETED':
        return { bg: 'rgba(168, 85, 247, 0.1)', text: '#9333ea', border: '#a855f7' };
      case 'CANCELLED':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626', border: '#ef4444' };
      default:
        return { bg: 'rgba(0,0,0,0.05)', text: 'var(--color-text)', border: 'var(--color-border)' };
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(97, 194, 162, 0.1)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--color-brand)' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>My Trips</h1>
          <p style={{ color: 'var(--color-text)', opacity: 0.7 }}>Manage your bookings and travel history</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}></div>
            <p className="mt-4" style={{ color: 'var(--color-text)', opacity: 0.7 }}>Loading your trips...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl p-6 flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
            <svg className="w-6 h-6 flex-shrink-0" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="font-semibold" style={{ color: '#dc2626' }}>Error Loading Trips</p>
              <p className="text-sm" style={{ color: '#dc2626', opacity: 0.8 }}>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Currently Enrolled Trips */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6" style={{ color: 'var(--color-brand)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Active Bookings</h2>
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'var(--color-brand)', color: 'white' }}>{enrolledTrips.length}</span>
              </div>
              
              {/* Trip Limit Warning */}
              {enrolledTrips.length >= 5 && (
                <div className="rounded-xl p-4 mb-4 flex items-start gap-3" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '2px solid #eab308' }}>
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ca8a04' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#ca8a04' }}>Maximum Trip Limit Reached</p>
                    <p className="text-sm" style={{ color: '#ca8a04', opacity: 0.9 }}>You have {enrolledTrips.length} active trips. Maximum allowed is 5. Please delete some trips before creating new ones.</p>
                  </div>
                </div>
              )}
              
              {enrolledTrips.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ border: '2px dashed var(--color-border)' }}>
                  <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text)', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mb-2" style={{ color: 'var(--color-text)', opacity: 0.6 }}>No active bookings</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text)', opacity: 0.5 }}>Start planning your next adventure</p>
                  <a href="/trip-planner" className="inline-block px-6 py-3 rounded-xl font-semibold transition-all" style={{ background: 'var(--color-brand)', color: 'white' }}>
                    Plan a Trip
                  </a>
                </div>
              ) : (
                <div className="grid gap-4">
                  {enrolledTrips.map((trip) => {
                    const statusStyle = getStatusColor(trip.status);
                    const isExpanded = expandedTripId === trip.tripRequestId;
                    return (
                      <div key={trip.tripRequestId} className="rounded-2xl transition-all hover:shadow-lg" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div 
                          className="p-6 cursor-pointer"
                          onClick={() => setExpandedTripId(isExpanded ? null : trip.tripRequestId)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                <img 
                                  src={getTripImage(trip)}
                                  alt={getTripName(trip)}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/sample.jpg';
                                  }}
                                />
                                <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-sm">
                                  {getTripIcon(trip)}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text)' }}>{getTripName(trip)}</h3>
                                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                    </svg>
                                    {trip.city || 'City'}
                                  </span>
                                  {trip.weekendType && (
                                    <span>• {trip.weekendType === 'TWO_DAY' ? '2 Days' : '1 Day'}</span>
                                  )}
                                  {trip.travelMode && (
                                    <span>• {trip.travelMode.charAt(0) + trip.travelMode.slice(1).toLowerCase()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                                {trip.status}
                              </span>
                              <div className="text-right">
                                <div className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>Total</div>
                                <div className="text-2xl font-bold" style={{ color: 'var(--color-brand)' }}>₹{trip.estimatedCost.toLocaleString()}</div>
                              </div>
                              {(trip.status === 'REQUESTED' || trip.status === 'PAYMENT_PENDING') && (
                                <>
                                  <a
                                    href={`/payment?tripRequestId=${trip.tripRequestId}&prefillAmount=${trip.estimatedCost ?? ''}`}
                                    className="px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-md"
                                    style={{ background: '#10b981', color: 'white' }}
                                    title="Complete payment to confirm booking"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Pay Now
                                  </a>
                                  <button
                                    onClick={(e) => handleDelete(trip.tripRequestId, trip.status, e)}
                                    disabled={deletingId === trip.tripRequestId}
                                    className="p-2 rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}
                                    title="Cancel this unpaid trip"
                                  >
                                    {deletingId === trip.tripRequestId ? (
                                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                                      </svg>
                                    )}
                                  </button>
                                </>
                              )}
                              {(trip.status === 'PLANNED' || trip.status === 'IN_PROGRESS' || trip.status === 'ENROLLED') && (
                                <span className="text-sm px-3 py-1 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                  Paid & Confirmed
                                </span>
                              )}
                              <svg 
                                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                style={{ color: 'var(--color-text)', opacity: 0.5 }}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Itinerary Section */}
                        {isExpanded && trip.plans && trip.plans.length > 0 && trip.plans[0].places && (
                          <div className="px-6 pb-6 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <h4 className="font-bold text-lg mb-4" style={{ color: '#61c2a2' }}>Trip Itinerary</h4>
                            <div className="space-y-3">
                              {trip.plans[0].places.map((place: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(97, 194, 162, 0.05)' }}>
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#61c2a2', color: 'white' }}>
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{place.placeName}</p>
                                    <div className="flex items-center gap-4 mt-1 text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                                        </svg>
                                        Day {place.dayNumber}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                        </svg>
                                        {place.startTime} - {place.endTime}
                                      </span>
                                      {place.category && (
                                        <>
                                          <span>•</span>
                                          <span className="capitalize">{place.category.toLowerCase()}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Trips */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6" style={{ color: 'var(--color-text)', opacity: 0.6 }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Past Trips</h2>
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-text)' }}>{pastTrips.length}</span>
              </div>
              
              {pastTrips.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ border: '2px dashed var(--color-border)' }}>
                  <p style={{ color: 'var(--color-text)', opacity: 0.6 }}>No completed trips yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pastTrips.map((trip) => {
                    const statusStyle = getStatusColor(trip.status);
                    const isExpanded = expandedTripId === trip.tripRequestId;
                    return (
                      <div key={trip.tripRequestId} className="rounded-2xl transition-all hover:shadow-md" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', opacity: 0.8 }}>
                        <div 
                          className="p-6 cursor-pointer"
                          onClick={() => setExpandedTripId(isExpanded ? null : trip.tripRequestId)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                <img 
                                  src={getTripImage(trip)}
                                  alt={getTripName(trip)}
                                  className="w-full h-full object-cover"
                                  style={{ filter: 'grayscale(30%)' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/sample.jpg';
                                  }}
                                />
                                <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-sm">
                                  {getTripIcon(trip)}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text)' }}>{getTripName(trip)}</h3>
                                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text)', opacity: 0.5 }}>
                                  <span>{trip.city || 'City'}</span>
                                  {trip.weekendType && (
                                    <span>• {trip.weekendType === 'TWO_DAY' ? '2 Days' : '1 Day'}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                                {trip.status}
                              </span>
                              <div className="text-right">
                                <div className="text-2xl font-bold" style={{ color: 'var(--color-text)', opacity: 0.6 }}>₹{trip.estimatedCost.toLocaleString()}</div>
                              </div>
                              <svg 
                                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                style={{ color: 'var(--color-text)', opacity: 0.3 }}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Itinerary Section */}
                        {isExpanded && trip.plans && trip.plans.length > 0 && trip.plans[0].places && (
                          <div className="px-6 pb-6 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <h4 className="font-bold text-lg mb-4" style={{ color: '#61c2a2' }}>Trip Itinerary</h4>
                            <div className="space-y-3">
                              {trip.plans[0].places.map((place: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(97, 194, 162, 0.05)' }}>
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#61c2a2', color: 'white' }}>
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{place.placeName}</p>
                                    <div className="flex items-center gap-4 mt-1 text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                                        </svg>
                                        Day {place.dayNumber}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                        </svg>
                                        {place.startTime} - {place.endTime}
                                      </span>
                                      {place.category && (
                                        <>
                                          <span>•</span>
                                          <span className="capitalize">{place.category.toLowerCase()}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TripsPage;
