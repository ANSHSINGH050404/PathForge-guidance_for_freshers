# 🏗️ Architecture Diagram - Guidance for Freshers

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Hero       │  │   Features   │  │   Navbar     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────────────────────────────────────────────┐           │
│  │        Career Path Builder Component                 │           │
│  │  - Interactive career selection                      │           │
│  │  - Tech stack picker                                 │           │
│  │  - Roadmap display                                   │           │
│  └──────────────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────────────┐           │
│  │        Resume Analyzer Component                     │           │
│  │  - PDF upload                                        │           │
│  │  - Analysis display                                  │           │
│  └──────────────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────────────┐           │
│  │        Career Guide Component                        │           │
│  │  - Skills input                                      │           │
│  │  - Recommendations display                           │           │
│  └──────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (App Router)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE LAYER                           │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │   Session    │  │ Rate Limit   │  │   IP Check   │       │  │
│  │  │   Verify     │  │   (In-Mem)   │  │  Validation  │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                        │
│                              ▼                                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      API ROUTES                               │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │                                                               │  │
│  │  /api/career-path          /api/career                       │  │
│  │  ┌──────────────┐          ┌──────────────┐                 │  │
│  │  │ 1. Auth Check│          │ 1. Auth Check│                 │  │
│  │  │ 2. Rate Limit│          │ 2. Rate Limit│                 │  │
│  │  │ 3. Validate  │          │ 3. Validate  │                 │  │
│  │  │ 4. Call AI   │          │ 4. Call AI   │                 │  │
│  │  │ 5. Track Use │          │ 5. Track Use │                 │  │
│  │  └──────────────┘          └──────────────┘                 │  │
│  │                                                               │  │
│  │  /api/resume-analyzer      /api/auth/[...all]               │  │
│  │  ┌──────────────┐          ┌──────────────┐                 │  │
│  │  │ 1. Auth Check│          │ Better Auth  │                 │  │
│  │  │ 2. Rate Limit│          │   Handler    │                 │  │
│  │  │ 3. Validate  │          │              │                 │  │
│  │  │ 4. Call AI   │          │ - Google     │                 │  │
│  │  │ 5. Track Use │          │ - GitHub     │                 │  │
│  │  └──────────────┘          └──────────────┘                 │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌───────────────────────┐    ┌───────────────────────┐
    │   GOOGLE GEMINI AI    │    │  POSTGRESQL (Neon)    │
    ├───────────────────────┤    ├───────────────────────┤
    │                       │    │                       │
    │ - gemini-2.0-flash    │    │ Tables:               │
    │   (Career Path)       │    │ - guestUsage          │
    │                       │    │ - user                │
    │ - gemini-2.0-flash    │    │ - session             │
    │   (Career Guide)      │    │ - account             │
    │                       │    │ - verification        │
    │ - gemini-1.5-flash    │    │                       │
    │   (Resume Analyzer)   │    │ Indexes:              │
    │                       │    │ - ipAddress           │
    └───────────────────────┘    │ - userId              │
                                 │ - token               │
                                 └───────────────────────┘
```

---

## Data Flow Diagrams

### 1. Career Path Builder Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Select career path & tech stack
     ▼
┌─────────────────────┐
│ CareerPathBuilder   │
│    Component        │
└────┬────────────────┘
     │ 2. POST /api/career-path
     │    { careerPath, techStack }
     ▼
┌─────────────────────────────────────────┐
│  API Route: /api/career-path            │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │ 1. requireAuthOrFreeTrial()      │   │
│  │    - Check if authenticated      │   │
│  │    - If not, check IP usage      │   │
│  │    - Query guestUsage table      │   │
│  │    - Return 403 if limit reached │   │
│  └──────────────────────────────────┘   │
│              │                           │
│              ▼                           │
│  ┌──────────────────────────────────┐   │
│  │ 2. rateLimit(ip, 5, 60000)       │   │
│  │    - Check in-memory map         │   │
│  │    - Return 429 if exceeded      │   │
│  └──────────────────────────────────┘   │
│              │                           │
│              ▼                           │
│  ┌──────────────────────────────────┐   │
│  │ 3. validateRequest(schema, body) │   │
│  │    - Zod validation              │   │
│  │    - Return 400 if invalid       │   │
│  └──────────────────────────────────┘   │
│              │                           │
│              ▼                           │
│  ┌──────────────────────────────────┐   │
│  │ 4. genAI.models.generateContent()│   │
│  │    - Call Gemini API             │   │
│  │    - Parse JSON response         │   │
│  └──────────────────────────────────┘   │
│              │                           │
│              ▼                           │
│  ┌──────────────────────────────────┐   │
│  │ 5. incrementUsage(req, endpoint) │   │
│  │    - Update guestUsage table     │   │
│  │    - Retry on failure            │   │
│  └──────────────────────────────────┘   │
│              │                           │
└──────────────┼───────────────────────────┘
               │ 6. Return roadmap JSON
               ▼
┌─────────────────────┐
│ RoadmapDisplay      │
│   Component         │
│ - Phases            │
│ - Resources         │
│ - Projects          │
└─────────────────────┘
```

