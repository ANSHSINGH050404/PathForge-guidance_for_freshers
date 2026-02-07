// app/api/career/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { skills } = await req.json();

    if (!skills) {
      return NextResponse.json(
        { error: "No skills provided" },
        { status: 400 }
      );
    }

    const prompt: string = `
Based on the following skills: ${skills}.
Please act as a career advisor and generate a career path suggestion.
Your entire response must be in a valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.
The JSON object should have the following structure:
{
"summary": "A brief, encouraging summary of the user's skill set and their general job
title.",
"jobOptions": [
{
"title": "The name of the job role.",
"responsibilities": "A description of what the user would do in this role.",
"why": "An explanation of why this role is a good fit for their skills."
}
],
"skillsToLearn": [
{
"category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack
Mastery', 'DevOps & Cloud').",
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
      model: "gemini-2.5-flash",
      contents: prompt,
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


