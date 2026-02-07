// app/api/resume-analyzer/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const { pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json(
        { error: "Pdf document resume is Required!" },
        { status: 400 }
      );
    }

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
"category": "Category name (e.g., 'Formatting', 'Content', 'Keywords',
'Structure')",
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
      model: "gemini-2.5-flash",
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

    let jsonResponse: any;

    try {
      const rawText: any = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!rawText) {
        throw new Error("AI did not return valid JSON");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error: any) {
      return NextResponse.json(
        {
          message: "AI did not return valid JSON",
          rawResponse: response.text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}