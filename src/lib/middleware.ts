import { NextRequest } from "next/server";
import { auth } from "./auth";

/**
 * Verify if the request has a valid session
 * Returns the session if valid, null otherwise
 */
export async function getSession(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(
      "better-auth.session_token",
    )?.value;

    if (!sessionToken) {
      return null;
    }

    // Verify session with Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

/**
 * Middleware to protect API routes
 * Returns error response if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return Response.json(
      { error: "Unauthorized. Please sign in to access this resource." },
      { status: 401 },
    );
  }

  return { session, user: session.user };
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000, // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(identifier, record);

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clean up old rate limit records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute
