"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { getMyTrips } from "@/lib/tripApi";
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
  const keyId = (process as any)?.env?.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const pre = searchParams?.get('prefillAmount');
      const tripReq = searchParams?.get('tripRequestId');
      if (pre) setAmount(String(pre));
      if (tripReq) setTripId(String(tripReq));
    } catch (e) {}
  }, [searchParams]);

  // When trips are loaded, or tripId changes, prefill amount from any available field
  // Removed automatic amount update on tripId/trips change to preserve prefilled amount from enroll flow

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tripsData = await getMyTrips();
        // If tripId is set from query and not in trips, add a placeholder booking
        const tripReq = searchParams?.get('tripRequestId');
        const pre = searchParams?.get('prefillAmount');
        let list: any[] = tripsData;
        if (tripReq && !tripsData.some((t: any) => String(t.tripRequestId) === String(tripReq) || String(t.id) === String(tripReq))) {
          list = [
            { id: tripReq, tripRequestId: tripReq, city: '', status: 'ENROLLED', estimatedCost: pre || amount || '' },
            ...tripsData,
          ];
        }
        if (mounted) setTrips(list);
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
      <div className="section py-12 space-y-6">
        <div className="card p-6 space-y-4">
        <h2 className="text-2xl font-bold">Payment</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold">Select Booking</span>
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
              className="border rounded-xl px-4 py-2"
            >
              <option value="">-- Choose a booking --</option>
              {trips.map((t) => (
                <option key={t.tripRequestId || t.id} value={t.tripRequestId || t.id}>
                  {`#${t.tripRequestId || t.id} — ${t.city || 'unknown'} • ${t.status}`}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Amount (INR)</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="border rounded-xl px-4 py-2" />
          </label>
        </div>
            <div className="flex gap-3">
              <button className="btn-primary" onClick={handleCreate} disabled={!tripId || Number(tripId) <= 0}>Pay with Razorpay</button>
            </div>
            {/* Show warning only if no bookings and no tripId from query */}
            {trips.length === 0 && !tripId && (
              <div className="space-y-2">
                <p className="text-sm text-red-600">No bookings found. Create a booking from the Trip Planner or enroll in a package first.</p>
                <div className="flex gap-2">
                  <a href="/trip-planner" className="btn-secondary">Go to Trip Planner</a>
                  <a href="/packages" className="btn-secondary">View Packages</a>
                </div>
              </div>
            )}
        {/* Show order/status only if a booking is selected and order exists */}
        {orderId && tripId && <p className="text-sm text-slate-600">Order ID: {orderId}</p>}
        {status && tripId && <p className="text-sm text-slate-600">Status: {status}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </ProtectedPage>
  );
}
