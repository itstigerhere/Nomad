"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { api } from "@/lib/api";
import { createPayment, verifyPayment } from "@/lib/paymentApi";
import { loadRazorpayScript, RazorpayHandlerResponse } from "@/lib/razorpay";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [tripId, setTripId] = useState("");
  const [amount, setAmount] = useState("");
  const [trips, setTrips] = useState<any[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPrefilledPayment, setIsPrefilledPayment] = useState(false);
  const keyId = (process as any)?.env?.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const pre = searchParams?.get('prefillAmount');
      const tripReq = searchParams?.get('tripRequestId');
      if (pre) {
        setAmount(String(pre));
        setIsPrefilledPayment(true);
      }
      if (tripReq) {
        setTripId(String(tripReq));
        setIsPrefilledPayment(true);
      }
    } catch (e) {}
  }, [searchParams]);

  // When trips are loaded, or tripId changes, prefill amount from any available field
  // Removed automatic amount update on tripId/trips change to preserve prefilled amount from enroll flow

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/trips/me');
        let tripsData = data || [];
        // If tripId is set from query and not in trips, add a placeholder booking
        const tripReq = searchParams?.get('tripRequestId');
        const pre = searchParams?.get('prefillAmount');
        if (tripReq && !tripsData.some((t: any) => String(t.tripRequestId) === String(tripReq) || String(t.id) === String(tripReq))) {
          const placeholder = {
            id: tripReq,
            tripRequestId: tripReq,
            city: '',
            status: 'ENROLLED',
            estimatedCost: pre || amount || '',
          };
          tripsData = [placeholder, ...tripsData];
        }
        if (mounted) setTrips(tripsData);
        // Auto-select the booking if tripReq is present
        if (tripReq && mounted) {
          setTimeout(() => {
            setTripId(String(tripReq));
          }, 0);
        }
      } catch (e) {
        // ignore — user might be unauthenticated
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCreate = async () => {
    setError(null);
    if (!tripId || Number(tripId) <= 0) {
      setError("Missing or invalid Trip Request ID. Please enroll first or provide a valid Trip Request ID.");
      return;
    }

    let data;
    try {
      data = await createPayment({ tripRequestId: Number(tripId), amount: Number(amount) });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Payment creation failed");
      return;
    }

    setOrderId(data.razorpayOrderId);
    setStatus(data.paymentStatus);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Razorpay SDK failed to load");
      return;
    }
    if (!keyId) {
      setError("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID");
      return;
    }

    const options = {
      key: keyId,
      amount: Number(amount) * 100,
      currency: "INR",
      name: "NOMAD",
      description: "Weekend Trip Payment",
      order_id: data.razorpayOrderId,
      handler: async (response: RazorpayHandlerResponse) => {
        const verified = await verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        setStatus(verified.paymentStatus);
      },
      theme: {
        color: "#4f6cff",
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen py-12 px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(97, 194, 162, 0.1)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--color-brand)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Complete Your Payment</h1>
            <p style={{ color: 'var(--color-text)', opacity: 0.7 }}>Secure payment powered by Razorpay</p>
          </div>

          {/* Payment Form Card */}
          <div className="rounded-3xl p-8 shadow-lg" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <div className="space-y-6">
              {/* Booking Selection - Only show if not prefilled */}
              {!isPrefilledPayment && (
                <div>
                  <label className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5" style={{ color: 'var(--color-brand)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Select Your Booking</span>
                  </label>
                  <select
                    value={tripId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTripId(v);
                      const t = trips.find(x => String(x.tripRequestId) === v || String(x.id) === v);
                      if (t) {
                        let amt = '';
                        if (typeof t.estimatedCost !== 'undefined' && Number(t.estimatedCost) > 0) amt = String(t.estimatedCost);
                        else if (typeof t.amount !== 'undefined' && Number(t.amount) > 0) amt = String(t.amount);
                        else if (typeof t.price !== 'undefined' && Number(t.price) > 0) amt = String(t.price);
                        else if (typeof t.packagePrice !== 'undefined' && Number(t.packagePrice) > 0) amt = String(t.packagePrice);
                        setAmount(amt);
                      }
                    }}
                    className="w-full rounded-xl px-4 py-3 text-base transition-all"
                    style={{ border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                  >
                    <option value="">-- Choose a booking --</option>
                    {trips.map((t) => (
                      <option key={t.tripRequestId || t.id} value={t.tripRequestId || t.id}>
                        {`#${t.tripRequestId || t.id} — ${t.city || 'unknown'} • ${t.status}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5" style={{ color: 'var(--color-brand)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Amount (INR)</span>
                  {isPrefilledPayment && <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(97, 194, 162, 0.1)', color: 'var(--color-brand)' }}>Fixed Amount</span>}
                </label>
                <input 
                  type="number"
                  value={amount} 
                  onChange={(e) => !isPrefilledPayment && setAmount(e.target.value)}
                  readOnly={isPrefilledPayment}
                  className="w-full rounded-xl px-4 py-3 text-base transition-all"
                  style={{ 
                    border: '2px solid var(--color-border)', 
                    background: isPrefilledPayment ? 'rgba(0,0,0,0.03)' : 'var(--color-bg)', 
                    color: 'var(--color-text)',
                    cursor: isPrefilledPayment ? 'not-allowed' : 'text'
                  }}
                  placeholder="Enter amount"
                />
              </div>

              {/* Payment Summary */}
              {amount && Number(amount) > 0 && (
                <div className="rounded-2xl p-6" style={{ background: 'rgba(97, 194, 162, 0.1)', border: '2px solid var(--color-brand)' }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Total Amount</span>
                    <span className="text-3xl font-bold" style={{ color: 'var(--color-brand)' }}>₹{Number(amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button 
                className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-brand)', color: 'white' }}
                onClick={handleCreate} 
                disabled={!tripId || Number(tripId) <= 0}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Pay Securely with Razorpay
                </span>
              </button>

              {/* No Bookings Warning */}
              {trips.length === 0 && !tripId && (
                <div className="rounded-xl p-6 space-y-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 flex-shrink-0" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold mb-1" style={{ color: '#dc2626' }}>No Bookings Found</p>
                      <p className="text-sm" style={{ color: '#dc2626', opacity: 0.8 }}>Create a booking from the Trip Planner or enroll in a package first.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <a href="/trip-planner" className="flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-all" style={{ background: 'var(--color-brand)', color: 'white' }}>
                      Go to Trip Planner
                    </a>
                    <a href="/packages" className="flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-all" style={{ border: '2px solid var(--color-border)', color: 'var(--color-text)' }}>
                      View Packages
                    </a>
                  </div>
                </div>
              )}

              {/* Order Status */}
              {orderId && tripId && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
                  <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                    Order ID: <span className="font-semibold">{orderId}</span>
                  </p>
                </div>
              )}

              {status && tripId && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' }}>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#16a34a' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Status: <span className="font-semibold">{status}</span>
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Badge */}
          <div className="text-center" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
            <div className="flex items-center justify-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Secured by Razorpay • Your payment is safe and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
