import { NextRequest, NextResponse } from "next/server";
import db from "@/index";
import { guestUsage } from "@/db/schema";
import { eq } from "drizzle-orm";

// Free trial configuration
export const FREE_TRIAL_LIMITS = {
  careerPath: 1,
  career: 2,
  resumeAnalyzer: 1,
};

export type EndpointType = keyof typeof FREE_TRIAL_LIMITS;

/**
 * Check if user is authenticated
 */
export function isAuthenticated(req: NextRequest): boolean {
  // Check for auth token in cookies
  // The system uses 'better-auth.session_token' for session management
  const sessionToken = req.cookies.get("better-auth.session_token")?.value;

  // Check for auth token in Authorization header (if applicable)
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  return !!(sessionToken || bearerToken);
}

/**
 * Get guest identifier (IP address)
 */
export function getGuestIdentifier(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Check if user has exceeded free trial for a specific endpoint using DB
 */
export async function checkFreeTrial(
  req: NextRequest,
  endpoint: EndpointType,
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // If user is authenticated, allow unlimited access
  if (isAuthenticated(req)) {
    return { allowed: true };
  }

  const ip = getGuestIdentifier(req);
  if (ip === "unknown") {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Could not identify client for free trial check." },
        { status: 400 },
      ),
    };
  }

  try {
    const record = await db
      .select()
      .from(guestUsage)
      .where(eq(guestUsage.ipAddress, ip))
      .limit(1);
    const usage = record[0];

    const limit = FREE_TRIAL_LIMITS[endpoint];
    let currentUsage = 0;

    if (usage) {
      if (endpoint === "careerPath") currentUsage = usage.careerPathCount;
      else if (endpoint === "career") currentUsage = usage.careerGuideCount;
      else if (endpoint === "resumeAnalyzer")
        currentUsage = usage.resumeAnalyzerCount;
    }

    if (currentUsage >= limit) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: "Free trial limit exceeded",
            message: `You have used all ${limit} free ${endpoint} ${limit === 1 ? "request" : "requests"}. Please sign in to continue.`,
            requiresAuth: true,
          },
          { status: 403 },
        ),
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Database error checking free trial:", error);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "System error checking free trial status." },
        { status: 500 },
      ),
    };
  }
}

/**
 * Increment usage count for guest
 */
export async function incrementUsage(
  req: NextRequest,
  endpoint: EndpointType,
): Promise<void> {
  if (isAuthenticated(req)) return;

  const ip = getGuestIdentifier(req);
  if (ip === "unknown") return;

  try {
    const existing = await db
      .select()
      .from(guestUsage)
      .where(eq(guestUsage.ipAddress, ip))
      .limit(1);

    if (existing.length === 0) {
      const newRecord = {
        ipAddress: ip,
        careerPathCount: endpoint === "careerPath" ? 1 : 0,
        careerGuideCount: endpoint === "career" ? 1 : 0,
        resumeAnalyzerCount: endpoint === "resumeAnalyzer" ? 1 : 0,
      };
      await db.insert(guestUsage).values(newRecord);
    } else {
      const updates: any = { updatedAt: new Date() };
      if (endpoint === "careerPath")
        updates.careerPathCount = existing[0].careerPathCount + 1;
      else if (endpoint === "career")
        updates.careerGuideCount = existing[0].careerGuideCount + 1;
      else if (endpoint === "resumeAnalyzer")
        updates.resumeAnalyzerCount = existing[0].resumeAnalyzerCount + 1;

      await db
        .update(guestUsage)
        .set(updates)
        .where(eq(guestUsage.ipAddress, ip));
    }
  } catch (error) {
    console.error("Failed to increment usage:", error);
  }
}

/**
 * Middleware to check authentication and free trial
 */
export async function requireAuthOrFreeTrial(
  req: NextRequest,
  endpoint: EndpointType,
): Promise<NextResponse | null> {
  const result = await checkFreeTrial(req, endpoint);

  if (!result.allowed && result.response) {
    return result.response;
  }

  return null;
}
