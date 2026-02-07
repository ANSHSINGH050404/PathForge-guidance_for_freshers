import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { validateRequest } from "@/lib/validations";
import { careerPathBuilderSchema } from "@/lib/validations-career-path";
import { rateLimit } from "@/lib/middleware";
import { requireAuthOrFreeTrial, incrementUsage } from "@/lib/auth-middleware";

// Initialize the Google GenAI client
// Ensure GOOGLE_API_KEY is set in your .env.local file
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // 1. Check Authentication / Free Trial
    // ------------------------------------------------------------------
    const authCheck = await requireAuthOrFreeTrial(req, "careerPath");
    if (authCheck) {
      return authCheck;
    }

    // ------------------------------------------------------------------
    // 2. Rate Limiting (5 requests per minute per IP)
    // ------------------------------------------------------------------
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rateLimitResult = await rateLimit(clientIp, 5, 60000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      );
    }

    // ------------------------------------------------------------------
    // 3. Validate Request Body
    // ------------------------------------------------------------------
    const body = await req.json();
    const validation = await validateRequest(careerPathBuilderSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { careerPath, techStack } = validation.data;

    // ------------------------------------------------------------------
    // 4. Construct the Prompt
    // ------------------------------------------------------------------
    const techStackDescription = Object.entries(techStack)
      .map(([category, tech]) => `${category}: ${tech}`)
      .join(", ");

    const systemInstruction = `You are an expert career advisor and senior software engineer with 15+ years of experience mentoring developers.
    
    Your goal is to create a comprehensive, actionable learning roadmap for someone who wants to become a ${careerPath} with the following tech stack: ${techStackDescription}.
    
    GUIDELINES:
    1. **Learning Path**: Create 3-5 phases (Foundation → Intermediate → Advanced → Specialization)
    2. **Resources**: Provide REAL, WORKING URLs to free and paid courses, documentation, and videos.
    3. **Projects**: Suggest 2-3 projects per phase that build on each other.
    4. **Realistic Timeline**: Be honest about time commitments.
    5. **Career Progression**: Show clear path from junior to senior.
    6. **Salary Ranges**: Provide realistic salary expectations (USD, global market).
    7. **Best Practices**: Include learning strategies, portfolio building, networking.
    
    SPECIFIC FOCUS AREAS:
    - Start with fundamentals before advanced topics.
    - Include hands-on projects from day 1.
    - Emphasize real-world applications.
    
    IMPORTANT: You must return PURE JSON. Do not include markdown formatting (like \`\`\`json).`;

    // ------------------------------------------------------------------
    // 5. Call Google Gemini API
    // ------------------------------------------------------------------
    // using the 'gemini-1.5-flash' model for speed and cost-effectiveness
    // Note: 'gemini-2.5-flash' is not yet standard in all regions/SDKs.
    const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const result = await genAI.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemInstruction,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        // Optional: define the schema explicitly if you want strict adherence
        // responseSchema: schemaObject
      },
    });

    // ------------------------------------------------------------------
    // 6. Process and Return Response
    // ------------------------------------------------------------------
    // Access the generated text from the candidates array
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error("No candidates returned from AI model.");
    }

    const candidate = result.candidates[0];
    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error("Empty response from AI model.");
    }

    const responseText = candidate.content.parts[0].text;

    if (!responseText) {
      throw new Error("Empty text in response from AI model.");
    }

    // Parse JSON safely
    let jsonResponse;
    try {
      // Clean up potential markdown formatting just in case
      const cleanText = responseText.replace(/```json|```/g, "").trim();
      jsonResponse = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw Response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse roadmap data. Please try again." },
        { status: 500 },
      );
    }

    // Add metadata for frontend reference
    jsonResponse.metadata = {
      careerPath,
      techStack,
      generatedAt: new Date().toISOString(),
      model: modelId,
    };

    // Increment usage
    await incrementUsage(req, "careerPath");

    return NextResponse.json(jsonResponse, {
      status: 200,
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    });
  } catch (error: any) {
    console.error("Career Path API Error:", error);

    // Determine error message based on environment
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? error.message
        : "An unexpected error occurred while generating the career path.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
