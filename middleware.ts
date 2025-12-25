import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware is currently not needed for distributor routes
// The /distributor page is public (application form)
// If you add a /distributor/dashboard route in the future, protect it here
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [], // No routes need protection at middleware level for now
};