---

### 2. Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Click "Sign in with Google/GitHub"
     ▼
┌─────────────────────┐
│  Login Page         │
└────┬────────────────┘
     │ 2. Redirect to OAuth provider
     ▼
┌─────────────────────┐
│  Google / GitHub    │
│  OAuth              │
└────┬────────────────┘
     │ 3. User authorizes
     │ 4. Redirect to callback
     ▼
┌─────────────────────────────────────────┐
│  /api/auth/callback/[provider]          │
├─────────────────────────────────────────┤
│  Better Auth Handler                    │
│  1. Verify OAuth code                   │
│  2. Get user info from provider         │
│  3. Create/update user in database      │
│  4. Create session                      │
│  5. Set session cookie                  │
└────┬────────────────────────────────────┘
     │ 5. Redirect to app
     ▼
┌─────────────────────┐
│  Dashboard          │
│  (Authenticated)    │
└─────────────────────┘
```

---

### 3. Free Trial System Flow

```
┌─────────────────────┐
│ Unauthenticated     │
│ User Request        │
└────┬────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  getGuestIdentifier(req)                │
│  1. Check x-forwarded-for               │
│  2. Check x-real-ip                     │
│  3. Fallback to 127.0.0.1 (dev)         │
└────┬────────────────────────────────────┘
     │ IP Address
     ▼
┌─────────────────────────────────────────┐
│  isValidIP(ip)                          │
│  - Validate IPv4/IPv6 format            │
│  - Return false if invalid              │
└────┬────────────────────────────────────┘
     │ Valid IP
     ▼
┌─────────────────────────────────────────┐
│  Database Query                         │
│  SELECT * FROM guestUsage               │
│  WHERE ipAddress = ?                    │
└────┬────────────────────────────────────┘
     │
     ├─ No Record Found
     │  └─▶ Allow request (first time)
     │
     └─ Record Found
        │
        ▼
   ┌─────────────────────────────────────┐
   │ Check Usage Count                   │
   │ if (count >= FREE_TRIAL_LIMIT)      │
   └────┬────────────────────────────────┘
        │
        ├─ Limit Exceeded
        │  └─▶ Return 403 (Forbidden)
        │
        └─ Within Limit
           └─▶ Allow request
               │
               ▼
          ┌────────────────────────────┐
          │ After Successful Request   │
          │ incrementUsage(req, type)  │
          │ - Update count in DB       │
          │ - Retry on failure         │
          └────────────────────────────┘
```

---

## Component Hierarchy

```
App (layout.tsx)
│
├─ Navbar
│  ├─ Logo
│  ├─ Navigation Links
│  └─ Auth Button
│
├─ ScrollProgress
│
├─ Home Page (page.tsx)
│  │
│  ├─ Hero
│  │  ├─ Heading
│  │  ├─ Description
│  │  ├─ CTA Buttons
│  │  └─ Gradient Orbs
│  │
│  ├─ Features
│  │  └─ Feature Cards (x3)
│  │     ├─ Icon
│  │     ├─ Title
│  │     └─ Description
│  │
│  ├─ CareerPathBuilder
│  │  ├─ Career Selection
│  │  │  └─ Career Cards
│  │  ├─ Tech Stack Selection
│  │  │  └─ Option Cards
│  │  ├─ Generate Button
│  │  └─ RoadmapDisplay
│  │     ├─ Metadata
│  │     ├─ Phases
│  │     │  └─ Phase Cards
│  │     ├─ Projects
│  │     └─ Resources
│  │
│  ├─ ResumeAnalyzerSection
│  │  └─ ResumeAnalyzer
│  │     ├─ File Upload
│  │     ├─ Upload Button
│  │     └─ ResumeAnalysisModal
│  │        ├─ Score
│  │        ├─ Strengths
│  │        └─ Improvements
│  │
│  ├─ CarrerGuide
│  │  ├─ SkillUploader
│  │  │  ├─ Skill Input
│  │  │  └─ Skill Tags
│  │  └─ CareerRoadmap
│  │     └─ Recommendations
│  │
│  ├─ Testimonials
│  │  └─ Testimonial Cards
│  │
│  └─ CTA
│     ├─ Heading
│     └─ Action Button
│
├─ Footer
│  ├─ Links
│  ├─ Social Media
│  └─ Copyright
│
└─ LoginPromptModal (conditional)
   ├─ Message
   └─ Login Button
```

---

## Database Schema Relationships

```
┌─────────────────────┐
│       user          │
│ ─────────────────── │
│ id (PK)             │◄────┐
│ name                │     │
│ email (unique)      │     │
│ emailVerified       │     │
│ image               │     │
│ createdAt           │     │
│ updatedAt           │     │
└─────────────────────┘     │
                            │
                            │ userId (FK)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        │                   │                   │
