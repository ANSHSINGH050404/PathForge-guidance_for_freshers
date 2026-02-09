/**
 * Centralized AI Model Configuration
 *
 * This file contains all AI model configurations used across the application.
 * Update these values to change models globally or per-feature.
 */

export const AI_MODELS = {
  // Career Path Builder - Uses latest model for comprehensive roadmaps
  CAREER_PATH: process.env.GEMINI_MODEL_CAREER_PATH || "gemini-2.0-flash",

  // Career Guide - Balanced model for career advice
  CAREER_GUIDE: process.env.GEMINI_MODEL_CAREER || "gemini-2.0-flash",

  // Resume Analyzer - Optimized for document analysis
  RESUME_ANALYZER: process.env.GEMINI_MODEL_RESUME || "gemini-1.5-flash",
} as const;

/**
 * Model capabilities and recommended use cases:
 *
 * - gemini-2.0-flash: Latest model, best for complex reasoning and structured output
 * - gemini-1.5-flash: Stable model, good for document analysis and general tasks
 * - gemini-1.5-pro: More capable but slower, use for complex tasks requiring deep analysis
 */

export type AIModelType = (typeof AI_MODELS)[keyof typeof AI_MODELS];
