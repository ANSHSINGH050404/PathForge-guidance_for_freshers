import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { resumeAnalyzerSchema, validateRequest } from "@/lib/validations";
import { requireAuth, rateLimit } from "@/lib/middleware";
import { requireAuthOrFreeTrial, incrementUsage } from "@/lib/auth-middleware";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

const MODEL_NAME = "gemini-1.5-flash";
const MAX_REQUESTS_PER_MINUTE = 5; // Lower limit for resume analysis (more resource intensive)

export async function POST(req: NextRequest) {
  try {
    // Check Authentication / Free Trial
    const authCheck = await requireAuthOrFreeTrial(req, "resumeAnalyzer");
    if (authCheck) {
      return authCheck;
    }

    // Get client IP for rate limiting
    const clientIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    // Rate limiting
    const rateLimitResult = rateLimit(
      `resume:${clientIp}`,
      MAX_REQUESTS_PER_MINUTE,
      60000,
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = await validateRequest(resumeAnalyzerSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { pdfBase64 } = validation.data;

    // Debug logging
    console.log(`Analyzing resume. PDF Size: ${pdfBase64.length} bytes`);

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the PDF resume attached to this request.
First, extract the candidate's full name from the resume.

If you cannot read the resume content, or if it appears to be empty/invalid, return a JSON with "atsScore": 0, "candidateName": null, and "summary": "Error: Could not read resume content."

Your entire response must be in valid JSON format. Do not include any text or markdown formatting (like \`\`\`json) outside of the JSON structure.

The JSON object should have the following structure:
{
  "candidateName": "Extracted Name",
  "atsScore": 85,
  "scoreBreakdown": {
    "formatting": { "score": 90, "feedback": "..." },
    "keywords": { "score": 80, "feedback": "..." },
    "structure": { "score": 85, "feedback": "..." },
    "readability": { "score": 88, "feedback": "..." }
  },
  "suggestions": [
    {
      "category": "...",
      "issue": "...",
      "recommendation": "...",
      "priority": "high"
    }
  ],
  "strengths": ["..."],
  "summary": "..."
}

Focus on:
- File format and structure compatibility
- Proper use of standard section headings
- Keyword optimization for tech roles
- Formatting issues (tables, columns, graphics)
- Contact information placement
- Date formatting
- Use of action verbs
- Section organization
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
              },
            },
          ],
        },
      ],
    });

    let jsonResponse: unknown;

    try {
      const rawText = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("AI Raw Response (truncated):", rawText?.substring(0, 200));

      if (!rawText) {
        throw new Error("AI did not return valid JSON");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        {
          error: "Failed to process AI response. Please try again.",
        },
        { status: 500 },
      );
    }

    // Increment usage
    await incrementUsage(req, "resumeAnalyzer");

    return NextResponse.json(jsonResponse, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Resume analyzer error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}
