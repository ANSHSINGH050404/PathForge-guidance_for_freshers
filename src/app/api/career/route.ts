import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { careerRequestSchema, validateRequest } from "@/lib/validations";
import { requireAuth, rateLimit } from "@/lib/middleware";
import { requireAuthOrFreeTrial } from "@/lib/auth-middleware";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

const MODEL_NAME = "gemini-2.0-flash";
const MAX_REQUESTS_PER_MINUTE = 10;

export async function POST(req: NextRequest) {
  try {
    // Check Authentication / Free Trial
    const authCheck = requireAuthOrFreeTrial(req, "career");
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
      `career:${clientIp}`,
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
    const validation = await validateRequest(careerRequestSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { skills } = validation.data;

    // Sanitize skills (remove extra whitespace, deduplicate)
    const sanitizedSkills = [...new Set(skills.map((s) => s.trim()))];

    const prompt: string = `
Based on the following skills: ${sanitizedSkills.join(", ")}.
Please act as a career advisor and generate a career path suggestion.
Your entire response must be in a valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.
The JSON object should have the following structure:
{
"summary": "A brief, encouraging summary of the user's skill set and their general job title.",
"jobOptions": [
{
"title": "The name of the job role.",
"responsibilities": "A description of what the user would do in this role.",
"why": "An explanation of why this role is a good fit for their skills."
}
],
"skillsToLearn": [
{
"category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack Mastery', 'DevOps & Cloud').",
"skills": [
{
"title": "The name of the skill to learn.",
"why": "Why learning this skill is important.",
"how": "Specific examples of how to learn or apply this skill."
}
]
}
],
"learningApproach": {
"title": "How to Approach Learning",
"points": ["A bullet point list of actionable advice for learning."]
}
}
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
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

    return NextResponse.json(jsonResponse, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Career API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}
