import { NextRequest, NextResponse } from "next/server";

// Free trial configuration
export const FREE_TRIAL_LIMITS = {
  careerPath: 1,
  career: 2,
  resumeAnalyzer: 1,
};

export type EndpointType = keyof typeof FREE_TRIAL_LIMITS;

/**
 * Check if user is authenticated
 * This checks for auth token in cookies or headers
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
 * Get usage count from request headers (sent from frontend)
 * Frontend should send the usage count from localStorage
 */
export function getUsageCount(
  req: NextRequest,
  endpoint: EndpointType,
): number {
  const usageHeader = req.headers.get(`x-${endpoint}-usage`);
  return usageHeader ? parseInt(usageHeader, 10) : 0;
}

/**
 * Check if user has exceeded free trial for a specific endpoint
 */
export function checkFreeTrial(
  req: NextRequest,
  endpoint: EndpointType,
): { allowed: boolean; response?: NextResponse } {
  // If user is authenticated, allow unlimited access
  if (isAuthenticated(req)) {
    return { allowed: true };
  }

  // Get usage count for this endpoint
  const usageCount = getUsageCount(req, endpoint);
  const limit = FREE_TRIAL_LIMITS[endpoint];

  // Check if user has exceeded the limit
  if (usageCount >= limit) {
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
}

/**
 * Middleware to check authentication and free trial
 * Use this at the start of your API route handlers
 */
export function requireAuthOrFreeTrial(
  req: NextRequest,
  endpoint: EndpointType,
): NextResponse | null {
  const result = checkFreeTrial(req, endpoint);

  if (!result.allowed && result.response) {
    return result.response;
  }

  return null;
}
