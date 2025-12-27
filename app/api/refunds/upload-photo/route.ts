// This endpoint is no longer needed - we use Convex mutations directly in the component
// Keeping for backward compatibility but it's not used

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "This endpoint is deprecated" },
    { status: 410 }
  );
}

