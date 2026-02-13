import { NextRequest } from "next/server";
import { auth } from "./auth";

/**
 * Verify if the request has a valid session
 * Returns the session if valid, null otherwise
 */
export async function getSession(request: NextRequest) {
  try {
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

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
 * Rate limiting helper (in-memory implementation with lazy cleanup)
 * NOTE: For production with multiple instances, use Redis or Upstash
 * This implementation uses lazy cleanup to avoid memory leaks
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Lazy cleanup: Remove expired entries when checking rate limits
 * This avoids the memory leak from setInterval
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => rateLimitMap.delete(key));
}

/**
 * Rate limit check - now properly async for future Redis integration
 */
export async function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000, // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // Perform lazy cleanup on each call (minimal performance impact)
  if (rateLimitMap.size > 100) {
    // Only cleanup if map is getting large
    cleanupExpiredEntries();
  }

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
