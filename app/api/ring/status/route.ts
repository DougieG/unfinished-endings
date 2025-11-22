import { NextResponse } from 'next/server';

// In-memory ring state (simple solution for single installation)
// For multiple installations, use Redis or database
let shouldRing = false;

export async function GET() {
  return NextResponse.json({ shouldRing });
}

export async function POST(request: Request) {
  const body = await request.json();
  shouldRing = body.shouldRing ?? false;
  
  console.log(`Ring state set to: ${shouldRing}`);
  
  return NextResponse.json({ shouldRing });
}
