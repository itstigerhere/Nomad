import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Fetch real trip data from backend
  const res = await fetch('http://localhost:8080/api/trips/me', {
    credentials: 'include', // if using cookies/session
    // headers: { 'Authorization': `Bearer ${token}` }, // if using JWT
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: res.status });
  }

  const trips = await res.json();
  return NextResponse.json(trips);
}
