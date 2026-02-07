import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/middleware";
import db from "@/index";
import { guestUsage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getGuestIdentifier } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  let session = null;

  try {
    session = await getSession(req);
  } catch (error) {
    console.error("Session check error:", error);
  }

  const isAuthenticated = !!session;

  let usage = {
    careerPath: 0,
    career: 0,
    resumeAnalyzer: 0,
  };

  if (!isAuthenticated) {
    // Fetch usage from DB for guest
    const ip = getGuestIdentifier(req);
    if (ip && ip !== "unknown") {
      try {
        const record = await db
          .select()
          .from(guestUsage)
          .where(eq(guestUsage.ipAddress, ip))
          .limit(1);
        if (record[0]) {
          usage = {
            careerPath: record[0].careerPathCount,
            career: record[0].careerGuideCount,
            resumeAnalyzer: record[0].resumeAnalyzerCount,
          };
        }
      } catch (error) {
        console.error("Error fetching guest usage:", error);
      }
    }
  }

  return NextResponse.json({
    isAuthenticated,
    user: session?.user || null,
    usage,
  });
}
