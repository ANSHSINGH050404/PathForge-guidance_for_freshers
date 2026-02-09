# Bug Report - Guidance for Freshers Codebase

**Analysis Date:** 2026-02-08  
**Build Status:** ✅ Successful (TypeScript compilation passed)  
**Severity Levels:** 🔴 Critical | 🟡 Medium | 🟢 Low

---

## 🔴 Critical Bugs

### 1. **Race Condition in Rate Limiting (middleware.ts)**

**File:** `src/lib/middleware.ts`  
**Lines:** 29-33, 53-81  
**Severity:** 🔴 Critical

**Issue:**
The `rateLimit` function is **not async** but is called with `await` in multiple API routes. This is a synchronous function that uses an in-memory Map, which will cause issues in production:

```typescript
// In career/route.ts line 29
const rateLimitResult = rateLimit(
  `career:${clientIp}`,
  MAX_REQUESTS_PER_MINUTE,
  60000,
);
```

**Problems:**

1. In-memory rate limiting won't work across multiple server instances (serverless/edge functions)
2. Rate limit state is lost on server restart
3. No persistence layer for rate limiting
4. The function is synchronous but treated as async in some places

**Impact:** Rate limiting will not work correctly in production, potentially allowing abuse.

**Fix Required:**

- Implement Redis-based rate limiting or use a proper rate limiting service
- Make the function properly async if using external storage
- Add proper error handling

---

### 2. **Inconsistent Rate Limiting Call Pattern**

**Files:**

- `src/app/api/career/route.ts` (line 29)
- `src/app/api/resume-analyzer/route.ts` (line 29)
- `src/app/api/career-path/route.ts` (line 32)

**Severity:** 🔴 Critical

**Issue:**
Rate limiting is called **without await** in career and resume-analyzer routes, but **with await** in career-path route:

```typescript
// career/route.ts - NO await
const rateLimitResult = rateLimit(
  `career:${clientIp}`,
  MAX_REQUESTS_PER_MINUTE,
  60000,
);

// career-path/route.ts - WITH await
const rateLimitResult = await rateLimit(clientIp, 5, 60000);
```

**Impact:** Inconsistent behavior across endpoints. The function is synchronous, so `await` has no effect but creates confusion.

**Fix Required:**

- Standardize the call pattern across all routes
- Either make all calls synchronous OR implement proper async rate limiting

---

### 3. **Memory Leak in setInterval (middleware.ts)**

**File:** `src/lib/middleware.ts`  
**Lines:** 86-93  
**Severity:** 🔴 Critical

**Issue:**

```typescript
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute
```

**Problems:**

1. This `setInterval` runs at module load time and **never gets cleared**
2. In serverless environments (Vercel, AWS Lambda), this will create multiple intervals
3. No cleanup mechanism when the module is unloaded
4. Can cause memory leaks and unexpected behavior

**Impact:** Memory leaks in production, especially in serverless environments.

**Fix Required:**

- Remove the setInterval or implement proper cleanup
- Use a different cleanup strategy (lazy cleanup on access)
- Consider using a proper rate limiting service

---

## 🟡 Medium Severity Bugs

### 4. **Unsafe Type Casting in auth-middleware.ts**

**File:** `src/lib/auth-middleware.ts`  
**Line:** 40  
**Severity:** 🟡 Medium

**Issue:**

```typescript
const ip = req.headers.get("x-real-ip") || (req as any).ip || "unknown";
```

**Problems:**

1. Using `(req as any)` bypasses TypeScript type safety
2. NextRequest doesn't have an `ip` property, this will always be undefined
3. Fallback to "unknown" can cause issues with database constraints

**Impact:** IP detection may fail silently, affecting rate limiting and usage tracking.

**Fix Required:**

```typescript
const ip =
  req.headers.get("x-real-ip") ||
  req.headers.get("x-forwarded-for")?.split(",")[0] ||
  "127.0.0.1";
```

---

### 5. **Duplicate Usage Tracking (CareerPathBuilder.tsx)**

**File:** `src/app/screen/CareerPathBuilder.tsx`  
**Lines:** 151-177, 256-261  
**Severity:** 🟡 Medium

**Issue:**
The component tracks usage in **two places**:

1. localStorage (client-side)
2. Database via API (server-side)

