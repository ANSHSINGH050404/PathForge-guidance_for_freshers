import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  const session = await getSession(req);

  return NextResponse.json({
    isAuthenticated: !!session,
    user: session?.user || null,
  });
}