┌───────▼───────┐  ┌────────▼──────┐  ┌────────▼──────┐
│   session     │  │   account     │  │ verification  │
│ ───────────── │  │ ───────────── │  │ ───────────── │
│ id (PK)       │  │ id (PK)       │  │ id (PK)       │
│ token (unique)│  │ accountId     │  │ identifier    │
│ expiresAt     │  │ providerId    │  │ value         │
│ userId (FK)   │  │ userId (FK)   │  │ expiresAt     │
│ ipAddress     │  │ accessToken   │  │ createdAt     │
│ userAgent     │  │ refreshToken  │  │ updatedAt     │
│ createdAt     │  │ ...           │  └───────────────┘
│ updatedAt     │  └───────────────┘
└───────────────┘

┌─────────────────────┐
│   guestUsage        │
│ ─────────────────── │
│ id (PK)             │
│ ipAddress (unique)  │◄─── Indexed for fast lookups
│ careerPathCount     │
│ careerGuideCount    │
│ resumeAnalyzerCount │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
```

---

## Rate Limiting Architecture

```
┌─────────────────────────────────────────────────────────┐
│              In-Memory Rate Limit Map                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Map<identifier, { count: number, resetTime: number }> │
│                                                         │
│  Example:                                               │
│  {                                                      │
│    "192.168.1.1": { count: 3, resetTime: 1707483600 }  │
│    "10.0.0.5":    { count: 1, resetTime: 1707483660 }  │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         │ On each request
                         ▼
┌─────────────────────────────────────────────────────────┐
│  rateLimit(identifier, maxRequests, windowMs)           │
├─────────────────────────────────────────────────────────┤
│  1. if (map.size > 100) cleanupExpiredEntries()         │
│  2. Get current record for identifier                   │
│  3. if (!record || now > resetTime)                     │
│     └─ Create new record, count = 1                     │
│  4. if (count >= maxRequests)                           │
│     └─ Return { allowed: false }                        │
│  5. Increment count                                     │
│  6. Return { allowed: true, remaining, resetTime }      │
└─────────────────────────────────────────────────────────┘

⚠️  LIMITATION: In-memory only
    - Lost on server restart
    - Doesn't work across multiple instances
    - Not suitable for serverless at scale

✅  PRODUCTION SOLUTION: Use Redis
    - Persistent storage
    - Works across instances
    - Atomic operations
    - TTL support
```

---

## AI Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AI Configuration (ai-config.ts)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AI_MODELS = {                                          │
│    CAREER_PATH: "gemini-2.0-flash",                     │
│    CAREER_GUIDE: "gemini-2.0-flash",                    │
│    RESUME_ANALYZER: "gemini-1.5-flash"                  │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Import in API routes
                         ▼
┌─────────────────────────────────────────────────────────┐
│              API Route Handler                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  const genAI = new GoogleGenAI({                        │
│    apiKey: process.env.GOOGLE_API_KEY                   │
│  });                                                    │
│                                                         │
│  const result = await genAI.models.generateContent({    │
│    model: AI_MODELS.CAREER_PATH,                        │
│    contents: [...],                                     │
│    config: {                                            │
│      responseMimeType: "application/json"               │
│    }                                                    │
│  });                                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         │ API Call
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Google Gemini AI Service                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  - Receives prompt                                      │
│  - Processes with selected model                        │
│  - Returns JSON response                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 1: IP Validation                                 │
│  - Extract IP from headers                              │
│  - Validate IPv4/IPv6 format                            │
│  - Reject if invalid                                    │
└────────────────────┬────────────────────────────────────┘
                     │ ✅ Valid IP
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Authentication Check                          │
│  - Check session cookie                                 │
│  - Verify with Better Auth                              │
│  - If authenticated → Skip free trial check             │
└────────────────────┬────────────────────────────────────┘
                     │ ❌ Not authenticated
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Free Trial Check                              │
│  - Query guestUsage table by IP                         │
│  - Check usage count for endpoint                       │
│  - Reject if limit exceeded                             │
└────────────────────┬────────────────────────────────────┘
                     │ ✅ Within limit
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Rate Limiting                                 │
│  - Check in-memory rate limit map                       │
│  - Reject if too many requests                          │
└────────────────────┬────────────────────────────────────┘
                     │ ✅ Not rate limited
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Input Validation                              │
│  - Validate with Zod schema                             │
│  - Check data types, lengths, formats                   │
│  - Reject if invalid                                    │
└────────────────────┬────────────────────────────────────┘
                     │ ✅ Valid input
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 6: Business Logic                                │
│  - Call AI API                                          │
│  - Process response                                     │
│  - Increment usage count                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    RESPONSE                             │
└─────────────────────────────────────────────────────────┘
```

---

**Diagram Legend:**

- `┌─┐` = Component/Service boundary
- `│` = Vertical connection
- `─` = Horizontal connection
- `▼` = Data flow direction
- `◄─` = Foreign key relationship
- `(PK)` = Primary Key
- `(FK)` = Foreign Key

---

**Last Updated:** February 9, 2026  
**Maintained By:** Development Team
