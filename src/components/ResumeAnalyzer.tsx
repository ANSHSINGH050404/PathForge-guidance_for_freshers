"use client";

import { useState, useRef, Suspense, lazy, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginPromptModal from "@/components/LoginPromptModal";

// Lazy load ResumeAnalysisModal
const ResumeAnalysisModal = lazy(
  () => import("@/components/ResumeAnalysisModal"),
);

interface ScoreBreakdown {
  formatting: { score: number; feedback: string };
  keywords: { score: number; feedback: string };
  structure: { score: number; feedback: string };
  readability: { score: number; feedback: string };
}

interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

interface AnalysisResult {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  suggestions: Suggestion[];
  strengths: string[];
  summary: string;
}

export default function ResumeAnalyzer() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free trial state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const FREE_TRIAL_LIMIT = 1;

  useEffect(() => {
    // Check auth via API
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status");
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          if (!data.isAuthenticated && data.usage) {
            setUsageCount(data.usage.resumeAnalyzer);
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();

    // Check usage
    const count = parseInt(
      localStorage.getItem("resumeAnalyzerUsageCount") || "0",
      10,
    );
    setUsageCount(count);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Check free trial limit
    if (!isAuthenticated && usageCount >= FREE_TRIAL_LIMIT) {
      setShowLoginPrompt(true);
      return;
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file only");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/resume-analyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-resumeAnalyzer-usage": usageCount.toString(),
        },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check if error is due to free trial limit (just in case frontend check was bypassed or stale)
        if (
          response.status === 403 &&
          errorData.error === "Free trial limit exceeded"
        ) {
          setShowLoginPrompt(true);
          return;
        }
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
      setShowModal(true);

      // Increment usage count if not authenticated
      if (!isAuthenticated) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem("resumeAnalyzerUsageCount", newCount.toString());
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to analyze resume";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <section id="analyzer" className="py-24 md:py-32">
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Resume Analysis Limit Reached"
        description="You've used your free resume analysis! Sign in to unlock unlimited ATS checks and detailed feedback."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-mono text-sm text-neutral-500 mb-4">
            Resume Analysis
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Get Your ATS Score
          </h3>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Upload your resume and get instant AI-powered feedback on how well
            it performs with Applicant Tracking Systems used by top tech
            companies.
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? "border-white/40 bg-white/5"
                : "border-white/10 hover:border-white/20"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-neutral-400 animate-spin" />
                <p className="text-neutral-400 font-mono">
                  Analyzing your resume...
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-white text-lg mb-2">
                  Drop your resume here, or{" "}
                  <button
                    onClick={handleUploadClick}
                    className="text-white underline underline-offset-4 hover:text-neutral-300"
                  >
                    browse
                  </button>
                </p>
                <p className="text-neutral-500 text-sm font-mono">
                  Supports PDF files up to 5MB
                </p>
              </>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-300">{uploadError}</span>
                <button
                  onClick={() => setUploadError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            {
              icon: FileText,
              title: "ATS Compatibility",
              description:
                "Check if your resume passes automated screening systems",
            },
            {
              icon: CheckCircle2,
              title: "Keyword Analysis",
              description: "Identify missing keywords for your target roles",
            },
            {
              icon: AlertCircle,
              title: "Improvement Tips",
              description: "Get actionable suggestions to improve your resume",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-neutral-300" />
              </div>
              <h4 className="text-white font-medium mb-2">{feature.title}</h4>
              <p className="text-sm text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {showModal && analysisResult && (
          <Suspense
            fallback={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-neutral-400 animate-spin" />
                  <p className="text-white font-mono">Loading results...</p>
                </div>
              </motion.div>
            }
          >
            <ResumeAnalysisModal
              analysisResult={analysisResult}
              onClose={() => setShowModal(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </section>
  );
}