```typescript
// Line 167-172: Reading from localStorage
const getUsageCount = () => {
  const count = parseInt(
    localStorage.getItem("careerPathUsageCount") || "0",
    10,
  );
  setUsageCount(count);
};

// Line 256-260: Also updating localStorage
if (!isAuthenticated) {
  const newCount = usageCount + 1;
  setUsageCount(newCount);
  localStorage.setItem("careerPathUsageCount", newCount.toString());
}
```

**Problems:**

1. localStorage can be cleared by users, bypassing limits
2. Inconsistency between client and server state
3. The server already tracks usage in the database

**Impact:** Users can bypass free trial limits by clearing localStorage.

**Fix Required:**

- Remove localStorage tracking entirely
- Rely solely on server-side database tracking
- Update UI based on server response

---

### 6. **Missing Error Handling for Database Operations**

**File:** `src/lib/auth-middleware.ts`  
**Lines:** 127-158  
**Severity:** 🟡 Medium

**Issue:**
The `incrementUsage` function catches errors but doesn't propagate them:

```typescript
try {
  // database operations
} catch (error) {
  console.error("Failed to increment usage:", error);
  // No error propagation or retry logic
}
```

**Problems:**

1. Silent failures - usage might not be tracked
2. No retry mechanism for transient database errors
3. Could lead to incorrect usage counts

**Impact:** Usage tracking may be unreliable, allowing users to exceed limits.

**Fix Required:**

- Add retry logic for transient errors
- Log errors to a monitoring service
- Consider using a queue for usage updates

---

### 7. **Potential SQL Injection via IP Address**

**File:** `src/lib/auth-middleware.ts`  
**Lines:** 71-75, 128-132  
**Severity:** 🟡 Medium

**Issue:**
While Drizzle ORM provides protection, the IP address is not validated before being used in queries:

```typescript
const record = await db
  .select()
  .from(guestUsage)
  .where(eq(guestUsage.ipAddress, ip))
  .limit(1);
```

**Problems:**

1. No validation of IP address format
2. Could store malformed data in database
3. Potential for unexpected behavior with invalid IPs

**Impact:** Database could contain invalid data, affecting analytics and debugging.

**Fix Required:**

```typescript
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Use before database operations
if (!isValidIP(ip)) {
  return { allowed: false, response: NextResponse.json(...) };
}
```

---

### 8. **Inconsistent Model Names Across API Routes**

**Files:**

- `src/app/api/career-path/route.ts` (line 91)
- `src/app/api/career/route.ts` (line 11)
- `src/app/api/resume-analyzer/route.ts` (line 11)

**Severity:** 🟡 Medium

**Issue:**
Different API routes use different Gemini model versions:

```typescript
// career-path/route.ts
const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// career/route.ts
const MODEL_NAME = "gemini-2.0-flash";

// resume-analyzer/route.ts
const MODEL_NAME = "gemini-1.5-flash";
```

**Problems:**

1. Inconsistent model usage across features
2. "gemini-2.5-flash" may not exist yet (as of comment on line 90)
3. No centralized model configuration
4. Different features may have different capabilities/costs

**Impact:** Inconsistent AI responses, potential API errors, unpredictable costs.

**Fix Required:**

- Create a centralized model configuration
- Use environment variables consistently
- Document which models are used for which features

---

## 🟢 Low Severity Issues

### 9. **Unused Import in middleware.ts**

**File:** `src/lib/middleware.ts`  
**Line:** 2  
**Severity:** 🟢 Low

**Issue:**

```typescript
import { auth } from "./auth";
```

