import { z } from "zod";

// Career API validation
export const careerRequestSchema = z.object({
  skills: z
    .array(z.string().min(1).max(100))
    .min(1, "At least one skill is required")
    .max(20, "Maximum 20 skills allowed")
    .refine(
      (skills) => skills.every((skill) => skill.trim().length > 0),
      "Skills cannot be empty strings",
    ),
});

export type CareerRequest = z.infer<typeof careerRequestSchema>;

// Resume Analyzer validation
export const resumeAnalyzerSchema = z.object({
  pdfBase64: z
    .string()
    .min(100, "Invalid PDF data")
    .max(10 * 1024 * 1024, "PDF file too large (max 10MB)")
    .refine((data) => {
      // Check if it's a valid base64 string
      const base64Pattern = /^data:application\/pdf;base64,/;
      return base64Pattern.test(data) || /^[A-Za-z0-9+/=]+$/.test(data);
    }, "Invalid PDF base64 format"),
});

export type ResumeAnalyzerRequest = z.infer<typeof resumeAnalyzerSchema>;

// Generic error response
export const createErrorResponse = (message: string, status: number = 400) => {
  return Response.json({ error: message }, { status });
};

// Validation helper
export const validateRequest = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Promise<{ success: true; data: T } | { success: false; error: string }> => {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }
    return { success: false, error: "Validation failed" };
  }
};
