import { z } from "zod";

// Career Path Builder Request Schema
export const careerPathBuilderSchema = z.object({
  careerPath: z.string().min(1, "Career path is required"),
  techStack: z
    .record(z.string(), z.string())
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one tech stack selection is required",
    }),
});

export type CareerPathBuilderRequest = z.infer<typeof careerPathBuilderSchema>;