The `auth` import is not used in the middleware file (it's only used in `getSession` which calls `auth.api.getSession`).

**Impact:** Minor - increases bundle size slightly.

**Fix:** Remove unused import or use it properly.

---

### 10. **Missing TypeScript Strict Null Checks**

**File:** `tsconfig.json`  
**Severity:** 🟢 Low

**Issue:**
While `strict: true` is enabled, there are several places where null/undefined checks could be improved:

```typescript
// career-path/route.ts line 129
const responseText = candidate.content.parts[0].text;
// No check if parts[0] exists before accessing .text
```

**Impact:** Potential runtime errors if API response structure changes.

**Fix Required:**

- Add proper null checks
- Use optional chaining: `candidate.content.parts?.[0]?.text`

---

### 11. **Hardcoded Free Trial Limits**

**Files:**

- `src/lib/auth-middleware.ts` (lines 7-11)
- `src/app/screen/CareerPathBuilder.tsx` (line 148)

**Severity:** 🟢 Low

**Issue:**
Free trial limits are hardcoded in multiple places:

```typescript
// auth-middleware.ts
export const FREE_TRIAL_LIMITS = {
  careerPath: 3,
  career: 3,
  resumeAnalyzer: 3,
};

// CareerPathBuilder.tsx
const FREE_TRIAL_LIMIT = 3;
```

**Problems:**

1. Duplication of configuration
2. Difficult to change limits dynamically
3. No A/B testing capability

**Impact:** Harder to adjust business logic, requires code changes for limit updates.

**Fix Required:**

- Move to environment variables or database configuration
- Create a single source of truth
- Consider feature flags for dynamic limits

---

### 12. **Console Logs in Production Code**

**Multiple Files**  
**Severity:** 🟢 Low

**Issue:**
Multiple console.log statements in production code:

```typescript
// CareerPathBuilder.tsx lines 236, 251-254
console.log("Sending request:", { careerPathLabel, techStackWithLabels });
console.log("Received API response:", data);
console.log("Response keys:", Object.keys(data));
console.log("Roadmap state set successfully");

// resume-analyzer/route.ts lines 62, 133
console.log(`Analyzing resume. PDF Size: ${pdfBase64.length} bytes`);
console.log("AI Raw Response (truncated):", rawText?.substring(0, 200));
```

**Impact:** Exposes internal application logic, increases bundle size.

**Fix Required:**

- Use proper logging library (e.g., winston, pino)
- Implement log levels (debug, info, warn, error)
- Disable debug logs in production

---

### 13. **Missing CORS Configuration**

**All API Routes**  
**Severity:** 🟢 Low

**Issue:**
No explicit CORS headers are set in API routes. While Next.js handles this by default, explicit configuration is better for API routes that might be called from external domains.

**Impact:** May cause issues if API needs to be called from different domains.

**Fix Required:**

- Add CORS headers if needed
- Document CORS policy

---

### 14. **No Request Timeout Configuration**

**Files:** All API routes using Google GenAI  
**Severity:** 🟢 Low

**Issue:**
No timeout configuration for AI API calls:

```typescript
const result = await genAI.models.generateContent({
  model: modelId,
  contents: [...]
  // No timeout specified
});
```

**Impact:** Requests could hang indefinitely, consuming resources.

**Fix Required:**

- Add timeout configuration
- Implement request cancellation
- Add proper error handling for timeouts

---

## 📊 Summary

| Severity    | Count  | Issues                                          |
| ----------- | ------ | ----------------------------------------------- |
| 🔴 Critical | 3      | Rate limiting issues, memory leak               |
| 🟡 Medium   | 5      | Type safety, duplicate tracking, error handling |
| 🟢 Low      | 6      | Code quality, configuration management          |
| **Total**   | **14** |                                                 |

---

## 🎯 Priority Fixes

### Immediate (This Week)

1. Fix memory leak in setInterval (Bug #3)
2. Implement proper rate limiting with Redis or similar (Bug #1)
3. Remove localStorage usage tracking (Bug #5)

### Short Term (This Month)

4. Standardize rate limiting calls (Bug #2)
5. Fix IP detection logic (Bug #4)
6. Add proper error handling for database operations (Bug #6)
7. Centralize model configuration (Bug #8)

### Long Term (Next Quarter)

8. Implement proper logging system (Bug #12)
9. Add IP validation (Bug #7)
10. Move configuration to environment variables (Bug #11)
11. Add request timeouts (Bug #14)

---

## 🔧 Recommended Architecture Improvements

1. **Rate Limiting Service**
   - Use Redis or Upstash for distributed rate limiting
   - Implement sliding window algorithm
   - Add rate limit headers to responses

2. **Usage Tracking**
   - Remove client-side tracking entirely
   - Use database as single source of truth
   - Implement event-driven architecture for usage updates

3. **Error Handling**
   - Implement centralized error handling middleware
   - Add structured logging with correlation IDs
   - Set up error monitoring (Sentry, LogRocket, etc.)

4. **Configuration Management**
   - Move all configuration to environment variables
   - Use feature flags for dynamic configuration
   - Implement configuration validation on startup

5. **Type Safety**
   - Add stricter null checks
   - Create proper TypeScript interfaces for all API responses
   - Use Zod for runtime validation of external data

---

## 📝 Notes

- The codebase compiles successfully with TypeScript strict mode
- Most issues are architectural rather than syntax errors
- The application would benefit from integration tests
- Consider adding API documentation (OpenAPI/Swagger)
- Database migrations should be version controlled

---

**Generated by:** Antigravity AI Code Analyzer  
**Next Review:** Recommended after implementing critical fixes
