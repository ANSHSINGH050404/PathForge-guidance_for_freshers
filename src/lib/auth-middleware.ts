import { NextRequest, NextResponse } from "next/server";
import db from "@/index";
import { guestUsage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/middleware";

// Free trial configuration
export const FREE_TRIAL_LIMITS = {
  careerPath: 3,
  career: 3,
  resumeAnalyzer: 3,
};

export type EndpointType = keyof typeof FREE_TRIAL_LIMITS;

/**
 * Validate IP address format (IPv4 or IPv6)
 */
function isValidIP(ip: string): boolean {
  if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return true; // Allow localhost and unknown for development
  }

  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".");
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  return ipv6Regex.test(ip);
}

/**
 * Check if user is authenticated
 * Note: This performs a quick cookie check. For robust verification, use getSession()
 */
export function isAuthenticated(req: NextRequest): boolean {
  // Check for auth token in cookies
  // The system uses 'better-auth.session_token' for session management
  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  // Check for auth token in Authorization header (if applicable)
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  return !!(sessionToken || bearerToken);
}

/**
 * Get guest identifier (IP address)
 * Uses standard headers for IP detection in production environments
 */
export function getGuestIdentifier(req: NextRequest): string {
  // Check x-forwarded-for header (most common in production)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Check x-real-ip header (used by some proxies)
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Development fallback
  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  // Production fallback - should rarely happen
  return "unknown";
}

/**
 * Check if user has exceeded free trial for a specific endpoint using DB
 */
export async function checkFreeTrial(
  req: NextRequest,
  endpoint: EndpointType,
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // Try to get session first (most robust check)
  const session = await getSession(req);
  if (session) {
    return { allowed: true };
  }

  // Fallback to quick cookie check if getSession fails but cookie exists (unlikely but safe)
  if (isAuthenticated(req)) {
    // Ideally getSession should have worked if isAuthenticated returns true.
    // But if getSession needs DB and DB is down, maybe fail safe?
    // Actually, if getSession returns null, it means no valid session found.
    // So we proceed to guest check.
  }

  const ip = getGuestIdentifier(req);

  // Validate IP address format
  if (!isValidIP(ip)) {
    console.warn(`Invalid IP address detected: ${ip}`);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Invalid client identifier." },
        { status: 400 },
      ),
    };
  }

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
 * Increment usage count for guest with retry logic
 */
export async function incrementUsage(
  req: NextRequest,
  endpoint: EndpointType,
  retries: number = 2,
): Promise<void> {
  // Check session first
  const session = await getSession(req);
  if (session) return;

  const ip = getGuestIdentifier(req);

  // Validate IP before database operations
  if (!isValidIP(ip) || ip === "unknown") {
    console.warn(`Skipping usage increment for invalid IP: ${ip}`);
    return;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
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

      // Success - exit retry loop
      return;
    } catch (error) {
      const isLastAttempt = attempt === retries;

      if (isLastAttempt) {
        // Log error on final attempt
        console.error(
          `Failed to increment usage after ${retries + 1} attempts:`,
          error,
        );
        // Could send to error monitoring service here (e.g., Sentry)
      } else {
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms...
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
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
