import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { resumeAnalyzerSchema, validateRequest } from "@/lib/validations";
import { requireAuth, rateLimit } from "@/lib/middleware";
import { requireAuthOrFreeTrial, incrementUsage } from "@/lib/auth-middleware";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

const MODEL_NAME = "gemini-2.5-flash";
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

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
and provide:
1. An ATS compatibility score (0-100)
2. Detailed suggestions to improve the resume for better ATS performance
Your entire response must be in valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.
The JSON object should have the following structure:

{
"atsScore": 85,
"scoreBreakdown": {
"formatting": {
"score": 90,
"feedback": "Brief feedback on formatting"
},
"keywords": {
"score": 80,
"feedback": "Brief feedback on keyword usage"
},
"structure": {
"score": 85,
"feedback": "Brief feedback on resume structure"
},
"readability": {
"score": 88,
"feedback": "Brief feedback on readability"
}
},
"suggestions": [
{
"category": "Category name (e.g., 'Formatting', 'Content', 'Keywords', 'Structure')",
"issue": "Description of the issue found",
"recommendation": "Specific actionable recommendation to fix it",
"priority": "high/medium/low"
}
],
"strengths": [
"List of things the resume does well for ATS"
],
"summary": "A brief 2-3 sentence summary of the overall ATS performance"
}
Focus on:
- File format and structure compatibility
- Proper use of standard section headings
- Keyword optimization
- Formatting issues (tables, columns, graphics, special characters)
- Contact information placement
- Date formatting
- Use of action verbs and quantifiable achievements
- Section organization and flow
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
